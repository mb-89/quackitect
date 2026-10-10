"""A stdio MCP server exposing the agent's verbs.

Newline-delimited JSON-RPC 2.0, the MCP stdio transport. Every call also
counts as a heartbeat for the caller's lease.
"""

import json
import sys

from .card import render
from .config import actor as env_actor, open_engine
from .engine import BatonError

S = {"type": "string"}
TOOLS = [
    {"name": "card",
     "description": "Your card: the work you hold, its step, what closes the "
                    "step, the baton, owner notes. Read it when unsure what to do.",
     "inputSchema": {"type": "object", "properties": {}}},
    {"name": "take",
     "description": "Lease the next work your role may do (or the one named).",
     "inputSchema": {"type": "object", "properties": {"work": S}}},
    {"name": "done",
     "description": "Claim the current step is done. The harness runs the "
                    "step's gates and closes the step only if they pass. "
                    "Attach named evidence and a baton (where things stand, "
                    "what comes next, for a stranger).",
     "inputSchema": {"type": "object", "properties": {
         "evidence": {"type": "object", "additionalProperties": S},
         "baton": S}, "required": ["baton"]}},
    {"name": "note",
     "description": "Journal a line; optionally update the baton. Never "
                    "closes a step.",
     "inputSchema": {"type": "object", "properties": {"text": S, "baton": S},
                     "required": ["text"]}},
    {"name": "reopen",
     "description": "Send the work back to an earlier step of yours (for "
                    "example red, when a test you wrote expects a wrong value), "
                    "with the reason. The reviewer sees every reopen.",
     "inputSchema": {"type": "object", "properties": {"step": S, "reason": S},
                     "required": ["step", "reason"]}},
    {"name": "ask",
     "description": "Ask the owner a question. Releases your lease; the work "
                    "waits for the answer. Offer options when you can.",
     "inputSchema": {"type": "object", "properties": {
         "question": S, "options": {"type": "array", "items": S}},
         "required": ["question"]}},
    {"name": "handoff",
     "description": "Release the work with a baton, so another agent picks "
                    "it up. Use it before you run out of context or turns.",
     "inputSchema": {"type": "object", "properties": {"baton": S},
                     "required": ["baton"]}},
    {"name": "verdict",
     "description": "Reviewers only: approve HEAD, or reject with findings "
                    "the author can act on.",
     "inputSchema": {"type": "object", "properties": {
         "approve": {"type": "boolean"},
         "findings": {"type": "array", "items": S}, "baton": S},
         "required": ["approve"]}},
    {"name": "mint",
     "description": "Propose a new piece of work you found. The owner "
                    "approves its spec before anyone builds it.",
     "inputSchema": {"type": "object", "properties": {
         "title": S, "ask": S, "group": S}, "required": ["title", "ask"]}},
]


def _after_claim(eng, actor, res):
    if res.get("closed"):
        head = f"Gates passed: step '{res['closed']}' closed."
        if res.get("still_yours"):
            return head + " Next step is yours:\n\n" + render(eng.held(actor), actor, eng.now)
        if res.get("next_owner") is None:
            return head + " The work is done. Call take() for more, or stop."
        return (head + f" The next step belongs to {res['next_owner']}; your "
                "lease is released. Call take() for more work, or stop.")
    if res.get("pending"):
        return ("Gates pass so far and now wait on: " + "; ".join(res["pending"])
                + ". The work is parked and your lease released. Call take() "
                "for other work, or stop.")
    if res.get("bounced_to"):
        return f"Sent back to step '{res['bounced_to']}': " + "; ".join(res["findings"])
    return ("Claim refused; the step stays open. Fix this and claim again:\n"
            + "\n".join(res.get("failures", [])))


def call(eng, actor, name, a):
    if name == "card":
        return render(eng.held(actor), actor, eng.now)
    if name == "take":
        wid = eng.take(actor, a.get("work"))
        if not wid:
            return "Nothing to take for your role right now. Stop."
        return render(eng.held(actor), actor, eng.now)
    if name == "done":
        return _after_claim(eng, actor, eng.done(actor, a.get("evidence") or {},
                                                 a.get("baton", "")))
    if name == "note":
        eng.jot(actor, a["text"], a.get("baton"))
        return "noted"
    if name == "reopen":
        res = eng.reopen(actor, a["step"], a["reason"])
        w = eng.held(actor)
        if w is None:
            return "Reopened, and the work now waits on the owner (sent back too often). Stop."
        return f"Back at step '{res['bounced_to']}'. Your card:\n\n" + render(w, actor, eng.now)
    if name == "ask":
        return eng.ask(actor, a["question"], a.get("options"))["note"]
    if name == "handoff":
        eng.handoff(actor, a.get("baton", ""))
        return "Handed off. Stop now."
    if name == "verdict":
        return _after_claim(eng, actor, eng.verdict(
            actor, a.get("approve"), a.get("findings") or [], a.get("baton", "")))
    if name == "mint":
        wid = eng.mint(actor, a["title"], a["ask"], a.get("group", ""))
        return f"Minted {wid}; it waits for the owner's yes on its spec."
    raise BatonError(f"unknown tool {name}")


BY_NAME = {t["name"]: t for t in TOOLS}
SHAPE = {"string": lambda v: isinstance(v, str),
         "boolean": lambda v: isinstance(v, bool),
         "array": lambda v: isinstance(v, list) and all(isinstance(x, str) for x in v),
         "object": lambda v: isinstance(v, dict) and all(isinstance(x, str) for x in v.values())}


def check_args(name, a):
    """Hold the arguments to the tool's schema, so no malformed value
    reaches the log, where the fold would trip on it for every work."""
    tool = BY_NAME.get(name)
    if tool is None:
        raise BatonError(f"unknown tool {name}")
    if not isinstance(a, dict):
        raise BatonError("arguments must be an object; check the tool's schema")
    schema = tool["inputSchema"]
    for k in schema.get("required", []):
        if k not in a:
            raise BatonError(f"missing argument {k!r}; check the tool's schema and call again")
    for k, v in a.items():
        p = schema.get("properties", {}).get(k)
        if p is None or (k == "evidence" and isinstance(v, str)):
            continue
        if not SHAPE[p["type"]](v):
            raise BatonError(f"argument {k!r} must be a {p['type']}"
                             + (" of strings" if p["type"] in ("array", "object") else "")
                             + "; check the tool's schema and call again")


def handle(eng, actor, msg):
    mid, method = msg.get("id"), msg.get("method", "")
    if mid is None:
        return None  # a notification
    if method == "initialize":
        params = msg.get("params") if isinstance(msg.get("params"), dict) else {}
        ver = params.get("protocolVersion", "2025-06-18")
        res = {"protocolVersion": ver, "capabilities": {"tools": {}},
               "serverInfo": {"name": "baton", "version": "0.1"}}
    elif method == "ping":
        res = {}
    elif method == "tools/list":
        res = {"tools": TOOLS}
    elif method == "tools/call":
        p = msg.get("params") if isinstance(msg.get("params"), dict) else {}
        try:
            eng.heartbeat(actor)
            args = p.get("arguments") or {}
            check_args(p.get("name"), args)
            text, err = call(eng, actor, p.get("name"), args), False
        except BatonError as e:
            text, err = f"error: {e}", True
        except Exception as e:  # a bad call never takes the server down
            text, err = (f"error: {type(e).__name__}: {e}. Check the arguments "
                         f"against the tool's schema and call again."), True
        res = {"content": [{"type": "text", "text": text}], "isError": err}
    else:
        return {"jsonrpc": "2.0", "id": mid,
                "error": {"code": -32601, "message": f"no method {method}"}}
    return {"jsonrpc": "2.0", "id": mid, "result": res}


def serve(stdin=sys.stdin, stdout=sys.stdout):
    eng, actor = open_engine(), env_actor()
    for line in stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
            if not isinstance(msg, dict):
                raise ValueError("one JSON-RPC object per line; batches are not served")
            out = handle(eng, actor, msg)
        except Exception as e:  # one bad line never ends the server
            out = {"jsonrpc": "2.0", "id": None,
                   "error": {"code": -32600, "message": f"{type(e).__name__}: {e}"}}
        if out is not None:
            stdout.write(json.dumps(out) + "\n")
            stdout.flush()
