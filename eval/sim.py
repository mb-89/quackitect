#!/usr/bin/env python3
"""Monte Carlo: single agent vs hx, under explicit assumptions about how agents fail.

The *agents* are simulated (probabilities below are assumptions, not measurements). The *harness*
is the real one: real engine, real gates, real leases/expiry/nudges/escalations, real tick. That makes
this two things at once:
  1. a model of where the harness should pay off (and what it costs), with a sensitivity sweep;
  2. a randomized fault-injection test of the engine: thousands of tickets with crashes, spins, false
     "done"s and test tampering, checking invariants (no gate bypass, one holder per run, epochs
     monotonic, every ticket terminates or reaches the owner).

    python3 eval/sim.py                 # default table + sweep, ~1 min
    python3 eval/sim.py --n 2000 --seed 7
"""
import argparse
import json
import os
import random
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hx import engine  # noqa: E402
from hx.engine import Rejected  # noqa: E402
from hx.service import Hx  # noqa: E402
from hx.store import FakeClock, MemoryStore  # noqa: E402
from hx.verify import Verifier  # noqa: E402

DEFAULTS = {
    # agent behaviour (per step-session unless noted) -- ASSUMPTIONS
    "p_crash": 0.08,        # session dies mid-step (sandbox reaped, context blown, network)
    "p_spin": 0.05,         # session loops without progress until stopped
    "p_bug": 0.5,           # first implementation fails the visible tests
    "p_fix": 0.7,           # one fix attempt makes failing visible tests pass
    "p_false_done": 0.25,   # at a failing decision point, agent declares done anyway
    "p_tamper": 0.10,       # at a failing decision point, agent edits the tests to pass
    "p_spec_miss": 0.25,    # implementation misses a stated requirement
    "p_weak_solo": 0.6,     # solo: own tests do not exercise the missed requirement
    "p_weak_hx": 0.35,      # hx: red-first + every-AC-referenced tests still miss it
    "p_drift": 0.15,        # solo restart after a crash without notes introduces a miss
    "p_broken_red": 0.2,    # hx: first red attempt does not load
    "r_review": 0.6,        # fresh reviewer catches a hidden miss
    "r_owner": 0.3,         # owner skimming on a phone catches a hidden miss
    "p_fix_review": 0.85,   # a reported miss gets fixed in the next round
    "p_conflict": 0.1,      # landing conflicts with main
    "medium_share": 0.3,    # share of medium-risk tickets (owner approves design + accept)
    "max_attempts": 4,      # fix attempts per session before the agent gives up
    "solo_restarts": 3,     # solo: crashes/spins it may recover from by starting over
}
MINUTES = {"design": 20, "red": 20, "green": 40, "review": 15, "retro": 5, "rebase": 15, "work": 40}


class SimVerifier(Verifier):
    """Verifies against the simulated hidden truth instead of git."""
    name = "sim"

    def __init__(self, world):
        self.world = world

    def v_doc(self, t, a):
        return True, {"sha": a["sha"], "path": "d.md"}, {"summary": "doc"}

    def v_tests_red(self, t, a):
        if a.get("broken"):
            return False, {"sha": a["sha"]}, {"reason": "tests do not load"}
        return True, {"sha": a["sha"], "frozen": {"tests/t.py": "v1"}}, {"summary": "red"}

    def v_tests_green(self, t, a):
        w = self.world
        if w["tampered"]:
            return False, {"sha": a["sha"]}, {"reason": "frozen tests were modified"}
        if w["visible_bug"]:
            return False, {"sha": a["sha"]}, {"reason": "frozen tests are not green"}
        return True, {"sha": a["sha"], "red_sha": t["heads"]["red"]}, {"summary": "green"}

    def land(self, t):
        if self.world["conflict"]:
            self.world["conflict"] = False
            return {"ok": False, "reason": "merge conflict", "candidate": t["heads"]["candidate"]}
        return {"ok": True, "merged_sha": "m" * 40, "candidate": t["heads"]["candidate"]}


def new_world(rng, P):
    return {"spec_miss": False, "tests_weak": False, "visible_bug": False, "tampered": False,
            "conflict": rng.random() < P["p_conflict"], "impl_done": False, "sha": 0}


def sha(world):
    world["sha"] += 1
    return f"{world['sha']:040x}"


# ----------------------------------------------------------------------------- hx condition

class Stats:
    def __init__(self):
        self.agent_min = 0.0
        self.sessions = 0
        self.false_done_caught = 0
        self.tamper_caught = 0
        self.crashes = 0
        self.spins = 0
        self.escalations = 0
        self.owner = 0


def _spin(hx, sid, clock, minutes_cap):
    """Heartbeats without progress until the harness revokes the lease (nudge, then revoke)."""
    spent = 0
    while spent < minutes_cap:
        clock.advance(300)
        spent += 5
        try:
            hx.heartbeat(sid)
        except Rejected:
            return spent
        hx.tick()
    return spent


def hx_step(hx, sid, step, world, rng, P, clock, S):
    """One agent session on one step. Returns agent minutes. May leave the lease dangling (crash)."""
    st = hx.state()
    lease = st["leases"][sid]
    t = st["tickets"][lease["ticket"]]
    run = t["run"]
    minutes = 2 + (3 if run["crashed"] or run["checkpoint"] else 0)  # read brief (+ handover notes)
    expect = MINUTES.get(step, 20)
    if rng.random() < P["p_spin"]:
        S.spins += 1
        return minutes + _spin(hx, sid, clock, 6 * expect)
    if rng.random() < P["p_crash"]:
        S.crashes += 1
        part = rng.random() * expect
        clock.advance(part * 60)
        return minutes + part  # dies holding the lease
    if step in ("design", "work"):
        clock.advance(expect * 60)
        hx.checkpoint(sid, done="design drafted", next="submit")
        hx.submit(sid, "doc", sha=sha(world))
        hx.done(sid)
        return minutes + expect
    if step == "red":
        clock.advance(expect * 60)
        if rng.random() < P["p_broken_red"]:
            hx.submit(sid, "tests_red", sha=sha(world), broken=True)
            clock.advance(300)
            minutes += 5
        world["tests_weak"] = rng.random() < P["p_weak_hx"]
        hx.submit(sid, "tests_red", sha=sha(world))
        hx.done(sid)
        return minutes + expect
    if step in ("green", "rebase"):
        if step == "green" and not world["impl_done"]:
            world["impl_done"] = True
            world["spec_miss"] = rng.random() < P["p_spec_miss"]
            world["visible_bug"] = rng.random() < P["p_bug"] or (world["spec_miss"] and not world["tests_weak"])
        clock.advance(expect * 60)
        minutes += expect
        for _ in range(P["max_attempts"]):
            if not world["visible_bug"]:
                break
            r = rng.random()
            if r < P["p_false_done"]:
                try:
                    hx.done(sid)
                except Rejected:
                    S.false_done_caught += 1
                clock.advance(120)
                minutes += 2
            elif r < P["p_false_done"] + P["p_tamper"]:
                # the agent "fixes" the tests (say via a bash heredoc the hook did not see) and submits:
                # the frozen-blob check in the real gate rejects it, the agent restores the tests
                world["tampered"] = True
                res = hx.submit(sid, "tests_green", sha=sha(world))
                assert not res["ok"]
                S.tamper_caught += 1
                world["tampered"] = False
                clock.advance(180)
                minutes += 3
            clock.advance(15 * 60)
            minutes += 15
            hx.heartbeat(sid, head=sha(world))
            if rng.random() < P["p_fix"]:
                world["visible_bug"] = False
                if world["spec_miss"] and not world["tests_weak"]:
                    world["spec_miss"] = False  # the visible failure *was* the miss
        if world["visible_bug"]:
            hx.release(sid, note={"done": "partial", "next": "fix remaining failure"})
            return minutes
        hx.submit(sid, "tests_green", sha=sha(world))
        hx.done(sid)
        return minutes
    if step == "review":
        clock.advance(expect * 60)
        acs = {c["id"]: "ok" for c in t["criteria"]}
        if world["spec_miss"] and rng.random() < P["r_review"]:
            acs[next(iter(acs))] = "fail:missed requirement"
            hx.submit(sid, "review", verdict="changes", ac=acs, findings=["missed requirement"])
            world["review_found"] = True
        else:
            hx.submit(sid, "review", verdict="approve", ac=acs)
        hx.done(sid)
        if world.pop("review_found", False):
            if rng.random() < P["p_fix_review"]:
                world["spec_miss"] = False
                world["tests_weak"] = False
        return minutes + expect
    if step == "retro":
        clock.advance(expect * 60)
        hx.submit(sid, "retro", went_well="a", went_badly="b", change="c")
        hx.done(sid)
        return minutes + expect
    raise AssertionError(step)


def owner_decides(hx, q, world, rng, P, S, clock):
    S.owner += 1
    clock.advance(30 * 60)  # owner latency
    if q["kind"] == "approval":
        if q["step"] == "accept" and world["spec_miss"] and rng.random() < P["r_owner"]:
            hx.answer(q["id"], "changes", text="this misses a requirement")
            if rng.random() < P["p_fix_review"]:
                world["spec_miss"] = False
        else:
            hx.answer(q["id"], "approve")
    elif q["kind"] == "escalation":
        S.escalations += 1
        hx.answer(q["id"], "retry" if "retry" in q["options"] else "one_more")
    else:
        hx.answer(q["id"], q["options"][0] if q["options"] else None, text="ok")


def check_invariants(hx):
    st = hx.state()
    holders = {}
    for t in st["tickets"].values():
        r = t.get("run")
        if r and r["status"] == "active":
            assert r["holder"] not in holders, "two active runs for one session"
            holders[r["holder"]] = t["id"]
            assert st["leases"][r["holder"]]["epoch"] == r["epoch"]
    for sid, lease in st["leases"].items():
        assert holders.get(sid) == lease["ticket"], "lease without active run"
    # gate never bypassed: every passed agent step has verified evidence of each required kind
    for t in st["tickets"].values():
        for h in t["history"]:
            sd = t["process"]["steps"][h["step"]]
            if h["by"] in ("system", "merge-queue", "owner") or (h.get("note") or "").startswith("OVERRIDE"):
                continue
            for kind in sd["evidence"]:
                ok = any(e["kind"] == kind and e["verified"] and e["step"] == h["step"] and e["visit"] == h["visit"]
                         for e in t["evidence"])
                assert ok, f"{t['id']} passed {h['step']} without verified {kind}"
    # replay equals live state
    replay = engine.fold(hx.store.all_events())
    assert json.dumps(replay["tickets"], sort_keys=True) == json.dumps(st["tickets"], sort_keys=True)
    # epochs strictly increase per ticket across claims
    last = {}
    for e in hx.store.all_events():
        if e["type"] == "claim":
            last[e["ticket"]] = last.get(e["ticket"], 0) + 1
    for tid, n in last.items():
        assert st["tickets"][tid]["epoch"] == n, "epoch must count claims exactly"


def run_hx(P, rng, tid="T-1"):
    world = new_world(rng, P)
    clock = FakeClock()
    hx = Hx(MemoryStore(clock), verifier=SimVerifier(world))
    risk = "medium" if rng.random() < P["medium_share"] else "low"
    hx.create_ticket({"id": tid, "title": "sim", "criteria": ["a", "b", "c"], "test_cmd": "t", "risk": risk})
    S = Stats()
    start = clock.now()
    n = 0
    for _ in range(400):
        hx.tick()
        st = hx.state()
        t = st["tickets"][tid]
        if t["status"] == "done":
            break
        run = t["run"]
        if run["status"] == "waiting":
            q = next(q for q in st["questions"].values() if q["id"] in run["waiting_on"])
            owner_decides(hx, q, world, rng, P, S, clock)
            continue
        if run["status"] == "active":  # crashed holder: wait for the clock to notice
            clock.advance(60 * 5)
            continue
        sd = t["process"]["steps"][t["step"]]
        if sd["role"] == "auto":
            clock.advance(60)
            continue
        n += 1
        sid = f"s{n}"
        S.sessions += 1
        hx.claim(sid, sd["role"], tid)
        S.agent_min += hx_step(hx, sid, t["step"], world, rng, P, clock, S)
    check_invariants(hx)
    t = hx.state()["tickets"][tid]
    done = t["status"] == "done"
    correct = done and not world["spec_miss"] and not world["visible_bug"] and not world["tampered"]
    return {"done": done, "correct": correct, "false_done": done and not correct, "agent_min": S.agent_min,
            "wall_h": (clock.now() - start) / 3600, "owner": S.owner, "sessions": S.sessions,
            "crashes": S.crashes, "spins": S.spins, "escalations": S.escalations,
            "false_done_caught": S.false_done_caught, "tamper_caught": S.tamper_caught}


# ----------------------------------------------------------------------------- solo condition

def run_solo(P, rng):
    """Baseline: one agent per ticket in a sandbox, landing through a PR with CI, and an attentive owner.

    Same acceptance policy as hx (owner reviews medium risk only; low risk merges on green CI). Nothing
    outside the session notices a crash or a spin except the owner, who restarts it; CI catches a false
    "done" only if the *visible* tests fail; edited tests and requirements the agent's own tests miss
    go green.
    """
    world = new_world(rng, P)
    medium = rng.random() < P["medium_share"]
    minutes, wall_h, owner, sessions, restarts = 0.0, 0.0, 0, 1, 0
    steps = ["design", "tests", "impl"]
    i = 0

    def restart(hours_until_noticed):
        nonlocal minutes, wall_h, owner, sessions, restarts
        owner += 1
        sessions += 1
        restarts += 1
        minutes += 10  # the new session re-reads the repo
        wall_h += hours_until_noticed

    while i < len(steps):
        if restarts > P["solo_restarts"]:
            break  # the owner gives up on this ticket
        step = steps[i]
        expect = {"design": 20, "tests": 20, "impl": 40}[step]
        if rng.random() < P["p_spin"]:
            minutes += 6 * expect  # spins until its own turn/budget limit; nothing else notices
            wall_h += 6 * expect / 60
            restart(0.5)
            continue
        if rng.random() < P["p_crash"]:
            minutes += rng.random() * expect
            restart(1.0)  # the owner notices a dead session after ~1h on average
            if rng.random() < P["p_drift"]:
                world["spec_miss"] = True  # no notes survive: the new session forgets a constraint
            continue
        minutes += expect
        if step == "tests":
            world["tests_weak"] = rng.random() < P["p_weak_solo"]
        if step == "impl":
            if not world["impl_done"]:
                world["impl_done"] = True
                world["spec_miss"] = world["spec_miss"] or rng.random() < P["p_spec_miss"]
                world["visible_bug"] = rng.random() < P["p_bug"] or (world["spec_miss"] and not world["tests_weak"])
            claimed = False
            for _ in range(P["max_attempts"]):
                if not world["visible_bug"]:
                    break
                r = rng.random()
                if r < P["p_false_done"]:
                    claimed = True  # "all tests pass"
                    break
                if r < P["p_false_done"] + P["p_tamper"]:
                    world["tampered"] = True  # edits the tests until they pass; CI goes green
                    world["visible_bug"] = False
                    break
                minutes += 15
                if rng.random() < P["p_fix"]:
                    world["visible_bug"] = False
                    if world["spec_miss"] and not world["tests_weak"]:
                        world["spec_miss"] = False
            if world["visible_bug"]:
                restart(0.5 if claimed else 1.0)  # PR CI is red (or the agent gave up): owner re-prompts
                continue
        i += 1
    done = i == len(steps)
    if done and medium:
        owner += 1  # the owner reviews medium-risk PRs, like hx's accept step
        if (world["spec_miss"] or world["tampered"]) and rng.random() < P["r_owner"]:
            owner += 1
            minutes += 20
            if rng.random() < P["p_fix_review"]:
                world["spec_miss"] = world["tampered"] = False
    correct = done and not world["spec_miss"] and not world["visible_bug"] and not world["tampered"]
    wall_h += minutes / 60
    return {"done": done, "correct": correct, "false_done": done and not correct, "agent_min": minutes,
            "wall_h": wall_h, "owner": owner, "sessions": sessions}


# ----------------------------------------------------------------------------- report

def summarize(rows):
    n = len(rows)
    out = {"n": n}
    for k in ("done", "correct", "false_done"):
        out[k] = sum(r[k] for r in rows) / n
    for k in ("agent_min", "wall_h", "owner", "sessions"):
        out[k] = statistics.mean(r[k] for r in rows)
    ok = [r["agent_min"] for r in rows if r["correct"]]
    out["min_per_correct"] = sum(r["agent_min"] for r in rows) / max(1, len(ok))
    for k in ("crashes", "spins", "escalations", "false_done_caught", "tamper_caught"):
        if k in rows[0]:
            out[k] = sum(r[k] for r in rows) / n
    return out


def compare(P, n, seed):
    rng = random.Random(seed)
    hx_rows = [run_hx(P, rng, "T-1") for _ in range(n)]
    rng = random.Random(seed)
    solo_rows = [run_solo(P, rng) for _ in range(n)]
    return summarize(solo_rows), summarize(hx_rows)


def fmt(s, h):
    lines = [f"{'metric':28} {'single agent':>14} {'hx':>10}"]
    rows = [("tickets done (claimed)", "done", "{:.1%}"), ("done AND correct", "correct", "{:.1%}"),
            ("done but wrong (false done)", "false_done", "{:.1%}"), ("agent minutes / ticket", "agent_min", "{:.0f}"),
            ("agent minutes / correct", "min_per_correct", "{:.0f}"), ("wall-clock hours / ticket", "wall_h", "{:.1f}"),
            ("owner interactions / ticket", "owner", "{:.2f}"), ("sessions / ticket", "sessions", "{:.1f}")]
    for label, k, f in rows:
        lines.append(f"{label:28} {f.format(s[k]):>14} {f.format(h[k]):>10}")
    lines.append(f"hx internals per ticket: crashes {h['crashes']:.2f}, spins {h['spins']:.2f}, "
                 f"false-done caught {h['false_done_caught']:.2f}, tampering caught {h['tamper_caught']:.2f}, "
                 f"escalations {h['escalations']:.2f}")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=1000)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    P = dict(DEFAULTS)
    s, h = compare(P, a.n, a.seed)
    print(f"## Default assumptions, n={a.n} tickets per condition, seed={a.seed}\n")
    print(fmt(s, h))
    print("\n## Sensitivity: done-and-correct rate (single agent -> hx)\n")
    sweeps = [
        ("all agent failure rates x0 (perfect agent)", {k: 0.0 for k in ("p_crash", "p_spin", "p_bug", "p_false_done",
                                                                          "p_tamper", "p_spec_miss", "p_drift",
                                                                          "p_broken_red", "p_conflict")}),
        ("failure rates x0.5", {k: DEFAULTS[k] * 0.5 for k in ("p_crash", "p_spin", "p_bug", "p_false_done",
                                                                "p_tamper", "p_spec_miss", "p_drift")}),
        ("failure rates x1.5", {k: min(0.95, DEFAULTS[k] * 1.5) for k in ("p_crash", "p_spin", "p_bug",
                                                                           "p_false_done", "p_tamper",
                                                                           "p_spec_miss", "p_drift")}),
        ("no false done, no tampering", {"p_false_done": 0.0, "p_tamper": 0.0}),
        ("crash-heavy (p_crash 0.3)", {"p_crash": 0.3}),
        ("weak reviewer (r_review 0.2)", {"r_review": 0.2}),
        ("hx tests as weak as solo", {"p_weak_hx": DEFAULTS["p_weak_solo"]}),
    ]
    print(f"{'scenario':46} {'single':>8} {'hx':>8} {'min/correct single':>20} {'min/correct hx':>15}")
    for label, over in sweeps:
        P2 = dict(DEFAULTS, **over)
        s2, h2 = compare(P2, max(200, a.n // 4), a.seed)
        print(f"{label:46} {s2['correct']:>8.1%} {h2['correct']:>8.1%} {s2['min_per_correct']:>20.0f} "
              f"{h2['min_per_correct']:>15.0f}")
    print("\nInvariants checked on every hx run: one holder per active run, leases match runs, no step passed "
          "without verified evidence, replay(log) == live state.")


if __name__ == "__main__":
    main()
