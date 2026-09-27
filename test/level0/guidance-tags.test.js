// Guidance resolves by tags: a note under a subfolder carries its folders and
// its own tags, and reaches every step carrying all of them where its env
// matches. The cases stand on a fake tree of a few notes and one process.
// [[spec/design_input/level-two#guidance]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { resolved, tagsOf, unreached } from "../../src/scripts/guidance-hand.js";
import { guidance } from "../../src/scripts/guidance-verb.js";
import { pulling } from "../../src/scripts/work.js";
import { at, CHILD, doors, heard, ROOT, standing } from "./pull-doors.js";

const note = (front, rules, examples = "") =>
  `---\nkind: [[guidance]]\nscope: ["a hand"]\n${front}---\n\n# Actionables\n\n${rules}\n${examples}`;

const CODE = note(
  "",
  "1. Reach the outside through a door.\n2. Name a test as its claim. *\n",
  "\n# Examples\n\n| the rule | do | do not |\n|---|---|---|\n| 1 | a door | a read in place |\n",
);
const TESTING = note("tags: [testing]\n", "1. Watch a test fail first.\n");
const CLOUD = note("env: [SE_CLOUD]\n", "1. Push each finished thing.\n");
const ALONE = note("", "1. Nobody reads this.\n");
const TOP = note("", "1. Say what is.\n");

const PROCESS = `for: a fixture route
steps:
  - name: sync
    tags: [cloud]
    does: takes trunk in
  - name: implement
    tags: [code]
    steps:
      - name: tests-red
        tags: [testing]
        does: writes the tests
      - name: change
        does: makes the change
`;

const NOTES = {
  [at("spec/guidance/code/code.md")]: CODE,
  [at("spec/guidance/code/testing.md")]: TESTING,
  [at("spec/guidance/cloud/cloud.md")]: CLOUD,
  [at("spec/guidance/voice.md")]: TOP,
  [at("spec/processes/fixture.yaml")]: PROCESS,
};

const tree = (more = {}) => ({
  root: ROOT,
  method: ROOT,
  join,
  disk: fakeDisk({ ...NOTES, ...more }),
});

// [[spec/design_input/level-two#guidance]]
test("a note carries a tag for each folder on its path, and the tags its frontmatter names", () => {
  const it = tree();
  assert.deepEqual(tagsOf(it, "spec/guidance/code/code"), ["code"]);
  assert.deepEqual(tagsOf(it, "spec/guidance/code/testing"), ["code", "testing"]);
  assert.deepEqual(tagsOf(it, "spec/guidance/voice"), []);
});

// [[spec/design_input/level-two#guidance]]
test("a note under a subfolder reaches a step carrying all its tags, and its env decides too", () => {
  const it = tree();
  assert.deepEqual(resolved(it, ["code"], {}), ["spec/guidance/code/code"]);
  assert.deepEqual(resolved(it, ["code", "testing"], {}), [
    "spec/guidance/code/code",
    "spec/guidance/code/testing",
  ]);
  assert.deepEqual(
    resolved(it, ["testing"], {}),
    [],
    "a step lacking code reaches no code note",
  );
  assert.deepEqual(
    resolved(it, ["cloud"], {}),
    [],
    "the env reads empty, so the cloud note stays away",
  );
  assert.deepEqual(resolved(it, ["cloud"], { SE_CLOUD: "1" }), [
    "spec/guidance/cloud/cloud",
  ]);
  assert.ok(
    !resolved(it, ["code", "testing", "cloud"], { SE_CLOUD: "1" }).includes(
      "spec/guidance/voice",
    ),
    "a note at the top resolves by no tag",
  );
});

// [[spec/design_input/level-two#guidance]]
test("a note no step of any process reaches stands unreached, and a reached one does not", () => {
  assert.deepEqual(unreached(tree()), []);
  const lost = tree({ [at("spec/guidance/lost/alone.md")]: ALONE });
  assert.deepEqual(unreached(lost), ["spec/guidance/lost/alone"]);
});

const TAGGED = CHILD().replace(
  "    reads: [[spec/guidance/voice]]\n",
  "    tags: [code]\n",
);

// [[spec/design_input/level-two#guidance]]
test("the pull prints each resolved note as a section, its rules numbered as the note numbers them, with its examples", () => {
  const { it } = doors({ ...standing(TAGGED), ...NOTES });
  const { code, said } = heard(() => pulling(ROOT, ["pull"], it));
  assert.equal(code, 0);
  assert.match(
    said,
    /# Reads spec\/guidance\/code\/code\n\n1\. Reach the outside through a door\.\n2\. Name a test as its claim\.\n\n\| the rule \| do \| do not \|/,
  );
  assert.doesNotMatch(said, /spec\/guidance\/code\/testing/);
});

// [[spec/design_input/level-two#guidance]]
test("the guidance verb prints the notes a named step resolves", () => {
  const { it } = doors(NOTES, {}, { root: ROOT });
  const { code, said } = heard(() =>
    guidance(it, ["--step", "fixture:implement/tests-red"]),
  );
  assert.equal(code, 0);
  assert.match(said, /# Reads spec\/guidance\/code\/code/);
  assert.match(
    said,
    /# Reads spec\/guidance\/code\/testing\n\n1\. Watch a test fail first\./,
  );
  assert.doesNotMatch(said, /cloud/);
  const none = heard(() => guidance(it, ["--step", "fixture:nowhere"]));
  assert.equal(none.code, 1);
  assert.match(none.said, /fixture names no step nowhere/);
});
