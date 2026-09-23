// The answer door over a fake box: a report pays the demand at once, every
// call after passes, and the words name the chat first. The log keeps an
// answer's lines.
// [[spec/design_output/level0#the-reply-line]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { ANSWER_KIND, rowOf } from "../../.claude/skills/level0/lib/log.js";
import {
  demands,
  holdsForAnswer,
  onMessageDisplay,
  pays,
  SAYS,
} from "../../src/bridge/answer.js";

function box() {
  const said = [];
  return { said, log: { say: (...row) => said.push(row) } };
}

// [[spec/design_output/level0#the-first-call-meets-the-gate]]
test("a report pays the demand, and no call after it meets the door", () => {
  const it = box();
  demands(it, "The owner sent a prompt");
  assert.deepEqual(
    holdsForAnswer({ tool: "Read" }, it),
    { needs: "reply" },
    "the first call after the prompt asks for the reply",
  );

  const answer = pays(it, "Understood: the tests first, then the door.");
  assert.match(answer, /answers: The owner sent a prompt/);
  assert.match(answer, /Write it in the chat too/);
  assert.equal(it.demand, null);
  assert.deepEqual(
    holdsForAnswer({ tool: "Read" }, it),
    null,
    "and nothing warns after",
  );
  assert.deepEqual(holdsForAnswer({ tool: "Edit" }, it), null);
  assert.equal(it.said.at(-1)[1], "reply", "the log carries the reply");
});

test("a report with no demand lands in the log, and still asks for the chat", () => {
  const it = box();
  assert.match(pays(it, "An update."), /Nothing asked for one.*chat/);
  assert.equal(it.said[0][1], "reply");
});

test("the door's words put the chat first and the report beside it", () => {
  const said = SAYS("The owner sent a prompt");
  assert.match(said, /write it in the chat as text/);
  assert.match(said, /mcp__level0__report with the same text/);
  assert.match(said, /pays/, "and the words say the chat pays it");
});

// The client posts every displayed text, so a text between two calls reaches the door. [[spec/tickets/the-answer-door-reads-chat]]
test("a text the chat shows between two calls pays the demand", () => {
  const it = box();
  demands(it, "The owner sent a prompt");
  holdsForAnswer({ tool: "Read" }, it);

  onMessageDisplay({ delta: "Understood: the door first, then the chapters." }, it);
  assert.equal(it.demand, null, "the displayed text pays it");
  assert.equal(it.said.at(-1)[1], "reply", "and the log carries the reply");
});

// [[spec/tickets/the-answer-door-reads-chat]]
test("the call after a text the chat shows meets no refusal", () => {
  const it = box();
  demands(it, "The owner sent a prompt");
  holdsForAnswer({ tool: "Read" }, it);
  onMessageDisplay({ delta: "The work goes on." }, it);

  assert.deepEqual(holdsForAnswer({ tool: "Read" }, it), null);
  assert.deepEqual(holdsForAnswer({ tool: "Edit" }, it), null);
});

// [[spec/tickets/the-answer-door-reads-chat]]
test("a display carrying no text leaves the demand standing", () => {
  const it = box();
  demands(it, "The owner sent a prompt");
  holdsForAnswer({ tool: "Read" }, it);

  onMessageDisplay({ delta: "   " }, it);
  assert.notEqual(it.demand, null, "the demand stands over an empty text");
  assert.deepEqual(holdsForAnswer({ tool: "Read" }, it), { needs: "reply" });
});

// [[spec/design_output/log#an-answer-stands-in-chat]]
test("an answer row keeps its lines, so a list and a table keep their shape, and any other row reads as one line", () => {
  const text = "- one\n- two\n\n| a | b |\n|---|---|\n| 1 | 2 |";
  assert.equal(rowOf("now", "info", ANSWER_KIND, text).said, text);
  assert.equal(
    rowOf("now", "info", "reply", text).said,
    "- one - two | a | b | |---|---| | 1 | 2 |",
  );
});
