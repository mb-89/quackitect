"""The MCP server a worker talks to: six verbs over stdio, each a call on the service.

Run as: python3 -m harness.mcp_server, with HARNESS_URL, HARNESS_ATTEMPT and
HARNESS_TOKEN in the environment. Speaks JSON-RPC 2.0, one message per line.
"""

from __future__ import annotations

import json
import sys

from .client import ApiError, Client

TOOLS = [
    {"name": "harness_status",
     "description": "Where you stand: ticket, step, what is filed, what still closes the step, flags such as hand_over_now.",
     "inputSchema": {"type": "object", "properties": {}}},
    {"name": "harness_evidence",
     "description": "File evidence on your step as you go. kind is one of plan, design, commit, test_run, test_change, review, retro, note. body carries the kind's fields, e.g. {\"sha\": \"...\"} for commit.",
     "inputSchema": {"type": "object", "required": ["kind", "body"],
                     "properties": {"kind": {"type": "string"}, "body": {"type": "object"}}}},
    {"name": "harness_handover",
     "description": "Leave the step for the next attempt and stop: what is done, what remains, blockers, files touched, the next command.",
     "inputSchema": {"type": "object", "required": ["done", "remaining"],
                     "properties": {k: {"type": "string"} for k in ("done", "remaining", "blockers", "files", "next")}}},
    {"name": "harness_done",
     "description": "Request the step's gate. The harness verifies the evidence itself and answers pass or fail with detail. Either way your attempt is over: stop.",
     "inputSchema": {"type": "object", "properties": {}}},
    {"name": "harness_ask",
     "description": "Put a question to the owner and stop. The ticket waits in the owner's inbox.",
     "inputSchema": {"type": "object", "required": ["question"], "properties": {"question": {"type": "string"}}}},
    {"name": "harness_note",
     "description": "Leave a note on the ticket for later attempts and the owner.",
     "inputSchema": {"type": "object", "required": ["text"], "properties": {"text": {"type": "string"}}}},
]


def call_tool(client: Client, name: str, args: dict) -> tuple[str, bool]:
    try:
        if name == "harness_status":
            out = client.verb("status")
        elif name == "harness_evidence":
            out = client.verb("evidence", {"kind": args.get("kind"), "body": args.get("body", {})})
        elif name == "harness_handover":
            out = client.verb("handover", {k: args.get(k, "") for k in ("done", "remaining", "blockers", "files", "next")})
        elif name == "harness_done":
            out = client.verb("done")
        elif name == "harness_ask":
            out = client.verb("ask", {"question": args.get("question", "")})
        elif name == "harness_note":
            out = client.verb("note", {"text": args.get("text", "")})
        else:
            return f"unknown tool {name}", True
        return json.dumps(out, indent=1), False
    except ApiError as e:
        return f"{e.code}: {e.message}", True
    except Exception as e:  # the service is unreachable
        return f"harness unreachable: {e}", True


def handle(client: Client, msg: dict) -> dict | None:
    method = msg.get("method")
    mid = msg.get("id")
    if method == "initialize":
        return {"jsonrpc": "2.0", "id": mid, "result": {
            "protocolVersion": msg.get("params", {}).get("protocolVersion", "2024-11-05"),
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "harness", "version": "0.1"}}}
    if method == "notifications/initialized" or mid is None:
        return None
    if method == "ping":
        return {"jsonrpc": "2.0", "id": mid, "result": {}}
    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": mid, "result": {"tools": TOOLS}}
    if method == "tools/call":
        params = msg.get("params", {})
        text, is_error = call_tool(client, params.get("name", ""), params.get("arguments") or {})
        return {"jsonrpc": "2.0", "id": mid, "result": {"content": [{"type": "text", "text": text}], "isError": is_error}}
    return {"jsonrpc": "2.0", "id": mid, "error": {"code": -32601, "message": f"method not found: {method}"}}


def main(stdin=None, stdout=None, client: Client | None = None):
    stdin = stdin or sys.stdin
    stdout = stdout or sys.stdout
    client = client or Client()
    for line in stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except ValueError:
            continue
        out = handle(client, msg)
        if out is not None:
            stdout.write(json.dumps(out) + "\n")
            stdout.flush()


if __name__ == "__main__":
    main()
