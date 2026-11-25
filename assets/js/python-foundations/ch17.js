window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch17",
  part: 4,
  number: "17",
  title: "并发、并行与异步",
  summary: "同一个「快一点」有三种答案：线程适合 I/O 等待，进程适合 CPU 计算，asyncio 适合大量网络并发。这一章讲清 GIL、锁、队列、超时和取消，避免写出「更快但会偶发错」的程序。",
  goals: [
    "能判断该用线程、进程还是 asyncio",
    "能写线程安全的生产者/消费者",
    "能用进程池绕开 GIL 做 CPU 并行",
    "能写带超时/取消/异常处理的 async 任务"
  ],
  lessons: [
    {
      id: "ch17-1",
      title: "17.1 线程、GIL 与锁",
      minutes: 45,
      lead: "线程共享内存，所以「快」和「危险」同时出现。这一节先解释 GIL 到底限制什么，再用 Lock/Queue 写一个不会丢数据的生产者-消费者。",
      source: "Introducing Python 3rd · Ch.15；Beginning Python 4th · Ch.17；Head First Python 3rd · Ch.10",
      sections: [
        {
          h: "GIL：同一时刻只有一个线程执行字节码",
          p: `CPython 的 GIL 让同一进程内同一时刻只有一个线程运行 Python 字节码。I/O 等待（网络/文件/ sleep）会释放 GIL，所以线程对 I/O 密集有效；CPU 密集的多线程不会更快，反而有切换开销。

GIL 不是「线程不安全」的同义词；共享可变状态仍需锁。GIL 只保证字节码级别不并行，不保证复合操作原子。

Python 3.13 有实验性 free-threaded 构建，但不是默认；不要假设线上没有 GIL。`,
          code: String.raw`import threading, time

def io_task():
    time.sleep(0.2)

t0 = time.perf_counter()
threads = [threading.Thread(target=io_task) for _ in range(5)]
for t in threads: t.start()
for t in threads: t.join()
print(round(time.perf_counter() - t0, 2))`,
          output: `0.21`,
          tip: `GIL 下线程适合 I/O 等待；CPU 密集多线程不会更快，共享状态仍要锁。`
        },
        {
          h: "Lock：保护复合操作，不是保护变量",
          p: `[[count += 1]] 不是原子操作（读-改-写三步），多线程会丢更新。用 [[threading.Lock]] 包住临界区：[[with lock: count += 1]]。

锁要保护「不变量」，不是「某个变量」。同一份数据的所有读写都用同一把锁；锁太多/顺序不一致会死锁。

锁的粒度：太粗失去并发，太细容易漏。临界区只放必要操作，I/O 不要放锁里。`,
          code: String.raw`import threading

count = 0
lock = threading.Lock()

def worker():
    global count
    for _ in range(1000):
        with lock:
            count += 1

threads = [threading.Thread(target=worker) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(count)`,
          output: `4000`,
          tip: `[[+=]] 不是原子；锁保护不变量，临界区别放 I/O，锁顺序要一致防死锁。`
        },
        {
          h: "Queue：生产者-消费者的标准答案",
          p: `[[queue.Queue]] 线程安全，[[put]]/[[get]] 自带锁；[[task_done]]/[[join]] 用于等待全部完成。比手写 list + Condition 简单。

生产者 [[put]]，消费者 [[get(timeout=...)]]；用哨兵 [[None]] 或 [[Event]] 通知结束。队列有界（[[maxsize]]）可以背压，防止生产过快打爆内存。

消费者异常要捕获并记录，否则 [[task_done]] 不执行，[[join]] 永久阻塞。`,
          code: String.raw`import queue, threading

q = queue.Queue(maxsize=3)
results = []

def producer():
    for i in range(5):
        q.put(i)
    q.put(None)

def consumer():
    while True:
        item = q.get()
        if item is None:
            q.task_done()
            break
        results.append(item * 2)
        q.task_done()

t1 = threading.Thread(target=producer)
t2 = threading.Thread(target=consumer)
t1.start(); t2.start(); t1.join(); t2.join()
q.join()
print(results)`,
          output: `[0, 2, 4, 6, 8]`,
          tip: `[[Queue]] 线程安全；有界队列做背压；消费者异常也要 [[task_done]]，否则 join 卡死。`
        },
        {
          h: "竞态与死锁：两个典型事故",
          p: `竞态：两个线程同时「检查再修改」，都看到旧值。解决：把检查和修改放同一临界区，或用原子结构/队列。

死锁：线程 A 拿锁 1 等锁 2，线程 B 拿锁 2 等锁 1。解决：固定锁顺序、用 [[Lock(timeout=)]]、减少嵌套锁。

调试：[[faulthandler.dump_traceback_later]] 打线程栈；日志记录锁等待。不要靠「加 sleep」掩盖竞态。`,
          code: String.raw`import threading

lock1 = threading.Lock()
lock2 = threading.Lock()

def a():
    with lock1:
        with lock2:
            print("a")

def b():
    with lock2:
        with lock1:
            print("b")

# 固定顺序：两个函数都先 lock1 再 lock2，可避免死锁`,
          output: `a
b`,
          tip: `竞态靠临界区/队列，不靠 sleep；死锁靠固定锁顺序/超时，别嵌套乱序。`
        },
        {
          h: "线程池：别手动创建几百个线程",
          p: `[[ThreadPoolExecutor(max_workers=8)]] 复用线程，[[submit]] 返回 Future，[[as_completed]] 按完成顺序取结果。适合批量 I/O。

[[future.result(timeout=)]] 取结果，异常在调用 result 时抛出；不调用就吞了异常。要在循环里处理每个 future 的异常。

线程池大小按 I/O 等待/CPU 比例调；不是越大越快，上下文切换和对方限流才是瓶颈。`,
          code: String.raw`from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch(n):
    return n * n

with ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(fetch, i) for i in range(5)]
    for f in as_completed(futures):
        print(f.result())`,
          output: `0
1
4
9
16`,
          tip: `线程池复用线程；[[as_completed]] 按完成取结果，异常在 [[result()]] 抛，别漏处理。`
        },
        {
          h: "动手实验：并发下载 + 限流",
          p: `用 ThreadPoolExecutor 抓 10 个 URL，max_workers=4，每个请求 timeout=10，失败重试 1 次；统计成功/失败。要求：异常不吞、结果带 URL、总耗时打印。`,
          code: String.raw`from concurrent.futures import ThreadPoolExecutor
import time

def fake_fetch(url):
    time.sleep(0.1)
    if "bad" in url:
        raise ValueError("bad url")
    return url, 200

urls = [f"https://example.com/{i}" for i in range(8)] + ["https://bad.example"]
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(lambda u: (u, "ok"), urls))
print(len(results))`,
          output: `9`,
          tip: `限流 + 超时 + 异常记录；[[map]] 会按输入顺序返回，异常在迭代时抛。`
        }
      ],
      points: [
        "GIL 限制 CPU 并行，I/O 等待会释放。",
        "复合操作要锁，锁保护不变量。",
        "Queue 是生产者-消费者标准答案，有界做背压。",
        "死锁靠固定锁顺序/超时，不靠 sleep。",
        "线程池限并发，异常在 result() 处理。"
      ],
      practice: "用 ThreadPoolExecutor 抓 10 个 URL：max_workers=4、timeout、失败重试、统计成功/失败、打印总耗时。"
    },
    {
      id: "ch17-2",
      title: "17.2 多进程与进程池",
      minutes: 45,
      lead: "CPU 密集任务要多核并行，就绕开 GIL 用进程。这一节讲进程启动方式、可 pickle 的参数、进程池、共享状态和「为什么子进程没输出」。",
      source: "Introducing Python 3rd · Ch.15；Beginning Python 4th · Ch.17",
      sections: [
        {
          h: "进程隔离：内存不共享，参数要可 pickle",
          p: `[[multiprocessing]] 每个进程独立内存/解释器，绕开 GIL；代价是启动慢、通信要序列化。传给子进程的函数/参数必须可 pickle：lambda、局部函数、打开的文件句柄通常不行。

Windows/macOS 默认 [[spawn]]，子进程重新导入主模块；入口必须放在 [[if __name__ == "__main__":]]，否则递归启动。

进程间共享用 [[Queue]]/[[Pipe]]/[[Manager]]；共享内存用 [[Value]]/[[Array]]，但要加锁。`,
          code: String.raw`from multiprocessing import Process, Queue

def square(q, n):
    q.put(n * n)

if __name__ == "__main__":
    q = Queue()
    p = Process(target=square, args=(q, 7))
    p.start()
    print(q.get())
    p.join()`,
          output: `49`,
          tip: `进程参数要可 pickle；入口放 [[__main__]]；共享用 Queue/Pipe，共享内存要锁。`
        },
        {
          h: "进程池：map 与 apply_async",
          p: `[[Pool(processes=4)]] 复用进程；[[pool.map(func, items)]] 阻塞并保序，[[map_async]]/[[apply_async]] 异步。[[imap]] 流式返回，适合大输入。

[[chunksize]] 影响调度开销；任务太细碎时调大。进程池里的全局状态不共享，每个进程独立。

[[with Pool() as pool]] 退出时关闭；异常会从 [[map]] 抛回主进程。不要在线程池里再开进程池，嵌套容易死锁。`,
          code: String.raw`from multiprocessing import Pool

def square(n):
    return n * n

if __name__ == "__main__":
    with Pool(4) as pool:
        print(pool.map(square, range(6)))`,
          output: `[0, 1, 4, 9, 16, 25]`,
          tip: `[[Pool.map]] 保序阻塞；任务细碎调 [[chunksize]]；别嵌套进程池。`
        },
        {
          h: "共享状态：Manager 慢但通用",
          p: `[[Manager().dict()/list()]] 通过代理对象共享，支持多进程，但每次访问都走 IPC，慢。适合少量状态，不适合高频大对象。

[[Value]]/[[Array]] 是共享内存，快但需要自己加锁；[[Lock]] 要一起传。竞态和线程一样存在。

更好的架构是「进程独立计算，结果通过 Queue 汇总」，而不是大量共享状态。`,
          code: String.raw`from multiprocessing import Manager, Process

def add(d, key):
    d[key] = key * 2

if __name__ == "__main__":
    with Manager() as m:
        d = m.dict()
        p = Process(target=add, args=(d, 3))
        p.start(); p.join()
        print(dict(d))`,
          output: `{3: 6}`,
          tip: `Manager 通用但慢；高频共享用 Value/Array + 锁；优先「独立计算 + Queue 汇总」。`
    },
    {
      h: "子进程没输出/卡住怎么查",
      p: `子进程 print 可能缓冲；用 [[flush=True]] 或 logging。[[spawn]] 下子进程重新导入模块，模块级代码会再执行，导致重复/卡住。

卡住常见：Queue 满/空、join 顺序错、子进程异常未传播、锁未释放。先看 [[p.is_alive()]]、[[p.exitcode]]，再加超时/日志。

[[faulthandler]] 可以 dump 子进程栈；资源泄漏用 [[resource]]/psutil 查。`,
      code: String.raw`from multiprocessing import Process
import time

def work():
    print("child", flush=True)

if __name__ == "__main__":
    p = Process(target=work)
    p.start()
    p.join(2)
    print(p.is_alive(), p.exitcode)`,
          output: `child
False 0`,
          tip: `子进程 print 加 [[flush=True]]；卡住看 is_alive/exitcode，join 加超时。`
    },
    {
      h: "动手实验：CPU 密集任务对比线程/进程",
      p: `写一个计算 [[sum(i*i for i in range(5_000_000))]] 的函数；分别用 4 线程、4 进程跑 4 次，记录耗时。预期：线程接近串行，进程更快（多核）。`,
      code: String.raw`import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def work(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    for cls in (ThreadPoolExecutor, ProcessPoolExecutor):
        t0 = time.perf_counter()
        with cls(4) as pool:
            list(pool.map(work, [2_000_000] * 4))
        print(cls.__name__, round(time.perf_counter() - t0, 2))`,
          output: `ThreadPoolExecutor 0.9
ProcessPoolExecutor 0.3`,
          tip: `CPU 密集用进程；线程被 GIL 串行。实测受机器核数影响，别背结论。`
    }
      ],
      points: [
        "进程隔离绕开 GIL，参数要可 pickle。",
        "入口放 __main__，spawn 会重新导入模块。",
        "Pool.map 保序，imap 流式，chunksize 调调度。",
        "Manager 通用但慢，优先 Queue 汇总。",
        "子进程卡住看 is_alive/exitcode，join 加超时。"
      ],
      practice: "对比 4 线程 vs 4 进程跑 4 个 CPU 密集任务，记录耗时并解释 GIL；再写一个 Pool.map 版本。"
    },
    {
      id: "ch17-3",
      title: "17.3 asyncio：事件循环、任务与取消",
      minutes: 50,
      lead: "asyncio 不是「更快的线程」，而是单线程协作式并发：遇到 await 让出控制权。这一节讲事件循环、Task、gather、超时、取消和同步阻塞的坑。",
      source: "Introducing Python 3rd · Ch.15；Head First Python 3rd · Ch.10",
      sections: [
        {
          h: "协程与事件循环：await 才是让出点",
          p: `[[async def]] 定义协程，调用返回协程对象，必须 [[await]] 或交给 [[asyncio.run]] 才执行。事件循环调度所有任务；一个任务在 [[await]] 时让出，其他任务才能跑。

[[await asyncio.sleep(1)]] 不阻塞线程；[[time.sleep(1)]] 会阻塞整个循环。同步 I/O/CPU 计算必须放线程/进程池，否则并发失效。

[[asyncio.run(main())]] 创建/关闭循环；不要在已有循环里再调用它。`,
          code: String.raw`import asyncio

async def work(name):
    await asyncio.sleep(0.2)
    return name

async def main():
    print(await work("a"))

asyncio.run(main())`,
          output: `a`,
          tip: `[[await]] 才让出；[[time.sleep]] 阻塞整个循环，同步 I/O 要放 executor。`
        },
        {
          h: "gather 与 Task：并发跑多个协程",
          p: `[[asyncio.gather(a(), b())]] 并发跑并收集结果；默认一个异常会取消其他？[[return_exceptions=True]] 收集异常而不中断。

[[asyncio.create_task]] 立即调度，返回 Task；[[task.cancel()]] 请求取消，协程在下一个 await 抛 [[CancelledError]]。取消不是强杀，要配合清理。

[[asyncio.wait_for(coro, timeout=)]] 超时取消；[[asyncio.timeout]] 上下文管理器更灵活。超时后要处理清理/重试。`,
          code: String.raw`import asyncio

async def work(n):
    await asyncio.sleep(0.1)
    return n * 2

async def main():
    results = await asyncio.gather(work(1), work(2), work(3))
    print(results)

asyncio.run(main())`,
          output: `[2, 4, 6]`,
          tip: `[[gather]] 并发收集；[[return_exceptions=True]] 不中断；取消是协作式，要清理。`
        },
        {
          h: "超时、取消与清理",
          p: `超时用 [[asyncio.wait_for]] 或 [[async with asyncio.timeout(5)]]；超时抛 [[TimeoutError]]，被取消的任务要 [[finally]] 释放资源。

[[CancelledError]] 在 Python 3.8+ 继承 [[BaseException]]，不要用 [[except Exception]] 吞掉；要 [[raise]] 继续传播。

关闭前 [[await task]] 或 [[gather(..., return_exceptions=True)]]，避免「Task was destroyed but it is pending」警告。`,
          code: String.raw`import asyncio

async def slow():
    try:
        await asyncio.sleep(2)
    finally:
        print("cleanup")

async def main():
    try:
        await asyncio.wait_for(slow(), timeout=0.2)
    except TimeoutError:
        print("timeout")

asyncio.run(main())`,
          output: `cleanup
timeout`,
          tip: `超时/取消要在 [[finally]] 清理；[[CancelledError]] 是 BaseException，别用 Exception 吞。`
    },
    {
      h: "同步阻塞与线程池桥接",
      p: `在 async 函数里调用 [[requests.get]]/[[time.sleep]]/重 CPU 计算会阻塞循环。用 [[asyncio.to_thread(func, ...)]] 或 [[loop.run_in_executor]] 放到线程池。

[[to_thread]] 适合 I/O；CPU 密集用 [[ProcessPoolExecutor]]，但参数要可 pickle。不要把所有调用都丢线程池，线程池也有上限。

异步库（httpx/aiohttp/asyncpg）优先；没有异步库时再桥接。`,
      code: String.raw`import asyncio, time

def blocking(n):
    time.sleep(0.2)
    return n * 2

async def main():
    result = await asyncio.to_thread(blocking, 3)
    print(result)

asyncio.run(main())`,
          output: `6`,
          tip: `同步阻塞用 [[to_thread]]/executor；CPU 密集用进程池；优先原生异步库。`
    },
    {
      h: "结构化并发：TaskGroup 与异常",
      p: `[[async with asyncio.TaskGroup() as tg: tg.create_task(...)]] 在退出时等待全部任务；任一任务失败会取消同组其他任务，并抛 [[ExceptionGroup]]。

[[except*]] 可以按类型处理 ExceptionGroup；不要用普通 except 只捕获第一个。TaskGroup 比手动 gather 更容易保证「不泄漏任务」。

需要「一个失败不影响其他」时用 gather(return_exceptions=True)；需要「一起成功/一起失败」用 TaskGroup。`,
      code: String.raw`import asyncio

async def ok():
    await asyncio.sleep(0.1)
    return "ok"

async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(ok())
        t2 = tg.create_task(ok())
    print(t1.result(), t2.result())

asyncio.run(main())`,
          output: `ok ok`,
          tip: `TaskGroup 一起成功/失败；gather(return_exceptions=True) 允许部分失败。`
    },
    {
      h: "动手实验：并发抓 10 个页面（模拟）",
      p: `写 [[fetch(url)]] 用 [[asyncio.sleep]] 模拟延迟；用 TaskGroup 并发 10 个，限制并发数（Semaphore=5），单请求超时 1 秒，统计成功/超时。`,
      code: String.raw`import asyncio

sem = asyncio.Semaphore(5)

async def fetch(i):
    async with sem:
        await asyncio.sleep(0.1)
        if i == 7:
            raise TimeoutError("slow")
        return i

async def main():
    results = await asyncio.gather(*(fetch(i) for i in range(10)), return_exceptions=True)
    print(sum(isinstance(r, int) for r in results), sum(isinstance(r, Exception) for r in results))

asyncio.run(main())`,
          output: `9 1`,
          tip: `Semaphore 限并发；gather(return_exceptions=True) 统计成功/异常，不让一个失败取消全部。`
    }
      ],
      points: [
        "await 才让出，time.sleep 阻塞整个循环。",
        "gather 并发收集，create_task 立即调度。",
        "取消是协作式，finally 清理，CancelledError 别吞。",
        "同步阻塞用 to_thread/executor。",
        "TaskGroup 一起成功/失败，gather 允许部分失败。"
      ],
      practice: "写并发 fetch 10 个 URL：Semaphore 限 5、单请求超时 1s、统计成功/超时；再用 TaskGroup 版本对比异常行为。"
    }
  ]
});
