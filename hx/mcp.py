"""Optional MCP wrapper: the agent commands as typed tools over stdio (JSON-RPC 2.0, one message per line).

It adds structure for models that prefer tools, but no enforcement: MCP cannot inject the brief at
session start or block a stop. Hooks + CLI remain the primary integration.
"""
import json
import sys

from .engine import Rejected

TOOLS = {
    "hx_brief": ("Your current brief: ticket, step, gate checklist, handover notes.", {}),
    "hx_claim": ("Claim the next ready step for a role (or a given ticket).",
                 {"role": {"type": "string", "enum": ["worker", "reviewer"]}, "ticket": {"type": "string"}}),
    "hx_checkpoint": ("Record what is done and what is next (survives crashes and resets).",
                      {"done": {"type": "string"}, "next": {"type": "string"}, "risks": {"type": "string"}}),
    "hx_submit": ("Submit evidence for verification against the pushed commit.",
                  {"kind": {"type": "string"}, "sha": {"type": "string"}, "path": {"type": "string"},
                   "verdict": {"type": "string"}, "ac": {"type": "object"}, "findings": {"type": "array"},
                   "went_well": {"type": "string"}, "went_badly": {"type": "string"}, "change": {"type": "string"}}),
    "hx_ask": ("Ask the owner (blocking by default: your lease is released).",
               {"text": {"type": "string"}, "options": {"type": "array", "items": {"type": "string"}},
                "default": {"type": "string"}, "blocking": {"type": "boolean"}}),
    "hx_done": ("Ask the gate to pass your step.", {"outcome": {"type": "string"}}),
    "hx_release": ("Hand the step over with a note.", {"note": {"type": "string"}}),
}


def _call(hx, sid, name, a):
    if name == "hx_brief":
        return hx.brief(sid)
    if name == "hx_claim":
        return hx.claim(sid, a.get("role", "worker"), a.get("ticket"))["brief"]
    if name == "hx_checkpoint":
        hx.checkpoint(sid, done=a.get("done"), next=a.get("next"), risks=a.get("risks"))
        return "checkpoint recorded"
    if name == "hx_submit":
        kind = a.pop("kind")
        r = hx.submit(sid, kind, **a)
        return ("VERIFIED " if r["ok"] else "NOT VERIFIED ") + json.dumps(r["report"])
    if name == "hx_ask":
        return json.dumps(hx.ask(sid, a["text"], a.get("options"), a.get("default"), blocking=a.get("blocking", True)))
    if name == "hx_done":
        return hx.done(sid, a.get("outcome"))["message"]
    if name == "hx_release":
        hx.release(sid, note=a.get("note"))
        return "released"
    raise KeyError(name)


def handle(hx, sid, msg):
    mid, method = msg.get("id"), msg.get("method")
    if method == "initialize":
        res = {"protocolVersion": msg.get("params", {}).get("protocolVersion", "2025-06-18"),
               "capabilities": {"tools": {}}, "serverInfo": {"name": "hx", "version": "0.1.0"}}
    elif method == "tools/list":
        res = {"tools": [{"name": n, "description": d, "inputSchema": {"type": "object", "properties": p}}
                         for n, (d, p) in TOOLS.items()]}
    elif method == "tools/call":
        p = msg.get("params", {})
        try:
            text, err = _call(hx, sid, p.get("name"), dict(p.get("arguments") or {})), False
        except Rejected as r:
            text, err = f"REJECTED ({r.code}): {r.message}", True
        res = {"content": [{"type": "text", "text": text}], "isError": err}
    elif mid is None:
        return None  # notification
    else:
        return {"jsonrpc": "2.0", "id": mid, "error": {"code": -32601, "message": f"unknown method {method}"}}
    return {"jsonrpc": "2.0", "id": mid, "result": res}


def serve_stdio():
    from .cli import make_hx, session_id
    hx = make_hx()
    sid = session_id(create=True)
    for line in sys.stdin:
        if not line.strip():
            continue
        out = handle(hx, sid, json.loads(line))
        if out is not None:
            sys.stdout.write(json.dumps(out) + "\n")
            sys.stdout.flush()
