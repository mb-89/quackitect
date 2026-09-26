// A person's hand: the step an agent cannot answer, the name the hand carries,
// and the signature the stronger door reads.
// [[spec/design_output/pull#the-hand-rule]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { writesHere } from "../../.claude/skills/level0/lib/ticket.js";
import { recordIn } from "../../src/engine/group.js";
import { handFaults, handOf } from "../../src/scripts/pull.js";
import { holdsHere } from "../../src/scripts/pull-hand.js";
import { pulling } from "../../src/scripts/work.js";
import {
  at,
  CHILD,
  deskDoors,
  doors,
  filled,
  heard,
  ROOT,
  standing,
} from "./pull-doors.js";

// A person's hand sits at a desk, which works on trunk alone. [[spec/design_output/work#a-desk-works-on-trunk]]
const PERSON = { agent: false, env: {} };
const AUTHOR = { "git config user.name": { stdout: "Ada\n" } };

test("an agent hand-back on a person's step comes back refused, and names the step", () => {
  const { it } = doors(standing());
  const leaf = { by: "person", path: "design/person-1", evidence: [] };
  const one = { front: {}, private: false };

  const desk = { ...it, cloud: false };
  assert.deepEqual(handFaults({ ...desk, agent: true }, one, leaf, "box one", {}), [
    "design/person-1 is a person's step, and this hand is an agent.",
  ]);
  assert.deepEqual(
    handFaults({ ...desk, agent: false }, one, leaf, "person Ada", {}),
    [],
    "a person's hand answers it",
  );
  assert.deepEqual(
    handFaults({ ...desk, agent: true, ownerSays: true }, one, leaf, "box one", {}),
    [],
    "and the owner sends an agent in",
  );
  // A cloud box answers every question it meets. [[spec/guidance/cloud]]
  assert.deepEqual(
    handFaults({ ...it, agent: true, cloud: true }, one, leaf, "box one", {}),
    [],
    "a cloud box answers it",
  );
});

test("a hand off a harness carries the git author name, and the record writes the role", () => {
  const { it, disk } = deskDoors(
    standing(filled(CHILD(), "### approach", "The approach.")),
    AUTHOR,
    PERSON,
  );

  assert.equal(handOf({ ...it, root: ROOT }), "person Ada");

  heard(() => pulling(ROOT, ["pull"], it));
  const { code, said } = heard(() => pulling(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 0, said);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(
    recordIn(now).at(-1).hand,
    "person",
    "a tracked file holds the role, and git holds who",
  );
});

// [[spec/design_output/pull#a-leaf-comes-back]]
test("a person takes a leaf back, because the record's role answers their hand", () => {
  const { it, disk } = deskDoors(
    standing(filled(CHILD(), "### approach", "The approach.")),
    AUTHOR,
    PERSON,
  );
  heard(() => pulling(ROOT, ["pull"], it));
  heard(() => pulling(ROOT, ["pull", "a-child", "--pass"], it));

  const { code, said } = heard(() =>
    pulling(ROOT, ["pull", "a-child", "--back", "design/draft"], it),
  );

  assert.equal(code, 0, said);
  assert.match(said, /a-child stands at design\/draft again/);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(recordIn(now).at(-1).why, "the hand takes it back");
  assert.equal(recordIn(now).at(-1).hand, "person", "and it writes the role");
});

test("personSigns refuses a person's hand-back on an unsigned tip, and names the tip", () => {
  const { it } = deskDoors(
    standing(filled(CHILD(), "### approach", "The approach.")),
    { ...AUTHOR, "git log -1 --format=%G? HEAD": { stdout: "N\n" } },
    { ...PERSON, personSigns: true },
  );
  heard(() => pulling(ROOT, ["pull"], it));

  const { code, said } = heard(() => pulling(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1);
  assert.match(said, /^refused/m);
  assert.match(said, /a person's hand-back meets a signed tip/);
  assert.match(said, /b818c39/, "the refusal names the tip");
});

test("personSigns lets a signed tip through, and an agent's hand-back reads no signature", () => {
  const signed = deskDoors(
    standing(filled(CHILD(), "### approach", "The approach.")),
    { ...AUTHOR, "git log -1 --format=%G? HEAD": { stdout: "U\n" } },
    { ...PERSON, personSigns: true },
  );
  heard(() => pulling(ROOT, ["pull"], signed.it));
  const good = heard(() => pulling(ROOT, ["pull", "a-child", "--pass"], signed.it));
  assert.equal(good.code, 0, good.said);

  const robot = doors(
    standing(filled(CHILD(), "### approach", "The approach.")),
    { "git log -1 --format=%G? HEAD": { stdout: "N\n" } },
    { personSigns: true },
  );
  heard(() => pulling(ROOT, ["pull"], robot.it));
  const passed = heard(() => pulling(ROOT, ["pull", "a-child", "--pass"], robot.it));
  assert.equal(passed.code, 0, passed.said);
});

// The ask names the view, and the owner's pass there closes the ticket. [[spec/tickets/the-owner-view-decides-done]]
const ASKING = (view) =>
  `---\nkind: [[ticket]]\n---\n\n# Ask\n\nThe count reads right.\n\nview: ${view}\n\n# design\n`;
const VIEW = { by: "person", when: "view", path: "view", evidence: [] };

test("a ticket whose ask names a view closes on the owner's pass at the view leaf", () => {
  const said = holdsHere(
    { cloud: true },
    "view",
    {},
    ASKING("the sidebar button reads 3"),
  );
  assert.equal(said.holds, true, "the view leaf stands in the route");
  assert.equal(
    writesHere(VIEW, { agent: true, cloud: true }).writes,
    false,
    "an agent on a cloud box leaves the owner's view to the owner",
  );
  assert.equal(writesHere(VIEW, { agent: false }).writes, true, "the owner passes it");
});

test("a ticket whose ask says view: none skips the view leaf and closes on tests-green", () => {
  assert.equal(holdsHere({}, "view", {}, ASKING("none")).holds, false);
  assert.equal(holdsHere({}, "view", {}, "# Ask\n\nNo view line.\n").holds, false);
});

// [[spec/tickets/the-owners-words-travel-verbatim]]
test("a ticket minted off a handover waits on the owner's read before its draft", () => {
  const read = {
    by: "person",
    when: "handed",
    path: "design/owner-read",
    evidence: [],
  };
  assert.equal(
    writesHere(read, { agent: true, cloud: true }).writes,
    false,
    "an agent on a cloud box leaves the owner's read to the owner",
  );
  assert.equal(writesHere(read, { agent: false }).writes, true, "the owner reads it");
});

test("a ticket minted off no handover skips the owner's read", () => {
  assert.equal(holdsHere({}, "handed", {}, ASKING("none")).holds, false);
});
