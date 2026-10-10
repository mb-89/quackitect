import json
import unittest

from hx import engine, processes
from hx.engine import Rejected
from hx.service import OWNER, SYSTEM, RecordingLauncher
from tests.helpers import FakeVerifier, mem_hx, run_feature_to, ticket


def snapshot(hx):
    return json.dumps(hx.state(), sort_keys=True, default=str)


class TestProcesses(unittest.TestCase):
    def test_builtin_processes_validate(self):
        for name in processes.BUILTIN:
            self.assertTrue(processes.validate(processes.BUILTIN[name]))

    def test_bad_route_rejected(self):
        bad = {"name": "x", "first": "a", "steps": {"a": {"next": "nope"}}}
        with self.assertRaises(ValueError):
            processes.validate(bad)


class TestFeatureFlow(unittest.TestCase):
    def test_low_risk_feature_runs_to_done(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        t = hx.state()["tickets"]["T-1"]
        self.assertEqual(t["step"], "design", "draft is skipped when criteria exist")
        self.assertEqual(t["history"][0]["note"], "skipped: gate already satisfied")
        run_feature_to(hx, "T-1", stop=None)
        t = hx.state()["tickets"]["T-1"]
        self.assertEqual(t["status"], "done")
        steps = [h["step"] for h in t["history"]]
        self.assertEqual(steps, ["draft", "design", "red", "green", "review", "accept", "land", "retro"])
        accept = [h for h in t["history"] if h["step"] == "accept"][0]
        self.assertEqual(accept["note"], "auto-approved by policy")
        self.assertEqual(hx.inbox(), [], "low risk needs no owner decision at all")

    def test_medium_risk_needs_design_and_accept_approval(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket(risk="medium"))
        hx.claim("w1", "worker")
        hx.submit("w1", "doc", sha="a" * 40, path="docs/design/T-1.md", scope=["textkit/slug"])
        r = hx.done("w1")
        self.assertIn("waiting for the owner", r["message"])
        st = hx.state()
        self.assertNotIn("w1", st["leases"], "a worker never holds a lease while waiting for a human")
        q = hx.inbox()[0]
        self.assertEqual((q["kind"], q["step"]), ("approval", "design"))
        self.assertEqual(st["tickets"]["T-1"]["scope"], ["textkit/slug"], "design evidence refines scope")
        hx.approve("T-1")
        self.assertEqual(hx.state()["tickets"]["T-1"]["step"], "red")
        run_feature_to(hx, "T-1", stop="accept")
        st = hx.state()
        self.assertEqual(st["tickets"]["T-1"]["run"]["status"], "waiting")
        q = hx.inbox()[0]
        self.assertIn("Review: approve by r1", q["summary"])
        hx.request_changes("T-1", "handle unicode too")
        t = hx.state()["tickets"]["T-1"]
        self.assertEqual((t["step"], t["run"]["visit"]), ("green", 2))
        self.assertIn("handle unicode too", t["run"]["notes"][0])


class TestFencingAndGates(unittest.TestCase):
    def test_gate_rejects_done_without_evidence_and_state_is_untouched(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        before = snapshot(hx)
        with self.assertRaises(Rejected) as cm:
            hx.done("w1")
        self.assertEqual(cm.exception.code, "gate")
        self.assertEqual(cm.exception.report[0]["status"], "missing")
        self.assertEqual(before, snapshot(hx))

    def test_failed_evidence_is_recorded_but_does_not_count(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        r = hx.submit("w1", "doc", sha="a" * 40, path="x.md", fail="design doc lacks sections: Risks")
        self.assertFalse(r["ok"])
        with self.assertRaises(Rejected) as cm:
            hx.done("w1")
        self.assertIn("lacks sections: Risks", cm.exception.message)

    def test_wrong_evidence_kind_for_step(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        with self.assertRaises(Rejected) as cm:
            hx.submit("w1", "tests_green", sha="c" * 40)
        self.assertEqual(cm.exception.code, "bad_kind")

    def test_expired_lease_fences_the_zombie(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        clk.advance(16 * 60)
        acts = hx.tick()
        self.assertTrue(any(a.startswith("expire T-1") for a in acts), acts)
        hx.claim("w2", "worker")
        with self.assertRaises(Rejected) as cm:
            hx.checkpoint("w1", done="late", next="x")
        self.assertEqual(cm.exception.code, "lease_lost")
        brief = hx.brief("w2")
        self.assertIn("HANDOVER: previous holder w1 lease expired", brief)
        self.assertEqual(hx.state()["tickets"]["T-1"]["run"]["epoch"], 2)

    def test_conditional_expire_loses_to_a_late_heartbeat(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        st = hx.state()
        run = st["tickets"]["T-1"]["run"]
        stale_seq, epoch = run["last_activity_seq"], run["epoch"]
        clk.advance(16 * 60)
        hx.heartbeat("w1")  # the agent was alive after all
        with self.assertRaises(Rejected) as cm:
            hx.store.append([{"type": "expire", "actor": SYSTEM, "ticket": "T-1",
                              "data": {"epoch": epoch, "last_activity_seq": stale_seq}}])
        self.assertEqual(cm.exception.code, "stale_expire")
        self.assertEqual(hx.state()["tickets"]["T-1"]["run"]["holder"], "w1")

    def test_brief_says_when_the_gate_is_already_satisfied_or_sessions_keep_dying(self):
        """Found by the fault-injected real pilot: a reviewer cut off after submitting made its successor
        redo the review; reviewers cut off early never checkpointed."""
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        run_feature_to(hx, "T-1", stop="review")
        hx.claim("r1", "reviewer")
        hx.submit("r1", "review", verdict="approve", ac={"AC1": "ok", "AC2": "ok"})
        hx.release("r1", involuntary=True, reason="cut off")  # e.g. turn cap hit right after submitting
        c = hx.claim("r2", "reviewer")
        self.assertIn("THE GATE IS ALREADY SATISFIED", c["brief"])
        hx.done("r2")
        self.assertEqual(hx.state()["tickets"]["T-1"]["step"], "land")
        hx.create_ticket(ticket("T-2"))
        hx.claim("w1", "worker", "T-2")
        hx.release("w1", involuntary=True, reason="cut off")
        self.assertIn("Earlier sessions on this step ended before finishing (1x)", hx.claim("w2", "worker", "T-2")["brief"])

    def test_double_claim_second_gets_other_work_or_rejected(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket("T-1"))
        hx.create_ticket(ticket("T-2"))
        a = hx.claim("w1", "worker")
        b = hx.claim("w2", "worker")
        self.assertNotEqual(a["ticket"], b["ticket"])
        with self.assertRaises(Rejected) as cm:
            hx.claim("w3", "worker")
        self.assertEqual(cm.exception.code, "no_work")
        with self.assertRaises(Rejected):
            hx.claim("w3", "worker", "T-1")

    def test_author_cannot_review(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        run_feature_to(hx, "T-1", stop="review")
        with self.assertRaises(Rejected) as cm:
            hx.claim("w1", "reviewer", "T-1")
        self.assertEqual(cm.exception.code, "separation")
        with self.assertRaises(Rejected):
            hx.claim("w1", "reviewer")  # no reviewable work for an author

    def test_review_must_cover_the_candidate(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        run_feature_to(hx, "T-1", stop="review")
        hx.claim("r1", "reviewer")
        with self.assertRaises(Rejected) as cm:
            hx.submit("r1", "review", sha="9" * 40, verdict="approve", ac={"AC1": "ok", "AC2": "ok"})
        self.assertEqual(cm.exception.code, "stale_review")
        r = hx.submit("r1", "review", verdict="approve", ac={"AC1": "ok"})
        self.assertFalse(r["ok"])
        self.assertIn("missing AC2", r["report"]["reason"])
        r = hx.submit("r1", "review", verdict="approve", ac={"AC1": "ok", "AC2": "fail:edge case"})
        self.assertFalse(r["ok"], "approve with a failing criterion is inconsistent")

    def test_owner_only_events(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket(risk="medium"))
        hx.claim("w1", "worker")
        hx.submit("w1", "doc", sha="a" * 40, path="d.md")
        hx.done("w1")
        qid = hx.inbox()[0]["id"]
        agent = {"kind": "agent", "id": "w1"}
        with self.assertRaises(Rejected) as cm:
            hx.answer(qid, "approve", actor=agent)
        self.assertEqual(cm.exception.code, "not_owner")
        with self.assertRaises(Rejected):
            hx.override("T-1", "because", actor=agent)
        with self.assertRaises(Rejected):
            hx.answer(qid, "approve", actor=SYSTEM)  # system may only apply defaults
        with self.assertRaises(Rejected):
            hx.override("T-1", "")  # owner, but no reason


class TestLoopsAndEscalation(unittest.TestCase):
    def test_review_changes_loop_hits_limit_and_escalates(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        run_feature_to(hx, "T-1", stop="review")
        for i in range(3):
            hx.claim(f"r{i}", "reviewer")
            hx.submit(f"r{i}", "review", verdict="changes", ac={"AC1": "ok", "AC2": "fail:no"},
                      findings=["AC2 missing"])
            hx.done(f"r{i}")
            t = hx.state()["tickets"]["T-1"]
            if t["run"]["status"] == "waiting":
                break
            self.assertEqual(t["step"], "green")
            self.assertIn("LAST REVIEW (changes", hx.brief(None, "T-1"))
            hx.claim("w1", "worker")
            hx.submit("w1", "tests_green", sha="c" * 40)
            hx.done("w1")
        t = hx.state()["tickets"]["T-1"]
        self.assertEqual((t["step"], t["run"]["status"], t["run"]["visit"]), ("green", "waiting", 4))
        q = hx.inbox()[0]
        self.assertEqual((q["kind"], q["reason"]), ("escalation", "loop"))
        self.assertEqual(q["options"], ["one_more", "takeover", "redesign", "cancel"])
        hx.answer(q["id"], "one_more")
        self.assertEqual(hx.state()["tickets"]["T-1"]["run"]["status"], "ready")

    def test_spin_gets_nudged_then_revoked_then_escalated(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        for i in range(3):
            hx.claim(f"w{i}", "worker")
            for _ in range(30):  # alive (heartbeats) but no progress
                clk.advance(9 * 60)
                hx.heartbeat(f"w{i}")
                acts = hx.tick()
                if any(a.startswith("revoke") for a in acts):
                    break
            st = hx.state()
            self.assertNotIn(f"w{i}", st["leases"])
            notices = st["tickets"]["T-1"]["notices"]
            self.assertTrue(any("No progress recorded" in n["text"] for n in notices))
        t = hx.state()["tickets"]["T-1"]
        self.assertEqual(t["run"]["status"], "waiting")
        q = hx.inbox()[0]
        self.assertEqual((q["kind"], q["reason"]), ("escalation", "stalled"))
        hx.answer(q["id"], "retry", text="try a smaller design")
        t = hx.state()["tickets"]["T-1"]
        self.assertEqual((t["run"]["status"], t["run"]["handovers"]), ("ready", 0))

    def test_takeover_reserves_step_for_owner(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        for i in range(3):
            hx.claim(f"w{i}", "worker")
            clk.advance(20 * 60)
            hx.tick()
        q = hx.inbox()[0]
        hx.answer(q["id"], "takeover")
        with self.assertRaises(Rejected) as cm:
            hx.claim("w9", "worker", "T-1")
        self.assertEqual(cm.exception.code, "reserved")
        hx.claim("owner", "worker", "T-1", actor=OWNER)
        self.assertEqual(hx.state()["tickets"]["T-1"]["run"]["holder"], "owner")


class TestQuestions(unittest.TestCase):
    def test_blocking_ask_releases_and_answer_resumes_with_context(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        r = hx.ask("w1", "Hyphenated words count as one?", options=["yes", "no"], note={"done": "wrote doc"})
        st = hx.state()
        self.assertNotIn("w1", st["leases"])
        self.assertEqual(st["tickets"]["T-1"]["run"]["status"], "waiting")
        hx.answer(r["qid"], "yes", text="like English prose")
        c = hx.claim("w2", "worker")
        self.assertIn("OWNER ANSWERED", c["brief"])
        self.assertIn("like English prose", c["brief"])
        self.assertIn("wrote doc", c["brief"])

    def test_default_applies_after_deadline(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        r = hx.ask("w1", "Use RFC 4180 quoting?", options=["yes", "no"], default="yes", deadline_s=3600)
        clk.advance(3601)
        acts = hx.tick()
        self.assertTrue(any("default" in a for a in acts), acts)
        q = hx.state()["questions"][r["qid"]]
        self.assertEqual((q["status"], q["answer"]["by"]), ("answered", "default"))

    def test_bad_default(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        with self.assertRaises(Rejected):
            hx.ask("w1", "?", options=["a", "b"], default="c")

    def test_nonblocking_answer_arrives_as_notice(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        r = hx.ask("w1", "Prefer snake_case?", options=["yes", "no"], blocking=False)
        self.assertIn("w1", hx.state()["leases"])
        hx.answer(r["qid"], "no")
        self.assertIn("NOTICE: Owner answered", hx.brief("w1"))


class TestOwnerControl(unittest.TestCase):
    def test_pause_all_revokes_and_blocks(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        hx.pause()
        st = hx.state()
        self.assertEqual(st["leases"], {})
        self.assertEqual(st["tickets"]["T-1"]["run"]["handovers"], 0, "owner pause is not the agent's fault")
        with self.assertRaises(Rejected) as cm:
            hx.claim("w1", "worker")
        self.assertEqual(cm.exception.code, "no_work")
        hx.resume()
        hx.claim("w1", "worker")

    def test_pause_ticket_and_cancel(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        hx.pause("T-1")
        with self.assertRaises(Rejected) as cm:
            hx.checkpoint("w1", done="x")
        self.assertIn(cm.exception.code, ("lease_lost", "paused"))
        hx.resume("T-1")
        hx.cancel("T-1")
        self.assertEqual(hx.state()["tickets"]["T-1"]["status"], "cancelled")

    def test_override_passes_gate_with_reason(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.override("T-1", "design discussed in person")
        t = hx.state()["tickets"]["T-1"]
        self.assertEqual(t["step"], "red")
        self.assertIn("OVERRIDE", t["history"][-1]["note"])

    def test_edit_notifies_holder(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        hx.edit("T-1", criteria=["only this"])
        self.assertIn("Owner edited the ticket", hx.brief("w1"))
        self.assertEqual(hx.state()["tickets"]["T-1"]["criteria"], [{"id": "AC1", "text": "only this"}])


class TestDepsGroupsLanding(unittest.TestCase):
    def test_dependency_opens_after_landing_not_after_retro(self):
        hx, clk = mem_hx()
        hx.import_spec({"group": {"id": "G-1", "title": "text tools"},
                        "tickets": [ticket("T-2", deps=["T-1"]), ticket("T-1")]})
        st = hx.state()
        self.assertEqual(st["tickets"]["T-2"]["status"], "queued")
        self.assertEqual(st["tickets"]["G-1"]["step"], "run")
        run_feature_to(hx, "T-1", stop="retro")
        self.assertEqual(hx.state()["tickets"]["T-2"]["status"], "open")
        run_feature_to(hx, "T-1", stop=None)
        run_feature_to(hx, "T-2", stop=None, worker="w2", reviewer="r2")
        g = hx.state()["tickets"]["G-1"]
        self.assertEqual(g["step"], "retro", "group run passes when all children are done")

    def test_land_conflict_routes_to_rebase(self):
        v = FakeVerifier()
        hx, clk = mem_hx(verifier=v)
        hx.create_ticket(ticket())
        run_feature_to(hx, "T-1", stop="land")
        v.land_fail = "merge conflict with main"
        hx.tick()
        t = hx.state()["tickets"]["T-1"]
        self.assertEqual(t["step"], "rebase")
        self.assertIn("merge conflict", hx.brief(None, "T-1"))
        run_feature_to(hx, "T-1", stop="retro")
        self.assertTrue(hx.state()["tickets"]["T-1"]["heads"]["merged"])

    def test_dependency_cycle_rejected(self):
        hx, clk = mem_hx()
        with self.assertRaises(Rejected):
            hx.import_spec({"tickets": [ticket("A", deps=["B"]), ticket("B", deps=["A"])]})


class TestDispatchAndNotify(unittest.TestCase):
    def test_dispatch_respects_capacity_scope_and_timeout(self):
        launcher = RecordingLauncher()
        hx, clk = mem_hx(launcher=launcher)
        hx.configure(max_agents=2)
        hx.create_ticket(ticket("T-1", scope=["textkit/slug"]))
        hx.create_ticket(ticket("T-2", scope=["textkit/slug"]))
        hx.create_ticket(ticket("T-3", scope=["textkit/count"]))
        acts = hx.tick(dispatch=True)
        self.assertEqual(len(launcher.launched), 2, acts)
        hx.tick(dispatch=True)
        self.assertEqual(len(launcher.launched), 2, "no double launch within the dispatch timeout")
        # T-1 starts code work: T-2 (same scope) must wait, T-3 may run
        run_feature_to(hx, "T-1", stop="green")
        from hx.service import scope_blocker
        run_feature_to(hx, "T-2", stop="red", worker="w2")
        self.assertEqual(scope_blocker(hx.state(), hx.state()["tickets"]["T-2"]), "T-1")
        with self.assertRaises(Rejected) as cm:
            hx.claim("w2", "worker", "T-2")
        self.assertEqual(cm.exception.code, "scope")

    def test_dispatch_failures_escalate(self):
        launcher = RecordingLauncher()
        hx, clk = mem_hx(launcher=launcher)
        hx.create_ticket(ticket())
        for _ in range(3):
            hx.tick(dispatch=True)
            clk.advance(601)
        acts = hx.tick(dispatch=True)
        self.assertTrue(any("never claimed" in a for a in acts), acts)
        self.assertEqual(hx.inbox()[0]["reason"], "dispatch")

    def test_escalations_push_immediately_others_batch(self):
        pushed = []
        hx, clk = mem_hx(notifier=lambda text, urgent: pushed.append((urgent, text)))
        hx.create_ticket(ticket("T-1", risk="medium"))
        hx.create_ticket(ticket("T-2", risk="medium"))
        for tid, w in (("T-1", "w1"), ("T-2", "w2")):
            hx.claim(w, "worker", tid)
            hx.submit(w, "doc", sha="a" * 40, path="d.md")
            hx.done(w)
            hx.tick()
        self.assertEqual(len(pushed), 1, "second approval waits for the batch window")
        clk.advance(901)
        hx.tick()
        self.assertEqual(len(pushed), 2)
        self.assertFalse(pushed[0][0])


class TestFold(unittest.TestCase):
    def test_validate_on_fold_matches_validate_on_append(self):
        """A transport without CAS (e.g. comments) may carry invalid events; the fold skips them."""
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        hx.claim("w1", "worker")
        hx.checkpoint("w1", done="a", next="b")
        clean = hx.store.all_events()
        dirty = []
        bogus = [
            {"type": "claim", "actor": {"kind": "agent", "id": "w2"}, "ticket": "T-1",
             "data": {"session": "w2", "role": "worker"}},
            {"type": "checkpoint", "actor": {"kind": "agent", "id": "w2"}, "ticket": "T-1",
             "data": {"session": "w2", "epoch": 1, "note": {"done": "forged"}}},
            {"type": "answer", "actor": {"kind": "agent", "id": "w1"}, "ticket": "T-1",
             "data": {"qid": "Q1", "choice": "approve"}},
            {"type": "override", "actor": {"kind": "agent", "id": "w1"}, "ticket": "T-1", "data": {"reason": "x"}},
        ]
        seq = 0
        for i, ev in enumerate(clean):
            seq += 1
            dirty.append(dict(ev, seq=seq))
            if i == len(clean) - 1:
                for b in bogus:
                    seq += 1
                    dirty.append(dict(b, seq=seq, ts=ev["ts"]))
        s_clean = engine.fold(clean)
        s_dirty = engine.fold(dirty)
        self.assertEqual(len(s_dirty["rejected"]), len(bogus))
        for s in (s_clean, s_dirty):
            s.pop("rejected")
            s.pop("seq")
        self.assertEqual(json.dumps(s_clean, sort_keys=True), json.dumps(s_dirty, sort_keys=True))

    def test_replay_is_deterministic(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket(risk="medium"))
        run_feature_to(hx, "T-1", stop="accept")
        a = engine.fold(hx.store.all_events())
        b = engine.fold(hx.store.all_events())
        self.assertEqual(json.dumps(a, sort_keys=True), json.dumps(b, sort_keys=True))
        self.assertEqual(json.dumps(a, sort_keys=True, default=str), snapshot(hx))


if __name__ == "__main__":
    unittest.main()
