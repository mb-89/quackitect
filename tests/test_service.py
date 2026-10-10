"""The HTTP service, the MCP bridge and the hooks, end to end over a real socket."""

import io
import json
import os
import subprocess
import sys
import unittest
from pathlib import Path

from harness.client import ApiError, Client
from harness.engine import Engine
from harness.hooks import main as hooks_main
from harness.mcp_server import handle
from harness.repo import FakeRepo
from harness.server import Service
from tests.helpers import ROUTES, Clock, commit

ROOT = Path(__file__).resolve().parent.parent


class ServiceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.clock = Clock()
        cls.repo = FakeRepo()
        cls.eng = Engine(ROUTES, repo=cls.repo, clock=cls.clock)
        cls.svc = Service(cls.eng, port=0, tick_seconds=3600).start()
        cls.url = cls.svc.url

    @classmethod
    def tearDownClass(cls):
        cls.svc.stop()
        cls.eng.close()

    def mint(self, tid: str, route: str = "mvp") -> dict:
        self.repo.commit("ticket/" + tid, {"README": "x"}, tests_exit=5, parent=self.repo.tip("main"))
        return Client(self.url).post("/api/ticket", {"id": tid, "goal": "fizz", "route": route})

    def test_owner_page_serves(self):
        import urllib.request
        with urllib.request.urlopen(self.url + "/") as r:
            html = r.read().decode()
        self.assertIn("Inbox", html)
        self.assertIn("/api/", html)

    def test_worker_path_over_http(self):
        self.mint("h1")
        c = Client(self.url)
        claim = c.post("/api/claim", {"ticket": "h1", "worker": "http"})
        w = Client(self.url, attempt=str(claim["attempt"]), token=claim["token"])
        self.assertIn("fizz", w.briefing())
        self.assertFalse(w.can_stop()["can_stop"])
        sha = commit(self.repo, "ticket/h1", {"tests/test_a.py": "x"}, tests_exit=1)
        s = w.verb("evidence", {"kind": "commit", "body": {"sha": sha}})
        self.assertEqual(s["filed"], ["commit"])
        r = w.verb("done")
        self.assertEqual(r["verdict"], "pass")
        self.assertTrue(w.can_stop()["can_stop"])
        with self.assertRaises(ApiError) as cm:
            w.verb("status")
        self.assertEqual(cm.exception.code, "stale_lease")
        state = c.get("/api/state")
        self.assertEqual([b["step"] for b in state["board"] if b["ticket"] == "h1"], ["implement"])

    def test_owner_path_over_http(self):
        self.mint("h2", route="trivial")
        c = Client(self.url)
        claim = c.post("/api/claim", {"ticket": "h2"})
        w = Client(self.url, attempt=str(claim["attempt"]), token=claim["token"])
        sha = commit(self.repo, "ticket/h2", {"a.py": "x"}, tests_exit=0)
        w.verb("evidence", {"kind": "commit", "body": {"sha": sha}})
        w.verb("done")
        inbox = c.get("/api/inbox")
        self.assertEqual([i["ticket"] for i in inbox if i["ticket"] == "h2"], ["h2"])
        t = c.post("/api/ticket/h2/decide", {"verdict": "approve"})
        self.assertEqual(t["state"], "done")
        with self.assertRaises(ApiError) as cm:
            c.post("/api/ticket/h2/decide", {"verdict": "approve"})
        self.assertEqual(cm.exception.code, "no_decision")
        tl = c.get("/api/ticket/h2")
        self.assertIn("decision", [e["kind"] for e in tl["events"]])

    def test_mcp_bridge_in_process(self):
        self.mint("h3")
        claim = Client(self.url).post("/api/claim", {"ticket": "h3"})
        w = Client(self.url, attempt=str(claim["attempt"]), token=claim["token"])
        init = handle(w, {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-06-18"}})
        self.assertEqual(init["result"]["serverInfo"]["name"], "harness")
        self.assertIsNone(handle(w, {"jsonrpc": "2.0", "method": "notifications/initialized"}))
        tools = handle(w, {"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        self.assertEqual({t["name"] for t in tools["result"]["tools"]} >= {"harness_status", "harness_done", "harness_handover"}, True)
        st = handle(w, {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "harness_status", "arguments": {}}})
        self.assertFalse(st["result"]["isError"])
        self.assertIn("closes_when", st["result"]["content"][0]["text"])
        bad = handle(w, {"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "harness_evidence", "arguments": {"kind": "commit", "body": {"sha": "nope"}}}})
        self.assertTrue(bad["result"]["isError"])
        self.assertIn("no_such_commit", bad["result"]["content"][0]["text"])
        ho = handle(w, {"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "harness_handover", "arguments": {"done": "read the goal", "remaining": "everything"}}})
        self.assertFalse(ho["result"]["isError"])
        self.assertEqual(self.eng.ticket("h3")["state"], "open")

    def test_mcp_bridge_as_a_subprocess(self):
        self.mint("h4")
        claim = Client(self.url).post("/api/claim", {"ticket": "h4"})
        env = dict(os.environ, HARNESS_URL=self.url, HARNESS_ATTEMPT=str(claim["attempt"]), HARNESS_TOKEN=claim["token"], PYTHONPATH=str(ROOT))
        msgs = [
            {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}},
            {"jsonrpc": "2.0", "method": "notifications/initialized"},
            {"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "harness_status", "arguments": {}}},
        ]
        p = subprocess.run([sys.executable, "-m", "harness.mcp_server"], input="".join(json.dumps(m) + "\n" for m in msgs),
                           capture_output=True, text=True, env=env, cwd=str(ROOT), timeout=30)
        lines = [json.loads(l) for l in p.stdout.splitlines() if l.strip()]
        self.assertEqual([l["id"] for l in lines], [1, 2])
        self.assertIn("h4", lines[1]["result"]["content"][0]["text"])

    def test_hooks(self):
        self.mint("h5")
        claim = Client(self.url).post("/api/claim", {"ticket": "h5"})
        w = Client(self.url, attempt=str(claim["attempt"]), token=claim["token"])

        def hook(event, inp):
            out = io.StringIO()
            rc = hooks_main([event], stdin=io.StringIO(json.dumps(inp)), stdout=out, client=w)
            self.assertEqual(rc, 0)
            return json.loads(out.getvalue()) if out.getvalue() else None

        ss = hook("session-start", {"source": "startup"})
        self.assertIn("ticket h5", ss["hookSpecificOutput"]["additionalContext"])
        st = hook("stop", {"stop_hook_active": False})
        self.assertEqual(st["decision"], "block")
        self.assertIsNone(hook("stop", {"stop_hook_active": True}))
        deny = hook("pre-tool", {"tool_name": "Bash", "tool_input": {"command": "git push --force origin ticket/h5"}})
        self.assertEqual(deny["hookSpecificOutput"]["permissionDecision"], "deny")
        deny = hook("pre-tool", {"tool_name": "Bash", "tool_input": {"command": "git push origin main"}})
        self.assertIn("ticket/h5", deny["hookSpecificOutput"]["permissionDecisionReason"])
        self.assertIsNone(hook("pre-tool", {"tool_name": "Bash", "tool_input": {"command": "git push -u origin ticket/h5"}}))
        self.assertIsNone(hook("pre-tool", {"tool_name": "Bash", "tool_input": {"command": "python3 -m unittest"}}))
        self.assertIsNone(hook("post-tool", {"tool_name": "Read"}))
        self.eng.pause("h5")
        pt = hook("post-tool", {"tool_name": "Read"})
        self.assertIn("hand over now", pt["hookSpecificOutput"]["additionalContext"])
        w.verb("handover", {"done": "nothing", "remaining": "all"})
        self.assertIsNone(hook("stop", {"stop_hook_active": False}))


class SupervisorTests(unittest.TestCase):
    def test_supervisor_drives_a_scripted_worker_to_done(self):
        from harness.supervisor import Supervisor

        clock = Clock()
        repo = FakeRepo()
        repo.commit("ticket/s1", {"README": "x"}, tests_exit=5, parent=repo.tip("main"))
        eng = Engine(ROUTES, repo=repo, clock=clock)
        eng.mint("s1", "fizz", "mvp")
        test = self

        class Worker:
            name = "scripted"

            def run(self, claim):
                step = claim["step"]
                if step == "test":
                    sha = commit(repo, "ticket/s1", {"tests/t.py": "x"}, tests_exit=1)
                    eng.evidence(claim["attempt"], claim["token"], "commit", {"sha": sha})
                elif step == "implement":
                    sha = commit(repo, "ticket/s1", {"a.py": "x"}, tests_exit=0)
                    eng.evidence(claim["attempt"], claim["token"], "commit", {"sha": sha})
                else:
                    eng.evidence(claim["attempt"], claim["token"], "review", {"verdict": "approve", "findings": []})
                return eng.done(claim["attempt"], claim["token"])

            def kill(self, aid):
                pass

        sup = Supervisor(eng, Worker(), tick_seconds=0.01, log=lambda m: None)
        sup.run(until_idle=True, max_seconds=10)
        test.assertEqual(eng.ticket("s1")["state"], "done")
        test.assertEqual(len(sup.results), 3)

    def test_a_worker_that_exits_silently_is_marked_crashed(self):
        from harness.supervisor import Supervisor

        repo = FakeRepo()
        repo.commit("ticket/s2", {"README": "x"}, tests_exit=5, parent=repo.tip("main"))
        eng = Engine(ROUTES, repo=repo, clock=Clock())
        eng.mint("s2", "fizz", "mvp")

        class Silent:
            name = "silent"

            def run(self, claim):
                return {"exit": 1}

            def kill(self, aid):
                pass

        sup = Supervisor(eng, Silent(), tick_seconds=0.01, log=lambda m: None)
        sup.run(until_idle=True, max_seconds=10)
        t = eng.ticket("s2")
        self.assertEqual((t["state"], t["held_for"], t["stalls"]), ("held", "stuck", 3))
        outcomes = [a["outcome"] for a in eng.timeline("s2")["attempts"]]
        self.assertEqual(outcomes, ["crashed", "crashed", "crashed"])


if __name__ == "__main__":
    unittest.main()
