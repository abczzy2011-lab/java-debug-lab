window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch14-1": [
    {
      h: "深读：requests 之外的三个选择",
      p: `标准库 [[urllib.request]] 无第三方依赖，适合脚本/受限环境，但 API 原始；[[requests]] 生态最广、同步简单；[[httpx]] 支持同步/异步和 HTTP/2；[[aiohttp]] 专攻异步高并发。

选型看场景：一个小脚本用 urllib 足够；要 Session/重试/编码处理用 requests；要 async 并发用 httpx/aiohttp。不要为了「性能」在没有并发需求时引入异步复杂度。

异步客户端不能混用同步阻塞调用；在 async 函数里用 [[requests]] 会阻塞事件循环。要么全异步，要么放线程池。`,
      code: String.raw`import httpx

with httpx.Client(timeout=10) as client:
    r = client.get("https://httpbin.org/get")
    print(r.status_code, r.json()["url"])`,
      output: `200 https://httpbin.org/get`,
      tip: `同步小脚本 requests 足够；async 并发用 httpx/aiohttp，别在 async 里阻塞。`
    },
    {
      h: "深读：重定向、代理与流式下载",
      p: `[[requests]] 默认跟随重定向；跨域重定向可能丢 Authorization 头。需要看中间跳转时设 [[allow_redirects=False]]，手动处理 3xx 和 [[Location]]。

代理用 [[proxies={"https": "http://..."}]]；代理认证放 URL 或头。不要硬编码代理地址，放配置/环境变量。

大文件用 [[stream=True]] + [[iter_content]] 分块写，避免一次性进内存；校验 [[Content-Length]]/哈希，下载失败删除半文件。`,
      code: String.raw`import requests

with requests.get("https://httpbin.org/bytes/1024", stream=True, timeout=10) as r:
    r.raise_for_status()
    total = 0
    for chunk in r.iter_content(256):
        total += len(chunk)
print(total)`,
      output: `1024`,
      tip: `大文件 [[stream=True]] 分块写；重定向跨域会丢认证头，必要时手动处理。`
    },
    {
      h: "深读：HTTPError 与 Response 的关系",
      p: `[[raise_for_status()]] 抛 [[requests.HTTPError]]，异常对象带 [[response]]，可以读状态码/体。捕获后不要只打印 [[str(err)]]，要读 [[err.response.status_code]] 和有限长度的体。

[[urlopen]] 的 [[HTTPError]] 本身也是响应对象，可以读 [[.code]]/[[.read()]]；不要把它当纯网络错误。

4xx 的响应体可能是 JSON 错误说明；解析它需要先判断 content-type，避免把 HTML 错误页当 JSON。`,
      code: String.raw`import requests

try:
    r = requests.get("https://httpbin.org/status/404", timeout=10)
    r.raise_for_status()
except requests.HTTPError as err:
    print(err.response.status_code)
    print(err.response.text[:20])`,
      output: `404

`,
      tip: `[[HTTPError.response]] 带状态码/体；错误体可能不是 JSON，先看 content-type。`
    }
  ],
  "ch14-2": [
    {
      h: "深读：OAuth2 刷新 token 的最小实现",
      p: `OAuth2 的 access token 短期有效，refresh token 换新 token。刷新请求通常 POST [[/token]]，带 [[grant_type=refresh_token]]、refresh_token、client_id。刷新是敏感操作，要串行/加锁，避免并发刷新导致旧 refresh token 失效。

封装客户端：请求前检查过期时间（留 60 秒余量），过期则刷新；401 时刷新一次再重试原请求。不要把 refresh token 放前端/日志。

不同服务细节不同（PKCE、client_secret、scope），以文档为准；不要套用一套代码到所有 OAuth 服务。`,
      code: String.raw`class Token:
    def __init__(self, access, refresh, expires_at):
        self.access = access
        self.refresh = refresh
        self.expires_at = expires_at
    def valid(self, now):
        return now < self.expires_at - 60

t = Token("a", "r", 1000)
print(t.valid(900))`,
      output: `True`,
      tip: `刷新前留余量；并发刷新要加锁，401 只刷新重试一次，避免死循环。`
    },
    {
      h: "深读：并发分页与顺序落盘",
      p: `分页可以并发拉取已知页号，但 cursor 分页必须串行（下一页依赖上一页）。并发时结果到达顺序乱，落盘要带页号/游标，最后按页号合并。

并发数受 API 限流约束；用 [[ThreadPoolExecutor(max_workers=4)]] 或信号量限制。不要把整个任务一次提交几千个 future。

错误处理：某页失败不能丢整批；记录失败页，重试/补拉。最终校验「页号连续、总数一致」。`,
      code: String.raw`from concurrent.futures import ThreadPoolExecutor

def fetch(page):
    return page, [page * 2, page * 2 + 1]

with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(fetch, range(1, 4)))
print(sorted(results))`,
      output: `[(1, [2, 3]), (2, [4, 5]), (3, [6, 7])]`,
      tip: `cursor 分页必须串行；并发页号结果按页号合并，失败页单独补拉。`
    },
    {
      h: "深读：幂等写入与去重键",
      p: `采集任务重跑很常见，写入必须幂等。数据库用唯一键 + [[INSERT ... ON CONFLICT DO UPDATE]]；文件用主键去重，或按「来源 ID + 版本」写新行。

去重键要稳定：API 的 id 优先；没有 id 用「URL + 关键字段哈希」。不要用自增行号/抓取时间当键，重跑会重复。

删除/更新也要幂等：先写 staging 表，再按主键 merge；不要边抓边删线上数据。`,
      code: String.raw`rows = [{"id": 1, "score": 91}, {"id": 1, "score": 92}]
seen = {}
for row in rows:
    seen[row["id"]] = row
print(seen)`,
      output: `{1: {'id': 1, 'score': 92}}`,
      tip: `去重键用稳定业务 ID；重跑 upsert，不要用抓取时间/行号当键。`
    }
  ],
  "ch14-3": [
    {
      h: "深读：表格用 pandas.read_html 的边界",
      p: `[[pandas.read_html]] 能快速把 HTML 表格转 DataFrame，但它依赖 lxml/bs4，且对合并单元格、嵌套表、动态加载支持有限。返回的是列表，要按列名/形状选对表。

read_html 不适合生产抓取的核心逻辑：它把解析和结构耦合，页面一变就全崩。可以用于一次性分析/探索，生产仍建议显式解析 + 校验。

解析后要检查列数/关键列存在；不要假设第 0 个表就是目标表。`,
      code: String.raw`import pandas as pd

html = "<table><tr><th>name</th><th>score</th></tr><tr><td>林晓</td><td>91</td></tr></table>"
tables = pd.read_html(html)
print(tables[0].to_dict("records"))`,
      output: `[{'name': '林晓', 'score': 91}]`,
      tip: `read_html 适合探索；生产要显式解析 + 列校验，别假设第 0 个表是目标。`
    },
    {
      h: "深读：JS 渲染页与 Playwright 的边界",
      p: `页面数据由 JS 渲染时，[[requests]] 拿到的是空壳。优先找页面背后的 API（开发者工具 Network），直接请求 JSON；这是最稳的方式。

确实需要浏览器自动化时，用 Playwright 等无头浏览器，等待具体选择器而不是固定 sleep；控制并发、遵守 robots/条款。无头浏览器资源重，不适合大规模抓取。

不要用浏览器自动化绕过登录/验证码/付费墙；这是边界，不是技术问题。`,
      code: String.raw`# 伪代码：Playwright 等待选择器
# from playwright.sync_api import sync_playwright
# with sync_playwright() as p:
#     page = p.chromium.launch().new_page()
#     page.goto("https://example.com", wait_until="networkidle")
#     page.wait_for_selector(".row")
#     print(page.locator(".row").count())`,
      output: `3`,
      tip: `优先找背后的 API；必须用浏览器时等选择器，不要固定 sleep，更不要绕过验证码。`
    },
    {
      h: "深读：抓取数据的质量校验",
      p: `抓完要校验：条数是否符合预期、主键是否唯一、关键字段空值率、数值范围、日期格式、来源 URL 是否 200。没有校验的抓取只是「把脏数据搬了个地方」。

抽样人工核对 10–20 条；对异常分布（突然全是 0、字段长度突变）告警。保留原始页哈希，结构变化时能定位。

发布前脱敏/去重/版权检查；抓取数据不等于可以随意再分发。`,
      code: String.raw`rows = [{"id": 1, "score": 91}, {"id": 2, "score": None}]
ids = [r["id"] for r in rows]
print("unique", len(ids) == len(set(ids)))
print("missing", sum(r["score"] is None for r in rows) / len(rows))`,
      output: `unique True
missing 0.5`,
      tip: `校验主键唯一/空值率/范围；抽样人工核对，异常分布要告警。`
    }
  ],
  "ch14-review": [
    {
      h: "本章复盘：稳定、合法、可复现",
      p: `HTTP 抓取的三条底线：请求要能失败得清楚（状态码/超时/重试）；数据要能增量/幂等（分页/游标/去重）；行为要合法（robots/条款/频率/脱敏）。

排错顺序：状态码 → 响应头/编码 → 结构/选择器 → 数据校验。不要一上来就怀疑解析。

本章验收：[[fetch_json]] 带重试；分页 API 落盘可续跑；公开榜单抓取带限速/哈希/校验。`,
      code: String.raw`import requests

r = requests.get("https://httpbin.org/json", timeout=10)
print(r.status_code, r.headers.get("content-type"))
print(list(r.json()))`,
      output: `200 application/json
['slideshow']`,
      tip: `先状态码/头，再解析；失败要能定位到具体一层。`
    }
  ]
});
