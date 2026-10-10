"""Projections of state: the agent's brief and the owner's board, inbox, health and digest.

All functions are pure: (state, ..., now, ctx) -> data/text. `ctx` carries optional git facts that the
service looked up (branch head, commits since the last checkpoint, diffstat).
"""
import time

from .engine import MISSING, OK, OWNER, deps_satisfied, gate_report, step_def

HEALTH_ORDER = {"red": 0, "amber": 1, "green": 2, "grey": 3}


def fmt_ts(ts):
    return time.strftime("%H:%M", time.gmtime(ts)) if ts else "-"


def mins(seconds):
    return f"{max(0, int(seconds)) // 60}m"


def health(state, t, now):
    """(colour, why) for one ticket. red = needs the owner now, amber = slow/waiting, green = moving."""
    cfg = state["config"]
    st = t["status"]
    if st in ("done", "cancelled"):
        return "grey", st
    if st == "queued":
        waiting = [d for d in t["deps"] if not deps_satisfied(state, {"deps": [d]})]
        dead = [d for d in waiting if state["tickets"][d]["status"] == "cancelled"]
        if dead:
            return "red", "blocked: dependency cancelled: " + ", ".join(dead)
        return "grey", "queued: waiting for " + ", ".join(waiting)
    if st == "paused":
        return "amber", "paused by owner"
    if state["paused_all"]:
        return "amber", "all work paused by owner"
    run, sd = t["run"], step_def(t)
    if run["status"] == "waiting":
        qs = [state["questions"][q] for q in run["waiting_on"] if q in state["questions"]]
        esc = [q for q in qs if q["kind"] == "escalation"]
        if esc:
            return "red", f"needs you: {esc[0]['reason']} ({esc[0]['id']})"
        kinds = ", ".join(f"{q['kind']} {q['id']}" for q in qs)
        return "amber", f"waiting for owner: {kinds}"
    if run["status"] == "active":
        idle = now - (run["last_activity_ts"] or now)
        noprog = now - (run["last_progress_ts"] or now)
        if idle > cfg["lease_ttl_s"] * 2 // 3:
            return "amber", f"{run['holder']} silent for {mins(idle)}"
        if noprog > cfg["stall_factor"] * sd["expect_min"] * 60:
            return "amber", f"no progress for {mins(noprog)} (nudges {run['nudges']})"
        return "green", f"{run['holder']} working ({mins(now - run['claimed_ts'])})"
    if sd["role"] == "auto":
        return "green", "in merge queue" if "merged" in sd["gate"] else "automatic"
    if run["reserved"] == "owner":
        return "amber", "reserved for you (take over)"
    if run["crashed"]:
        return "amber", f"handover pending ({run['crashed']['why']})"
    if now - run["opened_ts"] > 3600:
        return "amber", f"ready for {mins(now - run['opened_ts'])}, no agent free"
    return "green", f"ready for a {sd['role']}"


def board(state, now):
    rows = []
    for tid in state["order"]:
        t = state["tickets"][tid]
        colour, why = health(state, t, now)
        run = t["run"] or {}
        rows.append({
            "id": tid, "title": t["title"], "group": t["parent"], "kind": t["process"]["name"],
            "status": t["status"], "step": t["step"], "visit": run.get("visit"),
            "run_status": run.get("status"), "holder": run.get("holder"), "health": colour, "why": why,
            "priority": t["priority"], "risk": t["risk"], "children": t["children"],
            "steps": [s for s in t["process"]["steps"]],
            "passed": [h["step"] for h in t["history"]],
        })
    return rows


def inbox(state, now):
    rank = {"escalation": 0, "approval": 1, "agent": 2}
    out = []
    for q in state["questions"].values():
        if q["status"] != "open":
            continue
        t = state["tickets"][q["ticket"]]
        out.append(dict(q, title=t["title"], risk=t["risk"], age_s=now - q["ts"],
                        due_s=(q["deadline_ts"] - now) if q["deadline_ts"] else None))
    out.sort(key=lambda q: (rank[q["kind"]], not q["blocking"], q["seq"]))
    return out


def counts(state, now):
    c = {"red": 0, "amber": 0, "green": 0, "grey": 0, "done": 0, "active": 0, "inbox": 0}
    for t in state["tickets"].values():
        colour, _ = health(state, t, now)
        c[colour] += 1
        c["done"] += t["status"] == "done"
        c["active"] += bool(t["run"] and t["run"]["status"] == "active")
    c["inbox"] = sum(1 for q in state["questions"].values() if q["status"] == "open")
    return c


def _criteria_lines(t):
    return [f"  {c['id']}: {c['text']}" for c in t["criteria"]] or ["  (none yet)"]


def brief(state, tid, session=None, now=0, ctx=None):
    """The agent's entire view of the world: one ticket, one step, imperative, short."""
    ctx = ctx or {}
    t = state["tickets"].get(tid)
    if t is None:
        return f"hx: unknown ticket {tid}"
    run = t["run"]
    if not run:
        return f"hx brief · {tid} is {t['status']}. Nothing to do here; stop or `hx claim` other work."
    sd = step_def(t)
    cfg = state["config"]
    L = [f"hx brief · {tid} \"{t['title']}\" · step {run['step']} (visit {run['visit']}) · "
         f"{run['status']} · epoch {run['epoch']}"]
    rep = gate_report(state, t)
    if session and run["holder"] == session:
        L.append(f"You hold this step as {run['role']} (session {session}). The lease stays alive while you "
                 f"work; {cfg['lease_ttl_s'] // 60} min of silence = presumed crashed and handed over.")
        if rep and all(c["status"] == OK for c in rep):
            L.append(">> THE GATE IS ALREADY SATISFIED: an earlier holder finished this step's work before it was "
                     "cut off. Do not redo it. Run `hx done` now.")
        elif run["handovers"]:
            L.append(f">> Earlier sessions on this step ended before finishing ({run['handovers']}x). Work in small "
                     f"increments: after each sub-step commit, push and `hx checkpoint --done .. --next ..`"
                     + (" (reviewers: put findings so far in the checkpoint)." if run["role"] == "reviewer" else "."))
    elif run["status"] == "waiting":
        L.append("This step is waiting for the owner (" + ", ".join(run["waiting_on"]) + "). Do not work on "
                 "it; stop, or claim other work.")
    elif run["holder"]:
        L.append(f"Held by {run['holder']} (epoch {run['epoch']}). You do not hold it: do not work on it.")
    else:
        L.append(f"Unclaimed; a {sd['role']} can take it with `hx claim --ticket {tid} --role {sd['role']}`.")
    L.append("")
    L.append("TICKET" + (f" (group {t['parent']})" if t["parent"] else "") + f" · risk {t['risk']}")
    if t["body"]:
        L.append("  " + t["body"].strip().replace("\n", "\n  "))
    if t["criteria"] or not t["children"]:
        L += _criteria_lines(t)
    if t["test_cmd"] or t["ci_cmd"]:
        L.append(f"  test_cmd: {t['test_cmd'] or '-'}   ci_cmd: {t['ci_cmd'] or '(same)'}")
    if t["scope"]:
        L.append("  scope: " + ", ".join(t["scope"]))
    L.append("")
    L.append(f"THIS STEP: {run['step']} — " + sd["instructions"].replace("<ticket>", tid))
    L.append("DONE WHEN (gate, checked by hx, not by you):")
    for c in rep:
        mark = {OK: "[x]", MISSING: "[ ]", OWNER: "[~]"}[c["status"]]
        L.append(f"  {mark} {c['check']}: {c['msg']}")
    L.append("")
    chain = []
    if t["heads"].get("red"):
        chain.append(f"red@{t['heads']['red'][:7]} (frozen: {', '.join(sorted(t['frozen']))})")
    if t["heads"].get("candidate"):
        chain.append(f"candidate@{t['heads']['candidate'][:7]}")
    if t["heads"].get("merged"):
        chain.append(f"merged@{t['heads']['merged'][:7]}")
    branch = f"BRANCH {t['branch']}"
    if ctx.get("branch_head"):
        branch += f" (remote head {ctx['branch_head'][:7]})"
    if ctx.get("main"):
        branch += f" · main {ctx['main'][:7]}"
    if run["role"] == "reviewer":
        L.append(branch + ". Review the candidate commit; do not commit or push.")
    elif t["children"]:
        L.append(f"CHILDREN of {tid}:")
        for cid in t["children"]:
            c = state["tickets"][cid]
            st = c.get("stats", {})
            retro = next((e for e in reversed(c["evidence"]) if e["kind"] == "retro" and e["verified"]), None)
            L.append(f"  {cid} {c['title']} [{c['status']}] claims {st.get('claims', 0)}, handovers "
                     f"{st.get('handovers', 0)}, rejected evidence {st.get('rejected_evidence', 0)}, review rounds "
                     f"{c['visits'].get('review', 0)}, owner decisions {st.get('owner_decisions', 0)}"
                     + (f"\n    retro proposes: {retro['payload'].get('change')}" if retro else ""))
    else:
        L.append(branch + ". Work on this branch; push before every submit.")
    if chain:
        L.append("EVIDENCE: " + " → ".join(chain))
    if run["step"] == "review" and ctx.get("diffstat"):
        L.append(f"DIFF to review: git diff {ctx['review_base'][:7]}..{t['heads']['candidate'][:7]}")
        L += ["  " + s for s in ctx["diffstat"][-6:]]
    for n in run["notes"][-3:]:
        L.append("NOTE: " + n)
    if run["step"] in ("green", "rebase") and run["visit"] > 1:
        for e in reversed(t["evidence"]):
            if e["kind"] == "review" and e["verified"]:
                p = e["payload"]
                bad = [f"{k}={v}" for k, v in p.get("ac", {}).items() if not str(v).startswith("ok")]
                L.append(f"LAST REVIEW ({p['verdict']} by {e['by']}): " + "; ".join(bad + p.get("findings", [])))
                break
    if run["crashed"]:
        c = run["crashed"]
        L.append(f"HANDOVER: previous holder {c['holder']} {c['why']} at {fmt_ts(c['ts'])}. Check the branch "
                 f"state before continuing; uncommitted work is lost.")
    cp = run["checkpoint"] or (t.get("last_checkpoint") if t.get("last_checkpoint", {}).get("step") == run["step"]
                               else None)
    if cp:
        who = "you" if cp.get("by") == session else cp.get("by")
        L.append(f"LAST CHECKPOINT ({who}, {fmt_ts(cp['ts'])}):")
        for k in ("done", "next", "risks", "text"):
            if cp.get(k):
                L.append(f"  {k}: {cp[k]}")
    if ctx.get("since_checkpoint"):
        L.append("COMMITS SINCE THAT CHECKPOINT: " + " | ".join(ctx["since_checkpoint"][:5]))
    answered = [q for q in state["questions"].values() if q["ticket"] == tid and q["status"] == "answered"
                and q["kind"] == "agent"]
    for q in answered[-4:]:
        a = q["answer"]
        L.append(f"OWNER ANSWERED {q['id']} \"{q['text'][:70]}\": {a['choice'] or ''}"
                 + (f" — \"{a['text']}\"" if a.get("text") else ""))
    open_q = [q for q in state["questions"].values() if q["ticket"] == tid and q["status"] == "open"]
    for q in open_q:
        L.append(f"OPEN QUESTION {q['id']} ({q['kind']}): {q['summary'][:100]}")
    if session and run["holder"] == session and run.get("claim_seq"):
        for n in t["notices"]:
            if n["seq"] > run["claim_seq"]:
                L.append("NOTICE: " + n["text"])
    L.append("")
    L.append("COMMANDS: " + commands_for(t, run))
    L.append("If your memory conflicts with this brief, the brief wins. Never edit frozen files.")
    return "\n".join(L)


def commands_for(t, run):
    sd = step_def(t)
    if run["role"] == "reviewer":
        return ("hx submit review --verdict approve|changes|reject --ac AC1=ok --ac AC2=fail:'why' "
                "--finding '...' · hx done · hx ask '...' · hx release --note '...'")
    sub = " | ".join(f"hx submit {k}" for k in sd["evidence"]) or "(no evidence needed)"
    return (f"hx checkpoint --done '...' --next '...' · {sub} · hx done · hx ask '...' --options a,b "
            f"· hx release --note '...'")


def show(state, tid, now):
    t = state["tickets"][tid]
    colour, why = health(state, t, now)
    return {
        "ticket": {k: t[k] for k in ("id", "title", "body", "criteria", "status", "step", "risk", "priority",
                                     "scope", "deps", "parent", "children", "branch", "heads", "frozen",
                                     "test_cmd", "ci_cmd", "authors", "visits")},
        "process": [{"id": sid, "role": sd["role"]} for sid, sd in t["process"]["steps"].items()],
        "health": colour, "why": why, "run": t["run"], "gate": gate_report(state, t) if t["run"] else [],
        "evidence": t["evidence"], "history": t["history"], "last_checkpoint": t.get("last_checkpoint"),
        "questions": [q for q in state["questions"].values() if q["ticket"] == tid],
    }


def digest(state, now, since=0):
    c = counts(state, now)
    landed = [t["id"] for t in state["tickets"].values()
              if t["heads"].get("merged") and any(e["kind"] == "land" and e["verified"] and e["ts"] >= since
                                                  for e in t["evidence"])]
    reds = [(t["id"], health(state, t, now)[1]) for t in state["tickets"].values()
            if health(state, t, now)[0] == "red"]
    waiting = [q for q in inbox(state, now)]
    lines = [f"hx digest: {c['inbox']} need you · {c['active']} agents working · {c['done']} done · "
             f"{c['red']} red · {c['amber']} amber"]
    if landed:
        lines.append("landed: " + ", ".join(landed))
    for tid, why in reds:
        lines.append(f"RED {tid}: {why}")
    for q in waiting[:5]:
        lines.append(f"{q['id']} [{q['kind']}] {q['ticket']}: {q['summary'][:90]}")
    return "\n".join(lines)


def board_text(state, now):
    rows = board(state, now)
    mark = {"red": "!!", "amber": "..", "green": "ok", "grey": "--"}
    out = [f"{'':2} {'ticket':8} {'step':8} {'state':8} why"]
    for r in rows:
        out.append(f"{mark[r['health']]} {r['id']:8} {str(r['step'] or r['status']):8} "
                   f"{str(r['run_status'] or ''):8} {r['why']}")
    return "\n".join(out)


def board_markdown(state, now):
    """For a pinned GitHub issue: the phone-friendly board with zero hosting."""
    rows = board(state, now)
    out = ["| | ticket | step | why |", "|---|---|---|---|"]
    for r in rows:
        out.append(f"| {r['health']} | {r['id']} {r['title']} | {r['step'] or r['status']} | {r['why']} |")
    return "\n".join(out)
