import json, subprocess, tempfile, os, textwrap
from pathlib import Path

T=[]
def add(level,title,subtitle,brief,goal,input_,output,concepts,hints,fast,tests,code):
    T.append(dict(level=level,title=title,subtitle=subtitle,brief=brief,goal=goal,input=input_,output=output,concepts=concepts,hints=hints,fastMs=fast,tests=tests,code=code))

def run_java(code, stdin):
    with tempfile.TemporaryDirectory() as d:
        Path(d,'Main.java').write_text(code)
        c=subprocess.run(['javac','Main.java'],cwd=d,capture_output=True,text=True,timeout=30)
        if c.returncode!=0: raise RuntimeError(c.stderr)
        r=subprocess.run(['java','Main'],cwd=d,input=stdin,capture_output=True,text=True,timeout=10)
        if r.returncode!=0: raise RuntimeError(r.stderr)
        return r.stdout.rstrip('\n')

def j(code): return 'import java.util.*;\nimport java.io.*;\npublic class Main {\n'+textwrap.indent(code.strip(),'    ')+'\n}'
# basic
add('basic','1 到 n 求和','闭区间求和','把 1 到 n 的所有整数相加。','读入整数 n，输出 1+2+…+n 的结果。','一行，一个整数 n（1 ≤ n ≤ 100000）。','一个整数。',['循环','长整型'],['用 long 防止溢出。','也可用公式 n*(n+1)/2。'],40,['5','100','1'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 long n=Long.parseLong(br.readLine().trim());
 System.out.println(n*(n+1)/2);
}'''))
add('basic','偶数个数','遍历与取余','数一数这串整数里有多少个偶数。','读入一行空格分隔的整数，输出其中偶数的个数。','一行整数，至少一个。','一个整数。',['数组','取余'],['n % 2 == 0 是偶数。','负偶数也是偶数。'],40,['1 2 3 4','2 4 6','1 3 5'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" ");
 int c=0; for(String s:p) if(Integer.parseInt(s)%2==0)c++;
 System.out.println(c);
}'''))
add('basic','最大值','别把方向搞反','找出一行整数中的最大值。','读入一行空格分隔的整数，输出最大值。','一行整数，至少一个。','一个整数。',['数组','比较'],['用第一个元素初始化。','不要用 0 初始化。'],40,['3 9 2','-5 -1 -9','7'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" ");
 int best=Integer.parseInt(p[0]); for(String s:p) best=Math.max(best,Integer.parseInt(s));
 System.out.println(best);
}'''))
add('basic','最小值','方向与最大值相反','找出一行整数中的最小值。','读入一行空格分隔的整数，输出最小值。','一行整数，至少一个。','一个整数。',['数组','比较'],['用第一个元素初始化。'],40,['3 9 2','-5 -1 -9','-2 -8'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" ");
 int best=Integer.parseInt(p[0]); for(String s:p) best=Math.min(best,Integer.parseInt(s));
 System.out.println(best);
}'''))
add('basic','平均数','保留一位小数','求一行整数的平均数。','读入一行空格分隔的整数，输出平均数，保留一位小数。','一行整数，至少一个。','一个数，保留一位小数。',['求和','格式化'],['sum 用 double。','printf("%.1f")。'],40,['1 2 3','2 4','1 2 4'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" ");
 double s=0; for(String x:p)s+=Integer.parseInt(x);
 System.out.printf("%.1f%n",s/p.length);
}'''))
add('basic','阶乘','0! 也是 1','计算 n 的阶乘。','读入整数 n，输出 n!。','一行，一个整数 n（0 ≤ n ≤ 12）。','一个整数。',['循环','累乘'],['结果从 1 开始。','0 的阶乘是 1。'],40,['5','0','3'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 int n=Integer.parseInt(br.readLine().trim()); long r=1;
 for(int i=2;i<=n;i++)r*=i;
 System.out.println(r);
}'''))
add('basic','斐波那契第 n 项','递推入门','输出斐波那契数列的第 n 项。','读入 n，输出 F(n)，其中 F(1)=1,F(2)=1。','一行，一个整数 n（1 ≤ n ≤ 40）。','一个整数。',['递推','循环'],['用两个变量滚动。'],40,['7','1','10'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 int n=Integer.parseInt(br.readLine().trim()); long a=1,b=1;
 if(n<=2){System.out.println(1);return;}
 for(int i=3;i<=n;i++){long t=a+b;a=b;b=t;}
 System.out.println(b);
}'''))
add('basic','最大公约数','辗转相除','求两个正整数的最大公约数。','读入两个正整数 a b，输出它们的 gcd。','一行两个正整数。','一个整数。',['循环','取余'],['反复做 a,b=b,a%b。'],40,['12 18','7 13','100 40'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" "); long a=Long.parseLong(p[0]),b=Long.parseLong(p[1]);
 while(b>0){long t=a%b;a=b;b=t;}
 System.out.println(a);
}'''))
add('basic','质数个数','从 2 数到 n','统计 1 到 n 之间有多少个质数。','读入 n，输出不超过 n 的质数个数。','一行，一个整数 n（1 ≤ n ≤ 1000）。','一个整数。',['循环','质数判断'],['判断到平方根即可。'],50,['10','1','20'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 int n=Integer.parseInt(br.readLine().trim()); int c=0;
 for(int x=2;x<=n;x++){boolean ok=true;for(int d=2;d*d<=x;d++)if(x%d==0){ok=false;break;}if(ok)c++;}
 System.out.println(c);
}'''))
add('basic','数位之和','不断取末位','求一个非负整数的各位数字之和。','读入一个非负整数 n，输出它的数位和。','一行，一个整数 n（0 ≤ n ≤ 10^9）。','一个整数。',['循环','取余'],['每次取 n%10，再除以 10。'],40,['123','0','1001'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 long n=Long.parseLong(br.readLine().trim()); int s=0;
 while(n>0){s+=n%10;n/=10;}
 System.out.println(s);
}'''))
# intermediate
add('intermediate','整数排序','升序输出','把一行整数按升序排列。','读入一行空格分隔的整数，输出升序结果，用一个空格分隔。','一行整数。','排序后的整数序列。',['排序','数组'],['用 Arrays.sort。'],50,['3 1 2','10 2 1','-1 0 -2'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" "); int n=p.length; int[] a=new int[n];
 for(int i=0;i<n;i++)a[i]=Integer.parseInt(p[i]); Arrays.sort(a);
 StringBuilder sb=new StringBuilder(); for(int i=0;i<n;i++){if(i>0)sb.append(' ');sb.append(a[i]);} System.out.println(sb);
}'''))
add('intermediate','去重并排序','Set + sort','去掉重复整数并升序输出。','读入一行整数，输出去重后的升序序列，用一个空格分隔。','一行整数。','去重升序序列。',['集合','排序'],['用 TreeSet 或排序后去重。'],50,['3 1 3 2','1 1 1','5 4 3'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" "); TreeSet<Integer> s=new TreeSet<>();
 for(String x:p)s.add(Integer.parseInt(x));
 StringBuilder sb=new StringBuilder(); for(int x:s){if(sb.length()>0)sb.append(' ');sb.append(x);} System.out.println(sb);
}'''))
add('intermediate','变位词判断','字母组成相同','判断两行字符串是否互为变位词。','读入两行字符串 a、b（忽略大小写），是变位词输出 yes，否则 no。','两行，每行一个字符串。','yes 或 no。',['字符串','排序'],['都转小写并排序。'],50,['Listen\nSilent','aab\nabb','abc\ncba'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String a=br.readLine().trim().toLowerCase(), b=br.readLine().trim().toLowerCase();
 char[] x=a.toCharArray(), y=b.toCharArray(); Arrays.sort(x); Arrays.sort(y);
 System.out.println(Arrays.equals(x,y)?"yes":"no");
}'''))
add('intermediate','回文判断','正着读反着读一样','判断一行字符串是否为回文，忽略大小写和非字母数字。','读入一行文本，若是回文输出 yes，否则 no。','一行文本。','yes 或 no。',['字符串','双指针'],['保留字母数字并转小写。'],50,['A man, a plan, a canal: Panama','hello','Was it a car or a cat I saw?'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String s=br.readLine().toLowerCase().replaceAll("[^a-z0-9]","");
 boolean ok=true; for(int i=0,j=s.length()-1;i<j;i++,j--) if(s.charAt(i)!=s.charAt(j)){ok=false;break;}
 System.out.println(ok?"yes":"no");
}'''))
add('intermediate','单词计数','连续空格只算一个','统计一行文本中的单词个数。','读入一行文本，按空白切分，输出单词个数。','一行文本。','一个整数。',['字符串','正则'],['用 trim 后 split。'],50,['hello  world','  a b  ',''],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String s=br.readLine(); s=s==null?"":s.trim();
 System.out.println(s.isEmpty()?0:s.split("\\\\s+").length);
}'''))
add('intermediate','矩阵每行求和','二维数组','输出矩阵每一行元素之和。','第一行读入 m n，随后 m 行每行 n 个整数，输出每行的和。','第一行 m n，随后 m 行数据。','m 个整数，每行一个。',['矩阵','求和'],['按行读取。'],50,['2 3\n1 2 3\n4 5 6','1 1\n7','3 2\n1 2\n3 4\n5 6'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] h=br.readLine().trim().split(" "); int m=Integer.parseInt(h[0]),n=Integer.parseInt(h[1]);
 for(int i=0;i<m;i++){String[] p=br.readLine().trim().split(" ");long s=0;for(String x:p)s+=Integer.parseInt(x);System.out.println(s);}
}'''))
add('intermediate','矩阵转置','行列互换','输出矩阵的转置。','第一行读 m n，随后 m 行每行 n 个整数，输出 n 行 m 列的转置矩阵。','第一行 m n，随后矩阵。','转置后的矩阵。',['矩阵','下标'],['新矩阵第 j 行是原矩阵第 j 列。'],50,['2 3\n1 2 3\n4 5 6','2 2\n1 2\n3 4','1 3\n7 8 9'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] h=br.readLine().trim().split(" "); int m=Integer.parseInt(h[0]),n=Integer.parseInt(h[1]);
 int[][] a=new int[m][n]; for(int i=0;i<m;i++){String[] p=br.readLine().trim().split(" ");for(int j=0;j<n;j++)a[i][j]=Integer.parseInt(p[j]);}
 for(int j=0;j<n;j++){StringBuilder sb=new StringBuilder();for(int i=0;i<m;i++){if(i>0)sb.append(' ');sb.append(a[i][j]);}System.out.println(sb);}
}'''))
add('intermediate','二分查找','升序数组找下标','在升序数组中查找 target 的下标。','第一行读 n 和 target，第二行读 n 个升序整数；找到输出下标（从 0 开始），否则 -1。','第一行 n target，第二行数组。','下标或 -1。',['二分','边界'],['lo<=hi，mid 后排除。'],50,['4 5\n1 3 5 7','4 8\n1 3 5 7','0 3\n'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] h=br.readLine().trim().split(" "); int n=Integer.parseInt(h[0]),t=Integer.parseInt(h[1]);
 int[] a=new int[n]; String line=n>0?br.readLine().trim():""; if(n>0){String[] p=line.split(" ");for(int i=0;i<n;i++)a[i]=Integer.parseInt(p[i]);}
 int lo=0,hi=n-1,ans=-1; while(lo<=hi){int mid=(lo+hi)/2;if(a[mid]==t){ans=mid;break;}if(a[mid]<t)lo=mid+1;else hi=mid-1;}
 System.out.println(ans);
}'''))
add('intermediate','括号平衡','栈的典型应用','判断三种括号是否正确嵌套。','读入一行只含 ()[]{} 的字符串，平衡输出 yes，否则 no。','一行括号字符串。','yes 或 no。',['栈','映射'],['左括号入栈。','右括号与栈顶比较。'],50,['({[]})','([)]','(('],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String s=br.readLine().trim(); Deque<Character> st=new ArrayDeque<>(); boolean ok=true;
 for(char c:s.toCharArray()){if("([{".indexOf(c)>=0)st.push(c);else{Character top=st.poll();if(top==null||(c==')'&&top!='(')||(c==']'&&top!='[')||(c=='}'&&top!='{')){ok=false;break;}}}
 if(!st.isEmpty())ok=false; System.out.println(ok?"yes":"no");
}'''))
add('intermediate','两数之和下标','哈希表','找出和为 target 的两个不同下标。','第一行读 n target，第二行读 n 个整数；输出两个下标（小的在前），找不到输出 -1。','第一行 n target，第二行数组。','两个下标或 -1。',['哈希表','下标'],['存值到下标。'],50,['4 9\n2 7 11 15','2 6\n3 3','2 5\n1 2'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] h=br.readLine().trim().split(" "); int n=Integer.parseInt(h[0]),t=Integer.parseInt(h[1]);
 String[] p=br.readLine().trim().split(" "); Map<Integer,Integer> m=new HashMap<>();
 for(int i=0;i<n;i++){int x=Integer.parseInt(p[i]);int need=t-x;if(m.containsKey(need)){System.out.println(m.get(need)+" "+i);return;}m.put(x,i);}
 System.out.println(-1);
}'''))
# challenge
add('challenge','最长递增子序列','动态规划','求最长严格递增子序列长度。','读入一行整数，输出 LIS 长度。','一行整数。','一个整数。',['动态规划'],['dp[i] 表示以 i 结尾。'],60,['6 1 2 3 0','2 2 2','5'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" "); int n=p.length; int[] a=new int[n],dp=new int[n];
 for(int i=0;i<n;i++){a[i]=Integer.parseInt(p[i]);dp[i]=1;}
 for(int i=0;i<n;i++)for(int k=0;k<i;k++)if(a[k]<a[i])dp[i]=Math.max(dp[i],dp[k]+1);
 int best=0;for(int x:dp)best=Math.max(best,x);System.out.println(best);
}'''))
add('challenge','硬币找零','完全背包','用最少硬币凑出金额。','第一行读硬币面额，第二行读金额；输出最少硬币数，凑不出输出 -1。','第一行空格分隔的硬币面额，第二行金额。','一个整数。',['动态规划','最值'],['dp[0]=0。'],60,['1 2 5\n11','2\n3','1\n0'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" "); int m=Integer.parseInt(br.readLine().trim());
 int[] dp=new int[m+1]; Arrays.fill(dp,1000000000); dp[0]=0;
 for(int i=1;i<=m;i++)for(String s:p){int c=Integer.parseInt(s);if(i>=c)dp[i]=Math.min(dp[i],dp[i-c]+1);}
 System.out.println(dp[m]>=1000000000?-1:dp[m]);
}'''))
add('challenge','编辑距离','插入删除替换','求把 a 变成 b 的最少编辑次数。','读入两行字符串 a、b，输出编辑距离。','两行字符串。','一个整数。',['动态规划','字符串'],['不等时取三种操作最小值。'],60,['kitten\nsitting','abc\nabc','\nabc'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String a=br.readLine(); String b=br.readLine(); if(a==null)a=""; if(b==null)b="";
 int[][] dp=new int[a.length()+1][b.length()+1];
 for(int i=0;i<=a.length();i++)dp[i][0]=i; for(int j=0;j<=b.length();j++)dp[0][j]=j;
 for(int i=1;i<=a.length();i++)for(int j=1;j<=b.length();j++)dp[i][j]=a.charAt(i-1)==b.charAt(j-1)?dp[i-1][j-1]:1+Math.min(dp[i-1][j-1],Math.min(dp[i-1][j],dp[i][j-1]));
 System.out.println(dp[a.length()][b.length()]);
}'''))
add('challenge','合并区间','按左端点排序','合并所有重叠区间。','第一行读 n，随后 n 行每行 l r；输出合并后的区间，每行一个。','第一行 n，随后 n 行区间。','合并后的区间，按左端点升序。',['排序','区间'],['右端点取 max。'],60,['3\n1 3\n2 6\n8 10','2\n1 10\n2 3','2\n1 2\n3 4'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 int n=Integer.parseInt(br.readLine().trim()); int[][] a=new int[n][2];
 for(int i=0;i<n;i++){String[] p=br.readLine().trim().split(" ");a[i][0]=Integer.parseInt(p[0]);a[i][1]=Integer.parseInt(p[1]);}
 Arrays.sort(a,(x,y)->Integer.compare(x[0],y[0]));
 List<int[]> out=new ArrayList<>();
 for(int[] x:a){if(out.isEmpty()||x[0]>out.get(out.size()-1)[1])out.add(new int[]{x[0],x[1]});else out.get(out.size()-1)[1]=Math.max(out.get(out.size()-1)[1],x[1]);}
 for(int[] x:out)System.out.println(x[0]+" "+x[1]);
}'''))
add('challenge','最大子数组和','Kadane','求连续子数组的最大和。','读入一行整数，输出最大连续子段和。','一行整数。','一个整数。',['动态规划','贪心'],['cur=max(x,cur+x)。'],60,['-2 1 -3 4 -1 2 1 -5 4','-3 -1 -2','1 2 3'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" "); long best=Long.MIN_VALUE,cur=0;
 for(String s:p){long x=Long.parseLong(s);cur=Math.max(x,cur+x);best=Math.max(best,cur);}
 System.out.println(best);
}'''))
add('challenge','频率前 K 高','Map + 排序','输出出现次数最多的 k 个值。','第一行读 n k，第二行读 n 个整数；输出频率最高的 k 个值，按值升序。','第一行 n k，第二行数组。','k 个整数，空格分隔。',['Map','排序'],['按频次降序、值升序。'],60,['6 2\n1 1 2 2 2 3','4 1\n4 4 5 5','1 1\n1'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] h=br.readLine().trim().split(" "); int n=Integer.parseInt(h[0]),k=Integer.parseInt(h[1]);
 String[] p=br.readLine().trim().split(" "); Map<Integer,Integer> m=new HashMap<>();
 for(String s:p)m.put(Integer.parseInt(s),m.getOrDefault(Integer.parseInt(s),0)+1);
 List<Map.Entry<Integer,Integer>> es=new ArrayList<>(m.entrySet());
 es.sort((x,y)->x.getValue().equals(y.getValue())?Integer.compare(x.getKey(),y.getKey()):Integer.compare(y.getValue(),x.getValue()));
 StringBuilder sb=new StringBuilder(); for(int i=0;i<k;i++){if(i>0)sb.append(' ');sb.append(es.get(i).getKey());}System.out.println(sb);
}'''))
add('challenge','螺旋矩阵','四边界收缩','按顺时针螺旋顺序输出矩阵元素。','第一行读 m n，随后 m 行矩阵；按螺旋顺序输出一行元素。','第一行 m n，随后矩阵。','螺旋顺序的整数，空格分隔。',['矩阵','边界'],['维护四个边界。'],70,['3 3\n1 2 3\n4 5 6\n7 8 9','2 2\n1 2\n3 4','1 4\n1 2 3 4'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] h=br.readLine().trim().split(" "); int m=Integer.parseInt(h[0]),n=Integer.parseInt(h[1]); int[][] a=new int[m][n];
 for(int i=0;i<m;i++){String[] p=br.readLine().trim().split(" ");for(int j=0;j<n;j++)a[i][j]=Integer.parseInt(p[j]);}
 List<Integer> out=new ArrayList<>(); int top=0,bottom=m-1,left=0,right=n-1;
 while(top<=bottom&&left<=right){for(int j=left;j<=right;j++)out.add(a[top][j]);top++;for(int i=top;i<=bottom;i++)out.add(a[i][right]);right--;if(top<=bottom){for(int j=right;j>=left;j--)out.add(a[bottom][j]);bottom--;}if(left<=right){for(int i=bottom;i>=top;i--)out.add(a[i][left]);left++;}}
 StringBuilder sb=new StringBuilder(); for(int i=0;i<out.size();i++){if(i>0)sb.append(' ');sb.append(out.get(i));}System.out.println(sb);
}'''))
add('challenge','第 K 大元素','排序后取下标','输出数组中第 k 大的元素。','第一行读 n k，第二行读 n 个整数；输出第 k 大的元素（从 1 开始计数）。','第一行 n k，第二行数组。','一个整数。',['排序','下标'],['降序排序后取 k-1。'],60,['5 2\n3 1 5 2 4','3 1\n7 8 9','4 3\n2 2 3 1'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] h=br.readLine().trim().split(" "); int n=Integer.parseInt(h[0]),k=Integer.parseInt(h[1]);
 String[] p=br.readLine().trim().split(" "); int[] a=new int[n];for(int i=0;i<n;i++)a[i]=Integer.parseInt(p[i]);
 Arrays.sort(a); System.out.println(a[n-k]);
}'''))
add('challenge','快速排序','分治','用快速排序输出升序结果。','读入一行整数，输出升序序列。','一行整数。','升序序列，空格分隔。',['分治','递归'],['重复元素单独收集。'],60,['3 1 2 3','5 4 3 2 1','1'],j('''static void qs(int[] a,int l,int r){if(l>=r)return;int p=a[(l+r)/2],i=l,j=r;while(i<=j){while(a[i]<p)i++;while(a[j]>p)j--;if(i<=j){int t=a[i];a[i]=a[j];a[j]=t;i++;j--;}}qs(a,l,j);qs(a,i,r);}
public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" "); int n=p.length; int[] a=new int[n];for(int i=0;i<n;i++)a[i]=Integer.parseInt(p[i]);
 qs(a,0,n-1); StringBuilder sb=new StringBuilder(); for(int i=0;i<n;i++){if(i>0)sb.append(' ');sb.append(a[i]);}System.out.println(sb);
}'''))
add('challenge','逆波兰表达式','后缀表达式求值','计算逆波兰表达式的值。','读入一行空格分隔的 token（整数和 + - * /），输出计算结果（除法向零取整）。','一行 token。','一个整数。',['栈','表达式'],['先弹出的是右操作数。'],60,['2 1 + 3 *','4 13 5 / +','10 6 9 3 + -11 * / * 17 + 5 +'],j('''public static void main(String[] args) throws Exception {
 BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
 String[] p=br.readLine().trim().split(" "); Deque<Long> st=new ArrayDeque<>();
 for(String t:p){if("+-*/".contains(t)){long b=st.pop(),a=st.pop();long v=t.equals("+")?a+b:t.equals("-")?a-b:t.equals("*")?a*b:a/b;st.push(v);}else st.push(Long.parseLong(t));}
 System.out.println(st.pop());
}'''))

out=[]
for i,t in enumerate(T,1):
    tests=[]
    for k,stdin in enumerate(t['tests']):
        expected=run_java(t['code'],stdin)
        tests.append({'label':'公开样例' if k==0 else f'隐藏用例 {k}','stdin':stdin,'expected':expected})
    out.append({'id':f'z87-j{i}','level':t['level'],'no':25+i,'title':t['title'],'subtitle':t['subtitle'],'brief':t['brief'],'goal':t['goal'],'input':t['input'],'output':t['output'],'concepts':t['concepts'],'hints':t['hints'],'fastMs':t['fastMs'],'starter':'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}','testCases':tests,'sampleStdin':tests[0]['stdin'],'sampleStdout':tests[0]['expected'],'docs':[{'label':'Scanner','path':'java.base/java/util/Scanner.html'},{'label':'System.out','path':'java.base/java/lang/System.html#out'}]})
text='/* z87 · Java 输出实现场 +30（三档各 10），expected 由 javac/java 参考解真实运行。 */\n(function(bank,tasks){if(!bank||!Array.isArray(bank.tasks))return;bank.tasks.push.apply(bank.tasks,tasks);bank.version="20261126z87";})(window.JAVA_OUTPUT_BANK,'+json.dumps(out,ensure_ascii=False,indent=2)+');\n'
Path('assets/js/java-output/java-output-z87.js').write_text(text)
print('tasks',len(out),'levels',{k:sum(1 for x in out if x['level']==k) for k in ['basic','intermediate','challenge']},'size',len(text))
