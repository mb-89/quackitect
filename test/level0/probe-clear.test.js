// The dry probe's clear check: the conversation clears, and the resume prompt
// opens the next one.
// [[spec/tickets/the-clear-continues-the-session]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { RESUME } from "../../src/bridge/handover.js";
import { clearHeld, ENDS } from "../../src/scripts/probe-clear.js";

const FELL = { kind: "hook", said: "the clear the handover asks for fails", detail: "refused" };

function run(over = {}) {
  return {
    cleared: {
      runs: [{ words: "handover --pass", exit: 0, said: "Level zero clears the conversation." }],
      commands: ["clear"],
      prompts: [RESUME],
      ...over,
    },
  };
}

// [[spec/tickets/the-clear-runs-live-remote]]
test("the probe raises the Stop before the turn's completion, the order the live host names", () => {
  assert.deepEqual(ENDS, ["classic.Stop", "turn.complete"]);
});

test("a /clear followed by the resume prompt passes the clear", () => {
  assert.equal(clearHeld([], run()).pass, true);
});

test("no /clear, no resume prompt, a pull that falls, or no clear reached fails the clear", () => {
  assert.equal(clearHeld([], run({ commands: [] })).pass, false);
  assert.equal(clearHeld([], run({ prompts: ["carry on"] })).pass, false);
  assert.equal(clearHeld([], run({ runs: [{ words: "", exit: 1, said: "no ticket" }] })).pass, false);
  assert.equal(clearHeld([], {}).pass, false);
});

test("a pull that falls shows its last line, cut short", () => {
  const said = clearHeld([], run({ runs: [{ words: "", exit: 1, said: `first\n${"x".repeat(400)}` }] }));
  assert.match(said.evidence, /answers 1: x+$/);
  assert.ok(said.evidence.length < 400, "the evidence stays one short line");
});

// [[spec/tickets/the-clear-runs-live-remote]]
test("a pull that falls names what each pull before it answers", () => {
  const runs = [
    { words: "", exit: 0, said: "Call branch done." },
    { words: "handover --pass", exit: 1, said: "nothing stands in your hand." },
  ];
  const said = clearHeld([], run({ runs }));
  assert.equal(said.pass, false);
  assert.match(said.evidence, /^the pull alone answers Call branch done\.; the pull handover --pass answers 1: nothing stands/);
});

test("a clear the plugin meets refused names the refusal", () => {
  const said = clearHeld([FELL], run({ commands: [] }));
  assert.equal(said.pass, false);
  assert.match(said.evidence, /the clear fails: refused/);
});
