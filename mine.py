#!/usr/bin/env python3
"""Mine candidate benchmark tasks from quackitect's own history.

A task is one closed ticket whose work commits form one unbroken run:

  base      the parent of the ticket's first work commit (the tree just before the work)
  solution  the ticket's last work commit
  ask       the ticket's '# Ask' section as it stood before the work: at base when the
            ticket file already stood there, else at the commit that minted it
  hidden    every test file the run adds or changes (withheld from the agent)

Commits belong to a ticket by their subject prefix '<ticket>: ...', which every
hand in this tree writes (the verbs write it too). A run is unbroken when every
commit on the first-parent chain from the first work commit to the last is the
ticket's own, or touches ticket files only (bookkeeping). A merge inside the run
breaks it, because it brings in work that is not the ticket's.

usage: python3 mine.py --repo <clone with origin/main> [--ref origin/main] --out candidates.jsonl
"""
import argparse
import collections
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from benchlib import (field_of, file_class, git, git_out, is_harness_file, link_name,  # noqa: E402
                      section_of, show)

SEP = "\x1e"


def load_commits(repo, ref):
    """Every commit reachable from ref: sha -> {parents, subject, time, files{path: (add, del, status)}}."""
    out = git_out(repo, "log", ref, "--no-renames", f"--format={SEP}%H%x00%P%x00%at%x00%s",
                  "--numstat")
    commits = {}
    for chunk in out.split(SEP)[1:]:
        head, _, rest = chunk.partition("\n")
        sha, parents, at, subject = head.split("\x00", 3)
        files = {}
        for line in rest.splitlines():
            parts = line.split("\t")
            if len(parts) != 3:
                continue
            a, d, p = parts
            files[p] = (int(a) if a.isdigit() else 0, int(d) if d.isdigit() else 0)
        commits[sha] = {"sha": sha, "parents": parents.split(), "time": int(at),
                        "subject": subject, "files": files}
    return commits


def prefix_of(subject):
    m = re.match(r"^(?:work/)?([a-z0-9][a-z0-9-]*[a-z0-9]):", subject)
    return m.group(1) if m else None


def first_parent_chain(commits, start, stop, limit=400):
    """Commits from start back along first parents until stop (exclusive); None if stop not met."""
    chain, cur = [], start
    while cur and cur != stop and len(chain) < limit:
        chain.append(cur)
        c = commits.get(cur)
        if not c or not c["parents"]:
            return None
        cur = c["parents"][0]
    return chain if cur == stop else None


def mint_commit(repo, ref, path):
    """The oldest commit that added path (following no renames)."""
    out = git_out(repo, "log", ref, "--diff-filter=A", "--format=%H", "--", path).split()
    return out[-1] if out else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    ap.add_argument("--ref", default="origin/main")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    repo = a.repo

    commits = load_commits(repo, a.ref)
    by_prefix = collections.defaultdict(list)
    for c in commits.values():
        p = prefix_of(c["subject"])
        if p:
            by_prefix[p].append(c["sha"])

    names = [os.path.basename(p)[:-3] for p in git_out(repo, "ls-tree", "--name-only", a.ref,
                                                       "spec/tickets/").split() if p.endswith(".md")]
    rows, stats = [], collections.Counter()
    for name in sorted(names):
        path = f"spec/tickets/{name}.md"
        text = show(repo, a.ref, path) or ""
        state, reason = field_of(text, "state"), field_of(text, "reason")
        process, group = link_name(field_of(text, "process")), field_of(text, "group")
        stats["tickets"] += 1
        if state != "closed" or reason != "done":
            stats["not closed done"] += 1
            continue
        if process == "group":
            stats["group tickets"] += 1
            continue
        mine = sorted(by_prefix.get(name, []), key=lambda s: commits[s]["time"])
        if not mine:
            stats["no commits of its own"] += 1
            continue
        # bookkeeping that may stand before the base: the mint, the open, a skipped owner read,
        # a route taken again. None of it carries an approach, a test or code.
        pre = re.compile(rf"^{re.escape(name)}: (opens|mints .*|skips design/owner-read|takes \S+ again)$")
        lead = 0
        while lead < len(mine) and pre.match(commits[mine[lead]]["subject"]) and all(
                file_class(p) == "ticket" for p in commits[mine[lead]]["files"]):
            lead += 1
        rest = mine[lead:]
        closers = [s for s in rest if "closes done" in commits[s]["subject"]]
        if not rest or not closers:
            stats["no closing commit of its own"] += 1
            continue
        first, last = rest[0], closers[-1]
        if not any(file_class(p) in ("code", "test") for s in rest for p in commits[s]["files"]):
            stats["no work commits"] += 1
            continue
        if not commits[first]["parents"]:
            stats["root commit"] += 1
            continue
        base = commits[first]["parents"][0]
        chain = first_parent_chain(commits, last, base)
        if chain is None:
            stats["work not on one first-parent line"] += 1
            continue
        foreign, merges = [], 0
        for s in chain:
            c = commits[s]
            if len(c["parents"]) > 1:
                merges += 1
            if prefix_of(c["subject"]) == name:
                continue
            if all(file_class(p) == "ticket" for p in c["files"]):
                continue
            foreign.append(s)
        if merges:
            stats["merge inside the run"] += 1
            continue
        if foreign:
            stats["foreign commits inside the run"] += 1
            continue
        missing = [s for s in rest if s not in chain and commits[s]["time"] <= commits[last]["time"]]
        if missing:
            stats["work commits off the run"] += 1
            continue
        work = [s for s in chain if any(file_class(p) in ("code", "test") for p in commits[s]["files"])]

        # the diff of the run, by class
        numstat = git_out(repo, "diff", "--no-renames", "--numstat", base, last)
        files = {}
        for line in numstat.splitlines():
            ad, dl, p = line.split("\t")
            files[p] = (int(ad) if ad.isdigit() else 0, int(dl) if dl.isdigit() else 0)
        by_class = collections.Counter()
        for p, (ad, dl) in files.items():
            by_class[file_class(p)] += ad + dl
        tests = sorted(p for p in files if file_class(p) == "test")
        code = sorted(p for p in files if file_class(p) == "code")
        if not tests:
            stats["no test change"] += 1
            continue
        if not code:
            stats["tests only, no code change"] += 1
            continue

        # the ask as it stood before the work
        at_base = show(repo, base, path)
        if at_base and section_of(at_base, "Ask"):
            ask_text, ask_from = section_of(at_base, "Ask"), "base"
        else:
            minted = mint_commit(repo, a.ref, path)
            mtext = show(repo, minted, path) if minted else None
            ask_text = section_of(mtext, "Ask") if mtext else ""
            ask_from = "mint-in-run" if minted in chain else ("mint" if minted else "none")
        if not ask_text:
            stats["no ask"] += 1
            continue
        status = git_out(repo, "diff", "--no-renames", "--name-status", base, last)
        deleted = [ln.split("\t", 1)[1] for ln in status.splitlines() if ln.startswith("D\t")]
        rows.append({
            "ticket": name, "group": group, "process": process,
            "base": base, "solution": last, "commits": len(chain), "work_commits": len(work),
            "first_time": commits[first]["time"], "last_time": commits[last]["time"],
            "minutes": round((commits[last]["time"] - commits[first]["time"]) / 60, 1),
            "ask": ask_text, "ask_from": ask_from, "ask_chars": len(ask_text),
            "files": len(files), "code_files": code, "test_files": tests, "deleted": deleted,
            "lines": dict(by_class), "harness_touched": sorted(p for p in files if is_harness_file(p)),
            "subjects": [commits[s]["subject"][:200] for s in reversed(chain)],
        })
        stats["candidate"] += 1

    with open(a.out, "w") as f:
        for r in rows:
            f.write(json.dumps(r, sort_keys=True) + "\n")
    for k, v in stats.most_common():
        print(f"{v:6d}  {k}")


if __name__ == "__main__":
    main()
