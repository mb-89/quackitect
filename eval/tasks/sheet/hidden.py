import unittest

from sheet import Sheet


class Hidden(unittest.TestCase):
    def setUp(self):
        self.s = Sheet()

    def test_refs(self):
        self.s.set("a1", "5")
        self.assertEqual(self.s.get("A1"), 5)
        for bad in ("A0", "A100", "AA1", "1A", ""):
            with self.assertRaises(ValueError, msg=bad):
                self.s.set(bad, "1")

    def test_raw_and_empty(self):
        self.assertEqual(self.s.raw("B2"), "")
        self.assertIsNone(self.s.get("B2"))
        self.s.set("B2", "=1+1")
        self.assertEqual(self.s.raw("b2"), "=1+1")
        self.s.set("B2", "")
        self.assertIsNone(self.s.get("B2"))
        self.assertEqual(self.s.cells(), [])

    def test_literals(self):
        self.s.set("A1", "42")
        self.s.set("A2", "2.5")
        self.s.set("A3", "hello")
        self.assertEqual((self.s.get("A1"), self.s.get("A2"), self.s.get("A3")), (42, 2.5, "hello"))
        self.assertIsInstance(self.s.get("A1"), int)

    def test_precedence_and_parens(self):
        self.s.set("A1", "=2+3*4")
        self.s.set("A2", "=(2+3)*4")
        self.s.set("A3", "= -2 * -3")
        self.assertEqual((self.s.get("A1"), self.s.get("A2"), self.s.get("A3")), (14, 20, 6))

    def test_division_float(self):
        self.s.set("A1", "=6/3")
        self.assertEqual(self.s.get("A1"), 2.0)
        self.assertIsInstance(self.s.get("A1"), float)

    def test_refs_in_formulas_live(self):
        self.s.set("A1", "2")
        self.s.set("B1", "=A1*10")
        self.assertEqual(self.s.get("B1"), 20)
        self.s.set("A1", "3")
        self.assertEqual(self.s.get("B1"), 30)

    def test_empty_counts_zero(self):
        self.s.set("A1", "=Z9+1")
        self.assertEqual(self.s.get("A1"), 1)

    def test_sum_any_corner(self):
        for r, v in (("A1", "1"), ("B1", "2"), ("A2", "3"), ("B2", "4")):
            self.s.set(r, v)
        self.s.set("C1", "=SUM(B2:A1)")
        self.s.set("C2", "=sum(a1:b2)")
        self.assertEqual((self.s.get("C1"), self.s.get("C2")), (10, 10))

    def test_min_max_avg(self):
        self.s.set("A1", "4")
        self.s.set("A3", "8")
        self.s.set("B1", "=MIN(A1:A3)")
        self.s.set("B2", "=MAX(A1:A3)")
        self.s.set("B3", "=AVG(A1:A3)")
        self.assertEqual((self.s.get("B1"), self.s.get("B2"), self.s.get("B3")), (4, 8, 6.0))

    def test_empty_ranges(self):
        self.s.set("A1", "=MIN(C1:C3)")
        self.s.set("A2", "=MAX(C1:C3)")
        self.s.set("A3", "=AVG(C1:C3)")
        self.assertEqual((self.s.get("A1"), self.s.get("A2"), self.s.get("A3")), (0, 0, "#DIV/0!"))

    def test_div_zero(self):
        self.s.set("A1", "=1/0")
        self.s.set("A2", "=1/B9")
        self.assertEqual((self.s.get("A1"), self.s.get("A2")), ("#DIV/0!", "#DIV/0!"))

    def test_value_error(self):
        self.s.set("A1", "text")
        self.s.set("A2", "=A1+1")
        self.s.set("A3", "=SUM(A1:A1)")
        self.assertEqual((self.s.get("A2"), self.s.get("A3")), ("#VALUE!", "#VALUE!"))

    def test_ref_error(self):
        self.s.set("A1", "=A100+1")
        self.assertEqual(self.s.get("A1"), "#REF!")

    def test_cycles(self):
        self.s.set("A1", "=B1")
        self.s.set("B1", "=A1")
        self.s.set("C1", "=C1")
        self.s.set("D1", "=A1+1")
        self.assertEqual([self.s.get(r) for r in ("A1", "B1", "C1", "D1")], ["#CYCLE!"] * 4)

    def test_cycle_through_range(self):
        self.s.set("A1", "=SUM(A1:A3)")
        self.assertEqual(self.s.get("A1"), "#CYCLE!")

    def test_cycle_breaks(self):
        self.s.set("A1", "=B1")
        self.s.set("B1", "=A1")
        self.s.set("B1", "7")
        self.assertEqual(self.s.get("A1"), 7)

    def test_parse_errors(self):
        for f in ("=1+", "=SUM(A1)", "=FOO(A1:A2)", "=(1", "="):
            self.s.set("A1", f)
            self.assertEqual(self.s.get("A1"), "#ERR!", f)

    def test_error_propagates(self):
        self.s.set("A1", "=1/0")
        self.s.set("A2", "=A1*2")
        self.s.set("A3", "=SUM(A1:A2)")
        self.assertEqual((self.s.get("A2"), self.s.get("A3")), ("#DIV/0!", "#DIV/0!"))

    def test_first_error_wins(self):
        self.s.set("A1", "=1/0")
        self.s.set("A2", "x")
        self.s.set("B1", "=A2+A1")
        self.s.set("B2", "=A1+A2")
        self.assertEqual((self.s.get("B1"), self.s.get("B2")), ("#VALUE!", "#DIV/0!"))

    def test_cells_order(self):
        for r in ("B2", "A2", "C1", "a1"):
            self.s.set(r, "1")
        self.assertEqual(self.s.cells(), ["A1", "C1", "A2", "B2"])

    def test_csv(self):
        self.s.set("A1", "1")
        self.s.set("C1", "=A1/2")
        self.s.set("B2", "x")
        self.assertEqual(self.s.to_csv(), "1,,0.5\n,x,")
