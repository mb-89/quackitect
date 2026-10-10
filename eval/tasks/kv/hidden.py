import unittest

from kv import Store


class Clock:
    def __init__(self):
        self.t = 1000.0

    def __call__(self):
        return self.t


class Hidden(unittest.TestCase):
    def setUp(self):
        self.c = Clock()
        self.s = Store(clock=self.c)

    def test_set_get(self):
        self.s.set("a", "1")
        self.assertEqual(self.s.get("a"), "1")
        self.assertIsNone(self.s.get("b"))

    def test_delete(self):
        self.s.set("a", "1")
        self.assertTrue(self.s.delete("a"))
        self.assertFalse(self.s.delete("a"))
        self.assertIsNone(self.s.get("a"))

    def test_bad_keys(self):
        for k in ("", "a b", 5):
            with self.assertRaises(ValueError, msg=repr(k)):
                self.s.set(k, "v")

    def test_bad_value(self):
        with self.assertRaises(TypeError):
            self.s.set("a", 5)

    def test_tx_rollback(self):
        self.s.set("a", "1")
        self.s.begin()
        self.s.set("a", "2")
        self.assertEqual(self.s.get("a"), "2")
        self.s.rollback()
        self.assertEqual(self.s.get("a"), "1")

    def test_nested(self):
        self.s.begin()
        self.s.set("a", "1")
        self.s.begin()
        self.s.set("a", "2")
        self.s.rollback()
        self.assertEqual(self.s.get("a"), "1")
        self.s.commit()
        self.assertEqual(self.s.get("a"), "1")
        with self.assertRaises(RuntimeError):
            self.s.rollback()

    def test_no_tx(self):
        for f in (self.s.commit, self.s.rollback):
            with self.assertRaises(RuntimeError):
                f()

    def test_delete_in_tx(self):
        self.s.set("a", "1")
        self.s.begin()
        self.assertTrue(self.s.delete("a"))
        self.assertIsNone(self.s.get("a"))
        self.s.rollback()
        self.assertEqual(self.s.get("a"), "1")

    def test_delete_nested_commit(self):
        self.s.set("a", "1")
        self.s.begin()
        self.s.begin()
        self.s.delete("a")
        self.s.commit()
        self.assertIsNone(self.s.get("a"))
        self.s.commit()
        self.assertIsNone(self.s.get("a"))
        self.assertEqual(self.s.keys(), [])

    def test_count(self):
        self.s.set("a", "x")
        self.s.set("b", "x")
        self.s.begin()
        self.s.set("c", "x")
        self.s.delete("a")
        self.assertEqual(self.s.count("x"), 2)

    def test_ttl(self):
        self.s.set("a", "x", ttl=10)
        self.c.t += 9.9
        self.assertEqual(self.s.get("a"), "x")
        self.c.t += 0.1
        self.assertIsNone(self.s.get("a"))
        self.assertFalse(self.s.delete("a"))
        self.assertEqual(self.s.count("x"), 0)

    def test_bad_ttl(self):
        for t in (0, -1):
            with self.assertRaises(ValueError):
                self.s.set("a", "x", ttl=t)

    def test_ttl_survives_commit(self):
        self.s.begin()
        self.s.set("a", "x", ttl=5)
        self.s.commit()
        self.assertEqual(self.s.get("a"), "x")
        self.c.t += 5
        self.assertIsNone(self.s.get("a"))

    def test_keys(self):
        for k in ("b2", "a1", "b1", "c"):
            self.s.set(k, "v")
        self.s.set("b3", "v", ttl=1)
        self.s.delete("c")
        self.c.t += 2
        self.assertEqual(self.s.keys(), ["a1", "b1", "b2"])
        self.assertEqual(self.s.keys("b"), ["b1", "b2"])

    def test_snapshot_restore(self):
        self.s.set("a", "1")
        self.s.begin()
        self.s.set("b", "2")
        self.assertEqual(self.s.snapshot(), {"a": "1", "b": "2"})
        with self.assertRaises(RuntimeError):
            self.s.restore({"z": "9"})
        self.s.commit()
        self.s.restore({"z": "9"})
        self.assertEqual(self.s.snapshot(), {"z": "9"})

    def test_exec_basic(self):
        e = self.s.execute
        self.assertEqual(e("SET a 1"), "OK")
        self.assertEqual(e("get a"), "1")
        self.assertEqual(e("GET A"), "NULL")

    def test_exec_del_count(self):
        e = self.s.execute
        e("SET a x")
        e("SET b x")
        self.assertEqual(e("COUNT x"), "2")
        self.assertEqual(e("DEL a"), "1")
        self.assertEqual(e("DEL a"), "0")

    def test_exec_tx(self):
        e = self.s.execute
        self.assertEqual(e("ROLLBACK"), "NO TRANSACTION")
        self.assertEqual(e("BEGIN"), "OK")
        e("SET a 1")
        self.assertEqual(e("ROLLBACK"), "OK")
        self.assertEqual(e("GET a"), "NULL")
        self.assertEqual(e("COMMIT"), "NO TRANSACTION")

    def test_exec_errors(self):
        e = self.s.execute
        self.assertEqual(e("FROB a"), "ERR unknown command")
        self.assertEqual(e("SET a"), "ERR wrong number of arguments")
        self.assertEqual(e("GET"), "ERR wrong number of arguments")

    def test_script_and_keys(self):
        out = self.s.run_script("SET b 1\n\nSET a 2\nKEYS\nKEYS b\nKEYS z")
        self.assertEqual(out, ["OK", "OK", "a b", "b", ""])
