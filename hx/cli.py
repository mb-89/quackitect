"""`hx` — the single interface for agents, hooks, CI and the owner.

Environment:
  HX_STORE   event log: path/to/log.jsonl (default .hx/log.jsonl at the repo root) | git:/repo#ref
  HX_URL     talk to a coordinator (`hx serve`) instead of a local store; HX_TOKEN = agent/owner token
  HX_REPO    shared remote the verifier checks commits in (local mode)
  HX_SESSION agent session id (else read from .hx/local/session, written by the SessionStart hook)
  HX_NOW     pin the clock (epoch seconds) for demos/tests
  HX_LAUNCH  dispatcher command template, e.g. "claude -p {prompt}"
  HX_NOTIFY  owner push command template, e.g. "notify-send hx {text}"
Exit codes: 0 ok · 1 error · 2 rejected by a gate/rule · 3 lease lost or paused (stop working)
"""
import argparse
import json
import os
import re
import shlex
import subprocess
import sys
import time

from . import views
from .engine import Rejected
from .service import Hx, new_session_id
from .store import Clock, open_store
from .verify import GitVerifier, Verifier, resolve


def repo_root(cwd=None):
    r = subprocess.run(["git", "rev-parse", "--show-toplevel"], cwd=cwd or os.getcwd(), capture_output=True)
    return r.stdout.decode().strip() if r.returncode == 0 else (cwd or os.getcwd())


def local_dir(cwd=None):
    base = os.environ.get("CLAUDE_PROJECT_DIR") or repo_root(cwd)
    return os.path.join(base, ".hx", "local")


def make_hx():
    url = os.environ.get("HX_URL")
    if url:
        from .client import RemoteHx
        return RemoteHx(url, os.environ.get("HX_TOKEN", ""))
    spec = os.environ.get("HX_STORE") or os.path.join(repo_root(), ".hx", "log.jsonl")
    store = open_store(spec, Clock())
    repo = os.environ.get("HX_REPO")
    verifier = GitVerifier(repo, main=os.environ.get("HX_MAIN", "main"), ci_cmd=os.environ.get("HX_CI_CMD")) \
        if repo else Verifier()
    launcher = notifier = None
    if os.environ.get("HX_LAUNCH"):
        from .service import CommandLauncher
        launcher = CommandLauncher(os.environ["HX_LAUNCH"])
    if os.environ.get("HX_NOTIFY"):
        tmpl = os.environ["HX_NOTIFY"]

        def notifier(text, urgent):
            subprocess.Popen(tmpl.format(text=shlex.quote(text), urgent=int(urgent)), shell=True,
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return Hx(store, verifier, notifier, launcher)


def session_id(args=None, create=False):
    if args is not None and getattr(args, "session", None):
        return args.session
    if os.environ.get("HX_SESSION"):
        return os.environ["HX_SESSION"]
    path = os.path.join(local_dir(), "session")
    if os.path.exists(path):
        return open(path).read().strip()
    if create:
        sid = new_session_id()
        os.makedirs(local_dir(), exist_ok=True)
        with open(path, "w") as f:
            f.write(sid)
        return sid
    return None


def head_sha(cwd=None):
    try:
        return resolve("HEAD", cwd or os.getcwd())
    except ValueError:
        return None


def parse_duration(s):
    if s is None:
        return None
    m = re.fullmatch(r"(\d+)([smhd]?)", s.strip())
    if not m:
        raise SystemExit(f"bad duration {s!r} (use 30m, 4h, 1d)")
    return int(m.group(1)) * {"": 1, "s": 1, "m": 60, "h": 3600, "d": 86400}[m.group(2)]


def csv(s):
    return [x.strip() for x in s.split(",") if x.strip()] if s else []


def out(args, obj, text=None):
    if getattr(args, "json", False):
        print(json.dumps(obj, indent=2, sort_keys=True, default=str))
    else:
        print(text if text is not None else obj)


def need_session(args):
    sid = session_id(args)
    if not sid:
        raise SystemExit("hx: no session id (set HX_SESSION, pass --session, or run inside a hooked session)")
    return sid


# --------------------------------------------------------------------------- commands

def c_ticket_add(hx, a):
    spec = {"id": a.id, "title": a.title or a.id, "body": a.body or "", "criteria": a.criteria or [],
            "process": a.process, "risk": a.risk, "priority": a.priority, "deps": csv(a.deps),
            "scope": csv(a.scope), "parent": a.group, "test_cmd": a.test_cmd, "ci_cmd": a.ci_cmd}
    hx.create_ticket(spec)
    print(f"created {a.id}")


def c_import(hx, a):
    with open(a.file) as f:
        spec = json.load(f)
    st, evs = hx.import_spec(spec)
    print(f"imported {len(evs)} tickets")


def c_claim(hx, a):
    sid = session_id(a, create=True)
    r = hx.claim(sid, a.role, a.ticket)
    _remember(r["ticket"], r["epoch"], sid)
    out(a, r, r["brief"])


def _remember(ticket, epoch, sid):
    try:
        os.makedirs(local_dir(), exist_ok=True)
        p = os.path.join(local_dir(), "agent.json")
        data = json.load(open(p)) if os.path.exists(p) else {}
        data.update(session=sid, ticket=ticket, epoch=epoch, calls_since_cp=0, stop_blocks=0)
        json.dump(data, open(p, "w"))
    except OSError:
        pass


def _forget_lease():
    p = os.path.join(local_dir(), "agent.json")
    try:
        data = json.load(open(p))
        for k in ("ticket", "epoch"):
            data.pop(k, None)
        json.dump(data, open(p, "w"))
    except (OSError, ValueError):
        pass


def c_brief(hx, a):
    print(hx.brief(session_id(a), a.ticket))


def c_heartbeat(hx, a):
    hx.heartbeat(need_session(a), head=head_sha())
    print("ok")


def c_checkpoint(hx, a):
    hx.checkpoint(need_session(a), done=a.done, next=a.next, risks=a.risks, text=a.text, head=head_sha())
    _reset_counter()
    print("checkpoint recorded")


def _reset_counter():
    p = os.path.join(local_dir(), "agent.json")
    try:
        data = json.load(open(p))
        data["calls_since_cp"] = 0
        json.dump(data, open(p, "w"))
    except (OSError, ValueError):
        pass


def c_submit(hx, a):
    sid = need_session(a)
    sha = a.sha
    if sha is None and a.kind != "review" and a.kind != "retro":
        sha = "HEAD"
    if sha:
        try:
            sha = resolve(sha)
        except ValueError:
            pass
    args = {}
    if a.path:
        args["path"] = a.path
    if a.tests:
        args["tests"] = csv(a.tests)
    if a.verdict:
        args["verdict"] = a.verdict
    if a.ac:
        args["ac"] = dict(x.split("=", 1) for x in a.ac)
    if a.finding:
        args["findings"] = a.finding
    for k in ("went_well", "went_badly", "change"):
        if getattr(a, k):
            args[k] = getattr(a, k)
    r = hx.submit(sid, a.kind, sha=sha, **args)
    _reset_counter()
    rep = r["report"] or {}
    if r["ok"]:
        out(a, r, f"VERIFIED {a.kind}: {rep.get('summary', '')}\nNext: `hx done` (the gate is re-checked).")
    else:
        msg = f"NOT VERIFIED {a.kind}: {rep.get('reason')}"
        if rep.get("tail"):
            msg += "\n--- output (tail) ---\n" + rep["tail"]
        out(a, r, msg)
        sys.exit(2)


def c_ask(hx, a):
    r = hx.ask(need_session(a), a.text, options=csv(a.options), default=a.default,
               deadline_s=parse_duration(a.deadline), blocking=not a.nonblocking, summary=a.summary,
               note=a.note)
    if r["blocking"]:
        _forget_lease()
        print(f"asked {r['qid']}. The step now waits for the owner and your lease is released: stop here. "
              f"A fresh session will continue with the answer.")
    else:
        print(f"asked {r['qid']} (non-blocking). Keep working; the answer will arrive as a notice.")


def c_done(hx, a):
    r = hx.done(need_session(a), outcome=a.outcome, cont=a.cont)
    lease = hx.state()["leases"].get(need_session(a))
    if lease:
        _remember(lease["ticket"], lease["epoch"], need_session(a))
    else:
        _forget_lease()
    out(a, r, r["message"] + (("\n\n" + r["brief"]) if r.get("brief") else ""))


def c_release(hx, a):
    hx.release(need_session(a), note=a.note)
    _forget_lease()
    print("released; a fresh session can continue from your note. Stop here.")


def c_board(hx, a):
    st = hx.state()
    now = hx.now()
    out(a, views.board(st, now), views.board_text(st, now) + "\n" + views.digest(st, now).splitlines()[0])


def c_inbox(hx, a):
    items = hx.inbox()
    lines = []
    for q in items:
        due = f" default {q['default']} in {views.mins(q['due_s'])}" if q.get("due_s") is not None else ""
        lines.append(f"{q['id']} [{q['kind']}] {q['ticket']}: {q['summary']}\n    options: "
                     f"{' | '.join(q['options']) or '(free text)'}{due}")
    out(a, items, "\n".join(lines) or "inbox empty")


def c_show(hx, a):
    d = hx.show(a.id)
    t = d["ticket"]
    lines = [f"{t['id']} {t['title']} [{t['status']}] step={t['step']} health={d['health']} ({d['why']})"]
    for c in d["gate"]:
        lines.append(f"  gate {c['check']}: {c['status']} — {c['msg']}")
    for h in d["history"]:
        lines.append(f"  passed {h['step']}#{h['visit']} -> {h['outcome'] or 'next'} by {h['by']}"
                     + (f" ({h['note']})" if h.get("note") else ""))
    for e in d["evidence"]:
        lines.append(f"  evidence {e['id']} {e['kind']} {'verified' if e['verified'] else 'REJECTED'} "
                     f"by {e['by']}: {e['report'].get('summary') or e['report'].get('reason')}")
    out(a, d, "\n".join(lines))


def c_log(hx, a):
    for e in hx.events(a.id):
        d = {k: v for k, v in e["data"].items() if k not in ("process", "report", "payload")}
        print(f"{e['seq']:4} {views.fmt_ts(e['ts'])} {e['actor']['kind']:6} {e['type']:14} "
              f"{e.get('ticket') or '':6} {json.dumps(d, default=str)[:110]}")


def c_answer(hx, a):
    hx.answer(a.qid, a.choice, a.text)
    print(f"answered {a.qid}")


def c_approve(hx, a):
    hx.approve(a.id, a.text)
    print(f"approved {a.id}")


def c_changes(hx, a):
    hx.request_changes(a.id, a.text)
    print(f"requested changes on {a.id}")


def c_simple(name):
    def run(hx, a):
        fn = getattr(hx, name)
        if name in ("pause", "resume"):
            fn(a.id)
        elif name == "revoke":
            fn(a.id, a.reason or "reassigned by owner")
        elif name == "override":
            fn(a.id, a.reason, a.outcome)
        else:
            fn(a.id)
        print(f"{name} {a.id or 'all'}")
    return run


def c_edit(hx, a):
    fields = {}
    for k in ("title", "body", "risk", "test_cmd", "ci_cmd"):
        if getattr(a, k) is not None:
            fields[k] = getattr(a, k)
    if a.priority is not None:
        fields["priority"] = a.priority
    if a.scope is not None:
        fields["scope"] = csv(a.scope)
    if a.criteria:
        fields["criteria"] = a.criteria
    hx.edit(a.id, **fields)
    print(f"edited {a.id}")


def c_tick(hx, a):
    while True:
        acts = hx.tick(dispatch=a.dispatch, land=not a.no_land)
        for x in acts:
            print(x)
        if not a.loop:
            break
        time.sleep(a.loop)


def c_digest(hx, a):
    print(hx.digest(a.since or 0))


def c_serve(hx, a):
    from .server import serve
    serve(hx, a.host, a.port, tick=a.tick, dispatch=a.dispatch)


def c_hook(hx, a):
    from .hooks import run_hook
    sys.exit(run_hook(a.event))


def c_mcp(hx, a):
    from .mcp import serve_stdio
    serve_stdio()


def build_parser():
    p = argparse.ArgumentParser(prog="hx", description="harness for long, gated, multi-agent work")
    sub = p.add_subparsers(dest="cmd", required=True)

    def add(name, fn, help_=""):
        sp = sub.add_parser(name, help=help_)
        sp.set_defaults(fn=fn)
        sp.add_argument("--json", action="store_true", help=argparse.SUPPRESS)
        sp.add_argument("--session", help=argparse.SUPPRESS)
        return sp

    t = sub.add_parser("ticket", help="ticket admin").add_subparsers(dest="tcmd", required=True)
    ta = t.add_parser("add")
    ta.set_defaults(fn=c_ticket_add)
    ta.add_argument("id")
    ta.add_argument("--title")
    ta.add_argument("--body")
    ta.add_argument("--criteria", action="append")
    ta.add_argument("--process", default="feature")
    ta.add_argument("--risk", default="low")
    ta.add_argument("--priority", type=int, default=3)
    ta.add_argument("--deps")
    ta.add_argument("--scope")
    ta.add_argument("--group")
    ta.add_argument("--test-cmd")
    ta.add_argument("--ci-cmd")
    add("import", c_import, "import a group/tickets JSON").add_argument("file")
    s = add("claim", c_claim, "take the next ready step (or --ticket)")
    s.add_argument("--ticket")
    s.add_argument("--role", default="worker", choices=["worker", "reviewer"])
    add("brief", c_brief, "print the brief for your lease").add_argument("--ticket")
    add("heartbeat", c_heartbeat)
    s = add("checkpoint", c_checkpoint, "record what is done and what is next")
    s.add_argument("text", nargs="?")
    s.add_argument("--done")
    s.add_argument("--next")
    s.add_argument("--risks")
    s = add("submit", c_submit, "submit evidence (verified against the shared remote)")
    s.add_argument("kind", choices=["doc", "tests_red", "tests_green", "ci", "review", "retro"])
    s.add_argument("--sha")
    s.add_argument("--path")
    s.add_argument("--tests")
    s.add_argument("--verdict", choices=["approve", "changes", "reject"])
    s.add_argument("--ac", action="append")
    s.add_argument("--finding", action="append")
    s.add_argument("--went-well", dest="went_well")
    s.add_argument("--went-badly", dest="went_badly")
    s.add_argument("--change")
    s = add("ask", c_ask, "ask the owner (blocking by default: releases your lease)")
    s.add_argument("text")
    s.add_argument("--options")
    s.add_argument("--default")
    s.add_argument("--deadline")
    s.add_argument("--summary")
    s.add_argument("--note")
    s.add_argument("--nonblocking", action="store_true")
    s = add("done", c_done, "ask the gate to pass your step")
    s.add_argument("--outcome")
    s.add_argument("--continue", dest="cont", action="store_true", help="claim the next worker step too")
    add("release", c_release, "hand the step over with a note").add_argument("--note")
    add("board", c_board, "all tickets with health")
    add("status", c_board)
    add("inbox", c_inbox, "decisions waiting for the owner")
    add("show", c_show).add_argument("id")
    add("log", c_log).add_argument("id", nargs="?")
    s = add("answer", c_answer, "owner: answer a question")
    s.add_argument("qid")
    s.add_argument("choice", nargs="?")
    s.add_argument("--text")
    s = add("approve", c_approve, "owner: approve the open approval for a ticket")
    s.add_argument("id")
    s.add_argument("--text")
    s = add("changes", c_changes, "owner: request changes")
    s.add_argument("id")
    s.add_argument("--text", required=True)
    for name in ("pause", "resume"):
        add(name, c_simple(name)).add_argument("id", nargs="?")
    add("cancel", c_simple("cancel")).add_argument("id")
    s = add("revoke", c_simple("revoke"), "owner: take the step away from its holder")
    s.add_argument("id")
    s.add_argument("--reason")
    s = add("override", c_simple("override"), "owner: pass the current step regardless of the gate")
    s.add_argument("id")
    s.add_argument("--reason", required=True)
    s.add_argument("--outcome")
    s = add("edit", c_edit, "owner: edit a ticket")
    s.add_argument("id")
    for k in ("title", "body", "risk", "scope"):
        s.add_argument("--" + k)
    s.add_argument("--test-cmd", dest="test_cmd")
    s.add_argument("--ci-cmd", dest="ci_cmd")
    s.add_argument("--priority", type=int)
    s.add_argument("--criteria", action="append")
    s = add("tick", c_tick, "run the clock once (expire, nudge, land, dispatch, notify)")
    s.add_argument("--dispatch", action="store_true")
    s.add_argument("--no-land", action="store_true")
    s.add_argument("--loop", type=int, default=0)
    add("digest", c_digest).add_argument("--since", type=int)
    s = add("serve", c_serve, "owner UI + API + clock")
    s.add_argument("--host", default="127.0.0.1")
    s.add_argument("--port", type=int, default=8765)
    s.add_argument("--tick", type=int, default=60)
    s.add_argument("--dispatch", action="store_true")
    add("hook", c_hook, "Claude Code hook entry point").add_argument(
        "event", choices=["session-start", "prompt", "pre-tool", "post-tool", "pre-compact", "stop",
                          "session-end"])
    add("mcp", c_mcp, "serve the agent commands as MCP tools over stdio")
    return p


def main(argv=None):
    args = build_parser().parse_args(argv)
    if args.cmd == "hook":  # hooks build their own Hx and must never crash the agent
        return c_hook(None, args)
    hx = make_hx()
    try:
        args.fn(hx, args)
    except Rejected as r:
        print(f"hx: REJECTED ({r.code}): {r.message}", file=sys.stderr)
        if r.report:
            for c in r.report:
                mark = {"ok": "[x]", "missing": "[ ]", "owner": "[~]"}[c["status"]]
                print(f"  {mark} {c['check']}: {c['msg']}", file=sys.stderr)
        sys.exit(3 if r.code in ("lease_lost", "paused") else 2)


if __name__ == "__main__":
    main()
