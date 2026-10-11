#!/usr/bin/env python3
"""Per-run notes for RESULTS.md: why each run that failed its hidden tests failed, how each
session ended, and what v5's machinery did along the way.

  python3 notes.py --tasks tasks.jsonl --batch results/<batch> [--out notes.md]
"""
import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from benchlib import read_jsonl  # noqa: E402


def first_assert(tail, wanted=()):
    """The first failing graded test, its failing subtest and the first assertion line, off a
    grading tail. Only tests in `wanted` (the run's failed FAIL_TO_PASS and PASS_TO_PASS tests)
    count: the tail can hold tests that grade nothing (red on the true solution too, or flaky)."""
    tail = tail or ""
    for m in re.finditer(r"\[([^\]]+)\]\n(.*?)(?=\n\[[^\]]+\]\n|\Z)", tail, re.S):
        name, block = m.group(1).split(":", 1)[-1], m.group(2)
        if wanted and name not in wanted:
            continue
        sub = re.search(r"--- FAIL: (\S+/\S+)", block)
        msg = re.search(r"^\s+\S+_test\.go:\d+: (.*(?:\n\s{8,}.*){0,2})", block, re.M)
        text = " ".join(x.strip() for x in msg.group(1).splitlines()) if msg else ""
        head = sub.group(1).replace("_", " ") if sub else name
        return f"{head}: {text}"[:260]
    if wanted:
        return ""
    b = re.search(r"(\S+\.go:\d+:\d+: .*)", tail)
    return b.group(1)[:160] if b else (tail.strip().splitlines()[-1][:160] if tail.strip() else "")


def check_cell(c):
    """green, green on a later attempt, or red with its red parts and the first line that made it red."""
    if not c:
        return "–"
    att = c.get("attempts") or [c]
    if c.get("pass"):
        return "green" if len(att) == 1 else f"green (attempt {next(i for i, x in enumerate(att, 1) if x['exit'] == 0)} of {len(att)})"
    why = next((f for f in (att[-1].get("findings_new") or []) if "answers red" not in f), "")
    return f"red: {', '.join(c.get('red') or ['?'])} ({len(att)} attempts)" + (f"; {why[:120]}" if why else "")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tasks", required=True)
    ap.add_argument("--batch", action="append", required=True)
    ap.add_argument("--out", default="")
    a = ap.parse_args()
    tasks = {t["ticket"]: t for t in read_jsonl(a.tasks)}
    lines = ["| task | arm | resolved | hidden F2P | full check | ended | cost $ (nested) | min | turns | note |",
             "|---|---|---|---|---|---|---|---|---|---|"]
    for batch in a.batch:
        root = os.path.join(batch, "runs")
        for rid in sorted(os.listdir(root)):
            d = os.path.join(root, rid)
            if not os.path.exists(os.path.join(d, "meta.json")):
                continue
            m = json.load(open(os.path.join(d, "meta.json")))
            g = json.load(open(os.path.join(d, "grade.json"))) if os.path.exists(os.path.join(d, "grade.json")) else {}
            s = m.get("session") or {}
            h = g.get("hidden") or {}
            end = "cap" if m.get("killed_at_cap") else (s.get("stop_reason_line") or s.get("result_subtype") or "?")
            note = ""
            if h and not h.get("pass"):
                if (g.get("scope") or {}).get("code_files") == 0:
                    note = "no code change"
                else:
                    failed = [n.split(":", 1)[-1] for n in (h.get("f2p_failed") or []) + (h.get("p2p_failed") or [])]
                    note = first_assert(h.get("tail", ""), failed)
                    if failed and not any(f in note for f in failed):
                        note = f"{', '.join(failed[:3])} failed" + (f"; {note}" if note else "")
            if s.get("leak_flags"):
                note += f" LEAK FLAGS: {sorted(set(s['leak_flags']))}"
            nested = (m.get("nested") or {}).get("cost", 0)
            chk = check_cell(g.get("check"))
            lines.append(
                f"| {m['ticket']} | {m['arm']} | {'yes' if h.get('pass') else ('no' if h else '?')} "
                f"| {h.get('f2p', ['?', '?'])[0]}/{h.get('f2p', ['?', '?'])[1]} | {chk} | {end} "
                f"| {m.get('cost_total', s.get('cost', 0)):.3f} ({nested:.3f}) | {(m.get('secs') or 0) / 60:.0f} "
                f"| {s.get('turns')} | {note.replace('|', '/')} |")
    text = "\n".join(lines)
    if a.out:
        open(a.out, "w").write(text + "\n")
    print(text)


if __name__ == "__main__":
    main()
