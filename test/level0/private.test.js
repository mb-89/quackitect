// The check behind the commit door. Every case here hands the reader a fixture
// diff, a fake box and a fake note, so the whole check runs over strings and
// touches nothing outside.
// [[spec/design_output/private#how-a-case-drives-it]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addedIn,
  boxNamesIn,
  noteTextIn,
  privateIn,
  privateNow,
  shapesIn,
} from "../../.claude/skills/level0/lib/private.js";

// [[spec/design_output/private#a-fixture-carries-no-shape]]
const ADDRESS = ["duck", "quacks.org"].join("@");
const SHORT = ["d", "q.org"].join("@");
const NUMBER = ["+1 555 010", "9134"].join(" ");
const AT_HOME = ["/home", "duck"].join("/");
const LEAK = `Write to ${ADDRESS} where the door refuses.`;

const DIFF = `diff --git a/spec/guidance/voice.md b/spec/guidance/voice.md
index 1111111..2222222 100644
--- a/spec/guidance/voice.md
+++ b/spec/guidance/voice.md
@@ -4,0 +5 @@ kind
+${LEAK}
diff --git a/spec/guidance/working.md b/spec/guidance/working.md
index 3333333..4444444 100644
--- a/spec/guidance/working.md
+++ b/spec/guidance/working.md
@@ -9 +9,0 @@ old
-${LEAK}
`;

const box = (more = {}) => ({
  user: "somebody",
  home: "/home/user",
  name: "",
  email: "",
  ...more,
});

const at = (file, text, line = 1) => [{ file, line, text }];
const rules = (found) => found.map((one) => one.rule);

test("the delta reader answers an added line, and the removed line passes", () => {
  assert.deepEqual(addedIn(DIFF), [
    { file: "spec/guidance/voice.md", line: 5, text: LEAK },
  ]);
});

test("the reader numbers every added line of a hunk from the hunk head", () => {
  const diff = `diff --git a/src/scripts/cli.js b/src/scripts/cli.js
--- a/src/scripts/cli.js
+++ b/src/scripts/cli.js
@@ -0,0 +12,3 @@
+const one = 1;
+const two = 2;
+const three = 3;
`;
  assert.deepEqual(
    addedIn(diff).map((one) => `${one.line} ${one.text}`),
    ["12 const one = 1;", "13 const two = 2;", "14 const three = 3;"],
  );
});

test("a binary file and a file under .se carry no added line into the check", () => {
  const diff = `diff --git a/.se/notes/one.md b/.se/notes/one.md
+++ b/.se/notes/one.md
@@ -0,0 +1 @@
+${LEAK}
diff --git a/src/index/duck.png b/src/index/duck.png
index 5555555..6666666 100644
Binary files a/src/index/duck.png and b/src/index/duck.png differ
`;
  assert.deepEqual(privateIn(addedIn(diff), { box: box() }), []);
});

test("a file the delta deletes whole adds nothing", () => {
  const diff = `diff --git a/spec/guidance/old.md b/spec/guidance/old.md
--- a/spec/guidance/old.md
+++ /dev/null
@@ -1 +0,0 @@
-${LEAK}
`;
  assert.deepEqual(addedIn(diff), []);
});

// [[spec/design_output/private#the-three-checks]]
test("the shapes refuse an address, a number, a date in prose and a home path", () => {
  assert.deepEqual(rules(shapesIn(at("spec/guidance/voice.md", LEAK))), [
    "ShapeStaysHome",
  ]);
  assert.deepEqual(
    rules(shapesIn(at("spec/guidance/voice.md", `Ring ${NUMBER} to ask.`))),
    ["ShapeStaysHome"],
  );
  assert.deepEqual(
    rules(shapesIn(at("spec/design_output/log.md", "A grep on 2026-04-01 says so."))),
    ["ShapeStaysHome"],
  );
  assert.deepEqual(
    rules(shapesIn(at("test/level0/paths.test.js", `const home = '${AT_HOME}';`))),
    ["ShapeStaysHome"],
  );
});

test("the nobody users pass, and a date outside prose passes", () => {
  for (const text of [
    "const home = '/home/user/quackitect';",
    "const mac = '/Users/one/Library';",
    "const box = 'C:\\\\Users\\\\somebody\\\\tree';",
    `Write to ${["duck", "example.com"].join("@")} where the door refuses.`,
  ]) {
    assert.deepEqual(shapesIn(at("test/level0/paths.test.js", text)), [], text);
  }
  assert.deepEqual(
    shapesIn(at("test/level0/log.test.js", "const at = '2026-04-01';")),
    [],
  );
});

// [[spec/design_output/private#the-three-checks]]
test("the box's own user, home, git name and git address each refuse", () => {
  const here = box({ user: "duck", home: AT_HOME, name: "Duck", email: SHORT });
  const said = (text) =>
    boxNamesIn(at("spec/guidance/voice.md", text), here).map((one) => one.said);

  assert.deepEqual(said("The user duck owns this box."), ["duck"]);
  assert.deepEqual(said(`The tree stands under ${AT_HOME} today.`), ["duck", AT_HOME]);
  assert.deepEqual(said("Duck wrote the first draft."), ["Duck"]);
  assert.deepEqual(said(`Ask ${SHORT} about it.`), [SHORT]);
  assert.deepEqual(
    rules(
      boxNamesIn(at("spec/guidance/voice.md", "The user duck owns this box."), here),
    ),
    ["BoxNameStaysHome"],
  );
});

test("a name inside a longer word passes, and a nobody user names nobody", () => {
  const here = box({ user: "duck", home: AT_HOME, name: "Duck" });
  assert.deepEqual(boxNamesIn(at("src/scripts/cli.js", "const ducks = 2;"), here), []);
  assert.deepEqual(
    boxNamesIn(at("spec/guidance/voice.md", "The user root owns this box."), box()),
    [],
  );
});

// [[spec/design_output/private#the-run-and-the-token]]
test("six words out of a note refuse, and five pass", () => {
  const notes = [
    { name: ".se/notes/one.md", text: "the duck walks over the hill at dawn" },
  ];
  const six = at("spec/guidance/voice.md", "The duck walks over the hill at noon.");
  const five = at("spec/guidance/voice.md", "Duck walks over the hill.");

  assert.deepEqual(rules(noteTextIn(six, notes)), ["NoteTextStaysHome"]);
  assert.match(noteTextIn(six, notes)[0].said, /duck walks over the hill/);
  assert.deepEqual(noteTextIn(five, notes), []);
});

test("a run reads across the added lines of one file, and its line says where", () => {
  const notes = [
    { name: ".se/notes/one.md", text: "the duck walks over the hill at dawn" },
  ];
  const added = [
    { file: "spec/guidance/voice.md", line: 7, text: "The duck walks" },
    { file: "spec/guidance/voice.md", line: 8, text: "over the hill at noon." },
  ];
  const found = noteTextIn(added, notes);
  assert.deepEqual(rules(found), ["NoteTextStaysHome"]);
  assert.equal(found[0].line, 7);
});

test("one token out of a note refuses alone", () => {
  const notes = [
    { name: ".se/notes/one.md", text: "the box sits at /srv/pond/duck-house" },
  ];
  assert.deepEqual(
    rules(
      noteTextIn(
        at("spec/guidance/voice.md", "The pond stands at /srv/pond/duck-house."),
        notes,
      ),
    ),
    ["NoteTextStaysHome"],
  );
  assert.deepEqual(
    noteTextIn(at("spec/guidance/voice.md", "The pond stands where it stands."), notes),
    [],
  );
});

test("a hyphen in place of a space carries no run past the check", () => {
  const notes = [
    { name: ".se/notes/one.md", text: "the duck walks over the hill at dawn" },
  ];
  const added = at("spec/guidance/voice.md", "the-duck-walks-over-the-hill-at-dawn");
  assert.deepEqual(rules(noteTextIn(added, notes)), ["NoteTextStaysHome"]);
});

// [[spec/design_output/private#two-doors-one-check]]
test("the gatherer reads the delta, the box and the notes once each", async () => {
  const asked = [];
  const found = await privateNow({
    diff: async () => {
      asked.push("diff");
      return DIFF;
    },
    box: async () => {
      asked.push("box");
      return box();
    },
    notes: async () => {
      asked.push("notes");
      return [];
    },
  });
  assert.deepEqual(asked, ["diff", "box", "notes"]);
  assert.deepEqual(rules(found), ["ShapeStaysHome"]);
});

test("an empty delta asks the box for nothing", async () => {
  const asked = [];
  const found = await privateNow({
    diff: async () => "",
    box: async () => {
      asked.push("box");
      return box();
    },
    notes: async () => [],
  });
  assert.deepEqual(found, []);
  assert.deepEqual(asked, []);
});
