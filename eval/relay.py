"""The relay experiment: one task, worked by a chain of short sessions.

Each session gets a small turn budget, so no single session can finish the
task alone; the work only finishes if what one session leaves behind lets the
next one carry on. That is the condition the harness is built for: context
resets, crashes and handovers, compressed into a few minutes.

  solo   every session gets the task text and the repo as the last session
         left it. It is told it may be one of several, and to commit.
  baton  every session gets the baton hooks and tools; the card carries the
         task, the step, the gates and the last baton. Review sessions run
         as a different actor.

usage: python relay.py --task dur --cond baton --model M --out DIR
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

from baton.cli import install  # noqa: E402
from baton.engine import Engine  # noqa: E402
from baton.store import Store  # noqa: E402
from eval.score import count_tests, score  # noqa: E402

TEST_CMD = "python -m unittest discover -s tests -t . -q"
TOOLS = "Bash,Edit,Write,Read,Glob,Grep,MultiEdit"

SOLO_PROMPT = """{ask}

Work in this repository until the task is complete. Run the tests with
`{test}`. Commit your work with git as you go.

You may be one of several sessions working on this task one after another,
each with a small turn budget; an earlier session may have left work in this
repository. When the whole task is complete and tested, end your reply with
the line TASK COMPLETE."""

# The control for lite's stopping rule: solo, told exactly when to stop.
SOLO_STOP_PROMPT = SOLO_PROMPT.replace(
    "When the whole task is complete and tested, end your reply with\nthe line TASK COMPLETE.",
    "Stop rule: as soon as tests under tests/ cover every numbered rule and all\n"
    "pass, commit, and end your reply with the line TASK COMPLETE. Do not\n"
    "refactor or polish working code. Commit before every risky change.")
assert SOLO_STOP_PROMPT != SOLO_PROMPT

BATON_PROMPT = """You work through the baton harness. Your card was given to
you at session start; call the mcp__baton__card tool if you cannot see it.
Do the step on the card, commit, and claim it with mcp__baton__done. Keep
going step after step until the harness tells you the step belongs to someone
else or the work is done. Run the tests with `{test}`. You have a small turn
budget: if you are about to run out, call mcp__baton__handoff with a baton."""


def sh(cwd, *cmd):
    subprocess.run(cmd, cwd=cwd, check=True, capture_output=True)


def make_repo(out):
    repo = os.path.join(out, "repo")
    os.makedirs(os.path.join(repo, "tests"))
    open(os.path.join(repo, "tests", "__init__.py"), "w").close()
    with open(os.path.join(repo, ".gitignore"), "w") as f:
        f.write("__pycache__/\n")
    sh(repo, "git", "init", "-q")
    sh(repo, "git", "config", "user.email", "agent@example.invalid")
    sh(repo, "git", "config", "user.name", "agent")
    sh(repo, "git", "add", "-A")
    sh(repo, "git", "commit", "-qm", "empty project")
    return repo


def claude(repo, prompt, model, max_turns, extra=()):
    tools = TOOLS
    extra = list(extra)
    if "--allowedTools" in extra:
        i = extra.index("--allowedTools")
        tools += "," + extra[i + 1]
        del extra[i:i + 2]
    cmd = ["claude", "-p", prompt, "--output-format", "json", "--model", model,
           "--max-turns", str(max_turns), "--permission-mode", "acceptEdits",
           "--allowedTools", tools, *extra]
    t = time.time()
    r = subprocess.run(cmd, cwd=repo, capture_output=True, text=True, timeout=1800,
                       stdin=subprocess.DEVNULL)
    try:
        j = json.loads(r.stdout)
    except Exception:
        j = {"subtype": "crash", "result": (r.stdout + r.stderr)[-500:]}
    return {"subtype": j.get("subtype"), "turns": j.get("num_turns"),
            "cost": j.get("total_cost_usd") or 0.0, "secs": round(time.time() - t, 1),
            "result": (j.get("result") or "")[-400:]}


def run_solo(task, repo, a):
    ask = open(os.path.join(HERE, "tasks", task, "ask.md")).read()
    prompt = SOLO_STOP_PROMPT if a.cond == "solostop" else SOLO_PROMPT
    sessions = []
    claimed = False
    for _ in range(a.max_sessions):
        s = claude(repo, prompt.format(ask=ask, test=TEST_CMD), a.model, a.max_turns)
        sessions.append(s)
        if "TASK COMPLETE" in s["result"]:
            claimed = True
            break
    return sessions, claimed, {}


def run_baton(task, repo, a, out, route="relay"):
    ask = open(os.path.join(HERE, "tasks", task, "ask.md")).read()
    db = os.path.join(out, "baton.db")
    settings = {"lease_ttl": 7200, "max_expiries": 99, "max_bounces": 3}
    os.environ["BATON_SETTINGS"] = json.dumps(settings)
    eng = Engine(Store(db), settings)
    wid = eng.create(task, ask, route=route, repo=repo, test_cmd=TEST_CMD,
                     ci_mode="local")
    sessions = []
    for n in range(1, a.max_sessions + 1):
        w = eng.get(wid)
        if w.done or w.needs_owner():
            break  # no owner sits in this loop: a question ends the chain
        actor = f"{w.cur['owner']}:s{n}"
        flags = install(repo, actor, db, wid)
        s = claude(repo, BATON_PROMPT.format(test=TEST_CMD), a.model, a.max_turns, flags)
        s["actor"], s["step_before"] = actor, w.step_name
        w = eng.get(wid)
        s["step_after"] = w.step_name
        if w.lease == actor:  # the supervisor's job: a session that ended holding a lease
            eng.s.append(wid, "baton", "lease.expired", {"holder": actor, "step": w.step_name})
        sessions.append(s)
    w = eng.get(wid)
    kinds = [e["kind"] for e in eng.s.events(wid)]
    info = {"step": w.step_name, "bounces": w.bounces, "escalation": w.escalation,
            "owner_needed": w.needs_owner() and not w.done,
            "question": (w.question or {}).get("text", "")[:300],
            "failed_claims": kinds.count("claim.failed"),
            "reopens": sum(1 for e in eng.s.events(wid)
                           if e["kind"] == "bounce" and e["data"].get("reopen"))}
    return sessions, w.done, info


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--task", required=True)
    p.add_argument("--cond", choices=["solo", "solostop", "baton", "lite", "baton4", "lite4"], required=True)
    p.add_argument("--model", default="claude-haiku-5-5")
    p.add_argument("--max-turns", type=int, default=8)
    p.add_argument("--max-sessions", type=int, default=10)
    p.add_argument("--out", required=True)
    a = p.parse_args()
    out = os.path.abspath(a.out)
    if os.path.exists(out):
        shutil.rmtree(out)
    os.makedirs(out)
    repo = make_repo(out)
    t = time.time()
    if a.cond in ("solo", "solostop"):
        sessions, claimed, info = run_solo(a.task, repo, a)
    else:
        route = {"baton": "relay", "lite": "lite", "baton4": "relay4", "lite4": "lite4"}[a.cond]
        sessions, claimed, info = run_baton(a.task, repo, a, out, route)
    hidden = os.path.join(HERE, "tasks", a.task, "hidden.py")
    sc = score(repo, hidden, count_tests(hidden))
    res = {"task": a.task, "cond": a.cond, "model": a.model, "max_turns": a.max_turns,
           "sessions": len(sessions), "claimed_done": claimed,
           "hidden_passed": sc["passed"], "hidden_total": sc["total"],
           "cost": round(sum(s["cost"] for s in sessions), 3),
           "secs": round(time.time() - t), "info": info, "per_session": sessions}
    with open(os.path.join(out, "result.json"), "w") as f:
        json.dump(res, f, indent=2)
    print(json.dumps({k: v for k, v in res.items() if k != "per_session"}))


if __name__ == "__main__":
    main()
