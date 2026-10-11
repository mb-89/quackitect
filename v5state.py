#!/usr/bin/env python3
"""Where each v5 run left its tickets: the task's ticket, the group, and any other ticket the
pull handed out after the group's work (read off the final tree, not the agent's word).

  python3 v5state.py --batch results/<batch>      (writes v5state.json into each v5 run folder)
"""
import argparse
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arms  # noqa: E402


def field(text, name):
    m = re.search(rf"^{name}:\s*(\S+)", text or "", re.M)
    return m.group(1) if m else None


def show(repo, tree, path):
    r = subprocess.run(["git", "-C", repo, "show", f"{tree}:{path}"], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch", required=True)
    a = ap.parse_args()
    root = os.path.join(a.batch, "runs")
    for rid in sorted(os.listdir(root)):
        if "__v5__" not in rid:
            continue
        d = os.path.join(root, rid)
        mp = os.path.join(d, "meta.json")
        if not os.path.exists(mp):
            continue
        m = json.load(open(mp))
        repo = os.path.join(m["scratch"], "quackitect")
        if not os.path.isdir(repo):
            continue
        t = m["ticket"]
        ft, st = m["final_tree"], m["start_tree"]
        task_text, group_text = show(repo, ft, f"spec/tickets/{t}.md"), show(repo, ft, f"spec/tickets/{arms.GROUP}.md")
        changed = [p for s, p in m.get("changed", [])]
        others = sorted({os.path.basename(p)[:-3] for p in changed if p.startswith("spec/tickets/")
                         and os.path.basename(p)[:-3] not in (t, arms.GROUP)})
        others_closed = [o for o in others
                         if field(show(repo, ft, f"spec/tickets/{o}.md"), "state") == "closed"
                         and field(show(repo, st, f"spec/tickets/{o}.md"), "state") != "closed"]
        out = {"run": rid, "task_state": field(task_text, "state"), "task_step": field(task_text, "step"),
               "group_state": field(group_text, "state"), "group_step": field(group_text, "step"),
               "other_tickets_touched": others, "other_tickets_closed": others_closed}
        json.dump(out, open(os.path.join(d, "v5state.json"), "w"), indent=1)
        print(json.dumps(out))


if __name__ == "__main__":
    main()
