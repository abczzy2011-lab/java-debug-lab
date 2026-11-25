(function () {
  var chapters = window.PY_FOUNDATIONS_CHAPTERS || [];
  function add(id, sections) {
    for (var i = 0; i < chapters.length; i += 1) {
      var lessons = chapters[i].lessons || [];
      for (var j = 0; j < lessons.length; j += 1) {
        if (lessons[j].id === id) {
          lessons[j].sections = (lessons[j].sections || []).concat(sections);
          return;
        }
      }
    }
  }

  add("ch10-1", [{
    h: "工程深化：dataclass 的 frozen、slots 与默认工厂",
    p: `[[@dataclass]] 把 [[__init__]]、[[__repr__]]、[[__eq__]] 自动生成，但它不是「随便加个装饰器就完事」。三个参数决定对象的行为边界：[[frozen=True]] 让实例不可变，[[slots=True]] 去掉 [[__dict__]] 并限制动态属性，[[default_factory]] 为可变默认值提供独立副本。用错任何一个，都会在测试或序列化时暴露。

[[frozen=True]] 的对象在 [[__init__]] 结束后禁止赋值，适合值对象：成绩记录、配置、事件。它让对象可哈希（前提是所有字段可哈希），可以放进 set 或作为 dict 的键。但 frozen 不是深度不可变：字段是 list 时，list 里的元素仍可改。需要深度不可变时，用 tuple、frozenset 或自定义只读容器，不要以为 frozen 包住一切。

[[slots=True]] 省内存，也防止拼错属性名，但它会改变继承行为：子类默认仍有 [[__dict__]]，除非子类也声明 slots；[[__slots__]] 里不能和类变量同名；不能多继承两个都有非空 slots 的类。不要在「可能被继承的基类」上随手加 slots，先确认继承链。

[[default_factory=list]] 解决可变默认值共享问题。直接写 [[items: list = []]] 会让所有实例共用同一个列表，这是 Python 最经典的陷阱之一。dataclass 会拒绝 list/dict/set 直接作默认值，但自定义可变对象仍可能漏掉；统一用 factory 最稳。工厂函数每次调用返回新对象，也可以做深拷贝。

[[__post_init__]] 适合做校验和派生字段：比如把秒数规范化为毫秒、检查年龄范围、生成 display 名。但不要在 [[__post_init__]] 里做网络请求或读文件，那会让构造对象变成重操作。校验失败抛 ValueError，并带上字段名和非法值，调用方才知道怎么修。

序列化边界要明确：dataclass 转 dict 用 [[dataclasses.asdict]]，但嵌套对象会递归复制；转 JSON 要处理 datetime、Decimal、Enum。不要让领域对象直接依赖 JSON 库，序列化放到 adapter 层。对象内部用 datetime，输出层再格式化，这样领域逻辑不被展示格式污染。

验收：两个字段相同的对象相等吗？frozen 对象能当 dict 键吗？两个实例的 list 字段是同一个对象吗？slots 对象能随便加属性吗？这四个问题都能答对，dataclass 才算真的会用。`,
    code: String.raw`from dataclasses import dataclass, field
from datetime import date

@dataclass(frozen=True, slots=True)
class Result:
    athlete: str
    event: str
    seconds: float
    tags: tuple[str, ...] = ()
    checks: list[str] = field(default_factory=list)

    def __post_init__(self):
        if not 0 < self.seconds < 3600:
            raise ValueError(f"seconds out of range: {self.seconds}")

r1 = Result("林晓", "100m", 12.34)
r2 = Result("林晓", "100m", 12.34)
print(r1 == r2)
print(hash(r1) == hash(r2))
print(r1.checks is r2.checks)`,
    output: `True
True
False`,
    tip: `frozen 管赋值、slots 管内存与属性集合、default_factory 管可变默认值；三者别混用。`
  }]);

  add("ch10-2", [{
    h: "工程深化：组合、仓储接口与依赖注入",
    p: `组合的本质是「对象 A 使用对象 B」，但很多代码把「使用」写成了「拥有并创建」：[[Team]] 内部直接 [[self.repo = SqliteRepo()]]。这样测试 [[Team]] 就必须连数据库，替换存储也只能改源码。依赖注入把「创建」移到外部，让对象只依赖接口，测试可以传假对象。

最小做法是构造函数接收依赖：[[Team(repo, clock)]]，默认参数可以给生产实现，但测试显式传 fake。更严格的做法是不给默认值，由应用入口组装；库代码不要偷偷创建全局资源。这样依赖方向清楚：领域层不 import 基础设施，基础设施反过来依赖领域接口。

接口用 [[Protocol]] 描述就够了，不一定要继承 ABC。[[class Repo(Protocol)]] 定义 [[save(record)]] 和 [[list_all()]] 的签名，实现类不需要继承，静态检查器也能检查结构。Protocol 适合「我只需要这个能力」，ABC 适合「我必须阻止误用、要注册子类」。两者不要为了架构感而堆。

假对象要能模拟失败，而不只是返回成功。测试至少覆盖：存储抛异常时领域层是否回滚、重复主键是否报错、空结果是否处理。只测 happy path 的 fake 没有价值。可以用一个 [[FailingRepo]] 在保存时抛 [[OSError]]，确认上层返回可读错误而不是吞掉。

对象边界要防止「组合变成大泥球」。[[Team]] 负责团队规则（总分、名次），[[Repo]] 负责持久化，[[Report]] 负责展示。一个类如果同时做查询、格式化、写文件、发邮件，就不是组合，而是把多个职责塞进一个壳。拆分的标准是「能否单独测试」和「换实现是否影响其他逻辑」。

循环依赖常出现在组合里：A 需要 B，B 又需要 A。不要用 [[import]] 技巧硬解，先看是否可以通过事件、回调、接口倒置来打破。比如 Team 不直接调用 Notifier，而是返回事件列表，由应用层决定是否通知。依赖方向应该是「稳定层被依赖，易变层依赖稳定层」。

验收：把 SqliteRepo 换成内存 Repo，Team 的测试是否不需要改？把时钟换成固定时间，排名是否可复现？把 Notifier 换成记录器，是否不产生真实邮件？这三个替换都能做到，组合和注入才算落地。`,
    code: String.raw`from typing import Protocol

class Repo(Protocol):
    def save(self, record: dict) -> None: ...
    def list_all(self) -> list[dict]: ...

class MemoryRepo:
    def __init__(self):
        self.rows = []
    def save(self, record):
        self.rows.append(dict(record))
    def list_all(self):
        return list(self.rows)

class Team:
    def __init__(self, repo: Repo):
        self.repo = repo

    def add(self, record):
        if any(r["athlete"] == record["athlete"] for r in self.repo.list_all()):
            raise ValueError("duplicate athlete")
        self.repo.save(record)

team = Team(MemoryRepo())
team.add({"athlete": "林晓", "seconds": 12.3})
print(team.repo.list_all())`,
    output: `[{'athlete': '林晓', 'seconds': 12.3}]`,
    tip: `对象只依赖 Protocol；生产实现在入口组装；测试传可失败的假对象。`
  }]);

  add("ch10-3", [{
    h: "工程深化：模型演化、Enum 与向后兼容",
    p: `对象模型不是一次定型。字段会增删、状态会变多、旧数据还要能读。没有版本策略的模型，第一次改字段就会让历史 JSON 全部解析失败。模型演化要提前设计：区分「必填核心字段」和「可选扩展字段」，给序列化格式留版本号，给旧字段留兼容读取。

状态值不要用裸字符串。[[status = "active"]] 拼错、大小写不一致、增加新状态时没有集中清单，都会让分支到处漏。用 [[Enum]] 固定取值，序列化时明确用 [[.value]]，比较时用枚举成员。Enum 的成员名给代码看，value 给外部协议看；两者不要随意改。

版本兼容的常见做法：读取时接受旧字段名，写出时只写新字段名；新增字段给默认值；删除字段先保留读取逻辑一个版本，再清理。不要用 [[dict.get]] 到处兜底，把兼容逻辑集中到一个 [[from_dict]] 工厂，其他代码只见新模型。

[[from_dict]] 要严格：未知字段是忽略还是报错？缺失字段是否有默认？类型不对是否转换？这些策略要写清楚。对外部 API 的数据可以宽松读取、严格写出；对自己数据库的数据可以严格读取，防止脏数据扩散。宽松不是无原则，所有转换都要记录 warning。

模型相等要区分「同一实体」和「值相同」。两个 [[Result]] 字段全同，值相等；两个 [[Athlete]] id 相同但名字改了，是同一实体但对象不等。[[__eq__]] 按什么字段比较，要在类文档里写清楚；[[__hash__]] 必须和 [[__eq__]] 一致，否则 dict/set 行为会诡异。

迁移脚本要能重复执行。读旧格式、写新格式、记录迁移数量、失败行号；迁移前备份，迁移后校验计数和抽样。不要写一个「一次性脚本」跑完就删，出问题时无法回滚。

验收：用一份旧版本 JSON 导入，模型能读；导出新 JSON 再导入，字段不丢；未知枚举值给明确错误；两个 id 相同的对象相等性符合业务定义。模型演化不是「以后再说」，第一次发布就要留好退路。`,
    code: String.raw`from dataclasses import dataclass, field
from enum import Enum

class Status(str, Enum):
    ACTIVE = "active"
    INJURED = "injured"
    RETIRED = "retired"

@dataclass
class Athlete:
    id: str
    name: str
    status: Status = Status.ACTIVE
    tags: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> "Athlete":
        data = dict(data)
        if "state" in data and "status" not in data:
            data["status"] = data.pop("state")
        data["status"] = Status(data.get("status", "active"))
        return cls(id=data["id"], name=data["name"],
                   status=data["status"], tags=list(data.get("tags", [])))

a = Athlete.from_dict({"id": "A01", "name": "林晓", "state": "active"})
print(a.status.value, a.tags)`,
    output: `active []`,
    tip: `状态用 Enum；旧字段在 from_dict 集中兼容；写出只写新格式；迁移脚本可重复执行。`
  }]);
})();
