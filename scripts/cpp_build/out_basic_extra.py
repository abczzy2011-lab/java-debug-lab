# -*- coding: utf-8 -*-
"""C++ 输出实现场：新增的 25 道入门题。"""

HEAD = """#include <bits/stdc++.h>
using namespace std;

"""

def T(i, title, subtitle, brief, goal, hints, concepts, tests, code, fast_ms=30, input_desc="", output_desc=""):
    return {
        "id": f"b{i}", "level": "basic", "order": i,
        "title": title, "subtitle": subtitle, "brief": brief, "goal": goal,
        "hints": hints, "concepts": concepts, "tests": tests,
        "program": HEAD + code.strip() + "\n",
        "fastMs": fast_ms, "input": input_desc or "见题面。",
        "output": output_desc or "按题面要求输出。",
    }

TASKS = [
T(10, "三个数排序", "交换与分支", "把三个整数排成非降序。",
  "读入三个整数 a、b、c，输出一行升序结果，数字之间用一个空格分隔。",
  ["先让 a≤b，再让 b≤c，最后再检查一次 a≤b。", "三次比较交换就能覆盖全部大小关系。"],
  ["分支", "swap", "排序网络"],
  ["3 1 2", "-5 0 9", "10 10 1"],
  """int main() {
    long long a, b, c; cin >> a >> b >> c;
    if (a > b) swap(a, b);
    if (b > c) swap(b, c);
    if (a > b) swap(a, b);
    cout << a << ' ' << b << ' ' << c << '\\n';
    return 0;
}""", input_desc="一行三个整数，范围 -10^9 到 10^9。", output_desc="一行三个升序整数。"),

T(11, "奇数与偶数和", "奇偶性与累加", "把奇数和偶数分别累加。",
  "读入 n 和 n 个整数，分别输出偶数的和与奇数的和。",
  ["用 long long 保存和，避免大数溢出。", "负数取模在 C++ 中仍可能得到负余数，判断奇偶时可用 x % 2 != 0。"],
  ["循环", "奇偶", "long long"],
  ["5\\n1 2 3 4 5", "4\\n-2 -1 0 7", "6\\n10 10 10 3 3 3"],
  """int main() {
    int n; cin >> n;
    long long even = 0, odd = 0;
    for (int i = 0; i < n; ++i) {
        long long x; cin >> x;
        if (x % 2 == 0) even += x; else odd += x;
    }
    cout << even << ' ' << odd << '\\n';
    return 0;
}"""),

T(12, "成绩等级", "区间判断", "把百分制成绩映射成 A–F。",
  "读入一个整数分数 s（0≤s≤100），按 90–100 为 A、80–89 为 B、70–79 为 C、60–69 为 D、其余为 F 输出等级。",
  ["从高分段往低分段写 else-if，条件不必重复上界。", "先把 s≥90 写在最前面。"],
  ["if/else", "阈值", "区间"],
  ["95", "72", "0"],
  """int main() {
    int s; cin >> s;
    if (s >= 90) cout << 'A';
    else if (s >= 80) cout << 'B';
    else if (s >= 70) cout << 'C';
    else if (s >= 60) cout << 'D';
    else cout << 'F';
    cout << '\\n';
    return 0;
}"""),

T(13, "闰年判断", "公历规则", "判断年份是不是闰年。",
  "读入年份 y，闰年输出 YES，否则输出 NO。闰年的规则是：能被 400 整除，或能被 4 整除但不能被 100 整除。",
  ["四条规则有先后关系，400 的倍数优先。", "用 `(y % 400 == 0 || (y % 4 == 0 && y % 100 != 0))` 一次判断。"],
  ["布尔表达式", "取模", "闰年"],
  ["2000", "1900", "2024"],
  """int main() {
    long long y; cin >> y;
    bool leap = (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0);
    cout << (leap ? "YES" : "NO") << '\\n';
    return 0;
}"""),

T(14, "水仙花数", "按位拆数", "找出区间内的水仙花数。",
  "读入 L、R（100≤L≤R≤999），按从小到大输出区间内所有水仙花数，数之间用空格分隔；没有则输出 -1。",
  ["百位 n/100，十位 n/10%10，个位 n%10。", "用 first 标记控制空格。"],
  ["循环", "数位", "水仙花数"],
  ["100 200", "150 160", "900 999"],
  """int main() {
    int L, R; cin >> L >> R;
    bool first = true;
    for (int n = L; n <= R; ++n) {
        int a = n / 100, b = n / 10 % 10, c = n % 10;
        if (a*a*a + b*b*b + c*c*c == n) {
            if (!first) cout << ' ';
            cout << n; first = false;
        }
    }
    if (first) cout << -1;
    cout << '\\n';
    return 0;
}"""),

T(15, "乘法表", "固定宽度与循环", "输出 1 到 n 的乘法表。",
  "读入 n（1≤n≤9），输出 n 行乘法表。第 i 行输出 i×1 到 i×n，每项形如 `i*j=积`，项之间用空格分隔。",
  ["外层枚举行，内层枚举列。", "每行末尾不要多输出空格。"],
  ["嵌套循环", "格式化输出"],
  ["3", "5", "9"],
  """int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= n; ++j) {
            if (j > 1) cout << ' ';
            cout << i << '*' << j << '=' << i * j;
        }
        cout << '\\n';
    }
    return 0;
}"""),

T(16, "统计元音", "字符遍历", "统计一行小写英文里的元音。",
  "读入一行小写字母和空格，统计元音 a、e、i、o、u 出现的总次数。",
  ["用 getline 读整行，避免空格截断。", "把五个元音写成一个字符串，再用 find 判断。"],
  ["getline", "字符", "统计"],
  ["hello world", "aeiou", "rhythm"],
  """int main() {
    string s; getline(cin, s);
    string vowels = "aeiou";
    int count = 0;
    for (char ch : s) if (vowels.find(ch) != string::npos) ++count;
    cout << count << '\\n';
    return 0;
}"""),

T(17, "斐波那契前 n 项", "递推与边界", "输出斐波那契数列的前 n 项。",
  "读入 n（1≤n≤50），输出斐波那契数列的前 n 项，项之间用空格分隔。规定 F(1)=1、F(2)=1。",
  ["用两个变量滚动，避免数组。", "n=1 时不要输出第二项。"],
  ["递推", "long long", "边界"],
  ["5", "1", "10"],
  """int main() {
    int n; cin >> n;
    long long a = 1, b = 1;
    for (int i = 1; i <= n; ++i) {
        if (i > 1) cout << ' ';
        if (i == 1) cout << a;
        else if (i == 2) cout << b;
        else { long long c = a + b; a = b; b = c; cout << b; }
    }
    cout << '\\n';
    return 0;
}""", input_desc="一行，整数 n。", output_desc="一行前 n 项。"),

T(18, "回文判断", "双指针", "判断字符串是否正读反读相同。",
  "读入一个不含空格的小写字符串 s，如果它是回文输出 YES，否则输出 NO。",
  ["用两个下标从两端向中间靠拢。", "只要有一对字符不相等就可以提前判定失败。"],
  ["双指针", "字符串"],
  ["level", "abc", "a"],
  """int main() {
    string s; cin >> s;
    int i = 0, j = (int)s.size() - 1;
    bool ok = true;
    while (i < j) { if (s[i] != s[j]) { ok = false; break; } ++i; --j; }
    cout << (ok ? "YES" : "NO") << '\\n';
    return 0;
}"""),

T(19, "最大值与下标", "记录位置", "找最大值第一次出现的位置。",
  "读入 n 和 n 个整数，输出最大值以及它第一次出现的下标（下标从 1 开始）。",
  ["初始化最大值用第一个元素，不要用 0。", "只有严格大于当前最大值时才更新下标。"],
  ["线性扫描", "下标"],
  ["5\\n3 9 2 9 1", "3\\n-5 -2 -9", "1\\n42"],
  """int main() {
    int n; cin >> n;
    long long best; int pos = 1;
    for (int i = 1; i <= n; ++i) {
        long long x; cin >> x;
        if (i == 1 || x > best) { best = x; pos = i; }
    }
    cout << best << ' ' << pos << '\\n';
    return 0;
}"""),

T(20, "去重排序", "set 与排序", "把数组去重后升序输出。",
  "读入 n 和 n 个整数，输出去重后的升序序列，数字间用空格分隔。",
  ["set 会自动去重并保持升序。", "也可以先排序再 unique。"],
  ["set", "去重", "排序"],
  ["6\\n3 1 3 2 1 4", "5\\n5 5 5 5 5", "7\\n-1 2 -1 3 2 0 3"],
  """int main() {
    int n; cin >> n;
    set<long long> s;
    for (int i = 0; i < n; ++i) { long long x; cin >> x; s.insert(x); }
    bool first = true;
    for (long long x : s) { if (!first) cout << ' '; cout << x; first = false; }
    cout << '\\n';
    return 0;
}"""),

T(21, "单词计数", "按空白切分", "统计一行里有多少个单词。",
  "读入一行英文，单词之间用一个或多个空格分隔，输出单词个数。",
  ["用 stringstream 按空白切词。", "行首行尾的空格会被自动忽略。"],
  ["stringstream", "分词"],
  ["hello world", "  one   two three  ", "C++ is fun"],
  """int main() {
    string line; getline(cin, line);
    stringstream ss(line);
    string w; int count = 0;
    while (ss >> w) ++count;
    cout << count << '\\n';
    return 0;
}"""),

T(22, "大小写互换", "字符分类", "把字母的大小写全部翻转。",
  "读入一行字符串，把所有小写字母改成大写、大写字母改成小写，其他字符不动。",
  ["isupper / islower / toupper / tolower 都在 cctype。", "整行读取才能保留空格。"],
  ["cctype", "字符变换"],
  ["Hello World 123", "abcXYZ", "C++20"],
  """int main() {
    string s; getline(cin, s);
    for (char &ch : s) {
        if (islower((unsigned char)ch)) ch = toupper((unsigned char)ch);
        else if (isupper((unsigned char)ch)) ch = tolower((unsigned char)ch);
    }
    cout << s << '\\n';
    return 0;
}"""),

T(23, "唯一单数", "异或性质", "在一堆成对数字里找出落单的那个。",
  "读入 n（n 为奇数）和 n 个整数，除一个数外其余都出现两次，输出只出现一次的数。",
  ["a xor a = 0，0 xor x = x。", "把所有数异或起来，剩下的就是答案。"],
  ["异或", "位运算"],
  ["5\\n2 3 2 4 4", "3\\n7 7 9", "7\\n1 2 1 3 2 4 3"],
  """int main() {
    int n; cin >> n;
    long long ans = 0;
    for (int i = 0; i < n; ++i) { long long x; cin >> x; ans ^= x; }
    cout << ans << '\\n';
    return 0;
}"""),

T(24, "数位和", "取模与整除", "求一个整数的各位数字之和。",
  "读入一个非负整数 n（n 可以到 10^18），输出它的数位和。",
  ["while(n){ sum += n%10; n/=10; }。", "用 long long 保存输入。"],
  ["while", "取模", "long long"],
  ["12345", "0", "999999999999999999"],
  """int main() {
    long long n; cin >> n;
    int sum = 0;
    while (n > 0) { sum += n % 10; n /= 10; }
    cout << sum << '\\n';
    return 0;
}"""),

T(25, "三角形判断", "三边关系", "判断三角形类型。",
  "读入三个正整数 a、b、c，若不能构成三角形输出 INVALID；能构成时，等边输出 EQUILATERAL，等腰输出 ISOSCELES，否则输出 SCALENE。",
  ["先判断任意两边之和是否大于第三边。", "等边一定也是等腰，所以等边分支放在前面。"],
  ["条件", "三角形", "分类"],
  ["3 4 5", "2 2 3", "1 2 3"],
  """int main() {
    long long a, b, c; cin >> a >> b >> c;
    if (a + b <= c || a + c <= b || b + c <= a) cout << "INVALID";
    else if (a == b && b == c) cout << "EQUILATERAL";
    else if (a == b || a == c || b == c) cout << "ISOSCELES";
    else cout << "SCALENE";
    cout << '\\n';
    return 0;
}"""),

T(26, "简易计算器", "字符分支与除零", "实现两个整数的四则运算。",
  "读入 `a op b`，op 是 +、-、*、/ 之一。输出整数结果；除法遇到除数为 0 时输出 ERROR。",
  ["先读 a，再读 op，再读 b，char 会自动跳过空白。", "除零要单独判断，不能先算再判断。"],
  ["char", "switch", "除零"],
  ["7 + 3", "8 / 2", "9 / 0"],
  """int main() {
    long long a, b; char op;
    cin >> a >> op >> b;
    if (op == '+') cout << a + b;
    else if (op == '-') cout << a - b;
    else if (op == '*') cout << a * b;
    else if (op == '/') { if (b == 0) { cout << "ERROR"; return 0; } cout << a / b; }
    else cout << "ERROR";
    cout << '\\n';
    return 0;
}"""),

T(27, "一年中的第几天", "月长与闰年", "计算日期是当年的第几天。",
  "读入 y、m、d，输出这一天是当年的第几天。年份按公历闰年规则处理。",
  ["准备平年每月天数数组，闰年时把二月改成 29。", "累加前面整月，再加上 d。"],
  ["数组", "闰年", "日期"],
  ["2024 3 1", "2023 12 31", "2000 2 29"],
  """int main() {
    int y, m, d; cin >> y >> m >> d;
    int days[] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    bool leap = (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0);
    if (leap) days[2] = 29;
    int ans = d;
    for (int i = 1; i < m; ++i) ans += days[i];
    cout << ans << '\\n';
    return 0;
}"""),

T(28, "菱形打印", "上下对称", "用星号画一个菱形。",
  "读入奇数 n（1≤n≤19），输出由 * 构成的菱形，最宽的一行有 n 个星号。",
  ["上半部分从 1 到 n，步长 2；下半部分从 n-2 开始递减。", "每行先打印空格，再打印星号，行末不要多余空格。"],
  ["循环", "对称", "空格"],
  ["5", "3", "7"],
  """int main() {
    int n; cin >> n;
    int mid = n / 2;
    for (int i = 0; i <= mid; ++i) {
        for (int j = 0; j < mid - i; ++j) cout << ' ';
        for (int j = 0; j < 2 * i + 1; ++j) cout << '*';
        cout << '\\n';
    }
    for (int i = mid - 1; i >= 0; --i) {
        for (int j = 0; j < mid - i; ++j) cout << ' ';
        for (int j = 0; j < 2 * i + 1; ++j) cout << '*';
        cout << '\\n';
    }
    return 0;
}"""),

T(29, "二进制表示", "进制与位运算", "把非负整数转成二进制。",
  "读入非负整数 n（0≤n≤10^12），输出它的二进制表示，不带前导零；n=0 时输出 0。",
  ["不断取最低位，再压栈或反转。", "n=0 是单独边界。"],
  ["进制", "位运算", "vector"],
  ["13", "0", "1024"],
  """int main() {
    long long n; cin >> n;
    if (n == 0) { cout << 0 << '\\n'; return 0; }
    string s;
    while (n > 0) { s.push_back('0' + n % 2); n /= 2; }
    reverse(s.begin(), s.end());
    cout << s << '\\n';
    return 0;
}"""),

T(30, "正负零分类", "符号统计", "统计负数、零和正数的个数。",
  "读入 n 和 n 个整数，输出负数个数、零的个数、正数个数，用空格分隔。",
  ["三个计数器初始化为 0。", "0 不是正数也不是负数。"],
  ["计数", "分支"],
  ["6\\n-1 0 2 -3 0 4", "3\\n0 0 0", "4\\n-5 -2 -1 -9"],
  """int main() {
    int n; cin >> n;
    int neg = 0, zero = 0, pos = 0;
    for (int i = 0; i < n; ++i) {
        long long x; cin >> x;
        if (x < 0) ++neg; else if (x == 0) ++zero; else ++pos;
    }
    cout << neg << ' ' << zero << ' ' << pos << '\\n';
    return 0;
}"""),

T(31, "数组逆序", "原地交换", "把数组倒过来输出。",
  "读入 n 和 n 个整数，输出去重前的逆序序列，数字间用空格分隔。",
  ["从两端向中间交换。", "也可以直接从后往前输出，但题目要求逆序数组。"],
  ["reverse", "双指针"],
  ["5\\n1 2 3 4 5", "1\\n9", "4\\n-1 0 7 2"],
  """int main() {
    int n; cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    reverse(a.begin(), a.end());
    for (int i = 0; i < n; ++i) { if (i) cout << ' '; cout << a[i]; }
    cout << '\\n';
    return 0;
}"""),

T(32, "首个负数", "提前返回", "找出第一个负数的位置。",
  "读入 n 和 n 个整数，输出第一个负数的下标（从 1 开始）；没有负数输出 -1。",
  ["边读边判断，找到后可以立即输出。", "不要等整个数组读完再找，除非保存了下标。"],
  ["扫描", "下标"],
  ["5\\n3 -1 2 -4 5", "4\\n1 2 3 4", "3\\n-9 -8 -7"],
  """int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; ++i) {
        long long x; cin >> x;
        if (x < 0) { cout << i << '\\n'; return 0; }
    }
    cout << -1 << '\\n';
    return 0;
}"""),

T(33, "最小值出现次数", "并列处理", "统计最小值出现了几次。",
  "读入 n 和 n 个整数，输出最小值和它出现的次数。",
  ["第一个元素同时初始化最小值和计数。", "等于最小值时增加计数，严格更小则重置计数。"],
  ["扫描", "计数"],
  ["5\\n3 1 4 1 1", "3\\n-2 -2 -2", "4\\n9 8 7 6"],
  """int main() {
    int n; cin >> n;
    long long best = 0; int count = 0;
    for (int i = 0; i < n; ++i) {
        long long x; cin >> x;
        if (i == 0 || x < best) { best = x; count = 1; }
        else if (x == best) ++count;
    }
    cout << best << ' ' << count << '\\n';
    return 0;
}"""),

T(34, "字符替换", "遍历与替换", "把字符串里的一个字符全部换掉。",
  "读入一行字符串 s，再读入两个字符 a、b，把 s 中所有 a 替换成 b 后输出。",
  ["先 getline 读 s，再读 a、b。", "读字符时前面的换行会被 >> 自动跳过。"],
  ["getline", "replace", "字符"],
  ["banana\\na\\no", "hello world\\nl\\nL", "aaaa\\na\\nb"],
  """int main() {
    string s; getline(cin, s);
    char a, b; cin >> a >> b;
    for (char &ch : s) if (ch == a) ch = b;
    cout << s << '\\n';
    return 0;
}""", input_desc="第一行字符串，第二行两个字符。", output_desc="替换后的字符串。"),
]
