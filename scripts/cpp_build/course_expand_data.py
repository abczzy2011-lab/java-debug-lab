# -*- coding: utf-8 -*-
"""C++ 课程 96 课 / 1,344 小节：42 门新增课的元数据与可运行示例。"""

NEW_LESSONS = [
{
 "ch":"01","title":"预处理器、宏与条件编译","level":"basic","minutes":55,
 "lead":"预处理发生在编译器真正理解 C++ 之前：它会展开 include、替换宏、按条件裁掉代码。把这一层看清，才能解释“为什么头文件顺序会影响编译”“为什么宏参数会算两次”。",
 "points":["#include 的文本展开","对象宏与函数宏","#if/#ifdef 条件编译","宏的副作用与括号","用 constexpr/inline 替代宏"],
 "demo":{"h":"用条件编译隔离平台差异","p":"下面的程序根据 `__APPLE__` 选择不同的换行说明，同时用 `constexpr` 常量代替对象宏。函数宏只保留最简单的平方，并给参数和整体都加上括号。",
  "code":"#include <iostream>\n#include <string>\nusing namespace std;\n\nconstexpr int kLimit = 8;\n#define SQUARE(x) ((x) * (x))\n\nint main() {\n#ifdef __APPLE__\n    string platform = \"macOS\";\n#else\n    string platform = \"other\";\n#endif\n    int n = 2;\n    cout << platform << ' ' << SQUARE(n + 1) << ' ' << kLimit << '\\n';\n    return 0;\n}",
  "output":"macOS 9 8","tip":"宏不是函数：`SQUARE(n++)` 会自增两次。能用 `constexpr` 函数或模板就不要用宏。","lang":"cpp"}
},
{
 "ch":"01","title":"从编译错误到最小复现","level":"basic","minutes":50,
 "lead":"调试编译错误的核心不是“猜”，而是缩小：删掉无关代码，只留下能稳定复现错误的最小片段。最小复现越小，错误信息里的模板栈和 include 链越短。",
 "points":["从第一条错误读起","按文件:行号定位","区分声明缺失与定义缺失","用 -fsyntax-only 快速迭代","最小复现的删减顺序"],
 "demo":{"h":"把链接错误拆成声明与定义两件事","p":"`use()` 只有声明时能通过编译却会在链接期失败；补上定义后链接才成立。先 `-c` 编译，再链接，能快速判断问题发生在哪个阶段。",
  "code":"#include <iostream>\nusing namespace std;\n\nint use(int);\n\nint main() {\n    cout << use(7) << '\\n';\n    return 0;\n}\n\nint use(int x) {\n    return x * 2 + 1;\n}",
  "output":"15","tip":"`undefined reference` 是链接错误，不是语法错误。先确认定义在哪个目标文件、有没有参与链接。","lang":"cpp"}
},
{
 "ch":"02","title":"字面量、枚举与强类型封装","level":"basic","minutes":55,
 "lead":"C++ 的字面量有类型、有后缀、有进制；枚举则决定一组常量是否拥有独立类型。把“裸数字”升级成有名字、有约束的类型，是减少参数写反的第一道防线。",
 "points":["整数字面量后缀与进制","浮点字面量与精度","enum 与 enum class","底层类型与作用域","用强类型包装 ID"],
 "demo":{"h":"enum class 隔开两个状态机","p":"普通 `enum` 的名字会泄漏到外层作用域，两个状态机都写 `Idle` 时容易冲突；`enum class` 把名字关进类型内部，调用时必须写限定名。",
  "code":"#include <iostream>\nusing namespace std;\n\nenum class Door { Idle, Open, Closed };\nenum class Light { Idle, On, Off };\n\nint main() {\n    Door d = Door::Open;\n    Light l = Light::Idle;\n    cout << (d == Door::Open) << ' ' << (l == Light::Idle) << '\\n';\n    return 0;\n}",
  "output":"1 1","tip":"`enum class` 不会隐式转成 int；需要下标时显式 `static_cast<int>`，别把类型安全又退回去。","lang":"cpp"}
},
{
 "ch":"02","title":"数值转换、格式化与精度","level":"basic","minutes":50,
 "lead":"同一段算术，`int / int`、`double / int`、`long double` 会给出不同结果；格式化又会把差异藏起来。先把转换规则和输出精度定死，再谈算法。",
 "points":["隐式转换与窄化","整数除法与取余","浮点比较与误差","fixed/setprecision","避免未定义行为"],
 "demo":{"h":"用 fixed 与 setprecision 固定输出","p":"`setprecision(2)` 配合 `fixed` 表示两位小数；如果不加 `fixed`，它表示有效数字位数，输出会随数值大小跳变。",
  "code":"#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    int total = 7, count = 3;\n    double avg = static_cast<double>(total) / count;\n    cout << fixed << setprecision(2) << avg << '\\n';\n    cout << (0.1 + 0.2 == 0.3) << '\\n';\n    return 0;\n}",
  "output":"2.33\n0","tip":"浮点数不要用 `==` 直接比较；用 `abs(a-b) < eps`，并让 eps 与量级匹配。","lang":"cpp"}
},
{
 "ch":"03","title":"重载解析、默认参数与实参匹配","level":"medium","minutes":60,
 "lead":"同名函数可以有很多个，但编译器必须选出唯一最优的那一个。理解标准转换序列、默认参数和引用绑定，能解释大部分“为什么调用了另一个重载”。",
 "points":["候选函数与可行函数","标准转换序列排序","默认参数的静态绑定","const/引用限定","nullptr 与重载歧义"],
 "demo":{"h":"const 引用与普通引用决定重载","p":"左值优先绑定 `T&`，const 左值只能绑定 `const T&`。把 `const` 加错，重载会悄悄换人。",
  "code":"#include <iostream>\nusing namespace std;\n\nvoid show(int&) { cout << \"mutable\\n\"; }\nvoid show(const int&) { cout << \"const\\n\"; }\n\nint main() {\n    int a = 1;\n    const int b = 2;\n    show(a);\n    show(b);\n    show(3);\n    return 0;\n}",
  "output":"mutable\nconst\nconst","tip":"默认参数是编译期填进去的，不会参与动态绑定；虚函数与默认参数一起用时尤其容易误判。","lang":"cpp"}
},
{
 "ch":"03","title":"函数指针、lambda 与回调入门","level":"medium","minutes":60,
 "lead":"回调的本质是“把一段行为当参数传进去”。函数指针是最轻的形式，lambda 多了捕获，`std::function` 多了类型擦除。三者的开销和生命周期完全不同。",
 "points":["函数指针声明与调用","lambda 的捕获列表","std::function 的类型擦除","回调生命周期","sort 的比较器"],
 "demo":{"h":"用 lambda 给 sort 传比较规则","p":"捕获列表为空时 lambda 可以转成函数指针；按长度排序需要稳定处理并列，这里用长度和字典序两级比较。",
  "code":"#include <algorithm>\n#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<string> words{\"pear\", \"fig\", \"apple\", \"kiwi\"};\n    sort(words.begin(), words.end(), [](const string& a, const string& b) {\n        if (a.size() != b.size()) return a.size() < b.size();\n        return a < b;\n    });\n    bool first = true;\n    for (const auto& w : words) {\n        if (!first) cout << ' ';\n        cout << w;\n        first = false;\n    }\n    cout << '\\n';\n    return 0;\n}",
  "output":"fig kiwi pear apple","tip":"捕获了局部引用的 lambda 不能活过该作用域；要存起来就按值捕获，或确保被引用对象寿命更长。","lang":"cpp"}
},
{
 "ch":"04","title":"栈、堆、静态区与对象生命周期","level":"medium","minutes":60,
 "lead":"对象放在哪里，决定了它什么时候构造、什么时候析构、能不能被指针带走。栈对象随作用域结束，堆对象要有人负责释放，静态对象则活到程序结束。",
 "points":["自动存储期与栈帧","动态存储期与 new/delete","静态/线程存储期","返回局部引用的陷阱","对象生命周期与 RAII"],
 "demo":{"h":"返回局部对象的引用是悬垂引用","p":"`make_bad()` 返回栈上的 `x`，函数一结束 `x` 就销毁；`make_good()` 按值返回，调用方拿到独立对象。",
  "code":"#include <iostream>\nusing namespace std;\n\nint& make_bad() { int x = 42; return x; }\nint make_good() { int x = 42; return x; }\n\nint main() {\n    int a = make_good();\n    cout << a << '\\n';\n    return 0;\n}",
  "output":"42","tip":"任何“返回局部变量引用/指针”的写法都要立刻标红；需要共享寿命时用容器、智能指针或把对象放到调用方。","lang":"cpp"}
},
{
 "ch":"04","title":"数组退化、指针算术与越界","level":"medium","minutes":60,
 "lead":"数组名在多数表达式里退化成指向首元素的指针，长度信息随之丢失。指针算术以元素为单位，但越界不会替你检查；`std::array` 与 `std::span` 能把长度带回来。",
 "points":["数组到指针的退化","指针加减与差值","一维/二维数组布局","越界与未定义行为","array/span 的边界"],
 "demo":{"h":"span 把长度一起传进函数","p":"传 `int*` 时函数不知道长度；传 `span<int>` 时 `size()` 和范围检查都在。下面只读不写，展示长度信息如何保留。",
  "code":"#include <iostream>\n#include <span>\nusing namespace std;\n\nint sum(span<const int> values) {\n    int total = 0;\n    for (int x : values) total += x;\n    return total;\n}\n\nint main() {\n    int a[]{1, 2, 3, 4};\n    cout << sum(a) << '\\n';\n    return 0;\n}",
  "output":"10","tip":"`span` 不拥有元素，只借用；被引用数组必须先于 span 存活。","lang":"cpp"}
},
{
 "ch":"05","title":"构造器初始化列表与 explicit","level":"medium","minutes":55,
 "lead":"成员按声明顺序初始化，不按初始化列表书写顺序；`explicit` 则决定单参构造能否被当作隐式转换。把这两条记牢，能避免“构造了却不是我想要的值”。",
 "points":["成员初始化顺序","初始化列表与赋值","explicit 抑制隐式转换","委托构造","默认成员初始化"],
 "demo":{"h":"初始化顺序按声明，不按书写","p":"`b` 先于 `a` 声明，所以即使列表写 `a(1), b(a+1)`，`b` 也会先用未初始化的 `a`。把依赖关系写进构造体或调整声明顺序才安全。",
  "code":"#include <iostream>\nusing namespace std;\n\nstruct Pair {\n    int a;\n    int b;\n    Pair() : a(1), b(a + 1) {}\n};\n\nint main() {\n    Pair p;\n    cout << p.a << ' ' << p.b << '\\n';\n    return 0;\n}",
  "output":"1 2","tip":"成员初始化列表的顺序只影响可读性，真正顺序永远按声明。编译器 `-Wreorder` 会提醒。","lang":"cpp"}
},
{
 "ch":"05","title":"封装边界：友元、访问器与不变式","level":"medium","minutes":60,
 "lead":"封装不是把所有成员都塞进 private，而是让外部只能通过能维持不变式的入口修改对象。友元、访问器和返回引用，每一个都在扩大或收缩这条边界。",
 "points":["private 与不变式","友元的合理用途","返回引用 vs 返回值","const 成员函数","接口最小化"],
 "demo":{"h":"只暴露 const 引用，禁止外部改内部","p":"`values()` 返回 `const vector&`，调用方能读不能改；如果要修改，必须走 `add()` 并检查上限。",
  "code":"#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Bag {\npublic:\n    bool add(int x) {\n        if (data.size() >= 3) return false;\n        data.push_back(x);\n        return true;\n    }\n    const vector<int>& values() const { return data; }\nprivate:\n    vector<int> data;\n};\n\nint main() {\n    Bag b;\n    b.add(1); b.add(2); b.add(3); b.add(4);\n    cout << b.values().size() << '\\n';\n    return 0;\n}",
  "output":"3","tip":"返回非 const 引用等于把内部状态交出去；除非这是明确的 API 设计，否则优先返回值或 const 引用。","lang":"cpp"}
},
{
 "ch":"05","title":"RAII 守卫：锁、文件与事务式回滚","level":"hard","minutes":65,
 "lead":"RAII 的威力在“作用域结束时一定执行”：锁一定释放、文件一定关闭、失败一定回滚。把资源包进对象，比在每个 return 前手写 cleanup 可靠得多。",
 "points":["lock_guard 与作用域","文件流的析构关闭","回滚守卫","noexcept 析构","RAII 与错误路径"],
 "demo":{"h":"用析构函数做回滚标记","p":"事务对象在构造时记录旧值，`commit()` 后不再回滚；如果没有 commit 就离开作用域，析构会把值恢复。",
  "code":"#include <iostream>\nusing namespace std;\n\nstruct Rollback {\n    int& target;\n    int old;\n    bool committed = false;\n    Rollback(int& t) : target(t), old(t) {}\n    void commit() { committed = true; }\n    ~Rollback() { if (!committed) target = old; }\n};\n\nint main() {\n    int value = 10;\n    {\n        Rollback guard(value);\n        value = 99;\n    }\n    cout << value << '\\n';\n    return 0;\n}",
  "output":"10","tip":"析构函数默认 noexcept；回滚逻辑不能抛异常，否则会直接 terminate。","lang":"cpp"}
},
{
 "ch":"06","title":"移动构造、noexcept 与容器搬移","level":"hard","minutes":65,
 "lead":"移动不是“把对象变没”，而是把资源所有权从源对象转到目标对象。容器在扩容时是否搬移、搬移后源对象是否为空，取决于移动构造是否 noexcept。",
 "points":["移动构造与移动赋值","noexcept 的影响","移后源对象状态","vector 扩容搬移","Rule of Five 的一致性"],
 "demo":{"h":"观察移动后源对象仍可析构","p":"`Buffer` 移动后把指针置空，源对象仍能安全析构；如果只复制指针不置空，就会出现双重释放。",
  "code":"#include <iostream>\n#include <utility>\nusing namespace std;\n\nstruct Buffer {\n    int* p;\n    int n;\n    Buffer(int n) : p(new int[n]()), n(n) {}\n    Buffer(Buffer&& other) noexcept : p(other.p), n(other.n) { other.p = nullptr; other.n = 0; }\n    ~Buffer() { delete[] p; }\n};\n\nint main() {\n    Buffer a(3);\n    Buffer b(std::move(a));\n    cout << b.n << ' ' << (a.p == nullptr) << '\\n';\n    return 0;\n}",
  "output":"3 1","tip":"移动构造尽量标 `noexcept`；否则 `vector` 在扩容时可能改用拷贝，性能与语义都会变。","lang":"cpp"}
},
{
 "ch":"06","title":"下标、函数调用与流运算符重载","level":"medium","minutes":60,
 "lead":"运算符重载不是“让代码看起来酷”，而是让自定义类型获得与内建类型一致的表达。下标要成对提供 const/非 const，函数调用要明确参数契约，流运算符要返回流引用。",
 "points":["operator[] 的 const 版本","operator() 与函数对象","operator<< 的链式返回","friend 与成员选择","避免语义混淆"],
 "demo":{"h":"矩阵下标返回行代理","p":"二维下标需要两次 `[]`；用一个轻量行代理把 `m[i][j]` 拆成两步，同时保留 const 版本。",
  "code":"#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct Matrix {\n    vector<vector<int>> a;\n    Matrix(int r, int c) : a(r, vector<int>(c)) {}\n    vector<int>& operator[](int i) { return a[i]; }\n    const vector<int>& operator[](int i) const { return a[i]; }\n};\n\nint main() {\n    Matrix m(2, 3);\n    m[1][2] = 7;\n    const Matrix& cm = m;\n    cout << cm[1][2] << '\\n';\n    return 0;\n}",
  "output":"7","tip":"`operator[]` 不做越界检查；需要安全访问时提供 `at()` 或返回 `optional`。","lang":"cpp"}
},
{
 "ch":"06","title":"三路比较与 <=> 实战","level":"hard","minutes":60,
 "lead":"C++20 的 `<=>` 一次返回“小于/等于/大于”，编译器再据此生成 `<`、`>`、`<=`、`>=`。写对返回类型和成员比较顺序，才能让排序和容器行为一致。",
 "points":["strong_ordering 与 weak_ordering","default 与自定义 <=>","成员比较顺序","与 == 的一致性","排序稳定性"],
 "demo":{"h":"用 <=> 一次生成全部比较","p":"`Version` 先比 major，再比 minor；`<=>` 返回 `strong_ordering`，其余关系运算符由编译器合成。",
  "code":"#include <compare>\n#include <iostream>\nusing namespace std;\n\nstruct Version {\n    int major, minor;\n    auto operator<=>(const Version&) const = default;\n};\n\nint main() {\n    Version a{1, 2}, b{1, 3};\n    cout << (a < b) << ' ' << (a == b) << ' ' << (a >= b) << '\\n';\n    return 0;\n}",
  "output":"1 0 0","tip":"自定义 `<=>` 时保持与 `==` 一致；不要出现 `a == b` 为真但 `<=>` 返回不等价的情况。","lang":"cpp"}
},
{
 "ch":"07","title":"虚函数表、动态绑定开销与 devirtualization","level":"hard","minutes":65,
 "lead":"虚函数通过对象里的 vptr 找到虚表，再跳到最终覆写版本。它带来一次间接跳转和阻止内联的可能，但编译器在能确定动态类型时也会去虚化。",
 "points":["vptr 与虚表布局","动态绑定的一次间接调用","final 与 devirtualization","虚析构的必要性","接口调用的缓存影响"],
 "demo":{"h":"final 让编译器有机会直接调用","p":"`final` 告诉编译器这个虚函数不再被覆写，某些场景可以把间接调用改成直接调用；语义不变，优化空间更大。",
  "code":"#include <iostream>\nusing namespace std;\n\nstruct Base {\n    virtual int value() const { return 1; }\n    virtual ~Base() = default;\n};\nstruct Derived final : Base {\n    int value() const final { return 2; }\n};\n\nint main() {\n    Derived d;\n    const Base& b = d;\n    cout << b.value() << '\\n';\n    return 0;\n}",
  "output":"2","tip":"不要为了性能随手把虚函数改非虚；先确认它真的在热路径，再用 profile 证明。","lang":"cpp"}
},
{
 "ch":"07","title":"组合优于继承与接口隔离","level":"medium","minutes":55,
 "lead":"继承表达“是一种”，组合表达“持有并协作”。多数业务代码需要的是组合：它让依赖可见、替换容易、测试不需要构造整棵类层次。",
 "points":["is-a 与 has-a","继承带来的耦合","组合与依赖注入","接口最小化","运行时多态的选择"],
 "demo":{"h":"用组合把日志后端换掉","p":"`Service` 持有一个 `Logger` 接口，测试时注入假实现，不需要继承 `Service`。",
  "code":"#include <iostream>\n#include <memory>\nusing namespace std;\n\nstruct Logger { virtual void log(const string&) = 0; virtual ~Logger() = default; };\nstruct ConsoleLogger : Logger { void log(const string& s) override { cout << s << '\\n'; } };\nstruct Service {\n    unique_ptr<Logger> logger;\n    Service(unique_ptr<Logger> l) : logger(std::move(l)) {}\n    void run() { logger->log(\"ok\"); }\n};\n\nint main() {\n    Service s(make_unique<ConsoleLogger>());\n    s.run();\n    return 0;\n}",
  "output":"ok","tip":"组合的对象要用智能指针或值语义明确所有权；不要留下“借来的引用”却不知道谁负责寿命。","lang":"cpp"}
},
{
 "ch":"08","title":"模板特化、if constexpr 与偏特化","level":"hard","minutes":65,
 "lead":"模板不是只有“通用版本”：可以全特化、偏特化，也可以用 `if constexpr` 在编译期选择分支。选择哪一种，取决于你要在类型层面还是语句层面分派。",
 "points":["主模板与全特化","偏特化","if constexpr 丢弃分支","特化与重载的优先级","编译期分支的实例化"],
 "demo":{"h":"if constexpr 让不同类型走不同路径","p":"`print` 对指针解引用，对普通值直接输出；被丢弃的分支不会实例化，所以不会对 `int` 做 `*x`。",
  "code":"#include <iostream>\n#include <type_traits>\nusing namespace std;\n\ntemplate <class T>\nvoid print(const T& x) {\n    if constexpr (is_pointer_v<T>) cout << *x << '\\n';\n    else cout << x << '\\n';\n}\n\nint main() {\n    int a = 5;\n    print(a);\n    print(&a);\n    return 0;\n}",
  "output":"5\n5","tip":"`if constexpr` 的条件必须是编译期常量；普通 `if` 即使运行期恒假，两个分支也都要能编译。","lang":"cpp"}
},
{
 "ch":"08","title":"模板编译错误：从实例化栈回到调用点","level":"hard","minutes":60,
 "lead":"模板报错往往有几十行，但真正有用的信息只有两层：最内层说“哪个表达式不合法”，最外层说“哪个调用触发了实例化”。学会从下往上读，比逐行看更省时间。",
 "points":["required from 实例化栈","最内层错误表达式","static_assert 自定义诊断","concepts 提前约束","最小化模板参数"],
 "demo":{"h":"static_assert 给出可读诊断","p":"当类型没有 `size()` 时，`static_assert` 会在实例化点直接说明需求，比深层的“no member named size”更清楚。",
  "code":"#include <iostream>\n#include <type_traits>\nusing namespace std;\n\ntemplate <class T>\nvoid show_size(const T& x) {\n    static_assert(requires(T t) { t.size(); }, \"T 需要提供 size()\");\n    cout << x.size() << '\\n';\n}\n\nint main() {\n    string s = \"abc\";\n    show_size(s);\n    return 0;\n}",
  "output":"3","tip":"C++20 的 `requires` 表达式可以直接写进 `static_assert`；老编译器可用 detection idiom 替代。","lang":"cpp"}
},
{
 "ch":"09","title":"vector 扩容、reserve 与迭代器失效","level":"medium","minutes":60,
 "lead":"vector 的连续内存带来缓存友好，也带来扩容时整体搬移。`reserve` 能提前买够容量，但任何可能扩容的操作都会让旧迭代器、指针和引用失效。",
 "points":["size 与 capacity","扩容的搬移成本","reserve 的使用时机","迭代器/引用失效","shrink_to_fit 的边界"],
 "demo":{"h":"reserve 后 capacity 不再频繁变化","p":"连续 push_back 超过容量会触发扩容；提前 `reserve(10)` 后，前 10 次插入不会搬移。",
  "code":"#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> v;\n    v.reserve(10);\n    for (int i = 0; i < 10; ++i) v.push_back(i);\n    cout << v.size() << ' ' << v.capacity() << '\\n';\n    return 0;\n}",
  "output":"10 10","tip":"`reserve` 只改容量不改 size；访问 `v[5]` 前仍要保证元素已经构造。","lang":"cpp"}
},
{
 "ch":"09","title":"list/forward_list/set 的选型与局部性","level":"medium","minutes":60,
 "lead":"链表胜在“已知位置插入不搬移”，败在“每次访问都要追指针”。选择容器时，先问访问模式：是随机下标、顺序遍历、按值查找，还是频繁中间插入？",
 "points":["list 的双向节点","forward_list 的单向节省","set/map 的有序性","局部性与缓存命中","容器选型的决策表"],
 "demo":{"h":"list 中间插入不使其他迭代器失效","p":"在 `list` 中插入只改相邻链接；在 `vector` 中插入可能整体搬移。下面展示 `list` 的 splice 式移动。",
  "code":"#include <iostream>\n#include <list>\nusing namespace std;\n\nint main() {\n    list<int> a{1, 2, 3};\n    auto it = a.begin();\n    ++it;\n    a.insert(it, 9);\n    bool first = true;\n    for (int x : a) {\n        if (!first) cout << ' ';\n        cout << x;\n        first = false;\n    }\n    cout << '\\n';\n    return 0;\n}",
  "output":"1 9 2 3","tip":"除非有明确的中间插入/拼接需求，默认仍选 `vector`；链表的缓存不友好经常吞掉理论优势。","lang":"cpp"}
},
{
 "ch":"09","title":"算法库：排序、查找、二分与数值","level":"medium","minutes":65,
 "lead":"STL 算法把“怎么遍历”和“做什么”分开。排序、二分、前缀和、最大公约数这些常用操作都有标准实现；先查算法库，再考虑手写循环。",
 "points":["sort/stable_sort","lower_bound/upper_bound","accumulate 与 iota","gcd/lcm","算法与容器解耦"],
 "demo":{"h":"lower_bound 找到第一个不小于目标的位置","p":"在已排序区间上，`lower_bound` 返回插入点；`upper_bound` 返回第一个大于目标的位置。两者相减就是等值区间长度。",
  "code":"#include <algorithm>\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> a{1, 3, 3, 5, 7};\n    auto lo = lower_bound(a.begin(), a.end(), 3);\n    auto hi = upper_bound(a.begin(), a.end(), 3);\n    cout << (lo - a.begin()) << ' ' << (hi - lo) << '\\n';\n    return 0;\n}",
  "output":"1 2","tip":"二分前必须保证区间有序；对无序容器用 `find`，不要指望 `lower_bound` 自动排序。","lang":"cpp"}
},
{
 "ch":"10","title":"格式化输出、精度与宽度控制","level":"basic","minutes":55,
 "lead":"输出格式不是“好看就行”：判题系统逐字符比对，宽度、精度、补零和对齐都会影响结果。把 `iomanip` 的常用控制器用熟，比手写字符串拼接更稳。",
 "points":["setw 与 left/right","fixed/scientific","setfill 补零","进制输出","printf 与 iostream 的取舍"],
 "demo":{"h":"宽度、补零与对齐一起控制","p":"`setw(6)` 只作用于下一次输出；`setfill('0')` 改变填充字符；左对齐用 `left`。",
  "code":"#include <iomanip>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << setfill('0') << setw(4) << 42 << '\\n';\n    cout << setfill(' ') << left << setw(6) << \"ab\" << \"|\\n\";\n    cout << hex << 255 << '\\n';\n    return 0;\n}",
  "output":"0042\nab    |\nff","tip":"`setw` 不会持久生效，每次输出都要重新设置；`hex` 则会持续影响后续整数输出。","lang":"cpp"}
},
{
 "ch":"10","title":"文件流、路径与错误处理","level":"medium","minutes":60,
 "lead":"文件 I/O 的失败点比内存操作多：打开失败、读失败、写失败、路径不存在。每一步都要检查流状态，不能假设 `ifstream` 一定成功。",
 "points":["ifstream/ofstream 打开模式","流状态与 failbit","getline 与二进制读取","filesystem 路径拼接","关闭与 flush 的时机"],
 "demo":{"h":"先检查打开，再读取","p":"`ifstream` 打开失败不会抛异常，只会设置 failbit；用 `is_open()` 或布尔转换检查，避免对空流继续读。",
  "code":"#include <filesystem>\n#include <fstream>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    string path = \"demo.txt\";\n    ofstream out(path);\n    out << \"hello\\n\";\n    out.close();\n    ifstream in(path);\n    if (!in) { cout << \"open failed\\n\"; return 0; }\n    string line;\n    getline(in, line);\n    cout << line << '\\n';\n    filesystem::remove(path);\n    return 0;\n}",
  "output":"hello","tip":"示例里的路径清理应写成 `filesystem::remove(path);`；写文件后先 `close()` 或让流析构，确保缓冲落盘。","lang":"cpp"}
},
{
 "ch":"11","title":"make_unique、工厂函数与所有权转移","level":"medium","minutes":60,
 "lead":"`new` 只分配，不表达所有权；`make_unique` 一创建就明确“这块资源归 unique_ptr”。工厂函数再把构造细节收进一个入口，调用方只需要接住所有权。",
 "points":["make_unique 与异常安全","工厂返回 unique_ptr","所有权转移","shared_ptr 的引入时机","不要裸 new/delete"],
 "demo":{"h":"工厂返回 unique_ptr，调用方接住","p":"`make_widget()` 在内部构造对象，返回 `unique_ptr`；调用方不需要知道析构细节，也不会漏 delete。",
  "code":"#include <iostream>\n#include <memory>\nusing namespace std;\n\nstruct Widget { int id; Widget(int i) : id(i) {} };\n\nunique_ptr<Widget> make_widget(int id) {\n    return make_unique<Widget>(id);\n}\n\nint main() {\n    auto w = make_widget(7);\n    cout << w->id << '\\n';\n    return 0;\n}",
  "output":"7","tip":"工厂返回 `unique_ptr` 比返回值对象更能表达“堆上创建”；需要共享时再转 `shared_ptr`，不要一开始就共享。","lang":"cpp"}
},
{
 "ch":"11","title":"引用计数、泄漏与 shared_from_this 排查","level":"hard","minutes":65,
 "lead":"`shared_ptr` 用引用计数延长寿命，但循环引用会让计数永不归零；`weak_ptr` 打断环，`enable_shared_from_this` 让成员函数安全地拿到自身共享所有权。",
 "points":["引用计数与控制块","循环引用泄漏","weak_ptr 打破环","enable_shared_from_this","泄漏排查工具"],
 "demo":{"h":"weak_ptr 观察而不拥有","p":"父节点持有子的 `shared_ptr`，子节点只持有父的 `weak_ptr`；这样父子不会互相卡住引用计数。",
  "code":"#include <iostream>\n#include <memory>\nusing namespace std;\n\nstruct Node {\n    int id;\n    shared_ptr<Node> child;\n    weak_ptr<Node> parent;\n    Node(int i) : id(i) {}\n};\n\nint main() {\n    auto root = make_shared<Node>(1);\n    root->child = make_shared<Node>(2);\n    root->child->parent = root;\n    cout << root.use_count() << ' ' << root->child.use_count() << '\\n';\n    return 0;\n}",
  "output":"1 1","tip":"只要图里存在环，就至少有一条边要用 `weak_ptr`；否则 `use_count` 永远不会归零。","lang":"cpp"}
},
{
 "ch":"12","title":"捕获生命周期、悬垂引用与 copy 捕获","level":"medium","minutes":60,
 "lead":"lambda 捕获的是“变量”，不是“值”或“对象”本身。按引用捕获会把外部变量的寿命绑到 lambda 上；按值捕获则复制一份，修改不会回写。异步回调里尤其要小心。",
 "points":["按值/按引用捕获","捕获 this 的风险","mutable lambda","copy 捕获与寿命","异步回调的所有权"],
 "demo":{"h":"按值捕获后外部修改不影响 lambda","p":"`[x]` 复制当前值，`[&x]` 绑定原变量。下面两个 lambda 展示差异。",
  "code":"#include <functional>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 1;\n    auto by_value = [x]() { return x; };\n    auto by_ref = [&x]() { return x; };\n    x = 9;\n    cout << by_value() << ' ' << by_ref() << '\\n';\n    return 0;\n}",
  "output":"1 9","tip":"异步回调不要捕获局部变量的引用；按值捕获 shared_ptr 或复制必要数据，确保回调活得更久。","lang":"cpp"}
},
{
 "ch":"12","title":"ranges 管道：filter/transform/take 组合","level":"hard","minutes":65,
 "lead":"ranges 把“容器 + 迭代器 + 算法”变成一条惰性管道：`filter` 不立即计算，`transform` 只在被遍历时执行，`take` 提前截断。理解 view 的惰性与寿命，才能避免悬垂。",
 "points":["view 的惰性求值","filter/transform/take","管道组合顺序","view 的寿命","materialize 的时机"],
 "demo":{"h":"惰性管道只在遍历时计算","p":"`views::filter` 和 `views::transform` 组合后没有立刻产生新容器；`for` 循环推进时才逐个计算。",
  "code":"#include <iostream>\n#include <ranges>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> a{1, 2, 3, 4, 5, 6};\n    auto pipe = a | views::filter([](int x) { return x % 2 == 0; })\n                  | views::transform([](int x) { return x * x; })\n                  | views::take(2);\n    bool first = true;\n    for (int x : pipe) {\n        if (!first) cout << ' ';\n        cout << x;\n        first = false;\n    }\n    cout << '\\n';\n    return 0;\n}",
  "output":"4 16","tip":"view 不拥有底层容器；底层容器销毁后 view 悬垂。需要保存结果时用 `vector` 显式 materialize。","lang":"cpp"}
},
{
 "ch":"13","title":"concepts 约束、重载决议与诊断","level":"hard","minutes":65,
 "lead":"concepts 把“模板对类型的要求”写成可命名的布尔表达式，并在重载决议阶段参与筛选。它比 SFINAE 更可读，也能把错误提前到调用点。",
 "points":["concept 定义与 requires","约束重载的偏序","subsumption","标准库 concepts","诊断信息"],
 "demo":{"h":"用 concept 约束只接受整数","p":"`Integral` 只对整型为真；`show(3.14)` 会在重载决议时被排除，而不是在函数体里报错。",
  "code":"#include <concepts>\n#include <iostream>\nusing namespace std;\n\ntemplate <integral T>\nvoid show(T x) { cout << \"int \" << x << '\\n'; }\n\nint main() {\n    show(3);\n    show(4L);\n    return 0;\n}",
  "output":"int 3\nint 4","tip":"concept 之间可以有包含关系；更具体的约束在重载决议中优先，这称为 subsumption。","lang":"cpp"}
},
{
 "ch":"13","title":"协程 suspend/resume 与 generator 模型","level":"hard","minutes":70,
 "lead":"协程不是线程：它在同一线程里保存挂起点，主动 `co_await` 让出，再被恢复。生成器把“每次产出一个值”写成 `co_yield`，调用方按需推进。",
 "points":["coroutine_traits","co_await/co_yield","promise_type","挂起与恢复","生成器的生命周期"],
 "demo":{"h":"一个最小生成器：按需产出自增数","p":"`Generator` 的 `promise_type` 保存当前值和完成状态；`co_yield` 挂起，`next()` 恢复。",
  "code":"#include <coroutine>\n#include <iostream>\nusing namespace std;\n\nstruct Task {\n    struct promise_type {\n        Task get_return_object() { return {}; }\n        suspend_never initial_suspend() { return {}; }\n        suspend_never final_suspend() noexcept { return {}; }\n        void return_void() {}\n        void unhandled_exception() {}\n    };\n};\n\nTask demo() {\n    cout << \"before\\n\";\n    co_await suspend_always{};\n    cout << \"after\\n\";\n}\n\nint main() {\n    demo();\n    cout << \"done\\n\";\n    return 0;\n}",
  "output":"before\ndone","tip":"`co_await suspend_always{}` 会挂起并回到调用方；没有恢复句柄，所以 `after` 不会打印。真实生成器还要保存 handle 并显式 resume。","lang":"cpp"}
},
{
 "ch":"13","title":"std::format、编译期格式串与本地化","level":"medium","minutes":60,
 "lead":"`std::format` 用 `{}` 占位并提供类型安全的格式化，编译期还能检查格式串和参数数量。它比 `printf` 安全，比流拼接更易读。",
 "points":["{} 与格式说明","编译期格式检查","对齐/宽度/精度","chrono 格式化","本地化边界"],
 "demo":{"h":"format 的宽度与小数位","p":"`{:.2f}` 固定两位小数，`{:>8}` 右对齐到 8 列；格式串写错会在编译期或运行期报错。",
  "code":"#include <format>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    double pi = 3.14159;\n    string name = \"cpp\";\n    cout << format(\"{:.2f} {:>8}\\n\", pi, name);\n    return 0;\n}",
  "output":"3.14      cpp","tip":"GCC 14 对 `<format>` 的支持已可用；老标准库可能要求 `<fmt/format.h>` 或关闭编译期检查。","lang":"cpp"}
},
{
 "ch":"14","title":"异常类型设计、错误码映射与边界","level":"medium","minutes":60,
 "lead":"错误不是只有一种：可恢复的业务失败、不可恢复的编程错误、外部系统的临时故障，应该走不同通道。异常类型要有层次，错误码要能映射到用户可理解的提示。",
 "points":["异常类型层次","error_code 与 category","异常 vs 返回 optional","边界处翻译错误","noexcept 边界"],
 "demo":{"h":"自定义异常携带上下文","p":"`ParseError` 继承 `runtime_error`，额外保存行号；调用方既能按类型捕获，也能读到定位信息。",
  "code":"#include <iostream>\n#include <stdexcept>\nusing namespace std;\n\nstruct ParseError : runtime_error {\n    int line;\n    ParseError(const string& msg, int line) : runtime_error(msg), line(line) {}\n};\n\nint main() {\n    try {\n        throw ParseError(\"bad token\", 12);\n    } catch (const ParseError& e) {\n        cout << e.what() << \" @\" << e.line << '\\n';\n    }\n    return 0;\n}",
  "output":"bad token @12","tip":"异常类型按“调用方能否处理”分层；不要把所有错误都塞进一个 `Exception`。","lang":"cpp"}
},
{
 "ch":"14","title":"RAII 回滚、异常安全等级与事务边界","level":"hard","minutes":65,
 "lead":"异常安全有三个等级：不泄漏、保持有效状态、强保证（操作要么完成要么回滚）。RAII 守卫负责前两项，真正的强保证需要提交/回滚协议。",
 "points":["基本/强异常安全","RAII 回滚守卫","提交与回滚","拷贝交换的强保证","析构不抛异常"],
 "demo":{"h":"copy-and-swap 提供强保证","p":"先构造临时对象，成功后再 `swap`；如果构造抛异常，原对象完全不受影响。",
  "code":"#include <algorithm>\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct Bag {\n    vector<int> data;\n    void replace(vector<int> next) { data.swap(next); }\n};\n\nint main() {\n    Bag b;\n    b.data = {1, 2};\n    b.replace({7, 8, 9});\n    cout << b.data.size() << '\\n';\n    return 0;\n}",
  "output":"3","tip":"`swap` 本身不抛异常；强保证的关键是“先把可能失败的事做完，再一次性提交”。","lang":"cpp"}
},
{
 "ch":"15","title":"constexpr 容器、编译期字符串与查找表","level":"hard","minutes":65,
 "lead":"C++20 起 `constexpr` 容器和字符串可以在编译期构造，把运行时查找搬到编译期。代价是编译时间与代码体积，收益是零启动开销和更强的常量折叠。",
 "points":["constexpr vector/string","编译期查找表","consteval 强制编译期","编译时间成本","常量折叠边界"],
 "demo":{"h":"编译期构造小查找表","p":"`constexpr` 数组在编译期完成初始化；`consteval` 函数保证调用只能发生在编译期。",
  "code":"#include <array>\n#include <iostream>\nusing namespace std;\n\nconsteval array<int, 4> make_table() {\n    return {1, 4, 9, 16};\n}\n\nint main() {\n    constexpr auto table = make_table();\n    cout << table[3] << '\\n';\n    return 0;\n}",
  "output":"16","tip":"编译期容器越大，编译越慢；只把真正频繁读取的小表放进 constexpr。","lang":"cpp"}
},
{
 "ch":"15","title":"缓存友好布局：AoS/SoA 与 false sharing","level":"hard","minutes":65,
 "lead":"同样多的数据，排布方式决定缓存命中率。数组的结构（AoS）适合整体访问一个对象，结构的数组（SoA）适合批量处理某一字段；多线程下还要避免伪共享。",
 "points":["AoS 与 SoA","缓存行与局部性","伪共享","对齐与 padding","数据布局的实测"],
 "demo":{"h":"SoA 让批量求和只碰一个数组","p":"`Particles` 把 x/y 分开存；求和 x 时不必把每个粒子的 y 也搬进缓存。",
  "code":"#include <iostream>\n#include <vector>\nusing namespace std;\n\nstruct SoA {\n    vector<double> x, y;\n    void add(double px, double py) { x.push_back(px); y.push_back(py); }\n};\n\nint main() {\n    SoA p;\n    p.add(1, 2); p.add(3, 4);\n    double sum = 0;\n    for (double v : p.x) sum += v;\n    cout << sum << '\\n';\n    return 0;\n}",
  "output":"4","tip":"布局优化必须用真实数据量测；小数组在缓存里本来就全命中，改布局可能没有收益。","lang":"cpp"}
},
{
 "ch":"15","title":"profiling、基准测试与优化决策","level":"hard","minutes":70,
 "lead":"优化的第一步不是改代码，而是证明瓶颈在哪里。用 profiler 看热点、用 benchmark 看方差、用计数器看分配，再决定是否值得改。",
 "points":["采样 profiler","微基准与方差","分配计数","优化前后对比","避免测错对象"],
 "demo":{"h":"用 chrono 做最小基准","p":"同一段工作重复多次，取平均并打印；真正的基准还要预热、隔离和多次采样。",
  "code":"#include <chrono>\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    auto t0 = chrono::steady_clock::now();\n    long long sum = 0;\n    for (int r = 0; r < 1000; ++r) {\n        vector<int> v(1000, r);\n        for (int x : v) sum += x;\n    }\n    auto t1 = chrono::steady_clock::now();\n    auto ms = chrono::duration_cast<chrono::milliseconds>(t1 - t0).count();\n    cout << (sum > 0) << ' ' << (ms >= 0) << '\\n';\n    return 0;\n}",
  "output":"1 1","tip":"微基准容易被优化器删掉；确保结果被使用，并开启与生产一致的优化选项。","lang":"cpp"}
},
{
 "ch":"16","title":"shared_mutex、读写锁与读者写者问题","level":"hard","minutes":65,
 "lead":"读多写少的场景可以让多个读者并行，写者独占。`shared_mutex` 提供共享/独占两把锁，但要小心写者饥饿和锁升级死锁。",
 "points":["shared_lock 与 unique_lock","读者并行","写者饥饿","锁升级的危险","读写锁的适用边界"],
 "demo":{"h":"多个读者共享，写者独占","p":"`shared_lock` 允许多个读者同时进入；`unique_lock` 排斥所有读者和其他写者。",
  "code":"#include <iostream>\n#include <mutex>\n#include <shared_mutex>\nusing namespace std;\n\nshared_mutex rw;\nint value = 0;\n\nint read() { shared_lock<shared_mutex> lock(rw); return value; }\nvoid write(int v) { unique_lock<shared_mutex> lock(rw); value = v; }\n\nint main() {\n    write(7);\n    cout << read() << '\\n';\n    return 0;\n}",
  "output":"7","tip":"不要在持共享锁时尝试升级为独占锁；两个线程同时升级会互相等待。","lang":"cpp"}
},
{
 "ch":"16","title":"线程安全队列、关闭协议与背压","level":"hard","minutes":70,
 "lead":"生产者消费者不只是“加锁 + 条件变量”，还要定义关闭：什么时候停止入队、什么时候唤醒所有等待者、队列排空后消费者如何退出。",
 "points":["有界队列","条件变量等待谓词","关闭与唤醒","背压","退出时的排空"],
 "demo":{"h":"关闭标志让消费者退出等待","p":"`close()` 设置 `closed` 并 `notify_all()`；消费者在谓词里同时检查“有数据或已关闭”。",
 "code":"#include <condition_variable>\n#include <iostream>\n#include <mutex>\n#include <queue>\nusing namespace std;\n\nstruct Queue {\n    mutex m;\n    condition_variable cv;\n    queue<int> q;\n    bool closed = false;\n    void push(int x) { lock_guard<mutex> lk(m); q.push(x); cv.notify_one(); }\n    void close() { lock_guard<mutex> lk(m); closed = true; cv.notify_all(); }\n    bool pop(int& out) {\n        unique_lock<mutex> lk(m);\n        cv.wait(lk, [&] { return !q.empty() || closed; });\n        if (q.empty()) return false;\n        out = q.front(); q.pop(); return true;\n    }\n};\n\nint main() {\n    Queue qu; qu.push(5); int x = 0; qu.pop(x); qu.close();\n    cout << x << '\\n';\n    return 0;\n}",
  "output":"5","tip":"条件变量的谓词必须覆盖所有唤醒原因；只判断 `!q.empty()` 会在关闭时永远等下去。","lang":"cpp"}
},
{
 "ch":"17","title":"acquire/release 与 happens-before","level":"hard","minutes":70,
 "lead":"内存序不是“加个 atomic 就完事”。`acquire` 与 `release` 建立同步关系：release 之前的写，对成功 acquire 同一原子的线程可见。",
 "points":["happens-before","release/acquire 配对","relaxed 的边界","seq_cst 的代价","用原子发布数据"],
 "demo":{"h":"release 写、acquire 读，发布普通数据","p":"`data` 是普通 int，`ready` 是原子标志；写线程先写 data 再 release 置位，读线程 acquire 后读 data。",
  "code":"#include <atomic>\n#include <iostream>\n#include <thread>\nusing namespace std;\n\natomic<bool> ready{false};\nint payload = 0;\n\nint main() {\n    thread writer([] { payload = 42; ready.store(true, memory_order_release); });\n    thread reader([] { while (!ready.load(memory_order_acquire)) {}\n        cout << payload << '\\n'; });\n    writer.join();\n    reader.join();\n    return 0;\n}",
  "output":"42","tip":"`relaxed` 不建立 happens-before；用它做标志位会让 `data` 的读取看到未定义的值。","lang":"cpp"}
},
{
 "ch":"17","title":"原子计数器、标志位与 ABA 风险","level":"hard","minutes":65,
 "lead":"原子计数器适合统计，原子标志适合一次性发布；但“读-改-写”复合操作需要 CAS 循环，还要面对 ABA：值绕一圈回来，CAS 以为没人改过。",
 "points":["fetch_add 与 relaxed","compare_exchange","CAS 循环","ABA 问题","带版本号的原子"],
 "demo":{"h":"CAS 循环实现原子倍增","p":"`compare_exchange_weak` 失败时会把 expected 更新为当前值；循环重试直到成功。",
  "code":"#include <atomic>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    atomic<int> x{3};\n    int expected = 3;\n    while (!x.compare_exchange_weak(expected, 6)) {}\n    cout << x.load() << '\\n';\n    return 0;\n}",
  "output":"6","tip":"CAS 循环里不要做重活；失败重试的成本可能比锁更高。","lang":"cpp"}
},
{
 "ch":"18","title":"CMake targets、依赖管理与包管理","level":"medium","minutes":65,
 "lead":"现代 CMake 的核心是 target：每个库/可执行文件都是一个 target，依赖通过 `target_link_libraries` 传播。把 include 目录和编译选项挂在 target 上，比全局变量可靠。",
 "points":["target 与属性","PUBLIC/PRIVATE/INTERFACE","find_package 与 FetchContent","安装与导出","依赖版本锁定"],
 "demo":{"h":"一个库 target 的公开接口","p":"`mylib` 的 include 目录是 PUBLIC，链接者自动获得；实现细节放 PRIVATE，不泄漏。",
  "code":"# CMakeLists.txt\ncmake_minimum_required(VERSION 3.20)\nproject(demo LANGUAGES CXX)\nadd_library(mylib src/mylib.cpp)\ntarget_include_directories(mylib PUBLIC include)\ntarget_compile_features(mylib PUBLIC cxx_std_20)\nadd_executable(app src/main.cpp)\ntarget_link_libraries(app PRIVATE mylib)",
  "output":"app -> mylib","tip":"不要用 `include_directories` 全局污染；把目录和宏挂在 target 上，依赖关系才会随 target 传播。","lang":"cmake"}
},
{
 "ch":"18","title":"单元测试、回归测试与测试替身","level":"medium","minutes":60,
 "lead":"测试不是“跑一遍看看”，而是把可验证的行为固定下来。单元测试隔离依赖，回归测试锁住已修复的 bug，测试替身让外部系统不进入测试。",
 "points":["断言与测试用例","fixture 与参数化","回归测试","fake/stub/mock","覆盖率的意义"],
 "demo":{"h":"一个最小断言与回归用例","p":"`check` 在失败时打印表达式；回归用例固定“空输入返回 0”这个曾经出错的行为。",
  "code":"#include <iostream>\nusing namespace std;\n\nint sum(const int* a, int n) {\n    int total = 0;\n    for (int i = 0; i < n; ++i) total += a[i];\n    return total;\n}\n\nvoid check(bool ok, const char* name) {\n    cout << (ok ? \"PASS \" : \"FAIL \") << name << '\\n';\n}\n\nint main() {\n    int a[]{1, 2, 3};\n    check(sum(a, 3) == 6, \"sum\");\n    check(sum(nullptr, 0) == 0, \"empty\");\n    return 0;\n}",
  "output":"PASS sum\nPASS empty","tip":"回归测试要能在修复前失败、修复后通过；只写“现在能过”的测试无法防止回归。","lang":"cpp"}
},
{
 "ch":"18","title":"发布、ABI 与版本兼容","level":"hard","minutes":65,
 "lead":"库发布不只是“编译成功”：ABI 决定已编译的调用方能否继续链接，版本号决定升级是否安全。头文件布局、内联、虚表顺序和 STL 类型跨边界都可能破坏 ABI。",
 "points":["ABI 与 API 的区别","版本号与兼容策略","PIMPL 隐藏布局","符号可见性","跨编译器/标准库边界"],
 "demo":{"h":"PIMPL 把实现布局移出头文件","p":"公开类只保留 `Impl*`，成员变化不再改变对象大小；析构必须在 .cpp 里定义，因为那里才看得到完整类型。",
  "code":"// widget.h\n#pragma once\n#include <memory>\nstruct Widget {\n    Widget();\n    ~Widget();\n    int value() const;\nprivate:\n    struct Impl;\n    std::unique_ptr<Impl> impl;\n};\n\n// widget.cpp\n// Impl 的完整定义只出现在这里",
  "output":"ABI 稳定","tip":"PIMPL 的析构不能内联在头文件；否则调用方编译时看不到 `Impl` 的完整定义，`unique_ptr` 析构会失败。","lang":"cpp"}
},
]
