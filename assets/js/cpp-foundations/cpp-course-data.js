/* C++ 五篇 18 章 36 课：按 8 本书主题重写，正文内联，不依赖额外 JSON。 */
window.CPP_COURSE_PARTS = [
  {
    "title": "语言底座",
    "note": "编译链接、类型、控制流、指针与内存模型"
  },
  {
    "title": "对象与泛型",
    "note": "类与 RAII、拷贝移动、继承多态、模板与 concepts"
  },
  {
    "title": "STL 与现代 C++",
    "note": "容器算法、字符串流、智能指针、lambda 与 ranges"
  },
  {
    "title": "C++20 与性能",
    "note": "三路比较、modules、协程、异常安全、编译期计算"
  },
  {
    "title": "并发与工程",
    "note": "线程同步、原子与内存序、CMake、测试与项目"
  }
];

window.CPP_COURSE_CHAPTERS = [
  {
    "id": "cpp-ch01",
    "part": 1,
    "number": "01",
    "title": "从源文件到可运行程序",
    "summary": "先把「写下的代码怎样变成可执行文件」走通：预处理、编译、汇编、链接四步，声明与定义的分工，以及怎样读第一条编译器错误。",
    "goals": [
      "说清预处理/编译/汇编/链接四步",
      "分清声明、定义与头文件的职责",
      "能读 g++/clang++ 的常见错误",
      "会用 -g 与调试器定位第一个 bug"
    ],
    "source": "A Tour of C++ 3E §1.2；C++ Primer Plus 6E 第 1–2 章；Beginning C++17 第 1 章",
    "lessons": [
      {
        "id": "cpp-1-1",
        "title": "1.1 编译、链接与工具链",
        "level": "basic",
        "minutes": 45,
        "lead": "C++ 不是「保存文件就运行」的语言。一个可执行文件通常由多个翻译单元链接而成；理解这条链路，后面的头文件、ODR、链接错误才有落脚点。",
        "source": "A Tour of C++ 3E §1.2（Programs）；C++ Primer Plus 6E 第 1–2 章；Beginning C++17 第 1 章",
        "points": [
          "翻译单元与目标文件",
          "预处理、编译、汇编、链接",
          "g++ -std=c++20 -Wall -Wextra",
          "头文件声明与源文件定义",
          "链接错误的典型形态"
        ],
        "sections": [
          {
            "h": "四个阶段：从 .cpp 到可执行文件",
            "p": "预处理把 `#include`、宏和条件编译展开；编译把每个翻译单元变成汇编/目标文件；汇编器产出机器码目标文件；链接器把多个目标文件和库拼成一个可执行文件。`g++ hello.cpp -o hello` 一条命令背后其实跑了四步。**编译单元彼此独立**，这也是为什么一个 .cpp 看不到另一个 .cpp 里的名字，除非有声明。",
            "code": "# 只预处理，观察 include 展开后有多大\ng++ -std=c++20 -E hello.cpp | wc -l\n# 编译到目标文件（不链接）\ng++ -std=c++20 -c hello.cpp -o hello.o\n# 链接成可执行文件\ng++ -std=c++20 hello.o -o hello\n./hello",
            "output": "hello.o\nHello, C++20",
            "tip": "`-c` 只编译不链接；出现 `undefined reference` 时，先问「这个符号在哪个目标文件里定义」，而不是继续改头文件。",
            "lang": "bash"
          },
          {
            "h": "声明、定义与头文件",
            "p": "头文件放**声明**（函数原型、类定义、模板、inline 函数），源文件放**定义**（函数体、全局对象）。头文件被多个翻译单元包含时，用 include guard 或 `#pragma once` 防止同一翻译单元重复展开；但 guard 不能阻止多个 .cpp 各自定义同一个非 inline 函数，那会触发 ODR 违规和链接期重复符号。",
            "code": "// math_utils.h\n#pragma once\nint add(int a, int b);          // 声明\ninline int square(int x) {      // inline 定义可放头文件\n    return x * x;\n}\n\n// math_utils.cpp\n#include \"math_utils.h\"\nint add(int a, int b) { return a + b; }\n\n// main.cpp\n#include <iostream>\n#include \"math_utils.h\"\nint main() { std::cout << add(2, 3) << \" \" << square(4) << \"\\n\"; }",
            "output": "5 16",
            "tip": "把普通函数体写进头文件、又被两个 .cpp 包含，是「multiple definition」最常见的原因。要么移到 .cpp，要么加 `inline`。",
            "lang": "cpp"
          },
          {
            "h": "读第一条编译器错误",
            "p": "编译器错误要**从第一条开始读**，后面的错误经常是第一条的连锁反应。先看文件名:行号、再看「expected / was」这类对照，最后看模板实例化栈。模板报错很长时，先找 `required from` 的最后一层，再回到自己的调用点。",
            "code": "#include <iostream>\nint main() {\n    int x = 42\n    std::cout << x << \"\\n\";\n}",
            "output": "main.cpp:3:14: error: expected ';' before 'std::cout'\n    3 |     int x = 42\n      |              ^\n      |              ;",
            "tip": "错误行号有时指向「发现错误的位置」而不是「真正漏分号的位置」。看 caret 指向的前一行，往往才是要改的地方。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-1-2",
        "title": "1.2 第一个程序：输入、输出与调试",
        "level": "basic",
        "minutes": 50,
        "lead": "把 `main`、`cin/cout`、返回码和调试器连起来：能读输入、能看到中间值、能用退出码判断程序是否成功。",
        "source": "Beginning C++17 第 1–2 章；C++ Primer Plus 6E 第 2–3 章",
        "points": [
          "main 的两种标准签名",
          "cin/cout 与类型化输入",
          "cerr 与退出码",
          "gdb/lldb 的最小用法",
          "assert 与运行时检查"
        ],
        "sections": [
          {
            "h": "main、cin 与 cout 的最小闭环",
            "p": "`main` 返回 `int`，0 表示成功，非 0 表示失败。`std::cin >>` 按空白分隔读取并做类型转换；读取失败时流进入 fail 状态。竞赛/判题程序通常只读标准输入、只写标准输出，不要把提示语混进 stdout，否则逐行比对会失败。",
            "code": "#include <iostream>\nint main() {\n    int a{}, b{};\n    if (!(std::cin >> a >> b)) {\n        std::cerr << \"需要两个整数\\n\";\n        return 1;\n    }\n    std::cout << a + b << '\\n';\n    return 0;\n}",
            "output": "输入：2 3\n输出：5\n退出码：0",
            "tip": "`cin >>` 不会读取整行；要保留空格用 `std::getline`。不要把 `cin` 和 `getline` 混用后忘记吃掉换行符。",
            "lang": "cpp"
          },
          {
            "h": "调试器：先看值，再猜原因",
            "p": "用 `-g -O0` 编译保留调试信息，然后 `gdb ./a.out` 或 `lldb ./a.out`。最小命令：`break main`、`run`、`next`、`step`、`print x`、`backtrace`。调试的核心不是「让程序跑起来」，而是**在错误发生前把中间状态固定住**。",
            "code": "g++ -std=c++20 -g -O0 bug.cpp -o bug\ngdb ./bug\n(gdb) break main\n(gdb) run\n(gdb) next\n(gdb) print x\n(gdb) backtrace",
            "output": "Breakpoint 1 at 0x...: file bug.cpp, line 4.\n(gdb) print x\n$1 = 0",
            "tip": "开了 `-O2` 后变量可能被优化掉，`print x` 显示 optimized out；调试语义问题时先用 `-O0`。",
            "lang": "bash"
          },
          {
            "h": "stderr、退出码与 assert",
            "p": "`std::cerr` 写标准错误，不进入 stdout 的逐行比对；`return 1` 或 `std::exit(1)` 把失败传给 shell。`assert(expr)` 在 `<cassert>` 中，NDEBUG 下会被裁掉，适合开发期检查前置条件；生产代码应返回错误或抛异常，而不是依赖 assert。",
            "code": "#include <cassert>\n#include <iostream>\nint divide(int a, int b) {\n    assert(b != 0 && \"divide by zero\");\n    return a / b;\n}\nint main() {\n    std::cout << divide(10, 2) << '\\n';\n    std::cerr << \"debug: done\\n\";\n}",
            "output": "5\ndebug: done",
            "tip": "`assert` 不是用户输入校验：`NDEBUG` 构建会把它删掉。对外部输入要用 `if` + 错误返回/异常。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch02",
    "part": 1,
    "number": "02",
    "title": "类型、表达式与值类别",
    "summary": "把 C++ 的值系统打牢：基本类型与初始化、算术转换、const、引用、左值/右值与 auto 推导。很多「看起来对但结果错」的 bug 都出在这一层。",
    "goals": [
      "理解整型宽度、溢出与无符号陷阱",
      "会用花括号初始化并识别窄化",
      "分清左值、右值、引用与 const",
      "能用 auto/decltype 正确推导类型"
    ],
    "source": "A Tour of C++ 3E §1.4–1.6；C++ Primer Plus 6E 第 3–4 章；Effective Modern C++ Item 1–6；C++ PL 4E 第 6 章",
    "lessons": [
      {
        "id": "cpp-2-1",
        "title": "2.1 基本类型、初始化与算术转换",
        "level": "basic",
        "minutes": 50,
        "lead": "先搞清楚一个值在内存里占多少、能表示多大、参与运算时被提升成什么类型；再看花括号初始化如何把窄化转换变成编译错误。",
        "source": "C++ Primer Plus 6E 第 3–4 章；Beginning C++17 第 2 章；A Tour of C++ 3E §1.4",
        "points": [
          "整型宽度与取值范围",
          "有符号/无符号混合运算",
          "花括号初始化与窄化",
          "算术转换与溢出的可观察行为"
        ],
        "sections": [
          {
            "h": "宽度、范围与溢出",
            "p": "C++ 只保证相对宽度：`char <= short <= int <= long <= long long`。`int` 通常是 32 位，`long long` 至少 64 位。有符号整数溢出是**未定义行为**，不要依赖「溢出回绕」；无符号整数按模 2^N 回绕是定义好的，但把负数转成无符号常常制造隐蔽 bug。",
            "code": "#include <iostream>\n#include <limits>\nint main() {\n    int max = std::numeric_limits<int>::max();\n    std::cout << max << '\\n';\n    unsigned u = 0;\n    u = u - 1;                       // 回绕到 UINT_MAX\n    std::cout << u << '\\n';\n    std::cout << (max + 1) << '\\n';  // 有符号溢出：UB，不要在生产代码里做\n}",
            "output": "2147483647\n4294967295\n-2147483648（仅观察，属于 UB）",
            "tip": "`for (unsigned i = n; i >= 0; --i)` 永远为真：i 到 0 再减就回绕。倒序循环用 `for (int i = n - 1; i >= 0; --i)`。",
            "lang": "cpp"
          },
          {
            "h": "花括号初始化：把窄化变成错误",
            "p": "`int x = 3.9;` 会静默截断；`int x{3.9};` 在 C++11 起是**窄化转换**，编译器应报错。花括号还能避免「最令人头疼的解析」（most vexing parse）：`Widget w();` 是函数声明，`Widget w{};` 才是对象。",
            "code": "#include <iostream>\ndouble pi = 3.14159;\n// int bad = pi;      // 编译通过，值被截断\n// int bad2{pi};      // 编译错误：窄化\nint ok{static_cast<int>(pi)};\nstd::cout << ok << '\\n';",
            "output": "3",
            "tip": "花括号不是万能：`std::vector<int> v{3, 5};` 是「两个元素」，`v(3, 5)` 是「3 个元素，值为 5」。容器初始化要特别小心。",
            "lang": "cpp"
          },
          {
            "h": "算术转换与常见隐式转换",
            "p": "二元运算先做整型提升，再找公共类型：`int + unsigned` 往往把 int 转成 unsigned；`char + int` 提升为 int。函数重载、三元表达式和模板推导也会发生转换。解决问题的最短路径是**显式写出目标类型**，而不是背转换表。",
            "code": "#include <iostream>\nint main() {\n    int a = -1;\n    unsigned b = 1;\n    std::cout << (a < b ? \"a < b\" : \"a >= b\") << '\\n'; // -1 被转成 unsigned\n    std::cout << static_cast<long long>(a) + b << '\\n';\n}",
            "output": "a >= b\n0",
            "tip": "有符号与无符号比较时，先转成更宽的有符号类型，或直接避免混用。`-Wsign-compare` 能帮你抓这一类问题。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-2-2",
        "title": "2.2 const、引用、值类别与 auto",
        "level": "intermediate",
        "minutes": 55,
        "lead": "这一课把「名字绑定到什么」讲透：引用是别名不是对象，const 是接口承诺，左值/右值决定谁能被移动，auto 会按模板规则丢掉引用和顶层 const。",
        "source": "Effective Modern C++ Item 1–6；A Tour of C++ 3E §1.5–1.7；C++ PL 4E 第 7 章",
        "points": [
          "引用与指针的语义差异",
          "const 引用与临时对象生命周期",
          "左值/右值与 std::move",
          "auto 推导的三条规则",
          "decltype 与 decltype(auto)"
        ],
        "sections": [
          {
            "h": "引用是别名，不是可空指针",
            "p": "引用必须在定义时绑定，之后一直指同一个对象；没有「空引用」，也不能重新绑定。函数参数用 `const T&` 可以避免拷贝并承诺不修改；用 `T&` 表示要写回。指针可以为空、可以改指向，适合「可能没有」和数据结构。",
            "code": "#include <iostream>\nvoid add_one(int& x) { ++x; }\nvoid print(const int& x) { std::cout << x << '\\n'; }\nint main() {\n    int a = 41;\n    add_one(a);\n    print(a);\n    const int& r = 7;   // 绑定到临时对象，生命周期被延长\n    print(r);\n}",
            "output": "42\n7",
            "tip": "不要返回局部变量的引用或指针；`const T&` 延长的是**绑定到临时对象**的寿命，不延长已经销毁的局部对象。",
            "lang": "cpp"
          },
          {
            "h": "左值、右值与移动",
            "p": "左值有名字、可取地址；右值是临时值或即将销毁的对象。`std::move(x)` 不移动任何东西，它只是把 `x` 转成右值引用，让移动构造/赋值有机会接管资源。被移动后的对象仍然有效，但状态未指定；不要继续读它的值。",
            "code": "#include <iostream>\n#include <string>\n#include <utility>\nint main() {\n    std::string a = \"hello\";\n    std::string b = std::move(a);\n    std::cout << b << '\\n';\n    std::cout << a.size() << '\\n'; // 有效但内容未指定\n}",
            "output": "hello\n0（常见实现；标准只保证有效，不保证为空）",
            "tip": "`return std::move(local);` 通常会阻止返回值优化（NRVO），是反模式。直接 `return local;` 让编译器决定。",
            "lang": "cpp"
          },
          {
            "h": "auto 的三条推导规则",
            "p": "`auto` 按模板参数推导：① 丢掉引用；② 丢掉顶层 const；③ 数组/函数退化为指针。想要引用要写 `auto&`，想要只读引用写 `const auto&`。`decltype(expr)` 保留引用与 const；`decltype(auto)` 按表达式的值类别推导。",
            "code": "#include <iostream>\nint main() {\n    const int ci = 10;\n    auto a = ci;          // int，顶层 const 被丢掉\n    a = 11;\n    auto& r = ci;         // const int&\n    // r = 12;           // 错误：只读\n    decltype(ci) b = 20;  // const int\n    std::cout << a << ' ' << r << ' ' << b << '\\n';\n}",
            "output": "11 10 20",
            "tip": "`auto` 不会推导出引用；范围 for 里 `for (auto x : v)` 会拷贝每个元素，想改要 `auto&`，只读要 `const auto&`。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch03",
    "part": 1,
    "number": "03",
    "title": "控制流、函数与作用域",
    "summary": "控制流本身不难，难的是函数边界、重载决议、对象生命周期和链接性。把「谁在什么时候存在、哪个名字可见」搞清楚，后面写类和模板才不塌。",
    "goals": [
      "会用 range-for、switch 初始化与结构化绑定",
      "理解重载、默认参数与 inline",
      "分清自动/静态/线程局部生命周期",
      "理解命名空间、匿名命名空间与 ODR"
    ],
    "source": "A Tour of C++ 3E §1.3、§1.5；C++ Primer Plus 6E 第 5–8 章；Beginning C++17 第 3–6 章；C++ PL 4E 第 8、12、14–15 章",
    "lessons": [
      {
        "id": "cpp-3-1",
        "title": "3.1 控制流与函数",
        "level": "basic",
        "minutes": 50,
        "lead": "从 range-for、switch 初始化讲到函数重载与 `[[nodiscard]]`；目标是写出边界清楚、返回值不被忽略的函数。",
        "source": "C++ Primer Plus 6E 第 5–8 章；Beginning C++17 第 3–6 章；A Tour of C++ 3E §1.3",
        "points": [
          "range-for 与引用",
          "switch 初始化与 fallthrough",
          "重载决议与默认参数",
          "[[nodiscard]] 与返回值"
        ],
        "sections": [
          {
            "h": "range-for：什么时候拷贝，什么时候引用",
            "p": "`for (auto x : v)` 每个元素拷贝一份；`for (auto& x : v)` 绑定引用，可修改；`for (const auto& x : v)` 只读且不拷贝。对 `std::vector<std::string>` 这类元素，漏掉 `&` 会带来明显拷贝开销。",
            "code": "#include <iostream>\n#include <string>\n#include <vector>\nint main() {\n    std::vector<std::string> names{\"Ada\", \"Bjarne\", \"Herb\"};\n    for (const auto& name : names) std::cout << name.size() << ' ';\n    for (auto& name : names) name += \"!\";\n    std::cout << '\\n' << names[0] << '\\n';\n}",
            "output": "3 6 4\nAda!",
            "tip": "range-for 遍历时不要修改容器大小（push_back/erase）；迭代器/引用可能失效。需要增删时用索引或显式迭代器并重新获取。",
            "lang": "cpp"
          },
          {
            "h": "switch：初始化、fallthrough 与 [[fallthrough]]",
            "p": "C++ 允许在 `case` 里定义变量，但跨 case 的初始化会跳过构造，编译器会报错；把变量放进块 `{}` 里最稳。没有 `break` 会继续执行下一个 case；故意穿透时写 `[[fallthrough]]`，让读代码的人知道这不是漏写。",
            "code": "#include <iostream>\nint classify(int x) {\n    switch (x) {\n        case 0: return 0;\n        case 1:\n        case 2: return 1;\n        default: {\n            int rest = x - 2;\n            return rest > 0 ? 2 : -1;\n        }\n    }\n}\nint main() { std::cout << classify(3) << '\\n'; }",
            "output": "2",
            "tip": "`switch` 的 case 标签必须是整型常量表达式；字符串用 `if/else` 或哈希/映射，不能直接 `case \"abc\"`。",
            "lang": "cpp"
          },
          {
            "h": "重载、默认参数与 [[nodiscard]]",
            "p": "重载按参数类型/个数选函数，**不按返回类型**；默认参数从右往左连续给，且不要在头文件和定义里重复写。`[[nodiscard]]` 让「忽略返回值」产生警告，适合纯函数、错误码、资源查询。",
            "code": "#include <iostream>\n[[nodiscard]] int checked_read(int x) { return x * 2; }\nint area(int w, int h = 1) { return w * h; }\nint main() {\n    std::cout << area(3) << ' ' << area(3, 2) << '\\n';\n    // checked_read(3); // 警告：返回值被忽略\n}",
            "output": "3 6",
            "tip": "默认参数不要依赖会变化的全局状态；它是在调用点补上的，不是运行时动态决定。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-3-2",
        "title": "3.2 作用域、生命周期、命名空间与链接性",
        "level": "intermediate",
        "minutes": 55,
        "lead": "这一课解决「名字从哪来、对象活多久、符号能不能跨文件看见」。很多链接错误和静态初始化顺序问题都在这里。",
        "source": "C++ PL 4E 第 14–15 章；A Tour of C++ 3E §3.2；Beginning C++17 第 6 章",
        "points": [
          "块作用域与名字隐藏",
          "static/thread_local 生命周期",
          "命名空间与匿名命名空间",
          "inline 变量与 ODR",
          "静态初始化顺序"
        ],
        "sections": [
          {
            "h": "块作用域、隐藏与生命周期",
            "p": "名字从内层向外层查找；内层同名会**隐藏**外层，而不是覆盖。自动变量在离开块时逆序销毁；`static` 局部变量只初始化一次、活到程序结束；`thread_local` 每个线程一份。",
            "code": "#include <iostream>\nint next_id() {\n    static int id = 0;   // 只初始化一次\n    return ++id;\n}\nint main() {\n    std::cout << next_id() << ' ' << next_id() << '\\n';\n    int x = 1;\n    { int x = 2; std::cout << x << '\\n'; }\n    std::cout << x << '\\n';\n}",
            "output": "1 2\n2\n1",
            "tip": "`static` 局部变量不是线程安全的；多线程计数要加锁或用 `std::atomic`。",
            "lang": "cpp"
          },
          {
            "h": "命名空间与匿名命名空间",
            "p": "命名空间把名字分组，避免全局污染；`using namespace std;` 在头文件里会污染所有包含者，禁止。匿名命名空间给当前翻译单元内部链接，替代 C 风格的 `static` 全局函数；C++17 还可以用 `inline constexpr` 变量在头文件里安全定义。",
            "code": "#include <iostream>\nnamespace app {\nnamespace {\nint helper() { return 7; }   // 仅本翻译单元可见\n}\nint run() { return helper(); }\n}\nint main() { std::cout << app::run() << '\\n'; }",
            "output": "7",
            "tip": "匿名命名空间不是「完全私有」：同一翻译单元内仍可见。跨翻译单元要放 .cpp 或加 `static`/匿名命名空间。",
            "lang": "cpp"
          },
          {
            "h": "ODR、inline 变量与静态初始化顺序",
            "p": "ODR（单一定义规则）要求：一个非 inline 函数/对象在整个程序中只能定义一次；类、模板、inline 函数可以在多个翻译单元中定义，但每个定义必须完全一致。C++17 的 `inline constexpr` 变量可以放头文件。不同翻译单元的全局对象初始化顺序未指定，跨文件依赖要改成函数内静态或显式初始化。",
            "code": "// config.h\n#pragma once\ninline constexpr int kMaxRetry = 3;   // C++17：多个 TU 共享同一实体\n\n// a.cpp\n#include \"config.h\"\nint a_value = kMaxRetry;\n\n// b.cpp\n#include \"config.h\"\nint b_value = kMaxRetry;",
            "output": "编译/链接通过；两个 TU 看到同一个 kMaxRetry",
            "tip": "不要写 `extern int x = 3;` 这种「声明带初始化」的写法；它在 C++ 里是定义，容易造成重复符号。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch04",
    "part": 1,
    "number": "04",
    "title": "指针、数组与内存模型",
    "summary": "指针不是「难学的语法」，而是地址、类型和生命周期三件事。把数组退化、C 字符串、span、new/delete 和未定义行为拆开讲。",
    "goals": [
      "理解指针算术与 one-past-end",
      "分清数组与指针退化",
      "会用 std::span 传递连续区间",
      "识别悬垂指针、双重释放与 UB"
    ],
    "source": "A Tour of C++ 3E §1.7；C++ Primer Plus 6E 第 4、9 章；Beginning C++17 第 7–8 章；C++20 Guide 第 9 章（span）",
    "lessons": [
      {
        "id": "cpp-4-1",
        "title": "4.1 指针、数组、C 字符串与 span",
        "level": "basic",
        "minutes": 55,
        "lead": "指针算术的单位是「元素」不是字节；数组在大多数表达式里退化成首元素指针；C 字符串靠结尾的 `\\0`。C++20 的 span 把「指针 + 长度」绑成一个安全视图。",
        "source": "C++ Primer Plus 6E 第 4、9 章；Beginning C++17 第 7 章；C++20 Guide 第 9 章",
        "points": [
          "指针算术与 one-past-end",
          "数组退化与 sizeof 陷阱",
          "C 字符串与 strlen",
          "std::span 的边界",
          "空指针与悬垂指针"
        ],
        "sections": [
          {
            "h": "指针算术：单位是元素",
            "p": "`p + 1` 前进一个 `sizeof(*p)` 字节；两个同数组指针相减得到元素个数。允许指向数组最后一个元素的下一个位置（one-past-end），但**不能解引用**它。越界指针算术本身也可能 UB。",
            "code": "#include <iostream>\nint main() {\n    int a[4]{10, 20, 30, 40};\n    int* p = a;\n    std::cout << *(p + 2) << '\\n';\n    std::cout << (a + 4) - a << '\\n'; // one-past-end，可比较\n    // std::cout << *a[4];            // 错误：不能解引用 one-past-end\n}",
            "output": "30\n4",
            "tip": "`p + n` 只在 `[a, a + size]` 范围内有定义；越界后再解引用是 UB，不是「多读一点」。",
            "lang": "cpp"
          },
          {
            "h": "数组退化与 sizeof 陷阱",
            "p": "数组传给函数会退化成指向首元素的指针，函数里的 `sizeof(arr)` 是指针大小，不是数组大小。保留长度要额外传 `n`，或用 `std::array`/`std::span`。`sizeof` 只在数组仍然完整时才算整个数组。",
            "code": "#include <iostream>\nvoid print_bad(int a[]) { std::cout << sizeof(a) << '\\n'; } // 指针大小\nint main() {\n    int a[10]{};\n    std::cout << sizeof(a) << '\\n';  // 40（假设 int 4 字节）\n    print_bad(a);\n}",
            "output": "40\n8（64 位平台）",
            "tip": "函数参数写 `int a[10]` 不会保留长度，它等价于 `int*`。要长度就显式传，或用 `std::span`。",
            "lang": "cpp"
          },
          {
            "h": "std::span：指针 + 长度",
            "p": "`std::span<T>` 是非拥有视图，构造时绑定一段连续内存和长度；支持 `size()`、`operator[]`、`subspan()`、range-for。它不延长底层数组寿命，所以不能返回指向局部数组的 span。",
            "code": "#include <iostream>\n#include <span>\nvoid print(std::span<const int> s) {\n    for (int x : s) std::cout << x << ' ';\n    std::cout << \"size=\" << s.size() << '\\n';\n}\nint main() {\n    int a[5]{1, 2, 3, 4, 5};\n    print(a);\n    print(std::span{a}.subspan(1, 3));\n}",
            "output": "1 2 3 4 5 size=5\n2 3 4 size=3",
            "tip": "span 不拥有数据；`return std::span{local_array};` 会留下悬垂视图。span 也不能替代所有容器，插入/删除仍要用 vector 等拥有型容器。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-4-2",
        "title": "4.2 动态内存、对象生命周期与未定义行为",
        "level": "intermediate",
        "minutes": 60,
        "lead": "`new/delete` 能让你手动控制生命周期，也能让 bug 变得极难复现。先理解悬垂、双重释放和 UB，再用 RAII/智能指针替代裸指针。",
        "source": "C++ Primer Plus 6E 第 4、9、12 章；Beginning C++17 第 8 章；Effective Modern C++ Item 18–21",
        "points": [
          "new/delete 与 new[]/delete[]",
          "悬垂指针与双重释放",
          "栈/堆/静态存储区",
          "未定义行为的可观察性",
          "用 RAII 替代裸指针"
        ],
        "sections": [
          {
            "h": "new/delete 的配对规则",
            "p": "`new T` 配 `delete`；`new T[n]` 配 `delete[]`。配对错误是 UB，可能只释放第一个元素或破坏堆。现代 C++ 优先用 `std::make_unique` / `std::vector`，让析构自动发生。",
            "code": "#include <iostream>\nint main() {\n    int* p = new int(42);\n    std::cout << *p << '\\n';\n    delete p;\n    int* arr = new int[3]{1, 2, 3};\n    std::cout << arr[2] << '\\n';\n    delete[] arr;\n}",
            "output": "42\n3",
            "tip": "`new int[3]` 用 `delete` 是 UB；`new int` 用 `delete[]` 也是 UB。用容器/智能指针可以直接消掉这类错误。",
            "lang": "cpp"
          },
          {
            "h": "悬垂、双重释放与 use-after-free",
            "p": "`delete p` 之后指针仍保存旧地址，继续解引用是 use-after-free；再次 `delete p` 是 double free。删除后立刻置空只能防「再次 delete」，不能防其他别名继续访问。真正可靠的做法是**单一所有权**：unique_ptr 或容器。",
            "code": "#include <iostream>\nint main() {\n    int* p = new int(7);\n    int* alias = p;\n    delete p;\n    // std::cout << *alias; // use-after-free：UB\n    p = nullptr;            // 防再次 delete，但 alias 仍悬垂\n}",
            "output": "（无输出；打开注释会触发 UB，可能崩溃或打印随机值）",
            "tip": "「删除后置空」不是完整修复。只要还有别名，就要重新设计所有权，而不是继续加 if。",
            "lang": "cpp"
          },
          {
            "h": "栈、堆、静态区与 UB 的边界",
            "p": "局部对象在栈上，离开作用域自动销毁；`new` 的对象在堆上，必须显式释放；全局/静态对象活到程序结束。UB 不保证崩溃：越界、未初始化读、空指针解引用都可能「看起来正常」。用 `-fsanitize=address,undefined` 把隐藏问题暴露出来。",
            "code": "g++ -std=c++20 -g -fsanitize=address,undefined uaf.cpp -o uaf\n./uaf",
            "output": "==ERROR: AddressSanitizer: heap-use-after-free ...\nSUMMARY: AddressSanitizer: heap-use-after-free",
            "tip": "「在我机器上能跑」不是正确性证据。CI 里至少跑一次 ASan/UBSan；发布构建再开优化。",
            "lang": "bash"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch05",
    "part": 2,
    "number": "05",
    "title": "类、构造/析构与 RAII",
    "summary": "类的价值不是「把函数放进结构体」，而是建立不变式并让资源跟着对象生命周期自动释放。先把构造、析构、拷贝、移动四个特殊成员讲清。",
    "goals": [
      "用构造器建立并维持类不变式",
      "理解初始化列表与成员初始化顺序",
      "用析构函数实现 RAII",
      "掌握 Rule of Zero/Five"
    ],
    "source": "A Tour of C++ 3E §5–6；C++ Primer Plus 6E 第 10–12 章；Effective Modern C++ Item 17、21；C++ PL 4E 第 16–17 章",
    "lessons": [
      {
        "id": "cpp-5-1",
        "title": "5.1 类、访问控制、构造器与不变式",
        "level": "basic",
        "minutes": 55,
        "lead": "从 `struct` 到 `class`，重点不是 public/private 的位置，而是「对象一出生就必须满足什么条件」。构造器是唯一能拒绝非法状态的地方。",
        "source": "C++ Primer Plus 6E 第 10–11 章；Beginning C++17 第 12–13 章；A Tour of C++ 3E §5.2",
        "points": [
          "class 与 struct 的唯一差别",
          "构造器与初始化列表",
          "成员初始化顺序",
          "const 成员与不变式",
          "explicit 与隐式转换"
        ],
        "sections": [
          {
            "h": "class/struct 与访问控制",
            "p": "`class` 默认 private，`struct` 默认 public；这是两者唯一的语言差别。访问控制是**编译期接口**，不是安全边界。好的类把数据设为 private，把「能做什么」写成公开成员函数，避免外部绕过不变式。",
            "code": "#include <iostream>\nclass Temperature {\npublic:\n    explicit Temperature(double celsius) : value_(celsius) {}\n    double celsius() const { return value_; }\nprivate:\n    double value_;\n};\nint main() {\n    Temperature t{36.5};\n    std::cout << t.celsius() << '\\n';\n}",
            "output": "36.5",
            "tip": "`explicit` 阻止 `Temperature t = 36.5;` 这种隐式转换；单参数构造器默认考虑加 explicit，除非你确实需要隐式转换。",
            "lang": "cpp"
          },
          {
            "h": "初始化列表与成员初始化顺序",
            "p": "成员按**声明顺序**初始化，不按初始化列表书写顺序；引用、const 成员和没有默认构造器的成员必须在初始化列表里初始化。构造函数体开始时，所有成员已经构造完毕，所以「先默认构造再赋值」会多一次操作。",
            "code": "#include <iostream>\nclass Pair {\npublic:\n    Pair(int a, int b) : second_(b), first_(a) {} // 仍按 first_ 再 second_ 初始化\n    void print() const { std::cout << first_ << ' ' << second_ << '\\n'; }\nprivate:\n    int first_;\n    int second_;\n};\nint main() { Pair{1, 2}.print(); }",
            "output": "1 2",
            "tip": "如果初始化列表顺序和声明顺序不一致，开 `-Wreorder` 会警告；把声明顺序和初始化顺序对齐，别让读者猜。",
            "lang": "cpp"
          },
          {
            "h": "不变式、const 成员与 explicit",
            "p": "不变式是「任何公开操作后都必须为真」的条件，例如「余额不为负」「日期月份在 1–12」。构造器应验证入参，失败时抛异常或返回错误，不要留下半成品对象。`const` 成员函数承诺不修改可观察状态；`mutable` 只用于缓存/锁等逻辑上不影响不变式的成员。",
            "code": "#include <stdexcept>\nclass Date {\npublic:\n    Date(int y, int m, int d) : y_(y), m_(m), d_(d) {\n        if (m < 1 || m > 12) throw std::invalid_argument(\"month\");\n        if (d < 1 || d > 31) throw std::invalid_argument(\"day\");\n    }\n    int month() const noexcept { return m_; }\nprivate:\n    int y_, m_, d_;\n};",
            "output": "Date{2026, 13, 1} 抛出 std::invalid_argument(\"month\")",
            "tip": "构造器抛异常时，已经构造完成的成员会按逆序析构，但对象本身不算构造成功；析构函数不会为这个半成品调用。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-5-2",
        "title": "5.2 析构、RAII 与 Rule of Zero/Five",
        "level": "intermediate",
        "minutes": 60,
        "lead": "RAII 是 C++ 资源管理的核心：资源在构造时获取、在析构时释放。理解特殊成员函数，才能判断什么时候该写、什么时候该删。",
        "source": "A Tour of C++ 3E §6.2–6.3；Effective Modern C++ Item 17、21；C++ PL 4E 第 17 章",
        "points": [
          "析构函数与 RAII",
          "拷贝构造/拷贝赋值",
          "移动构造/移动赋值",
          "Rule of Three/Five/Zero",
          "delete 与 default"
        ],
        "sections": [
          {
            "h": "RAII：让析构函数收尾",
            "p": "RAII（Resource Acquisition Is Initialization）把资源所有权交给对象：文件、锁、堆内存、socket 都在构造时获取，在析构时释放。这样即使中途 `return` 或抛异常，栈展开也会调用析构函数。",
            "code": "#include <iostream>\n#include <stdexcept>\nclass Buffer {\npublic:\n    explicit Buffer(int n) : data_(new int[n]), n_(n) {}\n    ~Buffer() { delete[] data_; }\n    Buffer(const Buffer&) = delete;\n    Buffer& operator=(const Buffer&) = delete;\nprivate:\n    int* data_;\n    int n_;\n};\nint main() {\n    try { Buffer b{10}; throw std::runtime_error(\"boom\"); }\n    catch (const std::exception& e) { std::cout << e.what() << '\\n'; }\n}",
            "output": "boom",
            "tip": "析构函数里不要抛异常；如果必须释放可能失败，自己吞掉并记录，或用 `noexcept` 明确承诺。",
            "lang": "cpp"
          },
          {
            "h": "拷贝与移动：谁拥有资源",
            "p": "默认拷贝是逐成员拷贝：指针成员只复制地址，导致两个对象析构同一块内存（双重释放）。有资源的类必须定义拷贝构造/拷贝赋值（深拷贝）或删除拷贝、只允许移动。移动构造接管资源并把源对象置为可析构状态。",
            "code": "#include <iostream>\n#include <utility>\nclass Owned {\npublic:\n    explicit Owned(int v) : p_(new int(v)) {}\n    ~Owned() { delete p_; }\n    Owned(const Owned& other) : p_(new int(*other.p_)) {}\n    Owned& operator=(const Owned& other) {\n        if (this != &other) { int* fresh = new int(*other.p_); delete p_; p_ = fresh; }\n        return *this;\n    }\n    Owned(Owned&& other) noexcept : p_(std::exchange(other.p_, nullptr)) {}\n    int value() const { return *p_; }\nprivate:\n    int* p_;\n};\nint main() { Owned a{5}; Owned b = std::move(a); std::cout << b.value() << '\\n'; }",
            "output": "5",
            "tip": "拷贝赋值要处理自赋值并保证强异常安全：先构造新资源，再释放旧资源；不要先 delete 再 new，否则 new 失败会留下悬垂指针。",
            "lang": "cpp"
          },
          {
            "h": "Rule of Zero / Five 与 = default/delete",
            "p": "Rule of Zero：能用 `std::vector`、`std::string`、`unique_ptr` 等拥有型成员时，就不要手写析构/拷贝/移动，让编译器生成正确的特殊成员。Rule of Five：如果必须手写其中一个（析构、拷贝构造、拷贝赋值、移动构造、移动赋值），通常五个都要考虑。`= default` 显式要默认版本，`= delete` 明确禁止。",
            "code": "#include <string>\n#include <vector>\nclass Document {\npublic:\n    Document(std::string title) : title_(std::move(title)) {}\n    void add(std::string line) { lines_.push_back(std::move(line)); }\nprivate:\n    std::string title_;\n    std::vector<std::string> lines_;\n}; // Rule of Zero：无需手写析构/拷贝/移动",
            "output": "Document 可拷贝、可移动，资源由 string/vector 自动管理",
            "tip": "写了析构函数会抑制隐式移动构造；如果还想要移动，必须显式 `= default` 或自己实现。很多人被这一点坑到性能退化。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch06",
    "part": 2,
    "number": "06",
    "title": "拷贝、移动与运算符",
    "summary": "这一章把「对象怎样复制、怎样转移资源、怎样像内建类型一样参与运算」讲透。重点是五法则、noexcept、复制消除和比较运算符。",
    "goals": [
      "正确实现深拷贝与移动语义",
      "理解 noexcept 对容器行为的影响",
      "掌握三路比较与默认比较",
      "避免隐式转换与运算符滥用"
    ],
    "source": "A Tour of C++ 3E §6.1–6.5；Effective Modern C++ Item 23–30；C++20 Guide 第 1 章（<=>）；C++ PL 4E 第 18–19 章",
    "lessons": [
      {
        "id": "cpp-6-1",
        "title": "6.1 拷贝构造、赋值与移动语义",
        "level": "intermediate",
        "minutes": 60,
        "lead": "移动不是「更快的内存拷贝」，而是资源所有权的转移。要让移动真正生效，必须让编译器知道源对象可以被拿走，并保证移动后对象仍可析构。",
        "source": "Effective Modern C++ Item 23–30；A Tour of C++ 3E §6.2；C++ PL 4E 第 17 章",
        "points": [
          "拷贝构造与拷贝赋值",
          "移动构造与移动赋值",
          "noexcept 与 vector 扩容",
          "复制消除与 RVO",
          "std::move 的边界"
        ],
        "sections": [
          {
            "h": "深拷贝：每个对象一份资源",
            "p": "拷贝构造从零构造一个新对象；拷贝赋值要处理已有资源、自赋值和异常安全。对 `std::vector`、`std::string` 这类已经管理资源的成员，默认拷贝就是深拷贝；对裸指针成员才需要自己写。",
            "code": "#include <iostream>\n#include <string>\nstruct Person {\n    std::string name;\n    int age{};\n};\nint main() {\n    Person a{\"Ada\", 36};\n    Person b = a;        // 深拷贝：string 自己管理缓冲区\n    b.name += \" Lovelace\";\n    std::cout << a.name << \" / \" << b.name << '\\n';\n}",
            "output": "Ada / Ada Lovelace",
            "tip": "默认拷贝赋值是逐成员赋值；如果成员里有裸指针，默认版本只复制地址。看到裸指针就要问「谁负责 delete」。",
            "lang": "cpp"
          },
          {
            "h": "移动构造：接管资源并让源可析构",
            "p": "移动构造的参数是 `T&&`，通常用 `std::exchange`/`std::move` 把源成员的资源拿过来，并把源置空。移动后对象仍然有效，但值未指定；只能析构或重新赋值，不要继续读业务值。",
            "code": "#include <iostream>\n#include <utility>\n#include <vector>\nint main() {\n    std::vector<int> a{1, 2, 3};\n    std::vector<int> b = std::move(a);\n    std::cout << b.size() << '\\n';\n    a.push_back(9);          // 有效：可以重新使用\n    std::cout << a.size() << '\\n';\n}",
            "output": "3\n1",
            "tip": "`std::move` 只做类型转换，不保证移动发生；如果类型没有移动构造，它会退回拷贝。移动后不要假设源一定为空。",
            "lang": "cpp"
          },
          {
            "h": "noexcept、复制消除与返回值",
            "p": "`std::vector` 扩容时要在「强异常保证」和「移动」之间选择：如果移动构造不是 `noexcept`，它可能宁愿拷贝。移动构造/移动赋值应尽可能标 `noexcept`。返回值直接 `return local;` 可以触发 NRVO/RVO；`return std::move(local);` 反而可能阻止优化。",
            "code": "#include <string>\n#include <utility>\nclass Widget {\npublic:\n    Widget() = default;\n    Widget(Widget&& other) noexcept : name_(std::move(other.name_)) {}\n    Widget& operator=(Widget&& other) noexcept {\n        name_ = std::move(other.name_);\n        return *this;\n    }\nprivate:\n    std::string name_;\n};\nWidget make() { Widget w; return w; } // NRVO 优先，不要写 std::move(w)",
            "output": "无运行时输出；vector<Widget> 扩容时会优先使用 noexcept 移动",
            "tip": "`noexcept` 是承诺，不是优化提示；如果函数真可能抛异常却标了 noexcept，会直接 `std::terminate`。只给确实不抛的移动操作加。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-6-2",
        "title": "6.2 运算符重载、比较与字面量",
        "level": "intermediate",
        "minutes": 55,
        "lead": "运算符重载的目标是让自定义类型拥有和内建类型一致的语法，而不是炫技。优先成员运算符、对称运算符用非成员，比较用 C++20 的 `<=>`。",
        "source": "A Tour of C++ 3E §6.4–6.6；C++20 Guide 第 1 章；C++ PL 4E 第 18–19 章",
        "points": [
          "成员 vs 非成员运算符",
          "算术与复合赋值",
          "== 与 <=>",
          "流输出 operator<<",
          "用户定义字面量"
        ],
        "sections": [
          {
            "h": "成员还是非成员：看左操作数",
            "p": "`a + b` 若 a 是自定义类型，成员 operator+ 可以；若希望 `2 + vec` 也工作，左操作数是 int，必须用非成员。`+=` 修改自身，通常成员；`+` 生成新值，通常非成员并复用 `+=`。",
            "code": "#include <iostream>\nclass Vec2 {\npublic:\n    Vec2(int x, int y) : x_(x), y_(y) {}\n    Vec2& operator+=(const Vec2& rhs) { x_ += rhs.x_; y_ += rhs.y_; return *this; }\n    int x() const { return x_; }\n    int y() const { return y_; }\nprivate:\n    int x_, y_;\n};\nVec2 operator+(Vec2 lhs, const Vec2& rhs) { return lhs += rhs; }\nint main() { auto v = Vec2{1,2} + Vec2{3,4}; std::cout << v.x() << ',' << v.y() << '\\n'; }",
            "output": "4,6",
            "tip": "`operator+` 按值接收左操作数，天然获得一个可修改的副本；这比在函数里手动拷贝更简洁，也能配合移动。",
            "lang": "cpp"
          },
          {
            "h": "== 与 <=>：让比较一次成型",
            "p": "C++20 的 `operator<=>` 返回 `std::strong_ordering`/`weak_ordering`/`partial_ordering`；声明 `= default` 会按成员字典序生成。默认 `<=>` 也会合成 `==`（但反之不成立）。容器/排序只需要严格弱序，不要写「近似相等」的比较器。",
            "code": "#include <compare>\n#include <iostream>\nstruct Version {\n    int major, minor;\n    auto operator<=>(const Version&) const = default;\n};\nint main() {\n    Version a{1, 2}, b{1, 3};\n    std::cout << (a < b) << ' ' << (a == b) << '\\n';\n}",
            "output": "1 0",
            "tip": "`<=>` 默认按成员顺序比较；如果业务顺序不是声明顺序，必须手写或改用 tuple/比较键，不能指望默认版本。",
            "lang": "cpp"
          },
          {
            "h": "流输出与用户定义字面量",
            "p": "`operator<<` 必须是非成员（左操作数是 `std::ostream`），返回 `std::ostream&` 以支持链式调用。用户定义字面量（UDL）把单位写进类型，例如 `100_km`；后缀以下划线开头，避免和标准库冲突。",
            "code": "#include <iostream>\nstruct Km { long double value; };\nKm operator\"\"_km(long double v) { return {v}; }\nstd::ostream& operator<<(std::ostream& os, Km k) { return os << k.value << \" km\"; }\nint main() { std::cout << 1.5_km << '\\n'; }",
            "output": "1.5 km",
            "tip": "UDL 后缀必须以下划线开头；`1.5_km` 里的字面量运算符要放在可见命名空间，否则 ADL 找不到。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch07",
    "part": 2,
    "number": "07",
    "title": "继承、多态与类层次",
    "summary": "继承不是「代码复用的默认方案」。先分清 is-a 与 has-a，再理解虚函数表、动态绑定、对象切片和虚析构。",
    "goals": [
      "理解 public 继承与动态绑定",
      "正确使用 override/final",
      "识别对象切片",
      "为多态基类写虚析构"
    ],
    "source": "A Tour of C++ 3E §5.3–5.5；C++ Primer Plus 6E 第 13–14 章；Beginning C++17 第 16 章；C++ PL 4E 第 20–22 章",
    "lessons": [
      {
        "id": "cpp-7-1",
        "title": "7.1 继承、虚函数与动态绑定",
        "level": "intermediate",
        "minutes": 60,
        "lead": "`virtual` 让调用在运行时按动态类型分派；`override` 让编译器检查你确实重写了基类函数。没有虚函数就没有运行时多态。",
        "source": "C++ Primer Plus 6E 第 13 章；Beginning C++17 第 16 章；A Tour of C++ 3E §5.3–5.4",
        "points": [
          "public 继承的 is-a 语义",
          "虚函数与 vtable",
          "override/final",
          "基类引用/指针的动态绑定",
          "名字隐藏 vs 重写"
        ],
        "sections": [
          {
            "h": "public 继承表达 is-a",
            "p": "`Derived : public Base` 表示 Derived 是 Base 的一种；基类引用/指针可以绑定派生对象，调用虚函数时按动态类型分派。private/protected 继承不是 is-a，通常表示实现细节，优先用组合。",
            "code": "#include <iostream>\nstruct Shape {\n    virtual ~Shape() = default;\n    virtual double area() const = 0;\n};\nstruct Square : Shape {\n    explicit Square(double s) : side(s) {}\n    double area() const override { return side * side; }\n    double side;\n};\nint main() {\n    Square sq{3};\n    const Shape& s = sq;\n    std::cout << s.area() << '\\n';\n}",
            "output": "9",
            "tip": "不要为了「能访问 protected」而继承；组合 + 明确接口通常更清晰，也更少受基类变化影响。",
            "lang": "cpp"
          },
          {
            "h": "虚函数表与动态绑定",
            "p": "含虚函数的类通常有一个指向虚函数表的指针（vptr）；每个对象多一个指针大小的开销，调用虚函数多一次间接跳转。不要用「vtable 一定在对象开头」之类实现细节做业务假设。动态绑定只在通过基类引用/指针调用虚函数时发生；直接对对象调用会静态绑定。",
            "code": "#include <iostream>\nstruct Base { virtual void f() const { std::cout << \"Base\\n\"; } };\nstruct Derived : Base { void f() const override { std::cout << \"Derived\\n\"; } };\nint main() {\n    Derived d;\n    d.f();              // 静态绑定：Derived\n    const Base& b = d;\n    b.f();              // 动态绑定：Derived\n}",
            "output": "Derived\nDerived",
            "tip": "构造函数/析构函数里调用虚函数不会分派到派生类：构造派生类时基类部分先构造，虚表还指向基类。",
            "lang": "cpp"
          },
          {
            "h": "override、final 与名字隐藏",
            "p": "派生类定义同名但签名不同的函数会**隐藏**基类重载，而不是重写；用 `using Base::f;` 把基类重载引入。`override` 让签名不匹配变成编译错误；`final` 禁止进一步重写或继承。",
            "code": "#include <iostream>\nstruct Base {\n    virtual void f(int) const { std::cout << \"int\\n\"; }\n    virtual void f(double) const { std::cout << \"double\\n\"; }\n};\nstruct Derived : Base {\n    using Base::f;\n    void f(int) const override { std::cout << \"derived int\\n\"; }\n};\nint main() { Derived d; d.f(1); d.f(1.5); }",
            "output": "derived int\ndouble",
            "tip": "没有 `override` 时，签名差一个 const 就不会重写，而是新函数；这类 bug 很隐蔽，所有重写都写 override。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-7-2",
        "title": "7.2 抽象类、对象切片与虚析构",
        "level": "intermediate",
        "minutes": 55,
        "lead": "多态基类必须几乎总是有虚析构，否则 `delete base_ptr` 只销毁基类部分。对象切片是「按值传递多态对象」的隐形灾难。",
        "source": "Effective Modern C++ Item 11；A Tour of C++ 3E §5.4–5.5；C++ PL 4E 第 21 章",
        "points": [
          "纯虚函数与抽象类",
          "对象切片",
          "虚析构的必要性",
          "unique_ptr 管理多态对象",
          "接口设计"
        ],
        "sections": [
          {
            "h": "纯虚函数与抽象类",
            "p": "`virtual ... = 0` 是纯虚函数，含纯虚函数的类是抽象类，不能直接实例化；它可以有构造/析构函数和具体成员函数。接口类通常还声明虚析构，保证通过基类指针删除安全。",
            "code": "#include <iostream>\nstruct Logger {\n    virtual ~Logger() = default;\n    virtual void log(const char* msg) = 0;\n};\nstruct ConsoleLogger : Logger {\n    void log(const char* msg) override { std::cout << msg << '\\n'; }\n};\nint main() { ConsoleLogger l; l.log(\"ready\"); }",
            "output": "ready",
            "tip": "纯虚函数也可以有定义（在类外），但很少用；不要为了「必须实现」而把所有函数都设纯虚，接口要小而明确。",
            "lang": "cpp"
          },
          {
            "h": "对象切片：按值传递会切掉派生部分",
            "p": "把派生对象按值赋给基类对象，只复制基类子对象，派生成员和动态类型都丢失；传参 `void f(Base b)` 同理。多态对象要通过引用/指针传递，或使用 `std::unique_ptr<Base>`。",
            "code": "#include <iostream>\nstruct Base { virtual void who() const { std::cout << \"Base\\n\"; } };\nstruct Derived : Base { void who() const override { std::cout << \"Derived\\n\"; } };\nvoid by_value(Base b) { b.who(); }\nvoid by_ref(const Base& b) { b.who(); }\nint main() { Derived d; by_value(d); by_ref(d); }",
            "output": "Base\nDerived",
            "tip": "容器也不能按值存多态对象：`std::vector<Base>` 会切片。要存多态对象用 `std::vector<std::unique_ptr<Base>>`。",
            "lang": "cpp"
          },
          {
            "h": "虚析构与 unique_ptr",
            "p": "通过基类指针 `delete` 派生对象时，如果基类析构不是 virtual，行为未定义（通常只调用基类析构，派生资源泄漏）。多态基类要把析构声明为 `virtual`（或 protected 非虚，禁止 delete）。用 `unique_ptr<Base>` 管理时，删除器仍会调用正确的析构。",
            "code": "#include <iostream>\n#include <memory>\nstruct Base { virtual ~Base() { std::cout << \"~Base\\n\"; } };\nstruct Derived : Base { ~Derived() override { std::cout << \"~Derived\\n\"; } };\nint main() {\n    std::unique_ptr<Base> p = std::make_unique<Derived>();\n} // 先 ~Derived 再 ~Base",
            "output": "~Derived\n~Base",
            "tip": "`shared_ptr<Base>` 用 `make_shared<Derived>` 创建时，控制块记住正确删除器，即使 Base 析构非虚也能正确删除；但这是特例，不要依赖它，基类仍应虚析构。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch08",
    "part": 2,
    "number": "08",
    "title": "模板与概念",
    "summary": "模板不是「把类型当参数」这么简单：它按需实例化、参与重载决议，还会产生很长的错误信息。C++20 的 concepts 把约束写在签名上。",
    "goals": [
      "写函数模板与类模板",
      "理解模板参数推导与显式实参",
      "用 concepts/requires 约束模板",
      "了解 SFINAE 与 type traits 的旧方案"
    ],
    "source": "A Tour of C++ 3E §7–8；C++20 Guide 第 3–5 章；C++ PL 4E 第 23–28 章；Effective Modern C++ Item 1–4",
    "lessons": [
      {
        "id": "cpp-8-1",
        "title": "8.1 函数模板、类模板与类型推导",
        "level": "intermediate",
        "minutes": 60,
        "lead": "模板让同一段代码适配多种类型，但每个实例化都是一份独立代码。先掌握推导规则，再理解为什么模板定义通常要放头文件。",
        "source": "A Tour of C++ 3E §7.1–7.3；C++ PL 4E 第 23 章；Effective Modern C++ Item 1–4",
        "points": [
          "函数模板与推导",
          "显式模板实参",
          "类模板与成员模板",
          "模板定义放头文件",
          "特化与偏特化"
        ],
        "sections": [
          {
            "h": "函数模板：推导与显式指定",
            "p": "调用 `max(a, b)` 时编译器从实参推导 T；如果两个实参类型不同，推导会冲突，需要显式 `max<double>(a, b)` 或转换。返回类型可以用 `auto`/`decltype(auto)`，但要注意引用被保留的问题。",
            "code": "#include <iostream>\n#include <string>\ntemplate<class T>\nT max_of(T a, T b) { return a < b ? b : a; }\nint main() {\n    std::cout << max_of(3, 7) << '\\n';\n    std::cout << max_of<std::string>(\"abc\", \"xyz\") << '\\n';\n}",
            "output": "7\nxyz",
            "tip": "`max_of(3, 7.5)` 会推导冲突；可以写 `max_of<double>(3, 7.5)`。不要让模板参数在返回类型里单独出现而无法推导。",
            "lang": "cpp"
          },
          {
            "h": "类模板与成员模板",
            "p": "类模板的每个成员函数只有在被使用时才实例化；这允许「部分成员不适用于某些 T」。类模板定义通常放头文件，因为编译器需要在调用点看到完整定义才能实例化。",
            "code": "#include <iostream>\n#include <vector>\ntemplate<class T>\nclass Box {\npublic:\n    void put(const T& value) { value_ = value; }\n    const T& get() const { return value_; }\nprivate:\n    T value_{};\n};\nint main() {\n    Box<int> b;\n    b.put(42);\n    std::cout << b.get() << '\\n';\n}",
            "output": "42",
            "tip": "类模板的静态成员每个实例化各有一份；不要把「所有 T 共享一个计数器」写进普通 static 成员。",
            "lang": "cpp"
          },
          {
            "h": "特化、偏特化与 if constexpr",
            "p": "全特化 `template<> class Box<bool>` 为特定类型提供实现；偏特化只能用于类模板，不能用于函数模板（函数模板用重载）。C++17 的 `if constexpr` 在编译期丢弃分支，常用来替代复杂的标签分派。",
            "code": "#include <iostream>\n#include <type_traits>\ntemplate<class T>\nvoid print(T v) {\n    if constexpr (std::is_pointer_v<T>) std::cout << \"ptr \" << *v << '\\n';\n    else std::cout << \"value \" << v << '\\n';\n}\nint main() { int x = 5; print(x); print(&x); }",
            "output": "value 5\nptr 5",
            "tip": "`if constexpr` 的条件必须是编译期常量；丢弃的分支仍要语法正确，但不要求对当前 T 可实例化。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-8-2",
        "title": "8.2 concepts、requires 与 SFINAE",
        "level": "hard",
        "minutes": 65,
        "lead": "C++20 concepts 把「模板对 T 有什么要求」写成可读的约束，错误信息从「一页模板栈」变成「不满足 concept」。这一课也补一段 SFINAE 的历史，方便读旧代码。",
        "source": "C++20 Guide 第 3–5 章；A Tour of C++ 3E §8；C++ PL 4E 第 28 章",
        "points": [
          "concept 定义与 requires",
          "标准 concepts",
          "约束重载",
          "requires 表达式",
          "SFINAE 与 type traits"
        ],
        "sections": [
          {
            "h": "定义 concept：把要求写在签名上",
            "p": "`concept Name = requires(T t) { ... };` 定义一个编译期布尔约束；`template<Name T>` 把约束放在模板参数上。requires 表达式检查表达式是否合法，不检查语义；语义约束要靠命名和文档。",
            "code": "#include <iostream>\n#include <concepts>\ntemplate<class T>\nconcept Addable = requires(T a, T b) { { a + b } -> std::convertible_to<T>; };\ntemplate<Addable T>\nT twice(T x) { return x + x; }\nint main() { std::cout << twice(21) << '\\n'; }",
            "output": "42",
            "tip": "concept 只检查「能编译」；`Addable` 不保证加法有结合律或交换律。语义要求要写进文档和测试。",
            "lang": "cpp"
          },
          {
            "h": "标准 concepts 与约束重载",
            "p": "`std::integral`、`std::floating_point`、`std::same_as`、`std::convertible_to`、`std::sortable` 等标准 concepts 可直接组合。约束越具体，重载优先级越高；不要让两个约束部分重叠却无法排序，否则调用会歧义。",
            "code": "#include <iostream>\n#include <concepts>\nvoid show(std::integral auto x) { std::cout << \"int \" << x << '\\n'; }\nvoid show(std::floating_point auto x) { std::cout << \"float \" << x << '\\n'; }\nint main() { show(3); show(3.5); }",
            "output": "int 3\nfloat 3.5",
            "tip": "`std::integral auto` 是缩写函数模板；它和普通重载一样参与决议。不要用 concept 替代运行期校验，类型正确不代表值合法。",
            "lang": "cpp"
          },
          {
            "h": "requires 表达式与 SFINAE 旧方案",
            "p": "requires 表达式可以检查成员、类型名、表达式返回类型和嵌套要求。C++17 之前用 `std::enable_if` + `std::void_t` 做 SFINAE：替换失败不是错误，用来从重载集中移除不匹配的模板。读旧代码时看到 `enable_if_t<...>` 就是在做约束。",
            "code": "#include <iostream>\n#include <type_traits>\n\ntemplate<class T, std::enable_if_t<std::is_integral_v<T>, int> = 0>\nT old_twice(T x) { return x + x; }\n\ntemplate<class T>\nconcept Integral = std::is_integral_v<T>;\ntemplate<Integral T>\nT new_twice(T x) { return x + x; }\n\nint main() { std::cout << old_twice(5) << ' ' << new_twice(6) << '\\n'; }",
            "output": "10 12",
            "tip": "SFINAE 只在**直接上下文**的替换失败中生效；函数体里的错误是硬错误。concepts 的错误信息更清楚，新代码优先用 concepts。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch09",
    "part": 3,
    "number": "09",
    "title": "容器、迭代器与算法",
    "summary": "STL 的核心不是「背容器」，而是选择所有权、复杂度和迭代器稳定性。vector 的扩容、map 的排序、unordered_map 的哈希质量都会直接改变程序行为。",
    "goals": [
      "按访问/插入/排序需求选容器",
      "理解 vector 扩容与迭代器失效",
      "区分 map 与 unordered_map",
      "会用标准算法和自定义比较器"
    ],
    "source": "A Tour of C++ 3E §12–13；C++ Primer Plus 6E 第 16–17 章；Effective Modern C++ Item 21；C++ PL 4E 第 30–33 章",
    "lessons": [
      {
        "id": "cpp-9-1",
        "title": "9.1 vector、string、deque 与迭代器失效",
        "level": "intermediate",
        "minutes": 60,
        "lead": "`vector` 是默认容器：连续内存、随机访问、尾部增删快；但扩容会让所有指针/引用/迭代器失效。先把容量、size、reserve 和失效规则讲清。",
        "source": "A Tour of C++ 3E §12.1–12.3；C++ Primer Plus 6E 第 16 章；C++ PL 4E 第 31 章",
        "points": [
          "vector 的 size/capacity",
          "reserve 与扩容策略",
          "迭代器/引用失效",
          "deque 与 list 的取舍",
          "string 的 SSO 与 c_str"
        ],
        "sections": [
          {
            "h": "size、capacity 与 reserve",
            "p": "`size()` 是元素个数，`capacity()` 是不重新分配时最多能放多少。`reserve(n)` 预分配至少 n 的容量，避免多次扩容；`resize(n)` 改变元素个数并值初始化新元素。扩容通常按倍数增长，但具体策略不是标准保证。",
            "code": "#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> v;\n    v.reserve(10);\n    std::cout << v.size() << ' ' << v.capacity() << '\\n';\n    for (int i = 0; i < 5; ++i) v.push_back(i);\n    std::cout << v.size() << ' ' << v.capacity() << '\\n';\n}",
            "output": "0 10\n5 10",
            "tip": "`reserve` 不改变 size；`resize` 会真的构造/销毁元素。对含资源的类型，resize 的成本和异常行为要单独考虑。",
            "lang": "cpp"
          },
          {
            "h": "迭代器、指针与引用失效",
            "p": "vector 扩容后所有元素搬到新缓冲区，之前的迭代器、指针、引用全部失效；`erase` 会让被删位置之后的迭代器失效。`push_back` 也可能触发扩容。规则：**修改容器结构后，重新获取迭代器**。",
            "code": "#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    int& ref = v[0];\n    v.push_back(4);          // 可能扩容\n    // std::cout << ref;     // 若扩容，ref 悬垂：UB\n    v.reserve(100);\n    int& safe = v[0];\n    v.push_back(5);          // 不再扩容\n    std::cout << safe << '\\n';\n}",
            "output": "1",
            "tip": "范围 for 里 `push_back` 是典型 UB：循环用的迭代器在扩容后失效。需要边遍历边插入时，先用索引或先 reserve 到确定上限。",
            "lang": "cpp"
          },
          {
            "h": "deque、list 与 string 的取舍",
            "p": "`deque` 支持两端 O(1) 插入，随机访问略慢于 vector；`list` 是双向链表，插入/删除 O(1) 但遍历缓存不友好，现代 C++ 很少默认选它。`std::string` 可能带小字符串优化（SSO），`c_str()` 返回的指针在字符串修改后可能失效。",
            "code": "#include <deque>\n#include <iostream>\n#include <string>\nint main() {\n    std::deque<int> d{2, 3};\n    d.push_front(1);\n    d.push_back(4);\n    for (int x : d) std::cout << x << ' ';\n    std::string s = \"hello\";\n    const char* p = s.c_str();\n    s += \" world\";\n    // std::cout << p; // 可能悬垂，不要再用\n    std::cout << '\\n' << s << '\\n';\n}",
            "output": "1 2 3 4\nhello world",
            "tip": "需要稳定地址时用 `std::deque`/`std::list` 或在 vector 上存索引；不要保存 `c_str()` 指针跨修改使用。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-9-2",
        "title": "9.2 map、unordered_map、迭代器与算法",
        "level": "intermediate",
        "minutes": 60,
        "lead": "关联容器解决「按 key 查找」。`map` 有序、O(log n)；`unordered_map` 平均 O(1) 但无序且受哈希质量影响。算法部分重点讲排序比较器和 lower_bound。",
        "source": "A Tour of C++ 3E §12.6、§13；C++ Primer Plus 6E 第 16 章；C++ PL 4E 第 31–33 章",
        "points": [
          "map vs unordered_map",
          "operator[] 的插入陷阱",
          "迭代器类别与算法",
          "sort 的严格弱序",
          "lower_bound/equal_range"
        ],
        "sections": [
          {
            "h": "map 与 unordered_map：先问要不要顺序",
            "p": "`std::map` 按 key 排序（红黑树），支持 `lower_bound`/范围查询；`std::unordered_map` 用哈希，平均 O(1)，迭代顺序不保证。自定义 key 用 map 要提供严格弱序比较器；用 unordered_map 要提供哈希和相等。",
            "code": "#include <iostream>\n#include <map>\n#include <string>\n#include <unordered_map>\nint main() {\n    std::map<std::string, int> ordered;\n    ordered[\"banana\"] = 2;\n    ordered[\"apple\"] = 1;\n    for (const auto& [k, v] : ordered) std::cout << k << ':' << v << ' ';\n    std::unordered_map<std::string, int> fast;\n    fast[\"apple\"] = 1;\n    std::cout << '\\n' << fast.at(\"apple\") << '\\n';\n}",
            "output": "apple:1 banana:2\n1",
            "tip": "`m[key]` 在 key 不存在时会**插入**默认值；只查不改用 `find`/`contains`/`at`。`at` 不存在会抛 `out_of_range`。",
            "lang": "cpp"
          },
          {
            "h": "迭代器类别与标准算法",
            "p": "输入/前向/双向/随机访问迭代器决定算法能不能用。`std::sort` 需要随机访问迭代器（vector/deque），`std::list` 用自己的 `sort()`。`std::find` 线性；有序范围用 `lower_bound` 二分。算法接收迭代器区间 `[first, last)`，不接收容器本身。",
            "code": "#include <algorithm>\n#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> v{3, 1, 4, 1, 5, 9};\n    std::sort(v.begin(), v.end());\n    auto it = std::lower_bound(v.begin(), v.end(), 4);\n    std::cout << *it << ' ' << (it - v.begin()) << '\\n';\n}",
            "output": "4 3",
            "tip": "`lower_bound` 前必须保证区间已按同一比较器有序；对无序 vector 用它是逻辑错误，不是「慢一点」。",
            "lang": "cpp"
          },
          {
            "h": "严格弱序：比较器写错的后果",
            "p": "`std::sort` 的比较器必须满足严格弱序：不可自反、传递、对称不可比一致。写 `<=` 而不是 `<` 会破坏规则，可能越界/崩溃。多键排序用 `std::tie` 或 `<=>`，不要手写一长串 if。",
            "code": "#include <algorithm>\n#include <iostream>\n#include <string>\n#include <tuple>\n#include <vector>\nstruct Student { std::string name; int score; };\nint main() {\n    std::vector<Student> s{{\"B\", 90}, {\"A\", 90}, {\"C\", 80}};\n    std::sort(s.begin(), s.end(), [](const Student& a, const Student& b) {\n        return std::tie(b.score, a.name) < std::tie(a.score, b.name); // 分数降序，姓名升序\n    });\n    for (const auto& x : s) std::cout << x.name << ':' << x.score << ' ';\n}",
            "output": "A:90 B:90 C:80",
            "tip": "比较器返回 `a.score <= b.score` 是常见错误；相等时必须返回 false。排序前先想清楚「相等元素如何定义」。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch10",
    "part": 3,
    "number": "10",
    "title": "字符串、流与文件",
    "summary": "文本处理是 C++ 最容易被低估的部分：格式化、读取整行、文件流状态、string_view 生命周期、ranges 惰性求值，每一块都有边界。",
    "goals": [
      "正确混用 cin 与 getline",
      "用文件流读写并检查状态",
      "理解 string_view 不拥有数据",
      "会用 format 与 ranges 组织文本管线"
    ],
    "source": "A Tour of C++ 3E §10–11、§14；C++ Primer Plus 6E 第 17 章；C++20 Guide 第 6–10 章；Effective Modern C++ Item 41",
    "lessons": [
      {
        "id": "cpp-10-1",
        "title": "10.1 iostream、格式化与文件流",
        "level": "basic",
        "minutes": 55,
        "lead": "先分清「读一个词」和「读一整行」，再处理文件打开失败、读到 EOF 和格式化的宽度/精度。流的状态位比 `while (!eof())` 可靠。",
        "source": "C++ Primer Plus 6E 第 17 章；A Tour of C++ 3E §11；C++20 Guide 第 10 章",
        "points": [
          "cin 与 getline 的混用",
          "流状态与 EOF",
          "ifstream/ofstream",
          "setw/setprecision",
          "格式化输出"
        ],
        "sections": [
          {
            "h": "cin >> 与 getline：换行符去哪了",
            "p": "`cin >> x` 跳过前导空白，读到非目标字符为止，把分隔符留在缓冲区；`getline(cin, line)` 读一整行并丢弃换行。混用时，`cin >> n` 后缓冲区还有换行，紧接着 `getline` 会读到空行。解决：`cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n');` 或统一用 getline 再解析。",
            "code": "#include <iostream>\n#include <limits>\n#include <string>\nint main() {\n    int n{};\n    std::cin >> n;\n    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n');\n    std::string line;\n    std::getline(std::cin, line);\n    std::cout << n << \" [\" << line << \"]\\n\";\n}",
            "output": "输入：3\nhello world\n输出：3 [hello world]",
            "tip": "不要用 `while (!cin.eof())` 控制读取：EOF 在最后一次读取后才置位，循环会多跑一次。用 `while (std::getline(cin, line))` 或 `while (cin >> x)`。",
            "lang": "cpp"
          },
          {
            "h": "文件流：打开、读取与状态检查",
            "p": "`std::ifstream in(\"file.txt\")` 打开失败时流为 false；读取前检查 `in.is_open()`/`if (!in)`。`ofstream` 默认截断文件，追加用 `std::ios::app`。文件流析构时自动关闭，但仍建议显式 `close()` 并检查。",
            "code": "#include <fstream>\n#include <iostream>\n#include <string>\nint main() {\n    std::ifstream in(\"data.txt\");\n    if (!in) { std::cerr << \"open failed\\n\"; return 1; }\n    std::string line;\n    int count = 0;\n    while (std::getline(in, line)) ++count;\n    std::cout << count << '\\n';\n}",
            "output": "data.txt 有 3 行时输出：3",
            "tip": "文本模式与二进制模式在 Windows 上会转换 CRLF；需要精确字节时用 `std::ios::binary`。路径不要拼用户输入，避免目录穿越。",
            "lang": "cpp"
          },
          {
            "h": "setw、setprecision 与格式化",
            "p": "`std::setw(n)` 只影响下一次输出，默认右对齐；`std::left`/`std::right` 控制方向；`std::setprecision` 对浮点默认是有效数字，配合 `std::fixed` 才是小数位数。C++20 的 `std::format` 用 Python 风格格式串，类型安全且不依赖流状态。",
            "code": "#include <iomanip>\n#include <iostream>\nint main() {\n    std::cout << std::setw(6) << std::left << \"id\" << std::setw(8) << \"score\" << '\\n';\n    std::cout << std::fixed << std::setprecision(2) << 3.14159 << '\\n';\n}",
            "output": "id    score\n3.14",
            "tip": "`setw` 不会截断字符串，只保证最小宽度；需要截断要自己处理。格式化金额用整数分，不要用 double 累加。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-10-2",
        "title": "10.2 string_view、format 与 ranges",
        "level": "intermediate",
        "minutes": 60,
        "lead": "`string_view` 是非拥有视图，便宜但有生命周期风险；`std::format` 把格式化从流操作里独立出来；ranges 让「过滤 → 转换 → 输出」成为一条惰性管线。",
        "source": "C++20 Guide 第 6–10 章；A Tour of C++ 3E §10、§14；Effective Modern C++ Item 41",
        "points": [
          "string_view 的生命周期",
          "string_view 与 string 的接口",
          "std::format 基本用法",
          "ranges/views 惰性求值",
          "视图不能悬垂"
        ],
        "sections": [
          {
            "h": "string_view：便宜，但不拥有字符",
            "p": "`std::string_view` 只保存指针和长度，拷贝是 O(1)；它不保证以 `\\0` 结尾，不能直接传给需要 C 字符串的 API。只要底层 string 被修改/销毁，view 就悬垂。函数参数用 `std::string_view` 可以接受 string/字面量，但**不要返回**指向局部缓冲的 view。",
            "code": "#include <iostream>\n#include <string>\n#include <string_view>\nvoid print(std::string_view sv) { std::cout << sv.size() << ':' << sv << '\\n'; }\nint main() {\n    std::string s = \"hello\";\n    print(s);\n    print(\"world\");\n    std::string_view v = s;\n    s += \"!\";              // 可能重新分配\n    // std::cout << v;    // 悬垂风险\n}",
            "output": "5:hello\n5:world",
            "tip": "`string_view` 不做空终止；`sv.data()` 不保证 `sv[sv.size()] == '\\0'`。需要 C 字符串时构造临时 `std::string`。",
            "lang": "cpp"
          },
          {
            "h": "std::format：类型安全的格式化",
            "p": "`std::format(\"{:>6}|{:.2f}\", name, value)` 返回 `std::string`；格式串在编译期检查（C++20 的 `std::format_string`），比 printf 安全。GCC 14 已支持 `<format>`；如果目标编译器没有，退回 `ostringstream` 或 `fmt` 库。",
            "code": "#include <format>\n#include <iostream>\nint main() {\n    std::cout << std::format(\"{:>6}|{:.2f}\\n\", \"pi\", 3.14159);\n    std::cout << std::format(\"{}+{}={}\\n\", 2, 3, 2 + 3);\n}",
            "output": "    pi|3.14\n2+3=5",
            "tip": "`std::format` 的格式串不能是运行期任意字符串（会失去编译期检查）；需要动态格式时用 `std::vformat`，并接受它可能抛 `format_error`。",
            "lang": "cpp"
          },
          {
            "h": "ranges：过滤、转换与惰性求值",
            "p": "`v | std::views::filter(pred) | std::views::transform(f)` 生成一个惰性视图，遍历时才计算；它不复制底层数据，因此底层容器必须活得比视图久。`std::ranges::sort(v)` 可以直接接收容器，`std::views::reverse` 反向。",
            "code": "#include <iostream>\n#include <ranges>\n#include <vector>\nint main() {\n    std::vector<int> v{1, 2, 3, 4, 5, 6};\n    auto even_squares = v | std::views::filter([](int x) { return x % 2 == 0; })\n                          | std::views::transform([](int x) { return x * x; });\n    for (int x : even_squares) std::cout << x << ' ';\n    std::cout << '\\n';\n}",
            "output": "4 16 36",
            "tip": "视图不拥有元素；把 view 存进成员/返回 view 时，要保证底层容器生命周期覆盖它。`filter` 的谓词应无副作用，否则惰性遍历次数不确定。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch11",
    "part": 3,
    "number": "11",
    "title": "智能指针与资源所有权",
    "summary": "智能指针解决的是所有权，不是「不用 delete」。unique_ptr 表达独占，shared_ptr 表达共享，weak_ptr 表达观察；选错所有权模型，泄漏和悬垂仍会发生。",
    "goals": [
      "用 unique_ptr 表达独占所有权",
      "理解 shared_ptr 控制块与引用计数",
      "用 weak_ptr 打破循环引用",
      "会用自定义删除器管理非内存资源"
    ],
    "source": "Effective Modern C++ Item 18–22；A Tour of C++ 3E §15；C++ PL 4E 第 34 章",
    "lessons": [
      {
        "id": "cpp-11-1",
        "title": "11.1 unique_ptr、shared_ptr 与 weak_ptr",
        "level": "intermediate",
        "minutes": 60,
        "lead": "先问「谁唯一拥有这个对象」：唯一就 unique_ptr，共享就 shared_ptr，只观察不拥有就 weak_ptr。裸指针只作为非拥有观察者。",
        "source": "Effective Modern C++ Item 18–22；A Tour of C++ 3E §15.2；C++ PL 4E 第 34 章",
        "points": [
          "unique_ptr 与 make_unique",
          "所有权转移",
          "shared_ptr 引用计数",
          "weak_ptr 与循环引用",
          "make_shared 的收益"
        ],
        "sections": [
          {
            "h": "unique_ptr：独占、可移动、不可拷贝",
            "p": "`std::make_unique<T>(args...)` 在堆上构造对象并返回 unique_ptr；unique_ptr 不可拷贝，只能移动，因此所有权转移在编译期可见。默认删除器用 `delete`，适合 `new` 出来的单个对象。",
            "code": "#include <iostream>\n#include <memory>\nstruct Node { int value; };\nint main() {\n    auto p = std::make_unique<Node>(Node{42});\n    auto q = std::move(p);       // 所有权转移\n    std::cout << q->value << ' ' << (p == nullptr) << '\\n';\n}",
            "output": "42 1",
            "tip": "`unique_ptr<T>` 不能直接 `delete` 后继续用；要释放所有权用 `release()`，要换对象用 `reset()`。release 后必须有人接管，否则泄漏。",
            "lang": "cpp"
          },
          {
            "h": "shared_ptr：共享所有权与引用计数",
            "p": "`shared_ptr<T>` 有一个控制块保存强/弱引用计数；最后一个 shared_ptr 销毁时删除对象。拷贝 shared_ptr 增加强计数，是线程安全的计数操作，但不是对对象的线程安全。`make_shared` 把对象和控制块一次分配，通常更省。",
            "code": "#include <iostream>\n#include <memory>\nint main() {\n    auto a = std::make_shared<int>(7);\n    std::cout << a.use_count() << '\\n'; // 1\n    { auto b = a; std::cout << a.use_count() << '\\n'; } // 2\n    std::cout << a.use_count() << '\\n'; // 1\n}",
            "output": "1\n2\n1",
            "tip": "`shared_ptr` 的引用计数原子操作有开销；不是所有共享都需要 shared_ptr。函数参数如果只是借用，用 `T&`/`T*`，不要拷贝 shared_ptr。",
            "lang": "cpp"
          },
          {
            "h": "weak_ptr：观察但不延长寿命",
            "p": "`weak_ptr` 不增加强引用计数，指向由 shared_ptr 管理的对象；用 `lock()` 提升为 shared_ptr，若对象已销毁则返回空。典型用途：打破 `parent ↔ child` 循环引用、缓存。",
            "code": "#include <iostream>\n#include <memory>\nstruct Child;\nstruct Parent { std::shared_ptr<Child> child; ~Parent(); };\nstruct Child { std::weak_ptr<Parent> parent; };\nParent::~Parent() = default;\nint main() {\n    auto p = std::make_shared<Parent>();\n    p->child = std::make_shared<Child>();\n    p->child->parent = p;\n    std::cout << p.use_count() << '\\n'; // 1，weak 不增加\n    if (auto locked = p->child->parent.lock()) std::cout << \"alive\\n\";\n}",
            "output": "1\nalive",
            "tip": "两个 shared_ptr 互相指向会形成环，引用计数永远不归零。把其中一条边改成 weak_ptr，或在析构时显式断开。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-11-2",
        "title": "11.2 自定义删除器、生命周期与异常安全",
        "level": "hard",
        "minutes": 60,
        "lead": "智能指针不只能管内存：文件、socket、锁、数据库连接都可以用 unique_ptr + 自定义删除器表达所有权。关键是让删除动作与所有权一起移动。",
        "source": "Effective Modern C++ Item 18–22；C++ PL 4E 第 34 章；A Tour of C++ 3E §15.4",
        "points": [
          "自定义删除器",
          "unique_ptr 的尺寸开销",
          "shared_ptr 的删除器",
          "异常安全与 RAII",
          "所有权设计检查表"
        ],
        "sections": [
          {
            "h": "自定义删除器：把 close 变成析构",
            "p": "`std::unique_ptr<FILE, decltype(&std::fclose)>` 把 `fclose` 作为删除器；构造时传入句柄和删除器。删除器是类型的一部分，空删除器（无状态 lambda/函数指针）通常不增加对象尺寸。",
            "code": "#include <cstdio>\n#include <iostream>\n#include <memory>\nint main() {\n    auto closer = [](FILE* f) { if (f) std::fclose(f); };\n    std::unique_ptr<FILE, decltype(closer)> file(std::fopen(\"data.txt\", \"r\"), closer);\n    if (!file) { std::cerr << \"open failed\\n\"; return 1; }\n    char buf[64]{};\n    if (std::fgets(buf, sizeof buf, file.get())) std::cout << buf;\n}",
            "output": "data.txt 第一行内容；文件在 main 结束时自动关闭",
            "tip": "删除器必须能接受 `T*` 并且不抛异常；如果 close 可能失败，记录日志而不是从析构函数抛出。",
            "lang": "cpp"
          },
          {
            "h": "unique_ptr 的尺寸与 deleter 状态",
            "p": "unique_ptr 默认尺寸等于一个指针；无状态 deleter（函数指针、空 lambda）通常仍是 1–2 个指针；有状态 deleter（捕获资源的 lambda）会把状态存进 unique_ptr，尺寸变大。shared_ptr 总是两个指针（对象指针 + 控制块指针）。",
            "code": "#include <cstdio>\n#include <iostream>\n#include <memory>\nstruct FileCloser { void operator()(FILE* f) const noexcept { if (f) std::fclose(f); } };\nint main() {\n    std::cout << sizeof(std::unique_ptr<int>) << '\\n';\n    std::cout << sizeof(std::unique_ptr<FILE, FileCloser>) << '\\n';\n    std::cout << sizeof(std::shared_ptr<int>) << '\\n';\n}",
            "output": "8\n8\n16（64 位平台的典型值）",
            "tip": "不要为了「统一」把所有资源都塞进 shared_ptr；unique_ptr 更小、所有权更清晰，能移动不能复制，适合绝大多数独占场景。",
            "lang": "cpp"
          },
          {
            "h": "异常安全与所有权检查表",
            "p": "异常安全要求：操作失败时对象仍处于有效状态，且不泄漏。RAII 让资源释放发生在栈展开；用「先构造新资源，再提交替换」实现强保证。设计所有权时问四个问题：谁创建、谁销毁、能否复制、生命周期谁保证。",
            "code": "#include <iostream>\n#include <memory>\n#include <stdexcept>\nclass Service {\npublic:\n    void connect() {\n        auto next = std::make_unique<int>(42); // 先做可能失败的事\n        conn_ = std::move(next);                // 再提交，强异常安全\n    }\n    int value() const { return conn_ ? *conn_ : -1; }\nprivate:\n    std::unique_ptr<int> conn_;\n};\nint main() {\n    Service s;\n    try { s.connect(); std::cout << s.value() << '\\n'; }\n    catch (const std::exception& e) { std::cerr << e.what() << '\\n'; }\n}",
            "output": "42",
            "tip": "异常安全不是「加个 try/catch」；要在每个可能失败的步骤后保持类不变式。析构函数默认 noexcept，资源释放失败要内部处理。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch12",
    "part": 3,
    "number": "12",
    "title": "Lambda、函数对象与 ranges",
    "summary": "lambda 是带捕获的匿名函数对象；按值/按引用捕获决定生命周期和副作用。ranges 把算法变成惰性视图，但视图不拥有数据。",
    "goals": [
      "理解 lambda 捕获与 mutable",
      "用 std::function 存储可调用对象",
      "区分函数指针、lambda 与虚函数",
      "用 ranges 组合过滤/转换管线"
    ],
    "source": "A Tour of C++ 3E §14；Effective Modern C++ Item 31–34；C++20 Guide 第 6–8 章；C++ PL 4E 第 11 章",
    "lessons": [
      {
        "id": "cpp-12-1",
        "title": "12.1 Lambda 捕获、函数对象与 std::function",
        "level": "intermediate",
        "minutes": 55,
        "lead": "lambda 的 `[]` 捕获列表决定它能看到谁、按值还是按引用。捕获引用可能悬垂；捕获值默认 const，想修改要 `mutable`。",
        "source": "Effective Modern C++ Item 31–34；A Tour of C++ 3E §14.2；C++ PL 4E 第 11 章",
        "points": [
          "捕获列表与默认捕获",
          "按值/按引用捕获的生命周期",
          "mutable lambda",
          "std::function 的类型擦除",
          "函数指针 vs lambda"
        ],
        "sections": [
          {
            "h": "捕获列表：按值还是按引用",
            "p": "`[x]` 按值复制 x，`[&x]` 绑定引用；`[=]`/`[&]` 是默认捕获，容易过宽，现代指南建议显式列出。按引用捕获的 lambda 若活过被引用对象，就是悬垂。",
            "code": "#include <functional>\n#include <iostream>\nint main() {\n    int base = 10;\n    auto by_value = [base](int x) { return base + x; };\n    auto by_ref = [&base](int x) { return base + x; };\n    base = 20;\n    std::cout << by_value(1) << ' ' << by_ref(1) << '\\n';\n}",
            "output": "11 21",
            "tip": "不要把按引用捕获的 lambda 存进异步任务/回调后直接返回；要么按值捕获，要么用 shared_ptr 管理生命周期。",
            "lang": "cpp"
          },
          {
            "h": "mutable lambda 与状态",
            "p": "lambda 的 `operator()` 默认 const；按值捕获的成员在 lambda 内不可修改。加 `mutable` 后可以修改自己的副本，但每次调用共享这个副本状态，适合计数器，不适合并发共享。",
            "code": "#include <iostream>\nint main() {\n    auto counter = [n = 0]() mutable { return ++n; };\n    std::cout << counter() << ' ' << counter() << ' ' << counter() << '\\n';\n}",
            "output": "1 2 3",
            "tip": "`mutable` 改的是 lambda 对象内部副本，不是原变量；多个线程同时调用同一个 mutable lambda 任然有数据竞争。",
            "lang": "cpp"
          },
          {
            "h": "std::function、函数指针与泛型",
            "p": "`std::function<R(Args...)>` 能存 lambda、函数指针、函数对象，代价是类型擦除和可能的堆分配；热路径优先用模板参数 `F` 或 `auto`，避免间接调用。函数指针只能指向无捕获函数，不能捕获状态。",
            "code": "#include <functional>\n#include <iostream>\nint apply(const std::function<int(int)>& f, int x) { return f(x); }\nint main() {\n    int base = 5;\n    std::cout << apply([base](int x) { return base + x; }, 3) << '\\n';\n}",
            "output": "8",
            "tip": "`std::function` 允许为空，调用空 function 会抛 `bad_function_call`；调用前检查 `if (f)`，或改用 `std::move_only_function`（C++23）。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-12-2",
        "title": "12.2 ranges、views 与惰性求值",
        "level": "hard",
        "minutes": 60,
        "lead": "ranges 把「容器 + 算法」改成「范围 + 视图」。视图是零拷贝的惰性管线，但它的生命周期依赖底层数据；过滤器还有缓存与性能陷阱。",
        "source": "C++20 Guide 第 6–8 章；A Tour of C++ 3E §14；C++ PL 4E 第 33 章",
        "points": [
          "range 与 view 的区别",
          "filter/transform/reverse",
          "惰性求值与副作用",
          "视图生命周期",
          "ranges 算法"
        ],
        "sections": [
          {
            "h": "range 与 view：拥有 vs 观察",
            "p": "range 是能提供 begin/end 的对象（容器、数组、view）；view 是轻量、非拥有、可复制的 range。`std::views::filter` 不复制元素，遍历时逐个判断；`std::views::transform` 遍历时调用函数。",
            "code": "#include <iostream>\n#include <ranges>\n#include <vector>\nint main() {\n    std::vector<int> v{1, 2, 3, 4, 5};\n    auto view = v | std::views::filter([](int x) { return x > 2; })\n                   | std::views::transform([](int x) { return x * 10; });\n    for (int x : view) std::cout << x << ' ';\n    std::cout << '\\n';\n}",
            "output": "30 40 50",
            "tip": "view 拷贝很便宜，但多个 view 共享底层数据；修改底层容器后，已保存的迭代器/view 可能失效。不要把 view 返回给调用者而底层是局部容器。",
            "lang": "cpp"
          },
          {
            "h": "惰性求值与副作用",
            "p": "惰性意味着「不遍历就不计算」；同一个 view 遍历两次，谓词/转换会执行两次。谓词里有副作用（计数、写日志、修改元素）会让结果依赖遍历次数，应该避免。需要具体结果时用 `std::ranges::to<std::vector>()`（C++23）或手动复制。",
            "code": "#include <iostream>\n#include <ranges>\n#include <vector>\nint main() {\n    std::vector<int> v{1, 2, 3};\n    int calls = 0;\n    auto view = v | std::views::transform([&calls](int x) { ++calls; return x * 2; });\n    for (int x : view) std::cout << x << ' ';\n    std::cout << \"\\ncalls=\" << calls << '\\n';\n}",
            "output": "2 4 6\ncalls=3",
            "tip": "`views::filter` 可能对同一元素多次调用谓词（实现允许缓存/不缓存），所以谓词必须是纯函数；不要在 filter 里改状态。",
            "lang": "cpp"
          },
          {
            "h": "ranges 算法与投影",
            "p": "`std::ranges::sort(v)`、`std::ranges::find(v, 3)` 直接接收 range；`std::ranges::sort(v, {}, &Person::age)` 用投影取成员排序。投影是「取哪个字段」的便捷写法，比较器仍是严格弱序。",
            "code": "#include <algorithm>\n#include <iostream>\n#include <ranges>\n#include <string>\n#include <vector>\nstruct Person { std::string name; int age; };\nint main() {\n    std::vector<Person> ps{{\"Ada\", 36}, {\"Bjarne\", 72}, {\"Herb\", 68}};\n    std::ranges::sort(ps, {}, &Person::age);\n    for (const auto& p : ps) std::cout << p.name << ':' << p.age << ' ';\n}",
            "output": "Ada:36 Herb:68 Bjarne:72",
            "tip": "投影 `&Person::age` 只适用于成员；复杂排序键用 lambda 返回 tuple。ranges 算法仍要求严格弱序，投影不改变这一点。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch13",
    "part": 4,
    "number": "13",
    "title": "C++20 核心特性",
    "summary": "C++20 不是「加几个语法糖」：`<=>` 重写比较、concepts 约束模板、modules 改变接口边界、coroutines 改变异步控制流、span/format 改变参数与文本。",
    "goals": [
      "用 <=> 和 = default 生成比较",
      "用 concepts 约束接口",
      "了解 modules 的编译模型",
      "能用最小协程/生成器",
      "知道 span/format 的适用边界"
    ],
    "source": "C++20 - The Complete Guide 第 1、3–10、14–16 章；A Tour of C++ 3E §8、§17；C++ PL 4E 第 28 章",
    "lessons": [
      {
        "id": "cpp-13-1",
        "title": "13.1 三路比较、concepts 与约束重载",
        "level": "hard",
        "minutes": 65,
        "lead": "`<=>` 把六个比较运算符收敛成一条生成规则；concepts 把模板要求写进签名，让重载决议和错误信息都可读。两者是 C++20 泛型代码的地基。",
        "source": "C++20 Guide 第 1、3–5 章；A Tour of C++ 3E §8；C++ PL 4E 第 28 章",
        "points": [
          "strong/weak/partial ordering",
          "默认 <=> 与 == 合成",
          "concept 定义与 requires",
          "约束重载优先级",
          "标准 concepts 组合"
        ],
        "sections": [
          {
            "h": "三路比较：一次定义，六种运算",
            "p": "`a <=> b` 返回比较类别：`strong_ordering`（可替换相等）、`weak_ordering`（等价但不可替换）、`partial_ordering`（可能无序，如 NaN）。定义 `operator<=>` 后，`<`、`<=`、`>`、`>=` 可由它重写；`==` 不会自动由 `<=>` 合成，除非默认化。",
            "code": "#include <compare>\n#include <iostream>\nstruct Version {\n    int major, minor;\n    auto operator<=>(const Version&) const = default;\n};\nint main() {\n    Version a{1, 2}, b{1, 3};\n    std::cout << (a < b) << ' ' << (a <= b) << ' ' << (a == b) << '\\n';\n}",
            "output": "1 1 0",
            "tip": "浮点比较通常用 `partial_ordering`；不要对 NaN 假设全序。自定义 `<=>` 时保持与 `==` 语义一致，否则容器行为会诡异。",
            "lang": "cpp"
          },
          {
            "h": "concept + requires：把约束写在签名上",
            "p": "`template<class T> requires Concept<T>` 与 `template<Concept T>` 等价；requires 子句可以组合 `&&`/`||`。约束参与重载决议：更具体的约束优先，但两个不可比较的约束会造成歧义。",
            "code": "#include <concepts>\n#include <iostream>\n#include <string>\ntemplate<class T>\nconcept Printable = requires(const T& x, std::ostream& os) { os << x; };\ntemplate<Printable T>\nvoid show(const T& x) { std::cout << x << '\\n'; }\nint main() { show(42); show(std::string(\"hi\")); }",
            "output": "42\nhi",
            "tip": "requires 表达式只检查表达式合法性；`Printable` 不保证输出有意义。接口文档要写清语义，测试要覆盖边界。",
            "lang": "cpp"
          },
          {
            "h": "标准 concepts 与约束重载",
            "p": "常用标准 concepts：`std::same_as`、`std::derived_from`、`std::convertible_to`、`std::integral`、`std::floating_point`、`std::totally_ordered`、`std::sortable`。用它们组合出业务 concept，比手写 SFINAE 可读得多。",
            "code": "#include <concepts>\n#include <iostream>\n#include <vector>\ntemplate<std::integral T>\nT sum(const std::vector<T>& v) {\n    T total{};\n    for (T x : v) total += x;\n    return total;\n}\nint main() { std::cout << sum(std::vector<int>{1,2,3}) << '\\n'; }",
            "output": "6",
            "tip": "`std::integral` 包含 bool/char；业务上如果不想接受 char，要额外排除。concept 不是运行期校验，值域仍需自己检查。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-13-2",
        "title": "13.2 modules、coroutines、span 与 format",
        "level": "hard",
        "minutes": 70,
        "lead": "这一课不要求你立刻把所有代码改成 modules，而是让你知道每个特性的编译模型和边界：modules 改变接口，coroutines 改变控制流，span/format 改变参数与文本。",
        "source": "C++20 Guide 第 9–10、14–16 章；A Tour of C++ 3E §17；C++ PL 4E 第 15 章",
        "points": [
          "module interface/implementation",
          "import 与 header 的区别",
          "coroutine 的三个关键点",
          "span 的借用语义",
          "format 的编译期检查"
        ],
        "sections": [
          {
            "h": "modules：从 textual include 到结构化接口",
            "p": "传统 `#include` 是文本替换，宏、包含顺序、头文件守卫都会影响结果；C++20 module 把接口编译成 BMI（二进制模块接口），`import` 不展开文本。一个最小模块由 interface unit（`.cppm`）和 implementation unit 组成。",
            "code": "// math.cppm\nexport module math;\nexport int add(int a, int b) { return a + b; }\n\n// main.cpp\nimport math;\n#include <iostream>\nint main() { std::cout << add(2, 3) << '\\n'; }",
            "output": "5",
            "tip": "模块支持依赖编译器/构建系统；GCC 14 对 modules 仍不完整，线上单文件判题不使用 modules。学习时先理解「接口不再文本展开」，不要急着把现有头文件全迁走。",
            "lang": "cpp"
          },
          {
            "h": "coroutines：可挂起、可恢复的函数",
            "p": "协程函数体里有 `co_await`/`co_yield`/`co_return`；编译器把它变成状态机，返回一个拥有 `promise_type` 的句柄类型。最小生成器需要手写 promise_type，实际项目通常用库（cppcoro、asio）。",
            "code": "#include <coroutine>\n#include <iostream>\nstruct Generator {\n    struct promise_type {\n        Generator get_return_object() { return {}; }\n        std::suspend_always initial_suspend() { return {}; }\n        std::suspend_always final_suspend() noexcept { return {}; }\n        void return_void() {}\n        void unhandled_exception() { std::terminate(); }\n    };\n};\nGenerator demo() { co_return; }\nint main() { demo(); std::cout << \"coroutine built\\n\"; }",
            "output": "coroutine built",
            "tip": "协程的生命周期由句柄/awaiter 管理；局部变量在挂起期间必须保持有效。不要返回指向协程栈帧的引用，除非你明确知道恢复时机。",
            "lang": "cpp"
          },
          {
            "h": "span 与 format：两个最常用的 C++20 工具",
            "p": "`span<T>` 把「指针 + 长度」变成类型，函数不再需要单独传 n；`std::format` 把格式化从 iostream 状态里独立出来。两者都不拥有数据/不改变容器，适合边界层。",
            "code": "#include <format>\n#include <iostream>\n#include <span>\n#include <vector>\nvoid print(std::span<const int> s) {\n    for (int x : s) std::cout << std::format(\"{:>3}\", x);\n    std::cout << '\\n';\n}\nint main() {\n    std::vector<int> v{1, 22, 333};\n    print(v);\n}",
            "output": "  1 22 333",
            "tip": "`span` 不延长底层内存寿命；`format` 格式串要编译期可知。两者都不能替代所有权设计，只是边界工具。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch14",
    "part": 4,
    "number": "14",
    "title": "错误处理与异常安全",
    "summary": "错误处理不是「try/catch 一把梭」：异常、错误码、optional/variant、expected 各有适用边界；真正难的是异常安全保证和 noexcept 的承诺。",
    "goals": [
      "理解异常栈展开与 RAII",
      "区分基本/强/不抛保证",
      "正确使用 noexcept",
      "用 optional/variant 表达可预期失败",
      "设计清晰的错误边界"
    ],
    "source": "A Tour of C++ 3E §4；C++ PL 4E 第 13 章；Effective Modern C++ Item 14；C++20 Guide 第 14 章",
    "lessons": [
      {
        "id": "cpp-14-1",
        "title": "14.1 异常、栈展开与 noexcept",
        "level": "intermediate",
        "minutes": 60,
        "lead": "异常把错误从发生点传到处理点，代价是栈展开；RAII 让展开过程自动释放资源。`noexcept` 是承诺，不是「优化开关」。",
        "source": "A Tour of C++ 3E §4.1–4.5；C++ PL 4E 第 13 章；Effective Modern C++ Item 14",
        "points": [
          "throw/catch 与栈展开",
          "按 const 引用捕获",
          "析构与栈展开",
          "noexcept 的语义",
          "异常安全保证"
        ],
        "sections": [
          {
            "h": "throw/catch：按引用捕获，按值抛出",
            "p": "抛异常时复制/移动异常对象，栈展开调用所有已构造局部对象的析构；catch 按 `const std::exception&` 捕获可避免切片。不要抛裸指针；抛值，让标准库管理异常对象生命周期。",
            "code": "#include <iostream>\n#include <stdexcept>\nvoid may_fail(int x) {\n    if (x < 0) throw std::invalid_argument(\"negative\");\n    std::cout << x << '\\n';\n}\nint main() {\n    try { may_fail(-1); }\n    catch (const std::exception& e) { std::cout << \"caught: \" << e.what() << '\\n'; }\n}",
            "output": "caught: negative",
            "tip": "`catch (std::exception e)` 会按值切片，丢失派生类型；用 `const std::exception&`。catch(...) 只能做最后兜底，无法知道错误内容。",
            "lang": "cpp"
          },
          {
            "h": "栈展开与析构函数",
            "p": "异常离开作用域时，局部对象按构造逆序析构；如果析构函数抛异常且此时已有异常在传播，程序会 `std::terminate`。因此析构函数应默认 `noexcept`，资源释放失败只能在内部记录。",
            "code": "#include <iostream>\n#include <stdexcept>\nstruct Guard {\n    ~Guard() noexcept { std::cout << \"cleanup\\n\"; }\n};\nvoid f() { Guard g; throw std::runtime_error(\"boom\"); }\nint main() {\n    try { f(); } catch (const std::exception& e) { std::cout << e.what() << '\\n'; }\n}",
            "output": "cleanup\nboom",
            "tip": "析构里调用可能抛的 `close()` 很危险；先 `try/catch` 吞掉并记录，或提供显式 `close()` 让调用者处理错误。",
            "lang": "cpp"
          },
          {
            "h": "noexcept 与异常安全保证",
            "p": "`noexcept` 表示函数不会让异常逃出；若真抛出，直接 terminate。移动构造/swap/析构通常应 noexcept，容器扩容才敢用移动。异常安全三档：不泄漏（基本）、操作失败对象仍有效（强）、不抛（不抛保证）。",
            "code": "#include <iostream>\n#include <vector>\nstruct Widget {\n    Widget() = default;\n    Widget(Widget&&) noexcept { std::cout << \"move\\n\"; }\n    Widget(const Widget&) { std::cout << \"copy\\n\"; }\n};\nint main() {\n    std::vector<Widget> v;\n    v.reserve(1);\n    v.emplace_back();\n    v.emplace_back(); // 扩容：优先 noexcept 移动\n}",
            "output": "move\n（扩容时通常输出 move，具体实现可能不同）",
            "tip": "标 noexcept 前确认函数体里没有可能抛的操作；模板里用 `noexcept(noexcept(expr))` 传播条件，不要无条件写 noexcept。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-14-2",
        "title": "14.2 optional、variant、错误码与边界",
        "level": "intermediate",
        "minutes": 60,
        "lead": "不是所有失败都是异常：查不到、解析失败、业务校验失败更适合 `optional`/`variant`/错误码。关键是让「可能失败」出现在类型里。",
        "source": "C++20 Guide 第 14 章；A Tour of C++ 3E §4.4；C++ PL 4E 第 13 章",
        "points": [
          "optional 表达可能没有",
          "variant 表达多选一",
          "错误码与 expected",
          "异常 vs 错误码边界",
          "错误信息与日志"
        ],
        "sections": [
          {
            "h": "optional：可能没有值，但不是错误",
            "p": "`std::optional<T>` 要么有 T，要么空；适合「查不到」「没有配置」这类正常缺失，不适合携带失败原因。访问前用 `if (opt)` 或 `value_or`，不要对空 optional 调 `value()`。",
            "code": "#include <iostream>\n#include <optional>\n#include <string>\nstd::optional<int> find_score(const std::string& name) {\n    if (name == \"Ada\") return 36;\n    return std::nullopt;\n}\nint main() {\n    std::cout << find_score(\"Ada\").value_or(-1) << ' ' << find_score(\"Bob\").value_or(-1) << '\\n';\n}",
            "output": "36 -1",
            "tip": "`optional<T&>` 在 C++20 不合法；需要引用语义时用 `T*`（可空）或 `reference_wrapper`。`optional` 不携带错误原因。",
            "lang": "cpp"
          },
          {
            "h": "variant：多选一，把失败原因也放进类型",
            "p": "`std::variant<Success, Error>` 在同一时刻只持有一种类型；用 `std::get`/`std::get_if`/`std::visit` 访问。适合解析结果、命令返回值。访问错误类型会抛 `bad_variant_access`。",
            "code": "#include <iostream>\n#include <string>\n#include <variant>\nstruct Ok { int value; };\nstruct Err { std::string message; };\nusing Result = std::variant<Ok, Err>;\nResult parse(int x) { return x >= 0 ? Result{Ok{x}} : Result{Err{\"negative\"}}; }\nint main() {\n    Result r = parse(-1);\n    if (auto* e = std::get_if<Err>(&r)) std::cout << e->message << '\\n';\n}",
            "output": "negative",
            "tip": "`variant` 的默认构造使用第一个替代类型；如果第一个类型没有默认构造，`variant` 也不能默认构造。用 `std::monostate` 占位。",
            "lang": "cpp"
          },
          {
            "h": "错误码、expected 与边界设计",
            "p": "C++23 的 `std::expected<T, E>` 把「值或错误」放进类型；C++20 可用 `variant` 或项目自定义 `Result`。异常适合「罕见、调用者难以局部处理」的错误；错误码/expected 适合「常见、需要分支处理」的失败。",
            "code": "#include <iostream>\n#include <string>\n#include <variant>\nstruct Error { std::string message; };\ntemplate<class T>\nusing Expected = std::variant<T, Error>;\nExpected<int> divide(int a, int b) {\n    if (b == 0) return Error{\"divide by zero\"};\n    return a / b;\n}\nint main() {\n    auto r = divide(10, 0);\n    if (auto* e = std::get_if<Error>(&r)) std::cout << e->message << '\\n';\n}",
            "output": "divide by zero",
            "tip": "错误码不要用 `-1` 表示所有错误；不同失败原因要有不同类型/码。日志记录上下文，但不要把密码/密钥写进错误信息。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch15",
    "part": 4,
    "number": "15",
    "title": "编译期计算与性能",
    "summary": "性能不是「开 -O2」：先减少分配和拷贝，再谈缓存与并行。C++ 的 constexpr/consteval 把计算搬到编译期，noexcept/move 让容器更愿意走快路径。",
    "goals": [
      "用 constexpr/consteval 做编译期计算",
      "理解 if constexpr 与模板分支",
      "识别分配、拷贝、缓存瓶颈",
      "会用 reserve/move/noexcept 优化",
      "知道优化 flags 与测量方法"
    ],
    "source": "C++20 Guide 第 2、12 章；Effective Modern C++ Item 25、41；A Tour of C++ 3E §15–16；C++ PL 4E 第 28、34 章",
    "lessons": [
      {
        "id": "cpp-15-1",
        "title": "15.1 constexpr、consteval 与 if constexpr",
        "level": "intermediate",
        "minutes": 60,
        "lead": "编译期计算能把运行时成本变成常量，也能把错误提前到编译期。`constexpr` 是「可以」在编译期求值；`consteval` 是「必须」在编译期求值。",
        "source": "C++20 Guide 第 2 章；A Tour of C++ 3E §15；C++ PL 4E 第 28 章",
        "points": [
          "constexpr 函数与变量",
          "consteval 立即函数",
          "if constexpr 分支",
          "编译期容器/字符串",
          "编译期边界"
        ],
        "sections": [
          {
            "h": "constexpr：可以在编译期，也可以运行期",
            "p": "`constexpr` 函数在常量表达式上下文中编译期求值，在运行期调用时仍可运行；`constexpr` 变量必须常量初始化。C++20 允许 constexpr 函数里有更多语句（循环、局部变量），但仍不能有未定义行为。",
            "code": "#include <iostream>\nconstexpr int square(int x) { return x * x; }\nint main() {\n    constexpr int a = square(12);\n    int b = 5;\n    std::cout << a << ' ' << square(b) << '\\n';\n}",
            "output": "144 25",
            "tip": "constexpr 函数里不能调用非 constexpr 的运行时 API；编译期求值也不能有 UB，否则程序 ill-formed。",
            "lang": "cpp"
          },
          {
            "h": "consteval 与 if constexpr",
            "p": "`consteval` 函数必须在编译期求值，不能运行时调用；适合生成表、校验格式串。`if constexpr` 在编译期选择分支，未选中的分支不实例化，常用来按类型分派。",
            "code": "#include <iostream>\n#include <type_traits>\nconsteval int compile_time_id() { return 42; }\ntemplate<class T>\nvoid describe(T) {\n    if constexpr (std::is_pointer_v<T>) std::cout << \"pointer\\n\";\n    else std::cout << \"value\\n\";\n}\nint main() { int x = 0; describe(x); describe(&x); std::cout << compile_time_id() << '\\n'; }",
            "output": "value\npointer\n42",
            "tip": "`consteval` 函数里不能有运行期输入；`if constexpr` 的条件必须是编译期常量，两个分支都要语法正确。",
            "lang": "cpp"
          },
          {
            "h": "编译期容器与字符串的边界",
            "p": "C++20 的 constexpr 支持 `std::array`、`std::string_view` 等更多编译期操作，但 `std::vector`/`std::string` 的 constexpr 支持在 C++20 仍有限（C++20 起部分容器有 constexpr，编译器实现差异大）。不要为了「全编译期」强行替换运行时容器。",
            "code": "#include <array>\n#include <iostream>\nconstexpr std::array<int, 4> make_table() {\n    std::array<int, 4> a{};\n    for (int i = 0; i < 4; ++i) a[i] = i * i;\n    return a;\n}\nint main() {\n    constexpr auto table = make_table();\n    std::cout << table[3] << '\\n';\n}",
            "output": "9",
            "tip": "编译期计算会延长编译时间、增大二进制；只把真正固定且热点的表/校验放编译期，不要把所有逻辑模板化。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-15-2",
        "title": "15.2 性能：分配、缓存、移动与优化",
        "level": "hard",
        "minutes": 70,
        "lead": "性能优化先测量再改。最常见收益不是「换算法」，而是减少堆分配、减少拷贝、改善数据局部性；C++ 的 move/noexcept/reserve 都是为这些服务。",
        "source": "Effective Modern C++ Item 25、41；A Tour of C++ 3E §15–16；C++ PL 4E 第 34 章",
        "points": [
          "先测量再优化",
          "堆分配与对象数量",
          "缓存局部性",
          "reserve/move/noexcept",
          "优化 flags 与 benchmark"
        ],
        "sections": [
          {
            "h": "先测量：不要凭感觉优化",
            "p": "用 `perf stat`、`/usr/bin/time -v`、Google Benchmark 或简单 `chrono` 计时；先建立基线，再改一个变量重新测。优化后必须验证正确性，性能提升不能以 UB 为代价。",
            "code": "#include <chrono>\n#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> v;\n    auto t0 = std::chrono::steady_clock::now();\n    for (int i = 0; i < 1000000; ++i) v.push_back(i);\n    auto t1 = std::chrono::steady_clock::now();\n    std::cout << std::chrono::duration<double, std::milli>(t1 - t0).count() << \" ms\\n\";\n}",
            "output": "约 5–15 ms（取决于机器与是否 reserve）",
            "tip": "单次计时受缓存/调度影响；至少重复 5 次取中位数，并关闭省电模式。不要用 `clock()` 代替高精度时钟。",
            "lang": "cpp"
          },
          {
            "h": "减少分配与拷贝：reserve、move、return",
            "p": "`reserve` 避免 vector 多次扩容；移动构造避免深拷贝；返回局部对象用 NRVO/RVO；函数参数用 `const T&`/`string_view` 避免拷贝。对小对象，拷贝可能比引用更快（缓存友好），要测量后再决定。",
            "code": "#include <iostream>\n#include <string>\n#include <vector>\nstd::vector<int> build(int n) {\n    std::vector<int> v;\n    v.reserve(n);\n    for (int i = 0; i < n; ++i) v.push_back(i);\n    return v; // NRVO/移动\n}\nint main() {\n    auto v = build(5);\n    std::cout << v.size() << ' ' << v.capacity() << '\\n';\n}",
            "output": "5 5",
            "tip": "`reserve` 过大浪费内存；`shrink_to_fit` 不保证生效。不要为了「零拷贝」到处用指针/引用，生命周期 bug 的代价更高。",
            "lang": "cpp"
          },
          {
            "h": "缓存局部性与优化 flags",
            "p": "连续内存（vector、array）比链表/节点树更缓存友好；把热字段放一起，避免 false sharing（多线程写同一缓存行）。编译用 `-O2/-O3`、`-march=native`（仅本机）、`-DNDEBUG`，但发布前要用相同 flags 跑测试。",
            "code": "g++ -std=c++20 -O2 -DNDEBUG bench.cpp -o bench\nperf stat -e cache-misses,cycles,instructions ./bench",
            "output": "Performance counter stats for './bench':\n  ... cache-misses ...\n  ... cycles ...\n  ... instructions ...",
            "tip": "`-march=native` 生成的二进制可能无法在旧 CPU 运行；分发构建用保守目标。`-O3` 不一定更快，可能增大代码体积、降低 icache 命中。",
            "lang": "bash"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch16",
    "part": 5,
    "number": "16",
    "title": "线程与同步",
    "summary": "并发先从「谁和谁共享什么」开始：线程的启动/汇合、mutex 保护临界区、condition_variable 等待条件。先写对，再谈快。",
    "goals": [
      "用 std::thread/jthread 启动与汇合",
      "用 mutex/lock_guard 保护共享状态",
      "用 condition_variable 等待条件",
      "识别死锁与数据竞争"
    ],
    "source": "C++ Concurrency in Action 2E 第 1–4 章；A Tour of C++ 3E §18；C++20 Guide 第 14–16 章",
    "lessons": [
      {
        "id": "cpp-16-1",
        "title": "16.1 thread、jthread、mutex 与 lock_guard",
        "level": "intermediate",
        "minutes": 65,
        "lead": "`std::thread` 需要手动 join/detach；C++20 的 `std::jthread` 在析构时自动 join，并支持 stop_token。mutex 保护共享数据，但锁的粒度决定吞吐。",
        "source": "C++ Concurrency in Action 2E 第 2–3 章；A Tour of C++ 3E §18.1–18.2；C++20 Guide 第 14 章",
        "points": [
          "thread 的 join/detach",
          "jthread 与自动汇合",
          "mutex/lock_guard/unique_lock",
          "锁粒度与数据竞争",
          "线程安全接口设计"
        ],
        "sections": [
          {
            "h": "thread：启动、join 与异常",
            "p": "`std::thread t(f, args...)` 立即启动；必须 join 或 detach，否则析构时 `std::terminate`。join 等待线程结束；detach 让线程在后台运行，生命周期难以管理。线程函数抛异常会终止程序，异常不能跨线程传播。",
            "code": "#include <iostream>\n#include <thread>\nvoid work(int id) { std::cout << \"worker \" << id << '\\n'; }\nint main() {\n    std::thread t(work, 1);\n    t.join();\n    std::cout << \"joined\\n\";\n}",
            "output": "worker 1\njoined",
            "tip": "不要在线程函数里抛出未捕获异常；在线程入口用 try/catch 包住，把错误传回主线程（promise/future 或队列）。",
            "lang": "cpp"
          },
          {
            "h": "jthread：析构自动 join + stop_token",
            "p": "`std::jthread` 析构时自动请求停止并 join；它把 `std::stop_token` 作为第一个参数传给线程函数（如果可调用对象接受）。停止是协作式的：线程要定期检查 `stop_requested()`。",
            "code": "#include <iostream>\n#include <stop_token>\n#include <thread>\nvoid loop(std::stop_token st) {\n    int i = 0;\n    while (!st.stop_requested() && i < 3) { std::cout << i++ << ' '; }\n    std::cout << '\\n';\n}\nint main() {\n    std::jthread t(loop);\n    t.request_stop();\n} // 析构自动 join",
            "output": "0 1 2",
            "tip": "stop_token 不会强制杀线程；如果线程阻塞在 I/O/condition_variable，要用 `condition_variable_any::wait(lock, stop_token, pred)` 或超时轮询。",
            "lang": "cpp"
          },
          {
            "h": "mutex：保护临界区，不是保护变量",
            "p": "共享数据必须由同一把 mutex 保护；所有访问路径都要加锁，包括读。`std::lock_guard` 是 RAII 锁，构造加锁、析构解锁；`std::unique_lock` 可延迟/提前解锁，配合 condition_variable。锁粒度太粗会串行化，太细会增加竞争和死锁风险。",
            "code": "#include <iostream>\n#include <mutex>\n#include <thread>\nint counter = 0;\nstd::mutex m;\nvoid add() {\n    for (int i = 0; i < 1000; ++i) {\n        std::lock_guard<std::mutex> lock(m);\n        ++counter;\n    }\n}\nint main() {\n    std::thread a(add), b(add);\n    a.join(); b.join();\n    std::cout << counter << '\\n';\n}",
            "output": "2000",
            "tip": "`counter` 是普通 int，读写不是原子操作；即使 `++` 看起来只有一行，也多线程下会丢更新。用 mutex 或 atomic，不能靠「应该很快」。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-16-2",
        "title": "16.2 condition_variable、生产者消费者与死锁",
        "level": "hard",
        "minutes": 70,
        "lead": "条件变量解决「等某个条件成立」；它必须和 mutex、谓词一起用，且要用 while 循环防虚假唤醒。生产者消费者是最小可运行模型。",
        "source": "C++ Concurrency in Action 2E 第 4 章；A Tour of C++ 3E §18.2；C++20 Guide 第 15 章",
        "points": [
          "condition_variable 的 wait/notify",
          "谓词与虚假唤醒",
          "生产者消费者队列",
          "死锁的四个条件",
          "超时与退出"
        ],
        "sections": [
          {
            "h": "condition_variable：等待必须带谓词",
            "p": "`cv.wait(lock, pred)` 等价于 `while (!pred()) cv.wait(lock);`，能处理虚假唤醒和通知丢失。通知方修改共享状态后要 `notify_one/notify_all`；等待方持锁检查谓词。",
            "code": "#include <condition_variable>\n#include <iostream>\n#include <mutex>\n#include <queue>\n#include <thread>\nstd::mutex m;\nstd::condition_variable cv;\nstd::queue<int> q;\nbool done = false;\nvoid producer() {\n    for (int i = 0; i < 3; ++i) {\n        { std::lock_guard<std::mutex> lk(m); q.push(i); }\n        cv.notify_one();\n    }\n    { std::lock_guard<std::mutex> lk(m); done = true; }\n    cv.notify_all();\n}\nvoid consumer() {\n    while (true) {\n        std::unique_lock<std::mutex> lk(m);\n        cv.wait(lk, [] { return !q.empty() || done; });\n        if (q.empty() && done) break;\n        int v = q.front(); q.pop(); lk.unlock();\n        std::cout << v << ' ';\n    }\n    std::cout << '\\n';\n}\nint main() { std::thread p(producer), c(consumer); p.join(); c.join(); }",
            "output": "0 1 2",
            "tip": "通知前必须持锁修改谓词状态；只 notify 不改状态会丢通知。等待谓词要检查「队列非空或结束」，否则 done 后消费者可能永远等。",
            "lang": "cpp"
          },
          {
            "h": "生产者消费者：有界队列与背压",
            "p": "有界队列要同时等待「非空」和「非满」两个条件，或用两个条件变量；生产者等待 not_full，消费者等待 not_empty。队列满时生产者阻塞，形成背压，避免内存无限增长。",
            "code": "#include <condition_variable>\n#include <iostream>\n#include <mutex>\n#include <queue>\n#include <thread>\nstd::mutex m;\nstd::condition_variable not_empty, not_full;\nstd::queue<int> q;\nconstexpr int kCap = 2;\nvoid producer() {\n    for (int i = 0; i < 6; ++i) {\n        std::unique_lock<std::mutex> lk(m);\n        not_full.wait(lk, [] { return q.size() < kCap; });\n        q.push(i);\n        lk.unlock();\n        not_empty.notify_one();\n    }\n}\nvoid consumer() {\n    for (int i = 0; i < 6; ++i) {\n        std::unique_lock<std::mutex> lk(m);\n        not_empty.wait(lk, [] { return !q.empty(); });\n        int v = q.front(); q.pop();\n        lk.unlock();\n        std::cout << v << ' ';\n        not_full.notify_one();\n    }\n}\nint main() { std::thread p(producer), c(consumer); p.join(); c.join(); }",
            "output": "0 1 2 3 4 5",
            "tip": "两个条件变量不要混用同一把锁的 notify；notify_all 唤醒所有等待者会造成惊群，能用 notify_one 时优先。",
            "lang": "cpp"
          },
          {
            "h": "死锁：四个条件与破局",
            "p": "死锁需要互斥、持有并等待、不可抢占、循环等待同时成立。工程上最简单的破局是**固定锁顺序**（所有线程先锁 A 再锁 B），或用 `std::scoped_lock(a, b)` 一次性锁多个 mutex，避免交叉等待。",
            "code": "#include <iostream>\n#include <mutex>\n#include <thread>\nstd::mutex a, b;\nvoid t1() { std::scoped_lock lk(a, b); std::cout << \"t1\\n\"; }\nvoid t2() { std::scoped_lock lk(a, b); std::cout << \"t2\\n\"; }\nint main() { std::thread x(t1), y(t2); x.join(); y.join(); }",
            "output": "t1\nt2（顺序不定）",
            "tip": "不要在一个已持锁的临界区里调用外部回调/未知代码；回调可能反向加锁。锁顺序要写进注释和代码审查清单。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch17",
    "part": 5,
    "number": "17",
    "title": "原子操作与内存模型",
    "summary": "atomic 解决数据竞争，但不自动解决复合操作的原子性；memory_order 决定可见性与重排边界；无锁结构先证明正确，再谈性能。",
    "goals": [
      "用 atomic 做无竞争计数",
      "理解 relaxed/acquire/release/seq_cst",
      "识别复合操作的 race",
      "了解 ABA 与伪共享",
      "知道无锁结构的验证成本"
    ],
    "source": "C++ Concurrency in Action 2E 第 5–7 章；A Tour of C++ 3E §18.3；C++20 Guide 第 16 章",
    "lessons": [
      {
        "id": "cpp-17-1",
        "title": "17.1 atomic、memory_order 与数据竞争",
        "level": "hard",
        "minutes": 70,
        "lead": "`std::atomic<T>` 让单个读写原子且无数据竞争；但 `counter++` 是「读-改-写」三步，仍可能丢更新，要用 `fetch_add`。memory_order 是可见性与重排的契约。",
        "source": "C++ Concurrency in Action 2E 第 5 章；A Tour of C++ 3E §18.3；C++20 Guide 第 16 章",
        "points": [
          "atomic 的基本操作",
          "fetch_add/compare_exchange",
          "relaxed/acquire/release/seq_cst",
          "happens-before",
          "数据竞争与 UB"
        ],
        "sections": [
          {
            "h": "atomic：单变量原子，不等于复合原子",
            "p": "`std::atomic<int> x; x++` 是原子的读-改-写吗？`operator++` 对 atomic 是 `fetch_add(1)`，所以是原子的；但 `x = x + 1` 是「读 x、加 1、写 x」，中间可能被其他线程插入。用 `fetch_add`/`compare_exchange` 表达复合操作。",
            "code": "#include <atomic>\n#include <iostream>\n#include <thread>\nstd::atomic<int> counter{0};\nvoid add() { for (int i = 0; i < 1000; ++i) counter.fetch_add(1, std::memory_order_relaxed); }\nint main() { std::thread a(add), b(add); a.join(); b.join(); std::cout << counter.load() << '\\n'; }",
            "output": "2000",
            "tip": "`counter = counter + 1` 在多线程下会丢更新；`counter++` 对 atomic 是 fetch_add，安全。不要用 atomic 保护多个相关变量，那需要锁/事务。",
            "lang": "cpp"
          },
          {
            "h": "memory_order：先理解 happens-before",
            "p": "`seq_cst` 最强，默认，所有线程看到一致顺序；`acquire/release` 建立同步：release 写之前的所有操作对 acquire 读之后的线程可见；`relaxed` 只保证原子性，不保证顺序。没有 happens-before 的并发读写就是数据竞争（UB）。",
            "code": "#include <atomic>\n#include <iostream>\n#include <thread>\nstd::atomic<bool> ready{false};\nint data = 0;\nvoid producer() {\n    data = 42;\n    ready.store(true, std::memory_order_release);\n}\nvoid consumer() {\n    while (!ready.load(std::memory_order_acquire)) {}\n    std::cout << data << '\\n';\n}\nint main() { std::thread p(producer), c(consumer); p.join(); c.join(); }",
            "output": "42",
            "tip": "release/acquire 必须配对在同一個 atomic 变量上；只写 release 不写 acquire，不能建立同步。拿不准就用 seq_cst，先正确再优化。",
            "lang": "cpp"
          },
          {
            "h": "compare_exchange 与 ABA",
            "p": "`compare_exchange_weak(expected, desired)` 比较当前值与 expected，相等则写入 desired；weak 可能伪失败，通常放在循环里。ABA 问题：值从 A 变 B 又变回 A，CAS 以为没变；用带版本号的指针/标记解决。",
            "code": "#include <atomic>\n#include <iostream>\nint main() {\n    std::atomic<int> x{1};\n    int expected = 1;\n    bool ok = x.compare_exchange_strong(expected, 2);\n    std::cout << ok << ' ' << x.load() << '\\n';\n    expected = 1;\n    ok = x.compare_exchange_strong(expected, 3);\n    std::cout << ok << ' ' << x.load() << '\\n';\n}",
            "output": "1 2\n0 2",
            "tip": "CAS 失败时 expected 会被写成当前值；不要忽略这个副作用。无锁栈/队列的 ABA 要用 tagged pointer 或 hazard pointer。",
            "lang": "cpp"
          }
        ]
      },
      {
        "id": "cpp-17-2",
        "title": "17.2 无锁队列、伪共享与并发陷阱",
        "level": "hard",
        "minutes": 75,
        "lead": "无锁不是「不用锁就一定快」。无锁结构要处理内存回收、ABA、顺序一致性和缓存行；先证明正确，再测量吞吐。",
        "source": "C++ Concurrency in Action 2E 第 6–7 章；C++20 Guide 第 16 章；A Tour of C++ 3E §18.3",
        "points": [
          "无锁队列的基本结构",
          "内存回收/hazard pointer",
          "伪共享与缓存行",
          "自旋与让出",
          "并发测试与 TSAN"
        ],
        "sections": [
          {
            "h": "无锁队列：生产者/消费者各管一头",
            "p": "单生产者单消费者（SPSC）环形队列最容易写对：生产者只写 tail，消费者只写 head，用 acquire/release 传递索引；容量是 2 的幂时用位掩码取模。多生产者/多消费者需要 CAS 循环和内存回收，复杂度陡增。",
            "code": "#include <atomic>\n#include <array>\n#include <iostream>\n#include <thread>\ntemplate<class T, size_t N>\nstruct SpscQueue {\n    static_assert((N & (N - 1)) == 0);\n    std::array<T, N> buf{};\n    std::atomic<size_t> head{0}, tail{0};\n    bool push(const T& v) {\n        size_t t = tail.load(std::memory_order_relaxed);\n        if (t - head.load(std::memory_order_acquire) == N) return false;\n        buf[t & (N - 1)] = v;\n        tail.store(t + 1, std::memory_order_release);\n        return true;\n    }\n    bool pop(T& out) {\n        size_t h = head.load(std::memory_order_relaxed);\n        if (h == tail.load(std::memory_order_acquire)) return false;\n        out = buf[h & (N - 1)];\n        head.store(h + 1, std::memory_order_release);\n        return true;\n    }\n};\nint main() {\n    SpscQueue<int, 4> q;\n    q.push(1); q.push(2);\n    int x; q.pop(x); std::cout << x << '\\n';\n}",
            "output": "1",
            "tip": "SPSC 只保证一个生产者一个消费者；多生产者要 CAS 且处理失败重试。无锁队列的「空/满」判断和内存序写错，往往只在特定机器/负载下崩。",
            "lang": "cpp"
          },
          {
            "h": "伪共享：两个线程写同一缓存行",
            "p": "缓存行通常 64 字节；两个 atomic 变量挨在一起，被不同线程频繁写，会互相失效缓存行，性能可能比加锁还差。用 `alignas(64)` 把热变量分开，或把每线程计数放独立缓存行，最后汇总。",
            "code": "#include <atomic>\n#include <iostream>\n#include <thread>\nstruct alignas(64) PaddedCounter { std::atomic<long> value{0}; };\nPaddedCounter a, b;\nvoid run(PaddedCounter& c) { for (int i = 0; i < 1000000; ++i) c.value.fetch_add(1, std::memory_order_relaxed); }\nint main() { std::thread t1(run, std::ref(a)), t2(run, std::ref(b)); t1.join(); t2.join(); std::cout << a.value + b.value << '\\n'; }",
            "output": "2000000",
            "tip": "`alignas(64)` 会增大内存占用；只在 profiling 证明伪共享是瓶颈时用。不同 CPU 缓存行大小可能不同，64 是常见近似。",
            "lang": "cpp"
          },
          {
            "h": "并发测试：TSAN、压力测试与退出",
            "p": "数据竞争不会稳定复现。用 `-fsanitize=thread` 编译跑测试；用多线程压力循环放大窗口；用超时/停止标志避免测试挂死。无锁代码还要跑不同 CPU 核数、不同优化级别。",
            "code": "g++ -std=c++20 -g -fsanitize=thread race.cpp -o race -pthread\n./race",
            "output": "WARNING: ThreadSanitizer: data race ...\nSUMMARY: ThreadSanitizer: data race",
            "tip": "TSAN 与 ASan 通常不能同时开；CI 分两个 job。无锁结构不要只跑「正常路径」，要专门测空/满/回绕/竞争。",
            "lang": "bash"
          }
        ]
      }
    ],
    "sectionsCount": 6
  },
  {
    "id": "cpp-ch18",
    "part": 5,
    "number": "18",
    "title": "工程化与项目实战",
    "summary": "最后把语言能力落到工程：CMake 组织目标、测试与 sanitizer 保底、静态分析抓隐患、设计模式控制边界。项目实战按「小步可运行」推进。",
    "goals": [
      "用 CMake 组织库/可执行/测试",
      "写可重复的单元测试",
      "接入 ASan/UBSan/TSAN 与 clang-tidy",
      "理解常用设计模式与 API 边界",
      "能规划一个 C++ 项目里程碑"
    ],
    "source": "C++ PL 4E 第 15、29–30 章；A Tour of C++ 3E §19；Effective Modern C++ Item 41；C++20 Guide 第 17 章",
    "lessons": [
      {
        "id": "cpp-18-1",
        "title": "18.1 CMake、测试、Sanitizer 与静态分析",
        "level": "intermediate",
        "minutes": 65,
        "lead": "工程化不是「会写 CMakeLists」：目标边界、编译选项、测试和 sanitizer 要一起设计，才能让错误尽早暴露。",
        "source": "C++ PL 4E 第 15 章；A Tour of C++ 3E §19；C++20 Guide 第 17 章",
        "points": [
          "CMake target 与依赖",
          "编译选项与 warnings",
          "单元测试结构",
          "ASan/UBSan/TSAN",
          "clang-tidy/format"
        ],
        "sections": [
          {
            "h": "CMake：以 target 为中心",
            "p": "现代 CMake 用 target 组织：`add_library(core ...)`、`add_executable(app ...)`、`target_link_libraries(app PRIVATE core)`。不要用全局 `include_directories`/`CMAKE_CXX_FLAGS` 污染所有目标；用 `target_include_directories`、`target_compile_features` 表达依赖。",
            "code": "cmake_minimum_required(VERSION 3.20)\nproject(cpp_demo LANGUAGES CXX)\nadd_library(core src/core.cpp)\ntarget_include_directories(core PUBLIC include)\ntarget_compile_features(core PUBLIC cxx_std_20)\nadd_executable(app src/main.cpp)\ntarget_link_libraries(app PRIVATE core)\nenable_testing()\nadd_executable(core_test tests/core_test.cpp)\ntarget_link_libraries(core_test PRIVATE core)\nadd_test(NAME core_test COMMAND core_test)",
            "output": "cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug\ncmake --build build -j\nctest --test-dir build --output-on-failure",
            "tip": "`target_compile_features(... cxx_std_20)` 把标准要求传给使用该 target 的编译；不要假设用户全局设置了 C++20。",
            "lang": "cmake"
          },
          {
            "h": "测试：先写最小可重复用例",
            "p": "单元测试要独立、可重复、快速；一个测试只验证一个行为。C++ 可用 GoogleTest/Catch2/doctest，也可以先用简单 assert 脚本。测试文件与库 target 分开，CI 里跑 `ctest`。",
            "code": "// tests/core_test.cpp\n#include <cassert>\nint add(int a, int b);\nint main() {\n    assert(add(2, 3) == 5);\n    assert(add(-1, 1) == 0);\n    return 0;\n}",
            "output": "测试通过时无输出；失败时 assert 打印文件/行号并 abort",
            "tip": "`assert` 在 `NDEBUG` 下会被裁掉，测试构建不要定义 NDEBUG；用测试框架的断言更可控。",
            "lang": "cpp"
          },
          {
            "h": "Sanitizer、静态分析与格式",
            "p": "ASan 抓越界/use-after-free/泄漏；UBSan 抓有符号溢出/空指针/对齐；TSAN 抓数据竞争。clang-tidy 做静态规则检查，clang-format 统一风格。Debug/CI 开 sanitizer，Release 用优化 flags 并复跑测试。",
            "code": "cmake -S . -B build-asan -DCMAKE_BUILD_TYPE=Debug \\\n  -DCMAKE_CXX_FLAGS=\"-fsanitize=address,undefined -fno-omit-frame-pointer\"\ncmake --build build-asan -j\nctest --test-dir build-asan --output-on-failure\nclang-tidy src/*.cpp -- -std=c++20",
            "output": "ASan/UBSan 无报错则测试正常结束；有报错会打印 stack trace 并非零退出",
            "tip": "sanitizer 会显著降速、增内存，不要用于性能基准；TSAN 与 ASan 分开构建。静态分析有误报，规则要按项目调。",
            "lang": "bash"
          }
        ]
      },
      {
        "id": "cpp-18-2",
        "title": "18.2 设计模式、API 设计与项目路线",
        "level": "hard",
        "minutes": 70,
        "lead": "设计模式不是八股：它帮你命名「谁创建、谁拥有、谁通知谁」。C++ 里优先用 RAII、值语义、`std::variant`/`std::function` 替代过度继承。",
        "source": "C++ PL 4E 第 29–30 章；A Tour of C++ 3E §19；Effective Modern C++ Item 41",
        "points": [
          "工厂与 RAII",
          "观察者与生命周期",
          "策略与 std::function",
          "API 边界与 pimpl",
          "项目里程碑"
        ],
        "sections": [
          {
            "h": "工厂：把创建与使用分开",
            "p": "工厂函数返回 `std::unique_ptr<Interface>`，调用方不关心具体类型；创建失败返回 nullptr 或抛异常，不要返回半成品。C++ 的 `make_unique` 本身就是最小工厂。",
            "code": "#include <iostream>\n#include <memory>\nstruct Shape { virtual ~Shape() = default; virtual double area() const = 0; };\nstruct Square : Shape { explicit Square(double s) : s(s) {} double area() const override { return s * s; } private: double s; };\nstd::unique_ptr<Shape> make_square(double s) { return std::make_unique<Square>(s); }\nint main() { auto p = make_square(3); std::cout << p->area() << '\\n'; }",
            "output": "9",
            "tip": "工厂返回 unique_ptr 表达所有权转移；如果调用方只借用，返回引用/指针并写清生命周期。不要返回裸 new 指针让调用方猜。",
            "lang": "cpp"
          },
          {
            "h": "观察者：通知可以，生命周期要小心",
            "p": "观察者模式让主题在状态变化时通知订阅者；难点是**订阅者销毁后主题仍持有回调**。用 `weak_ptr`/令牌取消订阅，或让主题不拥有观察者。回调里不要反向销毁主题，避免迭代器失效。",
            "code": "#include <functional>\n#include <iostream>\n#include <vector>\nclass Button {\npublic:\n    int subscribe(std::function<void()> f) { slots_.push_back(std::move(f)); return (int)slots_.size() - 1; }\n    void click() const { for (const auto& f : slots_) f(); }\nprivate:\n    std::vector<std::function<void()>> slots_;\n};\nint main() {\n    Button b;\n    b.subscribe([] { std::cout << \"clicked\\n\"; });\n    b.click();\n}",
            "output": "clicked",
            "tip": "真实项目要提供 `unsubscribe(id)` 或返回 RAII 订阅句柄；否则观察者销毁后回调悬垂。C++ 没有内置 GC，生命周期要显式设计。",
            "lang": "cpp"
          },
          {
            "h": "API 边界、pimpl 与项目路线",
            "p": "公共头文件只暴露必要类型；用 pimpl（指向实现的 unique_ptr）隔离实现细节和 ABI；用 `[[nodiscard]]`、`noexcept`、`const` 表达契约。项目按「最小可运行 → 测试 → 性能 → 发布」推进，不要一开始堆框架。",
            "code": "// widget.h\n#pragma once\n#include <memory>\nclass Widget {\npublic:\n    Widget();\n    ~Widget();\n    Widget(Widget&&) noexcept;\n    Widget& operator=(Widget&&) noexcept;\n    void draw() const;\nprivate:\n    struct Impl;\n    std::unique_ptr<Impl> impl_;\n};",
            "output": "头文件不暴露 Impl 的成员/依赖；实现变更不要求调用方重编（ABI 更稳定）",
            "tip": "pimpl 多一次堆分配/间接访问，热路径小对象未必值得。项目路线：先打通一条端到端用例，再加错误处理/测试/性能，最后才抽象模式。",
            "lang": "cpp"
          }
        ]
      }
    ],
    "sectionsCount": 6
  }
];
