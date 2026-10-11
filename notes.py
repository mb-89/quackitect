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


def first_assert(tail):
    """The first failing test and its first message line, off a grading tail."""
    m = re.search(r"\[([^\]]+)\]\n((?:\s+.*\n?){0,3})", tail or "")
    if not m:
        b = re.search(r"(\S+\.go:\d+:\d+: .*)", tail or "")
        return b.group(1)[:160] if b else (tail or "").strip().splitlines()[-1][:160] if tail else ""
    name = m.group(1).split(":", 1)[-1]
    msg = " ".join(ln.strip() for ln in m.group(2).splitlines() if ln.strip() and not ln.strip().startswith("---"))
    return f"{name}: {msg}"[:220]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tasks", required=True)
    ap.add_argument("--batch", action="append", required=True)
    ap.add_argument("--out", default="")
    a = ap.parse_args()
    tasks = {t["ticket"]: t for t in read_jsonl(a.tasks)}
    lines = ["| task | arm | resolved | hidden F2P | ended | cost $ (nested) | min | turns | note |",
             "|---|---|---|---|---|---|---|---|---|"]
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
                    note = first_assert(h.get("tail", ""))
            if s.get("leak_flags"):
                note += f" LEAK FLAGS: {sorted(set(s['leak_flags']))}"
            nested = (m.get("nested") or {}).get("cost", 0)
            lines.append(
                f"| {m['ticket']} | {m['arm']} | {'yes' if h.get('pass') else ('no' if h else '?')} "
                f"| {h.get('f2p', ['?', '?'])[0]}/{h.get('f2p', ['?', '?'])[1]} | {end} "
                f"| {m.get('cost_total', s.get('cost', 0)):.3f} ({nested:.3f}) | {(m.get('secs') or 0) / 60:.0f} "
                f"| {s.get('turns')} | {note.replace('|', '/')} |")
    text = "\n".join(lines)
    if a.out:
        open(a.out, "w").write(text + "\n")
    print(text)


if __name__ == "__main__":
    main()
