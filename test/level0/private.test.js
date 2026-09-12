// The run and the token, over strings alone, and the check behind the commit
// door. A note is a dump and carries anything a person puts in it, and a tracked
// line carrying the note's own words lands on trunk, where it stays. Every case
// hands the reader a string, a fixture diff, a fake box or a fake note, so the
// whole check runs over memory and touches nothing outside.
// [[spec/design_output/private#the-run-and-the-token]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addedIn,
  boxNamesIn,
  carriedFrom,
  COPY_RUN,
  isIdentifier,
  longestSharedRun,
  noteTextIn,
  privateIn,
  privateNow,
  refusedPrivate,
  shapesIn,
  sharedIdentifiers,
  tokensOf,
  wordsOf,
} from "../../.claude/skills/level0/lib/private.js";

const PRIVATE =
  "the box at /home/somebody/secrets stalls when Fnordwick runs it twice";
const WORDY =
  "the box stalls badly whenever somebody starts it a second time in a row";

const noted = (text, name = "one.md") => [{ name, text }];

test("a run of six words is the line, and the constant says so", () => {
  assert.equal(COPY_RUN, 6);
});

test("the flatten lowers the case, drops the punctuation and folds the space", () => {
  assert.deepEqual(wordsOf("  The Box, STALLS.  twice!  "), [
    "the",
    "box",
    "stalls",
    "twice",
  ]);
});

// [[spec/design_output/private#the-flatten]]
test("the tokens carry the raw word beside the flat one, and one flatten serves both", () => {
  const said = tokensOf("The duck-house, at /srv/Pond!");
  assert.deepEqual(said, [
    { flat: "the", raw: "The" },
    { flat: "duck", raw: "duck-house," },
    { flat: "house", raw: "duck-house," },
    { flat: "at", raw: "at" },
    { flat: "/srv/pond", raw: "/srv/Pond!" },
  ]);
  assert.deepEqual(
    said.map((one) => one.flat),
    wordsOf("The duck-house, at /srv/Pond!"),
  );
});

// [[spec/design_output/private#what-a-secret-looks-like]]
test("a token carrying a separator inside it reads as an identifier", () => {
  assert.equal(isIdentifier("/home/somebody/secrets"), true);
  assert.equal(isIdentifier("maria@example.com"), true);
  assert.equal(isIdentifier("c:\\users\\somebody"), true);
  assert.equal(isIdentifier("example.com"), true);
  assert.equal(isIdentifier("reachability"), true);
  assert.equal(isIdentifier("stalls"), false);
});

test("a verbatim paste comes back as the run, in the writer's own spelling", () => {
  const said = longestSharedRun(`Noticed: ${WORDY}`, WORDY);
  assert.equal(wordsOf(said).length >= COPY_RUN, true);
  assert.match(said, /stalls badly whenever somebody starts it/);
});

test("punctuation swapped for spaces carries no paste through", () => {
  const said = longestSharedRun(WORDY.split(" ").join("-"), WORDY);
  assert.equal(wordsOf(said).length >= COPY_RUN, true);
});

test("a shared vocabulary is no run, so an honest rewrite passes", () => {
  const said = longestSharedRun("the box stalls when it runs twice", PRIVATE);
  assert.equal(wordsOf(said).length < COPY_RUN, true);
});

test("two texts sharing nothing answer the empty run", () => {
  assert.equal(longestSharedRun("a clean statement", "wholly other words"), "");
  assert.equal(longestSharedRun("", PRIVATE), "");
});

// [[spec/design_output/private#what-a-secret-looks-like]]
test("one shared path is enough, though no run of words is shared", () => {
  const said = sharedIdentifiers(
    "somebody should look at /home/somebody/secrets when there is time",
    PRIVATE,
  );
  assert.deepEqual(said, ["/home/somebody/secrets"]);
});

test("an address shared with the note comes back on its own", () => {
  const said = sharedIdentifiers(
    "reach out about this when there is time: maria@example.com",
    "ask maria@example.com whether the box stalls for her too",
  );
  assert.deepEqual(said, ["maria@example.com"]);
});

test("a short token shared with the note passes, because a word is no secret", () => {
  assert.deepEqual(sharedIdentifiers("the a.md file stands", "a.md holds it"), []);
});

// [[spec/design_output/private#a-bare-name-passes]]
test("a bare name passes, and this case exists to say so out loud", () => {
  const text = "worth asking Fnordwick about this before anybody else decides";
  assert.deepEqual(sharedIdentifiers(text, PRIVATE), []);
  assert.equal(wordsOf(longestSharedRun(text, PRIVATE)).length < COPY_RUN, true);
  assert.equal(carriedFrom(text, noted(PRIVATE)), null);
});

// [[spec/design_output/private#the-door-reads-the-notes]]
test("the door names the note a write shares a run with", () => {
  const said = carriedFrom(`Noticed: ${WORDY}`, noted(WORDY));
  assert.equal(said.how, "run");
  assert.equal(said.note, "one.md");
  assert.match(said.said, /stalls badly whenever somebody starts it/);
});

test("the door names the token a write carries alone", () => {
  const said = carriedFrom("look under /home/somebody/secrets sometime", noted(PRIVATE));
  assert.equal(said.how, "token");
  assert.equal(said.said, "/home/somebody/secrets");
});

test("the token answers before the run, because one word is the smaller ask", () => {
  const said = carriedFrom(`Noticed: ${PRIVATE}`, noted(PRIVATE));
  assert.equal(said.how, "token");
});

test("a write sharing nothing with any note passes the door", () => {
  assert.equal(carriedFrom("a repeated run stalls the box", noted(PRIVATE)), null);
  assert.equal(carriedFrom("anything at all", []), null);
});

// [[spec/design_output/private#what-the-refusal-says]]
test("the refusal quotes the run and names the road back", () => {
  const said = refusedPrivate(
    "spec/funnel/a.md",
    carriedFrom(`Noticed: ${WORDY}`, noted(WORDY)),
  );
  assert.match(said, /spec\/funnel\/a\.md carries \d+ words straight from a note/);
  assert.match(said, /stalls badly whenever somebody starts it/);
  assert.match(said, /\.se\/notes/);
});

test("the refusal over a token says one word is enough to leak", () => {
  const said = refusedPrivate(
    "spec/funnel/a.md",
    carriedFrom("look under /home/somebody/secrets sometime", noted(PRIVATE)),
  );
  assert.match(said, /"\/home\/somebody\/secrets"/);
  assert.match(said, /one word is enough to leak/);
});

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

// [[spec/design_output/private#the-delta-a-commit-carries]]
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

test("the nobody users and the agent names pass, and a date outside prose passes", () => {
  for (const text of [
    "const home = '/home/user/quackitect';",
    "const mac = '/Users/one/Library';",
    "const box = 'C:\\\\Users\\\\somebody\\\\tree';",
    "const ci = '/home/runner/work';",
    "A cloud box writes under /home/user, and a fixture writes /Users/one.",
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

test("a name inside a longer word passes, and a name carrying no person names nobody", () => {
  const here = box({ user: "duck", home: AT_HOME, name: "Duck" });
  assert.deepEqual(boxNamesIn(at("src/scripts/cli.js", "const ducks = 2;"), here), []);
  assert.deepEqual(
    boxNamesIn(at("spec/guidance/voice.md", "The user root owns this box."), box()),
    [],
  );
  assert.deepEqual(
    boxNamesIn(
      at("spec/guidance/voice.md", "Claude runs under /home/runner on that box."),
      box({ user: "runner", home: "/home/runner", name: "Claude" }),
    ),
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

test("one token out of a note refuses alone, at either door", () => {
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
  assert.equal(
    carriedFrom("The pond stands at /srv/pond/duck-house.", notes).said,
    "/srv/pond/duck-house",
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
