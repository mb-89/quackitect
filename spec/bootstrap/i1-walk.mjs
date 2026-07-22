// i1 driver â€” v2's own development iteration running under v2's loop.
import { Loop } from "../../product/engine/loop.ts";
import { Gate } from "../../product/engine/gate.ts";
import { CallLog } from "../../product/engine/calllog.ts";
import { runCommand } from "../../product/engine/run.ts";
import { systematic } from "../../product/engine/machines/systematic.ts";

const root = "C:/Users/ichbi/Desktop/ai/quackitect-v2";
const loop = new Loop(root, systematic);

let p = loop.start("i1");
console.log("->", p.kind, p.state);

p = loop.submit({
  goal: "every MCP tool call lands raw in the call log (successes and rejections), through the single dispatch path",
  load_bearing_for:
    "the log-everything ruling (2026-07-22) and v1's measured loss: the raw call log was retro-deleted, making P5 counts lower bounds forever; v2's baseline series depends on this log existing from i1",
  exit_check: "a contract test proves both a successful and a rejected tools/call appear in .se/calls.jsonl with outcome tags; full suite green",
});
console.log("->", p.kind, p.state);

// Back the do_work evidence with an engine-captured run (G2).
const log = new CallLog(root + "/.se");
const rec = runCommand(log, "npm run typecheck", root);
console.log("typecheck run:", rec.ref, "ok:", rec.ok);

p = loop.submit({
  changed:
    "engine/mcp.ts (CallObserver + observe on dispatch: result/rejected/errored with duration); engine/tools.ts (buildServer wires the observer to the call log); tests/mcp.test.ts (contract test: success + rejection both land)",
  run_ref: rec.ref,
});
console.log("->", p.kind, p.state, p.auto_closed ?? "");

if (p.kind === "work" && p.state === "do_work") {
  console.log("verify failed and reopened do_work â€” inspect before proceeding");
  process.exit(1);
}

p = loop.submit({
  exit_check_result:
    "contract test 'every MCP tool call lands raw in the call log' passes: se_get_node success logged outcome=result, unknown-id rejection logged outcome=rejected; suite 41/41 green (pinned typecheck run + verify state's npm test run)",
});
console.log("->", p.kind, p.offer_hash ?? "");

if (p.kind !== "gate_offered") process.exit(1);

// Delegated adjudication (policy knob, transparent): the bootstrap session
// blesses with its channel recorded; the owner audits at run end.
const grant = new Gate(root).bless(systematic, p.offer_hash, {
  channel: "chat-session",
  adjudicated_by: "agent:claude-bootstrap-session",
});
console.log("grant:", grant.channel, grant.adjudicated_by, grant.hash.slice(0, 12));
console.log("final:", loop.next().kind);
