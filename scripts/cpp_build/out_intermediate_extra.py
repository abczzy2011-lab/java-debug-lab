# -*- coding: utf-8 -*-
"""C++ 输出实现场：新增的 25 道进阶题。"""
from out_basic_extra import HEAD

def T(i, title, subtitle, brief, goal, hints, concepts, tests, code, fast_ms=45, input_desc="", output_desc=""):
    return {
        "id": f"i{i}", "level": "intermediate", "order": i,
        "title": title, "subtitle": subtitle, "brief": brief, "goal": goal,
        "hints": hints, "concepts": concepts, "tests": tests,
        "program": HEAD + code.strip() + "\n",
        "fastMs": fast_ms, "input": input_desc or "见题面。",
        "output": output_desc or "按题面要求输出。",
    }

TASKS = [
T(10, "区间和查询", "前缀和", "用前缀和回答多个区间和。",
  "第一行 n、q，第二行 n 个整数，接下来 q 行每行 l、r（1-based）。对每个询问输出 a[l] 到 a[r] 的和。",
  ["pre[i] = pre[i-1] + a[i]。", "区间和是 pre[r] - pre[l-1]，不要把 l 减错。"],
  ["前缀和", "查询", "long long"],
  ["5 3\\n1 2 3 4 5\\n1 5\\n2 4\\n3 3", "4 2\\n-1 2 -3 4\\n1 2\\n2 4", "6 1\\n10 20 30 40 50 60\\n3 5"],
  """int main() {
    int n, q; cin >> n >> q;
    vector<long long> pre(n + 1, 0);
    for (int i = 1; i <= n; ++i) { long long x; cin >> x; pre[i] = pre[i-1] + x; }
    while (q--) {
        int l, r; cin >> l >> r;
        cout << pre[r] - pre[l-1] << '\\n';
    }
    return 0;
}"""),

T(11, "二分查找下界", "lower_bound", "找第一个不小于目标的位置。",
  "读入 n、q，第二行是已升序排列的 n 个整数，接下来 q 个目标值。对每个目标输出第一个 ≥ 目标的下标（从 0 开始），不存在输出 n。",
  ["用 lower_bound 直接得到迭代器。", "下标 = 迭代器 - begin()。"],
  ["二分", "lower_bound", "有序数组"],
  ["5 3\\n1 3 5 7 9\\n3 0 10", "4 2\\n2 2 4 6\\n2 5", "1 2\\n8\\n8 9"],
  """int main() {
    int n, q; cin >> n >> q;
    vector<int> a(n);
    for (int &x : a) cin >> x;
    while (q--) {
        int target; cin >> target;
        auto it = lower_bound(a.begin(), a.end(), target);
        cout << (it - a.begin()) << '\\n';
    }
    return 0;
}"""),

T(12, "多关键字排序", "自定义比较器", "按成绩降序、姓名升序排列学生。",
  "读入 n，接下来 n 行是姓名和成绩。按成绩从高到低排序；成绩相同时按姓名字典序从小到大。输出排序后的姓名与成绩。",
  ["比较器先比较成绩，再比较姓名。", "成绩降序用 `a.score > b.score`。"],
  ["排序", "比较器", "结构体"],
  ["3\\nAlice 90\\nBob 95\\nCarol 90", "4\\nZoe 80\\nAmy 80\\nBob 90\\nKen 70", "2\\nLi 100\\nWang 100"],
  """struct Student { string name; int score; };
int main() {
    int n; cin >> n;
    vector<Student> a(n);
    for (auto &s : a) cin >> s.name >> s.score;
    sort(a.begin(), a.end(), [](const Student &x, const Student &y) {
        if (x.score != y.score) return x.score > y.score;
        return x.name < y.name;
    });
    for (auto &s : a) cout << s.name << ' ' << s.score << '\\n';
    return 0;
}"""),

T(13, "最高频字符", "哈希计数与并列", "找出出现次数最多的字母。",
  "读入一个只含小写字母的字符串 s，输出出现次数最多的字母和它的次数；若并列，输出字典序最小的字母。",
  ["用 26 个桶统计。", "遍历桶时只在次数严格更大时更新，这样并列保留更小字母。"],
  ["计数", "字符", "并列"],
  ["banana", "abcabc", "zzzz"],
  """int main() {
    string s; cin >> s;
    array<int, 26> cnt{};
    for (char ch : s) ++cnt[ch - 'a'];
    int best = -1; char bestCh = 'a';
    for (int i = 0; i < 26; ++i) if (cnt[i] > best) { best = cnt[i]; bestCh = char('a' + i); }
    cout << bestCh << ' ' << best << '\\n';
    return 0;
}"""),

T(14, "两数之和", "下标与配对", "找两个数使它们的和等于目标。",
  "读入 n、target 和 n 个整数，输出一对下标 i<j（从 1 开始）使 a[i]+a[j]=target；不存在输出 -1。保证最多只有一组答案。",
  ["n 不大时可以直接双循环。", "按题目要求输出 1-based 下标。"],
  ["配对", "循环", "下标"],
  ["5 9\\n2 7 11 15 4", "4 8\\n1 2 3 4", "3 6\\n3 1 5"],
  """int main() {
    int n; long long target; cin >> n >> target;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    for (int i = 0; i < n; ++i)
        for (int j = i + 1; j < n; ++j)
            if (a[i] + a[j] == target) { cout << i + 1 << ' ' << j + 1 << '\\n'; return 0; }
    cout << -1 << '\\n';
    return 0;
}"""),

T(15, "定长窗口最大和", "滑动窗口", "长度为 k 的连续子数组最大和。",
  "读入 n、k 和 n 个整数，输出所有长度为 k 的连续子数组和的最大值。",
  ["先算前 k 个元素的和。", "窗口右移时加上新元素、减去离开窗口的元素。"],
  ["滑动窗口", "前缀和"],
  ["5 3\\n1 2 3 4 5", "4 2\\n-1 -2 -3 -4", "6 1\\n9 -2 8 1 7 3"],
  """int main() {
    int n, k; cin >> n >> k;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    long long sum = 0;
    for (int i = 0; i < k; ++i) sum += a[i];
    long long best = sum;
    for (int i = k; i < n; ++i) { sum += a[i] - a[i-k]; best = max(best, sum); }
    cout << best << '\\n';
    return 0;
}"""),

T(16, "最长连续 1", "连续区间", "求最长的一段连续 1。",
  "读入 n 和一个 0/1 序列，输出最长连续 1 的长度。",
  ["遇到 1 增加当前长度，遇到 0 清零。", "每一步都用 best = max(best, cur)。"],
  ["连续段", "扫描", "计数"],
  ["8\\n1 1 0 1 1 1 0 1", "5\\n0 0 0 0 0", "4\\n1 1 1 1"],
  """int main() {
    int n; cin >> n;
    int cur = 0, best = 0;
    for (int i = 0; i < n; ++i) { int x; cin >> x; if (x == 1) ++cur; else cur = 0; best = max(best, cur); }
    cout << best << '\\n';
    return 0;
}"""),

T(17, "矩阵对角线和", "二维数组", "求主对角线与副对角线之和。",
  "读入 n 和 n×n 矩阵，输出主对角线元素之和与副对角线元素之和，用空格分隔。",
  ["主对角线 i==j，副对角线 i+j==n-1。", "n 为奇数时中心元素只能算一次；按题目要求两条线分别求和，允许重复计入。"],
  ["矩阵", "对角线", "下标"],
  ["3\\n1 2 3\\n4 5 6\\n7 8 9", "2\\n1 2\\n3 4", "1\\n5"],
  """int main() {
    int n; cin >> n;
    long long mainSum = 0, antiSum = 0;
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < n; ++j) {
            long long x; cin >> x;
            if (i == j) mainSum += x;
            if (i + j == n - 1) antiSum += x;
        }
    cout << mainSum << ' ' << antiSum << '\\n';
    return 0;
}"""),

T(18, "螺旋矩阵", "方向模拟", "按顺时针螺旋顺序输出矩阵。",
  "读入 n、m 和 n×m 矩阵，按从左上角开始、顺时针向内的螺旋顺序输出所有元素，数字间用空格分隔。",
  ["维护上下左右四个边界。", "每走完一条边就收缩对应边界，注意最后不要越界。"],
  ["模拟", "矩阵", "边界"],
  ["3 3\\n1 2 3\\n4 5 6\\n7 8 9", "2 3\\n1 2 3\\n4 5 6", "4 2\\n1 2\\n3 4\\n5 6\\n7 8"],
  """int main() {
    int n, m; cin >> n >> m;
    vector<vector<int>> a(n, vector<int>(m));
    for (auto &row : a) for (int &x : row) cin >> x;
    int top = 0, bottom = n - 1, left = 0, right = m - 1;
    bool first = true;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; ++j) { if (!first) cout << ' '; cout << a[top][j]; first = false; }
        ++top;
        for (int i = top; i <= bottom; ++i) { if (!first) cout << ' '; cout << a[i][right]; first = false; }
        --right;
        if (top <= bottom) for (int j = right; j >= left; --j) { if (!first) cout << ' '; cout << a[bottom][j]; first = false; }
        --bottom;
        if (left <= right) for (int i = bottom; i >= top; --i) { if (!first) cout << ' '; cout << a[i][left]; first = false; }
        ++left;
    }
    cout << '\\n';
    return 0;
}"""),

T(19, "杨辉三角", "组合数递推", "输出前 n 行杨辉三角。",
  "读入 n（1≤n≤20），输出杨辉三角的前 n 行，每行数字间用空格分隔。",
  ["每行首尾是 1。", "中间元素等于上一行左上方和正上方之和。"],
  ["递推", "二维数组", "组合数"],
  ["5", "3", "1"],
  """int main() {
    int n; cin >> n;
    vector<vector<long long>> a(n);
    for (int i = 0; i < n; ++i) { a[i].resize(i + 1); a[i][0] = a[i][i] = 1; for (int j = 1; j < i; ++j) a[i][j] = a[i-1][j-1] + a[i-1][j]; }
    for (int i = 0; i < n; ++i) { for (int j = 0; j <= i; ++j) { if (j) cout << ' '; cout << a[i][j]; } cout << '\\n'; }
    return 0;
}"""),

T(20, "约瑟夫环", "环形删除", "求最后剩下的人。",
  "读入 n、k（1≤k≤n≤100），n 个人围成一圈，从 1 开始报数，报到 k 的人出圈，再从下一个人继续。输出最后剩下的人的编号。",
  ["用 vector 模拟，删除位置是当前下标 + k - 1 再取模。", "每次 erase 后当前下标就是下一轮起点。"],
  ["模拟", "vector", "模运算"],
  ["5 2", "7 3", "1 1"],
  """int main() {
    int n, k; cin >> n >> k;
    vector<int> v(n); iota(v.begin(), v.end(), 1);
    int pos = 0;
    while (v.size() > 1) { pos = (pos + k - 1) % (int)v.size(); v.erase(v.begin() + pos); if (pos == (int)v.size()) pos = 0; }
    cout << v[0] << '\\n';
    return 0;
}"""),

T(21, "日期差", "日期换算", "计算两个日期相差多少天。",
  "读入 y1 m1 d1 y2 m2 d2，保证第二个日期不早于第一个。输出它们相差的天数。",
  ["把日期转成从公元 1 年 1 月 1 日起的天数。", "闰年规则和每月天数要和上一题一致。"],
  ["日期", "闰年", "long long"],
  ["2024 1 1 2024 1 10", "2023 12 31 2024 1 1", "2000 2 28 2000 3 1"],
  """long long toDays(int y, int m, int d) {
    long long days = 0;
    for (int i = 1; i < y; ++i) days += 365 + ((i % 400 == 0) || (i % 4 == 0 && i % 100 != 0));
    int md[] = {0,31,28,31,30,31,30,31,31,30,31,30,31};
    if ((y % 400 == 0) || (y % 4 == 0 && y % 100 != 0)) md[2] = 29;
    for (int i = 1; i < m; ++i) days += md[i];
    return days + d;
}
int main() {
    int y1,m1,d1,y2,m2,d2; cin >> y1 >> m1 >> d1 >> y2 >> m2 >> d2;
    cout << toDays(y2,m2,d2) - toDays(y1,m1,d1) << '\\n';
    return 0;
}"""),

T(22, "任意进制", "进制转换", "把十进制转成 2–16 进制。",
  "读入 n 和 base（2≤base≤16），输出 n 的 base 进制表示，使用大写字母 A–F。n=0 时输出 0。",
  ["短除法不断取余，最后反转。", "10 以上余数映射到 A–F。"],
  ["进制", "字符映射", "vector"],
  ["255 16", "10 2", "0 7"],
  """int main() {
    long long n; int base; cin >> n >> base;
    if (n == 0) { cout << 0 << '\\n'; return 0; }
    string digits = "0123456789ABCDEF", s;
    while (n > 0) { s.push_back(digits[n % base]); n /= base; }
    reverse(s.begin(), s.end());
    cout << s << '\\n';
    return 0;
}"""),

T(23, "质因数分解", "试除法", "把整数分解成质因数幂。",
  "读入 n（2≤n≤10^12），按质因数从小到大输出 `p^e`，项之间用空格分隔；指数为 1 时也输出 `p^1`。",
  ["从 2 开始试除到 sqrt(n)。", "除完后如果 n>1，剩下的 n 本身就是一个指数为 1 的质因数。"],
  ["质数", "试除法", "long long"],
  ["360", "97", "1000000007"],
  """int main() {
    long long n; cin >> n;
    bool first = true;
    for (long long p = 2; p * p <= n; ++p) if (n % p == 0) {
        int e = 0; while (n % p == 0) { n /= p; ++e; }
        if (!first) cout << ' '; cout << p << '^' << e; first = false;
    }
    if (n > 1) { if (!first) cout << ' '; cout << n << "^1"; }
    cout << '\\n';
    return 0;
}"""),

T(24, "约数个数", "平方根枚举", "统计正整数的约数个数。",
  "读入 n（1≤n≤10^12），输出它的正约数个数。",
  ["枚举到 sqrt(n)，每找到一个约数就成对增加两个。", "完全平方数要避免把平方根算两次。"],
  ["约数", "平方根", "long long"],
  ["12", "36", "1000000007"],
  """int main() {
    long long n; cin >> n;
    long long count = 0;
    for (long long d = 1; d * d <= n; ++d) if (n % d == 0) { count += (d * d == n ? 1 : 2); }
    cout << count << '\\n';
    return 0;
}"""),

T(25, "快速幂", "二进制幂", "计算 a^b mod m。",
  "读入 a、b、m（0≤a,b≤10^18，1≤m≤10^9），输出 a 的 b 次方对 m 取模的结果。",
  ["把指数按二进制拆开，底数不断平方。", "每步乘法后都要取模，避免溢出。"],
  ["快速幂", "位运算", "取模"],
  ["2 10 1000", "3 0 7", "123456789 987654321 1000000007"],
  """long long power(long long a, long long b, long long m) {
    long long r = 1 % m; a %= m;
    while (b > 0) { if (b & 1) r = (__int128)r * a % m; a = (__int128)a * a % m; b >>= 1; }
    return r;
}
int main() {
    long long a, b, m; cin >> a >> b >> m;
    cout << power(a, b, m) << '\\n';
    return 0;
}"""),

T(26, "组合数", "乘法与除法", "计算 C(n,k)。",
  "读入 n、k（0≤k≤n≤30），输出组合数 C(n,k)。",
  ["C(n,k) = n!/(k!(n-k)!)，可以边乘边除。", "用 long long，n=30 的结果仍能装下。"],
  ["组合数", "long long", "循环"],
  ["5 2", "30 15", "10 0"],
  """int main() {
    int n, k; cin >> n >> k;
    if (k > n - k) k = n - k;
    long long ans = 1;
    for (int i = 1; i <= k; ++i) ans = ans * (n - k + i) / i;
    cout << ans << '\\n';
    return 0;
}"""),

T(27, "RLE 压缩", "连续段编码", "把连续重复字符压成字符+次数。",
  "读入一个只含小写字母的字符串，输出游程编码：每个连续段写成 `字符+次数`。",
  ["用双指针或计数变量找连续段。", "次数为 1 也要写出 1。"],
  ["字符串", "连续段", "编码"],
  ["aaabbc", "abcd", "aaaaaaaa"],
  """int main() {
    string s; cin >> s;
    for (int i = 0; i < (int)s.size();) {
        int j = i; while (j < (int)s.size() && s[j] == s[i]) ++j;
        cout << s[i] << j - i; i = j;
    }
    cout << '\\n';
    return 0;
}"""),

T(28, "字符串切分", "分隔符", "按逗号切分字符串。",
  "读入一行字符串，按逗号切分，每行输出一个片段；连续逗号会产生空片段。",
  ["用 getline 配合逗号分隔符。", "最后一个片段也要输出。"],
  ["getline", "分隔符", "字符串"],
  ["a,b,c", "a,,c", ",start,end,"],
  """int main() {
    string s; getline(cin, s);
    stringstream ss(s);
    string part;
    while (getline(ss, part, ',')) cout << part << '\\n';
    return 0;
}"""),

T(29, "ISBN 校验", "加权求和", "验证 10 位 ISBN。",
  "读入一个 10 位字符串（前 9 位是数字，最后一位可能是 X），按权重 10 到 1 加权求和；能被 11 整除输出 VALID，否则 INVALID。",
  ["X 代表 10。", "权重从 10 递减到 1，不是从 1 开始。"],
  ["字符串", "加权和", "校验"],
  ["0306406152", "123456789X", "0000000000"],
  """int main() {
    string s; cin >> s;
    long long sum = 0;
    for (int i = 0; i < 10; ++i) {
        int v = s[i] == 'X' ? 10 : s[i] - '0';
        sum += v * (10 - i);
    }
    cout << (sum % 11 == 0 ? "VALID" : "INVALID") << '\\n';
    return 0;
}"""),

T(30, "最长平台", "相同值连续段", "找最长的一段相同数字。",
  "读入 n 和 n 个整数，输出最长平台的长度和它的值；若有多个等长平台，输出最先出现的那个。",
  ["记录当前值、当前长度和历史最优。", "遇到不同值就重置当前段。"],
  ["连续段", "扫描", "并列"],
  ["8\\n1 2 2 2 3 3 1 1", "5\\n9 9 8 8 8", "4\\n1 2 3 4"],
  """int main() {
    int n; cin >> n;
    long long bestVal = 0, curVal = 0; int bestLen = 0, curLen = 0;
    for (int i = 0; i < n; ++i) {
        long long x; cin >> x;
        if (i == 0 || x == curVal) { ++curLen; curVal = x; }
        else { curLen = 1; curVal = x; }
        if (curLen > bestLen) { bestLen = curLen; bestVal = curVal; }
    }
    cout << bestLen << ' ' << bestVal << '\\n';
    return 0;
}"""),

T(31, "括号最大深度", "计数与边界", "求括号嵌套的最大深度。",
  "读入一个只含左右括号的字符串，输出最大嵌套深度。保证括号序列合法。",
  ["遇到左括号深度加一，遇到右括号减一。", "每次加一后更新最大值。"],
  ["括号", "深度", "扫描"],
  ["((()))", "()()()", "(())()"],
  """int main() {
    string s; cin >> s;
    int depth = 0, best = 0;
    for (char ch : s) { if (ch == '(') { ++depth; best = max(best, depth); } else --depth; }
    cout << best << '\\n';
    return 0;
}"""),

T(32, "最长单词", "分词与比较", "找一行里最长的单词。",
  "读入一行英文，单词由字母组成，用一个或多个空格分隔。输出最长的单词；若并列，输出最先出现的那个。",
  ["用 stringstream 分词。", "只有严格更长才更新答案。"],
  ["stringstream", "字符串", "并列"],
  ["I love programming", "a bb ccc dd", "single"],
  """int main() {
    string line; getline(cin, line);
    stringstream ss(line);
    string w, best;
    while (ss >> w) if (w.size() > best.size()) best = w;
    cout << best << '\\n';
    return 0;
}"""),

T(33, "栈序列合法性", "模拟栈", "判断出栈序列是否合法。",
  "读入 n 和一个 1..n 的出栈序列，判断是否存在对应的入栈/出栈操作序列。合法输出 YES，否则 NO。",
  ["按 1..n 依次入栈，能匹配当前出栈元素就弹出。", "最后栈为空则合法。"],
  ["栈", "模拟", "序列"],
  ["5\\n1 2 3 4 5", "5\\n5 4 3 2 1", "3\\n3 1 2"],
  """int main() {
    int n; cin >> n;
    vector<int> target(n);
    for (int &x : target) cin >> x;
    stack<int> st; int nextPush = 1;
    for (int x : target) {
        while (nextPush <= n && (st.empty() || st.top() != x)) st.push(nextPush++);
        if (st.empty() || st.top() != x) { cout << "NO\\n"; return 0; }
        st.pop();
    }
    cout << (st.empty() ? "YES" : "NO") << '\\n';
    return 0;
}"""),

T(34, "区间交集对数", "成对判断", "统计有多少对区间相交。",
  "读入 n 和 n 个闭区间 [l,r]，统计有多少对区间有公共点（i<j）。",
  ["两个区间相交当且仅当 l1≤r2 且 l2≤r1。", "n 较小时可以直接枚举所有区间对。"],
  ["区间", "枚举", "相交"],
  ["3\\n1 3\\n2 4\\n5 6", "2\\n1 2\\n3 4", "4\\n1 10\\n2 3\\n4 5\\n6 7"],
  """int main() {
    int n; cin >> n;
    vector<pair<long long,long long>> a(n);
    for (auto &p : a) cin >> p.first >> p.second;
    long long count = 0;
    for (int i = 0; i < n; ++i)
        for (int j = i + 1; j < n; ++j)
            if (a[i].first <= a[j].second && a[j].first <= a[i].second) ++count;
    cout << count << '\\n';
    return 0;
}"""),
]
