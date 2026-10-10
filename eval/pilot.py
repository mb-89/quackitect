#!/usr/bin/env python3
"""Real-model pilot: a single agent vs hx-0 (red -> green -> review -> accept -> land) on small
tickets scored by owner-held HIDDEN acceptance tests. Uses the real `claude` CLI in print mode with
a dollar cap per session.

    python3 eval/pilot.py hookcheck                     # one hx task, prints what the hooks did
    python3 eval/pilot.py ab --tasks duration,roman --model haiku
    python3 eval/pilot.py ab --max-turns 12 --solo-restarts 3   # interruption variant

Both conditions get the same ticket text and the same model. The single agent gets a strong prompt
(TDD, run the full suite, commit and push) and is scored generously (its working tree, even if
uncommitted). hx is scored on main if landed, else on its ticket branch. Raw session streams go to
eval/.runs/ (git-ignored); only summaries are written to eval/results/.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import textwrap
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
from hx import engine  # noqa: E402
from hx.store import FileStore  # noqa: E402

HX = os.path.join(ROOT, "bin", "hx")
RUNS = os.path.join(ROOT, "eval", ".runs")
SKILL = open(os.path.join(ROOT, "examples", "skill", "SKILL.md")).read().split("---", 2)[2]
STRIP_ENV = ("CLAUDE_CODE_SESSION_ID", "CLAUDE_CODE_REMOTE_SESSION_ID", "CLAUDE_CODE_MESSAGING_SOCKET",
             "CLAUDE_CODE_MESSAGING_TOKEN", "CLAUDE_CODE_CHILD_SESSION", "CLAUDE_PID", "CLAUDECODE")

SEED = {
    ".gitignore": ".hx/\n.claude/\n__pycache__/\n",
    "pkg/__init__.py": "",
    "tests/__init__.py": "",
    "tests/test_smoke.py": "import unittest\n\n\nclass Smoke(unittest.TestCase):\n    def test_ok(self):\n"
                           "        self.assertTrue(True)\n",
    "README.md": "# pkg\nSmall utilities. Run tests with `python3 -m unittest discover -s tests -t .`\n",
}

TASKS = {
    "duration": {
        "title": "parse_duration(text) -> seconds", "module": "pkg/duration.py", "test": "tests/test_duration.py",
        "body": "Parse human durations like '1h30m' into seconds. Implement parse_duration(text) in pkg/duration.py.",
        "criteria": ["single units: '90s' -> 90, '15m' -> 900, '2h' -> 7200, '1d' -> 86400",
                     "combined units in descending order: '1h30m' -> 5400, '1d2h3m4s' -> 93784",
                     "whitespace between parts is allowed: '1h 30m' -> 5400",
                     "invalid input raises ValueError: '', '5x', 'h', '1h1h' (repeated unit), "
                     "'30m1h' (units not in descending order)"],
        "hidden": '''
            import unittest
            from pkg.duration import parse_duration


            class Hidden(unittest.TestCase):
                def test_single(self):
                    for s, v in [("90s", 90), ("15m", 900), ("2h", 7200), ("1d", 86400), ("0s", 0)]:
                        self.assertEqual(parse_duration(s), v, s)

                def test_combined(self):
                    for s, v in [("1h30m", 5400), ("1d2h3m4s", 93784), ("2h5s", 7205)]:
                        self.assertEqual(parse_duration(s), v, s)

                def test_whitespace(self):
                    for s, v in [("1h 30m", 5400), ("1d 2h 3m 4s", 93784)]:
                        self.assertEqual(parse_duration(s), v, s)

                def test_invalid(self):
                    for s in ["", "5x", "h", "1h1h", "30m1h", "2m1d"]:
                        with self.assertRaises(ValueError, msg=s):
                            parse_duration(s)
            '''},
    "wrap": {
        "title": "wrap(text, width) -> list of lines", "module": "pkg/wrap.py", "test": "tests/test_wrap.py",
        "body": "Greedy word wrapping for terminal output. Implement wrap(text, width) in pkg/wrap.py, returning "
                "a list of lines.",
        "criteria": ["greedy: each line holds as many words as fit within width; words are joined by single spaces",
                     "a word longer than width is split into pieces of exactly width characters (the last piece "
                     "may be shorter)",
                     "blank lines in the input separate paragraphs and appear as '' in the output",
                     "width < 1 raises ValueError"],
        "hidden": '''
            import unittest
            from pkg.wrap import wrap


            class Hidden(unittest.TestCase):
                def test_greedy(self):
                    self.assertEqual(wrap("the quick brown fox", 10), ["the quick", "brown fox"])
                    self.assertEqual(wrap("a  b   c", 3), ["a b", "c"])

                def test_long_words(self):
                    self.assertEqual(wrap("abcdefghij", 4), ["abcd", "efgh", "ij"])
                    self.assertEqual(wrap("hi abcdefgh yo", 4), ["hi", "abcd", "efgh", "yo"])

                def test_paragraphs(self):
                    self.assertEqual(wrap("one two\\n\\nthree", 20), ["one two", "", "three"])

                def test_bad_width(self):
                    for w in (0, -1):
                        with self.assertRaises(ValueError):
                            wrap("x", w)
            '''},
    "roman": {
        "title": "to_roman(n) / from_roman(s)", "module": "pkg/roman.py", "test": "tests/test_roman.py",
        "body": "Roman numerals both ways. Implement to_roman(n) and from_roman(s) in pkg/roman.py.",
        "criteria": ["to_roman(n) returns canonical numerals for 1..3999 (subtractive forms: 4 IV, 9 IX, 40 XL, "
                     "90 XC, 400 CD, 900 CM)",
                     "from_roman(s) inverts to_roman for every n in 1..3999",
                     "from_roman rejects non-canonical or malformed numerals with ValueError, e.g. 'IIII', 'VX', "
                     "'IC', 'MMMM', '', 'ABC'",
                     "to_roman rejects n < 1 or n > 3999 with ValueError"],
        "hidden": '''
            import unittest
            from pkg.roman import from_roman, to_roman


            class Hidden(unittest.TestCase):
                def test_to_roman(self):
                    for n, s in [(1994, "MCMXCIV"), (3999, "MMMCMXCIX"), (4, "IV"), (40, "XL"), (900, "CM")]:
                        self.assertEqual(to_roman(n), s)

                def test_roundtrip(self):
                    for n in range(1, 4000):
                        self.assertEqual(from_roman(to_roman(n)), n)

                def test_rejects_noncanonical(self):
                    for s in ["IIII", "VX", "IC", "MMMM", "", "ABC", "IIV", "XM", "VV", "CCCC"]:
                        with self.assertRaises(ValueError, msg=s):
                            from_roman(s)

                def test_range(self):
                    for n in (0, -1, 4000):
                        with self.assertRaises(ValueError):
                            to_roman(n)
            '''},
    "intervals": {
        "title": "merge_intervals(intervals)", "module": "pkg/intervals.py", "test": "tests/test_intervals.py",
        "body": "Merge calendar busy-blocks. Implement merge_intervals(intervals) in pkg/intervals.py; intervals "
                "are (start, end) tuples.",
        "criteria": ["overlapping intervals merge: [(1, 3), (2, 5)] -> [(1, 5)]",
                     "touching intervals merge: [(1, 2), (2, 3)] -> [(1, 3)]",
                     "input order does not matter; output is sorted by start; contained intervals disappear",
                     "an interval with start > end raises ValueError; empty input returns []"],
        "hidden": '''
            import unittest
            from pkg.intervals import merge_intervals


            def m(x):
                return [tuple(i) for i in merge_intervals(x)]


            class Hidden(unittest.TestCase):
                def test_overlap_touch(self):
                    self.assertEqual(m([(1, 3), (2, 5)]), [(1, 5)])
                    self.assertEqual(m([(1, 2), (2, 3)]), [(1, 3)])
                    self.assertEqual(m([(3, 4), (1, 2), (2, 3)]), [(1, 4)])

                def test_order_and_containment(self):
                    self.assertEqual(m([(5, 6), (1, 2)]), [(1, 2), (5, 6)])
                    self.assertEqual(m([(1, 10), (2, 3), (4, 5)]), [(1, 10)])

                def test_edges(self):
                    self.assertEqual(m([]), [])
                    self.assertEqual(m([(1, 1)]), [(1, 1)])
                    for bad in ([(3, 1)], [(1, 2), (5, 4)]):
                        with self.assertRaises(ValueError):
                            merge_intervals(bad)
            '''},
}

HARD_TASKS = {
    "csv": {
        "title": "csv_split(line) -> fields", "module": "pkg/csvsplit.py", "test": "tests/test_csvsplit.py",
        "body": "Split one CSV line (RFC 4180 subset). Implement csv_split(line) in pkg/csvsplit.py; do not use the "
                "csv module.",
        "criteria": ["fields are separated by commas and empty fields are kept: 'a,,c' -> ['a', '', 'c'], "
                     "',' -> ['', '']",
                     "a field may be quoted with double quotes and then contain commas: '\"a,b\",c' -> ['a,b', 'c']",
                     "inside a quoted field two double quotes stand for one: '\"say \"\"hi\"\"\"' -> ['say \"hi\"']",
                     "malformed input raises ValueError: an unterminated quote ('\"abc') or text between a closing "
                     "quote and the next comma ('\"a\"b,c')"],
        "hidden": '''
            import unittest
            from pkg.csvsplit import csv_split


            class Hidden(unittest.TestCase):
                def test_plain(self):
                    self.assertEqual(csv_split("a,b,c"), ["a", "b", "c"])
                    self.assertEqual(csv_split("a,,c"), ["a", "", "c"])
                    self.assertEqual(csv_split(","), ["", ""])
                    self.assertEqual(csv_split("a,"), ["a", ""])

                def test_quoted(self):
                    self.assertEqual(csv_split('"a,b",c'), ["a,b", "c"])
                    self.assertEqual(csv_split('"",x'), ["", "x"])
                    self.assertEqual(csv_split('x,"y"'), ["x", "y"])

                def test_escaped_quotes(self):
                    self.assertEqual(csv_split('"say ""hi"""'), ['say "hi"'])
                    self.assertEqual(csv_split('""""'), ['"'])
                    self.assertEqual(csv_split('"a""b",c'), ['a"b', "c"])

                def test_malformed(self):
                    for s in ['"abc', '"a"b,c', 'a,"b', '"a""']:
                        with self.assertRaises(ValueError, msg=s):
                            csv_split(s)
            '''},
    "ttlcache": {
        "title": "TTLCache(capacity, ttl, clock)", "module": "pkg/ttlcache.py", "test": "tests/test_ttlcache.py",
        "body": "A small LRU cache with expiry. Implement class TTLCache(capacity, ttl, clock=time.monotonic) with "
                "get(key) and set(key, value) in pkg/ttlcache.py. clock() returns seconds.",
        "criteria": ["get(key) returns the value stored by set(key, value), or None if the key is missing",
                     "an entry expires ttl seconds after it was set: from clock() >= set_time + ttl, get returns None",
                     "when a set would exceed capacity, the least recently used entry is evicted; get and set both "
                     "count as use",
                     "setting an existing key replaces its value and restarts its ttl; capacity < 1 or ttl <= 0 "
                     "raise ValueError"],
        "hidden": '''
            import unittest
            from pkg.ttlcache import TTLCache


            class Clock:
                def __init__(self):
                    self.t = 0.0

                def __call__(self):
                    return self.t


            class Hidden(unittest.TestCase):
                def test_get_set(self):
                    c = TTLCache(2, 10, clock=Clock())
                    self.assertIsNone(c.get("a"))
                    c.set("a", 1)
                    self.assertEqual(c.get("a"), 1)

                def test_expiry_boundary(self):
                    clk = Clock()
                    c = TTLCache(2, 10, clock=clk)
                    c.set("a", 1)
                    clk.t = 9.999
                    self.assertEqual(c.get("a"), 1)
                    clk.t = 10.0
                    self.assertIsNone(c.get("a"))

                def test_lru(self):
                    c = TTLCache(2, 100, clock=Clock())
                    c.set("a", 1)
                    c.set("b", 2)
                    c.get("a")
                    c.set("c", 3)
                    self.assertIsNone(c.get("b"))
                    self.assertEqual(c.get("a"), 1)
                    self.assertEqual(c.get("c"), 3)

                def test_set_refreshes(self):
                    clk = Clock()
                    c = TTLCache(2, 10, clock=clk)
                    c.set("a", 1)
                    clk.t = 5
                    c.set("a", 2)
                    clk.t = 12
                    self.assertEqual(c.get("a"), 2)
                    clk.t = 15
                    self.assertIsNone(c.get("a"))

                def test_set_counts_as_use(self):
                    c = TTLCache(2, 100, clock=Clock())
                    c.set("a", 1)
                    c.set("b", 2)
                    c.set("a", 3)
                    c.set("c", 4)
                    self.assertIsNone(c.get("b"))
                    self.assertEqual(c.get("a"), 3)

                def test_invalid(self):
                    for cap, ttl in ((0, 1), (1, 0), (1, -1)):
                        with self.assertRaises(ValueError):
                            TTLCache(cap, ttl, clock=Clock())
            '''},
    "semver": {
        "title": "semver_compare(a, b)", "module": "pkg/semver.py", "test": "tests/test_semver.py",
        "body": "Compare versions by Semantic Versioning 2.0.0 precedence. Implement semver_compare(a, b) in "
                "pkg/semver.py returning a negative number, 0 or a positive number.",
        "criteria": ["MAJOR.MINOR.PATCH compare numerically: '1.10.0' > '1.9.0'",
                     "a pre-release has lower precedence than its release: '1.0.0-alpha' < '1.0.0'",
                     "pre-release identifiers compare left to right: numeric ones numerically, others in ASCII "
                     "order, numeric < non-numeric, and more identifiers win when all before are equal: "
                     "1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-alpha.beta < 1.0.0-beta < 1.0.0-beta.2 < 1.0.0-beta.11 "
                     "< 1.0.0-rc.1 < 1.0.0",
                     "build metadata (+...) is ignored; invalid versions raise ValueError: '1.0', '01.0.0' "
                     "(leading zero), '1.0.0-' (empty pre-release)"],
        "hidden": '''
            import unittest
            from pkg.semver import semver_compare as cmp


            class Hidden(unittest.TestCase):
                def test_core(self):
                    self.assertGreater(cmp("1.10.0", "1.9.0"), 0)
                    self.assertLess(cmp("1.9.9", "2.0.0"), 0)
                    self.assertEqual(cmp("1.2.3", "1.2.3"), 0)

                def test_prerelease_below_release(self):
                    self.assertLess(cmp("1.0.0-alpha", "1.0.0"), 0)
                    self.assertGreater(cmp("1.0.0", "1.0.0-rc.1"), 0)

                def test_spec_chain(self):
                    chain = ["1.0.0-alpha", "1.0.0-alpha.1", "1.0.0-alpha.beta", "1.0.0-beta", "1.0.0-beta.2",
                             "1.0.0-beta.11", "1.0.0-rc.1", "1.0.0"]
                    for a, b in zip(chain, chain[1:]):
                        self.assertLess(cmp(a, b), 0, (a, b))
                        self.assertGreater(cmp(b, a), 0, (b, a))

                def test_build_and_invalid(self):
                    self.assertEqual(cmp("1.0.0+build.1", "1.0.0+other"), 0)
                    self.assertLess(cmp("1.0.0-alpha+x", "1.0.0-alpha.1"), 0)
                    for bad in ("1.0", "01.0.0", "1.0.0-"):
                        with self.assertRaises(ValueError, msg=bad):
                            cmp(bad, "1.0.0")
            '''},
}
TASKS.update(HARD_TASKS)

SETTINGS = {"hooks": {
    "SessionStart": [{"hooks": [{"type": "command", "command": f"python3 {HX} hook session-start"}]}],
    "UserPromptSubmit": [{"hooks": [{"type": "command", "command": f"python3 {HX} hook prompt"}]}],
    "PreToolUse": [{"matcher": "Bash|Edit|Write|MultiEdit|NotebookEdit",
                    "hooks": [{"type": "command", "command": f"python3 {HX} hook pre-tool"}]}],
    "PostToolUse": [{"matcher": "*", "hooks": [{"type": "command", "command": f"python3 {HX} hook post-tool"}]}],
    "Stop": [{"hooks": [{"type": "command", "command": f"python3 {HX} hook stop"}]}],
    "SessionEnd": [{"hooks": [{"type": "command", "command": f"python3 {HX} hook session-end"}]}],
}}


def sh(args, cwd, env=None, check=True, input=None):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True, env=env, input=input)
    if check and r.returncode != 0:
        raise RuntimeError(f"{args}: {r.stdout}{r.stderr}")
    return r


def ticket_text(t):
    acs = "\n".join(f"AC{i}: {c}" for i, c in enumerate(t["criteria"], 1))
    return f"{t['title']}\n{t['body']}\nAcceptance criteria:\n{acs}\nTests go in {t['test']}."


def make_origin(base):
    seed = os.path.join(base, "seed")
    os.makedirs(seed)
    for p, c in SEED.items():
        os.makedirs(os.path.dirname(os.path.join(seed, p)) or seed, exist_ok=True)
        with open(os.path.join(seed, p), "w") as f:
            f.write(c)
    sh(["git", "init", "-q", "-b", "main"], seed)
    sh(["git", "add", "-A"], seed)
    sh(["git", "-c", "user.name=owner", "-c", "user.email=owner", "commit", "-q", "-m", "seed"], seed)
    origin = os.path.join(base, "origin.git")
    sh(["git", "clone", "-q", "--bare", seed, origin], base)
    return origin


def clone(origin, path, branch=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sh(["git", "clone", "-q", origin, path], os.path.dirname(path))
    sh(["git", "config", "user.name", "agent"], path)
    sh(["git", "config", "user.email", "agent"], path)
    if branch:
        if sh(["git", "ls-remote", "--heads", "origin", branch], path).stdout.strip():
            sh(["git", "checkout", "-q", "-b", branch, f"origin/{branch}"], path)
        else:
            sh(["git", "checkout", "-q", "-b", branch], path)
    return path


def claude_env(extra=None):
    env = {k: v for k, v in os.environ.items() if k not in STRIP_ENV and not k.startswith("HX_")}
    env["PATH"] = os.path.join(ROOT, "bin") + os.pathsep + env.get("PATH", "")
    env.update(extra or {})
    return env


def run_claude(cwd, prompt, env, model, budget, max_turns, log_path, system=None):
    args = ["claude", "-p", prompt, "--model", model, "--max-budget-usd", str(budget),
            "--setting-sources", "project", "--permission-mode", "acceptEdits",
            "--allowedTools", "Bash,Read,Edit,Write,Grep,Glob,MultiEdit",
            "--output-format", "stream-json", "--verbose"]
    if max_turns:
        args += ["--max-turns", str(max_turns)]
    if system:
        args += ["--append-system-prompt", system]
    t0 = time.time()
    r = subprocess.run(args, cwd=cwd, env=env, capture_output=True, text=True, timeout=1800)
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    with open(log_path, "w") as f:
        f.write(r.stdout)
        if r.stderr:
            f.write("\n#STDERR\n" + r.stderr)
    res = {"cost": 0.0, "turns": 0, "seconds": round(time.time() - t0, 1), "result": None, "error": None,
           "tools": 0, "hook_msgs": []}
    for line in r.stdout.splitlines():
        try:
            m = json.loads(line)
        except ValueError:
            continue
        if m.get("type") == "result":
            res.update(cost=m.get("total_cost_usd") or 0.0, turns=m.get("num_turns") or 0,
                       result=(m.get("result") or "")[:300], error=m.get("subtype") if m.get("is_error") else None)
        elif m.get("type") == "assistant":
            for c in (m.get("message") or {}).get("content") or []:
                if c.get("type") == "tool_use":
                    res["tools"] += 1
        text = json.dumps(m)
        for needle in ("hx brief", "FROZEN", "LEASE_LOST", "you still hold", "hx NOTICE", "GATE NOT SATISFIED"):
            if needle in text and needle not in res["hook_msgs"]:
                res["hook_msgs"].append(needle)
    if r.returncode != 0 and not res["error"]:
        res["error"] = f"exit {r.returncode}: {r.stderr.strip()[-200:]}"
    return res


def hidden_score(task, src_dir):
    """Run the hidden tests against a directory snapshot. Returns (passed, total)."""
    tmp = tempfile.mkdtemp(prefix="hx-hidden-")
    try:
        shutil.copytree(src_dir, os.path.join(tmp, "w"), ignore=shutil.ignore_patterns(".git", "__pycache__"))
        w = os.path.join(tmp, "w")
        with open(os.path.join(w, "tests", f"test_hidden_{task}.py"), "w") as f:
            f.write(textwrap.dedent(TASKS[task]["hidden"]).lstrip())
        r = subprocess.run([sys.executable, "-m", "unittest", f"tests.test_hidden_{task}", "-v"], cwd=w,
                           capture_output=True, text=True, timeout=300)
        out = r.stdout + r.stderr
        total = int(m.group(1)) if (m := re.search(r"Ran (\d+) test", out)) else 0
        bad = sum(int(x) for x in re.findall(r"(?:failures|errors)=(\d+)", out))
        if total == 0:
            return 0, 4
        return total - bad, total
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def checkout_ref(origin, ref, dest):
    clone(origin, dest)
    sh(["git", "checkout", "-q", ref], dest)
    return dest


# ----------------------------------------------------------------------------- conditions

def run_solo(task, base, model, budget, max_turns, restarts):
    t = TASKS[task]
    origin = make_origin(base)
    work = clone(origin, os.path.join(base, "solo"), f"solo/{task}")
    prompt = (f"You are working in a Python repository. Ticket:\n{ticket_text(t)}\n\nWrite the tests first, then "
              f"the implementation; run `python3 -m unittest discover -s tests -t .` until everything passes. "
              f"Commit your work on the current branch and push it to origin. Reply DONE when finished.")
    sessions = []
    for i in range(1 + restarts):
        p = prompt if i == 0 else (prompt + "\n\nA previous session worked on this ticket and was interrupted. "
                                   "Inspect the repository state and continue.")
        res = run_claude(work, p, claude_env(), model, budget, max_turns, os.path.join(RUNS, f"solo-{task}-{i}.jsonl"))
        sessions.append(res)
        if not max_turns or res["error"] != "error_max_turns":
            break
    passed, total = hidden_score(task, work)
    return {"task": task, "condition": "solo", "sessions": len(sessions), "cost": sum(s["cost"] for s in sessions),
            "seconds": sum(s["seconds"] for s in sessions), "hidden_passed": passed, "hidden_total": total,
            "solved": passed == total, "errors": [s["error"] for s in sessions if s["error"]]}


def run_hx(task, base, model, budget, max_turns, max_sessions, verbose=False):
    t = TASKS[task]
    origin = make_origin(base)
    store = os.path.join(base, "hx", "log.jsonl")
    henv = {"HX_STORE": store, "HX_REPO": origin}
    tid = task.upper()
    spec = {"id": tid, "title": t["title"], "body": t["body"] + f" Tests go in {t['test']}.",
            "criteria": t["criteria"], "process": "mvp", "risk": "low",
            "test_cmd": f"python3 -m unittest {t['test'][:-3].replace('/', '.')}",
            "ci_cmd": "python3 -m unittest discover -s tests -t ."}
    sh([sys.executable, HX, "import", "/dev/stdin"], base, env=claude_env(henv), input=json.dumps({"tickets": [spec]}))
    sessions, n, retried, dirs = [], 0, False, {}
    while n < max_sessions:
        sh([sys.executable, HX, "tick"], base, env=claude_env(henv))
        st = FileStore(store).read()
        tk = st["tickets"][tid]
        if tk["status"] == "done":
            break
        run = tk["run"]
        if run["status"] == "waiting":
            q = next(q for q in st["questions"].values() if q["id"] in run["waiting_on"])
            if q["kind"] == "escalation" and not retried:
                retried = True
                sh([sys.executable, HX, "answer", q["id"], "retry" if "retry" in q["options"] else "one_more"],
                   base, env=claude_env(henv))
                continue
            break  # a real owner decision would be needed; count as not done
        if run["status"] == "active":
            sh([sys.executable, HX, "revoke", tid, "--reason", "pilot driver: session exited holding the lease"],
               base, env=claude_env(henv))
            continue
        role = tk["process"]["steps"][tk["step"]]["role"]
        if role not in ("worker", "reviewer"):
            continue
        n += 1
        sid = f"{task}-{n}-{tk['step']}"
        key = (tk["step"], run["visit"])
        if max_turns and key in dirs:
            work = dirs[key]  # same step continues in the same sandbox (context exhausted, files survive)
        else:
            work = clone(origin, os.path.join(base, "agents", sid), tk["branch"])
            os.makedirs(os.path.join(work, ".claude"), exist_ok=True)
            with open(os.path.join(work, ".claude", "settings.json"), "w") as f:
                json.dump(SETTINGS, f)
        dirs[key] = work
        env = claude_env(dict(henv, HX_SESSION=sid, HX_TICKET=tid, HX_ROLE=role))
        prompt = (f"You are an hx {role} agent. Your brief was injected at session start (run `hx brief` to see it "
                  f"again). Do exactly the current step for ticket {tid}, then `hx done`. Push before `hx submit`.")
        res = run_claude(work, prompt, env, model, budget, max_turns, os.path.join(RUNS, f"hx-{sid}.jsonl"),
                         system=SKILL)
        res["step"], res["role"] = tk["step"], role
        sessions.append(res)
        if verbose:
            print(f"  session {sid}: ${res['cost']:.3f} {res['turns']} turns {res['seconds']}s "
                  f"hooks seen: {res['hook_msgs']} err={res['error']}", flush=True)
    st = FileStore(store).read()
    tk = st["tickets"][tid]
    snap = os.path.join(base, "eval-snap")
    if tk["heads"].get("merged"):
        checkout_ref(origin, "main", snap)
        where = "main"
    elif sh(["git", "ls-remote", "--heads", origin, tk["branch"]], base).stdout.strip():
        checkout_ref(origin, tk["branch"], snap)
        where = tk["branch"]
    else:
        checkout_ref(origin, "main", snap)
        where = "nothing pushed"
    passed, total = hidden_score(task, snap)
    events = FileStore(store).all_events()
    return {"task": task, "condition": "hx", "sessions": len(sessions), "cost": sum(s["cost"] for s in sessions),
            "seconds": sum(s["seconds"] for s in sessions), "hidden_passed": passed, "hidden_total": total,
            "solved": passed == total, "landed": bool(tk["heads"].get("merged")), "scored_on": where,
            "status": tk["status"], "step": tk["step"],
            "rejected_evidence": tk["stats"]["rejected_evidence"], "handovers": tk["stats"]["handovers"],
            "review_rounds": tk["visits"].get("review", 0),
            "events": {k: sum(1 for e in events if e["type"] == k) for k in ("claim", "evidence", "done", "release")},
            "steps": [(s["step"], round(s["cost"], 3), s["turns"], s["hook_msgs"], s["error"]) for s in sessions]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["hookcheck", "ab"])
    ap.add_argument("--tasks", default=",".join(TASKS))
    ap.add_argument("--model", default="haiku")
    ap.add_argument("--budget", type=float, default=0.6, help="USD cap per session")
    ap.add_argument("--max-turns", type=int, default=0)
    ap.add_argument("--solo-restarts", type=int, default=0)
    ap.add_argument("--max-sessions", type=int, default=8)
    ap.add_argument("--out", default=os.path.join(ROOT, "eval", "results", "pilot.json"))
    a = ap.parse_args()
    base_root = tempfile.mkdtemp(prefix="hx-pilot-")
    results = []
    try:
        tasks = ["duration"] if a.mode == "hookcheck" else a.tasks.split(",")
        for task in tasks:
            if a.mode == "ab":
                r = run_solo(task, os.path.join(base_root, f"solo-{task}"), a.model, a.budget, a.max_turns,
                             a.solo_restarts)
                results.append(r)
                print(json.dumps(r), flush=True)
            r = run_hx(task, os.path.join(base_root, f"hx-{task}"), a.model, a.budget, a.max_turns, a.max_sessions,
                       verbose=True)
            results.append(r)
            print(json.dumps(r), flush=True)
    finally:
        shutil.rmtree(base_root, ignore_errors=True)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w") as f:
        json.dump({"model": a.model, "budget_per_session": a.budget, "max_turns": a.max_turns,
                   "solo_restarts": a.solo_restarts, "results": results}, f, indent=1)
    print(f"wrote {a.out}")


if __name__ == "__main__":
    main()
