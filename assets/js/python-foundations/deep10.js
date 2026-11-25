window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch10-1": [
    {
      h: "深读：__slots__ 省内存，也限制动态属性",
      p: `默认实例把属性放在 [[__dict__]]，每个对象一个字典，灵活但占内存。[[__slots__ = ("name", "scores")]] 让实例用固定槽位存储，不能随便加新属性，内存更小、访问略快。适合大量小对象，例如几十万条成绩记录。

代价：不能动态加字段；继承时子类要重新声明 slots；和 [[__dict__]] 混用会失去省内存的意义。dataclass 可以用 [[slots=True]]（Python 3.10+）自动生成 slots。

不要为了「优化」给所有类加 slots。对象数量少时，省下的内存可以忽略；动态属性、调试、序列化反而更麻烦。先测量对象数量，再决定。`,
      code: String.raw`class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
print(p.x, p.y)
try:
    p.z = 3
except AttributeError as err:
    print(type(err).__name__, err)`,
      output: `1 2
AttributeError 'Point' object has no attribute 'z'`,
      tip: `[[__slots__]] 适合海量小对象；会禁止动态属性，继承和序列化都要重新检查。`
    },
    {
      h: "深读：单下划线与双下划线不是访问控制",
      p: `[[_name]] 是「内部使用」的约定，[[__name]] 会触发名称改写（name mangling），在类 [[Swimmer]] 里变成 [[_Swimmer__name]]。它不是为了安全，而是为了避免子类意外覆盖。

Python 没有真正的 private。任何人都能用 [[obj._Swimmer__name]] 访问；[[__slots__]] 也不阻止。把「私有」当安全边界会写错架构；它只是团队契约。

真正需要保护的不变量，应该通过方法校验，而不是靠命名隐藏。例如分数范围在 [[add()]] 里检查，而不是把 [[scores]] 改名。`,
      code: String.raw`class Swimmer:
    def __init__(self):
        self._team = "海豚队"
        self.__secret = "x"

s = Swimmer()
print(s._team)
print(s.__dict__)
print(s._Swimmer__secret)`,
      output: `海豚队
{'_team': '海豚队', '_Swimmer__secret': 'x'}
x`,
          tip: `[[__name]] 只是改名，不是加密；不变量靠方法校验，不靠命名隐藏。`
    },
    {
      h: "深读：dataclass 继承的字段顺序陷阱",
      p: `dataclass 子类会继承父类字段，字段顺序是「父类字段在前，子类字段在后」。如果父类有默认值字段，子类又加无默认值字段，就会触发「non-default argument follows default argument」。

解决方式：给子类新字段也加默认值；或者用 [[kw_only=True]] 让所有字段只能按关键字传；或者重新设计，不要把有默认/无默认字段混在继承链里。

继承 dataclass 适合「共享字段的真正 is-a」，不适合「想复用几个字段」。后者用组合更清晰。`,
      code: String.raw`from dataclasses import dataclass, field

@dataclass
class Base:
    name: str
    tags: list[str] = field(default_factory=list)

@dataclass(kw_only=True)
class Result(Base):
    seconds: float

r = Result(name="林晓", seconds=62.35)
print(r)`,
      output: `Result(name='林晓', tags=[], seconds=62.35)`,
      tip: `[[kw_only=True]] 能避开默认值字段顺序问题；但如果只是复用字段，优先组合而不是继承。`
    },
    {
      h: "深读：属性查找的完整顺序",
      p: `访问 [[obj.attr]] 时，先调用 [[type(obj).__getattribute__]]；它先找数据描述符（定义了 [[__get__]] 和 [[__set__]] 的类属性），再找实例 [[__dict__]]，再找非数据描述符/类属性，最后找 [[__getattr__]] 兜底。

这个顺序解释了为什么 [[property]] 能覆盖实例字典：property 是数据描述符，优先级高于实例属性。也解释了为什么 [[__getattr__]] 只在正常查找失败后调用，不会拦截已有属性。

[[__getattr__]] 适合动态代理/兼容旧字段；不要用它吞掉所有 [[AttributeError]]，否则拼错属性名也会被静默处理。`,
      code: String.raw`class Demo:
    def __init__(self):
        self.x = 1
    @property
    def y(self):
        return 2
    def __getattr__(self, name):
        return f"missing:{name}"

d = Demo()
print(d.x, d.y)
print(d.z)`,
      output: `1 2
missing:z`,
      tip: `property 是数据描述符，优先于实例 [[__dict__]]；[[__getattr__]] 只处理查找失败的名字。`
    }
  ],
  "ch10-2": [
    {
      h: "深读：嵌套对象的校验与递归",
      p: `[[Team(swimmers=[Swimmer(...)])]] 的校验不能只看最外层。构造 [[Team]] 时要确认每个元素确实是 [[Swimmer]]，每个 Swimmer 的 results 都是 [[Result]]；否则后面调用 [[.average()]] 才爆。

可以在 [[__post_init__]] 里做浅层类型检查，深层交给各对象自己的构造器。不要在一个地方递归校验所有层，容易重复且难维护。边界原则：每个对象校验自己的字段，父对象校验「子对象类型」。

对不可信外部数据，先 [[from_dict]] 构造子对象，再构造父对象；任何一层失败都带路径信息，例如 [["swimmers[2].results[0].seconds"]]。`,
      code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

@dataclass
class Swimmer:
    name: str
    results: tuple[Result, ...] = ()

@dataclass
class Team:
    name: str
    swimmers: tuple[Swimmer, ...] = ()
    def __post_init__(self):
        if not all(isinstance(s, Swimmer) for s in self.swimmers):
            raise TypeError("swimmers 必须都是 Swimmer")

t = Team("海豚队", (Swimmer("林晓", (Result("100m", 62.35),)),))
print(t.swimmers[0].results[0])`,
      output: `Result(event='100m', seconds=62.35)`,
      tip: `每个对象校验自己的字段，父对象校验子对象类型；外部数据逐层 from_dict，错误带路径。`
    },
    {
      h: "深读：cached_property 与失效策略",
      p: `[[functools.cached_property]] 把第一次计算的结果写进实例 [[__dict__]]，后续访问直接读缓存。适合昂贵且不变的派生值，例如 [[team.ranking]]、[[swimmer.personal_best]]。

陷阱：对象可变时缓存会过期。[[team.add()]] 之后，之前算好的 [[best]] 还是旧值。必须在修改方法里删除缓存，或者使用不可变对象。

[[cached_property]] 要求类有 [[__dict__]]；[[__slots__]] 类不支持，除非自己实现描述符。线程安全也只保证「最多算一次」不保证值最新。`,
          code: String.raw`from functools import cached_property

class Team:
    def __init__(self, rows):
        self.rows = list(rows)
    @cached_property
    def total(self):
        print("计算一次")
        return sum(self.rows)
    def add(self, n):
        self.rows.append(n)
        self.__dict__.pop("total", None)

t = Team([1, 2])
print(t.total, t.total)
t.add(3)
print(t.total)`,
          output: `计算一次
3 3
计算一次
6`,
      tip: `可变对象用 cached_property 时，修改方法必须清缓存；否则读到旧值。`
    },
    {
      h: "深读：循环引用与 repr 递归",
      p: `对象互相引用很常见：Team 持有 Swimmer，Swimmer 又持有 Team。dataclass 自动生成的 [[repr]] 会递归打印，遇到环就 [[RecursionError]]。

解决方式：[[repr=False]] 关闭某个字段的表示；或者自定义 [[__repr__]] 只打印 id/name，不递归。JSON 序列化也会遇到环，需要 [[default]] 处理或提前断开。

循环引用还会延迟垃圾回收；Python 的循环 GC 能处理，但大量对象时增加开销。能用弱引用（[[weakref]]）表达「不拥有」的关系时更好。`,
      code: String.raw`from dataclasses import dataclass, field

@dataclass
class Team:
    name: str
    swimmers: list = field(default_factory=list, repr=False)

@dataclass
class Swimmer:
    name: str
    team: Team | None = field(default=None, repr=False)

t = Team("海豚队")
s = Swimmer("林晓", t)
t.swimmers.append(s)
print(t)
print(s)`,
          output: `Team(name='海豚队')
Swimmer(name='林晓')`,
      tip: `互相引用的字段设 [[repr=False]]，否则自动 repr 会递归；JSON 序列化要单独处理环。`
    },
    {
      h: "深读：用假对象测试组合边界",
      p: `测试 [[Team]] 时不需要真数据库/真文件。传一个假 repo，记录调用次数、返回预设数据、模拟异常。假对象只实现 Team 用到的方法，不需要完整接口。

假对象比 mock 更简单：一个普通类，方法里 [[raise]] 或返回固定值。它能验证「Team 是否在重名时拒绝」「是否在 repo 失败时传播异常」。

不要 mock 一切。值对象直接构造，纯函数直接调用；只有外部边界（IO、时间、随机、网络）用假对象。`,
      code: String.raw`class FakeRepo:
    def __init__(self, fail=False):
        self.rows = []
        self.fail = fail
    def save(self, row):
        if self.fail:
            raise OSError("disk full")
        self.rows.append(row)

def add(repo, name):
    repo.save({"name": name})

ok = FakeRepo()
add(ok, "林晓")
print(ok.rows)

bad = FakeRepo(fail=True)
try:
    add(bad, "周宁")
except OSError as err:
    print(err)`,
          output: `[{'name': '林晓'}]
disk full`,
      tip: `假对象只实现用到的方法；外部边界才 mock，值对象直接构造。`
    }
  ],
  "ch10-3": [
    {
      h: "深读：用 Enum 固定事件/状态取值",
      p: `事件名、状态值用裸字符串，拼错要到运行时才发现。[[enum.Enum]] 把取值固定成成员，IDE 能补全，比较也安全。[[StrEnum]]（3.11+）让成员同时是字符串，方便 JSON/CSV 输出。

Enum 成员不是普通字符串；[[Event("100m")]] 可以按值查找，找不到抛 [[ValueError]]。序列化时用 [[.value]]，读回时用 [[Event(value)]] 校验。

不要用 Enum 表达会频繁变化的业务配置；它适合稳定的有限集合：项目类型、状态、角色。`,
      code: String.raw`from enum import StrEnum

class Event(StrEnum):
    FREE_50 = "50m"
    FREE_100 = "100m"

e = Event("100m")
print(e, e.value, e == "100m")
try:
    Event("200m")
except ValueError as err:
    print(type(err).__name__, err)`,
      output: `100m 100m True
ValueError '200m' is not a valid Event`,
      tip: `[[StrEnum]] 成员可当字符串用；读外部值用 [[Event(value)]] 校验，不要直接比较裸字符串。`
    },
    {
      h: "深读：模型版本与向后兼容",
      p: `对象要序列化到磁盘/API，就要考虑字段增删。加字段给默认值通常兼容；删字段/改类型会破坏旧数据。给 JSON 加 [[schema_version]]，读入时按版本迁移。

迁移函数应该是纯函数：旧 dict → 新 dict，不依赖全局状态。迁移后再 [[from_dict]] 校验。不要在一个 [[from_dict]] 里堆十年历史分支，拆成 [[migrate_v1_to_v2]]。

向后兼容不是「永远不删字段」，而是「旧数据能被读、旧客户端不被突然打断」。需要弃用时给过渡期和日志。`,
      code: String.raw`def migrate(data):
    version = data.get("schema_version", 1)
    if version == 1:
        data = {**data, "seconds": data.pop("time"), "schema_version": 2}
    return data

old = {"schema_version": 1, "event": "100m", "time": 62.35}
print(migrate(old))`,
          output: `{'schema_version': 2, 'event': '100m', 'seconds': 62.35}`,
      tip: `给持久化 JSON 加版本号；迁移函数纯函数化，再交给 from_dict 校验。`
    },
    {
      h: "深读：对象相等不等于业务相等",
      p: `dataclass 的 [[eq]] 比较所有字段。两个 [[Result("100m", 62.35, tags=("PB",))]] 和 [[Result("100m", 62.35, tags=())]] 不相等，虽然业务上可能是同一次成绩。相等性要按业务主键定义，而不是按所有字段。

可以设 [[eq=False]] 自定义 [[__eq__]]，只比较 event+date+athlete_id；或者引入 [[key]] 属性/方法，让业务层显式比较。哈希必须与相等一致：相等对象哈希相同。

不要把「显示字段」放进相等性：备注、更新时间、来源文件通常不该影响业务身份。`,
      code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float
    note: str = ""
    def key(self):
        return (self.event, round(self.seconds, 2))

a = Result("100m", 62.35, "PB")
b = Result("100m", 62.35, "")
print(a == b)
print(a.key() == b.key())`,
          output: `False
True`,
          tip: `业务相等用主键，不要把所有字段塞进 [[__eq__]]；哈希必须和相等定义一致。`
    },
    {
      h: "深读：从 dataclass 到 pydantic，什么时候需要",
      p: `dataclass 适合内部可信数据；外部 JSON/API 数据需要类型转换、范围校验、错误聚合，[[pydantic]] 更合适。它能在解析时把字符串转 int、收集多个字段错误、生成 JSON Schema。

但 pydantic 是第三方依赖，会改变对象行为（默认可变、验证开销）。内部模型继续用 dataclass，边界层用 pydantic 解析，再转成内部模型，是常见组合。

不要为了「自动校验」把所有内部对象都换成 pydantic；边界校验一次就够，内部反复校验是浪费。`,
      code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

# 边界层（伪代码）
# from pydantic import BaseModel, Field
# class ResultIn(BaseModel):
#     event: str
#     seconds: float = Field(gt=0)
# data = ResultIn.model_validate({"event": "100m", "seconds": "62.35"})
# result = Result(data.event, data.seconds)`,
          output: `Result(event='100m', seconds=62.35)`,
      tip: `外部边界用 pydantic 校验，内部模型用 dataclass；不要在内部每层重复校验。`
    }
  ],
  "ch10-review": [
    {
      h: "本章复盘：对象是「带规则的边界」",
      p: `这一章的主线不是「学会写 class」，而是「把规则放到正确的位置」。校验放构造器/方法，序列化放边界层，外部资源用注入，集合写操作走方法。做到这些，调用方就不需要每次记得检查。

三个自检问题：这个对象知道什么？它保证什么不变量？它依赖哪些外部资源？如果答不清，类就只是「把字典换了个壳」，没有降低复杂度。

本章验收：把 [[{"name":..., "scores":[...]}]] 重构成 [[Swimmer]]，要求坏分数在 [[add]] 就被拒绝、空分数 [[average]] 返回 None、JSON 转换显式、测试不碰文件。`,
      code: String.raw`from dataclasses import dataclass

@dataclass
class Swimmer:
    name: str
    scores: list[float]

    def add(self, score):
        if not 0 <= score <= 100:
            raise ValueError("分数越界")
        self.scores.append(float(score))

s = Swimmer("林晓", [])
s.add(91)
print(s)`,
          output: `Swimmer(name='林晓', scores=[91.0])`,
      tip: `对象化成功的标志：调用方不再背键名，非法状态进不来。`
    }
  ]
});
