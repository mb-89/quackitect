import os
import subprocess
import tempfile

from baton.engine import Engine
from baton.store import Store

TEST_CMD = "python -m unittest discover -s tests -q"


class Clock:
    def __init__(self, t=1_000_000.0):
        self.t = t

    def __call__(self):
        return self.t

    def advance(self, s):
        self.t += s


def sh(repo, *cmd):
    subprocess.run(cmd, cwd=repo, check=True, capture_output=True)


def write(repo, path, text):
    full = os.path.join(repo, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(text)


def commit(repo, msg="wip"):
    sh(repo, "git", "add", "-A")
    sh(repo, "git", "commit", "-qm", msg)


def make_repo():
    repo = tempfile.mkdtemp(prefix="baton-repo-")
    sh(repo, "git", "init", "-q")
    sh(repo, "git", "config", "user.email", "t@example.invalid")
    sh(repo, "git", "config", "user.name", "t")
    write(repo, "calc.py", "def add(a, b):\n    return a + b\n")
    write(repo, "tests/__init__.py", "")
    write(repo, ".gitignore", "__pycache__/\n")
    commit(repo, "init")
    return repo


def make_engine(**settings):
    clock = Clock()
    db = os.path.join(tempfile.mkdtemp(prefix="baton-db-"), "baton.db")
    return Engine(Store(db, clock=clock), settings), clock, db


FAILING_TEST = ("import unittest\nfrom calc import mul\n\n"
                "class T(unittest.TestCase):\n"
                "    def test_mul(self):\n        self.assertEqual(mul(3, 4), 12)\n")
IMPL = "def add(a, b):\n    return a + b\n\n\ndef mul(a, b):\n    return a * b\n"
SPEC = ("Add mul(a, b) to calc.py returning the product. add() stays as it is. "
        "A unit test proves mul(3, 4) == 12.")
DESIGN = ("One function in calc.py next to add(). One test file tests/test_mul.py. "
          "No other files change. Risk: none worth naming.")
