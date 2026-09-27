// The test-first rule, over a staged delta and over the tree. Each case feeds
// the rule a change with no test and asserts the refusal, then feeds it the
// pair and asserts none.
// [[spec/design_output/tree#the-rules-over-two-files]]

import assert from "node:assert/strict";
import { test } from "node:test";
import * as tested from "../../.claude/skills/level0/lib/tested.js";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { behaves } from "../../src/doors/fake/behaves.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";

const { everyModuleTested, untestedIn } = tested;

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

// A merge carries other commits' code, and each met the door with its own test. [[spec/design_output/tree#the-rules-over-two-files]]
test("a merge passes whole, because its code landed with tests already", () => {
  assert.deepEqual(untestedIn(delta("src/bridge/one.js"), undefined, true), []);
  assert.deepEqual(untestedIn(delta("src/bridge/one.js"), undefined, false), [
    "src/bridge/one.js",
  ]);
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

// An editor file loads under the editor's own runtime, so no case imports it. [[spec/design_output/doors#a-door-reads-the-outside]]
test("an editor file wants no test of its own, and its neighbour wants one", () => {
  assert.deepEqual(untestedIn(delta("src/extension/editor-process.js")), []);
  assert.deepEqual(untestedIn(delta("src/extension/editor.js")), []);
  assert.deepEqual(untestedIn(delta("src/extension/sidebar.js")), [
    "src/extension/sidebar.js",
  ]);
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

// A pointer in a comment moves, and the door asks nothing, because no code moves with it. [[spec/design_output/tree#the-rules-over-two-files]]
test("a hunk adding comment lines alone asks for no test, and a hunk taking code away still does", () => {
  const commented = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "+++ b/src/bridge/one.js",
    "@@ -3,1 +3,2 @@",
    "+// [[spec/design_output/tree#the-rules-over-two-files]]",
    "+",
    "",
  ].join("\n");
  assert.deepEqual(untestedIn(commented), []);

  const removed = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "+++ b/src/bridge/one.js",
    "@@ -3,1 +3,0 @@",
    "-export const one = 1;",
    "",
  ].join("\n");
  assert.deepEqual(untestedIn(removed), ["src/bridge/one.js"]);
});

test("a change wants the test naming it, and a stray case carries none", () => {
  const stray = delta("src/bridge/one.js", "test/level0/other.test.js");
  assert.deepEqual(untestedIn(stray), ["src/bridge/one.js"]);

  const named = delta("src/bridge/one.js", "test/level0/one.test.js");
  assert.deepEqual(untestedIn(named), []);
});

test("a test standing already counts, because the reading asks its text", () => {
  const said = delta("src/bridge/one.js", "test/level0/other.test.js");
  const read = (path) =>
    path === "test/level0/other.test.js"
      ? "import { one } from '../../src/bridge/one.js';\n"
      : "";

  assert.deepEqual(untestedIn(said), ["src/bridge/one.js"]);
  assert.deepEqual(untestedIn(said, read), []);
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

// A delta the way `git diff --cached --unified=0` writes it, one file a block, headers and all. [[spec/tickets/a-comment-hunk-is-prose]]
function staged(...files) {
  return [
    ...files.flatMap(({ path, gone = false, rows = [] }) => [
      `diff --git a/${path} b/${path}`,
      ...(gone ? ["deleted file mode 100644"] : []),
      "index 1111111..2222222 100644",
      `--- a/${path}`,
      gone ? "+++ /dev/null" : `+++ b/${path}`,
      ...(rows.length ? ["@@ -3,1 +3,1 @@", ...rows] : []),
    ]),
    "",
  ].join("\n");
}

const POINTER_WAS = "-// [[spec/design_output/tree]]";
const POINTER_NOW = "+// [[spec/design_output/tree#the-rules-over-two-files]]";

// A pointer fix trades a comment for a comment in every module it reaches, and the door asks nothing. [[spec/tickets/a-comment-hunk-is-prose]]
test("a comment traded for a comment over two files asks no test, headers and all", () => {
  const said = staged(
    { path: "src/bridge/one.js", rows: [POINTER_WAS, POINTER_NOW] },
    { path: "src/bridge/two.js", rows: [POINTER_WAS, POINTER_NOW] },
  );
  assert.deepEqual(untestedIn(said), []);
});

// [[spec/tickets/a-comment-hunk-is-prose]]
test("a line of code beside a comment asks a test, added or traded away", () => {
  const added = staged({
    path: "src/bridge/one.js",
    rows: [POINTER_NOW, "+export const one = 1;"],
  });
  assert.deepEqual(untestedIn(added), ["src/bridge/one.js"]);

  const traded = staged({
    path: "src/bridge/one.js",
    rows: ["-export const one = 1;", POINTER_NOW],
  });
  assert.deepEqual(
    untestedIn(traded),
    ["src/bridge/one.js"],
    "code traded for a comment",
  );

  const dashed = staged({
    path: "src/bridge/one.js",
    rows: ["---x;", POINTER_NOW],
  });
  assert.deepEqual(
    untestedIn(dashed),
    ["src/bridge/one.js"],
    "a removed line reading --x is code",
  );
});

// [[spec/tickets/a-comment-hunk-is-prose]]
test("a comment fix beside a deleted module asks nothing, and a rename with no hunk asks nothing", () => {
  const said = staged(
    { path: "src/bridge/one.js", rows: [POINTER_WAS, POINTER_NOW] },
    { path: "src/bridge/two.js", gone: true, rows: ["-export const two = 2;"] },
  );
  assert.deepEqual(untestedIn(said), []);

  const renamed = [
    "diff --git a/src/bridge/one.js b/src/bridge/uno.js",
    "similarity index 100%",
    "rename from src/bridge/one.js",
    "rename to src/bridge/uno.js",
    "",
  ].join("\n");
  assert.deepEqual(untestedIn(renamed), []);
});

// Go, the level0 lib and its hooks are code the door reads, and a Go test answers for every file of its folder. [[spec/design_output/tree#the-rules-over-two-files]]
test("a Go file, a lib file and a hook file each ask a test, and a Go test of the folder answers", () => {
  assert.deepEqual(untestedIn(delta("src/engine/queue/pick.go")), [
    "src/engine/queue/pick.go",
  ]);
  assert.deepEqual(untestedIn(delta(".claude/skills/level0/lib/one.js")), [
    ".claude/skills/level0/lib/one.js",
  ]);
  assert.deepEqual(untestedIn(delta(".claude/skills/level0/hooks/two.js")), [
    ".claude/skills/level0/hooks/two.js",
  ]);
  assert.deepEqual(
    untestedIn(delta("src/engine/queue/pick.go", "src/engine/queue/order_test.go")),
    [],
    "a Go test names every file of its own folder",
  );
  assert.deepEqual(
    untestedIn(delta("src/engine/queue/pick.go", "src/engine/other/order_test.go")),
    ["src/engine/queue/pick.go"],
    "a Go test of another folder names none",
  );
  assert.deepEqual(
    untestedIn(delta("src/engine/queue/order_test.go")),
    [],
    "a Go test is no source",
  );
});

// The tests-red leaf lands the test, and the change leaf carries it. [[spec/design_output/tree#the-rules-over-two-files]]
test("a test the held ticket carries answers the change, and a stray one carries none", () => {
  const code = delta("src/bridge/one.js");
  assert.deepEqual(untestedIn(code, undefined, false, ["test/level0/one.test.js"]), []);
  assert.deepEqual(untestedIn(code, undefined, false, ["test/level0/other.test.js"]), [
    "src/bridge/one.js",
  ]);
  const read = (path) =>
    path === "test/level0/other.test.js"
      ? "import { one } from '../../src/bridge/one.js';\n"
      : "";
  assert.deepEqual(untestedIn(code, read, false, ["test/level0/other.test.js"]), []);
  assert.deepEqual(
    untestedIn(delta("src/engine/queue/pick.go"), undefined, false, [
      "src/engine/queue/pick_test.go",
    ]),
    [],
  );
});

// A command field holds one line indented four spaces, and a test path or a Go test path in it carries. [[spec/design_output/tree#the-rules-over-two-files]]
test("the carried tests are the test paths the ticket's command lines name, and prose names none", () => {
  assert.equal(
    typeof tested.carriedIn,
    "function",
    "tested.js answers the carried tests",
  );
  const ticket = [
    "---",
    "kind: [[ticket]]",
    "---",
    "",
    "The prose names test/level0/prose.test.js and carries nothing.",
    "",
    "### tests",
    "",
    "    ./RUNME.sh branch test test/level0/one.test.js test/contract/disk.test.js",
    "",
    "### check",
    "",
    "    ./RUNME.sh branch test src/engine/queue/pick_test.go",
    "",
  ].join("\n");
  assert.deepEqual(tested.carriedIn(ticket), [
    "test/level0/one.test.js",
    "test/contract/disk.test.js",
    "src/engine/queue/pick_test.go",
  ]);
  assert.deepEqual(tested.carriedIn(""), []);
});

// [[spec/tickets/a-reorder-asks-a-test]]
test("a function moved whole asks no test, and a statement moved inside a body still asks", () => {
  const moved = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "@@ -1,3 +0,0 @@",
    "-function a() {",
    "-  return 1;",
    "-}",
    "@@ -9,0 +7,3 @@",
    "+function a() {",
    "+  return 1;",
    "+}",
  ].join("\n");
  assert.deepEqual(untestedIn(moved), []);

  const reordered = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "@@ -2 +1,0 @@",
    "-  return x;",
    "@@ -3,0 +3 @@",
    "+  return x;",
  ].join("\n");
  assert.deepEqual(untestedIn(reordered), ["src/bridge/one.js"]);
});
