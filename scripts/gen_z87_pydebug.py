# -*- coding: utf-8 -*-
import subprocess, json
from pathlib import Path

def run(code):
    p=subprocess.run(['python3','-c',code],text=True,capture_output=True,timeout=5)
    if p.returncode!=0:
        raise RuntimeError(p.stderr)
    return p.stdout.rstrip('\n')

def line_of(code, before):
    for i,l in enumerate(code.split('\n'),1):
        if l.strip()==before.strip(): return i
    raise RuntimeError('line not found: '+before)

specs=[]
def add(level,title,desc,topic,code,before,after,why,tip):
    if before not in code: raise RuntimeError('before missing '+title)
    fixed=code.replace(before,after,1)
    if fixed==code: raise RuntimeError('patch noop '+title)
    exp=run(fixed)
    try: got=run(code)
    except Exception: got='__ERROR__'
    if got==exp: raise RuntimeError('patch same output '+title)
    specs.append(dict(level=level,title=title,desc=desc,topic=topic,code=code,expected=exp,
        bugs=[dict(line=line_of(code,before),name=topic,before=before,after=after,why=why,tip=tip)]))

# BASIC 10
add('basic','列表求和','目标是输出列表元素的总和，但循环里每次都把 total 覆盖了。','循环累加 / 赋值',
'''nums = [1, 2, 3, 4]\ntotal = 0\nfor n in nums:\n    total = n\nprint(total)''','    total = n','    total += n',
'total = n 每轮都用当前元素覆盖之前的结果，最后只剩最后一个数。','求和要先初始化 0，再在循环里 +=。')
add('basic','1 到 n 的和','想求 1 到 n 的整数和，但结果总是少一个 n。','range 上界 / 边界',
'''n = 5\ntotal = 0\nfor i in range(1, n):\n    total += i\nprint(total)''','for i in range(1, n):','for i in range(1, n + 1):',
'range(1, n) 只到 n-1，要包含 n 必须写 n+1。','range(a,b) 左闭右开，求 1 到 n 用 range(1,n+1)。')
add('basic','平均值的小数','目标是输出精确平均值，但代码把小数丢掉了。','整除 / 浮点除法',
'''a = 5\nb = 2\nprint(a // b)''','print(a // b)','print(a / b)',
'// 是整除，结果只保留整数部分；/ 才返回浮点数。','Python 3 的 / 总是浮点除法。')
add('basic','找最大值','目标是输出最大值，但现在输出的是最小值。','max / min',
'''nums = [7, 2, 9, 4]\nprint(min(nums))''','print(min(nums))','print(max(nums))',
'min 取最小，max 取最大，函数选反了。','求最大值用 max；先拿一个元素试算再检查方向。')
add('basic','字符串反转','目标是倒序输出整个字符串，但代码丢掉了第一个字符。','切片 / 步长',
'''s = "hello"\nprint(s[1:][::-1])''','print(s[1:][::-1])','print(s[::-1])',
's[1:] 先把首字符切掉，再反转当然少一位；完整反转是 s[::-1]。','切片 [start:stop:step]，省略两端才覆盖全串。')
add('basic','元音统计','目标是统计元音字母，但代码把非元音也数进去了。','条件判断 / in',
'''s = "hello"\ncount = 0\nfor c in s:\n    if c not in "aeiou":\n        count += 1\nprint(count)''','    if c not in "aeiou":','    if c in "aeiou":',
'not in 统计的是辅音，条件写反了。','判断存在用 in，不存在用 not in；先拿一个元音试一次。')
add('basic','阶乘','目标是算 5 的阶乘，但循环少乘了最后一项。','循环边界 / 累乘',
'''n = 5\nresult = 1\nfor i in range(1, n):\n    result *= i\nprint(result)''','for i in range(1, n):','for i in range(1, n + 1):',
'range 不包含 n，5 没有被乘进去，结果成了 4!。','阶乘要乘到 n，循环写 range(1,n+1)。')
add('basic','FizzBuzz 片段','目标是 3 的倍数输出 Fizz，但判断余数写错了。','取模 / 条件',
'''for i in range(1, 7):\n    if i % 3 == 1:\n        print("Fizz")\n    else:\n        print(i)''','    if i % 3 == 1:','    if i % 3 == 0:',
'3 的倍数余数是 0，不是 1。','判断整除用 n % k == 0。')
add('basic','回文判断','目标是比较正序和倒序，但代码只比较了字符串和自己。','切片 / 回文',
'''s = "hello"\nprint(s == s)''','print(s == s)','print(s == s[::-1])',
's == s 永远为真，根本没有比较倒序；必须与 s[::-1] 比。','回文标准写法是 s == s[::-1]。')
add('basic','乘法表','目标是输出 5 行乘法表，但代码少输出一行。','嵌套循环 / range',
'''n = 5\nfor i in range(1, n):\n    for j in range(1, i + 1):\n        print(i * j, end=" ")\n    print()''','for i in range(1, n):','for i in range(1, n + 1):',
'外层 range 不包含 n，最后一行没有输出。','行数 1..n 要用 range(1,n+1)。')

# INTERMEDIATE 10
add('intermediate','字符频次','目标是统计每个字符出现次数，但每个字符都被记成了 1。','字典 / 计数',
'''s = "aabbbc"\ncounts = {}\nfor c in s:\n    if c in counts:\n        counts[c] = 1\n    else:\n        counts[c] = 1\nprint(counts)''','        counts[c] = 1','        counts[c] += 1',
'已存在的键又赋成 1，频次永远不增长。','计数要先判断键是否存在，存在就 +=1。')
add('intermediate','变位词','目标是判断两个词字母重排后是否相同，但代码只比较原串。','排序 / 变位词',
'''a = "listen"\nb = "silent"\nprint(a == b)''','print(a == b)','print(sorted(a) == sorted(b))',
'变位词要看字母多重集合，直接比原串当然不等。','把两边排序或统计字符频次，再比较。')
add('intermediate','两数之和','目标是在数组里找和为目标的两个下标，但代码返回了两个相同的下标。','双指针 / 下标',
'''nums = [1, 2, 4, 7]\ntarget = 9\ni, j = 0, len(nums) - 1\nwhile i < j:\n    s = nums[i] + nums[j]\n    if s == target:\n        break\n    if s < target:\n        i += 1\n    else:\n        j -= 1\nprint(i, i)''','print(i, i)','print(i, j)',
'返回 i,i 只是同一个下标两次，第二个应该是 j。','返回前检查是不是两个不同位置的下标。')
add('intermediate','二分查找边界','目标是在有序数组里找 7，但左边界多跳了一格。','二分 / 边界',
'''nums = [1, 3, 5, 7, 9]\ntarget = 7\nlo, hi = 0, len(nums) - 1\nans = -1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if nums[mid] == target:\n        ans = mid\n        break\n    elif nums[mid] < target:\n        lo = mid + 2\n    else:\n        hi = mid - 1\nprint(ans)''','        lo = mid + 2','        lo = mid + 1',
'lo=mid+2 跳过了 mid+1，可能把正确答案所在位置漏掉。','二分更新必须只排除 mid：lo=mid+1。')
add('intermediate','最大公约数','目标是求 84 和 36 的最大公约数，但最后打印了余数。','欧几里得 / 输出',
'''a, b = 84, 36\nwhile b != 0:\n    a, b = b, a % b\nprint(b)''','print(b)','print(a)','循环结束时 b 一定是 0，打印 b 只会得到 0，不是最大公约数。','while 结束后答案在 a；b 是退出条件用的余数。')
add('intermediate','素数判断','目标是判断 29 是否为素数，但循环把 n 自己也试了。','试除法 / 边界',
'''n = 29\nprime = True\nfor i in range(2, n + 1):\n    if n % i == 0:\n        prime = False\nprint(prime)''','for i in range(2, n + 1):','for i in range(2, n):',
'试除时把 n 自己也算进去了，n % n == 0，任何 n 都会被判成非素数。','判断素数只需试到 n-1（或 sqrt(n)），不能把 n 本身放进 range。')
add('intermediate','矩阵转置','目标是把 2×3 矩阵转成 3×2，但代码没有交换行列。','二维列表 / 转置',
'''m = [[1, 2, 3], [4, 5, 6]]\nprint([row for row in m])''','print([row for row in m])','print([list(row) for row in zip(*m)])',
'原样输出还是 2×3；转置要按列取成新行。','转置用 zip(*m) 或双重循环交换 i/j。')
add('intermediate','单词计数','目标是统计句子里的单词个数，但代码按单个空格切分，连续空格被算成了空单词。','字符串 / split',
'''text = "hello  world from  python"\nprint(len(text.split(" ")))''','print(len(text.split(" ")))','print(len(text.split()))',
'split(" ") 会把连续空格之间的空串也算成一个字段；split() 按任意空白切分并丢弃空串。','统计单词用 split()，不要用 split(" ") 处理可能含连续空格的文本。')
add('intermediate','括号匹配','目标是检查括号是否成对，但右括号来时没有先检查栈空。','栈 / 边界',
'''s = ")("\nstack = []\nok = True\nfor c in s:\n    if c == "(":\n        stack.append(c)\n    else:\n        if len(stack) >= 0:\n            stack.pop()\n        else:\n            ok = False\nprint(ok)''','        if len(stack) >= 0:','        if len(stack) > 0:',
'len>=0 永远成立，空栈也会 pop，导致漏报不合法。','pop 前必须确认栈非空。')
add('intermediate','合并区间','目标是合并重叠区间，但右端点被短区间覆盖。','区间 / 右端点',
'''intervals = [[1, 10], [2, 3], [4, 5]]\nintervals.sort()\nmerged = []\nfor l, r in intervals:\n    if not merged or l > merged[-1][1]:\n        merged.append([l, r])\n    else:\n        merged[-1][1] = min(merged[-1][1], r)\nprint(merged)''','        merged[-1][1] = min(merged[-1][1], r)','        merged[-1][1] = max(merged[-1][1], r)',
'新区间可能被旧区间完全包含，右端点应该取最大值而不是最小值。','合并区间右端用 max，左端用 min。')

# HARD 10
add('hard','最长递增子序列','目标是求 LIS 长度，但代码只看了以最后一个元素结尾的情况。','LIS / 最大值',
'''nums = [6, 1, 2, 3, 0]\ndp = [1] * len(nums)\nfor i in range(len(nums)):\n    for j in range(i):\n        if nums[j] < nums[i]:\n            dp[i] = max(dp[i], dp[j] + 1)\nprint(dp[-1])''','print(dp[-1])','print(max(dp))',
'dp[i] 表示以 i 结尾的 LIS，全局答案可能在任意位置结束，要取 max(dp)。','LIS 答案不是 dp[n-1]。')
add('hard','滑动窗口最大值','目标是输出每个长度 3 的窗口最大值，但结果少最后一个。','滑动窗口 / range',
'''nums = [1, 3, -1, -3, 5, 3]\nk = 3\nout = []\nfor i in range(len(nums) - k):\n    out.append(max(nums[i:i + k]))\nprint(out)''','for i in range(len(nums) - k):','for i in range(len(nums) - k + 1):',
'窗口数量是 n-k+1，range(n-k) 会漏掉最后一个左端。','先算窗口数量 n-k+1。')
add('hard','0/1 背包','目标是容量 5 内选物品，但转移用了当前行，物品被重复选。','背包 / 当前行',
'''items = [(1, 2), (2, 3), (3, 4)]\ncap = 5\nn = len(items)\ndp = [[0] * (cap + 1) for _ in range(n + 1)]\nfor i in range(1, n + 1):\n    w, v = items[i - 1]\n    for c in range(cap + 1):\n        dp[i][c] = dp[i - 1][c]\n        if c >= w:\n            dp[i][c] = max(dp[i][c], dp[i][c - w] + v)\nprint(dp[n][cap])''','            dp[i][c] = max(dp[i][c], dp[i][c - w] + v)','            dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)',
'dp[i][c-w] 可能已经选过第 i 件物品，再加 v 就重复了。','0/1 背包从上一行 i-1 转移；完全背包才用当前行。')
add('hard','拓扑排序','目标是输出课程顺序，但代码把后继入度加 1，队列提前耗尽。','拓扑 / 入度',
'''n = 4\nprereqs = [[0, 1], [0, 2], [1, 3], [2, 3]]\nadj = [[] for _ in range(n)]\nindeg = [0] * n\nfor a, b in prereqs:\n    adj[a].append(b)\n    indeg[b] += 1\nqueue = [i for i in range(n) if indeg[i] == 0]\norder = []\nwhile queue:\n    cur = queue.pop(0)\n    order.append(cur)\n    for nxt in adj[cur]:\n        indeg[nxt] += 1\n        if indeg[nxt] == 0:\n            queue.append(nxt)\nprint(order if len(order) == n else [])''','        indeg[nxt] += 1','        indeg[nxt] -= 1',
'后继入度应该减少，加到 1 永远不会归零，队列很快空掉。','拓扑排序取节点后对每个后继 indeg -= 1。')
add('hard','硬币找零','目标是凑出 11 元的最少硬币数，但 dp[0] 初始化错了。','DP / 初始化',
'''coins = [1, 2, 5]\namount = 11\ndp = [999] * (amount + 1)\ndp[0] = 999\nfor i in range(1, amount + 1):\n    for c in coins:\n        if i >= c:\n            dp[i] = min(dp[i], dp[i - c] + 1)\nprint(dp[amount])''','dp[0] = 999','dp[0] = 0',
'dp[0] 表示凑 0 元需要 0 枚硬币，设成 999 会让所有转移都变大。','DP 边界要按语义初始化：0 元用 0 枚。')
add('hard','编辑距离','目标是求最少编辑次数，但不等时取了最大而不是最小。','编辑距离 / 转移',
'''a = "kitten"\nb = "sitting"\ndp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\nfor i in range(len(a) + 1):\n    dp[i][0] = i\nfor j in range(len(b) + 1):\n    dp[0][j] = j\nfor i in range(1, len(a) + 1):\n    for j in range(1, len(b) + 1):\n        if a[i-1] == b[j-1]:\n            dp[i][j] = dp[i-1][j-1]\n        else:\n            dp[i][j] = 1 + max(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])\nprint(dp[len(a)][len(b)])''','            dp[i][j] = 1 + max(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])','            dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])',
'三种编辑操作应取最小代价，取最大会把最优路径丢掉。','编辑距离转移对插入/删除/替换取 min。')
add('hard','区间调度','目标是最多选几个不重叠区间，但代码按起点排序。','贪心 / 区间调度',
'''intervals = [[1, 10], [2, 3], [4, 5]]\nintervals.sort()\ncount = 0\nend = -1\nfor l, r in intervals:\n    if l >= end:\n        count += 1\n        end = r\nprint(count)''','intervals.sort()','intervals.sort(key=lambda x: x[1])',
'按起点排序容易先选到长区间；按右端点排序才能给后面留最多空间。','区间调度经典贪心：按结束时间升序。')
add('hard','并查集','目标是合并集合，但 find 没有向上回溯到根。','并查集 / 路径',
'''parent = [0, 1, 2, 3]\ndef find(x):\n    while parent[x] != x:\n        return x\n    return x\nparent[1] = 2\nparent[2] = 3\nprint(find(1))''','        return x','        x = parent[x]',
'find 只返回当前节点，没有沿 parent 继续走到根，集合判断失效。','并查集 find 要循环/递归到 parent[x]==x。')
add('hard','BFS 最短路','目标是求无权图最短距离，但访问判断写反，第一次到达的新节点全被跳过。','BFS / visited',
'''from collections import deque\ng = [[1, 2], [0, 3], [0, 3], [1, 2]]\ndist = [-1] * 4\nq = deque([0])\ndist[0] = 0\nwhile q:\n    u = q.popleft()\n    for v in g[u]:\n        if dist[v] != -1:\n            dist[v] = dist[u] + 1\n            q.append(v)\nprint(dist)''','        if dist[v] != -1:','        if dist[v] == -1:',
'BFS 入队时应处理未访问节点，写成已访问判断会把所有第一次到达的新节点跳过，距离几乎全留在 -1。','BFS 入队时判断 dist[v] == -1，并立刻标记距离。')
add('hard','最长公共子序列','目标是求 LCS 长度，但字符不等时错误地用了左上角。','LCS / 转移',
'''a = "abcde"\nb = "ace"\ndp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\nfor i in range(1, len(a) + 1):\n    for j in range(1, len(b) + 1):\n        if a[i-1] == b[j-1]:\n            dp[i][j] = dp[i-1][j-1] + 1\n        else:\n            dp[i][j] = dp[i-1][j-1]\nprint(dp[len(a)][len(b)])''','            dp[i][j] = dp[i-1][j-1]','            dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
'字符不等时不能直接取左上角，应该在“跳过 a 的当前字符”和“跳过 b 的当前字符”里取最大。','LCS 不等时 dp[i][j]=max(dp[i-1][j],dp[i][j-1])。')

print('count',len(specs), 'levels', {l:sum(1 for s in specs if s['level']==l) for l in ['basic','intermediate','hard']})
# write JS
buckets={'basic':[],'intermediate':[],'hard':[]}
for i,s in enumerate(specs):
    js=json.dumps(s,ensure_ascii=False)
    # JS object needs gen wrapper; JSON uses true false null not valid? JSON true false are valid JS.
    item='{ id:"py87-'+s['level'][0]+str(i)+'", group:"Python 改错 · 扩容", topic:'+json.dumps(s['topic'],ensure_ascii=False)+', summary:'+json.dumps(s['desc'],ensure_ascii=False)+', gen:function(){ return '+js.replace('"level":', '"level":')+'; } }'
    buckets[s['level']].append(item)
out=["/* z87 · Python 改错 +30（三档各 10），expected 由 CPython 真实运行生成。 */","(function(root){","const T=root.PY_TEMPLATES;","if(!T)return;"]
for lv in ['basic','intermediate','hard']:
    out.append('T.'+lv+'.push('+',\n'.join(buckets[lv])+');')
out.append('})(typeof window!=="undefined"?window:globalThis);')
Path('assets/js/python-problems-z87.js').write_text('\n'.join(out),encoding='utf-8')
print('written',Path('assets/js/python-problems-z87.js').stat().st_size)
