window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch2-1": [
    {
      h: "项目作业：把一行脏成绩变成 JSON 记录",
      p: `目标：写 [[parse_line(line)]]，输入可能是带 BOM、全角逗号、前后空格、缺考空字段的一行，输出 [[{"name": str, "scores": [float|null, ...]}]]。验收点：BOM 被去掉；全角逗号/空格被规范化；字段数不对抛 ValueError；空字段保留 None；姓名不能为空。\n\n实现顺序：先 [[lstrip("\ufeff")]]，再 [[unicodedata.normalize("NFKC")]]，再按逗号切分并 [[strip]]。不要用 [[split()]] 无参，它会丢掉空字段；用 [[split(",")]] 并保留空串。转换时逐字段处理，空串转 None，其他转 float；失败带字段下标。\n\n验收用例：正常行、带 BOM 行、全角逗号行、少字段行、多字段行、姓名为空行。输出 JSON 用 [[ensure_ascii=False]]，方便人看；真正入库前再决定是否去重、是否补学号。`,
      code: String.raw`import json, unicodedata

def parse_line(line):
    text = line.lstrip("\ufeff")
    text = unicodedata.normalize("NFKC", text).strip()
    parts = [p.strip() for p in text.split(",")]
    if len(parts) != 4:
        raise ValueError(f"字段数应为 4，实际 {len(parts)}: {parts}")
    name = parts[0]
    if not name:
        raise ValueError("姓名为空")
    scores = []
    for i, raw in enumerate(parts[1:], 1):
        if raw == "":
            scores.append(None)
        else:
            try:
                scores.append(float(raw))
            except ValueError as err:
                raise ValueError(f"第 {i} 个分数非法: {raw!r}") from err
    return {"name": name, "scores": scores}

print(json.dumps(parse_line("\ufeff 林晓，91, 88.5, "), ensure_ascii=False))`,
      output: `{"name": "林晓", "scores": [91.0, 88.5, null]}`,
      tip: `[[NFKC]] 会把全角逗号转成半角，但不会去掉 BOM；先 [[lstrip("\ufeff")]] 再规范化，顺序不能反。`
    }
  ],
  "ch2-2": [
    {
      h: "项目作业：生成一张终端成绩单",
      p: `目标：写 [[render_report(records)]]，输出带表头、分隔线、对齐列、页脚统计的纯文本。验收点：姓名左对齐、分数右对齐、小数位统一；空记录返回「无数据」而不是空字符串；超过页长自动分页；每页重复表头。\n\n实现顺序：先算列宽（取最长的姓名/分数），再拼表头和数据行，最后按 [[page_size]] 切页。不要在循环里 [[print]]，先构造列表再 [[join]]；这样既能打印，也能写文件、发邮件。列宽用 [[max(len(...))]]，中文宽度问题在文档里注明「终端等宽字体」。\n\n验收用例：三条记录、零条记录、姓名长度差异大、分数为 None。None 显示「缺考」，不要显示 [[None]]；页脚统计要跳过 None，并注明缺考人数。`,
      code: String.raw`def render_report(records, page_size=10):
    if not records:
        return "无数据\n"
    name_w = max(len(r["name"]) for r in records) + 2
    header = f"{'姓名':<{name_w}}{'平均':>8}"
    lines = [header, "-" * (name_w + 8)]
    for r in records:
        avg = "缺考" if r["avg"] is None else f"{r['avg']:.2f}"
        lines.append(f"{r['name']:<{name_w}}{avg:>8}")
    pages = [lines[i:i + page_size] for i in range(0, len(lines), page_size)]
    out = []
    for i, page in enumerate(pages, 1):
        out.extend(page)
        out.append(f"第 {i}/{len(pages)} 页")
    return "\n".join(out) + "\n"

rows = [{"name": "林晓", "avg": 86.17}, {"name": "周宁", "avg": None}]
print(render_report(rows, page_size=2))`,
      output: `姓名        平均
------------------
姓名        平均
------------------
第 1/2 页
林晓       86.17
周宁         缺考
第 2/2 页`,
      tip: `先构造行列表再 [[join]]，不要在循环里直接 [[print]]；否则无法分页、写文件或测试。`
    }
  ],
  "ch2-3": [
    {
      h: "项目作业：跨平台 CSV 读写器",
      p: `目标：写 [[read_scores(path)]] 和 [[write_report(path, rows)]]，保证在 Windows/macOS/Linux 上读写一致。验收点：读支持 UTF-8 BOM；写固定 UTF-8 无 BOM 或 sig 可配置；换行固定 [[\n]]；空字段保留；坏行带行号。\n\n实现顺序：读用 [[open(encoding="utf-8-sig", newline="")]] + [[csv.reader]]；写用 [[open(encoding="utf-8", newline="")]] + [[csv.writer]]。不要在文本模式里手动拼 [[\r\n]]，[[csv.writer]] 会按 [[newline]] 处理。需要 Excel 兼容时，写 [[utf-8-sig]]，并文档注明。\n\n验收用例：含中文、含逗号字段、含空字段、含 BOM、CRLF 文件。读回来的字段数与表头一致；写出去的文件用 [[read_bytes()]] 检查前三个字节；不要只看编辑器显示。`,
      code: String.raw`import csv
from pathlib import Path

def read_scores(path):
    rows = []
    with Path(path).open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 2):
            try:
                rows.append({"name": row["name"].strip(), "score": float(row["score"])})
            except (KeyError, ValueError) as err:
                raise ValueError(f"第 {i} 行: {err}") from err
    return rows

def write_report(path, rows):
    with Path(path).open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["name", "score"])
        for r in rows:
            w.writerow([r["name"], f"{r['score']:.1f}"])

Path("in.csv").write_text("name,score\n林晓,91\n", encoding="utf-8-sig")
rows = read_scores("in.csv")
write_report("out.csv", rows)
print(rows)
print(Path("out.csv").read_bytes()[:10])`,
      output: `[{'name': '林晓', 'score': 91.0}]
b'name,score\\r\\n'`,
      tip: `写 CSV 用 [[newline=""]] 交给 [[csv.writer]]，不要自己拼 [[\\r\\n]]；否则 Windows 上可能出现双倍换行。`
    }
  ]
});
