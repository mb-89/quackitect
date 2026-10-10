"""Defects an independent review found, each pinned by a test."""

import unittest

from baton import gates as G
from baton import mcp
from baton.engine import Work
from tests.util import (DESIGN, FAILING_TEST, SPEC, TEST_CMD, commit, make_engine,
                        make_repo, sh, write)

A, H = "agent:s1", "helper:s1"


class Fixes(unittest.TestCase):
    def setUp(self):
        self.eng, self.clock, _ = make_engine(spin_after=600)
        self.repo = make_repo()
        self.w = self.eng.create("Add mul", "Add mul.", repo=self.repo, test_cmd=TEST_CMD)

    def rpc(self, actor, name, args):
        return mcp.handle(self.eng, actor, {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                                            "params": {"name": name, "arguments": args}})["result"]

    def test_bad_types_never_reach_the_log(self):
        self.eng.take(A)
        for name, args in (("note", {"text": 123}), ("ask", {"question": ["x"]}),
                           ("note", {"text": "x", "baton": ["a"]})):
            self.assertTrue(self.rpc(A, name, args)["isError"], name)
        self.assertEqual(self.eng.inbox()["moving"][0]["id"], self.w)  # the fold still reads

    def test_string_false_does_not_approve(self):
        r = self.rpc(H, "verdict", {"approve": "false", "findings": ["broken"]})
        self.assertTrue(r["isError"])
        self.assertIn("boolean", r["content"][0]["text"])

    def test_minted_work_inherits_the_repo(self):
        self.eng.take(A)
        wid = self.eng.mint(A, "Follow-up", "Do the next thing.")
        self.assertEqual(self.eng.get(wid).repo, self.repo)

    def test_skip_worktree_is_refused(self):
        e = self.eng
        e.take(A)
        e.done(A, {"spec": SPEC}, "spec")
        e.done(A, {"design": DESIGN}, "design")
        write(self.repo, "tests/test_mul.py", FAILING_TEST)
        commit(self.repo, "red")
        e.done(A, {}, "red")
        sh(self.repo, "git", "update-index", "--skip-worktree", "tests/test_mul.py")
        write(self.repo, "tests/test_mul.py", "import unittest\n")
        res = e.done(A, {}, "green?")
        self.assertIn("skip-worktree", res["failures"][0])

    def test_new_lease_restarts_the_spin_clock(self):
        e = self.eng
        self.clock.advance(5000)
        e.take(A)
        self.assertEqual(e.tick(), [])

    def test_heartbeat_from_a_stranger_extends_nothing(self):
        e = self.eng
        e.take(A)
        until = e.get(self.w).lease_until
        self.clock.advance(100)
        e.s.append(self.w, "agent:other", "heartbeat", {"until": until + 10_000})
        self.assertEqual(e.get(self.w).lease_until, until)

    def test_claim_after_losing_the_lease_closes_nothing(self):
        e = self.eng
        e.take(A)
        e.s.append(self.w, "baton", "lease.expired", {})
        e.take("agent:s2")
        e.s.append(self.w, A, "evidence", {"step": "draft", "name": "spec", "text": SPEC})
        res = e._try_close(self.w, A)
        self.assertIn("lease ended", res["failures"][0])
        self.assertEqual(e.get(self.w).step_name, "draft")

    def test_same_session_cannot_review_under_another_role(self):
        w = Work(id="W1", title="t", ask="a")
        w.closed = {"green": {"actor": "agent:s1", "sha": "s"}}
        w.verdicts = [{"step": "review", "actor": "helper:s1", "sha": "s", "approve": True, "findings": []}]
        st, _, _ = G.check({"kind": "verdict", "author_step": "green"},
                           {"work": w, "step": "review", "repo": None, "sha": "s", "evidence": {}})
        self.assertEqual(st, G.FAIL)

    def test_resume_resets_bounces(self):
        e = self.eng
        for _ in range(4):
            e.reject(self.w, "no")
        e.resume(self.w, "try again")
        e.reject(self.w, "one more")
        self.assertFalse(e.get(self.w).escalation)


class Server(unittest.TestCase):
    def test_bad_lines_answer_errors(self):
        import io
        import json
        import os
        _, _, db = make_engine()
        os.environ["BATON_DB"] = db
        out = io.StringIO()
        mcp.serve(io.StringIO('not json\n[1]\n{"id":1,"method":"initialize","params":[]}\n'), out)
        replies = [json.loads(x) for x in out.getvalue().splitlines()]
        self.assertEqual([("error" in r) for r in replies], [True, True, False])


if __name__ == "__main__":
    unittest.main()
