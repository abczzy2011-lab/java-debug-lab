window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch13",
  "part": 3,
  "number": "13",
  "title": "Map/Set、正则与 JSON",
  "summary": "标准库决定你写业务代码的效率。Map/Set 解决对象键和去重问题，正则解决模式匹配，JSON 解决跨边界序列化。三者都有容易忽略的边界。",
  "goals": [
    "在对象、Map、Set 之间选对容器",
    "写命名分组、断言和替换回调",
    "理解 JSON 的丢失类型与循环引用",
    "知道结构化克隆的边界"
  ],
  "source": "JavaScript 高级程序设计 4th · Ch.6、23；JavaScript 权威指南 7th · Ch.11；Secrets of the JavaScript Ninja 2nd · Ch.9–10；Eloquent JavaScript 4th · Ch.9",
  "lessons": [
    {
      "id": "ch13-1",
      "title": "Map、Set、WeakMap 与弱引用",
      "minutes": 31,
      "lead": "对象适合固定字段，Map 适合动态键和频繁增删，Set 适合去重和成员判断。WeakMap/WeakSet 只接受对象键，不阻止垃圾回收，适合给对象挂私有数据。",
      "sections": [
        {
          "h": "Map 与对象的差别",
          "p": "Map 的键可以是任意类型，保留插入顺序，`size` 直接可读，频繁增删性能更稳定；对象键会被转成字符串/Symbol，`__proto__` 等键有原型风险。\n\nJSON 不能直接序列化 Map；需要转成数组或普通对象。遍历 Map 用 `for...of`，不是 `for...in`。",
          "code": "const map = new Map([[\"a\", 1], [2, \"b\"]]);\nmap.set(\"c\", 3);\nconsole.log(map.size, map.get(2));\nconsole.log([...map.keys()]);\nconsole.log(JSON.stringify(map));",
          "output": "3 b\n[ \"a\", 2, \"c\" ]\n{}",
          "tip": "Map 键不转字符串；JSON 序列化 Map 会得到空对象，需要手动转换。"
        },
        {
          "h": "Set 去重与成员判断",
          "p": "Set 按 SameValueZero 判断相等，NaN 被视为相同，+0/-0 也相同；对象按引用。`has` 是 O(1) 平均复杂度，比数组 `includes` 更适合大集合。\n\nSet 不提供索引访问；需要顺序和索引时用数组，去重时再转 Set。",
          "code": "const set = new Set([1, 2, 2, NaN, NaN]);\nconsole.log(set.size, set.has(NaN));\nconst objs = [{ id: 1 }, { id: 1 }];\nconsole.log(new Set(objs).size);\nconsole.log([...set]);",
          "output": "3 true\n2\n[ 1, 2, NaN ]",
          "tip": "Set 按引用判断对象；按业务 id 去重要自己建 Map。"
        },
        {
          "h": "WeakMap 与生命周期",
          "p": "WeakMap 的键必须是对象，值任意；它不阻止键被回收，也没有 `size` 和遍历方法。适合给 DOM 节点或对象挂元数据，避免内存泄漏。\n\nWeakMap 不可枚举，不能拿来当缓存统计；需要统计命中率时用 Map + 明确清理策略。",
          "code": "const meta = new WeakMap();\nlet node = { id: 1 };\nmeta.set(node, { visited: true });\nconsole.log(meta.get(node));\nnode = null;\nconsole.log(meta.has(node));",
          "output": "{ visited: true }\nfalse（node 已为 null，不能作为键）",
          "tip": "WeakMap 键必须是对象且不可枚举；适合元数据，不适合可统计缓存。"
        }
      ],
      "points": [
        "Map 键可为任意类型，JSON 序列化会丢失。",
        "Set 按 SameValueZero 去重，对象按引用。",
        "WeakMap 不阻止回收，不能遍历和统计。"
      ],
      "practice": "用 Map 统计一段文本的词频，按出现次数排序输出；再用 Set 对一组对象按 id 去重，比较直接 Set 与 Map 的结果差异。",
      "source": "JavaScript 权威指南 7th · Ch.11；JavaScript 高级程序设计 4th · Ch.6；Secrets of the JavaScript Ninja 2nd · Ch.9"
    },
    {
      "id": "ch13-2",
      "title": "正则表达式：分组、断言与替换",
      "minutes": 33,
      "lead": "正则不是「一串神秘符号」，而是有明确语法的模式匹配。先分清字符、量词、分组、断言和标志，再用 `match`、`replace`、`split` 组合。",
      "sections": [
        {
          "h": "命名分组与 matchAll",
          "p": "括号分组会捕获子串，`(?<name>...)` 给分组命名，结果在 `groups` 里。全局匹配用 `g` 标志；`matchAll` 返回所有匹配的迭代器，普通 `match` 在 g 模式下只返回匹配文本，不返回分组。\n\n正则对象带 `g` 时有 `lastIndex` 状态，反复 `test` 可能从上次位置继续；需要无状态判断时去掉 g 或每次新建。",
          "code": "const text = \"Ada: 36, Grace: 30\";\nconst re = /(?<name>\\w+): (?<age>\\d+)/g;\nconsole.log([...text.matchAll(re)].map(m => m.groups));\nconsole.log(text.match(re));",
          "output": "[ { name: \"Ada\", age: \"36\" }, { name: \"Grace\", age: \"30\" } ]\n[ \"Ada: 36\", \"Grace: 30\" ]",
          "tip": "g 模式下 match 不返回分组；要分组用 matchAll 或去掉 g 后 exec。"
        },
        {
          "h": "断言、贪婪与替换回调",
          "p": "`(?=...)` 是正向先行断言，`(?<=...)` 是正向后行断言，只检查位置不消费字符。量词默认贪婪，`?` 改为惰性。替换字符串里 `$1`、`$<name>` 引用分组；回调可以按匹配内容动态生成替换值。\n\n正则不是解析 HTML/JSON 的可靠工具；结构化格式用解析器。",
          "code": "const price = \"￥12 ￥30\";\nconsole.log(price.replace(/￥(\\d+)/g, (_, n) => `$${n}`));\nconst words = \"foo bar baz\";\nconsole.log(words.match(/\\w+(?= bar)/)?.[0]);\nconsole.log(\"aaa\".match(/a+?/)?.[0]);",
          "output": "$12 $30\nfoo\na",
          "tip": "断言只检查位置；正则不要用来解析 HTML/JSON。"
        },
        {
          "h": "常用模式与安全边界",
          "p": "邮箱、URL、手机号没有一条「万能正则」；不同标准、国际化域名和国际号码都会让简单模式失效。业务校验应明确规则，复杂格式交给专用库或服务端。\n\n用户输入拼进正则前要转义元字符，避免正则注入；不要在不可信输入上跑灾难性回溯的表达式。",
          "code": "const escapeRe = s => s.replace(/[.*+?^${}()|[\\]\\\\]/g, \"\\\\$&\");\nconst input = \"a+b\";\nconst re = new RegExp(escapeRe(input));\nconsole.log(re.test(\"a+b\"));\nconsole.log(/^[^@]+@[^@]+$/.test(\"a@b\"));",
          "output": "true\ntrue",
          "tip": "用户输入拼正则前先转义；复杂格式不要靠一条万能正则。"
        }
      ],
      "points": [
        "g 模式正则有 lastIndex 状态，match 不返回分组。",
        "断言只检查位置，不消费字符。",
        "用户输入拼正则前必须转义。"
      ],
      "practice": "写一个 `highlight(text, word)`，把文本中所有完整单词高亮；要求对用户输入的正则元字符安全，并比较大小写敏感与不敏感两种结果。",
      "source": "JavaScript 权威指南 7th · Ch.11；Secrets of the JavaScript Ninja 2nd · Ch.10；JavaScript 高级程序设计 4th · Ch.5"
    },
    {
      "id": "ch13-3",
      "title": "JSON、结构化克隆与序列化边界",
      "minutes": 32,
      "lead": "JSON 是跨语言的数据交换格式，不是 JavaScript 对象的完整序列化。函数、undefined、Symbol、Map、Set、Date、循环引用都会在 JSON 里丢失或变形；发送前要明确契约。",
      "sections": [
        {
          "h": "stringify/parse 的 replacer 与 reviver",
          "p": "`JSON.stringify(value, replacer, space)` 可以过滤字段或转换值；`JSON.parse(text, reviver)` 可以在解析时恢复日期等类型。`toJSON` 方法可以自定义对象的序列化结果。\n\nJSON 只支持对象、数组、字符串、数字、布尔和 null；NaN/Infinity 会变成 null。",
          "code": "const user = { name: \"Ada\", age: 36, password: \"x\" };\nconst json = JSON.stringify(user, (k, v) => k === \"password\" ? undefined : v, 2);\nconsole.log(json);\nconst parsed = JSON.parse(json, (k, v) => k === \"date\" ? new Date(v) : v);\nconsole.log(parsed);",
          "output": "{\n  \"name\": \"Ada\",\n  \"age\": 36\n}\n{ name: \"Ada\", age: 36 }",
          "tip": "replacer 返回 undefined 会删除字段；reviver 只影响解析结果。"
        },
        {
          "h": "循环引用与深拷贝",
          "p": "JSON 深拷贝遇到循环引用会抛 `TypeError: Converting circular structure to JSON`；它也会丢失函数、undefined、Symbol、RegExp、Map/Set。`structuredClone` 支持更多内置类型和循环引用，但不能克隆函数和 DOM 节点。\n\n需要保留原型或自定义类时，结构化克隆也不保证；要自己实现序列化协议。",
          "code": "const a = { name: \"a\" }; a.self = a;\ntry { JSON.stringify(a); } catch (e) { console.log(e.name); }\nconst clone = structuredClone(a);\nconsole.log(clone.self === clone);",
          "output": "TypeError\ntrue",
          "tip": "JSON 不能处理循环引用；structuredClone 支持循环但不能克隆函数/DOM。"
        },
        {
          "h": "跨边界契约与版本",
          "p": "存 localStorage、发 HTTP、写文件时，JSON 结构就是契约。字段改名、类型变化、旧数据残留都会让读取方崩溃；需要版本字段、默认值和迁移逻辑。\n\n不要把整个 DOM、类实例或密钥直接 JSON 化存储；只存必要字段，并在读取时校验。",
          "code": "const STORE_KEY = \"app:v2\";\nfunction save(state) {\n  localStorage.setItem(STORE_KEY, JSON.stringify({ version: 2, state }));\n}\nfunction load() {\n  const raw = JSON.parse(localStorage.getItem(STORE_KEY) || \"null\");\n  return raw && raw.version === 2 ? raw.state : null;\n}",
          "output": "保存：{\"version\":2,\"state\":{...}}\n读取旧版本：null（触发迁移）",
          "tip": "持久化数据要带版本和校验；不要直接信任 localStorage 里的 JSON。"
        }
      ],
      "points": [
        "JSON 只支持有限类型，NaN/Infinity 会变 null。",
        "JSON 不能处理循环引用；structuredClone 支持循环但不支持函数。",
        "持久化数据要有版本、默认值和校验。"
      ],
      "practice": "写一对 `saveState/loadState`，要求带版本号、过滤敏感字段、兼容旧版本；再用一个循环引用对象分别测试 JSON 和 structuredClone。",
      "source": "JavaScript 权威指南 7th · Ch.11；JavaScript 高级程序设计 4th · Ch.23；Eloquent JavaScript 4th · Ch.9"
    }
  ]
});
