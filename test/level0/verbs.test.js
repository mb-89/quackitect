// The voice verbs, over rows alone. Every case here hands a fixture in and
// reads what the function answers, so no disk and no process stand between.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ANSWER,
  answerFiles,
  answersIn,
  DAYS,
  leafOf,
  measuredRows,
  measureTable,
  rankedRefusals,
  refusalsIn,
  refusedTable,
  rowsIn,
  ruleCounts,
  scoreOf,
  SHORTEST,
  sinceOf,
  tabled,
  totalOf,
  wordsIn,
} from "../../.claude/skills/level0/lib/voice.js";

const long = (n) => new Array(n).fill("word").join(" ");

const spoke = (text, more = {}) =>
  JSON.stringify({
    type: "assistant",
    message: { content: [{ type: "text", text }] },
    ...more,
  });

test("a word count reads letters and digits, and skips the punctuation", () => {
  assert.equal(wordsIn("one two three"), 3);
  assert.equal(wordsIn("one, two. three!"), 3);
  assert.equal(wordsIn("a well-made thing"), 3);
  assert.equal(wordsIn(""), 0);
  assert.equal(wordsIn(undefined), 0);
});

test("a line nobody can read drops out, and the rest stand", () => {
  const text = ['{"a":1}', "", "{ this is not json", '{"a":2}'].join("\n");
  assert.deepEqual(rowsIn(text), [{ a: 1 }, { a: 2 }]);
  assert.deepEqual(rowsIn(""), []);
});

test("an answer comes out of a transcript, and a helper stays behind", () => {
  const text = [
    spoke(long(SHORTEST + 5)),
    spoke(long(SHORTEST), { isSidechain: true }),
    spoke(long(SHORTEST), { agentId: "one" }),
    spoke(long(SHORTEST - 1)),
    JSON.stringify({ type: "user", message: { content: [{ type: "text", text: long(40) }] } }),
  ].join("\n");

  const found = answersIn(text);
  assert.equal(found.length, 1, "the sidechain, the helper and the short one go");
  assert.equal(wordsIn(found[0]), SHORTEST + 5);
});

test("an answer lands under a numbered name the answer register reads", () => {
  const files = answerFiles("one-session", ["first", "second"]);
  assert.deepEqual(
    files.map((one) => one.path),
    [`.se/measure/one-session/001-${ANSWER}`, `.se/measure/one-session/002-${ANSWER}`],
  );
  assert.ok(files[0].path.endsWith(ANSWER), "so .vale.ini reads it as an answer");
  assert.equal(files[0].text, "first\n");
});

test("the score is findings a thousand words, to one place", () => {
  assert.equal(scoreOf(1000, 6), 6);
  assert.equal(scoreOf(517, 6), 11.6);
  assert.equal(scoreOf(0, 4), 0, "an empty file scores nothing");
  assert.equal(scoreOf(200, 0), 0);
});

test("a rule shows its leaf, so a style prefix drops off", () => {
  assert.equal(leafOf("VoiceVale.PastTense"), "PastTense");
  assert.equal(leafOf("Schema.Kind"), "Kind");
  assert.equal(leafOf("ShellWritesNothing"), "ShellWritesNothing");
  assert.equal(leafOf(undefined), "");
});

test("the rules rank by how often each one fires", () => {
  const found = [
    { rule: "VoiceVale.LongSentence" },
    { rule: "VoiceVale.LongSentence" },
    { rule: "VoiceVale.Passive" },
    { rule: "VoiceVale.LongSentence" },
    { rule: "VoiceVale.Passive" },
    { rule: "" },
  ];
  assert.deepEqual(ruleCounts(found), [
    ["LongSentence", 3],
    ["Passive", 2],
  ]);
  assert.deepEqual(ruleCounts([]), []);
});

test("a dirty file scores over a clean one, and the total sums both", () => {
  const rows = measuredRows([
    {
      file: "003-answer.md",
      words: 517,
      found: [
        ...new Array(4).fill(0).map(() => ({ rule: "VoiceVale.LongSentence" })),
        ...new Array(2).fill(0).map(() => ({ rule: "VoiceVale.Passive" })),
      ],
    },
    { file: "004-answer.md", words: 483, found: [] },
  ]);

  assert.equal(rows[0].findings, 6);
  assert.equal(rows[0].score, 11.6, "the dirty file carries a score");
  assert.deepEqual(rows[0].top, [
    ["LongSentence", 4],
    ["Passive", 2],
  ]);
  assert.equal(rows[1].findings, 0);
  assert.equal(rows[1].score, 0, "the clean file scores nothing");

  const all = totalOf(rows);
  assert.equal(all.words, 1000);
  assert.equal(all.findings, 6);
  assert.equal(all.score, 6);
});

test("a fixture folder scores a number the test names", () => {
  const rows = measuredRows([{ file: "a.md", words: 250, found: [{ rule: "X.Y" }] }]);
  assert.equal(totalOf(rows).score, 4, "one finding in 250 words reads as 4");
});

test("the day count walks the clock back, and the caller names now", () => {
  assert.equal(sinceOf("2026-09-12T00:00:00.000Z", 7), "2026-09-05T00:00:00.000Z");
  assert.equal(sinceOf("2026-09-12T00:00:00.000Z", DAYS), "2026-09-05T00:00:00.000Z");
  assert.equal(sinceOf("2026-01-03T00:00:00.000Z", 7), "2025-12-27T00:00:00.000Z");
});

test("refused keeps a warn row carrying a rule, inside the days", () => {
  const rows = [
    { at: "2026-09-11T00:00:00.000Z", level: "warn", rule: "VoiceVale.PastTense" },
    { at: "2026-09-11T00:00:00.000Z", level: "info", rule: "VoiceVale.PastTense" },
    { at: "2026-09-11T00:00:00.000Z", level: "warn", said: "no rule here" },
    { at: "2026-08-01T00:00:00.000Z", level: "warn", rule: "VoiceVale.Passive" },
  ];
  const since = sinceOf("2026-09-12T00:00:00.000Z", DAYS);
  assert.deepEqual(
    refusalsIn(rows, since).map((one) => one.rule),
    ["VoiceVale.PastTense"],
    "the info row, the ruleless row and the old row all drop",
  );
  assert.equal(refusalsIn(rows, "").length, 2, "no day count keeps the old row too");
});

test("a fixture log ranks its rows in the order the test names", () => {
  const one = (name, more) => ({ level: "warn", rule: name, ...more });
  const ranked = rankedRefusals([
    ...new Array(14).fill(0).map(() => one("VoiceVale.PastTense", { phrase: "bold" })),
    ...new Array(11).fill(0).map(() => one("VoiceVale.LongSentence", { phrase: "..." })),
    ...new Array(3).fill(0).map(() => one("ShellWritesNothing", { tool: "Bash" })),
  ]);

  assert.deepEqual(ranked, [
    { rule: "PastTense", phrase: "bold", fires: 14 },
    { rule: "LongSentence", phrase: "...", fires: 11 },
    { rule: "ShellWritesNothing", phrase: "Bash", fires: 3 },
  ]);
});

test("a row carrying no phrase falls back to the tool that meets it", () => {
  const ranked = rankedRefusals([
    { level: "warn", rule: "VoiceVale.Passive", tool: "Write" },
    { level: "warn", rule: "VoiceVale.Passive", phrase: "a phrase" },
  ]);
  assert.deepEqual(
    ranked.map((each) => each.phrase).sort(),
    ["Write", "a phrase"],
    "the phrase wins where the row carries one",
  );
});

test("a table pads each column, and the numbers stand to the right", () => {
  const drawn = tabled(
    ["rule", "fires"],
    [
      ["PastTense", 14],
      ["X", 3],
    ],
    [1],
  );
  assert.deepEqual(drawn.split("\n"), [
    "rule       fires",
    "PastTense     14",
    "X              3",
  ]);
});

test("the two tables read the way the brief draws them", () => {
  const rows = measuredRows([
    {
      file: "003-answer.md",
      words: 517,
      found: [
        ...new Array(4).fill(0).map(() => ({ rule: "VoiceVale.LongSentence" })),
        ...new Array(2).fill(0).map(() => ({ rule: "VoiceVale.Passive" })),
      ],
    },
  ]);
  const drawn = measureTable(rows).split("\n");
  assert.match(drawn[0], /^file\s+words\s+findings\s+per 1000 words\s+top rules$/);
  assert.match(drawn[1], /^003-answer\.md\s+517\s+6\s+11\.6\s+LongSentence 4, Passive 2$/);

  const ranked = refusedTable(rankedRefusals([{ level: "warn", rule: "A.B", phrase: "x" }]));
  assert.match(ranked.split("\n")[0], /^rule\s+fires\s+phrase$/);
  assert.match(ranked.split("\n")[1], /^B\s+1\s+x$/);
});
