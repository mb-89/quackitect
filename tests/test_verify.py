"""Verifiers against real git: evidence must come from pushed commits, checked in a clean export."""
import os
import shutil
import unittest

from hx.verify import GitVerifier, classify
from tests.helpers import clone, commit_push, make_origin, sh

SLUG_STUB = '''
def slugify(title):
    raise NotImplementedError
'''
SLUG_IMPL = '''
import re


def slugify(title):
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
'''
SLUG_TEST = '''
import unittest
from textkit.slug import slugify


class TestSlug(unittest.TestCase):
    def test_ac1_lowercase(self):
        self.assertEqual(slugify("Hello"), "hello")

    def test_ac2_spaces_become_dashes(self):
        self.assertEqual(slugify("Hello World"), "hello-world")
'''
TICKET = {"id": "T-1", "title": "slugify", "criteria": [{"id": "AC1", "text": "lowercase"},
                                                          {"id": "AC2", "text": "dashes"}],
          "test_cmd": "python3 -m unittest tests.test_slug", "ci_cmd": "python3 -m unittest discover -s tests -t .",
          "heads": {}, "frozen": {}, "branch": "hx/T-1"}


def tk(**kw):
    t = {k: (dict(v) if isinstance(v, dict) else v) for k, v in TICKET.items()}
    t.update(kw)
    return t


class TestClassify(unittest.TestCase):
    def test_classify(self):
        self.assertEqual(classify(1, "FAILED (failures=2)\nRan 2 tests"), "fail")
        self.assertEqual(classify(1, "ERROR: test_x (unittest.loader._FailedTest)"), "broken")
        self.assertEqual(classify(0, "Ran 0 tests in 0.000s\nOK"), "broken")
        self.assertEqual(classify(0, "Ran 3 tests\nOK"), "pass")
        self.assertEqual(classify(1, "  File x.py\n    def f(:\nSyntaxError: invalid syntax"), "broken")


class TestGitVerifier(unittest.TestCase):
    def setUp(self):
        self.origin, self.base = make_origin()
        self.v = GitVerifier(self.origin)
        self.w = clone(self.origin, os.path.join(self.base, "w1"), "hx/T-1")

    def tearDown(self):
        shutil.rmtree(self.base, ignore_errors=True)

    def red(self, files=None):
        files = files or {"textkit/slug.py": SLUG_STUB, "tests/test_slug.py": SLUG_TEST}
        return commit_push(self.w, files, "red", "hx/T-1")

    def test_unpushed_commit_is_not_evidence(self):
        sh(["git", "commit", "-q", "--allow-empty", "-m", "local only"], self.w)
        sha = sh(["git", "rev-parse", "HEAD"], self.w)
        ok, _, rep = self.v.verify("tests_red", tk(), {"sha": sha})
        self.assertFalse(ok)
        self.assertIn("push your branch first", rep["reason"])

    def test_red_good(self):
        sha = self.red()
        ok, p, rep = self.v.verify("tests_red", tk(), {"sha": sha})
        self.assertTrue(ok, rep)
        self.assertEqual(sorted(p["frozen"]), ["tests/test_slug.py"])
        self.assertIn("2 tests", rep["summary"])

    def test_red_rejects_passing_tests(self):
        sha = self.red({"textkit/slug.py": SLUG_IMPL, "tests/test_slug.py": SLUG_TEST})
        ok, _, rep = self.v.verify("tests_red", tk(), {"sha": sha})
        self.assertFalse(ok)
        self.assertIn("already pass", rep["reason"])

    def test_red_rejects_tests_that_do_not_load(self):
        sha = self.red({"tests/test_slug.py": SLUG_TEST})  # no stub: import fails at load time
        ok, _, rep = self.v.verify("tests_red", tk(), {"sha": sha})
        self.assertFalse(ok)
        self.assertIn("do not load", rep["reason"])

    def test_red_requires_every_criterion_referenced(self):
        test = SLUG_TEST.replace("test_ac2_spaces_become_dashes", "test_spaces")
        sha = self.red({"textkit/slug.py": SLUG_STUB, "tests/test_slug.py": test})
        ok, _, rep = self.v.verify("tests_red", tk(), {"sha": sha})
        self.assertFalse(ok)
        self.assertIn("AC2", rep["reason"])

    def test_red_requires_test_changes(self):
        sha = commit_push(self.w, {"textkit/slug.py": SLUG_STUB}, "no tests", "hx/T-1")
        ok, _, rep = self.v.verify("tests_red", tk(), {"sha": sha})
        self.assertFalse(ok)
        self.assertIn("no test files", rep["reason"])

    def _green_ticket(self):
        red = self.red()
        ok, p, _ = self.v.verify("tests_red", tk(), {"sha": red})
        self.assertTrue(ok)
        return tk(heads={"red": red}, frozen=p["frozen"]), red

    def test_green_good(self):
        t, red = self._green_ticket()
        sha = commit_push(self.w, {"textkit/slug.py": SLUG_IMPL}, "green", "hx/T-1")
        ok, p, rep = self.v.verify("tests_green", t, {"sha": sha})
        self.assertTrue(ok, rep)
        self.assertEqual(p["red_sha"], red)
        self.assertIn("suite", rep["summary"])

    def test_green_rejects_tampered_tests(self):
        t, red = self._green_ticket()
        weakened = SLUG_TEST.replace('"hello-world"', 'slugify("Hello World")')
        sha = commit_push(self.w, {"textkit/slug.py": SLUG_IMPL.replace("-", "_"),
                                   "tests/test_slug.py": weakened}, "green?", "hx/T-1")
        ok, _, rep = self.v.verify("tests_green", t, {"sha": sha})
        self.assertFalse(ok)
        self.assertIn("frozen tests were modified: tests/test_slug.py", rep["reason"])

    def test_green_rejects_rebased_history(self):
        t, red = self._green_ticket()
        other = clone(self.origin, os.path.join(self.base, "w2"))
        sha = commit_push(other, {"textkit/slug.py": SLUG_IMPL, "tests/test_slug.py": SLUG_TEST}, "rewritten",
                          "hx/T-1-rewrite")
        ok, _, rep = self.v.verify("tests_green", t, {"sha": sha})
        self.assertFalse(ok)
        self.assertIn("does not descend from red", rep["reason"])

    def test_green_rejects_failing_suite(self):
        t, red = self._green_ticket()
        broken_core = "def normalize_space(s):\n    return s\n"
        sha = commit_push(self.w, {"textkit/slug.py": SLUG_IMPL, "textkit/core.py": broken_core}, "regress",
                          "hx/T-1")
        ok, _, rep = self.v.verify("tests_green", t, {"sha": sha})
        self.assertFalse(ok)
        self.assertIn("full suite is not green", rep["reason"])

    def test_doc_headings_and_scope(self):
        doc = "# Design\n## Approach\nregex\n## Scope\n- textkit/slug.py\n- tests/test_slug.py\n## Test plan\nx\n"
        sha = commit_push(self.w, {"docs/design/T-1.md": doc}, "doc", "hx/T-1")
        ok, _, rep = self.v.verify("doc", tk(), {"sha": sha, "path": "docs/design/T-1.md"})
        self.assertFalse(ok)
        self.assertIn("Risks", rep["reason"])
        sha = commit_push(self.w, {"docs/design/T-1.md": doc + "## Risks\nnone\n"}, "doc2", "hx/T-1")
        ok, p, _ = self.v.verify("doc", tk(), {"sha": sha, "path": "docs/design/T-1.md"})
        self.assertTrue(ok)
        self.assertEqual(p["scope"], ["textkit/slug.py", "tests/test_slug.py"])

    def test_land_merges_and_moves_main(self):
        t, red = self._green_ticket()
        cand = commit_push(self.w, {"textkit/slug.py": SLUG_IMPL}, "green", "hx/T-1")
        t["heads"]["candidate"] = cand
        before = self.v.main_head()
        res = self.v.land(t)
        self.assertTrue(res["ok"], res)
        after = self.v.main_head()
        self.assertNotEqual(before, after)
        self.assertEqual(sh(["git", "merge-base", "--is-ancestor", cand, after], self.origin, check=False), "")

    def test_land_conflict_reports_files(self):
        t, red = self._green_ticket()
        cand = commit_push(self.w, {"textkit/slug.py": SLUG_IMPL, "textkit/__init__.py": "from .slug import slugify\n"},
                           "green", "hx/T-1")
        t["heads"]["candidate"] = cand
        other = clone(self.origin, os.path.join(self.base, "w3"))
        commit_push(other, {"textkit/__init__.py": "from .core import normalize_space\n"}, "other ticket", "main")
        res = self.v.land(t)
        self.assertFalse(res["ok"])
        self.assertEqual(res["conflicts"], ["textkit/__init__.py"])


if __name__ == "__main__":
    unittest.main()
