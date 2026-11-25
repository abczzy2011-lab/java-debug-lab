window.PY_FOUNDATIONS_REVIEW3 = Object.assign(window.PY_FOUNDATIONS_REVIEW3 || {}, {
  "ch2-3": [
    {
      h: "术语卡：文本、字节与文件",
      p: `术语卡一：字符与字节。[[str]] 是 Unicode 码点序列，[[bytes]] 是 0-255 的字节序列；[[len("中")]] 是 1，[[len("中".encode("utf-8"))]] 是 3。[[encode()]] 把 str 变 bytes，[[decode()]] 把 bytes 变 str；两者默认 strict，编码不匹配就抛异常。\n\n术语卡二：编码与换行。UTF-8 是变长编码，ASCII 兼容；GBK 是另一套编码，不能和 UTF-8 互读。BOM 是文件头标记，[[utf-8-sig]] 读写时处理它；换行 Windows 用 [[\r\n]]，Unix 用 [[\n]]，文本模式默认转换，[[newline=""]] 保留原样。\n\n术语卡三：错误策略。[[errors="strict"]] 直接失败，[[ignore]] 静默丢字符，[[replace]] 留替换符，[[backslashreplace]] 留转义。生产数据不要用 ignore 掩盖问题；需要容错时记录偏移和上下文。\n\n术语卡四：文件读取。[[open()]] 返回迭代器，[[for line in f]] 逐行读，[[readlines()]] 物化全部；大文件用流式。文本模式解码，二进制模式 [[rb]] 读原始字节；写文件指定编码和换行。检查点：[[len("中")]] 和 [[len("中".encode())]] 差多少？BOM 用哪个编码参数？[[errors="ignore"]] 为什么危险？`,
      code: String.raw`text = "中"
print(len(text), len(text.encode("utf-8")))
print(text.encode("utf-8"))
print(b"\xe4\xb8\xad".decode("utf-8"))
print("中".encode("ascii", errors="replace"))
print("中".encode("ascii", errors="ignore"))`,
      output: `1 3
b'\xe4\xb8\xad'
中
b'?'
b''`,
      tip: `[[errors="ignore"]] 会静默丢掉字符；线上数据宁可直接失败，也不要悄悄损坏。`
    }
  ],
  "ch3-3": [
    {
      h: "术语卡：元组、记录与解包",
      p: `术语卡一：不可变与可哈希。元组本身不可变，但内部元素可能可变；[[(1, [2])]] 不可哈希，不能当字典键。元组可哈希的前提是所有元素递归可哈希；frozenset、字符串、数字、None 可以。\n\n术语卡二：逗号。[[(1)]] 是整数，[[(1,)]] 是单元素元组；[[1, 2]] 不加括号也是元组。函数返回多个值本质返回元组；调用方可以整体接收或解包。\n\n术语卡三：解包。左边元素数要匹配，[[*rest]] 吸收剩余且只能出现一次；嵌套解包适合固定结构，结构不固定就改用字段访问。解包 [[None]] 会抛 TypeError，可能返回 None 的函数先判断。\n\n术语卡四：记录。namedtuple 给元组加字段名，[[_replace()]] 返回新记录；dataclass 适合需要校验/默认值/方法的场景。元组适合轻量只读记录，不适合频繁修改。检查点：[[(1)]] 和 [[(1,)]] 类型一样吗？[[(1, [2])]] 能当字典键吗？解包 [[None]] 会怎样？`,
      code: String.raw`one = (1)
two = (1,)
print(type(one), type(two))

row = ("S01", ("林晓", 91))
sid, (name, score) = row
print(sid, name, score)

try:
    a, b = None
except TypeError as err:
    print(err)`,
      output: `<class 'int'> <class 'tuple'>
S01 林晓 91
cannot unpack non-iterable NoneType object`,
      tip: `[[(1)]] 只是加括号的整数；单元素元组必须写 [[(1,)]]，函数返回单值元组也一样。`
    }
  ]
});
