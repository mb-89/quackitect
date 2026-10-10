"""The command line: serve, mint, status, the owner verbs, the demo, the simulation."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from .client import ApiError, Client
from .engine import Engine
from .repo import GitRepo
from .routes import load_dir

ROOT = Path(__file__).resolve().parent.parent


def routes_from(path: str | None):
    return load_dir(path or ROOT / "routes")


def cmd_serve(args) -> int:
    from .server import Service

    repo = GitRepo(args.repo) if args.repo else None
    eng = Engine(routes_from(args.routes), repo=repo, db=args.db)
    svc = Service(eng, args.host, args.port, args.tick).start()
    print(f"harness at {svc.url}  (owner page: {svc.url}/ )", flush=True)
    if args.worker == "claude":
        from .supervisor import Supervisor
        from .worker import ClaudeWorker

        if not args.repo:
            print("--worker claude needs --repo", file=sys.stderr)
            return 2
        worker = ClaudeWorker(svc.url, args.repo, args.workdir or (Path(args.repo).parent / "harness-work"),
                              model=args.model, max_turns=args.max_turns, log=lambda m: print(time.strftime("%H:%M:%S"), m, flush=True))
        sup = Supervisor(eng, worker, max_parallel=args.parallel, tick_seconds=args.tick,
                         log=lambda m: print(time.strftime("%H:%M:%S"), m, flush=True))
        try:
            sup.run(until_idle=args.until_idle)
        except KeyboardInterrupt:
            pass
        if args.until_idle:
            print("idle: nothing open or active", flush=True)
            for r in sup.results:
                print(json.dumps(r)[:400], flush=True)
            return 0
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        svc.stop()
    return 0


def cmd_mint(args) -> int:
    body = {"id": args.id, "goal": args.goal, "route": args.route, "group": args.group, "branch": args.branch}
    if args.test_cmd:
        body["test_cmd"] = args.test_cmd
    t = Client(args.url).post("/api/ticket", body)
    print(f"minted {t['id']} on route {t['route']}, step {t['step']}, state {t['state']}, branch {t['branch']}")
    return 0


def cmd_status(args) -> int:
    s = Client(args.url).get("/api/state")
    print(f"inbox: {len(s['inbox'])} waiting on you")
    for c in s["inbox"]:
        print(f"  {c['ticket']} · {c['step']} · {c['reason']}: {c['detail'][:100]}  [{' / '.join(c['actions'])}]")
    print("board:")
    for r in s["board"]:
        who = f" · {r['holder']} lease {r['lease_left']}s silent {r['silent_for']}s" if r["holder"] else ""
        print(f"  {r['ticket']:<14} {r['state']:<7} {r['step']:<10} tries {r['attempts']:<4} fails {r['fails']} stalls {r['stalls']}{who}")
    return 0


def cmd_owner(args) -> int:
    body = {}
    if args.verb == "decide":
        body = {"verdict": args.arg, "note": args.note or ""}
    elif args.verb in ("note", "answer"):
        body = {"text": args.arg}
    elif args.verb == "retry":
        body = {"note": args.arg or ""}
    t = Client(args.url).post(f"/api/ticket/{args.ticket}/{args.verb}", body)
    print(f"{t['id']}: step {t['step']}, state {t['state']}" + (f", held for {t['held_for']}" if t.get("held_for") else ""))
    return 0


def cmd_timeline(args) -> int:
    d = Client(args.url).get(f"/api/ticket/{args.ticket}")
    for e in d["events"]:
        print(f"{time.strftime('%H:%M:%S', time.localtime(e['ts']))} {e['kind']:<20} {json.dumps(e['body'])[:120]}")
    return 0


# ------------------------------------------------------------------ the scripted demo

class _Clock:
    def __init__(self):
        self.t = time.time()

    def __call__(self):
        return self.t


def cmd_demo(args) -> int:
    """The default route end to end on a toy repository, with a scripted worker and an owner."""
    say = lambda *a: print(*a, flush=True)
    d = Path(tempfile.mkdtemp(prefix="harness-demo-"))
    gid = ["-c", "user.name=toy", "-c", "user.email=toy@localhost"]

    def git(*a):
        return subprocess.run(["git", *gid, *a], cwd=str(d), check=True, capture_output=True, text=True).stdout.strip()

    def commit(files: dict, msg: str) -> str:
        for p, text in files.items():
            (d / p).parent.mkdir(parents=True, exist_ok=True)
            (d / p).write_text(text)
        git("add", "-A")
        git("commit", "-q", "-m", msg)
        return git("rev-parse", "HEAD")

    git("init", "-q", "-b", "main")
    commit({"README.md": "toy\n"}, "init")
    git("checkout", "-q", "-b", "ticket/fizz")
    clock = _Clock()
    eng = Engine(routes_from(args.routes), repo=GitRepo(d), clock=clock)
    eng.mint("fizz", "fizz(n): 'Fizz' on multiples of 3, 'Buzz' on multiples of 5, 'FizzBuzz' on both, else str(n)", "default")
    say(f"$ harness mint fizz --route default\nminted fizz on branch ticket/fizz, step draft\n")

    def attempt(worker, do):
        c = eng.claim("fizz", worker=worker)
        say(f"--- attempt {c['attempt']} ({worker}) takes step {c['step']}")
        first = c["briefing"].splitlines()[0]
        say(f"    briefing: {first}")
        h = [l for l in c["briefing"].splitlines() if l.startswith("- done:") or l.startswith("- remaining:")]
        for l in h[:2]:
            say(f"    handover {l[2:90]}")
        r = do(c)
        if r is not None:
            say(f"    gate {eng.ticket('fizz')['route']}/{c['step']}: {r['verdict']} -> {r['next_step']}")
            say(f"      {r['detail'].splitlines()[0][:110]}")
        return c

    ev = lambda c, kind, body: eng.evidence(c["attempt"], c["token"], kind, body)
    done = lambda c: eng.done(c["attempt"], c["token"])

    attempt("agent", lambda c: (ev(c, "plan", {"criteria": ["fizz(3)=='Fizz'", "fizz(5)=='Buzz'", "fizz(15)=='FizzBuzz'"], "tests": ["test_3", "test_5", "test_15"], "files": ["fizz.py", "tests/test_fizz.py"]}), done(c))[1])
    attempt("agent", lambda c: (ev(c, "design", {"files": ["fizz.py"], "interfaces": ["def fizz(n: int) -> str"]}), done(c))[1])
    test_src = ("import unittest\nfrom fizz import fizz\n\nclass T(unittest.TestCase):\n"
                "    def test_3(self): self.assertEqual(fizz(3), 'Fizz')\n"
                "    def test_5(self): self.assertEqual(fizz(5), 'Buzz')\n"
                "    def test_15(self): self.assertEqual(fizz(15), 'FizzBuzz')\n")
    attempt("agent", lambda c: (ev(c, "commit", {"sha": commit({"tests/__init__.py": "", "tests/test_fizz.py": test_src}, "tests")}), done(c))[1])

    say("\n# a wrong implementation claims done")
    attempt("agent", lambda c: (ev(c, "commit", {"sha": commit({"fizz.py": "def fizz(n):\n    return 'Fizz' if n % 3 == 0 else 'Buzz' if n % 5 == 0 else str(n)\n"}, "wrong")}), done(c))[1])

    say("\n# the next attempt crashes with no handover; its lease expires")

    def crash(c):
        commit({"fizz.py": "def fizz(n):\n    if n % 15 == 0:\n        return 'FizzBuzz'\n    return 'Fizz' if n % 3 == 0 else 'Buzz' if n % 5 == 0 else str(n)\n"}, "half")
        clock.t += 1801
        out = eng.tick()
        say(f"    tick: expired attempts {out['expired']}; the harness synthesised a handover")
        return None

    attempt("agent", crash)

    say("\n# the next attempt reads the synthesised handover, sees the commit on the branch, and files it")
    attempt("agent", lambda c: (ev(c, "commit", {"sha": git("rev-parse", "HEAD")}), done(c))[1])

    say("\n# a fresh reviewer sends it back once, then approves")
    attempt("reviewer", lambda c: (ev(c, "review", {"verdict": "request_changes", "findings": ["fizz(0) returns 'FizzBuzz'; the goal says str(n) for 0?"]}), done(c))[1])
    attempt("agent", lambda c: (ev(c, "note", {"text": "0 is a multiple of 15; FizzBuzz stands"}), ev(c, "commit", {"sha": commit({"fizz.py": (d / 'fizz.py').read_text() + "\n# 0 -> FizzBuzz by the goal's rule\n"}, "note")}), done(c))[2])
    attempt("reviewer", lambda c: (ev(c, "review", {"verdict": "approve", "findings": []}), done(c))[1])

    say("\n# the ticket waits in the owner's inbox")
    card = eng.inbox()[0]
    say(f"    [{card['ticket']} · {card['step']} · {card['reason']}] {card['goal'][:60]}")
    say(f"    review: {card['evidence']['review']} · last gate: {card['evidence']['last_gate']}")
    say(f"    files: {card['evidence'].get('files')}")
    say(f"    actions: {card['actions']}")
    say("$ harness decide fizz reject --note 'add a docstring'")
    eng.decide("fizz", "reject", note="add a docstring")
    say(f"    -> step {eng.ticket('fizz')['step']}, state {eng.ticket('fizz')['state']}")
    attempt("agent", lambda c: (ev(c, "commit", {"sha": commit({"fizz.py": '"""fizzbuzz."""\n' + (d / 'fizz.py').read_text()}, "docstring")}), done(c))[1])
    attempt("reviewer", lambda c: (ev(c, "review", {"verdict": "approve", "findings": []}), done(c))[1])
    say("$ harness decide fizz approve")
    eng.decide("fizz", "approve")
    say(f"    -> step {eng.ticket('fizz')['step']}, state {eng.ticket('fizz')['state']}")
    attempt("agent", lambda c: (ev(c, "retro", {"slow": ["one crash, one wrong first cut"], "change": ["name the 0 case in the ask"]}), done(c))[1])
    t = eng.ticket("fizz")
    say(f"\nticket fizz: state {t['state']}, stalls {t['stalls']}, attempts {len(eng.timeline('fizz')['attempts'])}, gates {len(eng.timeline('fizz')['gates'])}")
    if not args.keep:
        shutil.rmtree(d, ignore_errors=True)
    else:
        say(f"toy repository kept at {d}")
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="harness")
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("serve", help="run the service, and a supervisor with Claude Code workers if asked")
    s.add_argument("--repo", help="path of the git repository the tickets work in")
    s.add_argument("--db", default="harness.db")
    s.add_argument("--routes")
    s.add_argument("--host", default="127.0.0.1")
    s.add_argument("--port", type=int, default=8787)
    s.add_argument("--tick", type=float, default=2.0)
    s.add_argument("--worker", choices=["none", "claude"], default="none")
    s.add_argument("--workdir")
    s.add_argument("--model")
    s.add_argument("--max-turns", type=int, default=40)
    s.add_argument("--parallel", type=int, default=1)
    s.add_argument("--until-idle", action="store_true", help="exit when nothing is open or active")
    s.set_defaults(fn=cmd_serve)

    m = sub.add_parser("mint", help="mint a ticket on the running service")
    m.add_argument("id")
    m.add_argument("goal")
    m.add_argument("--route", default="default")
    m.add_argument("--group")
    m.add_argument("--branch")
    m.add_argument("--test-cmd")
    m.add_argument("--url", default=None)
    m.set_defaults(fn=cmd_mint)

    st = sub.add_parser("status", help="the inbox and the board")
    st.add_argument("--url", default=None)
    st.set_defaults(fn=cmd_status)

    tl = sub.add_parser("timeline", help="a ticket's events")
    tl.add_argument("ticket")
    tl.add_argument("--url", default=None)
    tl.set_defaults(fn=cmd_timeline)

    for verb, help_ in (("decide", "approve or reject a human gate"), ("note", "leave a note for the next attempt"),
                        ("answer", "answer a question an attempt asked"), ("retry", "reopen a stuck ticket"),
                        ("pause", "pause a ticket"), ("resume", "resume a paused ticket")):
        o = sub.add_parser(verb, help=help_)
        o.add_argument("ticket")
        if verb in ("decide", "note", "answer"):
            o.add_argument("arg")
        elif verb == "retry":
            o.add_argument("arg", nargs="?", default="")
        else:
            o.set_defaults(arg=None)
        o.add_argument("--note", default=None)
        o.add_argument("--url", default=None)
        o.set_defaults(fn=cmd_owner, verb=verb)

    dm = sub.add_parser("demo", help="the default route end to end on a toy repository, scripted")
    dm.add_argument("--routes")
    dm.add_argument("--keep", action="store_true")
    dm.set_defaults(fn=cmd_demo)

    sm = sub.add_parser("sim", help="the simulation: harness mechanics against a lone agent", add_help=False)
    sm.set_defaults(fn=None)

    if argv is None:
        argv = sys.argv[1:]
    if argv and argv[0] == "sim":
        from .sim import main as sim_main
        return sim_main(argv[1:])
    args = ap.parse_args(argv)
    try:
        return args.fn(args)
    except ApiError as e:
        print(f"{e.code}: {e.message}", file=sys.stderr)
        return 1
