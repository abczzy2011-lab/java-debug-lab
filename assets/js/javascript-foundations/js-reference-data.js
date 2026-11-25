/* JavaScript 核心 API 速查：8 组 97 条，含签名、示例、输出与坑点。
   示例输出按浏览器 / Node 的 console 习惯写成可读形式，不执行用户输入。 */
window.JS_REFERENCE_GROUPS = [
  { id: 'types', label: '类型与全局', en: 'TYPES & GLOBAL', summary: '类型判断、数字校验、序列化和深拷贝。' },
  { id: 'string', label: '字符串', en: 'STRING', summary: '查找、截取、替换、拆分与格式化。' },
  { id: 'array', label: '数组', en: 'ARRAY', summary: '遍历、筛选、归约、排序和不可变操作。' },
  { id: 'object', label: '对象与集合', en: 'OBJECT & COLLECTION', summary: '键值访问、浅拷贝、冻结，以及 Map / Set。' },
  { id: 'function', label: '函数与类', en: 'FUNCTION & CLASS', summary: '参数、this、箭头函数、类字段与访问器。' },
  { id: 'dom', label: 'DOM', en: 'DOM', summary: '选择节点、创建、插入、删除与属性操作。' },
  { id: 'event', label: '事件与浏览器', en: 'EVENT & BROWSER', summary: '监听、事件对象、默认行为、存储和路由状态。' },
  { id: 'async', label: '异步与网络', en: 'ASYNC & NETWORK', summary: '定时器、微任务、Promise、async/await 和 fetch。' }
];

window.JS_REFERENCE_APIS = [
  /* 类型与全局 */
  {
    id: 'typeof', group: 'types', name: 'typeof', short: 'typeof',
    syntax: 'typeof value',
    summary: '返回操作数基本类型的字符串。函数返回 "function"，null 会错误地返回 "object"。',
    returns: 'string', mutates: false,
    example: 'console.log(typeof 1, typeof "1", typeof null);',
    output: 'number string object',
    tip: '判断 null 用 value === null；判断数组用 Array.isArray。'
  },
  {
    id: 'instanceof', group: 'types', name: 'instanceof', short: 'instanceof',
    syntax: 'object instanceof Constructor',
    summary: '沿原型链检查构造函数的 prototype 是否出现在对象上，适合判断自定义类实例。',
    returns: 'boolean', mutates: false,
    example: 'class User {}\nconst u = new User();\nconsole.log(u instanceof User);',
    output: 'true',
    tip: 'instanceof 不能跨 iframe / realm 可靠判断；数组优先用 Array.isArray。'
  },
  {
    id: 'object-is', group: 'types', name: 'Object.is', short: 'Object.is()',
    syntax: 'Object.is(a, b)',
    summary: '判断两个值是否“同值相等”：NaN 与 NaN 为 true，+0 与 -0 为 false。',
    returns: 'boolean', mutates: false,
    example: 'console.log(Object.is(NaN, NaN), Object.is(0, -0));',
    output: 'true false',
    tip: '需要严格相等但又要正确识别 NaN、-0 时用 Object.is。'
  },
  {
    id: 'number-isnan', group: 'types', name: 'Number.isNaN', short: 'Number.isNaN()',
    syntax: 'Number.isNaN(value)',
    summary: '只在值本身就是 NaN 时返回 true；不会把字符串或其他类型强制转成数字。',
    returns: 'boolean', mutates: false,
    example: 'console.log(Number.isNaN("NaN"), Number.isNaN(NaN));',
    output: 'false true',
    tip: '全局 isNaN("abc") 会先转数字再判断，容易误判；优先用 Number.isNaN。'
  },
  {
    id: 'number-isfinite', group: 'types', name: 'Number.isFinite', short: 'Number.isFinite()',
    syntax: 'Number.isFinite(value)',
    summary: '判断值是否为有限数字；字符串 "10"、NaN、Infinity 都返回 false。',
    returns: 'boolean', mutates: false,
    example: 'console.log(Number.isFinite("10"), Number.isFinite(10));',
    output: 'false true',
    tip: '它不做类型转换；Number.isFinite 和全局 isFinite 的行为不同。'
  },
  {
    id: 'number-parseint', group: 'types', name: 'Number.parseInt', short: 'parseInt()',
    syntax: 'Number.parseInt(string, radix)',
    summary: '从字符串开头解析整数，遇到非数字字符停止；始终显式传进制更稳。',
    returns: 'number | NaN', mutates: false,
    example: 'console.log(Number.parseInt("42px", 10));',
    output: '42',
    tip: 'parseInt 会截断小数和尾部字符；严格转换用 Number("42")。'
  },
  {
    id: 'number-parsefloat', group: 'types', name: 'Number.parseFloat', short: 'parseFloat()',
    syntax: 'Number.parseFloat(string)',
    summary: '从字符串开头解析浮点数，支持小数和指数写法，遇到非法字符停止。',
    returns: 'number | NaN', mutates: false,
    example: 'console.log(Number.parseFloat("3.14em"));',
    output: '3.14',
    tip: 'parseFloat 不看进制；需要完整校验时用 Number 并检查 Number.isFinite。'
  },
  {
    id: 'structuredclone', group: 'types', name: 'structuredClone', short: 'structuredClone()',
    syntax: 'structuredClone(value)',
    summary: '深拷贝大多数内置结构，包括嵌套对象、数组、Map、Set、Date 和 ArrayBuffer。',
    returns: 'any', mutates: false,
    example: 'const a = { nested: { n: 1 } };\nconst b = structuredClone(a);\nb.nested.n = 2;\nconsole.log(a.nested.n);',
    output: '1',
    tip: '函数、DOM 节点、原型链上的自定义行为不会被带过来；会抛 DataCloneError。'
  },
  {
    id: 'json-stringify', group: 'types', name: 'JSON.stringify', short: 'JSON.stringify()',
    syntax: 'JSON.stringify(value, replacer?, space?)',
    summary: '把值序列化成 JSON 字符串；对象里的 undefined、函数和 Symbol 会被省略。',
    returns: 'string | undefined', mutates: false,
    example: 'console.log(JSON.stringify({ a: 1, b: undefined }));',
    output: '{"a":1}',
    tip: '循环引用会抛 TypeError；Date 会通过 toJSON 变成 ISO 字符串。'
  },
  {
    id: 'json-parse', group: 'types', name: 'JSON.parse', short: 'JSON.parse()',
    syntax: 'JSON.parse(text, reviver?)',
    summary: '把 JSON 字符串解析成 JavaScript 值；格式非法会抛 SyntaxError。',
    returns: 'any', mutates: false,
    example: 'console.log(JSON.parse("{\\"ok\\":true}").ok);',
    output: 'true',
    tip: 'JSON.parse 不执行代码，但输入必须严格符合 JSON：键和字符串都要双引号。'
  },
  {
    id: 'math-round', group: 'types', name: 'Math.round', short: 'Math.round()',
    syntax: 'Math.round(x)',
    summary: '把数字四舍五入到最接近的整数；.5 向正无穷方向取整。',
    returns: 'number', mutates: false,
    example: 'console.log(Math.round(2.5), Math.round(-2.5));',
    output: '3 -2',
    tip: '负数 .5 的结果可能和直觉不同；金额处理建议先转成整数分。'
  },
  {
    id: 'encodeuricomponent', group: 'types', name: 'encodeURIComponent', short: 'encodeURIComponent()',
    syntax: 'encodeURIComponent(value)',
    summary: '把字符串编码成可安全放进 URL 查询参数或路径片段的形式。',
    returns: 'string', mutates: false,
    example: 'console.log(encodeURIComponent("a b&c"));',
    output: 'a%20b%26c',
    tip: '编码整个 URL 用 encodeURI；编码单个参数值用 encodeURIComponent。'
  },

  /* 字符串 */
  {
    id: 'string-at', group: 'string', name: 'String.prototype.at', short: 'at()',
    syntax: 'str.at(index)',
    summary: '按索引取字符，支持负索引从末尾开始；越界返回 undefined。',
    returns: 'string | undefined', mutates: false,
    example: 'console.log("hello".at(-1));',
    output: 'o',
    tip: 'at 返回单个 UTF-16 码元；复杂 emoji 需要 Intl.Segmenter 或按码点处理。'
  },
  {
    id: 'string-includes', group: 'string', name: 'String.prototype.includes', short: 'includes()',
    syntax: 'str.includes(search, position?)',
    summary: '判断字符串是否包含指定子串，返回布尔值，区分大小写。',
    returns: 'boolean', mutates: false,
    example: 'console.log("JavaScript".includes("Script"));',
    output: 'true',
    tip: '需要位置时用 indexOf；includes 不能直接传正则。'
  },
  {
    id: 'string-indexof', group: 'string', name: 'String.prototype.indexOf', short: 'indexOf()',
    syntax: 'str.indexOf(search, fromIndex?)',
    summary: '返回子串第一次出现的索引，找不到返回 -1。',
    returns: 'number', mutates: false,
    example: 'console.log("banana".indexOf("na"));',
    output: '2',
    tip: '从末尾查找用 lastIndexOf；判断存在仍建议 includes。'
  },
  {
    id: 'string-slice', group: 'string', name: 'String.prototype.slice', short: 'slice()',
    syntax: 'str.slice(start, end?)',
    summary: '截取从 start 到 end（不含）的子串，支持负索引；不修改原字符串。',
    returns: 'string', mutates: false,
    example: 'console.log("abcdef".slice(1, 4));',
    output: 'bcd',
    tip: 'slice 的负索引从末尾算；substring 会把负值当 0，行为不同。'
  },
  {
    id: 'string-replaceall', group: 'string', name: 'String.prototype.replaceAll', short: 'replaceAll()',
    syntax: 'str.replaceAll(search, replacement)',
    summary: '替换所有匹配项；search 可以是字符串或带 g 标志的正则。',
    returns: 'string', mutates: false,
    example: 'console.log("a-b-a".replaceAll("a", "x"));',
    output: 'x-b-x',
    tip: '传正则时必须带 g 标志，否则会抛 TypeError；替换值可用函数动态生成。'
  },
  {
    id: 'string-split', group: 'string', name: 'String.prototype.split', short: 'split()',
    syntax: 'str.split(separator, limit?)',
    summary: '按分隔符把字符串拆成数组；分隔符可以是字符串或正则。',
    returns: 'string[]', mutates: false,
    example: 'console.log("a,b,c".split(","));',
    output: '["a", "b", "c"]',
    tip: '空字符串分隔符会按 UTF-16 码元拆；想按字符拆可用 [...str]。'
  },
  {
    id: 'string-trim', group: 'string', name: 'String.prototype.trim', short: 'trim()',
    syntax: 'str.trim()',
    summary: '删除字符串首尾空白字符，返回新字符串。',
    returns: 'string', mutates: false,
    example: 'console.log("  hi  ".trim());',
    output: 'hi',
    tip: 'trim 不影响中间空格；只删一端用 trimStart / trimEnd。'
  },
  {
    id: 'string-padstart', group: 'string', name: 'String.prototype.padStart', short: 'padStart()',
    syntax: 'str.padStart(targetLength, padString?)',
    summary: '在字符串开头补字符，直到达到目标长度；常用于编号、时间和金额对齐。',
    returns: 'string', mutates: false,
    example: 'console.log("7".padStart(3, "0"));',
    output: '007',
    tip: '目标长度小于原长度时原样返回；补的内容会按需截断。'
  },
  {
    id: 'string-startswith', group: 'string', name: 'String.prototype.startsWith', short: 'startsWith()',
    syntax: 'str.startsWith(search, position?)',
    summary: '判断字符串是否以指定子串开头，区分大小写。',
    returns: 'boolean', mutates: false,
    example: 'console.log("https://x".startsWith("https"));',
    output: 'true',
    tip: '判断结尾用 endsWith；需要匹配模式用正则。'
  },
  {
    id: 'string-touppercase', group: 'string', name: 'String.prototype.toUpperCase', short: 'toUpperCase()',
    syntax: 'str.toUpperCase()',
    summary: '把字符串转成大写，返回新字符串。',
    returns: 'string', mutates: false,
    example: 'console.log("js".toUpperCase());',
    output: 'JS',
    tip: '语言相关大小写转换要用 toLocaleUpperCase，例如土耳其语。'
  },
  {
    id: 'string-match', group: 'string', name: 'String.prototype.match', short: 'match()',
    syntax: 'str.match(regexp)',
    summary: '用正则匹配字符串；带 g 标志返回所有完整匹配，不带 g 返回首个匹配及分组。',
    returns: 'string[] | RegExpMatchArray | null', mutates: false,
    example: 'console.log("a1b2".match(/\\d/g));',
    output: '["1", "2"]',
    tip: '需要每个匹配的索引和分组时用 matchAll，但要带 g 标志。'
  },
  {
    id: 'string-repeat', group: 'string', name: 'String.prototype.repeat', short: 'repeat()',
    syntax: 'str.repeat(count)',
    summary: '把字符串重复 count 次并返回新字符串；count 必须是非负整数。',
    returns: 'string', mutates: false,
    example: 'console.log("ab".repeat(3));',
    output: 'ababab',
    tip: '负数或 Infinity 会抛 RangeError；生成缩进时注意总长度。'
  },

  /* 数组 */
  {
    id: 'array-isarray', group: 'array', name: 'Array.isArray', short: 'Array.isArray()',
    syntax: 'Array.isArray(value)',
    summary: '可靠判断一个值是否为数组，不受 typeof 把数组误判为 object 的影响。',
    returns: 'boolean', mutates: false,
    example: 'console.log(Array.isArray([]), Array.isArray({ length: 0 }));',
    output: 'true false',
    tip: '类数组（arguments、NodeList）不是数组；需要数组方法时先 Array.from。'
  },
  {
    id: 'array-from', group: 'array', name: 'Array.from', short: 'Array.from()',
    syntax: 'Array.from(iterable, mapFn?, thisArg?)',
    summary: '把可迭代对象或类数组转成真正的数组，可同时做一次映射。',
    returns: 'Array', mutates: false,
    example: 'console.log(Array.from("abc"));',
    output: '["a", "b", "c"]',
    tip: 'Array.from 能处理 Set、Map、NodeList；扩展运算符只接受可迭代对象。'
  },
  {
    id: 'array-at', group: 'array', name: 'Array.prototype.at', short: 'at()',
    syntax: 'array.at(index)',
    summary: '按索引取数组元素，支持负索引；越界返回 undefined。',
    returns: 'any', mutates: false,
    example: 'console.log([10, 20, 30].at(-1));',
    output: '30',
    tip: 'at 不是原地操作；需要改元素仍用索引赋值或 splice。'
  },
  {
    id: 'array-map', group: 'array', name: 'Array.prototype.map', short: 'map()',
    syntax: 'array.map(callback, thisArg?)',
    summary: '对每个元素调用回调，用返回值组成新数组；长度不变，不修改原数组。',
    returns: 'Array', mutates: false,
    example: 'console.log([1, 2, 3].map(n => n * 2));',
    output: '[2, 4, 6]',
    tip: 'map 只适合“一个输入对应一个输出”；只做副作用用 forEach。'
  },
  {
    id: 'array-filter', group: 'array', name: 'Array.prototype.filter', short: 'filter()',
    syntax: 'array.filter(callback, thisArg?)',
    summary: '保留回调返回真值的元素，组成新数组；不修改原数组。',
    returns: 'Array', mutates: false,
    example: 'console.log([1, 2, 3, 4].filter(n => n % 2 === 0));',
    output: '[2, 4]',
    tip: 'filter 不会改变长度之外的原数组；需要同时转换用 flatMap 或 map + filter。'
  },
  {
    id: 'array-reduce', group: 'array', name: 'Array.prototype.reduce', short: 'reduce()',
    syntax: 'array.reduce(callback, initialValue)',
    summary: '把数组折叠成一个值：回调接收累计值、当前元素、索引和原数组。',
    returns: 'any', mutates: false,
    example: 'console.log([1, 2, 3].reduce((sum, n) => sum + n, 0));',
    output: '6',
    tip: '初始值建议显式传；空数组不传初始值会抛 TypeError。'
  },
  {
    id: 'array-find', group: 'array', name: 'Array.prototype.find', short: 'find()',
    syntax: 'array.find(callback, thisArg?)',
    summary: '返回第一个满足条件的元素；找不到返回 undefined。',
    returns: 'any | undefined', mutates: false,
    example: 'console.log([5, 12, 8].find(n => n > 10));',
    output: '12',
    tip: '需要索引用 findIndex；需要所有匹配项用 filter。'
  },
  {
    id: 'array-some', group: 'array', name: 'Array.prototype.some', short: 'some()',
    syntax: 'array.some(callback, thisArg?)',
    summary: '只要有一个元素满足条件就返回 true；空数组返回 false。',
    returns: 'boolean', mutates: false,
    example: 'console.log([1, 3, 4].some(n => n % 2 === 0));',
    output: 'true',
    tip: 'some 遇到第一个真值就短路；要“全部满足”用 every。'
  },
  {
    id: 'array-every', group: 'array', name: 'Array.prototype.every', short: 'every()',
    syntax: 'array.every(callback, thisArg?)',
    summary: '所有元素都满足条件才返回 true；空数组返回 true。',
    returns: 'boolean', mutates: false,
    example: 'console.log([2, 4, 6].every(n => n % 2 === 0));',
    output: 'true',
    tip: 'every 遇到第一个假值就短路；空数组的 true 是数学上的全称量词语义。'
  },
  {
    id: 'array-sort', group: 'array', name: 'Array.prototype.sort', short: 'sort()',
    syntax: 'array.sort(compareFn?)',
    summary: '原地排序并返回同一个数组；不传比较函数时按字符串 UTF-16 字典序排序。',
    returns: 'Array（原数组）', mutates: true,
    example: 'console.log([10, 2, 1].sort((a, b) => a - b));',
    output: '[1, 2, 10]',
    tip: '数字排序一定传 (a, b) => a - b；不想改原数组先 [...arr].sort()。'
  },
  {
    id: 'array-splice', group: 'array', name: 'Array.prototype.splice', short: 'splice()',
    syntax: 'array.splice(start, deleteCount, ...items)',
    summary: '在原地删除、插入或替换元素，返回被删除元素组成的新数组。',
    returns: 'Array（被删除项）', mutates: true,
    example: 'const a = [1, 2, 3];\nconsole.log(a.splice(1, 1, "x"), a);',
    output: '["2"] [1, "x", 3]',
    tip: 'splice 改原数组；只想取一段不改原数组用 slice。'
  },
  {
    id: 'array-flat', group: 'array', name: 'Array.prototype.flat', short: 'flat()',
    syntax: 'array.flat(depth = 1)',
    summary: '按指定深度展开嵌套数组，返回新数组；不会展开类数组或字符串。',
    returns: 'Array', mutates: false,
    example: 'console.log([1, [2, [3]]].flat(2));',
    output: '[1, 2, 3]',
    tip: '深度未知时可用 Infinity，但要小心极深结构；flat 会跳过空槽。'
  },

  /* 对象与集合 */
  {
    id: 'object-keys', group: 'object', name: 'Object.keys', short: 'Object.keys()',
    syntax: 'Object.keys(object)',
    summary: '返回对象自身可枚举字符串键组成的数组，不包含原型链上的键。',
    returns: 'string[]', mutates: false,
    example: 'console.log(Object.keys({ a: 1, b: 2 }));',
    output: '["a", "b"]',
    tip: '需要值用 Object.values，需要键值对用 Object.entries；顺序按属性枚举规则。'
  },
  {
    id: 'object-values', group: 'object', name: 'Object.values', short: 'Object.values()',
    syntax: 'Object.values(object)',
    summary: '返回对象自身可枚举属性值组成的数组。',
    returns: 'any[]', mutates: false,
    example: 'console.log(Object.values({ a: 1, b: 2 }));',
    output: '[1, 2]',
    tip: '它和 Object.keys 的遍历顺序一致；Symbol 键不会被包含。'
  },
  {
    id: 'object-entries', group: 'object', name: 'Object.entries', short: 'Object.entries()',
    syntax: 'Object.entries(object)',
    summary: '把对象自身可枚举属性转成 [key, value] 数组，适合遍历和 Map 构造。',
    returns: '[string, any][]', mutates: false,
    example: 'console.log(Object.entries({ a: 1, b: 2 }));',
    output: '[["a", 1], ["b", 2]]',
    tip: '配 Object.fromEntries 可以把键值对数组转回对象。'
  },
  {
    id: 'object-assign', group: 'object', name: 'Object.assign', short: 'Object.assign()',
    syntax: 'Object.assign(target, ...sources)',
    summary: '把源对象自身可枚举属性复制到目标对象，返回目标对象；是浅拷贝。',
    returns: 'object', mutates: true,
    example: 'const t = {};\nObject.assign(t, { a: 1 }, { b: 2 });\nconsole.log(t);',
    output: '{a: 1, b: 2}',
    tip: '嵌套对象仍然共享引用；需要深拷贝用 structuredClone。'
  },
  {
    id: 'object-freeze', group: 'object', name: 'Object.freeze', short: 'Object.freeze()',
    syntax: 'Object.freeze(object)',
    summary: '冻结对象：不能新增、删除或修改属性；返回同一个被冻结对象。',
    returns: 'object', mutates: true,
    example: 'const o = Object.freeze({ n: 1 });\no.n = 2;\nconsole.log(o.n);',
    output: '1',
    tip: '非严格模式会静默失败，严格模式抛 TypeError；嵌套对象不会被递归冻结。'
  },
  {
    id: 'object-create', group: 'object', name: 'Object.create', short: 'Object.create()',
    syntax: 'Object.create(proto, descriptors?)',
    summary: '用指定原型创建新对象，可实现无原型字典或自定义原型链。',
    returns: 'object', mutates: false,
    example: 'const proto = { hello() { return "hi"; } };\nconst o = Object.create(proto);\nconsole.log(o.hello());',
    output: 'hi',
    tip: 'Object.create(null) 没有原型，适合纯字典，但没有 hasOwnProperty 等方法。'
  },
  {
    id: 'object-getprototypeof', group: 'object', name: 'Object.getPrototypeOf', short: 'Object.getPrototypeOf()',
    syntax: 'Object.getPrototypeOf(object)',
    summary: '返回对象的原型（内部 [[Prototype]]），可用于检查继承关系。',
    returns: 'object | null', mutates: false,
    example: 'const o = {};\nconsole.log(Object.getPrototypeOf(o) === Object.prototype);',
    output: 'true',
    tip: '不要用 obj.__proto__ 做业务逻辑；改用 getPrototypeOf / setPrototypeOf。'
  },
  {
    id: 'object-hasown', group: 'object', name: 'Object.hasOwn', short: 'Object.hasOwn()',
    syntax: 'Object.hasOwn(object, property)',
    summary: '判断属性是否为对象自身属性，不沿原型链查找。',
    returns: 'boolean', mutates: false,
    example: 'const o = { a: 1 };\nconsole.log(Object.hasOwn(o, "a"), Object.hasOwn(o, "toString"));',
    output: 'true false',
    tip: '比 obj.hasOwnProperty 更安全：对象可能覆盖 hasOwnProperty 或没有原型。'
  },
  {
    id: 'map', group: 'object', name: 'Map', short: 'new Map()',
    syntax: 'new Map(iterable?)',
    summary: '键值集合，键可以是任意类型，保留插入顺序；常用 set / get / has / delete / size。',
    returns: 'Map', mutates: false,
    example: 'const m = new Map([["a", 1]]);\nm.set("b", 2);\nconsole.log(m.get("b"), m.size);',
    output: '2 2',
    tip: '对象键按引用比较；需要按对象关联数据时 Map 比普通对象更合适。'
  },
  {
    id: 'set', group: 'object', name: 'Set', short: 'new Set()',
    syntax: 'new Set(iterable?)',
    summary: '唯一值集合，按 SameValueZero 判断重复；常用 add / has / delete / size。',
    returns: 'Set', mutates: false,
    example: 'const s = new Set([1, 1, 2]);\nconsole.log(s.size);',
    output: '2',
    tip: 'Set 用引用判断对象；两个内容相同的对象仍可同时存在。'
  },
  {
    id: 'weakmap', group: 'object', name: 'WeakMap', short: 'new WeakMap()',
    syntax: 'new WeakMap(iterable?)',
    summary: '弱引用键值集合，键必须是对象；不阻止键被垃圾回收，且不可枚举。',
    returns: 'WeakMap', mutates: false,
    example: 'const key = {};\nconst wm = new WeakMap();\nwm.set(key, "x");\nconsole.log(wm.get(key));',
    output: 'x',
    tip: 'WeakMap 没有 size、clear 和遍历；适合给对象挂私有附加数据。'
  },
  {
    id: 'weakset', group: 'object', name: 'WeakSet', short: 'new WeakSet()',
    syntax: 'new WeakSet(iterable?)',
    summary: '弱引用对象集合，只记录对象是否存在，不阻止垃圾回收。',
    returns: 'WeakSet', mutates: false,
    example: 'const key = {};\nconst ws = new WeakSet([key]);\nconsole.log(ws.has(key));',
    output: 'true',
    tip: 'WeakSet 不可枚举，也只能放对象；不能放数字或字符串。'
  },

  /* 函数与类 */
  {
    id: 'function-declaration', group: 'function', name: 'function 声明', short: 'function',
    syntax: 'function name(params) { ... }',
    summary: '声明一个具名函数，存在提升，可以在声明之前调用；有自己的 this 和 arguments。',
    returns: 'function', mutates: false,
    example: 'function add(a, b) { return a + b; }\nconsole.log(add(2, 3));',
    output: '5',
    tip: '函数声明会整体提升；函数表达式只提升变量名，调用时机不同。'
  },
  {
    id: 'arrow-function', group: 'function', name: '箭头函数', short: '() => {}',
    syntax: '(params) => expression',
    summary: '更短的函数写法；没有自己的 this、arguments 和 prototype，不能作为构造函数。',
    returns: 'function', mutates: false,
    example: 'const add = (a, b) => a + b;\nconsole.log(add(2, 3));',
    output: '5',
    tip: '箭头函数的 this 来自外层词法作用域；对象方法通常不要用箭头函数。'
  },
  {
    id: 'default-params', group: 'function', name: '默认参数', short: '= default',
    syntax: 'function f(a = 1, b = 2) { ... }',
    summary: '参数为 undefined 时使用默认值；null、0、空字符串不会触发默认值。',
    returns: 'function', mutates: false,
    example: 'function greet(name = "guest") { return "hi " + name; }\nconsole.log(greet());',
    output: 'hi guest',
    tip: '默认参数在每次调用时求值，可以引用前面的参数。'
  },
  {
    id: 'rest-params', group: 'function', name: '剩余参数', short: '...args',
    syntax: 'function f(...args) { ... }',
    summary: '把剩余实参收集成真数组，必须放在参数列表最后。',
    returns: 'function', mutates: false,
    example: 'function sum(...nums) { return nums.reduce((a, b) => a + b, 0); }\nconsole.log(sum(1, 2, 3));',
    output: '6',
    tip: '剩余参数是真数组，能直接用 map、reduce；arguments 不是。'
  },
  {
    id: 'destructuring', group: 'function', name: '解构赋值', short: 'const {a} = obj',
    syntax: 'const { a, b = 2 } = object',
    summary: '按结构从对象或数组中取出值，支持重命名、默认值和嵌套解构。',
    returns: '—', mutates: false,
    example: 'const { name, age = 18 } = { name: "Ada" };\nconsole.log(name, age);',
    output: 'Ada 18',
    tip: '对象解构按属性名，数组解构按位置；默认值只在 undefined 时生效。'
  },
  {
    id: 'spread', group: 'function', name: '展开语法', short: '...value',
    syntax: '[...array] / { ...object }',
    summary: '把可迭代对象展开成元素，或把对象自身可枚举属性展开到新对象。',
    returns: 'Array | object', mutates: false,
    example: 'const a = [1, 2];\nconsole.log([...a, 3]);',
    output: '[1, 2, 3]',
    tip: '对象展开是浅拷贝；数组展开只复制一层，嵌套引用仍共享。'
  },
  {
    id: 'function-call', group: 'function', name: 'Function.prototype.call', short: 'call()',
    syntax: 'fn.call(thisArg, ...args)',
    summary: '立即调用函数，并把 this 显式指定为第一个参数；其余参数逐个传入。',
    returns: 'any', mutates: false,
    example: 'function f() { return this.x; }\nconsole.log(f.call({ x: 7 }));',
    output: '7',
    tip: 'call 与 apply 的区别只在参数形式；apply 接收参数数组。'
  },
  {
    id: 'function-bind', group: 'function', name: 'Function.prototype.bind', short: 'bind()',
    syntax: 'fn.bind(thisArg, ...args)',
    summary: '返回一个永久绑定 this 和部分参数的新函数，调用时不再受调用方式影响。',
    returns: 'function', mutates: false,
    example: 'function f() { return this.x; }\nconst g = f.bind({ x: 9 });\nconsole.log(g());',
    output: '9',
    tip: 'bind 不会立即执行；绑定后的 this 不能被 call / apply 再改。'
  },
  {
    id: 'class', group: 'function', name: 'class 类', short: 'class',
    syntax: 'class Name { constructor() { ... } }',
    summary: '定义构造函数的语法糖，方法挂在 prototype 上；必须用 new 调用。',
    returns: 'class', mutates: false,
    example: 'class User {\n  constructor() { this.n = 1; }\n}\nconsole.log(new User().n);',
    output: '1',
    tip: 'class 不会像函数声明那样提升；类方法默认严格模式。'
  },
  {
    id: 'private-field', group: 'function', name: '私有字段 #', short: '#field',
    syntax: 'class A { #value = 1; }',
    summary: '以 # 开头的字段只能在类内部访问，外部读取会抛 SyntaxError / TypeError。',
    returns: '—', mutates: false,
    example: 'class A {\n  #n = 1;\n  get() { return this.#n; }\n}\nconsole.log(new A().get());',
    output: '1',
    tip: '私有字段不是普通属性，不能被 Object.keys 或 JSON.stringify 读取。'
  },
  {
    id: 'static-method', group: 'function', name: 'static 静态方法', short: 'static',
    syntax: 'class A { static create() { ... } }',
    summary: '挂在类本身而不是实例上的方法，通过 A.create() 调用。',
    returns: '—', mutates: false,
    example: 'class A {\n  static hi() { return "hi"; }\n}\nconsole.log(A.hi());',
    output: 'hi',
    tip: '静态方法里的 this 指向类本身；实例方法里的 this 指向实例。'
  },
  {
    id: 'getter-setter', group: 'function', name: 'getter / setter', short: 'get / set',
    syntax: 'get value() { ... } / set value(v) { ... }',
    summary: '把属性读取和赋值接到函数上，可做计算属性、校验和副作用。',
    returns: '—', mutates: false,
    example: 'const o = { get double() { return 4; } };\nconsole.log(o.double);',
    output: '4',
    tip: 'getter 读取时不能有参数；setter 必须有且只有一个参数。'
  },

  /* DOM */
  {
    id: 'queryselector', group: 'dom', name: 'document.querySelector', short: 'querySelector()',
    syntax: 'document.querySelector(selector)',
    summary: '返回第一个匹配 CSS 选择器的元素；找不到返回 null。',
    returns: 'Element | null', mutates: false,
    example: 'const el = document.querySelector("#app");\nconsole.log(el?.id);',
    output: 'app',
    tip: '结果可能为 null，访问属性前先判断；需要全部匹配用 querySelectorAll。'
  },
  {
    id: 'queryselectorall', group: 'dom', name: 'document.querySelectorAll', short: 'querySelectorAll()',
    syntax: 'document.querySelectorAll(selector)',
    summary: '返回所有匹配元素的静态 NodeList；不会随 DOM 后续变化自动更新。',
    returns: 'NodeList', mutates: false,
    example: 'console.log(document.querySelectorAll(".item").length);',
    output: '2',
    tip: 'NodeList 不是数组；要 map / filter 先 Array.from 或展开。'
  },
  {
    id: 'createelement', group: 'dom', name: 'document.createElement', short: 'createElement()',
    syntax: 'document.createElement(tagName)',
    summary: '创建一个指定标签的新元素，尚未挂到文档上，需要 append 才显示。',
    returns: 'Element', mutates: false,
    example: 'const el = document.createElement("p");\nel.textContent = "hi";\nconsole.log(el.outerHTML);',
    output: '<p>hi</p>',
    tip: '创建后先设置内容再插入，减少多次 DOM 更新。'
  },
  {
    id: 'append', group: 'dom', name: 'Element.prototype.append', short: 'append()',
    syntax: 'parent.append(...nodesOrStrings)',
    summary: '把节点或字符串插到父元素末尾；字符串会变成文本节点。',
    returns: 'undefined', mutates: true,
    example: 'const ul = document.createElement("ul");\nconst li = document.createElement("li");\nli.textContent = "A";\nul.append(li);\nconsole.log(ul.children.length);',
    output: '1',
    tip: 'append 可一次传多个节点；appendChild 只接受一个节点并返回它。'
  },
  {
    id: 'prepend', group: 'dom', name: 'Element.prototype.prepend', short: 'prepend()',
    syntax: 'parent.prepend(...nodesOrStrings)',
    summary: '把节点或字符串插到父元素最前面。',
    returns: 'undefined', mutates: true,
    example: 'const ul = document.createElement("ul");\nconst li = document.createElement("li");\nli.textContent = "A";\nul.prepend(li);\nconsole.log(ul.firstElementChild.textContent);',
    output: 'A',
    tip: 'prepend 与 append 都是原地修改；需要相对某节点插入用 before / after。'
  },
  {
    id: 'remove', group: 'dom', name: 'Element.prototype.remove', short: 'remove()',
    syntax: 'element.remove()',
    summary: '把元素从父节点中移除；元素对象仍然存在，只是不再连接文档。',
    returns: 'undefined', mutates: true,
    example: 'const el = document.createElement("div");\ndocument.body.append(el);\nel.remove();\nconsole.log(el.isConnected);',
    output: 'false',
    tip: 'remove 不销毁对象；仍被引用的节点会留在内存中，事件监听也可能保留。'
  },
  {
    id: 'textcontent', group: 'dom', name: 'Node.prototype.textContent', short: 'textContent',
    syntax: 'element.textContent',
    summary: '读取或设置元素及其后代的纯文本；设置时不会解析 HTML。',
    returns: 'string', mutates: true,
    example: 'const el = document.createElement("p");\nel.textContent = "<b>hi</b>";\nconsole.log(el.innerHTML);',
    output: '&lt;b&gt;hi&lt;/b&gt;',
    tip: '插入用户输入优先用 textContent，天然避免 HTML 注入。'
  },
  {
    id: 'innerhtml', group: 'dom', name: 'Element.prototype.innerHTML', short: 'innerHTML',
    syntax: 'element.innerHTML',
    summary: '读取或设置元素内部的 HTML 字符串；设置时会解析标签并创建节点。',
    returns: 'string', mutates: true,
    example: 'const el = document.createElement("p");\nel.innerHTML = "<b>hi</b>";\nconsole.log(el.textContent);',
    output: 'hi',
    tip: 'innerHTML 拼接不可信输入会造成 XSS；优先 textContent 或模板节点。'
  },
  {
    id: 'classlist', group: 'dom', name: 'Element.prototype.classList', short: 'classList',
    syntax: 'element.classList.add/remove/toggle/contains',
    summary: '以集合方式操作 class 属性，避免手动拼接字符串。',
    returns: 'DOMTokenList', mutates: true,
    example: 'const el = document.createElement("div");\nel.classList.add("a");\nconsole.log(el.className);',
    output: 'a',
    tip: 'classList.toggle(name, force?) 的第二个参数可强制添加或删除。'
  },
  {
    id: 'dataset', group: 'dom', name: 'Element.prototype.dataset', short: 'dataset',
    syntax: 'element.dataset.key',
    summary: '读写 data-* 属性；dataset.userId 对应 data-user-id，自动做驼峰转换。',
    returns: 'DOMStringMap', mutates: true,
    example: 'const el = document.createElement("div");\nel.dataset.id = "7";\nconsole.log(el.getAttribute("data-id"));',
    output: '7',
    tip: 'dataset 的键名是驼峰；带连字符的属性名会被转换，不要手写 data- 前缀。'
  },
  {
    id: 'setattribute', group: 'dom', name: 'Element.prototype.setAttribute', short: 'setAttribute()',
    syntax: 'element.setAttribute(name, value)',
    summary: '设置或替换元素的属性值；value 会被转成字符串。',
    returns: 'undefined', mutates: true,
    example: 'const el = document.createElement("a");\nel.setAttribute("href", "/x");\nconsole.log(el.getAttribute("href"));',
    output: '/x',
    tip: '布尔属性只要存在就为真；removeAttribute 才是删除。'
  },
  {
    id: 'getattribute', group: 'dom', name: 'Element.prototype.getAttribute', short: 'getAttribute()',
    syntax: 'element.getAttribute(name)',
    summary: '读取元素属性字符串；属性不存在返回 null。',
    returns: 'string | null', mutates: false,
    example: 'const el = document.createElement("div");\nel.setAttribute("data-id", "7");\nconsole.log(el.getAttribute("data-id"));',
    output: '7',
    tip: 'getAttribute 返回字符串；需要布尔值用 hasAttribute 或 el.checked。'
  },

  /* 事件与浏览器 */
  {
    id: 'addeventlistener', group: 'event', name: 'EventTarget.addEventListener', short: 'addEventListener()',
    syntax: 'target.addEventListener(type, listener, options?)',
    summary: '注册事件监听器；options 可控制捕获、只触发一次和被动模式。',
    returns: 'undefined', mutates: true,
    example: 'const b = document.createElement("button");\nb.addEventListener("click", () => console.log("click"));\nb.click();',
    output: 'click',
    tip: '同一函数、同一捕获设置重复添加不会重复注册；匿名函数无法单独移除。'
  },
  {
    id: 'removeeventlistener', group: 'event', name: 'EventTarget.removeEventListener', short: 'removeEventListener()',
    syntax: 'target.removeEventListener(type, listener, options?)',
    summary: '移除之前注册的监听器；必须传入同一个函数引用和匹配的捕获设置。',
    returns: 'undefined', mutates: true,
    example: 'const b = document.createElement("button");\nconst h = () => console.log("x");\nb.addEventListener("click", h);\nb.removeEventListener("click", h);\nb.click();',
    output: '（不打印）',
    tip: 'bind 会生成新函数，原函数移除不掉；保存 bind 后的引用再移除。'
  },
  {
    id: 'event-target', group: 'event', name: 'event.target', short: 'event.target',
    syntax: 'event.target',
    summary: '触发事件的原始元素，事件冒泡过程中保持不变；常用于事件委托。',
    returns: 'EventTarget', mutates: false,
    example: 'list.addEventListener("click", e => console.log(e.target.dataset.id));\nitem.click();',
    output: '7',
    tip: 'target 可能是文本节点或子元素；需要元素时用 closest 向上找。'
  },
  {
    id: 'event-currenttarget', group: 'event', name: 'event.currentTarget', short: 'event.currentTarget',
    syntax: 'event.currentTarget',
    summary: '当前正在执行监听器的元素，即挂载 addEventListener 的那个节点。',
    returns: 'EventTarget', mutates: false,
    example: 'list.addEventListener("click", e => console.log(e.currentTarget === list));\nitem.click();',
    output: 'true',
    tip: 'currentTarget 在监听器执行期间才有值；异步回调里通常已经变成 null。'
  },
  {
    id: 'preventdefault', group: 'event', name: 'event.preventDefault', short: 'preventDefault()',
    syntax: 'event.preventDefault()',
    summary: '阻止事件的默认行为，例如表单提交、链接跳转和右键菜单。',
    returns: 'undefined', mutates: false,
    example: 'form.addEventListener("submit", e => {\n  e.preventDefault();\n  console.log("blocked");\n});\nform.requestSubmit();',
    output: 'blocked',
    tip: 'preventDefault 不能阻止事件传播；阻止冒泡用 stopPropagation。'
  },
  {
    id: 'stoppropagation', group: 'event', name: 'event.stopPropagation', short: 'stopPropagation()',
    syntax: 'event.stopPropagation()',
    summary: '阻止事件继续冒泡或捕获，当前元素上的其他监听器仍会执行。',
    returns: 'undefined', mutates: false,
    example: 'child.addEventListener("click", e => e.stopPropagation());\nparent.addEventListener("click", () => console.log("parent"));\nchild.click();',
    output: '（不打印 parent）',
    tip: 'stopPropagation 不等于 stopImmediatePropagation；后者还会阻止同元素后续监听器。'
  },
  {
    id: 'domcontentloaded', group: 'event', name: 'DOMContentLoaded', short: 'DOMContentLoaded',
    syntax: 'document.addEventListener("DOMContentLoaded", handler)',
    summary: 'DOM 解析完成时触发，不必等待图片、样式等外部资源加载完成。',
    returns: '—', mutates: false,
    example: 'document.addEventListener("DOMContentLoaded", () => {\n  console.log("dom ready");\n});',
    output: 'dom ready',
    tip: '脚本放在 body 末尾时通常无需再监听；需要等资源用 window.load。'
  },
  {
    id: 'localstorage-setitem', group: 'event', name: 'localStorage.setItem', short: 'setItem()',
    syntax: 'localStorage.setItem(key, value)',
    summary: '把字符串写入当前源的持久存储；值不是字符串会被转成字符串。',
    returns: 'undefined', mutates: true,
    example: 'localStorage.setItem("theme", "dark");\nconsole.log(localStorage.getItem("theme"));',
    output: 'dark',
    tip: '只存字符串；对象先 JSON.stringify，读时 JSON.parse。'
  },
  {
    id: 'localstorage-getitem', group: 'event', name: 'localStorage.getItem', short: 'getItem()',
    syntax: 'localStorage.getItem(key)',
    summary: '读取指定键的字符串值；键不存在返回 null。',
    returns: 'string | null', mutates: false,
    example: 'console.log(localStorage.getItem("missing"));',
    output: 'null',
    tip: 'null 与字符串 "null" 不同；JSON.parse(null) 会得到 null，不要误判。'
  },
  {
    id: 'localstorage-removeitem', group: 'event', name: 'localStorage.removeItem', short: 'removeItem()',
    syntax: 'localStorage.removeItem(key)',
    summary: '删除指定键；键不存在时静默返回，不报错。',
    returns: 'undefined', mutates: true,
    example: 'localStorage.removeItem("theme");\nconsole.log(localStorage.getItem("theme"));',
    output: 'null',
    tip: 'clear() 会清空当前源全部 localStorage；只删一项用 removeItem。'
  },
  {
    id: 'history-pushstate', group: 'event', name: 'history.pushState', short: 'pushState()',
    syntax: 'history.pushState(state, title, url?)',
    summary: '向浏览器历史栈新增一条记录并改变 URL，不触发页面刷新。',
    returns: 'undefined', mutates: true,
    example: 'history.pushState({ page: 1 }, "", "/lesson");\nconsole.log(location.pathname);',
    output: '/lesson',
    tip: 'pushState 不会触发 popstate；只有用户前进后退时才触发。'
  },
  {
    id: 'closest', group: 'event', name: 'Element.prototype.closest', short: 'closest()',
    syntax: 'element.closest(selector)',
    summary: '从当前元素向上查找最近的匹配祖先（包含自身），找不到返回 null。',
    returns: 'Element | null', mutates: false,
    example: 'item.addEventListener("click", e => {\n  console.log(e.target.closest("li")?.dataset.id);\n});\nitem.click();',
    output: '7',
    tip: 'closest 只在祖先方向查；找后代用 querySelector。'
  },

  /* 异步与网络 */
  {
    id: 'settimeout', group: 'async', name: 'setTimeout', short: 'setTimeout()',
    syntax: 'setTimeout(callback, delay, ...args)',
    summary: '在至少 delay 毫秒后把回调放入宏任务队列；实际执行会受主线程忙碌影响。',
    returns: 'number', mutates: false,
    example: 'setTimeout(() => console.log("later"), 0);\nconsole.log("now");',
    output: 'now\nlater',
    tip: 'delay 是最小等待，不是精确时间；不要用它做精确动画计时。'
  },
  {
    id: 'queuemicrotask', group: 'async', name: 'queueMicrotask', short: 'queueMicrotask()',
    syntax: 'queueMicrotask(callback)',
    summary: '把回调加入微任务队列；会在当前同步代码和当前宏任务之后、下一次渲染前执行。',
    returns: 'undefined', mutates: false,
    example: 'queueMicrotask(() => console.log("micro"));\nconsole.log("sync");',
    output: 'sync\nmicro',
    tip: '微任务异常会进入全局错误处理；不要用它替代 Promise 的业务状态。'
  },
  {
    id: 'promise-resolve', group: 'async', name: 'Promise.resolve', short: 'Promise.resolve()',
    syntax: 'Promise.resolve(value)',
    summary: '返回一个已 fulfilled 的 Promise；如果 value 本身是 Promise 会原样返回。',
    returns: 'Promise', mutates: false,
    example: 'Promise.resolve(3).then(v => console.log(v));',
    output: '3',
    tip: 'Promise.resolve 的 then 回调仍是异步微任务，不会同步执行。'
  },
  {
    id: 'promise-all', group: 'async', name: 'Promise.all', short: 'Promise.all()',
    syntax: 'Promise.all(iterable)',
    summary: '等待所有 Promise 成功，结果按输入顺序组成数组；任一失败立即 reject。',
    returns: 'Promise', mutates: false,
    example: 'Promise.all([Promise.resolve(1), 2]).then(v => console.log(v));',
    output: '[1, 2]',
    tip: '不是按完成顺序，而是按输入顺序；需要保留失败结果用 allSettled。'
  },
  {
    id: 'promise-allsettled', group: 'async', name: 'Promise.allSettled', short: 'Promise.allSettled()',
    syntax: 'Promise.allSettled(iterable)',
    summary: '等待所有 Promise 结束，不论成功或失败；结果为 {status, value/reason} 数组。',
    returns: 'Promise', mutates: false,
    example: 'Promise.allSettled([Promise.resolve(1), Promise.reject("x")])\n  .then(r => console.log(r[1].status));',
    output: 'rejected',
    tip: 'allSettled 本身总是 fulfilled；适合批量任务不希望一个失败拖垮全部。'
  },
  {
    id: 'promise-race', group: 'async', name: 'Promise.race', short: 'Promise.race()',
    syntax: 'Promise.race(iterable)',
    summary: '返回第一个 settled 的 Promise 结果，无论成功或失败；常用于超时竞速。',
    returns: 'Promise', mutates: false,
    example: 'Promise.race([\n  new Promise(r => setTimeout(() => r("slow"), 50)),\n  Promise.resolve("fast")\n]).then(v => console.log(v));',
    output: 'fast',
    tip: 'race 不会取消其余任务；需要取消用 AbortController。'
  },
  {
    id: 'promise-then', group: 'async', name: 'Promise.prototype.then', short: 'then()',
    syntax: 'promise.then(onFulfilled, onRejected?)',
    summary: '注册成功和失败回调，返回新 Promise，可继续链式转换结果。',
    returns: 'Promise', mutates: false,
    example: 'Promise.resolve(2).then(v => v * 2).then(v => console.log(v));',
    output: '4',
    tip: 'then 回调返回值会成为下一个 Promise 的值；抛错会进入下游 catch。'
  },
  {
    id: 'promise-catch', group: 'async', name: 'Promise.prototype.catch', short: 'catch()',
    syntax: 'promise.catch(onRejected)',
    summary: '等价于 then(undefined, onRejected)，捕获链上之前未处理的 rejection。',
    returns: 'Promise', mutates: false,
    example: 'Promise.reject("boom").catch(e => console.log("caught", e));',
    output: 'caught boom',
    tip: 'catch 放在链尾才能兜住前面所有 then 的抛错；不要在每个 then 里重复 catch。'
  },
  {
    id: 'promise-finally', group: 'async', name: 'Promise.prototype.finally', short: 'finally()',
    syntax: 'promise.finally(onFinally)',
    summary: '无论成功或失败都执行清理回调；不接收值，也不改变原结果。',
    returns: 'Promise', mutates: false,
    example: 'Promise.resolve()\n  .finally(() => console.log("clean"))\n  .then(() => console.log("then"));',
    output: 'clean\nthen',
    tip: 'finally 回调抛错会覆盖原结果；清理逻辑不要依赖成功值。'
  },
  {
    id: 'async-function', group: 'async', name: 'async function', short: 'async',
    syntax: 'async function f() { ... }',
    summary: '声明异步函数，调用后总是返回 Promise；内部 return 的值会被包装成 fulfilled。',
    returns: 'Promise', mutates: false,
    example: 'async function f() { return 1; }\nf().then(v => console.log(v));',
    output: '1',
    tip: 'async 函数抛错会变成 rejected Promise；调用处仍需 catch 或 await。'
  },
  {
    id: 'await', group: 'async', name: 'await', short: 'await',
    syntax: 'const value = await promise',
    summary: '暂停 async 函数直到 Promise settled，取出成功值；只能在 async 函数或模块顶层使用。',
    returns: 'any', mutates: false,
    example: 'async function f() {\n  const v = await Promise.resolve(5);\n  console.log(v);\n}\nf();',
    output: '5',
    tip: 'await 看起来像同步，实际会把后续代码放进微任务；不要阻塞外层同步逻辑。'
  },
  {
    id: 'fetch', group: 'async', name: 'fetch', short: 'fetch()',
    syntax: 'fetch(url, options?)',
    summary: '发起网络请求，返回 Response 的 Promise；HTTP 4xx/5xx 不会自动 reject。',
    returns: 'Promise<Response>', mutates: false,
    example: 'fetch("/api")\n  .then(res => console.log(res.status));',
    output: '200',
    tip: '业务前先检查 res.ok 或 res.status；解析 JSON 要再 await res.json()。'
  },
  {
    id: 'abortcontroller', group: 'async', name: 'AbortController', short: 'AbortController',
    syntax: 'const c = new AbortController(); fetch(url, { signal: c.signal }); c.abort();',
    summary: '用 signal 取消 fetch 等异步操作；abort 后 Promise 以 AbortError reject。',
    returns: 'AbortController', mutates: false,
    example: 'const c = new AbortController();\nfetch("/slow", { signal: c.signal })\n  .catch(e => console.log(e.name));\nc.abort();',
    output: 'AbortError',
    tip: '一个 controller 只能取消一次；每次新请求创建新 controller。'
  }
];
