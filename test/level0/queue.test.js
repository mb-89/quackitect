// The queue's score. A ticket more tickets wait on rises, the mark stands over
// the score, and the terms read the weights the config holds.
// [[spec/design_output/pull#the-queue-is-a-score]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { frontOf } from "../../src/engine/group.js";
import {
  chainUnder,
  daysStood,
  failsOn,
  queued,
  scoreOf,
  stoodIn,
  waitsUnder,
} from "../../src/scripts/pull-queue.js";

const WEIGHTS = { block: 10, day: 1, fail: 5 };
const NOW = "2026-01-11T00:00:00.000Z";
const DAY = 86400;
const AT = Date.parse(NOW) / 1000;

const note = (name, more = "") => {
  const text = `---\nkind: [[ticket]]\nstate: open\n${more}steps:\n  - name: do\n---\n\n# Ask\n\nA thing.\n`;
  return { name, path: `spec/tickets/${name}.md`, text, front: frontOf(text) };
};

const chain = [
  note("root"),
  note("first", "depends_on: root\n"),
  note("second", "depends_on: first\n"),
  note("alone"),
];

// [[spec/design_output/pull#the-queue-is-a-score]]
test("the walk counts the whole chain under a ticket, and a cycle ends it", () => {
  const waits = waitsUnder(chain);
  assert.equal(chainUnder("root", waits), 2, "one waits on it, and one under that");
  assert.equal(chainUnder("first", waits), 1);
  assert.equal(chainUnder("alone", waits), 0);

  const loop = [note("a", "depends_on: b\n"), note("b", "depends_on: a\n")];
  assert.equal(chainUnder("a", waitsUnder(loop)), 1, "a cycle counts each one once");
});

// [[spec/design_output/pull#the-queue-is-a-score]]
test("a ticket more tickets wait on scores above one fewer wait on", () => {
  const waits = waitsUnder(chain);
  const score = (one) => scoreOf(one, waits, new Map(), WEIGHTS, 0);
  assert.ok(score(chain[0]) > score(chain[1]), "the root of the chain rises");
  assert.ok(score(chain[1]) > score(chain[3]), "a blocker rises over a free ticket");
});

// [[spec/design_output/pull#the-queue-is-a-score]]
test("the mark stands over the score, and the name breaks a tie", () => {
  const marked = note("zulu", "urgent: true\n");
  const order = queued([chain[0], marked, chain[3]], chain, { weights: WEIGHTS });
  assert.deepEqual(
    order.map((one) => one.name),
    ["zulu", "root", "alone"],
  );

  const tied = queued([note("bravo"), note("alpha")], [], { weights: WEIGHTS });
  assert.deepEqual(
    tied.map((one) => one.name),
    ["alpha", "bravo"],
  );
});

// [[spec/design_output/pull#the-queue-is-a-score]]
test("a ticket standing longer scores above a newer one, a day at a time", () => {
  const stood = new Map([
    ["spec/tickets/alone.md", AT - DAY * 10],
    ["spec/tickets/root.md", AT - DAY],
  ]);
  const clock = fakeClock(NOW);
  const order = queued([note("root"), note("alone")], [], {
    weights: { day: 1 },
    stood,
    clock,
  });
  assert.deepEqual(
    order.map((one) => one.name),
    ["alone", "root"],
  );
  assert.equal(daysStood(AT - DAY * 3, Date.parse(NOW)), 3);
  assert.equal(daysStood(0, Date.parse(NOW)), 0, "a ticket git never saw reads new");
});

// [[spec/design_output/pull#the-queue-is-a-score]]
test("the record counts the hand-backs that came back, and the log names the ages", () => {
  const front = {
    record: [{ step: "do" }, { step: "do", returns: 1 }, { returns: 2 }],
  };
  assert.equal(failsOn(front), 2);
  assert.equal(failsOn({}), 0);

  const said = `1767225600\nspec/tickets/one.md\nspec/tickets/two.md\n\n1767139200\nspec/tickets/three.md\n`;
  const stood = stoodIn(said);
  assert.equal(stood.get("spec/tickets/one.md"), 1767225600);
  assert.equal(stood.get("spec/tickets/three.md"), 1767139200);
  assert.equal(stood.size, 3);
});

// A tie between the plan's todos keeps the order the plan writes them in. [[spec/design_output/pull#a-todo-forces-a-place]]
test("todos of the plan tied on every score keep the plan's order, whatever their names sort to", () => {
  const todo = (name, order) => ({ name, path: "", text: "", front: {}, plan: true, order });
  const tied = queued([todo("zeta", 0), todo("alpha", 1)], [], { weights: WEIGHTS });
  assert.deepEqual(
    tied.map((one) => one.name),
    ["zeta", "alpha"],
  );
});
