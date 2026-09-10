// The judge and the rule-file reader. The judge takes a classifier of its own,
// so these tests spend no model call, and its rule stands here as text. The
// case over the rule files this tree ships stands in test/contract.

import assert from "node:assert/strict";
import { test } from "node:test";
import { judgeOf, spansIn } from "../../.claude/skills/level0/lib/judge.js";
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
