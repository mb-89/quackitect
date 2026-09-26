// The hook script a person's commit runs through. Every case hands it a fake
// disk, a fake git and a delta on the line, so the exit code answers out of
// memory.
// [[spec/design_output/private#both-doors-one-check]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { boxOf, holds, merging, notesOf } from "../../src/scripts/precommit.js";

const ROOT = "/tree";

// [[spec/design_output/private#a-fixture-carries-no-shape]]
const ADDRESS = ["duck", "quacks.org"].join("@");
const SHORT = ["d", "q.org"].join("@");
const AT_HOME = ["/home", "duck"].join("/");

const DELTA = `diff --git a/spec/guidance/voice.md b/spec/guidance/voice.md
--- a/spec/guidance/voice.md
+++ b/spec/guidance/voice.md
@@ -4,0 +5 @@ kind
+Write to ${ADDRESS} where the door refuses.
`;

const CLEAN = `diff --git a/spec/guidance/voice.md b/spec/guidance/voice.md
--- a/spec/guidance/voice.md
+++ b/spec/guidance/voice.md
@@ -4,0 +5 @@ kind
+The door reads the delta a commit carries.
`;

function box(seed = {}, said = {}) {
  return {
    root: ROOT,
    disk: fakeDisk(seed),
    git: fakeGit({
      "git config user.name": { stdout: said.name ?? "" },
      "git config user.email": { stdout: said.email ?? "" },
      "git rev-parse -q --verify MERGE_HEAD": { exitCode: said.merging ? 0 : 1 },
    }),
    env: said.env ?? {},
    join: (...parts) => parts.join("/"),
  };
}

test("a delta carrying an address answers one, and names the line", async () => {
  const said = await holds(box(), DELTA);
  assert.equal(said.code, 1);
  assert.match(said.said, /spec\/guidance\/voice.md:5:1/);
  assert.match(said.said, /ShapeStaysHome/);
});

test("a delta carrying nothing private answers zero and says nothing", async () => {
  assert.deepEqual(await holds(box(), CLEAN), { code: 0, said: "" });
  assert.deepEqual(await holds(box(), ""), { code: 0, said: "" });
});

// [[spec/design_output/private#the-three-checks]]
test("the script reads the box out of git and the environment", () => {
  const here = box(
    {},
    { name: "Duck", email: SHORT, env: { USER: "duck", HOME: AT_HOME } },
  );
  assert.deepEqual(boxOf(here), {
    user: "duck",
    home: AT_HOME,
    name: "Duck",
    email: SHORT,
  });
});

test("a delta carrying the box's git name answers one", async () => {
  const here = box({}, { name: "Duck", env: { USER: "duck" } });
  const delta = DELTA.replace(
    `Write to ${ADDRESS} where the door refuses.`,
    "Duck writes the brief.",
  );
  const said = await holds(here, delta);
  assert.equal(said.code, 1);
  assert.match(said.said, /BoxNameStaysHome/);
});

// [[spec/design_output/private#the-run-and-the-token]]
test("the script reads every note under the folder, and none where it stands empty", () => {
  const seed = {
    "/tree/.se/notes/one.md": "the duck walks over the hill at dawn",
    "/tree/.se/notes/two.txt": "a second note",
  };
  assert.deepEqual(
    notesOf(box(seed)).map((one) => one.name),
    [".se/notes/one.md", ".se/notes/two.txt"],
  );
  assert.deepEqual(notesOf(box()), []);
});

// A change and its test land together, and the door reads the pair. [[spec/design_output/tree#the-rules-over-two-files]]
test("a code change with no test beside it refuses at this door too", async () => {
  const code = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "+++ b/src/bridge/one.js",
    "@@ -0,0 +1 @@",
    "+export const one = 1;",
    "",
  ].join("\n");

  const said = await holds(box(), code);
  assert.equal(said.code, 1);
  assert.match(said.said, /no test beside it/);
});

// A merge carries other commits' code, and each met the door with its own test. [[spec/design_output/tree#the-rules-over-two-files]]
test("a merge commit passes the test door, because its code landed with tests already", async () => {
  const code = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "+++ b/src/bridge/one.js",
    "@@ -0,0 +1 @@",
    "+export const one = 1;",
    "",
  ].join("\n");

  assert.equal(merging(box({}, { merging: true })), true, "git names the merge in progress");
  assert.equal(merging(box()), false);
  const said = await holds(box({}, { merging: true }), code);
  assert.deepEqual(said, { code: 0, said: "" });
});

test("a test file standing nowhere leaves the change refused", async () => {
  const code = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "+++ b/src/bridge/one.js",
    "@@ -0,0 +1 @@",
    "+export const one = 1;",
    "diff --git a/test/level0/other.test.js b/test/level0/other.test.js",
    "+++ b/test/level0/other.test.js",
    "@@ -0,0 +1 @@",
    "+assert.equal(two, 2);",
    "",
  ].join("\n");

  const said = await holds(box(), code);
  assert.equal(said.code, 1);
  assert.match(said.said, /src\/bridge\/one\.js/);
});

test("a test standing already carries the change, because the door reads it", async () => {
  const code = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "+++ b/src/bridge/one.js",
    "@@ -0,0 +1 @@",
    "+export const one = 1;",
    "diff --git a/test/level0/other.test.js b/test/level0/other.test.js",
    "+++ b/test/level0/other.test.js",
    "@@ -0,0 +1 @@",
    "+assert.equal(one, 1);",
    "",
  ].join("\n");
  const here = box({
    "/tree/test/level0/other.test.js": "import { one } from '../../src/bridge/one.js';\n",
  });

  assert.equal((await holds(here, code)).code, 0);
});

test("a delta lifting six words out of a note answers one", async () => {
  const here = box({
    "/tree/.se/notes/one.md": "the duck walks over the hill at dawn",
  });
  const delta = DELTA.replace(
    `Write to ${ADDRESS} where the door refuses.`,
    "The duck walks over the hill at noon.",
  );
  const said = await holds(here, delta);
  assert.equal(said.code, 1);
  assert.match(said.said, /NoteTextStaysHome/);
});

// One place joins a path, and the reading of a standing test asks the hand for it. [[spec/tickets/one-door-joins-a-path]]
test("the reading of a standing test joins its path through the hand's own join", async () => {
  const join = (...parts) => parts.join("|");
  const delta = `diff --git a/src/one.js b/src/one.js
--- a/src/one.js
+++ b/src/one.js
@@ -1,0 +2 @@
+export const two = 2;
diff --git a/test/level0/other.test.js b/test/level0/other.test.js
--- a/test/level0/other.test.js
+++ b/test/level0/other.test.js
@@ -3,0 +4 @@
+test("two", () => {});
`;
  const it = {
    ...box(),
    join,
    disk: fakeDisk({
      [join(ROOT, "test/level0/other.test.js")]: 'import { two } from "../../src/one.js";\n',
    }),
  };
  const said = await holds(it, delta);
  assert.equal(said.code, 0, said.said);
});


// Every hand on the box holds its own ticket, and the hook runs with no hand, so it reads every hold. [[spec/design_output/tree#the-rules-over-two-files]]
test("a test any hold's ticket carries answers the change at the hook", async () => {
  const code = [
    "diff --git a/src/bridge/one.js b/src/bridge/one.js",
    "+++ b/src/bridge/one.js",
    "@@ -0,0 +1 @@",
    "+export const one = 1;",
    "",
  ].join("\n");
  const hold = (ticket) => JSON.stringify({ ticket, path: `spec/tickets/${ticket}.md` });
  const ticket = (line) => `# Ask\n\n### tests\n\n    ${line}\n`;
  const here = box({
    "/tree/.se/.runtime/hold/a-hand.json": hold("first"),
    "/tree/.se/.runtime/hold/b-hand.json": hold("second"),
    "/tree/spec/tickets/first.md": ticket("./RUNME.sh branch test test/level0/other.test.js"),
    "/tree/spec/tickets/second.md": ticket("./RUNME.sh branch test test/level0/one.test.js"),
  });

  assert.deepEqual(await holds(here, code), { code: 0, said: "" });
  assert.equal((await holds(box(), code)).code, 1, "no hold carries nothing");
});
