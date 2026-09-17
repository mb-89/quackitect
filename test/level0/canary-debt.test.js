// The canary debt over a fake box: a step of a turn pays it the moment the
// line lands, a step without the line leaves it standing, and the line pays
// once for the whole session.
// [[spec/design_output/level0#the-line-lands-once]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { canary } from "../../.claude/skills/level0/lib/guidance.js";
import { onTurnComplete, onTurnSaid, owesCanary } from "../../src/bridge/guidance.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const LINE = canary({ rules: 0, notes: 0, stop: true });

function box() {
  return {
    disk: fakeDisk({}),
    proc: fakeProc({}),
    work: ROOT,
    method: ROOT,
    env: {},
    index: { dead: () => "" },
    log: { say: () => {} },
  };
}

const owes = (it) => Boolean(owesCanary({ tool: "Read" }, it));

test("a step carrying the line pays the debt, and the next call meets no gate", () => {
  const it = box();
  assert.equal(owes(it), true, "a box with no session of its own owes it");

  onTurnSaid({ text: `${LINE}\n\nThe work goes on.` }, it);
  assert.equal(owes(it), false);
});

test("a step without the line leaves the debt standing", () => {
  const it = box();
  onTurnSaid({ text: "The work goes on." }, it);
  assert.equal(owes(it), true);
});

test("a helper's step pays nothing, because a helper carries a canary of its own", () => {
  const it = box();
  onTurnSaid({ text: LINE, agentId: "a-helper" }, it);
  assert.equal(owes(it), true);
});

test("the line pays once, and a later answer without it opens no debt", () => {
  const it = box();
  onTurnSaid({ text: LINE }, it);
  onTurnComplete({ reason: "answer", answer: "The work stands done." }, it);
  assert.equal(owes(it), false);
});

test("a first turn answering without the line owes it", () => {
  const it = box();
  it.session = { reads: 1, firstTurn: true };
  onTurnComplete({ reason: "answer", answer: "The work stands done." }, it);
  assert.equal(owes(it), true);
});
