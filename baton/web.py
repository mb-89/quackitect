"""The owner's page: one inbox, phone first, no JavaScript.

GET  /            the inbox: what needs you, what moves, what is done
GET  /w/<id>      one work: route, baton, evidence, timeline, steering
POST /act         approve, reject, answer, note, pause, resume, prio
GET  /api/inbox   the same inbox as JSON, for a push notifier or a bot

Set BATON_TOKEN to require ?t=<token> once; a cookie carries it after.
"""

import html
import json
import os
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from .card import ago, route_line
from .config import open_engine
from .engine import BatonError

E = html.escape
DOT = {"ok": "#2e7d32", "queued": "#9e9e9e", "waiting": "#1565c0",
       "slow": "#f9a825", "stuck": "#c62828", "you": "#6a1b9a",
       "paused": "#616161", "done": "#2e7d32"}

CSS = """
body{font:16px/1.4 system-ui,sans-serif;margin:0;background:#fafafa;color:#222}
header{background:#222;color:#fff;padding:12px 16px;font-weight:600}
main{max-width:720px;margin:auto;padding:8px}
h2{font-size:15px;text-transform:uppercase;color:#555;margin:18px 8px 6px}
.c{background:#fff;border-radius:10px;padding:12px;margin:8px 0;box-shadow:0 1px 2px #0002}
.k{font-size:12px;font-weight:700;text-transform:uppercase;color:#6a1b9a}
.t{font-weight:600}.m{color:#666;font-size:14px}
.row{display:flex;gap:8px;align-items:center;padding:10px 8px;border-bottom:1px solid #eee}
.dot{width:10px;height:10px;border-radius:5px;flex:none}
button{font-size:16px;padding:10px 14px;border-radius:8px;border:0;margin:6px 6px 0 0}
.y{background:#2e7d32;color:#fff}.n{background:#eee}
input[type=text]{font-size:16px;width:100%;box-sizing:border-box;padding:8px;margin-top:8px}
pre{white-space:pre-wrap;font-size:13px;background:#f3f3f3;padding:8px;border-radius:6px}
a{color:inherit}
"""


def page(title, body):
    return (f"<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'>"
            f"<title>{E(title)}</title><style>{CSS}</style><header>{E(title)}</header>"
            f"<main>{body}</main>")


def form(wid, action, label, cls="y", text=None, extra=""):
    field = (f"<input type=text name=text placeholder='{E(text)}'>" if text else "")
    return (f"<form method=post action=/act><input type=hidden name=w value={E(wid)}>"
            f"<input type=hidden name=a value={action}>{extra}{field}"
            f"<button class={cls}>{E(label)}</button></form>")


def need_card(i):
    h = [f"<div class=c><div class=k>{E(i['kind'])} · {E(i['step'])} {E(i['pos'])}</div>",
         f"<div class=t><a href=/w/{E(i['id'])}>{E(i['id'])} {E(i['title'])}</a></div>",
         f"<div class=m>{E(i['text'][:500])}</div>"]
    if i.get("pending"):
        h.append(f"<div class=m>waiting on: {E('; '.join(i['pending']))}</div>")
    if i["kind"] == "question":
        for o in i.get("options") or []:
            h.append(form(i["id"], "answer", o, "n",
                          extra=f"<input type=hidden name=text value='{E(o)}'>"))
        h.append(form(i["id"], "answer", "Answer", text="your answer"))
    elif i["kind"] == "approve":
        h.append(form(i["id"], "approve", "Approve"))
        h.append(form(i["id"], "reject", "Send back", "n", text="what to change"))
    elif i["kind"] == "stuck":
        h.append(form(i["id"], "resume", "Resume", text="a hint for the next agent"))
        h.append(form(i["id"], "pause", "Pause", "n"))
    return "".join(h) + "</div>"


def row(i):
    return (f"<div class=row><span class=dot style='background:{DOT.get(i['health'], '#999')}'></span>"
            f"<div><a class=t href=/w/{E(i['id'])}>{E(i['id'])} {E(i['title'])}</a>"
            f"<div class=m>{E(i['health'])} · {E(i['step'])} {E(i['pos'])}"
            + (f" · {E(i['group'])}" if i["group"] else "")
            + f"<br>{E(i['baton'][:120])}</div></div></div>")


def inbox_html(eng):
    b = eng.inbox()
    body = [f"<h2>Needs you ({len(b['needs'])})</h2>"]
    body += [need_card(i) for i in b["needs"]] or ["<div class='c m'>Nothing. Agents are working.</div>"]
    body.append(f"<h2>Moving ({len(b['moving'])})</h2><div class=c>")
    body += [row(i) for i in b["moving"]] + ["</div>"]
    body.append(f"<h2>Done ({len(b['done'])})</h2><div class=c>")
    body += [row(i) for i in b["done"][-10:]] + ["</div>"]
    return page(f"baton · {len(b['needs'])} need you", "".join(body))


def work_html(eng, wid):
    w = eng.get(wid)
    now = eng.now
    body = [f"<div class=c><div class=k>{E(w.status)} · {E(w.group or 'no group')} · {E(w.branch)}</div>",
            f"<div class=m>{E(route_line(w))}</div>",
            f"<p>{E(w.ask)}</p><div class=m><b>Baton</b> ({E(w.baton_by or '-')}): {E(w.baton or '-')}</div>",
            form(wid, "note", "Pin a note for the agent", "n", text="note"),
            form(wid, "pause", "Pause", "n") if not w.paused else form(wid, "resume", "Resume"),
            "</div><h2>Evidence</h2>"]
    for s in w.route:
        for name, text in w.evidence.get(s["step"], {}).items():
            body.append(f"<details class=c><summary>{E(s['step'])} / {E(name)}</summary>"
                        f"<pre>{E(text)}</pre></details>")
    body.append("<h2>Timeline</h2><div class=c>")
    for e in reversed(w.log[-60:]):
        body.append(f"<div class=m>{E(ago(now, e['ts']))} · {E(e['actor'])} · <b>{E(e['kind'])}</b> {E(e['text'])}</div>")
    body.append("</div>")
    return page(f"{w.id} {w.title}", "".join(body))


def act(eng, f):
    wid, a, text = f.get("w", ""), f.get("a", ""), f.get("text", "").strip()
    if a == "approve":
        return eng.approve(wid, text)
    if a == "reject":
        return eng.reject(wid, text or "sent back without a reason; read the card")
    if a == "answer":
        return eng.answer(wid, text)
    if a == "note":
        return eng.note(wid, text)
    if a == "pause":
        return eng.pause(wid)
    if a == "resume":
        return eng.resume(wid, text)
    if a == "prio":
        return eng.prioritize(wid, int(text or 0))
    raise BatonError(f"unknown action {a}")


class Handler(BaseHTTPRequestHandler):
    def _authed(self):
        tok = os.environ.get("BATON_TOKEN")
        if not tok:
            return True
        q = parse_qs(urlparse(self.path).query).get("t", [""])[0]
        c = SimpleCookie(self.headers.get("Cookie", ""))
        self._set_cookie = q == tok
        return q == tok or ("t" in c and c["t"].value == tok)

    def _send(self, code, body, ctype="text/html; charset=utf-8", loc=None):
        data = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        if loc:
            self.send_header("Location", loc)
        if getattr(self, "_set_cookie", False):
            self.send_header("Set-Cookie", f"t={os.environ['BATON_TOKEN']}; Path=/; HttpOnly; SameSite=Strict")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *a):
        pass

    def do_GET(self):
        if not self._authed():
            return self._send(403, "token required")
        path = urlparse(self.path).path
        eng = open_engine()
        try:
            if path == "/":
                return self._send(200, inbox_html(eng))
            if path.startswith("/w/"):
                return self._send(200, work_html(eng, path[3:]))
            if path == "/api/inbox":
                return self._send(200, json.dumps(eng.inbox()), "application/json")
            return self._send(404, "not found")
        except BatonError as e:
            return self._send(404, page("error", E(str(e))))

    def _same_origin(self):
        """A browser names the page a form came from; refuse other sites."""
        src = self.headers.get("Origin") or self.headers.get("Referer")
        return not src or urlparse(src).netloc == self.headers.get("Host")

    def do_POST(self):
        if not self._authed():
            return self._send(403, "token required")
        if not self._same_origin():
            return self._send(403, "cross-site form refused")
        n = int(self.headers.get("Content-Length", 0))
        f = {k: v[0] for k, v in parse_qs(self.rfile.read(n).decode()).items()}
        try:
            act(open_engine(), f)
        except BatonError as e:
            return self._send(400, page("refused", E(str(e)) + "<p><a href=/>back</a>"))
        back = urlparse(self.headers.get("Referer") or "/").path
        if not back.startswith("/") or back.startswith("//"):
            back = "/"
        return self._send(303, "", loc=back)


def serve(host="127.0.0.1", port=8077):
    print(f"baton owner page on http://{host}:{port}/")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
