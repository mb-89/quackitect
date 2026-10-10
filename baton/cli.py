"""The command line: the owner's desk verbs, the agent verbs for a manual
run, and the entry points for the MCP server, the hooks and the web page."""

import argparse
import json
import os
import sys
import time

from .card import ago, render, route_line
from .config import actor as env_actor, db_path, open_engine
from .engine import BatonError


def print_inbox(eng):
    box = eng.inbox()
    print(f"NEEDS YOU ({len(box['needs'])})")
    for i in box["needs"]:
        print(f"  {i['id']} [{i['kind']}] {i['title']} @ {i['step']} {i['pos']}")
        print(f"      {i['text'][:300]}")
        if i.get("options"):
            print(f"      options: {' | '.join(i['options'])}")
    print(f"MOVING ({len(box['moving'])})")
    for i in box["moving"]:
        print(f"  {i['id']} {i['health']:7} {i['title']} @ {i['step']} {i['pos']}"
              f"  {i['baton'][:70]}")
    print(f"DONE ({len(box['done'])})")
    for i in box["done"]:
        print(f"  {i['id']} {i['title']}")


def print_work(eng, wid):
    w = eng.get(wid)
    now = eng.now
    print(f"{w.id} {w.title} [{w.status}] group={w.group or '-'} branch={w.branch}")
    print("route: " + route_line(w))
    print(f"baton: {w.baton or '-'}")
    for e in w.log[-25:]:
        print(f"  {ago(now, e['ts']):>10}  {e['actor']:<14} {e['kind']:<14} {e['text']}")


def said(wid, res):
    """One line the owner reads, for the result of an owner verb."""
    if res.get("closed"):
        nxt = res.get("next")
        tail = f"next: {nxt} ({res.get('next_owner')})" if res.get("next_owner") else "done"
        return f"{wid}: {res['closed']} closed; {tail}"
    if res.get("pending"):
        return f"{wid}: recorded; waiting on {'; '.join(res['pending'])}"
    if res.get("bounced_to"):
        return f"{wid}: sent back to {res['bounced_to']}: {'; '.join(res['findings'])}"
    if res.get("failures"):
        return f"{wid}: refused: {'; '.join(res['failures'])}"
    return f"{wid}: ok"


def _kv(pairs):
    out = {}
    for p in pairs or []:
        k, _, v = p.partition("=")
        if v.startswith("@"):
            v = open(v[1:]).read()
        out[k] = v
    return out


def install(workspace, actor, db, work=None):
    """Write the MCP config and hook settings for a Claude Code session,
    outside the repo's tracked files, and print the flags that load them."""
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env = {"BATON_DB": os.path.abspath(db), "BATON_ACTOR": actor, "PYTHONPATH": here}
    if work:
        env["BATON_WORK"] = work
    if os.environ.get("BATON_SETTINGS"):
        env["BATON_SETTINGS"] = os.environ["BATON_SETTINGS"]
    prefix = " ".join(f"{k}='{v}'" for k, v in env.items())
    py = sys.executable

    def hook(ev):
        return [{"hooks": [{"type": "command", "command": f"{prefix} {py} -m baton hook {ev}"}]}]

    d = os.path.join(os.path.dirname(os.path.abspath(db)), "agents", actor.replace(":", "-"))
    os.makedirs(d, exist_ok=True)
    mcp = {"mcpServers": {"baton": {"command": py, "args": ["-m", "baton", "mcp"], "env": env}}}
    settings = {"hooks": {"SessionStart": hook("session-start"),
                          "PostToolUse": hook("post-tool-use"),
                          "Stop": hook("stop")}}
    with open(os.path.join(d, "mcp.json"), "w") as f:
        json.dump(mcp, f, indent=2)
    with open(os.path.join(d, "settings.json"), "w") as f:
        json.dump(settings, f, indent=2)
    return ["--mcp-config", os.path.join(d, "mcp.json"),
            "--settings", os.path.join(d, "settings.json"),
            "--allowedTools", "mcp__baton__*"]


def main(argv=None):
    p = argparse.ArgumentParser(prog="baton")
    p.add_argument("--db", default=None)
    p.add_argument("--as", dest="actor", default=None)
    sub = p.add_subparsers(dest="cmd", required=True)
    n = sub.add_parser("new")
    n.add_argument("title")
    n.add_argument("--ask", required=True)
    n.add_argument("--group", default="")
    n.add_argument("--route", default="standard")
    n.add_argument("--repo")
    n.add_argument("--test", default="python -m unittest discover -s tests -t . -q")
    n.add_argument("--tests", default="tests/")
    n.add_argument("--ci", default="external", choices=["external", "local"])
    n.add_argument("--after", default="")
    sub.add_parser("inbox")
    s = sub.add_parser("show")
    s.add_argument("work")
    for verb in ("approve", "reject", "answer", "note", "resume"):
        v = sub.add_parser(verb)
        v.add_argument("work")
        v.add_argument("text", nargs="?", default="")
    v = sub.add_parser("pause")
    v.add_argument("work")
    v = sub.add_parser("prio")
    v.add_argument("work")
    v.add_argument("prio", type=int)
    c = sub.add_parser("ci")
    c.add_argument("work")
    c.add_argument("sha")
    c.add_argument("result", choices=["pass", "fail"])
    t = sub.add_parser("tick")
    t.add_argument("--every", type=float, default=0)
    w = sub.add_parser("serve")
    w.add_argument("--port", type=int, default=8077)
    w.add_argument("--host", default="127.0.0.1")
    # agent verbs, for a manual run
    sub.add_parser("take")
    sub.add_parser("card")
    d = sub.add_parser("done")
    d.add_argument("--evidence", "-e", action="append")
    d.add_argument("--baton", "-b", default="")
    a = sub.add_parser("ask")
    a.add_argument("question")
    a.add_argument("--option", "-o", action="append")
    h = sub.add_parser("handoff")
    h.add_argument("baton")
    r = sub.add_parser("verdict")
    r.add_argument("decision", choices=["approve", "reject"])
    r.add_argument("--finding", "-f", action="append")
    r.add_argument("--baton", "-b", default="")
    sub.add_parser("mcp")
    k = sub.add_parser("hook")
    k.add_argument("event", choices=["session-start", "post-tool-use", "stop"])
    i = sub.add_parser("install")
    i.add_argument("workspace")
    i.add_argument("--work")
    args = p.parse_args(argv)

    if args.db:
        os.environ["BATON_DB"] = os.path.abspath(args.db)
    if args.actor:
        os.environ["BATON_ACTOR"] = args.actor
    actor = env_actor()
    if args.cmd == "mcp":
        from .mcp import serve
        return serve()
    if args.cmd == "hook":
        from .hooks import main as hook
        return hook(args.event)
    if args.cmd == "serve":
        from .web import serve
        return serve(args.host, args.port)
    eng = open_engine()
    try:
        if args.cmd == "new":
            print(eng.create(args.title, args.ask, group=args.group, route=args.route,
                             repo=os.path.abspath(args.repo) if args.repo else None,
                             test_cmd=args.test, test_paths=args.tests.split(","),
                             ci_mode=args.ci,
                             after=[x for x in args.after.split(",") if x]))
        elif args.cmd == "inbox":
            print_inbox(eng)
        elif args.cmd == "show":
            print_work(eng, args.work)
        elif args.cmd == "approve":
            print(said(args.work, eng.approve(args.work, args.text)))
        elif args.cmd == "reject":
            print(said(args.work, eng.reject(args.work, args.text)))
        elif args.cmd == "answer":
            print(said(args.work, eng.answer(args.work, args.text)))
        elif args.cmd == "note":
            eng.note(args.work, args.text)
        elif args.cmd == "resume":
            eng.resume(args.work, args.text)
        elif args.cmd == "pause":
            eng.pause(args.work)
        elif args.cmd == "prio":
            eng.prioritize(args.work, args.prio)
        elif args.cmd == "ci":
            print(said(args.work, eng.ci(args.work, args.sha, args.result == "pass")))
        elif args.cmd == "tick":
            while True:
                for e in eng.tick():
                    print(f"{e['work']} {e['kind']} {json.dumps(e['data'])}")
                if not args.every:
                    break
                time.sleep(args.every)
        elif args.cmd == "take":
            print(eng.take(actor) or "nothing to take")
        elif args.cmd == "card":
            print(render(eng.held(actor), actor, eng.now))
        elif args.cmd == "done":
            from .mcp import _after_claim
            print(_after_claim(eng, actor, eng.done(actor, _kv(args.evidence), args.baton)))
        elif args.cmd == "ask":
            print(eng.ask(actor, args.question, args.option)["note"])
        elif args.cmd == "handoff":
            eng.handoff(actor, args.baton)
        elif args.cmd == "verdict":
            from .mcp import _after_claim
            print(_after_claim(eng, actor, eng.verdict(
                actor, args.decision == "approve", args.finding or [], args.baton)))
        elif args.cmd == "install":
            print(" ".join(install(args.workspace, actor, db_path(), args.work)))
    except BatonError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(2)
