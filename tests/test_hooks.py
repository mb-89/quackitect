"""Claude Code hook contract: JSON in on stdin, JSON decision out on stdout."""
import io
import json
import os
import shutil
import tempfile
import unittest
from contextlib import redirect_stdout
from unittest import mock

from hx import hooks
from hx.hooks import run_hook
from hx.service import Hx
from hx.store import Clock, FileStore
from tests.helpers import FakeVerifier, ticket

T0 = 1_760_000_000


class HookCase(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp(prefix="hx-hooks-")
        self.proj = os.path.join(self.dir, "proj")
        os.makedirs(self.proj)
        self.store_path = os.path.join(self.dir, "log.jsonl")
        clean = {k: v for k, v in os.environ.items() if not k.startswith("HX_")}
        clean.update(HX_STORE=self.store_path, CLAUDE_PROJECT_DIR=self.proj, HX_NOW=str(T0))
        self.env = mock.patch.dict(os.environ, clean, clear=True)
        self.env.start()
        self.hx = Hx(FileStore(self.store_path, Clock()), verifier=FakeVerifier())
        self.cwd = os.getcwd()

    def tearDown(self):
        os.chdir(self.cwd)
        self.env.stop()
        shutil.rmtree(self.dir, ignore_errors=True)

    def at(self, seconds):
        os.environ["HX_NOW"] = str(T0 + seconds)

    def hook(self, event, session="s1", **data):
        data.setdefault("session_id", session)
        data.setdefault("cwd", self.proj)
        buf = io.StringIO()
        with redirect_stdout(buf):
            self.assertEqual(run_hook(event, stdin=json.dumps(data)), 0)
        out = buf.getvalue().strip()
        return json.loads(out) if out else None

    def ctx(self, out):
        return out["hookSpecificOutput"]["additionalContext"]

    def decision(self, out):
        return out and out["hookSpecificOutput"]["permissionDecision"]

    def start_on(self, tid="T-1", session="s1"):
        os.environ["HX_TICKET"] = tid
        try:
            return self.hook("session-start", session=session, source="startup")
        finally:
            del os.environ["HX_TICKET"]

    def to_green(self, session="s1"):
        self.hx.create_ticket(ticket())
        self.start_on("T-1", session)  # design
        self.hx.submit(session, "doc", sha="a" * 40, path="d.md")
        self.hx.done(session)
        self.hx.claim(session, "worker", "T-1")
        self.hx.submit(session, "tests_red", sha="b" * 40, frozen={"tests/test_x.py": "blob1"})
        self.hx.done(session, cont=True)
        self.assertEqual(self.hx.state()["leases"][session]["step"], "green")


class TestSessionStart(HookCase):
    def test_no_lease(self):
        out = self.hook("session-start", source="startup")
        self.assertIn("no lease held", self.ctx(out))
        with open(os.path.join(self.proj, ".hx", "local", "session")) as f:
            self.assertEqual(f.read(), "s1")

    def test_dispatched_session_claims_and_gets_brief(self):
        self.hx.create_ticket(ticket())
        out = self.start_on()
        self.assertIn('hx brief · T-1 "ticket T-1" · step design', self.ctx(out))
        self.assertEqual(self.hx.state()["leases"]["s1"]["ticket"], "T-1")

    def test_compaction_reinjects_brief(self):
        self.hx.create_ticket(ticket())
        self.start_on()
        out = self.hook("session-start", source="compact")
        self.assertIn("context was compacted", self.ctx(out))
        self.assertIn("DONE WHEN", self.ctx(out))


class TestPreTool(HookCase):
    def test_frozen_tests_and_git_guards(self):
        self.to_green()
        frozen = os.path.join(self.proj, "tests/test_x.py")
        self.assertEqual(self.decision(self.hook("pre-tool", tool_name="Edit", tool_input={"file_path": frozen})),
                         "deny")
        self.assertIsNone(self.hook("pre-tool", tool_name="Edit",
                                    tool_input={"file_path": os.path.join(self.proj, "textkit/x.py")}))
        for cmd in ("sed -i s/1/2/ tests/test_x.py", "git push --force origin hx/T-1", "git push origin main",
                    "git push origin HEAD:refs/heads/main", "git rebase origin/main", "hx approve T-1",
                    "echo ok > tests/test_x.py"):
            out = self.hook("pre-tool", tool_name="Bash", tool_input={"command": cmd})
            self.assertEqual(self.decision(out), "deny", cmd)
        for cmd in ("git push origin hx/T-1", "python3 -m unittest", "git merge origin/main", "hx done"):
            self.assertIsNone(self.hook("pre-tool", tool_name="Bash", tool_input={"command": cmd}), cmd)
        reason = self.hook("pre-tool", tool_name="Write", tool_input={"file_path": frozen})
        self.assertIn("FROZEN", reason["hookSpecificOutput"]["permissionDecisionReason"])

    def test_no_false_positives_from_the_real_pilot(self):
        """Exact read-only commands real agents ran in the pilot that an earlier regex wrongly denied."""
        self.to_green()
        for cmd in ("git status && git branch --show-current && git log --oneline -3 && ls -R pkg tests 2>/dev/null; "
                    "cat tests/test_x.py 2>/dev/null",
                    "python3 -m unittest tests.test_x 2>&1 | tail -n 5",
                    "cat tests/test_x.py > /tmp/copy.py",
                    "git diff --stat HEAD~1 -- tests/ ; echo \"exit=$?\""):
            self.assertIsNone(self.hook("pre-tool", tool_name="Bash", tool_input={"command": cmd}), cmd)
        for cmd in ("printf 'x' >> tests/test_x.py", "sed -i.bak 's/1/2/' tests/test_x.py",
                    "cp /tmp/other.py tests/test_x.py", "echo hi > ./tests/test_x.py"):
            self.assertEqual(self.decision(self.hook("pre-tool", tool_name="Bash", tool_input={"command": cmd})),
                             "deny", cmd)

    def test_reviewer_may_inspect_but_not_write(self):
        self.to_green()
        self.hx.submit("s1", "tests_green", sha="c" * 40)
        self.hx.done("s1")
        self.hx.claim("s2", "reviewer", "T-1")
        e = lambda cmd: self.hook("pre-tool", session="s2", tool_name="Bash", tool_input={"command": cmd})
        for cmd in ("git checkout -q fa6d6b5 2>&1; python3 -m unittest tests.test_x 2>&1 | tail -15",
                    "mkdir -p /tmp/scratch && git show HEAD:pkg/x.py > /tmp/scratch/x.py"):
            self.assertIsNone(e(cmd), cmd)
        for cmd in ("git commit -am fix", "git push origin hx/T-1", "git merge main"):
            self.assertEqual(self.decision(e(cmd)), "deny", cmd)

    def test_reviewer_cannot_change_anything(self):
        self.to_green()
        self.hx.submit("s1", "tests_green", sha="c" * 40)
        self.hx.done("s1")
        self.hx.claim("s2", "reviewer", "T-1")
        e = lambda **kw: self.hook("pre-tool", session="s2", **kw)
        self.assertEqual(self.decision(e(tool_name="Edit", tool_input={"file_path": "x.py"})), "deny")
        self.assertEqual(self.decision(e(tool_name="Bash", tool_input={"command": "git commit -am fix"})), "deny")
        self.assertIsNone(e(tool_name="Read", tool_input={"file_path": "x.py"}))
        self.assertIsNone(e(tool_name="Bash", tool_input={"command": "git diff main..HEAD"}))

    def test_zombie_is_stopped_but_may_read(self):
        self.hx.create_ticket(ticket())
        self.start_on()
        self.at(16 * 60)
        self.hx.tick()
        self.hx.claim("s2", "worker", "T-1")
        out = self.hook("pre-tool", tool_name="Edit", tool_input={"file_path": "a.py"})
        self.assertEqual(self.decision(out), "deny")
        self.assertIn("LEASE_LOST", out["hookSpecificOutput"]["permissionDecisionReason"])
        self.assertIsNone(self.hook("pre-tool", tool_name="Read", tool_input={"file_path": "a.py"}))
        self.assertIsNone(self.hook("pre-tool", tool_name="Bash", tool_input={"command": "hx brief"}))

    def test_owner_pause_stops_the_holder(self):
        self.hx.create_ticket(ticket())
        self.start_on()
        self.hx.pause()
        out = self.hook("pre-tool", tool_name="Bash", tool_input={"command": "git commit -am wip"})
        self.assertEqual(self.decision(out), "deny")

    def test_no_hx_session_is_left_alone(self):
        self.assertIsNone(self.hook("pre-tool", tool_name="Edit", tool_input={"file_path": "a.py"}))


class TestPostToolStopEnd(HookCase):
    def test_heartbeat_is_throttled(self):
        self.hx.create_ticket(ticket())
        self.start_on()
        n0 = len(self.hx.events())
        self.at(301)
        self.hook("post-tool", tool_name="Read", tool_input={})
        self.at(310)
        self.hook("post-tool", tool_name="Read", tool_input={})
        hb = [e for e in self.hx.events()[n0:] if e["type"] == "heartbeat"]
        self.assertEqual(len(hb), 1)

    def test_notices_delivered_once_and_checkpoint_nag(self):
        self.hx.create_ticket(ticket())
        self.start_on()
        self.hx.edit("T-1", priority=1)
        out = self.hook("post-tool", tool_name="Read", tool_input={})
        self.assertIn("Owner edited the ticket", self.ctx(out))
        outs = [self.hook("post-tool", tool_name="Read", tool_input={}) for _ in range(30)]
        texts = [self.ctx(o) for o in outs if o]
        self.assertFalse(any("Owner edited" in t for t in texts), "a notice is delivered once")
        self.assertTrue(any("tool calls since your last checkpoint" in t for t in texts))

    def test_large_context_suggests_handover(self):
        self.hx.create_ticket(ticket())
        self.start_on()
        tp = os.path.join(self.dir, "transcript.jsonl")
        with open(tp, "w") as f:
            f.write("x" * 2000)
        with mock.patch.object(hooks, "CONTEXT_BYTES", 1000):
            out = self.hook("post-tool", tool_name="Read", tool_input={}, transcript_path=tp)
        self.assertIn("context is large", self.ctx(out))

    def test_stop_is_refused_twice_then_hands_over(self):
        self.hx.create_ticket(ticket())
        self.start_on()
        for _ in range(2):
            out = self.hook("stop", stop_hook_active=False)
            self.assertEqual(out["decision"], "block")
            self.assertIn("[ ] doc", out["reason"])
        self.assertIsNone(self.hook("stop", stop_hook_active=True))
        run = self.hx.state()["tickets"]["T-1"]["run"]
        self.assertEqual((run["status"], run["handovers"]), ("ready", 1))
        self.assertIsNone(self.hook("stop"), "no lease, nothing to guard")

    def test_session_end_releases(self):
        self.hx.create_ticket(ticket())
        self.start_on()
        self.hook("session-end", reason="prompt_input_exit")
        self.assertEqual(self.hx.state()["leases"], {})

    def test_hooks_fail_open(self):
        os.environ["HX_STORE"] = "/proc/definitely/not/writable/log.jsonl"
        out = self.hook("pre-tool", tool_name="Edit", tool_input={"file_path": "a.py"})
        self.assertIsNone(out)


if __name__ == "__main__":
    unittest.main()
