// A person's hand: the step an agent cannot answer, the name the hand carries,
// and the signature the stronger door reads.
// [[spec/design_output/pull#the-hand-rule]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { recordIn } from "../../src/scripts/group.js";
import { handFaults, handOf } from "../../src/scripts/pull.js";
import { work } from "../../src/scripts/work.js";
import { at, CHILD, doors, filled, heard, ROOT, standing } from "./pull-doors.js";

const PERSON = { agent: false, cloud: false, env: {} };
const AUTHOR = { "git config user.name": { stdout: "Ada\n" } };

test("an agent hand-back on a person's step comes back refused, and names the step", () => {
  const { it } = doors(standing());
  const leaf = { by: "person", path: "design/person-1", evidence: [] };
  const one = { front: {}, private: false };

  assert.deepEqual(handFaults({ ...it, agent: true }, one, leaf, "box one", {}), [
    "design/person-1 is a person's step, and this hand is an agent.",
  ]);
  assert.deepEqual(
    handFaults({ ...it, agent: false }, one, leaf, "person Ada", {}),
    [],
    "a person's hand answers it",
  );
  assert.deepEqual(
    handFaults({ ...it, agent: true, ownerSays: true }, one, leaf, "box one", {}),
    [],
    "and the owner sends an agent in",
  );
});

test("a hand off a harness carries the git author name, and the record writes the role", () => {
  const { it, disk } = doors(
    standing(filled(CHILD(), "### approach", "The approach.")),
    AUTHOR,
    PERSON,
  );

  assert.equal(handOf({ ...it, root: ROOT }), "person Ada");

  heard(() => work(ROOT, ["pull"], it));
  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 0, said);
  const now = disk.read(at("spec/tickets/a-child.md"));
  assert.equal(
    recordIn(now).at(-1).hand,
    "person",
    "a tracked file holds the role, and git holds who",
  );
});

test("personSigns refuses a person's hand-back on an unsigned tip, and names the tip", () => {
  const { it } = doors(
    standing(filled(CHILD(), "### approach", "The approach.")),
    { ...AUTHOR, "git log -1 --format=%G? HEAD": { stdout: "N\n" } },
    { ...PERSON, personSigns: true },
  );
  heard(() => work(ROOT, ["pull"], it));

  const { code, said } = heard(() => work(ROOT, ["pull", "a-child", "--pass"], it));

  assert.equal(code, 1);
  assert.match(said, /^refused/m);
  assert.match(said, /a person's hand-back meets a signed tip/);
  assert.match(said, /b818c39/, "the refusal names the tip");
});

test("personSigns lets a signed tip through, and an agent's hand-back reads no signature", () => {
  const signed = doors(
    standing(filled(CHILD(), "### approach", "The approach.")),
    { ...AUTHOR, "git log -1 --format=%G? HEAD": { stdout: "U\n" } },
    { ...PERSON, personSigns: true },
  );
  heard(() => work(ROOT, ["pull"], signed.it));
  const good = heard(() => work(ROOT, ["pull", "a-child", "--pass"], signed.it));
  assert.equal(good.code, 0, good.said);

  const robot = doors(
    standing(filled(CHILD(), "### approach", "The approach.")),
    { "git log -1 --format=%G? HEAD": { stdout: "N\n" } },
    { personSigns: true },
  );
  heard(() => work(ROOT, ["pull"], robot.it));
  const passed = heard(() => work(ROOT, ["pull", "a-child", "--pass"], robot.it));
  assert.equal(passed.code, 0, passed.said);
});
