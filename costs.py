#!/usr/bin/env python3
"""The running cost log, summed: every model call this benchmark paid for.

  python3 costs.py [--log costlog.jsonl] [--md]

Rows come from run.py (one per agent session: the session's own cost plus the harness-side
calls the meter caught) and verify.py (one per screen call). Excluded batches stay in the log:
the money was spent.
"""
import argparse
import collections
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from benchlib import HERE, read_jsonl  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--log", default=os.path.join(HERE, "costlog.jsonl"))
    ap.add_argument("--md", action="store_true")
    a = ap.parse_args()
    rows = read_jsonl(a.log)
    by = collections.defaultdict(lambda: [0, 0.0, 0.0])
    for r in rows:
        k = (r.get("batch", "?"), r.get("arm", "?"), r.get("model", "?"))
        by[k][0] += 1
        by[k][1] += r.get("cost_usd") or 0.0
        by[k][2] += r.get("nested_cost_usd") or 0.0
    total = sum(v[1] for v in by.values())
    # the measured batches: the runs whose folders stand under results/ (not results/_excluded),
    # matched to their log rows by batch, run and time
    measured = collections.defaultdict(float)
    rdir = os.path.join(HERE, "results")
    for b in sorted(os.listdir(rdir)):
        runs = os.path.join(rdir, b, "runs")
        if b.startswith("_") or not os.path.isdir(runs):
            continue
        for rid in os.listdir(runs):
            mp = os.path.join(runs, rid, "meta.json")
            if os.path.exists(mp):
                measured[b] += json.load(open(mp)).get("cost_total") or 0.0
    screen = sum(r.get("cost_usd") or 0.0 for r in rows if r.get("batch") == "verify")
    rest = total - sum(measured.values()) - screen
    split = ", ".join(f"{b} ${c:.2f}" for b, c in measured.items())
    if a.md:
        print("| batch | arm | model | calls | $ total | of which harness-side $ |")
        print("|---|---|---|---|---|---|")
        for (b, arm, m), (n, c, nc) in sorted(by.items()):
            print(f"| {b} | {arm} | {m} | {n} | {c:.3f} | {nc:.3f} |")
        print(f"| **all** | | | {sum(v[0] for v in by.values())} | **{total:.2f}** | {sum(v[2] for v in by.values()):.3f} |")
        print(f"\nOf the ${total:.2f}: the measured batches {split}; the task screen ${screen:.2f}; probes and "
              f"excluded batches ${rest:.2f}.")
    else:
        for (b, arm, m), (n, c, nc) in sorted(by.items()):
            print(f"{b:28s} {arm:12s} {m:20s} {n:4d} ${c:8.3f}  (harness-side ${nc:.3f})")
        print(f"total ${total:.2f} over {len(rows)} rows")
        print(f"measured: {split}; screen ${screen:.2f}; probes and excluded ${rest:.2f}")


if __name__ == "__main__":
    main()
