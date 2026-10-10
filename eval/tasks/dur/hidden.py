import subprocess
import sys
import unittest

import dur


class Hidden(unittest.TestCase):
    def test_parse_basic(self):
        self.assertEqual(dur.parse("1h30m"), 5400)

    def test_parse_all_units(self):
        self.assertEqual(dur.parse("1d2h3m4s"), 93784)

    def test_parse_space_and_case(self):
        self.assertEqual(dur.parse("  1H 30m "), 5400)

    def test_parse_bare_and_zero(self):
        self.assertEqual(dur.parse("90"), 90)
        self.assertEqual(dur.parse("0s"), 0)

    def test_reject_order_and_repeat(self):
        for s in ("30m1h", "1h1h"):
            with self.assertRaises(ValueError, msg=s):
                dur.parse(s)

    def test_reject_unit_problems(self):
        for s in ("5w", "h", "1hm"):
            with self.assertRaises(ValueError, msg=s):
                dur.parse(s)

    def test_reject_empty(self):
        for s in ("", "   "):
            with self.assertRaises(ValueError, msg=repr(s)):
                dur.parse(s)

    def test_reject_negative_and_decimal(self):
        for s in ("-5m", "-5", "1.5h"):
            with self.assertRaises(ValueError, msg=s):
                dur.parse(s)

    def test_fmt(self):
        self.assertEqual(dur.fmt(0), "0s")
        self.assertEqual(dur.fmt(3600), "1h")
        self.assertEqual(dur.fmt(90061), "1d1h1m1s")
        self.assertEqual(dur.fmt(86460), "1d1m")

    def test_fmt_negative(self):
        with self.assertRaises(ValueError):
            dur.fmt(-1)

    def test_add(self):
        self.assertEqual(dur.add("1h", "30m"), "1h30m")
        self.assertEqual(dur.add("59s", "1s"), "1m")

    def test_cli_sum(self):
        r = subprocess.run([sys.executable, "-m", "dur", "1h", "30m", "15m"],
                           capture_output=True, text=True)
        self.assertEqual((r.returncode, r.stdout.strip()), (0, "1h45m"))

    def test_cli_error(self):
        r = subprocess.run([sys.executable, "-m", "dur", "1h", "bogus"],
                           capture_output=True, text=True)
        self.assertEqual(r.returncode, 2)
        self.assertTrue(r.stderr.startswith("error:"), r.stderr)
