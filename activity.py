#!/usr/bin/env python3
"""Where a session's tool calls went, by kind, per arm: reading and editing code, running the
tests, running the repository's check, the harness's own verbs and tools, and waiting.

  python3 activity.py results/<batch> [results/<batch> ...]
  python3 activity.py --v5table results/<batch> [...]   the RESULTS.md table: v5 and plain per batch
"""
import collections
import gzip
import json
import os
import re
import sys

KINDS = [
    ("check", re.compile(r"RUNME\.sh (check|commit|push)\b")),
    ("harness verb", re.compile(r"RUNME\.sh (ticket|branch|mint|retro|cloud|config|guards|lint|doors)\b")),
    ("tests", re.compile(r"\bgo (test|vet)\b|RUNME\.sh test\b|node --test")),
    ("wait", re.compile(r"\bsleep \d|pgrep|kill -0|tail --pid|until .*; do|while .*; do")),
    ("git", re.compile(r"^\s*(cd [^&]*&& )?git ")),
]


def kind_of(name, inp):
    if name.startswith("mcp__level0__"):
        short = name.split("__")[-1]
        if short in ("patch", "replace", "undo"):
            return "edit"
        if short in ("find",):
            return "read"
        return "wait" if short == "wait" else "harness verb"
    if name in ("Read", "Grep", "Glob"):
        return "read"
    if name in ("Edit", "Write", "MultiEdit"):
        return "edit"
    if name in ("Skill", "ToolSearch", "Task", "Agent"):
        return "harness verb" if name in ("Skill", "ToolSearch") else "subagent"
    if name == "Bash":
        cmd = str(inp.get("command", ""))
        for k, rx in KINDS:
            if rx.search(cmd):
                return k
        return "other shell"
    return "other"


def counts(batch):
    """Per run: tool calls by kind, from the transcript."""
    root = os.path.join(batch, "runs")
    out = {}
    for rid in sorted(os.listdir(root)):
        tp = os.path.join(root, rid, "transcript.jsonl.gz")
        if not os.path.exists(tp) or not os.path.exists(os.path.join(root, rid, "meta.json")):
            continue
        c = collections.Counter()
        with gzip.open(tp, "rt") as f:
            for line in f:
                m = json.loads(line)
                if m.get("type") != "assistant":
                    continue
                for x in (m.get("message") or {}).get("content") or []:
                    if x.get("type") == "tool_use":
                        c[kind_of(x.get("name", ""), x.get("input") or {})] += 1
        out[rid] = c
    return out


def v5table(batches):
    """Mean per session, v5 and plain, for each batch: where the calls went, what the harness did,
    and where the v5 runs left their tickets (v5state.json, growth.json)."""
    cols, data = [], {}
    for b in batches:
        cnt = counts(b)
        name = os.path.basename(b.rstrip("/"))
        growth = {}
        gp = os.path.join(b, "growth.json")
        if os.path.exists(gp):
            growth = {r["run"]: r for r in json.load(open(gp))}
        for arm in ("v5", "plain"):
            rids = [r for r in cnt if r.split("__")[1] == arm]
            if not rids:
                continue
            metas = [json.load(open(os.path.join(b, "runs", r, "meta.json"))) for r in rids]
            states = [json.load(open(os.path.join(b, "runs", r, "v5state.json")))
                      for r in rids if os.path.exists(os.path.join(b, "runs", r, "v5state.json"))]
            n = len(rids)

            def mean_kind(*ks):
                return sum(cnt[r][k] for r in rids for k in ks) / n
            nested = [(m.get("nested") or {}) for m in metas]
            with_nested = [x for x in nested if x.get("calls")]
            col = f"{name} {arm} (n={n})"
            cols.append(col)
            data[col] = {
                "tool calls": f"{sum(sum(cnt[r].values()) for r in rids) / n:.1f}",
                "harness verbs and tools": f"{mean_kind('harness verb'):.1f}",
                "check, commit or push": f"{mean_kind('check'):.1f}",
                "reading code": f"{mean_kind('read'):.1f}",
                "editing code": f"{mean_kind('edit'):.1f}",
                "running tests": f"{mean_kind('tests'):.1f}",
                "stop-hook blocks": f"{sum((m['session'] or {}).get('stop_hook_blocks', 0) for m in metas) / n:.1f}",
                "door refusals": f"{sum((m['session'] or {}).get('door_refusals', 0) for m in metas) / n:.1f}",
                "commits": f"{sum(len(m.get('commits_made') or []) if isinstance(m.get('commits_made'), list) else (m.get('commits_made') or 0) for m in metas) / n:.1f}",
                "harness-side model calls": (f"{sum(x.get('calls', 0) for x in nested)} in {len(with_nested)} of {n} sessions, "
                                             f"${sum(x.get('cost', 0) for x in nested) / n:.2f} a session"
                                             if with_nested else "none"),
                "task's ticket closed": (f"{sum(1 for x in states if x.get('task_state') == 'closed')}/{n}" if states else "–"),
                "group carried to done": (f"{sum(1 for x in states if x.get('group_state') == 'closed')}/{n}" if states else "–"),
                "another ticket worked (from the backlog / minted)": (
                    f"{sum(1 for r in rids if (growth.get(r) or {}).get('others'))}/{n} "
                    f"({sum(1 for r in rids if (growth.get(r) or {}).get('others_from_backlog'))} / "
                    f"{sum(1 for r in rids if (growth.get(r) or {}).get('others_minted'))}), "
                    f"{sum((growth.get(r) or {}).get('other_cost_share', 0) for r in rids) / n:.0%} of the cost"
                    if states else "–"),
            }
    rows = list(next(iter(data.values())).keys()) if data else []
    print("| per session (mean) | " + " | ".join(cols) + " |")
    print("|---|" + "---|" * len(cols))
    for k in rows:
        print(f"| {k} | " + " | ".join(data[c][k] for c in cols) + " |")


def main():
    if sys.argv[1:2] == ["--v5table"]:
        v5table(sys.argv[2:])
        return
    per_arm = collections.defaultdict(collections.Counter)
    runs = collections.Counter()
    for batch in sys.argv[1:]:
        for rid, c in counts(batch).items():
            arm = rid.split("__")[1]
            runs[arm] += 1
            per_arm[arm].update(c)
    kinds = ["read", "edit", "tests", "check", "harness verb", "git", "wait", "subagent", "other shell", "other"]
    print("| arm | runs | " + " | ".join(kinds) + " | all |")
    print("|---|---|" + "---|" * (len(kinds) + 1))
    for arm in sorted(per_arm):
        n = runs[arm]
        c = per_arm[arm]
        print(f"| {arm} | {n} | " + " | ".join(f"{c[k] / n:.1f}" for k in kinds) + f" | {sum(c.values()) / n:.1f} |")


if __name__ == "__main__":
    main()
