// The test-first rule, over a staged delta and over the tree. Each case feeds
// the rule a change with no test and asserts the refusal, then feeds it the
// pair and asserts none.
// [[spec/design_output/tree#the-rules-over-two-files]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import {
  everyModuleTested,
  untestedIn,
} from "../../.claude/skills/level0/lib/tested.js";
import { behaves } from "../../src/doors/fake/behaves.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";

const FAKE = "/fake";

const delta = (...files) =>
  files
    .map(
      (one) => `diff --git a/${one} b/${one}\n+++ b/${one}\n@@ -0,0 +1 @@\n+a line\n`,
    )
    .join("");

const fakeTree = (seed, paths = []) =>
  treeOf({
    disk: fakeDisk(
      Object.fromEntries(
        Object.entries(seed).map(([at, said]) => [`${FAKE}/${at}`, said]),
      ),
    ),
    git: fakeGit({ "git ls-files": { stdout: paths.join("\n") } }, FAKE),
    root: FAKE,
  });

test("a change with no test beside it comes back named", () => {
  const said = untestedIn(delta("src/bridge/one.js"));
  assert.deepEqual(said, ["src/bridge/one.js"]);
});

test("a change and its test in one delta pass", () => {
  assert.deepEqual(
    untestedIn(delta("src/bridge/one.js", "test/level0/one.test.js")),
    [],
  );
});

test("a fake and the stub's template want no test of their own", () => {
  assert.deepEqual(untestedIn(delta("src/doors/fake/disk.js")), []);
  assert.deepEqual(
    untestedIn(delta("src/stub/.claude/skills/level0/hooks/bridgehead.js")),
    [],
  );
  assert.deepEqual(untestedIn(delta("src/bridge/one.js")), ["src/bridge/one.js"]);
});

test("a module of the server no test names comes back", () => {
  const tree = fakeTree(
    {
      "src/bridge/one.js": "export const ask = 1;\n",
      "test/level0/other.test.js": "import { one } from '../../src/bridge/other.js';\n",
    },
    ["src/bridge/one.js", "test/level0/other.test.js"],
  );

  const found = everyModuleTested(tree);
  assert.equal(found.length, 1);
  assert.equal(found[0].file, "src/bridge/one.js");
  assert.equal(found[0].rule, "EveryModuleTested");
});

test("a module a test imports stands quiet", () => {
  const tree = fakeTree(
    {
      "src/bridge/one.js": "export const ask = 1;\n",
      "test/level0/one.test.js": "import { one } from '../../src/bridge/one.js';\n",
    },
    ["src/bridge/one.js", "test/level0/one.test.js"],
  );

  assert.deepEqual(everyModuleTested(tree), []);
});

test("a fake throws on the call it lacks, and answers the one it holds", () => {
  const fake = behaves({ read: () => "a line" }, "disk");

  assert.equal(fake.read("one.md"), "a line");
  assert.throws(() => fake.write("one.md", "said"), /disk/);
});

test("the clock a test hands in takes the guard", () => {
  const clock = fakeClock();

  assert.equal(typeof clock.now().getTime(), "number");
  assert.throws(() => clock.sleep(1), /clock/);
});

test("a change wants the test naming it, and a stray case carries none", () => {
  const stray = delta("src/bridge/one.js", "test/level0/other.test.js");
  assert.deepEqual(untestedIn(stray), ["src/bridge/one.js"]);

  const named = delta("src/bridge/one.js", "test/level0/one.test.js");
  assert.deepEqual(untestedIn(named), []);
});

test("the import counts off the test's own hunk, and off no other file's", () => {
  const said = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "+++ b/src/bridge/one.js",
    "@@ -0,0 +1 @@",
    "+export const one = 1;",
    "diff --git a/src/bridge/two.js b/src/bridge/two.js",
    "+++ b/src/bridge/two.js",
    "@@ -0,0 +1 @@",
    "+import { one } from './one.js';",
    "diff --git a/test/level0/other.test.js b/test/level0/other.test.js",
    "+++ b/test/level0/other.test.js",
    "@@ -0,0 +1 @@",
    "+import { two } from '../../src/bridge/two.js';",
    "",
  ].join("\n");

  assert.deepEqual(untestedIn(said), ["src/bridge/one.js"]);
});
