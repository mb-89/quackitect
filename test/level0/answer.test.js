// The rule the answer door reads: which prompts open a turn, and whether the
// session has answered the one standing open.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bandOf,
  checkSpec,
  gateOf,
  opensATurn,
  reachesTheOwner,
  SAYS,
  scoreOf,
  spokeSince,
  wordsIn,
} from "../../.claude/skills/level0/lib/answer.js";
import {
  answerFindings,
  carried,
} from "../../.claude/skills/level0/lib/refuse.js";

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

// [[spec/design_output/level0#the-score-is-a-rate]]
test("the score counts the findings a thousand words, outside a fence", () => {
  const prose = `${"word ".repeat(100).trim()}`;
  assert.equal(wordsIn(prose), 100);
  assert.equal(scoreOf(prose, [{}, {}]), 20);
  assert.equal(scoreOf(prose, []), 0);
  assert.equal(scoreOf("", [{}]), 0);

  const fenced = ["one two three four five", "```", "a b c", "```"].join("\n");
  assert.equal(wordsIn(fenced), 5);
});

// [[spec/design_output/level0#the-three-bands]]
test("the two bands cut the score into three", () => {
  const bands = { warnAt: 5, ceiling: 15 };
  assert.equal(bandOf(0, bands), "clean");
  assert.equal(bandOf(4.9, bands), "clean");
  assert.equal(bandOf(5, bands), "carry");
  assert.equal(bandOf(14.9, bands), "carry");
  assert.equal(bandOf(15, bands), "rewrite");
  assert.equal(bandOf(90, bands), "rewrite");
});

const FOUND = [
  {
    rule: "PastTense",
    line: 1,
    column: 7,
    said: "was",
    message: "Write the present tense.",
  },
];

function over(words = 20) {
  return "word ".repeat(words).trim();
}

// [[spec/design_output/level0#the-re-prompt-over-the-ceiling]]
test("a turn end over the ceiling sends one re-prompt, and a second sends none", () => {
  const gate = gateOf();
  const at = { warnAt: 5, ceiling: 15, mostInARow: 3, found: FOUND, text: over(20) };

  const first = gate.atTurnEnd(at);
  assert.equal(first.band, "rewrite");
  assert.equal(first.score, 50);
  assert.equal(first.sends, true);

  const second = gate.atTurnEnd(at);
  assert.equal(second.sends, false);
  assert.equal(second.held, true);
});

test("a turn end under the warning sends nothing, and holds nothing", () => {
  const gate = gateOf();
  const said = gate.atTurnEnd({
    warnAt: 5,
    ceiling: 15,
    mostInARow: 3,
    found: FOUND,
    text: over(400),
  });
  assert.equal(said.band, "clean");
  assert.equal(said.sends, false);
  assert.equal(gate.waiting(), null);
});

// [[spec/design_output/level0#the-carry-rides-a-prompt]]
test("a turn end in the middle band holds the findings for the next prompt", () => {
  const gate = gateOf();
  const said = gate.atTurnEnd({
    warnAt: 5,
    ceiling: 15,
    mostInARow: 3,
    found: FOUND,
    text: over(100),
  });
  assert.equal(said.band, "carry");
  assert.equal(said.sends, false);
  assert.deepEqual(gate.waiting(), { found: FOUND, score: 10 });
  assert.deepEqual(gate.takeWaiting(), { found: FOUND, score: 10 });
  assert.equal(gate.takeWaiting(), null);
});

test("an answer carrying no finding reads clean, whatever its length", () => {
  const gate = gateOf();
  const said = gate.atTurnEnd({ warnAt: 0, ceiling: 0, found: [], text: "short" });
  assert.equal(said.band, "clean");
  assert.equal(said.sends, false);
});

// [[spec/design_output/level0#the-re-prompt-over-the-ceiling]]
test("mostInARow caps the re-prompts, and a prompt from a person lets go", () => {
  const gate = gateOf();
  const at = { warnAt: 5, ceiling: 15, mostInARow: 2, found: FOUND, text: over(20) };

  for (const count of [1, 2]) {
    gate.sawPrompt(true);
    assert.equal(gate.atTurnEnd(at).sends, true, `re-prompt ${count}`);
  }
  gate.sawPrompt(true);
  const third = gate.atTurnEnd(at);
  assert.equal(third.sends, false);
  assert.equal(third.runaway, true);

  gate.sawPrompt(false);
  assert.equal(gate.inARow(), 0);
  assert.equal(gate.atTurnEnd(at).sends, true);
});

test("the gate holds its re-prompt where the tooth already spoke", () => {
  const gate = gateOf();
  const said = gate.atTurnEnd({
    warnAt: 5,
    ceiling: 15,
    mostInARow: 3,
    found: FOUND,
    text: over(20),
    toothSpoke: true,
  });
  assert.equal(said.sends, false);
  assert.equal(said.held, true);
  assert.deepEqual(gate.waiting(), { found: FOUND, score: 50 });
});

// [[spec/design_output/level0#the-tool-reads-a-draft]]
test("the draft tool names itself, and takes one text", () => {
  const spec = checkSpec();
  assert.equal(spec.name, "check_answer");
  assert.deepEqual(spec.inputSchema.required, ["text"]);
  assert.match(spec.description, /sixty|60/);
});

// [[spec/design_output/level0#what-the-gate-says]]
test("the gate says rewrite over the ceiling, and names every finding", () => {
  const said = answerFindings("level0-answer.md", {
    found: FOUND,
    score: 50,
    band: "rewrite",
  });
  assert.match(said, /^The voice rules refuse this answer\. Write it again\./);
  assert.match(said, /50 findings a thousand words/);
  assert.match(said, /level0-answer\.md:1:7 {2}PastTense/);
  assert.match(said, /wrote: was/);
  assert.match(said, /Hold PastTense for the rest of this turn/);
});

test("the gate reads an answer clean where nothing stands", () => {
  const said = answerFindings("level0-answer.md", {
    found: [],
    score: 0,
    band: "clean",
  });
  assert.match(said, /meets the gate clean/);
});

// [[spec/design_output/level0#the-carry-rides-a-prompt]]
test("the carry is one line naming the findings", () => {
  const said = carried(FOUND, 9.5);
  assert.equal(said.includes("\n"), false);
  assert.match(said, /scored 9\.5 findings a thousand words/);
  assert.match(said, /Hold PastTense/);
});
