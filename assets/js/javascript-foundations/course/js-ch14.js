window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch14",
  "part": 4,
  "number": "14",
  "title": "DOM：把页面变成可操作的数据",
  "summary": "DOM 不是 HTML 字符串，而是一棵节点树。选择、创建、插入、修改样式和批量更新都要围绕这棵树；但每次读写布局都可能触发重排，性能和可维护性要一起考虑。",
  "goals": [
    "用 querySelector、createElement、append 操作 DOM",
    "用 template 和 DocumentFragment 批量构建",
    "识别布局抖动并合并读写",
    "写出语义化、可聚焦、可访问的 DOM"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.6、8；JavaScript 高级程序设计 4th · Ch.14–15；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.12",
  "lessons": [
    {
      "id": "ch14-1",
      "title": "选择、创建与修改 DOM",
      "minutes": 24,
      "lead": "DOM 操作的核心是“先拿到节点，再改它的属性、文本或结构”。优先用 `textContent`，少用 `innerHTML`，避免把用户输入当 HTML 执行。",
      "sections": [
        {
          "h": "querySelector 与 createElement",
          "p": "`querySelector` 返回第一个匹配元素，`querySelectorAll` 返回静态 NodeList（不会随 DOM 变化自动更新）。创建节点用 `document.createElement`，设置文本用 `textContent`，插入用 `append` / `prepend` / `before` / `after`。批量插入先用 `DocumentFragment` 组装，再一次性挂到页面，减少重排。",
          "code": "const list = document.querySelector(\"#list\");\nconst item = document.createElement(\"li\");\nitem.textContent = \"新任务\";\nitem.className = \"task\";\nlist.append(item);\nconsole.log(list.children.length); // 假设原本有 1 个 li",
          "output": "2",
          "tip": "`innerHTML` 会重新解析整段 HTML，既慢又有 XSS 风险。只有完全可信的静态模板才考虑它；用户输入一律 `textContent`。"
        },
        {
          "h": "classList 与 dataset",
          "p": "`classList.add/remove/toggle/contains` 比直接拼 `className` 更安全，不会把其他类名覆盖掉。`dataset` 读写 `data-*` 属性，适合在节点上挂小段业务标识。复杂状态不要全塞进 DOM 属性，仍应放在 JavaScript 状态里，DOM 只做展示。",
          "code": "const card = document.querySelector(\".card\");\ncard.classList.add(\"is-active\");\ncard.classList.toggle(\"is-hidden\");\ncard.dataset.id = \"42\";\nconsole.log(card.classList.contains(\"is-active\"));\nconsole.log(card.dataset.id);",
          "output": "true\n42",
          "tip": "`dataset` 的值永远是字符串。存数字要显式 `Number(...)`；存对象要 `JSON.stringify`，读的时候再解析并处理失败。"
        }
      ],
      "points": [
        "`querySelectorAll` 返回静态列表。",
        "用户输入用 `textContent`，不要拼 `innerHTML`。",
        "`classList` 比改 `className` 安全，`dataset` 值都是字符串。"
      ],
      "practice": "用 `createElement` 和 `DocumentFragment` 一次性插入 10 个列表项，每项带 `data-id` 和不同文本；再切换其中一项的 `is-active` 类。",
      "source": "Head First JavaScript Programming 2nd · Ch.6；JavaScript 高级程序设计 4th · Ch.14；JavaScript 权威指南 7th · Ch.15"
    },
    {
      "id": "ch14-2",
      "title": "节点遍历、模板与批量更新",
      "minutes": 31,
      "lead": "直接拼 HTML 字符串再 `innerHTML` 很快，但容易产生 XSS、丢失事件和整棵子树重建。`template` 和 `DocumentFragment` 让你先离屏构建，再一次性插入。",
      "sections": [
        {
          "h": "节点关系与遍历",
          "p": "`parentNode`、`children`、`firstElementChild`、`nextElementSibling` 只走元素节点；`childNodes` 包含文本和注释。遍历时优先用元素 API，避免把空白文本当成节点。\n\n`querySelectorAll` 返回静态 NodeList，不会随 DOM 变化自动更新；需要实时集合时用 `getElementsBy*`，但现代代码更常用一次性选择。",
          "code": "const list = document.querySelector(\"#list\");\nconsole.log(list.children.length);\nconsole.log(list.firstElementChild.textContent);\nconst items = list.querySelectorAll(\"li\");\nconsole.log(items.length);",
          "output": "3\n第一项\n3",
          "tip": "`childNodes` 含文本节点；`children` 只含元素。querySelectorAll 是静态集合。"
        },
        {
          "h": "template 与 DocumentFragment",
          "p": "`<template>` 内容不会渲染，`content` 是一个 DocumentFragment；克隆后填入数据再插入。DocumentFragment 可以承载多个节点，插入时只触发一次 DOM 变更。\n\n不要每次循环都 append 到真实 DOM；先在 fragment 里组装，最后一次性 append。",
          "code": "<template id=\"row-tpl\">\n  <li class=\"row\"><span class=\"name\"></span></li>\n</template>\n<script>\n  const tpl = document.querySelector(\"#row-tpl\");\n  const frag = document.createDocumentFragment();\n  [\"Ada\", \"Grace\"].forEach(name => {\n    const row = tpl.content.cloneNode(true);\n    row.querySelector(\".name\").textContent = name;\n    frag.append(row);\n  });\n  document.querySelector(\"#list\").append(frag);\n</script>",
          "output": "列表中出现两行：Ada / Grace",
          "tip": "template.content 是离屏片段；cloneNode(true) 深克隆，最后一次性插入。"
        },
        {
          "h": "textContent 与 innerHTML 的边界",
          "p": "`textContent` 按纯文本写入，不会解析标签，是用户输入的安全选择；`innerHTML` 会解析 HTML，可能执行脚本或插入恶意标签。需要富文本时先净化，不要直接把用户输入拼进 innerHTML。\n\n`insertAdjacentHTML` 同样解析 HTML；`insertAdjacentText` 才是纯文本。",
          "code": "const input = \"<img src=x onerror=alert(1)>\";\nconst box = document.querySelector(\"#box\");\nbox.textContent = input;\nconsole.log(box.textContent);\n// box.innerHTML = input; // 不要对用户输入这样做",
          "output": "页面上显示字面文本 <img ...>\n不会创建 img 元素",
          "tip": "用户输入一律 textContent；必须用 innerHTML 时先做白名单净化。"
        }
      ],
      "points": [
        "元素遍历用 children/nextElementSibling，不用 childNodes。",
        "template + fragment 批量构建，减少 DOM 变更。",
        "用户输入用 textContent，innerHTML 有 XSS 风险。"
      ],
      "practice": "用 template 和 DocumentFragment 构建一个 20 行列表，比较逐行 append 与一次性 append 的耗时；再把用户输入分别用 textContent 和 innerHTML 渲染，观察差异。",
      "source": "Head First JavaScript Programming 2nd · Ch.6、8；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.12"
    },
    {
      "id": "ch14-3",
      "title": "样式、布局抖动与性能",
      "minutes": 32,
      "lead": "读取 `offsetHeight`、`getBoundingClientRect`、`scrollTop` 会迫使浏览器计算布局；如果读和写交替进行，就会形成布局抖动。把读操作集中在一起，再统一写，是 DOM 性能的第一步。",
      "sections": [
        {
          "h": "style 与 classList 的选择",
          "p": "单个动态值用 `style.setProperty` 或 `element.style`；一组状态用 `classList.add/remove/toggle`。直接改 style 会留下内联样式，难以覆盖和复用；样式尽量放 CSS 类。\n\n`classList.toggle(name, force)` 可以强制添加/移除，避免自己写 if。",
          "code": "const box = document.querySelector(\"#box\");\nbox.classList.add(\"active\");\nbox.classList.toggle(\"hidden\", true);\nbox.style.setProperty(\"--progress\", \"40%\");\nconsole.log(box.className);",
          "output": "box active hidden",
          "tip": "状态用 class，单个变量用 style；不要把所有样式都写成内联。"
        },
        {
          "h": "布局抖动：先读后写",
          "p": "下面这种循环最伤性能：读 `offsetWidth`、写 `style.width`、再读下一个元素。每轮都让浏览器重新布局。正确做法是先收集所有读值，再统一写。\n\n`requestAnimationFrame` 把写操作放到下一帧，适合动画；但不要在 rAF 里做重计算。",
          "code": "const items = [...document.querySelectorAll(\".item\")];\nconst widths = items.map(el => el.offsetWidth);\nitems.forEach((el, i) => { el.style.width = `${widths[i] / 2}px`; });\nrequestAnimationFrame(() => document.body.classList.add(\"ready\"));",
          "output": "所有 item 宽度减半，下一帧加上 ready 类",
          "tip": "读写分离；批量修改；动画写操作放 rAF。"
        },
        {
          "h": "重排、重绘与合成",
          "p": "改宽高、位置、字体通常触发重排；改颜色、背景触发重绘；transform/opacity 可以走合成层，成本更低。`will-change` 要谨慎使用，滥用会占显存。\n\n不要用 `top/left` 做高频动画，优先 `transform: translate`；动画结束清理 will-change。",
          "code": "const card = document.querySelector(\".card\");\ncard.style.transform = \"translateX(20px)\";\ncard.style.opacity = \"0.8\";\n// 动画结束后：card.style.willChange = \"auto\";",
          "output": "卡片右移并半透明，通常不触发重排",
          "tip": "高频动画优先 transform/opacity；will-change 用完就撤。"
        }
      ],
      "points": [
        "状态用 class，变量用 style。",
        "DOM 读写分离，避免布局抖动。",
        "transform/opacity 比 top/left 更适合动画。"
      ],
      "practice": "写一个 50 个元素的列表，在循环里交替读取 offsetWidth 和修改 width，记录耗时；再改成先读后写和 rAF，比较差异。",
      "source": "JavaScript 高级程序设计 4th · Ch.14–15；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.12"
    },
    {
      "id": "ch14-4",
      "title": "无障碍、语义与可维护 DOM",
      "minutes": 32,
      "lead": "DOM 不只是给鼠标用户看的。屏幕阅读器依赖语义、标签、焦点顺序和 ARIA；一个 `div` 加 `onclick` 不是按钮。可访问性不是额外装饰，而是 DOM 设计的一部分。",
      "sections": [
        {
          "h": "语义元素优先",
          "p": "能用 `button`、`nav`、`main`、`label` 就不要用 `div` 模拟。原生元素自带键盘行为、焦点管理和辅助技术语义；自己模拟要补很多工作。\n\n标题层级按结构递进，不要为了字号跳过 h2/h3；一个页面通常只有一个 h1。",
          "code": "<label for=\"email\">邮箱</label>\n<input id=\"email\" type=\"email\" autocomplete=\"email\">\n<button type=\"submit\">订阅</button>\n<nav aria-label=\"主导航\"><a href=\"/\">首页</a></nav>",
          "output": "屏幕阅读器读出「邮箱，编辑框」\n按钮可通过 Tab/Enter 触发",
          "tip": "原生语义优先；label 的 for 要对应 input 的 id。"
        },
        {
          "h": "焦点、键盘与 ARIA",
          "p": "所有可交互元素必须能通过 Tab 到达，并有可见焦点样式。自定义组件要处理 Enter/Space、Escape、方向键和焦点陷阱；ARIA 只补语义，不替代键盘行为。\n\n`aria-hidden=\"true\"` 会把元素从辅助技术中移除，但不会阻止鼠标点击；不要用它隐藏可交互内容。",
          "code": "<div role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"title\">\n  <h2 id=\"title\">确认删除</h2>\n  <button type=\"button\">取消</button>\n  <button type=\"button\">删除</button>\n</div>",
          "output": "对话框被读作 dialog，标题为「确认删除」\n按钮可聚焦",
          "tip": "ARIA 只补语义；键盘、焦点和可见焦点样式必须自己实现。"
        },
        {
          "h": "可维护的 DOM 结构",
          "p": "把 DOM 操作集中到渲染层，业务逻辑只处理数据；不要在事件回调里到处 `querySelector`。给关键节点稳定的 id/class，避免依赖脆弱的层级选择器。\n\n组件卸载时移除监听、清定时器、释放 URL/ObjectURL 和大对象；否则 DOM 删了，闭包还活着。",
          "code": "function renderList(items) {\n  const list = document.querySelector(\"#list\");\n  list.replaceChildren(...items.map(item => {\n    const li = document.createElement(\"li\");\n    li.textContent = item.name;\n    return li;\n  }));\n}",
          "output": "列表被整体替换为新的 li 集合",
          "tip": "DOM 操作集中；卸载时清理监听和资源；选择器要稳定。"
        }
      ],
      "points": [
        "语义元素自带键盘和辅助技术行为。",
        "ARIA 只补语义，不替代键盘和焦点管理。",
        "DOM 操作集中，卸载时清理监听和资源。"
      ],
      "practice": "把一个 `div` 模拟的按钮改成原生 button，补上 label、焦点样式和键盘触发；再用屏幕阅读器或 DevTools 的 Accessibility 面板检查语义。",
      "source": "JavaScript 权威指南 7th · Ch.15；JavaScript 高级程序设计 4th · Ch.14；Head First JavaScript Programming 2nd · Ch.8"
    }
  ]
});
