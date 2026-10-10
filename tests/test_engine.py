import unittest

from harness.engine import HarnessError
from tests.helpers import commit, make, run_implement_step, run_review_step, run_test_step


class HappyPath(unittest.TestCase):
    def test_mvp_route_runs_to_done(self):
        eng, repo, clock = make("mvp")
        self.assertEqual(eng.ticket("t1")["step"], "test")
        self.assertEqual(run_test_step(eng, repo)["verdict"], "pass")
        self.assertEqual(eng.ticket("t1")["step"], "implement")
        self.assertEqual(run_implement_step(eng, repo)["verdict"], "pass")
        self.assertEqual(eng.ticket("t1")["step"], "review")
        self.assertEqual(run_review_step(eng)["verdict"], "pass")
        t = eng.ticket("t1")
        self.assertEqual((t["step"], t["state"]), ("done", "done"))
        kinds = [e["kind"] for e in eng.timeline("t1")["events"]]
        self.assertIn("gate", kinds)
        self.assertEqual(kinds[-1], "done")

    def test_briefing_names_goal_and_closing_conditions(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        self.assertIn("fizzbuzz", c["briefing"])
        self.assertIn("FAILS", c["briefing"])
        self.assertIn("harness_handover", c["briefing"])


class RedGate(unittest.TestCase):
    def test_tests_that_pass_fail_the_red_gate(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        sha = commit(repo, "ticket/t1", {"tests/test_fizz.py": "assert True"}, tests_exit=0)
        eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        r = eng.done(c["attempt"], c["token"])
        self.assertEqual(r["verdict"], "fail")
        self.assertIn("must fail", r["detail"])
        self.assertEqual(eng.ticket("t1")["step"], "test")

    def test_no_test_file_fails_the_red_gate(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        sha = commit(repo, "ticket/t1", {"fizz.py": "broken"}, tests_exit=1)
        eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        r = eng.done(c["attempt"], c["token"])
        self.assertEqual(r["verdict"], "fail")
        self.assertIn("adds a test", r["detail"])

    def test_missing_commit_fails(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        r = eng.done(c["attempt"], c["token"])
        self.assertEqual(r["verdict"], "fail")
        self.assertIn("missing evidence", r["detail"])

    def test_commit_off_branch_refused(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        with self.assertRaises(HarnessError) as cm:
            eng.evidence(c["attempt"], c["token"], "commit", {"sha": "deadbeef"})
        self.assertEqual(cm.exception.code, "no_such_commit")


class GreenGate(unittest.TestCase):
    def test_failing_tests_fail_the_green_gate_and_carry_the_output(self):
        eng, repo, clock = make("mvp")
        run_test_step(eng, repo)
        r = run_implement_step(eng, repo, tests_exit=1)
        self.assertEqual(r["verdict"], "fail")
        t = eng.ticket("t1")
        self.assertEqual(t["step"], "implement")
        self.assertEqual(t["fails"]["implement"], 1)
        c = eng.claim("t1")
        self.assertIn("the gate failed", c["briefing"])

    def test_tampered_tests_fail_without_a_note(self):
        eng, repo, clock = make("mvp")
        run_test_step(eng, repo)
        c = eng.claim("t1")
        sha = commit(repo, "ticket/t1", {"tests/test_fizz.py": "assert True", "fizz.py": "x"}, tests_exit=0)
        eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        r = eng.done(c["attempt"], c["token"])
        self.assertEqual(r["verdict"], "fail")
        self.assertIn("test_change", r["detail"])

    def test_tampered_tests_pass_with_a_note(self):
        eng, repo, clock = make("mvp")
        run_test_step(eng, repo)
        c = eng.claim("t1")
        sha = commit(repo, "ticket/t1", {"tests/test_fizz.py": "assert fizz(3)=='Fizz'  # fixed import", "fizz.py": "x"}, tests_exit=0)
        eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        eng.evidence(c["attempt"], c["token"], "test_change", {"why": "the test imported the wrong module"})
        self.assertEqual(eng.done(c["attempt"], c["token"])["verdict"], "pass")

    def test_max_fails_holds_the_ticket(self):
        eng, repo, clock = make("mvp")
        run_test_step(eng, repo)
        for _ in range(3):
            self.assertEqual(run_implement_step(eng, repo, tests_exit=1)["verdict"], "fail")
        self.assertEqual(eng.ticket("t1")["state"], "open")
        self.assertEqual(run_implement_step(eng, repo, tests_exit=1)["next_step"], "hold")
        t = eng.ticket("t1")
        self.assertEqual((t["state"], t["held_for"], t["step"]), ("held", "stuck", "implement"))
        self.assertEqual(eng.inbox()[0]["actions"][0], "retry")
        eng.retry("t1", note="the 15 case")
        t = eng.ticket("t1")
        self.assertEqual((t["state"], t["step"], t["fails"]["implement"]), ("open", "implement", 0))


class SeparationOfDuties(unittest.TestCase):
    def test_implementer_cannot_review(self):
        eng, repo, clock = make("mvp")
        run_test_step(eng, repo)
        c = eng.claim("t1")
        sha = commit(repo, "ticket/t1", {"fizz.py": "ok"}, tests_exit=0)
        eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        with self.assertRaises(HarnessError) as cm:
            eng.evidence(c["attempt"], c["token"], "review", {"verdict": "approve", "findings": []})
        self.assertEqual(cm.exception.code, "not_reviewer")

    def test_review_from_a_committing_attempt_refused(self):
        # a helper attempt on the review step that somehow committed cannot approve its own commit
        eng, repo, clock = make("mvp")
        run_test_step(eng, repo)
        run_implement_step(eng, repo)
        c = eng.claim("t1", worker="w-review")
        sha = commit(repo, "ticket/t1", {"fizz.py": "edited by reviewer"}, tests_exit=0)
        eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        with self.assertRaises(HarnessError) as cm:
            eng.evidence(c["attempt"], c["token"], "review", {"verdict": "approve", "findings": []})
        self.assertEqual(cm.exception.code, "own_work")

    def test_request_changes_sends_back_with_findings(self):
        eng, repo, clock = make("mvp")
        run_test_step(eng, repo)
        run_implement_step(eng, repo)
        r = run_review_step(eng, verdict="request_changes", findings=["fizz(15) returns Fizz"])
        self.assertEqual((r["verdict"], r["next_step"]), ("fail", "implement"))
        c = eng.claim("t1")
        self.assertIn("fizz(15) returns Fizz", c["briefing"])

    def test_decision_is_never_an_attempts_evidence(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        with self.assertRaises(HarnessError) as cm:
            eng.evidence(c["attempt"], c["token"], "decision", {"verdict": "approve"})
        self.assertEqual(cm.exception.code, "owner_only")


class HandoverAndLease(unittest.TestCase):
    def test_stop_needs_a_verb(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        ok, why = eng.can_stop(c["attempt"])
        self.assertFalse(ok)
        self.assertIn("harness_handover", why)
        with self.assertRaises(HarnessError):
            eng.handover(c["attempt"], c["token"])
        eng.handover(c["attempt"], c["token"], done="wrote test_fizz.py", remaining="commit it", files="tests/test_fizz.py")
        self.assertTrue(eng.can_stop(c["attempt"])[0])
        t = eng.ticket("t1")
        self.assertEqual((t["state"], t["attempts_on_step"]), ("open", 1))
        c2 = eng.claim("t1")
        self.assertIn("wrote test_fizz.py", c2["briefing"])
        self.assertIn("attempt 2 of 3", c2["briefing"])

    def test_lease_expiry_synthesises_a_handover_and_fences_the_zombie(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        sha = commit(repo, "ticket/t1", {"tests/test_fizz.py": "x"}, tests_exit=1)
        eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        clock.advance(1201)
        out = eng.tick()
        self.assertEqual(out["expired"], [c["attempt"]])
        t = eng.ticket("t1")
        self.assertEqual((t["state"], t["stalls"]), ("open", 1))
        with self.assertRaises(HarnessError) as cm:
            eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        self.assertEqual(cm.exception.code, "stale_lease")
        c2 = eng.claim("t1")
        self.assertIn("synthesized by the harness", c2["briefing"])
        self.assertIn("evidence filed: commit", c2["briefing"])
        self.assertIn("commits on the branch since the attempt began: 1", c2["briefing"])

    def test_verbs_renew_the_lease(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        clock.advance(1000)
        eng.status(c["attempt"], c["token"])
        clock.advance(1000)
        self.assertEqual(eng.tick()["expired"], [])

    def test_spinning_is_flagged_then_killed(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        for _ in range(7):
            clock.advance(100)
            eng.heartbeat(c["attempt"], c["token"])  # alive, no progress
        out = eng.tick()
        self.assertEqual(out["handover_requested"], [c["attempt"]])
        self.assertIn("hand_over_now", eng.status(c["attempt"], c["token"])["flags"])
        clock.advance(300)
        eng.heartbeat(c["attempt"], c["token"])
        out = eng.tick()
        self.assertEqual(out["kill"], [c["attempt"]])
        self.assertEqual(eng.ticket("t1")["state"], "open")

    def test_exhausted_attempts_hold(self):
        eng, repo, clock = make("mvp")
        for _ in range(3):
            c = eng.claim("t1")
            clock.advance(1201)
            eng.tick()
        t = eng.ticket("t1")
        self.assertEqual((t["state"], t["held_for"], t["stalls"]), ("held", "stuck", 3))
        card = eng.inbox()[0]
        self.assertEqual(card["reason"], "stuck")
        self.assertIn("left no handover", card["handover"]["remaining"])


class OwnerVerbs(unittest.TestCase):
    def test_human_step_holds_for_a_decision(self):
        eng, repo, clock = make("trivial")
        c = eng.claim("t1")
        sha = commit(repo, "ticket/t1", {"fizz.py": "ok"}, tests_exit=0)
        eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        self.assertEqual(eng.done(c["attempt"], c["token"])["verdict"], "pass")
        t = eng.ticket("t1")
        self.assertEqual((t["step"], t["state"], t["held_for"]), ("accept", "held", "decision"))
        with self.assertRaises(HarnessError):
            eng.claim("t1")
        card = eng.inbox()[0]
        self.assertEqual(card["actions"], ["approve", "reject", "pause"])
        self.assertEqual(card["evidence"]["commit"], sha)
        eng.decide("t1", "reject", note="rename to fizzbuzz")
        t = eng.ticket("t1")
        self.assertEqual((t["step"], t["state"]), ("implement", "open"))
        c = eng.claim("t1")
        self.assertIn("rename to fizzbuzz", c["briefing"])
        sha = commit(repo, "ticket/t1", {"fizzbuzz.py": "ok"}, tests_exit=0)
        eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        eng.done(c["attempt"], c["token"])
        eng.decide("t1", "approve")
        self.assertEqual(eng.ticket("t1")["state"], "done")
        self.assertIn("pr_opened", [e["kind"] for e in eng.timeline("t1")["events"]])

    def test_ask_and_answer(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        eng.ask(c["attempt"], c["token"], "should fizz(0) raise?")
        t = eng.ticket("t1")
        self.assertEqual((t["state"], t["held_for"]), ("held", "question"))
        self.assertEqual(eng.inbox()[0]["actions"][0], "answer")
        eng.answer("t1", "no, return '0'")
        self.assertEqual(eng.ticket("t1")["state"], "open")
        self.assertIn("return '0'", eng.claim("t1")["briefing"])

    def test_pause_asks_the_worker_to_hand_over(self):
        eng, repo, clock = make("mvp")
        c = eng.claim("t1")
        eng.pause("t1")
        self.assertIn("hand_over_now", eng.status(c["attempt"], c["token"])["flags"])
        eng.handover(c["attempt"], c["token"], done="half the tests")
        self.assertEqual(eng.ticket("t1")["state"], "paused")
        with self.assertRaises(HarnessError):
            eng.claim("t1")
        eng.resume("t1")
        self.assertEqual(eng.ticket("t1")["state"], "open")

    def test_owner_note_lands_in_the_briefing(self):
        eng, repo, clock = make("mvp")
        eng.owner_note("t1", "keep the public name fizz(n)")
        self.assertIn("owner: keep the public name", eng.claim("t1")["briefing"])


class Scheduling(unittest.TestCase):
    def test_ready_takes_one_ticket_per_group(self):
        eng, repo, clock = make("mvp", group="g")
        repo.commit("ticket/t2", {}, tests_exit=5, parent=repo.tip("main"))
        repo.commit("ticket/t3", {}, tests_exit=5, parent=repo.tip("main"))
        eng.mint("t2", "second", "mvp", group="g")
        eng.mint("t3", "other group", "mvp", group="h")
        self.assertEqual([t["id"] for t in eng.ready()], ["t1", "t3"])
        eng.claim("t1")
        self.assertEqual([t["id"] for t in eng.ready()], ["t3"])


if __name__ == "__main__":
    unittest.main()
