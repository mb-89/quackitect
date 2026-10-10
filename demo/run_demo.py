#!/usr/bin/env python3
"""End-to-end demo of hx: one group of three tickets, scripted agents, a real git repo.

Everything below really runs: every `hx` command is the real CLI, every hook call is the real
Claude Code hook entry point fed with the JSON Claude Code would send, verification runs the real
tests in clean exports of pushed commits, and owner decisions are HTTP calls to the coordinator
(exactly what the phone UI sends). Only the agents' *thinking* is scripted: their file edits are
fixed, including the mistakes. Clock and git dates are pinned, so the transcript is reproducible.

    python3 demo/run_demo.py                      # writes demo/TRANSCRIPT.md, work dir in demo/out
    python3 demo/run_demo.py --out /tmp/x --transcript /tmp/x/t.md
"""
import argparse
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import textwrap
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
HX = os.path.join(ROOT, "bin", "hx")

from hx.server import Coordinator  # noqa: E402
from hx.service import Hx  # noqa: E402
from hx.store import Clock, FileStore  # noqa: E402
from hx.verify import GitVerifier  # noqa: E402

T0 = 1791792000  # 2026-10-12 08:00 UTC
CI = "python3 -m unittest discover -s tests -t ."

# ----------------------------------------------------------------------------- the toy project
SEED = {
    ".gitignore": ".hx/\n__pycache__/\n",
    "textkit/__init__.py": "",
    "textkit/core.py": 'def normalize_space(s):\n    return " ".join(s.split())\n',
    "tests/__init__.py": "",
    "tests/test_core.py": textwrap.dedent('''\
        import unittest
        from textkit.core import normalize_space


        class TestCore(unittest.TestCase):
            def test_normalize_space(self):
                self.assertEqual(normalize_space("a   b"), "a b")
        '''),
}
GROUP = {
    "group": {"id": "G-1", "title": "textkit: slugs, word counts, title cards"},
    "tickets": [
        {"id": "T-1", "title": "slugify(title)", "risk": "low", "priority": 2,
         "body": "URL slugs for article titles.",
         "criteria": [{"id": "AC1", "text": "lowercases the title"},
                      {"id": "AC2", "text": "runs of non-alphanumerics become one dash"},
                      {"id": "AC3", "text": "no leading or trailing dashes"}],
         "test_cmd": "python3 -m unittest tests.test_slug", "ci_cmd": CI},
        {"id": "T-2", "title": "word_count(text)", "risk": "low", "priority": 2,
         "body": "Count words for reading-time estimates.",
         "criteria": [{"id": "AC1", "text": "counts whitespace-separated words"},
                      {"id": "AC2", "text": "punctuation alone is not a word"},
                      {"id": "AC3", "text": "hyphenated words count as one"}],
         "test_cmd": "python3 -m unittest tests.test_count", "ci_cmd": CI},
        {"id": "T-3", "title": "title_card(title, body)", "risk": "medium", "priority": 3, "deps": ["T-1", "T-2"],
         "body": "One-line card for the article list: slug plus word count.",
         "criteria": [{"id": "AC1", "text": "starts with slugify(title)"},
                      {"id": "AC2", "text": "reports word_count(body)"},
                      {"id": "AC3", "text": "format '<slug> (<n> words)'"}],
         "test_cmd": "python3 -m unittest tests.test_card", "ci_cmd": CI},
    ],
}


def doc(title, approach, scope, risks=True):
    s = f"# {title}\n\n## Approach\n{approach}\n\n## Scope\n" + "".join(f"- {p}\n" for p in scope)
    s += "\n## Test plan\nOne test per acceptance criterion, named test_acN_...\n"
    if risks:
        s += "\n## Risks\nUnicode input; empty strings.\n"
    return s


SLUG_TEST = textwrap.dedent('''\
    import unittest
    from textkit.slug import slugify


    class TestSlugify(unittest.TestCase):
        def test_ac1_lowercase(self):
            self.assertEqual(slugify("Hello"), "hello")

        def test_ac2_runs_become_one_dash(self):
            self.assertEqual(slugify("Hello,   World!"), "hello-world")

        def test_ac3_no_edge_dashes(self):
            self.assertEqual(slugify("  --Hello--  "), "hello")
    ''')
SLUG_V1 = 'import re\n\n\ndef slugify(title):\n    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")\n'
SLUG_V2 = textwrap.dedent('''\
    import re
    import unicodedata


    def slugify(title):
        ascii_title = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
        return re.sub(r"[^a-z0-9]+", "-", ascii_title.lower()).strip("-")
    ''')
SLUG_UNICODE_TEST = textwrap.dedent('''\
    import unittest
    from textkit.slug import slugify


    class TestSlugUnicode(unittest.TestCase):
        def test_accents_are_transliterated(self):
            self.assertEqual(slugify("Café Crème"), "cafe-creme")
    ''')
COUNT_TEST = textwrap.dedent('''\
    import unittest
    from textkit.count import word_count


    class TestWordCount(unittest.TestCase):
        def test_ac1_whitespace_separated(self):
            self.assertEqual(word_count("one two\\tthree\\nfour"), 4)

        def test_ac2_punctuation_is_not_a_word(self):
            self.assertEqual(word_count("wait - what ?!"), 2)

        def test_ac3_hyphenated_is_one_word(self):
            self.assertEqual(word_count("a well-known fact"), 3)
    ''')
COUNT_WIP = 'import re\n\n\ndef word_count(text):\n    return len(re.findall(r"[A-Za-z0-9]+", text))\n'
COUNT_DONE = textwrap.dedent('''\
    import re

    WORD = re.compile(r"[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*")


    def word_count(text):
        return len(WORD.findall(text))
    ''')
CARD_TEST = textwrap.dedent('''\
    import unittest
    from textkit.card import title_card


    class TestTitleCard(unittest.TestCase):
        def test_ac1_ac3_slug_and_format(self):
            self.assertEqual(title_card("Hello World", "a b c"), "hello-world (3 words)")

        def test_ac2_counts_the_body(self):
            self.assertTrue(title_card("x", "one two").endswith("(2 words)"))

        def test_ac3_singular(self):
            self.assertEqual(title_card("x", "one"), "x (1 word)")
    ''')
CARD = textwrap.dedent('''\
    from .count import word_count
    from .slug import slugify


    def title_card(title, body):
        n = word_count(body)
        return f"{slugify(title)} ({n} {'word' if n == 1 else 'words'})"
    ''')
STUB = 'def {name}(*args):\n    raise NotImplementedError("{tid}")\n'


class Demo:
    def __init__(self, out):
        self.out = out
        shutil.rmtree(out, ignore_errors=True)
        os.makedirs(out)
        self.now = T0
        self.md = []
        self.origin = os.path.join(out, "origin.git")
        self.store_path = os.path.join(out, "hx", "log.jsonl")
        self.env = {k: v for k, v in os.environ.items() if not k.startswith(("HX_", "GIT_", "CLAUDE_"))}
        self.env.update(HX_STORE=self.store_path, HX_REPO=self.origin, PYTHONDONTWRITEBYTECODE="1",
                        HX_LAUNCH=f"echo {{role}} {{ticket}} >> {shlex.quote(os.path.join(out, 'launches.log'))}",
                        HX_NOTIFY=f"echo {{text}} >> {shlex.quote(os.path.join(out, 'pushes.log'))}",
                        GIT_AUTHOR_NAME="agent", GIT_AUTHOR_EMAIL="agent", GIT_COMMITTER_NAME="agent",
                        GIT_COMMITTER_EMAIL="agent")
        self.rejections = 0
        self.hook_denials = 0
        self._seed()
        os.environ["HX_NOW"] = str(self.now)
        self.coord = Coordinator(Hx(FileStore(self.store_path, Clock()), GitVerifier(self.origin)), port=0,
                                 tick=0, owner_token="demo-owner", agent_token="demo-agent").start()

    # ------------------------------------------------------------------ plumbing
    def run_env(self, extra=None):
        e = dict(self.env, HX_NOW=str(self.now))
        stamp = f"@{self.now} +0000"
        e.update(GIT_AUTHOR_DATE=stamp, GIT_COMMITTER_DATE=stamp)
        e.update(extra or {})
        return e

    def clock(self, minutes):
        self.now += int(minutes * 60)
        os.environ["HX_NOW"] = str(self.now)

    def hhmm(self):
        return f"{(self.now - T0) // 3600 + 8:02d}:{(self.now - T0) % 3600 // 60:02d}"

    def say(self, text):
        self.md.append(textwrap.dedent(text).strip() + "\n")

    def h2(self, text):
        self.md.append(f"## {text}\n")

    def block(self, text):
        text = re.sub(r"in \d+\.\d+s", "in 0.00Xs", text.rstrip())
        text = text.replace(self.out, "<work>")
        self.md.append("```\n" + text + "\n```\n")

    def sh(self, args, cwd, check=True):
        r = subprocess.run(args, cwd=cwd, capture_output=True, text=True, env=self.run_env())
        if check and r.returncode != 0:
            raise RuntimeError(f"{args}: {r.stdout}{r.stderr}")
        return r

    def git(self, cwd, *args, check=True):
        return self.sh(["git", *args], cwd, check).stdout.strip()

    def _seed(self):
        seed = os.path.join(self.out, "seed")
        os.makedirs(seed)
        self.git(seed, "init", "-q", "-b", "main")
        self.write(seed, SEED)
        self.git(seed, "add", "-A")
        self.git(seed, "commit", "-q", "-m", "seed textkit")
        self.git(self.out, "clone", "-q", "--bare", seed, self.origin)

    def write(self, cwd, files):
        for path, content in files.items():
            full = os.path.join(cwd, path)
            os.makedirs(os.path.dirname(full), exist_ok=True)
            with open(full, "w") as f:
                f.write(content)

    def hx(self, who, *args, cwd=None, expect=0, show=True, extra=None, quiet_lines=None, label=None):
        env = self.run_env(extra)
        if who:
            env["HX_SESSION"] = who
        r = subprocess.run([sys.executable, HX, *args], cwd=cwd or self.out, capture_output=True, text=True, env=env)
        output = (r.stdout + r.stderr).rstrip()
        if r.returncode == 2:
            self.rejections += 1
        if expect is not None and r.returncode != expect:
            raise RuntimeError(f"hx {args} -> {r.returncode}, expected {expect}:\n{output}")
        if show:
            if quiet_lines:
                lines = output.splitlines()
                output = "\n".join(lines[:quiet_lines] + ([f"... ({len(lines) - quiet_lines} more lines)"]
                                                          if len(lines) > quiet_lines else []))
            prompt = f"[{self.hhmm()}] {label or who or 'owner'}$ hx " + " ".join(shlex.quote(a) for a in args)
            self.block(prompt + ("\n" + output if output else ""))
        return output

    def hook(self, event, who, cwd, show=True, extra=None, **data):
        data.setdefault("session_id", who)
        data.setdefault("cwd", cwd)
        env = self.run_env(extra)
        env["HX_SESSION"] = who
        env["CLAUDE_PROJECT_DIR"] = cwd
        r = subprocess.run([sys.executable, HX, "hook", event], cwd=cwd, input=json.dumps(data),
                           capture_output=True, text=True, env=env)
        out = json.loads(r.stdout) if r.stdout.strip() else None
        if show:
            shown = {k: v for k, v in data.items() if k not in ("session_id", "cwd", "transcript_path")}
            text = f"[{self.hhmm()}] hook {event} ({who}) <- {json.dumps(shown)}\n"
            if out is None:
                text += "-> (no output: allowed)"
            elif "hookSpecificOutput" in out and "permissionDecision" in out["hookSpecificOutput"]:
                o = out["hookSpecificOutput"]
                text += f"-> {o['permissionDecision'].upper()}: {o['permissionDecisionReason']}"
                self.hook_denials += 1
            elif out.get("decision") == "block":
                text += "-> BLOCK (Claude must continue):\n" + out["reason"]
            else:
                text += "-> additionalContext:\n" + out["hookSpecificOutput"]["additionalContext"]
            self.block(text)
        return out

    def agent(self, name, ticket=None):
        path = os.path.join(self.out, "agents", name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.git(os.path.dirname(path), "clone", "-q", self.origin, path)
        if ticket:
            branch = f"hx/{ticket}"
            if self.git(path, "ls-remote", "--heads", "origin", branch):
                self.git(path, "checkout", "-q", "-b", branch, f"origin/{branch}")
            else:
                self.git(path, "checkout", "-q", "-b", branch)
        return path

    def start(self, name, ticket, role="worker", show_brief=True, lines=None):
        """A dispatched session starts: the SessionStart hook claims HX_TICKET and injects the brief."""
        cwd = self.agent(name, ticket)
        out = self.hook("session-start", name, cwd, show=False, source="startup",
                        extra={"HX_TICKET": ticket, "HX_ROLE": role})
        text = out["hookSpecificOutput"]["additionalContext"]
        if show_brief:
            tl = text.splitlines()
            if lines and len(tl) > lines:
                text = "\n".join(tl[:lines] + [f"... ({len(tl) - lines} more lines)"])
            self.block(f"[{self.hhmm()}] session {name} starts; SessionStart hook injects:\n{text}")
        return cwd

    def edit(self, who, cwd, files, note):
        self.write(cwd, files)
        self.say(f"*{who} edits {', '.join(sorted(files))}: {note}*")

    def push(self, cwd, msg, show=True):
        self.git(cwd, "add", "-A")
        self.git(cwd, "commit", "-q", "-m", msg)
        branch = self.git(cwd, "rev-parse", "--abbrev-ref", "HEAD")
        self.git(cwd, "push", "-q", "origin", f"HEAD:refs/heads/{branch}")
        sha = self.git(cwd, "rev-parse", "--short", "HEAD")
        if show:
            self.say(f"*commit `{sha}` \"{msg}\" pushed to {branch}*")
        return sha

    def phone(self, path, body=None, show=True):
        url = f"http://127.0.0.1:{self.coord.port}{path}"
        req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None,
                                     headers={"Authorization": "Bearer demo-owner",
                                              "Content-Type": "application/json"},
                                     method="POST" if body is not None else "GET")
        with urllib.request.urlopen(req) as r:
            data = json.loads(r.read())
        if show and body is not None:
            self.block(f"[{self.hhmm()}] owner (phone) POST {path} {json.dumps(body)}\n-> {json.dumps(data)}")
        return data

    def tick(self, dispatch=False):
        args = ["tick"] + (["--dispatch"] if dispatch else [])
        return self.hx(None, *args, label="clock")


def main(out, transcript):
    d = Demo(out)
    d.say("""
    # hx demo transcript

    Generated by `python3 demo/run_demo.py`. Every `hx` command, hook call, test run, git push and
    merge below really happened, against a real git repo with a bare `origin`. Owner decisions are HTTP
    calls to the coordinator, the same calls the phone UI makes. The agents are scripted, including
    their mistakes. The clock and git dates are pinned, so this transcript is reproducible.
    Local paths are shown as `<work>`.

    The cast is one owner, several short-lived agent sessions (`w-*` workers, `r-*` reviewers) and the
    clock (`hx tick`, which cron or the coordinator runs every minute). A red test run counts when the
    tests load and run and at least one fails; a stub raising NotImplementedError shows up as `errors=`.
    """)

    d.h2("1. The owner drops a group of three tickets")
    path = os.path.join(out, "group.json")
    with open(path, "w") as f:
        json.dump(GROUP, f, indent=1)
    d.say("T-3 depends on T-1 and T-2 and is medium risk, so it needs owner approval of its design and acceptance. "
          "T-1 and T-2 are low risk, so the owner is not asked at all unless something goes wrong.")
    d.hx(None, "import", path)
    d.hx(None, "board")
    d.say("The draft step was skipped because the owner already wrote acceptance criteria. Now the clock "
          "dispatches agents, starting one fresh session per ready step:")
    d.tick(dispatch=True)

    d.h2("2. Two workers start in parallel; the brief is all they see")
    wa = d.start("w-a", "T-1")
    wb = d.start("w-b", "T-2", show_brief=False)
    d.say("*(w-b got the equivalent brief for T-2.)*")
    d.clock(4)
    d.edit("w-a", wa, {"docs/design/T-1.md": doc("T-1 slugify", "Lowercase, replace runs of non-alphanumerics "
                                                 "with one dash, strip edge dashes.",
                                                 ["textkit/slug.py", "tests/test_slug.py"], risks=False)},
           "design doc (forgot the Risks section)")
    d.push(wa, "T-1 design")
    d.hx("w-a", "submit", "doc", "--path", "docs/design/T-1.md", cwd=wa, expect=2)
    d.edit("w-a", wa, {"docs/design/T-1.md": doc("T-1 slugify", "Lowercase, replace runs of non-alphanumerics "
                                                 "with one dash, strip edge dashes.",
                                                 ["textkit/slug.py", "tests/test_slug.py"])}, "adds Risks")
    d.push(wa, "T-1 design: risks")
    d.hx("w-a", "submit", "doc", "--path", "docs/design/T-1.md", cwd=wa)
    d.hx("w-a", "done", "--continue", cwd=wa, quiet_lines=3)
    d.clock(2)
    d.edit("w-b", wb, {"docs/design/T-2.md": doc("T-2 word_count", "Regex tokenizer over alphanumeric runs, "
                                                 "joined by inner hyphens.",
                                                 ["textkit/count.py", "tests/test_count.py"])}, "design doc")
    d.push(wb, "T-2 design")
    d.hx("w-b", "submit", "doc", "--path", "docs/design/T-2.md", cwd=wb)
    d.hx("w-b", "done", "--continue", cwd=wb, quiet_lines=1)

    d.h2("3. Red: failing tests become frozen evidence")
    d.clock(5)
    d.edit("w-a", wa, {"tests/test_slug.py": SLUG_TEST}, "three tests, one per AC (no stub yet)")
    d.push(wa, "T-1 red: tests")
    d.hx("w-a", "submit", "tests_red", cwd=wa, expect=2)
    d.edit("w-a", wa, {"textkit/slug.py": STUB.format(name="slugify", tid="T-1")}, "stub so the tests load")
    d.push(wa, "T-1 red: stub")
    d.hx("w-a", "submit", "tests_red", cwd=wa)
    d.hx("w-a", "done", "--continue", cwd=wa, quiet_lines=1)
    d.clock(3)
    d.edit("w-b", wb, {"tests/test_count.py": COUNT_TEST, "textkit/count.py": STUB.format(name="word_count",
                                                                                         tid="T-2")},
           "tests + stub")
    d.push(wb, "T-2 red")
    d.hx("w-b", "submit", "tests_red", cwd=wb)
    d.hx("w-b", "done", "--continue", cwd=wb, quiet_lines=1)

    d.h2("4. Green: hooks keep hands off the frozen tests")
    d.clock(6)
    d.say("w-a's implementation fails one test, and the cheapest fix is to \"adjust\" the test. "
          "The PreToolUse hook refuses:")
    d.hook("pre-tool", "w-a", wa, tool_name="Edit",
           tool_input={"file_path": os.path.join(wa, "tests/test_slug.py"), "old_string": "hello-world",
                       "new_string": "hello-world-"})
    d.hook("pre-tool", "w-a", wa, tool_name="Bash", tool_input={"command": "git push --force origin hx/T-1"})
    d.edit("w-a", wa, {"textkit/slug.py": SLUG_V1, "textkit/__init__.py": "from .slug import slugify  # T-1\n"},
           "regex implementation plus a package export")
    d.push(wa, "T-1 green")
    d.hx("w-a", "submit", "tests_green", cwd=wa)
    d.hx("w-a", "done", cwd=wa)

    d.say("Meanwhile w-b gets AC1 and AC2 passing, checkpoints and pushes work in progress. The PostToolUse "
          "hook sends a throttled heartbeat (with HEAD) on its tool calls.")
    d.clock(3)
    d.edit("w-b", wb, {"textkit/count.py": COUNT_WIP}, "tokenizer, hyphens not handled yet")
    d.push(wb, "T-2 wip: tokenizer")
    d.hx("w-b", "checkpoint", "--done", "tokenizer counts alphanumeric runs; AC1+AC2 pass",
         "--next", "treat inner hyphens (well-known) as one word for AC3",
         "--risks", "apostrophes (don't) unspecified; I would count them as one word", cwd=wb)
    d.clock(6)
    d.hook("post-tool", "w-b", wb, tool_name="Bash", tool_input={"command": "python3 -m unittest tests.test_count"},
           tool_response={"stdout": "FAILED (failures=1)"})
    d.say("**w-b's sandbox dies here.** There is no release and no goodbye.")

    d.h2("5. Review requests changes; the crashed lease expires")
    d.clock(2)
    d.tick(dispatch=True)
    ra = d.start("r-a", "T-1", role="reviewer", lines=18)
    d.clock(6)
    d.say("r-a runs the candidate and tries accented input, which AC1 does not mention but a reasonable "
          "reader expects:")
    d.hook("pre-tool", "r-a", ra, tool_name="Edit",
           tool_input={"file_path": os.path.join(ra, "textkit/slug.py"), "old_string": "a", "new_string": "b"})
    d.hx("r-a", "submit", "review", "--verdict", "changes", "--ac", "AC1=fail:'Café Crème' -> 'caf-cr-me'",
         "--ac", "AC2=ok", "--ac", "AC3=ok", "--finding", "transliterate accents (NFKD) and add a test for it",
         cwd=ra)
    d.hx("r-a", "done", cwd=ra)
    d.clock(9)
    d.say("Sixteen minutes after w-b's last sign of life, the clock expires its lease and dispatches fresh "
          "sessions:")
    d.tick(dispatch=True)

    d.h2("6. Handover: a fresh session continues from the checkpoint")
    wc = d.start("w-c", "T-1", show_brief=False)
    wd = d.start("w-d", "T-2")
    d.clock(5)
    d.say("The zombie w-b briefly comes back to life. Its next tool call is refused, and so is its write:")
    d.hook("pre-tool", "w-b", wb, tool_name="Edit",
           tool_input={"file_path": os.path.join(wb, "textkit/count.py"), "old_string": "a", "new_string": "b"})
    d.hx("w-b", "checkpoint", "--done", "still here?", cwd=wb, expect=3)
    d.edit("w-d", wd, {"textkit/count.py": COUNT_DONE, "textkit/__init__.py": "from .count import word_count  # T-2\n"},
           "hyphen-joined words per the checkpoint, plus a package export")
    d.push(wd, "T-2 green")
    d.hx("w-d", "submit", "tests_green", cwd=wd)
    d.hx("w-d", "done", cwd=wd)
    d.clock(3)
    d.say("w-c got T-1 green visit 2. Its brief carried the review findings:")
    d.hx("w-c", "brief", cwd=wc, quiet_lines=22)
    d.edit("w-c", wc, {"textkit/slug.py": SLUG_V2, "tests/test_slug_unicode.py": SLUG_UNICODE_TEST},
           "NFKD transliteration and a new test (frozen tests untouched)")
    d.push(wc, "T-1 green: accents")
    d.hx("w-c", "submit", "tests_green", cwd=wc)
    d.hx("w-c", "done", cwd=wc)

    d.h2("7. Second reviews, auto-acceptance, merge queue")
    d.clock(4)
    d.tick(dispatch=True)
    rb = d.start("r-b", "T-1", role="reviewer", show_brief=False)
    rc = d.start("r-c", "T-2", role="reviewer", show_brief=False)
    d.clock(7)
    d.hx("r-b", "submit", "review", "--verdict", "approve", "--ac", "AC1=ok", "--ac", "AC2=ok", "--ac", "AC3=ok",
         cwd=rb)
    d.hx("r-b", "done", cwd=rb)
    d.hx("r-c", "submit", "review", "--verdict", "approve", "--ac", "AC1=ok", "--ac", "AC2=ok", "--ac", "AC3=ok",
         "--finding", "apostrophes count as one word, as w-b's checkpoint suggested; fine", cwd=rc)
    d.hx("r-c", "done", cwd=rc)
    d.say("Both are low risk, so `accept` passed by policy without asking the owner. The merge queue "
          "lands one ticket per tick, merging the *reviewed* SHA and running CI on the merge result:")
    d.clock(1)
    d.tick()
    d.clock(1)
    d.tick()
    d.say("Both tickets touched `textkit/__init__.py`, which neither design declared in its scope. "
          "The merge queue caught the conflict before main broke, and routed T-2 to a `rebase` step.")

    d.h2("8. Rebase: merge main, keep the evidence chain")
    d.tick(dispatch=True)
    we = d.start("w-e", "T-2", lines=14)
    wf = d.start("w-f", "T-1", show_brief=False)
    d.clock(2)
    d.say("w-f writes T-1's retro (the retro step comes after landing, so it never delays main):")
    d.hx("w-f", "submit", "retro", "--went-well", "red/green chain caught nothing wrong; review found the accent gap",
         "--went-badly", "AC1 did not mention unicode; one extra review round",
         "--change", "feature template: add an 'input domain' line (ascii/unicode) to acceptance criteria", cwd=wf)
    d.hx("w-f", "done", cwd=wf)
    d.clock(2)
    d.hook("pre-tool", "w-e", we, tool_name="Bash", tool_input={"command": "git rebase origin/main"})
    d.git(we, "fetch", "-q", "origin")
    merge = d.git(we, "merge", "origin/main", "-m", "merge main into hx/T-2", check=False)
    d.say(f"*w-e merges origin/main: `{merge or 'CONFLICT (content): Merge conflict in textkit/__init__.py'}`*")
    d.edit("w-e", we, {"textkit/__init__.py": "from .slug import slugify  # T-1\nfrom .count import word_count  # T-2\n"},
           "resolves the conflict by keeping both exports")
    d.push(we, "T-2: merge main")
    d.hx("w-e", "submit", "tests_green", cwd=we)
    d.hx("w-e", "done", cwd=we)
    d.clock(1)
    d.tick()
    d.say("T-3's dependencies have landed, so it opened by itself.")
    d.hx(None, "board")

    d.h2("9. T-3: a question for the owner, answered from the phone")
    d.tick(dispatch=True)
    wi = d.start("w-i", "T-2", show_brief=False)
    wg = d.start("w-g", "T-3", lines=12)
    d.clock(5)
    d.hx("w-g", "ask", "For a one-word body, should the card say '1 word' or '1 words'?",
         "--options", "singular,plural", "--summary", "T-3 card: '1 word' (singular) or '1 words'?",
         "--note", "design half done: format is '<slug> (<n> words)', unsure about n=1", cwd=wg)
    d.hx("w-i", "submit", "retro", "--went-well", "checkpoint made the handover after the crash cheap",
         "--went-badly", "scope missed textkit/__init__.py; merge conflict at landing",
         "--change", "design template: list shared files (package __init__, registries) under Scope", cwd=wi)
    d.hx("w-i", "done", cwd=wi)
    d.clock(1)
    d.tick()
    st = d.phone("/api/state")
    card = st["inbox"][0]
    d.block(f"[{d.hhmm()}] owner's phone shows 1 card:\n  {card['id']} [{card['kind']}] {card['ticket']}: "
            f"{card['summary']}\n  buttons: {' | '.join(card['options'])}")
    d.clock(12)
    d.phone("/api/answer", {"qid": card["id"], "choice": "singular", "text": "1 word, 2 words"})

    d.h2("10. Design approval, an early stop refused, then red and green")
    d.tick(dispatch=True)
    wh = d.start("w-h", "T-3", lines=40)
    d.clock(5)
    d.edit("w-h", wh, {"docs/design/T-3.md": doc("T-3 title_card", "Compose slugify and word_count; singular "
                                                 "for n == 1 (owner answer).",
                                                 ["textkit/card.py", "tests/test_card.py"])}, "design doc")
    d.push(wh, "T-3 design")
    d.hx("w-h", "submit", "doc", "--path", "docs/design/T-3.md", cwd=wh)
    d.hx("w-h", "done", cwd=wh)
    d.clock(1)
    d.tick()
    st = d.phone("/api/state")
    card = st["inbox"][0]
    d.block(f"[{d.hhmm()}] owner's phone shows:\n  {card['id']} [{card['kind']}] {card['summary']}")
    d.clock(20)
    d.phone("/api/control", {"action": "approve", "ticket": "T-3"})
    d.hx("w-h", "claim", "--ticket", "T-3", cwd=wh, quiet_lines=1)
    d.clock(4)
    d.edit("w-h", wh, {"tests/test_card.py": CARD_TEST, "textkit/card.py": STUB.format(name="title_card", tid="T-3")},
           "tests + stub")
    d.say("w-h feels done after writing the tests and tries to end its turn. The Stop hook disagrees:")
    d.hook("stop", "w-h", wh, stop_hook_active=False)
    d.push(wh, "T-3 red")
    d.hx("w-h", "submit", "tests_red", cwd=wh)
    d.hx("w-h", "done", "--continue", cwd=wh, quiet_lines=1)
    d.clock(6)
    d.edit("w-h", wh, {"textkit/card.py": CARD}, "implementation")
    d.push(wh, "T-3 green")
    d.hx("w-h", "submit", "tests_green", cwd=wh)
    d.hx("w-h", "done", cwd=wh)

    d.h2("11. Review, owner acceptance, landing, retros")
    d.tick(dispatch=True)
    rd = d.start("r-d", "T-3", role="reviewer", show_brief=False)
    d.clock(6)
    d.hx("r-d", "submit", "review", "--verdict", "approve", "--ac", "AC1=ok", "--ac", "AC2=ok", "--ac", "AC3=ok",
         cwd=rd)
    d.hx("r-d", "done", cwd=rd)
    d.clock(1)
    d.tick()
    st = d.phone("/api/state")
    card = st["inbox"][0]
    d.block(f"[{d.hhmm()}] owner's phone shows:\n  {card['id']} [{card['kind']}] {card['summary']}")
    d.clock(15)
    d.phone("/api/answer", {"qid": card["id"], "choice": "approve"})
    d.tick()
    d.tick(dispatch=True)
    wj = d.start("w-j", "T-3", show_brief=False)
    d.clock(3)
    d.hx("w-j", "submit", "retro", "--went-well", "owner question answered in 12 min, no rework",
         "--went-badly", "nothing notable", "--change", "none", cwd=wj)
    d.hx("w-j", "done", cwd=wj)
    d.tick(dispatch=True)
    wk = d.start("w-k", "G-1", lines=30)
    d.hx("w-k", "submit", "retro", "--went-well", "3 tickets landed, 1 crash recovered, 0 regressions on main",
         "--went-badly", "1 merge conflict from undeclared shared file; 1 review round on unspecified unicode",
         "--change", "adopt both retro proposals as template changes (owner to approve)", cwd=wk)
    d.hx("w-k", "done", cwd=wk)

    d.h2("12. The end state")
    d.hx(None, "board")
    d.hx(None, "digest")
    d.say("The event log of T-2, the ticket that crashed, was handed over and then conflicted at landing:")
    d.hx(None, "log", "T-2", quiet_lines=60)
    main_log = d.git(d.origin, "log", "--oneline", "--first-parent", "main")
    d.block("$ git log --oneline --first-parent main   # in origin\n" + main_log)
    events = Hx(FileStore(d.store_path, Clock())).events()
    by_type = {}
    for e in events:
        by_type[e["type"]] = by_type.get(e["type"], 0) + 1
    owner_decisions = sum(1 for e in events if e["actor"]["kind"] == "owner" and e["type"] != "ticket.create")
    d.say("### Numbers")
    d.block("\n".join([
        f"events in the log:            {len(events)}",
        "  by type:                    " + ", ".join(f"{k}={v}" for k, v in sorted(by_type.items())),
        f"owner decisions (taps):       {owner_decisions} (all for the medium-risk ticket)",
        f"agent sessions started:       {len(os.listdir(os.path.join(out, 'agents')))}",
        f"hx calls rejected by a gate:  {d.rejections}",
        f"tool calls denied by hooks:   {d.hook_denials}",
        f"pushes to the owner:          {by_type.get('notify', 0)}",
    ]))
    d.coord.stop()
    text = "\n".join(d.md)
    with open(transcript, "w") as f:
        f.write(text)
    return {"events": events, "by_type": by_type, "owner_decisions": owner_decisions, "out": out,
            "rejections": d.rejections, "denials": d.hook_denials}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(ROOT, "demo", "out"))
    ap.add_argument("--transcript", default=os.path.join(ROOT, "demo", "TRANSCRIPT.md"))
    a = ap.parse_args()
    res = main(os.path.abspath(a.out), a.transcript)
    print(f"demo complete: {len(res['events'])} events, {res['owner_decisions']} owner decisions; "
          f"transcript -> {a.transcript}")
