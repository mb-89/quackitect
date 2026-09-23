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
  onSessionMeasure,
  RESUME,
  ridesCall,
} from "../../src/bridge/handover.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const HOLD = `${HOLDS}/box-1.json`;

function box(handoverAt = 150000, files = {}) {
  const config = { stop: { mostInARow: 3 }, context: { handoverAt } };
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
