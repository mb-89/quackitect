#!/usr/bin/env python3
"""One command: run the benchmark on the frozen task set, grade it, and print the tables.

  python3 bench.py run --name <batch> [--model haiku] [--arms plain,v5,plain+stop] [--seeds 1]
                       [--jobs 3] [--only t1,t2] [--wall 2400]
      runs every task of tasks.jsonl in every arm, grades as runs finish, writes
      results/<batch>/REPORT.md

  python3 bench.py compare --baseline <batch A> --candidate <batch B> [--arm v5]
      a change against its baseline: the same arm on the same tasks, paired by task

  python3 bench.py mine --since 2026-10-04 [--name <taskset>]
      mines, validates (3 reps) and screens a fresh task set from the repo's newest history,
      writing tasks-<name>.jsonl (the frozen set stays as it is)

The repository mirror lives at $BENCH_WORK/qk (default: ../bw/qk next to this folder): a clone
of https://github.com/mb-89/quackitect with origin/main fetched. Runs live under /tmp/qb, never in
the owner's checkout. See DESIGN.md.
"""
import argparse
import datetime
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from benchlib import WORK  # noqa: E402

PY = sys.executable


def ensure_mirror():
    qk = os.path.join(WORK, "qk")
    if not os.path.isdir(os.path.join(qk, ".git")):
        os.makedirs(WORK, exist_ok=True)
        subprocess.run(["git", "clone", "-q", "--no-checkout", "https://github.com/mb-89/quackitect", qk], check=True)
    subprocess.run(["git", "-C", qk, "fetch", "-q", "origin"], check=False)
    return qk


def ensure_tools():
    tools = os.environ.get("BENCH_TOOLS", "/tmp/qbtools")
    if not os.path.exists(os.path.join(tools, "node_modules", ".bin", "claude")):
        os.makedirs(tools, exist_ok=True)
        subprocess.run(["npm", "install", "-q", "--prefix", tools, "@anthropic-ai/claude-code@2.1.291"], check=True)
    if not os.path.exists(os.path.join(tools, "sigs")):
        subprocess.run(["go", "build", "-o", os.path.join(tools, "sigs"), "."], cwd=os.path.join(HERE, "sigs"), check=True)


def cmd_run(a):
    qk = ensure_mirror()
    ensure_tools()
    batch = os.path.join(HERE, "results", a.name)
    tasks = os.path.join(HERE, a.tasks)
    runner = [PY, os.path.join(HERE, "run.py"), "--tasks", tasks, "--batch", batch, "--repo", qk,
              "--model", a.model, "--arms", a.arms, "--seeds", str(a.seeds), "--first-seed", str(a.first_seed),
              "--jobs", str(a.jobs), "--wall", str(a.wall), "--budget", str(a.budget)]
    if a.only:
        runner += ["--only", a.only]
    grader = [PY, os.path.join(HERE, "grade.py"), "--tasks", tasks, "--batch", batch, "--repo", qk,
              "--check", a.check, "--jobs", "1", "--watch"]
    os.makedirs(batch, exist_ok=True)
    with open(os.path.join(batch, "run.log"), "a") as rl, open(os.path.join(batch, "grade.log"), "a") as gl:
        r = subprocess.Popen(runner, stdout=rl, stderr=subprocess.STDOUT)
        g = subprocess.Popen(grader, stdout=gl, stderr=subprocess.STDOUT)
        r.wait()
        g.wait()
    subprocess.run([PY, os.path.join(HERE, "grade.py"), "--tasks", tasks, "--batch", batch, "--repo", qk,
                    "--check", a.check, "--jobs", "1"])
    subprocess.run([PY, os.path.join(HERE, "report.py"), "--tasks", tasks, "--batch", batch,
                    "--verdicts", os.path.join(HERE, "verdicts.jsonl"), "--out", os.path.join(batch, "REPORT.md")])


def cmd_compare(a):
    subprocess.run([PY, os.path.join(HERE, "report.py"), "--tasks", os.path.join(HERE, a.tasks),
                    "--baseline", os.path.join(HERE, "results", a.baseline),
                    "--candidate", os.path.join(HERE, "results", a.candidate), "--arm", a.arm])


def cmd_mine(a):
    qk = ensure_mirror()
    ensure_tools()
    out = os.path.join(WORK, f"mine-{a.name}")
    os.makedirs(out, exist_ok=True)
    cands = os.path.join(out, "candidates.jsonl")
    subprocess.run([PY, os.path.join(HERE, "mine.py"), "--repo", qk, "--out", cands], check=True)
    since = datetime.datetime.fromisoformat(a.since).timestamp()
    rows = [json.loads(l) for l in open(cands)]
    keep = [r for r in rows if r["first_time"] >= since and r["test_files"]
            and all(t.endswith("_test.go") or "/testdata/" in t for t in r["test_files"])
            and not r["harness_touched"] and r["lines"].get("code", 0) <= a.max_code_lines]
    sel = os.path.join(out, "selected.jsonl")
    with open(sel, "w") as f:
        for r in keep:
            f.write(json.dumps(r) + "\n")
    val = os.path.join(out, "validated.jsonl")
    subprocess.run([PY, os.path.join(HERE, "validate.py"), "--repo", qk, "--candidates", sel, "--out", val,
                    "--reps", "3", "--jobs", "3"], check=True)
    tasks = os.path.join(HERE, f"tasks-{a.name}.jsonl")
    subprocess.run([PY, os.path.join(HERE, "select_tasks.py"), "--repo", qk, "--candidates", sel,
                    "--validated", val, "--out", tasks], check=True)
    subprocess.run([PY, os.path.join(HERE, "verify.py"), "--repo", qk, "--tasks", tasks,
                    "--out", os.path.join(HERE, f"verdicts-{a.name}.jsonl")], check=True)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run")
    r.add_argument("--name", required=True)
    r.add_argument("--tasks", default="tasks.jsonl")
    r.add_argument("--model", default="haiku")
    r.add_argument("--arms", default="plain,v5,plain+stop")
    r.add_argument("--seeds", type=int, default=1)
    r.add_argument("--first-seed", type=int, default=1)
    r.add_argument("--jobs", type=int, default=3)
    r.add_argument("--only", default="")
    r.add_argument("--wall", type=int, default=2400)
    r.add_argument("--budget", type=float, default=0)
    r.add_argument("--check", default="pass", choices=["all", "pass", "none"])
    c = sub.add_parser("compare")
    c.add_argument("--baseline", required=True)
    c.add_argument("--candidate", required=True)
    c.add_argument("--arm", default="v5")
    c.add_argument("--tasks", default="tasks.jsonl")
    m = sub.add_parser("mine")
    m.add_argument("--since", required=True)
    m.add_argument("--name", required=True)
    m.add_argument("--max-code-lines", type=int, default=250)
    a = ap.parse_args()
    {"run": cmd_run, "compare": cmd_compare, "mine": cmd_mine}[a.cmd](a)


if __name__ == "__main__":
    main()
