"""Run `go test -json` over named packages and fold the stream into per-test outcomes.

A test is named 'pkg/path:TestName' (top-level tests only; subtests fold into
their parent). A package that fails to build marks every test the caller
expects there as 'build-fail'.
"""
import json
import os
import subprocess
import time


def go_pkgs_of(paths):
    """Package dirs ('./src/x') for Go test files and testdata files."""
    pkgs = set()
    for p in paths:
        if "/testdata/" in p:
            p = p.split("/testdata/")[0] + "/x.go"
        if p.endswith(".go"):
            d = os.path.dirname(p)
            pkgs.add("./" + d if d else ".")
    return sorted(pkgs)


def run_go_tests(tree, pkgs, timeout=900, env=None, run=None):
    """-> {'tests': {name: 'pass'|'fail'|'skip'}, 'pkgs': {pkg: 'ok'|'fail'|'build-fail'}, 'secs': s, 'tail': str}"""
    if not pkgs:
        return {"tests": {}, "pkgs": {}, "secs": 0.0, "tail": ""}
    args = ["go", "test", "-json", "-count=1", "-p", "2"]
    if run:
        args += ["-run", run]
    args += list(pkgs)
    e = dict(os.environ if env is None else env)
    t0 = time.time()
    try:
        r = subprocess.run(args, cwd=tree, capture_output=True, text=True, timeout=timeout, env=e)
        out, err, timed_out = r.stdout, r.stderr, False
    except subprocess.TimeoutExpired as x:
        out = x.stdout.decode() if isinstance(x.stdout, bytes) else (x.stdout or "")
        err, timed_out = "TIMEOUT", True
    tests, pkg_state, build_out = {}, {}, []
    said = {}  # test -> its output lines, for the tail of a failure
    for line in out.splitlines():
        try:
            ev = json.loads(line)
        except ValueError:
            build_out.append(line)
            continue
        pkg = ev.get("Package", "")
        rel = pkg.split("quackitect/", 1)[-1] if "quackitect/" in pkg else pkg
        act, test = ev.get("Action"), ev.get("Test")
        if act == "build-output":
            build_out.append(ev.get("Output", "").rstrip())
            continue
        if act == "build-fail" or (ev.get("ImportPath") and act == "build-fail"):
            pkg_state[rel] = "build-fail"
        if act in ("pass", "fail", "skip"):
            if test:
                if "/" not in test:
                    tests[f"{rel}:{test}"] = act
            else:
                if ev.get("FailedBuild"):
                    pkg_state[rel] = "build-fail"
                elif pkg_state.get(rel) != "build-fail":
                    pkg_state[rel] = "ok" if act == "pass" else ("skip" if act == "skip" else "fail")
        if act == "output" and test:
            said.setdefault(f"{rel}:{test.split('/')[0]}", []).append(ev.get("Output", "").rstrip())
        if act == "output" and ev.get("Output", "").startswith(("FAIL", "# ")) and not test:
            build_out.append(ev["Output"].rstrip())
    # a package with a build error prints a '# pkg' block on stderr and a fail for the package
    for p in pkgs:
        rel = p[2:] if p.startswith("./") else p
        if rel not in pkg_state:
            pkg_state[rel] = "build-fail" if ("build failed" in err or "setup failed" in err
                                             or timed_out) else "missing"
        elif pkg_state[rel] == "fail" and not any(k.startswith(rel + ":") for k in tests):
            pkg_state[rel] = "build-fail"
    if timed_out:
        for rel in pkg_state:
            if pkg_state[rel] != "ok":
                pkg_state[rel] = "timeout"
    failed_said = []
    for name, act in tests.items():
        if act == "fail":
            lines = [ln for ln in said.get(name, []) if ln.strip() and not ln.startswith(("=== RUN", "=== PAUSE", "=== CONT"))]
            failed_said += [f"[{name}]"] + lines[-6:]
    tail = "\n".join((failed_said[-60:] + build_out + err.splitlines())[-90:])
    return {"tests": tests, "pkgs": pkg_state, "secs": round(time.time() - t0, 1), "tail": tail}
