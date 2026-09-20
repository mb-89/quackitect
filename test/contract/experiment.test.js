// The routes this tree ships, read for the hold on an open trial. A need names
// a verb the box holds, so the hold rides the step's evidence.
// [[spec/design_output/work#an-experiment-decides]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { EXPERIMENT } from "../../src/scripts/retro.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const read = (path) => files.read(join(root, ...path.split("/")));

// [[spec/tickets/an-experiment-ends-decided]]
test("the retro's audit step runs the verb, so an open trial holds the step", () => {
  const route = read("spec/processes/retro.yaml");
  const audit = route.slice(
    route.indexOf("  - name: audit"),
    route.indexOf("  - name: chapter"),
  );

  assert.match(audit, /form: command/, "the step takes a command");
  assert.match(audit, /expects: 0/, "which answers 0");
  assert.match(audit, /retro audit/, "and the command is the verb");
});

// [[spec/tickets/an-experiment-ends-decided]]
test("the experiment route ends on a decision a person takes", () => {
  const route = read(`${EXPERIMENT}.yaml`);

  assert.match(route, /- name: decide/, "the route holds the step");
  assert.match(route, /by: person/, "which a person takes");
  assert.match(
    route,
    /options: \[keep, drop, grow\]/,
    "and it names the three answers",
  );
  assert.equal(
    route.indexOf("- name: decide") > route.indexOf("- name: run"),
    true,
    "the decision stands last",
  );
});
