// A hold is a state of the ticket, so a closed ticket stands in no hand: the
// readers answer no hold on it, and the next pull drops its file.
// [[spec/tickets/holds-leave-with-their-ticket]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { inHand } from "../../src/engine/named.js";
import { holdsIn } from "../../src/scripts/ephemeral.js";
import { pulling } from "../../src/scripts/work.js";
import { at, CHILD, deskDoors, heard, HOLD, ROOT, standing } from "./pull-doors.js";

const HELD = JSON.stringify({
  ticket: "a-child",
  path: "spec/tickets/a-child.md",
  step: "design/draft",
  hand: "box d462e994b4cef",
  reads: [],
});
const EPHEMERAL = at(".se/.runtime/hold/box-other.json");

// The child closed through another hand, while this box's hold still names it. [[spec/tickets/holds-leave-with-their-ticket]]
const closedUnderHold = (extra = {}) =>
  deskDoors({ ...standing(CHILD("closed", "")), [HOLD]: HELD, ...extra });

test("the readers answer no hold on a ticket another hand closes", () => {
  const { disk } = closedUnderHold();
  assert.deepEqual(
    holdsIn(disk, ROOT).map(({ held }) => held.ticket),
    [],
  );
  assert.deepEqual(inHand({ disk, root: ROOT }).tickets, []);
});

test("an ephemeral hold stands, since it names no ticket file", () => {
  const { disk } = closedUnderHold({
    [EPHEMERAL]: JSON.stringify({ ticket: "clear-one", path: "", ephemeral: true }),
  });
  assert.deepEqual(
    holdsIn(disk, ROOT).map(({ held }) => held.ticket),
    ["clear-one"],
  );
});

test("a hold on a ticket another hand closes drops at the next pull", () => {
  const { it, disk } = closedUnderHold();
  const { said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.doesNotMatch(said, /a-child stands in your hand/);
  assert.equal(disk.exists(HOLD), false, said);
});

test("a pull after that close names no closed ticket in hand", () => {
  const { it, disk } = closedUnderHold();
  heard(() => pulling(ROOT, ["pull"], it));
  assert.ok(!inHand({ disk, root: ROOT }).tickets.includes("a-child"));
});
