window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch11-1": [
    {
      h: "深读：__init_subclass__ 与注册子类",
      p: `[[__init_subclass__]] 在子类创建时自动调用，适合做「子类注册/统一校验」，不用写元类。比如插件基类在子类定义时把子类登记到注册表，调用方不需要手动注册。

它只会在直接子类创建时触发；孙类会触发自己的父类钩子，但不会自动冒泡到最顶层，除非每层都调用 [[super().__init_subclass__]]。注册表通常是类级字典，注意重复注册和测试隔离。

比元类简单得多。只有需要修改类创建过程（改命名空间、注入属性）时才用元类；单纯「子类定义时做一件事」用 [[__init_subclass__]]。`,
      code: String.raw`class Plugin:
    registry = {}
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry[cls.__name__] = cls

class CsvPlugin(Plugin): pass
class JsonPlugin(Plugin): pass

print(sorted(Plugin.registry))`,
      output: `['CsvPlugin', 'JsonPlugin']`,
      tip: `[[__init_subclass__]] 适合子类注册/统一校验；比元类简单，优先用它。`
    },
    {
      h: "深读：抽象基类不是必需，但能拦住误用",
      p: `[[abc.ABC]] + [[@abstractmethod]] 让未实现抽象方法的子类在实例化时直接报错，而不是运行到一半才 [[AttributeError]]。它适合「这个基类只定义协议，具体实现必须由子类给」的场景。

抽象方法可以有实现，子类仍可用 [[super()]] 调用；[[@abstractmethod]] 只要求子类覆盖。[[abc.abstractproperty]] 已废弃，用 [[property]] + [[abstractmethod]]。

Protocol 更适合静态检查，ABC 更适合运行时强制。两者都能描述接口；选一个，不要同一层混用。`,
      code: String.raw`from abc import ABC, abstractmethod

class Repo(ABC):
    @abstractmethod
    def load(self): ...
    @abstractmethod
    def save(self, row): ...

class MemoryRepo(Repo):
    def load(self): return []
    def save(self, row): pass

try:
    Repo()
except TypeError as err:
    print(type(err).__name__, err)`,
      output: `TypeError Can't instantiate abstract class Repo without an implementation for abstract method 'load'`,
      tip: `ABC 在实例化时强制实现；Protocol 在静态检查时提示。运行时强制用 ABC。`
    },
    {
      h: "深读：继承链上的初始化顺序",
      p: `子类 [[__init__]] 不调用 [[super().__init__]]，父类字段就不会初始化。多继承时，每个类的 [[__init__]] 都应该协作式调用 [[super().__init__]]，否则 MRO 后面的类被跳过。

但 [[super().__init__]] 不是「调用所有父类」，它只调用 MRO 下一个；下一个再调用下一个，形成链。任何一个环节不调用，链就断。

如果某个类不需要父类初始化，明确写注释；不要默默省略。测试要覆盖「子类实例化后父类字段存在」。`,
      code: String.raw`class A:
    def __init__(self):
        self.a = 1
        print("A")

class B(A):
    def __init__(self):
        super().__init__()
        self.b = 2
        print("B")

class C(B):
    def __init__(self):
        super().__init__()
        self.c = 3
        print("C")

C()`,
      output: `A
B
C`,
      tip: `多继承链上每个 [[__init__]] 都要 [[super().__init__]]；断一环，后面的父类就不初始化。`
    }
  ],
  "ch11-2": [
    {
      h: "深读：property 与 dataclass 的配合",
      p: `dataclass 默认生成 [[__init__]] 直接给字段赋值，如果字段是 property，赋值会走 setter。可以用 [[field(init=False)]] 让 dataclass 不生成该参数，再在 [[__post_init__]] 里赋值。

但 dataclass 的 [[repr]]/[[eq]] 默认包含字段；property 不是字段，不会自动包含。需要派生属性时，用 [[@property]] 手动加，不要把它当 dataclass 字段。

如果校验复杂，dataclass + [[__post_init__]] 比 property 更简单；property 适合「每次读写都要计算/校验」的场景。`,
      code: String.raw`from dataclasses import dataclass, field

@dataclass
class Result:
    _seconds: float = field(init=False, repr=False)
    event: str = "100m"

    @property
    def seconds(self):
        return self._seconds

    @seconds.setter
    def seconds(self, value):
        if value <= 0:
            raise ValueError("seconds 必须为正")
        self._seconds = value

r = Result()
r.seconds = 62.35
print(r.seconds)`,
      output: `62.35`,
      tip: `dataclass 字段和 property 同名会冲突；用 [[field(init=False)]] + 下划线字段，再暴露 property。`
    },
    {
      h: "深读：描述符的存储位置与继承",
      p: `描述符必须定义在类上，不能放在实例 [[__dict__]]；否则 [[__get__]] 不会被调用。继承时，子类会继承父类的描述符对象，多个子类共享同一个描述符实例；描述符里不要保存与具体实例相关的状态。

[[__set_name__]] 在类创建时调用，用来拿字段名；同一个描述符实例被多个类复用时，[[self.name]] 会被最后一次赋值覆盖。需要每个类独立状态时，在 [[__get__]] 里用 [[obj.__dict__]] 存。

描述符的 [[__get__]] 要处理 [[obj is None]] 的情况（通过类访问），否则 [[Result.seconds]] 会崩。`,
      code: String.raw`class Positive:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} 必须为正")
        obj.__dict__[self.name] = value

class A:
    x = Positive()
class B:
    x = Positive()

a = A(); a.x = 1
b = B(); b.x = 2
print(a.x, b.x, A.x)`,
      output: `1 2 <__main__.Positive object at ...>`,
      tip: `描述符是类属性；[[__get__]] 要处理 [[obj is None]]，否则类访问会崩。`
    },
    {
      h: "深读：classmethod 工厂与继承多态",
      p: `[[Result.from_dict]] 用 [[cls]] 而不是硬编码 [[Result]]，子类 [[ResultV2.from_dict]] 会构造 V2。这是工厂方法支持继承的关键。

但 [[cls(...)]] 依赖子类构造器签名一致；如果子类加了必填字段，工厂会失败。工厂方法要文档化「子类必须保持构造器兼容」，或者改用 [[cls.__new__]] + 显式初始化。

不要用 classmethod 做「全局单例」；它只是绑定类的方法，不保证只创建一个实例。单例需要额外状态/锁。`,
      code: String.raw`class Result:
    def __init__(self, event, seconds):
        self.event = event
        self.seconds = seconds
    @classmethod
    def from_dict(cls, data):
        return cls(data["event"], float(data["seconds"]))

class ResultV2(Result):
    pass

r = ResultV2.from_dict({"event": "100m", "seconds": "62.35"})
print(type(r).__name__, r.seconds)`,
      output: `ResultV2 62.35`,
      tip: `工厂用 [[cls]] 支持子类；但子类构造器签名必须兼容，否则工厂会炸。`
    }
  ],
  "ch11-3": [
    {
      h: "深读：切片协议与 __getitem__",
      p: `[[obj[1:3]]] 传给 [[__getitem__]] 的是 [[slice]] 对象，不是两个参数。需要支持切片时，判断 [[isinstance(key, slice)]]，用 [[key.indices(len(self))]] 规范化，再返回同类型容器。

只实现整数索引时，切片会 TypeError；调用方可能习惯切片，所以要明确文档。返回列表还是自定义容器？如果返回列表，调用方会失去自定义方法；返回同类型，可能触发构造器校验。

[[__getitem__]] 抛 [[IndexError]] 表示越界；抛 [[KeyError]] 表示映射键不存在。不要混用。`,
      code: String.raw`class Scores:
    def __init__(self, values):
        self._values = list(values)
    def __getitem__(self, key):
        if isinstance(key, slice):
            return Scores(self._values[key])
        return self._values[key]
    def __len__(self):
        return len(self._values)

s = Scores([91, 88.5, 79])
print(s[0], s[1:])
print(len(s[1:]))`,
      output: `91 [88.5, 79]
2`,
      tip: `切片传入的是 [[slice]] 对象；用 [[key.indices(len)]] 规范化，返回类型要明确。`
    },
    {
      h: "深读：可迭代对象 vs 迭代器",
      p: `可迭代对象实现 [[__iter__]]，返回迭代器；迭代器实现 [[__next__]]，并通常也实现 [[__iter__]] 返回 [[self]]。[[for]] 对两者都调用 [[iter()]]，所以可迭代对象可以被多次遍历，迭代器只能遍历一次。

常见错误是把「有状态的 [[__next__]]」放在可迭代对象上，还让 [[__iter__]] 返回 [[self]]；第二次 for 从上次位置继续。正确做法是 [[__iter__]] 返回新生成器/新迭代器。

[[iter(obj)]] 对序列会退化为索引迭代；没有 [[__iter__]] 但有 [[__getitem__]] 的对象也能 for，但语义是「从 0 开始直到 IndexError」。`,
      code: String.raw`class Book:
    def __init__(self, rows):
        self.rows = rows
    def __iter__(self):
        return iter(self.rows)

b = Book([1, 2])
it = iter(b)
print(next(it), next(it))
print(list(b))`,
      output: `1 2
[1, 2]`,
      tip: `可迭代对象每次 [[__iter__]] 返回新迭代器；不要把 [[__next__]] 状态放在可迭代对象上。`
    },
    {
      h: "深读：上下文管理器与异常抑制",
      p: `[[__exit__]] 返回 [[True]] 会吞掉异常，返回 [[False]]/[[None]] 继续传播。[[contextlib.suppress]] 是显式吞异常的工具；自定义管理器不要无条件返回 [[True]]。

[[contextlib.ExitStack]] 适合动态打开多个资源，按后进先出关闭；[[stack.enter_context()]] 注册，出错时全部清理。它比自己维护列表更安全。

上下文管理器也可以返回值：[[with open(...) as f]] 的 f 是 [[__enter__]] 返回；不要假设一定是 [[self]]。`,
      code: String.raw`from contextlib import ExitStack

with ExitStack() as stack:
    f1 = stack.enter_context(open("a.txt", "w", encoding="utf-8"))
    f2 = stack.enter_context(open("b.txt", "w", encoding="utf-8"))
    f1.write("a")
    f2.write("b")
print("done")`,
      output: `done`,
      tip: `[[ExitStack]] 后进先出关闭；异常时也会清理，适合动态数量资源。`
    }
  ],
  "ch11-review": [
    {
      h: "本章复盘：继承是工具，不是身份",
      p: `这一章的核心判断是「关系是否真的是 is-a」。如果是，继承能复用行为并支持多态；如果不是，组合更清晰。MRO/super 的复杂性只在多继承时出现，单继承不要被吓住；但也不要为了「扩展性」提前设计多层继承。

property/描述符解决的是「字段访问时要不要执行规则」。有规则才用，没有规则就是套壳。魔术方法解决的是「对象如何参与 Python 语法」，只实现显然语义，不要用运算符表达业务动作。

本章验收：写一个 [[LoggedRepo(LogMixin, Repo)]]，确认 [[save]] 返回值不变；给 [[Swimmer.scores]] 做只读 property；让 [[ScoreBook]] 支持 len/for/in/with。`,
      code: String.raw`class ScoreBook:
    def __init__(self, values): self._values = list(values)
    def __len__(self): return len(self._values)
    def __iter__(self): return iter(self._values)
    def __contains__(self, v): return v in self._values

b = ScoreBook([91, 88.5])
print(len(b), list(b), 91 in b)`,
      output: `2 [91, 88.5] True`,
      tip: `继承/属性/魔术方法都服务于「边界清晰」；没有规则就不要用。`
    }
  ]
});
