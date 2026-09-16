// The stop door over a fake box: a standing stop ends the turn with nothing
// after it, a helper's turn end passes untouched, and a turn with no stop
// line holds with the ask.
// [[spec/design_output/stop#a-standing-stop-ends-it]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { onStop } from "../../src/bridge/stop.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

const RULES = `
- id: the-queue-holds-work
  side: continue
  priority: 80
  decides: mechanical
  runs: queue-waits
  firm: true
  says: The queue holds work for this box, so run ./RUNME.sh branch pull and carry on.

- id: the-last-line-names-no-stop
  side: continue
  priority: 50
  decides: mechanical
  runs: no-stop-line
  says: The last line names no stop reason, so this turn holds open.

- id: the-work-stands-complete
  side: stop
  priority: 45
  decides: claimed
  asks: Does the work stand complete?
  says: The work stands complete, so this turn ends.

- id: the-tooth-is-out
  side: continue
  priority: 0
  decides: mechanical
  runs: stop-hook-off
  says: The stop hook stands off.
`;

const CONFIG = JSON.stringify({
  stop: { enabled: true, mostInARow: 3, hold: "off" },
  engine: { binding: "queue" },
});

function box(files = {}) {
  const disk = fakeDisk({
    [at("spec/config/level0.json")]: CONFIG,
    [at("spec/config/stop/level0.yml")]: RULES,
    ...files,
  });
  const said = [];
  return {
    said,
    box: {
      disk,
      work: ROOT,
      method: ROOT,
      env: {},
      proc: fakeProc({ "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } }),
      log: { say: (...row) => said.push(row) },
    },
  };
}

test("a standing stop line ends the turn, and nothing prompts after it", () => {
  const it = box();
  const said = onStop(
    { last_assistant_message: "The work stands.\n\nstop: the-work-stands-complete" },
    it.box,
  );
  assert.deepEqual(said, { pass: true });
  assert.equal(
    it.said.filter((row) => row[1] === "stop").length,
    1,
    "one stop line in the log",
  );
  assert.match(it.said[0][2], /the turn ends/);
});

test("a helper's turn end passes untouched, so a refused helper answer reaches no owner turn", () => {
  const it = box();
  const said = onStop(
    { agentId: "a1", last_assistant_message: "No stop line here." },
    it.box,
  );
  assert.deepEqual(said, { pass: true });
  assert.equal(it.said.length, 0, "the door writes nothing for a helper");
});

test("a turn with no stop line holds, and the block names the reasons", () => {
  const it = box();
  const said = onStop({ last_assistant_message: "Some text and no stop." }, it.box);
  assert.match(said.result.block, /names no stop reason/);
  assert.match(
    said.result.block,
    /the-work-stands-complete: Does the work stand complete\?/,
  );
  assert.match(it.said[0][2], /the turn holds/);
  assert.match(
    it.said[0][3].prompts,
    /names no stop reason/,
    "the log carries what prompts after",
  );
});

test("the queue holds a stop on completion while a free ticket stands", () => {
  const free =
    "---\nkind: [[ticket]]\nstate: open\nurgency: soon\nsteps:\n  - name: do\n---\n\n# Ask\n\nA thing.\n";
  const it = box({ [at("spec/tickets/a-free.md")]: free });
  const said = onStop(
    { last_assistant_message: "Done.\n\nstop: the-work-stands-complete" },
    it.box,
  );
  assert.match(said.result.block, /The queue holds work for this box/);
});
