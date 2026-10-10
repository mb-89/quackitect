"""The engine: folds the event log into work state, and owns every verb.

The model never writes state. It makes claims (`done`, `verdict`), and the
engine runs the gates and decides. The owner approves, rejects, answers and
steers. The supervisor (`tick`) expires leases and catches stalls.
"""

from dataclasses import dataclass, field

from . import gates as G
from . import routes as R

SETTINGS = {
    "lease_ttl": 600,       # seconds a lease lives without a heartbeat
    "spin_after": 1800,     # seconds without a closed step before a nudge
    "spin_calls": 150,      # tool calls without a closed step before a nudge
    "max_bounces": 3,       # rejections before the owner is asked
    "max_expiries": 2,      # lost agents on one step before the owner is asked
    "reanchor_every": 25,   # tool calls between short reminders
}

# What the forge adapter does when a step closes (outbox, see DESIGN.md).
FORGE_ON_CLOSE = {"red": "open_draft_pr", "implement": "open_draft_pr",
                  "review": "mark_ready", "accept": "merge"}


class BatonError(Exception):
    pass


def role(actor):
    return actor.split(":", 1)[0]


def ident(actor):
    """The session behind an actor, whatever role it plays."""
    return actor.split(":", 1)[-1]


@dataclass
class Work:
    id: str
    title: str
    ask: str
    group: str = ""
    route: list = field(default_factory=list)
    route_name: str = "standard"
    origin: str = "owner"
    after: list = field(default_factory=list)
    repo: str = None
    branch: str = ""
    test_cmd: str = "python -m unittest discover -s tests -t . -q"
    test_paths: list = field(default_factory=lambda: ["tests/"])
    ci_mode: str = "external"
    prio: int = 0
    created: float = 0
    step: int = 0
    status: str = "ready"
    lease: str = None
    lease_until: float = 0
    last_hb: float = 0
    last_progress: float = 0
    calls: int = 0
    baton: str = ""
    baton_by: str = ""
    baton_ts: float = 0
    bounces: int = 0
    findings: list = field(default_factory=list)
    evidence: dict = field(default_factory=dict)
    closed: dict = field(default_factory=dict)
    opened_sha: dict = field(default_factory=dict)
    owner_notes: list = field(default_factory=list)
    answers: list = field(default_factory=list)
    question: dict = None
    ci: dict = field(default_factory=dict)
    approvals: dict = field(default_factory=dict)
    verdicts: list = field(default_factory=list)
    last_failure: str = ""
    nudged: float = 0
    nudge_text: str = ""
    expiries: dict = field(default_factory=dict)
    escalation: str = ""
    parked: dict = None
    paused: bool = False
    done: bool = False
    sessions: int = 0
    times_closed: dict = field(default_factory=dict)
    log: list = field(default_factory=list)

    @property
    def cur(self):
        return self.route[self.step] if self.step < len(self.route) else None

    @property
    def step_name(self):
        return self.cur["step"] if self.cur else "done"

    def step_index(self, name):
        for i, s in enumerate(self.route):
            if s["step"] == name:
                return i
        raise BatonError(f"route has no step {name!r}")

    def needs_owner(self):
        """True when the work cannot move until the owner acts."""
        if self.escalation or self.question:
            return True
        if self.cur and self.cur["owner"] == "human":
            return True
        return bool(self.parked and "human" in self.parked.get("kinds", []))


CREATE_FIELDS = ("title", "ask", "group", "route", "route_name", "origin",
                 "after", "repo", "branch", "test_cmd", "test_paths",
                 "ci_mode", "prio")


def _rest_status(w):
    if w.done:
        return "done"
    if w.paused:
        return "paused"
    if w.escalation:
        return "escalated"
    if w.question or w.parked or w.cur["owner"] == "human":
        return "waiting"
    return "active" if w.lease else "ready"


def _apply(w, e):
    k, d, ts, actor = e["kind"], e["data"], e["ts"], e["actor"]
    step = w.step_name
    if k == "lease.taken":
        w.lease, w.lease_until, w.last_hb = actor, d["until"], ts
        w.last_progress, w.calls, w.nudged = ts, 0, 0  # the spin clock is the holder's
        w.sessions += 1
    elif k == "heartbeat":
        if actor == w.lease:
            w.lease_until, w.last_hb = d["until"], ts
            w.calls += 1
    elif k == "lease.released":
        w.lease = None
    elif k == "lease.expired":
        w.lease = None
        w.expiries[step] = w.expiries.get(step, 0) + 1
    elif k in ("baton", "note") and d.get("baton"):
        w.baton, w.baton_by, w.baton_ts = d["baton"], actor, ts
    elif k == "evidence":
        w.evidence.setdefault(d["step"], {})[d["name"]] = d["text"]
    elif k == "claim.failed":
        w.last_failure = d["reasons"]
    elif k == "gate.record" and d.get("ci"):
        w.ci[d["sha"]] = d["ok"]
    elif k == "park":
        w.parked, w.lease = d, None
    elif k == "step.closed":
        w.closed[d["step"]] = {"actor": d["by"], "sha": d["sha"], "ts": ts}
        w.times_closed[d["step"]] = w.times_closed.get(d["step"], 0) + 1
        w.step += 1
        w.parked, w.last_failure, w.nudged = None, "", 0
        w.last_progress, w.calls = ts, 0
        if w.cur is None:
            w.done, w.lease = True, None
        else:
            w.opened_sha[w.cur["step"]] = d["sha"]
            if w.lease and role(w.lease) != w.cur["owner"]:
                w.lease = None
    elif k == "bounce":
        to = w.step_index(d["to"])
        for s in w.route[to:]:
            w.closed.pop(s["step"], None)
            w.approvals.pop(s["step"], None)
        later = {s["step"] for s in w.route[to:]}
        w.verdicts = [v for v in w.verdicts if v["step"] not in later]
        w.step, w.bounces, w.findings = to, w.bounces + 1, list(d["findings"])
        w.opened_sha[d["to"]] = d.get("sha")
        w.parked, w.last_failure, w.nudged = None, "", 0
        w.last_progress, w.calls = ts, 0
        if w.lease and role(w.lease) != w.cur["owner"]:
            w.lease = None
    elif k == "ask":
        w.question = {"text": d["text"], "options": d.get("options") or [],
                      "by": actor, "ts": ts}
        w.lease = None
    elif k == "answer":
        w.answers.append({"q": d["q"], "a": d["text"], "ts": ts})
        w.question = None
        w.last_progress, w.nudged = ts, 0
    elif k == "owner.note":
        w.owner_notes.append({"text": d["text"], "ts": ts})
    elif k == "approve":
        w.approvals[d["step"]] = d["sha"]
    elif k == "verdict":
        w.verdicts.append(dict(d, actor=actor))
        if d["approve"]:
            w.findings = []
    elif k == "ci":
        w.ci[d["sha"]] = d["ok"]
    elif k == "nudge":
        w.nudged, w.nudge_text = ts, d["text"]
    elif k == "escalate":
        w.escalation, w.lease = d["reason"], None
    elif k == "resume":
        w.escalation, w.paused, w.nudged, w.calls, w.bounces = "", False, 0, 0, 0
        w.last_progress = ts
        w.expiries[step] = 0
    elif k == "pause":
        w.paused, w.lease = True, None
    elif k == "prio":
        w.prio = d["prio"]


def _summary(e):
    d = e["data"]
    k = e["kind"]
    if k == "heartbeat":
        return None
    text = (d.get("text") or d.get("reason") or d.get("reasons") or
            d.get("baton") or "")
    if k == "step.closed":
        text = f"{d['step']} closed at {str(d['sha'])[:8]}"
    elif k == "bounce":
        text = f"{d['from']} -> {d['to']}: " + "; ".join(d["findings"])
    elif k == "evidence":
        text = f"{d['name']}: {d['text'][:80]}"
    elif k == "verdict":
        text = ("approve" if d["approve"] else "reject: " + "; ".join(d["findings"]))
    elif k == "ci":
        text = f"{'green' if d['ok'] else 'red'} at {d['sha'][:8]}"
    elif k == "park":
        text = "; ".join(d.get("reasons", []))
    return text.replace("\n", " ")[:160]


def fold(events):
    works = {}
    for e in events:
        wid = e["work"]
        if e["kind"] == "work.created":
            d = e["data"]
            w = Work(id=wid, **{k: d[k] for k in CREATE_FIELDS if k in d})
            w.created = w.last_progress = e["ts"]
            w.opened_sha[w.route[0]["step"]] = d.get("sha")
            works[wid] = w
        elif wid in works:
            w = works[wid]
            _apply(w, e)
        else:
            continue
        w.status = _rest_status(w)
        s = _summary(e)
        if s is not None:
            w.log.append({"seq": e["seq"], "ts": e["ts"], "actor": e["actor"],
                          "kind": e["kind"], "text": s})
    return works


class Engine:
    def __init__(self, store, settings=None):
        self.s = store
        self.cfg = dict(SETTINGS, **(settings or {}))

    # ---- reading -------------------------------------------------------

    @property
    def now(self):
        return self.s.clock()

    def works(self):
        return fold(self.s.events())

    def get(self, wid):
        ws = fold(self.s.events(wid))
        if wid not in ws:
            raise BatonError(f"no work {wid}")
        return ws[wid]

    def held(self, actor):
        for w in self.works().values():
            if w.lease == actor:
                return w
        return None

    def _must_hold(self, actor):
        w = self.held(actor)
        if not w:
            raise BatonError(f"{actor} holds no work; call take() first")
        return w

    def _emit(self, wid, actor, kind, **data):
        return self.s.append(wid, actor, kind, data)

    # ---- owner verbs ---------------------------------------------------

    def create(self, title, ask, group="", route="standard", origin="owner",
               after=(), repo=None,
               test_cmd="python -m unittest discover -s tests -t . -q",
               test_paths=("tests/",), ci_mode="external", prio=0,
               actor="owner"):
        if not title.strip() or not ask.strip():
            raise BatonError("a work needs a title and an ask")
        steps = R.get(route)
        with self.s.tx():
            n = sum(1 for e in self.s.events() if e["kind"] == "work.created")
            wid = f"W{n + 1}"
            self._emit(wid, actor, "work.created", title=title, ask=ask,
                       group=group, route=steps, route_name=route,
                       origin=origin, after=list(after), repo=repo,
                       branch=f"work/{wid.lower()}", test_cmd=test_cmd,
                       test_paths=list(test_paths), ci_mode=ci_mode,
                       prio=prio, sha=G.head(repo) or "-")
        return wid

    def approve(self, wid, text="", actor="owner"):
        w = self.get(wid)
        if not w.needs_owner() or w.question or w.escalation:
            raise BatonError(f"{wid} is not waiting for an approval")
        sha = G.head(w.repo) or "-"
        self._emit(wid, actor, "approve", step=w.step_name, sha=sha, text=text)
        return self._try_close(wid, actor)

    def reject(self, wid, reason, actor="owner"):
        if not reason.strip():
            raise BatonError("a rejection names a reason the agent can act on")
        w = self.get(wid)
        if w.done:
            raise BatonError(f"{wid} is done")
        to = w.cur.get("on_reject", w.step_name)
        return self._bounce(w, to, [reason], actor)

    def answer(self, wid, text, actor="owner"):
        w = self.get(wid)
        if not w.question:
            raise BatonError(f"{wid} has no open question")
        self._emit(wid, actor, "answer", q=w.question["text"], text=text)
        return {"ok": True}

    def note(self, wid, text, actor="owner"):
        """An owner note is pinned to the work's card."""
        self.get(wid)
        self._emit(wid, actor, "owner.note", text=text)

    def pause(self, wid, actor="owner"):
        self.get(wid)
        self._emit(wid, actor, "pause")

    def resume(self, wid, text="", actor="owner"):
        self.get(wid)
        self._emit(wid, actor, "resume", text=text)
        if text:
            self._emit(wid, actor, "owner.note", text=text)

    def prioritize(self, wid, prio, actor="owner"):
        self.get(wid)
        self._emit(wid, actor, "prio", prio=int(prio))

    def ci(self, wid, sha, ok, actor="ci"):
        self._emit(wid, actor, "ci", sha=sha, ok=bool(ok))
        w = self.get(wid)
        if w.cur and any(g["kind"] == "ci" for g in w.cur["gates"]):
            return self._try_close(wid, actor)
        return {"ok": True}

    # ---- agent verbs ---------------------------------------------------

    def take(self, actor, wid=None):
        r = role(actor)
        with self.s.tx():
            ws = self.works()
            for w in ws.values():
                if w.lease == actor:
                    return w.id
            cands = []
            for w in ws.values():
                if w.status != "ready" or w.cur["owner"] != r:
                    continue
                if wid and w.id != wid:
                    continue
                if any(not ws.get(a) or not ws[a].done for a in w.after):
                    continue
                if r == "helper" and ident(actor) in {ident(c["actor"]) for c in w.closed.values()}:
                    continue  # a reviewer must not have authored any step
                cands.append(w)
            if not cands:
                return None
            cands.sort(key=lambda w: (-w.prio, w.baton_by != actor, w.created))
            w = cands[0]
            self._emit(w.id, actor, "lease.taken",
                       until=self.now + self.cfg["lease_ttl"], step=w.step_name)
            return w.id

    def heartbeat(self, actor):
        w = self.held(actor)
        if not w:
            return None
        self._emit(w.id, actor, "heartbeat", until=self.now + self.cfg["lease_ttl"])
        return w.id

    def done(self, actor, evidence=None, baton=""):
        w = self._must_hold(actor)
        if w.cur["owner"] != role(actor):
            raise BatonError(f"step {w.step_name} belongs to {w.cur['owner']}")
        if not baton or not baton.strip():
            raise BatonError("a claim carries a baton: one or two lines for a "
                             "stranger on where things stand and what comes next")
        if isinstance(evidence, str):
            evidence = {"summary": evidence}
        with self.s.tx():
            for name, text in (evidence or {}).items():
                self._emit(w.id, actor, "evidence", step=w.step_name,
                           name=name, text=str(text))
            self._emit(w.id, actor, "baton", baton=baton)
        return self._try_close(w.id, actor)

    def jot(self, actor, text, baton=None):
        """An agent's journal line. Not progress: notes never close a step."""
        w = self._must_hold(actor)
        self._emit(w.id, actor, "note", text=text, baton=baton)
        return {"ok": True}

    def ask(self, actor, question, options=None):
        w = self._must_hold(actor)
        self._emit(w.id, actor, "ask", text=question, options=options or [])
        return {"ok": True, "note": "your lease is released; the work waits "
                "for the owner and any agent resumes it after the answer"}

    def handoff(self, actor, baton):
        w = self._must_hold(actor)
        if not baton or not baton.strip():
            raise BatonError("a handoff carries a baton")
        with self.s.tx():
            self._emit(w.id, actor, "baton", baton=baton)
            self._emit(w.id, actor, "lease.released")
        return {"ok": True}

    def verdict(self, actor, approve, findings=(), baton=""):
        w = self._must_hold(actor)
        if w.cur["owner"] != "helper":
            raise BatonError(f"step {w.step_name} takes no verdict")
        findings = [f for f in findings if f and f.strip()]
        if not approve and not findings:
            raise BatonError("a rejection names findings the author can act on")
        sha = G.head(w.repo) or "-"
        self._emit(w.id, actor, "verdict", step=w.step_name, sha=sha,
                   approve=bool(approve), findings=findings)
        if baton:
            self._emit(w.id, actor, "baton", baton=baton)
        if not approve:
            return self._bounce(w, w.cur.get("on_reject", w.step_name),
                                findings, actor)
        return self._try_close(w.id, actor)

    def reopen(self, actor, to, reason):
        """Send the work back to an earlier step of your own role, with a
        reason. It counts as a bounce, and the reviewer sees it."""
        w = self._must_hold(actor)
        if not reason or not reason.strip():
            raise BatonError("a reopen names its reason")
        ti = w.step_index(to)
        if ti >= w.step:
            raise BatonError(f"reopen goes back: {to} is not before {w.step_name}")
        if w.route[ti]["owner"] != role(actor) or w.cur["owner"] != role(actor):
            raise BatonError("reopen moves between steps of your own role only")
        return self._bounce(w, to, [f"reopened by {actor}: {reason}"], actor, reopen=True)

    def mint(self, actor, title, ask, group="", route="standard", **kw):
        """Agent-minted work needs the owner's yes at its draft step. It
        inherits the repo and test settings of the work its author holds."""
        h = self.held(actor)
        if h:
            for k in ("repo", "test_cmd", "test_paths", "ci_mode"):
                kw.setdefault(k, getattr(h, k))
        return self.create(title, ask, group=group, route=route,
                           origin="agent", actor=actor, **kw)

    # ---- gates ---------------------------------------------------------

    def _try_close(self, wid, actor):
        w = self.get(wid)
        if w.done:
            return {"ok": True, "closed": None, "done": True}
        step = w.cur
        sha = G.head(w.repo) or "-"
        ctx = {"work": w, "step": step["step"], "repo": w.repo, "sha": sha,
               "evidence": w.evidence.get(step["step"], {})}
        results, fails, pend = [], [], []
        for g in step["gates"]:
            st, why, rec = G.check(g, ctx)
            results.append({"gate": g["kind"], "status": st, "why": why})
            if rec:
                self._emit(wid, actor, "gate.record", step=step["step"], **rec)
            if st == G.FAIL:
                fails.append(f"[{g['kind']}] {why}")
                break
            if st == G.PENDING:
                pend.append((g["kind"], why))
        if fails:
            if step["owner"] == "agent":
                self._emit(wid, actor, "claim.failed", step=step["step"],
                           reasons="\n".join(fails))
                return {"ok": False, "closed": None, "failures": fails,
                        "results": results}
            to = step.get("on_reject", step["step"])
            return dict(self._bounce(w, to, fails, actor), results=results)
        if pend:
            if step["owner"] == "agent":
                self._emit(wid, actor, "park", step=step["step"],
                           kinds=[k for k, _ in pend],
                           reasons=[why for _, why in pend])
            return {"ok": True, "closed": None,
                    "pending": [why for _, why in pend], "results": results}
        with self.s.tx():
            now = self.get(wid)
            if now.done or now.step != w.step:
                return {"ok": False, "closed": None,
                        "failures": ["the step moved while the gates ran; read the card"]}
            if role(actor) == step["owner"] and now.lease != actor:
                return {"ok": False, "closed": None,
                        "failures": ["your lease ended while the gates ran; take the work again"]}
            self._emit(wid, actor, "step.closed", step=step["step"], by=actor, sha=sha)
            action = FORGE_ON_CLOSE.get(step["step"])
            if action and w.repo:
                self._emit(wid, "baton", "forge.request", action=action,
                           branch=w.branch, sha=sha)
        after = self.get(wid)
        return {"ok": True, "closed": step["step"], "next": after.step_name,
                "next_owner": after.cur["owner"] if after.cur else None,
                "still_yours": after.lease == actor, "results": results}

    def _bounce(self, w, to, findings, actor, reopen=False):
        sha = G.head(w.repo) or "-"
        with self.s.tx():
            w = self.get(w.id)  # decide on the state inside the transaction
            self._emit(w.id, actor, "bounce", **{"from": w.step_name, "to": to,
                                                 "findings": findings, "sha": sha,
                                                 "reopen": reopen})
            if w.bounces + 1 > self.cfg["max_bounces"]:
                self._emit(w.id, "baton", "escalate", reason=(
                    f"bounced back to {to} {w.bounces + 1} times; last findings: "
                    + "; ".join(findings)))
        return {"ok": False, "bounced_to": to, "findings": findings}

    # ---- supervisor ----------------------------------------------------

    def tick(self):
        """Expire dead leases, nudge spinning agents, escalate what stays stuck.
        Returns the events it wrote."""
        out, now, c = [], self.now, self.cfg
        with self.s.tx():
            for w in self.works().values():
                if w.status != "active":
                    continue
                if now > w.lease_until:
                    out.append(self._emit(w.id, "baton", "lease.expired",
                                          holder=w.lease, step=w.step_name))
                    n = w.expiries.get(w.step_name, 0) + 1
                    if n >= c["max_expiries"]:
                        out.append(self._emit(w.id, "baton", "escalate", reason=(
                            f"step {w.step_name} lost its agent {n} times; "
                            f"last baton: {w.baton or '-'}")))
                    continue
                idle = now - w.last_progress
                spinning = idle > c["spin_after"] or w.calls > c["spin_calls"]
                if not spinning:
                    continue
                mins = int(idle // 60)
                if not w.nudged:
                    out.append(self._emit(w.id, "baton", "nudge", text=(
                        f"No step has closed for {mins} min and {w.calls} tool "
                        f"calls. Claim done with evidence, ask the owner, or "
                        f"hand off with a baton that names what blocks you.")))
                elif (now - w.nudged > c["spin_after"] / 2
                      or w.calls > 1.5 * c["spin_calls"]):
                    out.append(self._emit(w.id, "baton", "escalate", reason=(
                        f"no progress on step {w.step_name} for {mins} min / "
                        f"{w.calls} tool calls after a nudge; last baton: "
                        f"{w.baton or '-'}")))
        return out

    # ---- the owner's view ----------------------------------------------

    def inbox(self):
        now = self.now
        needs, moving, done = [], [], []
        for w in sorted(self.works().values(), key=lambda w: (-w.prio, w.created)):
            item = {"id": w.id, "title": w.title, "group": w.group,
                    "step": w.step_name, "pos": f"{min(w.step + 1, len(w.route))}/{len(w.route)}",
                    "status": w.status, "health": health(w, now, self.cfg),
                    "baton": w.baton, "age": now - (w.log[-1]["ts"] if w.log else w.created)}
            if w.done:
                done.append(item)
            elif w.escalation:
                needs.append(dict(item, kind="stuck", text=w.escalation,
                                  actions=["resume", "pause"]))
            elif w.question:
                needs.append(dict(item, kind="question", text=w.question["text"],
                                  options=w.question["options"], actions=["answer"]))
            elif w.needs_owner():
                ev = w.evidence.get(w.step_name, {})
                pend = (w.parked or {}).get("reasons", [])
                text = "; ".join(f"{k}: {v[:200]}" for k, v in ev.items()) or w.baton
                if w.cur["owner"] == "human":
                    text = f"{w.cur['goal']} Baton: {w.baton}"
                needs.append(dict(item, kind="approve", text=text, pending=pend,
                                  actions=["approve", "reject"]))
            else:
                moving.append(item)
        return {"needs": needs, "moving": moving, "done": done}


def health(w, now, cfg):
    """One word the owner reads at a glance."""
    if w.done:
        return "done"
    if w.escalation:
        return "stuck"
    if w.needs_owner():
        return "you"
    if w.paused:
        return "paused"
    if w.parked:
        return "waiting"
    if w.nudged:
        return "slow"
    if w.status == "ready":
        return "queued"
    return "ok"
