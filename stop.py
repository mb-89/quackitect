#!/usr/bin/env python3
"""Stop a batch: its runner, its graders, every session and every server its runs started.

  python3 stop.py <batch name>      (the folder name under results/ and /tmp/qb/)

A session runs in its own PID namespace, so a killed runner leaves it running; this finds every
process whose working folder or command line stands under /tmp/qb/<batch>, plus the runner and
grader whose command line names the batch, and kills them.
"""
import os
import signal
import sys


def main():
    name = sys.argv[1]
    root = os.path.join(os.environ.get("BENCH_RUNS", "/tmp/qb"), name)
    me = os.getpid()
    hits = []
    for pid in os.listdir("/proc"):
        if not pid.isdigit() or int(pid) == me:
            continue
        try:
            cmd = open(f"/proc/{pid}/cmdline", "rb").read().replace(b"\0", b" ").decode(errors="replace")
            cwd = os.readlink(f"/proc/{pid}/cwd")
        except OSError:
            continue
        mine = cwd.startswith(root) or root in cmd
        runner = ("run.py" in cmd or "grade.py" in cmd or "bench.py" in cmd) and f"/{name}" in cmd
        if mine or runner:
            hits.append((int(pid), cmd[:120]))
    for pid, cmd in hits:
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
    print(f"killed {len(hits)} processes")


if __name__ == "__main__":
    main()
