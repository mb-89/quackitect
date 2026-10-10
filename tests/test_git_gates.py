"""The red and green gates against a real git repository on disk."""

import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from harness.engine import Engine, HarnessError
from harness.repo import GitRepo
from tests.helpers import ROUTES, Clock

GIT_ID = ["-c", "user.name=toy", "-c", "user.email=toy@localhost"]


def git(cwd, *args) -> str:
    p = subprocess.run(["git", *GIT_ID, *args], cwd=str(cwd), check=True, capture_output=True, text=True)
    return p.stdout.strip()


FAILING_TEST = (
    "import unittest\n"
    "from fizz import fizz\n\n"
    "class T(unittest.TestCase):\n"
    "    def test_3(self):\n"
    "        self.assertEqual(fizz(3), 'Fizz')\n"
    "    def test_5(self):\n"
    "        self.assertEqual(fizz(5), 'Buzz')\n"
)


class GitGates(unittest.TestCase):
    def setUp(self):
        self.dir = Path(tempfile.mkdtemp(prefix="toy-"))
        git(self.dir, "init", "-q", "-b", "main")
        (self.dir / "README.md").write_text("toy\n")
        git(self.dir, "add", "-A")
        git(self.dir, "commit", "-q", "-m", "init")
        git(self.dir, "checkout", "-q", "-b", "ticket/fizz")
        self.repo = GitRepo(self.dir)
        self.eng = Engine(ROUTES, repo=self.repo, clock=Clock())
        self.eng.mint("fizz", "fizz(n): Fizz on multiples of 3, Buzz on multiples of 5", "mvp")

    def tearDown(self):
        self.eng.close()
        shutil.rmtree(self.dir, ignore_errors=True)

    def commit(self, files: dict[str, str], msg: str) -> str:
        for path, text in files.items():
            p = self.dir / path
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(text)
        git(self.dir, "add", "-A")
        git(self.dir, "commit", "-q", "-m", msg)
        return git(self.dir, "rev-parse", "HEAD")

    def step(self, files: dict[str, str], msg: str, extra=None) -> dict:
        c = self.eng.claim("fizz")
        sha = self.commit(files, msg)
        self.eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        if extra:
            self.eng.evidence(c["attempt"], c["token"], *extra)
        return self.eng.done(c["attempt"], c["token"])

    def test_red_then_green_in_a_clean_checkout(self):
        # red: the tests fail because fizz does not exist yet
        r = self.step({"tests/__init__.py": "", "tests/test_fizz.py": FAILING_TEST}, "tests")
        self.assertEqual(r["verdict"], "pass", r["detail"])
        self.assertIn("tests/test_fizz.py", r["detail"])
        self.assertEqual(self.eng.ticket("fizz")["step"], "implement")

        # a wrong implementation fails the green gate, and the gate carries the test output
        r = self.step({"fizz.py": "def fizz(n):\n    return 'Fizz'\n"}, "wrong")
        self.assertEqual(r["verdict"], "fail")
        self.assertIn("AssertionError", r["detail"])

        # weakening the tests to pass is caught
        r = self.step({"tests/test_fizz.py": "import unittest\nclass T(unittest.TestCase):\n    def test_x(self):\n        pass\n"}, "tamper")
        self.assertEqual(r["verdict"], "fail")
        self.assertIn("test_change", r["detail"])

        # the honest implementation, with the tests restored, passes
        r = self.step({"tests/test_fizz.py": FAILING_TEST,
                       "fizz.py": "def fizz(n):\n    if n % 15 == 0:\n        return 'FizzBuzz'\n    if n % 3 == 0:\n        return 'Fizz'\n    if n % 5 == 0:\n        return 'Buzz'\n    return str(n)\n"}, "right",
                      extra=("test_change", {"why": "restored the tests the tamper attempt broke"}))
        self.assertEqual(r["verdict"], "pass", r["detail"])
        self.assertEqual(self.eng.ticket("fizz")["step"], "review")

        # the reviewer sees the diff
        c = self.eng.claim("fizz", worker="reviewer")
        self.assertIn("## The diff", c["briefing"])
        self.assertIn("def fizz", c["briefing"])

    def test_a_commit_on_another_branch_is_refused(self):
        c = self.eng.claim("fizz")
        git(self.dir, "checkout", "-q", "main")
        sha = self.commit({"other.txt": "x"}, "elsewhere")
        git(self.dir, "checkout", "-q", "ticket/fizz")
        with self.assertRaises(HarnessError) as cm:
            self.eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        self.assertEqual(cm.exception.code, "no_such_commit")

    def test_the_gate_runs_in_a_clean_checkout_not_the_working_tree(self):
        c = self.eng.claim("fizz")
        sha = self.commit({"tests/__init__.py": "", "tests/test_fizz.py": FAILING_TEST}, "tests")
        # an uncommitted fizz.py in the working tree must not make the red gate see passing tests
        (self.dir / "fizz.py").write_text("def fizz(n):\n    return {3: 'Fizz', 5: 'Buzz'}.get(n, str(n))\n")
        self.eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
        r = self.eng.done(c["attempt"], c["token"])
        self.assertEqual(r["verdict"], "pass", r["detail"])


if __name__ == "__main__":
    unittest.main()
