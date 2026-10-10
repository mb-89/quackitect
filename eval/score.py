"""Run a task's hidden tests against a finished repo; print JSON counts.

usage: python score.py <repo> <hidden.py>
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile

RUNNER = r"""
import json, sys, unittest
sys.path.insert(0, ".")
try:
    suite = unittest.defaultTestLoader.loadTestsFromName("hidden_acceptance")
    total = suite.countTestCases()
    r = unittest.TextTestRunner(stream=open("/dev/null", "w")).run(suite)
    bad = len(r.failures) + len(r.errors)
    if r.errors and total == 1 and "_FailedTest" in str(r.errors[0][0]):
        total = 0
    print(json.dumps({"total": total, "passed": max(0, total - bad)}))
except Exception as e:
    print(json.dumps({"total": 0, "passed": 0, "error": str(e)}))
"""


def score(repo, hidden, expected_total=None):
    tmp = tempfile.mkdtemp(prefix="score-")
    dst = os.path.join(tmp, "repo")
    shutil.copytree(repo, dst, ignore=shutil.ignore_patterns(".git"))
    shutil.copy(hidden, os.path.join(dst, "hidden_acceptance.py"))
    r = subprocess.run([sys.executable, "-c", RUNNER], cwd=dst, capture_output=True,
                       text=True, timeout=300)
    try:
        out = json.loads(r.stdout.strip().splitlines()[-1])
    except Exception:
        out = {"total": 0, "passed": 0, "error": r.stderr[-300:]}
    if expected_total and out["total"] < expected_total:
        out["total"] = expected_total  # an import error fails every test
    shutil.rmtree(tmp, ignore_errors=True)
    return out


def count_tests(hidden):
    return sum(1 for ln in open(hidden) if ln.strip().startswith("def test_"))


if __name__ == "__main__":
    print(json.dumps(score(sys.argv[1], sys.argv[2], count_tests(sys.argv[2]))))
