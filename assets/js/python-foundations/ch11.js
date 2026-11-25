window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch11",
  part: 3,
  number: "11",
  title: "继承、属性与魔术方法",
  summary: "继承不是「高级组合」，属性也不是「给字段套个 getter」。这一章讲 MRO、super、property、描述符和 Python 数据模型，让你知道什么时候该用、什么时候该停。",
  goals: [
    "能解释 MRO 和 super() 的真实行为",
    "能用 property 保护不变量，而不是写无意义 getter/setter",
    "能实现 __len__/__iter__/__enter__ 等常用魔术方法",
    "能判断继承、组合、描述符的适用边界"
  ],
  lessons: [
    {
      id: "ch11-1",
      title: "11.1 继承、MRO 与 super()",
      minutes: 45,
      lead: "继承最容易「看起来会写，实际用错」。super() 不是「调用父类」，MRO 也不是「从左到右找第一个」。这一节把继承链、方法解析顺序和多继承陷阱拆开。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7、9",
      sections: [
        {
          h: "继承表达 is-a，但别把「共享字段」当 is-a",
          p: `[[class Swimmer(Person)]] 表示「运动员是人」，可以复用 Person 的 name/age，也能被当 Person 使用。但如果两个类只是「都有 name」，就不该继承：那是共享字段，不是类型关系。用组合/共享基类/值对象更清晰。

继承的代价：子类依赖父类实现，父类改方法会影响所有子类；多继承会让方法来源更难追踪；测试要覆盖整条链。只有当子类确实需要父类的行为，并且愿意接受这种耦合时，才继承。

判断句：[[isinstance(child, parent)]] 在业务上应该有意义。如果这个判断很别扭，别继承。`,
          code: String.raw`class Person:
    def __init__(self, name):
        self.name = name

class Swimmer(Person):
    def __init__(self, name, event):
        super().__init__(name)
        self.event = event

s = Swimmer("林晓", "100m")
print(s.name, s.event)
print(isinstance(s, Person))`,
          output: `林晓 100m
True`,
          tip: `[[isinstance(child, parent)]] 在业务上必须成立；只是共享字段时用组合，不要继承。`
        },
        {
          h: "super() 不是「父类」，是 MRO 上的下一个类",
          p: `在单继承里，[[super().method()]] 看起来就是「调用父类方法」；在多继承里，它指的是「当前类在 MRO 中的下一个类」，不一定是直接父类。[[super()]] 返回一个代理对象，按 MRO 顺序查找。

所以父类方法里也写 [[super()]] 时，调用会沿着整条 MRO 走，每个类只执行一次。这是协作式多继承的基础：每个类负责自己那一段，然后交给下一个。

[[super()]] 不写参数时依赖 [[__class__]] 闭包；在静态方法/类外使用会失效。需要显式时写 [[super(Swimmer, self)]]，但通常不需要。`,
          code: String.raw`class A:
    def ping(self):
        print("A")

class B(A):
    def ping(self):
        print("B")
        super().ping()

class C(A):
    def ping(self):
        print("C")
        super().ping()

class D(B, C):
    def ping(self):
        print("D")
        super().ping()

D().ping()
print([c.__name__ for c in D.__mro__])`,
          output: `D
B
C
A
['D', 'B', 'C', 'A', 'object']`,
          tip: `[[super()]] 沿 MRO 走，不是固定父类；多继承里每个类只应处理自己那一段。`
        },
        {
          h: "MRO 是 C3 线性化：先深度，再从左到右",
          p: `[[Class.__mro__]] 给出方法解析顺序。C3 线性化保证：子类在父类前；同一层按继承列表从左到右；不破坏每个类的局部顺序。它不是简单的「深度优先」，多继承时可能和你直觉不同。

如果 MRO 无法满足所有顺序，Python 会在类创建时抛 [[TypeError: Cannot create a consistent method resolution order]]。这通常说明继承图有环或顺序矛盾，不要靠调整基类顺序硬凑。

排查方法：打印 [[__mro__]]，看方法实际从哪来；用 [[Class.method.__qualname__]] 确认定义位置。不要凭「应该走父类」猜。`,
          code: String.raw`class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass

print([c.__name__ for c in D.__mro__])
print(D.__mro__[1].__name__)
print(D.ping if hasattr(D, "ping") else "no ping")`,
          output: `['D', 'B', 'C', 'A', 'object']
B
no ping`,
          tip: `MRO 是 C3 线性化，不是深度优先；用 [[__mro__]] 看真实顺序，别猜。`
        },
        {
          h: "多继承的三种真实用途与陷阱",
          p: `多继承在 Python 里主要出现在三类场景：混入类（mixin）加行为、协议/抽象基类、框架的协作式继承。它不适合「把两个不相关的业务类拼在一起」。

Mixin 应该只做一件事，不定义 [[__init__]]，不依赖具体状态；例如 [[LogMixin]] 只提供 [[log()]] 方法。多个 mixin 的顺序会影响 MRO，文档要写清楚。

陷阱：菱形继承中每个类的 [[__init__]] 是否都调用 [[super().__init__]]；不调用就会漏初始化。另一个陷阱是子类覆盖方法但忘了 [[super()]]，父类的校验/清理没执行。`,
          code: String.raw`class LogMixin:
    def log(self, msg):
        print(f"[{type(self).__name__}] {msg}")

class Repo:
    def save(self, row):
        print("save", row)

class LoggedRepo(LogMixin, Repo):
    def save(self, row):
        self.log("before")
        super().save(row)

LoggedRepo().save({"name": "林晓"})`,
          output: `[LoggedRepo] before
save {'name': '林晓'}`,
          tip: `Mixin 只做一件事、不定义 [[__init__]]；覆盖方法时想清楚是否必须 [[super()]]。`
        },
        {
          h: "覆盖 vs 扩展：不要悄悄改变父类契约",
          p: `子类覆盖方法时，调用方仍然期望父类的契约：参数含义、返回值类型、异常类型、副作用。如果父类 [[save()]] 返回 id，子类返回 None，调用方就会崩。

扩展是在父类行为基础上加东西，通常先 [[super()]] 再处理；覆盖是替换行为，必须保证契约兼容。改变契约时，应该定义新方法名，而不是覆盖。

文档里写清楚「子类必须调用 super()」或「此方法可覆盖」。类型检查器不能保证语义契约，测试和文档才是。`,
          code: String.raw`class Repo:
    def save(self, row) -> int:
        return 1

class BadRepo(Repo):
    def save(self, row):
        print("saved")
        # 返回 None，破坏契约

class GoodRepo(Repo):
    def save(self, row) -> int:
        print("saved")
        return super().save(row)

print(BadRepo().save({}), GoodRepo().save({}))`,
          output: `saved
None
saved
1`,
          tip: `覆盖必须保持返回值/异常/副作用契约；要改契约就新增方法名，别悄悄替换。`
        },
        {
          h: "动手实验：把继承改成组合",
          p: `拿一个 [[Swimmer(Person)]] 的例子，改成 [[Swimmer]] 持有 [[Person]] 或直接持有 name/age。比较两种写法：[[isinstance]] 是否还需要？序列化是否更简单？测试是否更容易？

如果业务里没有任何地方需要把 Swimmer 当 Person 用，组合通常更清晰。把结论写进设计说明，而不是「因为面向对象所以继承」。`,
          code: String.raw`from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int

@dataclass
class Swimmer:
    person: Person
    event: str

s = Swimmer(Person("林晓", 15), "100m")
print(s.person.name, s.event)`,
          output: `林晓 100m`,
          tip: `没有 [[isinstance]] 需求时，组合通常更清晰；继承只在真正 is-a 且需要共享行为时用。`
        }
      ],
      points: [
        "继承表达 is-a，共享字段用组合。",
        "super() 沿 MRO 找下一个类，不是固定父类。",
        "MRO 是 C3 线性化，用 __mro__ 看真实顺序。",
        "Mixin 只做一件事，不定义 __init__。",
        "覆盖必须保持父类契约，改契约用新方法名。"
      ],
      practice: "写一个 `LoggedRepo(LogMixin, Repo)`，要求 `save` 先日志再调 `super().save`，并写测试确认父类返回值没有被吞掉。"
    },
    {
      id: "ch11-2",
      title: "11.2 property、描述符与类方法",
      minutes: 45,
      lead: "property 不是「给字段加 getter/setter」的仪式，而是保护不变量的工具。这一节讲 property 的真实用途、setter 校验、描述符协议，以及 classmethod/staticmethod 的区别。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7、9",
      sections: [
        {
          h: "property 的价值：把字段变成受控接口",
          p: `如果 [[scores]] 是公开列表，调用方可以 [[append(120)]] 绕过校验。用 property 暴露只读视图，写操作走 [[add()]]，就能保证范围。property 让「属性访问」和「方法调用」看起来一样，但内部可以执行逻辑。

只有 getter 的 property 是只读；加 setter 才能赋值；加 deleter 才能 [[del]]。不要给每个字段都写 getter/setter，那只是把 [[self.x]] 换成 [[self._x]]，没有增加任何规则。

判断标准：这个字段被读写时，有没有必须执行的校验、转换、缓存、日志？有才用 property。`,
          code: String.raw`class Swimmer:
    def __init__(self):
        self._scores = []
    @property
    def scores(self):
        return tuple(self._scores)
    def add(self, score):
        if not 0 <= score <= 100:
            raise ValueError("分数越界")
        self._scores.append(float(score))

s = Swimmer()
s.add(91)
print(s.scores)
try:
    s.scores.append(120)
except AttributeError as err:
    print(type(err).__name__)`,
          output: `(91.0,)
AttributeError`,
          tip: `只读 property 返回 tuple/副本，防止调用方绕过校验；写操作走专门方法。`
        },
        {
          h: "setter 校验与「赋值失败不留半状态」",
          p: `setter 里校验失败要抛异常，并且不要先改一半再报错。比如先 [[self._x = value]] 再检查范围，失败时对象已经处于非法状态。正确顺序是先校验，再赋值。

setter 也不应该做昂贵 IO；属性赋值看起来是廉价的，如果里面写数据库，调用方会误判性能。需要 IO 就显式方法。

删除 property 的 deleter 要恢复默认值还是删除字段？想清楚语义。[[del s.x]] 后再次访问应该返回什么？不确定就别提供 deleter。`,
          code: String.raw`class Swimmer:
    def __init__(self, age):
        self.age = age
    @property
    def age(self):
        return self._age
    @age.setter
    def age(self, value):
        if not 0 < value < 100:
            raise ValueError("年龄不合法")
        self._age = value

s = Swimmer(15)
print(s.age)
try:
    s.age = 120
except ValueError as err:
    print(err, s.age)`,
          output: `15
年龄不合法 15`,
          tip: `setter 先校验再赋值；失败时旧值必须保持不变。`
        },
        {
          h: "描述符协议：property 的底层机制",
          p: `property 是描述符的一种。描述符是定义了 [[__get__]]、[[__set__]]、[[__delete__]] 的类属性；访问实例属性时，Python 会调用描述符的 [[__get__]]。数据描述符（有 [[__set__]]）优先于实例 [[__dict__]]。

自定义描述符适合「多个类共享同一套字段规则」，例如 [[PositiveInt]]、[[NonEmptyStr]]。它比给每个类写 property 更复用，但可读性下降；小项目直接用 property。

描述符在类创建时绑定到类属性，不能存在实例里；[[__set_name__]] 可以拿到字段名，用于错误消息。`,
          code: String.raw`class Positive:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return obj.__dict__[self.name]
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} 必须为正")
        obj.__dict__[self.name] = value

class Result:
    seconds = Positive()
    def __init__(self, seconds):
        self.seconds = seconds

r = Result(62.35)
print(r.seconds)
try:
    r.seconds = 0
except ValueError as err:
    print(err)`,
          output: `62.35
seconds 必须为正`,
          tip: `描述符是类属性；[[__set_name__]] 能拿到字段名，错误消息才有上下文。`
        },
        {
          h: "classmethod 与 staticmethod：第一个参数是谁",
          p: `[[@classmethod]] 的第一个参数是类 [[cls]]，适合工厂方法、替代构造器、读取类级配置。[[@staticmethod]] 没有隐式参数，只是放在类命名空间里的普通函数，适合与类相关但不依赖实例/类的工具。

[[classmethod]] 在继承中会被子类覆盖 [[cls]]，所以 [[Result.from_dict]] 在子类调用时能构造子类。[[staticmethod]] 不会，它不知道子类是谁。

不要用 staticmethod 包一切工具函数；如果不需要类，放模块级函数更简单。classmethod 最适合 [[from_...]] 工厂。`,
          code: String.raw`class Result:
    def __init__(self, event, seconds):
        self.event = event
        self.seconds = seconds
    @classmethod
    def from_dict(cls, data):
        return cls(data["event"], float(data["seconds"]))
    @staticmethod
    def unit():
        return "seconds"

r = Result.from_dict({"event": "100m", "seconds": "62.35"})
print(r.event, Result.unit())`,
          output: `100m seconds`,
          tip: `工厂方法用 [[@classmethod]]，[[cls]] 会跟着子类走；[[@staticmethod]] 不知道类是谁。`
        },
        {
          h: "动手实验：用 property 保护成绩对象",
          p: `给 [[Swimmer]] 加只读 [[scores]]、可写 [[age]]、只读 [[average]]。要求：[[scores]] 返回 tuple；[[age]] setter 校验 6–60；[[average]] 空列表返回 None；外部不能直接改 [[_scores]]。

再写一个 [[Positive]] 描述符保护 [[Result.seconds]]，比较 property 和描述符两种写法的代码量/可读性。`,
          code: String.raw`class Swimmer:
    def __init__(self, age):
        self.age = age
        self._scores = []
    @property
    def age(self): return self._age
    @age.setter
    def age(self, value):
        if not 6 <= value <= 60:
            raise ValueError("age 6..60")
        self._age = value
    @property
    def scores(self): return tuple(self._scores)
    @property
    def average(self):
        return sum(self._scores) / len(self._scores) if self._scores else None

s = Swimmer(15)
print(s.age, s.scores, s.average)`,
          output: `15 () None`,
          tip: `property 适合单类规则，描述符适合多类复用；不要给无规则字段套 property。`
        }
      ],
      points: [
        "property 用来保护不变量/转换/缓存，不是给字段套壳。",
        "只读 property 返回副本，写操作走校验方法。",
        "setter 先校验再赋值，失败不留半状态。",
        "描述符是类属性，__set_name__ 能拿到字段名。",
        "classmethod 的 cls 会跟随子类，staticmethod 不会。"
      ],
      practice: "实现 `Swimmer.scores` 只读、`age` setter 校验、`average` 空返回 None；再写 `Positive` 描述符保护 `Result.seconds`。"
    },
    {
      id: "ch11-3",
      title: "11.3 魔术方法与 Python 数据模型",
      minutes: 45,
      lead: "[[len(x)]]、[[for x in obj]]、[[with obj]] 背后都是魔术方法。这一节只讲最常用的几个：容器协议、迭代协议、上下文管理、相等/哈希，以及为什么不要滥用量运算符。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.9",
      sections: [
        {
          h: "容器协议：__len__、__getitem__、__contains__",
          p: `实现 [[__len__]] 后 [[len(obj)]] 可用；实现 [[__getitem__]] 后 [[obj[i]]] 可用，并且在没有 [[__iter__]] 时，[[for]] 会退化为「从 0 开始索引直到 IndexError」；实现 [[__contains__]] 后 [[x in obj]] 可用。

容器对象要明确「长度」和「索引」的语义。[[__getitem__]] 支持切片时，要返回同类型对象还是列表？返回类型不一致会让调用方困惑。只读容器不要提供 [[__setitem__]]。

[[__len__]] 必须返回非负整数，不能返回 [[bool]] 或浮点。长度是 O(1) 的承诺，不要在 [[__len__]] 里遍历整个集合。`,
          code: String.raw`class Scores:
    def __init__(self, values):
        self._values = list(values)
    def __len__(self):
        return len(self._values)
    def __getitem__(self, i):
        return self._values[i]
    def __contains__(self, value):
        return value in self._values

s = Scores([91, 88.5])
print(len(s), s[0], 91 in s)
print([x for x in s])`,
          output: `2 91 True
[91, 88.5]`,
          tip: `[[__len__]] 必须 O(1) 且返回非负整数；切片返回类型要和调用方预期一致。`
        },
        {
          h: "迭代协议：__iter__ 与生成器",
          p: `[[for]] 先调用 [[iter(obj)]]，再不断 [[next()]]，直到 [[StopIteration]]。[[__iter__]] 应该返回一个新的迭代器（或生成器），不要返回 [[self]] 除非对象本身维护迭代状态。

同一个可迭代对象应该能被多次遍历。如果 [[__iter__]] 返回 [[self]] 且状态存在对象里，第二次 for 会从上次位置继续，这是常见 bug。用生成器函数最省心：每次调用返回新生成器。

[[__next__]] 一般不需要自己写；用 [[yield]] 实现迭代器更简单。`,
          code: String.raw`class Scores:
    def __init__(self, values):
        self._values = list(values)
    def __iter__(self):
        for value in self._values:
            yield value

s = Scores([91, 88.5])
print(list(s))
print(list(s))`,
          output: `[91, 88.5]
[91, 88.5]`,
          tip: `[[__iter__]] 返回新迭代器/生成器，保证可重复遍历；不要返回 [[self]] 保存状态。`
        },
        {
          h: "上下文管理：__enter__/__exit__ 的返回值",
          p: `[[with obj as x]] 中，[[x]] 是 [[__enter__]] 的返回值，不一定是 [[obj]]。文件对象的 [[__enter__]] 返回自身，锁对象也常返回自身；数据库连接可能返回游标。

[[__exit__]] 接收异常三元组，返回 [[True]] 吞异常，返回 [[False]]/[[None]] 继续传播。清理代码放 [[__exit__]]，不要吞掉不该吞的异常。

[[contextlib.contextmanager]] 用生成器实现同样的协议，适合简单资源；复杂类再手写 [[__enter__/__exit__]]。`,
          code: String.raw`class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        import time
        self.elapsed = time.perf_counter() - self.start
        return False

with Timer() as t:
    sum(range(100000))
print(f"{t.elapsed:.4f}s")`,
          output: `0.0031s`,
          tip: `[[__enter__]] 的返回值才是 [[as]] 后面的变量；[[__exit__]] 返回 True 会吞异常，慎用。`
        },
        {
          h: "__eq__ 与 __hash__：相等和哈希必须一致",
          p: `默认 [[__eq__]] 比较身份，[[__hash__]] 基于身份。自定义 [[__eq__]] 后，Python 会把 [[__hash__]] 设为 [[None]]，对象不可哈希；需要可哈希时，必须同时定义 [[__hash__]]。

规则：相等对象哈希必须相同；不相等的对象哈希可以相同（哈希碰撞）。可变对象不要定义基于可变字段的哈希，否则放进 set/dict 后字段一变就找不到。

dataclass 的 [[frozen=True, eq=True]] 会自动生成一致的 [[__hash__]]；可变 dataclass 默认不可哈希。`,
          code: String.raw`class Result:
    def __init__(self, event, seconds):
        self.event = event
        self.seconds = seconds
    def __eq__(self, other):
        return isinstance(other, Result) and (self.event, self.seconds) == (other.event, other.seconds)
    def __hash__(self):
        return hash((self.event, self.seconds))

a = Result("100m", 62.35)
b = Result("100m", 62.35)
print(a == b, hash(a) == hash(b), len({a, b}))`,
          output: `True True 1`,
          tip: `自定义 [[__eq__]] 后默认不可哈希；要可哈希就同时实现 [[__hash__]]，并保证一致。`
        },
        {
          h: "运算符重载：只做「显然」的事",
          p: `[[__add__]]、[[__mul__]]、[[__lt__]] 可以让对象支持 [[+]]、[[*]]、[[<]]。但运算符有约定语义：[[+]] 应该返回新对象，不应修改左操作数；[[<]] 应该定义全序，不能自相矛盾。

不要用运算符表达业务动作。[[result + swimmer]] 让人猜不透；写 [[result.add_swimmer()]] 更清楚。运算符重载适合数值/向量/金额/时间这类「显然」的类型。

实现 [[__add__]] 时，对不支持的类型返回 [[NotImplemented]]，让 Python 尝试右操作数的 [[__radd__]]，最后才抛 [[TypeError]]。不要直接抛异常。`,
          code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class Seconds:
    value: float
    def __add__(self, other):
        if not isinstance(other, Seconds):
            return NotImplemented
        return Seconds(self.value + other.value)

print(Seconds(62.35) + Seconds(0.5))
try:
    Seconds(1) + 2
except TypeError as err:
    print(type(err).__name__)`,
          output: `Seconds(value=62.85)
TypeError`,
          tip: `运算符只用于显然语义；不支持的类型返回 [[NotImplemented]]，不要直接抛异常。`
        },
        {
          h: "动手实验：让成绩集合支持 len/for/with",
          p: `实现 [[ScoreBook]]：支持 [[len()]]、[[for]]、[[in]]、[[with]]。[[with]] 进入时打开一个临时文件，退出时关闭并删除；[[for]] 每次返回新生成器，保证二次遍历结果一致。

写测试验证：两次 [[list(book)]] 长度相同；[[with]] 块内抛异常后文件仍被清理；[[120 in book]] 为 False。`,
          code: String.raw`class ScoreBook:
    def __init__(self, values):
        self._values = list(values)
    def __len__(self): return len(self._values)
    def __iter__(self): return iter(self._values)
    def __contains__(self, v): return v in self._values
    def __enter__(self): return self
    def __exit__(self, *exc): return False

b = ScoreBook([91, 88.5])
print(len(b), list(b), 91 in b)`,
          output: `2 [91, 88.5] True`,
          tip: `容器协议要保证可重复遍历；[[__exit__]] 负责清理，但不要吞异常。`
    }
      ],
      points: [
        "__len__ 必须 O(1) 且返回非负整数；__getitem__ 要定义切片语义。",
        "__iter__ 返回新迭代器/生成器，保证可重复遍历。",
        "__enter__ 的返回值才是 as 变量；__exit__ 返回 True 会吞异常。",
        "__eq__ 和 __hash__ 必须一致；可变对象不要基于可变字段哈希。",
        "运算符只用于显然语义，不支持时返回 NotImplemented。"
      ],
      practice: "实现 `ScoreBook` 支持 len/for/in/with，写 3 个测试：二次遍历、异常清理、包含判断；再给 `Seconds` 实现 `__add__`。"
    }
  ]
});
