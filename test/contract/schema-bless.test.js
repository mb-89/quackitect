// The schemas this tree ships admit a bless on a gate, on a ticket and in a
// process file alike, and the one list of harness names carries every cloud name.
// The case reads the tracked schemas, because the ask names those files.
// [[spec/design_output/pull#the-bless]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { CLOUD } from "../../.claude/skills/level0/lib/cloud.js";
import {
  checkData,
  checkNote,
  readYaml,
} from "../../.claude/skills/level0/lib/schema.js";
import { disk } from "../../src/doors/disk.js";
import { HARNESS } from "../../src/scripts/pull-hand-of.js";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const schemaOf = (kind) =>
  readYaml(disk().read(join(ROOT, "spec", "schemas", `${kind}.schema.yaml`)));
const every = new Map([
  ["ticket", schemaOf("ticket")],
  ["process", schemaOf("process")],
]);

const ROUTE = `steps:
  - name: design
    steps:
      - name: draft
        does: writes the approach
        evidence:
          - name: approach
            form: text
            says: the approach
  - name: gate
    gate: the design answers the ask
    bless: true
    input: design/draft
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points, or reject
`;

const TICKET = `---
kind: [[ticket]]
state: open
step: gate
${ROUTE}---

# Ask

One piece of it.

# design

## draft

### approach

The approach.

# gate

## verdict

# Discussion
`;

const named = (faults, key) => faults.filter((one) => one.message.includes(key));

// [[spec/tickets/process-case-for-bless]]
test("a process file carrying bless on a gate passes the process schema", () => {
  const faults = checkData(
    `for: a route with a gate that asks a bless\n${ROUTE}`,
    every.get("process"),
    "spec/processes/blessed.yaml",
    every,
  );
  assert.deepEqual(named(faults, "bless"), [], JSON.stringify(faults));
});

// [[spec/design_output/pull#the-bless]]
test("the ticket schema admits bless on a gate step", () => {
  const faults = checkNote(
    TICKET,
    every.get("ticket"),
    "spec/tickets/blessed.md",
    every,
  );
  assert.deepEqual(named(faults, "bless"), [], JSON.stringify(faults));
});

// [[spec/design_output/pull#the-bless]]
test("the ticket schema refuses a bless that is no boolean", () => {
  const faults = checkNote(
    TICKET.replace("bless: true", "bless: often"),
    every.get("ticket"),
    "spec/tickets/blessed.md",
    every,
  );
  assert.ok(named(faults, "bless").length, "a bless takes true or false");
});

// [[spec/tickets/cloud-list-reads-harness]]
test("HARNESS carries every name CLOUD carries", () => {
  const names = HARNESS.map(([name]) => name);
  for (const name of CLOUD) assert.ok(names.includes(name), name);
});
