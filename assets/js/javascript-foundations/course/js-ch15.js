window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch15",
  "part": 4,
  "number": "15",
  "title": "事件、表单与用户输入",
  "summary": "事件是浏览器和用户之间的消息。冒泡、捕获、委托、默认行为和事件对象决定你能不能只写一个监听器处理一整张列表；表单则把输入、校验和提交串成一条链。",
  "goals": [
    "解释捕获、目标、冒泡三个阶段",
    "用事件委托处理动态列表",
    "正确阻止默认行为和冒泡",
    "处理表单校验、提交与输入事件"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.9；JavaScript 高级程序设计 4th · Ch.17；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.13",
  "lessons": [
    {
      "id": "ch15-1",
      "title": "事件冒泡、委托与解绑",
      "minutes": 26,
      "lead": "事件从目标元素向上冒泡，所以可以在父元素统一监听，再判断真正触发的是谁。这叫事件委托，特别适合动态增删的列表。",
      "sections": [
        {
          "h": "target 与 currentTarget",
          "p": "`event.target` 是实际触发的元素，`event.currentTarget` 是当前绑定监听器的元素。事件委托里用 `target.closest(\"button[data-id]\")` 找到最近的按钮，再读 `dataset.id`。`preventDefault` 阻止浏览器默认行为，`stopPropagation` 阻止继续冒泡；后者滥用会让外层监听失效。",
          "code": "const list = document.querySelector(\"#list\");\nlist.addEventListener(\"click\", (event) => {\n  const btn = event.target.closest(\"button[data-id]\");\n  if (!btn) return;\n  console.log(\"删除\", btn.dataset.id);\n});",
          "output": "删除 3",
          "tip": "委托监听要确认事件确实冒泡。`focus`、`blur` 不冒泡，用 `focusin` / `focusout`；需要捕获阶段时给 `addEventListener` 第三参传 `true`。"
        },
        {
          "h": "解绑要拿到同一个函数引用",
          "p": "`removeEventListener` 必须传入与绑定时相同的函数引用、相同捕获标志，匿名函数解绑不了。一次性事件用 `{ once: true }`；滚动、触摸等高频事件用 `{ passive: true }` 提升性能。组件卸载时要清理定时器、监听器和请求，避免内存泄漏。",
          "code": "function onClick() { console.log(\"点击一次\"); }\nconst button = document.querySelector(\"#save\");\nbutton.addEventListener(\"click\", onClick, { once: true });\n\nconst controller = new AbortController();\nwindow.addEventListener(\"resize\", () => console.log(\"resize\"), { signal: controller.signal });\ncontroller.abort();",
          "output": "点击一次",
          "tip": "`AbortController` 可以一次性移除同一信号上的多个监听器，适合组件销毁。不要在每个组件里手动记一堆解绑调用。"
        }
      ],
      "points": [
        "`target` 是触发元素，`currentTarget` 是监听元素。",
        "委托用 `closest` 找到目标，再读 `dataset`。",
        "解绑必须传同一个函数引用。"
      ],
      "practice": "给一个动态列表做删除按钮委托：点击任意按钮打印对应 id；再给保存按钮绑定只执行一次的监听器。",
      "source": "Head First JavaScript Programming 2nd · Ch.9；JavaScript 高级程序设计 4th · Ch.17；Secrets of the JavaScript Ninja 2nd · Ch.13"
    },
    {
      "id": "ch15-2",
      "title": "表单、校验与用户输入",
      "minutes": 24,
      "lead": "表单提交先 `preventDefault`，再用 `FormData` 或元素值读取数据。校验要同时做前端提示和后端约束，前端校验只是体验，不是安全边界。",
      "sections": [
        {
          "h": "FormData 与提交事件",
          "p": "`new FormData(form)` 会收集带 `name` 的表单控件；`Object.fromEntries(data)` 可以快速转成普通对象，但同名多选会只保留最后一个。多选、文件要用 `getAll` 或单独处理。提交前检查 `form.checkValidity()`，自定义规则用 `setCustomValidity` 或自己的错误对象。",
          "code": "const form = document.querySelector(\"#signup\");\nform.addEventListener(\"submit\", (event) => {\n  event.preventDefault();\n  const data = new FormData(form);\n  console.log(Object.fromEntries(data));\n});",
          "output": "{ name: 'Ada', email: 'ada@example.com' }",
          "tip": "`FormData` 只收集有 `name` 的控件；禁用的控件不会提交。文件字段拿到的是 `File`，不是路径字符串。"
        },
        {
          "h": "输入值都是字符串",
          "p": "`input.value` 永远是字符串，数字要显式转换并检查 `Number.isFinite`。复选框用 `checked`，多选用 `selectedOptions`。输入事件 `input` 在每次键入时触发，`change` 在失焦或确认后触发；搜索建议通常用 `input` 加防抖。",
          "code": "const ageInput = document.querySelector(\"#age\");\nconst age = Number(ageInput.value);\nif (!Number.isFinite(age) || age < 0) {\n  console.log(\"年龄必须是非负数字\");\n} else {\n  console.log(\"年龄\", age);\n}\n\nconst agree = document.querySelector(\"#agree\");\nconsole.log(agree.checked);",
          "output": "年龄 18\ntrue",
          "tip": "`parseInt(\"12px\")` 会得到 12，`Number(\"12px\")` 得到 `NaN`。需要严格校验时用 `Number`，不要用 `parseInt` 容忍脏输入。"
        }
      ],
      "points": [
        "提交前 `preventDefault`，用 `FormData` 读取。",
        "前端校验不是安全边界。",
        "输入值都是字符串，数字要显式转换。"
      ],
      "practice": "写一个注册表单提交处理：读取姓名、邮箱、年龄，年龄非法时显示错误，合法时打印整理后的对象。",
      "source": "Head First JavaScript Programming 2nd · Ch.7；JavaScript 高级程序设计 4th · Ch.19；JavaScript 权威指南 7th · Ch.15"
    },
    {
      "id": "ch15-3",
      "title": "键盘、指针、拖拽与事件性能",
      "minutes": 32,
      "lead": "现代浏览器把鼠标、触摸和手写笔统一到 Pointer Events。键盘事件则要区分 `key` 与 `code`；拖拽和滚动监听如果不加节流，很容易把主线程拖慢。",
      "sections": [
        {
          "h": "keydown、keyup 与 key/code",
          "p": "`event.key` 是字符值（\"a\"、\"Enter\"），受键盘布局和 Shift 影响；`event.code` 是物理键位（\"KeyA\"、\"Enter\"），适合游戏快捷键。输入框内容用 `input` 事件监听，不要只靠 keydown。\n\n`keypress` 已不推荐；组合键检查 `ctrlKey/metaKey/altKey/shiftKey`。",
          "code": "document.addEventListener(\"keydown\", e => {\n  if ((e.metaKey || e.ctrlKey) && e.key === \"k\") {\n    e.preventDefault();\n    console.log(\"open command palette\");\n  }\n});",
          "output": "按下 Cmd/Ctrl+K：open command palette",
          "tip": "字符用 key，物理键位用 code；组合键检查修饰键。"
        },
        {
          "h": "Pointer Events 与拖拽",
          "p": "Pointer Events 统一鼠标、触摸、笔：`pointerdown/move/up`，配合 `setPointerCapture` 让指针移出元素后仍能收到事件。拖拽时用 transform 更新位置，避免频繁改 left/top。\n\n移动端要处理触摸滚动与拖拽冲突；必要时 `touch-action: none`，但会影响页面滚动。",
          "code": "const handle = document.querySelector(\"#handle\");\nhandle.addEventListener(\"pointerdown\", e => {\n  handle.setPointerCapture(e.pointerId);\n  handle.addEventListener(\"pointermove\", move);\n});\nfunction move(e) {\n  handle.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;\n}",
          "output": "拖动 handle 时跟随指针移动",
          "tip": "setPointerCapture 保证指针移出元素仍收到事件；拖拽用 transform。"
        },
        {
          "h": "滚动、resize 与 passive",
          "p": "scroll 和 resize 触发频繁；不要在每个事件里做重计算。用 `requestAnimationFrame` 合并到下一帧，或节流到固定间隔。`{ passive: true }` 告诉浏览器监听器不会 preventDefault，能改善滚动性能。\n\n不要用 scroll 事件做复杂的 DOM 布局读取；先缓存尺寸，必要时用 IntersectionObserver。",
          "code": "let ticking = false;\nwindow.addEventListener(\"scroll\", () => {\n  if (ticking) return;\n  ticking = true;\n  requestAnimationFrame(() => {\n    console.log(window.scrollY);\n    ticking = false;\n  });\n}, { passive: true });",
          "output": "滚动时每帧最多打印一次 scrollY",
          "tip": "scroll/resize 用 rAF 或节流；不会 preventDefault 时加 passive。"
        }
      ],
      "points": [
        "key 是字符，code 是物理键位。",
        "Pointer Events 统一输入设备，setPointerCapture 保证拖拽连续。",
        "scroll/resize 要合并到帧，passive 改善滚动。"
      ],
      "practice": "写一个可拖拽卡片，要求鼠标和触摸都能拖，指针移出卡片仍能继续；再给滚动监听加 rAF 合并，比较回调次数。",
      "source": "JavaScript 高级程序设计 4th · Ch.17–18；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.13"
    }
  ]
});
