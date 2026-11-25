window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch3",
  "part": 1,
  "number": "03",
  "title": "表达式、控制流与错误边界",
  "summary": "控制流不只是 if/for。短路求值、空值合并、可选链、异常捕获和提前返回，决定了代码在边界值时是清晰还是层层嵌套。本章把这些「小语法」放回真实分支里。",
  "goals": [
    "用提前返回拆掉多层嵌套",
    "分清 `||`、`??` 和可选链的适用场景",
    "知道哪些错误该捕获、哪些应该让程序失败",
    "写出带错误上下文的异常处理"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.1、7；JavaScript 高级程序设计 4th · Ch.3、21；JavaScript 权威指南 7th · Ch.4–5；Eloquent JavaScript 4th · Ch.2–3",
  "lessons": [
    {
      "id": "ch3-1",
      "title": "分支、循环与提前返回",
      "minutes": 22,
      "lead": "控制流的目标不是“把逻辑写进去”，而是让人一眼看出正常路径和异常路径。提前返回和合适的循环选择，比嵌套三元更值钱。",
      "sections": [
        {
          "h": "把异常分支挡在门口",
          "p": "函数开头先处理非法参数、空值和权限，再进入主逻辑，叫“卫语句”。它能把嵌套从三四层压到一层。循环方面：数组用 `for...of`，对象键用 `Object.keys` / `Object.entries`，需要下标时用 `entries()`；`for...in` 会遍历可枚举的继承属性，不适合直接处理数组。",
          "code": "function levelOf(score) {\n  if (typeof score !== \"number\" || score < 0 || score > 100) return \"无效\";\n  if (score >= 90) return \"A\";\n  if (score >= 60) return \"B\";\n  return \"C\";\n}\nconsole.log(levelOf(95), levelOf(75), levelOf(59), levelOf(\"90\"));\n\nfor (const [index, value] of [\"a\", \"b\"].entries()) {\n  console.log(index, value);\n}",
          "output": "A B C 无效\n0 a\n1 b",
          "tip": "上面最后一项 `levelOf(\"90\")` 返回“无效”，因为严格检查类型。真实项目里要明确“接受数字字符串”还是“只接受数字”，别靠 `==` 混过去。"
        },
        {
          "h": "break、continue 与循环边界",
          "p": "`break` 结束整个循环，`continue` 只跳过当前一轮。嵌套循环里 `break` 只跳出最内层；需要跳出多层时用标签，或把内层抽成函数用 `return`。遍历数组时不要一边删元素一边用旧下标，容易跳过相邻项；要过滤就 `filter`，要修改就新建数组。",
          "code": "const nums = [3, 8, 12, 5, 20];\nfor (const n of nums) {\n  if (n < 10) continue;\n  console.log(\"大于等于 10:\", n);\n  if (n > 15) break;\n}\n\nouter: for (const row of [[1, 2], [3, 4]]) {\n  for (const n of row) {\n    if (n === 3) break outer;\n  }\n}",
          "output": "大于等于 10: 12\n大于等于 10: 20",
          "tip": "标签语法可读性一般，能用函数 `return` 或提前过滤就别用标签。循环里做异步操作时，`forEach` 不会等你，改用 `for...of` 配 `await`。"
        }
      ],
      "points": [
        "卫语句把异常路径放前面，主逻辑保持扁平。",
        "数组优先 `for...of`，需要下标用 `entries()`。",
        "循环内异步不要用 `forEach`，用 `for...of` + `await`。"
      ],
      "practice": "把一段三层嵌套的 `if` 改写成卫语句版本，要求每个非法输入都有明确返回，正常路径不超过一层缩进。",
      "source": "Head First JavaScript Programming 2nd · Ch.1；JavaScript 高级程序设计 4th · Ch.3；Eloquent JavaScript 4th · Ch.2–3"
    },
    {
      "id": "ch3-2",
      "title": "短路、空值合并与可选链",
      "minutes": 28,
      "lead": "`||`、`&&`、`??` 和 `?.` 都能让代码变短，但它们对「假值」和「空值」的判定不同。把 `0`、`\"\"`、`false` 当成「没有值」，是业务代码最常见的隐性 bug 之一。",
      "sections": [
        {
          "h": "`||` 和 `??` 不是一回事",
          "p": "`||` 在左值为任意假值（`0`、`\"\"`、`false`、`null`、`undefined`、`NaN`）时取右值；`??` 只在左值为 `null` 或 `undefined` 时取右值。配置项允许 `0` 或空字符串时，必须用 `??`。\n\n`&&` 和 `||` 都会短路：左边已经决定结果，右边不会执行。不要把有副作用的函数塞进短路表达式里，除非你明确依赖这个顺序。",
          "code": "const port = 0;\nconsole.log(port || 8080);  // 8080，错了\nconsole.log(port ?? 8080);  // 0，保留合法值\nconst user = null;\nconsole.log(user?.name);    // undefined\ntry { console.log(user.name); } catch (err) { console.log(err.name); }",
          "output": "8080\n0\nundefined\nTypeError",
          "tip": "默认值场景优先 `??`；只有确实把 0、空串视为无效时才用 `||`。"
        },
        {
          "h": "可选链只保护一层访问",
          "p": "`user?.profile?.city` 在 `user` 或 `profile` 为 null/undefined 时返回 undefined，不会继续抛错。但它不会保护方法调用之后的返回值，也不会把 `user?.getName()` 的 this 绑定到 user 之外。\n\n可选链适合读取可能不存在的路径，不适合掩盖业务上必须存在的字段。关键字段缺失应该显式报错，而不是静默变成 undefined。",
          "code": "const order = { customer: null };\nconsole.log(order.customer?.address?.city);\nconsole.log(order.customer?.getName?.());\nconst required = order.customer?.id;\ntry {\n  if (required == null) throw new Error(\"customer.id is required\");\n} catch (err) { console.log(err.name + \": \" + err.message); }",
          "output": "undefined\nundefined\nError: customer.id is required",
          "tip": "可选链不能替代校验；关键路径缺失时要显式抛错。"
        },
        {
          "h": "三元、switch 与提前返回",
          "p": "三元表达式适合二选一的值，不适合塞多步副作用；`switch` 适合枚举分支，但别忘了 `break` 和默认分支。更通用的降复杂度手段是提前返回：先处理无效输入，再让主流程保持直线。\n\n分支越深，越难看出哪个条件覆盖了哪个值。把「不满足就退出」写在前面，通常比层层 else 更可读。",
          "code": "function priceLabel(user) {\n  if (!user) return \"游客\";\n  if (!user.member) return \"普通用户\";\n  if (user.level === \"gold\") return \"金卡\";\n  return \"会员\";\n}\nconsole.log(priceLabel(null), priceLabel({ member: false }), priceLabel({ member: true, level: \"gold\" }));",
          "output": "游客 普通用户 金卡",
          "tip": "先处理异常输入，再写主路径；三元只做取值，不堆副作用。"
        }
      ],
      "points": [
        "`||` 会把 0 和空串当成假值，`??` 只处理 null/undefined。",
        "可选链保护读取路径，不替代业务校验。",
        "提前返回能显著降低嵌套层级。"
      ],
      "practice": "把一段用 `||` 设置默认值的配置代码改成 `??`，再用 `0`、`\"\"`、`false` 三种输入验证行为；最后把多层 else 改写成提前返回。",
      "source": "JavaScript 高级程序设计 4th · Ch.3；JavaScript 权威指南 7th · Ch.4–5；Head First JavaScript Programming 2nd · Ch.7"
    },
    {
      "id": "ch3-3",
      "title": "异常、断言与可恢复错误",
      "minutes": 30,
      "lead": "错误不是「程序坏了」的同义词。输入错误、网络错误、权限错误和真正的程序 bug 需要不同处理。把错误分类，才能决定是重试、提示用户，还是让程序尽快失败。",
      "sections": [
        {
          "h": "错误类型与抛出时机",
          "p": "内置错误包括 `Error`、`TypeError`、`RangeError`、`SyntaxError`、`ReferenceError`。`throw` 可以抛任何值，但抛字符串会丢失调用栈和类型，生产代码应抛 `Error` 或其子类。\n\n`try/catch` 只捕获同步异常；Promise 的拒绝要用 `.catch` 或 `try/catch` 配合 `await`。不要用一个巨大的 try 包住整个应用，否则会把真正的 bug 吞掉。",
          "code": "function parseAge(value) {\n  const n = Number(value);\n  if (!Number.isInteger(n) || n < 0) {\n    throw new RangeError(\"age must be a non-negative integer\");\n  }\n  return n;\n}\ntry { console.log(parseAge(\"abc\")); } catch (e) { console.log(e.name, e.message); }",
          "output": "RangeError age must be a non-negative integer",
          "tip": "抛 Error 而不是字符串；只捕获你真正能处理的错误。"
        },
        {
          "h": "自定义错误与 cause",
          "p": "自定义错误类让调用方可以按类型分支处理；`cause` 保留原始错误，排查时不丢上下文。抛出时不要只写「失败了」，要写清输入、约束和下一步。\n\n捕获后要么处理、要么加上下文再抛，不要无声吞掉。",
          "code": "class ValidationError extends Error {\n  constructor(message, options) {\n    super(message, options);\n    this.name = \"ValidationError\";\n  }\n}\ntry {\n  JSON.parse(\"{bad\");\n} catch (err) {\n  throw new ValidationError(\"config is not valid JSON\", { cause: err });\n}",
          "output": "ValidationError: config is not valid JSON\n  cause: SyntaxError",
          "tip": "自定义错误要保留 `cause` 和稳定 `name`，方便上层分类处理。"
        },
        {
          "h": "finally、断言与失败快",
          "p": "`finally` 适合释放资源，不适合写返回值；它会在 try/catch 之后执行，且可能覆盖前面的返回。断言用于检查「不可能发生」的内部不变量，失败就应立即暴露，而不是继续带着坏状态运行。\n\n用户输入用校验并返回错误信息；程序内部不变量用断言和异常。两者不要混在一起。",
          "code": "function assert(condition, message) {\n  if (!condition) throw new Error(`Assertion failed: ${message}`);\n}\nfunction withdraw(balance, amount) {\n  assert(amount > 0, \"amount must be positive\");\n  if (amount > balance) throw new RangeError(\"insufficient funds\");\n  return balance - amount;\n}\nconsole.log(withdraw(100, 30));",
          "output": "70",
          "tip": "finally 里不要 return；内部不变量失败要立即抛错，不要静默修复。"
        }
      ],
      "points": [
        "错误要按类型和可恢复性分类。",
        "抛 Error 对象，保留 cause 和稳定 name。",
        "finally 适合清理，不适合改变返回值。"
      ],
      "practice": "给一个 `readConfig(text)` 函数加三层错误处理：JSON 语法错误、字段缺失、字段类型错误；每层都保留原始 cause，并给调用方一个可判断的错误类型。",
      "source": "JavaScript 高级程序设计 4th · Ch.21；JavaScript 权威指南 7th · Ch.11；Secrets of the JavaScript Ninja 2nd · Appendix B"
    }
  ]
});
