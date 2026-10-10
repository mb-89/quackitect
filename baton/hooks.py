"""Claude Code hooks. Each reads the hook's JSON on stdin.

session-start  inject the card (startup, resume, clear and compact alike)
post-tool-use  heartbeat; every few calls, a three-line re-anchor
stop           refuse to stop while holding a lease without a claim,
               question or handoff; on the second stop, hand off for it
"""

import json
import os
import sys

from .card import reanchor, render
from .config import actor as env_actor, open_engine


def _out(obj):
    sys.stdout.write(json.dumps(obj))


def run(event, data):
    eng, a = open_engine(), env_actor()
    if event == "session-start":
        if not eng.held(a) and os.environ.get("BATON_AUTOTAKE", "1") == "1":
            eng.take(a, os.environ.get("BATON_WORK") or None)
        _out({"hookSpecificOutput": {"hookEventName": "SessionStart",
              "additionalContext": render(eng.held(a), a, eng.now)}})
    elif event == "post-tool-use":
        wid = eng.heartbeat(a)
        if not wid:
            return
        w = eng.get(wid)
        every = eng.cfg["reanchor_every"]
        if w.calls % every == 0 or (w.nudged and w.calls % 5 == 0):
            _out({"hookSpecificOutput": {"hookEventName": "PostToolUse",
                  "additionalContext": reanchor(w, a, eng.now)}})
    elif event == "stop":
        w = eng.held(a)
        if not w:
            return
        if data.get("stop_hook_active"):
            eng.s.append(w.id, a, "note", {"text": "session stopped without a handoff"})
            eng.handoff(a, "(previous session stopped without a handoff) "
                        + (w.baton or "no baton yet"))
            return
        _out({"decision": "block", "reason": (
            f"You still hold {w.id} at step {w.step_name}. Before you stop, do "
            "one: done(evidence, baton) if the step's gates pass; ask(question) "
            "if you need the owner; handoff(baton) with where things stand.\n"
            + reanchor(w, a, eng.now))})


def main(event):
    raw = "" if sys.stdin.isatty() else sys.stdin.read()
    run(event, json.loads(raw) if raw.strip() else {})
