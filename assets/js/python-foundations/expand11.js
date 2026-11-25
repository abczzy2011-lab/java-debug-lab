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

  add("ch11-1", [{
    h: "工程深化：抽象基类、注册表与插件发现",
    p: `[[ABC]] 和 [[@abstractmethod]] 的价值不是「看起来很面向对象」，而是把「实现类漏了方法」从运行时错误提前到实例化时。抽象方法只写签名、不写实现，子类必须覆盖；如果子类忘了，[[TypeError]] 会在创建对象时出现，而不是等到调用才炸。这比文档约定可靠。

抽象基类不要做成「什么都管」的上帝类。一个 [[Exporter]] 只需要 [[export(rows)]] 和 [[suffix]] 两个抽象成员；日志、重试、临时文件由具体类或装饰器处理。抽象越少，子类越容易实现，也越容易替换。把可选能力做成带默认实现的普通方法，而不是抽象方法。

插件注册可以用 [[__init_subclass__]]：基类在子类创建时自动把它登记到注册表。它比元类轻，比分发字典少一步手动注册。写法是定义 [[registry = {}]]，在 [[__init_subclass__(cls, **kwargs)]] 里调用 super，然后用类属性 [[name]] 作为键。重复名字要报错，不能后注册的静默覆盖。

自动注册的副作用是「导入即注册」。如果插件模块没有被 import，注册表就是空的。解决方式有两种：显式导入插件包，或用 [[pkgutil.iter_modules]] / [[entry_points]] 在启动时发现。前者可控，后者方便；生产环境通常用 entry_points，测试用手动注册，避免扫描整个环境。

抽象基类也能做「能力检查」：[[isinstance(obj, Exporter)]] 对虚拟子类也成立，[[register()]] 可以把一个不继承基类的类登记进来。这个机制适合适配第三方对象，但不要滥用；过度使用会让类型关系变得不可预测。优先显式继承，虚拟子类只作兼容层。

注册表要加元数据：版本、支持的格式、是否需要可选依赖。插件加载失败时，记录插件名和 ImportError，不要让一个坏插件拖垮整个程序。启动日志里打印已加载插件清单，排障时能一眼看出「为什么少了 xlsx 导出」。

验收：删掉一个抽象方法，实例化是否报错？两个插件同名，是否拒绝启动？插件模块未导入，注册表是否为空？坏插件是否被隔离？这四个问题覆盖了抽象与插件的主要边界。`,
    code: String.raw`from abc import ABC, abstractmethod

class Exporter(ABC):
    registry = {}
    name: str
    suffix: str

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if getattr(cls, "name", None):
            if cls.name in cls.registry:
                raise ValueError(f"duplicate exporter: {cls.name}")
            cls.registry[cls.name] = cls

    @abstractmethod
    def export(self, rows: list[dict], path: str) -> None: ...

class CsvExporter(Exporter):
    name = "csv"
    suffix = ".csv"
    def export(self, rows, path):
        import csv
        with open(path, "w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)

print(sorted(Exporter.registry))`,
    output: `['csv']`,
    tip: `抽象成员只保留必需能力；__init_subclass__ 自动注册；重名要报错，坏插件要隔离。`
  }, {
    h: "故障排查：MRO 冲突与 super 的真实行为",
    p: `多继承报 [[TypeError: Cannot create a consistent method resolution order]]，不是 Python 随便发脾气，而是 C3 线性化找不到同时满足「子类在父类前、声明顺序一致」的排列。常见触发是菱形继承里两个父类互相要求对方先出现。解决不是改 [[super()]] 写法，而是减少多继承层级或改用组合。

[[super()]] 在单继承里像「调用父类」，在多继承里是「调用 MRO 中下一个类」。所以 [[super().method()]] 不一定调用直接父类，可能跳到另一个分支。协作式多继承要求每个类都调用 super，并且签名兼容；只要有一个类不调用，后面的类就收不到。不要在多继承里混用「直接调用父类」和 super。

[[MRO]] 可以打印：[[Cls.__mro__]] 或 [[Cls.mro()]]。排查时先看顺序，再看每个类的 [[__init__]] 是否调用 super。一个典型 bug 是 A 的 [[__init__]] 调用 [[super().__init__()]]，B 的 [[__init__]] 不调用，结果 C 初始化时 A 的父类被跳过，属性没设置。

[[__init_subclass__]] 也会参与继承链；子类创建时父类的钩子会执行。不要在钩子里假设 [[cls]] 已经完整定义，类体还没结束。需要读取子类属性时，用 [[getattr(cls, name, None)]] 并处理缺失，不要直接访问必存在属性。

调试建议：先用 [[inspect.getmro]] 打印顺序，再在关键 [[__init__]] 里打印类名和参数，确认谁被调用、谁被跳过。不要靠猜；MRO 是确定的算法，冲突也是确定的。把继承图画出来，通常比读十遍代码快。

如果只是为了复用几个方法，优先用组合或模块级函数。多继承适合「多个独立能力真的需要协作」的场景，比如 mixin 只加一个小行为；不适合把业务层次硬堆成树。每增加一层继承，调试成本就上升一档。

验收：构造一个三层菱形，打印 MRO；删掉中间类的 super 调用，观察哪个初始化被跳过；再用组合改写，确认行为一致且更容易测试。`,
    code: String.raw`class A:
    def __init__(self):
        print("A")
        super().__init__()

class B(A):
    def __init__(self):
        print("B")
        super().__init__()

class C(A):
    def __init__(self):
        print("C")
        super().__init__()

class D(B, C):
    def __init__(self):
        print("D")
        super().__init__()

print([c.__name__ for c in D.__mro__])
D()`,
    output: `['D', 'B', 'C', 'A', 'object']
D
B
C
A`,
    tip: `super() 走 MRO 下一个类；协作式多继承每个类都要调用 super；能组合就别多继承。`
  }]);

  add("ch11-2", [{
    h: "工程深化：描述符、cached_property 与校验字段",
    p: `描述符是「类属性访问会被拦截」的机制。[[__get__]]、[[__set__]]、[[__delete__]] 定义在类上，实例访问属性时触发；[[property]] 只是描述符的一种便捷写法。理解描述符后，很多「魔法」就变得普通：方法绑定、类属性、缓存属性、ORM 字段，底层都是它。

数据描述符同时有 [[__get__]] 和 [[__set__]]，优先级高于实例 [[__dict__]]；非数据描述符只有 [[__get__]]，实例字典可以覆盖它。[[functools.cached_property]] 是非数据描述符，第一次计算后把结果写进实例 [[__dict__]]，所以要求类有 [[__dict__]]；slots 类不能直接用。

[[cached_property]] 适合「计算贵、结果不变」的派生值，比如把行数据解析成统计摘要。但它不是线程安全的：两个线程同时第一次访问，可能都计算一遍，后写的覆盖先写的。结果幂等时无所谓，有副作用时要用锁，或者改成显式缓存。对象被修改后缓存不会自动失效，要在 [[__setattr__]] 或业务方法里清掉。

校验字段可以用描述符实现：在 [[__set__]] 里检查类型、范围、空值，再写入实例字典。好处是规则集中、所有实例一致；坏处是每个字段都要建描述符对象，继承和 slots 要小心。简单场景用 [[__post_init__]] 或 property 更直接，不要为了「设计模式」上描述符。

描述符对象是类级共享的，状态不能放在描述符自己身上。比如 [[self.value]] 会被所有实例共用；要按实例存，写入 [[instance.__dict__["_value"]]] 或用 [[WeakKeyDictionary]]。这是描述符最常见的 bug，表现为「改一个对象，另一个对象也变了」。

[[__set_name__]] 可以在类创建时拿到属性名，适合自动生成存储键、注册字段、做 ORM 映射。它不能替代 [[__init_subclass__]]，两者职责不同：前者处理单个描述符，后者处理整个子类。

验收：给一个 slots 类加 cached_property，确认报错；两个线程同时访问缓存，确认结果一致；修改对象后缓存是否过期；描述符状态是否按实例隔离。`,
    code: String.raw`from functools import cached_property

class Positive:
    def __set_name__(self, owner, name):
        self.name = "_" + name
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"{self.name[1:]} must be positive")
        setattr(obj, self.name, float(value))

class Jump:
    height = Positive()
    def __init__(self, height):
        self.height = height
    @cached_property
    def score(self):
        return round(self.height * 1.5, 2)

j = Jump(2.4)
print(j.height, j.score)
try:
    j.height = -1
except ValueError as e:
    print("rejected:", e)`,
    output: `2.4 3.6
rejected: height must be positive`,
    tip: `描述符状态要按实例存；cached_property 非线程安全且不会自动失效；slots 类不适用。`
  }, {
    h: "故障排查：property 缓存失效与类方法工厂",
    p: `[[@property]] 让方法像属性一样访问，适合「只读派生值」。但把它当缓存用，就会遇到「数据改了、属性还是旧值」。property 每次访问都重新计算，不会自动缓存；[[cached_property]] 缓存但不会自动失效。两种语义要选清楚，不能既想省计算又想永远正确。

如果派生值依赖多个字段，失效点就不止一个。比如 [[total]] 依赖 [[runs]] 和 [[penalty]]，修改任一字段都要让缓存失效。用手写 [[_total]] 缓存时，在 [[__setattr__]] 里统一清理，或在每个 setter 里清。漏一个，就会出现「改了罚时、总分不变」的 bug。

[[@classmethod]] 工厂适合「从多种输入创建对象」：[[from_csv]]、[[from_dict]]、[[from_api]]。它拿到的是类而不是实例，子类调用时能正确返回子类。[[@staticmethod]] 不拿类也不拿实例，适合纯工具函数；如果函数需要访问类属性或返回子类，就该用 classmethod。

工厂里不要偷偷吞掉错误。[[from_dict]] 缺字段时，抛带字段名的 ValueError，而不是返回 None 让调用方猜。多种输入格式可以在工厂里归一化，但归一化后仍要走同一个校验入口，避免每个工厂各写一套规则。

继承工厂要小心：子类覆盖 [[from_dict]] 时，记得调用 [[super().from_dict]] 或复用同一套校验。否则基类新增字段，子类工厂不认，创建出的对象缺字段。可以用「模板方法」：基类工厂负责解析，子类只覆盖 [[_validate]] 或 [[_convert]]。

验收：改一个依赖字段，派生值是否更新？用子类调用 classmethod，返回类型是否是子类？缺字段是否报清楚？缓存和 property 混用时，是否有一致性测试？`,
    code: String.raw`class Score:
    def __init__(self, runs, penalty=0):
        self._runs = runs
        self._penalty = penalty
        self._total = None
    @property
    def total(self):
        if self._total is None:
            self._total = self._runs + self._penalty
        return self._total
    @total.setter
    def total(self, value):
        raise AttributeError("total is derived")
    def set_penalty(self, value):
        self._penalty = value
        self._total = None
    @classmethod
    def from_dict(cls, data):
        if "runs" not in data:
            raise ValueError("missing field: runs")
        return cls(int(data["runs"]), int(data.get("penalty", 0)))

s = Score.from_dict({"runs": 92, "penalty": 3})
print(s.total)
s.set_penalty(5)
print(s.total)`,
    output: `95
97`,
    tip: `缓存失效点要覆盖所有依赖字段；classmethod 工厂归一化后走同一校验；子类工厂别绕过基类。`
  }]);

  add("ch11-3", [{
    h: "工程深化：运算符重载与容器协议",
    p: `运算符重载不是为了「让代码看起来像数学」，而是让对象支持语言的原生协议。[[__add__]] 让 [[a + b]] 可用，[[__len__]] 让 [[len(a)]] 可用，[[__getitem__]] 让索引和切片可用，[[__iter__]] 让 for 循环可用。实现这些方法，对象就能融入 Python 的生态。

[[__add__]] 要返回新对象，不要原地修改。[[a += b]] 走 [[__iadd__]]，如果没有实现，会退化为 [[a = a + b]]。对不可变对象，[[__iadd__]] 可以返回新对象；对可变对象，[[__iadd__]] 可以原地改并返回 self。两种语义要在文档里写清楚，不能让调用方猜。

[[__getitem__]] 要同时处理整数索引和切片。[[obj[1:3]]] 传进来的是 slice 对象，直接拿它当 key 会报错。实现时判断 [[isinstance(key, slice)]]，返回同类型的新对象；负索引、越界、步长也要考虑。只支持整数索引时，收到 slice 要抛 TypeError，而不是返回奇怪结果。

[[__len__]] 必须返回非负整数，否则 [[len()]] 报 ValueError。[[__bool__]] 不实现时，Python 用 [[__len__]] 判断真假；空容器为 False。不要同时写互相矛盾的 [[__len__]] 和 [[__bool__]]，比如 len 返回 1 但 bool 永远 False。

[[__iter__]] 返回迭代器，不是列表。返回 [[iter(self.items)]] 可以，但要注意「迭代时修改容器」的行为。需要稳定遍历时，先复制一份；需要惰性遍历时，用生成器。生成器只能遍历一次，调用方要知道这个语义。

[[__contains__]] 不实现时，Python 用 [[__iter__]] 线性扫描；实现它可以做 O(1) 查找。[[in]] 的语义是「是否包含」，不是「是否有某个键」，对映射类型要区分 keys 和 values。

验收：写一个能切片、能迭代、能 len 的容器；测试空容器布尔值、负索引、越界、切片步长；确认加号运算不修改原对象。容器协议实现对了，很多内置函数和库就能直接使用你的对象。`,
    code: String.raw`class Scores:
    def __init__(self, values):
        self._values = tuple(values)
    def __len__(self):
        return len(self._values)
    def __getitem__(self, key):
        if isinstance(key, slice):
            return Scores(self._values[key])
        return self._values[key]
    def __iter__(self):
        return iter(self._values)
    def __add__(self, other):
        if not isinstance(other, Scores):
            return NotImplemented
        return Scores(self._values + other._values)
    def __repr__(self):
        return f"Scores({list(self._values)!r})"

a = Scores([91, 88, 95])
b = Scores([76, 80])
print(len(a), list(a[1:]), a + b)
print(bool(Scores([])))`,
    output: `3 [88, 95] Scores([91, 88, 95, 76, 80])
False`,
    tip: `运算符返回新对象；切片单独处理；__len__ 返回非负整数；__iter__ 返回迭代器。`
  }, {
    h: "故障排查：__eq__ 与 __hash__ 不一致的后果",
    p: `Python 的规则很简单：[[a == b]] 为真时，[[hash(a)]] 必须等于 [[hash(b)]]；否则对象放进 dict/set 会出现「明明相等却找不到」。自定义 [[__eq__]] 后，默认的 [[__hash__]] 会被设为 None（不可哈希），除非你显式定义。很多人只改 eq，结果对象突然不能当字典键。

可变对象通常不该可哈希。一个列表内容会变，哈希值也会变，dict 就找不到原来的位置。如果业务需要「按 id 相等」的实体，[[__eq__]] 比较 id，[[__hash__]] 用 id，且 id 不可变；其他字段变化不影响哈希。不要用所有字段做哈希，除非对象真的不可变。

[[__eq__]] 要返回 [[NotImplemented]]，而不是 False，当对方类型不兼容时。这样 Python 会尝试对方的 [[__eq__]]，可能得到正确结果。直接返回 False 会让某些反射比较失效。但也不要返回 NotImplemented 后就不管，最终 Python 会回退到身份比较。

浮点数做键要小心：[[0.1 + 0.2 != 0.3]]，哈希也不同。金额用 Decimal 或整数分，时间用整数毫秒，避免浮点误差进入相等性。必须用浮点时，明确容差比较，但容差比较不适合做哈希键。

[[dataclass(frozen=True)]] 自动生成一致的 eq/hash；[[dataclass]] 非 frozen 默认不可哈希（eq=True, frozen=False 时 [[__hash__]] 为 None）。这不是 bug，是提醒你「可变对象别当键」。需要可变对象做键时，用 id 或不可变快照。

验收：两个相等对象放进 set，长度是否为 1？修改一个字段后，还能从 dict 里取到吗？不同类型比较是否返回 NotImplemented？浮点键是否出现「找不到」？这四个测试能抓住大多数 eq/hash 问题。`,
    code: String.raw`class Bad:
    def __init__(self, x): self.x = x
    def __eq__(self, other):
        return isinstance(other, Bad) and self.x == other.x
    # 没有 __hash__，默认不可哈希

b1, b2 = Bad(1), Bad(1)
print(b1 == b2)
try:
    print({b1, b2})
except TypeError as e:
    print("set failed:", e)

class Good:
    __slots__ = ("id", "name")
    def __init__(self, id, name):
        self.id, self.name = id, name
    def __eq__(self, other):
        if not isinstance(other, Good):
            return NotImplemented
        return self.id == other.id
    def __hash__(self):
        return hash(self.id)

g1, g2 = Good(1, "A"), Good(1, "B")
print(g1 == g2, len({g1, g2}))`,
    output: `True
set failed: unhashable type: 'Bad'
True 1`,
    tip: `eq 为真必须 hash 相等；可变对象别做键；不兼容类型返回 NotImplemented。`
  }]);
})();
