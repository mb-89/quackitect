// The judged rules this tree ships, read off the disk. A rule file asserted
// against a copy of itself is a rule nobody has read, so these cases open the
// real file and drive the judge over it with a classifier of their own.
// [[spec/design_output/private#the-judged-half]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { judgeOf, readsFor } from "../../.claude/skills/level0/lib/judge.js";
import { readRule } from "../../.claude/skills/level0/lib/rulefile.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const JUDGED = join(root, "spec", "config", "styles", "VoiceJudged");

const ruleNamed = (name) => ({
  ...readRule(files.read(join(JUDGED, `${name}.yml`))),
  name,
});

const settings = {
  enabled: true,
  model: "haiku",
  maxSpans: 24,
  warmupWrites: 4,
  thenEveryNth: 3,
};

const SPAN =
  "The owner rules that a raw note stays home, and the agent writes the tracked half for a reader who sees no note at all.";

test("Role asks one question, names two labels and refuses the person", () => {
  const rule = ruleNamed("Role");
  assert.deepEqual(rule.labels, ["role", "person"]);
  assert.equal(rule.refuses, "person");
  assert.match(rule.ask, /role/);
  assert.match(rule.message, /owner, the agent, the reader, the reviewer/);
});

test("Role refuses a span the judge calls a person, and passes one it calls a role", async () => {
  const judge = judgeOf(settings, [ruleNamed("Role")]);

  const found = await judge.run(SPAN, async () => "person", "spec/guidance/voice.md");
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "Role");
  assert.match(found[0].message, /Name the role/);

  const clean = await judge.run(SPAN, async () => "role", "spec/guidance/voice.md");
  assert.deepEqual(clean, []);
});

// [[spec/design_output/level0#a-judged-rule-cuts]]
test("ShapeFits refuses the table and the diagram, and passes prose", async () => {
  const rule = ruleNamed("ShapeFits");
  assert.deepEqual(rule.labels, ["prose", "table", "diagram"]);
  assert.deepEqual(rule.refuses, ["table", "diagram"]);

  const judge = judgeOf(settings, [rule]);
  for (const label of ["table", "diagram"]) {
    const found = await judge.run(SPAN, async () => label, "spec/guidance/voice.md");
    assert.equal(found.length, 1, label);
    assert.match(found[0].message, /table or a diagram/);
  }
  assert.deepEqual(await judge.run(SPAN, async () => "prose", "spec/guidance/voice.md"), []);
});

// [[spec/design_output/level0#a-judged-rule-cuts]]
test("BottomLineFirst reads a chapter, and refuses an outcome arriving late", async () => {
  const rule = ruleNamed("BottomLineFirst");
  assert.equal(rule.span, "chapter");
  assert.deepEqual(rule.labels, ["first", "late", "even"]);
  assert.equal(rule.refuses, "late");

  const note = `# One chapter\n\n${SPAN}\n\n# Another chapter\n\n${SPAN}\n`;
  const asked = [];
  const judge = judgeOf(settings, [rule]);
  const found = await judge.run(
    note,
    async (said) => {
      asked.push(said);
      return "late";
    },
    "spec/guidance/voice.md",
  );

  assert.equal(asked.length, 2, "one question a chapter");
  assert.match(asked[0], /# One chapter/);
  assert.equal(found.length, 2);
  assert.match(found[0].message, /bottom line first/);
});

test("ShapeFits reads every path, and the two new rules cost nothing under .se", () => {
  assert.equal(readsFor(ruleNamed("ShapeFits"), ".se/HANDOVER.md"), true);
  assert.equal(readsFor(ruleNamed("BottomLineFirst"), ".se/HANDOVER.md"), false);
  assert.equal(readsFor(ruleNamed("BottomLineFirst"), "spec/guidance/voice.md"), true);
});

test("Role reads the tracked notes, and the private half costs no call", () => {
  const rule = ruleNamed("Role");
  for (const path of ["spec/guidance/voice.md", "spec/funnel/a.md", "README.md"]) {
    assert.equal(readsFor(rule, path), true, path);
  }
  for (const path of [".se/HANDOVER.md", ".se/notes/one.md", "src/scripts/cli.js"]) {
    assert.equal(readsFor(rule, path), false, path);
  }
});
