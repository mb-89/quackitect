// The owner-step claim on a cloud box: the box hands a person's step back as a
// ticket through branch done, so no step there waits on a person.
// [[spec/design_output/stop#three-in-a-row]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { STOP_CALL } from "../../.claude/skills/level0/lib/stop.js";
import { TOOLS } from "../../src/bridge/stop.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

const RULES = `
- id: the-owner-holds-the-step
  side: stop
  priority: 88
  decides: claimed
  waits: owner
  runs: step-waits-on-person
  asks: Does the ticket in hand, or its group, stand at a step a person takes?
  says: The ticket in hand waits on the owner's step, so this turn ends and waits.
`;

const TICKET =
  "---\nkind: [[ticket]]\nstate: open\nsteps:\n  - name: design\n    steps:\n      - name: draft\n        by: anyone\n      - name: person-1\n        by: person\nstep: design/person-1\n---\n\n# Ask\n\nA thing.\n";

const HOLD = JSON.stringify({
  ticket: "a-ticket",
  path: "spec/tickets/a-ticket.md",
  step: "design/person-1",
  hand: "box b1",
});

function boxOn(env) {
  return {
    disk: fakeDisk({
      [at("spec/config/level0.json")]: JSON.stringify({
        stop: { enabled: true, mostInARow: 3, hold: "off" },
        engine: { binding: "queue" },
      }),
      [at("spec/config/stop/level0.yml")]: RULES,
      [at(".se/.runtime/hold/b1.json")]: HOLD,
      [at("spec/tickets/a-ticket.md")]: TICKET,
    }),
    work: ROOT,
    method: ROOT,
    env,
    clock: { now: () => new Date(1_800_000_000_000) },
    proc: fakeProc({ "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } }),
    log: { say: () => {} },
  };
}

test("a cloud box at a person's step refuses the owner-step claim, and a desk keeps it", () => {
  const claim = { reason: "the-owner-holds-the-step" };
  const cloud = TOOLS[STOP_CALL](claim, boxOn({ CLAUDE_CODE_REMOTE: "true" }));
  assert.match(cloud.result.result, /The claim falls/);
  const desk = TOOLS[STOP_CALL](claim, boxOn({}));
  assert.match(desk.result.result, /The claim stands/);
});
