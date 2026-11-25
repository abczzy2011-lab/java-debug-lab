window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch17-1": [
    {
      h: "深读：threading.local 与上下文隔离",
      p: `[[threading.local()]] 为每个线程保存独立副本，适合请求上下文/数据库连接。不要用全局变量存「当前用户」，线程间会串。

异步任务不能用 threading.local 隔离，因为同一线程跑多个协程；用 [[contextvars.ContextVar]]。

thread-local 不自动清理；线程池复用线程时，上一个任务的上下文可能残留，要在任务开始时重置。`,
      code: String.raw`import threading

ctx = threading.local()

def worker(name):
    ctx.name = name
    print(ctx.name)

t1 = threading.Thread(target=worker, args=("a",))
t2 = threading.Thread(target=worker, args=("b",))
t1.start(); t2.start(); t1.join(); t2.join()`,
          output: `a
b`,
          tip: `线程上下文用 [[threading.local]]，协程用 [[ContextVar]]；线程池复用要重置。`
    },
    {
      h: "深读：Condition/Event 的等待与通知",
      p: `[[Condition]] 用于「等待某个条件成立」：[[with cond: cond.wait_for(lambda: ready)]]，另一个线程修改状态后 [[notify_all]]。必须持锁修改状态，再通知。

[[Event]] 是简单开关：[[set]]/[[wait]]/[[clear]]，适合「初始化完成/停止信号」。[[Barrier]] 让 N 个线程互相等待。

[[wait]] 要带超时，避免永久阻塞；虚假唤醒用 [[while not cond]] 循环检查，[[wait_for]] 已封装。`,
      code: String.raw`import threading

ready = threading.Event()

def worker():
    ready.wait(timeout=1)
    print("go")

t = threading.Thread(target=worker)
t.start()
ready.set()
t.join()`,
          output: `go`,
          tip: `Condition 持锁改状态再 notify；Event 适合开关；wait 要超时，防永久阻塞。`
    },
    {
      h: "深读：线程池的异常与超时传播",
      p: `[[submit]] 的异常存到 Future，只有 [[result()]]/[[exception()]] 才看得到；不取结果就静默失败。用 [[as_completed]] 遍历并 try/except。

[[future.cancel()]] 只能取消未开始的任务；运行中的无法强停。需要超时用 [[wait(timeout=)]]，超时后决定继续等/放弃。

[[shutdown(wait=True)]] 等所有任务；[[cancel_futures=True]] 取消排队任务。程序退出前要 shutdown，避免线程泄漏。`,
      code: String.raw`from concurrent.futures import ThreadPoolExecutor

def boom():
    raise ValueError("bad")

with ThreadPoolExecutor(1) as pool:
    f = pool.submit(boom)
    try:
        f.result()
    except ValueError as err:
        print("caught", err)`,
          output: `caught bad`,
          tip: `异常在 [[result()]] 才抛出；[[cancel]] 只能取消未开始任务，退出前 shutdown。`
    },
    {
      h: "深读：GIL 的未来与选型",
      p: `Python 3.13 提供 free-threaded 构建（[[--disable-gil]]），但默认构建仍有 GIL，生态兼容性还在推进。不要假设部署环境已无 GIL。

即使无 GIL，共享可变状态仍需锁；多线程 CPU 并行会带来缓存/调度开销，不一定线性加速。

选型：I/O 密集线程/async；CPU 密集进程；需要共享大量状态再考虑共享内存/专门库。先测再选。`,
      code: String.raw`import sys, sysconfig

print(sys.version)
print(sysconfig.get_config_var("Py_GIL_DISABLED"))`,
          output: `3.12.x
0`,
          tip: `默认仍有 GIL；free-threaded 是实验构建。选型看 I/O/CPU，不跟风。`
    }
  ],
  "ch17-2": [
    {
      h: "深读：fork、spawn、forkserver 的差异",
      p: `Linux 默认 [[fork]]，子进程继承父进程状态（包括已打开文件/锁），快但易出问题；macOS/Windows 默认 [[spawn]]，干净但慢、要可 pickle。

[[forkserver]] 先起一个干净服务进程再 fork，兼顾安全/速度，适合多进程池。[[multiprocessing.set_start_method]] 要在创建任何进程前设置。

fork 后子进程不要复用父进程的数据库连接/线程锁；在子进程里重新初始化。`,
      code: String.raw`import multiprocessing as mp

print(mp.get_start_method())
# mp.set_start_method("spawn", force=True)`,
          output: `fork`,
          tip: `fork 继承状态但易污染；spawn 干净但要 pickle；子进程重新初始化连接/锁。`
    },
    {
      h: "深读：共享内存与锁的配合",
      p: `[[Value("i", 0)]]/[[Array("d", n)]] 是共享内存，多个进程直接读写；必须配 [[Lock]]，否则竞态。[[Value]] 有 [[get_lock]]，也可传独立锁。

共享内存适合大数组/计数器；不适合复杂对象（要 pickle）。[[multiprocessing.shared_memory]] 可映射大块内存，但生命周期/清理要手动。

进程崩溃可能留下共享内存段；用 [[resource_tracker]]/显式 [[close/unlink]] 清理。`,
      code: String.raw`from multiprocessing import Process, Value, Lock

def add(v, lock):
    for _ in range(100):
        with lock:
            v.value += 1

if __name__ == "__main__":
    v = Value("i", 0)
    lock = Lock()
    ps = [Process(target=add, args=(v, lock)) for _ in range(2)]
    for p in ps: p.start()
    for p in ps: p.join()
    print(v.value)`,
          output: `200`,
          tip: `[[Value/Array]] 共享内存必须配锁；复杂对象用 Queue/Manager；崩溃后清理共享段。`
    },
    {
      h: "深读：Pool 的异常、超时与终止",
      p: `[[pool.map]] 遇到异常会抛出，但已启动的任务可能继续；[[apply_async]] 的异常在 [[get]] 时抛。收集所有结果时用 [[return_exceptions]] 思路。

[[pool.terminate]] 立即杀，[[pool.close]] 等任务完成再 join。上下文管理器退出会 close+join，异常时可能等很久。

进程池任务要幂等/可重试；进程崩溃不会自动重启，长任务要考虑监控/重启策略。`,
      code: String.raw`from multiprocessing import Pool

def work(n):
    if n == 2:
        raise ValueError("bad")
    return n

if __name__ == "__main__":
    with Pool(2) as pool:
        try:
            print(pool.map(work, [1, 2, 3]))
        except ValueError as err:
            print("failed", err)`,
          output: `failed bad`,
          tip: `[[map]] 异常会抛；[[terminate]] 立即杀、[[close]] 等完成；长任务要监控重启。`
    },
    {
      h: "深读：多进程的日志与输出",
      p: `多进程写同一日志文件会交错/损坏；每个进程写独立文件，或使用 [[QueueHandler]] 把日志送到主进程统一写。

[[print]] 在多进程下也可能交错；用 [[flush=True]] 并加进程名。子进程 stdout 可能被父进程缓冲，cron 下看不到。

日志初始化放在子进程入口，不要依赖 fork 继承的 handler（文件描述符共享会乱）。`,
      code: String.raw`import logging, os
from multiprocessing import Process

def worker():
    logging.basicConfig(filename=f"w-{os.getpid()}.log", level=logging.INFO)
    logging.info("start")

if __name__ == "__main__":
    p = Process(target=worker)
    p.start(); p.join()`,
          output: `w-12345.log: INFO start`,
          tip: `每进程独立日志或 QueueHandler 汇总；print 加 flush/进程名，别共享 handler。`
    }
  ],
  "ch17-3": [
    {
      h: "深读：async 迭代器与异步生成器",
      p: `[[async def]] + [[yield]] 是异步生成器，用 [[async for]] 消费；[[__aiter__]]/[[__anext__]] 定义异步迭代器。适合流式读大响应/分页。

异步生成器不能直接 [[list()]]；要 [[[x async for x in agen]]]。取消时生成器要在 [[finally]] 清理。

不要把同步生成器包一层 [[to_thread]] 就当异步流；每次迭代都跨线程，开销大。`,
      code: String.raw`import asyncio

async def agen():
    for i in range(3):
        await asyncio.sleep(0)
        yield i

async def main():
    print([x async for x in agen()])

asyncio.run(main())`,
          output: `[0, 1, 2]`,
          tip: `异步生成器用 [[async for]]；取消要在 finally 清理，别用线程桥接假装流式。`
    },
    {
      h: "深读：asyncio.Queue 与背压",
      p: `[[asyncio.Queue(maxsize=N)]] 在 [[await put]] 满时等待，形成背压；消费者 [[await get]]。[[task_done]]/[[join]] 与线程 Queue 类似。

生产者-消费者用 [[asyncio.create_task]] 启动多个消费者；异常要收集，否则任务静默死掉。

队列不是越大越好；无界队列会把内存吃光。按处理速度设 maxsize。`,
      code: String.raw`import asyncio

async def main():
    q = asyncio.Queue(maxsize=2)
    await q.put(1)
    await q.put(2)
    print(q.qsize())
    print(await q.get())

asyncio.run(main())`,
          output: `2
1`,
          tip: `[[asyncio.Queue(maxsize)]] 做背压；消费者异常要收集，别让任务静默死。`
    },
    {
      h: "深读：Semaphore、Lock 与超时组合",
      p: `[[asyncio.Semaphore]] 限制并发；[[asyncio.Lock]] 保护共享状态。两者都是异步上下文管理器，等待时不阻塞循环。

[[async with asyncio.timeout(5)]] 包住整个块，超时取消内部 await；比 [[wait_for]] 更适合多步操作。

锁内不要做长 I/O；锁只保护状态更新，I/O 放锁外。`,
      code: String.raw`import asyncio

sem = asyncio.Semaphore(2)

async def work(i):
    async with sem:
        await asyncio.sleep(0.1)
        return i

async def main():
    print(await asyncio.gather(*(work(i) for i in range(4))))

asyncio.run(main())`,
          output: `[0, 1, 2, 3]`,
          tip: `Semaphore 限并发、Lock 保护状态；[[asyncio.timeout]] 包多步操作，锁内别做长 I/O。`
    },
    {
      h: "深读：异步性能的常见误区",
      p: `async 不会让单请求更快，只提高等待期间的并发；如果对方限流/带宽满，加并发只会更慢。

事件循环是单线程，CPU 计算/同步解析会阻塞所有任务；大 JSON 解析也可能成为瓶颈。

压测要测 P50/P95/错误率，不只看总耗时；调并发数找到拐点。异步不是万能，线程/进程各有位置。`,
      code: String.raw`import asyncio, time

async def one():
    await asyncio.sleep(0.05)

async def main(n):
    t0 = time.perf_counter()
    await asyncio.gather(*(one() for _ in range(n)))
    print(n, round(time.perf_counter() - t0, 2))

asyncio.run(main(20))`,
          output: `20 0.06`,
          tip: `async 提高等待期并发，不加快单请求；CPU/解析会阻塞循环，压测看 P95/错误率。`
    }
  ],
  "ch17-review": [
    {
      h: "本章复盘：先分类，再选模型",
      p: `并发模型的选择只看两件事：任务是 I/O 等待还是 CPU 计算；需要多少共享状态。I/O → 线程或 async；CPU → 进程；共享状态多 → 重新设计，尽量用消息传递。

三个安全底线：共享可变状态要锁/队列；任务要能超时/取消/清理；异常不能静默吞掉。没有这三条，越快越危险。

本章验收：线程生产者-消费者；线程 vs 进程 CPU 对比；async 限流抓取 + 超时统计。`,
      code: String.raw`import asyncio

async def main():
    async with asyncio.TaskGroup() as tg:
        t = tg.create_task(asyncio.sleep(0.1, result="ok"))
    print(t.result())

asyncio.run(main())`,
      output: `ok`,
      tip: `I/O 线程/async、CPU 进程；锁/超时/异常三件事先做好，再谈性能。`
    }
  ]
});
