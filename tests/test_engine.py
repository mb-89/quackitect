import unittest

from baton import gates as G
from baton.card import render
from baton.engine import BatonError
from tests.util import (DESIGN, FAILING_TEST, IMPL, SPEC, TEST_CMD, commit,
                        make_engine, make_repo, write)

A, A2, H = "agent:a1", "agent:a2", "helper:r1"


class Route(unittest.TestCase):
    def setUp(self):
        self.eng, self.clock, _ = make_engine()
        self.repo = make_repo()
        self.w = self.eng.create("Add mul", "Add a mul function to calc.",
                                 group="calc", repo=self.repo, test_cmd=TEST_CMD)

    def to_red(self):
        e = self.eng
        self.assertEqual(e.take(A), self.w)
        self.assertTrue(e.done(A, {"spec": SPEC}, "spec written")["closed"])
        self.assertTrue(e.done(A, {"design": DESIGN}, "design written")["closed"])

    def to_review(self):
        self.to_red()
        write(self.repo, "tests/test_mul.py", FAILING_TEST)
        commit(self.repo, "red")
        self.assertEqual(self.eng.done(A, {}, "tests fail on missing mul")["closed"], "red")
        write(self.repo, "calc.py", IMPL)
        commit(self.repo, "green")
        res = self.eng.done(A, {}, "mul implemented; tests pass")
        self.assertEqual(res["closed"], "green")
        self.assertFalse(res["still_yours"])

    def test_claim_needs_baton_and_evidence(self):
        self.eng.take(A)
        with self.assertRaises(BatonError):
            self.eng.done(A, {"spec": SPEC}, "")
        res = self.eng.done(A, {"spec": "too short"}, "b")
        self.assertFalse(res["ok"])
        self.assertIn("spec", res["failures"][0])
        self.assertEqual(self.eng.get(self.w).step_name, "draft")
        self.assertIn("LAST CLAIM FAILED", render(self.eng.held(A), A, self.clock()))

    def test_red_refuses_passing_tests_and_dirty_tree(self):
        self.to_red()
        write(self.repo, "tests/test_mul.py", FAILING_TEST)
        res = self.eng.done(A, {}, "b")
        self.assertIn("uncommitted", res["failures"][0])
        write(self.repo, "tests/test_mul.py", "import unittest\n")
        write(self.repo, "tests/test_ok.py", "import unittest\nclass T(unittest.TestCase):\n"
              "    def test_ok(self):\n        pass\n")
        commit(self.repo)
        res = self.eng.done(A, {}, "b")
        self.assertIn("expected to fail", res["failures"][0])

    def test_green_refuses_edited_tests(self):
        self.to_red()
        write(self.repo, "tests/test_mul.py", FAILING_TEST)
        commit(self.repo, "red")
        self.eng.done(A, {}, "red")
        write(self.repo, "tests/test_mul.py", "import unittest\n")
        commit(self.repo, "cheat")
        res = self.eng.done(A, {}, "green?")
        self.assertIn("frozen", res["failures"][0])

    def test_full_route_with_bounce(self):
        e = self.eng
        self.to_review()
        self.assertIsNone(e.take(A2), "review belongs to helpers")
        self.assertEqual(e.take(H), self.w)
        with self.assertRaises(BatonError):
            e.verdict(H, False, [])
        res = e.verdict(H, False, ["mul lacks a docstring"])
        self.assertEqual(res["bounced_to"], "green")
        w = e.get(self.w)
        self.assertEqual((w.step_name, w.bounces, w.lease), ("green", 1, None))
        self.assertEqual(e.take(A), self.w)
        self.assertIn("mul lacks a docstring", render(e.held(A), A, self.clock()))
        write(self.repo, "calc.py", IMPL.replace("    return a * b", '    """Product."""\n    return a * b'))
        commit(self.repo, "docstring")
        self.assertEqual(e.done(A, {}, "docstring added")["closed"], "green")
        self.assertEqual(e.take(H), self.w)
        self.assertEqual(e.verdict(H, True)["closed"], "review")
        box = e.inbox()
        self.assertEqual([i["kind"] for i in box["needs"]], ["approve"])
        res = e.approve(self.w)
        self.assertIn("waiting for CI", res["pending"][0])
        sha = G.head(self.repo)
        self.assertEqual(e.ci(self.w, sha, True)["closed"], "accept")
        self.assertEqual(e.take(A), self.w)
        res = e.done(A, {"retro": "Review asked for a docstring; a lint rule would catch it earlier."}, "retro done")
        self.assertEqual(res["closed"], "retro")
        self.assertTrue(e.get(self.w).done)
        forge = [x["data"]["action"] for x in e.s.events(self.w) if x["kind"] == "forge.request"]
        self.assertEqual(forge, ["open_draft_pr", "mark_ready", "merge"])

    def test_review_goes_stale_when_head_moves(self):
        self.to_review()
        e = self.eng
        e.take(H)
        e.s.append(self.w, H, "verdict", {"step": "review", "sha": "0" * 40,
                                            "approve": True, "findings": []})
        res = e._try_close(self.w, H)
        self.assertIn("HEAD moved", res["pending"][0])

    def test_ci_red_at_accept_bounces(self):
        self.to_review()
        e = self.eng
        e.take(H)
        e.verdict(H, True)
        res = e.ci(self.w, G.head(self.repo), False)
        self.assertEqual(res["bounced_to"], "green")

    def test_owner_reject_at_accept(self):
        self.to_review()
        e = self.eng
        e.take(H)
        e.verdict(H, True)
        e.reject(self.w, "name it product, not mul")
        w = e.get(self.w)
        self.assertEqual(w.step_name, "green")
        self.assertEqual(w.findings, ["name it product, not mul"])


class Supervisor(unittest.TestCase):
    def setUp(self):
        self.eng, self.clock, _ = make_engine(lease_ttl=60, spin_after=600, spin_calls=10)
        self.w = self.eng.create("Write a note", "Write a short spec.")

    def test_dead_agent_lease_expires_then_escalates(self):
        e = self.eng
        e.take(A)
        e.jot(A, "started", baton="outline: three bullets, second one open")
        self.clock.advance(61)
        kinds = [x["kind"] for x in e.tick()]
        self.assertEqual(kinds, ["lease.expired"])
        self.assertEqual(e.get(self.w).status, "ready")
        self.assertEqual(e.take(A2), self.w)
        self.assertIn("second one open", render(e.held(A2), A2, self.clock()))
        self.clock.advance(61)
        kinds = [x["kind"] for x in e.tick()]
        self.assertEqual(kinds, ["lease.expired", "escalate"])
        self.assertEqual(e.inbox()["needs"][0]["kind"], "stuck")
        self.assertIsNone(e.take(A))
        e.resume(self.w, "write the spec in two sentences")
        self.assertEqual(e.take(A), self.w)
        self.assertIn("two sentences", render(e.held(A), A, self.clock()))

    def test_spinning_agent_nudged_then_escalated(self):
        e = self.eng
        e.take(A)
        for _ in range(11):
            self.clock.advance(1)
            e.heartbeat(A)
        self.assertEqual([x["kind"] for x in e.tick()], ["nudge"])
        self.assertIn("NUDGE", render(e.held(A), A, self.clock()))
        for _ in range(6):
            e.heartbeat(A)
        self.assertEqual([x["kind"] for x in e.tick()], ["escalate"])
        self.assertEqual(e.get(self.w).status, "escalated")

    def test_progress_resets_spin(self):
        e = self.eng
        e.take(A)
        for _ in range(11):
            e.heartbeat(A)
        e.done(A, {"spec": SPEC}, "spec")
        self.assertEqual(e.tick(), [])

    def test_bounces_escalate(self):
        e = self.eng
        for _ in range(4):
            e.reject(self.w, "no")
        self.assertEqual(e.get(self.w).status, "escalated")


class Owner(unittest.TestCase):
    def setUp(self):
        self.eng, self.clock, _ = make_engine()

    def test_agent_minted_work_waits_for_owner_yes(self):
        e = self.eng
        wid = e.mint(A, "Refactor", "Split calc into modules.")
        e.take(A)
        res = e.done(A, {"spec": SPEC}, "spec for the refactor")
        self.assertEqual(res["pending"], ["waiting for the owner"])
        self.assertIsNone(e.held(A))
        self.assertEqual(e.inbox()["needs"][0]["kind"], "approve")
        self.assertEqual(e.approve(wid)["closed"], "draft")
        self.assertEqual(e.get(wid).step_name, "design")

    def test_question_releases_lease_and_answer_reaches_card(self):
        e = self.eng
        wid = e.create("t", "ask")
        e.take(A)
        e.ask(A, "CSV or JSON?", ["CSV", "JSON"])
        self.assertEqual(e.get(wid).status, "waiting")
        self.assertIsNone(e.take(A2))
        need = e.inbox()["needs"][0]
        self.assertEqual((need["kind"], need["options"]), ("question", ["CSV", "JSON"]))
        e.answer(wid, "CSV")
        e.take(A2)
        self.assertIn("A: CSV", render(e.held(A2), A2, self.clock()))

    def test_dependencies_and_priority(self):
        e = self.eng
        w1 = e.create("first", "a")
        w2 = e.create("second", "b", after=[w1])
        w3 = e.create("urgent", "c")
        e.prioritize(w3, 5)
        self.assertEqual(e.take(A), w3)
        self.assertEqual(e.take(A2), w1)
        self.assertIsNone(e.take("agent:a3"), f"{w2} waits for {w1}")

    def test_one_lease_per_actor_and_pause(self):
        e = self.eng
        w1 = e.create("one", "a")
        e.create("two", "b")
        self.assertEqual(e.take(A), w1)
        self.assertEqual(e.take(A), w1)
        e.pause(w1)
        self.assertIsNone(e.held(A))
        self.assertEqual(e.get(w1).status, "paused")


class Gates(unittest.TestCase):
    def test_author_cannot_review(self):
        from baton.engine import Work
        w = Work(id="W1", title="t", ask="a")
        w.closed = {"green": {"actor": "helper:x", "sha": "s"}}
        w.verdicts = [{"step": "review", "actor": "helper:x", "sha": "s", "approve": True, "findings": []}]
        st, why, _ = G.check({"kind": "verdict", "author_step": "green"},
                             {"work": w, "step": "review", "repo": None, "sha": "s", "evidence": {}})
        self.assertEqual(st, G.FAIL)
        self.assertIn("author", why)


if __name__ == "__main__":
    unittest.main()
