#!/usr/bin/env python3
"""Lay a later validation's grader lists onto the frozen task set, leaving everything an agent
sees (order, ask, interface note) as it stands.

  python3 refresh_graders.py --tasks tasks.jsonl --validated val3.jsonl

For each task the later file validated: FAIL_TO_PASS and PASS_TO_PASS become that validation's,
minus every test it saw flaky; `reps` and `graders_from` record where they came from. A task the
later validation finds invalid keeps its old lists and gets `revalidation: invalid`.
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from benchlib import read_jsonl  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tasks", required=True)
    ap.add_argument("--validated", required=True)
    a = ap.parse_args()
    vals = {v["ticket"]: v for v in read_jsonl(a.validated)}
    tasks = read_jsonl(a.tasks)
    changed = 0
    for t in tasks:
        v = vals.get(t["ticket"])
        if not v:
            continue
        if not v.get("valid"):
            t["revalidation"] = "invalid"
            continue
        flaky = set(v.get("flaky", []))
        f2p = [x for x in v["f2p"] if x not in flaky]
        p2p = [x for x in v["p2p"] if x not in flaky]
        if f2p != t["f2p"] or p2p != t["p2p"]:
            changed += 1
        t.update({"f2p": f2p, "p2p": p2p, "reps": v.get("reps"), "n_flaky": len(flaky),
                  "graders_from": os.path.basename(a.validated), "solution_green": v.get("solution_green")})
    with open(a.tasks, "w") as f:
        for t in tasks:
            f.write(json.dumps(t, sort_keys=True) + "\n")
    print(f"{len(vals)} revalidated, {changed} grader lists changed")


if __name__ == "__main__":
    main()
