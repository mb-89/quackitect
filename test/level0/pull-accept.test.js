// The final acceptance: a gate carrying final, driven through the pull over
// the fake doors in pull-doors.js. It waits on the work under it, reruns over
// the diff since its last verdict, and closes onto a question past its cap.
// [[spec/tickets/the-last-gate-accepts]]

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { readYaml } from "../../.claude/skills/level0/lib/schema-yaml.js";
import { fieldOf } from "../../src/engine/group.js";
import { holdsHere } from "../../src/scripts/pull-when.js";
import { pulling } from "../../src/scripts/work.js";
import { at, doors, filled, heard, ranGit, ROOT, standing } from "./pull-doors.js";

const LAST = "c".repeat(40);

// A ticket standing at its final acceptance, the work done before it. [[spec/tickets/the-last-gate-accepts]]
const FINAL = (record = "") => `---
kind: [[ticket]]
state: open
urgency: now
step: accept
steps:
  - name: implement
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree lints
  - name: accept
    gate: the work answers the ask
    final: true
    input: [implement/change]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points, or reject
group: one-group
${record}---

# Ask

One piece of it.

# implement

## change

### lint

./RUNME.sh lint

# accept

## verdict

# Discussion
`;

// A fix ticket the acceptance minted, standing open under it. [[spec/tickets/the-last-gate-accepts]]
const FIX = `---
kind: [[ticket]]
state: open
urgency: now
step: do
steps:
  - name: do
    does: makes the change
    evidence:
      - name: says
        form: text
        says: what changes
parent: a-child
group: one-group
---

# Ask

The fix.

# do

## says

# Discussion
`;

// A verdict short of accept, recorded at the acceptance. [[spec/tickets/the-last-gate-accepts]]
const SHORT = (returns) => `  - step: accept
    hand: box other
    hash_before: ${"a".repeat(40)}
    hash_after: ${LAST}
    returns: ${returns}
    why: the work misses a line
`;

// [[spec/tickets/the-last-gate-accepts]]
test("a final acceptance waits while a fix ticket under it stands open", () => {
  const { it } = doors(
    standing(FINAL(), undefined, { [at("spec/tickets/fix-it.md")]: FIX }),
  );
  const took = heard(() => pulling(ROOT, ["pull", "a-child"], it));

  assert.doesNotMatch(
    took.said,
    /^work\s+a-child at accept/m,
    "the gate waits on its fix ticket",
  );
});

// [[spec/tickets/the-last-gate-accepts]]
test("a rerun names the diff since its last verdict, and runs every command", () => {
  const made = doors(standing(FINAL(`record:\n${SHORT(1)}`)));
  const took = heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  assert.match(
    took.said,
    new RegExp(LAST),
    "the hand-out names the diff since the last verdict",
  );

  made.disk.write(
    at("spec/tickets/a-child.md"),
    filled(made.disk.read(at("spec/tickets/a-child.md")), "## verdict", "accept"),
  );
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  assert.ok(
    ranGit(made.outside).some((one) => one.includes("./RUNME.sh lint")),
    "the hand-back runs every command field of the route",
  );
});

// [[spec/tickets/the-last-gate-accepts]]
test("past its cap the process closes became onto a question ticket", () => {
  const record = `record:\n${SHORT(1)}${SHORT(2)}`;
  const files = standing(
    filled(FINAL(record), "## verdict", "reject\n- the work misses a line still"),
  );
  const made = doors(files, {}, { fails: 2 });
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));
  heard(() => pulling(ROOT, ["pull", "a-child"], made.it));

  const text = made.disk.read(at("spec/tickets/a-child.md"));
  assert.equal(fieldOf(text, "state"), "closed", "the process closes past its cap");
  assert.match(text, /became/, "it closes became onto the question");
});

// [[spec/tickets/the-last-gate-accepts]]
test("a process inside a delivery skips its acceptance, and the delivery's gate reads it", () => {
  const { it } = doors({});
  const loose = "---\nkind: [[ticket]]\n---\n\n# Ask\n\nOne.\n";
  const held = "---\nkind: [[ticket]]\ngroup: one-group\n---\n\n# Ask\n\nOne.\n";
  assert.equal(
    holdsHere(it, "backlog", {}, loose).holds,
    true,
    "a ticket in no group meets its acceptance",
  );
  assert.equal(
    holdsHere(it, "backlog", {}, held).holds,
    false,
    "a ticket in a delivery skips it",
  );

  const group = readYaml(
    readFileSync(new URL("../../spec/processes/group.yaml", import.meta.url), "utf8"),
  );
  const names = group.steps.map((one) => one.name);
  const gate = group.steps.find((one) => String(one.final) === "true");
  assert.ok(gate, "the group route carries a final gate");
  assert.ok(
    names.indexOf(gate.name) > names.indexOf("children"),
    "the delivery's gate follows its children",
  );
});
