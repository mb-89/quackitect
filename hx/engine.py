"""The deterministic core of hx.

    state' = apply(state, event)        or  raise Rejected(code, message, report)
    state  = fold(events)               (validate-on-fold: invalid events are skipped and recorded)

Rules:
  * apply() never reads a clock, the network, or git. Time arrives as event["ts"] (assigned by the
    store), verification results arrive inside evidence events (produced by a verifier).
  * every handler validates first and mutates second, so a rejected event leaves state untouched.
  * the process definition is embedded in the ticket, so replay is stable across template changes.

Event envelope: {seq, ts, actor: {kind: agent|owner|system, id}, type, ticket?, data}
"""
import copy

from . import processes

RISK = {"low": 0, "medium": 1, "high": 2}
OK, MISSING, OWNER = "ok", "missing", "owner"

DEFAULT_CONFIG = {
    "lease_ttl_s": 900,          # no activity for this long -> lease expires (crash/hang)
    "max_handovers": 3,          # involuntary handovers on one run before the owner is asked
    "max_claims": 8,             # claims on one run before the owner is asked (release loops)
    "stall_factor": 1.5,         # no progress for factor * expect_min -> nudge, then revoke
    "dispatch_timeout_s": 600,   # dispatched but never claimed -> may dispatch again
    "max_agents": 4,             # concurrent agent sessions the dispatcher may run
    "push_min_interval_s": 900,  # min seconds between non-urgent pushes to the owner
    "notices_keep": 20,
}

OWNER_ONLY = {"ticket.edit", "ticket.pause", "ticket.resume", "ticket.cancel", "system.pause",
              "system.resume", "system.config", "override"}
OWNER_OR_SYSTEM = {"ticket.create", "answer", "revoke"}
SYSTEM_ONLY = {"expire", "nudge", "land", "dispatch", "notify", "escalate"}
HOLDER_EVENTS = {"claim", "heartbeat", "checkpoint", "evidence", "ask", "done", "release"}


class Rejected(Exception):
    def __init__(self, code, message, report=None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.report = report

    def to_dict(self):
        return {"code": self.code, "message": self.message, "report": self.report}


def new_state():
    return {
        "seq": 0, "ts": 0, "tickets": {}, "order": [], "questions": {}, "leases": {},
        "paused_all": False, "config": dict(DEFAULT_CONFIG), "rejected": [], "pushes": [],
    }


# ----------------------------------------------------------------------------- helpers

def _ticket(state, ev, required=True):
    tid = ev.get("ticket")
    t = state["tickets"].get(tid)
    if t is None and required:
        raise Rejected("no_ticket", f"unknown ticket {tid!r}")
    return t


def step_def(t, step=None):
    return t["process"]["steps"][step or t["step"]]


def approval_required(sd, t):
    pol = sd.get("approval", "never")
    if pol == "never":
        return False
    if pol == "always":
        return True
    if pol.startswith("risk>="):
        return RISK.get(t.get("risk", "low"), 0) >= RISK[pol[len("risk>="):]]
    raise ValueError(f"bad approval policy {pol!r}")


def _latest(t, run, kind, verified=True):
    for e in reversed(t["evidence"]):
        if e["kind"] == kind and e["step"] == run["step"] and e["visit"] == run["visit"]:
            if e["verified"] or not verified:
                return e
    return None


def deps_satisfied(state, t):
    for d in t["deps"]:
        x = state["tickets"].get(d)
        if x is None or not (x["status"] == "done" or x["heads"].get("merged")):
            return False
    return True


def _notice(state, t, ev, text):
    t["notice_seq"] += 1
    t["notices"].append({"n": t["notice_seq"], "seq": ev["seq"], "ts": ev["ts"], "text": text})
    keep = state["config"]["notices_keep"]
    if len(t["notices"]) > keep:
        del t["notices"][:-keep]


def _release_lease(state, run):
    if run and run.get("holder"):
        state["leases"].pop(run["holder"], None)
        run["holder"] = None


# ----------------------------------------------------------------------------- gates

def _summ(e):
    p = e.get("payload") or {}
    sha = (p.get("sha") or "")[:7]
    if e["kind"] == "review":
        return f"review {p.get('verdict')} @{sha} by {e['by']}"
    if e["kind"] == "doc":
        return f"{p.get('path')} @{sha}"
    if e["kind"] == "tests_red":
        return f"red @{sha}: {e['report'].get('summary', '')}".strip()
    if e["kind"] in ("tests_green", "ci"):
        return f"{e['kind']} @{sha}: {e['report'].get('summary', '')}".strip()
    if e["kind"] == "land":
        return f"merged as {(p.get('merged_sha') or '')[:7]}"
    return e["kind"]


def _evidence_check(kind, hint):
    def check(state, t, run, sd):
        e = _latest(t, run, kind)
        if e:
            return OK, _summ(e)
        bad = _latest(t, run, kind, verified=False)
        if bad:
            return MISSING, f"last {kind} submission was rejected: {bad['report'].get('reason')} -> {hint}"
        return MISSING, hint
    return check


def _c_criteria(state, t, run, sd):
    if t["criteria"]:
        return OK, f"{len(t['criteria'])} acceptance criteria"
    return MISSING, "no acceptance criteria yet: propose them via `hx ask`, the owner edits the ticket"


def _c_approval(state, t, run, sd):
    if not approval_required(sd, t):
        return OK, f"no owner approval needed (risk {t['risk']}, policy {sd.get('approval')})"
    ans = t["approvals"].get(f"{run['step']}#{run['visit']}")
    if ans and ans.get("choice") == "approve":
        return OK, f"approved by {ans.get('by')}"
    return OWNER, "owner approval (requested automatically when you run `hx done`)"


def _c_review(state, t, run, sd):
    e = _latest(t, run, "review")
    if e and e["payload"].get("sha") == t["heads"].get("candidate"):
        return OK, _summ(e)
    bad = _latest(t, run, "review", verified=False)
    hint = (f"review the candidate @{(t['heads'].get('candidate') or '?')[:7]} and "
            f"`hx submit review --verdict ... --ac ...`")
    if bad:
        return MISSING, f"last review submission was rejected: {bad['report'].get('reason')} -> {hint}"
    return MISSING, hint


def _c_children_done(state, t, run, sd):
    kids = [state["tickets"][c] for c in t["children"]]
    if not kids:
        return MISSING, "no child tickets"
    pending = [k["id"] for k in kids if k["status"] not in ("done", "cancelled")]
    if pending:
        return MISSING, "waiting for " + ", ".join(pending)
    return OK, f"{len(kids)} children done"


def _c_has_children(state, t, run, sd):
    return (OK, f"{len(t['children'])} children") if t["children"] else (MISSING, "no child tickets yet")


CHECK_FNS = {
    "criteria": _c_criteria,
    "doc": _evidence_check("doc", "commit+push the design doc, then `hx submit doc --path <file>`"),
    "approval": _c_approval,
    "tests_red": _evidence_check("tests_red", "commit+push failing tests, then `hx submit tests_red`"),
    "tests_green": _evidence_check("tests_green", "make frozen tests pass, push, `hx submit tests_green`"),
    "ci": _evidence_check("ci", "push, then `hx submit ci`"),
    "review": _c_review,
    "merged": _evidence_check("land", "waiting for the merge queue (`hx tick`)"),
    "retro": _evidence_check("retro", "`hx submit retro --went-well .. --went-badly .. --change ..`"),
    "children_done": _c_children_done,
    "has_children": _c_has_children,
}


def gate_report(state, t):
    run = t.get("run")
    if not run:
        return []
    sd = step_def(t)
    return [dict(check=c, status=s, msg=m)
            for c in sd["gate"] for (s, m) in [CHECK_FNS[c](state, t, run, sd)]]


# ----------------------------------------------------------------------------- transitions

def _new_run(t, step, visit, ts, role):
    return {
        "step": step, "visit": visit, "status": "ready", "role": role, "holder": None,
        "epoch": t["epoch"], "opened_ts": ts, "claimed_ts": None, "claim_seq": None, "last_activity_ts": None,
        "last_activity_seq": None, "last_progress_ts": ts, "head": None, "checkpoint": None,
        "nudges": 0, "last_nudge_ts": None, "handovers": 0, "releases": 0, "claims": 0,
        "holders": [], "crashed": None, "waiting_on": [], "notes": [], "dispatched": None,
        "reserved": None,
    }


def _new_question(state, t, ev, kind, text, options, summary=None, default=None,
                  deadline_ts=None, blocking=True, asked_by="system", reason=None):
    base = f"Q{ev['seq']}"
    qid, i = base, 0
    while qid in state["questions"]:
        i += 1
        qid = f"{base}.{i}"
    q = {
        "id": qid, "ticket": t["id"], "step": t["step"], "visit": t["run"]["visit"] if t["run"] else 0,
        "kind": kind, "reason": reason, "text": text, "summary": summary or text[:280],
        "options": list(options), "default": default, "deadline_ts": deadline_ts,
        "blocking": blocking, "status": "open", "answer": None, "asked_by": asked_by,
        "ts": ev["ts"], "seq": ev["seq"], "notified_ts": None,
    }
    state["questions"][qid] = q
    return q


def _escalate(state, t, ev, reason, text):
    run = t["run"]
    opts = {"loop": ["one_more", "takeover", "redesign", "cancel"],
            "stalled": ["retry", "takeover", "cancel"],
            "dispatch": ["retry", "takeover", "cancel"]}[reason]
    q = _new_question(state, t, ev, "escalation", text, opts, reason=reason)
    _release_lease(state, run)
    run["status"] = "waiting"
    run["waiting_on"] = [q["id"]]
    return q


def _maybe_escalate_stall(state, t, ev):
    run, cfg = t["run"], state["config"]
    if run["handovers"] >= cfg["max_handovers"] or run["claims"] >= cfg["max_claims"]:
        _escalate(state, t, ev, "stalled",
                  f"{t['id']} step '{run['step']}' keeps failing to finish: {run['handovers']} involuntary "
                  f"handovers, {run['claims']} claims. Last checkpoint: "
                  f"{_cp_text(run.get('checkpoint')) or 'none'}")


def _cp_text(cp):
    if not cp:
        return ""
    parts = [f"{k}: {cp[k]}" for k in ("done", "next", "risks") if cp.get(k)]
    return "; ".join(parts) or cp.get("text", "")


def _approval_text(state, t):
    run = t["run"]
    lines = [f"{t['id']} '{t['title']}' — approve step '{run['step']}' (risk {t['risk']})?"]
    if run["step"] == "design":
        e = _latest(t, run, "doc")
        if e:
            lines.append(f"Design doc: {_summ(e)}. Scope: {', '.join(t['scope']) or 'n/a'}")
    else:
        for e in reversed(t["evidence"]):
            if e["kind"] == "review" and e["verified"]:
                acs = ", ".join(f"{k}={v}" for k, v in (e["payload"].get("ac") or {}).items())
                lines.append(f"Review: {e['payload'].get('verdict')} by {e['by']} ({acs}).")
                if e["payload"].get("findings"):
                    lines.append("Findings: " + "; ".join(e["payload"]["findings"])[:200])
                break
        cand = t["heads"].get("candidate")
        if cand:
            lines.append(f"Candidate @{cand[:7]} (frozen tests green).")
    return " ".join(lines)


def _request_approval(state, t, ev):
    run = t["run"]
    key = f"{run['step']}#{run['visit']}"
    for q in state["questions"].values():
        if q["ticket"] == t["id"] and q["kind"] == "approval" and q["status"] == "open" \
                and f"{q['step']}#{q['visit']}" == key:
            break
    else:
        text = _approval_text(state, t)
        q = _new_question(state, t, ev, "approval", text, ["approve", "changes"], reason=run["step"])
    _release_lease(state, run)
    run["status"] = "waiting"
    run["waiting_on"] = [q["id"]]


def _open_step(state, t, step, ev, note=None):
    sd = step_def(t, step)
    visit = t["visits"].get(step, 0) + 1
    t["visits"][step] = visit
    t["step"] = step
    t["run"] = _new_run(t, step, visit, ev["ts"], sd["role"])
    if note:
        t["run"]["notes"].append(note)
    limit = sd["max_visits"] + t["extra_visits"].get(step, 0)
    if visit > limit:
        _escalate(state, t, ev, "loop",
                  f"{t['id']}: step '{step}' would start visit {visit} (limit {limit}); the loop is not "
                  f"converging. History: " + " → ".join(f"{h['step']}:{h['outcome'] or 'pass'}"
                                                       for h in t["history"][-6:]))
        return
    _auto(state, t, ev)


def _auto(state, t, ev):
    """Advance steps that need no agent: skip-if-gate, owner approvals, auto steps."""
    run = t["run"]
    if t["status"] != "open" or not run or run["status"] != "ready":
        return
    sd = step_def(t)
    rep = gate_report(state, t)
    missing = [c for c in rep if c["status"] == MISSING]
    owner = [c for c in rep if c["status"] == OWNER]
    if sd.get("skip_if_gate") and not missing and not owner:
        return _pass_step(state, t, ev, None, "system", note="skipped: gate already satisfied")
    if sd["role"] in ("owner", "auto"):
        if not missing and not owner:
            note = "auto-approved by policy" if sd["role"] == "owner" else None
            return _pass_step(state, t, ev, None, "system", note=note)
        if owner and not missing:
            return _request_approval(state, t, ev)


def _pass_step(state, t, ev, outcome, by, note=None):
    sd, run = step_def(t), t["run"]
    t["history"].append({"step": run["step"], "visit": run["visit"], "outcome": outcome, "by": by,
                         "ts": ev["ts"], "seq": ev["seq"], "note": note})
    _release_lease(state, run)
    if outcome and outcome in sd["routes"]:
        target = sd["routes"][outcome]
    else:
        target = sd["next"]
    if target is None:
        t["status"], t["step"], t["run"], t["done_ts"] = "done", None, None, ev["ts"]
        _cascade(state, ev)
        return
    carry = None
    if outcome and outcome not in ("approve",):
        carry = f"Routed here from '{run['step']}' with outcome '{outcome}'" + (f": {note}" if note else "")
    _open_step(state, t, target, ev, note=carry)


def _cascade(state, ev):
    """Re-evaluate things that depend on other tickets: queued deps and group auto steps."""
    for tid in state["order"]:
        x = state["tickets"][tid]
        if x["status"] == "queued":
            _maybe_open(state, x, ev)
        elif x["status"] == "open" and x["run"] and x["run"]["status"] == "ready" \
                and step_def(x)["role"] == "auto" and "children_done" in step_def(x)["gate"]:
            _auto(state, x, ev)


def _maybe_open(state, t, ev):
    if t["status"] == "queued" and deps_satisfied(state, t):
        t["status"] = "open"
        _open_step(state, t, t["process"]["first"], ev)


def _holder_run(state, ev):
    t = _ticket(state, ev)
    d = ev["data"]
    if state["paused_all"]:
        raise Rejected("paused", "PAUSED: the owner paused all work. Stop and wait.")
    if t["status"] == "paused":
        raise Rejected("paused", f"PAUSED: the owner paused {t['id']}. Stop working on it.")
    run = t.get("run")
    if t["status"] != "open" or run is None:
        raise Rejected("not_open", f"{t['id']} is {t['status']}; there is no open step")
    if run["status"] != "active" or run["holder"] != d.get("session") or run["epoch"] != d.get("epoch"):
        raise Rejected("lease_lost",
                       f"LEASE_LOST: session {d.get('session')} (epoch {d.get('epoch')}) does not hold "
                       f"{t['id']}/{run['step']} (holder {run['holder']}, epoch {run['epoch']}, "
                       f"status {run['status']}). Stop working on it and do not push.")
    return t, run


def _touch(run, ev, progress=False, head=None):
    run["last_activity_ts"] = ev["ts"]
    run["last_activity_seq"] = ev["seq"]
    if head and head != run.get("head"):
        run["head"] = head
        progress = True
    if progress:
        run["last_progress_ts"] = ev["ts"]


# ----------------------------------------------------------------------------- handlers

def h_ticket_create(state, ev):
    d = ev["data"]
    tid = d.get("id") or ev.get("ticket")
    if not tid or tid in state["tickets"]:
        raise Rejected("bad_ticket", f"ticket id {tid!r} missing or already exists")
    try:
        proc = processes.get(d.get("process", "feature"))
    except ValueError as e:
        raise Rejected("bad_process", str(e)) from None
    parent = d.get("parent")
    if parent and parent not in state["tickets"]:
        raise Rejected("bad_parent", f"parent {parent!r} does not exist")
    for dep in d.get("deps", []):
        if dep not in state["tickets"]:
            raise Rejected("bad_dep", f"dependency {dep!r} does not exist (create it first)")
    risk = d.get("risk", "low")
    if risk not in RISK:
        raise Rejected("bad_risk", f"risk must be one of {list(RISK)}")
    crit = []
    for i, c in enumerate(d.get("criteria", []), 1):
        crit.append(c if isinstance(c, dict) else {"id": f"AC{i}", "text": str(c)})
    t = {
        "id": tid, "title": d.get("title", tid), "body": d.get("body", ""), "criteria": crit,
        "process": proc, "parent": parent, "children": [], "deps": list(d.get("deps", [])),
        "scope": list(d.get("scope", [])), "risk": risk, "priority": int(d.get("priority", 3)),
        "test_cmd": d.get("test_cmd"), "ci_cmd": d.get("ci_cmd"),
        "branch": d.get("branch") or f"hx/{tid}", "status": "queued", "prev_status": None,
        "step": None, "run": None, "visits": {}, "extra_visits": {}, "evidence": [], "history": [],
        "authors": [], "frozen": {}, "heads": {}, "approvals": {}, "epoch": 0, "version": 0,
        "notices": [], "notice_seq": 0, "created_ts": ev["ts"], "created_seq": ev["seq"],
        "stats": {"claims": 0, "handovers": 0, "rejected_evidence": 0, "owner_decisions": 0},
        "updated_ts": ev["ts"], "done_ts": None,
    }
    state["tickets"][tid] = t
    state["order"].append(tid)
    ev["ticket"] = tid
    if parent:
        p = state["tickets"][parent]
        p["children"].append(tid)
    _maybe_open(state, t, ev)
    if parent:
        _auto(state, state["tickets"][parent], ev)


def h_claim(state, ev):
    t = _ticket(state, ev)
    d = ev["data"]
    sess, role = d.get("session"), d.get("role")
    if state["paused_all"]:
        raise Rejected("paused", "PAUSED: the owner paused all work.")
    if t["status"] != "open" or not t["run"]:
        raise Rejected("not_open", f"{t['id']} is {t['status']}")
    run, sd = t["run"], step_def(t)
    if d.get("step") and d["step"] != run["step"]:
        raise Rejected("stale_step", f"{t['id']} is at step {run['step']}, not {d['step']}")
    if run["status"] != "ready":
        raise Rejected("not_ready", f"{t['id']}/{run['step']} is {run['status']}"
                       + (f" (held by {run['holder']})" if run["holder"] else ""))
    is_owner = ev["actor"]["kind"] == "owner"
    if not is_owner and sd["role"] != role:
        raise Rejected("wrong_role", f"step {run['step']} needs role {sd['role']}, you are {role}")
    if not is_owner and sd["role"] not in ("worker", "reviewer"):
        raise Rejected("wrong_role", f"step {run['step']} is not agent work ({sd['role']})")
    if run["reserved"] == "owner" and not is_owner:
        raise Rejected("reserved", f"{t['id']}/{run['step']} is reserved for the owner")
    if sess in state["leases"] and state["leases"][sess]["ticket"] != t["id"]:
        held = state["leases"][sess]
        raise Rejected("busy", f"session {sess} already holds {held['ticket']}; release it first")
    if sd["role"] == "reviewer" and sess in t["authors"]:
        raise Rejected("separation", f"session {sess} authored {t['id']} and may not review it")
    t["epoch"] += 1
    run.update(status="active", holder=sess, epoch=t["epoch"], role=sd["role"], claimed_ts=ev["ts"],
               claim_seq=ev["seq"], dispatched=None, nudges=0, last_nudge_ts=None)
    run["claims"] += 1
    t["stats"]["claims"] += 1
    run["holders"].append(sess)
    _touch(run, ev, progress=True)  # a fresh holder gets a fresh progress clock (max_claims bounds loops)
    state["leases"][sess] = {"ticket": t["id"], "epoch": t["epoch"], "step": run["step"]}
    if sd["role"] == "worker" and sess not in t["authors"]:
        t["authors"].append(sess)


def h_heartbeat(state, ev):
    t, run = _holder_run(state, ev)
    _touch(run, ev, head=ev["data"].get("head"))


def h_checkpoint(state, ev):
    t, run = _holder_run(state, ev)
    d = ev["data"]
    note = d.get("note") or {}
    if isinstance(note, str):
        note = {"text": note}
    cp = dict(note, ts=ev["ts"], by=d["session"], epoch=d["epoch"], step=run["step"])
    run["checkpoint"] = cp
    t["last_checkpoint"] = cp
    _touch(run, ev, progress=True, head=d.get("head"))


def h_evidence(state, ev):
    t, run = _holder_run(state, ev)
    d = ev["data"]
    kind, payload = d.get("kind"), d.get("payload") or {}
    sd = step_def(t)
    if kind not in sd["evidence"]:
        raise Rejected("bad_kind", f"step {run['step']} accepts {sd['evidence'] or 'no'} evidence, not {kind!r}")
    if kind == "review" and d.get("verified"):
        if d["session"] in t["authors"]:
            raise Rejected("separation", "authors may not review their own ticket")
        if payload.get("sha") != t["heads"].get("candidate"):
            raise Rejected("stale_review", f"review must be of the candidate "
                           f"{(t['heads'].get('candidate') or 'none')[:7]}, not {(payload.get('sha') or '')[:7]}")
    if kind == "tests_green" and d.get("verified") and payload.get("red_sha") != t["heads"].get("red"):
        raise Rejected("stale_green", "tests_green must be verified against the current red evidence")
    e = {"id": f"E{ev['seq']}", "step": run["step"], "visit": run["visit"], "kind": kind,
         "payload": payload, "verified": bool(d.get("verified")), "verifier": d.get("verifier"),
         "report": d.get("report") or {}, "by": d["session"], "epoch": d["epoch"], "ts": ev["ts"]}
    t["evidence"].append(e)
    _touch(run, ev, progress=True)
    if not e["verified"]:
        t["stats"]["rejected_evidence"] += 1
    if e["verified"]:
        if kind == "tests_red":
            t["frozen"] = dict(payload.get("frozen") or {})
            t["heads"]["red"] = payload.get("sha")
            t["heads"].pop("candidate", None)
        elif kind in ("tests_green", "ci"):
            t["heads"]["candidate"] = payload.get("sha")
        elif kind == "doc" and payload.get("scope"):
            t["scope"] = list(payload["scope"])


def h_ask(state, ev):
    t, run = _holder_run(state, ev)
    d = ev["data"]
    opts = list(d.get("options") or [])
    default = d.get("default")
    if default is not None and opts and default not in opts:
        raise Rejected("bad_default", f"default {default!r} is not one of the options {opts}")
    if not d.get("text"):
        raise Rejected("bad_question", "question text is required")
    deadline = ev["ts"] + int(d["deadline_s"]) if d.get("deadline_s") else None
    blocking = bool(d.get("blocking", True))
    q = _new_question(state, t, ev, "agent", d["text"], opts, summary=d.get("summary"), default=default,
                      deadline_ts=deadline, blocking=blocking, asked_by=d["session"])
    _touch(run, ev, progress=True)
    if d.get("note"):
        run["checkpoint"] = dict(d["note"] if isinstance(d["note"], dict) else {"text": d["note"]},
                                 ts=ev["ts"], by=d["session"], epoch=d["epoch"], step=run["step"])
        t["last_checkpoint"] = run["checkpoint"]
    if blocking:
        _release_lease(state, run)
        run["status"] = "waiting"
        run["waiting_on"] = [q["id"]]
        run["releases"] += 1


def h_answer(state, ev):
    d = ev["data"]
    q = state["questions"].get(d.get("qid"))
    if not q:
        raise Rejected("no_question", f"unknown question {d.get('qid')!r}")
    if q["status"] != "open":
        raise Rejected("closed", f"{q['id']} is already {q['status']}")
    choice = d.get("choice")
    if q["options"] and choice not in q["options"]:
        raise Rejected("bad_choice", f"choice must be one of {q['options']}")
    if not q["options"] and not (choice or d.get("text")):
        raise Rejected("bad_choice", "an answer text is required")
    if ev["actor"]["kind"] == "system" and choice != q["default"]:
        raise Rejected("not_owner", "the system may only apply a question's default")
    t = state["tickets"][q["ticket"]]
    who = "owner" if ev["actor"]["kind"] == "owner" else "default"
    q["status"] = "answered"
    q["answer"] = {"choice": choice, "text": d.get("text"), "by": who, "ts": ev["ts"]}
    if who == "owner":
        t["stats"]["owner_decisions"] += 1
    ev["ticket"] = t["id"]
    run = t["run"]
    same_run = run and run["step"] == q["step"] and run["visit"] == q["visit"]
    if q["kind"] == "agent":
        _notice(state, t, ev, f"Owner answered {q['id']} ('{q['text'][:80]}'): {choice or ''} "
                              f"{('— ' + d['text']) if d.get('text') else ''}".strip())
        if same_run and q["id"] in run["waiting_on"]:
            run["waiting_on"].remove(q["id"])
            if not run["waiting_on"] and run["status"] == "waiting":
                run["status"] = "ready"
        return
    if not same_run or q["id"] not in run["waiting_on"]:
        return  # stale approval/escalation (e.g. ticket moved on); recorded but no effect
    run["waiting_on"].remove(q["id"])
    if q["kind"] == "approval":
        t["approvals"][f"{q['step']}#{q['visit']}"] = {"choice": choice, "by": who, "text": d.get("text")}
        if choice == "approve":
            run["status"] = "ready"
            rep = gate_report(state, t)
            if all(c["status"] == OK for c in rep):
                _pass_step(state, t, ev, "approve", who)
            else:  # approved, but something else is missing: back to the agent
                run["status"] = "ready"
        else:
            sd = step_def(t)
            feedback = d.get("text") or "owner requested changes"
            if "changes" in sd["routes"]:
                _pass_step(state, t, ev, "changes", who, note=feedback)
            else:
                run["status"] = "ready"
                run["notes"].append(f"Owner requested changes: {feedback}")
        return
    if q["kind"] == "escalation":
        step = q["step"]
        if choice == "one_more":
            t["extra_visits"][step] = t["extra_visits"].get(step, 0) + 1
            run["status"] = "ready"
        elif choice == "retry":
            run["handovers"], run["claims"] = 0, 0
            run["status"] = "ready"
            run["notes"].append("Owner asked for a fresh retry: " + (d.get("text") or ""))
        elif choice == "takeover":
            run["status"], run["reserved"] = "ready", "owner"
        elif choice == "redesign":
            steps = t["process"]["steps"]
            target = "design" if "design" in steps else t["process"]["first"]
            t["history"].append({"step": step, "visit": run["visit"], "outcome": "redesign", "by": who,
                                 "ts": ev["ts"], "seq": ev["seq"], "note": d.get("text")})
            _open_step(state, t, target, ev, note="Owner sent this back to re-design: " + (d.get("text") or ""))
        elif choice == "cancel":
            _cancel(state, t, ev)


def h_done(state, ev):
    t, run = _holder_run(state, ev)
    d = ev["data"]
    sd = step_def(t)
    outcome = d.get("outcome")
    review = _latest(t, run, "review")
    if review:
        verdict = review["payload"].get("verdict")
        if outcome and outcome != verdict:
            raise Rejected("outcome_mismatch", f"outcome {outcome!r} contradicts the review verdict {verdict!r}")
        outcome = verdict
    if outcome and outcome != "approve" and outcome not in sd["routes"]:
        raise Rejected("bad_outcome", f"step {run['step']} has no route for outcome {outcome!r}")
    rep = gate_report(state, t)
    missing = [c for c in rep if c["status"] == MISSING]
    owner = [c for c in rep if c["status"] == OWNER]
    if missing:
        raise Rejected("gate", "GATE NOT SATISFIED for " + f"{t['id']}/{run['step']}: "
                       + "; ".join(f"{c['check']}: {c['msg']}" for c in missing), report=rep)
    if owner and outcome in (None, "approve"):
        return _request_approval(state, t, ev)
    _pass_step(state, t, ev, outcome, d["session"])


def h_release(state, ev):
    t, run = _holder_run(state, ev)
    d = ev["data"]
    if d.get("note"):
        note = d["note"] if isinstance(d["note"], dict) else {"text": d["note"]}
        run["checkpoint"] = dict(note, ts=ev["ts"], by=d["session"], epoch=d["epoch"], step=run["step"])
        t["last_checkpoint"] = run["checkpoint"]
    _release_lease(state, run)
    run["status"] = "ready"
    run["releases"] += 1
    if d.get("involuntary"):  # e.g. stopped without finishing (Stop hook gave up)
        run["handovers"] += 1
        t["stats"]["handovers"] += 1
        run["crashed"] = {"holder": d["session"], "ts": ev["ts"], "why": d.get("reason") or "stopped"}
    _maybe_escalate_stall(state, t, ev)


def h_expire(state, ev):
    t = _ticket(state, ev)
    d, run = ev["data"], t.get("run")
    if not run or run["status"] != "active" or run["epoch"] != d.get("epoch") \
            or run["last_activity_seq"] != d.get("last_activity_seq"):
        raise Rejected("stale_expire", "lease changed since the clock looked; not expiring")
    holder = run["holder"]
    _release_lease(state, run)
    run["status"] = "ready"
    run["handovers"] += 1
    t["stats"]["handovers"] += 1
    run["crashed"] = {"holder": holder, "ts": ev["ts"], "last_activity_ts": run["last_activity_ts"],
                      "why": "lease expired (no activity)"}
    _maybe_escalate_stall(state, t, ev)


def h_nudge(state, ev):
    t = _ticket(state, ev)
    d, run = ev["data"], t.get("run")
    if not run or run["status"] != "active" or run["epoch"] != d.get("epoch"):
        raise Rejected("stale_nudge", "lease changed; no nudge")
    run["nudges"] += 1
    run["last_nudge_ts"] = ev["ts"]
    _notice(state, t, ev, d.get("text") or "No progress recorded for a while. Run `hx checkpoint`, then "
                          "continue, `hx ask` the owner, or `hx release --note` for a fresh agent.")


def h_revoke(state, ev):
    t = _ticket(state, ev)
    d, run = ev["data"], t.get("run")
    if not run or run["status"] != "active":
        raise Rejected("not_active", f"{t['id']} has no active lease")
    if d.get("epoch") is not None and d["epoch"] != run["epoch"]:
        raise Rejected("stale_revoke", "lease changed; not revoking")
    holder = run["holder"]
    _release_lease(state, run)
    run["status"] = "ready"
    if ev["actor"]["kind"] == "system":
        run["handovers"] += 1
        t["stats"]["handovers"] += 1
        run["crashed"] = {"holder": holder, "ts": ev["ts"], "why": d.get("reason") or "revoked"}
        _maybe_escalate_stall(state, t, ev)
    else:
        run["notes"].append(f"Owner reassigned this step: {d.get('reason') or ''}".strip())


def h_override(state, ev):
    t = _ticket(state, ev)
    d = ev["data"]
    if t["status"] != "open" or not t["run"]:
        raise Rejected("not_open", f"{t['id']} is {t['status']}")
    if d.get("step") and d["step"] != t["step"]:
        raise Rejected("stale_step", f"{t['id']} is at {t['step']}")
    if not d.get("reason"):
        raise Rejected("reason", "an override needs a reason")
    outcome = d.get("outcome")
    if outcome and outcome not in step_def(t)["routes"]:
        raise Rejected("bad_outcome", f"no route for {outcome!r}")
    _pass_step(state, t, ev, outcome, "owner", note=f"OVERRIDE: {d['reason']}")


def h_land(state, ev):
    t = _ticket(state, ev)
    d, run = ev["data"], t.get("run")
    if t["status"] != "open" or not run or "merged" not in step_def(t)["gate"]:
        raise Rejected("not_landing", f"{t['id']} is not in a landing step")
    if d.get("candidate") != t["heads"].get("candidate"):
        raise Rejected("stale_land", "candidate changed since the merge queue looked")
    ok = bool(d.get("ok"))
    e = {"id": f"E{ev['seq']}", "step": run["step"], "visit": run["visit"], "kind": "land",
         "payload": {k: d.get(k) for k in ("candidate", "merged_sha", "base", "conflicts")},
         "verified": ok, "verifier": "merge-queue", "report": {"reason": d.get("reason"),
                                                                "summary": d.get("summary")},
         "by": "merge-queue", "epoch": run["epoch"], "ts": ev["ts"]}
    t["evidence"].append(e)
    if ok:
        t["heads"]["merged"] = d.get("merged_sha")
        _pass_step(state, t, ev, None, "merge-queue")
        _cascade(state, ev)
    else:
        why = d.get("reason") or "landing failed"
        if d.get("conflicts"):
            why += " (conflicts: " + ", ".join(d["conflicts"]) + ")"
        _pass_step(state, t, ev, "conflict", "merge-queue", note=why)


def h_dispatch(state, ev):
    t = _ticket(state, ev)
    run = t.get("run")
    if not run or run["status"] != "ready":
        raise Rejected("not_ready", "nothing to dispatch")
    prev = run["dispatched"] or {}
    run["dispatched"] = {"ts": ev["ts"], "launch": ev["data"].get("launch"), "n": prev.get("n", 0) + 1}


def h_notify(state, ev):
    d = ev["data"]
    state["pushes"].append({"ts": ev["ts"], "text": d.get("text"), "urgent": d.get("urgent"),
                            "keys": d.get("keys", [])})
    del state["pushes"][:-50]
    for k in d.get("keys", []):
        if k in state["questions"]:
            state["questions"][k]["notified_ts"] = ev["ts"]


def h_escalate(state, ev):
    t = _ticket(state, ev)
    d, run = ev["data"], t.get("run")
    if t["status"] != "open" or not run or run["status"] == "waiting":
        raise Rejected("not_escalatable", f"{t['id']} has nothing to escalate")
    if d.get("reason") not in ("stalled", "dispatch"):
        raise Rejected("bad_reason", "reason must be stalled or dispatch")
    _escalate(state, t, ev, d["reason"], d.get("text") or f"{t['id']} needs attention ({d['reason']})")


def _cancel(state, t, ev):
    _release_lease(state, t.get("run"))
    t["status"], t["run"], t["step"] = "cancelled", None, None
    for q in state["questions"].values():
        if q["ticket"] == t["id"] and q["status"] == "open":
            q["status"] = "void"
    _cascade(state, ev)


def h_ticket_cancel(state, ev):
    t = _ticket(state, ev)
    if t["status"] in ("done", "cancelled"):
        raise Rejected("closed", f"{t['id']} is already {t['status']}")
    _cancel(state, t, ev)


def h_ticket_pause(state, ev):
    t = _ticket(state, ev)
    if t["status"] not in ("open", "queued"):
        raise Rejected("bad_status", f"cannot pause a {t['status']} ticket")
    t["prev_status"], t["status"] = t["status"], "paused"
    run = t.get("run")
    if run and run["status"] == "active":
        _release_lease(state, run)
        run["status"] = "ready"
        run["notes"].append("Paused by the owner while in progress.")


def h_ticket_resume(state, ev):
    t = _ticket(state, ev)
    if t["status"] != "paused":
        raise Rejected("bad_status", f"{t['id']} is not paused")
    t["status"] = t["prev_status"] or "open"
    _maybe_open(state, t, ev)


def h_ticket_edit(state, ev):
    t = _ticket(state, ev)
    d = ev["data"]
    allowed = {"title", "body", "criteria", "priority", "scope", "risk", "test_cmd", "ci_cmd", "deps"}
    bad = set(d) - allowed
    if bad:
        raise Rejected("bad_edit", f"cannot edit {sorted(bad)}")
    if "risk" in d and d["risk"] not in RISK:
        raise Rejected("bad_risk", "bad risk")
    for k, v in d.items():
        if k == "criteria":
            v = [c if isinstance(c, dict) else {"id": f"AC{i}", "text": str(c)} for i, c in enumerate(v, 1)]
        t[k] = v
    _notice(state, t, ev, f"Owner edited the ticket ({', '.join(sorted(d))}). Re-read it with `hx brief`.")
    _maybe_open(state, t, ev)


def h_system_pause(state, ev):
    state["paused_all"] = True
    for t in state["tickets"].values():
        run = t.get("run")
        if run and run["status"] == "active":
            _release_lease(state, run)
            run["status"] = "ready"
            run["notes"].append("All work was paused by the owner while this step was in progress.")


def h_system_resume(state, ev):
    state["paused_all"] = False


def h_system_config(state, ev):
    bad = set(ev["data"]) - set(DEFAULT_CONFIG)
    if bad:
        raise Rejected("bad_config", f"unknown config keys {sorted(bad)}")
    state["config"].update(ev["data"])


HANDLERS = {
    "ticket.create": h_ticket_create, "ticket.edit": h_ticket_edit, "ticket.pause": h_ticket_pause,
    "ticket.resume": h_ticket_resume, "ticket.cancel": h_ticket_cancel,
    "system.pause": h_system_pause, "system.resume": h_system_resume, "system.config": h_system_config,
    "claim": h_claim, "heartbeat": h_heartbeat, "checkpoint": h_checkpoint, "evidence": h_evidence,
    "ask": h_ask, "answer": h_answer, "done": h_done, "release": h_release, "expire": h_expire,
    "nudge": h_nudge, "revoke": h_revoke, "override": h_override, "land": h_land,
    "dispatch": h_dispatch, "notify": h_notify, "escalate": h_escalate,
}


def _check_actor(ev):
    kind = (ev.get("actor") or {}).get("kind")
    typ = ev["type"]
    if typ in OWNER_ONLY and kind != "owner":
        raise Rejected("not_owner", f"{typ} is owner-only")
    if typ in OWNER_OR_SYSTEM and kind not in ("owner", "system"):
        raise Rejected("not_owner", f"{typ} is for the owner or the system only")
    if typ in SYSTEM_ONLY and kind != "system":
        raise Rejected("not_system", f"{typ} is for the system clock only")
    if typ in HOLDER_EVENTS and kind not in ("agent", "owner"):
        raise Rejected("not_agent", f"{typ} must come from an agent or the owner")


def apply(state, ev):
    """Validate and apply one event in place. Raises Rejected without mutating state."""
    h = HANDLERS.get(ev.get("type"))
    if h is None:
        raise Rejected("unknown_type", f"unknown event type {ev.get('type')!r}")
    _check_actor(ev)
    h(state, ev)
    state["seq"], state["ts"] = ev["seq"], ev["ts"]
    t = state["tickets"].get(ev.get("ticket"))
    if t is not None:
        t["version"] += 1
        t["updated_ts"] = ev["ts"]
    return state


def fold(events, state=None, strict=False):
    """Replay events. Invalid ones are skipped and recorded (validate-on-fold) unless strict."""
    state = state if state is not None else new_state()
    for ev in events:
        try:
            apply(state, ev)
        except Rejected as r:
            if strict:
                raise
            state["rejected"].append({"seq": ev["seq"], "type": ev["type"], "code": r.code,
                                      "message": r.message})
            state["seq"], state["ts"] = ev["seq"], ev["ts"]
    return state


def clone(state):
    return copy.deepcopy(state)
