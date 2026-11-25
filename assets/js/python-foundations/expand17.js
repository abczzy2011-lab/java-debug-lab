(function () {
  var chapters = window.PY_FOUNDATIONS_CHAPTERS || [];
  function add(id, sections) {
    for (var i = 0; i < chapters.length; i += 1) {
      var lessons = chapters[i].lessons || [];
      for (var j = 0; j < lessons.length; j += 1) {
        if (lessons[j].id === id) {
          lessons[j].sections = (lessons[j].sections || []).concat(sections);
          return;
        }
      }
    }
  }

  add("ch17-1", [{
    h: "工程深化：线程锁、队列与超时退出",
    p: `线程共享内存，所以「读-改-写」不是原子操作。[[counter += 1]] 实际是读值、加一、写回三步，两个线程可能同时读到同一个旧值，最后只加了一次。用 [[threading.Lock]] 包住临界区，或者用 [[itertools.count]] 这类原子工具。锁的范围要小，但不能漏。

死锁的经典场景是「两个线程以相反顺序拿两把锁」。避免方法：固定加锁顺序、用 [[RLock]] 可重入、设置超时（[[lock.acquire(timeout=2)]]），拿不到就放弃并记录。不要用「先检查再拿锁」的写法，检查和拿之间仍有竞态。

[[queue.Queue]] 是线程安全的通信方式，生产者 [[put]]、消费者 [[get]]。队列满时 [[put]] 默认阻塞，队列空时 [[get]] 默认阻塞；用 [[timeout]] 避免永久卡住。任务结束用哨兵值（None）通知消费者退出，或 [[put]] 一个特殊对象，不要依赖 [[empty()]] 判断，它不可靠。

[[ThreadPoolExecutor]] 适合 I/O 密集任务。[[submit]] 返回 Future，[[result(timeout=...)]] 拿结果；不要在主线程无限等。[[as_completed]] 按完成顺序处理，适合「谁先好先处理」。线程数不是越多越好，I/O 密集可以 10-50，CPU 密集应该用进程。

退出要优雅。设置 [[stop_event]]，工作线程在循环里检查；主线程 [[join(timeout)]]，超时后标记 daemon 或强制退出。daemon 线程会在主线程退出时被杀，可能留下半截文件；关键任务不要用 daemon。

日志要带线程名。[[threading.current_thread().name]] 放进日志格式，排查时能看出哪个线程卡住。队列长度、活跃线程数、任务耗时也是重要指标。

验收：并发计数不丢；两把锁不死锁；队列满/空有超时；线程异常能被主线程知道；退出不留半截数据。`,
    code: String.raw`import queue, threading, time

q = queue.Queue(maxsize=10)
stop = threading.Event()
counter = 0
lock = threading.Lock()

def worker():
    global counter
    while not stop.is_set():
        try:
            item = q.get(timeout=0.5)
        except queue.Empty:
            continue
        try:
            with lock:
                counter += 1
            process(item)
        finally:
            q.task_done()

threads = [threading.Thread(target=worker, name=f"w{i}") for i in range(4)]
for t in threads:
    t.start()
for i in range(100):
    q.put(i, timeout=1)
q.join()
stop.set()
for t in threads:
    t.join(timeout=2)
print(counter)`,
    output: `100`,
    tip: `读改写要加锁；固定加锁顺序防死锁；队列用超时和哨兵；退出设 Event 并 join。`
  }, {
    h: "故障排查：线程异常、上下文与 Flask 式共享状态",
    p: `线程里抛异常，默认不会传回主线程；[[Thread]] 的异常打到 stderr，主线程可能以为任务成功。用 [[ThreadPoolExecutor]] 的 Future，[[result()]] 会把异常重新抛出；或者在线程里捕获后写入共享的错误队列。不要让异常静默消失。

[[contextvars]] 在 asyncio 里能自动传播，但线程池不会自动复制上下文。[[ThreadPoolExecutor]] 提交任务时，上下文不会跟过去；需要 [[contextvars.copy_context().run]] 包一层。日志的 request_id 丢失，往往就是这个原因。

共享可变状态要加锁，但更重要的是「尽量不共享」。每个线程用自己的对象、自己的数据库连接、自己的 Session。全局配置用只读对象；需要更新时，用消息/队列通知，不要直接改全局字典。

[[threading.local]] 给每个线程独立副本，适合数据库连接、请求上下文。但它不是异步安全的；asyncio 同一个线程跑多个任务，[[threading.local]] 会串。异步用 [[contextvars]]，线程用 [[threading.local]]，不要混。

线程池大小要匹配下游。数据库连接池 10 个，线程池开 50 个只会让 40 个线程等连接；HTTP 服务限流 20 QPS，开 100 个线程只会收到 429。先算下游容量，再定并发。

关闭线程池用 [[shutdown(wait=True)]]，确认任务完成；[[cancel_futures=True]] 取消未开始的任务。不要在退出时直接 [[os._exit]]，那会跳过清理和 flush。

验收：线程异常主线程能感知；request_id 不丢；共享计数正确；线程池不超过下游容量；退出时任务完成或明确取消。`,
    code: String.raw`from concurrent.futures import ThreadPoolExecutor
import contextvars, logging

request_id = contextvars.ContextVar("request_id", default="-")

def task(x):
    logging.info("handle %s rid=%s", x, request_id.get())
    if x == 3:
        raise ValueError("bad item")
    return x * 2

ctx = contextvars.copy_context()
with ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(ctx.run, task, i) for i in range(5)]
    for f in futures:
        try:
            print(f.result(timeout=5))
        except Exception as exc:
            print("worker failed:", type(exc).__name__, exc)`,
    output: `0
2
4
worker failed: ValueError bad item
8`,
    tip: `Future.result 重抛异常；线程池手动复制 contextvars；少共享；按下游容量定线程数。`
  }]);

  add("ch17-2", [{
    h: "工程深化：进程池、可 pickle 与初始化成本",
    p: `CPU 密集任务用 [[ProcessPoolExecutor]]，因为 GIL 让多线程无法并行计算。但进程间不共享内存，参数和返回值要能 [[pickle]]。lambda、局部函数、打开的文件、数据库连接、锁对象通常不能 pickle；提交前会报错，或者静默失败。

在模块顶层定义工作函数，不要用闭包。需要额外参数时，用 [[functools.partial]] 或把参数打包成 tuple；partial 本身要能 pickle，绑定的函数必须在模块顶层。[[__main__]] 保护在 Windows/macOS 的 spawn 模式必须加，否则子进程会重新执行主模块。

进程启动成本高。每个进程要重新 import 模块、初始化解释器；任务太碎时，进程池反而更慢。按「任务耗时 / 启动成本」决定：计算几毫秒的任务不值得开进程，几秒的值得。用 [[chunksize]] 批量提交，减少 IPC。

返回值不要太大。一个任务返回几百 MB 的 DataFrame，pickle 和传输会吃掉收益；让子进程写文件/数据库，返回路径或 id。共享大数组用 [[multiprocessing.shared_memory]]，但要手动管理生命周期，避免泄漏。

异常也会被 pickle。自定义异常类要在模块顶层可导入，否则子进程能抛、主进程反序列化失败。异常消息里不要带不可 pickle 的对象（如 socket）。捕获后转成字符串+类型，再抛简单异常。

进程池要限制并发。[[max_workers]] 默认是 CPU 核数，超线程机器可能 16 个；内存 16GB 的机器开 16 个 pandas 进程会 OOM。按内存定上限：单任务峰值 × 并发 < 可用内存的 70%。

验收：工作函数可 pickle；Windows 有 [[if __name__ == "__main__"]]；任务粒度合理；返回数据小；异常可反序列化；并发不 OOM。`,
    code: String.raw`from concurrent.futures import ProcessPoolExecutor
from functools import partial

def score(rows, factor):
    return sum(r["seconds"] for r in rows) * factor

def main():
    batches = [[{"seconds": 12.3}], [{"seconds": 11.8}]]
    with ProcessPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(partial(score, factor=2), batches, chunksize=1))
    print(results)

if __name__ == "__main__":
    main()`,
    output: `[24.6, 23.6]`,
    tip: `工作函数放模块顶层；参数可 pickle；任务别太碎；返回小数据；按内存定并发。`
  }, {
    h: "故障排查：进程卡死、共享内存与强制终止",
    p: `进程池卡死常见原因：子进程等一个永远不会来的锁、父进程没读管道导致缓冲区满、子进程在等 stdin。先在父进程 [[faulthandler.dump_traceback_later(30, exit=True)]]，30 秒后打印所有线程/进程堆栈，定位卡在哪。

[[ProcessPoolExecutor]] 的 [[shutdown(wait=True)]] 会等所有任务；有任务卡住就永远等。用 [[shutdown(wait=False, cancel_futures=True)]] 取消未开始任务，但已在运行的进程仍可能活着。必要时 [[terminate()]]，再 [[kill()]]；terminate 给 SIGTERM，kill 给 SIGKILL，后者不执行清理。

共享内存用 [[shared_memory.SharedMemory]] 创建/attach，用完 [[close()]] 和 [[unlink()]]。只 close 不 unlink 会留下 [[/dev/shm]] 残留；只 unlink 不 close 仍有映射。父子进程都要正确关闭；崩溃时残留需要启动清理。

[[multiprocessing.Manager]] 提供共享 dict/list，但性能差、依赖网络式代理；大数据不要用。优先「每个进程算自己的，最后汇总」；需要共享只读大数组时用 shared_memory，需要频繁写时用数据库/队列。

子进程日志要单独配置。spawn 模式下 logging 配置不会自动继承；每个子进程重新 [[basicConfig]] 或传配置。日志写同一个文件可能交错，用 [[QueueHandler]] 发给父进程，或每个进程写自己的文件。

终止后要检查残留。[[ps]] 看僵尸进程，[[/dev/shm]] 看共享内存，临时目录看 .part 文件。启动时清理上一轮残留，避免磁盘/内存被占满。

验收：卡死时能打印堆栈；shutdown 不会无限等；共享内存 close+unlink；子进程日志不交错；终止后无残留。`,
    code: String.raw`import faulthandler, multiprocessing as mp
from multiprocessing import shared_memory
import numpy as np

faulthandler.dump_traceback_later(30, exit=True)

shm = shared_memory.SharedMemory(create=True, size=1024)
arr = np.ndarray((128,), dtype=np.float64, buffer=shm.buf)
arr[:] = 1.0
try:
    print(arr.sum())
finally:
    arr = None
    shm.close()
    shm.unlink()
faulthandler.cancel_dump_traceback_later()`,
    output: `128.0
# 共享内存已 close + unlink，/dev/shm 无残留`,
    tip: `faulthandler 打堆栈；shutdown 可能卡；terminate 后再 kill；共享内存 close+unlink。`
  }]);

  add("ch17-3", [{
    h: "工程深化：TaskGroup、取消传播与超时",
    p: `[[asyncio.gather]] 在某个任务失败时，默认不会取消其他任务；它们继续跑，可能产生半截副作用。Python 3.11 的 [[TaskGroup]] 在第一个异常时取消同组其他任务，并把异常聚合成 ExceptionGroup。需要「一失败全停」用 TaskGroup；需要「全部跑完再汇总」用 gather + return_exceptions。

[[asyncio.timeout(seconds)]] 是 3.11 的结构化超时，超时后取消当前任务并抛 TimeoutError。不要用 [[wait_for]] 的旧写法，它也能用，但语义不如 timeout 清晰。超时范围要包住整个操作，包括重试和清理；不要只包网络请求。

取消不是「立刻停止」。[[CancelledError]] 在 await 点抛出，同步代码块不会被打断；清理要在 finally 里做，且清理本身要快、不能再被取消。捕获 CancelledError 后不要吞掉，除非你真的要阻止取消；吞掉会让上层永远等不到结束。

任务组里不要共享可变状态。多个任务同时改一个 list/dict，需要 [[asyncio.Lock]] 或每个任务返回自己的结果再合并。asyncio 是单线程协作式，不加锁的「读-改-写」在 await 之间仍可能交错。

超时要分层：连接超时、读取超时、总预算。总预算到了，即使单步还没超时，也要取消。用 [[asyncio.timeout_at]] 基于绝对时间，避免每步重新计时导致总时长翻倍。

取消后要等任务真正结束。[[TaskGroup]] 的 [[__aexit__]] 会等所有子任务退出；自己管理任务时，cancel 后要 [[await task]] 捕获 CancelledError。不等就退出事件循环，会留下未关闭的连接。

验收：一个任务失败，其他任务被取消；超时抛 TimeoutError；清理执行；取消不被吞；退出前所有任务结束。`,
    code: String.raw`import asyncio

async def fetch(i):
    try:
        await asyncio.sleep(0.2)
        if i == 2:
            raise ValueError("bad item")
        return i
    finally:
        print("cleanup", i)

async def main():
    try:
        async with asyncio.TaskGroup() as tg:
            for i in range(4):
                tg.create_task(fetch(i))
    except* ValueError as group:
        print("failed:", len(group.exceptions))

asyncio.run(main())`,
    output: `cleanup 0
cleanup 1
cleanup 2
cleanup 3
failed: 1`,
    tip: `TaskGroup 一失败全取消；timeout 包住总操作；CancelledError 清理后要重抛；取消后 await 收尾。`
  }, {
    h: "故障排查：背压、信号量与无界队列",
    p: `[[asyncio.Queue]] 默认无界，生产者可以无限放，消费者跟不上就吃内存。用 [[Queue(maxsize=100)]] 加 [[await queue.put(x)]]，队列满时生产者自动等待，形成背压。不要用 [[put_nowait]] 然后忽略 QueueFull，那等于丢任务。

[[asyncio.Semaphore]] 限制同时进行的操作，比如最多 10 个并发请求。acquire 要在 try/finally 里 release，异常也不能漏。用 [[async with sem]] 更安全。信号量不是速率限制；每秒最多 10 个请求要用令牌桶，信号量只控制并发数。

生产者和消费者要能优雅结束。生产者完成后放哨兵（None），消费者收到后退出；或者用 [[queue.join()]] + [[task_done()]]。不要用 [[q.empty()]] 判断结束，生产者和消费者并发时不可靠。

消费者异常要处理。一个任务失败不应该让整个消费循环退出；捕获、记录、继续，或者把失败项放回重试队列。需要「失败即停」时，设置取消事件并等待所有任务退出。

背压也会传到上游。下游限流时，队列会满，生产者 await 变慢；这是正确行为。不要为了「跑得快」把队列改成无界，最后 OOM 更慢。监控队列长度和等待时间，动态调消费者数量。

取消时队列里还有任务。决定是「处理完再退」还是「丢弃未处理」；记录丢弃数量，不要静默。关闭前 [[await q.join()]] 确保 task_done 都调用；否则 join 永远等。

验收：队列有界；生产者在满时等待；信号量异常也释放；结束有哨兵/join；失败不拖垮循环；取消时丢弃数量可查。`,
    code: String.raw`import asyncio

async def worker(name, q, sem):
    while True:
        item = await q.get()
        try:
            if item is None:
                break
            async with sem:
                await asyncio.sleep(0.1)
                print(name, item)
        finally:
            q.task_done()

async def main():
    q = asyncio.Queue(maxsize=5)
    sem = asyncio.Semaphore(2)
    workers = [asyncio.create_task(worker(f"w{i}", q, sem)) for i in range(3)]
    for i in range(20):
        await q.put(i)
    for _ in workers:
        await q.put(None)
    await q.join()
    await asyncio.gather(*workers)

asyncio.run(main())`,
    output: `# 3 个 worker，最多 2 个并发；
# 队列满时生产者等待，内存不增长。`,
    tip: `有界队列形成背压；Semaphore 控并发；哨兵/join 优雅结束；失败项记录后继续。`
  }]);
})();
