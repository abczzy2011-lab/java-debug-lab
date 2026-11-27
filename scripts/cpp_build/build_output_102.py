# -*- coding: utf-8 -*-
"""重建 C++ 输出实现场：保留 27 道旧题，新增 75 道，自动编译参考实现生成期望输出。"""
from __future__ import annotations
import json, subprocess, tempfile, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from out_basic_extra import TASKS as BASIC
from out_intermediate_extra import TASKS as INTERMEDIATE
from out_challenge_extra import TASKS as CHALLENGE

ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA = ROOT / "assets/js/cpp-output/cpp-output-data.js"
VERSION = "20261128z109"
STARTER = """#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    // 先读入，再构造输出；不要直接打印答案

    return 0;
}"""

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

def normalize_input(value: str) -> str:
    # 源文件中为了可读性写成 \\n；真正传给程序时换回换行。
    return value.replace("\\n", "\n")

def load_existing() -> dict:
    text = DATA.read_text(encoding="utf-8")
    return json.loads(text.split("window.CPP_OUTPUT_BANK = ", 1)[1].strip().rstrip(";"))

def io_description(task: dict) -> tuple[str, str]:
    stdin = task.get("sampleStdin", "")
    expected = task.get("sampleStdout", "")
    in_lines = stdin.splitlines() if stdin else []
    out_lines = expected.splitlines() if expected else []
    if len(in_lines) <= 1:
        token_count = len(in_lines[0].split()) if in_lines else 0
        if token_count <= 1:
            input_text = "一行，一个值；具体范围见题面，公开样例给出实际格式。"
        else:
            input_text = f"一行，{token_count} 个由空格分隔的值。"
    elif len(in_lines) == 2 and in_lines[0].strip().isdigit() and len(in_lines[1].split()) == int(in_lines[0].strip()):
        n = int(in_lines[0].strip())
        input_text = f"共 2 行；第一行是数量 n={n}，第二行是 {n} 个由空格分隔的值。"
    else:
        input_text = f"共 {len(in_lines)} 行；按题面顺序逐行给出数据，公开样例展示实际格式。"
    if len(out_lines) <= 1:
        output_text = "输出一行结果，不要额外打印提示语。"
    else:
        output_text = f"输出 {len(out_lines)} 行，逐行对应目标输出；行末不要多余空格。"
    return input_text, output_text

def prepare_source(program: str) -> str:
    return program.replace("#include <bits/stdc++.h>", PORTABLE_HEADERS)

def run_case(program: str, stdin: str, exe: pathlib.Path) -> tuple[bool, str]:
    p = subprocess.run([str(exe)], input=stdin, text=True, capture_output=True, timeout=5)
    if p.returncode != 0:
        return False, (p.stderr or p.stdout)[:300]
    return True, p.stdout.rstrip("\n")

def build_task(task: dict, work: pathlib.Path) -> dict:
    src = work / f"{task['id']}.cpp"
    exe = work / f"{task['id']}.out"
    src.write_text(prepare_source(task["program"]), encoding="utf-8")
    cp = subprocess.run(["g++", "-std=c++20", "-O2", "-o", str(exe), str(src)],
                        text=True, capture_output=True, timeout=30)
    if cp.returncode != 0:
        raise RuntimeError(f"{task['id']} compile failed:\n{cp.stderr[:800]}")
    cases = []
    for index, raw_input in enumerate(task["tests"]):
        stdin = normalize_input(raw_input)
        ok, expected = run_case(task["program"], stdin, exe)
        if not ok:
            raise RuntimeError(f"{task['id']} case {index + 1} runtime failed: {expected}")
        cases.append({
            "label": "公开样例" if index == 0 else f"隐藏用例 {index}",
            "stdin": stdin,
            "expected": expected,
        })
    return {
        "id": task["id"],
        "level": task["level"],
        "order": task["order"],
        "no": task["order"],
        "title": task["title"],
        "subtitle": task["subtitle"],
        "brief": task["brief"],
        "goal": task["goal"],
        "hints": task["hints"],
        "concepts": task["concepts"],
        "testCases": cases,
        "sampleStdin": cases[0]["stdin"],
        "sampleStdout": cases[0]["expected"],
        "starter": STARTER,
        "fastMs": task.get("fastMs", 60),
        "input": task.get("input") if task.get("input") not in (None, "", "见题面。") else io_description({**task, "sampleStdin": cases[0]["stdin"], "sampleStdout": cases[0]["expected"]})[0],
        "output": task.get("output") if task.get("output") not in (None, "", "按题面要求输出。") else io_description({**task, "sampleStdin": cases[0]["stdin"], "sampleStdout": cases[0]["expected"]})[1],
        "reference": task["program"],
    }

def main():
    bank = load_existing()
    base_ids = {f"b{i}" for i in range(1, 10)} | {f"i{i}" for i in range(1, 10)} | {f"c{i}" for i in range(1, 10)}
    existing = {t["id"]: t for t in bank["tasks"] if t["id"] in base_ids}
    work = pathlib.Path(tempfile.mkdtemp(prefix="cpp-output-102-"))
    added = []
    for task in BASIC + INTERMEDIATE + CHALLENGE:
        if task["id"] in existing:
            raise RuntimeError(f"duplicate task id {task['id']}")
        added.append(build_task(task, work))
    tasks = [existing[i] for i in sorted(existing, key=lambda x: (x[0], int(x[1:])))] + added
    tasks.sort(key=lambda t: ({"basic": 0, "intermediate": 1, "challenge": 2}[t["level"]], int(t.get("order", t.get("no", 999)))))
    bank["version"] = VERSION
    bank["tasks"] = tasks
    text = "/* C++ 输出实现场 · 102 题 / 306 组用例 · 版本 20261128z109 */\n" \
           "window.CPP_OUTPUT_BANK = " + json.dumps(bank, ensure_ascii=False, separators=(",", ":")) + ";\n"
    DATA.write_text(text, encoding="utf-8")
    print(f"built {len(tasks)} tasks, {sum(len(t['testCases']) for t in tasks)} cases, {len(text)} bytes")

if __name__ == "__main__":
    main()
