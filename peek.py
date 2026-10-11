#!/usr/bin/env python3
"""Peek at running sessions: the last few tool calls and texts of each live transcript.

  python3 peek.py <scratch runs dir> [--n 6]
"""
import json
import os
import sys
import time


def tail(path, n):
    rows = []
    with open(path) as f:
        for line in f:
            try:
                m = json.loads(line)
            except ValueError:
                continue
            if m.get("type") == "assistant":
                for c in (m.get("message") or {}).get("content") or []:
                    sub = "  (sub)" if m.get("parent_tool_use_id") else ""
                    if c.get("type") == "tool_use":
                        rows.append(f"TOOL{sub} {c.get('name')}: {json.dumps(c.get('input'))[:220]}")
                    elif c.get("type") == "text":
                        rows.append(f"TEXT{sub} {c.get('text', '')[:220]!r}")
            elif m.get("type") == "result":
                rows.append(f"RESULT {m.get('subtype')} ${m.get('total_cost_usd')} turns={m.get('num_turns')}")
    return rows[-n:]


def main():
    root = sys.argv[1]
    n = int(sys.argv[3]) if len(sys.argv) > 3 else 6
    for rid in sorted(os.listdir(root)):
        p = os.path.join(root, rid, "transcript.jsonl")
        if not os.path.exists(p):
            print(f"== {rid}: (no transcript yet)")
            continue
        age = int(time.time() - os.path.getmtime(p))
        lines = sum(1 for _ in open(p))
        print(f"== {rid}: {lines} lines, last write {age}s ago")
        for r in tail(p, n):
            print("   ", r)


if __name__ == "__main__":
    main()
