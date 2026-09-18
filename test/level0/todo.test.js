// The to-do flag, over strings alone. A note carries a boolean, the push door
// reads it off a delta, and the pull stands a tagged note ahead of every free
// ticket. Every case hands the reader a string, so nothing here touches a disk.
// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isTagged,
  reaches,
  refusedTodo,
  TODO,
  taggedFirst,
  taggedIn,
} from "../../.claude/skills/level0/lib/todo.js";

const noted = (front) =>
  `---\nkind: [[ticket]]\nstate: open\nurgency: whenever\n${front}---\n\n# Ask\n\nLook at the lint.\n\n# Discussion\n\nNothing yet.\n`;

const TAGGED = noted("todo: true\n");
const OFF = noted("todo: false\n");
const FREE = noted("");

test("the field is todo, and the constant says so", () => {
  assert.equal(TODO, "todo");
});

test("a note carries todo true, and a note lacking the field reads false", () => {
  assert.equal(isTagged(TAGGED), true);
  assert.equal(isTagged(FREE), false);
  assert.equal(isTagged(OFF), false);
});

test("a file that is no note reads false, whatever it holds", () => {
  assert.equal(isTagged("// todo: true\n"), false);
  assert.equal(isTagged(""), false);
  assert.equal(isTagged(null), false);
});

test("the flag reaches markdown alone, because a note is where it lives", () => {
  assert.equal(reaches("spec/tickets/slow-lint.md"), true);
  assert.equal(reaches("src/scripts/work.js"), false);
  assert.equal(reaches(null), false);
});

test("the tag reaches any folder, so a private note and a tracked one both carry it", () => {
  assert.deepEqual(
    taggedIn([
      { name: ".se/tickets/slow-lint.md", text: TAGGED },
      { name: "spec/tickets/a-group-is-a-branch.md", text: TAGGED },
      { name: "spec/guidance/voice.md", text: FREE },
      { name: "src/scripts/work.js", text: TAGGED },
    ]),
    [".se/tickets/slow-lint.md", "spec/tickets/a-group-is-a-branch.md"],
  );
});

test("a delta carrying no tagged note names nothing", () => {
  assert.deepEqual(taggedIn([{ name: "spec/tickets/x.md", text: FREE }]), []);
  assert.deepEqual(taggedIn(null), []);
});

test("the refusal names every file, and the way the tag comes off", () => {
  const said = refusedTodo([".se/tickets/slow-lint.md", "spec/tickets/x.md"]);
  assert.match(said, /parks work on this box, and this push carries 2/);
  assert.match(said, /^ {2}\.se\/tickets\/slow-lint\.md$/m);
  assert.match(said, /^ {2}spec\/tickets\/x\.md$/m);
  assert.match(said, /ticket todo <name> --off/);
  assert.match(said, /the push is the one gate/);
});

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
test("the pull stands every tagged note ahead of every free ticket", () => {
  const held = [
    { name: "free-one", text: FREE },
    { name: "parked-one", text: TAGGED },
    { name: "free-two", text: FREE },
    { name: "parked-two", text: TAGGED },
  ];
  assert.deepEqual(
    taggedFirst(held).map((one) => one.name),
    ["parked-one", "parked-two", "free-one", "free-two"],
  );
});

test("the order keeps what each side already holds, and an empty list stays empty", () => {
  const free = [
    { name: "one", text: FREE },
    { name: "two", text: FREE },
  ];
  assert.deepEqual(
    taggedFirst(free).map((one) => one.name),
    ["one", "two"],
  );
  assert.deepEqual(taggedFirst(null), []);
});
