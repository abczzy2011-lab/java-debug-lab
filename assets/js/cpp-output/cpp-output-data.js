/* C++ 输出实现场 · 18 题 / 54 组测试。expected 由参考逻辑生成；线上用 GCC 14.1 -std=c++20 判题。 */
window.CPP_OUTPUT_BANK = {
  "version": "20261127z104",
  "title": "C++ 输出实现场",
  "levels": [
    {
      "id": "basic",
      "name": "基础",
      "kicker": "FOUNDATION",
      "desc": "先把输入读对，把空格、换行和边界控制对；这一步不靠猜。"
    },
    {
      "id": "intermediate",
      "name": "进阶",
      "kicker": "STRUCTURE",
      "desc": "需要自己组织循环、容器或递推关系；隐藏用例会换参数。"
    },
    {
      "id": "challenge",
      "name": "挑战",
      "kicker": "EDGE CASES",
      "desc": "大数、图、动态规划与表达式；实现顺序和边界会直接改变输出。"
    }
  ],
  "tasks": [
    {
      "id": "b1",
      "level": "basic",
      "no": 1,
      "title": "数字阶梯",
      "subtitle": "双层循环与空格控制",
      "brief": "把 1 到 n 排成逐行增长的阶梯。",
      "goal": "读入整数 n，输出 n 行数字阶梯：第 i 行包含从 1 到 i 的所有整数，数字之间用一个空格分隔，行末不要多输出空格。",
      "hints": [
        "外层循环控制行号，内层循环控制这一行打印到哪个数。",
        "用 bool first 或直接判断 j 是否等于 i，避免行末空格。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3",
          "expected": "1\n1 2\n1 2 3"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "5",
          "expected": "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "7",
          "expected": "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5\n1 2 3 4 5 6\n1 2 3 4 5 6 7"
        }
      ],
      "sampleStdin": "3",
      "sampleStdout": "1\n1 2\n1 2 3",
      "starter": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // 从这里开始写：先读入，再构造输出\n\n    return 0;\n}",
      "fastMs": 40,
      "concepts": [
        "循环",
        "空格"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 9）。",
      "output": "共 n 行；第 i 行是 1 到 i 的数字序列。",
      "reference": "int n; cin>>n; for(int i=1;i<=n;i++){for(int j=1;j<=i;j++){if(j>1)cout<<' ';cout<<j;}cout<<'\\n';}"
    },
    {
      "id": "b2",
      "level": "basic",
      "no": 2,
      "title": "星号三角",
      "subtitle": "前导空格与奇数增长",
      "brief": "用星号画一个顶角朝上的等腰三角形。",
      "goal": "读入奇数 n，输出高度为 n 的星号三角形。第 1 行 1 颗星，之后每行多 2 颗；每行左侧补足空格，让星号整体居中。",
      "hints": [
        "行号从 0 开始时，前导空格是 n-i-1，星号数是 2*i+1。",
        "不要在每行末尾补空格，否则会改变逐行比较结果。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3",
          "expected": "  *\n ***\n*****"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "5",
          "expected": "    *\n   ***\n  *****\n *******\n*********"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "7",
          "expected": "      *\n     ***\n    *****\n   *******\n  *********\n ***********\n*************"
        }
      ],
      "sampleStdin": "3",
      "sampleStdout": "  *\n ***\n*****",
      "starter": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // 从这里开始写：先读入，再构造输出\n\n    return 0;\n}",
      "fastMs": 40,
      "concepts": [
        "嵌套循环",
        "对齐"
      ],
      "input": "一行，一个奇数 n（3 ≤ n ≤ 9）。",
      "output": "共 n 行；第 i 行有 n-i 个空格，随后是 2i-1 个星号。",
      "reference": "int n;cin>>n;for(int i=0;i<n;i++){for(int s=0;s<n-i-1;s++)cout<<' ';for(int j=0;j<2*i+1;j++)cout<<'*';cout<<'\\n';}"
    },
    {
      "id": "b3",
      "level": "basic",
      "no": 3,
      "title": "摄氏转华氏表",
      "subtitle": "整数运算与步长",
      "brief": "按 5 度为步长输出摄氏-华氏对照表。",
      "goal": "读入整数 n，从 0 到 n（含 n）每隔 5 度输出一行：摄氏值、空格、华氏值。华氏值按整数公式 F = 32 + C * 9 / 5 计算。",
      "hints": [
        "先算 C * 9，再除以 5，避免先除造成精度丢失。",
        "循环条件写 c <= n；如果 n 不是 5 的倍数，最后一行可能超过 n 吗？按题目只输出不超过 n 的步长值。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "20",
          "expected": "0 32\n5 41\n10 50\n15 59\n20 68"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "35",
          "expected": "0 32\n5 41\n10 50\n15 59\n20 68\n25 77\n30 86\n35 95"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "50",
          "expected": "0 32\n5 41\n10 50\n15 59\n20 68\n25 77\n30 86\n35 95\n40 104\n45 113\n50 122"
        }
      ],
      "sampleStdin": "20",
      "sampleStdout": "0 32\n5 41\n10 50\n15 59\n20 68",
      "starter": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // 从这里开始写：先读入，再构造输出\n\n    return 0;\n}",
      "fastMs": 40,
      "concepts": [
        "整数除法",
        "循环"
      ],
      "input": "一行，一个整数 n（0 ≤ n ≤ 100）。",
      "output": "每行两个整数：摄氏度与华氏度，空格分隔。",
      "reference": "int n;cin>>n;for(int c=0;c<=n;c+=5)cout<<c<<' '<<32+c*9/5<<'\\n';"
    },
    {
      "id": "b4",
      "level": "basic",
      "no": 4,
      "title": "最大公约数与最小公倍数",
      "subtitle": "辗转相除",
      "brief": "给两个正整数，求 gcd 与 lcm。",
      "goal": "读入两个正整数 a、b，输出一行：它们的最大公约数和最小公倍数，空格分隔。",
      "hints": [
        "gcd 用辗转相除：while (b) { int t = a % b; a = b; b = t; }。",
        "lcm = a / gcd(a,b) * b；先除后乘可以降低溢出风险。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "12 18",
          "expected": "6 36"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "17 5",
          "expected": "1 85"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "100 40",
          "expected": "20 200"
        }
      ],
      "sampleStdin": "12 18",
      "sampleStdout": "6 36",
      "starter": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // 从这里开始写：先读入，再构造输出\n\n    return 0;\n}",
      "fastMs": 40,
      "concepts": [
        "gcd",
        "lcm"
      ],
      "input": "一行，两个正整数 a、b（1 ≤ a,b ≤ 10^6）。",
      "output": "一行，两个整数：gcd 与 lcm。",
      "reference": "long long a,b;cin>>a>>b;long long x=a,y=b;while(y){long long t=x%y;x=y;y=t;}cout<<x<<' '<<a/x*b<<'\\n';"
    },
    {
      "id": "b5",
      "level": "basic",
      "no": 5,
      "title": "素数筛",
      "subtitle": "Eratosthenes 筛法",
      "brief": "输出不超过 n 的全部素数。",
      "goal": "读入整数 n，按从小到大输出所有不超过 n 的素数，数字之间用一个空格分隔；如果没有素数，输出空行。",
      "hints": [
        "用 vector<bool> 或 char 数组做筛子，0 和 1 先标记为非素数。",
        "从 p*p 开始划掉合数，减少重复标记。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "10",
          "expected": "2 3 5 7"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "30",
          "expected": "2 3 5 7 11 13 17 19 23 29"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "50",
          "expected": "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47"
        }
      ],
      "sampleStdin": "10",
      "sampleStdout": "2 3 5 7",
      "starter": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // 从这里开始写：先读入，再构造输出\n\n    return 0;\n}",
      "fastMs": 60,
      "concepts": [
        "筛法",
        "边界"
      ],
      "input": "一行，一个整数 n（0 ≤ n ≤ 200）。",
      "output": "一行，素数列，空格分隔。",
      "reference": "int n;cin>>n;vector<bool> is(n+1,true);if(n>=0)is[0]=false;if(n>=1)is[1]=false;for(int p=2;p*p<=n;p++)if(is[p])for(int k=p*p;k<=n;k+=p)is[k]=false;bool first=true;for(int i=2;i<=n;i++)if(is[i]){if(!first)cout<<' ';cout<<i;first=false;}cout<<'\\n';"
    },
    {
      "id": "b6",
      "level": "basic",
      "no": 6,
      "title": "字符串反转",
      "subtitle": "按字符读取与输出",
      "brief": "把读到的字符串倒序输出。",
      "goal": "读入一个不含空格的字符串 s，输出它反转后的结果。",
      "hints": [
        "可以倒序遍历下标输出，也可以先 reverse 再整体输出。",
        "注意空串：如果题目保证长度至少为 1，可以不处理；否则先判断。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "hello",
          "expected": "olleh"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "C++",
          "expected": "++C"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "algorithm",
          "expected": "mhtirogla"
        }
      ],
      "sampleStdin": "hello",
      "sampleStdout": "olleh",
      "starter": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // 从这里开始写：先读入，再构造输出\n\n    return 0;\n}",
      "fastMs": 40,
      "concepts": [
        "字符串",
        "倒序"
      ],
      "input": "一行，一个不含空格的字符串 s（1 ≤ |s| ≤ 100）。",
      "output": "一行，反转后的字符串。",
      "reference": "string s;cin>>s;for(int i=(int)s.size()-1;i>=0;i--)cout<<s[i];cout<<'\\n';"
    },
    {
      "id": "i1",
      "level": "intermediate",
      "no": 1,
      "title": "不同的单词",
      "subtitle": "map / set 与词频",
      "brief": "统计一行里出现了多少个不同的单词。",
      "goal": "读入一整行英文文本（可能含多个空格），统一转小写，按字典序输出不同单词的个数，再逐行输出这些单词。",
      "hints": [
        "用 getline 读整行，再用 stringstream 切词。",
        "set<string> 会自动去重并按字典序排序；大小写要统一。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "A c a B b",
          "expected": "3\na\nb\nc"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "the quick brown fox jumps over the lazy dog",
          "expected": "8\nbrown\ndog\nfox\njumps\nlazy\nover\nquick\nthe"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "C++ C++ c++",
          "expected": "1\nc++"
        }
      ],
      "sampleStdin": "A c a B b",
      "sampleStdout": "3\na\nb\nc",
      "starter": "#include <iostream>\n#include <sstream>\n#include <set>\n#include <string>\nusing namespace std;\n\nint main() {\n    // 读整行，切词，去重，按字典序输出\n\n    return 0;\n}",
      "fastMs": 70,
      "concepts": [
        "getline",
        "set",
        "stringstream"
      ],
      "input": "一行，长度不超过 200 的英文文本。",
      "output": "第一行是不同单词个数，之后每行一个单词（小写、字典序）。",
      "reference": "string line;getline(cin,line);for(char& c:line)c=tolower(c);set<string> s;string w;stringstream ss(line);while(ss>>w)s.insert(w);cout<<s.size()<<'\\n';for(auto& x:s)cout<<x<<'\\n';"
    },
    {
      "id": "i2",
      "level": "intermediate",
      "no": 2,
      "title": "矩阵转置",
      "subtitle": "二维数组与行列互换",
      "brief": "把 r 行 c 列的矩阵转置。",
      "goal": "先读入 r、c，再读入 r*c 个整数；输出 c 行 r 列，第 i 行是原矩阵第 i 列。",
      "hints": [
        "用 vector<vector<int>> 存矩阵，转置时外层遍历列、内层遍历行。",
        "每行最后一个数后不要多输出空格。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "2 3\n1 2 3\n4 5 6",
          "expected": "1 4\n2 5\n3 6"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "3 2\n1 2\n3 4\n5 6",
          "expected": "1 3 5\n2 4 6"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "3 3\n1 2 3\n4 5 6\n7 8 9",
          "expected": "1 4 7\n2 5 8\n3 6 9"
        }
      ],
      "sampleStdin": "2 3\n1 2 3\n4 5 6",
      "sampleStdout": "1 4\n2 5\n3 6",
      "starter": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int r, c;\n    cin >> r >> c;\n    // 读矩阵，按列输出\n\n    return 0;\n}",
      "fastMs": 70,
      "concepts": [
        "二维数组",
        "转置"
      ],
      "input": "第一行 r、c；接下来 r 行，每行 c 个整数。",
      "output": "c 行，每行 r 个整数。",
      "reference": "int r,c;cin>>r>>c;vector<vector<int>> a(r,vector<int>(c));for(int i=0;i<r;i++)for(int j=0;j<c;j++)cin>>a[i][j];for(int j=0;j<c;j++){for(int i=0;i<r;i++){if(i)cout<<' ';cout<<a[i][j];}cout<<'\\n';}"
    },
    {
      "id": "i3",
      "level": "intermediate",
      "no": 3,
      "title": "斐波那契第 n 项",
      "subtitle": "递推与 long long",
      "brief": "用递推求第 n 个斐波那契数。",
      "goal": "读入整数 n（0 ≤ n ≤ 40），输出 F(n)。规定 F(0)=0，F(1)=1。",
      "hints": [
        "不要用朴素递归，n=40 会重复计算大量子问题。",
        "用两个变量滚动：a,b = b,a+b；结果用 long long。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "10",
          "expected": "55"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "20",
          "expected": "6765"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "40",
          "expected": "102334155"
        }
      ],
      "sampleStdin": "10",
      "sampleStdout": "55",
      "starter": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // 从这里开始写：先读入，再构造输出\n\n    return 0;\n}",
      "fastMs": 50,
      "concepts": [
        "递推",
        "long long"
      ],
      "input": "一行，一个整数 n（0 ≤ n ≤ 40）。",
      "output": "一行，F(n)。",
      "reference": "int n;cin>>n;long long a=0,b=1;for(int i=0;i<n;i++){long long t=a+b;a=b;b=t;}cout<<a<<'\\n';"
    },
    {
      "id": "i4",
      "level": "intermediate",
      "no": 4,
      "title": "括号匹配",
      "subtitle": "栈与三种括号",
      "brief": "判断一行括号是否合法。",
      "goal": "读入一个只含 ()[]{} 的字符串，判断所有括号是否按正确顺序闭合；合法输出 YES，否则输出 NO。",
      "hints": [
        "遇到左括号入栈，遇到右括号检查栈顶是否是对应左括号。",
        "扫描结束后栈必须为空；空串也算合法。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "()[]{}",
          "expected": "YES"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "([)]",
          "expected": "NO"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "{[()]}",
          "expected": "YES"
        }
      ],
      "sampleStdin": "()[]{}",
      "sampleStdout": "YES",
      "starter": "#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    // 用栈检查括号\n\n    return 0;\n}",
      "fastMs": 50,
      "concepts": [
        "栈",
        "边界"
      ],
      "input": "一行，长度不超过 200 的括号串。",
      "output": "一行，YES 或 NO。",
      "reference": "string s;cin>>s;stack<char> st;bool ok=true;for(char c:s){if(c=='('||c=='['||c=='{')st.push(c);else{char need=c==')'?'(':c==']'?'[':'{';if(st.empty()||st.top()!=need){ok=false;break;}st.pop();}}if(!st.empty())ok=false;cout<<(ok?\"YES\\n\":\"NO\\n\");"
    },
    {
      "id": "i5",
      "level": "intermediate",
      "no": 5,
      "title": "学生成绩排序",
      "subtitle": "多键排序",
      "brief": "按成绩降序、姓名升序排列学生。",
      "goal": "读入 n，接着 n 行姓名和成绩；输出排序后的姓名与成绩。成绩相同时按姓名字典序升序。",
      "hints": [
        "用 vector<pair<string,int>> 存数据。",
        "比较器写严格弱序：分数不同按分数降序，否则按姓名升序。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3\nB 90\nA 90\nC 80",
          "expected": "A 90\nB 90\nC 80"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "4\nAmy 88\nBob 95\nCara 88\nDan 70",
          "expected": "Bob 95\nAmy 88\nCara 88\nDan 70"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "3\nZoe 100\nYan 100\nXin 99",
          "expected": "Yan 100\nZoe 100\nXin 99"
        }
      ],
      "sampleStdin": "3\nB 90\nA 90\nC 80",
      "sampleStdout": "A 90\nB 90\nC 80",
      "starter": "#include <algorithm>\n#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 读入并按规则排序\n\n    return 0;\n}",
      "fastMs": 60,
      "concepts": [
        "排序",
        "比较器"
      ],
      "input": "第一行 n；接下来 n 行，每行一个不含空格的姓名和一个整数成绩。",
      "output": "n 行，每行姓名与成绩，空格分隔。",
      "reference": "int n;cin>>n;vector<pair<string,int>> v(n);for(auto& p:v)cin>>p.first>>p.second;sort(v.begin(),v.end(),[](auto&a,auto&b){if(a.second!=b.second)return a.second>b.second;return a.first<b.first;});for(auto& p:v)cout<<p.first<<' '<<p.second<<'\\n';"
    },
    {
      "id": "i6",
      "level": "intermediate",
      "no": 6,
      "title": "十进制转任意进制",
      "subtitle": "除基取余",
      "brief": "把十进制数转换成 2–16 进制。",
      "goal": "读入整数 n 和进制 base（2 ≤ base ≤ 16），输出 n 的 base 进制表示，10–15 用大写 A–F。",
      "hints": [
        "不断取 n % base 的余数，逆序拼接；n=0 要特判输出 0。",
        "用字符表 0123456789ABCDEF，不要用 to_string 处理大于 9 的余数。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "10 2",
          "expected": "1010"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "255 16",
          "expected": "FF"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "100 8",
          "expected": "144"
        }
      ],
      "sampleStdin": "10 2",
      "sampleStdout": "1010",
      "starter": "#include <algorithm>\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    long long n;\n    int base;\n    cin >> n >> base;\n    // 除基取余，逆序输出\n\n    return 0;\n}",
      "fastMs": 60,
      "concepts": [
        "进制",
        "字符串"
      ],
      "input": "一行，两个整数 n、base（0 ≤ n ≤ 10^9，2 ≤ base ≤ 16）。",
      "output": "一行，转换后的字符串。",
      "reference": "long long n;int b;cin>>n>>b;string d=\"0123456789ABCDEF\";if(n==0){cout<<0;return 0;}string s;while(n){s+=d[n%b];n/=b;}reverse(s.begin(),s.end());cout<<s<<'\\n';"
    },
    {
      "id": "c1",
      "level": "challenge",
      "no": 1,
      "title": "大数加法",
      "subtitle": "字符串模拟进位",
      "brief": "两个可能超过 long long 的整数相加。",
      "goal": "读入两个非负整数字符串 a、b（长度不超过 1000），输出它们的和，不要输出前导零（结果 0 除外）。",
      "hints": [
        "从末尾对齐逐位相加，处理进位。",
        "结果可能比输入多一位；去掉前导零时注意结果为 0。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "123 456",
          "expected": "579"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "999 1",
          "expected": "1000"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "100000000000000000000 1",
          "expected": "100000000000000000001"
        }
      ],
      "sampleStdin": "123 456",
      "sampleStdout": "579",
      "starter": "#include <algorithm>\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string a, b;\n    cin >> a >> b;\n    // 从末尾逐位相加，处理进位\n\n    return 0;\n}",
      "fastMs": 80,
      "concepts": [
        "大数",
        "字符串"
      ],
      "input": "一行两个非负整数字符串，空格分隔。",
      "output": "一行，相加结果。",
      "reference": "string a,b;cin>>a>>b;string r;int i=a.size()-1,j=b.size()-1,carry=0;while(i>=0||j>=0||carry){int s=carry;if(i>=0)s+=a[i--]-'0';if(j>=0)s+=b[j--]-'0';r+=char('0'+s%10);carry=s/10;}reverse(r.begin(),r.end());cout<<r<<'\\n';"
    },
    {
      "id": "c2",
      "level": "challenge",
      "no": 2,
      "title": "区间合并",
      "subtitle": "排序与贪心",
      "brief": "合并所有重叠或相邻的闭区间。",
      "goal": "读入 n 个闭区间 [l,r]，合并所有有交集或相邻的区间，按左端点升序输出合并后的区间。",
      "hints": [
        "先按左端点排序；维护当前合并区间 [L,R]。",
        "下一个区间 l <= R+1 时合并，否则输出当前并开启新区间。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3\n1 3\n2 6\n8 10",
          "expected": "1 6\n8 10"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "4\n1 2\n3 4\n5 6\n7 8",
          "expected": "1 8"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "3\n5 7\n1 2\n2 5",
          "expected": "1 7"
        }
      ],
      "sampleStdin": "3\n1 3\n2 6\n8 10",
      "sampleStdout": "1 6\n8 10",
      "starter": "#include <algorithm>\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 排序后合并区间\n\n    return 0;\n}",
      "fastMs": 80,
      "concepts": [
        "排序",
        "贪心"
      ],
      "input": "第一行 n；接下来 n 行，每行两个整数 l、r。",
      "output": "每行一个合并后的区间 l r，按左端点升序。",
      "reference": "int n;cin>>n;vector<pair<int,int>> v(n);for(auto& p:v)cin>>p.first>>p.second;sort(v.begin(),v.end());vector<pair<int,int>> out;for(auto& p:v){if(out.empty()||p.first>out.back().second+1)out.push_back(p);else out.back().second=max(out.back().second,p.second);}for(auto& p:out)cout<<p.first<<' '<<p.second<<'\\n';"
    },
    {
      "id": "c3",
      "level": "challenge",
      "no": 3,
      "title": "拓扑排序",
      "subtitle": "DAG 与最小字典序",
      "brief": "输出有向无环图的最小字典序拓扑序。",
      "goal": "读入 n 个点、m 条有向边，输出字典序最小的拓扑序；如果有环，输出 CYCLE。",
      "hints": [
        "用入度数组 + 优先队列（小根堆）做 Kahn 算法。",
        "输出点数不等于 n 就说明有环。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "4 3\n1 2\n1 3\n2 4",
          "expected": "1 2 3 4"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "5 4\n1 2\n2 3\n3 4\n4 5",
          "expected": "1 2 3 4 5"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "3 3\n1 2\n2 3\n3 1",
          "expected": "CYCLE"
        }
      ],
      "sampleStdin": "4 3\n1 2\n1 3\n2 4",
      "sampleStdout": "1 2 3 4",
      "starter": "#include <functional>\n#include <iostream>\n#include <queue>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, m;\n    cin >> n >> m;\n    // 建图、入度、Kahn\n\n    return 0;\n}",
      "fastMs": 90,
      "concepts": [
        "拓扑排序",
        "优先队列"
      ],
      "input": "第一行 n、m；接下来 m 行，每行一条有向边 u→v（1 ≤ u,v ≤ n）。",
      "output": "一行拓扑序，或 CYCLE。",
      "reference": "int n,m;cin>>n>>m;vector<vector<int>> g(n+1);vector<int> deg(n+1);for(int i=0;i<m;i++){int u,v;cin>>u>>v;g[u].push_back(v);deg[v]++;}priority_queue<int,vector<int>,greater<int>> q;for(int i=1;i<=n;i++)if(!deg[i])q.push(i);vector<int> out;while(!q.empty()){int u=q.top();q.pop();out.push_back(u);for(int v:g[u])if(--deg[v]==0)q.push(v);}if((int)out.size()!=n)cout<<\"CYCLE\\n\";else{for(int i=0;i<n;i++){if(i)cout<<' ';cout<<out[i];}cout<<'\\n';}"
    },
    {
      "id": "c4",
      "level": "challenge",
      "no": 4,
      "title": "最长递增子序列",
      "subtitle": "二分优化 LIS",
      "brief": "求严格递增子序列的最大长度。",
      "goal": "读入 n 和 n 个整数，输出最长严格递增子序列的长度。",
      "hints": [
        "O(n^2) 动态规划能过小数据，但这里要求 O(n log n)。",
        "维护 tails：tails[i] 是长度为 i+1 的递增子序列的最小结尾；用 lower_bound 替换。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "6\n1 3 2 4 3 5",
          "expected": "4"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "5\n5 4 3 2 1",
          "expected": "1"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "7\n2 2 3 3 4 4 5",
          "expected": "4"
        }
      ],
      "sampleStdin": "6\n1 3 2 4 3 5",
      "sampleStdout": "4",
      "starter": "#include <algorithm>\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // tails + lower_bound\n\n    return 0;\n}",
      "fastMs": 70,
      "concepts": [
        "LIS",
        "二分"
      ],
      "input": "第一行 n；第二行 n 个整数。",
      "output": "一行，LIS 长度。",
      "reference": "int n;cin>>n;vector<int> tails;for(int i=0;i<n;i++){int x;cin>>x;auto it=lower_bound(tails.begin(),tails.end(),x);if(it==tails.end())tails.push_back(x);else *it=x;}cout<<tails.size()<<'\\n';"
    },
    {
      "id": "c5",
      "level": "challenge",
      "no": 5,
      "title": "高精度阶乘",
      "subtitle": "大整数乘法",
      "brief": "计算 n! 的完整十进制值。",
      "goal": "读入整数 n（1 ≤ n ≤ 50），输出 n! 的完整十进制值。",
      "hints": [
        "用 vector<int> 按位存十进制数字，从低位到高位。",
        "每次乘以 i，处理进位；最后逆序输出，注意去掉前导零。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "10",
          "expected": "3628800"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "20",
          "expected": "2432902008176640000"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "50",
          "expected": "30414093201713378043612608166064768844377641568960512000000000000"
        }
      ],
      "sampleStdin": "10",
      "sampleStdout": "3628800",
      "starter": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 按位存十进制，逐位相乘\n\n    return 0;\n}",
      "fastMs": 80,
      "concepts": [
        "高精度",
        "vector"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 50）。",
      "output": "一行，n! 的完整值。",
      "reference": "int n;cin>>n;vector<int> d{1};for(int i=2;i<=n;i++){int carry=0;for(int& x:d){int p=x*i+carry;x=p%10;carry=p/10;}while(carry){d.push_back(carry%10);carry/=10;}}for(int i=d.size()-1;i>=0;i--)cout<<d[i];cout<<'\\n';"
    },
    {
      "id": "c6",
      "level": "challenge",
      "no": 6,
      "title": "逆波兰表达式",
      "subtitle": "栈与表达式求值",
      "brief": "计算后缀表达式的整数值。",
      "goal": "读入一行逆波兰表达式，操作数为整数，运算符为 + - * /；除法按整数除法（题目保证能整除）。输出最终结果。",
      "hints": [
        "遇到数字入栈，遇到运算符弹出右操作数和左操作数。",
        "注意减法和除法的顺序：先弹出的是右操作数。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3 4 + 2 *",
          "expected": "14"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "5 1 2 + 4 * + 3 -",
          "expected": "14"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "2 3 4 * + 10 /",
          "expected": "1"
        }
      ],
      "sampleStdin": "3 4 + 2 *",
      "sampleStdout": "14",
      "starter": "#include <iostream>\n#include <sstream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    // 切 token，按后缀规则求值\n\n    return 0;\n}",
      "fastMs": 80,
      "concepts": [
        "栈",
        "表达式"
      ],
      "input": "一行，空格分隔的 token 数不超过 100。",
      "output": "一行，表达式结果。",
      "reference": "string line;getline(cin,line);stringstream ss(line);vector<long long> st;string tok;while(ss>>tok){if(tok==\"+\"||tok==\"-\"||tok==\"*\"||tok==\"/\"){long long b=st.back();st.pop_back();long long a=st.back();st.pop_back();if(tok==\"+\")st.push_back(a+b);else if(tok==\"-\")st.push_back(a-b);else if(tok==\"*\")st.push_back(a*b);else st.push_back(a/b);}else st.push_back(stoll(tok));}cout<<st.back()<<'\\n';"
    }
  ],
  "rules": {
    "correctness": 85,
    "speed": 15,
    "normalize": "忽略每行行尾空格与文件末尾空行；行首空格、空行位置和大小写都会参与比较。",
    "speedRule": "三组用例全部通过后才计入速度分；平均运行时间不超过该题基准值得满分，达到 3 倍基准值时速度分为 0。",
    "msRule": "运行时间取后端真实进程耗时，不含编译和网络传输。"
  }
};
