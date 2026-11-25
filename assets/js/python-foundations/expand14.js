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

  add("ch14-1", [{
    h: "工程深化：Session、超时与连接池的真实配置",
    p: `[[requests.get()]] 每次调用都会新建连接，三次握手、TLS 握手都重复。批量请求要用 [[requests.Session]]，它复用连接池、cookie、默认头。但 Session 不是线程安全的：一个 Session 被多个线程共享，连接池状态和 cookie 都可能乱。多线程要么每个线程一个 Session，要么用线程安全的客户端。

超时不能只写一个数字。[[timeout=5]] 同时限制连接和读取；更精确的是 [[timeout=(3.05, 10)]]：连接 3.05 秒，读取 10 秒。不设超时的请求可能永久挂起，把线程池耗尽。连接超时要短，读取超时按业务定；大文件下载不能用统一的 10 秒，要单独设置。

默认 [[verify=True]] 会验证 TLS 证书，不要为了「省事」关掉。内网自签证书用 [[verify="/path/ca.pem"]]，不要把整条链禁用。[[verify=False]] 会引入中间人风险，还会产生警告；如果必须用，限制在明确的内网地址并记录原因。

重试要只针对幂等请求。GET、HEAD、PUT、DELETE 通常可重试；POST 可能重复下单，除非有幂等键。[[HTTPAdapter(max_retries=Retry(...))]] 可以配置总次数、退避、状态码白名单。不要对 400/401/403 重试，那只会浪费时间。

连接池大小要匹配并发。[[HTTPAdapter(pool_connections=10, pool_maxsize=10)]] 太小会让线程排队；太大可能压垮服务端。[[pool_block=False]] 时超出的连接会被丢弃，不一定报错。压测时观察连接等待和 429，再调参数。

响应要及时关闭。[[response.content]] 会读完整 body；[[response.iter_content()]] 流式读取后要 [[response.close()]]，或者用 with。连接不归还，池会耗尽。大批量请求时，最容易被忽略的 bug 就是「代码跑得越久越慢」，最后卡死。

验收：100 次请求复用连接，耗时明显低于新建；超时能触发；证书错误能报；线程池并发不串 cookie；长下载不会占满池。`,
    code: String.raw`import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=0.5,
              status_forcelist=[429, 500, 502, 503, 504],
              allowed_methods=["GET", "HEAD"])
adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=10)
session.mount("https://", adapter)
session.headers.update({"User-Agent": "scores/0.3"})

r = session.get("https://example.com/api", timeout=(3.05, 10))
r.raise_for_status()
print(r.status_code, len(r.content))`,
    output: `200 12345`,
    tip: `Session 复连接但非线程安全；超时用 (connect, read)；只重试幂等请求；响应要及时关闭。`
  }, {
    h: "故障排查：流式下载、代理与重定向的坑",
    p: `下载大文件不要用 [[response.content]]，它会把整个文件读进内存。用 [[stream=True]] 加 [[iter_content(chunk_size=8192)]]，边读边写临时文件，最后原子替换。这样内存占用稳定，断点续传也有基础。写入过程中要检查 [[Content-Length]]，不匹配就失败。

断点续传用 Range 头：[[Range: bytes=1024-]]，服务端返回 206 才支持；返回 200 表示不支持，要从头写。下载前记录 ETag/Last-Modified，续传时用 [[If-Range]] 防止文件已变。不要只看文件大小判断完整，校验 SHA256 更可靠。

代理配置有三层：环境变量 [[HTTP_PROXY]]/[[HTTPS_PROXY]]、Session 的 [[proxies]]、单次请求的 [[proxies]]。优先级从低到高。内网请求不要走外网代理，[[NO_PROXY]] 要包含内网域名。代理认证用 URL 里的 user:pass 会出现在日志，尽量用环境或凭据管理器。

重定向默认开启，但 [[allow_redirects=False]] 可以手动检查。跨域重定向可能把 Authorization 头带到另一个域，[[requests]] 默认会剥离；自己实现时要小心。重定向循环会报 TooManyRedirects，捕获后打印最终 URL 和跳转链，不要只报「请求失败」。

[[response.raise_for_status()]] 只检查 4xx/5xx，不检查业务错误。API 返回 200 但 body 里 [[code=1001]] 时，仍要解析业务码。把 HTTP 错误和业务错误分开记录，排查时才知道是网络问题还是数据问题。

下载后要校验：文件大小、SHA256、MIME 类型、能否被目标程序打开。只检查「文件存在」不够，半截文件也存在。临时文件命名带 .part，完成后原子 rename；失败时删除 .part，避免下次误用。

验收：1GB 文件下载内存不涨；断点续传从中间继续；代理错误有清楚提示；重定向链可打印；坏文件能被校验拒绝。`,
    code: String.raw`import hashlib, requests
from pathlib import Path

def download(url, dest: Path, sha256: str):
    tmp = dest.with_suffix(dest.suffix + ".part")
    with requests.get(url, stream=True, timeout=(3.05, 60)) as r:
        r.raise_for_status()
        with open(tmp, "wb") as fh:
            for chunk in r.iter_content(8192):
                if chunk:
                    fh.write(chunk)
    digest = hashlib.sha256(tmp.read_bytes()).hexdigest()
    if digest != sha256:
        tmp.unlink(missing_ok=True)
        raise ValueError(f"checksum mismatch: {digest}")
    tmp.replace(dest)`,
    output: `# 下载完成：dest 存在且 SHA256 匹配
# 失败：.part 被删除，原文件不受影响`,
    tip: `stream=True 分块写；Range 续传要 206；代理分层配置；下载后校验哈希。`
  }]);

  add("ch14-2", [{
    h: "工程深化：分页、游标与可恢复的抓取状态",
    p: `分页接口常见两种：offset/limit 和 cursor。offset 分页在数据变动时会漏项或重复：你翻到第 2 页时，前面插入了新记录，原来的第 2 页变成第 3 页。cursor 分页用「上一页最后一条的 id/时间」作为起点，数据插入不影响后续，但要求服务端支持且排序稳定。

抓取前先确认排序字段。按 [[updated_at]] 升序、用 [[since]] 游标，能增量抓；按 [[id]] 升序、用 [[after_id]] 游标，适合全量。不要用「页码」做断点，页码不是稳定标识。把游标、最后成功时间、已处理 id 写入状态文件，进程重启能继续。

去重要有主键。[[id]]、[[url]]、[[(source, external_id)]] 都可以，但必须唯一且稳定。不要用标题做主键，标题会改；不要用列表索引，顺序会变。去重集合太大时，用数据库唯一索引或布隆过滤器，不要把所有 id 塞进内存 set。

每页处理完再更新游标。先处理、后提交状态，崩溃时最多重复一页，不会丢数据。重复页要幂等：upsert 而不是 insert，或者先查再写。状态文件也要原子写，否则断电后游标损坏，下次从头发送。

限速和分页要配合。每页请求之间 sleep，不要「翻页越快越好」；服务端 429 时读 [[Retry-After]]，暂停后从当前游标继续。把「请求数/页数/写入数/跳过数」记录到日志，异常时能看出卡在哪一页。

结束条件要明确：返回空列表、[[next_cursor]] 为空、返回数量小于 page_size、达到最大页数。不要只判断「没有数据」，有的接口最后一页仍返回满页但 next 为空。把结束原因打印出来，避免死循环。

验收：抓取中途 kill，重启后从断点继续；重复跑同一区间，不产生重复记录；数据插入后，后续页不漏；429 后能恢复；结束条件不会死循环。`,
    code: String.raw`import json, time
from pathlib import Path

STATE = Path("state.json")

def load_state():
    if STATE.exists():
        return json.loads(STATE.read_text())
    return {"cursor": None, "seen": []}

def save_state(state):
    tmp = STATE.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False))
    tmp.replace(STATE)

def crawl(fetch_page, handle):
    state = load_state()
    seen = set(state["seen"])
    cursor = state["cursor"]
    while True:
        page = fetch_page(cursor)
        for row in page["items"]:
            if row["id"] not in seen:
                handle(row)
                seen.add(row["id"])
        cursor = page.get("next_cursor")
        state.update(cursor=cursor, seen=list(seen))
        save_state(state)
        if not cursor:
            break
        time.sleep(0.3)`,
    output: `# 重启后从 state.json 的 cursor 继续；
# 同一 id 不会重复写入。`,
    tip: `游标用稳定排序字段；先处理后提交状态；upsert 幂等；结束条件要明确。`
  }, {
    h: "故障排查：429、Token 刷新与幂等键",
    p: `429 不是「请求失败」，而是「你太快了」。响应头 [[Retry-After]] 可能是秒数或 HTTP 日期，要解析后等待。没有这个头时，用指数退避加抖动。不要立刻重试，那会加重限流；也不要把 429 当成永久失败，稍等通常能恢复。

OAuth token 过期返回 401。不要在每次 401 都重新登录，那会触发风控；用刷新令牌换新 access token，并缓存到过期前。多个线程同时刷新会互相覆盖，用一个锁或「刷新中的 Future」让只有一个线程刷新，其他等待结果。

刷新失败要区分：[[invalid_grant]] 表示 refresh token 失效，必须重新授权；网络错误可以重试；[[invalid_client]] 是配置问题，重试无用。把错误码记录清楚，不要统一抛「登录失败」。

写请求要带幂等键。POST 创建订单/记录时，客户端生成 [[Idempotency-Key]]，服务端按 key 去重；重试时用同一个 key，不会重复创建。没有服务端支持时，客户端先查「是否已存在」再写，但这有竞态，不如服务端唯一索引可靠。

重试 POST 前要确认请求是否真的失败。超时可能表示服务端已处理但响应丢了；盲目重试会重复。用幂等键、查询接口或事务状态来确认。读请求可以大胆重试，写请求要谨慎。

限流要按域名/接口分开。一个 API 的 429 不应该让所有请求停摆；用令牌桶或信号量控制并发，按响应动态调整。记录每个域名的 QPS、429 次数、平均延迟，才能调参。

验收：429 后按 Retry-After 恢复；401 只刷新一次 token；多线程不重复刷新；重复 POST 不产生两条记录；超时后能确认服务端状态。`,
    code: String.raw`import time, threading, requests

class TokenClient:
    def __init__(self, refresh):
        self.refresh = refresh
        self.token = None
        self.lock = threading.Lock()

    def get(self):
        if self.token:
            return self.token
        with self.lock:
            if not self.token:
                self.token = self.refresh()
            return self.token

def request_with_retry(session, url, headers, tries=4):
    for n in range(tries):
        r = session.get(url, headers=headers, timeout=(3, 10))
        if r.status_code == 429:
            wait = int(r.headers.get("Retry-After", "1"))
            time.sleep(wait + n * 0.5)
            continue
        r.raise_for_status()
        return r
    raise RuntimeError("rate limited")`,
    output: `# 429 等待后重试；
# token 只刷新一次，其他线程复用。`,
    tip: `429 读 Retry-After；401 单飞刷新；写请求带幂等键；超时后先确认再重试。`
  }]);

  add("ch14-3", [{
    h: "工程深化：HTML 解析、正文抽取与数据质量",
    p: `[[requests]] 拿到的是 HTML 字符串，不是结构化数据。用 [[BeautifulSoup]] 或 [[lxml]] 解析，优先 [[CSS 选择器]]，因为比 XPath 更稳、更可读。解析器选 [[lxml]] 快，[[html.parser]] 内置但慢；不要用正则解析 HTML，嵌套和属性顺序会让正则失控。

选择器要锚定稳定结构，不要依赖「第 3 个 div」。优先 [[data-*]]、[[id]]、语义标签、稳定 class；这些都没有时，再用「父级 + 文本」组合。页面改版时，选择器会失效；把选择器集中到配置，方便快速修，不要散落在代码里。

正文抽取要处理空白、换行、全角空格、HTML 实体。[[get_text(" ", strip=True)]] 比 [[.text]] 干净；[[html.unescape]] 处理 [[&amp;]]；[[unicodedata.normalize("NFKC")]] 统一全角/半角。数字里的千分位、单位、百分号要单独解析，不要直接 float。

表格解析要保留表头。[[pandas.read_html]] 能快速读表格，但合并单元格、跨行表头、隐藏行会让结果错位。先打印 [[len(tables)]] 和每个表的 shape，确认选对了表；再用 [[header=0]] 或手动指定列名。不要假设第一个表就是目标表。

抓取要遵守 robots.txt 和服务条款。[[urllib.robotparser]] 可以解析 [[robots.txt]]，检查 [[can_fetch]]；设置合理 UA、限速、缓存。不要抓登录后的私人数据，不要绕过访问控制。法律和平台规则比技术更重要。

数据质量要校验：条数、必填字段、日期格式、数值范围、重复率。抓完先跑一遍统计，发现空值率高或字段缺失，先修解析器再入库。不要「先存进去再说」，脏数据清理成本更高。

验收：同一页面重复解析结果一致；页面改版时选择器集中可换；表格表头正确；robots 不允许时停止；空值/重复率有报告。`,
    code: String.raw`from bs4 import BeautifulSoup
import re, unicodedata

html = "<table><tr><th>选手</th><th>成绩</th></tr><tr><td>林晓</td><td>12.34</td></tr></table>"
soup = BeautifulSoup(html, "lxml")
rows = []
for tr in soup.select("table tr")[1:]:
    cells = [unicodedata.normalize("NFKC", td.get_text(" ", strip=True))
             for td in tr.select("td")]
    if len(cells) == 2:
        rows.append({"athlete": cells[0], "seconds": float(cells[1])})
print(rows)`,
    output: `[{'athlete': '林晓', 'seconds': 12.34}]`,
    tip: `CSS 选择器集中配置；get_text 清洗空白；表格先确认 shape；遵守 robots 与限速。`
  }, {
    h: "故障排查：JS 渲染页面与 Playwright 等待策略",
    p: `[[requests]] 只能拿初始 HTML；如果数据由 JavaScript 异步加载，解析到的是空壳。先在浏览器开发者工具看 Network：数据来自 XHR/fetch 就直接请求接口，比渲染整页更快更稳；只有页面必须执行 JS 才能拿到内容时，才用浏览器自动化。

Playwright 的基本流程：启动浏览器、新建上下文、打开页面、等待选择器、读取内容、关闭。等待用 [[page.wait_for_selector]] 或 [[expect(locator).to_be_visible()]]，不要用固定 [[sleep(5)]]。固定睡眠要么太短失败，要么太长拖慢；条件等待更可靠。

选择器优先 [[get_by_role]]、[[get_by_label]]、[[get_by_text]]，它们更接近用户视角，也不容易受 CSS 改版影响。需要精确结构时再用 [[locator("css=...")]]。避免 [[nth(0)]] 这种位置选择，列表顺序会变。

表格/列表数据用 [[locator.all()]] 拿多个元素，再逐个 [[inner_text()]]。注意懒加载：滚动到底部才会出现更多行；循环「滚动-等待-统计」直到数量稳定。不要一次 [[page.content()]] 然后自己解析，那样拿不到动态新增内容。

浏览器上下文要隔离：每个任务新建 [[browser.new_context()]]，设置 UA、viewport、locale、时区；需要登录时用 [[storage_state]] 保存会话，不要每次重新登录。并发抓取要限制上下文数量，否则内存和 CPU 会爆。

反爬和合规：不要绕过验证码、不要伪造身份、不要高频请求。遇到登录/验证码，停止并让用户处理；遇到 robots 禁止，停止。自动化只是工具，不是绕过规则的许可证。

验收：等待条件而非 sleep；数据加载完成后才读取；滚动加载能拿全；上下文关闭无泄漏；登录态可复用；异常时有截图和 URL。`,
    code: String.raw`from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(locale="zh-CN", viewport={"width": 1280, "height": 900})
    page = context.new_page()
    page.goto("https://example.com/scores", wait_until="networkidle")
    page.wait_for_selector("table tbody tr")
    rows = page.locator("table tbody tr").all()
    data = []
    for row in rows:
        cells = row.locator("td").all_inner_texts()
        if len(cells) >= 2:
            data.append(cells[:2])
    print(data)
    context.close()
    browser.close()`,
    output: `[['林晓', '12.34'], ['陈默', '12.56']]`,
    tip: `优先抓 XHR；条件等待替代 sleep；role/text 选择器更稳；限制并发并遵守规则。`
  }]);
})();
