// The context door over a fake box: a fill past context.handoverAt rides a
// block on every call, holds the turn's end until the handover stands, asks
// the bridgehead for the clear, and a clear makes the hold forget its reads.
// [[spec/design_output/stop#the-context-hands-over]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { HANDOVER, HOLDS } from "../../.claude/skills/level0/lib/folders.js";
import { onSessionEnd } from "../../src/bridge/guidance.js";
import {
  CLEAR,
  clearsAfter,
  FINISH,
  forgetsReads,
  holdsForHandover,
  measures,
  namesRetro,
  onSessionMeasure,
  RESUME,
  ridesCall,
} from "../../src/bridge/handover.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const HOLD = `${HOLDS}/box-1.json`;

function box(handoverAt = 150000, files = {}, writeAt = 0, binding = "queue") {
  const config = {
    stop: { mostInARow: 3 },
    context: { handoverAt, writeAt },
    engine: { binding },
  };
  const said = [];
  return {
    disk: fakeDisk({
      [at("spec/config/level0.json")]: JSON.stringify(config),
      ...files,
    }),
    work: ROOT,
    method: ROOT,
    env: {},
    index: { dead: () => "" },
    log: { say: (level, kind, line) => said.push({ level, kind, line }) },
    said,
  };
}

test("a fill under the key marks nothing, and a fill past it marks the session due", () => {
  const it = box();

  measures(it, 40000);
  measures(it, 149999);
  assert.equal(it.handover, undefined);
  assert.equal(ridesCall({ tool: "Read" }, it), null);

  onSessionMeasure({ context: { tokens: 150000 } }, it);
  assert.equal(it.handover.phase, FINISH);
  assert.ok(it.said.some((one) => one.kind === "handover"));
});

// [[spec/design_output/stop#the-queue-alone-clears]]
test("a session under god or unbound goes due nowhere, and keeps its conversation", () => {
  for (const binding of ["god", "unbound"]) {
    const it = box(150000, {}, 0, binding);
    measures(it, 160000);
    assert.equal(it.fill, 160000, "the fill still reads");
    assert.equal(it.handover, null, binding);
    assert.equal(ridesCall({ tool: "Read" }, it), null, binding);
    assert.equal(holdsForHandover({}, it), null, binding);
  }
});

// [[spec/design_output/stop#the-queue-alone-clears]]
test("a binding moved off the queue while the clear stands asks for no clear", () => {
  const it = box();
  it.handover = { phase: CLEAR, asked: 0 };
  it.disk.write(
    at("spec/config/level0.json"),
    JSON.stringify({ context: { handoverAt: 150000 }, engine: { binding: "god" } }),
  );
  assert.deepEqual(clearsAfter({ reason: "answer" }, it, { pass: true }), {
    pass: true,
  });
  assert.equal(it.handover, null);
});

test("a conversation opening past the key after a clear stands the door down", () => {
  const it = box(30000);
  onSessionEnd({ reason: "clear" }, it);

  measures(it, 40000);
  measures(it, 90000);

  assert.equal(it.handover, null);
  assert.ok(it.said.some((one) => one.level === "warn" && one.kind === "handover"));
});

test("a conversation opening under the key after a clear hands over again", () => {
  const it = box(60000);
  onSessionEnd({ reason: "clear" }, it);

  measures(it, 40000);
  measures(it, 90000);

  assert.equal(it.handover.phase, FINISH);
});

test("the canary's ask and the handover block ride one call together", () => {
  const it = box();
  measures(it, 160000);

  const both = ridesCall({ tool: "Read" }, it, { after: { context: ["owed"] } });

  assert.equal(both.after.context.length, 2);
  assert.equal(both.after.context[0], "owed");
});

test("the key at 0 switches the handover off", () => {
  const it = box(0);

  measures(it, 900000);

  assert.equal(it.handover, undefined);
});

test("a helper's measure and a helper's call touch nothing", () => {
  const it = box();

  onSessionMeasure({ agentId: "a1", context: { tokens: 900000 } }, it);
  assert.equal(it.handover, undefined);

  measures(it, 40000);
  measures(it, 900000);
  assert.equal(ridesCall({ tool: "Read", agentId: "a1" }, it), null);
});

test("a session due carries the block on every call of its own", () => {
  const it = box();
  measures(it, 40000);
  measures(it, 160000);

  const block = ridesCall({ tool: "Read" }, it).after.context[0];

  assert.match(block, /# The context hands over/);
  assert.match(block, /160000 tokens/);
  assert.ok(block.includes(HANDOVER));
});

test("the turn's end holds until the handover stands, then ends and asks for the clear", () => {
  const it = box();
  measures(it, 40000);
  measures(it, 160000);

  const held = holdsForHandover({}, it);
  assert.match(held.result.block, /# The context hands over/);

  it.disk.write(at(HANDOVER), "# Where it stands\n");
  assert.deepEqual(holdsForHandover({}, it), { pass: true });
  assert.equal(it.handover.phase, CLEAR);

  const answer = clearsAfter({ reason: "answer" }, it, { pass: true });
  assert.deepEqual(answer, { pass: true, clear: { prompt: RESUME } });
  assert.equal(it.handover, null);
});

test("a turn the person breaks off asks for no clear", () => {
  const it = box();
  it.handover = { phase: CLEAR, asked: 0 };

  assert.deepEqual(clearsAfter({ reason: "aborted" }, it, { pass: true }), {
    pass: true,
  });
  assert.equal(it.handover.phase, CLEAR);
});

test("a session that writes no handover lets go past the tooth's cap", () => {
  const it = box();
  measures(it, 40000);
  measures(it, 160000);

  for (let i = 0; i < 3; i++) assert.ok(holdsForHandover({}, it).result.block);

  assert.equal(holdsForHandover({}, it), null);
  assert.equal(it.handover, null);
  assert.ok(it.said.some((one) => one.level === "warn" && one.kind === "handover"));
});

test("a clear makes the hold forget its reads, and keeps the ticket and step", () => {
  const hold = { ticket: "t", step: "implement", reads: [{ name: "a", hash: "1" }] };
  const it = box(150000, { [at(HOLD)]: JSON.stringify(hold) });

  assert.equal(forgetsReads(it), 1);

  const after = JSON.parse(it.disk.read(at(HOLD)));
  assert.deepEqual(after.reads, []);
  assert.equal(after.step, "implement");
  assert.equal(forgetsReads(it), 0, "an empty list stays as it stands");
});

test("the session end of a clear forgets the reads and drops a standing handover", () => {
  const hold = { ticket: "t", reads: [{ name: "a", hash: "1" }] };
  const it = box(150000, { [at(HOLD)]: JSON.stringify(hold) });
  it.handover = { phase: FINISH, asked: 1 };

  onSessionEnd({ reason: "clear" }, it);

  assert.deepEqual(JSON.parse(it.disk.read(at(HOLD))).reads, []);
  assert.equal(it.handover, null);
  assert.ok(it.said.some((one) => one.kind === "clear"));
});

test("a session end for any other reason leaves the hold alone", () => {
  const hold = { ticket: "t", reads: [{ name: "a", hash: "1" }] };
  const it = box(150000, { [at(HOLD)]: JSON.stringify(hold) });

  onSessionEnd({ reason: "other" }, it);

  assert.equal(JSON.parse(it.disk.read(at(HOLD))).reads.length, 1);
});

test("a fill past writeAt turns the block into the handover itself", () => {
  const it = box(150000, {}, 175000);
  measures(it, 40000);
  measures(it, 160000);
  assert.match(
    ridesCall({ tool: "Read" }, it).after.context[0],
    /Finish the step in hand/,
  );

  measures(it, 176000);

  const block = ridesCall({ tool: "Read" }, it).after.context[0];
  assert.match(block, /# Write the handover now/);
  assert.match(block, /176000 tokens/);
  assert.match(holdsForHandover({}, it).result.block, /# Write the handover now/);
  assert.equal(it.said.filter((one) => /writeAt/.test(one.line)).length, 1);
});

test("a first fill past both keys hands over now at once", () => {
  const it = box(150000, {}, 175000);

  measures(it, 40000);
  measures(it, 180000);

  assert.equal(it.handover.phase, FINISH);
  assert.equal(it.handover.now, true);
});

test("writeAt at 0 or under handoverAt adds no second stage", () => {
  for (const writeAt of [0, 120000]) {
    const it = box(150000, {}, writeAt);
    measures(it, 40000);
    measures(it, 900000);

    assert.equal(it.handover.now, undefined);
    assert.match(
      ridesCall({ tool: "Read" }, it).after.context[0],
      /# The context hands over/,
    );
  }
});

test("a handover naming the retro folder holds the turn, and one without it clears", () => {
  const it = box(150000, {
    [at(HANDOVER)]: "| the promotions | `.se/.retro/retro-899accd/classes.json` |\n",
  });
  measures(it, 40000);
  measures(it, 160000);

  const held = holdsForHandover({}, it);
  assert.match(held.result.block, /# The handover names the retro/);
  assert.match(held.result.block, /retro-899accd\/classes\.json/);
  assert.equal(it.handover.phase, FINISH);

  it.disk.write(at(HANDOVER), "| the promotions | the retro's classes, by name |\n");
  assert.deepEqual(holdsForHandover({}, it), { pass: true });
  assert.equal(it.handover.phase, CLEAR);
});

test("the retro check reads a backslash path too", () => {
  const it = box(150000, { [at(HANDOVER)]: "read .se\\.retro\\x\\report.md\n" });

  assert.equal(namesRetro(it), ".se\\.retro\\x\\report.md");
});

// The rules the claim reads, one waiting on the owner and one not. [[spec/tickets/the-clear-keeps-questions]]
const WAITING = `
- id: the-owner-asks-to-talk
  side: stop
  priority: 100
  decides: claimed
  waits: owner
  asks: Does the owner open a discussion?
  says: The owner opens a discussion.

- id: the-work-stands-complete
  side: stop
  priority: 45
  decides: claimed
  asks: Does the work stand complete?
  says: The work stands complete.
`;

// [[spec/tickets/the-clear-keeps-questions]]
test("a stop waiting on the owner holds the clear, and the next turn's end clears", () => {
  const it = box(150000, {
    [at("spec/config/stop/level0.yml")]: WAITING,
    [at(HANDOVER)]: "# Where it stands\n",
  });
  measures(it, 160000);

  const asks = {
    last_assistant_message: "A question.\n\nstop: the-owner-asks-to-talk",
  };
  assert.equal(holdsForHandover(asks, it), null, "the tooth votes on the waiting stop");
  assert.equal(it.handover.phase, FINISH, "the session stays due");
  assert.deepEqual(clearsAfter({ reason: "answer" }, it, { pass: true }), {
    pass: true,
  });

  it.claim = "the-owner-asks-to-talk";
  assert.equal(holdsForHandover({}, it), null, "a claim the call made waits too");
  it.claim = null;

  const done = { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" };
  assert.deepEqual(holdsForHandover(done, it), { pass: true });
  assert.equal(it.handover.phase, CLEAR);
  assert.deepEqual(clearsAfter({ reason: "answer" }, it, { pass: true }), {
    pass: true,
    clear: { prompt: RESUME },
  });
});
