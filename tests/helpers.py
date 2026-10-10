"""Test helpers: fake verifier, a toy repo with a bare origin, agent clones."""
import os
import subprocess
import tempfile
import textwrap

from hx.store import FakeClock, MemoryStore
from hx.service import Hx
from hx.verify import Verifier

GIT_ENV = {"GIT_AUTHOR_NAME": "agent", "GIT_AUTHOR_EMAIL": "agent", "GIT_COMMITTER_NAME": "agent",
           "GIT_COMMITTER_EMAIL": "agent", "GIT_AUTHOR_DATE": "2025-01-01T00:00:00Z",
           "GIT_COMMITTER_DATE": "2025-01-01T00:00:00Z"}


class FakeVerifier(Verifier):
    """Accepts evidence unless args say otherwise (fail=reason); for engine-level tests."""
    name = "fake"

    def _maybe_fail(self, a, payload):
        if a.get("fail"):
            return False, payload, {"reason": a["fail"]}
        return None

    def v_doc(self, t, a):
        p = {"sha": a.get("sha"), "path": a.get("path"), "scope": a.get("scope", [])}
        return self._maybe_fail(a, p) or (True, p, {"summary": "doc ok"})

    def v_tests_red(self, t, a):
        p = {"sha": a.get("sha"), "frozen": a.get("frozen", {"tests/test_x.py": "blob1"})}
        return self._maybe_fail(a, p) or (True, p, {"summary": "2 failed"})

    def v_tests_green(self, t, a):
        p = {"sha": a.get("sha"), "red_sha": t["heads"].get("red")}
        return self._maybe_fail(a, p) or (True, p, {"summary": "all green"})

    def v_ci(self, t, a):
        p = {"sha": a.get("sha")}
        return self._maybe_fail(a, p) or (True, p, {"summary": "ci green"})

    def land(self, t):
        if getattr(self, "land_fail", None):
            reason, self.land_fail = self.land_fail, None
            return {"ok": False, "reason": reason, "candidate": t["heads"].get("candidate"), "conflicts": ["a.py"]}
        return {"ok": True, "merged_sha": "f" * 40, "candidate": t["heads"].get("candidate")}


def mem_hx(clock=None, **kw):
    clock = clock or FakeClock()
    return Hx(MemoryStore(clock), verifier=kw.pop("verifier", FakeVerifier()), **kw), clock


def ticket(tid="T-1", **kw):
    d = {"id": tid, "title": f"ticket {tid}", "criteria": ["first behaviour", "second behaviour"],
         "test_cmd": "true", "risk": "low"}
    d.update(kw)
    return d


def run_feature_to(hx, tid, stop, worker="w1", reviewer="r1", sha_seed="a"):
    """Drive a low-risk feature ticket with the fake verifier up to (not including) step `stop`."""
    for _ in range(12):
        st = hx.state()
        t = st["tickets"][tid]
        if t["status"] != "open" or t["step"] == stop:
            return
        step = t["step"]
        if t["run"]["status"] == "waiting" and step in ("design", "accept"):
            hx.approve(tid)
        elif step == "design":
            hx.claim(worker, "worker", tid)
            hx.submit(worker, "doc", sha=sha_seed * 40, path=f"docs/design/{tid}.md")
            hx.done(worker)
        elif step == "red":
            hx.claim(worker, "worker", tid)
            hx.submit(worker, "tests_red", sha="b" * 40)
            hx.done(worker)
        elif step in ("green", "rebase"):
            hx.claim(worker, "worker", tid)
            hx.submit(worker, "tests_green", sha="c" * 40)
            hx.done(worker)
        elif step == "review":
            hx.claim(reviewer, "reviewer", tid)
            ac = {c["id"]: "ok" for c in t["criteria"]}
            hx.submit(reviewer, "review", verdict="approve", ac=ac)
            hx.done(reviewer)
        elif step == "land":
            hx.tick()
        elif step == "retro":
            hx.claim(worker, "worker", tid)
            hx.submit(worker, "retro", went_well="x", went_badly="y", change="z")
            hx.done(worker)
        else:
            raise AssertionError(f"unexpected step {step}")


# --------------------------------------------------------------------------- real git fixtures

def sh(args, cwd, env=None, check=True):
    e = dict(os.environ, **GIT_ENV)
    if env:
        e.update(env)
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True, env=e)
    if check and r.returncode != 0:
        raise RuntimeError(f"{args} failed: {r.stdout}\n{r.stderr}")
    return r.stdout.strip()


def write(root, files):
    for path, content in files.items():
        full = os.path.join(root, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w") as f:
            f.write(textwrap.dedent(content).lstrip("\n"))


CORE = '''
def normalize_space(s):
    """Collapse runs of whitespace into single spaces."""
    return " ".join(s.split())
'''
TEST_CORE = '''
import unittest
from textkit.core import normalize_space


class TestCore(unittest.TestCase):
    def test_normalize_space(self):
        self.assertEqual(normalize_space("a   b\\n c"), "a b c")
'''


def make_origin(base=None):
    """Bare 'origin' with a small Python package on main. Returns (origin_path, workdir_base)."""
    base = base or tempfile.mkdtemp(prefix="hx-test-")
    seed = os.path.join(base, "seed")
    origin = os.path.join(base, "origin.git")
    os.makedirs(seed)
    sh(["git", "init", "-q", "-b", "main"], seed)
    write(seed, {"textkit/__init__.py": "", "textkit/core.py": CORE, "tests/__init__.py": "",
                 "tests/test_core.py": TEST_CORE})
    sh(["git", "add", "-A"], seed)
    sh(["git", "commit", "-q", "-m", "seed"], seed)
    sh(["git", "clone", "-q", "--bare", seed, origin], base)
    return origin, base


def clone(origin, path, branch=None):
    sh(["git", "clone", "-q", origin, path], os.path.dirname(path))
    if branch:
        r = subprocess.run(["git", "rev-parse", "--verify", "-q", f"origin/{branch}"], cwd=path, capture_output=True)
        if r.returncode == 0:
            sh(["git", "checkout", "-q", "-b", branch, f"origin/{branch}"], path)
        else:
            sh(["git", "checkout", "-q", "-b", branch], path)
    return path


def commit_push(path, files, msg, branch):
    write(path, files)
    sh(["git", "add", "-A"], path)
    sh(["git", "commit", "-q", "-m", msg], path)
    sh(["git", "push", "-q", "origin", f"HEAD:refs/heads/{branch}"], path)
    return sh(["git", "rev-parse", "HEAD"], path)
