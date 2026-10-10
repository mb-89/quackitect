"""The HTTP service: the API workers and hooks call, and the owner's page."""

from __future__ import annotations

import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from .engine import Engine, HarnessError
from .page import PAGE

TICKET_VERBS = {"decide", "note", "answer", "retry", "pause", "resume"}
ATTEMPT_VERBS = {"status", "evidence", "handover", "done", "ask", "note", "heartbeat"}


class Api:
    """Maps HTTP paths onto engine verbs. Returns (status, json)."""

    def __init__(self, engine: Engine):
        self.engine = engine

    def handle(self, method: str, path: str, body: dict) -> tuple[int, object]:
        e = self.engine
        p = [x for x in path.split("/") if x]
        if not p or p[0] != "api":
            return 404, {"error": "not_found", "message": path}
        p = p[1:]
        try:
            if method == "GET":
                if p == ["state"]:
                    return 200, {"now": e.now(), "inbox": e.inbox(), "board": e.board()}
                if p == ["inbox"]:
                    return 200, e.inbox()
                if p == ["board"]:
                    return 200, e.board()
                if p == ["ready"]:
                    return 200, e.ready()
                if len(p) == 2 and p[0] == "ticket":
                    return 200, e.timeline(p[1])
                if len(p) == 3 and p[0] == "attempt":
                    aid = int(p[1])
                    if p[2] == "briefing":
                        return 200, {"briefing": e.briefing(aid)}
                    if p[2] == "can_stop":
                        ok, why = e.can_stop(aid)
                        return 200, {"can_stop": ok, "reason": why}
                    if p[2] == "info":
                        return 200, e.info(aid)
            if method == "POST":
                if p == ["ticket"]:
                    return 200, e.mint(body["id"], body["goal"], body.get("route", "default"),
                                       group=body.get("group"), branch=body.get("branch"),
                                       test_cmd=body.get("test_cmd"), test_paths=body.get("test_paths"),
                                       priority=int(body.get("priority", 0)))
                if len(p) == 3 and p[0] == "ticket" and p[2] in TICKET_VERBS:
                    tid, verb = p[1], p[2]
                    if verb == "decide":
                        return 200, e.decide(tid, body.get("verdict", ""), body.get("note", ""))
                    if verb == "note":
                        return 200, e.owner_note(tid, body.get("text") or body.get("note", ""))
                    if verb == "answer":
                        return 200, e.answer(tid, body.get("text") or body.get("note", ""))
                    if verb == "retry":
                        return 200, e.retry(tid, body.get("note") or body.get("text", ""))
                    if verb == "pause":
                        return 200, e.pause(tid)
                    if verb == "resume":
                        return 200, e.resume(tid)
                if p == ["claim"]:
                    return 200, e.claim(body["ticket"], body.get("worker", "worker"))
                if len(p) == 3 and p[0] == "attempt" and p[2] in ATTEMPT_VERBS:
                    aid, verb, tok = int(p[1]), p[2], body.get("token", "")
                    if verb == "status":
                        return 200, e.status(aid, tok)
                    if verb == "evidence":
                        return 200, e.evidence(aid, tok, body.get("kind", ""), body.get("body", {}))
                    if verb == "handover":
                        return 200, e.handover(aid, tok, **{k: body.get(k, "") for k in ("done", "remaining", "blockers", "files", "next")})
                    if verb == "done":
                        return 200, e.done(aid, tok)
                    if verb == "ask":
                        return 200, e.ask(aid, tok, body.get("question", ""))
                    if verb == "note":
                        return 200, e.note(aid, tok, body.get("text", ""))
                    if verb == "heartbeat":
                        return 200, e.heartbeat(aid, tok)
                if p == ["ci"]:
                    e.ci(body["sha"], body["status"])
                    return 200, {"ok": True}
                if p == ["tick"]:
                    return 200, e.tick()
            return 404, {"error": "not_found", "message": f"{method} {path}"}
        except HarnessError as err:
            return 400, {"error": err.code, "message": err.message}
        except (KeyError, ValueError, TypeError) as err:
            return 400, {"error": "bad_request", "message": repr(err)}


def make_handler(api: Api):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def _send(self, status: int, obj, ctype: str = "application/json"):
            data = obj.encode() if isinstance(obj, str) else json.dumps(obj, default=str).encode()
            self.send_response(status)
            self.send_header("content-type", ctype + "; charset=utf-8")
            self.send_header("content-length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            path = urlparse(self.path).path
            if path == "/" or path.startswith("/t/"):
                return self._send(200, PAGE, "text/html")
            status, obj = api.handle("GET", path, {})
            self._send(status, obj)

        def do_POST(self):
            n = int(self.headers.get("content-length") or 0)
            raw = self.rfile.read(n) if n else b""
            try:
                body = json.loads(raw or b"{}")
            except ValueError:
                return self._send(400, {"error": "bad_json", "message": "the body is not JSON"})
            status, obj = api.handle("POST", urlparse(self.path).path, body if isinstance(body, dict) else {})
            self._send(status, obj)

    return Handler


class Service:
    """The HTTP server plus the supervisor tick, each on its own thread."""

    def __init__(self, engine: Engine, host: str = "127.0.0.1", port: int = 8787, tick_seconds: float = 2.0):
        self.engine = engine
        self.api = Api(engine)
        self.httpd = ThreadingHTTPServer((host, port), make_handler(self.api))
        self.httpd.daemon_threads = True
        self.tick_seconds = tick_seconds
        self._stop = threading.Event()
        self.threads: list[threading.Thread] = []

    @property
    def url(self) -> str:
        host, port = self.httpd.server_address[:2]
        return f"http://{host}:{port}"

    def start(self):
        t1 = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        t2 = threading.Thread(target=self._ticker, daemon=True)
        self.threads = [t1, t2]
        t1.start()
        t2.start()
        return self

    def _ticker(self):
        while not self._stop.wait(self.tick_seconds):
            try:
                self.engine.tick()
            except Exception:
                pass

    def stop(self):
        self._stop.set()
        self.httpd.shutdown()
        self.httpd.server_close()

    def serve_forever(self):
        self.start()
        try:
            while True:
                time.sleep(3600)
        except KeyboardInterrupt:
            self.stop()
