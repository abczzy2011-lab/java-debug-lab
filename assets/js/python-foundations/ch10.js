window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch10",
  part: 3,
  number: "10",
  title: "类、对象与组合",
  summary: "从「用字典装数据」升级到「用对象表达规则」。这一章讲类与实例、属性查找、self、dataclass 和组合，不急着讲继承；先把「一个对象该知道什么、该做什么」想清楚。",
  goals: [
    "能解释类属性与实例属性的区别和查找顺序",
    "能写出带校验、相等性和可读表示的 dataclass",
    "能用组合表达 Swimmer/Result 这种 has-a 关系",
    "能把散落的字典重构为有边界、可测试的对象"
  ],
  lessons: [
    {
      id: "ch10-1",
      title: "10.1 类、实例、属性与方法",
      minutes: 45,
      lead: "类不是「带函数的字典」，实例也不是「类的副本」。这一节从属性查找讲起，解释 self 到底是什么、类属性和实例属性为什么会互相遮蔽，最后用一个运动员类把概念落地。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7",
      sections: [
        {
          h: "类是一个命名空间，也是一个对象工厂",
          p: `[[class Swimmer: ...]] 执行时，Python 创建一个类对象，把类体里的函数、变量装进它的命名空间。类对象本身也是对象，可以赋值、可以传参、可以放在列表里。调用 [[Swimmer()]] 时，类对象创建一个实例，并调用 [[__init__]] 做初始化。

[[__init__]] 不是构造函数，实例在它之前已经由 [[__new__]] 创建。绝大多数情况不需要写 [[__new__]]；你只需要在 [[__init__]] 里给实例绑定初始属性。[[__init__]] 必须返回 [[None]]，返回其他值会报 [[TypeError]]。

类体里写的 [[def]] 是函数，绑定到实例后变成方法。方法的第一参数习惯叫 [[self]]，它不是关键字，只是「实例」的约定名。调用 [[s.speak()]] 时，Python 自动把 [[s]] 作为第一个参数传进去；直接 [[Swimmer.speak(s)]] 也可以，但不常用。`,
          code: String.raw`class Swimmer:
    team = "海豚队"

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def label(self):
        return f"{self.name} / {self.age}"

s = Swimmer("林晓", 15)
print(Swimmer.team, s.team)
print(s.label())
print(type(Swimmer), type(s))
print(isinstance(s, Swimmer))`,
          output: `海豚队 海豚队
林晓 / 15
<class 'type'> <class '__main__.Swimmer'>
True`,
          tip: `[[__init__]] 只负责初始化，不负责创建；不要返回非 [[None]]，也不要把它当构造函数重载。`
        },
        {
          h: "self 是什么：绑定方法的一次搬运",
          p: `[[s.label()]] 不是「在类里找 label 然后调用」，而是先通过 [[s.label]] 得到一个绑定方法对象，这个对象里保存了 [[s]] 和函数 [[Swimmer.label]]；调用时把 [[s]] 作为第一个参数传进去。所以 [[self]] 就是「当前实例」。

这也解释了为什么方法定义要写 [[self]]，而调用不传：[[s.label()]] 等价于 [[Swimmer.label(s)]]。如果你把方法赋值给一个变量 [[f = s.label]]，[[f()]] 仍然绑定 [[s]]；如果 [[f = Swimmer.label]]，[[f()]] 就需要显式传实例。

[[self]] 不是保留字，你可以叫 [[this]]，但没人会这么做。保持 [[self]] 是团队可读性的一部分。`,
          code: String.raw`class Counter:
    def __init__(self):
        self.value = 0

    def add(self, n=1):
        self.value += n
        return self.value

c = Counter()
f = c.add
print(f(2), f(3))
print(Counter.add(c, 5))`,
          output: `2 5
10`,
          tip: `[[s.method]] 是绑定方法；[[Class.method]] 是普通函数，需要显式传实例。`
        },
        {
          h: "类属性与实例属性：查找顺序与遮蔽",
          p: `属性查找先看实例 [[__dict__]]，再看类 [[__dict__]]，再沿继承链向上。实例属性会遮蔽同名类属性；给实例赋值不会改类属性，但改类属性会影响所有没有同名实例属性的对象。

可变类属性是经典坑：[[class A: items = []]] 所有实例共享同一个列表，[[a.items.append(1)]] 会改到 [[A.items]] 和所有实例。正确做法是在 [[__init__]] 里 [[self.items = []]]]，每个实例一份。

类属性适合常量、默认配置、所有实例共享的只读值；实例属性适合每个对象独有的状态。判断标准是「这个值是否随对象变化」。`,
          code: String.raw`class Swimmer:
    team = "海豚队"
    tags = []

a = Swimmer()
b = Swimmer()
a.tags.append("MVP")
print(b.tags, Swimmer.tags)

a.team = "鲨鱼队"
print(a.team, b.team, Swimmer.team)`,
          output: `['MVP'] ['MVP']
鲨鱼队 海豚队 海豚队`,
          tip: `可变默认值不要放类属性；在 [[__init__]] 里创建，或者用 [[dataclass(default_factory=list)]]。`
        },
        {
          h: "dataclass：把样板代码交给装饰器",
          p: `手写 [[__init__]]、[[__repr__]]、[[__eq__]] 很枯燥，[[@dataclass]] 根据类型注解生成它们。默认 [[eq=True]]、[[repr=True]]；[[frozen=True]] 让实例不可变并可哈希；[[order=True]] 生成排序方法。

字段默认值有顺序限制：有默认值的字段不能排在无默认值字段前面。可变默认值必须用 [[field(default_factory=list)]]，不能直接 [[[]]]，否则所有实例共享同一个列表。

[[__post_init__]] 适合做校验或派生字段。它在 [[__init__]] 末尾调用，可以读所有字段。校验失败抛 [[ValueError]]，不要静默修正。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float
    tags: tuple[str, ...] = field(default_factory=tuple)

    def __post_init__(self):
        if self.seconds <= 0:
            raise ValueError("seconds 必须为正")

r = Result("100m", 62.35)
print(r)
print(r == Result("100m", 62.35))
print(hash(r) == hash(Result("100m", 62.35)))`,
          output: `Result(event='100m', seconds=62.35, tags=())
True
True`,
          tip: `[[frozen=True]] 的 dataclass 才能安全当字典键；可变字段用 [[field(default_factory=...)]]。`
        },
        {
          h: "对象表示：__repr__ 给人看，__str__ 给用户看",
          p: `[[repr(obj)]] 的目标是「尽可能还原对象的调试信息」，[[str(obj)]] 的目标是「给最终用户看」。默认 [[repr]] 只显示内存地址，对调试没有帮助；dataclass 自动生成可读的 [[repr]]。

日志里应该用 [[%r]] 或 [[repr()]]，因为它能显示引号、换行、类型；面向用户的输出用 [[str()]]/f-string。不要在一个方法里同时承担两种职责。

[[__repr__]] 不应该有副作用，也不应该做昂贵计算。它可能被调试器、日志、异常信息随时调用。`,
          code: String.raw`class Swimmer:
    def __init__(self, name):
        self.name = name
    def __repr__(self):
        return f"Swimmer(name={self.name!r})"
    def __str__(self):
        return self.name

s = Swimmer("林晓")
print(str(s))
print(repr(s))
print([s])`,
          output: `林晓
Swimmer(name='林晓')
[Swimmer(name='林晓')]`,
          tip: `[[repr]] 用 [[!r]] 显示字段，日志才看得出字符串边界；[[str]] 给用户看，不要放调试细节。`
        },
        {
          h: "动手实验：把字典改成运动员对象",
          p: `拿第一篇的 [[{"name": ..., "scores": [...]}]] 改成 [[Swimmer]] 类：字段 name、scores；方法 [[average()]]、[[best()]]、[[add(score)]]；校验分数在 0–100；[[__repr__]] 可读。要求空分数时 [[average()]] 返回 [[None]] 而不是崩。

然后把原来的函数 [[average(record)]] 改成对象方法，观察调用点变化。重点不是「面向对象更高级」，而是「规则跟着数据走，调用方不用每次记得检查」。`,
          code: String.raw`class Swimmer:
    def __init__(self, name, scores=None):
        self.name = name
        self.scores = []
        for score in scores or []:
            self.add(score)

    def add(self, score):
        if not 0 <= score <= 100:
            raise ValueError(f"分数越界：{score}")
        self.scores.append(score)

    def average(self):
        return sum(self.scores) / len(self.scores) if self.scores else None

    def __repr__(self):
        return f"Swimmer({self.name!r}, {self.scores!r})"

s = Swimmer("林晓", [91, 88.5])
print(s, s.average())
try:
    s.add(120)
except ValueError as err:
    print(err)`,
          output: `Swimmer('林晓', [91, 88.5]) 89.75
分数越界：120`,
          tip: `校验放在 [[add]] 里，所有入口都经过它；不要指望调用方每次都记得检查范围。`
        }
      ],
      points: [
        "类对象和实例是两种对象；__init__ 只初始化，不创建。",
        "self 是绑定方法自动传入的当前实例。",
        "实例属性遮蔽类属性；可变类属性会被所有实例共享。",
        "dataclass 生成 init/repr/eq，frozen 还能哈希。",
        "repr 给调试，str 给用户，日志优先用 repr。"
      ],
      practice: "实现 `Swimmer(name, scores)`：`add` 校验 0–100，`average` 空列表返回 None，`best` 返回最高分；用 dataclass 版本再写一遍，比较两者差异。"
    },
    {
      id: "ch10-2",
      title: "10.2 组合：对象之间怎么「拥有」",
      minutes: 45,
      lead: "inheritance 不是默认答案。大多数业务关系是 has-a：一个运动员拥有多条成绩，一个队伍拥有多个运动员。这一节用组合把 Swimmer/Result/Team 搭起来，并讲清楚依赖注入和不可变对象。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7",
      sections: [
        {
          h: "组合与继承：先问「是什么」还是「有什么」",
          p: `继承表达 is-a：[[Dog]] 是一种 [[Animal]]；组合表达 has-a：[[Team]] 拥有多个 [[Swimmer]]，[[Swimmer]] 拥有多条 [[Result]]。业务系统里大多数关系是 has-a，因为「运动员」不是「成绩列表」，它只是拥有成绩。

组合的优点：边界清晰、替换容易、测试简单。你可以把 [[Team]] 的存储换成列表、数据库、API，只要接口不变。继承的优点：共享行为、利用多态；但继承会把父类的实现细节绑进子类，改父类容易伤子类。

判断方法：如果两个类的关系能用「是一个」造句且不别扭，才考虑继承；否则用组合。不要为了「代码看起来像面向对象」而继承。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

@dataclass
class Swimmer:
    name: str
    results: list[Result] = field(default_factory=list)

@dataclass
class Team:
    name: str
    swimmers: list[Swimmer] = field(default_factory=list)

team = Team("海豚队", [Swimmer("林晓", [Result("100m", 62.35)])])
print(team.swimmers[0].results[0].seconds)`,
          output: `62.35`,
          tip: `has-a 关系用组合；只有「是一种」且确实需要共享行为时才用继承。`
        },
        {
          h: "把集合本身做成对象：Team 的查询方法",
          p: `[[Team]] 不应该让调用方直接操作 [[team.swimmers]]。把常用查询封装成方法：[[add()]]、[[find(name)]]、[[best(event)]]、[[average(event)]]。这样以后换成数据库或缓存，调用方不用改。

方法要返回「业务结果」，不要返回内部结构。[[best(event)]] 返回 [[(swimmer, result)]] 或 [[None]]，而不是让调用方自己遍历。内部列表仍然可以公开读，但写操作走方法，保证校验和索引。

如果集合很大，可以在 [[add()]] 里维护索引字典；但不要过早优化。先保证接口清晰，再用性能测试决定是否加索引。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

@dataclass
class Swimmer:
    name: str
    results: list[Result] = field(default_factory=list)

@dataclass
class Team:
    name: str
    swimmers: list[Swimmer] = field(default_factory=list)

    def add(self, swimmer):
        if any(s.name == swimmer.name for s in self.swimmers):
            raise ValueError(f"重名：{swimmer.name}")
        self.swimmers.append(swimmer)

    def best(self, event):
        pairs = [(s, r) for s in self.swimmers for r in s.results if r.event == event]
        return min(pairs, key=lambda p: p[1].seconds) if pairs else None

team = Team("海豚队")
team.add(Swimmer("林晓", [Result("100m", 62.35)]))
team.add(Swimmer("周宁", [Result("100m", 60.88)]))
print(team.best("100m"))`,
          output: `(Swimmer(name='周宁', results=[Result(event='100m', seconds=60.88)]), Result(event='100m', seconds=60.88))`,
          tip: `集合的写操作走方法，读可以公开；不要在调用方到处 [[team.swimmers.append()]] 绕过校验。`
        },
        {
          h: "依赖注入：不要在对象里 new 全局资源",
          p: `如果 [[Team]] 的 [[__init__]] 里直接 [[sqlite3.connect("team.db")]]，测试就必须有数据库，换存储也必须改类。依赖注入是把「外部资源」作为参数传进来：[[Team(repo)]]，repo 可以是 SQLite、内存、假对象。

Python 没有接口强制，但可以用协议（[[typing.Protocol]]）描述 [[repo]] 需要哪些方法：[[load()]]、[[save()]]。测试传一个内存实现，生产传 SQLite 实现，[[Team]] 不关心区别。

不要注入太多。只注入「会变化的外部边界」：数据库、HTTP 客户端、时钟、随机源。纯函数和值对象直接创建就好。`,
          code: String.raw`class MemoryRepo:
    def __init__(self):
        self.rows = []
    def save(self, row):
        self.rows.append(row)
    def load(self):
        return list(self.rows)

class Team:
    def __init__(self, repo):
        self.repo = repo
    def add(self, name):
        self.repo.save({"name": name})

repo = MemoryRepo()
team = Team(repo)
team.add("林晓")
print(repo.load())`,
          output: `[{'name': '林晓'}]`,
          tip: `只注入会变化的外部边界；纯值对象直接创建，不要为了「设计模式」把简单代码复杂化。`
        },
        {
          h: "不可变对象：共享安全与可哈希",
          p: `[[frozen=True]] 的 dataclass 创建后不能改字段，适合 Result、配置、坐标这类值对象。不可变对象可以安全共享、可以当字典键、可以放进 set；多线程读也不需要锁。

不可变不等于「内部所有东西都不可变」。[[frozen]] 只阻止字段重新赋值；如果字段是列表，列表内容仍可改，对象也因此不可哈希。要真正不可变，字段也得用 tuple/frozenset/不可变对象。

需要「修改」时，用 [[dataclasses.replace(obj, seconds=...)]] 返回新对象，而不是原地改。这样旧对象仍然有效，适合撤销、历史记录、缓存键。`,
          code: String.raw`from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

r1 = Result("100m", 62.35)
r2 = replace(r1, seconds=61.90)
print(r1, r2)
print({r1, r2})
try:
    r1.seconds = 60
except Exception as err:
    print(type(err).__name__)`,
          output: `Result(event='100m', seconds=62.35) Result(event='100m', seconds=61.9)
{Result(event='100m', seconds=62.35), Result(event='100m', seconds=61.9)}
FrozenInstanceError`,
          tip: `[[replace()]] 返回新对象；frozen 只防字段赋值，字段里的 list 仍可变，也就不可哈希。`
        },
        {
          h: "对象与 JSON：序列化边界放在哪一层",
          p: `把对象直接 [[json.dumps]] 会报 [[TypeError]]。常见做法是给对象加 [[to_dict()]]，或者用 [[dataclasses.asdict()]]。读回时用 [[from_dict()]] 做校验和类型转换。

边界原则：JSON 层只认基本类型；对象层负责业务规则。不要让 [[to_dict]] 里塞满业务判断，也不要让 [[from_dict]] 静默接受坏数据。转换函数应该是显式的、可测试的。

如果对象嵌套，[[asdict]] 会递归转成字典，但它也会把 tuple 转成 list、把自定义对象转成 dict。需要保留类型标记时，自己写转换，别依赖通用函数。`,
          code: String.raw`from dataclasses import dataclass, asdict
import json

@dataclass
class Result:
    event: str
    seconds: float

r = Result("100m", 62.35)
text = json.dumps(asdict(r), ensure_ascii=False)
print(text)

back = Result(**json.loads(text))
print(back, type(back.seconds))`,
          output: `{"event": "100m", "seconds": 62.35}
Result(event='100m', seconds=62.35) <class 'float'>`,
          tip: `[[asdict()]] 递归转基本类型；[[Result(**data)]] 只适合字段完全匹配且可信的数据，外部数据要先校验。`
        },
        {
          h: "动手实验：Team 查询与替换存储",
          p: `给 [[Team]] 加 [[average(event)]]、[[rank(event)]]、[[remove(name)]] 三个方法；把存储从内存换成 [[JsonRepo]]（读写 JSON 文件），要求 [[Team]] 的查询方法不变。最后写一个假 repo 测试 [[add]] 的重名校验，不碰真实文件。

验收标准：[[Team]] 里没有任何 [[open()]]/[[sqlite3]]/[[requests]]；所有外部读写都通过 repo。`,
          code: String.raw`class JsonRepo:
    def __init__(self, path):
        self.path = path
        self.rows = []
    def save(self, row):
        self.rows.append(row)
    def load(self):
        return list(self.rows)

class Team:
    def __init__(self, repo):
        self.repo = repo
        self.swimmers = repo.load()
    def add(self, name):
        if any(s["name"] == name for s in self.swimmers):
            raise ValueError("重名")
        self.swimmers.append({"name": name})
        self.repo.save({"name": name})

t = Team(JsonRepo("team.json"))
t.add("林晓")
print(t.repo.rows)`,
          output: `[{'name': '林晓'}]`,
          tip: `Team 只依赖 repo 的 load/save 协议；换文件/数据库/内存都不改查询逻辑。`
        }
      ],
      points: [
        "has-a 用组合，is-a 才用继承。",
        "集合对象封装写操作，调用方不直接 append。",
        "外部资源用依赖注入，测试可替换。",
        "frozen dataclass 可共享/可哈希，但字段也必须不可变。",
        "JSON 边界只放基本类型，转换函数显式可测。"
      ],
      practice: "设计 `Team` + `JsonRepo`：`Team` 不出现文件 API；`add` 校验重名；`best(event)` 返回最快成绩；用一个内存 repo 写单测。"
    },
    {
      id: "ch10-3",
      title: "10.3 对象建模实战：从散落字典到可测试模型",
      minutes: 45,
      lead: "真实项目里最乱的不是语法，而是数据形状：这个函数期望 `{\"name\": ..., \"score\": ...}`，那个函数期望 `{\"athlete\": ..., \"result\": ...}`。这一节用对象把数据契约固定下来，减少「传错键」的 bug。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7、9；Head First Python 3rd · Ch.5",
      sections: [
        {
          h: "字典当模型的三个问题",
          p: `字典灵活，但灵活意味着没有契约：键名拼错要到运行时才报；字段类型不一致（有时 int 有时 str）要到计算时才爆；校验逻辑散落在每个使用点，容易漏。

对象把契约写进类型和构造器：[[Result(event, seconds)]] 一创建就校验，字段名固定，IDE 能补全。调用方不用猜「是 [[score]] 还是 [[points]]」。这不是「面向对象更高级」，而是减少沟通成本。

不是所有字典都要变成类。配置、临时 JSON、函数返回值用字典很合理；当同一形状的数据在多个函数间反复传递、且有明确规则时，才值得建模。`,
          code: String.raw`# 之前：键名靠记忆
row = {"event": "100m", "seconds": 62.35}
print(row["secods"])  # KeyError

# 之后：构造时校验，字段固定
from dataclasses import dataclass

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float
    def __post_init__(self):
        if self.seconds <= 0:
            raise ValueError("seconds 必须为正")

r = Result("100m", 62.35)
print(r.seconds)`,
          output: `62.35`,
          tip: `同一形状的数据跨多个函数传递时才建模；一次性配置/响应继续用字典。`
        },
        {
          h: "值对象：相等性、哈希与排序",
          p: `值对象关心「值相等」，不关心「是不是同一个实例」。两个 [[Result("100m", 62.35)]] 应该相等，且能当字典键。dataclass 的 [[eq=True]] 和 [[frozen=True]] 正好提供这两点。

排序要显式定义：[[order=True]] 按字段顺序比较，可能不是你想要的（event 在前，先比项目名）。更稳的是 [[key=]] 函数：[[sorted(results, key=lambda r: r.seconds)]]。不要让默认排序决定业务语义。

浮点数比较要小心：[[62.35 == 62.3500000001]] 可能为 False。成绩比较用 [[round(seconds, 2)]] 或整数毫秒存储；金额用 [[Decimal]]，不要用 float。`,
          code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True, order=True)
class Result:
    event: str
    seconds: float

rows = [Result("100m", 62.35), Result("50m", 30.12), Result("100m", 60.88)]
print(sorted(rows, key=lambda r: r.seconds))
print(Result("100m", 62.35) == Result("100m", 62.35))
print(len({Result("100m", 62.35), Result("100m", 62.35)}))`,
          output: `[Result(event='50m', seconds=30.12), Result(event='100m', seconds=60.88), Result(event='100m', seconds=62.35)]
True
1`,
          tip: `[[order=True]] 按字段声明顺序比较，业务排序用 [[key=]]；成绩/金额不要直接用 float 做精确相等。`
        },
        {
          h: "工厂方法：from_dict / from_row 放哪",
          p: `外部数据（JSON、CSV 行、数据库行）进来时，需要转换成对象。可以写类方法 [[Result.from_dict(data)]]，把字段映射、类型转换、默认值集中在一处。

工厂方法要做校验并给出上下文：哪一行、哪个字段、什么值。不要静默跳过坏行；返回 [[None]] 会让调用方到处判空，抛异常或返回 [[(obj, errors)]] 更明确。

[[from_row]] 适合数据库游标行，[[from_dict]] 适合 JSON。不要用一个万能 [[from_anything]]，类型分支会让代码更难读。`,
          code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

    @classmethod
    def from_dict(cls, data):
        try:
            return cls(str(data["event"]).strip(), float(data["seconds"]))
        except (KeyError, TypeError, ValueError) as err:
            raise ValueError(f"坏记录 {data!r}: {err}") from err

print(Result.from_dict({"event": "100m", "seconds": "62.35"}))
try:
    Result.from_dict({"event": "100m", "seconds": "abc"})
except ValueError as err:
    print(err)`,
          output: `Result(event='100m', seconds=62.35)
坏记录 {'event': '100m', 'seconds': 'abc'}: could not convert string to float: 'abc'`,
          tip: `工厂方法集中做映射/校验，并用 [[raise ... from]] 保留原始错误；不要返回 None 让调用方猜。`
        },
        {
          h: "不可变模型的批量更新",
          p: `如果模型是 frozen，批量清洗不能原地改字段。用 [[dataclasses.replace]] 生成新对象，再组成新列表；原列表保持不变，方便对比「清洗前/清洗后」。

对于大列表，每次 replace 都创建新对象，内存开销增加；但值对象通常很小，可接受。真正的性能瓶颈在 IO 和解析，不在对象创建。先用清晰模型，再用 profiling 决定是否优化。

批量更新要保持顺序和身份：用 [[id]] 或业务主键关联新旧对象，不要靠列表下标猜。`,
          code: String.raw`from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

rows = [Result("100m", 62.35), Result("50m", 0)]
clean = [replace(r, seconds=1.0) if r.seconds <= 0 else r for r in rows]
print(rows)
print(clean)`,
          output: `[Result(event='100m', seconds=62.35), Result(event='50m', seconds=0)]
[Result(event='100m', seconds=62.35), Result(event='50m', seconds=1.0)]`,
          tip: `frozen 模型批量修改用 [[replace]] 生成新列表；不要用 [[object.__setattr__]] 绕过不可变。`
        },
        {
          h: "用 Protocol 描述依赖，不引入继承",
          p: `[[typing.Protocol]] 可以描述「一个对象需要有哪些方法」，但不要求实际继承。比如 [[Repo]] 协议要求 [[load()]] 和 [[save()]]，内存实现、SQLite 实现都满足，静态检查器能验证。

Protocol 适合跨模块边界：服务层依赖 [[Repo]] 协议，测试传假实现，生产传真实现。它比抽象基类轻，不会把实现绑死。

不要给每个小函数都写 Protocol；只有当依赖对象在多个实现间切换、或需要静态检查时才用。运行时 [[isinstance]] 对 Protocol 默认不可用（除非 [[runtime_checkable]]），别把它当接口检查。`,
          code: String.raw`from typing import Protocol

class Repo(Protocol):
    def load(self) -> list[dict]: ...
    def save(self, row: dict) -> None: ...

class MemoryRepo:
    def __init__(self): self.rows = []
    def load(self): return list(self.rows)
    def save(self, row): self.rows.append(row)

def count(repo: Repo) -> int:
    return len(repo.load())

print(count(MemoryRepo()))`,
          output: `0`,
          tip: `Protocol 只描述结构，不强制继承；[[runtime_checkable]] 才能用于 isinstance，但有局限。`
        },
        {
          h: "动手实验：把成绩字典全面对象化",
          p: `拿一个包含 3 条成绩的 JSON，定义 [[Result]]、[[Swimmer]]、[[Team]] 三个模型；要求 [[Result.from_dict]] 校验正数，[[Swimmer.add]] 校验重复项目，[[Team.best]] 返回最快成绩。写三个测试：坏秒数、重复项目、空队伍。

最后统计：对象化后，调用方还需要记住哪些键名？如果答案是「不需要」，说明边界立住了。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float
    def __post_init__(self):
        if self.seconds <= 0:
            raise ValueError("seconds 必须为正")

@dataclass
class Swimmer:
    name: str
    results: list[Result] = field(default_factory=list)
    def add(self, result):
        if any(r.event == result.event for r in self.results):
            raise ValueError("项目重复")
        self.results.append(result)

s = Swimmer("林晓")
s.add(Result("100m", 62.35))
print(s)
try:
    s.add(Result("100m", 61.0))
except ValueError as err:
    print(err)`,
          output: `Swimmer(name='林晓', results=[Result(event='100m', seconds=62.35)])
项目重复`,
          tip: `对象化成功的标志是调用方不再背键名；校验集中在构造器/方法里，不靠调用方自觉。`
        }
      ],
      points: [
        "同一形状数据跨多函数传递时才建模，不要把所有字典都类化。",
        "值对象用 frozen dataclass，相等性和哈希才有意义。",
        "业务排序用 key，不依赖 order 的字段顺序。",
        "工厂方法集中做映射和校验，错误带上下文。",
        "依赖用 Protocol 描述结构，不强制继承。"
      ],
      practice: "把一份成绩 JSON 转成 `Result`/`Swimmer`/`Team` 模型，写 3 个测试覆盖坏秒数、重复项目、空队伍；要求调用方不出现字符串键名。"
    }
  ]
});
