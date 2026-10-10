#!/usr/bin/env python3
"""Measure what the harness costs per tool call and per session: real numbers on this machine.

  * latency of `hx hook pre-tool` / `post-tool` (they run on EVERY agent tool call) and `hx brief`
  * brief size in characters and approximate tokens (chars / 4)
  * store append throughput (FileStore, GitRefStore) and fold time vs log size

    python3 eval/overhead.py
"""
import json
import os
import shutil
import statistics
import subprocess
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from hx import engine, views  # noqa: E402
from hx.service import Hx  # noqa: E402
from hx.store import FakeClock, FileStore, GitRefStore  # noqa: E402
from tests.helpers import FakeVerifier, run_feature_to, ticket  # noqa: E402

HX = os.path.join(ROOT, "bin", "hx")


def populate(store, n_tickets):
    hx = Hx(store, verifier=FakeVerifier())
    for i in range(n_tickets):
        tid = f"T-{i}"
        hx.create_ticket(ticket(tid, risk="medium" if i % 3 == 0 else "low"))
        run_feature_to(hx, tid, stop=None if i < n_tickets - 1 else "green", worker=f"w{i}", reviewer=f"r{i}")
    hx.claim(f"w{n_tickets - 1}", "worker", f"T-{n_tickets - 1}")  # an active holder: the realistic hook path
    return hx


def timeit(args, env, stdin=None, n=15):
    xs = []
    for _ in range(n):
        t0 = time.perf_counter()
        subprocess.run([sys.executable, HX, *args], env=env, input=stdin, capture_output=True, text=True)
        xs.append((time.perf_counter() - t0) * 1000)
    return statistics.median(xs)


def main():
    tmp = tempfile.mkdtemp(prefix="hx-overhead-")
    out = []
    try:
        base_env = {k: v for k, v in os.environ.items() if not k.startswith("HX_")}
        t0 = time.perf_counter()
        subprocess.run([sys.executable, "-c", "pass"], capture_output=True)
        py = (time.perf_counter() - t0) * 1000
        out.append(f"python interpreter start (baseline): {py:.0f} ms")
        out.append("")
        out.append(f"{'log size':>10} {'fold':>8} {'hx brief':>9} {'pre-tool':>9} {'post-tool':>10}  (median ms)")
        for n in (1, 20, 100):
            path = os.path.join(tmp, f"log{n}.jsonl")
            hx = populate(FileStore(path, FakeClock()), n)
            events = hx.store.all_events()
            t0 = time.perf_counter()
            for _ in range(5):
                engine.fold(events)
            fold_ms = (time.perf_counter() - t0) / 5 * 1000
            sid = f"w{n - 1}"
            proj = os.path.join(tmp, f"proj{n}")
            os.makedirs(proj, exist_ok=True)
            env = dict(base_env, HX_STORE=path, HX_SESSION=sid, CLAUDE_PROJECT_DIR=proj, HX_NOW="1760000000")
            hook_in = json.dumps({"session_id": sid, "cwd": proj, "tool_name": "Edit",
                                  "tool_input": {"file_path": os.path.join(proj, "x.py")}})
            b = timeit(["brief"], env)
            pre = timeit(["hook", "pre-tool"], env, hook_in)
            post = timeit(["hook", "post-tool"], env, hook_in)
            out.append(f"{len(events):>10} {fold_ms:>8.1f} {b:>9.0f} {pre:>9.0f} {post:>10.0f}")
        out.append("")
        st = hx.state()
        tid = st["leases"][f"w{n - 1}"]["ticket"]
        brief = views.brief(st, tid, f"w{n - 1}", 1760000000)
        out.append(f"brief for an active green step: {len(brief)} chars ~ {len(brief) // 4} tokens, "
                   f"{len(brief.splitlines())} lines")
        demo = os.path.join(ROOT, "demo", "TRANSCRIPT.md")
        if os.path.exists(demo):
            text = open(demo).read()
            sizes = []
            for chunk in text.split("SessionStart hook injects:\n")[1:]:
                body = chunk.split("```")[0]
                if "more lines)" not in body:
                    sizes.append(len(body))
            if sizes:
                out.append(f"untruncated briefs in the demo transcript: {len(sizes)}, chars median "
                           f"{statistics.median(sizes):.0f}, max {max(sizes)} (~{max(sizes) // 4} tokens)")
        out.append("")
        for label, mk in (("FileStore", lambda: FileStore(os.path.join(tmp, "tp.jsonl"), FakeClock())),
                          ("GitRefStore", lambda: _gitstore(tmp))):
            store = mk()
            hx = Hx(store, verifier=FakeVerifier())
            t0 = time.perf_counter()
            k = 100 if label == "FileStore" else 40
            for i in range(k):
                hx.create_ticket(ticket(f"X-{i}"))
            dt = time.perf_counter() - t0
            out.append(f"{label:12} append: {k / dt:7.0f} events/s ({dt / k * 1000:.1f} ms each, incl. validation)")
        print("\n".join(out))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def _gitstore(tmp):
    repo = os.path.join(tmp, "s.git")
    subprocess.run(["git", "init", "-q", "--bare", repo], check=True)
    return GitRefStore(repo, clock=FakeClock())


if __name__ == "__main__":
    main()
