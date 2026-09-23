// The answer door over a fake box: the owner's prompt writes a prompt row and
// asks for a reply, and a helper's hand-back, a task's notice and a helper's
// own turn write nothing the owner reads as theirs.
// [[spec/design_output/log#a-prompt-is-the-owners]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  onMessageDisplay,
  onPromptSubmit,
  onTurnEnd,
} from "../../src/bridge/answer.js";

function box() {
  const rows = [];
  return {
    rows,
    box: { log: { say: (level, kind, said) => rows.push({ level, kind, said }) } },
  };
}

// [[spec/design_output/log#a-prompt-is-the-owners]]
test("the owner's prompt writes a prompt row and asks for a reply", () => {
  const it = box();
  onPromptSubmit(
    { text: "are you still bound?", origin: { kind: "composer" } },
    it.box,
  );
  assert.deepEqual(
    it.rows.map((one) => one.kind),
    ["prompt"],
  );
  assert.ok(it.box.demand, "a reply stands owed");
});

// [[spec/design_output/log#a-prompt-is-the-owners]]
test("a helper's hand-back and a task's notice write an agent row and ask for no reply", () => {
  for (const kind of ["peer", "task-notification"]) {
    const it = box();
    onPromptSubmit({ text: "the report", origin: { kind } }, it.box);
    assert.deepEqual(
      it.rows.map((one) => one.kind),
      ["agent"],
      kind,
    );
    assert.equal(it.box.demand, undefined, `${kind} owes no reply`);
  }
});

// [[spec/design_output/log#a-prompt-is-the-owners]]
test("a helper's turn end and text write no reply row, and pay no demand", () => {
  const it = box();
  onPromptSubmit({ text: "a question", origin: { kind: "composer" } }, it.box);
  onTurnEnd({ agentId: "a1", reason: "answer", answer: "I sent my report." }, it.box);
  onMessageDisplay({ agentId: "a1", delta: "I sent my report." }, it.box);
  assert.deepEqual(
    it.rows.map((one) => one.kind),
    ["prompt"],
  );
  assert.ok(
    it.box.demand,
    "the owner's question still waits for the session's own answer",
  );

  onTurnEnd({ reason: "answer", answer: "Yes, still bound." }, it.box);
  assert.deepEqual(
    it.rows.map((one) => one.kind),
    ["prompt", "reply"],
  );
});
