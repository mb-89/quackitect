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

test("Role reads the tracked notes, and the private half costs no call", () => {
  const rule = ruleNamed("Role");
  for (const path of ["spec/guidance/voice.md", "spec/funnel/a.md", "README.md"]) {
    assert.equal(readsFor(rule, path), true, path);
  }
  for (const path of [".se/HANDOVER.md", ".se/notes/one.md", "src/scripts/cli.js"]) {
    assert.equal(readsFor(rule, path), false, path);
  }
});
