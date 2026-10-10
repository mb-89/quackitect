"""Gates: programs that decide whether a step may close.

Each gate answers pass, fail or pending. Fail carries a reason the model can
act on. Pending means the gate waits on someone else (CI, the owner, a
reviewer), and parks the work instead of failing the claim.
"""

import os
import subprocess

PASS, FAIL, PENDING = "pass", "fail", "pending"


def git(repo, *args):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True,
                       text=True)
    return r.returncode, r.stdout.strip()


def head(repo):
    if not repo:
        return None
    rc, out = git(repo, "rev-parse", "HEAD")
    return out if rc == 0 else None


def run_cmd(repo, cmd, timeout=900):
    try:
        env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
        r = subprocess.run(cmd, shell=True, cwd=repo or None, env=env,
                           capture_output=True, text=True, timeout=timeout)
        return r.returncode, (r.stdout + r.stderr)[-1200:]
    except subprocess.TimeoutExpired:
        return 124, f"timed out after {timeout}s"


def changed(repo, since_sha, paths):
    if not since_sha:
        return []
    rc, out = git(repo, "diff", "--name-only", since_sha, "HEAD", "--", *paths)
    return [ln for ln in out.splitlines() if ln] if rc == 0 else None  # None: unknown


def _when(gate, work):
    cond = gate.get("when")
    if not cond:
        return True
    key, _, want = cond.partition("=")
    return str(getattr(work, key, "")) == want


def check(gate, ctx):
    """Return (status, reason, record). `record` is evidence the engine
    writes to the log, so the log shows what the gate saw."""
    w, step, repo, sha = ctx["work"], ctx["step"], ctx["repo"], ctx["sha"]
    kind = gate["kind"]
    if not _when(gate, w):
        return PASS, "not required here", None

    if kind in ("clean", "cmd", "touched", "frozen") and not repo:
        return PASS, "no repo: nothing to test", None

    if kind == "evidence":
        name, need = gate["name"], gate.get("min", 1)
        val = (ctx["evidence"].get(name) or "").strip()
        if len(val) < need:
            return FAIL, (f"evidence '{name}' is missing or under {need} "
                          f"characters; attach it as evidence={{'{name}': ...}}"), None
        return PASS, f"{name}: {len(val)} chars", None

    if kind == "clean":
        if not repo:
            return PASS, "no repo", None
        _, flags = git(repo, "ls-files", "-v")
        hidden = [ln[2:] for ln in flags.splitlines() if ln[:1] == "S" or ln[:1].islower()]
        if hidden:
            return FAIL, ("files hidden from git status (skip-worktree or "
                          "assume-unchanged): " + ", ".join(hidden[:5])), None
        _, out = git(repo, "status", "--porcelain")
        if out:
            files = ", ".join(ln[3:] for ln in out.splitlines()[:5])
            return FAIL, ("uncommitted changes (" + files + "); commit first, "
                          "because evidence binds to a commit"), None
        return PASS, f"clean at {sha[:8] if sha else '-'}", None

    if kind == "cmd" and gate.get("first_pass_only") and w.times_closed.get(step):
        return PASS, ("reopened step: the tests need not fail again; the "
                      "reviewer sees the reopen and the test change"), None

    if kind == "cmd":
        expect = gate.get("expect", "pass")
        rc, tail = run_cmd(repo, w.test_cmd)
        rec = {"cmd": w.test_cmd, "rc": rc, "sha": sha, "tail": tail[-400:]}
        ok = (rc == 0) if expect == "pass" else (rc != 0)
        if ok:
            return PASS, f"`{w.test_cmd}` exit {rc} as expected ({expect})", rec
        want = "pass" if expect == "pass" else "fail (tests must fail before the code exists)"
        return FAIL, f"`{w.test_cmd}` exit {rc}, expected to {want}:\n{tail[-600:]}", rec

    if kind == "touched":
        got = changed(repo, w.opened_sha.get(step), w.test_paths)
        if got is None:
            return FAIL, "git could not diff this step's start against HEAD", None
        if not got:
            return FAIL, f"no committed change under {w.test_paths} in this step", None
        return PASS, f"changed: {', '.join(got[:5])}", None

    if kind == "frozen":
        since = w.closed.get(gate["since"], {}).get("sha")
        got = changed(repo, since, w.test_paths)
        if got is None:
            return FAIL, f"git could not diff step '{gate['since']}' against HEAD", None
        if got:
            return FAIL, (f"test files changed since step '{gate['since']}' "
                          f"closed: {', '.join(got[:5])}. Tests are frozen after "
                          f"{gate['since']}; revert them, or ask the owner if a "
                          f"test is wrong"), None
        return PASS, "tests unchanged", None

    if kind == "verdict":
        author = w.closed.get(gate.get("author_step", ""), {}).get("actor")
        mine = [v for v in w.verdicts if v["step"] == step]
        if not mine:
            return PENDING, "waiting for a reviewer", None
        v = mine[-1]
        if author and v["actor"].split(":", 1)[-1] == author.split(":", 1)[-1]:
            return FAIL, "the author cannot review their own work", None
        if v["sha"] != sha:
            return PENDING, "HEAD moved since the last review; waiting for a fresh one", None
        if not v["approve"]:
            return FAIL, "reviewer rejected: " + "; ".join(v["findings"]), None
        return PASS, f"approved by {v['actor']}", None

    if kind == "ci":
        if w.ci_mode == "local" and not repo:
            return PASS, "no repo", None
        if w.ci_mode == "local":
            rc, tail = run_cmd(repo, w.test_cmd)
            return (PASS if rc == 0 else FAIL), f"local CI exit {rc}", \
                {"ci": True, "sha": sha, "ok": rc == 0, "tail": tail[-300:]}
        res = w.ci.get(sha or "-")
        if res is None:
            return PENDING, f"waiting for CI at {sha[:8] if sha else '-'}", None
        return (PASS, "CI green", None) if res else (FAIL, "CI red at HEAD", None)

    if kind == "human":
        if w.approvals.get(step, "<none>") == (sha or "-"):
            return PASS, "owner approved", None
        return PENDING, "waiting for the owner", None

    return FAIL, f"unknown gate kind {kind!r}", None
