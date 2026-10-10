"""The engine: tickets, attempts, evidence, handovers, gates, leases, owner verbs.

Every mutation appends an event and updates the view tables in one
transaction. Workers reach the engine with an attempt id and a token;
a stale token is refused, so a worker that lost its lease cannot write.
"""

from __future__ import annotations

import json
import secrets
import time
from typing import Any

from .routes import Route, Step
from .store import Store

HANDOVER_FIELDS = ("done", "remaining", "blockers", "files", "next")

EVIDENCE_SHAPE: dict[str, dict[str, type]] = {
    "plan": {"criteria": list, "tests": list, "files": list},
    "design": {"files": list, "interfaces": list},
    "commit": {"sha": str},
    "test_run": {"cmd": str, "exit": int, "sha": str},
    "test_change": {"why": str},
    "review": {"verdict": str, "findings": list},
    "retro": {"slow": list, "change": list},
    "note": {"text": str},
}
NONEMPTY: dict[str, tuple[str, ...]] = {
    "plan": ("criteria", "tests"),
    "design": ("files",),
    "commit": ("sha",),
    "test_change": ("why",),
    "retro": ("change",),
    "note": ("text",),
}
OWNER_ONLY = {"decision", "ci"}


class HarnessError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


def _loads(text: str | None, default):
    if not text:
        return default
    return json.loads(text)


class Engine:
    def __init__(self, routes: dict[str, Route], repo=None, db: str = ":memory:", clock=None):
        self.routes = routes
        self.repo = repo
        self.store = Store(db)
        self.clock = clock or time.time

    def close(self):
        self.store.close()

    def __del__(self):
        self.close()

    # ------------------------------------------------------------ helpers
    def now(self) -> float:
        return float(self.clock())

    def _row(self, ticket_id: str) -> dict:
        t = self.store.one("select * from ticket where id=?", ticket_id)
        if t is None:
            raise HarnessError("no_ticket", f"no ticket {ticket_id}")
        return t

    def _route(self, t: dict) -> Route:
        return self.routes[t["route"]]

    def _step(self, t: dict) -> Step:
        return self._route(t).step(t["step"])

    def _round(self, t: dict) -> int:
        return _loads(t["rounds"], {}).get(t["step"], 1)

    def _update(self, ticket_id: str, **fields):
        fields["updated"] = self.now()
        cols = ", ".join(f"{k}=?" for k in fields)
        self.store.run(f"update ticket set {cols} where id=?", *fields.values(), ticket_id)

    def _event(self, ticket: str | None, name: str, **body):
        self.store.event(self.now(), ticket, name, **body)

    def _active_attempt(self, ticket_id: str) -> dict | None:
        return self.store.one("select * from attempt where ticket=? and outcome is null", ticket_id)

    def _latest(self, ticket_id: str, step: str, kind: str, rnd: int | None = None) -> dict | None:
        if rnd is None:
            row = self.store.one(
                "select * from evidence where ticket=? and step=? and kind=? order by id desc limit 1",
                ticket_id, step, kind)
        else:
            row = self.store.one(
                "select * from evidence where ticket=? and step=? and kind=? and round=? order by id desc limit 1",
                ticket_id, step, kind, rnd)
        if row:
            row["body"] = json.loads(row["body"])
        return row

    def _last_handover(self, ticket_id: str, step: str) -> dict | None:
        return self.store.one(
            "select * from handover where ticket=? and step=? order by id desc limit 1", ticket_id, step)

    def _enter_step(self, t: dict, target: str, detail: str | None = None):
        """Move a ticket to a step, to done, or to hold. Keeps the step on hold."""
        if target == "done":
            self._update(t["id"], step="done", state="done", held_for=None, held_detail=None)
            self._event(t["id"], "done")
            return
        if target == "hold":
            self._update(t["id"], state="held", held_for="stuck", held_detail=detail or "")
            self._event(t["id"], "held", reason="stuck", detail=detail or "", step=t["step"])
            return
        route = self._route(t)
        step = route.step(target)
        rounds = _loads(t["rounds"], {})
        rounds[target] = rounds.get(target, 0) + 1
        if step.owner == "human":
            self._update(t["id"], step=target, rounds=json.dumps(rounds), attempts_on_step=0,
                         state="held", held_for="decision", held_detail=detail or step.brief)
            self._event(t["id"], "step_entered", step=target, round=rounds[target])
            self._event(t["id"], "held", reason="decision", step=target, detail=detail or "")
        else:
            self._update(t["id"], step=target, rounds=json.dumps(rounds), attempts_on_step=0,
                         state="open", held_for=None, held_detail=None)
            self._event(t["id"], "step_entered", step=target, round=rounds[target])

    def _end_attempt(self, a: dict, outcome: str):
        self.store.run("update attempt set ended=?, outcome=? where id=?", self.now(), outcome, a["id"])
        self._event(a["ticket"], "attempt_ended", attempt=a["id"], step=a["step"], outcome=outcome)

    def _reopen(self, t: dict):
        """After an attempt ends with no verdict: open, pause, or hold on exhausted attempts."""
        t = self._row(t["id"])
        step = self._step(t)
        if t["held_for"] == "pause_requested":
            self._update(t["id"], state="paused", held_for=None)
            self._event(t["id"], "paused")
            return
        if t["attempts_on_step"] >= step.max_attempts:
            self._enter_step(t, "hold", f"step {step.name} used {t['attempts_on_step']} attempts, its limit")
            return
        self._update(t["id"], state="open")

    def _synth_handover(self, a: dict, reason: str):
        """Write the handover a dead worker left out, from facts the store and the branch hold."""
        t = self._row(a["ticket"])
        kinds = [r["kind"] for r in self.store.all(
            "select kind from evidence where attempt=? order by id", a["id"])]
        commits = []
        if self.repo and a["start_sha"] and t["branch"]:
            try:
                commits = self.repo.commits_between(a["start_sha"], self.repo.tip(t["branch"]))
            except Exception:
                commits = []
        done = f"evidence filed: {', '.join(kinds) or 'none'}; commits on the branch since the attempt began: {len(commits)}"
        remaining = f"unknown: the attempt ended by {reason} and left no handover; read the branch diff and the evidence list"
        self.store.run(
            "insert into handover(ticket, step, attempt, done, remaining, blockers, files, next, synthesized, created) values(?,?,?,?,?,?,?,?,?,?)",
            t["id"], a["step"], a["id"], done, remaining, "", "", "compare the branch with the step's definition of done", 1, self.now())
        self._event(t["id"], "handover_synthesized", attempt=a["id"], reason=reason)

    def _expire(self, a: dict, outcome: str):
        self._synth_handover(a, outcome)
        self._end_attempt(a, outcome)
        t = self._row(a["ticket"])
        self._update(t["id"], stalls=t["stalls"] + 1)
        self._reopen(t)

    def _auth(self, attempt_id: int, token: str, verb: str, progress: bool = True) -> tuple[dict, dict]:
        a = self.store.one("select * from attempt where id=?", attempt_id)
        if a is None:
            raise HarnessError("no_attempt", f"no attempt {attempt_id}")
        if a["outcome"] is not None:
            raise HarnessError("stale_lease", f"attempt {attempt_id} ended with outcome {a['outcome']}; stop")
        if not secrets.compare_digest(a["token"], token or ""):
            raise HarnessError("stale_lease", f"the token does not match attempt {attempt_id}; stop")
        now = self.now()
        if a["lease_until"] < now:
            self._expire(a, "expired")
            raise HarnessError("stale_lease", f"attempt {attempt_id} lost its lease; stop")
        t = self._row(a["ticket"])
        step = self._step(t)
        self.store.run(
            "update attempt set lease_until=?, calls=calls+1, last_verb=?, last_progress=? where id=?",
            now + step.lease_seconds, verb, now if progress else a["last_progress"], a["id"])
        a = self.store.one("select * from attempt where id=?", attempt_id)
        return a, t

    # ------------------------------------------------------------ tickets
    def mint(self, ticket_id: str, goal: str, route: str, group: str | None = None,
             branch: str | None = None, test_cmd: str | None = None,
             test_paths: list[str] | None = None, priority: int = 0) -> dict:
        if route not in self.routes:
            raise HarnessError("no_route", f"no route {route}; routes: {sorted(self.routes)}")
        if self.store.one("select id from ticket where id=?", ticket_id):
            raise HarnessError("exists", f"ticket {ticket_id} exists")
        if not goal.strip():
            raise HarnessError("thin_ask", "a ticket needs a goal")
        r = self.routes[route]
        branch = branch or f"ticket/{ticket_id}"
        base_sha = None
        if self.repo is not None:
            try:
                base_sha = self.repo.tip(branch)
            except Exception as e:
                raise HarnessError("no_branch", f"branch {branch} does not exist: {e}")
        with self.store.tx():
            now = self.now()
            self.store.run(
                "insert into ticket(id, grp, route, goal, branch, base_sha, test_cmd, test_paths, step, state, priority, created, updated)"
                " values(?,?,?,?,?,?,?,?,?,?,?,?,?)",
                ticket_id, group, route, goal, branch, base_sha, test_cmd or r.test_cmd,
                json.dumps(test_paths if test_paths is not None else r.test_paths),
                r.first().name, "open", priority, now, now)
            self._event(ticket_id, "minted", route=route, group=group, branch=branch)
            t = self._row(ticket_id)
            self._enter_step(t, r.first().name)
        return self.ticket(ticket_id)

    def ticket(self, ticket_id: str) -> dict:
        t = self._row(ticket_id)
        t["fails"] = _loads(t["fails"], {})
        t["rounds"] = _loads(t["rounds"], {})
        t["notes"] = _loads(t["notes"], [])
        t["test_paths"] = _loads(t["test_paths"], [])
        a = self._active_attempt(ticket_id)
        t["attempt"] = {k: a[k] for k in ("id", "step", "role", "worker", "started", "lease_until", "last_progress", "calls", "handover_requested")} if a else None
        return t

    def tickets(self) -> list[dict]:
        return [self.ticket(r["id"]) for r in self.store.all("select id from ticket order by priority desc, created")]

    # ------------------------------------------------------------ attempts
    def claim(self, ticket_id: str, worker: str = "worker") -> dict:
        with self.store.tx():
            t = self._row(ticket_id)
            if t["state"] != "open":
                raise HarnessError("not_open", f"ticket {ticket_id} is {t['state']}")
            if self._active_attempt(ticket_id):
                raise HarnessError("busy", f"ticket {ticket_id} has an active attempt")
            step = self._step(t)
            now = self.now()
            start_sha = None
            if self.repo is not None and t["branch"]:
                try:
                    start_sha = self.repo.tip(t["branch"])
                except Exception:
                    start_sha = None
            aid = self.store.run(
                "insert into attempt(ticket, step, round, role, worker, token, started, start_sha, lease_until, last_progress)"
                " values(?,?,?,?,?,?,?,?,?,?)",
                ticket_id, step.name, self._round(t), step.owner, worker, secrets.token_hex(8),
                now, start_sha, now + step.lease_seconds, now)
            self._update(ticket_id, state="active", attempts_on_step=t["attempts_on_step"] + 1)
            self._event(ticket_id, "attempt_opened", attempt=aid, step=step.name, worker=worker,
                        number=t["attempts_on_step"] + 1, of=step.max_attempts)
            a = self.store.one("select * from attempt where id=?", aid)
        return {"attempt": aid, "token": a["token"], "ticket": ticket_id, "step": step.name,
                "role": step.owner, "briefing": self.briefing(aid)}

    def status(self, attempt_id: int, token: str) -> dict:
        with self.store.tx():
            a, t = self._auth(attempt_id, token, "status", progress=False)
            return self._status(a, t)

    def _status(self, a: dict, t: dict) -> dict:
        step = self._step(t)
        rnd = self._round(t)
        filed = [r["kind"] for r in self.store.all(
            "select kind from evidence where ticket=? and step=? and round=? order by id", t["id"], step.name, rnd)]
        missing = [k for k in step.requires if k not in filed]
        flags = []
        if a["handover_requested"] or t["held_for"] == "pause_requested":
            flags.append("hand_over_now")
        return {
            "header": f"ticket {t['id']} · step {step.name} · attempt {t['attempts_on_step']} of {step.max_attempts} · branch {t['branch']}",
            "attempt": a["id"], "ticket": t["id"], "step": step.name, "role": step.owner,
            "gate": step.gate, "requires": step.requires, "filed": filed, "missing": missing,
            "closes_when": self._closes_when(t, step),
            "lease_seconds_left": max(0, int(a["lease_until"] - self.now())),
            "flags": flags,
        }

    def _closes_when(self, t: dict, step: Step) -> list[str]:
        lines = []
        if step.gate == "mechanical":
            lines.append(f"evidence on file for this step: {', '.join(step.requires)}")
        elif step.gate == "red":
            lines.append(f"a commit on {t['branch']} is filed as evidence kind=commit")
            lines.append(f"the commit changes a file under {', '.join(_loads(t['test_paths'], []))}")
            lines.append(f"`{t['test_cmd']}` at that commit FAILS, in a clean checkout")
        elif step.gate == "green":
            lines.append(f"a commit on {t['branch']} is filed as evidence kind=commit")
            lines.append(f"`{t['test_cmd']}` at that commit PASSES, in a clean checkout")
            lines.append("the test files from the test step are unchanged, or a test_change evidence says why")
        elif step.gate == "review":
            lines.append("one evidence kind=review with verdict approve or request_changes, and findings")
            lines.append("filed by an attempt that made no commit on this ticket")
        elif step.gate == "human":
            lines.append("the owner decides in the inbox")
        return lines

    def briefing(self, attempt_id: int) -> str:
        a = self.store.one("select * from attempt where id=?", attempt_id)
        if a is None:
            raise HarnessError("no_attempt", f"no attempt {attempt_id}")
        t = self._row(a["ticket"])
        step = self._step(t)
        rnd = self._round(t)
        out = [f"# ticket {t['id']} · step {step.name} · attempt {t['attempts_on_step']} of {step.max_attempts} · branch {t['branch']}"]
        out += ["", "## Goal", t["goal"].strip()]
        out += ["", "## Your step", step.brief or step.name]
        out += ["", "## This step closes when"] + [f"- {line}" for line in self._closes_when(t, step)]
        filed = self.store.all(
            "select kind, body from evidence where ticket=? and step=? and round=? order by id", t["id"], step.name, rnd)
        if filed:
            out += ["", "## Evidence already filed on this step"] + [f"- {r['kind']}: {r['body'][:200]}" for r in filed]
        h = self._last_handover(t["id"], step.name)
        if h:
            tag = "synthesized by the harness" if h["synthesized"] else f"attempt {h['attempt']}"
            out += ["", f"## Last handover on this step ({tag})"]
            for f in HANDOVER_FIELDS:
                if h[f]:
                    out.append(f"- {f}: {h[f]}")
        gr = self.store.one(
            "select verdict, detail from gate_result where ticket=? and step=? order by id desc limit 1", t["id"], step.name)
        if gr and gr["verdict"] != "pass":
            out += ["", f"## Last gate result on this step: {gr['verdict']}", (gr["detail"] or "")[:1500]]
        if step.owner == "helper":
            out += self._reviewer_context(t)
        notes = _loads(t["notes"], [])
        if notes:
            out += ["", "## Notes"] + [f"- {n['who']}: {n['text']}" for n in notes[-8:]]
        out += ["", "## Verbs",
                "harness_status · harness_evidence · harness_handover · harness_done · harness_ask · harness_note",
                "", "## Rules",
                "File evidence as you go. Call harness_done to request the gate when the step closes.",
                "If you cannot finish, call harness_handover with done, remaining, blockers, files, next, and stop.",
                "If a decision is the owner's, call harness_ask and stop.",
                f"Work on branch {t['branch']} and push nowhere else.",
                "", "## Budget",
                f"lease {step.lease_seconds // 60} min, renewed by every verb · a stall of {step.progress_seconds // 60} min without new evidence ends the attempt"]
        return "\n".join(out)

    def _reviewer_context(self, t: dict) -> list[str]:
        out = []
        plan = self._latest(t["id"], "draft", "plan")
        if plan:
            out += ["", "## The plan", json.dumps(plan["body"], indent=1)[:2000]]
        commit = self._latest(t["id"], "implement", "commit")
        if commit and self.repo and t["base_sha"]:
            try:
                diff = self.repo.diff(t["base_sha"], commit["body"]["sha"])
            except Exception as e:
                diff = f"diff unavailable: {e}"
            out += ["", f"## The diff ({t['base_sha'][:10]}..{commit['body']['sha'][:10]})", "```", diff, "```"]
        return out

    def evidence(self, attempt_id: int, token: str, kind: str, body: dict) -> dict:
        with self.store.tx():
            a, t = self._auth(attempt_id, token, f"evidence:{kind}")
            step = self._step(t)
            if kind in OWNER_ONLY:
                raise HarnessError("owner_only", f"evidence kind {kind} comes from the owner or CI, not an attempt")
            shape = EVIDENCE_SHAPE.get(kind)
            if shape is None:
                raise HarnessError("unknown_kind", f"unknown evidence kind {kind}; kinds: {sorted(EVIDENCE_SHAPE)}")
            if not isinstance(body, dict):
                raise HarnessError("bad_shape", "body must be an object")
            for field, typ in shape.items():
                if field not in body:
                    raise HarnessError("bad_shape", f"{kind} needs {field}")
                if typ is int and isinstance(body[field], bool) or not isinstance(body[field], typ):
                    raise HarnessError("bad_shape", f"{kind}.{field} must be {typ.__name__}")
            for field in NONEMPTY.get(kind, ()):
                if not body[field]:
                    raise HarnessError("bad_shape", f"{kind}.{field} must not be empty")
            verified, detail = None, None
            if kind == "review":
                if a["role"] != "helper":
                    raise HarnessError("not_reviewer", "only a review step's attempt files a review")
                if body["verdict"] not in ("approve", "request_changes"):
                    raise HarnessError("bad_shape", "review.verdict is approve or request_changes")
                own = self.store.one(
                    "select id from evidence where ticket=? and kind='commit' and attempt=?", t["id"], a["id"])
                if own:
                    raise HarnessError("own_work", "an attempt that committed on this ticket cannot review it")
            if kind == "commit" and self.repo is not None:
                if not self.repo.commit_exists(t["branch"], body["sha"]):
                    raise HarnessError("no_such_commit", f"{body['sha']} is not on branch {t['branch']}")
                verified, detail = "yes", f"on {t['branch']}"
            eid = self.store.run(
                "insert into evidence(ticket, step, round, attempt, kind, body, verified, detail, created) values(?,?,?,?,?,?,?,?,?)",
                t["id"], step.name, self._round(t), a["id"], kind, json.dumps(body), verified, detail, self.now())
            self._event(t["id"], "evidence_filed", attempt=a["id"], step=step.name, kind=kind, evidence=eid)
            s = self._status(a, t)
            s["evidence"] = eid
            return s

    def handover(self, attempt_id: int, token: str, **fields) -> dict:
        with self.store.tx():
            a, t = self._auth(attempt_id, token, "handover")
            clean = {f: str(fields.get(f) or "").strip() for f in HANDOVER_FIELDS}
            if not clean["done"] and not clean["remaining"]:
                raise HarnessError("thin_handover", "a handover says what is done or what remains")
            self.store.run(
                "insert into handover(ticket, step, attempt, done, remaining, blockers, files, next, synthesized, created) values(?,?,?,?,?,?,?,?,?,?)",
                t["id"], a["step"], a["id"], clean["done"], clean["remaining"], clean["blockers"], clean["files"], clean["next"], 0, self.now())
            self._event(t["id"], "handover", attempt=a["id"], step=a["step"])
            self._end_attempt(a, "handover")
            self._reopen(t)
            return {"ok": True, "attempt": a["id"], "outcome": "handover", "message": "handover filed; stop now"}

    def done(self, attempt_id: int, token: str) -> dict:
        with self.store.tx():
            a, t = self._auth(attempt_id, token, "done")
            step = self._step(t)
            self._event(t["id"], "gating", attempt=a["id"], step=step.name)
            verdict, detail = self._gate(t, step)
            self.store.run(
                "insert into gate_result(ticket, step, attempt, verdict, detail, created) values(?,?,?,?,?,?)",
                t["id"], step.name, a["id"], verdict, detail, self.now())
            self._event(t["id"], "gate", attempt=a["id"], step=step.name, verdict=verdict, detail=detail[:500])
            next_step = None
            if verdict == "pass":
                self._end_attempt(a, "passed")
                next_step = step.on_pass
                self._enter_step(t, step.on_pass)
            elif verdict == "fail":
                self._end_attempt(a, "failed")
                fails = _loads(t["fails"], {})
                fails[step.name] = fails.get(step.name, 0) + 1
                self._update(t["id"], fails=json.dumps(fails))
                t = self._row(t["id"])
                if fails[step.name] > step.max_fails:
                    next_step = "hold"
                    self._enter_step(t, "hold", f"gate {step.name} failed {fails[step.name]} times: {detail[:300]}")
                else:
                    next_step = step.on_fail
                    self.store.run(
                        "insert into handover(ticket, step, attempt, done, remaining, blockers, files, next, synthesized, created) values(?,?,?,?,?,?,?,?,?,?)",
                        t["id"], step.on_fail if step.on_fail != "hold" else step.name, a["id"],
                        f"attempt {a['id']} requested the {step.name} gate", f"the gate failed: {detail[:1200]}", "", "", "fix what the gate names, then request it again", 1, self.now())
                    self._enter_step(t, step.on_fail, detail)
            else:  # error: the verifier could not run; no fail is counted
                self._end_attempt(a, "error")
                self.store.run(
                    "insert into handover(ticket, step, attempt, done, remaining, blockers, files, next, synthesized, created) values(?,?,?,?,?,?,?,?,?,?)",
                    t["id"], step.name, a["id"], "the gate was requested", f"the gate could not run: {detail[:800]}", "", "", "request the gate again", 1, self.now())
                self._reopen(t)
                next_step = step.name
            return {"verdict": verdict, "detail": detail, "next_step": next_step, "message": "the attempt is over; stop now"}

    def ask(self, attempt_id: int, token: str, question: str) -> dict:
        with self.store.tx():
            a, t = self._auth(attempt_id, token, "ask")
            if not question.strip():
                raise HarnessError("thin_ask", "a question needs words")
            self._end_attempt(a, "asked")
            self._update(t["id"], state="held", held_for="question", held_detail=question.strip())
            self._event(t["id"], "held", reason="question", step=a["step"], detail=question.strip())
            return {"ok": True, "outcome": "asked", "message": "the question is in the owner's inbox; stop now"}

    def note(self, attempt_id: int, token: str, text: str) -> dict:
        with self.store.tx():
            a, t = self._auth(attempt_id, token, "note", progress=False)
            self._add_note(t, f"attempt {a['id']}", text)
            return self._status(a, t)

    def heartbeat(self, attempt_id: int, token: str) -> dict:
        with self.store.tx():
            a, t = self._auth(attempt_id, token, "heartbeat", progress=False)
            return {"ok": True, "flags": self._status(a, t)["flags"]}

    def worker_exited(self, attempt_id: int) -> dict | None:
        """The supervisor saw the worker process end. An open attempt ends as crashed."""
        with self.store.tx():
            a = self.store.one("select * from attempt where id=?", attempt_id)
            if a is None or a["outcome"] is not None:
                return None
            self._expire(a, "crashed")
            return self.ticket(a["ticket"])

    def info(self, attempt_id: int) -> dict:
        a = self.store.one("select * from attempt where id=?", attempt_id)
        if a is None:
            raise HarnessError("no_attempt", f"no attempt {attempt_id}")
        t = self._row(a["ticket"])
        return {"attempt": a["id"], "ticket": t["id"], "step": a["step"], "role": a["role"],
                "branch": t["branch"], "open": a["outcome"] is None, "outcome": a["outcome"]}

    def can_stop(self, attempt_id: int) -> tuple[bool, str]:
        a = self.store.one("select * from attempt where id=?", attempt_id)
        if a is None:
            return True, f"no attempt {attempt_id}"
        if a["outcome"] is not None:
            return True, f"attempt {attempt_id} ended: {a['outcome']}"
        return False, (f"attempt {attempt_id} on step {a['step']} is open. Call harness_done if the step closes, "
                       f"harness_handover (done, remaining, blockers, files, next) if it does not, or harness_ask for the owner. Then stop.")

    # ------------------------------------------------------------ gates
    def _gate(self, t: dict, step: Step) -> tuple[str, str]:
        rnd = self._round(t)
        ev = {k: self._latest(t["id"], step.name, k, rnd) for k in step.requires}
        missing = [k for k, v in ev.items() if v is None]
        if missing:
            return "fail", f"missing evidence on this step: {', '.join(missing)}"
        if step.gate == "mechanical":
            return "pass", f"required evidence on file: {', '.join(step.requires)}"
        if step.gate in ("red", "green"):
            if self.repo is None:
                return "error", "no repository configured for the gate"
            sha = ev["commit"]["body"]["sha"]
            paths = _loads(t["test_paths"], [])
            try:
                code, out = self.repo.run_at(sha, t["test_cmd"])
            except Exception as e:
                return "error", f"the verifier could not run the tests: {e}"
            if step.gate == "red":
                try:
                    changed = self.repo.changed_files(t["base_sha"], sha, paths)
                except Exception as e:
                    return "error", f"the verifier could not diff: {e}"
                if not changed:
                    return "fail", f"no file under {paths} changed between {t['base_sha'][:10]} and {sha[:10]}; the step adds a test"
                if code == 0:
                    return "fail", f"`{t['test_cmd']}` passes at {sha[:10]}; a new test must fail before the implementation"
                return "pass", f"`{t['test_cmd']}` fails at {sha[:10]} (exit {code}); tests changed: {[p for _, p in changed]}"
            if code != 0:
                return "fail", f"`{t['test_cmd']}` fails at {sha[:10]} (exit {code}):\n{out[-1500:]}"
            tcommit = self._latest(t["id"], "test", "commit")
            if tcommit:
                try:
                    tampered = [(s, p) for s, p in self.repo.changed_files(tcommit["body"]["sha"], sha, paths) if s in "MD"]
                except Exception as e:
                    return "error", f"the verifier could not diff: {e}"
                if tampered and not ev.get("test_change") and not self._latest(t["id"], step.name, "test_change", rnd):
                    return "fail", f"test files from the test step changed without a test_change evidence: {tampered}"
            return "pass", f"`{t['test_cmd']}` passes at {sha[:10]}"
        if step.gate == "review":
            body = ev["review"]["body"]
            if body["verdict"] == "approve":
                return "pass", "review: approve" + (f"; notes: {body['findings']}" if body["findings"] else "")
            return "fail", f"review requested changes: {json.dumps(body['findings'])}"
        if step.gate == "human":
            return "hold", "the owner decides"
        return "error", f"unknown gate {step.gate}"

    # ------------------------------------------------------------ owner verbs
    def _add_note(self, t: dict, who: str, text: str):
        if not text.strip():
            raise HarnessError("thin_note", "a note needs words")
        notes = _loads(t["notes"], [])
        notes.append({"who": who, "text": text.strip(), "ts": self.now()})
        self._update(t["id"], notes=json.dumps(notes))
        self._event(t["id"], "note", who=who, text=text.strip())

    def owner_note(self, ticket_id: str, text: str) -> dict:
        with self.store.tx():
            self._add_note(self._row(ticket_id), "owner", text)
        return self.ticket(ticket_id)

    def decide(self, ticket_id: str, verdict: str, note: str = "") -> dict:
        """The owner passes or fails a human gate."""
        with self.store.tx():
            t = self._row(ticket_id)
            if not (t["state"] == "held" and t["held_for"] == "decision"):
                raise HarnessError("no_decision", f"ticket {ticket_id} waits on no decision ({t['state']}, {t['held_for']})")
            if verdict not in ("approve", "reject"):
                raise HarnessError("bad_verdict", "verdict is approve or reject")
            step = self._step(t)
            self.store.run("insert into decision(ticket, step, verdict, note, created) values(?,?,?,?,?)",
                           t["id"], step.name, verdict, note, self.now())
            gv = "pass" if verdict == "approve" else "fail"
            self.store.run("insert into gate_result(ticket, step, attempt, verdict, detail, created) values(?,?,?,?,?,?)",
                           t["id"], step.name, None, gv, f"owner: {verdict} {note}".strip(), self.now())
            self._event(t["id"], "decision", step=step.name, verdict=verdict, note=note)
            if verdict == "approve":
                if step.on_pass == "done" and self.repo is not None and t["branch"]:
                    try:
                        pr = self.repo.open_pr(t["branch"], t["id"], t["goal"])
                        self.repo.enable_auto_merge(pr)
                        self._event(t["id"], "pr_opened", pr=pr)
                    except Exception as e:
                        self._event(t["id"], "pr_failed", error=str(e))
                self._enter_step(t, step.on_pass)
            else:
                fails = _loads(t["fails"], {})
                fails[step.name] = fails.get(step.name, 0) + 1
                self._update(t["id"], fails=json.dumps(fails))
                t = self._row(t["id"])
                if note:
                    self._add_note(t, "owner", note)
                if fails[step.name] > step.max_fails:
                    self._enter_step(t, "hold", f"the owner rejected {fails[step.name]} times")
                else:
                    self.store.run(
                        "insert into handover(ticket, step, attempt, done, remaining, blockers, files, next, synthesized, created) values(?,?,?,?,?,?,?,?,?,?)",
                        t["id"], step.on_fail, None, f"the owner reviewed at step {step.name}", f"the owner rejected: {note or 'no note'}", "", "", "address the owner's note", 1, self.now())
                    self._enter_step(t, step.on_fail, note)
        return self.ticket(ticket_id)

    def answer(self, ticket_id: str, text: str) -> dict:
        """The owner answers a question an attempt asked; the step reopens with the answer as a note."""
        with self.store.tx():
            t = self._row(ticket_id)
            if not (t["state"] == "held" and t["held_for"] == "question"):
                raise HarnessError("no_question", f"ticket {ticket_id} asked nothing")
            self._add_note(t, "owner", f"answer to '{t['held_detail']}': {text}")
            self._update(t["id"], state="open", held_for=None, held_detail=None)
            self._event(t["id"], "reopened", reason="answered")
        return self.ticket(ticket_id)

    def retry(self, ticket_id: str, note: str = "") -> dict:
        """The owner reopens a stuck ticket on its step, with fresh counters."""
        with self.store.tx():
            t = self._row(ticket_id)
            if not (t["state"] == "held" and t["held_for"] == "stuck"):
                raise HarnessError("not_stuck", f"ticket {ticket_id} is not stuck")
            fails = _loads(t["fails"], {})
            fails[t["step"]] = 0
            self._update(t["id"], fails=json.dumps(fails))
            if note:
                self._add_note(t, "owner", note)
            t = self._row(t["id"])
            self._event(t["id"], "reopened", reason="retry")
            self._enter_step(t, t["step"])
        return self.ticket(ticket_id)

    def pause(self, ticket_id: str) -> dict:
        with self.store.tx():
            t = self._row(ticket_id)
            if t["state"] == "active":
                a = self._active_attempt(ticket_id)
                self.store.run("update attempt set handover_requested=1 where id=?", a["id"])
                self._update(ticket_id, held_for="pause_requested")
                self._event(ticket_id, "pause_requested", attempt=a["id"])
            elif t["state"] in ("open", "held"):
                self._update(ticket_id, state="paused", held_detail=t["held_for"])
                self._event(ticket_id, "paused")
            else:
                raise HarnessError("not_pausable", f"ticket {ticket_id} is {t['state']}")
        return self.ticket(ticket_id)

    def resume(self, ticket_id: str) -> dict:
        with self.store.tx():
            t = self._row(ticket_id)
            if t["state"] != "paused":
                raise HarnessError("not_paused", f"ticket {ticket_id} is {t['state']}")
            step = self._step(t)
            if step.owner == "human" or t["held_detail"] in ("decision", "question", "stuck"):
                self._update(ticket_id, state="held", held_for=t["held_detail"] or "decision", held_detail=step.brief)
            else:
                self._update(ticket_id, state="open", held_for=None, held_detail=None)
            self._event(ticket_id, "resumed")
        return self.ticket(ticket_id)

    def ci(self, sha: str, status: str) -> None:
        with self.store.tx():
            row = self.store.one("select ticket, step from evidence where kind='commit' and body like ? order by id desc limit 1", f'%"{sha}%')
            self.store.run("insert into evidence(ticket, step, round, attempt, kind, body, verified, detail, created) values(?,?,?,?,?,?,?,?,?)",
                           row["ticket"] if row else None, row["step"] if row else "", 0, None, "ci", json.dumps({"sha": sha, "status": status}), "yes", "webhook", self.now())
            self._event(row["ticket"] if row else None, "ci", sha=sha, status=status)

    # ------------------------------------------------------------ views
    def inbox(self) -> list[dict]:
        cards = []
        for t in self.store.all("select * from ticket where state='held' order by updated"):
            step = self._step(t)
            card = {"ticket": t["id"], "goal": t["goal"], "step": t["step"], "reason": t["held_for"],
                    "detail": t["held_detail"] or "", "since": t["updated"], "group": t["grp"]}
            if t["held_for"] == "decision":
                card["actions"] = ["approve", "reject", "pause"]
                rv = self._latest(t["id"], "review", "review")
                gr = self.store.one("select verdict, detail from gate_result where ticket=? and step in ('implement','test') order by id desc limit 1", t["id"])
                commit = self._latest(t["id"], "implement", "commit")
                card["evidence"] = {
                    "review": rv["body"]["verdict"] if rv else None,
                    "last_gate": f"{gr['verdict']}: {gr['detail'][:120]}" if gr else None,
                    "commit": commit["body"]["sha"] if commit else None,
                }
                if commit and self.repo and t["base_sha"]:
                    try:
                        card["evidence"]["files"] = [p for _, p in self.repo.changed_files(t["base_sha"], commit["body"]["sha"], [])]
                    except Exception:
                        pass
            elif t["held_for"] == "question":
                card["actions"] = ["answer", "pause"]
            else:
                card["actions"] = ["retry", "note", "pause"]
                h = self._last_handover(t["id"], t["step"])
                card["handover"] = {f: h[f] for f in HANDOVER_FIELDS} if h else None
            cards.append(card)
        return cards

    def board(self) -> list[dict]:
        rows = []
        now = self.now()
        for t in self.tickets():
            step = None if t["step"] == "done" else self._route(t).step(t["step"])
            a = t["attempt"]
            rows.append({
                "ticket": t["id"], "group": t["grp"], "route": t["route"], "goal": t["goal"][:80],
                "step": t["step"], "state": t["state"], "held_for": t["held_for"],
                "steps": self._route(t).names(),
                "attempts": f"{t['attempts_on_step']}/{step.max_attempts}" if step else "",
                "fails": t["fails"].get(t["step"], 0) if step else 0, "stalls": t["stalls"],
                "holder": a["worker"] if a else None,
                "lease_left": int(a["lease_until"] - now) if a else None,
                "silent_for": int(now - a["last_progress"]) if a else None,
            })
        return rows

    def timeline(self, ticket_id: str) -> dict:
        t = self.ticket(ticket_id)
        events = self.store.all("select * from event where ticket=? order by seq", ticket_id)
        for e in events:
            e["body"] = json.loads(e["body"])
        evidence = self.store.all("select * from evidence where ticket=? order by id", ticket_id)
        for e in evidence:
            e["body"] = json.loads(e["body"])
        return {
            "ticket": t,
            "events": events,
            "evidence": evidence,
            "handovers": self.store.all("select * from handover where ticket=? order by id", ticket_id),
            "gates": self.store.all("select * from gate_result where ticket=? order by id", ticket_id),
            "attempts": self.store.all("select * from attempt where ticket=? order by id", ticket_id),
            "decisions": self.store.all("select * from decision where ticket=? order by id", ticket_id),
        }

    # ------------------------------------------------------------ supervisor
    def tick(self) -> dict:
        """Expire dead attempts, flag spinning ones, kill the ones past grace."""
        out = {"expired": [], "handover_requested": [], "kill": []}
        with self.store.tx():
            now = self.now()
            for a in self.store.all("select * from attempt where outcome is null"):
                t = self._row(a["ticket"])
                step = self._step(t)
                if a["lease_until"] < now:
                    self._expire(a, "expired")
                    out["expired"].append(a["id"])
                    continue
                silent = now - a["last_progress"]
                if step.progress_seconds and silent > step.progress_seconds * 1.5:
                    self._expire(a, "killed")
                    out["kill"].append(a["id"])
                elif step.progress_seconds and silent > step.progress_seconds and not a["handover_requested"]:
                    self.store.run("update attempt set handover_requested=1 where id=?", a["id"])
                    self._event(t["id"], "handover_requested", attempt=a["id"], silent_seconds=int(silent))
                    out["handover_requested"].append(a["id"])
        return out

    def ready(self) -> list[dict]:
        """Open tickets a worker can take now, one per group, by priority."""
        seen_groups = set()
        busy_groups = {r["grp"] for r in self.store.all(
            "select distinct t.grp as grp from ticket t join attempt a on a.ticket=t.id where a.outcome is null and t.grp is not null")}
        out = []
        for t in self.store.all("select * from ticket where state='open' order by priority desc, created"):
            g = t["grp"]
            if g is not None and (g in busy_groups or g in seen_groups):
                continue
            seen_groups.add(g)
            out.append(self.ticket(t["id"]))
        return out
