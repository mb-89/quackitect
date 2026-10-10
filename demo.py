"""A scripted run through the real CLI: one work, one agent, one reviewer,
the owner. No model: the agent's edits are scripted, so the run shows what
the harness does and nothing else.

usage: python demo.py
"""

import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
T = tempfile.mkdtemp(prefix="baton-demo-")
REPO, DB = os.path.join(T, "repo"), os.path.join(T, "baton.db")
ENV = dict(os.environ, PYTHONPATH=HERE, BATON_DB=DB)


def git(*a):
    subprocess.run(["git", "-C", REPO, *a], check=True, capture_output=True)


def write(path, text):
    full = os.path.join(REPO, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(text)


def commit(msg):
    git("add", "-A")
    git("commit", "-qm", msg)
    print(f"\n# (the agent edits files and commits: {msg})")


def baton(*args, who=None, show=True):
    cmd = [sys.executable, "-m", "baton"] + (["--as", who] if who else []) + list(args)
    shown = "baton " + (f"--as {who} " if who else "") + " ".join(
        a if " " not in a else repr(a) for a in args)
    r = subprocess.run(cmd, env=ENV, capture_output=True, text=True)
    out = (r.stdout + r.stderr).rstrip()
    if show:
        print(f"\n$ {shown}")
        if out:
            print(out)
    return out


def main():
    os.makedirs(os.path.join(REPO, "tests"))
    write("tests/__init__.py", "")
    write(".gitignore", "__pycache__/\n")
    write("calc.py", "def add(a, b):\n    return a + b\n")
    git("init", "-q")
    git("config", "user.email", "demo@example.invalid")
    git("config", "user.name", "demo")
    commit("init")

    print("\n## The owner files a work")
    baton("new", "Add mul", "--ask", "Add mul(a, b) to calc.py.", "--group", "calc",
          "--repo", REPO, "--ci", "local")

    print("\n## An agent takes it; its card")
    baton("take", who="agent:a1")
    baton("card", who="agent:a1")

    print("\n## A claim without evidence is refused")
    baton("done", "--baton", "spec done", who="agent:a1")
    baton("done", "-e", "spec=mul(a, b) returns a*b for ints and floats; add() stays; "
          "a unit test proves mul(3, 4) == 12.", "--baton", "spec written; next: design",
          who="agent:a1")
    baton("done", "-e", "design=One function next to add() in calc.py; one test file "
          "tests/test_mul.py; nothing else changes.", "--baton",
          "design written; next: failing test", who="agent:a1", show=False)

    print("\n## red: the tests must fail before the code exists")
    write("tests/test_mul.py", "import unittest\nfrom calc import mul\n\n"
          "class T(unittest.TestCase):\n    def test_mul(self):\n"
          "        self.assertEqual(mul(3, 4), 12)\n")
    baton("done", "--baton", "test written", who="agent:a1")
    commit("failing test for mul")
    baton("done", "--baton", "tests/test_mul.py fails on missing mul(); next: implement",
          who="agent:a1")

    print("\n## The agent's session dies here. Another agent takes over from the card.")
    baton("handoff", "tests/test_mul.py fails on missing mul(); implement it in calc.py",
          who="agent:a1", show=False)
    baton("take", who="agent:a2")

    print("\n## green: editing the tests is refused")
    write("tests/test_mul.py", "import unittest\n")
    commit("delete the hard test")
    baton("done", "--baton", "tests pass", who="agent:a2")
    git("revert", "--no-edit", "HEAD")
    write("calc.py", "def add(a, b):\n    return a + b\n\n\ndef mul(a, b):\n    return a * b\n")
    commit("revert the cheat, implement mul")
    baton("done", "--baton", "mul implemented, tests pass; next: review", who="agent:a2")

    print("\n## review: a helper who wrote nothing sends it back")
    baton("take", who="helper:r1")
    baton("verdict", "reject", "-f", "mul has no docstring", who="helper:r1")
    baton("take", who="agent:a2")
    write("calc.py", "def add(a, b):\n    return a + b\n\n\ndef mul(a, b):\n"
          '    """Return a times b."""\n    return a * b\n')
    commit("docstring")
    baton("done", "--baton", "docstring added; next: review again", who="agent:a2")
    baton("take", who="helper:r1", show=False)
    baton("verdict", "approve", who="helper:r1")

    print("\n## The owner's inbox, then one tap")
    baton("inbox")
    baton("approve", "W1")

    print("\n## retro, and the work's history")
    baton("take", who="agent:a2", show=False)
    baton("done", "-e", "retro=The review caught a missing docstring; a lint rule in "
          "the green gate would have caught it a step earlier.", "--baton", "done",
          who="agent:a2")
    baton("show", "W1")


if __name__ == "__main__":
    main()
