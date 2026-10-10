"""Coordinator HTTP API, remote agents, the CLI binary, store concurrency, MCP wrapper."""
import json
import multiprocessing
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
import urllib.error
import urllib.request

from hx import engine, mcp
from hx.client import RemoteHx
from hx.engine import Rejected
from hx.server import Coordinator
from hx.service import Hx
from hx.store import FakeClock, FileStore, GitRefStore, MemoryStore
from tests.helpers import FakeVerifier, mem_hx, run_feature_to, sh, ticket

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HX_BIN = os.path.join(ROOT, "bin", "hx")


class TestCoordinator(unittest.TestCase):
    def setUp(self):
        self.hx, self.clk = mem_hx()
        self.c = Coordinator(self.hx, port=0, tick=0, owner_token="own", agent_token="agt").start()
        self.url = f"http://127.0.0.1:{self.c.port}"

    def tearDown(self):
        self.c.stop()

    def req(self, path, body=None, token="own"):
        r = urllib.request.Request(self.url + path, data=json.dumps(body).encode() if body is not None else None,
                                   headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                                   method="POST" if body is not None else "GET")
        try:
            with urllib.request.urlopen(r) as resp:
                return resp.status, resp.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()

    def test_ui_and_auth(self):
        code, body = self.req("/", token="")
        self.assertEqual(code, 200)
        self.assertIn(b"<title>hx owner</title>", body)
        self.assertEqual(self.req("/api/state", token="nope")[0], 401)
        self.assertEqual(self.req("/api/state", token="agt")[0], 401, "agents do not see the owner's board")
        code, body = self.req("/api/state")
        self.assertEqual(code, 200)
        self.assertIn("counts", json.loads(body))

    def test_remote_agent_full_step_and_owner_answer(self):
        self.hx.create_ticket(ticket(risk="medium"))
        agent = RemoteHx(self.url, "agt")
        r = agent.claim("w1", "worker")
        self.assertIn("hx brief · T-1", r["brief"])
        agent.checkpoint("w1", done="drafted doc", next="submit")
        agent.submit("w1", "doc", sha="a" * 40, path="d.md")
        with self.assertRaises(Rejected):
            agent.answer("Q1", "approve")  # agent token cannot answer
        msg = agent.done("w1")["message"]
        self.assertIn("waiting for the owner", msg)
        qid = json.loads(self.req("/api/state")[1])["inbox"][0]["id"]
        self.assertEqual(self.req("/api/answer", {"qid": qid, "choice": "approve"})[0], 200)
        self.assertEqual(self.hx.state()["tickets"]["T-1"]["step"], "red")
        code, body = self.req("/api/ticket/T-1")
        d = json.loads(body)
        self.assertEqual(code, 200)
        self.assertIn("timeline", d)
        self.assertIn("brief", d)

    def test_rejections_travel_as_409(self):
        self.hx.create_ticket(ticket())
        agent = RemoteHx(self.url, "agt")
        agent.claim("w1", "worker")
        with self.assertRaises(Rejected) as cm:
            agent.done("w1")
        self.assertEqual(cm.exception.code, "gate")

    def test_owner_controls(self):
        self.hx.create_ticket(ticket())
        self.assertEqual(self.req("/api/control", {"action": "pause"})[0], 200)
        self.assertTrue(self.hx.state()["paused_all"])
        self.assertEqual(self.req("/api/control", {"action": "resume"})[0], 200)
        self.assertEqual(self.req("/api/control", {"action": "override", "ticket": "T-1", "reason": "ok"})[0], 200)
        self.assertEqual(self.hx.state()["tickets"]["T-1"]["step"], "red")
        self.assertEqual(self.req("/api/control", {"action": "pause"}, token="agt")[0], 401)


def _cli(args, env, cwd=None, input=None):
    r = subprocess.run([sys.executable, HX_BIN, *args], env=env, cwd=cwd, capture_output=True, text=True,
                       input=input)
    return r.returncode, r.stdout + r.stderr


class TestCli(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp(prefix="hx-cli-")
        self.env = {k: v for k, v in os.environ.items() if not k.startswith("HX_")}
        self.env.update(HX_STORE=os.path.join(self.dir, "log.jsonl"), HX_NOW="1760000000")

    def tearDown(self):
        shutil.rmtree(self.dir, ignore_errors=True)

    def test_exit_codes_and_flow(self):
        e = dict(self.env)
        code, out = _cli(["ticket", "add", "T-1", "--title", "slugify", "--criteria", "lowercase",
                          "--test-cmd", "true"], e, self.dir)
        self.assertEqual(code, 0, out)
        e["HX_SESSION"] = "w1"
        code, out = _cli(["claim"], e, self.dir)
        self.assertEqual(code, 0, out)
        self.assertIn("DONE WHEN", out)
        code, out = _cli(["done"], e, self.dir)
        self.assertEqual(code, 2, out)
        self.assertIn("GATE NOT SATISFIED", out)
        code, out = _cli(["checkpoint", "--done", "read code", "--next", "write doc"], e, self.dir)
        self.assertEqual(code, 0, out)
        code, out = _cli(["board"], dict(self.env), self.dir)
        self.assertIn("T-1", out)
        code, out = _cli(["revoke", "T-1"], dict(self.env), self.dir)
        self.assertEqual(code, 0, out)
        code, out = _cli(["checkpoint", "--done", "x"], e, self.dir)
        self.assertEqual(code, 3, out)
        self.assertIn("LEASE_LOST", out)
        code, out = _cli(["log", "T-1"], dict(self.env), self.dir)
        self.assertIn("revoke", out)

    def test_hook_entry_point_reads_stdin(self):
        e = dict(self.env, CLAUDE_PROJECT_DIR=self.dir)
        code, out = _cli(["hook", "session-start"], e, self.dir,
                         input=json.dumps({"session_id": "s9", "source": "startup", "cwd": self.dir}))
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)["hookSpecificOutput"]["hookEventName"], "SessionStart")


def _worker(path, n, tag):
    store = FileStore(path, FakeClock())
    hx = Hx(store, verifier=FakeVerifier())
    for i in range(n):
        hx.create_ticket(ticket(f"{tag}-{i}"))


class TestStores(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp(prefix="hx-store-")

    def tearDown(self):
        shutil.rmtree(self.dir, ignore_errors=True)

    def test_filestore_concurrent_processes(self):
        path = os.path.join(self.dir, "log.jsonl")
        procs = [multiprocessing.Process(target=_worker, args=(path, 15, f"P{k}")) for k in range(4)]
        for p in procs:
            p.start()
        for p in procs:
            p.join()
        events = FileStore(path).all_events()
        self.assertEqual([e["seq"] for e in events], list(range(1, 61)))
        self.assertEqual(len(engine.fold(events)["tickets"]), 60)

    def test_gitref_store_cas_retries_on_concurrent_writer(self):
        repo = os.path.join(self.dir, "state.git")
        sh(["git", "init", "-q", "--bare", repo], self.dir)
        a, b = GitRefStore(repo, clock=FakeClock()), GitRefStore(repo, clock=FakeClock())
        Hx(a, verifier=FakeVerifier()).create_ticket(ticket("T-1"))
        hb = Hx(b, verifier=FakeVerifier())
        sneaky = {"done": False}

        def build(state):  # while A builds its event, B appends: A's compare-and-swap must fail once
            if not sneaky["done"]:
                sneaky["done"] = True
                hb.create_ticket(ticket("T-2"))
            return [{"type": "ticket.create", "actor": {"kind": "owner", "id": "o"}, "ticket": "T-3",
                     "data": ticket("T-3")}]

        a.append(build)
        self.assertEqual(a.cas_conflicts, 1)
        fresh = GitRefStore(repo)
        self.assertEqual(sorted(fresh.read()["tickets"]), ["T-1", "T-2", "T-3"])
        self.assertEqual([e["seq"] for e in fresh.all_events()], [1, 2, 3, 4, 5, 6][:len(fresh.all_events())])
        log = sh(["git", "log", "--oneline", "refs/hx/state"], repo)
        self.assertEqual(len(log.splitlines()), 3, "one commit per append; history is the audit trail")

    def test_same_story_same_state_in_every_store(self):
        repo = os.path.join(self.dir, "s.git")
        sh(["git", "init", "-q", "--bare", repo], self.dir)
        states = []
        for store in (MemoryStore(FakeClock()), FileStore(os.path.join(self.dir, "l.jsonl"), FakeClock()),
                      GitRefStore(repo, clock=FakeClock())):
            hx = Hx(store, verifier=FakeVerifier())
            hx.create_ticket(ticket(risk="medium"))
            run_feature_to(hx, "T-1", stop=None)
            states.append(json.dumps(engine.fold(store.all_events()), sort_keys=True))
        self.assertEqual(len(set(states)), 1)


class TestMcp(unittest.TestCase):
    def test_tools_roundtrip(self):
        hx, clk = mem_hx()
        hx.create_ticket(ticket())
        init = mcp.handle(hx, "m1", {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}})
        self.assertIn("tools", init["result"]["capabilities"])
        names = [t["name"] for t in mcp.handle(hx, "m1", {"id": 2, "method": "tools/list"})["result"]["tools"]]
        self.assertIn("hx_done", names)
        r = mcp.handle(hx, "m1", {"id": 3, "method": "tools/call", "params": {"name": "hx_claim", "arguments": {}}})
        self.assertIn("hx brief · T-1", r["result"]["content"][0]["text"])
        r = mcp.handle(hx, "m1", {"id": 4, "method": "tools/call", "params": {"name": "hx_done", "arguments": {}}})
        self.assertTrue(r["result"]["isError"])
        self.assertIsNone(mcp.handle(hx, "m1", {"method": "notifications/initialized"}))


if __name__ == "__main__":
    unittest.main()
