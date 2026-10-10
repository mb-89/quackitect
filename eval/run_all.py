"""Run the relay grid in parallel and append each result to results.jsonl.

usage: python run_all.py OUTDIR [--jobs 8] [--grid main|quick]
"""

import argparse
import itertools
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
EASY = ["dur", "rpn", "inv"]
HAIKU, SONNET = "claude-haiku-5-5", "claude-sonnet-5-5"

BOTH, BATON = ["solo", "baton"], ["baton"]

GRIDS = {
    # (tasks, conditions, model, max_turns, reps)
    "main": [(EASY, BOTH, HAIKU, 5, 3), (EASY, BOTH, HAIKU, 12, 3),
             (EASY, BOTH, SONNET, 5, 2)],
    # baton v2 (with reopen) on the same cells as main
    "v2easy": [(EASY, BATON, HAIKU, 5, 3), (EASY, BATON, HAIKU, 12, 3),
               (EASY, BATON, SONNET, 5, 2)],
    "hard": [(["kv"], BOTH, HAIKU, 5, 3), (["kv"], BOTH, HAIKU, 12, 3),
             (["kv"], BOTH, SONNET, 5, 3), (["kv"], BOTH, SONNET, 12, 3)],
    "lite": [(EASY + ["kv"], ["lite"], HAIKU, 5, 3), (["kv"], ["lite"], SONNET, 5, 3)],
    # v3: the final design (whole ask on the card, red fails on its first pass
    # only) on every baton cell, and lite on kv, whose card v2 cut (EVAL.md)
    "v3": [(EASY, BATON, HAIKU, 5, 3), (EASY, BATON, HAIKU, 12, 3), (EASY, BATON, SONNET, 5, 2),
           (["kv"], ["baton", "lite"], HAIKU, 5, 3), (["kv"], BATON, HAIKU, 12, 3),
           (["kv"], ["baton", "lite"], SONNET, 5, 3), (["kv"], BATON, SONNET, 12, 3)],
    "sheet": [(["sheet"], ["solo", "baton", "lite"], HAIKU, 5, 3),
              (["sheet"], ["solo", "baton", "lite"], SONNET, 5, 3)],
    "v4": [(["kv"], ["baton4"], HAIKU, 12, 6), (["kv"], ["lite4"], HAIKU, 5, 6)],
    "stop": [(["sheet"], ["solostop", "lite4"], HAIKU, 5, 6)],
    "quick": [(EASY, BOTH, HAIKU, 5, 1)],
}


def one(job, out):
    model, turns, rep, task, cond = job
    name = f"{model.split('-')[1]}-t{turns}-{task}-{cond}-r{rep}"
    d = os.path.join(out, name)
    r = subprocess.run([sys.executable, os.path.join(HERE, "relay.py"), "--task", task,
                        "--cond", cond, "--model", model, "--max-turns", str(turns),
                        "--max-sessions", "12", "--out", d],
                       capture_output=True, text=True)
    line = r.stdout.strip().splitlines()[-1] if r.stdout.strip() else json.dumps(
        {"task": task, "cond": cond, "model": model, "max_turns": turns,
         "error": r.stderr[-400:]})
    rec = dict(json.loads(line), rep=rep, run=name)
    with open(os.path.join(out, "results.jsonl"), "a") as f:
        f.write(json.dumps(rec) + "\n")
    print(name, rec.get("hidden_passed"), "/", rec.get("hidden_total"), flush=True)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("out")
    p.add_argument("--jobs", type=int, default=8)
    p.add_argument("--grid", default="main")
    a = p.parse_args()
    os.makedirs(a.out, exist_ok=True)
    jobs = []
    for grid in a.grid.split(","):
        jobs += [(m, t, r, task, c) for tasks, conds, m, t, reps in GRIDS[grid]
                 for r, task, c in itertools.product(range(1, reps + 1), tasks, conds)]
    with ThreadPoolExecutor(a.jobs) as ex:
        list(ex.map(lambda j: one(j, a.out), jobs))


if __name__ == "__main__":
    main()
