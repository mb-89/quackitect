// The context handover through the server's own switch: the fill rides the
// call and marks the session due, a held clear ends the turn ahead of the
// tooth, the turn's completion asks for the clear, and the clear's session end
// empties the hold's reads and puts the read of the handover in hand.
// [[spec/design_output/stop#the-context-hands-over]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { DUE, HOLDS } from "../../.claude/skills/level0/lib/folders.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import { RESUME } from "../../src/bridge/handover.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { heldAs, READ } from "../../src/scripts/ephemeral.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const HOLD = `${HOLDS}/box-1.json`;
const CLEARING = JSON.stringify(heldAs("clear", "box 1"));
const CONFIG = {
  stop: { enabled: true, mostInARow: 3, hold: "off" },
  context: { handoverAt: 60000 },
  // The queue alone clears. [[spec/design_output/stop#the-queue-alone-clears]]
  engine: { binding: "queue" },
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

test("no call carries a block, under the key or past it", async () => {
  const box = served();

  assert.equal(handed(await call(box, 40000)), false);
  assert.equal(handed(await call(box, 70000)), false);
});

// [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
test("a held clear ends the turn, the completion asks for the clear, and the clear hands the read", async () => {
  const box = served();
  await call(box, 40000);
  await call(box, 70000);
  assert.equal(box.disk.exists(at(DUE)), true);

  box.disk.write(at(HOLD), CLEARING);
  const ended = await stops(box);
  assert.equal(ended.result?.block, undefined);

  const done = await decide(
    { event: "turn.complete", e: { reason: "answer", answer: "done" } },
    box,
  );
  assert.equal(done.clear?.prompt, RESUME);

  await decide({ event: "session.end", e: { reason: "clear" } }, box);
  assert.equal(JSON.parse(box.disk.read(at(HOLD))).ticket, READ);
  assert.equal(box.disk.exists(at(DUE)), false);
});

// [[spec/tickets/the-clear-keeps-questions]]
test("a turn ending on a stop that waits for the owner asks for no clear, and the next turn's end clears", async () => {
  const box = served();
  box.disk.write(
    at("spec/config/stop/level0.yml"),
    "- id: the-owner-asks-to-talk\n  side: stop\n  priority: 100\n  decides: claimed\n  waits: owner\n  asks: Does the owner open a discussion?\n  says: The owner opens a discussion.\n",
  );
  await call(box, 40000);
  await call(box, 70000);
  box.disk.write(at(HOLD), CLEARING);
  const complete = () =>
    decide({ event: "turn.complete", e: { reason: "answer", answer: "done" } }, box);

  await decide(
    {
      event: "classic.Stop",
      e: { last_assistant_message: "A question.\n\nstop: the-owner-asks-to-talk" },
      fill: 70000,
    },
    box,
  );
  assert.equal(
    (await complete()).clear,
    undefined,
    "the waiting turn keeps the conversation",
  );

  await stops(box);
  assert.equal((await complete()).clear?.prompt, RESUME, "the next turn's end clears");
});

test("the session end of a clear empties the reads, and the ticket stays in hand", async () => {
  const box = served();

  await decide({ event: "session.end", e: { reason: "clear" } }, box);

  const hold = JSON.parse(box.disk.read(at(HOLD)));
  assert.deepEqual(hold.reads, []);
  assert.equal(hold.ticket, "t");
});
