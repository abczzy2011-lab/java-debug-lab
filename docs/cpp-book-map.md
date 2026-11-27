# C++ 学科书单与课程映射

本页记录 C++ 学科的教材来源、五篇 18 章 96 课、1,344 小节的知识路线，以及 8 本书各自承担的角色。课程正文不是原书复制，而是按主题重写：每个概念配可运行代码、实际输出与常见坑点。

## 8 本书的角色

| 书 | 定位 | 主要贡献 |
| --- | --- | --- |
| A Tour of C++ 2E | 总纲（早期版） | Bjarne 的快速全景：类型、类、模板、STL、并发；用来校准概念之间的连接 |
| A Tour of C++ 3E | 总纲（主参考） | 现代 C++ 全景：类型、类、模块化、模板、概念、STL、ranges、并发、历史兼容性 |
| C++ Primer Plus 6E | 入门与补漏 | 从编译链接、基本类型、复合类型、循环、函数、类、继承到 STL 的完整台阶 |
| Beginning C++17 | 入门实操 | 基本类型、控制流、指针与引用、类、继承、多态、模板、容器、文件与异常 |
| The C++ Programming Language 4E | 语言权威 | 类型系统、类层次、运算符、模板、元编程、异常、命名空间、源文件与标准库设计 |
| Effective Modern C++ | 现代 C++ 规则 | 42 条 C++11/14 准则：类型推导、auto、移动语义、智能指针、lambda、并发 API |
| C++20 - The Complete Guide | C++20 专题 | 三路比较、concepts、modules、coroutines、ranges、format、jthread、原子与内存序 |
| C++ Concurrency in Action 2E | 并发专项 | thread、mutex、condition_variable、atomic、memory_order、无锁结构、线程池与测试 |
| C++20 标准 / cppreference（外部查阅） | 查阅 | 课程中的签名、标准版本与边界行为以标准库文档为准，不计入 8 本教材 |

## 五篇 18 章 96 课

每章 5–6 课，共 96 课；每课 14 节，共 1,344 节。课程在原有 54 课的基础上新增 42 课：预处理器与最小复现、强类型封装、重载解析、函数指针与 lambda、对象生命周期、数组退化、初始化列表、封装边界、RAII 回滚、移动与 noexcept、运算符重载、三路比较、虚表开销、组合、模板特化、模板诊断、vector 扩容、容器选型、算法库、格式化输出、文件流、工厂函数、引用计数、lambda 生命周期、ranges、concepts、协程、format、异常类型、异常安全、constexpr 容器、缓存布局、profiling、读写锁、线程安全队列、内存序、原子 CAS、CMake、测试与 ABI。

### 第一篇 · 语言底座（第 1–4 章）

1. 从源文件到可运行程序：编译、链接、工具链
2. 类型、表达式与值类别：基本类型、初始化、const、引用、auto
3. 控制流、函数与作用域：range-for、重载、生命周期、命名空间、ODR
4. 指针、数组与内存模型：指针运算、C 字符串、span、动态内存与未定义行为

### 第二篇 · 对象与泛型（第 5–8 章）

5. 类、构造/析构与 RAII：不变式、初始化列表、Rule of Zero/Five
6. 拷贝、移动与运算符：深拷贝、移动语义、三路比较、运算符重载
7. 继承与多态：虚函数、动态绑定、抽象类、对象切片、虚析构
8. 模板与概念：函数/类模板、类型推导、concepts、requires、SFINAE

### 第三篇 · STL 与现代 C++（第 9–12 章）

9. 容器、迭代器与算法：vector、string、map、unordered_map、迭代器失效
10. 字符串、流与文件：iostream、文件流、string_view、format、ranges
11. 智能指针与所有权：unique_ptr、shared_ptr、weak_ptr、自定义删除器
12. Lambda、函数对象与 ranges：捕获、std::function、views、惰性求值

### 第四篇 · C++20 与性能（第 13–15 章）

13. C++20 核心特性：`<=>`、concepts、modules、coroutines、span
14. 错误处理与异常安全：throw/catch、栈展开、noexcept、错误码与边界
15. 编译期计算与性能：constexpr、consteval、if constexpr、缓存、分配器、优化

### 第五篇 · 并发与工程（第 16–18 章）

16. 线程与同步：std::thread、jthread、mutex、lock_guard、condition_variable
17. 原子操作与内存模型：atomic、memory_order、race、无锁队列、伪共享
18. 工程化与项目：CMake、测试、sanitizers、静态分析、设计模式、API 设计

## 课程边界

- 课程示例以 C++20 为目标；线上判题使用 GCC 14.1 并显式传入 `-std=c++20`。
- 不把未定义行为当作技巧；涉及 UB 的示例会明确标注“只用于观察，不要在生产代码中写”。
- 并发章节先讲同步与所有权，再讲无锁；无锁代码强调“先证明正确，再谈性能”。
- 8 本书中重叠的主题按“先入门、再现代、最后工程”合并，避免把同一概念拆成多节重复课。
