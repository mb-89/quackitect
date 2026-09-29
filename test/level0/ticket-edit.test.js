// The ticket verbs the work view's actions run, over a fake disk: place writes
// the anchor the work tab writes, urgent flips the mark, and set writes one
// field and refuses a field the engine owns.
// [[spec/tickets/view-actions-run-through-verbs]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeGit } from "../../src/doors/fake/git.js";
import { placeValue } from "../../src/scripts/ticket-edit.js";
import { ticket } from "../../src/scripts/ticket.js";
import { queueIn } from "../../src/scripts/ticket-yours.js";
import { answerOf } from "../../src/scripts/work-answer.js";
import cases from "../../src/tui/work/testdata/places.json" with { type: "json" };
import { at, heard, ROOT, treeWithProcesses } from "./ticket-doors.js";

const PLAN = ".se/.runtime/plan.json";

const SCHEMA = `kind: ticket

frontmatter:
  type: object
  properties:
    state:
      enum: [open, closed]
      x-engine: true
    step:
      type: string
      x-engine: true
    steps:
      type: array
      x-engine: true
    urgent:
      type: boolean
    group:
      type: string
`;

function ticketText(extra = "") {
  return `---
kind: [[ticket]]
state: open
${extra}steps:
  - name: do
    does: makes the change
step: do
---

# Ask

A thing.
`;
}

function treeOf(names) {
  const said = treeWithProcesses({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    ...Object.fromEntries(
      names.map((name) => [at(`spec/tickets/${name}.md`), ticketText()]),
    ),
  });
  said.it.git = fakeGit();
  return said;
}

test("place answers the value the work tab writes, over the shared cases", () => {
  assert.ok(cases.cases.length > 0, "the shared case file holds cases");
  for (const one of cases.cases) {
    const said = placeValue(cases.rows, one.name, one.n);
    assert.equal(said.value, one.want, one.says);
    assert.equal(Boolean(said.notice), said.value === "", one.says);
  }
});

test("place writes the value into the plan file, off the siblings the queue answers", () => {
  const said = treeOf(["a-thing", "b-thing"]);
  const queue = queueIn(
    answerOf({ root: ROOT, method: ROOT, work: ROOT, ...said.it }, true),
  );
  const second = queue.find((one) => one.queue === "2")?.name;
  assert.ok(second, "the queue places a second row");

  const ran = heard(() => ticket(ROOT, ["place", second, "1"], said.it));
  assert.equal(ran.code, 0);
  assert.deepEqual(JSON.parse(said.disk.read(at(PLAN))).places, { [second]: "true" });
});

test("urgent writes the mark at its other value", () => {
  const said = treeOf(["a-thing"]);
  const path = at("spec/tickets/a-thing.md");

  assert.equal(heard(() => ticket(ROOT, ["urgent", "a-thing"], said.it)).code, 0);
  assert.match(said.disk.read(path), /^urgent: true$/m);
  assert.equal(heard(() => ticket(ROOT, ["urgent", "a-thing"], said.it)).code, 0);
  assert.match(said.disk.read(path), /^urgent: false$/m);
});

test("set writes one field and refuses a field the engine owns", () => {
  const said = treeOf(["a-thing"]);
  const path = at("spec/tickets/a-thing.md");

  assert.equal(
    heard(() => ticket(ROOT, ["set", "a-thing", "group", "a-group"], said.it)).code,
    0,
  );
  assert.match(said.disk.read(path), /^group: a-group$/m);

  const before = said.disk.read(path);
  for (const field of ["state", "step", "steps"]) {
    const ran = heard(() => ticket(ROOT, ["set", "a-thing", field, "closed"], said.it));
    assert.equal(ran.code, 2, `set refuses ${field}`);
  }
  assert.equal(said.disk.read(path), before);
});
