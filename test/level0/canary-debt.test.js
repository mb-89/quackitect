// The canary debt over a fake box: a step of a turn pays it the moment the
// line lands, a step without the line leaves it standing, the line pays once
// for the whole session, and a restart reads that payment back off the log.
// [[spec/design_output/level0#the-line-lands-once]]
// [[spec/design_output/level0#the-debt-survives-a-restart]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import {
  canary,
  canaryText,
  HEARD,
  highlighted,
  OWES,
} from "../../.claude/skills/level0/lib/guidance.js";
import { asLines, rowOf, SESSION } from "../../.claude/skills/level0/lib/log.js";
import {
  onSessionCompact,
  onTurnComplete,
  onTurnSaid,
  owesCanary,
} from "../../src/bridge/guidance.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const LINE = canary({ rules: 0, notes: 0, stop: true });
const AT = "2026-01-01T00:00:00.000Z";

// A box the restart left: it carries the log of the session running on, and no session of its own. [[spec/design_output/level0#the-debt-survives-a-restart]]
function box(rows = []) {
  const log = rows.length ? { [join(ROOT, SESSION)]: asLines(rows) } : {};
  return {
    disk: fakeDisk(log),
    proc: fakeProc({}),
    work: ROOT,
    method: ROOT,
    env: {},
    index: { dead: () => "" },
    log: { say: () => {} },
  };
}

const paidRow = () => rowOf(AT, "info", "level0", HEARD.same, { detail: LINE });
const compactRow = () => rowOf(AT, "info", "compact", "a compaction runs");

const owes = (it) => Boolean(owesCanary({ tool: "Read" }, it));
// A box whose session the layer reached, so the line stands owed. [[spec/design_output/level0#rules-ride-the-first-answer]]
const reached = () =>
  box([rowOf(AT, "info", "context", "4 block(s) reach the session")]);

test("a step carrying the line pays the debt, and the next call meets no gate", () => {
  const it = reached();
  assert.equal(owes(it), true, "a box the layer reached owes it");

  onTurnSaid({ text: `${LINE}\n\nThe work goes on.` }, it);
  assert.equal(owes(it), false);
});

test("a step without the line leaves the debt standing", () => {
  const it = reached();
  onTurnSaid({ text: "The work goes on." }, it);
  assert.equal(owes(it), true);
});

test("a helper's step pays nothing, because a helper carries a canary of its own", () => {
  const it = reached();
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

test("a restart after the line leaves the gate quiet", () => {
  assert.equal(owes(box([paidRow()])), false);
});

// [[spec/design_output/level0#rules-ride-the-first-answer]]
test("a server starting late, before the layer reached the session, asks for no canary", () => {
  assert.equal(owes(box()), false);
});

test("a restart before the line asks for the canary", () => {
  assert.equal(
    owes(box([rowOf(AT, "info", "context", "1 block(s) reach the session")])),
    true,
  );
});

test("a compaction after the line opens the debt again, and a restart reads that", () => {
  assert.equal(owes(box([paidRow(), compactRow()])), true);
});

test("the line landing after a compaction pays again, and a restart reads that", () => {
  assert.equal(owes(box([paidRow(), compactRow(), paidRow()])), false);
});

test("a compaction takes the payment off, so the line pays once more", () => {
  const it = box();
  onTurnSaid({ text: LINE }, it);
  onSessionCompact({ trigger: "auto" }, it);
  assert.equal(owes(it), true);

  onTurnSaid({ text: LINE }, it);
  assert.equal(owes(it), false);
});

// Two writers appending at once tear one line, and the read back stands on the rest. [[spec/design_output/level0#the-debt-survives-a-restart]]
test("a torn line in the log leaves the payment readable", () => {
  const log = asLines([paidRow()]).replace(/\n$/, `\n${"\0".repeat(8)}\n`);
  const it = box();
  it.disk = fakeDisk({ [join(ROOT, SESSION)]: log });
  assert.equal(owes(it), false);
});

test("the line draws highlighted in the wording that owes it and the wording that pays it", () => {
  const drawn = highlighted(LINE);
  for (const said of [OWES.warns(LINE), OWES.denies(LINE), canaryText(LINE)]) {
    assert.ok(
      said.split("\n").includes(drawn),
      `the line stands on a line of its own: ${said}`,
    );
  }
});

// A context repeats the canary, and the repeat draws a finding. [[spec/tickets/answers-read-the-last-text]]
function heard(it) {
  const said = [];
  it.log = { say: (...row) => said.push(row) };
  return said;
}

const repeats = (said) =>
  said.filter((one) => one[0] === "warn" && one[2] === HEARD.again);

// [[spec/tickets/answers-read-the-last-text]]
test("a second step opening on the canary in one context draws the repeat finding", () => {
  const it = box();
  const said = heard(it);
  onTurnSaid({ text: `${LINE}\n\nThe work goes on.` }, it);
  onTurnSaid({ text: `${LINE}\n\nThe next piece.` }, it);
  assert.equal(repeats(said).length, 1);
});

// [[spec/tickets/answers-read-the-last-text]]
test("a step that pays, then the turn's end carrying the same text, draws no finding", () => {
  const it = box();
  const said = heard(it);
  onTurnSaid({ text: `${LINE}\n\nThe work stands done.` }, it);
  onTurnComplete({ reason: "answer", answer: `${LINE}\n\nThe work stands done.` }, it);
  assert.equal(repeats(said).length, 0);
});

// [[spec/tickets/answers-read-the-last-text]]
test("the canary alone written twice in one context draws the finding", () => {
  const it = box();
  const said = heard(it);
  onTurnSaid({ text: LINE }, it);
  onTurnSaid({ text: LINE }, it);
  assert.equal(repeats(said).length, 1);
});

// [[spec/tickets/answers-read-the-last-text]]
test("a line after a compaction pays and draws no finding", () => {
  const it = box();
  const said = heard(it);
  onTurnSaid({ text: LINE }, it);
  onSessionCompact({ trigger: "auto" }, it);
  onTurnSaid({ text: LINE }, it);
  assert.equal(repeats(said).length, 0);
});
