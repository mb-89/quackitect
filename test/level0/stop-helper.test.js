// The stop a session claims while its helpers run, over a fake box: the turn
// ends on the wait under every binding, the queue too, and a finished helper
// holds nothing up.
// [[spec/design_output/stop#a-helper-still-runs]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { onStop } from "../../src/bridge/stop.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const NOW = 1_800_000_000_000;
const at = (path) => join(ROOT, ...path.split("/"));

const RULES = `
- id: your-helpers-still-run
  side: stop
  priority: 83
  decides: claimed
  runs: helpers-running
  asks: Does a helper you started still run, so its answer wakes this session?
  says: A helper still runs and its answer wakes this session, so this turn ends and waits.

- id: the-queue-holds-work
  side: continue
  priority: 80
  decides: mechanical
  runs: queue-waits
  says: The queue holds work for this box, so run ./RUNME.sh ticket pull and carry on.

- id: the-last-line-names-no-stop
  side: continue
  priority: 50
  decides: mechanical
  runs: no-stop-line
  says: The last line names no stop reason, so this turn holds open.
`;

const FREE =
  "---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n---\n\n# Ask\n\nA thing.\n";

// A box at a binding, over the helper rule, with a free ticket the queue hands out. [[spec/design_output/stop#a-helper-still-runs]]
function helperBox(binding) {
  return {
    disk: fakeDisk({
      [at("spec/config/level0.json")]: JSON.stringify({
        stop: { enabled: true, mostInARow: 3, hold: "off" },
        engine: { binding },
        refactor: { parallel: false },
      }),
      [at("spec/config/stop/level0.yml")]: RULES,
      [at("spec/tickets/a-free.md")]: FREE,
    }),
    work: ROOT,
    method: ROOT,
    env: {},
    clock: { now: () => new Date(NOW) },
    proc: fakeProc({ "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } }),
    log: { say: () => {} },
  };
}

// The turn's end the harness sends, naming one helper at the status given. [[spec/design_output/stop#a-helper-still-runs]]
function waiting(status) {
  return {
    last_assistant_message: "The review runs.\n\nstop: your-helpers-still-run",
    background_tasks: [{ id: "a1", type: "subagent", status, description: "review" }],
  };
}

// [[spec/design_output/stop#a-helper-still-runs]]
test("an unbound session ends its turn while a helper runs", () => {
  assert.deepEqual(onStop(waiting("running"), helperBox("unbound")), { pass: true });
});

// [[spec/design_output/stop#a-helper-still-runs]]
test("a session bound to the queue ends its turn on the wait while a helper runs, over work the queue holds", () => {
  assert.deepEqual(onStop(waiting("running"), helperBox("queue")), { pass: true });
});

// [[spec/design_output/stop#a-helper-still-runs]]
test("the claim holds nothing once every helper has answered", () => {
  const said = onStop(waiting("completed"), helperBox("unbound"));
  assert.match(
    said.result.block,
    /helpers-running answers false: the harness names no helper running/,
  );
});
