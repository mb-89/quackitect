#!/usr/bin/env python3
"""Run agent sessions: every (task, arm, seed) of a batch, a few at a time.

  python3 run.py --tasks tasks.jsonl --batch results/<name> --model haiku \\
      --arms plain,v5,plain+stop --seeds 1 --jobs 3 [--only t1,t2] [--wall 2700]

Each run leaves results/<name>/runs/<task>__<arm>__s<seed>/ with meta.json (the numbers),
transcript.jsonl.gz, final.patch and prompt.txt; the big trees are deleted once the run is
graded (grade.py) unless --keep. A run already holding meta.json is skipped, so a batch
resumes where it stopped. Every finished session appends one line to costlog.jsonl in the
batch and in the bench folder.
"""
import argparse
import queue
import concurrent.futures as cf
import gzip
import json
import os
import random
import shutil
import sys
import threading
import time
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arms  # noqa: E402
import transcript  # noqa: E402
from benchlib import HERE, WORK, append_jsonl, git, now, read_jsonl, sh, write_json  # noqa: E402

LOCK = threading.Lock()
REPO_DEFAULT = os.path.join(WORK, "qk")
PAUSE_AT = float(os.environ.get("BENCH_PAUSE_AT", "0.93"))  # five-hour utilization that pauses new runs
LAST_RATE = {"five_hour": 0.0}
# Each worker takes a slot of cores and pins itself (and every process it starts) to them, so a
# session meets a small box of its own instead of four cores every session and grader shares.
SLOTS = queue.Queue()


def run_id(task, arm, seed):
    return f"{task['ticket']}__{arm}__s{seed}"


def run_one(task, arm, seed, model, batch, repo, wall, budget, max_turns, keep):
    slot = SLOTS.get()
    try:
        os.sched_setaffinity(0, slot)
        m = run_pinned(task, arm, seed, model, batch, repo, wall, budget, max_turns, keep)
        m["cpus"] = sorted(slot)
        return m
    finally:
        SLOTS.put(slot)


def prune(scratch):
    """After the session: drop what grading never reads (the index database, the binaries, the
    temp folder), keeping the agent's git objects."""
    for sub in ("quackitect/.se/.runtime", "tmp", "home/.cache", "seed"):
        shutil.rmtree(os.path.join(scratch, sub), ignore_errors=True)


def run_pinned(task, arm, seed, model, batch, repo, wall, budget, max_turns, keep):
    rid = run_id(task, arm, seed)
    out = os.path.join(batch, "runs", rid)
    meta_path = os.path.join(out, "meta.json")
    if os.path.exists(meta_path):
        return json.load(open(meta_path))
    while LAST_RATE["five_hour"] >= PAUSE_AT:
        print(f"{now()} five-hour utilization {LAST_RATE['five_hour']}: {rid} waits 10 min", flush=True)
        time.sleep(600)
        with LOCK:
            LAST_RATE["five_hour"] = min(LAST_RATE["five_hour"], PAUSE_AT - 0.01)
    scratch = os.path.join(arms.RUNS, os.path.basename(batch.rstrip("/")), rid)
    shutil.rmtree(scratch, ignore_errors=True)
    os.makedirs(scratch)
    os.makedirs(out, exist_ok=True)
    model_id = arms.MODELS.get(model, model)
    tree = os.path.join(scratch, "quackitect")
    meta = {"run": rid, "ticket": task["ticket"], "arm": arm, "seed": seed, "model": model_id,
            "started": now(), "wall_cap": wall, "budget_cap": budget, "turn_cap": max_turns,
            "scratch": scratch}
    env = arms.agent_env(scratch, model_id, arm=arm)
    try:
        arms.write_home(scratch, trusted_repo=tree if arm == "v5" else None)
        t0 = time.time()
        info = arms.seed(task, arm, scratch, repo, env)
        tree, start, rc, inst = arms.clone_for_agent(scratch, arm, env, model_id)
        meta["install_tail"] = inst[-600:]
        meta["setup_secs"] = round(time.time() - t0, 1)
        meta["install_rc"] = rc
        if arm == "v5":
            prompt = info["prompt"]
            meta["seed_info"] = {k: v for k, v in info.items() if k != "prompt"}
        else:
            prompt = arms.plain_prompt(task, stop=(arm == "plain+stop"))
        with open(os.path.join(out, "prompt.txt"), "w") as f:
            f.write(prompt)
        meta["start_commit"] = start
        sess = arms.run_session(scratch, tree, arm, model_id, prompt, env, wall, budget, max_turns)
        meta.update(sess)
        s = transcript.fold(os.path.join(scratch, "transcript.jsonl"))
        meta["session"] = {k: v for k, v in s.items() if k not in ("bash_cmds",)}
        meta["nested"] = transcript.meter(os.path.join(scratch, "meter"))
        meta["cost_total"] = round((s.get("cost") or 0) + meta["nested"]["cost"], 5)
        meta["bash_tail"] = s["bash_cmds"][-30:]
        with open(os.path.join(scratch, "transcript.jsonl"), "rb") as f, \
                gzip.open(os.path.join(out, "transcript.jsonl.gz"), "wb") as g:
            shutil.copyfileobj(f, g)
        arms.stop_servers(tree)
        ft, where = arms.final_tree(tree, start, arm)
        meta["final_tree"], meta["final_from"] = ft, where
        start_tree = git(tree, "rev-parse", f"{start}^{{tree}}").stdout.strip()
        meta["start_tree"] = start_tree
        patch = git(tree, "diff", "--binary", start_tree, ft, check=False).stdout
        with open(os.path.join(out, "final.patch"), "w") as f:
            f.write(patch)
        names = git(tree, "diff", "--name-status", "--no-renames", start_tree, ft, check=False).stdout
        meta["changed"] = [ln.split("\t", 1) for ln in names.splitlines() if "\t" in ln]
        meta["commits_made"] = int(git(tree, "rev-list", "--count", "--all", f"^{start}", check=False).stdout.strip() or 0)
        meta["branch_at_end"] = git(tree, "rev-parse", "--abbrev-ref", "HEAD", check=False).stdout.strip()
        meta["load_end"] = os.getloadavg()
        meta["status"] = "ran"
    except Exception as e:  # a broken setup is a result too: record it, never retry silently
        meta["status"] = "setup-error"
        meta["error"] = (str(e) + "\n" + traceback.format_exc())[-3000:]
    finally:
        arms.stop_servers(scratch)
        prune(scratch)
    meta["finished"] = now()
    write_json(meta_path, meta)
    if meta.get("session"):
        row = {"when": meta["finished"], "batch": os.path.basename(batch.rstrip("/")), "run": rid,
               "arm": arm, "model": model_id, "cost_usd": meta["cost_total"],
               "nested_cost_usd": meta["nested"]["cost"], "nested_calls": meta["nested"]["calls"],
               "estimated": meta["session"]["cost_estimated"], "secs": meta.get("secs"),
               "tokens_in": meta["session"]["input_tokens"], "tokens_out": meta["session"]["output_tokens"],
               "cache_read": meta["session"]["cache_read"], "cache_write": meta["session"]["cache_write"]}
        with LOCK:
            append_jsonl(os.path.join(batch, "costlog.jsonl"), row)
            append_jsonl(os.path.join(HERE, "costlog.jsonl"), row)
        rl = meta["session"].get("rate_limit") or {}
        if rl.get("five_hour") is not None:
            LAST_RATE["five_hour"] = rl["five_hour"]
    if not keep and meta.get("status") != "ran":
        shutil.rmtree(scratch, ignore_errors=True)
    return meta


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tasks", required=True)
    ap.add_argument("--batch", required=True)
    ap.add_argument("--repo", default=REPO_DEFAULT)
    ap.add_argument("--model", default="haiku")
    ap.add_argument("--arms", default="plain,v5,plain+stop")
    ap.add_argument("--seeds", type=int, default=1)
    ap.add_argument("--first-seed", type=int, default=1)
    ap.add_argument("--jobs", type=int, default=3)
    ap.add_argument("--only", default="")
    ap.add_argument("--wall", type=int, default=2700, help="wall-clock cap per session, seconds")
    ap.add_argument("--budget", type=float, default=0, help="--max-budget-usd per session (0: none)")
    ap.add_argument("--max-turns", type=int, default=0)
    ap.add_argument("--keep", action="store_true")
    ap.add_argument("--shuffle-seed", type=int, default=7)
    ap.add_argument("--keep-order", action="store_true", help="run tasks in the file's order (arms still shuffled)")
    ap.add_argument("--cpus-per-run", type=int, default=2)
    a = ap.parse_args()
    tasks = read_jsonl(a.tasks)
    if a.only:
        want = set(a.only.split(","))
        tasks = [t for t in tasks if t["ticket"] in want]
    armlist = a.arms.split(",")
    # Tasks in a shuffled order; a task's arms start together (in a shuffled order), so every
    # arm of a task meets the same hour, the same machine load and the same API weather, and a
    # stopped batch leaves whole triples. Seeds come as later rounds.
    rng = random.Random(a.shuffle_seed)
    order = list(tasks)
    if not a.keep_order:
        rng.shuffle(order)
    jobs = []
    for s in range(a.first_seed, a.first_seed + a.seeds):
        for t in order:
            arms_here = list(armlist)
            rng.shuffle(arms_here)
            jobs += [(t, arm, s) for arm in arms_here]
    os.makedirs(a.batch, exist_ok=True)
    write_json(os.path.join(a.batch, "batch.json"), {
        "created": now(), "model": arms.MODELS.get(a.model, a.model), "arms": armlist, "seeds": a.seeds,
        "tasks": [t["ticket"] for t in tasks], "wall": a.wall, "budget": a.budget, "max_turns": a.max_turns,
        "claude": sh([arms.CLAUDE, "--version"]).stdout.strip(), "tools": arms.TOOLS})
    cores = sorted(os.sched_getaffinity(0))
    for i in range(a.jobs):
        part = cores[(i * a.cpus_per_run) % len(cores):][:a.cpus_per_run] or cores[:a.cpus_per_run]
        SLOTS.put(set(part))
    print(f"{len(jobs)} runs, {a.jobs} at a time, {a.cpus_per_run} cores each", flush=True)
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        futs = {}
        for j in jobs:
            futs[ex.submit(run_one, j[0], j[1], j[2], a.model, a.batch, a.repo, a.wall, a.budget,
                           a.max_turns, a.keep)] = j
        for f in cf.as_completed(futs):
            t, arm, s = futs[f]
            try:
                m = f.result()
            except Exception as e:
                print(f"{now()} {t['ticket']} {arm} s{s}: CRASH {e}", flush=True)
                continue
            ss = m.get("session") or {}
            print(f"{now()} {m['run']:70s} {m.get('status')} ${ss.get('cost', 0):.3f} "
                  f"{m.get('secs')}s turns={ss.get('turns')} cap={m.get('killed_at_cap')} "
                  f"end={ss.get('result_subtype')} rl={ss.get('rate_limit')}", flush=True)


if __name__ == "__main__":
    main()
