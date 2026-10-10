"""`hx serve`: the coordinator. One process = the single writer.

  GET  /                  owner UI (phone-first; same app on desktop)
  GET  /api/state         board, inbox, counts, digest           (owner token)
  GET  /api/ticket/<id>   detail: gate, run, evidence, timeline  (owner token)
  GET  /api/rawstate      full folded state (remote CLI views)   (owner or agent token)
  POST /api/answer        {qid, choice, text}                    (owner token)
  POST /api/control       {action, ticket, reason, outcome}      (owner token)
  POST /api/op            {op, args, kwargs}                     (agent ops: agent token; owner ops: owner)

A background thread runs the clock (`tick`) every N seconds. Tokens: HX_OWNER_TOKEN / HX_AGENT_TOKEN
(generated and printed once if unset). Agent-written text is untrusted: the UI escapes everything.
"""
import json
import os
import secrets
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from . import views
from .engine import Rejected

AGENT_OPS = {"claim", "heartbeat", "checkpoint", "submit", "ask", "done", "release", "brief", "lease"}
OWNER_OPS = {"answer", "approve", "request_changes", "pause", "resume", "cancel", "revoke", "override", "edit",
             "create_ticket", "import_spec", "configure", "tick", "board", "inbox", "show", "digest", "events"}
UI_PATH = os.path.join(os.path.dirname(__file__), "ui.html")


def _clean(result):
    """Service results may be (state, events); never ship whole states over /api/op."""
    if isinstance(result, tuple) and len(result) == 2 and isinstance(result[1], list):
        return {"seqs": [e["seq"] for e in result[1]]}
    return result


def make_handler(hx, owner_token, agent_token):
    class Handler(BaseHTTPRequestHandler):
        server_version = "hx"

        def log_message(self, *a):
            pass

        def _send(self, code, body, ctype="application/json"):
            data = body if isinstance(body, bytes) else json.dumps(body, default=str).encode()
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def _who(self):
            tok = self.headers.get("Authorization", "")
            tok = tok[7:].strip() if tok.startswith("Bearer ") else ""
            if tok and secrets.compare_digest(tok, owner_token):
                return "owner"
            if tok and secrets.compare_digest(tok, agent_token):
                return "agent"
            return None

        def _body(self):
            n = int(self.headers.get("Content-Length") or 0)
            if n > 1_000_000:
                raise ValueError("body too large")
            return json.loads(self.rfile.read(n) or b"{}")

        def _guard(self, need):
            who = self._who()
            if who is None or (need == "owner" and who != "owner"):
                self._send(401, {"error": "unauthorized", "message": f"{need} token required"})
                return None
            return who

        def do_GET(self):
            u = urlparse(self.path)
            try:
                if u.path in ("/", "/index.html"):
                    with open(UI_PATH, "rb") as f:
                        return self._send(200, f.read(), "text/html; charset=utf-8")
                if u.path == "/api/state":
                    if not self._guard("owner"):
                        return
                    st, now = hx.state(), hx.now()
                    return self._send(200, {"now": now, "paused_all": st["paused_all"],
                                            "counts": views.counts(st, now), "board": views.board(st, now),
                                            "inbox": views.inbox(st, now), "digest": views.digest(st, now),
                                            "pushes": st["pushes"][-5:]})
                if u.path.startswith("/api/ticket/"):
                    if not self._guard("owner"):
                        return
                    tid = u.path.rsplit("/", 1)[1]
                    st = hx.state()
                    if tid not in st["tickets"]:
                        return self._send(404, {"error": "no such ticket"})
                    d = views.show(st, tid, hx.now())
                    d["brief"] = hx.brief(None, tid)
                    d["timeline"] = [{k: e[k] for k in ("seq", "ts", "actor", "type")} |
                                     {"summary": json.dumps({k: v for k, v in e["data"].items()
                                                             if k not in ("process", "payload", "report")},
                                                            default=str)[:160]}
                                     for e in hx.events(tid)][-60:]
                    return self._send(200, d)
                if u.path == "/api/rawstate":
                    if not self._guard("agent"):
                        return
                    return self._send(200, {"state": hx.state(), "now": hx.now()})
                return self._send(404, {"error": "not found"})
            except Exception as e:  # never kill the server
                return self._send(500, {"error": type(e).__name__, "message": str(e)})

        def do_POST(self):
            u = urlparse(self.path)
            try:
                body = self._body()
                if u.path == "/api/answer":
                    if not self._guard("owner"):
                        return
                    hx.answer(body["qid"], body.get("choice"), body.get("text"))
                    return self._send(200, {"ok": True})
                if u.path == "/api/control":
                    if not self._guard("owner"):
                        return
                    act, tid = body.get("action"), body.get("ticket")
                    if act == "pause":
                        hx.pause(tid)
                    elif act == "resume":
                        hx.resume(tid)
                    elif act == "cancel":
                        hx.cancel(tid)
                    elif act == "revoke":
                        hx.revoke(tid, body.get("reason") or "reassigned by owner")
                    elif act == "override":
                        hx.override(tid, body.get("reason"), body.get("outcome"))
                    elif act == "approve":
                        hx.approve(tid, body.get("text"))
                    elif act == "changes":
                        hx.request_changes(tid, body.get("text") or "changes requested")
                    else:
                        return self._send(400, {"error": "bad action"})
                    return self._send(200, {"ok": True})
                if u.path == "/api/op":
                    op = body.get("op")
                    need = "agent" if op in AGENT_OPS else "owner" if op in OWNER_OPS else None
                    if need is None:
                        return self._send(400, {"error": "unknown op"})
                    if not self._guard(need):
                        return
                    res = getattr(hx, op)(*body.get("args", []), **body.get("kwargs", {}))
                    return self._send(200, {"ok": True, "result": _clean(res)})
                return self._send(404, {"error": "not found"})
            except Rejected as r:
                return self._send(409, {"error": "rejected", **r.to_dict()})
            except (KeyError, ValueError, TypeError) as e:
                return self._send(400, {"error": type(e).__name__, "message": str(e)})
            except Exception as e:
                return self._send(500, {"error": type(e).__name__, "message": str(e)})

    return Handler


class Coordinator:
    def __init__(self, hx, host="127.0.0.1", port=8765, tick=60, dispatch=False, owner_token=None,
                 agent_token=None):
        self.hx = hx
        self.owner_token = owner_token or os.environ.get("HX_OWNER_TOKEN") or secrets.token_urlsafe(16)
        self.agent_token = agent_token or os.environ.get("HX_AGENT_TOKEN") or secrets.token_urlsafe(16)
        self.httpd = ThreadingHTTPServer((host, port), make_handler(hx, self.owner_token, self.agent_token))
        self.tick_s, self.dispatch = tick, dispatch
        self._stop = threading.Event()
        self.tick_log = []

    @property
    def port(self):
        return self.httpd.server_address[1]

    def _ticker(self):
        while not self._stop.wait(self.tick_s):
            try:
                self.tick_log.extend(self.hx.tick(dispatch=self.dispatch))
                del self.tick_log[:-200]
            except Exception as e:
                self.tick_log.append(f"tick error: {e}")

    def start(self):
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        if self.tick_s:
            threading.Thread(target=self._ticker, daemon=True).start()
        return self

    def stop(self):
        self._stop.set()
        self.httpd.shutdown()
        self.httpd.server_close()


def serve(hx, host, port, tick=60, dispatch=False):
    c = Coordinator(hx, host, port, tick, dispatch)
    print(f"hx coordinator on http://{host}:{c.port}/#token=<owner token>")
    if not os.environ.get("HX_OWNER_TOKEN"):
        print(f"  owner token (generated, not stored): {c.owner_token}")
    if not os.environ.get("HX_AGENT_TOKEN"):
        print(f"  agent token (generated, not stored): {c.agent_token}")
    c.start()
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        c.stop()
