// The gate between phases, driven through the pull over the fake doors in
// pull-doors.js: what each verdict writes into the ticket file.
// [[spec/design_output/pull#the-gate]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fieldOf, frontOf } from "../../src/engine/group.js";
import { isTagged, taggedIn } from "../../.claude/skills/level0/lib/todo.js";
import { handFaults } from "../../src/scripts/pull-chapter.js";
import { leafOf } from "../../src/scripts/pull-route.js";
import { toolArgv } from "../../src/scripts/pull-tool.js";
import { returnsOf } from "../../src/scripts/pull-writes.js";
import { pulling } from "../../src/scripts/work.js";
import { at, doors, filled, heard, ROOT, standing } from "./pull-doors.js";

const TRIVIAL = `for: a fix small enough that the ask is the design
steps:
  - name: do
    does: makes the change
    by: anyone
    to: retro
    evidence:
      - name: says
        form: text
        says: what changes
`;

// A ticket standing at its gate, the design done before it. [[spec/design_output/pull#the-gate]]
const GATED = (record = "") => `---
kind: [[ticket]]
state: open
urgency: now
step: gate
steps:
  - name: design
    steps:
      - name: draft
        does: writes the approach
        evidence:
          - name: approach
            form: text
            says: the approach
      - name: tests-red
        does: writes the tests
        input: draft
        evidence:
          - name: red
            form: list
            says: the test files standing red
  - name: gate
    gate: the design answers the ask
    input: [design/draft, design/tests-red]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points, or reject
  - name: implement
    steps:
      - name: change
        does: makes the change
        input: design/draft
        to: retro
        evidence:
          - name: says
            form: text
            says: what changes
group: one-group
${record}---

# Ask

One piece of it.

# design

## draft

### approach

The approach.

## tests-red

### red

- test/level0/one.test.js

# gate

## verdict

# implement

## change

### says

# Discussion
`;

// The standard route's shape: the implement phase reads the design, and tests-green reads the red tests. [[spec/processes/standard]]
const STANDARD = GATED()
  .replace(
    "  - name: implement\n    steps:\n",
    "  - name: implement\n    input: [design/draft, gate]\n    steps:\n",
  )
  .replace("        input: design/draft\n", "")
  .replace(
    "group: one-group\n",
    "      - name: tests-green\n        does: makes the tests pass\n        input: design/tests-red\n        to: retro\ngroup: one-group\n",
  )
  .replace("## change\n\n### says\n", "## change\n\n### says\n\n## tests-green\n");

const REJECTED_ONCE = `record:
  - step: gate
    hand: box other
    returns: 1
    why: the fail road is missing
`;

// The ticket at its gate, the verdict filled, handed out and handed back. [[spec/design_output/pull#the-gate]]
function gated(rows, record = "", note = GATED(record)) {
  const files = standing(filled(note, "## verdict", rows), undefined, {
    [at("spec/processes/trivial.yaml")]: TRIVIAL,
  });
  const made = doors(files, {}, { words: 5 });
  heard(() => pulling(ROOT, ["pull"], made.it));
  const back = heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  return { ...made, back, text: made.disk.read(at("spec/tickets/a-child.md")) };
}

const namesUnder = (text, phase) =>
  (frontOf(text).steps.find((one) => one.name === phase)?.steps ?? []).map(
    (one) => one.name,
  );

const inputAt = (text, path) => {
  let list = frontOf(text).steps;
  let step;
  for (const part of path.split("/")) {
    step = list.find((one) => one.name === part);
    list = step?.steps ?? [];
  }
  return [step?.input ?? []].flat().map(String);
};

// [[spec/design_output/pull#the-gate]]
test("a gate hand-back admits the reviewer's own commit", () => {
  const hold = "a".repeat(40);
  const leaf = leafOf(frontOf(GATED()), "gate");
  const { it } = doors(
    {},
    {
      "git rev-parse HEAD": { stdout: `${"b".repeat(40)}\n` },
      [`git log --format=%H%x00%s ${hold}..HEAD`]: {
        stdout: `${"1".repeat(40)}\x00a-child: fixes a form fault at the gate\n`,
      },
    },
  );
  const one = {
    name: "a-child",
    text: GATED(),
    front: frontOf(GATED()),
    private: false,
  };

  assert.deepEqual(handFaults(it, one, leaf, "box one", { hash: hold }), []);
});

// [[spec/design_output/pull#the-gate]]
test("accept with points mints an open fix ticket a point, at the front", () => {
  const { back, text, disk } = gated(
    "accept with points\n- cut-the-long-line: the list runs long",
  );

  assert.equal(back.code, 0, back.said);
  assert.equal(fieldOf(text, "step"), "implement/change", "the process goes on");
  const child = disk.read(at("spec/tickets/cut-the-long-line.md"));
  assert.equal(fieldOf(child, "state"), "open", "a fix ticket stands open");
  assert.equal(fieldOf(child, "todo"), "true", "at the front of the queue");
  assert.equal(fieldOf(child, "parent"), "a-child");
  assert.equal(fieldOf(child, "process"), "spec/processes/trivial");
});

// [[spec/design_output/pull#the-gate]]
test("a gate point stands tagged first in the queue, and the push door passes it", () => {
  const { back, disk } = gated(
    "accept with points\n- cut-the-long-line: the list runs long",
  );

  assert.equal(back.code, 0, back.said);
  const child = disk.read(at("spec/tickets/cut-the-long-line.md"));
  assert.equal(fieldOf(child, "point"), "gate", "the door reads the point field");
  assert.ok(isTagged(child), "the queue still reads the tag");
  assert.deepEqual(
    taggedIn([{ name: "spec/tickets/cut-the-long-line.md", text: child }]),
    [],
    "the push door leaves the point alone",
  );
});

// [[spec/design_output/pull#the-gate]]
test("a reject inserts the phase again before the gate", () => {
  const { back, text } = gated("reject\n- the fail road is missing");

  assert.equal(back.code, 0, back.said);
  assert.deepEqual(namesUnder(text, "design"), [
    "draft",
    "tests-red",
    "draft-2",
    "tests-red-2",
  ]);
  assert.equal(fieldOf(text, "step"), "design/draft-2", "the copy stands in hand");
  assert.match(text, /^## draft-2$/m, "the copy takes a chapter of its own");
});

// [[spec/design_output/pull#the-gate]]
test("a reject's copy reads the copy of its sibling", () => {
  const { back, text } = gated("reject\n- the fail road is missing");

  assert.equal(back.code, 0, back.said);
  assert.deepEqual(inputAt(text, "design/tests-red-2"), ["draft-2"]);
});

// [[spec/design_output/pull#the-gate]]
test("a reject leaves the first round reading itself", () => {
  const { back, text } = gated("reject\n- the fail road is missing");

  assert.equal(back.code, 0, back.said);
  assert.deepEqual(inputAt(text, "design/tests-red"), ["draft"]);
});

// [[spec/design_output/pull#the-gate]]
test("after a reject the gate and implement read both rounds", () => {
  const { back, text } = gated("reject\n- the fail road is missing");

  assert.equal(back.code, 0, back.said);
  assert.deepEqual(inputAt(text, "gate"), [
    "design/draft",
    "design/tests-red",
    "design/draft-2",
    "design/tests-red-2",
  ]);
  assert.deepEqual(inputAt(text, "implement/change"), [
    "design/draft",
    "design/draft-2",
  ]);
});

// [[spec/design_output/pull#the-gate]]
test("after a reject on the standard route, implement and tests-green read both rounds", () => {
  const { back, text } = gated("reject\n- the fail road is missing", "", STANDARD);

  assert.equal(back.code, 0, back.said);
  assert.deepEqual(inputAt(text, "implement"), [
    "design/draft",
    "gate",
    "design/draft-2",
  ]);
  assert.deepEqual(inputAt(text, "implement/tests-green"), [
    "design/tests-red",
    "design/tests-red-2",
  ]);
});

// [[spec/design_output/pull#the-gate]]
test("after a reject the pass of draft-2 lands", () => {
  const { it, back } = gated("reject\n- the fail road is missing");
  assert.equal(back.code, 0, back.said);

  heard(() => pulling(ROOT, ["pull"], it));
  const fields = JSON.stringify({ approach: "The approach takes the fail road." });
  const passed = heard(() =>
    pulling(ROOT, ["pull", "a-child", "--pass", "--fields", fields], it),
  );
  assert.equal(passed.code, 0, passed.said);
  assert.match(passed.said, /a-child passes design\/draft-2/);
});

// [[spec/design_output/pull#the-gate]]
test("a second reject inserts a person step", () => {
  const { back, text } = gated(
    "reject\n- the fail road is missing still",
    REJECTED_ONCE,
  );

  assert.equal(back.code, 0, back.said);
  assert.deepEqual(namesUnder(text, "design"), [
    "draft",
    "tests-red",
    "person-1",
    "draft-3",
    "tests-red-3",
  ]);
  assert.equal(fieldOf(text, "step"), "design/person-1", "the person answers first");
  assert.equal(
    returnsOf(frontOf(text), "gate"),
    2,
    "the record counts the second reject",
  );
});

// [[spec/design_output/pull#the-gate]]
test("the pull tool reads a gate's accept and reject as the pass and fail flags", () => {
  assert.deepEqual(toolArgv({ ticket: "a-child", verdict: "accept" }), [
    "pull",
    "a-child",
    "--pass",
  ]);
  assert.deepEqual(
    toolArgv({ ticket: "a-child", verdict: "reject", reason: "no fail road" }),
    ["pull", "a-child", "--fail", "no fail road"],
  );
});
