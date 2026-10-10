"""The agent hook: MCP server, Claude Code hooks, the owner page."""

import io
import json
import os
import unittest
from contextlib import redirect_stdout

from baton import hooks, mcp, web
from baton.config import open_engine
from tests.util import SPEC, make_engine

A = "agent:a1"


class Env(unittest.TestCase):
    def setUp(self):
        _, _, self.db = make_engine()
        self.old = dict(os.environ)
        os.environ.update(BATON_DB=self.db, BATON_ACTOR=A)
        os.environ.pop("BATON_WORK", None)
        self.eng = open_engine()
        self.wid = self.eng.create("Write spec", "Write a spec for mul.")

    def tearDown(self):
        os.environ.clear()
        os.environ.update(self.old)

    def hook(self, event, data=None):
        buf = io.StringIO()
        with redirect_stdout(buf):
            hooks.run(event, data or {})
        return json.loads(buf.getvalue()) if buf.getvalue() else None


class Hooks(Env):
    def test_session_start_takes_work_and_injects_card(self):
        out = self.hook("session-start", {"source": "startup"})
        ctx = out["hookSpecificOutput"]["additionalContext"]
        self.assertIn("BATON CARD for agent:a1", ctx)
        self.assertIn("STEP 1/7: draft", ctx)
        self.assertEqual(self.eng.held(A).id, self.wid)

    def test_card_never_cuts_the_ask(self):
        long_ask = "Rule. " * 800 + "THE LAST RULE."
        wid = self.eng.create("Long", long_ask)
        self.eng.take("agent:a9", wid)
        from baton.card import render
        self.assertIn("THE LAST RULE.", render(self.eng.held("agent:a9"), "agent:a9", 0))

    def test_compaction_reinjects_same_card(self):
        a = self.hook("session-start", {"source": "startup"})
        b = self.hook("session-start", {"source": "compact"})
        self.assertEqual(a["hookSpecificOutput"]["additionalContext"],
                         b["hookSpecificOutput"]["additionalContext"])

    def test_post_tool_use_heartbeats_and_reanchors(self):
        self.hook("session-start")
        outs = [self.hook("post-tool-use") for _ in range(25)]
        self.assertEqual(sum(o is not None for o in outs), 1)
        self.assertIn("[baton] W1 step draft", outs[-1]["hookSpecificOutput"]["additionalContext"])
        self.assertEqual(self.eng.get(self.wid).calls, 25)

    def test_stop_blocks_once_then_hands_off(self):
        self.hook("session-start")
        out = self.hook("stop", {"stop_hook_active": False})
        self.assertEqual(out["decision"], "block")
        self.assertIn("handoff(baton)", out["reason"])
        self.assertIsNone(self.hook("stop", {"stop_hook_active": True}))
        self.assertIsNone(self.eng.held(A))
        self.assertIn("stopped without a handoff", self.eng.get(self.wid).baton)

    def test_stop_free_when_nothing_held(self):
        self.assertIsNone(self.hook("stop"))


class Mcp(Env):
    def rpc(self, method, params=None, mid=1):
        return mcp.handle(self.eng, A, {"jsonrpc": "2.0", "id": mid,
                                        "method": method, "params": params or {}})

    def test_protocol(self):
        init = self.rpc("initialize", {"protocolVersion": "2025-06-18"})
        self.assertEqual(init["result"]["serverInfo"]["name"], "baton")
        self.assertIsNone(mcp.handle(self.eng, A, {"jsonrpc": "2.0", "method": "notifications/initialized"}))
        names = [t["name"] for t in self.rpc("tools/list")["result"]["tools"]]
        self.assertEqual(names, ["card", "take", "done", "note", "reopen", "ask", "handoff",
                                 "verdict", "mint"])

    def test_bad_arguments_answer_an_error_and_the_server_lives(self):
        self.rpc("tools/call", {"name": "take", "arguments": {}})
        r = self.rpc("tools/call", {"name": "note", "arguments": {}})
        self.assertTrue(r["result"]["isError"])
        self.assertIn("schema", r["result"]["content"][0]["text"])
        r = self.rpc("tools/call", {"name": "card", "arguments": {}})
        self.assertFalse(r["result"]["isError"])

    def test_string_evidence_is_accepted(self):
        self.rpc("tools/call", {"name": "take", "arguments": {}})
        r = self.rpc("tools/call", {"name": "done", "arguments": {"evidence": "x" * 90, "baton": "b"}})
        self.assertIn("evidence 'spec'", r["result"]["content"][0]["text"])
        self.assertFalse(r["result"]["isError"])

    def test_take_and_claim(self):
        r = self.rpc("tools/call", {"name": "take", "arguments": {}})
        self.assertIn("STEP 1/7", r["result"]["content"][0]["text"])
        r = self.rpc("tools/call", {"name": "done", "arguments": {"evidence": {"spec": SPEC}, "baton": "spec done"}})
        self.assertIn("step 'draft' closed", r["result"]["content"][0]["text"])
        self.assertIn("STEP 2/7: design", r["result"]["content"][0]["text"])

    def test_errors_are_tool_errors(self):
        r = self.rpc("tools/call", {"name": "done", "arguments": {"baton": "x"}})
        self.assertTrue(r["result"]["isError"])
        self.assertIn("holds no work", r["result"]["content"][0]["text"])


class Web(Env):
    def test_inbox_and_actions(self):
        self.eng.take(A)
        self.eng.ask(A, "CSV or JSON?", ["CSV", "JSON"])
        page = web.inbox_html(self.eng)
        self.assertIn("Needs you (1)", page)
        self.assertIn("CSV or JSON?", page)
        web.act(self.eng, {"w": self.wid, "a": "answer", "text": "CSV"})
        self.assertIn("Needs you (0)", web.inbox_html(self.eng))
        self.assertIn("CSV", web.work_html(self.eng, self.wid))


if __name__ == "__main__":
    unittest.main()
