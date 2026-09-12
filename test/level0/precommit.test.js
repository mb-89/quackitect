// The hook script a person's commit runs through. Every case hands it a fake
// disk, a fake git and a delta on the line, so the exit code answers out of
// memory.
// [[spec/design_output/private#two-doors-one-check]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { boxOf, holds, notesOf } from "../../src/scripts/precommit.js";

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
      "git config --get user.name": { stdout: said.name ?? "" },
      "git config --get user.email": { stdout: said.email ?? "" },
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
