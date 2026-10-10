import os
import tempfile
import unittest

from inv import Inventory


def inv():
    i = Inventory()
    i.add("ab1", 5, "Bolt")
    i.add("cd2", 2, 'Nut, "hex"')
    return i


class Hidden(unittest.TestCase):
    def test_case_insensitive(self):
        i = inv()
        self.assertEqual(i.stock("AB1"), 5)
        self.assertEqual(i.stock("ab1"), 5)

    def test_first_add_needs_name(self):
        with self.assertRaises(ValueError):
            Inventory().add("x1", 1)

    def test_later_names(self):
        i = inv()
        i.add("AB1", 1)
        i.add("ab1", 1, "Bolt")
        self.assertEqual(i.stock("ab1"), 7)
        with self.assertRaises(ValueError):
            i.add("ab1", 1, "Screw")

    def test_bad_qty(self):
        i = inv()
        for q in (0, -1, 2.5, "3"):
            with self.assertRaises(ValueError, msg=repr(q)):
                i.add("ab1", q)
            with self.assertRaises(ValueError, msg=repr(q)):
                i.remove("ab1", q)

    def test_remove(self):
        i = inv()
        with self.assertRaises(KeyError):
            i.remove("zz", 1)
        with self.assertRaises(ValueError):
            i.remove("ab1", 6)
        self.assertEqual(i.stock("ab1"), 5)
        i.remove("ab1", 5)
        self.assertEqual(i.stock("ab1"), 0)

    def test_unknown_stock(self):
        with self.assertRaises(KeyError):
            inv().stock("nope")

    def test_report(self):
        i = inv()
        i.add("aa0", 1, "Anchor")
        self.assertEqual(i.report(), ["AA0\tAnchor\t1", "AB1\tBolt\t5", 'CD2\tNut, "hex"\t2'])

    def test_zero_stays_in_report(self):
        i = inv()
        i.remove("cd2", 2)
        self.assertIn('CD2\tNut, "hex"\t0', i.report())

    def test_low(self):
        i = inv()
        self.assertEqual(i.low(3), ["CD2"])
        self.assertEqual(i.low(10), ["AB1", "CD2"])

    def test_history(self):
        i = inv()
        i.remove("ab1", 2)
        try:
            i.remove("ab1", 99)
        except ValueError:
            pass
        self.assertEqual(i.history, [("add", "AB1", 5), ("add", "CD2", 2), ("remove", "AB1", 2)])

    def test_save_load(self):
        i = inv()
        path = os.path.join(tempfile.mkdtemp(), "inv.csv")
        i.save(path)
        with open(path) as f:
            self.assertEqual(f.readline().strip(), "sku,name,qty")
        j = Inventory.load(path)
        self.assertEqual(j.report(), i.report())
        self.assertEqual(j.history, [])
