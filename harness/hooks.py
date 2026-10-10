"""Claude Code hooks: the four moments the harness needs.

  session-start  prints the briefing as additional context (startup, resume, compact)
  stop           refuses to stop while the attempt is open with no verb called
  pre-tool       refuses git writes off the ticket's branch
  post-tool      heartbeats, and relays a hand-over request

Run as: python3 -m harness.hooks <event>. Never fails the worker: any error
exits 0 with no output.
"""

from __future__ import annotations

import json
import re
import sys

from .client import Client


def read_input(stdin) -> dict:
    try:
        raw = stdin.read()
        return json.loads(raw) if raw.strip() else {}
    except Exception:
        return {}


def session_start(client: Client, inp: dict) -> dict | None:
    briefing = client.briefing()
    return {"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext":
            "The harness briefing for this attempt follows. It is the source of truth; your own summary is not.\n\n" + briefing}}


def stop(client: Client, inp: dict) -> dict | None:
    if inp.get("stop_hook_active"):
        return None  # a second refusal would loop
    r = client.can_stop()
    if r.get("can_stop"):
        return None
    return {"decision": "block", "reason": r.get("reason", "the attempt is open")}


GIT_DENY = [
    (re.compile(r"\bgit\s+push\b.*(\s-f\b|--force)"), "no force push"),
    (re.compile(r"\bgit\s+(checkout|switch)\s+(main|master)\b"), "work stays on the ticket's branch"),
    (re.compile(r"\bgit\s+branch\s+-D\b"), "no branch deletion"),
    (re.compile(r"\bgit\s+reset\s+--hard\b"), "no history rewrite; commit on top"),
    (re.compile(r"\bgit\s+rebase\b"), "no history rewrite; merge instead"),
]


def pre_tool(client: Client, inp: dict) -> dict | None:
    if inp.get("tool_name") != "Bash":
        return None
    cmd = (inp.get("tool_input") or {}).get("command", "") or ""
    reason = None
    for rx, why in GIT_DENY:
        if rx.search(cmd):
            reason = why
            break
    if reason is None and re.search(r"\bgit\s+push\b", cmd):
        branch = client.info().get("branch") or ""
        m = re.search(r"\bgit\s+push\b(?:\s+(?:-u|--set-upstream|-q|--quiet))*\s+(\S+)\s+(\S+)", cmd)
        if m:
            target = m.group(2).split(":")[-1]
            if target not in (branch, "HEAD") and not target.startswith("refs/heads/" + branch):
                reason = f"push goes to {branch} and nowhere else"
    if reason is None:
        return None
    return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny",
                                   "permissionDecisionReason": f"harness: {reason}"}}


def post_tool(client: Client, inp: dict) -> dict | None:
    r = client.verb("heartbeat")
    if "hand_over_now" in (r.get("flags") or []):
        return {"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext":
                "The harness asks you to hand over now: call harness_handover with what is done and what remains, then stop."}}
    return None


EVENTS = {"session-start": session_start, "stop": stop, "pre-tool": pre_tool, "post-tool": post_tool}


def main(argv=None, stdin=None, stdout=None, client: Client | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    stdin = stdin or sys.stdin
    stdout = stdout or sys.stdout
    if not argv or argv[0] not in EVENTS:
        return 0
    try:
        client = client or Client()
        if not client.attempt:
            return 0
        out = EVENTS[argv[0]](client, read_input(stdin))
        if out is not None:
            stdout.write(json.dumps(out))
            stdout.flush()
    except Exception:
        return 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
