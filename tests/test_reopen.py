"""An agent that finds its own tests wrong sends the work back itself."""

import unittest

from baton.card import render
from baton.engine import BatonError
from tests.util import (DESIGN, FAILING_TEST, SPEC, TEST_CMD, commit,
                        make_engine, make_repo, write)

A, H = "agent:a1", "helper:r1"
WRONG = FAILING_TEST.replace("12)", "13)")


class Reopen(unittest.TestCase):
    def setUp(self):
        self.eng, self.clock, _ = make_engine()
        self.repo = make_repo()
        e = self.eng
        self.w = e.create("Add mul", "Add mul.", repo=self.repo, test_cmd=TEST_CMD)
        e.take(A)
        e.done(A, {"spec": SPEC}, "spec")
        e.done(A, {"design": DESIGN}, "design")
        write(self.repo, "tests/test_mul.py", WRONG)
        commit(self.repo, "red with a wrong expectation")
        e.done(A, {}, "red")

    def test_reopen_red_then_fix_tests(self):
        e = self.eng
        res = e.reopen(A, "red", "test_mul expects 3*4 == 13; the spec says 12")
        self.assertEqual(res["bounced_to"], "red")
        w = e.get(self.w)
        self.assertEqual((w.step_name, w.lease, w.bounces), ("red", A, 1))
        write(self.repo, "tests/test_mul.py", FAILING_TEST)
        commit(self.repo, "fix the expectation")
        self.assertEqual(e.done(A, {}, "red again")["closed"], "red")

    def test_reopened_red_closes_with_code_present(self):
        e = self.eng
        from tests.util import IMPL
        write(self.repo, "calc.py", IMPL)
        commit(self.repo, "green attempt")
        self.assertIn("failures", e.done(A, {}, "green?"))  # the wrong test fails
        e.reopen(A, "red", "test expects 13; the spec says 12")
        write(self.repo, "tests/test_mul.py", FAILING_TEST)
        commit(self.repo, "fix the expectation")
        res = e.done(A, {}, "red repaired; tests pass with the code already there")
        self.assertEqual(res["closed"], "red")
        self.assertEqual(e.done(A, {}, "green")["closed"], "green")

    def test_reviewer_sees_the_reopen(self):
        e = self.eng
        e.reopen(A, "red", "test_mul expects 13; the spec says 12")
        write(self.repo, "tests/test_mul.py", FAILING_TEST)
        commit(self.repo, "fix")
        e.done(A, {}, "red")
        write(self.repo, "calc.py", "def mul(a, b):\n    return a * b\n")
        commit(self.repo, "green")
        e.done(A, {}, "green")
        e.take(H)
        card = render(e.held(H), H, self.clock())
        self.assertIn("SENT BACK BEFORE", card)
        self.assertIn("expects 13", card)

    def test_reopen_refuses_forward_and_helper_steps(self):
        e = self.eng
        with self.assertRaises(BatonError):
            e.reopen(A, "review", "x")
        with self.assertRaises(BatonError):
            e.reopen(A, "red", "")

    def test_reopens_count_toward_escalation(self):
        e = self.eng
        e.reopen(A, "red", "wrong test")
        for _ in range(3):
            self.assertFalse(e.get(self.w).escalation)
            e.reopen(A, "design", "design misses a case")
            if e.get(self.w).escalation:
                break
            e.done(A, {"design": DESIGN}, "design again")
        self.assertTrue(e.get(self.w).escalation)


if __name__ == "__main__":
    unittest.main()
