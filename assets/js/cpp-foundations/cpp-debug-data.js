/* C++ 改错实验室 · 36 题 / 108 组用例。每题保留一份 buggy 代码、参考修复与解析；
   判题使用 Judge0 GCC 14.1，编译选项 -std=c++20 -O2。 */
window.CPP_DEBUG_TASKS = {
  "version": "20261127z105",
  "title": "C++ 改错实验室",
  "tasks": [
    {
      "id": "b1",
      "level": "basic",
      "order": 1,
      "title": "循环少跑了一次",
      "summary": "求和结果总是少最后一项",
      "prompt": "读入 n，求 1+2+…+n。现在把循环终点写错了，先让 n=1 和 n=5 都通过。",
      "source": "C++ Primer Plus · 第 5 章 循环",
      "minutes": 6,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long sum = 0;\n    for (int i = 1; i < n; ++i) sum += i;   // BUG: 终点\n    cout << sum << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long sum = 0;\n    for (int i = 1; i <= n; ++i) sum += i;\n    cout << sum << \"\\n\";\n    return 0;\n}",
      "analysis": "循环条件是 `< n`，i 只能取到 n-1。把终点改成 `<= n` 后，n=1 才有 1，n=5 才是 15。",
      "hints": [
        "先拿 n=1 手算：循环体执行了几次？",
        "`< n` 与 `<= n` 的差别正好是最后一项。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "5",
          "expected": "15"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "1",
          "expected": "1"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "10",
          "expected": "55"
        }
      ],
      "targetMs": 70
    },
    {
      "id": "b2",
      "level": "basic",
      "order": 2,
      "title": "偶数判断写反了",
      "summary": "偶数个数被统计成奇数个数",
      "prompt": "读入 n 个整数，统计其中偶数的个数。现在条件把奇偶写反了。",
      "source": "C++ Primer Plus · 第 6 章 分支",
      "minutes": 6,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int count = 0;\n    for (int i = 0; i < n; ++i) {\n        int x;\n        cin >> x;\n        if (x % 2 == 1) ++count;   // BUG: 奇偶\n    }\n    cout << count << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int count = 0;\n    for (int i = 0; i < n; ++i) {\n        int x;\n        cin >> x;\n        if (x % 2 == 0) ++count;\n    }\n    cout << count << \"\\n\";\n    return 0;\n}",
      "analysis": "`x % 2 == 1` 统计的是奇数。偶数应满足 `x % 2 == 0`；负数取模在 C++ 里可能为负，但本题输入都是正数。",
      "hints": [
        "用 2 和 3 分别代入条件。",
        "偶数除以 2 的余数是多少？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "5\n1 2 3 4 5",
          "expected": "2"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "3\n2 4 6",
          "expected": "3"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "4\n1 3 5 7",
          "expected": "0"
        }
      ],
      "targetMs": 70
    },
    {
      "id": "b3",
      "level": "basic",
      "order": 3,
      "title": "最大值从 0 开始",
      "summary": "全负数时答案变成 0",
      "prompt": "读入 n 个整数，输出最大值。现在的初始值在正数上没问题，遇到全负数就露馅。",
      "source": "Beginning C++17 · 第 4 章 控制流",
      "minutes": 7,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n    for (auto &x : a) cin >> x;\n    int best = 0;                 // BUG: 假设一定有一个正数\n    for (int x : a) best = max(best, x);\n    cout << best << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n    for (auto &x : a) cin >> x;\n    int best = a[0];\n    for (int i = 1; i < n; ++i) best = max(best, a[i]);\n    cout << best << \"\\n\";\n    return 0;\n}",
      "analysis": "把 best 初始化为 0，相当于先塞进一个不存在的 0。正确做法是拿第一个元素当初始值，从第二个开始比较。",
      "hints": [
        "输入 -5 -2 -9 时，best 会被 0 卡住吗？",
        "最大值必须来自数组本身。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "3\n-5 -2 -9",
          "expected": "-2"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "4\n10 3 7 1",
          "expected": "10"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "1\n-7",
          "expected": "-7"
        }
      ],
      "targetMs": 70
    },
    {
      "id": "b4",
      "level": "basic",
      "order": 4,
      "title": "反转字符串漏了首字符",
      "summary": "输出总比正确答案少一个字符",
      "prompt": "读入一个字符串，倒序输出。现在的下标范围差了一格。",
      "source": "C++ Primer Plus · 第 5 章 字符串",
      "minutes": 6,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    for (int i = (int)s.size() - 1; i > 0; --i)   // BUG: 下标范围\n        cout << s[i];\n    cout << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    for (int i = (int)s.size() - 1; i >= 0; --i)\n        cout << s[i];\n    cout << \"\\n\";\n    return 0;\n}",
      "analysis": "字符串下标从 0 开始，最后一个字符是 size()-1。循环条件 `i > 0` 会跳过下标 0，也就是原串的第一个字符。",
      "hints": [
        "长度为 1 的字符串会输出什么？",
        "倒序要访问到下标 0 为止。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "abc",
          "expected": "cba"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "hello",
          "expected": "olleh"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "x",
          "expected": "x"
        }
      ],
      "targetMs": 70
    },
    {
      "id": "b5",
      "level": "basic",
      "order": 5,
      "title": "阶乘装进了 int",
      "summary": "n 稍大就溢出成负数或乱码",
      "prompt": "读入 n，输出 n!。n 最大到 20，结果已经超出 32 位整数。",
      "source": "Beginning C++17 · 第 2 章 基本类型",
      "minutes": 6,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int ans = 1;                 // BUG: 32 位装不下\n    for (int i = 2; i <= n; ++i) ans *= i;\n    cout << ans << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long ans = 1;\n    for (int i = 2; i <= n; ++i) ans *= i;\n    cout << ans << \"\\n\";\n    return 0;\n}",
      "analysis": "13! 已经超过 `int` 上限 2,147,483,647。把累乘变量改成 `long long`，20! 仍在 64 位范围内。",
      "hints": [
        "5! 和 10! 还能过，13! 呢？",
        "`int` 大约只能装到 2×10^9。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "5",
          "expected": "120"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "10",
          "expected": "3628800"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "13",
          "expected": "6227020800"
        }
      ],
      "targetMs": 70
    },
    {
      "id": "b6",
      "level": "basic",
      "order": 6,
      "title": "素数判断漏了 1",
      "summary": "1 被误判成素数",
      "prompt": "读入 n，判断是否为素数。循环效率不是重点，先把 1 和合数的判断改对。",
      "source": "C++ Primer Plus · 第 6 章 函数",
      "minutes": 7,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nbool isPrime(int n) {\n    for (int i = 2; i < n; ++i)   // BUG: 没处理 n < 2，也没提前停\n        if (n % i == 0) return false;\n    return true;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << (isPrime(n) ? \"YES\" : \"NO\") << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nbool isPrime(int n) {\n    if (n < 2) return false;\n    for (int i = 2; i * i <= n; ++i)\n        if (n % i == 0) return false;\n    return true;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << (isPrime(n) ? \"YES\" : \"NO\") << \"\\n\";\n    return 0;\n}",
      "analysis": "1 不是素数，0 和负数也不是。循环从 2 到 n-1 会做很多无用除法；判断到 `i*i <= n` 就够，但先补上 `n < 2` 的边界。",
      "hints": [
        "n=1 时循环一次都不执行，函数返回什么？",
        "合数一定有一个不超过平方根的因子。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "7",
          "expected": "YES"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "1",
          "expected": "NO"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "9",
          "expected": "NO"
        }
      ],
      "targetMs": 70
    },
    {
      "id": "b7",
      "level": "basic",
      "order": 7,
      "title": "平均值被整数除法截断",
      "summary": "1 2 4 的平均值输出成 2.00",
      "prompt": "读入 n 个整数，输出平均值，保留两位小数。",
      "source": "C++ Primer Plus · 第 3 章 数据处理",
      "minutes": 7,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int sum = 0;\n    for (int i = 0; i < n; ++i) {\n        int x;\n        cin >> x;\n        sum += x;\n    }\n    double avg = sum / n;        // BUG: 先做整数除法\n    cout << fixed << setprecision(2) << avg << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int sum = 0;\n    for (int i = 0; i < n; ++i) {\n        int x;\n        cin >> x;\n        sum += x;\n    }\n    double avg = double(sum) / n;\n    cout << fixed << setprecision(2) << avg << \"\\n\";\n    return 0;\n}",
      "analysis": "`sum / n` 两边都是 int，结果先被截断，再赋给 double 已经晚了。把其中一个操作数转成 double，除法才会保留小数。",
      "hints": [
        "1+2+4=7，7/3 在整数里等于几？",
        "`double(sum) / n` 和 `sum / n` 不是一回事。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "3\n1 2 4",
          "expected": "2.33"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "4\n1 1 1 2",
          "expected": "1.25"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "5\n10 20 30 40 51",
          "expected": "30.20"
        }
      ],
      "targetMs": 70
    },
    {
      "id": "b8",
      "level": "basic",
      "order": 8,
      "title": "整行输入只读到了第一个词",
      "summary": "空格数量统计为 0",
      "prompt": "读入一整行文本，统计其中空格字符的数量。",
      "source": "Beginning C++17 · 第 7 章 字符串",
      "minutes": 6,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;                    // BUG: 遇到空格就停\n    int count = 0;\n    for (char c : s) if (c == ' ') ++count;\n    cout << count << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    int count = 0;\n    for (char c : s) if (c == ' ') ++count;\n    cout << count << \"\\n\";\n    return 0;\n}",
      "analysis": "`cin >> s` 按空白切分，只拿到第一个单词；统计整行要用 `getline(cin, s)`。",
      "hints": [
        "`cin >> s` 遇到空格会发生什么？",
        "行输入要用 getline，不是流提取。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "hello world cpp",
          "expected": "2"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "a b c d",
          "expected": "3"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "nosspace",
          "expected": "0"
        }
      ],
      "targetMs": 70
    },
    {
      "id": "m1",
      "level": "medium",
      "order": 1,
      "title": "排序后忘了去重",
      "summary": "不同元素个数和预期对不上",
      "prompt": "读入 n 个整数，输出去重并升序排列的结果。现在只排序，没有删除重复项。",
      "source": "C++ Primer Plus · 第 16 章 STL",
      "minutes": 9,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n    for (auto &x : a) cin >> x;\n    sort(a.begin(), a.end());\n    for (int x : a) cout << x << \" \";\n    cout << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n    for (auto &x : a) cin >> x;\n    sort(a.begin(), a.end());\n    a.erase(unique(a.begin(), a.end()), a.end());\n    for (int x : a) cout << x << \" \";\n    cout << \"\\n\";\n    return 0;\n}",
      "analysis": "`unique` 只把重复元素移到末尾并返回新逻辑终点，必须配合 `erase` 才能真正删除。",
      "hints": [
        "sort 之后重复元素是相邻的。",
        "`unique` 的返回值是什么？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "6\n3 1 3 2 1 2",
          "expected": "1 2 3"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "5\n5 5 5 5 5",
          "expected": "5"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "4\n4 1 4 2",
          "expected": "1 2 4"
        }
      ],
      "targetMs": 80
    },
    {
      "id": "m2",
      "level": "medium",
      "order": 2,
      "title": "括号匹配只看数量",
      "summary": "`([)]` 被误判为合法",
      "prompt": "判断括号串是否合法。现在只保证左右数量一致，没有检查栈顶类型。",
      "source": "Beginning C++17 · 第 10 章 容器",
      "minutes": 10,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    stack<char> st;\n    bool ok = true;\n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') st.push(c);\n        else {\n            if (!st.empty()) st.pop();   // BUG: 没检查栈顶是否配对\n            else ok = false;\n        }\n    }\n    if (!st.empty()) ok = false;\n    cout << (ok ? \"YES\" : \"NO\") << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    stack<char> st;\n    bool ok = true;\n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') st.push(c);\n        else {\n            char need = c == ')' ? '(' : (c == ']' ? '[' : '{');\n            if (st.empty() || st.top() != need) { ok = false; break; }\n            st.pop();\n        }\n    }\n    if (!st.empty()) ok = false;\n    cout << (ok ? \"YES\" : \"NO\") << \"\\n\";\n    return 0;\n}",
      "analysis": "遇到右括号时，栈顶必须是同类型的左括号。只 pop 不比对，`([)]` 会把 `[` 弹掉，最后看起来是空的。",
      "hints": [
        "`([)]` 的扫描过程是什么？",
        "右括号要检查栈顶，不只是检查栈非空。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "()[]{}",
          "expected": "YES"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "([)]",
          "expected": "NO"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "{[()]}",
          "expected": "YES"
        }
      ],
      "targetMs": 80
    },
    {
      "id": "m3",
      "level": "medium",
      "order": 3,
      "title": "斐波那契基准错了",
      "summary": "F(0) 被定义成 1",
      "prompt": "按 F(0)=0、F(1)=1 输出第 n 项。现在的递归基准和题目定义不一致。",
      "source": "C++ Primer Plus · 第 7 章 函数",
      "minutes": 8,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nlong long f(int n) {\n    if (n == 0) return 1;        // BUG: F(0) 应为 0\n    if (n == 1) return 1;\n    return f(n - 1) + f(n - 2);\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << f(n) << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nlong long f(int n) {\n    if (n == 0) return 0;\n    if (n == 1) return 1;\n    return f(n - 1) + f(n - 2);\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << f(n) << \"\\n\";\n    return 0;\n}",
      "analysis": "F(0)=0、F(1)=1 是题目定义。基准写错会让所有项整体位移；本题 n 不大，递归还能跑，但工程上更推荐递推。",
      "hints": [
        "F(2) 应该等于几？",
        "先修基准，再考虑是否需要改成递推。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "0",
          "expected": "0"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "5",
          "expected": "5"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "10",
          "expected": "55"
        }
      ],
      "targetMs": 80
    },
    {
      "id": "m4",
      "level": "medium",
      "order": 4,
      "title": "矩阵转置没有换循环",
      "summary": "非方阵的输出维度不对",
      "prompt": "读入 r 行 c 列矩阵，输出它的转置（c 行 r 列）。",
      "source": "Beginning C++17 · 第 6 章 数组",
      "minutes": 9,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int r, c;\n    cin >> r >> c;\n    vector<vector<int>> a(r, vector<int>(c));\n    for (int i = 0; i < r; ++i)\n        for (int j = 0; j < c; ++j) cin >> a[i][j];\n\n    for (int i = 0; i < r; ++i) {          // BUG: 仍按原矩阵遍历\n        for (int j = 0; j < c; ++j) cout << a[i][j] << \" \";\n        cout << \"\\n\";\n    }\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int r, c;\n    cin >> r >> c;\n    vector<vector<int>> a(r, vector<int>(c));\n    for (int i = 0; i < r; ++i)\n        for (int j = 0; j < c; ++j) cin >> a[i][j];\n\n    for (int j = 0; j < c; ++j) {\n        for (int i = 0; i < r; ++i) cout << a[i][j] << \" \";\n        cout << \"\\n\";\n    }\n    return 0;\n}",
      "analysis": "转置后行数变成 c、列数变成 r，所以外层循环应遍历列 j，内层遍历行 i，访问 `a[i][j]`。方阵时原样输出也能骗过，但非方阵会立刻暴露。",
      "hints": [
        "输出应有几行？",
        "新矩阵第 j 行来自原矩阵第 j 列。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "2 3\n1 2 3\n4 5 6",
          "expected": "1 4\n2 5\n3 6"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "3 2\n1 2\n3 4\n5 6",
          "expected": "1 3 5\n2 4 6"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "2 4\n1 2 3 4\n5 6 7 8",
          "expected": "1 5\n2 6\n3 7\n4 8"
        }
      ],
      "targetMs": 80
    },
    {
      "id": "m5",
      "level": "medium",
      "order": 5,
      "title": "大小写没有统一",
      "summary": "The 和 the 被当成两个词",
      "prompt": "统计一行英文中不同单词的个数，忽略大小写。",
      "source": "C++ Primer Plus · 第 16 章 字符串与 STL",
      "minutes": 9,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    set<string> words;\n    stringstream ss(line);\n    string w;\n    while (ss >> w) words.insert(w);   // BUG: 大小写敏感\n    cout << words.size() << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    for (char &c : line) c = (char)tolower(c);\n    set<string> words;\n    stringstream ss(line);\n    string w;\n    while (ss >> w) words.insert(w);\n    cout << words.size() << \"\\n\";\n    return 0;\n}",
      "analysis": "set 按字符串字面比较，`The` 和 `the` 是两个不同的键。统计前先把整行转小写，或用大小写不敏感的比较器。",
      "hints": [
        "set 会认为 `The` 和 `the` 相等吗？",
        "可以在切词前统一转小写。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "The the",
          "expected": "1"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "Apple banana apple",
          "expected": "2"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "ONE two one TWO",
          "expected": "2"
        }
      ],
      "targetMs": 80
    },
    {
      "id": "m6",
      "level": "medium",
      "order": 6,
      "title": "闰年判断只看了 4 的倍数",
      "summary": "1900 年 2 月被算成 29 天",
      "prompt": "读入年份和月份，输出该月天数。注意整百年份的闰年规则。",
      "source": "C++ Primer Plus · 第 6 章 分支",
      "minutes": 9,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int y, m;\n    cin >> y >> m;\n    int days[] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};\n    bool leap = (y % 4 == 0);     // BUG: 漏了整百年规则\n    if (leap) days[2] = 29;\n    cout << days[m] << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int y, m;\n    cin >> y >> m;\n    int days[] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};\n    bool leap = (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0);\n    if (leap) days[2] = 29;\n    cout << days[m] << \"\\n\";\n    return 0;\n}",
      "analysis": "公历闰年规则：能被 400 整除，或能被 4 整除但不能被 100 整除。1900 能被 4 整除却不能被 400 整除，所以不是闰年；2000 才是。",
      "hints": [
        "1900 和 2000 哪个是闰年？",
        "整百年要额外检查 400。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "2024 2",
          "expected": "29"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "1900 2",
          "expected": "28"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "2100 2",
          "expected": "28"
        }
      ],
      "targetMs": 80
    },
    {
      "id": "m7",
      "level": "medium",
      "order": 7,
      "title": "进制转换忘了倒序",
      "summary": "二进制输出成了反的",
      "prompt": "读入十进制 n 和进制 base，输出 n 的 base 进制表示，10–15 用大写字母。",
      "source": "Beginning C++17 · 第 5 章 循环",
      "minutes": 9,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    long long n;\n    int base;\n    cin >> n >> base;\n    if (n == 0) { cout << 0 << \"\\n\"; return 0; }\n    string digits = \"0123456789ABCDEF\";\n    string s;\n    while (n > 0) {\n        s += digits[n % base];   // BUG: 低位先进入，最后没倒序\n        n /= base;\n    }\n    cout << s << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    long long n;\n    int base;\n    cin >> n >> base;\n    if (n == 0) { cout << 0 << \"\\n\"; return 0; }\n    string digits = \"0123456789ABCDEF\";\n    string s;\n    while (n > 0) {\n        s += digits[n % base];\n        n /= base;\n    }\n    reverse(s.begin(), s.end());\n    cout << s << \"\\n\";\n    return 0;\n}",
      "analysis": "除基取余先得到最低位，所以拼接完成后必须反转。255 转 16 进制是 FF，反转后看不出差别；10 转 2 进制就会暴露。",
      "hints": [
        "10 除以 2 第一次得到的余数是个位还是最高位？",
        "所有余数拼完后要 reverse。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "10 2",
          "expected": "1010"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "255 16",
          "expected": "FF"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "100 8",
          "expected": "144"
        }
      ],
      "targetMs": 80
    },
    {
      "id": "m8",
      "level": "medium",
      "order": 8,
      "title": "区间按右端点排序",
      "summary": "大区间被拆成两段",
      "prompt": "合并所有重叠或相邻的闭区间，按左端点升序输出。",
      "source": "C++ Primer Plus · 第 16 章 STL",
      "minutes": 10,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<pair<int, int>> v(n);\n    for (auto &p : v) cin >> p.first >> p.second;\n    sort(v.begin(), v.end(), [](auto &a, auto &b) {\n        return a.second < b.second;   // BUG: 应按左端点排序\n    });\n    vector<pair<int, int>> out;\n    for (auto &p : v) {\n        if (out.empty() || p.first > out.back().second + 1) out.push_back(p);\n        else out.back().second = max(out.back().second, p.second);\n    }\n    for (auto &p : out) cout << p.first << \" \" << p.second << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<pair<int, int>> v(n);\n    for (auto &p : v) cin >> p.first >> p.second;\n    sort(v.begin(), v.end());\n    vector<pair<int, int>> out;\n    for (auto &p : v) {\n        if (out.empty() || p.first > out.back().second + 1) out.push_back(p);\n        else out.back().second = max(out.back().second, p.second);\n    }\n    for (auto &p : out) cout << p.first << \" \" << p.second << \"\\n\";\n    return 0;\n}",
      "analysis": "合并区间必须先按左端点排序，才能保证当前区间之前的都处理过。按右端点排序时，一个长区间可能被后面的短区间切开，最后输出两段。",
      "hints": [
        "[1,10] 和 [2,3] 谁应该先处理？",
        "排序键应该是 first，不是 second。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "3\n1 10\n2 3\n4 5",
          "expected": "1 10"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "3\n1 3\n2 6\n8 10",
          "expected": "1 6\n8 10"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "3\n5 7\n1 2\n2 5",
          "expected": "1 7"
        }
      ],
      "targetMs": 90
    },
    {
      "id": "h1",
      "level": "hard",
      "order": 1,
      "title": "大数加法丢了最后一次进位",
      "summary": "999+1 输出 000",
      "prompt": "读入两个非负整数字符串，输出它们的和。",
      "source": "C++ Primer Plus · 第 5 章 循环",
      "minutes": 12,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string a, b;\n    cin >> a >> b;\n    string r;\n    int i = (int)a.size() - 1, j = (int)b.size() - 1, carry = 0;\n    while (i >= 0 || j >= 0) {\n        int s = carry;\n        if (i >= 0) s += a[i--] - '0';\n        if (j >= 0) s += b[j--] - '0';\n        r += char('0' + s % 10);\n        carry = s / 10;\n    }\n    // BUG: 循环结束后 carry 可能还是 1\n    reverse(r.begin(), r.end());\n    cout << r << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string a, b;\n    cin >> a >> b;\n    string r;\n    int i = (int)a.size() - 1, j = (int)b.size() - 1, carry = 0;\n    while (i >= 0 || j >= 0 || carry) {\n        int s = carry;\n        if (i >= 0) s += a[i--] - '0';\n        if (j >= 0) s += b[j--] - '0';\n        r += char('0' + s % 10);\n        carry = s / 10;\n    }\n    reverse(r.begin(), r.end());\n    cout << r << \"\\n\";\n    return 0;\n}",
      "analysis": "999+1 的每一位都产生进位，最高位进位后还要多写一个 1。把 `carry` 放进 while 条件，循环结束时就自动补上最高位。",
      "hints": [
        "999+1 逐位算完，carry 是多少？",
        "while 条件除了两个下标，还要考虑 carry。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "999 1",
          "expected": "1000"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "123456789 987654321",
          "expected": "1111111110"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "1 999",
          "expected": "1000"
        }
      ],
      "targetMs": 110
    },
    {
      "id": "h2",
      "level": "hard",
      "order": 2,
      "title": "严格递增用错了 upper_bound",
      "summary": "重复元素被算进 LIS",
      "prompt": "求最长严格递增子序列的长度，要求 O(n log n)。",
      "source": "Effective Modern C++ · 算法与迭代器",
      "minutes": 12,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> tails;\n    for (int i = 0; i < n; ++i) {\n        int x;\n        cin >> x;\n        auto it = upper_bound(tails.begin(), tails.end(), x);   // BUG: 严格递增要用 lower_bound\n        if (it == tails.end()) tails.push_back(x);\n        else *it = x;\n    }\n    cout << tails.size() << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> tails;\n    for (int i = 0; i < n; ++i) {\n        int x;\n        cin >> x;\n        auto it = lower_bound(tails.begin(), tails.end(), x);\n        if (it == tails.end()) tails.push_back(x);\n        else *it = x;\n    }\n    cout << tails.size() << \"\\n\";\n    return 0;\n}",
      "analysis": "`tails` 维护每个长度递增子序列的最小结尾。严格递增时，等于 x 的位置不能被替换成更小的长度，所以要用 `lower_bound`；`upper_bound` 会把相等元素接到后面，重复输入会不断增长。",
      "hints": [
        "序列 2 2 2 的 LIS 长度是多少？",
        "`lower_bound` 找第一个 >= x，`upper_bound` 找第一个 > x。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "6\n2 2 3 3 4 4",
          "expected": "3"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "5\n1 1 1 1 1",
          "expected": "1"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "8\n1 2 2 3 4 4 5 5",
          "expected": "5"
        }
      ],
      "targetMs": 110
    },
    {
      "id": "h3",
      "level": "hard",
      "order": 3,
      "title": "拓扑排序用了普通队列",
      "summary": "字典序最小的拓扑序不对",
      "prompt": "输出有向无环图字典序最小的拓扑序；有环输出 CYCLE。",
      "source": "A Tour of C++ · 第 12 章 容器与算法",
      "minutes": 12,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<vector<int>> g(n + 1);\n    vector<int> deg(n + 1);\n    for (int i = 0; i < m; ++i) {\n        int u, v;\n        cin >> u >> v;\n        g[u].push_back(v);\n        ++deg[v];\n    }\n    queue<int> q;                 // BUG: 普通队列不保证字典序\n    for (int i = 1; i <= n; ++i) if (!deg[i]) q.push(i);\n    vector<int> out;\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        out.push_back(u);\n        for (int v : g[u]) if (--deg[v] == 0) q.push(v);\n    }\n    if ((int)out.size() != n) { cout << \"CYCLE\\n\"; return 0; }\n    for (int i = 0; i < n; ++i) {\n        if (i) cout << \" \";\n        cout << out[i];\n    }\n    cout << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<vector<int>> g(n + 1);\n    vector<int> deg(n + 1);\n    for (int i = 0; i < m; ++i) {\n        int u, v;\n        cin >> u >> v;\n        g[u].push_back(v);\n        ++deg[v];\n    }\n    priority_queue<int, vector<int>, greater<int>> q;\n    for (int i = 1; i <= n; ++i) if (!deg[i]) q.push(i);\n    vector<int> out;\n    while (!q.empty()) {\n        int u = q.top(); q.pop();\n        out.push_back(u);\n        for (int v : g[u]) if (--deg[v] == 0) q.push(v);\n    }\n    if ((int)out.size() != n) { cout << \"CYCLE\\n\"; return 0; }\n    for (int i = 0; i < n; ++i) {\n        if (i) cout << \" \";\n        cout << out[i];\n    }\n    cout << \"\\n\";\n    return 0;\n}",
      "analysis": "普通队列按“谁先入队谁先出”，新释放的节点只能排到队尾，可能比队列里已有节点大。字典序最小要求每一步取当前所有入度为 0 的节点中编号最小的，所以用 `priority_queue` 小根堆。",
      "hints": [
        "初始入度为 0 的节点有 2、3、4，先取谁？",
        "处理 3 后 1 变 0；1 比 4 小，但普通队列会先取 4。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "4 1\n3 1",
          "expected": "2 3 1 4"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "5 4\n1 2\n2 3\n3 4\n4 5",
          "expected": "1 2 3 4 5"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "3 3\n1 2\n2 3\n3 1",
          "expected": "CYCLE"
        }
      ],
      "targetMs": 120
    },
    {
      "id": "h4",
      "level": "hard",
      "order": 4,
      "title": "高精度阶乘输出反了",
      "summary": "120 输出成 021",
      "prompt": "读入 n，输出 n! 的完整十进制值。按位存十进制的思路是对的，问题出在输出顺序。",
      "source": "C++ Primer Plus · 第 5 章 循环",
      "minutes": 12,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> d{1};\n    for (int i = 2; i <= n; ++i) {\n        int carry = 0;\n        for (int &x : d) {\n            int p = x * i + carry;\n            x = p % 10;\n            carry = p / 10;\n        }\n        while (carry) { d.push_back(carry % 10); carry /= 10; }\n    }\n    for (int i = 0; i < (int)d.size(); ++i) cout << d[i];   // BUG: 低位在前，没有倒序\n    cout << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> d{1};\n    for (int i = 2; i <= n; ++i) {\n        int carry = 0;\n        for (int &x : d) {\n            int p = x * i + carry;\n            x = p % 10;\n            carry = p / 10;\n        }\n        while (carry) { d.push_back(carry % 10); carry /= 10; }\n    }\n    for (int i = (int)d.size() - 1; i >= 0; --i) cout << d[i];\n    cout << \"\\n\";\n    return 0;\n}",
      "analysis": "vector 里 d[0] 是个位、d[1] 是十位……所以要从末尾向前输出。5! = 120 存成 {0,2,1}，正着输出就是 021。",
      "hints": [
        "5! 的个位、十位、百位分别存到哪个下标？",
        "最高位在 vector 的末尾。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "5",
          "expected": "120"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "10",
          "expected": "3628800"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "20",
          "expected": "2432902008176640000"
        }
      ],
      "targetMs": 120
    },
    {
      "id": "h5",
      "level": "hard",
      "order": 5,
      "title": "逆波兰的减法和除法反了",
      "summary": "5 3 - 输出 -2",
      "prompt": "计算后缀表达式，操作数为整数，除法按整数除法。",
      "source": "Beginning C++17 · 第 10 章 容器",
      "minutes": 12,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    stringstream ss(line);\n    vector<long long> st;\n    string tok;\n    while (ss >> tok) {\n        if (tok == \"+\" || tok == \"-\" || tok == \"*\" || tok == \"/\") {\n            long long a = st.back(); st.pop_back();\n            long long b = st.back(); st.pop_back();\n            if (tok == \"+\") st.push_back(a + b);\n            else if (tok == \"-\") st.push_back(a - b);   // BUG: 顺序反了\n            else if (tok == \"*\") st.push_back(a * b);\n            else st.push_back(a / b);                   // BUG: 顺序反了\n        } else st.push_back(stoll(tok));\n    }\n    cout << st.back() << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    stringstream ss(line);\n    vector<long long> st;\n    string tok;\n    while (ss >> tok) {\n        if (tok == \"+\" || tok == \"-\" || tok == \"*\" || tok == \"/\") {\n            long long b = st.back(); st.pop_back();\n            long long a = st.back(); st.pop_back();\n            if (tok == \"+\") st.push_back(a + b);\n            else if (tok == \"-\") st.push_back(a - b);\n            else if (tok == \"*\") st.push_back(a * b);\n            else st.push_back(a / b);\n        } else st.push_back(stoll(tok));\n    }\n    cout << st.back() << \"\\n\";\n    return 0;\n}",
      "analysis": "栈先弹出的是右操作数。`5 3 -` 应先弹出 3 记作 b，再弹出 5 记作 a，然后算 a-b。除法和减法都不满足交换律，顺序错了结果就错。",
      "hints": [
        "`5 3 -` 中谁先出栈？",
        "先出栈的是运算符右边的数。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "5 3 -",
          "expected": "2"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "3 4 + 2 *",
          "expected": "14"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "2 3 4 * + 10 /",
          "expected": "1"
        }
      ],
      "targetMs": 110
    },
    {
      "id": "h6",
      "level": "hard",
      "order": 6,
      "title": "0-1 背包写成了完全背包",
      "summary": "同一件物品被重复使用",
      "prompt": "有 n 件物品，每件只能用一次；背包容量 W，求最大价值。",
      "source": "C++ Primer Plus · 第 6 章 循环与算法",
      "minutes": 12,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, W;\n    cin >> n >> W;\n    vector<int> dp(W + 1, 0);\n    for (int i = 0; i < n; ++i) {\n        int w, v;\n        cin >> w >> v;\n        for (int j = w; j <= W; ++j)   // BUG: 正序会重复使用当前物品\n            dp[j] = max(dp[j], dp[j - w] + v);\n    }\n    cout << dp[W] << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, W;\n    cin >> n >> W;\n    vector<int> dp(W + 1, 0);\n    for (int i = 0; i < n; ++i) {\n        int w, v;\n        cin >> w >> v;\n        for (int j = W; j >= w; --j)\n            dp[j] = max(dp[j], dp[j - w] + v);\n    }\n    cout << dp[W] << \"\\n\";\n    return 0;\n}",
      "analysis": "0-1 背包每件物品只能用一次，容量必须从大到小倒序遍历，保证 `dp[j-w]` 还是“没放当前物品”的旧状态。正序遍历会让当前物品在同一轮里被反复加入。",
      "hints": [
        "当前物品价值 50、重量 4、容量 8，正序会发生什么？",
        "倒序保证 dp[j-w] 尚未被本轮更新。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "3 10\n5 10\n4 40\n6 30",
          "expected": "70"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "2 5\n4 10\n5 20",
          "expected": "20"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "4 8\n3 30\n4 50\n5 60\n2 10",
          "expected": "90"
        }
      ],
      "targetMs": 120
    },
    {
      "id": "h7",
      "level": "hard",
      "order": 7,
      "title": "Kruskal 边按降序排了",
      "summary": "最小生成树变成“较大生成树”",
      "prompt": "读入无向带权图，输出最小生成树的边权和；不连通输出 -1。",
      "source": "Beginning C++17 · 第 18 章 算法",
      "minutes": 12,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nstruct Edge { int u, v, w; };\nint find(vector<int> &p, int x) { return p[x] == x ? x : p[x] = find(p, p[x]); }\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<Edge> e(m);\n    for (auto &x : e) cin >> x.u >> x.v >> x.w;\n    sort(e.begin(), e.end(), [](const Edge &a, const Edge &b) {\n        return a.w > b.w;          // BUG: Kruskal 要从小到大\n    });\n    vector<int> p(n + 1);\n    iota(p.begin(), p.end(), 0);\n    int total = 0, used = 0;\n    for (auto &x : e) {\n        int a = find(p, x.u), b = find(p, x.v);\n        if (a == b) continue;\n        p[a] = b;\n        total += x.w;\n        if (++used == n - 1) break;\n    }\n    cout << (used == n - 1 ? to_string(total) : \"-1\") << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nstruct Edge { int u, v, w; };\nint find(vector<int> &p, int x) { return p[x] == x ? x : p[x] = find(p, p[x]); }\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<Edge> e(m);\n    for (auto &x : e) cin >> x.u >> x.v >> x.w;\n    sort(e.begin(), e.end(), [](const Edge &a, const Edge &b) {\n        return a.w < b.w;\n    });\n    vector<int> p(n + 1);\n    iota(p.begin(), p.end(), 0);\n    int total = 0, used = 0;\n    for (auto &x : e) {\n        int a = find(p, x.u), b = find(p, x.v);\n        if (a == b) continue;\n        p[a] = b;\n        total += x.w;\n        if (++used == n - 1) break;\n    }\n    cout << (used == n - 1 ? to_string(total) : \"-1\") << \"\\n\";\n    return 0;\n}",
      "analysis": "Kruskal 的贪心前提是每次取当前最小边。降序排序会先拿大边，生成树虽然连通但权值和不是最小。并查集负责判断成环，排序方向才是这里的 bug。",
      "hints": [
        "最小生成树应该优先选小边还是大边？",
        "把比较器从 `>` 改成 `<`。"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "4 5\n1 2 1\n1 3 3\n2 3 2\n3 4 4\n2 4 5",
          "expected": "7"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "3 3\n1 2 2\n2 3 3\n1 3 4",
          "expected": "5"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "2 1\n1 2 7",
          "expected": "7"
        }
      ],
      "targetMs": 120
    },
    {
      "id": "h8",
      "level": "hard",
      "order": 8,
      "title": "Dijkstra 用了最大堆还只访问一次",
      "summary": "绕路更短的路径被忽略",
      "prompt": "求 1 号点到 n 号点的最短距离；不可达输出 -1。边权为正。",
      "source": "A Tour of C++ · 第 12 章 容器与算法",
      "minutes": 15,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<vector<pair<int, int>>> g(n + 1);\n    for (int i = 0; i < m; ++i) {\n        int u, v, w;\n        cin >> u >> v >> w;\n        g[u].push_back({v, w});\n    }\n    vector<int> dist(n + 1, INT_MAX);\n    vector<bool> done(n + 1, false);\n    dist[1] = 0;\n    priority_queue<pair<int, int>> pq;   // BUG: 默认是最大堆\n    pq.push({0, 1});\n    while (!pq.empty()) {\n        auto [d, u] = pq.top(); pq.pop();\n        if (done[u]) continue;            // BUG: 最大堆下第一次弹出不一定最短\n        done[u] = true;\n        for (auto [v, w] : g[u]) {\n            if (dist[v] > dist[u] + w) {\n                dist[v] = dist[u] + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    cout << (dist[n] == INT_MAX ? -1 : dist[n]) << \"\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<vector<pair<int, int>>> g(n + 1);\n    for (int i = 0; i < m; ++i) {\n        int u, v, w;\n        cin >> u >> v >> w;\n        g[u].push_back({v, w});\n    }\n    vector<int> dist(n + 1, INT_MAX);\n    dist[1] = 0;\n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n    pq.push({0, 1});\n    while (!pq.empty()) {\n        auto [d, u] = pq.top(); pq.pop();\n        if (d != dist[u]) continue;\n        for (auto [v, w] : g[u]) {\n            if (dist[u] + w < dist[v]) {\n                dist[v] = dist[u] + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    cout << (dist[n] == INT_MAX ? -1 : dist[n]) << \"\\n\";\n    return 0;\n}",
      "analysis": "Dijkstra 每次必须取出当前距离最小的未确定节点。默认 `priority_queue<pair<int,int>>` 按字典序比较且是大根堆，会把距离大的点先弹出；再配合“只访问一次”，短路径就永远没机会更新。改成 `greater` 小根堆，并用 `d != dist[u]` 跳过过期条目。",
      "hints": [
        "默认 priority_queue 是大根堆还是小根堆？",
        "距离 11 的点会比距离 3 的点先被弹出吗？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "4 4\n1 2 10\n1 3 1\n3 2 2\n2 4 1",
          "expected": "4"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "3 2\n1 2 5\n1 3 2",
          "expected": "2"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "3 1\n1 2 10",
          "expected": "-1"
        }
      ],
      "targetMs": 130
    },
    {
      "id": "b9",
      "level": "basic",
      "order": 9,
      "title": "冒泡排序少扫了一位",
      "summary": "内层边界写小导致末尾没排到",
      "prompt": "读入 n 个整数，按升序输出。现在排序后的最后一段仍然乱序，先让 3 1 2 通过。",
      "source": "C++ Primer Plus · 第 6 章 循环",
      "minutes": 7,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n    for (int& x : a) cin >> x;\n    for (int i = 0; i < n - 1; ++i)\n        for (int j = 0; j < n - i - 2; ++j)   // BUG: 内层少扫一位\n            if (a[j] > a[j + 1]) swap(a[j], a[j + 1]);\n    for (int i = 0; i < n; ++i) cout << a[i] << (i + 1 == n ? '\\n' : ' ');\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> a(n);\n    for (int& x : a) cin >> x;\n    for (int i = 0; i < n - 1; ++i)\n        for (int j = 0; j < n - i - 1; ++j)\n            if (a[j] > a[j + 1]) swap(a[j], a[j + 1]);\n    for (int i = 0; i < n; ++i) cout << a[i] << (i + 1 == n ? '\\n' : ' ');\n    return 0;\n}",
      "analysis": "第 i 轮冒泡后，末尾 i 个元素已经就位，内层只需要扫到 `n-i-1`。写成 `n-i-2` 会漏掉每轮最后一个相邻比较，n=2 时甚至完全不比较。把边界改回 `j < n - i - 1`。",
      "hints": [
        "n=2 时内层循环执行几次？",
        "`j+1` 最大能取到哪个下标？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "3\n3 1 2",
          "expected": "1 2 3"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "4\n4 3 2 1",
          "expected": "1 2 3 4"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "5\n5 1 4 2 3",
          "expected": "1 2 3 4 5"
        }
      ],
      "targetMs": 70
    },
    {
      "id": "b10",
      "level": "basic",
      "order": 10,
      "title": "交换函数只改了副本",
      "summary": "值传递让交换没有生效",
      "prompt": "读入两个整数，交换后输出。现在 swap 调用后两个数还是原样。",
      "source": "C++ Primer Plus · 第 7 章 函数",
      "minutes": 6,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nvoid swap(int a, int b) {   // BUG: 传值，改的是副本\n    int t = a;\n    a = b;\n    b = t;\n}\nint main() {\n    int x, y;\n    cin >> x >> y;\n    swap(x, y);\n    cout << x << ' ' << y << '\\n';\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nvoid swap(int& a, int& b) {\n    int t = a;\n    a = b;\n    b = t;\n}\nint main() {\n    int x, y;\n    cin >> x >> y;\n    swap(x, y);\n    cout << x << ' ' << y << '\\n';\n    return 0;\n}",
      "analysis": "C++ 只有值传递；形参 `int a` 是实参的副本，函数里交换副本不会影响调用方。把参数改成 `int&` 传引用，函数体内的赋值才落到原对象。",
      "hints": [
        "函数返回后，main 里的 x 有没有被修改？",
        "引用参数需要在调用时写 & 吗？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "3 5",
          "expected": "5 3"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "-1 2",
          "expected": "2 -1"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "0 9",
          "expected": "9 0"
        }
      ],
      "targetMs": 65
    },
    {
      "id": "b11",
      "level": "basic",
      "order": 11,
      "title": "C 字符串用 == 比较",
      "summary": "指针比较永远不相等",
      "prompt": "输入 yes/no，输出 OK 或 NO。现在输入 yes 也被判成 NO。",
      "source": "Beginning C++17 · 第 7 章 字符串",
      "minutes": 6,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    char s[16];\n    cin >> s;\n    if (s == \"yes\") cout << \"OK\\n\";   // BUG: 比较的是指针\n    else cout << \"NO\\n\";\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    char s[16];\n    cin >> s;\n    if (strcmp(s, \"yes\") == 0) cout << \"OK\\n\";\n    else cout << \"NO\\n\";\n    return 0;\n}",
      "analysis": "数组名 `s` 退化成指向首元素的指针，`\"yes\"` 是另一个地址；`==` 比较地址而不是内容。C 字符串用 `strcmp`，C++ 的 `std::string` 才可以直接 `==`。",
      "hints": [
        "数组名在表达式里会变成什么？",
        "strcmp 返回 0 表示什么？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "yes",
          "expected": "OK"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "no",
          "expected": "NO"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "YES",
          "expected": "NO"
        }
      ],
      "targetMs": 65
    },
    {
      "id": "b12",
      "level": "basic",
      "order": 12,
      "title": "读到 0 就提前结束",
      "summary": "哨兵值其实是合法数据",
      "prompt": "读入 n 个整数并求和。现在遇到 0 就停止，后面的数全被丢掉。",
      "source": "C++ Primer Plus · 第 5 章 循环",
      "minutes": 6,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long sum = 0;\n    int x;\n    while (cin >> x && x != 0) sum += x;   // BUG: 0 被当成结束符\n    cout << sum << '\\n';\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long sum = 0;\n    for (int i = 0; i < n; ++i) {\n        int x;\n        cin >> x;\n        sum += x;\n    }\n    cout << sum << '\\n';\n    return 0;\n}",
      "analysis": "题目已经给了 n，循环次数就应该由 n 决定；用值 0 当哨兵会误伤合法数据。改成计数循环，0 也能正常参与求和。",
      "hints": [
        "输入里 0 是结束标志还是普通数据？",
        "n 在这个程序里有什么用？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "5\n1 0 2 3 4",
          "expected": "10"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "3\n0 0 0",
          "expected": "0"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "4\n-1 0 1 5",
          "expected": "5"
        }
      ],
      "targetMs": 65
    },
    {
      "id": "m9",
      "level": "medium",
      "order": 9,
      "title": "erase 之后又 ++ 跳过了元素",
      "summary": "遍历删除时的迭代器失效",
      "prompt": "读入 n 个整数，删除所有偶数，先输出剩余个数，再输出剩余元素。现在部分偶数被漏删。",
      "source": "Effective STL · Item 33；C++ Primer Plus · 第 16 章 vector",
      "minutes": 9,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> v(n);\n    for (int& x : v) cin >> x;\n    for (auto it = v.begin(); it != v.end(); ++it) {\n        if (*it % 2 == 0) v.erase(it);   // BUG: erase 后迭代器失效，++ 又跳一个\n    }\n    cout << v.size() << '\\n';\n    for (size_t i = 0; i < v.size(); ++i) cout << v[i] << (i + 1 == v.size() ? '\\n' : ' ');\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> v(n);\n    for (int& x : v) cin >> x;\n    for (auto it = v.begin(); it != v.end();) {\n        if (*it % 2 == 0) it = v.erase(it);\n        else ++it;\n    }\n    cout << v.size() << '\\n';\n    for (size_t i = 0; i < v.size(); ++i) cout << v[i] << (i + 1 == v.size() ? '\\n' : ' ');\n    return 0;\n}",
      "analysis": "`erase` 返回下一个有效元素，原迭代器立即失效；循环头再 `++it` 会跳过这个返回位置。删除分支用 `it = v.erase(it)` 且不要额外自增，保留分支才 `++it`。",
      "hints": [
        "erase 的返回值指向哪个元素？",
        "删除后执行 ++it 会跳过谁？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "5\n1 2 3 4 5",
          "expected": "3\n1 3 5"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "4\n2 4 6 8",
          "expected": "0\n"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "6\n2 1 4 3 6 5",
          "expected": "3\n1 3 5"
        }
      ],
      "targetMs": 85
    },
    {
      "id": "m10",
      "level": "medium",
      "order": 10,
      "title": "累加和装进了 int",
      "summary": "大数求和溢出",
      "prompt": "读入 n 个整数并求和。现在大数用例会输出负数或明显错误的结果。",
      "source": "C++ Primer Plus · 第 3 章 数据类型",
      "minutes": 8,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int sum = 0;   // BUG: int 装不下大和\n    for (int i = 0; i < n; ++i) {\n        int x;\n        cin >> x;\n        sum += x;\n    }\n    cout << sum << '\\n';\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long sum = 0;\n    for (int i = 0; i < n; ++i) {\n        int x;\n        cin >> x;\n        sum += x;\n    }\n    cout << sum << '\\n';\n    return 0;\n}",
      "analysis": "单个元素可以用 int，但 n 个 10^9 相加会超过 32 位范围。累加器必须用 `long long`；`sum += x` 会先把结果转成 long long 再存回，不会截断。",
      "hints": [
        "int 最大约 21 亿，3 个 10 亿相加是多少？",
        "只改输出格式能解决溢出吗？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "3\n1000000000 1000000000 1000000000",
          "expected": "3000000000"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "4\n2000000000 2000000000 1 1",
          "expected": "4000000002"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "2\n-1000000000 -1000000000",
          "expected": "-2000000000"
        }
      ],
      "targetMs": 80
    },
    {
      "id": "m11",
      "level": "medium",
      "order": 11,
      "title": "range-for 改的是副本",
      "summary": "auto 少了引用，元素没翻倍",
      "prompt": "读入 n 个整数，把每个元素翻倍后输出。现在输出还是原值。",
      "source": "Effective Modern C++ · Item 1；C++ Primer Plus · 第 16 章",
      "minutes": 8,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> v(n);\n    for (int& x : v) cin >> x;\n    for (auto x : v) x *= 2;   // BUG: x 是每个元素的副本\n    for (size_t i = 0; i < v.size(); ++i) cout << v[i] << (i + 1 == v.size() ? '\\n' : ' ');\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> v(n);\n    for (int& x : v) cin >> x;\n    for (auto& x : v) x *= 2;\n    for (size_t i = 0; i < v.size(); ++i) cout << v[i] << (i + 1 == v.size() ? '\\n' : ' ');\n    return 0;\n}",
      "analysis": "`auto x` 按值拷贝元素，修改副本不会回写容器；`auto& x` 绑定到真实元素。只读遍历可以 `const auto&`，需要修改时必须 `auto&`。",
      "hints": [
        "auto 和 auto& 在 range-for 里分别绑定什么？",
        "如果要避免复制又只想读，应该写什么？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "4\n1 2 3 4",
          "expected": "2 4 6 8"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "3\n-1 0 5",
          "expected": "-2 0 10"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "2\n100 200",
          "expected": "200 400"
        }
      ],
      "targetMs": 80
    },
    {
      "id": "m12",
      "level": "medium",
      "order": 12,
      "title": "矩阵按列求和",
      "summary": "循环顺序与输出维度错位",
      "prompt": "读入 n 行 m 列的矩阵，输出每一行的和。现在输出的是每一列的和，行数也变成了 m。",
      "source": "C++ Primer Plus · 第 16 章 数组",
      "minutes": 9,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<vector<int>> a(n, vector<int>(m));\n    for (int i = 0; i < n; ++i)\n        for (int j = 0; j < m; ++j) cin >> a[i][j];\n    for (int j = 0; j < m; ++j) {          // BUG: 外层是列\n        long long s = 0;\n        for (int i = 0; i < n; ++i) s += a[i][j];   // 累加的是第 j 列\n        cout << s << '\\n';\n    }\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<vector<int>> a(n, vector<int>(m));\n    for (int i = 0; i < n; ++i)\n        for (int j = 0; j < m; ++j) cin >> a[i][j];\n    for (int i = 0; i < n; ++i) {\n        long long s = 0;\n        for (int j = 0; j < m; ++j) s += a[i][j];\n        cout << s << '\\n';\n    }\n    return 0;\n}",
      "analysis": "题目要“每行一个和”，外层循环就必须遍历行 i，内层遍历列 j。原代码把 i/j 角色对调，既算错维度，也输出 m 行而不是 n 行。",
      "hints": [
        "输出行数应该等于 n 还是 m？",
        "a[i][j] 的第一个下标代表行还是列？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "2 3\n1 2 3\n4 5 6",
          "expected": "6\n15"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "3 2\n1 1\n2 2\n3 3",
          "expected": "2\n4\n6"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "2 2\n-1 1\n5 -5",
          "expected": "0\n0"
        }
      ],
      "targetMs": 85
    },
    {
      "id": "h9",
      "level": "hard",
      "order": 9,
      "title": "LCS 相等时用错了转移",
      "summary": "相等却取了 max 而不是左上 +1",
      "prompt": "求两个字符串的最长公共子序列长度。现在字符相等的位置也没有延长公共子序列。",
      "source": "C++ Primer Plus · 第 17 章；算法导论 · 动态规划",
      "minutes": 12,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string a, b;\n    cin >> a >> b;\n    int n = a.size(), m = b.size();\n    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));\n    for (int i = 1; i <= n; ++i) {\n        for (int j = 1; j <= m; ++j) {\n            if (a[i - 1] == b[j - 1])\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);   // BUG: 应取左上 +1\n            else\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    cout << dp[n][m] << '\\n';\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string a, b;\n    cin >> a >> b;\n    int n = a.size(), m = b.size();\n    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));\n    for (int i = 1; i <= n; ++i) {\n        for (int j = 1; j <= m; ++j) {\n            if (a[i - 1] == b[j - 1])\n                dp[i][j] = dp[i - 1][j - 1] + 1;\n            else\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    cout << dp[n][m] << '\\n';\n    return 0;\n}",
      "analysis": "当 a[i-1] 与 b[j-1] 相等时，这个字符可以接到 `dp[i-1][j-1]` 的最优解后面，长度加 1；取上/左最大值只表示“不用这个字符”，会丢掉这次匹配。",
      "hints": [
        "相等时为什么不用 max(上, 左)？",
        "dp[i-1][j-1] 对应哪个子问题？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "abcde\nace",
          "expected": "3"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "abc\ndef",
          "expected": "0"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "aaaa\naa",
          "expected": "2"
        }
      ],
      "targetMs": 110
    },
    {
      "id": "h10",
      "level": "hard",
      "order": 10,
      "title": "并查集把非根节点直接挂走",
      "summary": "union 前没先 find，子树被拆散",
      "prompt": "读入 n 个点和 m 条无向边，输出连通分量个数。现在部分已经连通的点被算成两个分量。",
      "source": "算法导论 · 并查集；C++ Primer Plus · 第 17 章",
      "minutes": 14,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint parent[100005];\nint find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }\nint main() {\n    int n, m;\n    cin >> n >> m;\n    for (int i = 1; i <= n; ++i) parent[i] = i;\n    for (int i = 0; i < m; ++i) {\n        int u, v;\n        cin >> u >> v;\n        parent[u] = v;   // BUG: 没有先找根，可能把整棵子树挂走\n    }\n    int cnt = 0;\n    for (int i = 1; i <= n; ++i) if (find(i) == i) ++cnt;\n    cout << cnt << '\\n';\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint parent[100005];\nint find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }\nint main() {\n    int n, m;\n    cin >> n >> m;\n    for (int i = 1; i <= n; ++i) parent[i] = i;\n    for (int i = 0; i < m; ++i) {\n        int u, v;\n        cin >> u >> v;\n        int ru = find(u), rv = find(v);\n        if (ru != rv) parent[ru] = rv;\n    }\n    int cnt = 0;\n    for (int i = 1; i <= n; ++i) if (find(i) == i) ++cnt;\n    cout << cnt << '\\n';\n    return 0;\n}",
      "analysis": "合并两个集合必须把“根”挂到“根”上。直接 `parent[u] = v` 在 u 不是根时，会把 u 下面整棵子树从原集合拆出来，连通关系就丢了。先 `find(u)`、`find(v)`，不同根才合并。",
      "hints": [
        "parent[u]=v 修改的是 u 的父指针还是根？",
        "如果 u 是某棵子树的中间节点，它的孩子还认它吗？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "3 2\n1 2\n1 3",
          "expected": "1"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "5 4\n1 2\n2 3\n1 3\n4 5",
          "expected": "2"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "4 3\n1 2\n1 3\n1 4",
          "expected": "1"
        }
      ],
      "targetMs": 110
    },
    {
      "id": "h11",
      "level": "hard",
      "order": 11,
      "title": "重边让入度永远减不完",
      "summary": "拓扑排序的入度与邻接表不一致",
      "prompt": "读入 n 个点、m 条有向边，输出字典序最小的拓扑序；有环输出 CYCLE。现在有重边的图会卡住。",
      "source": "算法导论 · 拓扑排序；C++ Primer Plus · 第 17 章",
      "minutes": 14,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<set<int>> g(n + 1);\n    vector<int> indeg(n + 1, 0);\n    for (int i = 0; i < m; ++i) {\n        int u, v;\n        cin >> u >> v;\n        g[u].insert(v);\n        ++indeg[v];          // BUG: 重边只存一次，却加了两次入度\n    }\n    priority_queue<int, vector<int>, greater<int>> q;\n    for (int i = 1; i <= n; ++i) if (!indeg[i]) q.push(i);\n    vector<int> out;\n    while (!q.empty()) {\n        int u = q.top(); q.pop();\n        out.push_back(u);\n        for (int v : g[u])\n            if (--indeg[v] == 0) q.push(v);\n    }\n    if ((int)out.size() != n) { cout << \"CYCLE\\n\"; return 0; }\n    for (size_t i = 0; i < out.size(); ++i) cout << out[i] << (i + 1 == out.size() ? '\\n' : ' ');\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<set<int>> g(n + 1);\n    vector<int> indeg(n + 1, 0);\n    for (int i = 0; i < m; ++i) {\n        int u, v;\n        cin >> u >> v;\n        if (g[u].insert(v).second) ++indeg[v];\n    }\n    priority_queue<int, vector<int>, greater<int>> q;\n    for (int i = 1; i <= n; ++i) if (!indeg[i]) q.push(i);\n    vector<int> out;\n    while (!q.empty()) {\n        int u = q.top(); q.pop();\n        out.push_back(u);\n        for (int v : g[u])\n            if (--indeg[v] == 0) q.push(v);\n    }\n    if ((int)out.size() != n) { cout << \"CYCLE\\n\"; return 0; }\n    for (size_t i = 0; i < out.size(); ++i) cout << out[i] << (i + 1 == out.size() ? '\\n' : ' ');\n    return 0;\n}",
      "analysis": "邻接表用 `set` 去重，但入度按输入边数累加，重边会让 v 的入度多 1，而遍历邻接表只会减 1，v 永远进不了队列。要么用 multiset 保留重边，要么插入成功时才增加入度。",
      "hints": [
        "g[u].insert(v) 返回的 second 表示什么？",
        "重边对入度和邻接表应该产生同样次数的影响吗？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "4 4\n1 2\n1 2\n1 3\n2 4",
          "expected": "1 2 3 4"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "4 4\n1 2\n1 3\n2 4\n3 4",
          "expected": "1 2 3 4"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "3 3\n1 2\n2 3\n3 1",
          "expected": "CYCLE"
        }
      ],
      "targetMs": 115
    },
    {
      "id": "h12",
      "level": "hard",
      "order": 12,
      "title": "无向图只存了单向边",
      "summary": "反向最短路永远不可达",
      "prompt": "读入一张无向带权图，求 1 到 n 的最短距离；不可达输出 -1。现在从 1 出发常常直接判成不可达。",
      "source": "C++ Primer Plus · 第 17 章；算法导论 · 最短路",
      "minutes": 14,
      "code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<vector<pair<int, int>>> g(n + 1);\n    for (int i = 0; i < m; ++i) {\n        int u, v, w;\n        cin >> u >> v >> w;\n        g[u].push_back({v, w});   // BUG: 无向图只加了 u→v\n    }\n    const long long INF = (long long)4e18;\n    vector<long long> dist(n + 1, INF);\n    dist[1] = 0;\n    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;\n    pq.push({0, 1});\n    while (!pq.empty()) {\n        auto [d, u] = pq.top(); pq.pop();\n        if (d != dist[u]) continue;\n        for (auto [v, w] : g[u]) {\n            if (d + w < dist[v]) {\n                dist[v] = d + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    cout << (dist[n] == INF ? -1 : dist[n]) << '\\n';\n    return 0;\n}",
      "fixed": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    vector<vector<pair<int, int>>> g(n + 1);\n    for (int i = 0; i < m; ++i) {\n        int u, v, w;\n        cin >> u >> v >> w;\n        g[u].push_back({v, w});\n        g[v].push_back({u, w});\n    }\n    const long long INF = (long long)4e18;\n    vector<long long> dist(n + 1, INF);\n    dist[1] = 0;\n    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;\n    pq.push({0, 1});\n    while (!pq.empty()) {\n        auto [d, u] = pq.top(); pq.pop();\n        if (d != dist[u]) continue;\n        for (auto [v, w] : g[u]) {\n            if (d + w < dist[v]) {\n                dist[v] = d + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    cout << (dist[n] == INF ? -1 : dist[n]) << '\\n';\n    return 0;\n}",
      "analysis": "无向边 u—v 等价于同时存在 u→v 和 v→u。只加 `g[u].push_back({v,w})` 时，从 1 出发走到某点后可能再也回不去；补上反向边即可。",
      "hints": [
        "无向边应该向邻接表加几条有向边？",
        "如果题目改成有向图，还需要加反向边吗？"
      ],
      "tests": [
        {
          "public": true,
          "label": "公开样例",
          "stdin": "4 3\n1 2 1\n3 2 1\n3 4 1",
          "expected": "3"
        },
        {
          "public": false,
          "label": "隐藏用例 1",
          "stdin": "2 1\n2 1 5",
          "expected": "5"
        },
        {
          "public": false,
          "label": "隐藏用例 2",
          "stdin": "4 3\n1 3 4\n3 2 2\n2 4 1",
          "expected": "7"
        }
      ],
      "targetMs": 120
    }
  ]
};
