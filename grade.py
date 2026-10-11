#!/usr/bin/env python3
"""Grade finished runs: the hidden tests, the repository's own check, and the scope.

  python3 grade.py --tasks tasks.jsonl --batch results/<name> [--jobs 1] [--check all|pass|none]

For each run holding meta.json and no grade.json:

  hidden   the agent's final tree; in every package the hidden tests live in, the test files
           go back to the base's, then the hidden tests (the solution's versions) are laid on.
           Pass = every FAIL_TO_PASS and every PASS_TO_PASS test of the task passes.
  check    `./RUNME.sh check` on the agent's final tree as it left it, installed as CI installs
           it, compared with the same check on the base (cached per task): a part green on the
           base and red here is a regression the agent made.
  scope    files the agent changed outside the directories the true solution touched
           (ticket files and the runtime folder left out: the harness writes those).

The run's scratch tree is deleted after grading unless --keep.
"""
import argparse
import concurrent.futures as cf
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arms  # noqa: E402
from benchlib import WORK, git, now, read_jsonl, sh, write_json  # noqa: E402
from gotest import go_pkgs_of, run_go_tests  # noqa: E402

REPO_DEFAULT = os.path.join(WORK, "qk")
LOCK = threading.Lock()
CHECK_LOCK = threading.Semaphore(1)  # the check takes every core: one at a time
RED_RE = re.compile(r"^(\S+) answers red", re.M)


def export(repo, rev, dest):
    shutil.rmtree(dest, ignore_errors=True)
    arms.export_tree(repo, rev, dest)


def commit_all(tree):
    """One commit holding the whole tree, hidden tests included: tests that ask git (`git ls-files`,
    the tracked twins and goldens) read a repository, as they did when the task was validated."""
    if not os.path.isdir(os.path.join(tree, ".git")):
        sh(["git", "init", "-q", "-b", "main"], cwd=tree)
    sh(["git", *arms.git_id("agent", "agent"), "add", "-A"], cwd=tree)
    sh(["git", *arms.git_id("agent", "agent"), "commit", "-q", "--allow-empty", "-m", "graded tree"], cwd=tree)


def lay_hidden(repo, task, tree):
    """In each hidden package: test files back to the base's, then the hidden tests on top."""
    hidden = set(task["test_files"])
    deleted = set(task.get("deleted", []))
    pkgs = go_pkgs_of(task["test_files"])
    for pkg in pkgs:
        d = os.path.join(tree, pkg[2:] if pkg.startswith("./") else pkg)
        if not os.path.isdir(d):
            continue
        for name in os.listdir(d):
            rel = os.path.relpath(os.path.join(d, name), tree)
            if not name.endswith("_test.go") or rel in hidden:
                continue
            base_blob = git(repo, "show", f"{task['base']}:{rel}", check=False, text=False)
            if base_blob.returncode == 0:
                with open(os.path.join(d, name), "wb") as f:
                    f.write(base_blob.stdout)
            else:
                os.remove(os.path.join(d, name))
    for p in hidden:
        dst = os.path.join(tree, p)
        if p in deleted:
            if os.path.exists(dst):
                os.remove(dst)
            continue
        blob = git(repo, "show", f"{task['solution']}:{p}", text=False).stdout
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, "wb") as f:
            f.write(blob)
    return pkgs


def hidden_grade(repo, task, run_repo, final_tree, workdir):
    tree = os.path.join(workdir, "hidden")
    export(run_repo, final_tree, tree)
    pkgs = lay_hidden(repo, task, tree)
    commit_all(tree)
    r = run_go_tests(tree, pkgs, timeout=1200)
    f2p, p2p = task["f2p"], task["p2p"]
    f2p_ok = [n for n in f2p if r["tests"].get(n) == "pass"]
    p2p_ok = [n for n in p2p if r["tests"].get(n) == "pass"]
    out = {"pass": len(f2p_ok) == len(f2p) and len(p2p_ok) == len(p2p),
           "f2p": [len(f2p_ok), len(f2p)], "p2p": [len(p2p_ok), len(p2p)],
           "pkgs": r["pkgs"], "secs": r["secs"],
           "f2p_failed": [n for n in f2p if n not in f2p_ok][:20],
           "p2p_failed": [n for n in p2p if n not in p2p_ok][:20], "tail": r["tail"][-1200:]}
    shutil.rmtree(tree, ignore_errors=True)
    return out


def tree_from_patch(repo, task, patch_path, dest):
    """Rebuild a run's final tree from its published patch: the base, then the patch with the
    ticket files left out (v5's ticket bookkeeping sits on setup commits the base lacks)."""
    patch_path = os.path.abspath(patch_path)
    export(repo, task["base"], dest)
    sh(["git", "init", "-q"], cwd=dest)
    if os.path.getsize(patch_path) == 0:
        return True
    r = sh(["git", "apply", "--whitespace=nowarn", "--exclude=spec/tickets/*", "--exclude=.se/*", patch_path],
           cwd=dest, check=False)
    return r.returncode == 0


def hidden_from_patch(repo, task, patch_path, workdir):
    tree = os.path.join(workdir, "hidden")
    if not tree_from_patch(repo, task, patch_path, tree):
        return {"pass": False, "error": "patch does not apply to the base", "f2p": [0, len(task["f2p"])],
                "p2p": [0, len(task["p2p"])]}
    pkgs = lay_hidden(repo, task, tree)
    shutil.rmtree(os.path.join(tree, ".git"), ignore_errors=True)
    commit_all(tree)
    r = run_go_tests(tree, pkgs, timeout=1200)
    f2p, p2p = task["f2p"], task["p2p"]
    f2p_ok = [n for n in f2p if r["tests"].get(n) == "pass"]
    p2p_ok = [n for n in p2p if r["tests"].get(n) == "pass"]
    shutil.rmtree(tree, ignore_errors=True)
    return {"pass": len(f2p_ok) == len(f2p) and len(p2p_ok) == len(p2p),
            "f2p": [len(f2p_ok), len(f2p)], "p2p": [len(p2p_ok), len(p2p)], "pkgs": r["pkgs"],
            "f2p_failed": [n for n in f2p if n not in f2p_ok][:20],
            "p2p_failed": [n for n in p2p if n not in p2p_ok][:20], "tail": r["tail"][-800:]}


def run_check(tree, env, timeout=1800):
    """Install as CI does, then ./RUNME.sh check. -> {'exit', 'red': [...], 'secs'}"""
    t0 = time.time()
    rc, inst = arms.install(tree, env)
    with CHECK_LOCK:
        try:
            r = subprocess.run(["./RUNME.sh", "check"], cwd=tree, env=env, capture_output=True, text=True,
                               timeout=timeout, stdin=subprocess.DEVNULL)
            out, code = r.stdout + r.stderr, r.returncode
        except subprocess.TimeoutExpired as x:
            out, code = str(x.stdout or "")[-5000:] + "TIMEOUT", -1
    arms.stop_servers(tree)
    red = sorted(set(RED_RE.findall(out)))
    return {"exit": code, "red": red, "secs": round(time.time() - t0, 1), "install_rc": rc,
            "tail": out[-2500:]}


def check_env(workdir):
    os.makedirs(os.path.join(workdir, "home"), exist_ok=True)
    os.makedirs(os.path.join(workdir, "cfg"), exist_ok=True)
    arms.write_home(workdir)
    return arms.agent_env(workdir, arms.MODELS["haiku"])


def base_check(repo, task):
    """The check on the base tree, once per task (cached)."""
    path = os.path.join(WORK, "basecheck", f"{task['ticket']}.json")
    with LOCK:
        if os.path.exists(path):
            return json.load(open(path))
    wd = tempfile.mkdtemp(prefix="bc-", dir=os.path.join(WORK, "tmp"))
    try:
        tree = os.path.join(wd, "quackitect")
        export(repo, task["base"], tree)
        sh(["git", "init", "-q", "-b", "main"], cwd=tree)
        sh(["git", *arms.git_id("agent", "agent"), "add", "-A"], cwd=tree)
        sh(["git", *arms.git_id("agent", "agent"), "commit", "-qm", "base"], cwd=tree)
        res = run_check(tree, check_env(wd))
    finally:
        shutil.rmtree(wd, ignore_errors=True)
    if "no space left on device" not in res.get("tail", ""):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        write_json(path, res)
    return res


def agent_check(task, run_repo, final_tree, start_commit, workdir):
    tree = os.path.join(workdir, "quackitect")
    export(run_repo, final_tree, tree)
    # a git repo as the agent had it, so git-reading parts of the check read the same history
    sh(["git", "init", "-q", "-b", "main"], cwd=tree)
    sh(["git", *arms.git_id("agent", "agent"), "add", "-A"], cwd=tree)
    sh(["git", *arms.git_id("agent", "agent"), "commit", "-qm", "final"], cwd=tree)
    res = run_check(tree, check_env(workdir))
    shutil.rmtree(tree, ignore_errors=True)
    return res


def scope_of(task, changed):
    sol_dirs = {os.path.dirname(p) for p in task["code_files"] + task["test_files"]}
    files = [p for st, p in changed]
    own = [p for p in files if not p.startswith(("spec/tickets/", ".se/"))]
    outside = [p for p in own if os.path.dirname(p) not in sol_dirs]
    outside_code = [p for p in outside if p.endswith(".go") and not p.endswith("_test.go")]
    code = [p for p in own if p.endswith(".go") and not p.endswith("_test.go")]
    tests = [p for p in own if p.endswith("_test.go")]
    return {"files": len(files), "own_files": len(own), "outside": outside[:30], "n_outside": len(outside),
            "n_outside_code": len(outside_code), "non_go": len([p for p in own if not p.endswith(".go")]),
            "code_files": len(code), "test_files": len(tests),
            "tickets_written": len([p for p in files if p.startswith("spec/tickets/")])}


def grade_one(repo, task, run_dir, check_mode, keep):
    meta = json.load(open(os.path.join(run_dir, "meta.json")))
    gpath = os.path.join(run_dir, "grade.json")
    if os.path.exists(gpath):
        return json.load(open(gpath))
    g = {"run": meta["run"], "graded": now()}
    if meta.get("status") != "ran":
        g["status"] = "not-ran"
        write_json(gpath, g)
        return g
    run_repo = os.path.join(meta["scratch"], "quackitect")
    wd = tempfile.mkdtemp(prefix="g-", dir=os.path.join(WORK, "tmp"))
    try:
        g["hidden"] = hidden_grade(repo, task, run_repo, meta["final_tree"], wd)
        if "no space left on device" in g["hidden"].get("tail", ""):
            # the machine failed, not the agent: leave no grade, so the next pass grades again
            print(f"{meta['run']}: disk full while grading; will grade again", flush=True)
            return {"run": meta["run"], "status": "retry"}
        g["scope"] = scope_of(task, meta.get("changed", []))
        g["empty_change"] = g["scope"]["code_files"] == 0
        if check_mode == "all" or (check_mode == "pass" and g["hidden"]["pass"]):
            bc = base_check(repo, task)
            ac = agent_check(task, run_repo, meta["final_tree"], meta["start_commit"], wd)
            if "no space left on device" in ac.get("tail", ""):
                print(f"{meta['run']}: disk full while checking; will grade again", flush=True)
                return {"run": meta["run"], "status": "retry"}
            new_red = sorted(set(ac["red"]) - set(bc["red"]))
            g["check"] = {"exit": ac["exit"], "red": ac["red"], "base_red": bc["red"], "base_exit": bc["exit"],
                          "new_red": new_red, "pass": ac["exit"] == 0,
                          "no_regression": not new_red and (ac["exit"] == 0 or bc["exit"] != 0),
                          "secs": ac["secs"], "tail": ac["tail"][-1500:]}
        g["status"] = "graded"
    except Exception as e:
        g["status"] = "grade-error"
        g["error"] = str(e)[-2000:]
    finally:
        shutil.rmtree(wd, ignore_errors=True)
    write_json(gpath, g)
    if not keep and g["status"] == "graded":
        arms.stop_servers(meta["scratch"])
        shutil.rmtree(meta["scratch"], ignore_errors=True)
    return g


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tasks", required=True)
    ap.add_argument("--batch", required=True)
    ap.add_argument("--repo", default=REPO_DEFAULT)
    ap.add_argument("--jobs", type=int, default=2)
    ap.add_argument("--check", default="pass", choices=["all", "pass", "none"])
    ap.add_argument("--keep", action="store_true")
    ap.add_argument("--watch", action="store_true", help="keep grading as runs finish, until none is left running")
    ap.add_argument("--checks-only", action="store_true",
                    help="run the deferred full checks: every graded run that the --check mode selects and "
                         "that has no check yet (needs the run's scratch tree), on an idle machine")
    ap.add_argument("--cleanup", action="store_true", help="delete the scratch trees of fully graded runs")
    ap.add_argument("--regrade-hidden", action="store_true",
                    help="grade the hidden tests again from each run's final.patch (after tasks.jsonl changed)")
    ap.add_argument("--nice", type=int, default=19, help="grade at low priority, in the sessions' idle time")
    a = ap.parse_args()
    os.nice(a.nice)
    os.makedirs(os.path.join(WORK, "tmp"), exist_ok=True)
    tasks = {t["ticket"]: t for t in read_jsonl(a.tasks)}
    runs_root = os.path.join(a.batch, "runs")
    if a.checks_only or a.cleanup:
        for rid in sorted(os.listdir(runs_root)):
            d = os.path.join(runs_root, rid)
            gp, mp = os.path.join(d, "grade.json"), os.path.join(d, "meta.json")
            if not (os.path.exists(gp) and os.path.exists(mp)):
                continue
            g, meta = json.load(open(gp)), json.load(open(mp))
            if g.get("status") != "graded":
                continue
            want = a.check == "all" or (a.check == "pass" and (g.get("hidden") or {}).get("pass"))
            if a.checks_only and want and "check" not in g:
                t = tasks[rid.split("__")[0]]
                run_repo = os.path.join(meta["scratch"], "quackitect")
                if not os.path.isdir(run_repo):
                    print(f"{rid}: scratch tree gone, no check", flush=True)
                    continue
                wd = tempfile.mkdtemp(prefix="ck-", dir=os.path.join(WORK, "tmp"))
                try:
                    bc = base_check(a.repo, t)
                    ac = agent_check(t, run_repo, meta["final_tree"], meta["start_commit"], wd)
                finally:
                    shutil.rmtree(wd, ignore_errors=True)
                new_red = sorted(set(ac["red"]) - set(bc["red"]))
                g["check"] = {"exit": ac["exit"], "red": ac["red"], "base_red": bc["red"], "base_exit": bc["exit"],
                              "new_red": new_red, "pass": ac["exit"] == 0,
                              "no_regression": not new_red and (ac["exit"] == 0 or bc["exit"] != 0),
                              "secs": ac["secs"], "tail": ac["tail"][-1500:], "when": now()}
                write_json(gp, g)
                print(f"{now()} {rid:70s} check={ac['exit'] == 0} red={ac['red']} base_red={bc['red']}", flush=True)
            if a.cleanup and (not want or "check" in g):
                shutil.rmtree(meta["scratch"], ignore_errors=True)
        return
    if a.regrade_hidden:
        for rid in sorted(os.listdir(runs_root)):
            d = os.path.join(runs_root, rid)
            gp = os.path.join(d, "grade.json")
            t = tasks.get(rid.split("__")[0])
            if not t or not os.path.exists(gp):
                continue
            g = json.load(open(gp))
            if g.get("status") != "graded":
                continue
            wd = tempfile.mkdtemp(prefix="rg-", dir=os.path.join(WORK, "tmp"))
            try:
                h = hidden_from_patch(a.repo, t, os.path.join(d, "final.patch"), wd)
            finally:
                shutil.rmtree(wd, ignore_errors=True)
            g["hidden_first"] = g.get("hidden_first") or g.get("hidden")
            g["hidden"] = h
            g["regraded"] = now()
            write_json(gp, g)
            print(f"{rid:70s} hidden={h.get('pass')} (was {g['hidden_first'].get('pass')}) {h.get('error', '')}", flush=True)
        return
    while True:
        todo = []
        for rid in sorted(os.listdir(runs_root)) if os.path.isdir(runs_root) else []:
            d = os.path.join(runs_root, rid)
            if os.path.exists(os.path.join(d, "meta.json")) and not os.path.exists(os.path.join(d, "grade.json")):
                todo.append(d)
        with cf.ThreadPoolExecutor(a.jobs) as ex:
            futs = {ex.submit(grade_one, a.repo, tasks[os.path.basename(d).split("__")[0]], d, a.check, a.keep): d
                    for d in todo}
            for f in cf.as_completed(futs):
                d = futs[f]
                try:
                    g = f.result()
                except Exception as e:
                    print(f"{os.path.basename(d)} CRASH {e}", flush=True)
                    continue
                h = g.get("hidden") or {}
                c = g.get("check") or {}
                print(f"{now()} {os.path.basename(d):70s} {g.get('status')} hidden={h.get('pass')} "
                      f"f2p={h.get('f2p')} p2p={h.get('p2p')} check={c.get('pass')} new_red={c.get('new_red')} "
                      f"outside={(g.get('scope') or {}).get('n_outside')}", flush=True)
        if not a.watch:
            break
        running = [r for r in os.listdir(runs_root)] if os.path.isdir(runs_root) else []
        pending = [r for r in running if not os.path.exists(os.path.join(runs_root, r, "grade.json"))]
        if not pending and not todo:
            # nothing to grade and nothing running: wait a little for a runner still starting
            time.sleep(60)
            if not any(not os.path.exists(os.path.join(runs_root, r, "grade.json")) for r in os.listdir(runs_root)):
                break
        time.sleep(30)


if __name__ == "__main__":
    main()
