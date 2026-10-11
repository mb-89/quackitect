#!/usr/bin/env python3
"""Assemble the generated half of RESULTS.md: tables for each batch and subset, the per-run notes,
and the cost log. The verdict and the reading of the numbers are written by hand above the
marker line `<!-- generated below -->`; everything under it is replaced on each run.

  python3 results_md.py --batch results/haiku-1 [--batch results/sonnet-1] [--interim]
"""
import argparse
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
MARK = "<!-- generated below -->"


def run(args):
    return subprocess.run([sys.executable] + args, cwd=HERE, capture_output=True, text=True).stdout


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch", action="append", required=True)
    ap.add_argument("--out", default=os.path.join(HERE, "RESULTS.md"))
    a = ap.parse_args()
    parts = [MARK, ""]
    for b in a.batch:
        name = os.path.basename(b.rstrip("/"))
        parts.append(f"## Batch `{name}`\n")
        for subset in ("all", "verified", "behavioral", "interface"):
            text = run(["report.py", "--tasks", "tasks.jsonl", "--batch", b, "--verdicts", "verdicts.jsonl",
                        "--subset", subset])
            if "runs: 0" in text:
                continue
            parts.append(text.replace("### ", f"#### {name}, {subset}: ", 1).replace("\n### ", "\n#### "))
            parts.append("")
        parts.append(f"#### {name}: every run\n")
        parts.append(run(["notes.py", "--tasks", "tasks.jsonl", "--batch", b]))
    parts.append("## Full checks\n")
    parts.append("`./RUNME.sh check` on the final tree of every run that passed its hidden tests, after the "
                 "sessions, one at a time, up to three attempts while red (DESIGN.md §3).\n")
    parts.append(run(["checks.py"] + a.batch))
    parts.append("## Cost log\n")
    parts.append("Every model call this benchmark paid for, from `costlog.jsonl` (excluded batches and probes "
                 "included: the money was spent).\n")
    parts.append(run(["costs.py", "--md"]))
    generated = "\n".join(parts)
    head = ""
    if os.path.exists(a.out):
        text = open(a.out).read()
        head = text.split(MARK)[0] if MARK in text else text
    open(a.out, "w").write(head + generated + "\n")
    print(f"wrote {a.out}")


if __name__ == "__main__":
    main()
