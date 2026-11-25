/* Python 课程加餐 · 每章 1 节工程实战工作坊，18 节 / 108 个正文小节。 */
window.PY_FOUNDATIONS_CAPSTONES = {
  "ch1": {
    "id": "ch1-capstone",
    "title": "加餐：写一个命令行单位换算器",
    "minutes": 45,
    "lead": "把输入、解析、计算、格式化拆开，做一个能处理公里/英里、摄氏/华氏的小 CLI。第一次体会“脚本”和“工具”的差别。",
    "sections": [
      {
        "h": "需求现场",
        "p": "用户运行 `python convert.py 10 km mi`，输出 `6.21 mi`。要求支持 km/mi、kg/lb、c/f 三组换算；参数缺失时打印用法；单位不认识时返回非零退出码。",
        "code": "",
        "output": "",
        "tip": "CLI 的第一课不是 argparse，而是把“参数、计算、输出”分开。"
      },
      {
        "h": "设计与数据流",
        "p": "先写纯函数 `convert(value, src, dst)`，内部用换算表；再写 `parse_args(argv)`；最后 `main()` 负责打印和退出码。纯函数可以单独测试，不用启动进程。",
        "code": "RATES = {\n    ('km', 'mi'): 0.621371,\n    ('mi', 'km'): 1.609344,\n    ('kg', 'lb'): 2.2046226,\n    ('lb', 'kg'): 0.4535924,\n}",
        "output": "convert(10, 'km', 'mi') -> 6.21371",
        "tip": "换算表用有向键，反向不要靠手算倒数；精度问题会在边界处放大。"
      },
      {
        "h": "最小实现",
        "p": "温度换算不是比例关系，单独分支处理。长度和质量直接乘系数。输出统一保留两位小数，单位跟在数值后面。",
        "code": "def convert(value, src, dst):\n    src, dst = src.lower(), dst.lower()\n    if src == 'c' and dst == 'f':\n        return value * 9 / 5 + 32\n    if src == 'f' and dst == 'c':\n        return (value - 32) * 5 / 9\n    rate = RATES.get((src, dst))\n    if rate is None:\n        raise ValueError(f'不支持 {src} -> {dst}')\n    return value * rate",
        "output": "convert(100, 'c', 'f') -> 212.0\nconvert(10, 'km', 'mi') -> 6.21371",
        "tip": "温度有偏移量，不能套用乘法表；先把“线性”和“仿射”分开。"
      },
      {
        "h": "边界与错误",
        "p": "负数、0、超大值、大小写、空格、`km->mi` 连写、参数个数不对。用 `argparse` 的 `type=float` 会替你报错，但错误信息是英文；教学阶段可以先手写解析，理解流程。",
        "code": "try:\n    value = float(argv[1])\nexcept (IndexError, ValueError):\n    print('用法: convert.py 数值 源单位 目标单位')\n    return 2",
        "output": "缺参数 -> 用法提示，退出码 2",
        "tip": "退出码也是接口：0 成功、1 计算错误、2 用法错误，脚本才能被其他程序调用。"
      },
      {
        "h": "验收与测试",
        "p": "用 pytest 参数化测三组换算、反向换算、非法单位、缺参数。CLI 层用 `subprocess.run` 测 stdout 和 returncode，不要只测纯函数。",
        "code": "import pytest\n@pytest.mark.parametrize('v,s,d,w', [(10,'km','mi',6.21),(100,'c','f',212.0)])\ndef test_convert(v,s,d,w):\n    assert round(convert(v,s,d), 2) == w",
        "output": "2 passed",
        "tip": "纯函数测逻辑，subprocess 测 CLI；两层都测才算完整。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加 `--json` 输出、批量文件换算、单位别名（公里/千米）；再用 `argparse` 重写一遍，比较手写解析和标准库的代码量。最后打包成 `python -m converter`。",
        "code": "",
        "output": "",
        "tip": "先手写再上库，你才知道库替你省了哪些边界。"
      }
    ],
    "points": [
      "参数、计算、输出三层分开。",
      "温度换算是仿射变换，不是乘法。",
      "退出码是 CLI 接口的一部分。"
    ],
    "practice": "实现 convert.py，支持三组换算、用法提示和 pytest 参数化测试。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch2": {
    "id": "ch2-capstone",
    "title": "加餐：日志脱敏与格式化",
    "minutes": 45,
    "lead": "把含手机号、邮箱、身份证的日志变成可分享的版本，同时保留级别、时间和模块。正则要准，不能把正常数字也吃掉。",
    "sections": [
      {
        "h": "需求现场",
        "p": "线上日志要发给外部排查，但里面有用户手机号和邮箱。要求：手机号中间四位打码，邮箱保留首字母、域名保留，身份证只留前六后四；其他内容不动。",
        "code": "",
        "output": "",
        "tip": "脱敏是“精确替换”，不是把所有数字都抹掉；先列敏感模式。"
      },
      {
        "h": "设计与数据流",
        "p": "三个正则分别匹配手机号、邮箱、身份证；用 `re.sub` 配合回调函数，按模式替换。处理顺序先长后短，避免身份证被手机号规则先切走。",
        "code": "PHONE = re.compile(r'(?<!\\d)(1[3-9]\\d{9})(?!\\d)')\nEMAIL = re.compile(r'([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})')",
        "output": "13812345678 -> 138****5678\ntom@example.com -> t***@example.com",
        "tip": "用前后断言 `(?<!\\d)`/`(?!\\d)` 防止把 11 位号码从更长数字里截出来。"
      },
      {
        "h": "最小实现",
        "p": "写 `mask_phone`、`mask_email`、`mask_id`，再组合成 `mask_line`。回调函数里用分组保留需要的部分，不要用固定切片。",
        "code": "def mask_phone(m):\n    s = m.group(1)\n    return s[:3] + '****' + s[7:]\ndef mask_line(line):\n    line = PHONE.sub(mask_phone, line)\n    line = EMAIL.sub(lambda m: m.group(1) + '***@' + m.group(2), line)\n    return line",
        "output": "mask_line('call 13812345678') -> 'call 138****5678'",
        "tip": "回调比固定切片安全；号码格式变了也只改正则。"
      },
      {
        "h": "边界与错误",
        "p": "座机、带 +86、空格分隔、多个号码、日志里本来就有 `****`、JSON 转义。脱敏后要保证原日志结构不变；不要把时间戳误伤。",
        "code": "line = '+86 138 1234 5678'\n# 先归一化空格再匹配，或把正则写成允许分隔符\nPHONE_SPACED = re.compile(r'1[3-9]\\d[\\s-]?\\d{4}[\\s-]?\\d{4}')",
        "output": "+86 138 1234 5678 -> +86 138****5678",
        "tip": "先决定“要不要保留国家码”，再写正则；否则替换位置会错。"
      },
      {
        "h": "验收与测试",
        "p": "准备正常日志、带多个号码、带邮箱、带身份证、无敏感信息五组样本。断言脱敏后的字符串仍包含时间、级别和模块名，敏感原文不出现。",
        "code": "src = '2026-11-25 INFO user=13812345678 mail=tom@example.com'\nout = mask_line(src)\nassert '13812345678' not in out and 'tom@' not in out\nassert 'INFO' in out and '2026-11-25' in out",
        "output": "通过：敏感信息消失，结构保留",
        "tip": "测试不仅要断言“被替换”，还要断言“不该动的没动”。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加配置文件自定义规则、批量处理日志文件、脱敏前后 diff 预览；再考虑用 `logging.Formatter` 在输出阶段统一脱敏。最后写一条“误杀率”统计。",
        "code": "",
        "output": "",
        "tip": "脱敏规则要可配置、可审计；硬编码在业务代码里很难维护。"
      }
    ],
    "points": [
      "先列敏感模式，再写正则。",
      "用前后断言防止截断长数字。",
      "脱敏要保留日志结构。"
    ],
    "practice": "实现 mask_line，覆盖手机、邮箱、身份证，并用五组样本验证不误伤。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch3": {
    "id": "ch3-capstone",
    "title": "加餐：成绩序列分析",
    "minutes": 45,
    "lead": "给一组成绩算平均、中位数、标准差、及格率和最高分。别急着上 NumPy，先用标准库把统计口径讲清楚。",
    "sections": [
      {
        "h": "需求现场",
        "p": "老师给一个班的成绩列表，要一份小报告：人数、平均分、中位数、最高/最低、及格率、标准差。还要能处理缺考（None）和 0 分，两者含义不同。",
        "code": "",
        "output": "",
        "tip": "统计题先问口径：缺考算不算人数？0 分算不算及格？口径不清，数字全白算。"
      },
      {
        "h": "设计与数据流",
        "p": "输入 `scores: list[float|None]`；先分离有效成绩和缺考数量；有效成绩排序后算中位数；及格率用“及格人数 / 有效人数”。标准差用样本还是总体，要注明。",
        "code": "from statistics import mean, median, pstdev\nvalid = [x for x in scores if x is not None]\nabsent = len(scores) - len(valid)",
        "output": "mean=78.4, median=80, absent=2",
        "tip": "`None` 和 0 必须分开；把缺考当 0 会拉低平均分。"
      },
      {
        "h": "最小实现",
        "p": "写 `report(scores)` 返回字典，所有指标一次算完。中位数用 `statistics.median`，标准差用 `pstdev`（总体）或 `stdev`（样本），在输出里写清楚。",
        "code": "def report(scores):\n    valid = [x for x in scores if x is not None]\n    if not valid:\n        return {'count': 0, 'absent': len(scores)}\n    return {\n        'count': len(valid), 'absent': len(scores) - len(valid),\n        'mean': round(mean(valid), 2), 'median': median(valid),\n        'max': max(valid), 'min': min(valid),\n        'pass_rate': round(sum(x >= 60 for x in valid) / len(valid), 4),\n        'std': round(pstdev(valid), 2)\n    }",
        "output": "{'count': 40, 'absent': 2, 'mean': 78.4, ...}",
        "tip": "空列表要单独返回，别让 `mean([])` 抛 StatisticsError。"
      },
      {
        "h": "边界与错误",
        "p": "全缺考、只有一个成绩、成绩为字符串、超过 100、负数、浮点精度。中位数对偶数个元素取平均；及格线可能是 60 也可能是 50，必须配置。",
        "code": "if not valid:\n    return {'count': 0, 'absent': len(scores), 'mean': None}\nif any(not isinstance(x, (int, float)) for x in valid):\n    raise TypeError('成绩必须是数字')",
        "output": "全缺考 -> mean=None，不抛异常",
        "tip": "统计函数要能表达“没有数据”，不要用 0 冒充。"
      },
      {
        "h": "验收与测试",
        "p": "用固定小数据手算期望值：`[100, 90, None, 0]` 的有效人数 3、平均 63.33、及格率 2/3。再测空列表、单元素、偶数个中位数。",
        "code": "assert report([100, 90, None, 0])['count'] == 3\nassert report([100, 90, None, 0])['pass_rate'] == 0.6667\nassert report([])['mean'] is None",
        "output": "通过：count=3, pass_rate=0.6667\n空列表 mean=None",
        "tip": "测试数据要小到能手算，否则断言错了你也看不出来。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加分数段分布（90+/80-89/...）、班级排名、按学号分组；再用 pandas 的 `describe()` 对照你的结果。最后把报告导出 CSV 和 Markdown。",
        "code": "",
        "output": "",
        "tip": "先手算标准库，再用 pandas 对照；差异能帮你发现口径问题。"
      }
    ],
    "points": [
      "缺考和 0 分必须分开。",
      "空数据要返回可表达的 None。",
      "统计口径写进输出。"
    ],
    "practice": "实现 report(scores)，输出人数、平均、中位数、极值、及格率、标准差。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch4": {
    "id": "ch4-capstone",
    "title": "加餐：词频索引与查重",
    "minutes": 45,
    "lead": "给一段文本建词频表，支持按频次排序、按前缀查询、找出重复短语。用 Counter、defaultdict 和倒排索引组合。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一个文档管理系统要查“哪些词出现最多”“包含某个前缀的词有哪些”“哪些句子重复”。文本不大，但要求查询快、结果稳定。",
        "code": "",
        "output": "",
        "tip": "先定义“词”的边界：中文分词、英文按空格、标点算不算？别默认 split 就完事。"
      },
      {
        "h": "设计与数据流",
        "p": "清洗 → 分词 → 计数 → 建索引。词频用 Counter；前缀索引用字典 `prefix -> set(words)`；重复句子用集合去重并记录次数。所有结果按 `(-count, word)` 排序，保证稳定。",
        "code": "from collections import Counter, defaultdict\nwords = re.findall(r'[a-zA-Z]+', text.lower())\nfreq = Counter(words)",
        "output": "freq.most_common(3) -> [('the', 12), ('data', 9), ...]",
        "tip": "英文正则用 `[a-zA-Z]+` 会把 `don't` 拆成两个词；先接受这个简化，再按需求调整。"
      },
      {
        "h": "最小实现",
        "p": "写 `build_index(text)` 返回 `{freq, prefix, duplicates}`。前缀索引只存长度 1–3 的前缀，避免内存爆炸；重复句子按换行切分、strip 后比较。",
        "code": "def build_index(text):\n    words = re.findall(r'[a-zA-Z]+', text.lower())\n    freq = Counter(words)\n    prefix = defaultdict(set)\n    for w in freq:\n        for i in range(1, min(3, len(w)) + 1):\n            prefix[w[:i]].add(w)\n    lines = [x.strip() for x in text.splitlines() if x.strip()]\n    dup = {x for x in lines if lines.count(x) > 1}\n    return {'freq': freq, 'prefix': prefix, 'duplicates': dup}",
        "output": "build_index(text)['prefix']['dat'] -> {'data', 'database'}",
        "tip": "`lines.count(x)` 在循环里是 O(n²)；数据大时改用 Counter。"
      },
      {
        "h": "边界与错误",
        "p": "大小写、标点、空文本、超长文本、Unicode、停用词、词形变化（run/runs）。中文没有空格，不能直接用 `split()`；需要 jieba 或按字/词库处理。",
        "code": "if not text.strip():\n    return {'freq': Counter(), 'prefix': defaultdict(set), 'duplicates': set()}",
        "output": "空文本 -> 三个空结构",
        "tip": "空输入要返回空结构，不要返回 None 让调用方到处判空。"
      },
      {
        "h": "验收与测试",
        "p": "用一段三行文本断言词频、前缀查询、重复行。再测大小写合并、空文本、标点分隔。排序结果要逐项断言，不能只看长度。",
        "code": "idx = build_index('Data data\\nData\\nhello world')\nassert idx['freq']['data'] == 3\nassert idx['duplicates'] == {'Data'}",
        "output": "通过：data=3，重复行={'Data'}",
        "tip": "词频测试要断言具体计数，不能只断言 most_common 非空。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加停用词过滤、词干提取、TF-IDF 权重、中文分词；再把索引持久化成 JSON。最后做一个最小的搜索接口：输入前缀，返回 Top 5 词。",
        "code": "",
        "output": "",
        "tip": "索引是“空间换时间”；先估内存，再决定存几层前缀。"
      }
    ],
    "points": [
      "先定义词边界，再统计。",
      "前缀索引限制深度，控制内存。",
      "重复行统计避免 O(n²)。"
    ],
    "practice": "实现 build_index，返回词频、前缀索引和重复行，并用固定文本断言计数。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch5": {
    "id": "ch5-capstone",
    "title": "加餐：命令行菜单状态机",
    "minutes": 45,
    "lead": "用 while + match 写一个不会乱跳的菜单：主菜单、列表、详情、返回、退出。状态用字符串，转移写清楚。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一个小工具需要交互菜单：1 查看列表，2 查看详情，3 返回，0 退出。用户乱输入不能崩；进入详情后按 3 回主菜单，按 0 退出。",
        "code": "",
        "output": "",
        "tip": "菜单本质是状态机；把状态和转移画出来，比堆 if 清楚。"
      },
      {
        "h": "设计与数据流",
        "p": "状态 `state = 'main'`；循环读一行输入；用 `match state` 分派；每个分支只负责当前状态能做的事。非法输入留在原状态并提示。",
        "code": "state = 'main'\nwhile state != 'exit':\n    cmd = input('> ').strip()\n    match state:\n        case 'main':\n            state = handle_main(cmd)\n        case 'detail':\n            state = handle_detail(cmd)",
        "output": "main + '1' -> list\nlist + '2' -> detail\ndetail + '3' -> main",
        "tip": "状态转移函数返回下一个状态，不要直接改全局变量。"
      },
      {
        "h": "最小实现",
        "p": "写两个处理函数，返回状态字符串。`0` 在任何状态都退出；`q` 也退出；其他非法输入打印可用命令。详情页需要知道当前选中项，用一个 `selected` 变量。",
        "code": "def handle_main(cmd):\n    if cmd in ('0', 'q'): return 'exit'\n    if cmd == '1': return 'list'\n    print('可用: 1 列表 / 0 退出')\n    return 'main'",
        "output": "输入 9 -> 提示后仍在 main\n输入 0 -> exit",
        "tip": "每个分支都要有兜底，别让未知输入掉进死循环。"
      },
      {
        "h": "边界与错误",
        "p": "EOF（用户按 Ctrl-D）、空输入、连续非法输入、状态变量拼错、详情页没选项、退出时资源未关闭。`input()` 在管道输入结束时会抛 EOFError，要捕获。",
        "code": "try:\n    cmd = input('> ').strip()\ncatch = None\nexcept EOFError:\n    break",
        "output": "Ctrl-D -> 安全退出",
        "tip": "CLI 要考虑非交互输入；`yes | python menu.py` 不能把程序卡死。"
      },
      {
        "h": "验收与测试",
        "p": "用 `unittest.mock.patch('builtins.input', side_effect=[...])` 模拟一串输入，断言最终状态和输出。覆盖正常路径、非法输入、EOF、退出。",
        "code": "with patch('builtins.input', side_effect=['1', '2', '3', '0']):\n    assert run_menu() == 'exit'",
        "output": "通过：退出",
        "tip": "状态机测试用输入序列，不要只测单个处理函数。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把状态和转移写成字典 `transitions = {('main','1'):'list'}`，再加撤销、帮助、配置加载。最后用 `argparse` 做一个非交互子命令版本，交互和脚本共用业务函数。",
        "code": "",
        "output": "",
        "tip": "交互层和业务层分开；以后加 GUI 或 API 时不用重写核心。"
      }
    ],
    "points": [
      "菜单是状态机，状态转移要显式。",
      "未知输入留在原状态并提示。",
      "捕获 EOF，支持非交互输入。"
    ],
    "practice": "实现四状态菜单，覆盖正常、非法、EOF、退出四组输入序列。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch6": {
    "id": "ch6-capstone",
    "title": "加餐：参数校验装饰器",
    "minutes": 45,
    "lead": "写一个 `@validate` 装饰器，检查参数类型、范围和必填。被装饰的函数保持原签名和文档，错误信息指出具体参数。",
    "sections": [
      {
        "h": "需求现场",
        "p": "业务函数经常收到脏参数：年龄是字符串、金额是负数、用户名是空串。每个函数手写 if 很烦，想要一个装饰器统一校验，且不影响函数本身的职责。",
        "code": "",
        "output": "",
        "tip": "装饰器只做横切关注点；业务逻辑不要塞进装饰器。"
      },
      {
        "h": "设计与数据流",
        "p": "`validate(**rules)` 接收参数规则；装饰器用 `functools.wraps` 保留元信息；调用前用 `inspect.signature` 把实参绑定成字典，再逐条校验；通过后调用原函数。",
        "code": "import inspect\nfrom functools import wraps\ndef validate(**rules):\n    def deco(fn):\n        @wraps(fn)\n        def wrapper(*args, **kwargs):\n            bound = inspect.signature(fn).bind(*args, **kwargs)\n            for name, rule in rules.items():\n                rule(name, bound.arguments.get(name))\n            return fn(*args, **kwargs)\n        return wrapper\n    return deco",
        "output": "wrapper.__name__ == fn.__name__ -> True",
        "tip": "用 `inspect.signature.bind` 兼容位置参数和关键字参数，别手工拆 args。"
      },
      {
        "h": "最小实现",
        "p": "规则函数接收 `(name, value)`，不满足就抛 ValueError。先实现 required、min、max、type 四个规则，再组合。错误信息统一成 `参数 age 必须 >= 0，实际 -1`。",
        "code": "def minimum(n):\n    def rule(name, value):\n        if value is None or value < n:\n            raise ValueError(f'参数 {name} 必须 >= {n}，实际 {value}')\n    return rule\n@validate(age=minimum(0))\ndef create_user(name, age): ...",
        "output": "create_user('Ada', -1) -> ValueError",
        "tip": "规则函数只负责判断，错误文案由规则统一生成。"
      },
      {
        "h": "边界与错误",
        "p": "默认参数、`*args`、`**kwargs`、可选参数为 None、布尔是 int 的子类、装饰器顺序、异步函数。`bind` 不会自动应用默认值，需要 `apply_defaults()`。",
        "code": "bound = inspect.signature(fn).bind(*args, **kwargs)\nbound.apply_defaults()",
        "output": "默认值 age=0 也会进入校验",
        "tip": "不调用 `apply_defaults`，默认参数会漏校验。"
      },
      {
        "h": "验收与测试",
        "p": "测合法调用、越界、缺参、关键字参数、默认值、函数元信息保留。再测装饰器叠加顺序：先校验后日志，或反过来，结果应一致。",
        "code": "assert create_user.__name__ == 'create_user'\nwith pytest.raises(ValueError, match='age'):\n    create_user('Ada', -1)",
        "output": "通过：元信息保留，错误含参数名",
        "tip": "装饰器测试要断言 `__name__` 和 `__doc__`，否则调试时找不到函数。"
      },
      {
        "h": "新手加练与扩展",
        "p": "支持自定义错误类型、把多个错误收集成列表、用 `pydantic` 重写一版。再加异步装饰器，注意 `async def` 要返回协程，不能直接 `fn(*args)`。",
        "code": "",
        "output": "",
        "tip": "同步和异步装饰器要分开写；混用会让函数变成普通值。"
      }
    ],
    "points": [
      "装饰器做横切校验，不抢业务逻辑。",
      "用 signature.bind 兼容参数形态。",
      "apply_defaults 后默认值也校验。"
    ],
    "practice": "实现 @validate，支持 required/min/max/type，并测默认值和元信息。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch7": {
    "id": "ch7-capstone",
    "title": "加餐：惰性数据管道",
    "minutes": 45,
    "lead": "用生成器把“读取 → 清洗 → 转换 → 汇总”串成流水线，数据一条一条流，不一次性占满内存。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一个 2GB 的日志文件要统计错误数。`readlines()` 会直接把内存打满；正确做法是逐行读、逐行过滤、逐行计数。生成器就是这条流水线的传送带。",
        "code": "",
        "output": "",
        "tip": "惰性不是炫技；数据大于内存时，它是唯一能跑通的方案。"
      },
      {
        "h": "设计与数据流",
        "p": "四个生成器：`read_lines` 逐行读；`clean` 去空行和空格；`parse` 转结构；`count_errors` 消费并累加。每个 `yield` 只处理一条，调用方用 `for` 驱动。",
        "code": "def read_lines(path):\n    with open(path, encoding='utf-8') as f:\n        for line in f:\n            yield line.rstrip('\\n')\ndef clean(lines):\n    for line in lines:\n        line = line.strip()\n        if line:\n            yield line",
        "output": "for line in clean(read_lines('app.log')): ...",
        "tip": "文件对象本身就是迭代器；不要先 `readlines()` 再生成。"
      },
      {
        "h": "最小实现",
        "p": "写 `parse` 和 `count`。`parse` 用正则拆级别；`count` 用 Counter 累加。整条链只在最后 `sum` 时消费一次。",
        "code": "def parse(lines):\n    for line in lines:\n        m = re.search(r'\\b(ERROR|WARN|INFO)\\b', line)\n        if m:\n            yield m.group(1)\ndef count(levels):\n    c = Counter()\n    for level in levels:\n        c[level] += 1\n    return c\nresult = count(parse(clean(read_lines(path))))",
        "output": "Counter({'ERROR': 12, 'INFO': 30})",
        "tip": "生成器链是“拉”模型；最后一个消费者启动，前面才开始读。"
      },
      {
        "h": "边界与错误",
        "p": "文件不存在、编码错误、生成器只能消费一次、异常在链中间、资源未关闭。`with` 在生成器里要谨慎：生成器未消费完时文件可能一直开着。",
        "code": "gen = read_lines(path)\nnext(gen)\ngen.close()  # 触发 with 退出",
        "output": "提前关闭 -> 文件句柄释放",
        "tip": "生成器持有资源时，调用方要负责 close，或用 contextmanager 包一层。"
      },
      {
        "h": "验收与测试",
        "p": "用小文件测行数、错误数、空行过滤；再用 `tracemalloc` 或计数生成器验证没有一次性读入。异常文件要断言抛出哪类错误。",
        "code": "assert count(parse(clean(read_lines(tmp))))['ERROR'] == 2\n# 统计每次 yield 的行号，确认是逐行",
        "output": "通过：ERROR=2，逐行消费",
        "tip": "测试惰性要看“消费节奏”，不只看最终结果。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加批量读取多个文件、并行处理、背压控制；再对比列表推导和生成器表达式的内存占用。最后把管道封装成 `pipeline(*stages)`。",
        "code": "",
        "output": "",
        "tip": "生成器表达式适合简单链；复杂分支还是写具名生成器更可读。"
      }
    ],
    "points": [
      "生成器逐条传递，不一次性加载。",
      "生成器只能消费一次。",
      "生成器持有资源要及时 close。"
    ],
    "practice": "实现 read/clean/parse/count 四段管道，统计日志级别并验证逐行消费。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch8": {
    "id": "ch8-capstone",
    "title": "加餐：做一个可安装的小工具包",
    "minutes": 45,
    "lead": "从单文件脚本升级成包：`pyproject.toml`、`src/` 布局、`python -m` 入口、版本号。让你写的工具能被别人 pip 安装。",
    "sections": [
      {
        "h": "需求现场",
        "p": "你写了一个 `slugify` 工具，现在同事也想用。发文件太原始，目标是 `pip install .` 后能 `import mytool`，还能命令行运行 `mytool \"Hello World\"`。",
        "code": "",
        "output": "",
        "tip": "先想清楚“库”和“CLI”两个入口，再谈打包。"
      },
      {
        "h": "设计与数据流",
        "p": "目录：`pyproject.toml`、`src/mytool/__init__.py`、`src/mytool/cli.py`。`__init__` 暴露 `slugify`；`cli.py` 用 argparse；`[project.scripts]` 注册命令。",
        "code": "my-tool/\n├── pyproject.toml\n└── src/mytool/\n    ├── __init__.py\n    └── cli.py",
        "output": "pip install -e .\nmytool 'Hello World' -> hello-world",
        "tip": "src 布局能避免“在当前目录能 import、装完反而不能”的假象。"
      },
      {
        "h": "最小实现",
        "p": "`slugify` 转小写、去标点、空格转连字符；CLI 打印结果。`pyproject.toml` 写 name、version、requires-python、scripts。",
        "code": "def slugify(text):\n    text = re.sub(r'[^\\w\\s-]', '', text.lower())\n    return re.sub(r'[-\\s]+', '-', text).strip('-')\n# pyproject.toml\n[project]\nname = \"my-tool\"\nversion = \"0.1.0\"\n[project.scripts]\nmytool = \"mytool.cli:main\"",
        "output": "slugify('Hello, World!') -> 'hello-world'\nmytool --help -> 用法",
        "tip": "包名用连字符、模块名用下划线；两者不要混。"
      },
      {
        "h": "边界与错误",
        "p": "相对导入、循环导入、版本号写死、依赖未声明、Python 版本不兼容、安装后命令找不到。`pip install -e .` 失败先看 pyproject 的 build-system。",
        "code": "[build-system]\nrequires = [\"setuptools>=68\"]\nbuild-backend = \"setuptools.build_meta\"",
        "output": "缺少 build-system -> 安装报错",
        "tip": "打包错误先看构建后端，不要先怀疑代码。"
      },
      {
        "h": "验收与测试",
        "p": "在干净虚拟环境里 `pip install .`，跑 `python -c 'import mytool'` 和 `mytool 'Hello World'`；再跑 pytest。卸载后确认命令消失。",
        "code": "python -m venv .venv\n. .venv/bin/activate\npip install .\nmytool 'Hello World'",
        "output": "hello-world",
        "tip": "一定要在干净环境测；本机已装的依赖会掩盖缺失声明。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加类型标注、README、LICENSE、GitHub Actions 自动发布；再把版本号改成 `importlib.metadata.version` 读取。最后上传 TestPyPI 试一次。",
        "code": "",
        "output": "",
        "tip": "发布前先想清楚许可证和包名；PyPI 名字是全局唯一的。"
      }
    ],
    "points": [
      "src 布局避免导入假象。",
      "库入口和 CLI 入口分开。",
      "干净虚拟环境验证安装。"
    ],
    "practice": "搭一个 src 布局包，提供 slugify 和 mytool 命令，并在干净 venv 安装验证。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch9": {
    "id": "ch9-capstone",
    "title": "加餐：CSV 清洗与错误报告",
    "minutes": 45,
    "lead": "读一份脏 CSV：缺列、空值、日期格式乱、金额带货币符号。清洗能修的修，不能修的写进错误报告，不要静默丢弃。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一份销售 CSV 有 1000 行，字段：date、sku、qty、price。常见脏数据：日期 `2026/1/5`、金额 `￥12.50`、qty 为空、多一列空字段。目标是输出干净 CSV 和一份 `errors.csv`。",
        "code": "",
        "output": "",
        "tip": "清洗的第一原则：可修复的修，不可修复的记录下来；不要悄悄删行。"
      },
      {
        "h": "设计与数据流",
        "p": "`csv.DictReader` 逐行读；每行经过 `clean_row` 返回 `(row, errors)`；干净行写输出，错误行写错误文件并附原因。最后打印统计：总数、成功、失败。",
        "code": "reader = csv.DictReader(f)\nfor lineno, row in enumerate(reader, start=2):\n    cleaned, errs = clean_row(row)\n    if errs:\n        errors.append({'line': lineno, 'reason': ';'.join(errs)})\n    else:\n        out.append(cleaned)",
        "output": "总行 1000，成功 970，失败 30",
        "tip": "行号从 2 开始，因为第 1 行是表头；排查时对得上。"
      },
      {
        "h": "最小实现",
        "p": "金额去掉 `￥`、逗号、空格再转 Decimal；日期用 `date.fromisoformat` 或 `strptime` 多格式尝试；qty 必须是非负整数。错误信息要包含字段名和原值。",
        "code": "from decimal import Decimal, InvalidOperation\ndef parse_money(s):\n    s = s.replace('￥', '').replace(',', '').strip()\n    return Decimal(s)\n# 失败抛 ValueError(f'price 非法: {s!r}')",
        "output": "parse_money('￥12.50') -> Decimal('12.50')",
        "tip": "金额用 Decimal，不要用 float；财务数据差一分钱都是 bug。"
      },
      {
        "h": "边界与错误",
        "p": "BOM、编码 gbk/utf-8、字段多一个逗号、引号里带逗号、空文件、只有表头、重复行。`csv` 模块能处理引号，但编码要自己指定。",
        "code": "with open(path, encoding='utf-8-sig', newline='') as f:\n    reader = csv.DictReader(f)",
        "output": "BOM 被去掉，表头正常",
        "tip": "Windows 导出的 CSV 常有 BOM；用 `utf-8-sig` 省事。"
      },
      {
        "h": "验收与测试",
        "p": "造一个 6 行小 CSV，覆盖正常、日期乱、金额带符号、qty 空、多列、引号逗号。断言成功数、错误数、错误行号和原因。",
        "code": "assert len(out) == 3\nassert errors[0]['line'] == 2\nassert 'qty' in errors[0]['reason']",
        "output": "通过：3 行成功，错误含 qty",
        "tip": "错误报告要断言行号和字段名，不然用户没法修。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加 schema 配置、批量文件、输出 Parquet；再用 pandas 的 `read_csv` 对照。最后做一个“修复建议”列，告诉用户原值应该改成什么。",
        "code": "",
        "output": "",
        "tip": "清洗规则要可配置；硬编码字段名，换一份表就失效。"
      }
    ],
    "points": [
      "能修则修，不能修写错误报告。",
      "金额用 Decimal，日期多格式解析。",
      "CSV 编码注意 BOM 和 gbk。"
    ],
    "practice": "实现 CSV 清洗器，输出干净文件 + errors.csv，统计成功/失败行数。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch10": {
    "id": "ch10-capstone",
    "title": "加餐：库存领域模型",
    "minutes": 45,
    "lead": "用 dataclass 建一个库存模型：商品、入库、出库、库存预警。把业务规则放在模型里，而不是散落在脚本里。",
    "sections": [
      {
        "h": "需求现场",
        "p": "小仓库要记录商品 SKU、名称、数量、安全库存。入库加数量，出库减数量但不能减成负数；低于安全库存要预警。要求可测试、可序列化。",
        "code": "",
        "output": "",
        "tip": "领域模型不是“数据库表的翻版”；它应该能表达业务规则。"
      },
      {
        "h": "设计与数据流",
        "p": "`Item` dataclass 保存 sku/name/qty/safe_qty；`receive` 和 `issue` 是方法，返回新对象或原地改？教学版用可变对象 + 明确方法，便于理解；生产可改不可变。",
        "code": "from dataclasses import dataclass, field\n@dataclass\nclass Item:\n    sku: str\n    name: str\n    qty: int = 0\n    safe_qty: int = 5",
        "output": "Item('A-1', '键盘', 10, 5)",
        "tip": "dataclass 自动生成 `__init__`、`__repr__`、`__eq__`，先用好这些。"
      },
      {
        "h": "最小实现",
        "p": "`receive(n)` 校验 n>0 后加；`issue(n)` 校验 n>0 且不超过库存；`is_low()` 返回 qty < safe_qty；`to_dict()` 用于 JSON。错误用 ValueError，信息带 SKU。",
        "code": "@dataclass\nclass Item:\n    sku: str\n    name: str\n    qty: int = 0\n    safe_qty: int = 5\n    def issue(self, n: int):\n        if n <= 0: raise ValueError('出库数量必须为正')\n        if n > self.qty: raise ValueError(f'{self.sku} 库存不足')\n        self.qty -= n",
        "output": "item.issue(3) -> qty=7\nitem.issue(99) -> ValueError 库存不足",
        "tip": "业务规则写在方法里，脚本只负责调用；这样 CLI/API 都能复用。"
      },
      {
        "h": "边界与错误",
        "p": "负数量、0、浮点、SKU 重复、安全库存为负、并发出库。多线程下“检查再减”不是原子操作，需要锁或数据库事务。",
        "code": "import threading\nlock = threading.Lock()\nwith lock:\n    item.issue(3)",
        "output": "并发下库存不会减成负数",
        "tip": "单机脚本也要知道竞态；库存是典型的“检查后执行”陷阱。"
      },
      {
        "h": "验收与测试",
        "p": "测入库、出库、库存不足、0/负数、预警边界（qty == safe_qty 不预警）、序列化。用 pytest.raises 断言错误信息包含 SKU。",
        "code": "assert Item('A', 'x', 5, 5).is_low() is False\nwith pytest.raises(ValueError, match='A'):\n    Item('A', 'x', 1).issue(2)",
        "output": "通过：等于安全库存不预警；错误含 SKU",
        "tip": "预警边界是 `<` 还是 `<=`，要用测试固定住。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加批次、保质期、库位、盘点、JSON 持久化；再用 `pydantic` 做校验版。最后把模型接到一个 FastAPI 接口，体会领域模型和 API schema 的分工。",
        "code": "",
        "output": "",
        "tip": "领域模型管规则，API schema 管传输；不要把两者混成一个类。"
      }
    ],
    "points": [
      "业务规则放进领域模型。",
      "出库先校验再扣减。",
      "预警边界用测试固定。"
    ],
    "practice": "实现 Item 的入库/出库/预警/序列化，覆盖库存不足和边界值。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch11": {
    "id": "ch11-capstone",
    "title": "加餐：可扩展的导出器",
    "minutes": 45,
    "lead": "同一批数据要导出 CSV、JSON、Markdown。用 ABC 或 Protocol 定义接口，让新增格式只加一个类，不改调用方。",
    "sections": [
      {
        "h": "需求现场",
        "p": "报表系统现在支持 CSV，下周要 JSON，下月要 Markdown。如果每个格式都写一堆 if，调用方会越来越臃肿。目标：一个 `export(rows, path, fmt)` 统一入口。",
        "code": "",
        "output": "",
        "tip": "先定义“导出器”的合同，再决定用 ABC 还是 Protocol。"
      },
      {
        "h": "设计与数据流",
        "p": "导出器接口：`name` 属性 + `export(rows, path)` 方法。注册表 `EXPORTERS = {'csv': CsvExporter(), ...}`。调用方按名字取导出器，不直接 import 具体类。",
        "code": "class Exporter(Protocol):\n    name: str\n    def export(self, rows: list[dict], path: str) -> None: ...",
        "output": "exporter.export(rows, 'out.csv')",
        "tip": "Protocol 只描述能力，不强制继承；ABC 更适合需要注册和阻止误用的场景。"
      },
      {
        "h": "最小实现",
        "p": "写 CSV、JSON、Markdown 三个类，共享一个 `_open(path)` 辅助。CSV 用 DictWriter，JSON 用 `json.dump`，Markdown 手写表头。注册表在模块底部组装。",
        "code": "class CsvExporter:\n    name = 'csv'\n    def export(self, rows, path):\n        with open(path, 'w', newline='', encoding='utf-8') as f:\n            writer = csv.DictWriter(f, fieldnames=rows[0].keys())\n            writer.writeheader(); writer.writerows(rows)",
        "output": "export(rows, 'out.csv', 'csv') -> 文件生成",
        "tip": "空 rows 没有 fieldnames；先处理空数据，再写表头。"
      },
      {
        "h": "边界与错误",
        "p": "未知格式、空数据、路径不存在、权限不足、字段不一致、编码。错误要区分“格式不支持”和“写入失败”，调用方才能决定重试还是提示。",
        "code": "if fmt not in EXPORTERS:\n    raise ValueError(f'不支持的格式: {fmt}')\nPath(path).parent.mkdir(parents=True, exist_ok=True)",
        "output": "未知格式 -> ValueError\n目录不存在 -> 自动创建",
        "tip": "格式错误和 IO 错误分开；不要把所有异常都包成 RuntimeError。"
      },
      {
        "h": "验收与测试",
        "p": "用同一组 rows 导出三种格式，断言文件存在、内容可被对应解析器读回、字段完整。再测空数据、未知格式、只读目录。",
        "code": "for fmt in ('csv', 'json', 'md'):\n    export(rows, f'out.{fmt}', fmt)\nassert json.load(open('out.json'))[0]['sku'] == 'A-1'",
        "output": "通过：三种格式可读回",
        "tip": "导出测试要“写出去再读回来”，只断言文件存在不够。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加 Excel、PDF 导出器，加插件式注册（entry points），加流式导出大文件。最后比较 ABC 和 Protocol 在类型检查、运行时行为上的差异。",
        "code": "",
        "output": "",
        "tip": "新增格式只加类、不改调用方，才算真正可扩展。"
      }
    ],
    "points": [
      "先定义导出器合同。",
      "注册表解耦调用方和具体类。",
      "空数据、未知格式要单独处理。"
    ],
    "practice": "实现 CSV/JSON/Markdown 三个导出器，统一 export(rows, path, fmt) 入口。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch12": {
    "id": "ch12-capstone",
    "title": "加餐：带类型与测试的利息计算器",
    "minutes": 45,
    "lead": "用 type hints、doctest、pytest 写一个复利计算器。让“算得对”和“说得清”同时成立。",
    "sections": [
      {
        "h": "需求现场",
        "p": "输入本金、年利率、年数、每年复利次数，输出到期金额。要求：参数有类型标注；非法利率/年数有明确错误；至少 6 组测试；文档里有可执行示例。",
        "code": "",
        "output": "",
        "tip": "类型标注不是装饰；它能在编辑器里提前暴露一半的低级错误。"
      },
      {
        "h": "设计与数据流",
        "p": "`compound(principal: float, rate: float, years: int, times: int = 1) -> float`。公式 `P * (1 + r/n) ** (n*t)`。先校验 `principal >= 0`、`rate >= 0`、`years >= 0`、`times > 0`。",
        "code": "def compound(principal: float, rate: float, years: int, times: int = 1) -> float:\n    ...",
        "output": "compound(1000, 0.05, 10, 1) -> 1628.89...",
        "tip": "参数顺序和默认值一旦公开，就是 API 合同；改之前先想兼容。"
      },
      {
        "h": "最小实现",
        "p": "用 Decimal 处理金额，最后量化到分；利率转 Decimal 字符串，避免 float 误差。返回值类型标注 `Decimal`。",
        "code": "from decimal import Decimal, ROUND_HALF_UP\ndef compound(principal, rate, years, times=1):\n    p = Decimal(str(principal)); r = Decimal(str(rate))\n    amount = p * (1 + r / times) ** (times * years)\n    return amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)",
        "output": "compound(1000, 0.05, 10) -> Decimal('1628.89')",
        "tip": "`Decimal(0.1)` 会带入 float 误差；用 `Decimal(str(x))`。"
      },
      {
        "h": "边界与错误",
        "p": "负本金、负利率、0 年、0 复利次数、超大指数溢出、字符串输入、NaN。`times=0` 会导致除零；`years` 是 float 时要明确是否允许。",
        "code": "if times <= 0: raise ValueError('times 必须为正整数')\nif principal < 0 or rate < 0 or years < 0: raise ValueError('参数不能为负')",
        "output": "times=0 -> ValueError",
        "tip": "边界校验放在函数入口，别等公式跑到一半才炸。"
      },
      {
        "h": "验收与测试",
        "p": "用 doctest 写两个例子，pytest 参数化测单利/复利/0 利率/0 本金/非法参数。金额断言用 Decimal 相等，不用 float 近似。",
        "code": "assert compound(1000, 0.05, 10) == Decimal('1628.89')\nwith pytest.raises(ValueError): compound(1000, -0.01, 10)",
        "output": "通过：6 组",
        "tip": "金额测试用精确 Decimal；float 的 `==` 会给你假通过。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加等额本息贷款、IRR、通货膨胀调整；用 `mypy` 检查类型；把公式和假设写进 docstring。最后做一个 Streamlit 小页面。",
        "code": "",
        "output": "",
        "tip": "金融计算先写假设，再写公式；否则用户不知道你算的是什么。"
      }
    ],
    "points": [
      "类型标注提前暴露错误。",
      "金额用 Decimal，不用 float。",
      "边界校验放在入口。"
    ],
    "practice": "实现 compound()，加 type hints、doctest、pytest，覆盖 6 组用例。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch13": {
    "id": "ch13-capstone",
    "title": "加餐：可发布的 CLI 项目",
    "minutes": 45,
    "lead": "从 pyproject 到 GitHub Actions：版本、依赖、入口、测试、构建、发布。把“能跑”升级成“别人能装”。",
    "sections": [
      {
        "h": "需求现场",
        "p": "你有一个命令行工具，想让同事 `pip install` 后直接用。需要：包元数据、入口点、README、测试、构建产物、发布流程。任何一步缺失，安装都会卡住。",
        "code": "",
        "output": "",
        "tip": "发布不是最后一条命令，而是一条可重复的流水线。"
      },
      {
        "h": "设计与数据流",
        "p": "项目结构：`src/`、`tests/`、`pyproject.toml`、`README.md`、`LICENSE`。构建用 `python -m build` 产 wheel 和 sdist；发布用 twine 或 GitHub Actions 的 trusted publishing。",
        "code": "dist/\n├── mytool-0.1.0-py3-none-any.whl\n└── mytool-0.1.0.tar.gz",
        "output": "build 成功 -> dist 两个文件",
        "tip": "先构建再发布；不要直接从源码目录 twine upload。"
      },
      {
        "h": "最小实现",
        "p": "pyproject 写全 name/version/description/readme/license/requires-python/dependencies/scripts；版本号只在一个地方；README 至少写安装、用法、示例。",
        "code": "[project]\nname = \"my-tool\"\nversion = \"0.1.0\"\ndescription = \"Slugify CLI\"\nreadme = \"README.md\"\nrequires-python = \">=3.10\"\ndependencies = []\n[project.scripts]\nmytool = \"mytool.cli:main\"",
        "output": "pip install dist/*.whl -> mytool 可用",
        "tip": "版本号不要同时写在 `__init__.py` 和 pyproject；用一个来源。"
      },
      {
        "h": "边界与错误",
        "p": "缺 README 导致构建失败、依赖没声明、wheel 里漏包、入口函数不存在、Python 版本不兼容、许可证缺失。构建后在干净 venv 安装，才能发现这些问题。",
        "code": "python -m build\npython -m venv /tmp/testenv\n/tmp/testenv/bin/pip install dist/*.whl\n/tmp/testenv/bin/mytool --help",
        "output": "干净环境安装成功 -> 入口可用",
        "tip": "wheel 要在干净环境测；本机 editable install 会掩盖漏包。"
      },
      {
        "h": "验收与测试",
        "p": "CI 矩阵跑 3.10/3.11/3.12，执行 pytest、mypy、build；再检查 wheel 内容 `unzip -l`。发布前打 tag，版本号与 tag 一致。",
        "code": "python -m pytest\npython -m mypy src\npython -m build\nunzip -l dist/*.whl",
        "output": "全部通过 -> 可发布",
        "tip": "CI 里不要只跑测试；构建和安装也要跑。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加 pre-commit、ruff、coverage、签名、TestPyPI 预发布；再写一个 `Makefile` 把常用命令收口。最后读一遍 PEP 621 和 packaging 指南。",
        "code": "",
        "output": "",
        "tip": "发布流程要能在一台新机器上复现；只在你电脑上能发不算。"
      }
    ],
    "points": [
      "pyproject 是项目合同。",
      "构建后在干净环境安装验证。",
      "CI 要覆盖测试、类型、构建。"
    ],
    "practice": "搭一个可发布 CLI：pyproject、src、tests、README，构建 wheel 并在干净 venv 安装。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch14": {
    "id": "ch14-capstone",
    "title": "加餐：API 健康检查与重试",
    "minutes": 45,
    "lead": "调用第三方 API 时，超时、429、5xx 都可能发生。写一个带超时、重试、退避和错误分类的客户端。",
    "sections": [
      {
        "h": "需求现场",
        "p": "天气 API 偶尔超时，偶尔返回 429。要求：单次请求 3 秒超时；最多重试 2 次；429 按 `Retry-After` 等待；4xx 不重试；最终失败给用户可读提示。",
        "code": "",
        "output": "",
        "tip": "先把错误分类，再决定重试策略；不是所有失败都值得重试。"
      },
      {
        "h": "设计与数据流",
        "p": "`get_json(url, timeout=3, retries=2)`：循环尝试；捕获 `TimeoutError`/`HTTPError`；按状态码分类；退避用 `time.sleep` 或异步 sleep。返回解析后的 JSON。",
        "code": "for attempt in range(retries + 1):\n    try:\n        with urllib.request.urlopen(url, timeout=timeout) as r:\n            return json.load(r)\n    except urllib.error.HTTPError as e:\n        if e.code < 500 and e.code != 429:\n            raise",
        "output": "200 -> JSON\n404 -> 立即抛错\n500 -> 重试",
        "tip": "4xx 是请求本身有问题，重试不会变好；429 是限流，要按服务端提示等。"
      },
      {
        "h": "最小实现",
        "p": "写 `classify(err)` 返回 `retryable/ fatal/ wait`；`Retry-After` 可能是秒数也可能是日期，先支持秒数。每次重试记录 attempt 和等待时间。",
        "code": "def backoff(attempt):\n    return min(2 ** attempt, 8)\n# 429 优先用 Retry-After，否则 backoff",
        "output": "第 1 次等 1s，第 2 次等 2s，最多 8s",
        "tip": "退避要设上限；无限增长会让用户等到崩溃。"
      },
      {
        "h": "边界与错误",
        "p": "DNS 失败、SSL 错误、响应不是 JSON、空 body、重定向、代理、时钟。超时要同时覆盖连接和读取；`urlopen` 的 timeout 不是总时长。",
        "code": "try:\n    data = json.loads(body)\nexcept json.JSONDecodeError:\n    raise ValueError('响应不是合法 JSON')",
        "output": "非 JSON -> ValueError",
        "tip": "错误分类要保留原始异常链 `raise ... from e`，排查时能看到根因。"
      },
      {
        "h": "验收与测试",
        "p": "用本地 mock server 或 `unittest.mock` 测：200 成功、500 两次后成功、404 不重试、429 等待、超时。断言调用次数和总等待时间。",
        "code": "with mock.patch('urllib.request.urlopen', side_effect=[HTTPError(...500), fake_ok]):\n    assert get_json(url)['ok']",
        "output": "通过：调用 2 次",
        "tip": "重试测试要断言调用次数；否则看不出策略有没有生效。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加异步 aiohttp 版本、连接池、缓存、熔断、指标上报；再用 `tenacity` 库重写，比较手写和库的差异。最后给用户一个“服务暂不可用，请稍后再试”的友好提示。",
        "code": "",
        "output": "",
        "tip": "生产客户端还要有熔断和可观测性；只会重试是不够的。"
      }
    ],
    "points": [
      "先分类错误，再决定重试。",
      "429 看 Retry-After，5xx 才退避。",
      "超时要覆盖连接和读取。"
    ],
    "practice": "实现 get_json，支持超时、重试、429 等待、4xx 快速失败，并用 mock 验证调用次数。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch15": {
    "id": "ch15-capstone",
    "title": "加餐：销售 CSV 分析报告",
    "minutes": 45,
    "lead": "用 pandas 读销售数据，做月度汇总、品类占比、Top 商品，并导出 Excel 和图表。把“分析”落成可重复的脚本。",
    "sections": [
      {
        "h": "需求现场",
        "p": "每个月都要出一份销售报告：总销售额、环比、品类占比、Top 10 商品、每日趋势图。手工 Excel 太慢，目标是一条命令生成 Excel + PNG。",
        "code": "",
        "output": "",
        "tip": "先固定输入字段和输出文件，再写分析；否则每次口径都不一样。"
      },
      {
        "h": "设计与数据流",
        "p": "读 CSV → 类型转换 → 派生字段（月份、销售额）→ groupby 汇总 → 写 Excel 多 sheet → 画趋势图。所有中间表都保留，方便复核。",
        "code": "df = pd.read_csv(path, parse_dates=['date'])\ndf['amount'] = df['qty'] * df['price']\nmonthly = df.groupby(df['date'].dt.to_period('M'))['amount'].sum()",
        "output": "monthly -> 2026-10 120000\n2026-11 150000",
        "tip": "金额先算出来再 groupby；不要在每个聚合里重复乘。"
      },
      {
        "h": "最小实现",
        "p": "用 `pd.ExcelWriter` 写多个 sheet：raw、monthly、category、top_products。用 `matplotlib` 画月度趋势，注意中文字体和负号显示。",
        "code": "with pd.ExcelWriter('report.xlsx') as writer:\n    df.to_excel(writer, sheet_name='raw', index=False)\n    monthly.to_excel(writer, sheet_name='monthly')\n    category.to_excel(writer, sheet_name='category')",
        "output": "report.xlsx 含 4 个 sheet",
        "tip": "Excel writer 要指定引擎；openpyxl 是常用选择。"
      },
      {
        "h": "边界与错误",
        "p": "日期解析失败、金额为字符串、qty 缺失、空表、重复行、时区、Excel 行数上限。`parse_dates` 失败会变成 NaT，后续 groupby 会丢数据。",
        "code": "df['date'] = pd.to_datetime(df['date'], errors='coerce')\nbad_dates = df['date'].isna().sum()",
        "output": "非法日期 -> NaT，计数后报告",
        "tip": "解析错误要显式统计；`errors='coerce'` 不是让你忽略。"
      },
      {
        "h": "验收与测试",
        "p": "用 10 行固定数据手算月度总额、品类占比、Top 1；断言 Excel sheet 名和行数；再测空表、坏日期、缺列。",
        "code": "assert monthly.loc['2026-11'] == 150000\nassert set(sheets) == {'raw','monthly','category','top_products'}",
        "output": "通过：月度 150000，4 个 sheet",
        "tip": "分析脚本的测试用小数数据；大数据只做冒烟。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加同比/环比、地区维度、预算对比、异常检测；用 plotly 做交互图；把脚本包成 CLI。最后用 DuckDB 对比 pandas 的内存和速度。",
        "code": "",
        "output": "",
        "tip": "报表要可复现：输入、脚本、输出三件套一起存档。"
      }
    ],
    "points": [
      "先固定字段和输出，再分析。",
      "日期/金额解析错误要统计。",
      "Excel 多 sheet 保留中间表。"
    ],
    "practice": "实现销售报告脚本，输出 Excel 四个 sheet 和月度趋势图，并用 10 行数据断言。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch16": {
    "id": "ch16-capstone",
    "title": "加餐：批量文件整理机器人",
    "minutes": 45,
    "lead": "用 pathlib 扫描下载目录，按类型、日期、项目归档，重名自动加序号，生成整理日志。别写死路径。",
    "sections": [
      {
        "h": "需求现场",
        "p": "下载文件夹里有 500 个文件：图片、PDF、压缩包、重复命名。目标：按 `图片/文档/压缩包/其他` 分类；同名文件加 `_1`；生成 CSV 日志记录原路径和新路径。",
        "code": "",
        "output": "",
        "tip": "批量操作先做 dry-run；直接移动 500 个文件，出错很难回滚。"
      },
      {
        "h": "设计与数据流",
        "p": "`scan(root)` 返回文件列表；`classify(path)` 按后缀返回类别；`unique_target(dir, name)` 处理重名；`move(src, dst)` 执行并记录。dry-run 只打印计划。",
        "code": "from pathlib import Path\nfor p in Path(root).rglob('*'):\n    if p.is_file():\n        ...",
        "output": "扫描到 500 个文件\n计划移动 480，跳过 20",
        "tip": "用 `rglob('*')` 递归；注意跳过目标目录，避免自己搬自己。"
      },
      {
        "h": "最小实现",
        "p": "后缀映射表；目标目录按类别创建；重名用 `stem_1.suffix` 递增；日志用 csv.writer 写 `src,dst,status`。移动用 `shutil.move`，跨盘也能用。",
        "code": "def unique_target(dir, name):\n    target = dir / name\n    stem, suffix = target.stem, target.suffix\n    i = 1\n    while target.exists():\n        target = dir / f'{stem}_{i}{suffix}'\n        i += 1\n    return target",
        "output": "a.txt 已存在 -> a_1.txt",
        "tip": "重名判断用 `exists()`，不要靠时间戳；并发下仍可能冲突。"
      },
      {
        "h": "边界与错误",
        "p": "隐藏文件、符号链接、只读文件、路径过长、跨盘移动、目标目录在源目录内、权限不足、文件正在被占用。每个失败单独记录，不中断整批。",
        "code": "try:\n    shutil.move(str(src), str(dst))\n    status = 'moved'\nexcept OSError as e:\n    status = f'failed: {e}'",
        "output": "单个失败 -> 记录并继续",
        "tip": "批量任务要“部分成功”模型；一个失败不能毁掉整批。"
      },
      {
        "h": "验收与测试",
        "p": "在临时目录造 6 个文件：两类、重名、隐藏、只读、目标已存在。先 dry-run 断言计划，再真实移动断言结果和日志。最后清理临时目录。",
        "code": "with tempfile.TemporaryDirectory() as tmp:\n    ...\nassert log_rows[0]['status'] == 'moved'",
        "output": "通过：6 个文件按计划归档",
        "tip": "文件测试必须用临时目录；不要拿真实下载目录练手。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加配置文件、按 EXIF 日期归档、重复文件哈希去重、撤销模式；再用 `watchdog` 监听目录自动整理。最后加一个进度条。",
        "code": "",
        "output": "",
        "tip": "自动化要先能撤销；没有 undo 的整理工具很危险。"
      }
    ],
    "points": [
      "批量操作先 dry-run。",
      "重名加序号，失败单独记录。",
      "临时目录测试，不碰真实文件。"
    ],
    "practice": "实现文件整理器：扫描、分类、重名处理、dry-run、CSV 日志，并用临时目录验证。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch17": {
    "id": "ch17-capstone",
    "title": "加餐：并发下载器",
    "minutes": 45,
    "lead": "用 ThreadPoolExecutor 下载 20 个文件，限制并发、显示进度、失败重试。理解 I/O 密集任务为什么适合线程。",
    "sections": [
      {
        "h": "需求现场",
        "p": "有一批图片 URL 要下载到本地。串行 20 个太慢；开 20 个线程又可能被限流。目标：最多 4 个并发，失败重试 1 次，最后输出成功/失败清单。",
        "code": "",
        "output": "",
        "tip": "I/O 等待时线程能让出 GIL；CPU 密集才考虑多进程。"
      },
      {
        "h": "设计与数据流",
        "p": "`download(url, path)` 用 `urllib.request` 流式写文件；`ThreadPoolExecutor(max_workers=4)` 提交任务；`as_completed` 收集结果；失败任务重试一次。",
        "code": "with ThreadPoolExecutor(max_workers=4) as pool:\n    futures = {pool.submit(download, u, p): u for u, p in jobs}\n    for fut in as_completed(futures):\n        ...",
        "output": "20 个任务，4 个并发，全部完成",
        "tip": "线程池的 `max_workers` 是并发上限，不是任务总数。"
      },
      {
        "h": "最小实现",
        "p": "下载先写临时文件，成功后再 `os.replace` 原子替换，避免半截文件。进度用 `completed/total` 打印。失败重试包一层 `retry`。",
        "code": "def download(url, path):\n    tmp = path.with_suffix(path.suffix + '.part')\n    with urllib.request.urlopen(url, timeout=10) as r, open(tmp, 'wb') as f:\n        shutil.copyfileobj(r, f)\n    os.replace(tmp, path)",
        "output": "成功 -> path 存在\n失败 -> .part 被清理",
        "tip": "先写 .part 再原子替换；断点续传和半截文件是下载器常见坑。"
      },
      {
        "h": "边界与错误",
        "p": "404、超时、磁盘满、文件名非法、重定向、SSL、重复 URL、线程安全。多个线程写同一个日志要加锁，或每个任务返回结果由主线程统一打印。",
        "code": "if not path.parent.exists():\n    path.parent.mkdir(parents=True, exist_ok=True)\ntry:\n    ...\nfinally:\n    tmp.unlink(missing_ok=True)",
        "output": "磁盘/网络失败 -> 清理临时文件",
        "tip": "finally 里清理临时文件；异常路径也要收尾。"
      },
      {
        "h": "验收与测试",
        "p": "用本地 HTTP server 提供 10 个小文件，测全部成功、一个 404、超时重试、并发峰值 ≤4。断言文件内容和数量。",
        "code": "assert len(list(out_dir.iterdir())) == 9\nassert peak <= 4",
        "output": "通过：9 个成功，1 个失败，峰值 4",
        "tip": "下载测试用本地 server，不要依赖外网。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加断点续传、进度条 tqdm、异步 aiohttp 版本、限速、校验和。最后比较线程、进程、异步三种方案在 I/O 任务上的差异。",
        "code": "",
        "output": "",
        "tip": "并发不是越多越好；根据目标站点限流和本机带宽调整。"
      }
    ],
    "points": [
      "I/O 密集适合线程池。",
      "先写临时文件再原子替换。",
      "失败清理和重试要设计。"
    ],
    "practice": "实现并发下载器：4 并发、失败重试、进度、成功/失败清单，并用本地 server 测试。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch18": {
    "id": "ch18-capstone",
    "title": "加餐：综合项目复盘：游泳成绩报表",
    "minutes": 45,
    "lead": "把前面 17 章的技能串起来：读 CSV、清洗、按年龄组排名、生成 Excel/图表、写测试、打包 CLI。重点是拆解和验收，不是堆代码。",
    "sections": [
      {
        "h": "需求现场",
        "p": "俱乐部给出一份游泳比赛 CSV：姓名、性别、年龄、项目、成绩（秒）、犯规标记。要生成报表：各项目前三名、年龄组排名、犯规名单、班级总分。输出 Excel 和 Markdown。",
        "code": "",
        "output": "",
        "tip": "综合项目先画数据流，不要直接打开编辑器就写。"
      },
      {
        "h": "设计与数据流",
        "p": "阶段一：读取与校验；阶段二：清洗（去犯规、成绩转秒）；阶段三：分组排名；阶段四：导出；阶段五：测试。每个阶段一个模块，CLI 只做参数解析和编排。",
        "code": "read.csv → validate → clean → rank → export\n         ↘ errors.csv",
        "output": "输入 200 行 -> 有效 180，犯规 20\n输出 3 个 sheet + 1 个 md",
        "tip": "先让每个阶段能单独运行，再串起来；综合项目最怕一锅炖。"
      },
      {
        "h": "最小实现",
        "p": "核心排名函数 `rank(rows, key)` 用 `sorted` + `groupby`；成绩统一转 float 秒；同成绩并列名次要用同排名。导出复用第 11 章的导出器思路。",
        "code": "def rank(rows, key):\n    out = []\n    for group, items in groupby(sorted(rows, key=key), key=key):\n        for i, row in enumerate(items, 1):\n            out.append({**row, 'rank': i})\n    return out",
        "output": "每组第一 -> rank=1\n同成绩 -> 需要并列处理",
        "tip": "`groupby` 前必须排序；并列名次不能简单用 enumerate。"
      },
      {
        "h": "边界与错误",
        "p": "犯规、缺赛、成绩格式 `1:02.35`、同名、年龄组边界、空项目、编码、Excel 公式注入。导出 CSV 时，单元格以 `=` 开头要转义。",
        "code": "def parse_time(s):\n    if ':' in s:\n        m, sec = s.split(':')\n        return int(m) * 60 + float(sec)\n    return float(s)",
        "output": "1:02.35 -> 62.35",
        "tip": "时间格式要先归一化；混着字符串和秒数排序一定错。"
      },
      {
        "h": "验收与测试",
        "p": "用 10 行固定数据覆盖：正常、犯规、缺赛、并列、时间格式。断言排名、犯规名单、班级总分。再做一次端到端：临时 CSV 进，Excel/MD 出。",
        "code": "assert report['rank'][0]['rank'] == 1\nassert report['fouls'] == ['张三']\nassert Path('out.xlsx').exists()",
        "output": "通过：排名/犯规/文件生成",
        "tip": "综合项目测试要有一组端到端；只测函数发现不了接线错误。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加年龄组、接力项目、破纪录标记、历史对比、Web 页面；用 pytest-cov 看覆盖率；把 CLI 打成 wheel。最后写一份 README，让别人能复现你的报表。",
        "code": "",
        "output": "",
        "tip": "综合项目的交付物是“可复现的流程”，不是一堆脚本。"
      }
    ],
    "points": [
      "先画数据流，再分阶段实现。",
      "时间/成绩先归一化。",
      "端到端测试验证接线。"
    ],
    "practice": "实现游泳成绩报表：清洗、排名、犯规名单、Excel/Markdown 导出，并用 10 行数据端到端测试。",
    "source": "本章加餐 · 工程实战工作坊"
  }
};
(function () {
  var chapters = window.PY_FOUNDATIONS_CHAPTERS || [];
  var addons = window.PY_FOUNDATIONS_CAPSTONES || {};
  for (var i = 0; i < chapters.length; i += 1) {
    var addon = addons[chapters[i].id];
    if (addon) chapters[i].lessons.push(addon);
  }
})();
