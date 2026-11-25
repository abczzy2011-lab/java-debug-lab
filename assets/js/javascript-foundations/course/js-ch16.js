window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch16",
  "part": 4,
  "number": "16",
  "title": "浏览器存储与网络",
  "summary": "页面状态要存在哪里：内存、localStorage、IndexedDB、Cookie 还是 Cache？网络请求又该如何处理跨域、超时和取消？本章把「存」和「取」两条链路拆开。",
  "goals": [
    "按生命周期和容量选择存储",
    "知道 Cookie 与 localStorage 的安全边界",
    "用 IndexedDB 存结构化数据",
    "用 fetch + AbortController 控制请求"
  ],
  "source": "JavaScript 高级程序设计 4th · Ch.24–25；JavaScript 权威指南 7th · Ch.15；Learning JavaScript 3rd · Ch.10；Eloquent JavaScript 4th · Ch.11",
  "lessons": [
    {
      "id": "ch16-1",
      "title": "localStorage 与页面状态",
      "minutes": 22,
      "lead": "localStorage 只能存字符串，容量有限，且同步阻塞。它适合保存主题、草稿、上次位置这类轻量状态，不适合存大列表和敏感信息。",
      "sections": [
        {
          "h": "读写要包在 try/catch 里",
          "p": "隐私模式、存储配额、被禁用都可能让 `localStorage` 抛错。读取时用 `getItem` 返回 `null` 判断是否存在；写入对象前 `JSON.stringify`，读取后 `JSON.parse` 也要处理损坏数据。删除用 `removeItem`，清空用 `clear`，但 `clear` 会清掉同源所有键。",
          "code": "try {\n  localStorage.setItem(\"theme\", \"dark\");\n  console.log(localStorage.getItem(\"theme\"));\n  const state = JSON.parse(localStorage.getItem(\"state\") || \"{}\");\n  console.log(state.count ?? 0);\n  localStorage.removeItem(\"theme\");\n} catch (err) {\n  console.warn(\"localStorage 不可用\", err.name);\n}",
          "output": "dark\n0",
          "tip": "不要存 token、密码、身份证等敏感信息。需要跨标签同步时监听 `storage` 事件；它只在其他标签页触发，当前页不会收到。"
        },
        {
          "h": "版本化你的存储键",
          "p": "数据结构会变，旧版本数据可能让新代码崩溃。键名带版本，例如 `app.state.v2`；读取时校验字段，迁移失败就回退默认值并清理旧键。写入不要太频繁，输入框每敲一个字就 `JSON.stringify` 整个大对象会卡。",
          "code": "const KEY = \"jsDemo.state.v1\";\nfunction saveState(state) {\n  localStorage.setItem(KEY, JSON.stringify(state));\n}\nfunction loadState() {\n  try {\n    const raw = JSON.parse(localStorage.getItem(KEY) || \"null\");\n    return raw && typeof raw === \"object\" ? raw : {};\n  } catch (err) {\n    localStorage.removeItem(KEY);\n    return {};\n  }\n}\nsaveState({ page: 2 });\nconsole.log(loadState());",
          "output": "{ page: 2 }",
          "tip": "写入前先做防抖；读取失败要能回退默认状态。永远不要假设 localStorage 里的数据一定合法。"
        }
      ],
      "points": [
        "localStorage 只存字符串，读写都可能抛错。",
        "存对象要 `JSON.stringify`，读后校验结构。",
        "键名带版本，敏感信息不要存。"
      ],
      "practice": "实现 `saveState` / `loadState`，保存 `{ theme, page }`；手动把存储值改成非法 JSON，验证读取后能清理并回退默认对象。",
      "source": "JavaScript 高级程序设计 4th · Ch.25；JavaScript 权威指南 7th · Ch.15；Head First JavaScript Programming 2nd · Ch.9"
    },
    {
      "id": "ch16-2",
      "title": "Cookie、IndexedDB 与缓存策略",
      "minutes": 33,
      "lead": "localStorage 简单但同步、容量小、只能存字符串；IndexedDB 异步、容量大、能存结构化数据；Cookie 会自动随请求发送，适合会话标识，不适合存大量数据。",
      "sections": [
        {
          "h": "Cookie 与 localStorage 的边界",
          "p": "Cookie 有域名、路径、过期时间、SameSite 和 HttpOnly 等属性；HttpOnly 的 Cookie 前端读不到，适合会话。localStorage 不会自动发送，容易被 XSS 读取，不适合存 token 或敏感信息。\n\n容量不是唯一标准：安全、同步阻塞、跨域携带都要一起考虑。",
          "code": "document.cookie = \"theme=dark; path=/; max-age=31536000; SameSite=Lax\";\nlocalStorage.setItem(\"theme\", \"dark\");\nconsole.log(document.cookie);\nconsole.log(localStorage.getItem(\"theme\"));",
          "output": "theme=dark\n主题值 dark",
          "tip": "会话标识用 HttpOnly Cookie；localStorage 不要存敏感 token。"
        },
        {
          "h": "IndexedDB 的异步模型",
          "p": "IndexedDB 用事务和对象仓库存数据，所有操作异步。打开数据库、创建对象仓库、读写都在 `onsuccess/onerror` 或 Promise 包装里完成。\n\n它适合大量结构化数据和离线缓存；简单键值对用 localStorage 更轻，别为了「高级」上 IndexedDB。",
          "code": "const req = indexedDB.open(\"app\", 1);\nreq.onupgradeneeded = () => {\n  req.result.createObjectStore(\"notes\", { keyPath: \"id\" });\n};\nreq.onsuccess = () => {\n  const db = req.result;\n  const tx = db.transaction(\"notes\", \"readwrite\");\n  tx.objectStore(\"notes\").put({ id: 1, text: \"hello\" });\n};",
          "output": "数据库 app 创建 notes 仓库\n写入 id=1 的记录",
          "tip": "IndexedDB 异步、事务式；简单数据不要过度设计。"
        },
        {
          "h": "Cache API 与缓存策略",
          "p": "Cache API 存 Request/Response，适合离线资源和 Service Worker。常见策略：缓存优先、网络优先、 stale-while-revalidate。缓存要设版本和清理，避免旧资源永远命中。\n\n不要缓存带用户隐私的响应；跨域响应需要 CORS 允许。",
          "code": "const cache = await caches.open(\"v1\");\nawait cache.add(\"/app.css\");\nconst hit = await cache.match(\"/app.css\");\nconsole.log(!!hit);",
          "output": "true",
          "tip": "Cache API 存响应，不存任意对象；要有版本和清理策略。"
        }
      ],
      "points": [
        "Cookie 自动随请求发送，HttpOnly 适合会话。",
        "localStorage 同步且可被 XSS 读取，不存敏感数据。",
        "IndexedDB 异步大容量；Cache API 存响应。"
      ],
      "practice": "做一个「离线笔记」原型：主题偏好放 localStorage，笔记正文放 IndexedDB，静态资源用 Cache API；分别测试刷新、断网和版本升级。",
      "source": "JavaScript 高级程序设计 4th · Ch.25；JavaScript 权威指南 7th · Ch.15；Learning JavaScript 3rd · Ch.10"
    },
    {
      "id": "ch16-3",
      "title": "fetch、CORS 与 AbortController",
      "minutes": 33,
      "lead": "`fetch` 只在网络层失败时 reject；HTTP 404/500 仍然 resolve。跨域请求受 CORS 约束，预检、凭据和响应头都要服务端配合。取消请求用 AbortController，不要靠布尔标志。",
      "sections": [
        {
          "h": "fetch 的状态码与错误",
          "p": "`fetch` 返回的 Promise 在收到响应头时 resolve，即使状态是 404。必须检查 `response.ok` 或 `status`；只有网络错误、DNS、CORS 失败等才 reject。\n\n解析响应前先看 `content-type`；JSON 用 `response.json()`，文本用 `text()`，流式用 `body`。",
          "code": "const res = await fetch(\"/api/user\");\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconst type = res.headers.get(\"content-type\");\nconst data = type?.includes(\"application/json\") ? await res.json() : await res.text();\nconsole.log(data);",
          "output": "200：用户 JSON\n404：抛出 HTTP 404",
          "tip": "fetch 不会因 404 reject；必须检查 response.ok。"
        },
        {
          "h": "CORS 与凭据",
          "p": "跨域请求默认不带 Cookie；需要 `credentials: \"include\"`，同时服务端必须返回明确的 `Access-Control-Allow-Origin`（不能是 *）和 `Access-Control-Allow-Credentials: true`。\n\n非简单请求会先发 OPTIONS 预检；自定义头、PUT/DELETE 等都可能触发。CORS 是浏览器安全策略，不是服务端认证。",
          "code": "const res = await fetch(\"https://api.example.com/me\", {\n  credentials: \"include\",\n  headers: { \"Content-Type\": \"application/json\" }\n});\nconsole.log(res.status);",
          "output": "200（服务端允许 origin 且带凭据）\n或 CORS 错误（配置不匹配）",
          "tip": "带 Cookie 跨域需要 credentials 和服务端精确 Allow-Origin；不要用 *。"
        },
        {
          "h": "AbortController 与超时",
          "p": "`AbortController.signal` 传给 fetch；调用 `abort()` 会让请求以 AbortError 拒绝。超时可以用 `AbortSignal.timeout(ms)` 或手动 setTimeout。\n\n取消后要清理定时器和 loading 状态；不要把 AbortError 当成业务错误提示给用户。",
          "code": "const controller = new AbortController();\nconst timer = setTimeout(() => controller.abort(), 3000);\ntry {\n  const res = await fetch(\"/api/slow\", { signal: controller.signal });\n  console.log(await res.json());\n} catch (e) {\n  if (e.name === \"AbortError\") console.log(\"已取消/超时\");\n} finally { clearTimeout(timer); }",
          "output": "成功：JSON\n超时：已取消/超时",
          "tip": "取消请求用 AbortController；AbortError 要和业务失败分开。"
        }
      ],
      "points": [
        "fetch 对 404/500 仍 resolve，要检查 response.ok。",
        "跨域带凭据需要 credentials 和精确 CORS 头。",
        "取消用 AbortController，清理定时器和 loading。"
      ],
      "practice": "写一个 `fetchJSON(url, { timeout, signal })`，统一处理状态码、content-type、超时和取消；再用 AbortController 取消一个慢请求，确认不会更新已卸载的页面。",
      "source": "JavaScript 高级程序设计 4th · Ch.24；JavaScript 权威指南 7th · Ch.15；Learning JavaScript 3rd · Ch.10"
    }
  ]
});
