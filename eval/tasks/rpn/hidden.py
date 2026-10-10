import unittest

import rpn


class Hidden(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(rpn.evaluate("3 4 +"), 7)
        self.assertEqual(rpn.evaluate("5 1 2 + 4 * + 3 -"), 14)

    def test_division_is_float(self):
        r = rpn.evaluate("6 2 /")
        self.assertEqual(r, 3.0)
        self.assertIsInstance(r, float)

    def test_power_and_int(self):
        r = rpn.evaluate("2 10 ^")
        self.assertEqual(r, 1024)
        self.assertIsInstance(r, int)

    def test_numbers(self):
        self.assertEqual(rpn.evaluate("-2 3 *"), -6)
        self.assertEqual(rpn.evaluate("4.5 2 *"), 9.0)

    def test_stack_ops(self):
        self.assertEqual(rpn.evaluate("3 dup *"), 9)
        self.assertEqual(rpn.evaluate("1 2 swap -"), 1)
        self.assertEqual(rpn.evaluate("1 2 drop"), 1)

    def test_env(self):
        self.assertEqual(rpn.evaluate("x 2 *", {"x": 5}), 10)

    def test_assignment(self):
        env = {}
        self.assertIsNone(rpn.evaluate("5 =x", env))
        self.assertEqual(env, {"x": 5})
        self.assertEqual(rpn.evaluate("5 =y y y *", {}), 25)

    def test_end_states(self):
        for s in ("", "   ", "1 2"):
            with self.assertRaises(ValueError, msg=repr(s)):
                rpn.evaluate(s)

    def test_underflow(self):
        for s in ("+", "1 +", "drop", "1 swap"):
            with self.assertRaises(ValueError, msg=s):
                rpn.evaluate(s)

    def test_div_zero(self):
        with self.assertRaises(ValueError):
            rpn.evaluate("1 0 /")

    def test_unknown(self):
        for s in ("1 %", "3x", "y"):
            with self.assertRaises(ValueError, msg=s):
                rpn.evaluate(s, {})

    def test_lines(self):
        self.assertEqual(rpn.evaluate_lines("# c\n5 =r\n\nr r *\n2 r +"), [25, 7])
