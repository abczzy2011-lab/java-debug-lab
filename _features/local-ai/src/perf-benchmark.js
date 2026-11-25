// src/perf-benchmark.js — Stage D: WGSL f32 matmul 1024^3, tiled 16x16, 3 timed runs.
// Benchmark itself needs a real GPU; the FLOPS/median math is pure and testable.

export const BENCH = {
  N: 1024, TILE: 16, RUNS: 3, WARMUPS: 1,
  THRESHOLD_GFLOPS: 15, TIMEOUT_MS: 10000,
};

// Pure: 2*N^3 FLOPs per run -> GFLOPS.
export function flopsFor(n = BENCH.N) { return 2 * n * n * n; }
export function gflops(n = BENCH.N, seconds = 1) {
  if (!(seconds > 0)) return 0;
  return flopsFor(n) / seconds / 1e9;
}
export function median(values = []) {
  if (!values.length) return 0;
  const s = values.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function benchmarkResult(timesSec = [], { software = false, arch = '' } = {}) {
  const g = median(timesSec.map(t => gflops(BENCH.N, t)));
  return {
    gflops: g,
    software: software || /swiftshader|software|llvmpipe/i.test(arch),
    timesSec,
    pass: g >= BENCH.THRESHOLD_GFLOPS && !(software || /swiftshader|software|llvmpipe/i.test(arch)),
  };
}

const WGSL_MATMUL = `
@group(0) @binding(0) var<storage, read> A : array<f32>;
@group(0) @binding(1) var<storage, read> B : array<f32>;
@group(0) @binding(2) var<storage, read_write> C : array<f32>;
const N : u32 = ${BENCH.N}u;
const T : u32 = ${BENCH.TILE}u;
@compute @workgroup_size(${BENCH.TILE}, ${BENCH.TILE})
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let row = gid.x; let col = gid.y;
  if (row >= N || col >= N) { return; }
  var sum : f32 = 0.0;
  var k : u32 = 0u;
  loop {
    if (k >= N) { break; }
    sum += A[row * N + k] * B[k * N + col];
    k += 1u;
  }
  C[row * N + col] = sum;
}
`;

/** Real GPU benchmark. `device` comes from gate stage A. Returns benchmarkResult. */
export async function runBenchmark(device, adapter, { timeout = BENCH.TIMEOUT_MS } = {}) {
  if (!device || !adapter) return benchmarkResult([], { software: true });
  const n = BENCH.N, bytes = n * n * 4;
  const aBuf = device.createBuffer({ size: bytes, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  const bBuf = device.createBuffer({ size: bytes, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  const cBuf = device.createBuffer({ size: bytes, usage: GPUBufferUsage.STORAGE });
  const a = new Float32Array(n * n).fill(1), b = new Float32Array(n * n).fill(1);
  device.queue.writeBuffer(aBuf, 0, a); device.queue.writeBuffer(bBuf, 0, b);
  const module = device.createShaderModule({ code: WGSL_MATMUL });
  const pipeline = device.createComputePipeline({ layout: 'auto', compute: { module, entryPoint: 'main' } });
  const bind = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: aBuf } }, { binding: 1, resource: { buffer: bBuf } },
              { binding: 2, resource: { buffer: cBuf } }],
  });

  const times = [];
  const runs = BENCH.WARMUPS + BENCH.RUNS;
  for (let i = 0; i < runs; i++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeout);
    try {
      const enc = device.createCommandEncoder();
      const pass = enc.beginComputePass();
      pass.setPipeline(pipeline); pass.setBindGroup(0, bind);
      pass.dispatchWorkgroups(n / BENCH.TILE, n / BENCH.TILE);
      pass.end();
      const t0 = performance.now();
      device.queue.submit([enc.finish()]);
      const done = device.queue.onSubmittedWorkDone();
      let timeoutId = null;
      const guard = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('GPU_BENCH_TIMEOUT')), timeout);
      });
      try {
        await Promise.race([done, guard]);
      } finally {
        clearTimeout(timeoutId);
      }
      const dt = (performance.now() - t0) / 1000;
      if (i >= BENCH.WARMUPS) times.push(dt);
    } catch (e) {
      clearTimeout(timer);
      return benchmarkResult(times, { software: true, arch: String(e) });
    }
    clearTimeout(timer);
  }
  aBuf.destroy(); bBuf.destroy(); cBuf.destroy();
  return benchmarkResult(times, { arch: adapter.info?.architecture || adapter.info?.description || '' });
}
