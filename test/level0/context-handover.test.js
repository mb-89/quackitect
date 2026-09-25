// The context door over a fake box: a fill past context.handoverAt marks the
// session due on disk, a ticket in hand runs to its end, a held clear ends the
// turn and asks the bridgehead for the clear, and the clear puts the ticket
// reading the handover in hand.
// [[spec/design_output/stop#the-context-hands-over]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { DUE, HOLDS } from "../../.claude/skills/level0/lib/folders.js";
import { onSessionEnd, onSessionStart } from "../../src/bridge/guidance.js";
import {
  CLEAR,
  clearsAfter,
  FINISH,
  forgetsReads,
  holdsForHandover,
  measures,
  onSessionMeasure,
  RESUME,
} from "../../src/bridge/handover.js";
import { heldAs, READ, retroIn } from "../../src/scripts/ephemeral.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const HOLD = `${HOLDS}/box-1.json`;
const CLEARING = JSON.stringify(heldAs("clear", "box 1", "then"));

function box(handoverAt = 150000, files = {}, binding = "queue") {
  const config = {
    stop: { mostInARow: 3 },
    context: { handoverAt },
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

test("a fill under the key marks nothing, and a fill past it marks the session due on disk", () => {
  const it = box();

  measures(it, 40000);
  measures(it, 149999);
  assert.equal(it.handover, undefined);
  assert.equal(it.disk.exists(at(DUE)), false);

  onSessionMeasure({ context: { tokens: 150000 } }, it);
  assert.equal(it.handover.phase, FINISH);
  assert.equal(it.disk.exists(at(DUE)), true, "the pull reads the mark");
  assert.ok(it.said.some((one) => one.kind === "handover"));
});

// [[spec/design_output/stop#the-queue-alone-clears]]
test("a session under god or unbound goes due nowhere, and keeps its conversation", () => {
  for (const binding of ["god", "unbound"]) {
    const it = box(150000, { [at(DUE)]: "{}" }, binding);
    measures(it, 160000);
    assert.equal(it.fill, 160000, "the fill still reads");
    assert.equal(it.handover, null, binding);
    assert.equal(it.disk.exists(at(DUE)), false, binding);
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

// [[spec/design_output/stop#the-queue-alone-clears]]
test("a held clear under a binding moved off the queue drops, and the turn goes to the tooth", () => {
  const it = box(150000, { [at(HOLD)]: CLEARING, [at(DUE)]: "{}" }, "god");

  assert.equal(holdsForHandover({}, it), null);
  assert.equal(it.disk.exists(at(HOLD)), false);
  assert.equal(it.disk.exists(at(DUE)), false);
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

test("the key at 0 switches the handover off", () => {
  const it = box(0);

  measures(it, 900000);

  assert.equal(it.handover, undefined);
  assert.equal(it.disk.exists(at(DUE)), false);
});

test("a helper's measure touches nothing", () => {
  const it = box();

  onSessionMeasure({ agentId: "a1", context: { tokens: 900000 } }, it);

  assert.equal(it.handover, undefined);
  assert.equal(holdsForHandover({ agentId: "a1" }, it), null);
});

// [[spec/design_input/the-clear-hands-ephemeral-tickets#a-ticket-is-the-unit-of-work]]
test("a ticket in hand leaves the turn's end to the tooth, however far past the key", () => {
  const hold = { ticket: "t", step: "implement", reads: [] };
  const it = box(150000, { [at(HOLD)]: JSON.stringify(hold) });
  measures(it, 40000);
  measures(it, 400000);

  assert.equal(holdsForHandover({}, it), null);
  assert.equal(it.handover.phase, FINISH);
});

test("a session due holding nothing is sent to the pull, and lets go past the tooth's cap", () => {
  const it = box();
  measures(it, 40000);
  measures(it, 160000);

  for (let i = 0; i < 3; i++) {
    const block = holdsForHandover({}, it).result.block;
    assert.match(block, /# The context hands over/);
    assert.match(block, /ticket pull/);
  }

  assert.equal(holdsForHandover({}, it), null);
  assert.equal(it.handover, null);
  assert.equal(it.disk.exists(at(DUE)), false);
  assert.ok(it.said.some((one) => one.level === "warn" && one.kind === "handover"));
});

// [[spec/design_input/the-clear-hands-ephemeral-tickets#the-clear-runs-as-three-tickets]]
test("a held clear ends the turn, and the completion asks the bridgehead for the clear", () => {
  const it = box(150000, { [at(HOLD)]: CLEARING });
  measures(it, 40000);
  measures(it, 160000);

  assert.deepEqual(holdsForHandover({}, it), { pass: true });
  assert.equal(it.handover.phase, CLEAR);

  const answer = clearsAfter({ reason: "answer" }, it, { pass: true });
  assert.deepEqual(answer, { pass: true, clear: { prompt: RESUME } });
  assert.equal(it.handover, null);
});

test("a held clear the server never saw due still clears", () => {
  const it = box(150000, { [at(HOLD)]: CLEARING });

  assert.deepEqual(holdsForHandover({}, it), { pass: true });
  assert.equal(it.handover.phase, CLEAR);
});

test("a turn the person breaks off asks for no clear", () => {
  const it = box();
  it.handover = { phase: CLEAR, asked: 0 };

  assert.deepEqual(clearsAfter({ reason: "aborted" }, it, { pass: true }), {
    pass: true,
  });
  assert.equal(it.handover.phase, CLEAR);
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

// [[spec/design_input/the-clear-hands-ephemeral-tickets#the-clear-runs-as-three-tickets]]
test("the session end of a clear closes the clear, and puts the read of the handover in hand", () => {
  const it = box(150000, { [at(HOLD)]: CLEARING, [at(DUE)]: "{}" });

  onSessionEnd({ reason: "clear" }, it);

  const held = JSON.parse(it.disk.read(at(HOLD)));
  assert.equal(held.ticket, READ);
  assert.equal(held.ephemeral, true);
  assert.equal(held.hand, "box 1");
  assert.equal(it.disk.exists(at(DUE)), false);
});

test("a session start drops a mark a session before it left", () => {
  const it = box(150000, { [at(DUE)]: "{}" });

  onSessionStart({}, it);

  assert.equal(it.disk.exists(at(DUE)), false);
});

test("a session end for any other reason leaves the hold alone", () => {
  const hold = { ticket: "t", reads: [{ name: "a", hash: "1" }] };
  const it = box(150000, { [at(HOLD)]: JSON.stringify(hold) });

  onSessionEnd({ reason: "other" }, it);

  assert.equal(JSON.parse(it.disk.read(at(HOLD))).reads.length, 1);
});

test("the retro check reads a backslash path too", () => {
  assert.equal(retroIn("read .se\\.retro\\x\\report.md\n"), ".se\\.retro\\x\\report.md");
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
    [at(HOLD)]: CLEARING,
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
