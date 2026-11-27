# -*- coding: utf-8 -*-
"""重建 C++ 改错实验室：保留 36 道旧题，从输出题派生 66 道新题。"""
from __future__ import annotations
import json, subprocess, tempfile, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/js/cpp-output/cpp-output-data.js"
DATA = ROOT / "assets/js/cpp-foundations/cpp-debug-data.js"
VERSION = "20261128z109"

PORTABLE_HEADERS = """#include <algorithm>
#include <array>
#include <bitset>
#include <cctype>
#include <chrono>
#include <climits>
#include <cmath>
#include <cstdint>
#include <deque>
#include <functional>
#include <iomanip>
#include <iostream>
#include <map>
#include <memory>
#include <numeric>
#include <optional>
#include <queue>
#include <random>
#include <regex>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <variant>
#include <vector>
"""

BUGS = {
"b10": ("漏掉最后校正", "最后一次 a、b 比较被删掉，10 10 1 会乱序", ("    if (b > c) swap(b, c);\n    if (a > b) swap(a, b);", "    if (b > c) swap(b, c);")),
"b11": ("奇偶判断写反", "偶数被累加进奇数和", ("x % 2 == 0", "x % 2 != 0")),
"b12": ("成绩等级阈值被抬高", "72 分被错判成 D", ("else if (s >= 70)", "else if (s >= 75)")),
"b14": ("水仙花公式少乘一次", "立方和被写成了平方和", ("b*b*b", "b*b")),
"b15": ("乘法表少一列", "每行最后一列没有输出", ("j <= n", "j < n")),
"b16": ("元音判断方向反了", "非元音反而被计数", ("vowels.find(ch) != string::npos", "vowels.find(ch) == string::npos")),
"b17": ("斐波那契首项被改坏", "F(1) 从 1 变成 0", ("long long a = 1, b = 1;", "long long a = 0, b = 1;")),
"b18": ("回文比较写反", "相等反而被判失败", ("s[i] != s[j]", "s[i] == s[j]")),
"b19": ("最大值并列时错更新", "相同最大值被后一个下标覆盖", ("x > best", "x >= best")),
"b20": ("去重容器换成了 multiset", "重复数字被原样输出", ("set<long long> s;", "multiset<long long> s;")),
"b21": ("单词计数变成字符计数", "输出的是所有单词长度之和", ("while (ss >> w) ++count;", "while (ss >> w) count += w.size();")),
"b22": ("小写转大写方向反了", "小写字母没有被转成大写", ("ch = toupper((unsigned char)ch);", "ch = tolower((unsigned char)ch);")),
"b23": ("异或变成了加法", "成对数字不再互相抵消", ("ans ^= x;", "ans += x;")),
"b24": ("数位和漏掉最后一位", "循环提前在个位前停下", ("while (n > 0)", "while (n > 9)")),
"b25": ("三角形边界写成严格不等", "退化三角形被误判为合法", ("a + b <= c || a + c <= b || b + c <= a", "a + b < c || a + c < b || b + c < a")),
"b26": ("除零判断方向反了", "除数为 0 时反而执行除法", ("if (b == 0)", "if (b != 0)")),
"b27": ("月份累加多算了一个月", "循环把当前月也加进去", ("for (int i = 1; i < m; ++i)", "for (int i = 1; i <= m; ++i)")),
"b28": ("菱形下半段少了尖", "最下面一行没有生成", ("for (int i = mid - 1; i >= 0; --i)", "for (int i = mid - 1; i > 0; --i)")),
"b30": ("零和正数计数互换", "正数被算进零的桶", ("else if (x == 0) ++zero; else ++pos;", "else if (x == 0) ++pos; else ++zero;")),
"b31": ("逆序被换成升序", "数组被排序而不是翻转", ("reverse(a.begin(), a.end());", "sort(a.begin(), a.end());")),
"b33": ("最小值计数条件写错", "只有更小值才增加次数", ("else if (x == best) ++count;", "else if (x < best) ++count;")),
"b34": ("替换方向反了", "把目标字符换回了被替换字符", ("if (ch == a) ch = b;", "if (ch == b) ch = a;")),
"i10": ("前缀和左边界多减一位", "区间和少算了 a[l]", ("pre[r] - pre[l-1]", "pre[r] - pre[l]")),
"i11": ("下界查询换成了上界", "相等元素被跳过", ("lower_bound(a.begin(), a.end(), target)", "upper_bound(a.begin(), a.end(), target)")),
"i12": ("成绩排序方向反了", "成绩从低到高排列", ("return x.score > y.score;", "return x.score < y.score;")),
"i13": ("并列字符取了后者", "同频时不再保留字典序最小", ("if (cnt[i] > best)", "if (cnt[i] >= best)")),
"i14": ("两数之和允许同一个下标", "j 从 i 开始枚举，可能自配", ("for (int j = i + 1; j < n; ++j)", "for (int j = i; j < n; ++j)")),
"i15": ("滑窗忘记移除左端", "窗口和只增不减", ("sum += a[i] - a[i-k];", "sum += a[i];")),
"i16": ("遇到 0 不清零", "连续 1 的段被错误续接", ("else cur = 0;", "else cur = 1;")),
"i17": ("副对角线条件写错", "副对角线和恒为 0", ("if (i + j == n - 1) antiSum += x;", "if (i + j == n) antiSum += x;")),
"i18": ("螺旋左边界少取一格", "底边最后一个元素被跳过", ("for (int j = right; j >= left; --j)", "for (int j = right; j > left; --j)")),
"i19": ("杨辉三角递推用了减法", "中间元素不再等于上方两项之和", ("a[i][j] = a[i-1][j-1] + a[i-1][j];", "a[i][j] = a[i-1][j-1] - a[i-1][j];")),
"i20": ("约瑟夫环步长偏一", "删除位置多走了一位", ("pos = (pos + k - 1) % (int)v.size();", "pos = (pos + k) % (int)v.size();")),
"i21": ("闰年二月没有加一天", "闰年日期差少 1 天", ("if ((y % 400 == 0) || (y % 4 == 0 && y % 100 != 0)) md[2] = 29;", "if (false) md[2] = 29;")),
"i22": ("进制取余写成整除", "每一位的数字取错", ("s.push_back(digits[n % base]);", "s.push_back(digits[(n / base) % base]);")),
"i23": ("质因数只除了一次", "指数全部变成 1", ("while (n % p == 0) { n /= p; ++e; }", "if (n % p == 0) { n /= p; ++e; }")),
"i24": ("完全平方数被重复计数", "平方根那一对约数算了两遍", ("count += (d * d == n ? 1 : 2);", "count += 2;")),
"i25": ("快速幂每个二进制位都乘", "b>0 取代了 b 的最低位判断", ("if (b & 1)", "if (b > 0)")),
"i26": ("组合数少乘最后一项", "循环提前一位结束", ("for (int i = 1; i <= k; ++i)", "for (int i = 1; i < k; ++i)")),
"i27": ("RLE 次数多算一", "每段长度都多了 1", ("cout << s[i] << j - i;", "cout << s[i] << j - i + 1;")),
"i28": ("按逗号切分变成按空白切分", "连续逗号与空片段消失", ("while (getline(ss, part, ',')) cout << part << '\\n';", "while (ss >> part) cout << part << '\\n';")),
"i29": ("ISBN 权重方向反了", "权重从 1 开始而不是 10", ("int v = s[i] == 'X' ? 10 : s[i] - '0';", "int v = s[i] - '0';")),
"i30": ("最长平台换段时清零过度", "新段的第一项没有被计入", ("else { curLen = 1; curVal = x; }", "else { curLen = 0; curVal = x; }")),
"i31": ("括号深度方向反了", "左括号被当成减少深度", ("if (ch == '(') { ++depth; best = max(best, depth); } else --depth;", "if (ch == '(') { --depth; best = max(best, depth); } else ++depth;")),
"c10": ("编辑距离空串边界被抹平", "把 a 删成空串的成本变成 0", ("dp[i][0] = i;", "dp[i][0] = 0;")),
"c11": ("回文长度少算中心", "r-l+1 被写成 r-l", ("best = max(best, r - l + 1);", "best = max(best, r - l);")),
"c12": ("单词拆分下标错位", "前缀匹配时查了错误的位置", ("dp[i - len]", "dp[i - len + 1]")),
"c13": ("股票买卖比较方向反了", "下跌日反而累加利润", ("if (a[i] > a[i-1]) profit += a[i] - a[i-1];", "if (a[i] < a[i-1]) profit += a[i] - a[i-1];")),
"c14": ("跳跃覆盖只加一格", "每一步都只看下一格", ("reach = max(reach, i + a[i]);", "reach = max(reach, i + 1);")),
"c15": ("区间端点相接被当成重叠", "贪心少选了一个区间", ("if (p.first > last)", "if (p.first >= last)")),
"c16": ("K 路归并堆方向反了", "最小堆被换成最大堆", ("greater<pair<int,int>>", "less<pair<int,int>>")),
"c17": ("第 k 小比较方向反了", "从大到小归并", ("a[i] <= b[j]", "a[i] >= b[j]")),
"c18": ("网格路径取了最大值", "最小路径和变成最大路径和", ("min(i ? dp[i-1][j] : LLONG_MAX, j ? dp[i][j-1] : LLONG_MAX)", "max(i ? dp[i-1][j] : LLONG_MAX, j ? dp[i][j-1] : LLONG_MAX)")),
"c19": ("岛屿起点判断反了", "从 0 开始扩展", ("if (g[i][j] == '1')", "if (g[i][j] == '0')")),
"c20": ("拓扑排序用了最大堆", "字典序最小变成最大", ("greater<int>", "less<int>")),
"c21": ("Kruskal 边按降序排了", "先选最重的边", ("return a[2] < b[2];", "return a[2] > b[2];")),
"c22": ("Bellman-Ford 松弛方向反了", "更长的路径覆盖了更短路径", ("d[x.v] > d[x.u] + x.w", "d[x.v] < d[x.u] + x.w")),
"c23": ("Floyd 松弛取了最大值", "最短路变成最长路", ("d[i][j] = min(d[i][j], d[i][k] + d[k][j]);", "d[i][j] = max(d[i][j], d[i][k] + d[k][j]);")),
"c24": ("右视图取了左孩子", "每层最右节点被左孩子覆盖", ("last = u;", "last = u->l ? u->l : u;")),
"c25": ("BST 递增判断方向反了", "合法 BST 被误判", ("if (vals[i] <= vals[i-1]) ok = false;", "if (vals[i] >= vals[i-1]) ok = false;")),
"c26": ("Trie 前缀计数被覆盖", "每个节点只记 1 个单词", ("++tr[u].count;", "tr[u].count = 1;")),
"c27": ("并查集合并后块数反增", "每合并一次连通块加一", ("if (dsu.unite(u, v)) --comp;", "if (dsu.unite(u, v)) ++comp;")),
"c28": ("树状数组区间和左端错", "减去了 l 而不是 l-1", ("return sum(r)-sum(l-1);", "return sum(r)-sum(l);")),
"c29": ("逆序对每次只加一", "没有加上左半剩余元素个数", ("count += m - i;", "count += 1;")),
"c30": ("下一个更大弹栈条件反了", "更大的元素被提前弹掉", ("a[st.top()] <= a[i]", "a[st.top()] >= a[i]")),
"c31": ("直方图弹出条件反了", "更高的柱子反而被弹出", ("h[st.top()] > cur", "h[st.top()] < cur")),
}

BASIC = ["b10","b11","b12","b14","b15","b16","b17","b18","b19","b20","b21","b22","b23","b24","b25","b26","b27","b28","b30","b31","b33","b34"]
MEDIUM = [f"i{i}" for i in range(10, 32)]
HARD = [f"c{i}" for i in range(10, 32)]

def parse(path: pathlib.Path, marker: str) -> dict:
    return json.loads(path.read_text(encoding="utf-8").split(marker, 1)[1].strip().rstrip(";"))

def prepare(program: str) -> str:
    return program.replace("#include <bits/stdc++.h>", PORTABLE_HEADERS)

def run(exe: pathlib.Path, stdin: str) -> tuple[int, str, str]:
    p = subprocess.run([str(exe)], input=stdin, text=True, capture_output=True, timeout=5)
    return p.returncode, p.stdout.rstrip("\n"), p.stderr

def compile_one(code: str, path: pathlib.Path) -> bool:
    src = path.with_suffix(".cpp"); exe = path
    src.write_text(prepare(code), encoding="utf-8")
    cp = subprocess.run(["g++", "-std=c++20", "-O2", "-o", str(exe), str(src)], text=True, capture_output=True, timeout=30)
    return cp.returncode == 0, cp.stderr

def main():
    out_bank = parse(OUT, "window.CPP_OUTPUT_BANK = ")
    debug_bank = parse(DATA, "window.CPP_DEBUG_TASKS = ")
    base_ids = {f"{p}{i}" for p in ("b", "m", "h") for i in range(1, 13)}
    existing = [t for t in debug_bank["tasks"] if t["id"] in base_ids]
    by_id = {t["id"]: t for t in out_bank["tasks"]}
    work = pathlib.Path(tempfile.mkdtemp(prefix="cpp-debug-102-"))
    levels = [("basic", BASIC, "b"), ("medium", MEDIUM, "m"), ("hard", HARD, "h")]
    new_tasks = []
    failures = []
    for level, src_ids, prefix in levels:
        for offset, src_id in enumerate(src_ids, start=13):
            src = by_id[src_id]
            label, summary, (old, new) = BUGS[src_id]
            if old not in src["reference"]:
                failures.append(f"{src_id}: mutation source not found: {old[:60]}")
                continue
            fixed = src["reference"]
            buggy = fixed.replace(old, new)  # 只替换第一次，便于定位一处错误
            fixed_exe = work / f"{src_id}-fixed"
            buggy_exe = work / f"{src_id}-buggy"
            ok, err = compile_one(fixed, fixed_exe)
            if not ok:
                failures.append(f"{src_id}: fixed compile error {err[:120]}")
                continue
            ok2, err2 = compile_one(buggy, buggy_exe)
            if not ok2:
                failures.append(f"{src_id}: buggy compile error {err2[:120]}")
                continue
            tests = []
            bad = False
            for index, case in enumerate(src["testCases"]):
                code, actual, stderr = run(buggy_exe, case["stdin"])
                failed = code != 0 or actual != case["expected"]
                if failed:
                    bad = True
                tests.append({"public": index == 0, "label": case["label"], "stdin": case["stdin"], "expected": case["expected"], "failed": failed})
            if not bad:
                failures.append(f"{src_id}: buggy passes all tests")
                continue
            # 公开样例必须能暴露 bug：把第一条失败用例换到最前面
            if not tests[0]["failed"]:
                swap = next(i for i, case in enumerate(tests) if case["failed"])
                tests[0], tests[swap] = tests[swap], tests[0]
            for index, case in enumerate(tests):
                case["public"] = index == 0
                case["label"] = "公开样例" if index == 0 else f"隐藏用例 {index}"
                case.pop("failed", None)
            base = src["title"]
            common = 0
            while common < min(len(base), len(label)) and base[common] == label[common]:
                common += 1
            if common >= 2:
                label = label[common:].lstrip("：:， ")
            title = f"{base}：{label}" if label else base
            new_tasks.append({
                "id": f"{prefix}{offset}", "level": level, "order": offset,
                "title": title,
                "summary": summary,
                "prompt": src["goal"] + " 现在这段程序里有一处逻辑被改坏，修好它，让输出恢复正确。",
                "source": f"C++ 实战 · 输出实现场 {src_id}",
                "minutes": 7 if level == "basic" else 9 if level == "medium" else 11,
                "code": buggy, "fixed": fixed,
                "analysis": f"参考实现的关键是：{summary}。把对应条件、初值或更新顺序改回后，三组用例全部对上。",
                "hints": ["先对比三组输入，找出哪一组开始出现差异。", "把差异缩小到循环边界、下标、初值或更新顺序。"],
                "tests": tests, "targetMs": 70 if level == "basic" else 90 if level == "medium" else 120,
            })
    if failures:
        print("\n".join(failures))
        raise SystemExit(f"{len(failures)} failures")
    tasks = existing + new_tasks
    bank = {"version": VERSION, "title": "C++ 改错实验室 · 102 题", "tasks": tasks}
    text = "/* C++ 改错实验室 · 102 题 / 306 组用例 · 版本 20261128z109 */\n" \
           "window.CPP_DEBUG_TASKS = " + json.dumps(bank, ensure_ascii=False, separators=(",", ":")) + ";\n"
    DATA.write_text(text, encoding="utf-8")
    print(f"built {len(tasks)} tasks, {sum(len(t['tests']) for t in tasks)} cases, {len(text)} bytes")

if __name__ == "__main__":
    main()
