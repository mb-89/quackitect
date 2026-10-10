"""Summarise results.jsonl files into the tables EVAL.md shows.

usage: python summarize.py results.jsonl [more.jsonl ...]
"""

import collections
import json
import sys


def load(paths):
    rows = []
    for p in paths:
        rows += [json.loads(ln) for ln in open(p) if ln.strip()]
    return [r for r in rows if "hidden_total" in r]


def cell(rs):
    n = len(rs)
    full = sum(1 for r in rs if r["hidden_passed"] == r["hidden_total"])
    score = sum(r["hidden_passed"] / r["hidden_total"] for r in rs) / n
    claimed = [r for r in rs if r["claimed_done"]]
    false_done = sum(1 for r in claimed if r["hidden_passed"] < r["hidden_total"])
    unfinished = n - len(claimed)
    owner = sum(1 for r in rs if (r.get("info") or {}).get("owner_needed"))
    return {
        "n": n,
        "all hidden pass": f"{full}/{n}",
        "mean hidden score": f"{score:.2f}",
        "claimed done, hidden fail": f"{false_done}/{len(claimed)}",
        "never claimed done": unfinished,
        "owner needed": owner,
        "mean sessions": f"{sum(r['sessions'] for r in rs) / n:.1f}",
        "mean cost $": f"{sum(r['cost'] for r in rs) / n:.3f}",
        "mean minutes": f"{sum(r['secs'] for r in rs) / n / 60:.1f}",
    }


def table(rows, key):
    groups = collections.defaultdict(list)
    for r in rows:
        groups[key(r)].append(r)
    keys = sorted(groups)
    cols = list(cell(groups[keys[0]]).keys())
    out = ["| arm | " + " | ".join(cols) + " |", "|" + "---|" * (len(cols) + 1)]
    for k in keys:
        c = cell(groups[k])
        out.append(f"| {' '.join(map(str, k))} | " + " | ".join(str(c[x]) for x in cols) + " |")
    return "\n".join(out)


if __name__ == "__main__":
    rows = load(sys.argv[1:])
    short = lambda m: m.split("-")[1]
    print(table(rows, lambda r: (short(r["model"]), f"t{r['max_turns']}", r["cond"])))
    print()
    print(table(rows, lambda r: (r["task"], short(r["model"]), f"t{r['max_turns']}", r["cond"])))
