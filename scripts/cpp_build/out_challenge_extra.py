# -*- coding: utf-8 -*-
"""C++ 输出实现场：新增的 25 道挑战题。"""
from out_basic_extra import HEAD

def T(i, title, subtitle, brief, goal, hints, concepts, tests, code, fast_ms=70, input_desc="", output_desc=""):
    return {
        "id": f"c{i}", "level": "challenge", "order": i,
        "title": title, "subtitle": subtitle, "brief": brief, "goal": goal,
        "hints": hints, "concepts": concepts, "tests": tests,
        "program": HEAD + code.strip() + "\n",
        "fastMs": fast_ms, "input": input_desc or "见题面。",
        "output": output_desc or "按题面要求输出。",
    }

TASKS = [
T(10, "编辑距离", "动态规划", "求把 a 改成 b 的最少操作数。",
  "读入两个小写字符串 a、b，允许插入、删除、替换一个字符，输出最少操作次数。",
  ["dp[i][j] 表示 a 前 i 个字符变成 b 前 j 个字符的代价。", "空串边界要初始化：dp[i][0]=i、dp[0][j]=j。"],
  ["动态规划", "字符串", "边界"],
  ["horse\\nros", "intention\\nexecution", "abc\\nabc"],
  """int main() {
    string a, b; cin >> a >> b;
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1));
    for (int i = 0; i <= n; ++i) dp[i][0] = i;
    for (int j = 0; j <= m; ++j) dp[0][j] = j;
    for (int i = 1; i <= n; ++i)
        for (int j = 1; j <= m; ++j)
            dp[i][j] = min({dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i-1] != b[j-1])});
    cout << dp[n][m] << '\\n';
    return 0;
}"""),

T(11, "最长回文子串", "中心扩展", "求最长回文子串长度。",
  "读入一个只含小写字母的字符串，输出最长回文子串的长度。",
  ["枚举每个中心，分奇数长度和偶数长度两种情况向两边扩展。", "每次扩展都要检查边界。"],
  ["回文", "中心扩展", "字符串"],
  ["babad", "cbbd", "abacdfgdcaba"],
  """int main() {
    string s; cin >> s;
    int best = 0;
    for (int i = 0; i < (int)s.size(); ++i) {
        int l = i, r = i;
        while (l >= 0 && r < (int)s.size() && s[l] == s[r]) { best = max(best, r - l + 1); --l; ++r; }
        l = i; r = i + 1;
        while (l >= 0 && r < (int)s.size() && s[l] == s[r]) { best = max(best, r - l + 1); --l; ++r; }
    }
    cout << best << '\\n';
    return 0;
}"""),

T(12, "单词拆分", "字符串 DP", "判断字符串能否由词典拼出。",
  "读入词典大小 n、n 个单词，再读入目标字符串 s。判断 s 能否由词典中的单词拼接而成，能输出 YES，否则 NO。",
  ["dp[i] 表示 s 的前 i 个字符能否拼出。", "对每个 i，枚举词典里的单词检查后缀是否匹配。"],
  ["动态规划", "字符串", "字典"],
  ["4\\nleet code is fun\\nleetcode", "2\\na aa\\naaaa", "3\\ncat dog bird\\ncatdogbird"],
  """int main() {
    int n; cin >> n;
    vector<string> dict(n);
    for (auto &w : dict) cin >> w;
    string s; cin >> s;
    vector<bool> dp(s.size() + 1);
    dp[0] = true;
    for (int i = 1; i <= (int)s.size(); ++i)
        for (const string &w : dict) {
            int len = w.size();
            if (i >= len && s.compare(i - len, len, w) == 0 && dp[i - len]) { dp[i] = true; break; }
        }
    cout << (dp[s.size()] ? "YES" : "NO") << '\\n';
    return 0;
}"""),

T(13, "股票多次买卖", "贪心累加", "任意多次买卖的最大利润。",
  "读入 n 和 n 天的价格，允许多次买卖但不能同时持有两份股票，输出最大总利润。",
  ["相邻两天只要后一天比前一天高就可以买入再卖出。", "把每个正差价累加起来就是答案。"],
  ["贪心", "数组", "利润"],
  ["6\\n7 1 5 3 6 4", "5\\n1 2 3 4 5", "4\\n7 6 4 3"],
  """int main() {
    int n; cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    long long profit = 0;
    for (int i = 1; i < n; ++i) if (a[i] > a[i-1]) profit += a[i] - a[i-1];
    cout << profit << '\\n';
    return 0;
}"""),

T(14, "跳跃游戏", "最远覆盖", "判断能否跳到终点。",
  "读入 n 和 n 个非负整数，第 i 个数表示从位置 i 最多能跳多远。从下标 0 出发，判断能否到达最后一个下标，输出 YES 或 NO。",
  ["维护当前能到达的最远下标。", "遍历时如果当前下标超过最远可达，就说明断了。"],
  ["贪心", "数组", "可达性"],
  ["5\\n2 3 1 1 4", "5\\n3 2 1 0 4", "1\\n0"],
  """int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    int reach = 0;
    for (int i = 0; i < n; ++i) {
        if (i > reach) { cout << "NO\\n"; return 0; }
        reach = max(reach, i + a[i]);
    }
    cout << "YES\\n";
    return 0;
}"""),

T(15, "最多不重叠区间", "按右端点贪心", "选最多的互不重叠区间。",
  "读入 n 和 n 个闭区间 [l,r]，选择尽可能多的区间，使任意两个区间不重叠（端点也不能相接），输出最多能选几个。",
  ["按右端点升序排序。", "每次选右端点最早且左端点大于上一个右端点的区间。"],
  ["区间调度", "贪心", "排序"],
  ["4\\n1 3\\n2 4\\n3 5\\n5 6", "3\\n1 2\\n2 3\\n3 4", "4\\n1 10\\n2 3\\n4 5\\n6 7"],
  """int main() {
    int n; cin >> n;
    vector<pair<int,int>> a(n);
    for (auto &p : a) cin >> p.first >> p.second;
    sort(a.begin(), a.end(), [](auto &x, auto &y) { return x.second < y.second; });
    int count = 0, last = INT_MIN;
    for (auto &p : a) if (p.first > last) { ++count; last = p.second; }
    cout << count << '\\n';
    return 0;
}"""),

T(16, "K 路归并", "优先队列", "合并多个有序数组。",
  "读入 k，接下来 k 行，每行先是一个长度 len，再是 len 个升序整数。把所有数合并成一个升序序列输出。",
  ["把每个数组的第一个元素和数组编号放进小根堆。", "弹出一个就补该数组的下一个。"],
  ["优先队列", "归并", "多路"],
  ["3\\n3 1 4 7\\n2 2 5\\n1 3", "2\\n2 -2 0\\n3 -3 1 9", "1\\n4 1 2 3 4"],
  """int main() {
    int k; cin >> k;
    vector<vector<int>> a(k);
    for (int i = 0; i < k; ++i) { int len; cin >> len; a[i].resize(len); for (int &x : a[i]) cin >> x; }
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    vector<int> pos(k, 0);
    for (int i = 0; i < k; ++i) if (!a[i].empty()) pq.push({a[i][0], i});
    bool first = true;
    while (!pq.empty()) {
        auto [val, id] = pq.top(); pq.pop();
        if (!first) cout << ' '; cout << val; first = false;
        if (++pos[id] < (int)a[id].size()) pq.push({a[id][pos[id]], id});
    }
    cout << '\\n';
    return 0;
}"""),

T(17, "两数组第 k 小", "归并或二分", "求两个有序数组的第 k 小元素。",
  "读入 n、m、k，接着是长度为 n 和 m 的两个升序数组，输出合并后第 k 小的数（k 从 1 开始）。",
  ["可以直接双指针归并到第 k 个。", "注意一个数组先用完的情况。"],
  ["归并", "有序数组", "第 k 小"],
  ["3 3 4\\n1 3 5\\n2 4 6", "2 1 1\\n7 9\\n8", "4 4 8\\n1 2 3 4\\n5 6 7 8"],
  """int main() {
    int n, m, k; cin >> n >> m >> k;
    vector<int> a(n), b(m);
    for (int &x : a) cin >> x;
    for (int &x : b) cin >> x;
    int i = 0, j = 0, count = 0;
    while (true) {
        int val;
        if (j >= m || (i < n && a[i] <= b[j])) val = a[i++];
        else val = b[j++];
        if (++count == k) { cout << val << '\\n'; return 0; }
    }
}"""),

T(18, "网格最小路径", "二维 DP", "从左上角走到右下角的最小路径和。",
  "读入 n、m 和非负网格，每次只能向右或向下走，输出从左上角到右下角的最小路径和。",
  ["第一行和第一列只能沿一个方向到达。", "其余格子取上方和左方的较小值。"],
  ["动态规划", "矩阵", "路径"],
  ["3 3\\n1 3 1\\n1 5 1\\n4 2 1", "2 2\\n1 2\\n3 4", "1 4\\n5 1 2 3"],
  """int main() {
    int n, m; cin >> n >> m;
    vector<vector<long long>> a(n, vector<long long>(m)), dp(n, vector<long long>(m));
    for (auto &row : a) for (auto &x : row) cin >> x;
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j) {
            if (i == 0 && j == 0) dp[i][j] = a[i][j];
            else dp[i][j] = a[i][j] + min(i ? dp[i-1][j] : LLONG_MAX, j ? dp[i][j-1] : LLONG_MAX);
        }
    cout << dp[n-1][m-1] << '\\n';
    return 0;
}"""),

T(19, "岛屿数量", "BFS/DFS", "统计 0/1 网格中的连通块。",
  "读入 n、m 和 0/1 网格，1 表示陆地，上下左右相邻的 1 属于同一座岛，输出岛屿数量。",
  ["遍历到 1 时计数加一，并用 DFS/BFS 把整座岛标记掉。", "只算上下左右，不算斜角。"],
  ["图", "连通块", "DFS"],
  ["4 5\\n1 1 0 0 0\\n1 1 0 0 0\\n0 0 1 0 0\\n0 0 0 1 1", "3 3\\n0 0 0\\n0 0 0\\n0 0 0", "3 3\\n1 0 1\\n0 1 0\\n1 0 1"],
  """int n, m;
vector<string> g;
void dfs(int x, int y) {
    if (x < 0 || y < 0 || x >= n || y >= m || g[x][y] != '1') return;
    g[x][y] = '0';
    dfs(x+1,y); dfs(x-1,y); dfs(x,y+1); dfs(x,y-1);
}
int main() {
    cin >> n >> m; g.resize(n);
    for (auto &row : g) cin >> row;
    int count = 0;
    for (int i = 0; i < n; ++i) for (int j = 0; j < m; ++j) if (g[i][j] == '1') { ++count; dfs(i,j); }
    cout << count << '\\n';
    return 0;
}"""),

T(20, "最小字典序拓扑", "入度与优先队列", "输出字典序最小的拓扑序。",
  "读入 n、m 和 m 条有向边 u→v，输出字典序最小的拓扑排序；保证有解。",
  ["用最小堆维护当前入度为 0 的点。", "每次取编号最小的点，删除它的出边。"],
  ["拓扑排序", "优先队列", "图"],
  ["4 3\\n1 2\\n1 3\\n3 4", "3 2\\n1 3\\n2 3", "5 4\\n2 1\\n3 1\\n4 2\\n5 3"],
  """int main() {
    int n, m; cin >> n >> m;
    vector<vector<int>> g(n + 1); vector<int> indeg(n + 1);
    for (int i = 0; i < m; ++i) { int u, v; cin >> u >> v; g[u].push_back(v); ++indeg[v]; }
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int i = 1; i <= n; ++i) if (!indeg[i]) pq.push(i);
    bool first = true;
    while (!pq.empty()) {
        int u = pq.top(); pq.pop();
        if (!first) cout << ' '; cout << u; first = false;
        for (int v : g[u]) if (--indeg[v] == 0) pq.push(v);
    }
    cout << '\\n';
    return 0;
}"""),

T(21, "最小生成树", "Kruskal", "求连通无向图的最小生成树权值。",
  "读入 n、m 和 m 条无向边 u、v、w，输出最小生成树的边权总和；图不连通输出 -1。",
  ["按边权升序排序，用并查集判断是否成环。", "选够 n-1 条边就结束。"],
  ["并查集", "最小生成树", "排序"],
  ["4 5\\n1 2 1\\n2 3 2\\n3 4 3\\n1 4 4\\n2 4 5", "3 2\\n1 2 7\\n2 3 8", "2 1\\n1 2 -3"],
  """struct DSU { vector<int> p; DSU(int n):p(n+1){iota(p.begin(),p.end(),0);} int find(int x){return p[x]==x?x:p[x]=find(p[x]);} bool unite(int a,int b){a=find(a);b=find(b);if(a==b)return false;p[a]=b;return true;} };
int main() {
    int n, m; cin >> n >> m;
    vector<array<int,3>> e(m);
    for (auto &x : e) cin >> x[0] >> x[1] >> x[2];
    sort(e.begin(), e.end(), [](auto &a, auto &b){ return a[2] < b[2]; });
    DSU dsu(n); long long total = 0; int used = 0;
    for (auto &x : e) if (dsu.unite(x[0], x[1])) { total += x[2]; if (++used == n - 1) break; }
    if (used != n - 1) cout << -1; else cout << total;
    cout << '\\n';
    return 0;
}"""),

T(22, "Bellman-Ford", "负边最短路", "求含负权边的单源最短路。",
  "读入 n、m、s 和 m 条有向边 u、v、w（w 可为负），输出 s 到每个点的最短距离；不可达输出 INF。保证没有负环。",
  ["进行 n-1 轮松弛。", "每轮枚举所有边，能更短就更新。"],
  ["最短路", "负权", "松弛"],
  ["4 4 1\\n1 2 4\\n1 3 5\\n2 3 -2\\n3 4 3", "3 1 2\\n2 3 7", "2 2 1\\n1 2 5\\n1 2 3"],
  """int main() {
    int n, m, s; cin >> n >> m >> s;
    struct Edge { int u, v, w; };
    vector<Edge> e(m);
    for (auto &x : e) cin >> x.u >> x.v >> x.w;
    const long long INF = 4e18;
    vector<long long> d(n + 1, INF); d[s] = 0;
    for (int it = 1; it < n; ++it)
        for (auto &x : e) if (d[x.u] < INF && d[x.v] > d[x.u] + x.w) d[x.v] = d[x.u] + x.w;
    for (int i = 1; i <= n; ++i) { if (i > 1) cout << ' '; if (d[i] == INF) cout << "INF"; else cout << d[i]; }
    cout << '\\n';
    return 0;
}"""),

T(23, "Floyd 最短路", "全源最短路", "求所有点对之间的最短距离。",
  "读入 n、m，再读 m 条有向边 u、v、w，输出 n×n 的距离矩阵；不可达输出 -1。",
  ["初始化 dist[i][i]=0，边权取最小。", "三层循环，中间点 k 放在最外层。"],
  ["最短路", "Floyd", "矩阵"],
  ["3 3\\n1 2 4\\n2 3 1\\n1 3 9", "2 1\\n1 2 5", "4 3\\n1 2 1\\n2 3 2\\n1 4 10"],
  """int main() {
    int n, m; cin >> n >> m;
    const long long INF = 4e18;
    vector<vector<long long>> d(n + 1, vector<long long>(n + 1, INF));
    for (int i = 1; i <= n; ++i) d[i][i] = 0;
    for (int i = 0; i < m; ++i) { int u, v; long long w; cin >> u >> v >> w; d[u][v] = min(d[u][v], w); }
    for (int k = 1; k <= n; ++k) for (int i = 1; i <= n; ++i) for (int j = 1; j <= n; ++j) if (d[i][k] < INF && d[k][j] < INF) d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
    for (int i = 1; i <= n; ++i) { for (int j = 1; j <= n; ++j) { if (j > 1) cout << ' '; cout << (d[i][j] >= INF ? -1 : d[i][j]); } cout << '\\n'; }
    return 0;
}"""),

T(24, "二叉树右视图", "层序遍历", "输出每一层最右边的节点。",
  "按层序读入一棵二叉树：第一行 n，第二行 n 个整数，-1 表示空节点。输出从右侧能看到的节点值，从上到下用空格分隔。",
  ["用队列做层序遍历。", "每层最后一个节点就是右视图中的节点。"],
  ["二叉树", "层序", "队列"],
  ["7\\n1 2 3 -1 5 -1 4", "3\\n1 2 3", "5\\n1 2 -1 3 -1"],
  """struct Node { int val; Node *l = nullptr, *r = nullptr; Node(int v):val(v){} };
int main() {
    int n; cin >> n; vector<int> a(n);
    for (int &x : a) cin >> x;
    if (n == 0 || a[0] == -1) return 0;
    Node *root = new Node(a[0]); queue<Node*> q; q.push(root); int idx = 1;
    while (!q.empty() && idx < n) {
        Node *u = q.front(); q.pop();
        if (idx < n && a[idx] != -1) { u->l = new Node(a[idx]); q.push(u->l); } ++idx;
        if (idx < n && a[idx] != -1) { u->r = new Node(a[idx]); q.push(u->r); } ++idx;
    }
    q.push(root); bool first = true;
    while (!q.empty()) {
        int sz = q.size(); Node *last = nullptr;
        for (int i = 0; i < sz; ++i) { Node *u = q.front(); q.pop(); last = u; if (u->l) q.push(u->l); if (u->r) q.push(u->r); }
        if (!first) cout << ' '; cout << last->val; first = false;
    }
    cout << '\\n';
    return 0;
}"""),

T(25, "BST 验证", "中序遍历", "判断一棵二叉树是不是二叉搜索树。",
  "按层序读入二叉树（-1 为空），判断它是否满足左子树全部小于根、右子树全部大于根。是输出 YES，否则 NO。",
  ["BST 的充要条件是中序遍历严格递增。", "不要只比较父子节点。"],
  ["二叉搜索树", "中序", "递归"],
  ["7\\n5 3 7 2 4 6 8", "5\\n5 3 7 2 6", "3\\n2 1 3"],
  """struct Node { int val; Node *l = nullptr, *r = nullptr; Node(int v):val(v){} };
int main() {
    int n; cin >> n; vector<int> a(n);
    for (int &x : a) cin >> x;
    if (n == 0 || a[0] == -1) { cout << "YES\\n"; return 0; }
    Node *root = new Node(a[0]); queue<Node*> q; q.push(root); int idx = 1;
    while (!q.empty() && idx < n) {
        Node *u = q.front(); q.pop();
        if (idx < n && a[idx] != -1) { u->l = new Node(a[idx]); q.push(u->l); } ++idx;
        if (idx < n && a[idx] != -1) { u->r = new Node(a[idx]); q.push(u->r); } ++idx;
    }
    vector<int> vals; stack<Node*> st; Node *cur = root;
    while (cur || !st.empty()) { while (cur) { st.push(cur); cur = cur->l; } cur = st.top(); st.pop(); vals.push_back(cur->val); cur = cur->r; }
    bool ok = true; for (int i = 1; i < (int)vals.size(); ++i) if (vals[i] <= vals[i-1]) ok = false;
    cout << (ok ? "YES" : "NO") << '\\n';
    return 0;
}"""),

T(26, "Trie 前缀计数", "字典树", "统计有多少单词以某个前缀开头。",
  "读入 n 和 n 个单词，再读入 q 和 q 个前缀。对每个前缀输出以它开头的单词数量。",
  ["每个节点保存经过它的单词数。", "插入时沿途给计数加一；查询时沿前缀走到底，返回计数。"],
  ["Trie", "前缀", "字符串"],
  ["5\\napple app apply banana band\\n3\\nap\\nban\\ncat", "3\\na ab abc\\n2\\na\\nab", "2\\nhello world\\n1\\nwor"],
  """struct Trie {
    struct Node { int next[26]; int count; Node(){ fill(begin(next), end(next), -1); count = 0; } };
    vector<Node> tr; Trie(){ tr.emplace_back(); }
    void insert(const string &s) { int u = 0; for (char ch : s) { int c = ch - 'a'; if (tr[u].next[c] == -1) { tr[u].next[c] = tr.size(); tr.emplace_back(); } u = tr[u].next[c]; ++tr[u].count; } }
    int query(const string &s) { int u = 0; for (char ch : s) { int c = ch - 'a'; if (tr[u].next[c] == -1) return 0; u = tr[u].next[c]; } return tr[u].count; }
};
int main() {
    int n; cin >> n; Trie trie;
    for (int i = 0; i < n; ++i) { string s; cin >> s; trie.insert(s); }
    int q; cin >> q;
    while (q--) { string p; cin >> p; cout << trie.query(p) << '\\n'; }
    return 0;
}"""),

T(27, "并查集连通块", "DSU", "统计无向图的连通块数量。",
  "读入 n、m 和 m 条无向边，输出连通块数量。",
  ["初始每个点各自一块，共 n 块。", "每成功合并两个不同集合，块数减一。"],
  ["并查集", "连通块", "图"],
  ["5 2\\n1 2\\n3 4", "4 3\\n1 2\\n2 3\\n3 1", "3 0"],
  """struct DSU { vector<int> p, sz; DSU(int n):p(n+1),sz(n+1,1){iota(p.begin(),p.end(),0);} int find(int x){return p[x]==x?x:p[x]=find(p[x]);} bool unite(int a,int b){a=find(a);b=find(b);if(a==b)return false;if(sz[a]<sz[b])swap(a,b);p[b]=a;sz[a]+=sz[b];return true;} };
int main() {
    int n, m; cin >> n >> m;
    DSU dsu(n); int comp = n;
    for (int i = 0; i < m; ++i) { int u, v; cin >> u >> v; if (dsu.unite(u, v)) --comp; }
    cout << comp << '\\n';
    return 0;
}"""),

T(28, "树状数组", "Fenwick", "支持单点加与区间和。",
  "读入 n、q，第二行 n 个整数。接下来 q 行：`1 i x` 表示 a[i]+=x，`2 l r` 表示查询 a[l..r] 的和。",
  ["树状数组的 lowbit 是 x & -x。", "前缀和与区间和都用前缀和相减。"],
  ["树状数组", "lowbit", "前缀和"],
  ["5 4\\n1 2 3 4 5\\n2 1 3\\n1 2 10\\n2 2 5\\n2 1 1", "3 2\\n0 0 0\\n1 1 5\\n2 1 3", "1 2\\n7\\n2 1 1\\n1 1 -2"],
  """struct BIT { int n; vector<long long> t; BIT(int n):n(n),t(n+1){} void add(int i,long long v){for(;i<=n;i+=i&-i)t[i]+=v;} long long sum(int i){long long s=0;for(;i>0;i-=i&-i)s+=t[i];return s;} long long range(int l,int r){return sum(r)-sum(l-1);} };
int main() {
    int n, q; cin >> n >> q; BIT bit(n);
    for (int i = 1; i <= n; ++i) { long long x; cin >> x; bit.add(i, x); }
    while (q--) { int op; cin >> op; if (op == 1) { int i; long long x; cin >> i >> x; bit.add(i, x); } else { int l, r; cin >> l >> r; cout << bit.range(l, r) << '\\n'; } }
    return 0;
}"""),

T(29, "逆序对", "归并计数", "统计数组中的逆序对数量。",
  "读入 n 和 n 个整数，统计满足 i<j 且 a[i]>a[j] 的数对数量。",
  ["归并排序合并时，右半部分的元素先出，就贡献左半剩余个数的逆序对。", "结果可能超过 int，用 long long。"],
  ["归并排序", "逆序对", "long long"],
  ["5\\n2 3 8 6 1", "5\\n1 2 3 4 5", "5\\n5 4 3 2 1"],
  """long long mergeCount(vector<int>& a, int l, int r) {
    if (r - l <= 1) return 0;
    int m = (l + r) / 2;
    long long count = mergeCount(a, l, m) + mergeCount(a, m, r);
    vector<int> tmp; int i = l, j = m;
    while (i < m && j < r) { if (a[i] <= a[j]) tmp.push_back(a[i++]); else { tmp.push_back(a[j++]); count += m - i; } }
    while (i < m) tmp.push_back(a[i++]); while (j < r) tmp.push_back(a[j++]);
    for (int k = l; k < r; ++k) a[k] = tmp[k-l];
    return count;
}
int main() {
    int n; cin >> n; vector<int> a(n); for (int &x : a) cin >> x;
    cout << mergeCount(a, 0, n) << '\\n';
    return 0;
}"""),

T(30, "下一个更大元素", "单调栈", "找每个元素右边第一个更大的数。",
  "读入 n 和 n 个整数，对每个 a[i] 输出它右侧第一个大于它的数；不存在输出 -1。",
  ["从右往左扫描，维护一个单调递减栈。", "弹出所有不大于当前元素的值，栈顶就是答案。"],
  ["单调栈", "下一个更大", "数组"],
  ["5\\n2 1 2 4 3", "4\\n5 4 3 2", "3\\n1 2 3"],
  """int main() {
    int n; cin >> n; vector<long long> a(n), ans(n, -1); stack<int> st;
    for (auto &x : a) cin >> x;
    for (int i = n - 1; i >= 0; --i) { while (!st.empty() && a[st.top()] <= a[i]) st.pop(); if (!st.empty()) ans[i] = a[st.top()]; st.push(i); }
    for (int i = 0; i < n; ++i) { if (i) cout << ' '; cout << ans[i]; }
    cout << '\\n';
    return 0;
}"""),

T(31, "直方图最大矩形", "单调栈", "求直方图中最大矩形面积。",
  "读入 n 和 n 个非负高度，输出直方图中能画出的最大矩形面积。",
  ["维护一个高度递增的栈，存下标。", "遇到更矮的柱子就弹出栈顶并结算面积。"],
  ["单调栈", "直方图", "面积"],
  ["6\\n2 1 5 6 2 3", "3\\n2 4 2", "5\\n1 1 1 1 1"],
  """int main() {
    int n; cin >> n; vector<long long> h(n);
    for (auto &x : h) cin >> x;
    stack<int> st; long long best = 0;
    for (int i = 0; i <= n; ++i) {
        long long cur = (i == n ? 0 : h[i]);
        while (!st.empty() && h[st.top()] > cur) {
            long long height = h[st.top()]; st.pop();
            int left = st.empty() ? -1 : st.top();
            best = max(best, height * (i - left - 1));
        }
        st.push(i);
    }
    cout << best << '\\n';
    return 0;
}"""),

T(32, "中缀表达式求值", "双栈", "计算带括号的四则表达式。",
  "读入一行只含非负整数、+ - * /、括号和空格的表达式，输出整数结果。除法按整数除法。",
  ["用两个栈分别存数字和运算符。", "遇到右括号就弹到左括号，注意运算符优先级。"],
  ["表达式", "栈", "优先级"],
  ["3+5*2", "(3+5)*2", "10/2-3"],
  """int calc(int a, int b, char op) { if (op=='+') return a+b; if (op=='-') return a-b; if (op=='*') return a*b; return a/b; }
int priority(char op) { return op=='+'||op=='-' ? 1 : (op=='*'||op=='/' ? 2 : 0); }
void reduce(stack<int>& num, stack<char>& op) { int b = num.top(); num.pop(); int a = num.top(); num.pop(); char o = op.top(); op.pop(); num.push(calc(a,b,o)); }
int main() {
    string s; getline(cin, s);
    stack<int> num; stack<char> op;
    for (int i = 0; i < (int)s.size(); ++i) {
        if (s[i] == ' ') continue;
        if (isdigit(s[i])) { int v = 0; while (i < (int)s.size() && isdigit(s[i])) v = v * 10 + (s[i++] - '0'); --i; num.push(v); }
        else if (s[i] == '(') op.push('(');
        else if (s[i] == ')') { while (op.top() != '(') reduce(num, op); op.pop(); }
        else { while (!op.empty() && op.top() != '(' && priority(op.top()) >= priority(s[i])) reduce(num, op); op.push(s[i]); }
    }
    while (!op.empty()) reduce(num, op);
    cout << num.top() << '\\n';
    return 0;
}"""),

T(33, "大数乘法", "高精度", "计算两个大整数的乘积。",
  "读入两个非负整数（可能长达 200 位），输出它们的乘积。",
  ["用数组按位相乘，结果长度最多 n+m。", "从低位开始累加，最后处理进位和前导零。"],
  ["高精度", "数组", "字符串"],
  ["123\\n456", "0\\n999", "99999999999999999999\\n2"],
  """int main() {
    string a, b; cin >> a >> b;
    if (a == "0" || b == "0") { cout << 0 << '\\n'; return 0; }
    vector<int> res(a.size() + b.size());
    for (int i = a.size()-1; i >= 0; --i)
        for (int j = b.size()-1; j >= 0; --j) res[i+j+1] += (a[i]-'0') * (b[j]-'0');
    for (int i = res.size()-1; i > 0; --i) { res[i-1] += res[i] / 10; res[i] %= 10; }
    int i = 0; while (i < (int)res.size()-1 && res[i] == 0) ++i;
    for (; i < (int)res.size(); ++i) cout << res[i];
    cout << '\\n';
    return 0;
}"""),

T(34, "字符串解码", "嵌套括号", "展开形如 3[a2[b]] 的字符串。",
  "读入一个由小写字母、数字和方括号组成的编码串，按 `k[子串]` 表示重复 k 次的规则展开，输出解码结果。",
  ["用两个栈分别保存当前字符串和重复次数。", "遇到数字解析完整数字；遇到 `[` 入栈；遇到 `]` 弹栈拼接。"],
  ["栈", "字符串", "嵌套"],
  ["3[a2[b]]", "2[abc]3[cd]ef", "10[z]"],
  """int main() {
    string s; cin >> s;
    stack<string> strs; stack<int> nums;
    string cur; int num = 0;
    for (char ch : s) {
        if (isdigit(ch)) num = num * 10 + (ch - '0');
        else if (ch == '[') { strs.push(cur); nums.push(num); cur.clear(); num = 0; }
        else if (ch == ']') { string prev = strs.top(); strs.pop(); int k = nums.top(); nums.pop(); for (int i = 0; i < k; ++i) prev += cur; cur = prev; }
        else cur.push_back(ch);
    }
    cout << cur << '\\n';
    return 0;
}"""),
]
