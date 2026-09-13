// The judge and the rule-file reader. The judge takes a classifier of its own,
// so these tests spend no model call, and its rule stands here as text. The
// case over the rule files this tree ships stands in test/contract.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chaptersIn,
  judgeOf,
  refusedBy,
  spansIn,
} from "../../.claude/skills/level0/lib/judge.js";
import { readRule } from "../../.claude/skills/level0/lib/rulefile.js";

const settings = {
  enabled: true,
  model: "haiku",
  maxSpans: 24,
  warmupWrites: 4,
  thenEveryNth: 3,
};

const ACTIONABLE = [
  'message: "Write what the reader does next. Put the background in spec/rationales."',
  "level: error",
  'ask: "Does this text tell the reader what to do, or where it came from?"',
  "labels:",
  "  - actionable",
  "  - background",
  "refuses: background",
].join("\n");

const rules = [{ ...readRule(ACTIONABLE), name: "Actionable" }];

test("a rule file reads into scalars and a list", () => {
  const read = readRule(
    [
      "# a comment",
      'message: "say a thing"',
      "level: error",
      "labels:",
      "  - one",
      "  - two",
      "refuses: two",
      "max: 3",
      "on: true",
    ].join("\n"),
  );
  assert.deepEqual(read, {
    message: "say a thing",
    level: "error",
    labels: ["one", "two"],
    refuses: "two",
    max: 3,
    on: true,
  });
});

test("a span is a paragraph, and structure carries none", () => {
  const spans = spansIn(
    "A paragraph long enough to be worth a call from the judge here.\n\n- a list item\n\n| a | b |\n",
  );
  assert.equal(spans.length, 1);
  assert.match(spans[0].text, /^A paragraph long enough/);
});

test("a short line costs no model call", () => {
  assert.deepEqual(spansIn("Too short.\n"), []);
});

test("the judge refuses on its refusing label and passes on the other", async () => {
  const judge = judgeOf(settings, rules);
  const long =
    "This explains where the thing came from and what somebody once tried before now.";

  const found = await judge.run(long, async () => "background");
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "Actionable");
  assert.match(found[0].message, /spec\/rationales/);

  assert.deepEqual(await judge.run(long, async () => "actionable"), []);
});

// [[spec/design_output/level0#a-judged-rule-scopes]]
test("a rule ignoring a folder costs no model call inside it", async () => {
  const scoped = [
    { ...readRule(`${ACTIONABLE}\nignores:\n  - spec/rationales/*.md`), name: "Actionable" },
  ];
  const judge = judgeOf(settings, scoped);
  const long =
    "This explains where the thing came from and what somebody once tried before now.";

  let asked = 0;
  const says = async () => {
    asked++;
    return "background";
  };

  assert.deepEqual(await judge.run(long, says, "spec/rationales/testing.md"), []);
  assert.equal(asked, 0, "a file the globs reach costs nothing");

  const found = await judge.run(long, says, "spec/guidance/testing.md");
  assert.equal(found.length, 1, "the rule stands everywhere else");
  assert.equal(asked, 1);
});

test("a rule naming the folder it reads costs no model call outside it", async () => {
  const scoped = [
    { ...readRule(`${ACTIONABLE}\nreads:\n  - spec/guidance/*.md`), name: "Actionable" },
  ];
  const judge = judgeOf(settings, scoped);
  const long =
    "This explains where the thing came from and what somebody once tried before now.";

  let asked = 0;
  const says = async () => {
    asked++;
    return "background";
  };

  assert.deepEqual(await judge.run(long, says, ".se/HANDOVER.md"), []);
  assert.equal(asked, 0, "a path outside the folder costs nothing");

  const found = await judge.run(long, says, "spec/guidance/testing.md");
  assert.equal(found.length, 1, "the rule stands inside it");
  assert.equal(asked, 1);
});

test("a rule naming no folder reads every path", async () => {
  const judge = judgeOf(settings, rules);
  const long =
    "This explains where the thing came from and what somebody once tried before now.";

  const found = await judge.run(long, async () => "background", "spec/rationales/a.md");
  assert.equal(found.length, 1);
});

test("a model naming no label passes the text", async () => {
  const judge = judgeOf(settings, rules);
  const long =
    "This explains where the thing came from and what somebody once tried before now.";
  assert.deepEqual(await judge.run(long, async () => undefined), []);
  assert.deepEqual(
    await judge.run(long, async () => {
      throw new Error("no model");
    }),
    [],
  );
});

// [[spec/design_output/level0#a-judged-rule-cuts]]
test("a rule refusing two labels refuses both, and passes the third", async () => {
  const shape = [
    'message: "Reach for a table first."',
    'ask: "Do these sentences give the same fields for different things?"',
    "labels:",
    "  - prose",
    "  - table",
    "  - diagram",
    "refuses:",
    "  - table",
    "  - diagram",
  ].join("\n");
  const rule = { ...readRule(shape), name: "ShapeFits" };
  assert.deepEqual(rule.refuses, ["table", "diagram"]);

  const judge = judgeOf(settings, [rule]);
  const long =
    "The first door takes a write, the second door takes a command, and the third takes an answer.";

  for (const label of ["table", "diagram"]) {
    const found = await judge.run(long, async () => label);
    assert.equal(found.length, 1, `${label} refuses`);
    assert.equal(found[0].rule, "ShapeFits");
  }
  assert.deepEqual(await judge.run(long, async () => "prose"), []);
});

test("a rule naming no label refuses nothing", () => {
  assert.equal(refusedBy({}, "late"), false);
  assert.equal(refusedBy({ refuses: "late" }, undefined), false);
  assert.equal(refusedBy({ refuses: ["late"] }, "late"), true);
});

// [[spec/design_output/level0#a-judged-rule-cuts]]
test("a chapter carries its heading, and the frontmatter carries none", () => {
  const note = [
    "---",
    "kind: [[guidance]]",
    "---",
    "",
    "# The first chapter",
    "",
    "A first chapter long enough to be worth a call from the judge here.",
    "",
    "# The second chapter",
    "",
    "A second chapter long enough to be worth a call from the judge here.",
  ].join("\n");

  const chapters = chaptersIn(note);
  assert.equal(chapters.length, 2);
  assert.match(chapters[0].text, /^# The first chapter/);
  assert.match(chapters[1].text, /^# The second chapter/);
  assert.equal(chapters[1].line, 9);
  assert.ok(!chapters[0].text.includes("kind:"), "the frontmatter stands outside");
});

test("the lines above a first heading make no chapter, and a note with none makes one", () => {
  const tail = "The tail of a chapter above, long enough for the judge to read it here.";
  const next = "A chapter under its heading, long enough for the judge to read it here.";
  const edit = `${tail}\n\n## The next chapter\n\n${next}\n`;

  const chapters = chaptersIn(edit);
  assert.equal(chapters.length, 1);
  assert.match(chapters[0].text, /^## The next chapter/);
  assert.equal(chapters[0].line, 3);

  assert.equal(chaptersIn(tail).length, 1, "a note with no heading stands whole");
});

test("a heading inside a fence opens no chapter", () => {
  const said = [
    "# One chapter",
    "",
    "```",
    "# a shell comment, and no heading at all, standing inside the fence here",
    "```",
    "",
    "A line under the fence, long enough for the judge to read it as prose.",
  ].join("\n");
  assert.equal(chaptersIn(said).length, 1);
});

// [[spec/design_output/level0#a-judged-rule-cuts]]
test("a rule reads one paragraph, and a rule reading a chapter takes both", async () => {
  const text = [
    "# A heading",
    "",
    "The first paragraph stands here, and it runs long enough to reach the judge.",
    "",
    "The second paragraph stands here, and it runs long enough to reach the judge.",
  ].join("\n");

  const asked = [];
  const says = async (said) => {
    asked.push(said);
    return "clean";
  };

  await judgeOf(settings, [{ ...readRule(ACTIONABLE), name: "Actionable" }]).run(text, says);
  assert.equal(asked.length, 2, "a paragraph rule asks once per paragraph");

  asked.length = 0;
  const chaptered = { ...readRule(`${ACTIONABLE}\nspan: chapter`), name: "BottomLineFirst" };
  await judgeOf(settings, [chaptered]).run(text, says);
  assert.equal(asked.length, 1, "a chapter rule asks once per chapter");
  assert.match(asked[0], /A heading/);
});

test("the judge is off where the settings say so", () => {
  assert.equal(judgeOf({ ...settings, enabled: false }, rules).reads(), false);
});

test("the judge is off when no rule file stands", () => {
  assert.equal(judgeOf(settings, []).reads(), false);
});

test("the judge reads every warmup write, then samples, and a breach resets it", () => {
  const judge = judgeOf(settings, rules);
  for (let i = 0; i < settings.warmupWrites; i++) {
    assert.equal(judge.reads(), true, `write ${i + 1} is inside the warmup`);
    judge.sawClean();
  }
  assert.ok(
    [judge.reads(), judge.reads(), judge.reads()].includes(false),
    "it stops reading every write once the session proves itself",
  );

  judge.sawBreach();
  assert.equal(judge.reads(), true, "a breach puts it back to reading everything");
});
