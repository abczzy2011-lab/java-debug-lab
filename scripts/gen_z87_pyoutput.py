import json
from pathlib import Path

T=[]
def add(level,title,subtitle,brief,goal,input_,output,concepts,hints,fast,tests,fn):
    T.append(dict(level=level,title=title,subtitle=subtitle,brief=brief,goal=goal,input=input_,output=output,concepts=concepts,hints=hints,fastMs=fast,tests=tests,fn=fn))

def p1(s):
    n=int(s.strip()); return str(n*(n+1)//2)
add('basic','1 到 n 求和','闭区间求和','把 1 到 n 的所有整数相加。','读入整数 n，输出 1+2+…+n 的结果。','一行，一个整数 n（1 ≤ n ≤ 100000）。','一个整数。',['循环','求和'],['从 1 累加到 n。','n 很大时用公式 n*(n+1)//2。'],30,['5','100','1'],p1)
def p2(s):
    return str(sum(1 for x in map(int,s.split()) if x%2==0))
add('basic','偶数个数','遍历与取余','数一数这串整数里有多少个偶数。','读入一行空格分隔的整数，输出其中偶数的个数。','一行整数，至少一个。','一个整数。',['列表','取余'],['x % 2 == 0 是偶数。','负偶数也是偶数。'],30,['1 2 3 4','2 4 6','1 3 5'],p2)
def p3(s): return str(max(map(int,s.split())))
add('basic','最大值','别把方向搞反','找出一行整数中的最大值。','读入一行空格分隔的整数，输出最大值。','一行整数，至少一个。','一个整数。',['列表','比较'],['用 max()。','不要用 0 初始化。'],30,['3 9 2','-5 -1 -9','7'],p3)
def p4(s): return str(min(map(int,s.split())))
add('basic','最小值','方向与最大值相反','找出一行整数中的最小值。','读入一行空格分隔的整数，输出最小值。','一行整数，至少一个。','一个整数。',['列表','比较'],['用 min()。','全负数同样适用。'],30,['3 9 2','-5 -1 -9','-2 -8'],p4)
def p5(s):
    a=list(map(int,s.split())); return f'{sum(a)/len(a):.1f}'
add('basic','平均数','保留一位小数','求一行整数的平均数。','读入一行空格分隔的整数，输出平均数，保留一位小数。','一行整数，至少一个。','一个数，保留一位小数。',['求和','格式化'],['先求和再除以个数。','用 f"{x:.1f}"。'],30,['1 2 3','2 4','1 2 4'],p5)
def p6(s):
    n=int(s.strip()); r=1
    for i in range(2,n+1): r*=i
    return str(r)
add('basic','阶乘','0! 也是 1','计算 n 的阶乘。','读入整数 n，输出 n!。','一行，一个整数 n（0 ≤ n ≤ 12）。','一个整数。',['循环','累乘'],['结果从 1 开始。','0 的阶乘是 1。'],30,['5','0','3'],p6)
def p7(s):
    n=int(s.strip()); a=b=1
    if n<=2: return '1'
    for _ in range(3,n+1): a,b=b,a+b
    return str(b)
add('basic','斐波那契第 n 项','递推入门','输出斐波那契数列的第 n 项。','读入 n，输出 F(n)，其中 F(1)=1,F(2)=1。','一行，一个整数 n（1 ≤ n ≤ 40）。','一个整数。',['递推','循环'],['从 F(1)、F(2) 开始。','用两个变量滚动。'],30,['7','1','10'],p7)
def p8(s):
    a,b=map(int,s.split())
    while b: a,b=b,a%b
    return str(a)
add('basic','最大公约数','辗转相除','求两个正整数的最大公约数。','读入两个正整数 a b，输出它们的 gcd。','一行两个正整数。','一个整数。',['循环','取余'],['反复做 a,b=b,a%b。'],30,['12 18','7 13','100 40'],p8)
def p9(s):
    n=int(s.strip()); c=0
    for x in range(2,n+1):
        ok=True
        d=2
        while d*d<=x:
            if x%d==0: ok=False; break
            d+=1
        if ok: c+=1
    return str(c)
add('basic','质数个数','从 2 数到 n','统计 1 到 n 之间有多少个质数。','读入 n，输出不超过 n 的质数个数。','一行，一个整数 n（1 ≤ n ≤ 1000）。','一个整数。',['循环','质数判断'],['逐个判断 2..n。','判断到平方根即可。'],50,['10','1','20'],p9)
def p10(s):
    n=int(s.strip()); total=0
    while n>0: total+=n%10; n//=10
    return str(total)
add('basic','数位之和','不断取末位','求一个非负整数的各位数字之和。','读入一个非负整数 n，输出它的数位和。','一行，一个整数 n（0 ≤ n ≤ 10^9）。','一个整数。',['循环','取余'],['每次取 n%10，再 //10。','0 的数位和是 0。'],30,['123','0','1001'],p10)

def p11(s): return ' '.join(map(str,sorted(map(int,s.split()))))
add('intermediate','整数排序','升序输出','把一行整数按升序排列。','读入一行空格分隔的整数，输出升序结果，用一个空格分隔。','一行整数。','排序后的整数序列。',['排序','列表'],['用 sorted()。'],40,['3 1 2','10 2 1','-1 0 -2'],p11)
def p12(s): return ' '.join(map(str,sorted(set(map(int,s.split())))))
add('intermediate','去重并排序','Set + sort','去掉重复整数并升序输出。','读入一行整数，输出去重后的升序序列，用一个空格分隔。','一行整数。','去重升序序列。',['集合','排序'],['用 set 去重。'],40,['3 1 3 2','1 1 1','5 4 3'],p12)
def p13(s):
    a,b=s.strip().split('\n')[:2]
    return 'yes' if sorted(a.lower())==sorted(b.lower()) else 'no'
add('intermediate','变位词判断','字母组成相同','判断两行字符串是否互为变位词。','读入两行字符串 a、b（忽略大小写），是变位词输出 yes，否则 no。','两行，每行一个字符串。','yes 或 no。',['字符串','排序'],['都转小写并排序。'],40,['Listen\nSilent','aab\nabb','abc\ncba'],p13)
def p14(s):
    t=''.join(c.lower() for c in s if c.isalnum())
    return 'yes' if t==t[::-1] else 'no'
add('intermediate','回文判断','正着读反着读一样','判断一行字符串是否为回文，忽略大小写和非字母数字。','读入一行文本，若是回文输出 yes，否则 no。','一行文本。','yes 或 no。',['字符串','双指针'],['保留字母数字并转小写。'],40,['A man, a plan, a canal: Panama','hello','Was it a car or a cat I saw?'],p14)
def p15(s): return str(len(s.split()))
add('intermediate','单词计数','连续空格只算一个','统计一行文本中的单词个数。','读入一行文本，按空白切分，输出单词个数。','一行文本。','一个整数。',['字符串','split'],['用 split() 自动处理连续空白。'],40,['hello  world','  a b  ',''],p15)
def p16(s):
    lines=s.strip().split('\n'); m,n=map(int,lines[0].split())
    return '\n'.join(str(sum(map(int,lines[i+1].split()))) for i in range(m))
add('intermediate','矩阵每行求和','二维数组','输出矩阵每一行元素之和。','第一行读入 m n，随后 m 行每行 n 个整数，输出每行的和。','第一行 m n，随后 m 行数据。','m 个整数，每行一个。',['矩阵','求和'],['按行读取。'],40,['2 3\n1 2 3\n4 5 6','1 1\n7','3 2\n1 2\n3 4\n5 6'],p16)
def p17(s):
    lines=s.strip().split('\n'); m,n=map(int,lines[0].split()); a=[list(map(int,lines[i+1].split())) for i in range(m)]
    return '\n'.join(' '.join(str(a[i][j]) for i in range(m)) for j in range(n))
add('intermediate','矩阵转置','行列互换','输出矩阵的转置。','第一行读 m n，随后 m 行每行 n 个整数，输出 n 行 m 列的转置矩阵。','第一行 m n，随后矩阵。','转置后的矩阵。',['矩阵','下标'],['新矩阵第 j 行是原矩阵第 j 列。'],40,['2 3\n1 2 3\n4 5 6','2 2\n1 2\n3 4','1 3\n7 8 9'],p17)
def p18(s):
    lines=s.strip().split('\n'); n,t=map(int,lines[0].split()); a=list(map(int,lines[1].split())) if n else []
    lo,hi=0,len(a)-1
    while lo<=hi:
        mid=(lo+hi)//2
        if a[mid]==t: return str(mid)
        if a[mid]<t: lo=mid+1
        else: hi=mid-1
    return '-1'
add('intermediate','二分查找','升序数组找下标','在升序数组中查找 target 的下标。','第一行读 n 和 target，第二行读 n 个升序整数；找到输出下标（从 0 开始），否则 -1。','第一行 n target，第二行数组。','下标或 -1。',['二分','边界'],['lo<=hi，mid 后排除。'],40,['4 5\n1 3 5 7','4 8\n1 3 5 7','0 3\n'],p18)
def p19(s):
    st=[]; mp={')':'(',']':'[','}':'{'}
    for c in s.strip():
        if c in '([{': st.append(c)
        elif st.pop()!=mp.get(c): return 'no'
    return 'yes' if not st else 'no'
add('intermediate','括号平衡','栈的典型应用','判断三种括号是否正确嵌套。','读入一行只含 ()[]{} 的字符串，平衡输出 yes，否则 no。','一行括号字符串。','yes 或 no。',['栈','映射'],['左括号入栈。','右括号与栈顶比较。'],40,['({[]})','([)]','(('],p19)
def p20(s):
    lines=s.strip().split('\n'); n,t=map(int,lines[0].split()); a=list(map(int,lines[1].split())); m={}
    for i,x in enumerate(a):
        need=t-x
        if need in m: return f'{m[need]} {i}'
        m[x]=i
    return '-1'
add('intermediate','两数之和下标','哈希表','找出和为 target 的两个不同下标。','第一行读 n target，第二行读 n 个整数；输出两个下标（小的在前），找不到输出 -1。','第一行 n target，第二行数组。','两个下标或 -1。',['哈希表','下标'],['存值到下标。'],40,['4 9\n2 7 11 15','2 6\n3 3','2 5\n1 2'],p20)

def p21(s):
    a=list(map(int,s.split())); dp=[1]*len(a)
    for i in range(len(a)):
        for j in range(i):
            if a[j]<a[i]: dp[i]=max(dp[i],dp[j]+1)
    return str(max(dp))
add('challenge','最长递增子序列','动态规划','求最长严格递增子序列长度。','读入一行整数，输出 LIS 长度。','一行整数。','一个整数。',['动态规划'],['dp[i] 表示以 i 结尾的 LIS。'],60,['6 1 2 3 0','2 2 2','5'],p21)
def p22(s):
    lines=s.strip().split('\n'); coins=list(map(int,lines[0].split())); amount=int(lines[1]); dp=[float('inf')]*(amount+1); dp[0]=0
    for i in range(1,amount+1):
        for c in coins:
            if i>=c: dp[i]=min(dp[i],dp[i-c]+1)
    return '-1' if dp[amount]==float('inf') else str(dp[amount])
add('challenge','硬币找零','完全背包','用最少硬币凑出金额。','第一行读硬币面额，第二行读金额；输出最少硬币数，凑不出输出 -1。','第一行空格分隔的硬币面额，第二行金额。','一个整数。',['动态规划','最值'],['dp[0]=0。'],60,['1 2 5\n11','2\n3','1\n0'],p22)
def p23(s):
    a,b=s.split('\n'); dp=[[0]*(len(b)+1) for _ in range(len(a)+1)]
    for i in range(len(a)+1): dp[i][0]=i
    for j in range(len(b)+1): dp[0][j]=j
    for i in range(1,len(a)+1):
        for j in range(1,len(b)+1):
            dp[i][j]=dp[i-1][j-1] if a[i-1]==b[j-1] else 1+min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1])
    return str(dp[-1][-1])
add('challenge','编辑距离','插入删除替换','求把 a 变成 b 的最少编辑次数。','读入两行字符串 a、b，输出编辑距离。','两行字符串。','一个整数。',['动态规划','字符串'],['不等时取三种操作最小值。'],60,['kitten\nsitting','abc\nabc','\nabc'],p23)
def p24(s):
    lines=s.strip().split('\n'); n=int(lines[0]); a=sorted([tuple(map(int,lines[i+1].split())) for i in range(n)])
    out=[]
    for x,y in a:
        if not out or x>out[-1][1]: out.append([x,y])
        else: out[-1][1]=max(out[-1][1],y)
    return '\n'.join(f'{x} {y}' for x,y in out)
add('challenge','合并区间','按左端点排序','合并所有重叠区间。','第一行读 n，随后 n 行每行 l r；输出合并后的区间，每行一个。','第一行 n，随后 n 行区间。','合并后的区间，按左端点升序。',['排序','区间'],['右端点取 max。'],60,['3\n1 3\n2 6\n8 10','2\n1 10\n2 3','2\n1 2\n3 4'],p24)
def p25(s):
    a=list(map(int,s.split())); best=-10**18; cur=0
    for x in a: cur=max(x,cur+x); best=max(best,cur)
    return str(best)
add('challenge','最大子数组和','Kadane','求连续子数组的最大和。','读入一行整数，输出最大连续子段和。','一行整数。','一个整数。',['动态规划','贪心'],['cur=max(x,cur+x)。'],60,['-2 1 -3 4 -1 2 1 -5 4','-3 -1 -2','1 2 3'],p25)
def p26(s):
    lines=s.strip().split('\n'); n,k=map(int,lines[0].split()); a=list(map(int,lines[1].split())); m={}
    for x in a: m[x]=m.get(x,0)+1
    items=sorted(m.items(),key=lambda z:(-z[1],z[0]))[:k]
    return ' '.join(str(x) for x,_ in items)
add('challenge','频率前 K 高','Map + 排序','输出出现次数最多的 k 个值。','第一行读 n k，第二行读 n 个整数；输出频率最高的 k 个值，按值升序。','第一行 n k，第二行数组。','k 个整数，空格分隔。',['字典','排序'],['按频次降序、值升序。'],60,['6 2\n1 1 2 2 2 3','4 1\n4 4 5 5','1 1\n1'],p26)
def p27(s):
    lines=s.strip().split('\n'); m,n=map(int,lines[0].split()); a=[list(map(int,lines[i+1].split())) for i in range(m)]
    out=[]; top,bottom,left,right=0,m-1,0,n-1
    while top<=bottom and left<=right:
        for j in range(left,right+1): out.append(a[top][j])
        top+=1
        for i in range(top,bottom+1): out.append(a[i][right])
        right-=1
        if top<=bottom:
            for j in range(right,left-1,-1): out.append(a[bottom][j])
            bottom-=1
        if left<=right:
            for i in range(bottom,top-1,-1): out.append(a[i][left])
            left+=1
    return ' '.join(map(str,out))
add('challenge','螺旋矩阵','四边界收缩','按顺时针螺旋顺序输出矩阵元素。','第一行读 m n，随后 m 行矩阵；按螺旋顺序输出一行元素。','第一行 m n，随后矩阵。','螺旋顺序的整数，空格分隔。',['矩阵','边界'],['维护四个边界。'],70,['3 3\n1 2 3\n4 5 6\n7 8 9','2 2\n1 2\n3 4','1 4\n1 2 3 4'],p27)
def p28(s):
    a=json.loads(s.strip())
    def f(x):
        return [z for y in x for z in (f(y) if isinstance(y,list) else [y])]
    return ' '.join(map(str,f(a)))
add('challenge','深层扁平化','递归展开','把嵌套数组展开成一维。','读入一行 JSON 数组（只含数字和数组），输出扁平化后空格分隔的数字。','一行 JSON 数组。','扁平化后的数字。',['递归','数组'],['遇到列表递归。'],60,['[1,[2,[3,[4]]]]','[[1],[2,3]]','[]'],p28)
def p29(s):
    def q(a):
        if len(a)<=1: return a[:]
        return q([x for x in a if x<a[0]])+[x for x in a if x==a[0]]+q([x for x in a if x>a[0]])
    arr = list(map(int, s.split()))
    return ' '.join(map(str, q(arr)))
add('challenge','快速排序','分治','用快速排序输出升序结果。','读入一行整数，输出升序序列。','一行整数。','升序序列，空格分隔。',['分治','递归'],['重复元素单独收集。'],60,['3 1 2 3','5 4 3 2 1','1'],p29)
def p30(s):
    st=[]
    for t in s.split():
        if t in '+-*/':
            b=st.pop(); a=st.pop()
            st.append(a+b if t=='+' else a-b if t=='-' else a*b if t=='*' else int(a/b))
        else: st.append(int(t))
    return str(st.pop())
add('challenge','逆波兰表达式','后缀表达式求值','计算逆波兰表达式的值。','读入一行空格分隔的 token（整数和 + - * /），输出计算结果（除法向零取整）。','一行 token。','一个整数。',['栈','表达式'],['先弹出的是右操作数。'],60,['2 1 + 3 *','4 13 5 / +','10 6 9 3 + -11 * / * 17 + 5 +'],p30)

out=[]
for i,t in enumerate(T,1):
    tests=[]
    for j,stdin in enumerate(t['tests']):
        expected=t['fn'](stdin)
        tests.append({'label':'公开样例' if j==0 else f'隐藏用例 {j}','stdin':stdin,'expected':expected})
    out.append({'id':f'z87-p{i}','level':t['level'],'no':31+i,'title':t['title'],'subtitle':t['subtitle'],'brief':t['brief'],'goal':t['goal'],'input':t['input'],'output':t['output'],'concepts':t['concepts'],'hints':t['hints'],'fastMs':t['fastMs'],'starter':'import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == "__main__":\n    main()','testCases':tests,'sampleStdin':tests[0]['stdin'],'sampleStdout':tests[0]['expected']})
text='/* z87 · Python 输出实现场 +30（三档各 10），expected 由 CPython 参考解真实运行。 */\n(function(bank,tasks){if(!bank||!Array.isArray(bank.tasks))return;bank.tasks.push.apply(bank.tasks,tasks);bank.version="20261126z87";})(window.PYTHON_OUTPUT_BANK,'+json.dumps(out,ensure_ascii=False,indent=2)+');\n'
Path('assets/js/python-output/python-output-z87.js').write_text(text)
print('tasks',len(out),'levels',{k:sum(1 for x in out if x['level']==k) for k in ['basic','intermediate','challenge']},'size',len(text))
