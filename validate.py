#!/usr/bin/env python3
"""Validate mined candidates: the hidden tests must fail on the base and pass on the solution,
every time.

For each candidate, three trees run `go test -json -count=1` over the packages the
hidden tests live in, each `--reps` times:

  base        the base tree with its own tests          -> which tests passed before
  base+hidden the base tree with the hidden tests laid on -> what the agent starts against
  solution    the solution tree                          -> what the true change achieves

  FAIL_TO_PASS  tests that fail (or do not build) on base+hidden in every rep and pass on
                the solution in every rep
  PASS_TO_PASS  tests that pass on base, on base+hidden and on the solution in every rep
  flaky         tests whose outcome differs between reps of one tree: they grade nothing

A candidate is valid when FAIL_TO_PASS is not empty and the base builds.

usage: python3 validate.py --repo <clone> --candidates c.jsonl --out v.jsonl [--reps 3] [--jobs 3]
"""
import argparse
import concurrent.futures as cf
import json
import os
import shutil
import subprocess
import sys
import threading

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from benchlib import WORK, append_jsonl, git, read_jsonl, sh  # noqa: E402
from gotest import go_pkgs_of, run_go_tests  # noqa: E402

GID = ["-c", "user.name=agent", "-c", "user.email=agent", "-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false"]


def export_commit(repo, rev, dest, then=None):
    """The tree at rev as a fresh one-commit repository, as the grader builds it: no history,
    tests that ask git read the tree's own files. `then` edits the tree before the commit."""
    shutil.rmtree(dest, ignore_errors=True)
    os.makedirs(dest)
    arch = subprocess.run(["git", "-C", repo, "archive", "--format=tar", rev], capture_output=True, check=True)
    subprocess.run(["tar", "-x", "-C", dest], input=arch.stdout, check=True)
    if then:
        then(dest)
    sh(["git", "init", "-q", "-b", "main"], cwd=dest)
    sh(["git", *GID, "add", "-A"], cwd=dest)
    sh(["git", *GID, "commit", "-q", "-m", "tree"], cwd=dest)

LOCK = threading.Lock()


def overlay(repo, tree, solution, paths, deleted):
    """Lay the solution's versions of paths onto tree; remove the ones the solution deleted."""
    for p in paths:
        dst = os.path.join(tree, p)
        if p in deleted:
            if os.path.exists(dst):
                os.remove(dst)
            continue
        blob = git(repo, "show", f"{solution}:{p}", text=False).stdout
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, "wb") as f:
            f.write(blob)


def fold(runs):
    """Several runs of one tree -> {test: 'pass'|'fail'|'flaky'}; a test missing from a run counts as fail."""
    names = set()
    for r in runs:
        names |= set(r["tests"])
    out = {}
    for n in names:
        seen = {r["tests"].get(n, "fail") for r in runs}
        seen.discard("skip") if seen != {"skip"} else None
        out[n] = seen.pop() if len(seen) == 1 else "flaky"
    return out


def validate(repo, cand, reps, keep):
    t = cand["ticket"]
    root = os.path.join(WORK, "val", t)
    shutil.rmtree(root, ignore_errors=True)
    os.makedirs(root)
    base, sol = os.path.join(root, "base"), os.path.join(root, "sol")
    try:
        hidden = cand["test_files"]
        pkgs = go_pkgs_of(hidden)
        res = {"ticket": t, "pkgs": pkgs, "reps": reps, "trees": "one-commit exports"}
        export_commit(repo, cand["base"], base)
        r_base = [run_go_tests(base, pkgs) for _ in range(reps)]
        export_commit(repo, cand["base"], base,
                      then=lambda d: overlay(repo, d, cand["solution"], hidden, set(cand.get("deleted", []))))
        r_hid = [run_go_tests(base, pkgs) for _ in range(reps)]
        export_commit(repo, cand["solution"], sol)
        r_sol = [run_go_tests(sol, pkgs) for _ in range(reps)]
        fb, fh, fs = fold(r_base), fold(r_hid), fold(r_sol)
        f2p = sorted(n for n, v in fs.items() if v == "pass" and fh.get(n, "fail") == "fail")
        p2p = sorted(n for n, v in fs.items() if v == "pass" and fh.get(n) == "pass" and fb.get(n) == "pass")
        flaky = sorted({n for d in (fb, fh, fs) for n, v in d.items() if v == "flaky"})
        sol_fail = sorted(n for n, v in fs.items() if v == "fail")
        res.update({
            "f2p": f2p, "p2p": p2p, "flaky": flaky, "solution_fails": sol_fail,
            "base_pkgs": r_base[0]["pkgs"], "hidden_pkgs": r_hid[0]["pkgs"], "solution_pkgs": r_sol[0]["pkgs"],
            "base_build_ok": all(v in ("ok", "fail") for v in r_base[0]["pkgs"].values()),
            "hidden_builds_on_base": all(v in ("ok", "fail") for v in r_hid[0]["pkgs"].values()),
            "secs": {"base": [r["secs"] for r in r_base], "hidden": [r["secs"] for r in r_hid],
                     "solution": [r["secs"] for r in r_sol]},
            "hidden_tail": r_hid[0]["tail"][-1500:], "solution_tail": r_sol[0]["tail"][-800:],
        })
        res["solution_green"] = all(v == "ok" for v in r_sol[0]["pkgs"].values())
        res["valid"] = bool(f2p) and res["base_build_ok"]
        return res
    finally:
        if not keep:
            shutil.rmtree(root, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    ap.add_argument("--candidates", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", default="", help="comma-separated ticket names")
    ap.add_argument("--reps", type=int, default=1)
    ap.add_argument("--jobs", type=int, default=3)
    ap.add_argument("--keep", action="store_true")
    a = ap.parse_args()
    cands = read_jsonl(a.candidates)
    if a.only:
        want = set(a.only.split(","))
        cands = [c for c in cands if c["ticket"] in want]
    done = {r["ticket"] for r in read_jsonl(a.out)}
    todo = [c for c in cands if c["ticket"] not in done]
    print(f"{len(todo)} to validate ({len(done)} already in {a.out})", flush=True)
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        futs = {ex.submit(validate, a.repo, c, a.reps, a.keep): c for c in todo}
        for f in cf.as_completed(futs):
            c = futs[f]
            try:
                r = f.result()
            except Exception as e:  # keep going; record the failure
                r = {"ticket": c["ticket"], "valid": False, "error": str(e)[-1500:]}
            with LOCK:
                append_jsonl(a.out, r)
            print(f"{c['ticket']:50s} valid={r.get('valid')} f2p={len(r.get('f2p', []))} "
                  f"p2p={len(r.get('p2p', []))} flaky={len(r.get('flaky', []))} "
                  f"builds={r.get('hidden_builds_on_base')} {r.get('error', '')[:200]}", flush=True)


if __name__ == "__main__":
    main()
