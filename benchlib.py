"""Shared helpers for the quackitect benchmark: git plumbing, paths, file classes.

Every script in this folder imports this module. Nothing here touches the
owner's checkout: callers pass a repo path (a clone or mirror) explicitly.
"""
import json
import os
import re
import subprocess
import time

HERE = os.path.dirname(os.path.abspath(__file__))

# Where temp clones, run trees and caches live. Never inside the repo checkout.
WORK = os.environ.get("BENCH_WORK", os.path.join(os.path.dirname(HERE), "bw"))


def sh(args, cwd=None, check=True, env=None, input=None, timeout=None, text=True):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=text, env=env,
                       input=input, timeout=timeout)
    if check and r.returncode != 0:
        raise RuntimeError(f"{args!r} in {cwd}: exit {r.returncode}\n{r.stdout[-2000:]}{r.stderr[-2000:]}")
    return r


def git(repo, *args, check=True, input=None, text=True):
    return sh(["git", "-C", repo, *args], check=check, input=input, text=text)


def git_out(repo, *args, check=True):
    return git(repo, *args, check=check).stdout


def show(repo, rev, path):
    """File content at rev, or None when the path does not exist there."""
    r = git(repo, "show", f"{rev}:{path}", check=False)
    return r.stdout if r.returncode == 0 else None


def exists(repo, rev, path):
    return git(repo, "cat-file", "-e", f"{rev}:{path}", check=False).returncode == 0


# ---------------------------------------------------------------- file classes

TICKET_RE = re.compile(r"^(spec/tickets/|\.se/tickets/)")


def is_test_file(path):
    base = os.path.basename(path)
    return (path.endswith("_test.go") or base.endswith(".test.js") or base.endswith(".test.ts")
            or base.endswith(".test.mjs") or "/testdata/" in path or path.startswith("testdata/"))


def is_harness_file(path):
    """Paths that make up the v5 harness surface a plain agent must not get injected."""
    return (path.startswith(".claude/") or path == "AGENTS.md" or path.startswith(".githooks/")
            or path.startswith(".claude-plugin/"))


def file_class(path):
    if TICKET_RE.match(path):
        return "ticket"
    if is_test_file(path):
        return "test"
    if path.endswith((".go", ".js", ".ts", ".mjs", ".cjs", ".sh", ".ps1", ".py")) or path in ("go.mod", "go.sum"):
        return "code"
    if path.startswith("spec/"):
        return "spec"
    return "other"


# ---------------------------------------------------------------- front matter

def front_of(text):
    """The YAML front matter of a note as a raw string ('' when none)."""
    if not text or not text.startswith("---"):
        return ""
    end = text.find("\n---", 3)
    return text[3:end] if end > 0 else ""


def field_of(text, name):
    """A top-level scalar field of the front matter, unquoted, or ''."""
    for line in front_of(text).splitlines():
        m = re.match(rf"^{re.escape(name)}:\s*(.*)$", line)
        if m:
            v = m.group(1).strip()
            if v.startswith('"') and v.endswith('"'):
                v = v[1:-1]
            return v
    return ""


def link_name(v):
    """[[spec/processes/trivial]] -> trivial ; [[group]] -> group."""
    m = re.search(r"\[\[([^\]]+)\]\]", v or "")
    v = m.group(1) if m else (v or "")
    return v.rsplit("/", 1)[-1]


def section_of(text, heading):
    """The body under '# <heading>' up to the next top-level heading."""
    body = text
    fm = front_of(text)
    if fm:
        body = text[text.find("\n---", 3) + 4:]
    lines = body.splitlines()
    out, on = [], False
    for line in lines:
        if re.match(r"^# ", line):
            if on:
                break
            on = line[2:].strip().lower() == heading.lower()
            continue
        if on:
            out.append(line)
    return "\n".join(out).strip()


# ---------------------------------------------------------------- misc

def now():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def read_jsonl(path):
    if not os.path.exists(path):
        return []
    rows = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def append_jsonl(path, row):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "a") as f:
        f.write(json.dumps(row, sort_keys=True) + "\n")


def write_json(path, obj):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(obj, f, indent=1, sort_keys=True)
    os.replace(tmp, path)
