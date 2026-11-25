window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch14",
  part: 4,
  number: "14",
  title: "HTTP、API 与网页抓取",
  summary: "从「打开网页」到「可靠地拿到数据」：请求方法、状态码、超时、重试、分页、认证、HTML 解析和抓取礼仪。这一章的重点是稳定和合法，不是把网页扒下来。",
  goals: [
    "能解释请求/响应、状态码、头、超时和重试",
    "能调用 JSON API 并处理分页、认证、限流",
    "能用 HTML 解析器提取结构化数据",
    "知道 robots、版权和抓取频率的边界"
  ],
  lessons: [
    {
      id: "ch14-1",
      title: "14.1 HTTP 请求与响应：先会读状态码",
      minutes: 45,
      lead: "抓数据失败，八成不是解析写错，而是请求就没成功。这一节用标准库和 requests 发请求，讲清状态码、头、超时、编码和重试。",
      source: "Introducing Python 3rd · Ch.22、24；Beginning Python 4th · Ch.15；Head First Python 3rd · Ch.8–9",
      sections: [
        {
          h: "请求由方法、URL、头、体组成",
          p: `HTTP 请求不只是「打开一个链接」。方法（GET/POST/PUT/DELETE）表达意图；URL 包含路径和查询参数；头携带 [[Accept]]、[[User-Agent]]、认证；体放表单/JSON。GET 应该只读，POST 才改数据。

响应包含状态码、头、体。状态码 2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务端错误。404 不是「网络坏了」，401/403 是认证/权限，429 是限流，500 是对方服务出错。

调试先看状态码和响应头，不要直接 [[.text]] 解析。状态码不对，后面全是白费。`,
          code: String.raw`from urllib.request import urlopen, Request

req = Request("https://httpbin.org/get", headers={"User-Agent": "scores-course/1.0"})
with urlopen(req, timeout=10) as resp:
    print(resp.status, resp.headers.get_content_type())
    print(resp.read(200).decode("utf-8"))`,
          output: `200 application/json
{"args": {}, "headers": {"User-Agent": "scores-course/1.0", ...}}`,
          tip: `先看状态码/头，再解析体；[[urlopen]] 对 4xx/5xx 会抛 [[HTTPError]]，要捕获。`
        },
        {
          h: "超时、重试与连接复用",
          p: `没有超时的请求可能永远挂着。[[timeout=]] 是连接+读取的总超时（不同库语义略有差异）；生产要设短超时并重试瞬时错误。

重试只针对超时、连接重置、429、5xx；4xx 参数/认证错误重试无意义。退避加抖动，次数有上限。[[requests.Session]] 复用连接，批量请求快很多。

不要在主线程里同步抓几百个 URL；用并发/队列，并限制并发数，避免把对方打挂。`,
          code: String.raw`import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=0.3, status_forcelist=[429, 500, 502, 503, 504])
session.mount("https://", HTTPAdapter(max_retries=retry))
r = session.get("https://httpbin.org/status/200", timeout=10)
print(r.status_code)`,
          output: `200`,
          tip: `超时必须设；只重试瞬时错误，[[Retry]] 配 [[status_forcelist]] 和退避。`
        },
        {
          h: "编码：响应头、meta 和 apparent_encoding",
          p: `[[response.text]] 按响应头 [[charset]] 解码；没有 charset 时 requests 可能猜错。[[response.content]] 是原始 bytes，最可靠；需要时用 [[response.apparent_encoding]] 或显式 [[encoding=]]。

HTML 的 [[<meta charset>]] 可能与响应头冲突；以响应头为准，若缺失再看 meta。JSON 应该按 UTF-8 解析，BOM 要清掉。

不要用 [[response.text]] 直接 [[json.loads]] 做生产解析；先 [[response.content]] 再显式解码，错误可追踪。`,
          code: String.raw`import requests, json

r = requests.get("https://httpbin.org/encoding/utf8", timeout=10)
print(r.headers.get("content-type"))
print(r.encoding)
data = json.loads(r.content.decode("utf-8"))
print(list(data)[:2])`,
          output: `text/html; charset=utf-8
utf-8
['slideshow', 'author']`,
          tip: `优先 [[response.content]] + 显式解码；[[response.text]] 的猜测可能错。`
        },
        {
          h: "认证：不要把 token 写进代码",
          p: `API 认证常见 Bearer token、API key、Basic auth。token 放环境变量/密钥管理，不写进源码/日志/Git。请求头用 [[Authorization: Bearer ...]]，不要放 URL 查询串（会进日志/浏览器历史）。

[[requests]] 的 [[auth=]] 适合 Basic；自定义头适合 Bearer。401 表示凭证缺失/失效，403 表示凭证有效但无权限；不要混。

需要刷新 token 时，封装一个客户端，统一处理过期/重试；不要让每个调用点自己拼头。`,
          code: String.raw`import os, requests

token = os.environ["API_TOKEN"]
headers = {"Authorization": f"Bearer {token}"}
r = requests.get("https://httpbin.org/bearer", headers=headers, timeout=10)
print(r.status_code)
print(r.json().get("authenticated"))`,
          output: `200
True`,
          tip: `token 放环境变量/密钥管理；401 是没认证，403 是没权限，别混。`
        },
        {
          h: "动手实验：写一个带重试的下载器",
          p: `实现 [[fetch_json(url)]]：10 秒超时、3 次重试、只重试 429/5xx/超时、指数退避、返回解析后的 JSON；错误带状态码和响应片段。

用 [[httpbin.org/status/500]] 和 [[/json]] 测试；记录每次重试原因。验收：失败时不吞异常，错误信息能定位是网络、状态码还是 JSON 解析。`,
          code: String.raw`import requests, time

def fetch_json(url, attempts=3):
    last = None
    for i in range(attempts):
        try:
            r = requests.get(url, timeout=10)
            if r.status_code in (429, 500, 502, 503, 504):
                raise requests.HTTPError(f"status {r.status_code}", response=r)
            r.raise_for_status()
            return r.json()
        except (requests.Timeout, requests.ConnectionError, requests.HTTPError) as err:
            last = err
            time.sleep(0.3 * (2 ** i))
    raise RuntimeError(f"fetch failed: {last}")`,
          output: `{'slideshow': {...}}`,
          tip: `重试函数最终必须抛出，不要返回 None；错误要带状态码/原因。`
        }
      ],
      points: [
        "先看状态码/头，再解析体；4xx 不是网络故障。",
        "请求必须设超时；只重试瞬时错误并退避。",
        "用 content + 显式解码，别完全信任 response.text。",
        "token 放环境变量，401 和 403 语义不同。",
        "批量抓取要限并发，别打挂对方。"
      ],
      practice: "写 `fetch_json(url)`：10s 超时、3 次重试、只重试 429/5xx/超时、指数退避；错误包含状态码和响应片段。"
    },
    {
      id: "ch14-2",
      title: "14.2 JSON API：分页、缓存与限流",
      minutes: 45,
      lead: "真实 API 不会一次给你全部数据。这一节讲分页游标、速率限制、缓存、增量同步和错误契约，让采集脚本能跑一整晚而不被封。",
      source: "Introducing Python 3rd · Ch.22、24；Head First Python 3rd · Ch.8–9",
      sections: [
        {
          h: "分页的三种形态：offset、page、cursor",
          p: `offset/limit 用 [[?offset=0&limit=100]]；page 用 [[?page=1&per_page=100]]；cursor 用 [[next_cursor]]/[[nextPageToken]]。前两种可能因数据变化重复/漏行，cursor 更稳定。

分页必须有终止条件：返回空数组、[[next]] 为 null、cursor 重复、达到最大页数。不要只靠「返回少于 limit」判断，有些 API 最后一页仍返回满页。

分页要限速并记录进度；中断后能从 cursor/offset 续跑。把每页原始响应存下来，解析失败可重放。`,
          code: String.raw`def iter_pages(fetch, max_pages=100):
    cursor = None
    for page in range(max_pages):
        data = fetch(cursor)
        yield page, data
        cursor = data.get("next_cursor")
        if not cursor:
            return

# 伪代码：fetch(cursor) 返回 {"items": [...], "next_cursor": "..."} `,
          output: `page=0 items=2 next=abc
page=1 items=1 next=None`,
          tip: `分页要有明确终止条件；cursor 比 offset 稳，中断后从 cursor 续跑。`
        },
        {
          h: "限流：读 Retry-After，不要硬撞",
          p: `429 响应常带 [[Retry-After]] 秒数；按它等待，不要固定 sleep。没有该头时用指数退避。并发数限制在对方文档建议内，别开 100 个线程。

批量任务先测单页耗时，再估算总时间；如果 API 限制 60 次/分钟，就把请求间隔设 1 秒以上。缓存已获取的数据，重跑不重复请求。

被限流不是「对方坏了」，是你在超速。记录 429 次数和等待时间，作为容量规划依据。`,
          code: String.raw`import time, requests

r = requests.get("https://httpbin.org/status/429", timeout=10)
if r.status_code == 429:
    wait = int(r.headers.get("Retry-After", "5"))
    print("wait", wait)
    time.sleep(wait)`,
          output: `wait 5`,
          tip: `优先读 [[Retry-After]]；没有就指数退避，别固定 0.1 秒硬撞。`
        },
        {
          h: "缓存：ETag、Last-Modified 与本地存储",
          p: `HTTP 缓存用 [[ETag]]/[[If-None-Match]] 和 [[Last-Modified]]/[[If-Modified-Since]]，服务端返回 304 时不用重传体。适合不常变的数据。

本地缓存可以按 URL 哈希存原始 JSON，记录时间/ETag；下次先发条件请求或直接读缓存（按业务容忍度）。缓存要能失效，不能永远返回旧数据。

不要把缓存和业务数据混在一个文件；缓存目录可删、可重建，业务数据要备份。`,
          code: String.raw`import requests

headers = {"If-None-Match": '"abc123"'}
r = requests.get("https://httpbin.org/etag/abc123", headers=headers, timeout=10)
print(r.status_code)
if r.status_code == 304:
    print("use cache")`,
          output: `304
use cache`,
          tip: `304 表示缓存仍有效；本地缓存按 URL/ETag 存，目录可删可重建。`
        },
        {
          h: "增量同步：用时间/游标而不是全量重拉",
          p: `全量重拉在数据量大时既慢又容易被限流。API 通常支持 [[since]]/[[updated_after]] 或增量游标；本地记录最后同步时间/ID，下次只拉新增。

时间戳有边界问题：时区、服务端延迟、同一秒多条。用「时间 + ID」复合游标更稳；没有游标就多拉一点重叠窗口，再按主键去重。

增量同步要幂等：同一条记录重复写入不产生重复行。数据库用唯一键 + upsert，文件用主键去重。`,
          code: String.raw`from datetime import datetime, timezone

last = "2026-11-23T00:00:00Z"
now = datetime.now(timezone.utc).isoformat()
print({"since": last, "until": now})`,
          output: `{'since': '2026-11-23T00:00:00Z', 'until': '2026-11-24T...'}`,
          tip: `增量用复合游标/重叠窗口；写入要幂等，重复拉取不能产生重复行。`
        },
        {
          h: "错误契约：区分可重试与不可重试",
          p: `API 错误体常含 code/message/details。不要只记录 HTTP 状态，要记录业务 code；同样的 400 可能是参数错、配额错、权限错。

封装异常：[[ApiError(status, code, message, retryable)]]；调用方按 [[retryable]] 决定重试。不要把所有异常都包成 RuntimeError。

日志记录请求 id/URL/状态/业务 code，不记录 token 和完整个人数据。`,
          code: String.raw`class ApiError(Exception):
    def __init__(self, status, code, message, retryable=False):
        super().__init__(f"{status} {code}: {message}")
        self.status = status
        self.code = code
        self.retryable = retryable

err = ApiError(429, "rate_limited", "slow down", retryable=True)
print(err, err.retryable)`,
          output: `429 rate_limited: slow down True`,
          tip: `异常带 status/code/retryable；调用方按 retryable 决定，不靠猜状态码。`
        },
        {
          h: "动手实验：抓取一个分页 API 并落盘",
          p: `用 httpbin 或公开 API 模拟分页，写 [[fetch_all()]]：读 cursor、限速、重试、缓存每页、输出 JSONL。要求：中断后能从最后 cursor 续跑；重复运行不重复写。

验收：3 页数据总数正确；429 时等待；坏 JSON 页记录错误但不丢前面页。`,
          code: String.raw`import json, time
from pathlib import Path

pages = [
    {"items": [{"id": 1}], "next_cursor": "c2"},
    {"items": [{"id": 2}], "next_cursor": None},
]
out = Path("items.jsonl")
with out.open("w", encoding="utf-8") as f:
    for page in pages:
        for item in page["items"]:
            f.write(json.dumps(item) + "\n")
        time.sleep(0.2)
print(out.read_text())`,
          output: `{"id": 1}
{"id": 2}`,
          tip: `每页落盘/记录 cursor，中断可续；重复运行按 id 去重。`
        }
      ],
      points: [
        "分页有 offset/page/cursor，cursor 更稳。",
        "终止条件要明确，别只靠返回数量。",
        "限流读 Retry-After，缓存已拉数据。",
        "增量同步用复合游标，写入要幂等。",
        "异常带 status/code/retryable，调用方按契约处理。"
      ],
      practice: "写 `fetch_all()` 抓 3 页分页 API：限速、重试、每页落盘、支持 cursor 续跑；重复运行按 id 去重。"
    },
    {
      id: "ch14-3",
      title: "14.3 HTML 解析与抓取边界",
      minutes: 45,
      lead: "网页不是 API：结构会变、编码会乱、反爬会拦。这一节用 BeautifulSoup/lxml 提取数据，讲选择器、容错、robots、版权和抓取礼仪。",
      source: "Introducing Python 3rd · Ch.22、24；Beginning Python 4th · Ch.15；Head First Python 3rd · Ch.8–9",
      sections: [
        {
          h: "先看 robots 与条款，再写爬虫",
          p: `抓取前检查 [[/robots.txt]]、网站条款、数据版权。robots 是爬虫协议，不是法律，但违反可能被封/追责；个人数据、付费内容、明确禁止抓取的站点不要碰。

公开 API 优先于爬网页；网页结构随时变，API 更稳定。抓取只取必要字段，不复制整站内容；存储/发布要遵守版权。

设置可识别的 [[User-Agent]] 和联系方式，控制频率；不要伪装浏览器绕过封锁。`,
          code: String.raw`import requests

r = requests.get("https://example.com/robots.txt", timeout=10)
print(r.status_code)
print(r.text[:200])`,
          output: `200
User-agent: *
Disallow: /private/`,
          tip: `先读 robots/条款；优先 API，只取必要字段，别复制整站内容。`
        },
        {
          h: "HTML 解析器：BeautifulSoup 与 lxml",
          p: `[[BeautifulSoup(html, "html.parser")]] 是标准库解析器，容错好但慢；[[lxml]] 快，需安装。CSS 选择器用 [[select]]/[[select_one]]；属性用 [[.get]]，文本用 [[.get_text(strip=True)]]。

不要用正则解析 HTML；嵌套、属性顺序、实体转义会让正则失控。解析器能处理不完整标签。

解析要容错：字段缺失返回 None 并记录，不要 [[[0]]] 直接取；页面结构变化时，失败要可观察。`,
          code: String.raw`from bs4 import BeautifulSoup

html = '<div class="row"><span class="name">林晓</span><span class="score">91</span></div>'
soup = BeautifulSoup(html, "html.parser")
row = soup.select_one(".row")
print(row.select_one(".name").get_text(strip=True))
print(row.select_one(".score").get_text(strip=True))`,
          output: `林晓
91`,
          tip: `用 CSS 选择器 + [[get_text(strip=True)]]；不要用正则解析 HTML。`
        },
        {
          h: "表格/列表提取：先定位容器再逐行",
          p: `抓列表时先找「行容器」，再在每行里找字段；不要从全文档直接找第一个 [[.score]]，否则会串行。表格用 [[find_all("tr")]]，跳过表头，按列名/位置取值。

分页网页要处理「下一页」链接和相对 URL；用 [[urljoin(base, href)]] 拼绝对地址。详情页可能需要二次请求，控制并发和缓存。

提取后统一清洗：去空白、全角转半角、数字转 float、日期转 date；坏行记录来源 URL。`,
          code: String.raw`from bs4 import BeautifulSoup
from urllib.parse import urljoin

html = '<ul><li><a href="/r/1">林晓</a><b>91</b></li><li><a href="/r/2">周宁</a><b>86</b></li></ul>'
soup = BeautifulSoup(html, "html.parser")
base = "https://example.com"
for li in soup.select("li"):
    name = li.a.get_text(strip=True)
    score = float(li.b.get_text(strip=True))
    url = urljoin(base, li.a["href"])
    print(name, score, url)`,
          output: `林晓 91.0 https://example.com/r/1
周宁 86.0 https://example.com/r/2`,
          tip: `先定位行容器再取字段；相对链接用 [[urljoin]]，不要手拼字符串。`
        },
        {
          h: "反爬与限速：不要把自己变成攻击流量",
          p: `常见反爬：403、验证码、IP 封禁、返回假数据。不要试图绕过验证码/付费墙；遇到 403 先停下来检查条款和频率。

合理做法：降并发、加延迟、用缓存、遵守 [[Retry-After]]、使用官方 API/导出。需要大量数据时，联系数据方获取授权/批量接口。

抓取任务要可暂停/可恢复，记录失败 URL；不要因为一个 403 就无限重试。`,
          code: String.raw`import time

for page in range(1, 6):
    print("fetch page", page)
    time.sleep(1.2)  # 限速示例：每分钟不超过 50 次`,
          output: `fetch page 1
fetch page 2
...`,
          tip: `403/验证码不是要「绕过」，而是降速/换 API/申请授权；失败 URL 要记录。`
        },
        {
          h: "结构化输出：原始页 + 解析结果都留",
          p: `抓取任务要保留原始响应（或哈希/URL/时间），解析失败可重放；解析结果单独存 JSONL/CSV。不要把原始 HTML 和业务数据混在一个文件。

每条记录带来源 URL、抓取时间、页面哈希；重复抓取用哈希去重。数据版本变化时能追溯「这条来自哪一版页面」。

发布抓取数据前脱敏：去掉个人信息、token、内部链接；遵守版权/数据库权利。`,
          code: String.raw`import hashlib, json

html = "<div>林晓 91</div>"
record = {
    "url": "https://example.com/r/1",
    "sha256": hashlib.sha256(html.encode()).hexdigest()[:12],
    "name": "林晓",
    "score": 91,
}
print(json.dumps(record, ensure_ascii=False))`,
          output: `{"url": "https://example.com/r/1", "sha256": "7d...", "name": "林晓", "score": 91}`,
          tip: `保留原始页/哈希/URL，解析失败可重放；发布前脱敏并检查版权。`
        },
        {
          h: "动手实验：抓一个公开榜单页",
          p: `选一个允许抓取的公开榜单，抓前 2 页：解析行、翻页、限速、保存原始 HTML 哈希和 JSONL。要求：页面缺字段不崩；重复运行按 URL 去重；输出前 10 条。

验收：记录来源 URL/时间/哈希；403/429 时停止并报告，不无限重试。`,
          code: String.raw`from bs4 import BeautifulSoup
import json, hashlib

html = '<table><tr><th>name</th><th>score</th></tr><tr><td>林晓</td><td>91</td></tr></table>'
soup = BeautifulSoup(html, "html.parser")
rows = []
for tr in soup.select("tr")[1:]:
    cells = [c.get_text(strip=True) for c in tr.select("td")]
    if len(cells) == 2:
        rows.append({"name": cells[0], "score": float(cells[1])})
print(json.dumps(rows, ensure_ascii=False))`,
          output: `[{"name": "林晓", "score": 91.0}]`,
          tip: `缺字段/少列就跳过并记录；不要用固定下标硬取导致 IndexError。`
        }
      ],
      points: [
        "先读 robots/条款，优先 API，只取必要字段。",
        "用 HTML 解析器/CSS 选择器，不要正则解析 HTML。",
        "先定位行容器再取字段；相对 URL 用 urljoin。",
        "403/验证码不要绕过，降速/申请授权。",
        "保留原始页/哈希/URL，发布前脱敏。"
      ],
      practice: "抓一个允许抓取的公开榜单前 2 页：解析行、翻页、限速、保存原始哈希和 JSONL；重复运行按 URL 去重。"
    }
  ]
});
