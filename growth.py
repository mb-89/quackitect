#!/usr/bin/env python3
"""How much of a v5 session went to tickets other than the task's and its group's: after the
group's work, the work skill pulls the next ticket of the backlog, and a session that keeps
going works it. Reads v5state.json (v5state.py) and the transcript.

  python3 growth.py results/<batch> [results/<batch> ...]

Each assistant message is put on the ticket its tool calls name (level zero makes every write
and command name its ticket); a message naming none stays on the ticket before it. For each v5
run that touched another ticket: the share of the session's priced usage, wall-clock and turns
that went to the other tickets.
"""
import datetime
import gzip
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from benchlib import WORK, read_jsonl  # noqa: E402
from transcript import PRICES  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
BASES = {t["ticket"]: t["base"] for t in read_jsonl(os.path.join(HERE, "tasks.jsonl"))}


def ts(m):
    t = m.get("timestamp")
    if not t:
        return None
    return datetime.datetime.fromisoformat(t.replace("Z", "+00:00")).timestamp()


def price(model, u):
    pi, po, pw, pr = PRICES.get(model, PRICES["claude-haiku-5-5"])
    return (u[0] * pi + u[1] * po + u[2] * pw + u[3] * pr) / 1e6


NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+){2,}$")


def ticket_of(msg):
    """The ticket an assistant message works for: level zero makes every write and command name
    its ticket (the MCP tools' `ticket` field, the Bash call's description "<ticket>: ...", the
    pull's hand-back `ticket pull <ticket> --pass`)."""
    for c in msg.get("content") or []:
        if c.get("type") != "tool_use":
            continue
        inp = c.get("input") or {}
        cand = [str(inp.get("ticket", "")).strip(), str(inp.get("description", "")).split(":", 1)[0].strip()]
        pull = re.search(r"ticket pull ([a-z0-9-]+) --", str(inp.get("command", "")))
        if pull:
            cand.append(pull.group(1))
        for n in cand:
            if NAME_RE.match(n):
                return n
    return None


def is_ticket(meta, name):
    """Whether spec/tickets/<name>.md stands in the tree the session started from (the run's
    origin keeps it; the mirror's base commit says the same)."""
    for repo, tree in ((os.path.join(meta.get("scratch", ""), "origin.git"), meta.get("start_tree")),
                       (os.path.join(WORK, "qk"), BASES.get(meta.get("ticket")))):
        if tree and os.path.isdir(repo):
            r = subprocess.run(["git", "-C", repo, "cat-file", "-e", f"{tree}:spec/tickets/{name}.md"],
                               capture_output=True)
            return r.returncode == 0
    return True


def one(run_dir):
    st = json.load(open(os.path.join(run_dir, "v5state.json")))
    others = st.get("other_tickets_touched") or []
    task = os.path.basename(run_dir).split("__")[0]
    own = {task, "the-bench-work"}
    msgs = []
    with gzip.open(os.path.join(run_dir, "transcript.jsonl.gz"), "rt") as f:
        for line in f:
            try:
                msgs.append(json.loads(line))
            except ValueError:
                pass
    seen, rows, cur = set(), [], task
    for m in msgs:
        if m.get("type") != "assistant":
            continue
        msg = m.get("message") or {}
        mid = msg.get("id")
        tk = ticket_of(msg)
        if tk and not m.get("parent_tool_use_id"):
            cur = tk
        if not mid or mid in seen:
            # a later content block of a message already counted can still name its ticket
            if tk and rows and rows[-1][0] == mid:
                rows[-1][4] = tk
            continue
        seen.add(mid)
        u = msg.get("usage") or {}
        rows.append([mid, ts(m), price(msg.get("model", "?"), (
            u.get("input_tokens", 0) or 0, u.get("output_tokens", 0) or 0,
            u.get("cache_creation_input_tokens", 0) or 0, u.get("cache_read_input_tokens", 0) or 0)),
            not m.get("parent_tool_use_id"), tk or cur])
    total = sum(r[2] for r in rows)
    times = [r[1] for r in rows if r[1]]
    secs = {}
    for a, b in zip(rows, rows[1:]):
        if a[1] and b[1]:
            secs[a[4]] = secs.get(a[4], 0) + (b[1] - a[1])
    # another ticket: one whose file the session changed, or one its calls name that stands as a
    # ticket at the task's base; neither the task's nor the group's
    meta = json.load(open(os.path.join(run_dir, "meta.json")))
    named = {r[4] for r in rows if r[4] not in own}
    others = sorted(set(others) | {n for n in named if is_ticket(meta, n)})
    on_other = [r for r in rows if r[4] in others]
    at_base = {o: is_ticket(meta, o) for o in others}
    return {"run": os.path.basename(run_dir), "others": others, "others_closed": st.get("other_tickets_closed") or [],
            "others_from_backlog": [o for o in others if at_base[o]], "others_minted": [o for o in others if not at_base[o]],
            "group_state": st.get("group_state"), "task_state": st.get("task_state"),
            "other_cost_share": round(sum(r[2] for r in on_other) / total, 3) if total else 0.0,
            "other_secs": round(sum(v for k, v in secs.items() if k in others)),
            "session_secs": round(max(times) - min(times)) if times else None,
            "other_turns": sum(1 for r in on_other if r[3]), "turns": sum(1 for r in rows if r[3]),
            "by_ticket_secs": {k: round(v) for k, v in secs.items()}}


def main():
    res = []
    for batch in sys.argv[1:]:
        root = os.path.join(batch, "runs")
        for rid in sorted(os.listdir(root)):
            d = os.path.join(root, rid)
            if "__v5__" in rid and os.path.exists(os.path.join(d, "v5state.json")):
                r = one(d)
                r["batch"] = os.path.basename(batch.rstrip("/"))
                res.append(r)
    print("| batch | task | other tickets worked | share of the session's cost | minutes | turns |")
    print("|---|---|---|---|---|---|")
    for r in res:
        if not r["others"]:
            continue
        mins = f"{r['other_secs'] / 60:.0f} of {r['session_secs'] / 60:.0f}" if r.get("session_secs") else "?"
        cell = ", ".join(f"`{o}` ({'backlog' if o in r['others_from_backlog'] else 'minted in the session'}"
                         f"{', closed' if o in r['others_closed'] else ''})" for o in r["others"])
        print(f"| {r['batch']} | {r['run'].split('__')[0]} | {cell} "
              f"| {r['other_cost_share']:.0%} | {mins} | {r['other_turns']} of {r.get('turns')} |")
    json.dump(res, open(os.path.join(sys.argv[1], "growth.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
