#!/usr/bin/env python3
"""The full checks of one or more batches: per arm, how many of the measured runs came out green
(and on which attempt), and for every red run the parts that stayed red and what made them red.

  python3 checks.py results/<batch> [results/<batch> ...]
"""
import json
import os
import sys

ARMS = ["plain", "plain+stop", "v5"]


def main():
    print("| batch | arm | hidden-pass runs | check measured | green | green only on a later attempt | red |")
    print("|---|---|---|---|---|---|---|")
    reds = []
    for batch in sys.argv[1:]:
        name = os.path.basename(batch.rstrip("/"))
        root = os.path.join(batch, "runs")
        for arm in ARMS:
            hp = measured = green = later = 0
            for rid in sorted(os.listdir(root)):
                if rid.split("__")[1] != arm:
                    continue
                gp = os.path.join(root, rid, "grade.json")
                if not os.path.exists(gp):
                    continue
                g = json.load(open(gp))
                if not (g.get("hidden") or {}).get("pass"):
                    continue
                hp += 1
                c = g.get("check")
                if not c:
                    continue
                measured += 1
                att = c.get("attempts") or [c]
                if c.get("pass"):
                    green += 1
                    later += 1 if att[0].get("exit") != 0 else 0
                else:
                    why = [f for f in (att[-1].get("findings_new") or []) if "answers red" not in f]
                    reds.append((name, rid.split("__")[0], arm, c.get("red"), len(att),
                                 [x.get("load_start") for x in att], why[:3]))
            print(f"| {name} | {arm} | {hp} | {measured} | {green} | {later} | {measured - green} |")
    if reds:
        print("\n| batch | task | arm | red in every attempt | attempts (load at start) | what made it red (last attempt) |")
        print("|---|---|---|---|---|---|")
        for b, t, arm, red, n, loads, why in reds:
            print(f"| {b} | {t} | {arm} | {', '.join(red or [])} | {n} ({', '.join(str(x) for x in loads)}) "
                  f"| {'<br>'.join(w.replace('|', '/')[:200] for w in why)} |")


if __name__ == "__main__":
    main()
