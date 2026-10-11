#!/usr/bin/env python3
"""Dry-run every task's v5 setup without an agent: seed the origin the way the batch will, clone,
install, set the helper tiers, and report what each verb answered. A task whose setup breaks is
marked in the output, so no agent time goes to it.

  python3 dryseed.py --tasks tasks.jsonl --out dryseed.jsonl [--jobs 4]
"""
import argparse
import concurrent.futures as cf
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arms  # noqa: E402
from benchlib import WORK, append_jsonl, git, read_jsonl  # noqa: E402


def dry(task, repo):
    run_dir = os.path.join(arms.RUNS, "dryseed", task["ticket"])
    shutil.rmtree(run_dir, ignore_errors=True)
    os.makedirs(run_dir)
    model = arms.MODELS["haiku"]
    env = arms.agent_env(run_dir, model, arm="v5")
    out = {"ticket": task["ticket"]}
    try:
        arms.write_home(run_dir, trusted_repo=os.path.join(run_dir, "quackitect"))
        info = arms.seed(task, "v5", run_dir, repo, env)
        out["steps"] = [(s["verb"][:40], s["rc"]) for s in info["setup_steps"]]
        out["outs"] = [s["out"][-300:] for s in info["setup_steps"] if s["rc"] != 0]
        out["group_state"] = info["group_state"]
        out["heads"] = info["origin_heads"]
        out["prompt_from_verb"] = not info["prompt"].endswith("children, accept, retro.")
        tree, start, rc, inst = arms.clone_for_agent(run_dir, "v5", env, model)
        out["install_rc"] = rc
        out["config"] = [ln for ln in inst.splitlines() if ln.startswith("config helper")]
        out["ok"] = (out["group_state"] == "open" and "work/" + arms.GROUP in out["heads"]
                     and rc == 0)
    except Exception as e:
        out["ok"] = False
        out["error"] = str(e)[-800:]
    finally:
        arms.stop_servers(run_dir)
        shutil.rmtree(run_dir, ignore_errors=True)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tasks", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--repo", default=os.path.join(WORK, "qk"))
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    tasks = read_jsonl(a.tasks)
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        for r in ex.map(lambda t: dry(t, a.repo), tasks):
            append_jsonl(a.out, r)
            print(json.dumps(r)[:400], flush=True)


if __name__ == "__main__":
    main()
