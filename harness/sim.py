"""A simulation of the harness mechanics against a lone agent, under a stated fault model.

The harness condition drives the real engine (gates, leases, handovers,
holds) with a scripted worker over the fake repository. The lone condition
is modelled directly: one agent, three phases, its own word on done.

What this does not simulate: model capability. Both conditions draw the
same per-step outcome distributions. What differs is what the mechanics do
with a crash, a stall, a vacuous test, a false claim of done, and a hidden
defect. EVAL.md states the assumptions and what would break the result.
"""

from __future__ import annotations

import argparse
import random
import statistics
from dataclasses import asdict, dataclass, fields
from pathlib import Path

from .engine import Engine
from .repo import FakeRepo
from .routes import load_dir


@dataclass
class Faults:
    p_crash: float = 0.15        # per attempt: the worker dies mid-step and leaves no handover
    p_stall: float = 0.05        # per attempt: the worker spins with no progress
    p_vacuous_test: float = 0.10  # the test step writes tests that pass with no implementation
    p_broken: float = 0.30       # the implementation fails the visible tests
    p_defect: float = 0.20       # the implementation passes the visible tests and fails the hidden ones
    p_false_done: float = 0.50   # a lone agent claims done over failing visible tests
    p_review_catch: float = 0.70  # a fresh reviewer catches a hidden defect
    p_self_catch: float = 0.30   # the lone agent's own review catches a hidden defect
    rework: float = 0.50         # the share of progress a lone restart loses with no handover
    lone_attempts: int = 3       # restarts a lone agent gets
    owner_patience: int = 2      # retries the owner grants a stuck ticket
    units: float = 10.0          # tool calls one clean step costs
    spin: float = 20.0           # tool calls a stall burns before the harness kills it
    lone_spin: float = 40.0      # tool calls a lone stall burns before its turn budget ends
    read: float = 1.0            # tool calls a new attempt spends reading the briefing and handover


class Clock:
    def __init__(self):
        self.t = 1_000_000.0

    def __call__(self):
        return self.t


def _commit(repo: FakeRepo, branch: str, files: dict, tests_exit: int) -> str:
    base = dict(repo.commits[repo.tip(branch)]["files"])
    base.update(files)
    return repo.commit(branch, base, tests_exit=tests_exit)


def harness_task(seed: int, f: Faults, routes) -> dict:
    rng = random.Random(seed)
    repo = FakeRepo()
    repo.commit("ticket/t", {"README": "x"}, tests_exit=5, parent=repo.tip("main"))
    clock = Clock()
    eng = Engine(routes, repo=repo, clock=clock)
    eng.mint("t", "a task", "mvp")
    route = routes["mvp"]
    hidden: dict[str, bool] = {}
    remaining = {"test": 1.0, "implement": 1.0, "review": 1.0}
    cost = 0.0
    decisions = 0
    attempts = 0
    findings = False
    while True:
        t = eng.ticket("t")
        if t["state"] == "done":
            break
        if t["state"] == "held":
            if decisions >= f.owner_patience:
                break
            decisions += 1
            eng.retry("t")
            continue
        c = eng.claim("t", worker="sim")
        attempts += 1
        step = c["step"]
        spec = route.step(step)
        cost += f.read
        r = rng.random()
        if r < f.p_crash:
            frac = rng.random() * remaining[step]
            cost += f.units * frac
            remaining[step] -= frac  # committed progress stays on the branch; the handover names it
            clock.t += spec.lease_seconds + 1
            eng.tick()
            continue
        if r < f.p_crash + f.p_stall:
            cost += f.spin
            clock.t += spec.progress_seconds * 1.6
            eng.tick()
            continue
        cost += f.units * remaining[step]
        remaining[step] = 1.0
        if step == "test":
            vacuous = rng.random() < f.p_vacuous_test
            sha = _commit(repo, "ticket/t", {"tests/test_x.py": f"t{attempts}"}, tests_exit=0 if vacuous else 1)
            eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
            eng.done(c["attempt"], c["token"])
        elif step == "implement":
            if findings:
                broken, defect, findings = False, False, False
            else:
                roll = rng.random()
                broken = roll < f.p_broken
                defect = (not broken) and roll < f.p_broken + f.p_defect
            sha = _commit(repo, "ticket/t", {"x.py": f"v{attempts}"}, tests_exit=1 if broken else 0)
            hidden[sha] = not (broken or defect)
            eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
            eng.done(c["attempt"], c["token"])  # a broken claim of done is what the green gate catches
        else:  # review
            sha = eng._latest("t", "implement", "commit")["body"]["sha"]
            if not hidden[sha] and rng.random() < f.p_review_catch:
                eng.evidence(c["attempt"], c["token"], "review", {"verdict": "request_changes", "findings": ["a hidden case"]})
                findings = True
            else:
                eng.evidence(c["attempt"], c["token"], "review", {"verdict": "approve", "findings": []})
            eng.done(c["attempt"], c["token"])
    t = eng.ticket("t")
    if t["state"] == "done":
        sha = eng._latest("t", "implement", "commit")["body"]["sha"]
        outcome = "success" if hidden[sha] else "defect"
    else:
        outcome = "incomplete"
    eng.close()
    return {"outcome": outcome, "cost": cost, "decisions": decisions, "attempts": attempts}


def lone_task(seed: int, f: Faults) -> dict:
    rng = random.Random(seed)
    cost = 0.0
    remaining = {"test": 1.0, "implement": 1.0, "review": 1.0}
    done: set[str] = set()
    vacuous = False
    code = "correct"
    for attempt in range(1, f.lone_attempts + 1):
        crashed = False
        for ph in ("test", "implement", "review"):
            if ph in done:
                continue
            r = rng.random()
            if r < f.p_crash:
                frac = rng.random() * remaining[ph]
                cost += f.units * frac
                remaining[ph] -= frac
                crashed = True
                break
            if r < f.p_crash + f.p_stall:
                cost += f.lone_spin
                crashed = True
                break
            cost += f.units * remaining[ph]
            remaining[ph] = 1.0
            if ph == "test":
                vacuous = rng.random() < f.p_vacuous_test
            elif ph == "implement":
                roll = rng.random()
                broken = roll < f.p_broken
                defect = (not broken) and roll < f.p_broken + f.p_defect
                code = "broken" if broken else "defect" if defect else "correct"
                if broken and not vacuous:
                    # the visible tests fail: claim done anyway, or fix once more
                    if rng.random() >= f.p_false_done:
                        cost += f.units
                        code = "defect" if rng.random() < f.p_defect else "correct"
            else:  # the agent reviews its own work
                if code == "defect" and rng.random() < f.p_self_catch:
                    cost += f.units * 0.5
                    code = "correct"
            done.add(ph)
        if not crashed:
            return {"outcome": "success" if code == "correct" else "defect", "cost": cost, "decisions": 0, "attempts": attempt}
        # a restart with no handover: finished phases are re-read, the open phase loses part of its progress
        for ph in done:
            cost += f.units * f.rework
        for ph in remaining:
            if ph not in done:
                remaining[ph] = 1.0 - (1.0 - remaining[ph]) * (1.0 - f.rework)
    return {"outcome": "incomplete", "cost": cost, "decisions": 0, "attempts": f.lone_attempts}


def summarize(rows: list[dict]) -> dict:
    n = len(rows)
    out = {"n": n}
    for o in ("success", "defect", "incomplete"):
        out[o] = sum(1 for r in rows if r["outcome"] == o) / n
    out["cost"] = statistics.mean(r["cost"] for r in rows)
    done = [r for r in rows if r["outcome"] == "success"]
    out["cost_per_success"] = (sum(r["cost"] for r in rows) / len(done)) if done else float("inf")
    out["decisions"] = statistics.mean(r["decisions"] for r in rows)
    out["attempts"] = statistics.mean(r["attempts"] for r in rows)
    return out


def run(n: int, f: Faults, seed: int = 1, routes=None) -> dict:
    routes = routes or load_dir(Path(__file__).resolve().parent.parent / "routes")
    seeds = [seed * 1_000_003 + i for i in range(n)]
    return {"faults": asdict(f),
            "lone": summarize([lone_task(s, f) for s in seeds]),
            "harness": summarize([harness_task(s, f, routes) for s in seeds])}


def table(results: list[tuple[str, dict]]) -> str:
    head = "| setting | condition | success | defect delivered | incomplete | cost | cost per success | owner taps |"
    lines = [head, "|---|---|---|---|---|---|---|---|"]
    for label, res in results:
        for cond in ("lone", "harness"):
            s = res[cond]
            cps = "inf" if s["cost_per_success"] == float("inf") else f"{s['cost_per_success']:.1f}"
            lines.append(f"| {label} | {cond} | {s['success']:.2f} | {s['defect']:.2f} | {s['incomplete']:.2f} | {s['cost']:.1f} | {cps} | {s['decisions']:.2f} |")
    return "\n".join(lines)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="harness sim", description="harness mechanics against a lone agent")
    ap.add_argument("--n", type=int, default=500)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--sweep", default="p_crash=0,0.1,0.2,0.4", help="field=v1,v2,... or 'none'")
    for fl in fields(Faults):
        ap.add_argument(f"--{fl.name.replace('_', '-')}", type=type(fl.default), default=fl.default)
    args = ap.parse_args(argv)
    base = Faults(**{fl.name: getattr(args, fl.name) for fl in fields(Faults)})
    results = []
    if args.sweep and args.sweep != "none":
        name, values = args.sweep.split("=")
        for v in values.split(","):
            f = Faults(**{**asdict(base), name: type(getattr(base, name))(float(v))})
            results.append((f"{name}={v}", run(args.n, f, args.seed)))
    else:
        results.append(("base", run(args.n, base, args.seed)))
    print(f"n={args.n} tasks per cell, seed={args.seed}")
    print("faults:", {k: v for k, v in asdict(base).items()})
    print()
    print(table(results))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
