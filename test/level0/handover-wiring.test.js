// The context handover through the server's own switch: the fill rides the
// call, the block rides the answer, the turn's end holds ahead of the tooth
// until the handover stands, the turn's completion asks for the clear, and the
// clear's session end empties the hold's reads.
// [[spec/design_output/stop#the-context-hands-over]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { HANDOVER, HOLDS } from "../../.claude/skills/level0/lib/folders.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import { RESUME } from "../../src/bridge/handover.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const HOLD = `${HOLDS}/box-1.json`;
const CONFIG = {
  stop: { enabled: true, mostInARow: 3, hold: "off" },
  context: { handoverAt: 60000 },
};

function served() {
  const disk = fakeDisk({
    [at("spec/config/level0.json")]: JSON.stringify(CONFIG),
    [at(TOOLS)]: "{}",
    [at(HOLD)]: JSON.stringify({
      ticket: "t",
      step: "s",
      reads: [{ name: "a", hash: "1" }],
    }),
  });
  return boxOf(ROOT, ROOT, {
    disk,
    clock: fakeClock(),
    proc: fakeProc({}),
    log: fakeLog(),
    index: { warm: () => ({ warmed: false }), dead: () => "" },
  });
}

const call = (box, fill) =>
  decide({ event: "tool.call", e: { tool: "Read" }, fill }, box);
const stops = (box) =>
  decide(
    { event: "classic.Stop", e: { last_assistant_message: "done" }, fill: 70000 },
    box,
  );
const handed = (said) =>
  (said?.after?.context ?? []).some((one) => one.includes("# The context hands over"));

test("a call under the key carries no block, and a call past it does", async () => {
  const box = served();

  assert.equal(handed(await call(box, 40000)), false);
  assert.equal(handed(await call(box, 70000)), true);
});

test("the turn's end holds for the handover, then ends, and the completion asks for the clear", async () => {
  const box = served();
  await call(box, 40000);
  await call(box, 70000);

  const held = await stops(box);
  assert.match(String(held.result?.block), /# The context hands over/);

  box.disk.write(at(HANDOVER), "# Where it stands\n");
  const ended = await stops(box);
  assert.equal(ended.result?.block, undefined);

  const done = await decide(
    { event: "turn.complete", e: { reason: "answer", answer: "done" } },
    box,
  );
  assert.equal(done.clear?.prompt, RESUME);
});

test("the session end of a clear empties the reads, and the ticket stays in hand", async () => {
  const box = served();

  await decide({ event: "session.end", e: { reason: "clear" } }, box);

  const hold = JSON.parse(box.disk.read(at(HOLD)));
  assert.deepEqual(hold.reads, []);
  assert.equal(hold.ticket, "t");
});
