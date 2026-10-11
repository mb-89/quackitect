#!/usr/bin/env python3
"""Screen tasks the way SWE-bench Verified screened its issues (OpenAI, 2024): a reader who sees
the ask, the interface note, the hidden tests and the reference change rates

  spec   0 the ask says what to do; 1 it has blanks a sensible reading fills; 2 it is vague,
         several readings stand and the tests pick one; 3 the tests cannot be passed from the ask
  tests  0 the hidden tests check what the ask asks; 1 they also check a detail the ask leaves
         open but most solutions would match; 2 they check wording, names or behaviour the ask
         never states; 3 they check something else entirely

A task is "verified" at spec <= 1 and tests <= 1. The reader is a model (one call per task,
no tools), and every call lands in the cost log. The screen only labels tasks; the report
gives every number on all tasks and on the verified ones.

  python3 verify.py --repo <clone> --tasks tasks.jsonl --out verdicts.jsonl [--model opus]
"""
import argparse
import concurrent.futures as cf
import json
import os
import re
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arms  # noqa: E402
from benchlib import HERE, WORK, append_jsonl, git, now, read_jsonl  # noqa: E402

PROMPT = """You screen benchmark tasks for a coding-agent benchmark, as SWE-bench Verified did.
An agent gets ASK (and INTERFACE when present) and must change a Go repository so that hidden
tests pass. It never sees the hidden tests or the reference change. Judge whether that is fair.

Rate two things, each 0-3:
spec: 0 = the ask clearly says what to do; 1 = some blanks, but a sensible reading fills them and
passes the tests; 2 = vague: several readings stand and the tests pick one of them; 3 = the tests
cannot reasonably be passed from the ask.
tests: 0 = the hidden tests check what the ask asks; 1 = they also check a detail the ask leaves
open, which most correct solutions would still match; 2 = they check exact wording, names or
behaviour the ask never states, so many correct solutions fail; 3 = they check something else.

Answer with one JSON object and nothing else:
{{"spec": <0-3>, "tests": <0-3>, "reason": "<two sentences>"}}

=== ASK ===
{ask}

=== INTERFACE ===
{note}

=== HIDDEN TESTS (diff base -> reference, test files only) ===
{tests}

=== FAIL_TO_PASS tests (these must pass) ===
{f2p}

=== REFERENCE CHANGE (non-test code, diff) ===
{code}
"""


def clip(s, n):
    return s if len(s) <= n else s[:n] + f"\n... [{len(s) - n} more characters cut]"


def judge(repo, task, model):
    tests = git(repo, "diff", task["base"], task["solution"], "--", *task["test_files"], check=False).stdout
    code = git(repo, "diff", task["base"], task["solution"], "--", *task["code_files"], check=False).stdout
    f2p = task["f2p"]
    f2p_txt = "\n".join(f2p[:40]) + (f"\n... and {len(f2p) - 40} more (the package did not build before)" if len(f2p) > 40 else "")
    prompt = PROMPT.format(ask=arms.clean_ask(task["ask"]), note=task.get("interface_note") or "(none)",
                           tests=clip(tests, 30000), f2p=f2p_txt, code=clip(code, 20000))
    wd = tempfile.mkdtemp(prefix="judge-", dir=os.path.join(WORK, "tmp"))
    os.makedirs(os.path.join(wd, "cfg"))
    arms.write_home(wd)
    env = arms.agent_env(wd, arms.MODELS.get(model, model))
    args = [arms.CLAUDE, "-p", "--model", arms.MODELS.get(model, model), "--output-format", "json",
            "--tools", "", "--setting-sources", "user", "--max-turns", "2"]
    r = subprocess.run(args + [prompt], cwd=wd, env=env, capture_output=True, text=True, timeout=900,
                       stdin=subprocess.DEVNULL)
    try:
        j = json.loads(r.stdout)
    except ValueError:
        return {"ticket": task["ticket"], "error": (r.stdout + r.stderr)[-500:]}
    text = j.get("result") or ""
    m = re.search(r"\{.*\}", text, re.S)
    v = {}
    if m:
        try:
            v = json.loads(m.group(0))
        except ValueError:
            v = {}
    cost = j.get("total_cost_usd") or 0.0
    append_jsonl(os.path.join(HERE, "costlog.jsonl"), {
        "when": now(), "batch": "verify", "run": task["ticket"], "arm": "judge",
        "model": arms.MODELS.get(model, model), "cost_usd": cost, "estimated": False})
    return {"ticket": task["ticket"], "spec": v.get("spec"), "tests": v.get("tests"),
            "reason": v.get("reason", text[:400]), "cost": cost, "model": model,
            "verified": v.get("spec") is not None and v.get("spec") <= 1 and v.get("tests") <= 1}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    ap.add_argument("--tasks", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="opus")
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    os.makedirs(os.path.join(WORK, "tmp"), exist_ok=True)
    done = {r["ticket"] for r in read_jsonl(a.out) if r.get("spec") is not None}
    tasks = [t for t in read_jsonl(a.tasks) if t["ticket"] not in done and not t.get("excluded")]
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        for r in ex.map(lambda t: judge(a.repo, t, a.model), tasks):
            append_jsonl(a.out, r)
            print(f"{r['ticket']:50s} spec={r.get('spec')} tests={r.get('tests')} verified={r.get('verified')} "
                  f"${r.get('cost', 0):.3f} {r.get('reason', r.get('error', ''))[:160]}", flush=True)


if __name__ == "__main__":
    main()
