"""Verifiers turn an agent's claim into evidence, or reject it with a reason.

They never look at the agent's working directory: everything is checked against commits that
exist on the shared remote (the repo the verifier is given), in a fresh export of that commit.
In production this is CI; locally it is this module running `git archive <sha>` + the test command.

verify(kind, ticket, args) -> (ok: bool, payload: dict, report: dict)
land(ticket)               -> dict(ok=True|False|None, merged_sha, base, candidate, reason, conflicts)
"""
import io
import os
import re
import shutil
import subprocess
import tarfile
import tempfile

DESIGN_HEADINGS = ("Approach", "Test plan", "Risks")
VERDICTS = ("approve", "changes", "reject")
TEST_PATH = re.compile(r"(^|/)tests?/|(^|/)test_[^/]*\.py$|_test\.(py|go)$|\.(test|spec)\.[jt]sx?$")
BROKEN = [r"SyntaxError", r"IndentationError", r"_FailedTest", r"Failed to import test module",
          r"ERROR collecting", r"rror during collection", r"Interrupted: \d+ error", r"\bRan 0 tests\b",
          r"no tests ran", r"collected 0 items", r"NO TESTS RAN"]


def ac_pattern(ac_id):
    return re.compile(r"(?<![A-Za-z0-9])" + re.escape(ac_id) + r"(?![0-9])", re.I)


def classify(code, out):
    """pass | fail | broken (tests did not load or none ran)."""
    if any(re.search(p, out) for p in BROKEN):
        return "broken"
    return "pass" if code == 0 else "fail"


def summarize(code, out):
    m = re.search(r"Ran (\d+) tests?", out)
    if m:
        res = re.search(r"^(OK.*|FAILED \(.*\))$", out, re.M)
        return f"{m.group(1)} tests, {res.group(1) if res else 'exit ' + str(code)}"
    m = re.search(r"=+ (.*(passed|failed|error).*) in [\d.]+s", out)
    if m:
        return m.group(1)
    lines = [ln for ln in out.strip().splitlines() if ln.strip()]
    return (lines[-1][:120] if lines else "") + f" (exit {code})"


def tail(out, n=15):
    return "\n".join(out.strip().splitlines()[-n:])


class Verifier:
    """Structural verifier: needs no git. Handles review and retro."""
    name = "structural"

    def verify(self, kind, t, args):
        fn = getattr(self, "v_" + kind, None)
        if fn is None:
            return False, {}, {"reason": f"this verifier cannot check {kind!r} evidence"}
        try:
            return fn(t, args)
        except VerifyError as e:
            return False, e.payload, {"reason": str(e), "tail": e.tail}

    def v_review(self, t, a):
        verdict = a.get("verdict")
        if verdict not in VERDICTS:
            raise VerifyError(f"verdict must be one of {VERDICTS}")
        ac = dict(a.get("ac") or {})
        missing = [c["id"] for c in t["criteria"] if c["id"] not in ac]
        if missing:
            raise VerifyError("assess every acceptance criterion; missing " + ", ".join(missing)
                              + " (use --ac AC1=ok or --ac AC1=fail:why)")
        failing = [k for k, v in ac.items() if not str(v).lower().startswith("ok")]
        findings = list(a.get("findings") or [])
        if verdict == "approve" and failing:
            raise VerifyError("an approve verdict cannot have failing criteria: " + ", ".join(failing))
        if verdict != "approve" and not (failing or findings):
            raise VerifyError("say what must change: --finding '...' or --ac ACn=fail:why")
        if not a.get("sha"):
            raise VerifyError("review must name the candidate sha")
        return True, {"sha": a["sha"], "verdict": verdict, "ac": ac, "findings": findings}, \
            {"summary": f"{verdict}; " + ", ".join(f"{k}={v}" for k, v in ac.items())}

    def v_retro(self, t, a):
        fields = {k: (a.get(k) or "").strip() for k in ("went_well", "went_badly", "change")}
        empty = [k for k, v in fields.items() if not v]
        if empty:
            raise VerifyError("retro needs " + ", ".join("--" + k.replace("_", "-") for k in empty))
        return True, fields, {"summary": fields["change"][:120]}

    def git_context(self, t, checkpoint_head=None):
        return {}

    def land(self, t):
        return {"ok": False, "reason": "no git verifier configured", "candidate": t["heads"].get("candidate")}


class VerifyError(Exception):
    def __init__(self, msg, payload=None, tail=None):
        super().__init__(msg)
        self.payload = payload or {}
        self.tail = tail


class GitVerifier(Verifier):
    name = "git"

    def __init__(self, repo, main="main", timeout=600, ci_cmd=None):
        self.repo = os.path.abspath(repo)
        self.main = main
        self.timeout = timeout
        self.default_ci = ci_cmd

    # -- git helpers
    def git(self, *args, check=True, input=None, cwd=None):
        r = subprocess.run(["git", "-C", cwd or self.repo, *args], capture_output=True, input=input)
        if check and r.returncode != 0:
            raise VerifyError(f"git {' '.join(args)} failed: {r.stderr.decode().strip()[:200]}")
        return r.stdout.decode(errors="replace").strip() if not isinstance(r.stdout, str) else r.stdout.strip()

    def exists(self, sha):
        return subprocess.run(["git", "-C", self.repo, "cat-file", "-e", f"{sha}^{{commit}}"],
                              capture_output=True).returncode == 0

    def need(self, sha):
        if not sha:
            raise VerifyError("no commit given")
        if not self.exists(sha):
            raise VerifyError(f"commit {sha[:7]} is not on the shared remote: push your branch first")
        return self.git("rev-parse", f"{sha}^{{commit}}")

    def blob(self, sha, path):
        r = subprocess.run(["git", "-C", self.repo, "rev-parse", "-q", "--verify", f"{sha}:{path}"],
                           capture_output=True)
        return r.stdout.decode().strip() if r.returncode == 0 else None

    def show(self, sha, path):
        return self.git("show", f"{sha}:{path}")

    def main_head(self):
        return self.git("rev-parse", f"refs/heads/{self.main}")

    def run_at(self, sha, cmd):
        """Run cmd in a fresh export of sha. Returns (classification, code, output)."""
        tmp = tempfile.mkdtemp(prefix="hx-verify-")
        try:
            data = subprocess.run(["git", "-C", self.repo, "archive", "--format=tar", sha],
                                  capture_output=True, check=True).stdout
            with tarfile.open(fileobj=io.BytesIO(data)) as tf:
                try:
                    tf.extractall(tmp, filter="data")
                except TypeError:
                    tf.extractall(tmp)
            env = {k: v for k, v in os.environ.items() if not k.startswith("HX_")}
            env["PYTHONDONTWRITEBYTECODE"] = "1"
            try:
                r = subprocess.run(cmd, shell=True, cwd=tmp, capture_output=True, timeout=self.timeout,
                                   env=env)
                out = (r.stdout + r.stderr).decode(errors="replace")
                code = r.returncode
            except subprocess.TimeoutExpired:
                return "broken", -1, f"timed out after {self.timeout}s"
            return classify(code, out), code, out
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    # -- evidence kinds
    def v_doc(self, t, a):
        sha = self.need(a.get("sha"))
        path = a.get("path")
        if not path or not self.blob(sha, path):
            raise VerifyError(f"{path!r} does not exist at {sha[:7]}", {"sha": sha, "path": path})
        text = self.show(sha, path)
        missing = [h for h in DESIGN_HEADINGS
                   if not re.search(r"^#{1,6}\s*" + re.escape(h) + r"\b", text, re.M | re.I)]
        if missing:
            raise VerifyError("design doc lacks sections: " + ", ".join(missing), {"sha": sha, "path": path})
        scope = []
        m = re.search(r"^#{1,6}\s*Scope\b.*?$(.*?)(?=^#{1,6}\s|\Z)", text, re.M | re.S | re.I)
        if m:
            scope = [ln.strip()[2:].strip().strip("`") for ln in m.group(1).splitlines()
                     if ln.strip().startswith("- ")]
        return True, {"sha": sha, "path": path, "scope": scope}, \
            {"summary": f"{path}: {len(text.splitlines())} lines, scope {scope or 'n/a'}"}

    def v_tests_red(self, t, a):
        sha = self.need(a.get("sha"))
        if not t.get("test_cmd"):
            raise VerifyError("ticket has no test_cmd; ask the owner to set one")
        base = self.git("merge-base", f"refs/heads/{self.main}", sha)
        changed = [f for f in self.git("diff", "--name-only", base, sha).splitlines() if f]
        tests = list(a.get("tests") or []) or [f for f in changed if TEST_PATH.search(f)]
        tests = [p for p in tests if self.blob(sha, p)]
        if not tests:
            raise VerifyError("no test files added or changed since main", {"sha": sha})
        unchanged = [p for p in tests if p not in changed]
        if unchanged:
            raise VerifyError("listed tests did not change since main: " + ", ".join(unchanged), {"sha": sha})
        text = "\n".join(self.show(sha, p) for p in tests)
        uncovered = [c["id"] for c in t["criteria"] if not ac_pattern(c["id"]).search(text)]
        if uncovered:
            raise VerifyError("acceptance criteria not referenced by any test: " + ", ".join(uncovered)
                              + " (name tests test_ac1_... or add a '# AC1' comment)", {"sha": sha})
        cls, code, out = self.run_at(sha, t["test_cmd"])
        payload = {"sha": sha, "tests": tests, "base": base}
        if cls == "pass":
            raise VerifyError("the tests already pass at this commit; red means they must fail first",
                              payload, tail(out))
        if cls == "broken":
            raise VerifyError("the tests do not load or none ran; add stubs so they load, run and fail",
                              payload, tail(out))
        payload["frozen"] = {p: self.blob(sha, p) for p in tests}
        return True, payload, {"summary": summarize(code, out), "tail": tail(out, 8)}

    def v_tests_green(self, t, a):
        sha = self.need(a.get("sha"))
        red = t["heads"].get("red")
        if not red:
            raise VerifyError("no verified red evidence on this ticket")
        payload = {"sha": sha, "red_sha": red}
        if subprocess.run(["git", "-C", self.repo, "merge-base", "--is-ancestor", red, sha],
                          capture_output=True).returncode != 0:
            raise VerifyError(f"{sha[:7]} does not descend from red@{red[:7]}; merge, never rebase", payload)
        changed = [p for p, b in sorted(t["frozen"].items()) if self.blob(sha, p) != b]
        if changed:
            raise VerifyError("frozen tests were modified: " + ", ".join(changed)
                              + " (restore them; ask the owner if a test is wrong)", payload)
        cls, code, out = self.run_at(sha, t["test_cmd"])
        if cls != "pass":
            raise VerifyError(f"frozen tests are not green ({cls}): {summarize(code, out)}", payload, tail(out))
        ci = t.get("ci_cmd") or self.default_ci
        summary = summarize(code, out)
        if ci and ci != t["test_cmd"]:
            cls2, code2, out2 = self.run_at(sha, ci)
            if cls2 != "pass":
                raise VerifyError(f"full suite is not green ({cls2}): {summarize(code2, out2)}", payload,
                                  tail(out2))
            summary += f"; suite: {summarize(code2, out2)}"
        return True, payload, {"summary": summary}

    def v_ci(self, t, a):
        sha = self.need(a.get("sha"))
        cmd = t.get("ci_cmd") or self.default_ci or t.get("test_cmd")
        if not cmd:
            raise VerifyError("no ci_cmd configured")
        cls, code, out = self.run_at(sha, cmd)
        if cls != "pass":
            raise VerifyError(f"suite is not green ({cls}): {summarize(code, out)}", {"sha": sha}, tail(out))
        return True, {"sha": sha}, {"summary": summarize(code, out)}

    def v_review(self, t, a):
        if a.get("sha"):
            self.need(a["sha"])
        return super().v_review(t, a)

    # -- context for briefs
    def git_context(self, t, checkpoint_head=None):
        ctx = {}
        try:
            ctx["main"] = self.main_head()
            r = subprocess.run(["git", "-C", self.repo, "rev-parse", "-q", "--verify",
                                f"refs/heads/{t['branch']}"], capture_output=True)
            ctx["branch_head"] = r.stdout.decode().strip() if r.returncode == 0 else None
            if checkpoint_head and ctx["branch_head"] and self.exists(checkpoint_head):
                ctx["since_checkpoint"] = self.git("log", "--oneline", "--no-decorate",
                                                   f"{checkpoint_head}..{ctx['branch_head']}").splitlines()[:10]
            cand = t["heads"].get("candidate")
            if cand and self.exists(cand):
                base = self.git("merge-base", ctx["main"], cand)
                ctx["review_base"] = base
                ctx["diffstat"] = self.git("diff", "--stat", base, cand).splitlines()[-12:]
        except VerifyError:
            pass
        return ctx

    # -- merge queue
    def land(self, t):
        cand = t["heads"].get("candidate")
        res = {"candidate": cand, "ok": False}
        if not cand or not self.exists(cand):
            res["reason"] = "candidate commit missing on the remote"
            return res
        base = self.main_head()
        res["base"] = base
        tmp = tempfile.mkdtemp(prefix="hx-land-")
        try:
            subprocess.run(["git", "clone", "-q", "--no-checkout", self.repo, tmp], check=True,
                           capture_output=True)
            g = lambda *a, **k: subprocess.run(["git", "-C", tmp, "-c", "user.name=hx-merge-queue",
                                                "-c", "user.email=hx", *a], capture_output=True, **k)
            g("checkout", "-q", base, check=True)
            m = g("merge", "--no-ff", "-m", f"hx: land {t['id']} {t['title']}", cand)
            if m.returncode != 0:
                conflicts = g("diff", "--name-only", "--diff-filter=U").stdout.decode().split()
                g("merge", "--abort")
                res.update(reason="merge conflict with main", conflicts=conflicts)
                return res
            merged = g("rev-parse", "HEAD").stdout.decode().strip()
            ci = t.get("ci_cmd") or self.default_ci or t.get("test_cmd")
            if ci:
                env = {k: v for k, v in os.environ.items() if not k.startswith("HX_")}
                r = subprocess.run(ci, shell=True, cwd=tmp, capture_output=True, timeout=self.timeout, env=env)
                out = (r.stdout + r.stderr).decode(errors="replace")
                if classify(r.returncode, out) != "pass":
                    res.update(reason="CI failed on the merge result", summary=summarize(r.returncode, out),
                               tail=tail(out))
                    return res
            p = g("push", "-q", "origin", f"{merged}:refs/heads/{self.main}")
            if p.returncode != 0:  # main moved underneath us: compare-and-swap failed, retry later
                res.update(ok=None, reason="main moved during landing; will retry")
                return res
            res.update(ok=True, merged_sha=merged, summary=f"merged onto {base[:7]}")
            return res
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


def resolve(rev, cwd="."):
    """CLI side: turn HEAD / a branch name into a full sha in the agent's clone."""
    r = subprocess.run(["git", "-C", cwd, "rev-parse", f"{rev}^{{commit}}"], capture_output=True)
    if r.returncode != 0:
        raise ValueError(f"cannot resolve {rev!r} in {cwd}: {r.stderr.decode().strip()}")
    return r.stdout.decode().strip()
