#!/usr/bin/env python3
"""Join the mined candidates with their validation into tasks.jsonl, and write each task's
interface note.

  python3 select_tasks.py --repo <clone> --candidates c.jsonl --validated v.jsonl --out tasks.jsonl

A task keeps:
  - its validation said valid: FAIL_TO_PASS not empty, the base builds;
  - every FAIL_TO_PASS and PASS_TO_PASS test came out the same in every rep (flaky ones dropped).

kind:
  behavioral  the hidden tests build against the base: they call only what already stands,
              so the ask alone decides whether an agent can pass them.
  interface   the hidden tests call a name the solution adds or changes. The task then carries
              an interface note: the declarations (signatures, no bodies) of every such name the
              hidden tests mention, as the solution declares them. Every arm gets the same note
              (plain in its prompt, v5 inside the ticket's ask), so no arm guesses a name.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from benchlib import WORK, git, read_jsonl  # noqa: E402

SIGS = os.path.join(os.environ.get("BENCH_TOOLS", "/tmp/qbtools"), "sigs")
SIGS_SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sigs")


def ensure_sigs():
    if not os.path.exists(SIGS):
        os.makedirs(os.path.dirname(SIGS), exist_ok=True)
        subprocess.run(["go", "build", "-o", SIGS, "."], cwd=SIGS_SRC, check=True)


def sigs_at(repo, rev, pkg_dir):
    tmp = tempfile.mkdtemp(prefix="sigs-")
    try:
        arch = subprocess.run(["git", "-C", repo, "archive", rev, pkg_dir], capture_output=True)
        if arch.returncode != 0:
            return {}
        subprocess.run(["tar", "-x", "-C", tmp], input=arch.stdout, check=True)
        r = subprocess.run([SIGS, os.path.join(tmp, pkg_dir)], capture_output=True, text=True)
        return json.loads(r.stdout or "{}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def interface_note(repo, cand):
    """Declarations the hidden tests mention that the solution adds or changes."""
    words = set()
    for p in cand["test_files"]:
        if p.endswith(".go"):
            txt = git(repo, "show", f"{cand['solution']}:{p}", check=False).stdout
            words |= set(re.findall(r"[A-Za-z_][A-Za-z0-9_]*", txt))
    pkgs = sorted({os.path.dirname(p) for p in cand["code_files"] if p.endswith(".go")})
    notes = []
    for pkg in pkgs:
        before, after = sigs_at(repo, cand["base"], pkg), sigs_at(repo, cand["solution"], pkg)
        for name in sorted(after):
            if before.get(name) == after[name]:
                continue
            short = name.split(".")[-1]
            if short in words or name in words:
                decl = after[name]
                if name in before and decl.startswith("type ") and "struct {" in decl:
                    # a struct that grew: its header and the fields it gained, not the whole body
                    old = {ln.strip() for ln in before[name].splitlines()}
                    new = [ln for ln in decl.splitlines()[1:-1]
                           if ln.strip() not in old and not ln.strip().startswith("//")]
                    decl = decl.splitlines()[0] + "\n" + "\n".join(new) + "\n\t// ...the fields it already had\n}"
                notes.append((pkg, name, decl, "changed" if name in before else "new"))
    if not notes:
        return ""
    lines = ["The hidden tests call this interface, as the reference change declares it "
             "(signatures only; keep these names, parameters and results):"]
    cur = None
    for pkg, name, decl, how in notes:
        if pkg != cur:
            lines.append(f"\nin {pkg}/ (package {os.path.basename(pkg)}):")
            cur = pkg
        lines.append(f"  {decl.strip()}" + ("" if how == "new" else "    // changed"))
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    ap.add_argument("--candidates", required=True)
    ap.add_argument("--validated", required=True, nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--max-note-chars", type=int, default=2500)
    a = ap.parse_args()
    ensure_sigs()
    cands = {c["ticket"]: c for c in read_jsonl(a.candidates)}
    vals = {}
    for path in a.validated:  # a later file overrides an earlier one (more reps)
        for v in read_jsonl(path):
            vals[v["ticket"]] = v
    out = []
    for name, v in sorted(vals.items()):
        c = cands.get(name)
        if not c or not v.get("valid"):
            continue
        flaky = set(v.get("flaky", []))
        f2p = [t for t in v["f2p"] if t not in flaky]
        p2p = [t for t in v["p2p"] if t not in flaky]
        if not f2p:
            continue
        kind = "behavioral" if v.get("hidden_builds_on_base") else "interface"
        note = interface_note(a.repo, c) if kind == "interface" else ""
        task = {k: c[k] for k in ("ticket", "group", "process", "base", "solution", "ask", "ask_from",
                                  "code_files", "test_files", "deleted", "lines", "files", "commits",
                                  "minutes", "first_time")}
        task.update({"kind": kind, "interface_note": note, "f2p": f2p, "p2p": p2p,
                     "pkgs": v["pkgs"], "reps": v.get("reps", 1), "solution_green": v.get("solution_green"),
                     "n_flaky": len(flaky)})
        if kind == "interface" and (not note or len(note) > a.max_note_chars):
            task["excluded"] = "no interface note" if not note else "interface note too long"
        out.append(task)
    with open(a.out, "w") as f:
        for t in out:
            f.write(json.dumps(t, sort_keys=True) + "\n")
    kept = [t for t in out if not t.get("excluded")]
    print(f"{len(out)} valid, {len(kept)} kept: "
          f"{sum(1 for t in kept if t['kind'] == 'behavioral')} behavioral, "
          f"{sum(1 for t in kept if t['kind'] == 'interface')} interface")


if __name__ == "__main__":
    main()
