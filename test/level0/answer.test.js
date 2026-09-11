// The rule the answer door reads: which prompts open a turn, and whether the
// session has answered the one standing open.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  opensATurn,
  reachesTheOwner,
  SAYS,
  spokeSince,
} from "../../.claude/skills/level0/lib/answer.js";

// [[spec/design_output/level0#the-owners-prompt-comes-first]]
test("a person opens a turn, and a machine does not", () => {
  for (const kind of ["composer", "bridge", "sdk", "scheduled-trigger"]) {
    assert.equal(opensATurn({ kind }), true, kind);
  }
  for (const kind of ["plugin", "peer", "task-notification", "unclassified", ""]) {
    assert.equal(opensATurn({ kind }), false, kind);
  }
  assert.equal(opensATurn(undefined), false);
});

test("a turn nobody has answered reads as unanswered", () => {
  assert.equal(spokeSince([{ role: "user", text: "get to work" }]), false);
  assert.equal(
    spokeSince([
      { role: "user", text: "get to work" },
      { role: "assistant", text: "", toolUses: [{ name: "Read" }] },
    ]),
    false,
  );
});

test("text after the owner's prompt answers it, and a tool result is no prompt", () => {
  assert.equal(
    spokeSince([
      { role: "user", text: "get to work" },
      { role: "assistant", text: "You want the door built. I read the brief first." },
    ]),
    true,
  );
  assert.equal(
    spokeSince([
      { role: "user", text: "get to work" },
      { role: "assistant", text: "I read the brief first." },
      { role: "assistant", text: "", toolUses: [{ name: "Read" }] },
      { role: "user", text: "", toolResults: [{ id: "one", text: "the brief" }] },
    ]),
    true,
  );
});

test("a second prompt reopens the turn the first one closed", () => {
  assert.equal(
    spokeSince([
      { role: "user", text: "get to work" },
      { role: "assistant", text: "I read the brief first." },
      { role: "user", text: "one more thing" },
    ]),
    false,
  );
});

test("an empty transcript reads as unanswered, and a broken one as answered", () => {
  assert.equal(spokeSince([]), false);
  assert.equal(spokeSince(undefined), false);
});

test("a call reaching the owner passes, and every other call does not", () => {
  assert.equal(reachesTheOwner("AskUserQuestion"), true);
  assert.equal(reachesTheOwner("Read"), false);
  assert.equal(reachesTheOwner(undefined), false);
});

test("the refusal quotes the rule it holds", () => {
  assert.match(SAYS, /^The owner asked something and nothing has answered it\./);
  assert.match(SAYS, /Say back what you\n\s*understood and what you do next, then work\.$/);
});
