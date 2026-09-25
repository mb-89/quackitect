// The clear as three ephemeral tickets, driven through the pull's fake doors:
// a session due takes the handover ticket once the ticket in hand stands done,
// its hand-back checks the file and hands the clear, the clear takes no
// hand-back, and the read of the handover hands the queue back.
// [[spec/design_input/the-clear-hands-ephemeral-tickets]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { DUE, HANDOVER } from "../../.claude/skills/level0/lib/folders.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { heldAs, READ } from "../../src/scripts/ephemeral.js";
import { dueHandOut } from "../../src/scripts/ephemeral-pull.js";
import { handOut, ticketsHere } from "../../src/scripts/pull-hand.js";
import { answerOf } from "../../src/scripts/work-answer.js";
import { pulling } from "../../src/scripts/work.js";
import { at, CHILD, doors, HAND, HOLD, heard, ROOT } from "./pull-doors.js";
import { doorsSaying, remoteSaying } from "./work-doors.js";

const FREE = CHILD().replace("group: one-group\n", "");
const onTrunk = {
  "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
  "git rev-list --count HEAD..origin/main": { stdout: "0\n" },
};
const desk = (files = {}) =>
  doors({ [at("spec/tickets/free-one.md")]: FREE, ...files }, onTrunk, {
    cloud: false,
  });
const due = { [at(DUE)]: JSON.stringify({ tokens: 140000, at: 130000 }) };
const holding = (name) => ({ [HOLD]: JSON.stringify(heldAs(name, HAND)) });
const held = (disk) => JSON.parse(disk.read(HOLD));

// [[spec/design_input/the-clear-hands-ephemeral-tickets#the-ticket-ends-first]]
test("a pull with no mark hands the queue, and a pull on a session due hands the handover ticket", () => {
  const plain = desk();
  assert.match(heard(() => pulling(ROOT, ["pull"], plain.it)).said, /^work {2}free-one/m);

  const { it, disk } = desk(due);
  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));

  assert.equal(code, 0, said);
  assert.match(said, /handover stands in your hand/);
  assert.ok(!said.includes("free-one at"), "no ticket goes out past the mark");
  assert.equal(held(disk).ticket, "handover");
  assert.equal(held(disk).ephemeral, true);
  assert.equal(held(disk).path, "");
});

test("the ticket the hand gives back hands its next leaf first, and another ticket waits behind the handover", () => {
  const who = (ticket) => ({
    hand: HAND,
    plainHand: HAND,
    branch: "main",
    group: "",
    held: { ticket, step: "design/draft" },
  });

  const same = desk(due);
  same.it.root = ROOT;
  const kept = heard(() => handOut(same.it, who("free-one")));
  assert.match(kept.said, /^work {2}free-one at design\/draft/m);
  assert.equal(held(same.disk).ticket, "free-one");

  const other = desk(due);
  other.it.root = ROOT;
  const moved = heard(() => dueHandOut(other.it, who("gone-one"), ticketsHere(other.it)));
  assert.match(moved.said, /handover stands in your hand/);
});

test("a helper's pull takes none of the clear's tickets", () => {
  const { it } = desk(due);
  const { said } = heard(() => pulling(ROOT, ["pull", "--as", "helper-1"], it));

  assert.ok(!said.includes("handover stands in your hand"), said);
});

// [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
test("the handover's hand-back refuses a missing or retro-naming file, and hands the clear on a good one", () => {
  const { it, disk } = desk({ ...due, ...holding("handover") });

  const bare = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(bare.code, 0);
  assert.match(bare.said, /handover stands in your hand/);

  const none = heard(() => pulling(ROOT, ["pull", "--pass"], it));
  assert.equal(none.code, 1);
  assert.match(none.said, /stands nowhere, or stands empty/);
  assert.equal(held(disk).ticket, "handover");

  disk.write(at(HANDOVER), "read .se/.retro/r1/classes.json\n");
  const retro = heard(() => pulling(ROOT, ["pull", "--pass"], it));
  assert.equal(retro.code, 1);
  assert.match(retro.said, /names \.se\/\.retro\/r1\/classes\.json/);

  const failed = heard(() => pulling(ROOT, ["pull", "--fail", "no"], it));
  assert.equal(failed.code, 1);
  assert.match(failed.said, /takes --pass alone/);

  disk.write(at(HANDOVER), "# Where it stands\n\nfree-one comes next.\n");
  const passed = heard(() => pulling(ROOT, ["pull", "--pass"], it));
  assert.equal(passed.code, 0, passed.said);
  assert.match(passed.said, /clear stands in your hand/);
  assert.equal(held(disk).ticket, "clear");
});

test("the clear takes no hand-back, and a bare pull shows its ask", () => {
  const { it, disk } = desk({ ...due, ...holding("clear") });

  const back = heard(() => pulling(ROOT, ["pull", "--pass"], it));
  assert.equal(back.code, 1);
  assert.match(back.said, /End the turn now/);
  assert.equal(held(disk).ticket, "clear");

  const bare = heard(() => pulling(ROOT, ["pull"], it));
  assert.match(bare.said, /clear stands in your hand/);
});

test("the read of the handover closes on a pass, and the queue hands the next leaf", () => {
  const { it, disk } = desk(holding(READ));

  const { code, said } = heard(() => pulling(ROOT, ["pull", "--pass"], it));

  assert.equal(code, 0, said);
  assert.match(said, /read-handover closes/);
  assert.match(said, /^work {2}free-one at design\/draft/m);
  assert.equal(held(disk).ticket, "free-one");
});

// [[spec/design_input/the-clear-hands-ephemeral-tickets#an-ephemeral-ticket-stands-held]]
test("the work answer draws each ephemeral ticket as a held row at zero, with no file", () => {
  const said = answerOf({
    ...doorsSaying(remoteSaying([], {}), {
      [join(ROOT, ".se/.runtime/hold/box-1.json")]: JSON.stringify(heldAs("clear", "box 1")),
    }).it,
    root: ROOT,
    clock: fakeClock("2026-01-01T03:00:00.000Z"),
  });

  const row = said.loose.find((one) => one.name === "clear");
  assert.equal(row.queue, "0");
  assert.equal(row.state, "held");
  assert.equal(row.kind, "todo");
  assert.match(row.says, /End the turn now/);
});
