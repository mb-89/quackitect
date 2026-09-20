// The retro's hold on an open trial. An experiment ends on a decision, so a
// retro closing over one leaves the tree carrying it.
// [[spec/design_output/work#an-experiment-decides]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
// The whole module, so a name the verb answers nowhere yet fails an assertion. [[spec/tickets/an-experiment-ends-decided]]
import * as retro from "../../src/scripts/retro.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

const TRIAL = (name, state) =>
  `---\nkind: [[ticket]]\nstate: ${state}\nprocess: [[spec/processes/experiment]]\nsteps:\n  - name: decide\n---\n\n# Ask\n\n${name}.\n`;

function box(files = {}) {
  const said = [];
  return {
    said,
    it: {
      root: ROOT,
      method: ROOT,
      work: ROOT,
      join,
      disk: fakeDisk(files),
      log: { say: (...row) => said.push(row) },
    },
  };
}

// [[spec/tickets/an-experiment-ends-decided]]
test("the audit holds while a trial stands open, and names each one", () => {
  assert.equal(typeof retro.openTrials, "function", "the verb answers openTrials");
  const it = box({
    [at("spec/tickets/a-trial.md")]: TRIAL("a trial", "open"),
    [at("spec/tickets/a-closed-trial.md")]: TRIAL("a closed trial", "closed"),
    [at("spec/tickets/a-plain-one.md")]:
      "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/standard]]\n---\n\n# Ask\n\nA thing.\n",
  }).it;

  assert.deepEqual(
    retro.openTrials(it).map((one) => one.name),
    ["a-trial"],
    "an open trial stands, and a closed one and a plain ticket stand nowhere",
  );
});

// [[spec/tickets/an-experiment-ends-decided]]
test("the audit step answers a wait over an open trial, and passes over none", () => {
  const held = box({ [at("spec/tickets/a-trial.md")]: TRIAL("a trial", "open") });
  const said = retro.retro(ROOT, ["audit"], held.it);
  assert.equal(said, 1, "the step holds");

  const clear = box({ [at("spec/tickets/a-trial.md")]: TRIAL("a trial", "closed") });
  assert.equal(retro.retro(ROOT, ["audit"], clear.it), 0, "and it passes over none");
});

// The process a trial names, which the route ends on a decision. [[spec/tickets/an-experiment-ends-decided]]
test("the experiment process ends on a step a person takes", () => {
  assert.equal(typeof retro.EXPERIMENT, "string", "the verb names the process");
  assert.match(retro.EXPERIMENT, /experiment/);
});
