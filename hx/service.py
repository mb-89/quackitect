"""The service: the one API used by the CLI, the hooks, the HTTP server and the simulator.

It turns intentions into events, runs verifiers outside the store lock, and runs the clock (`tick`).
Agent operations are keyed by session id: the session's current lease (ticket, epoch) is looked up
from state, so a session that lost its lease gets LEASE_LOST on every write.
"""
import shlex
import subprocess
import uuid

from . import engine, views
from .engine import Rejected, step_def
from .processes import CODE_STEPS
from .verify import Verifier

OWNER = {"kind": "owner", "id": "owner"}
SYSTEM = {"kind": "system", "id": "clock"}


def AGENT(sid):
    return {"kind": "agent", "id": sid}


def overlaps(a, b):
    return any(x.startswith(y) or y.startswith(x) for x in a for y in b)


def in_flight(t):
    """A ticket whose code changes exist on a branch but are not on main yet."""
    if t["status"] != "open" or t["heads"].get("merged"):
        return False
    if t["heads"].get("red") or t["heads"].get("candidate"):
        return True
    if any(h["step"] in CODE_STEPS for h in t["history"]):
        return True
    return bool(t["run"] and t["step"] in CODE_STEPS and t["run"]["status"] == "active")


def scope_blocker(state, t):
    """Id of an in-flight ticket whose scope overlaps t's, if t would start code work now."""
    if t["step"] not in CODE_STEPS or not t["scope"] or in_flight(t):
        return None
    for oid in state["order"]:
        o = state["tickets"][oid]
        if oid != t["id"] and o["scope"] and in_flight(o) and overlaps(t["scope"], o["scope"]):
            return oid
    return None


def candidates(state, role, session=None, now=0):
    """Ready steps for a role, best first: tickets already in progress, then priority, then age."""
    out = []
    if state["paused_all"]:
        return out
    for tid in state["order"]:
        t = state["tickets"][tid]
        run = t["run"]
        if t["status"] != "open" or not run or run["status"] != "ready" or run["reserved"]:
            continue
        if step_def(t)["role"] != role:
            continue
        if role == "reviewer" and session in t["authors"]:
            continue
        if scope_blocker(state, t):
            continue
        out.append(t)
    out.sort(key=lambda t: (not t["history"], t["priority"], t["created_seq"]))
    return [t["id"] for t in out]


class RecordingLauncher:
    """Records launch requests (tests, demo, or a human copying the prompt into a session)."""

    def __init__(self):
        self.launched = []

    def launch(self, ticket, step, role, prompt):
        lid = f"L{len(self.launched) + 1}"
        self.launched.append({"id": lid, "ticket": ticket, "step": step, "role": role, "prompt": prompt})
        return lid


class CommandLauncher:
    """Starts an agent session with a shell command template, e.g.
    'claude -p {prompt} --permission-mode acceptEdits' (fields: ticket, step, role, prompt)."""

    def __init__(self, template, cwd=None):
        self.template, self.cwd = template, cwd

    def launch(self, ticket, step, role, prompt):
        cmd = self.template.format(ticket=shlex.quote(ticket), step=shlex.quote(step),
                                   role=shlex.quote(role), prompt=shlex.quote(prompt))
        p = subprocess.Popen(cmd, shell=True, cwd=self.cwd, stdout=subprocess.DEVNULL,
                             stderr=subprocess.DEVNULL, start_new_session=True)
        return f"pid{p.pid}"


def launch_prompt(ticket, role):
    return (f"You are an hx {role} agent. Run `hx claim --ticket {ticket} --role {role}` and follow the "
            f"brief it prints. Work only on that step; checkpoint as you go. Finish with `hx done` (the gate "
            f"decides), `hx ask` if you need the owner, or `hx release --note` if you cannot continue.")


class Hx:
    def __init__(self, store, verifier=None, notifier=None, launcher=None):
        self.store = store
        self.clock = store.clock
        self.verifier = verifier or Verifier()
        self.notifier = notifier
        self.launcher = launcher

    # ------------------------------------------------------------------ basics
    def now(self):
        return self.clock.now()

    def state(self):
        return self.store.read()

    def _one(self, typ, actor, ticket=None, **data):
        return self.store.append([{"type": typ, "actor": actor, "ticket": ticket, "data": data}])

    def lease(self, session, state=None):
        st = state or self.state()
        return st["leases"].get(session)

    def _need_lease(self, session):
        st = self.state()
        lease = st["leases"].get(session)
        if not lease:
            raise Rejected("lease_lost", f"LEASE_LOST: session {session} holds no lease. If you were working "
                                         f"on a ticket, it was handed over: stop and do not push.")
        return st, lease

    # ------------------------------------------------------------------ owner
    def create_ticket(self, spec, actor=OWNER):
        d = dict(spec)
        return self._one("ticket.create", actor, d.get("id"), **d)

    def import_spec(self, spec, actor=OWNER):
        """{"group": {...}|None, "tickets": [...]} -> one atomic batch, dependencies first."""
        evs = []
        gid = None
        if spec.get("group"):
            g = dict(spec["group"], process="group")
            gid = g["id"]
            evs.append({"type": "ticket.create", "actor": actor, "ticket": gid, "data": g})
        pending = [dict(t) for t in spec.get("tickets", [])]
        done_ids = set()
        while pending:
            progressed = False
            for t in list(pending):
                if all(d in done_ids or d not in {x["id"] for x in pending} for d in t.get("deps", [])):
                    if gid:
                        t.setdefault("parent", gid)
                    evs.append({"type": "ticket.create", "actor": actor, "ticket": t["id"], "data": t})
                    done_ids.add(t["id"])
                    pending.remove(t)
                    progressed = True
            if not progressed:
                raise Rejected("bad_deps", "dependency cycle among " + ", ".join(t["id"] for t in pending))
        return self.store.append(evs)

    def answer(self, qid, choice=None, text=None, actor=OWNER):
        q = self.state()["questions"].get(qid)
        return self._one("answer", actor, q["ticket"] if q else None, qid=qid, choice=choice, text=text)

    def _open_q(self, tid, kinds):
        for q in self.state()["questions"].values():
            if q["ticket"] == tid and q["status"] == "open" and q["kind"] in kinds:
                return q
        raise Rejected("no_question", f"no open {'/'.join(kinds)} question for {tid}")

    def approve(self, tid, text=None, actor=OWNER):
        return self.answer(self._open_q(tid, ("approval",))["id"], "approve", text, actor)

    def request_changes(self, tid, text, actor=OWNER):
        return self.answer(self._open_q(tid, ("approval",))["id"], "changes", text, actor)

    def pause(self, tid=None, actor=OWNER):
        return self._one("ticket.pause", actor, tid) if tid else self._one("system.pause", actor)

    def resume(self, tid=None, actor=OWNER):
        return self._one("ticket.resume", actor, tid) if tid else self._one("system.resume", actor)

    def cancel(self, tid, actor=OWNER):
        return self._one("ticket.cancel", actor, tid)

    def revoke(self, tid, reason="reassigned by owner", actor=OWNER):
        return self._one("revoke", actor, tid, reason=reason)

    def override(self, tid, reason, outcome=None, step=None, actor=OWNER):
        return self._one("override", actor, tid, reason=reason, outcome=outcome, step=step)

    def edit(self, tid, actor=OWNER, **fields):
        return self._one("ticket.edit", actor, tid, **fields)

    def configure(self, actor=OWNER, **kv):
        return self._one("system.config", actor, None, **kv)

    # ------------------------------------------------------------------ agents
    def claim(self, session, role="worker", ticket=None, actor=None):
        actor = actor or AGENT(session)
        st = self.state()
        cur = st["leases"].get(session)
        if cur and (ticket is None or cur["ticket"] == ticket):
            return {"ticket": cur["ticket"], "epoch": cur["epoch"], "step": cur["step"], "resumed": True,
                    "brief": self.brief(session, cur["ticket"])}
        picked = {}

        def build(state):
            ids = [ticket] if ticket else candidates(state, role, session, self.now())
            if not ids:
                raise Rejected("no_work", f"no ready {role} work right now")
            if ticket and actor["kind"] != "owner":
                blocker = scope_blocker(state, state["tickets"][ticket]) if ticket in state["tickets"] else None
                if blocker:
                    raise Rejected("scope", f"{ticket} overlaps in-flight {blocker}; wait for it to land")
            picked["id"] = ids[0]
            return [{"type": "claim", "actor": actor, "ticket": ids[0],
                     "data": {"session": session, "role": role}}]

        st, _ = self.store.append(build)
        t = st["tickets"][picked["id"]]
        return {"ticket": t["id"], "epoch": t["run"]["epoch"], "step": t["step"], "resumed": False,
                "brief": self.brief(session, t["id"])}

    def heartbeat(self, session, head=None, actor=None):
        st, lease = self._need_lease(session)
        return self._one("heartbeat", actor or AGENT(session), lease["ticket"], session=session,
                         epoch=lease["epoch"], head=head)

    def checkpoint(self, session, done=None, next=None, risks=None, text=None, head=None, actor=None):
        st, lease = self._need_lease(session)
        note = {k: v for k, v in (("done", done), ("next", next), ("risks", risks), ("text", text)) if v}
        if not note:
            raise Rejected("empty", "a checkpoint needs --done/--next (what is done, what comes next)")
        return self._one("checkpoint", actor or AGENT(session), lease["ticket"], session=session,
                         epoch=lease["epoch"], note=note, head=head)

    def submit(self, session, kind, sha=None, actor=None, **args):
        st, lease = self._need_lease(session)
        t = st["tickets"][lease["ticket"]]
        if kind == "review" and not sha:
            sha = t["heads"].get("candidate")
        ok, payload, report = self.verifier.verify(kind, t, dict(args, sha=sha))
        self._one("evidence", actor or AGENT(session), t["id"], session=session, epoch=lease["epoch"],
                  kind=kind, payload=payload or {}, verified=ok, verifier=self.verifier.name, report=report)
        return {"ok": ok, "kind": kind, "report": report, "payload": payload}

    def ask(self, session, text, options=None, default=None, deadline_s=None, blocking=True, summary=None,
            note=None, actor=None):
        st, lease = self._need_lease(session)
        st, evs = self._one("ask", actor or AGENT(session), lease["ticket"], session=session,
                            epoch=lease["epoch"], text=text, options=options or [], default=default,
                            deadline_s=deadline_s, blocking=blocking, summary=summary, note=note)
        qid = max((q for q in st["questions"].values() if q["seq"] == evs[0]["seq"]),
                  key=lambda q: q["id"])["id"]
        return {"qid": qid, "blocking": blocking}

    def done(self, session, outcome=None, cont=False, actor=None):
        st, lease = self._need_lease(session)
        tid = lease["ticket"]
        st, _ = self._one("done", actor or AGENT(session), tid, session=session, epoch=lease["epoch"],
                          outcome=outcome)
        t = st["tickets"][tid]
        res = {"ticket": tid, "status": t["status"], "step": t["step"]}
        if t["status"] == "done":
            res["message"] = f"{tid} is done."
        elif t["run"]["status"] == "waiting":
            res["message"] = (f"{tid}: waiting for the owner ({', '.join(t['run']['waiting_on'])}). "
                              f"Your lease is released; stop here.")
        else:
            role = step_def(t)["role"]
            res["message"] = f"{tid}: step passed; next step is {t['step']} ({role})."
            if cont and role == "worker" and lease and actor is None:
                try:
                    c = self.claim(session, "worker", tid)
                    res.update(continued=True, brief=c["brief"])
                    res["message"] += " You continue with it (brief below)."
                except Rejected as r:
                    res["message"] += f" (could not continue: {r.message})"
            else:
                res["message"] += " Your lease is released; stop here."
        return res

    def release(self, session, note=None, involuntary=False, reason=None, actor=None):
        st, lease = self._need_lease(session)
        return self._one("release", actor or AGENT(session), lease["ticket"], session=session,
                         epoch=lease["epoch"], note=note, involuntary=involuntary, reason=reason)

    # ------------------------------------------------------------------ views
    def brief(self, session=None, ticket=None):
        st = self.state()
        if ticket is None:
            lease = st["leases"].get(session)
            if not lease:
                return ("hx: you hold no lease. Run `hx claim --role worker` (or reviewer) to get work, or "
                        "stop if you were not asked to work on hx tickets.")
            ticket = lease["ticket"]
        t = st["tickets"].get(ticket)
        ctx = {}
        if t and t["run"]:
            cp = t["run"]["checkpoint"] or {}
            ctx = self.verifier.git_context(t, checkpoint_head=cp.get("head"))
        return views.brief(st, ticket, session, self.now(), ctx)

    def board(self):
        return views.board(self.state(), self.now())

    def inbox(self):
        return views.inbox(self.state(), self.now())

    def show(self, tid):
        return views.show(self.state(), tid, self.now())

    def digest(self, since=0):
        return views.digest(self.state(), self.now(), since)

    def events(self, ticket=None):
        evs = self.store.all_events()
        return [e for e in evs if ticket is None or e.get("ticket") == ticket]

    # ------------------------------------------------------------------ clock
    def _try(self, actions, label, typ, actor, ticket=None, **data):
        try:
            self._one(typ, actor, ticket, **data)
            actions.append(label)
            return True
        except Rejected as r:
            actions.append(f"skipped {label}: {r.code}")
            return False

    def tick(self, dispatch=False, land=True):
        """One pass of the clock. Idempotent; safe to run concurrently (all events are conditional)."""
        now = self.now()
        st = self.state()
        cfg = st["config"]
        actions = []
        for tid in list(st["order"]):
            t = st["tickets"][tid]
            run = t["run"]
            if t["status"] != "open" or not run:
                continue
            sd = step_def(t)
            if run["status"] == "active":
                idle = now - run["last_activity_ts"]
                noprog = now - run["last_progress_ts"]
                expect = sd["expect_min"] * 60
                if idle > cfg["lease_ttl_s"]:
                    self._try(actions, f"expire {tid}/{run['step']} (silent {views.mins(idle)})", "expire",
                              SYSTEM, tid, epoch=run["epoch"], last_activity_seq=run["last_activity_seq"])
                elif noprog > cfg["stall_factor"] * expect:
                    if run["nudges"] == 0:
                        self._try(actions, f"nudge {tid}/{run['step']} (no progress {views.mins(noprog)})",
                                  "nudge", SYSTEM, tid, epoch=run["epoch"],
                                  text=f"No progress recorded for {views.mins(noprog)} (expected ~"
                                       f"{sd['expect_min']}m for this step). Run `hx checkpoint` now, then "
                                       f"continue, `hx ask` the owner, or `hx release --note` for a fresh agent.")
                    elif now - (run["last_nudge_ts"] or now) > expect:
                        self._try(actions, f"revoke {tid}/{run['step']} (still no progress after nudge)",
                                  "revoke", SYSTEM, tid, epoch=run["epoch"],
                                  reason=f"no progress for {views.mins(noprog)} after a nudge")
            elif run["status"] == "ready" and run["dispatched"]:
                dsp = run["dispatched"]
                if now - dsp["ts"] > cfg["dispatch_timeout_s"] and dsp["n"] >= 3:
                    self._try(actions, f"escalate {tid}: dispatched {dsp['n']}x, never claimed", "escalate",
                              SYSTEM, tid, reason="dispatch",
                              text=f"{tid}/{run['step']}: launched {dsp['n']} agents, none claimed the step. "
                                   f"Launcher or environment broken?")
        st = self.state()
        for q in list(st["questions"].values()):
            if q["status"] == "open" and q["deadline_ts"] and now >= q["deadline_ts"] and q["default"] is not None:
                self._try(actions, f"default {q['id']} -> {q['default']} (deadline passed)", "answer", SYSTEM,
                          q["ticket"], qid=q["id"], choice=q["default"], text="default applied after deadline")
        if land:
            self._land_one(actions)
        if dispatch and self.launcher:
            self._dispatch(actions, now)
        self._notify(actions, now)
        return actions

    def _land_one(self, actions):
        """Serial merge queue: at most one landing per tick, highest priority first."""
        st = self.state()
        queue = [st["tickets"][tid] for tid in st["order"]
                 if st["tickets"][tid]["status"] == "open" and st["tickets"][tid]["run"]
                 and st["tickets"][tid]["run"]["status"] == "ready"
                 and "merged" in step_def(st["tickets"][tid])["gate"]]
        queue.sort(key=lambda t: (t["priority"], t["created_seq"]))
        if not queue:
            return
        t = queue[0]
        res = self.verifier.land(t)
        if res.get("ok") is None:
            actions.append(f"land {t['id']}: {res.get('reason')}")
            return
        data = {k: res.get(k) for k in ("ok", "merged_sha", "base", "candidate", "reason", "conflicts", "summary")}
        label = (f"land {t['id']}: merged {str(res.get('merged_sha'))[:7]}" if res.get("ok")
                 else f"land {t['id']} FAILED: {res.get('reason')}")
        self._try(actions, label, "land", SYSTEM, t["id"], **data)

    def _dispatch(self, actions, now):
        st = self.state()
        cfg = st["config"]
        pending = sum(1 for t in st["tickets"].values() if t["run"] and t["run"]["status"] == "ready"
                      and t["run"]["dispatched"] and now - t["run"]["dispatched"]["ts"] < cfg["dispatch_timeout_s"])
        capacity = cfg["max_agents"] - len(st["leases"]) - pending
        for role in ("reviewer", "worker"):
            for tid in candidates(st, role, None, now):
                if capacity <= 0:
                    return
                run = st["tickets"][tid]["run"]
                if run["dispatched"] and now - run["dispatched"]["ts"] < cfg["dispatch_timeout_s"]:
                    continue
                lid = self.launcher.launch(tid, run["step"], role, launch_prompt(tid, role))
                if self._try(actions, f"dispatch {tid}/{run['step']} -> {role} ({lid})", "dispatch", SYSTEM, tid,
                             launch=lid):
                    capacity -= 1

    def _notify(self, actions, now):
        """Urgent (escalations) push now; other blocking questions are batched; the rest wait for the digest."""
        st = self.state()
        cfg = st["config"]
        fresh = [q for q in views.inbox(st, now) if q["notified_ts"] is None]
        urgent = [q for q in fresh if q["kind"] == "escalation"]
        batch = [q for q in fresh if q["kind"] != "escalation" and q["blocking"]]
        last = st["pushes"][-1]["ts"] if st["pushes"] else 0
        send = urgent + batch if urgent or (batch and now - last >= cfg["push_min_interval_s"]) else []
        if not send:
            return
        text = "; ".join(f"{q['id']} {q['ticket']} [{q['kind']}] {q['summary'][:80]}" for q in send)
        if self._try(actions, f"push ({'urgent' if urgent else 'batch'}): {len(send)} item(s)", "notify", SYSTEM,
                     None, text=text, urgent=bool(urgent), keys=[q["id"] for q in send]):
            if self.notifier:
                self.notifier(text, bool(urgent))


def new_session_id(prefix="s"):
    return f"{prefix}-{uuid.uuid4().hex[:8]}"
