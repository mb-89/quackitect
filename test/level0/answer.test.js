// The rule the answer door reads: which prompts open a turn, and whether the
// session has answered the one standing open.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bandOf,
  CELL_WORDS,
  checkSpec,
  gateOf,
  LENGTH,
  lengthFaults,
  NEEDS,
  needsFaults,
  opensATurn,
  proseWordsIn,
  questionsIn,
  reachesTheOwner,
  SAYS,
  scoreOf,
  shapeIn,
  spokeSince,
  TABLE,
  tableFaults,
  wordsIn,
} from "../../.claude/skills/level0/lib/answer.js";
import { answerFindings } from "../../.claude/skills/level0/lib/refuse.js";

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
  assert.match(SAYS, /Write the answer in\nthe chat, as text: what you understood and what you do next\. Then work\./);
  assert.doesNotMatch(SAYS, /Call mcp__level0__log/);
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

// [[spec/design_output/level0#the-findings-ride-the-call]]
test("a turn end over the ceiling holds the findings for the next call, once", () => {
  const gate = gateOf();
  const at = { warnAt: 5, ceiling: 15, found: FOUND, text: over(20) };

  const first = gate.atTurnEnd(at);
  assert.equal(first.band, "rewrite");
  assert.equal(first.score, 50);
  assert.deepEqual(gate.waiting(), { found: FOUND, score: 50, band: "rewrite" });
  assert.deepEqual(gate.takeWaiting(), { found: FOUND, score: 50, band: "rewrite" });
  assert.equal(gate.takeWaiting(), null, "the findings ride once");
});

test("a turn end under the warning holds nothing", () => {
  const gate = gateOf();
  const said = gate.atTurnEnd({ warnAt: 5, ceiling: 15, found: FOUND, text: over(400) });
  assert.equal(said.band, "clean");
  assert.equal(gate.waiting(), null);
});

// [[spec/design_output/level0#the-three-bands]]
test("a turn end in the middle band holds the findings at carry", () => {
  const gate = gateOf();
  const said = gate.atTurnEnd({ warnAt: 5, ceiling: 15, found: FOUND, text: over(100) });
  assert.equal(said.band, "carry");
  assert.equal(gate.waiting().band, "carry");
});

test("an answer carrying no finding reads clean, whatever its length", () => {
  const gate = gateOf();
  const said = gate.atTurnEnd({ warnAt: 0, ceiling: 0, found: [], text: "short" });
  assert.equal(said.band, "clean");
  assert.equal(gate.waiting(), null);
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

// [[spec/design_output/level0#the-door-counts-the-questions]]
test("a prompt with two questions counts two, and a fenced one counts none", () => {
  assert.equal(questionsIn("Where does the door stand? What does it read?"), 2);
  assert.equal(questionsIn("Build the door.\nRun the tests."), 0);
  assert.equal(questionsIn("```\nWhere does it stand?\n```\n"), 0);
  assert.equal(questionsIn("Where does it stand?\n```\nAnd here?\n```\n"), 1);
  assert.equal(questionsIn("Where does it stand??"), 1);
  assert.equal(questionsIn(undefined), 0);
});

// [[spec/design_output/level0#the-table-answers-every-question]]
const TABLE_ROWS = [
  "| question | answer |",
  "|---|---|",
  "| where does it stand | in `lib/answer.js` |",
  "| what does it read | the first block |",
].join("\n");

test("a count of zero demands no table", () => {
  assert.deepEqual(tableFaults("The door stands here.", 0), []);
  assert.deepEqual(tableFaults("The door stands here.", undefined), []);
});

test("an answer opening with prose refuses under a count of two", () => {
  const found = tableFaults("The door stands here.\n\nMore text.\n", 2);
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, TABLE);
  assert.equal(found[0].line, 1);
  assert.match(found[0].message, /asks 2 questions/);
  assert.match(found[0].message, /opens with no table/);
});

test("a table naming the two columns and a row a question passes", () => {
  assert.deepEqual(tableFaults(`${TABLE_ROWS}\n\nThe detail follows.\n`, 2), []);
  assert.deepEqual(tableFaults(`\n\n${TABLE_ROWS}\n`, 1), []);
});

test("a table short of a row names the shortfall", () => {
  const found = tableFaults(`${TABLE_ROWS}\n`, 3);
  assert.equal(found.length, 1);
  assert.match(found[0].message, /holds 2 rows/);
});

test("a table under other column names refuses", () => {
  const said = "| ask | said |\n|---|---|\n| where | here |\n";
  const found = tableFaults(said, 1);
  assert.equal(found.length, 1);
  assert.match(found[0].message, /reads ask, said/);
});

test("a heading and a list open no question table", () => {
  assert.match(tableFaults("# The door\n", 1)[0].message, /no table/);
  assert.match(tableFaults("- The door stands here.\n", 1)[0].message, /no table/);
});

// [[spec/design_output/level0#the-needs-table]]
const NEEDS_ROWS = [
  "## What the agent needs",
  "",
  "| No. | Question | Proposed answer |",
  "|---|---|---|",
  "| 1 | Push main red? | No, hold it local. |",
  "| 2 | Cap the words? | Yes, 150 an answer. |",
].join("\n");

test("an answer with no stop line demands no needs table", () => {
  assert.deepEqual(needsFaults("The door stands here.", null), []);
});

test("a needs table under its heading passes", () => {
  assert.deepEqual(needsFaults(`The door stands.\n\n${NEEDS_ROWS}\n`, { reason: "x" }), []);
});

test("a stop line with prose above it refuses", () => {
  const found = needsFaults("The door stands.\n\nMore prose.", { reason: "x" });
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, NEEDS);
  assert.match(found[0].message, /no table above it/);
});

test("a needs table under no heading refuses", () => {
  const bare = NEEDS_ROWS.split("\n").slice(2).join("\n");
  assert.match(needsFaults(`Prose.\n\n${bare}`, {})[0].message, /under no heading/);
});

test("a needs table under other column names refuses", () => {
  const said = "## What the agent needs\n\n| question | answer |\n|---|---|\n| a | b |";
  assert.match(needsFaults(said, {})[0].message, /reads question, answer/);
});

test("a needs table numbers its rows in order", () => {
  const found = needsFaults(NEEDS_ROWS.replace("| 2 |", "| 3 |"), {});
  assert.equal(found.length, 1);
  assert.match(found[0].message, /Row 2 .* carries the number 3/);
});

test("a needs table cell holds no code and few words", () => {
  const code = NEEDS_ROWS.replace("No, hold it local.", "Run `branch close`.");
  assert.match(needsFaults(code, {})[0].message, /holds no code/);
  const long = NEEDS_ROWS.replace("No, hold it local.", "word ".repeat(CELL_WORDS + 1).trim());
  assert.match(needsFaults(long, {})[0].message, new RegExp(`holds ${CELL_WORDS + 1}`));
});

test("a needs table with no row refuses", () => {
  const empty = NEEDS_ROWS.split("\n").slice(0, 4).join("\n");
  assert.match(needsFaults(empty, {})[0].message, /holds no row/);
});

// [[spec/design_output/level0#the-cap-counts-the-prose]]
test("the cap counts prose and leaves tables and fences out", () => {
  const fence = "```\nfour five\n```";
  assert.equal(proseWordsIn(`one two three\n\n${NEEDS_ROWS}\n\n${fence}\n`), 7);
});

test("an answer over the cap refuses, and one under it passes", () => {
  assert.deepEqual(lengthFaults("word ".repeat(150), 150), []);
  const found = lengthFaults("word ".repeat(151), 150);
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, LENGTH);
  assert.match(found[0].message, /holds 151/);
  assert.deepEqual(lengthFaults("word ".repeat(900), undefined), []);
});

// [[spec/design_output/level0#a-shape-finding-rewrites]]
test("a shape finding asks for a rewrite whatever the score", () => {
  const bands = { warnAt: 5, ceiling: 15 };
  assert.equal(shapeIn([{ rule: NEEDS }]), true);
  assert.equal(shapeIn([{ rule: "Passive" }]), false);
  assert.equal(bandOf(0.1, bands, [{ rule: NEEDS }]), "rewrite");
  assert.equal(bandOf(0.1, bands, [{ rule: "Passive" }]), "clean");
});
