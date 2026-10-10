#!/usr/bin/env python3
"""Start a coordinator with a realistic mid-flight board, for screenshots and UI click tests.

Prints one JSON line {"url": ..., "token": ...} and serves until stdin closes.
Uses the in-memory store and the fake verifier (no git), so it starts instantly.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from hx.server import Coordinator  # noqa: E402
from tests.helpers import mem_hx, run_feature_to, ticket  # noqa: E402


def build():
    hx, clk = mem_hx()
    hx.import_spec({"group": {"id": "G-7", "title": "Export & sharing"}, "tickets": [
        ticket("T-41", title="CSV export of reports", risk="low", scope=["app/export/csv"]),
        ticket("T-42", title="Share links with expiry", risk="medium", scope=["app/share"]),
        ticket("T-43", title="PDF export", risk="low", scope=["app/export/pdf"]),
        ticket("T-44", title="Export audit log", deps=["T-41"], risk="low"),
        ticket("T-45", title="Rate-limit share API", risk="medium", scope=["app/api/rate"]),
    ]})
    # T-41 lands and goes to retro; T-44 opens behind it
    run_feature_to(hx, "T-41", stop="retro", worker="w-11", reviewer="r-11")
    # T-42 (medium): design done, waiting for the owner's approval
    hx.claim("w-21", "worker", "T-42")
    hx.checkpoint("w-21", done="design drafted: signed tokens + expiry column", next="owner approval")
    hx.submit("w-21", "doc", sha="d" * 40, path="docs/design/T-42.md", scope=["app/share", "app/models/link.py"])
    hx.done("w-21")
    # T-45: keeps dying in green -> escalated to the owner (red)
    run_feature_to(hx, "T-45", stop="green", worker="w-51")
    hx.approve("T-45") if any(q["ticket"] == "T-45" for q in hx.inbox()) else None
    run_feature_to(hx, "T-45", stop="green", worker="w-51")
    for i in range(3):
        hx.claim(f"w-5{i + 2}", "worker", "T-45")
        hx.checkpoint(f"w-5{i + 2}", done="limiter skeleton", next="redis backend")
        clk.advance(16 * 60)
        hx.tick()
    # T-43: an agent is in green right now
    run_feature_to(hx, "T-43", stop="green", worker="w-31")
    hx.claim("w-32", "worker", "T-43")
    hx.checkpoint("w-32", done="page layout renders", next="embed fonts; table pagination",
                  risks="fonts licence unclear")
    # T-44: a worker asks a blocking question
    hx.claim("w-61", "worker", "T-44")
    hx.ask("w-61", "Should the audit log include exports by admins impersonating users?",
           options=["yes", "no"], default="yes", deadline_s=4 * 3600,
           summary="T-44: log exports done by admins impersonating users? (default yes in 4h)")
    clk.advance(120)
    hx.tick()
    return hx


def main():
    hx = build()
    c = Coordinator(hx, port=int(os.environ.get("PORT", "0")), tick=0, owner_token="ui-owner",
                    agent_token="ui-agent").start()
    print(json.dumps({"url": f"http://127.0.0.1:{c.port}/", "token": "ui-owner"}), flush=True)
    sys.stdin.read()
    c.stop()


if __name__ == "__main__":
    main()
