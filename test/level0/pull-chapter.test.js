// The pull's voice over a leaf: a box carrying no rules reads no voice, and
// rules that behave name a finding on the leaf's chapter alone.
// [[spec/design_output/pull#the-voice-reads-the-evidence]] [[spec/tickets/vale-leaves-the-tree]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { frontOf } from "../../src/engine/group.js";
import {
  BEFORE_CLEAR,
  chapterOf,
  formFault,
  verdictIn,
  voiceFaults,
  workAnswer,
} from "../../src/scripts/pull-chapter.js";
import { leafOf } from "../../src/scripts/pull-route.js";
import { at, doors, ROOT } from "./pull-doors.js";
import { carryQuack, teachRules } from "./quack-doors.js";
import { CHARACTERS, semicolonVale } from "./semicolon-vale.js";

// [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("a box carrying no rules reads no voice, so the hand-back meets no voice finding", () => {
  const leaf = { path: "do", evidence: [{ name: "says", form: "text" }] };
  const one = {
    path: "spec/tickets/one.md",
    text: "---\nkind: [[ticket]]\n---\n\n# do\n\n## says\n\nA line; and more.\n",
  };
  const proc = fakeProc();
  assert.deepEqual(voiceFaults({ disk: fakeDisk(), proc, root: "/tree", join }, one, leaf), []);
  assert.deepEqual(proc.ran, [], "no rules, no run");
});

// The pull reads through voiceIn, the road the open and the note share. [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("a semicolon on the leaf's chapter warns, naming Characters at its file line, and one on the Ask names nothing", () => {
  const leaf = { path: "do", evidence: [{ name: "says", form: "text" }] };
  const one = {
    path: "spec/tickets/one.md",
    text: "---\nkind: [[ticket]]\n---\n\n# Ask\n\nOne; two.\n\n# do\n\n## says\n\nA line; and more.\n",
  };
  const warned = [];
  const it = teachRules(carryQuack({ proc: fakeProc(), root: "/tree", disk: fakeDisk(), join }), semicolonVale());
  const found = voiceFaults(it, one, leaf, warned);
  assert.deepEqual(found, [], "a break of form refuses nothing");
  assert.equal(warned.length, 1, warned.join("\n"));
  assert.match(warned[0], /^do breaks Characters at line 13 of spec\/tickets\/one\.md/);
});

// A private name on the leaf's chapter still refuses the hand-back. [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("a private name on the leaf's chapter refuses, and warns on nothing", () => {
  const shaped = semicolonVale();
  const privately = (argv, init) => {
    const said = shaped(argv, init);
    return { ...said, stdout: said.stdout.replaceAll(CHARACTERS, "VoiceVale.Private") };
  };
  const leaf = { path: "do", evidence: [{ name: "says", form: "text" }] };
  const one = {
    path: "spec/tickets/one.md",
    text: "---\nkind: [[ticket]]\n---\n\n# do\n\n## says\n\nA line; and more.\n",
  };
  const warned = [];
  const it = teachRules(carryQuack({ proc: fakeProc(), root: "/tree", disk: fakeDisk(), join }), privately);
  const found = voiceFaults(it, one, leaf, warned);
  assert.equal(found.length, 1, found.join("\n"));
  assert.match(found[0], /^do breaks Private at line 9/);
  assert.deepEqual(warned, []);
});

test("chapterOf reads the fields under a step's chapter, and a missing one stands nowhere", () => {
  const text =
    "# Ask\n\nA thing.\n\n# design\n\n## draft\n\n### approach\n\nIt reads.\n\n# Discussion\n";
  const found = chapterOf(text, "design/draft");
  assert.equal(found.stands, true);
  assert.deepEqual(found.fields.get("approach"), ["It reads."]);
  assert.equal(chapterOf(text, "design/review").stands, false);
});

// A table rides one piece, and a row standing between two tables keeps them apart. [[spec/tickets/the-small-faults-land]]
test("a verdict's table rows ride one piece, and a plain row between two tables keeps them apart", () => {
  const said = verdictIn(["fail", "| a |", "| b |", "- after", "| c |"]);
  assert.equal(said.reason, "| a |\\n| b |; after; | c |");
});

// A point names the child the gate mints, so the form refuses a link in the name's place. [[spec/design_output/pull#a-finding-rides-out]]
test("a gate point opening with a link is refused as no ticket name", () => {
  const { it } = doors({}, {}, { root: ROOT });
  const rows = ["accept with points", "- [[spec/tickets/a-link]]: a line"];
  assert.deepEqual(
    formFault(it, { form: "verdict" }, rows, "verdict under gate", {}, null),
    [
      "verdict under gate names [[spec/tickets/a-link]], and a ticket name holds lowercase words joined by hyphens.",
    ],
  );
});

// A ticket carrying a draft step and a gate after it. [[spec/tickets/a-gate-names-its-question]]
const GATED = `---
kind: [[ticket]]
state: open
step: gate
steps:
  - name: draft
    does: drafts the approach
    evidence:
      - name: approach
        form: text
        says: the approach
  - name: gate
    gate: does the approach answer the ask
    does: reads the draft against the ask
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points, or reject
---

# Ask

One piece of it.

# Discussion
`;

const handOut = (path) => {
  const { it } = doors({}, {}, { root: ROOT });
  const one = { name: "a-child", text: GATED, front: frontOf(GATED) };
  return workAnswer(it, one, leafOf(frontOf(GATED), path));
};

// [[spec/tickets/a-gate-names-its-question]]
test("a pull on a gate prints the question it answers", () => {
  assert.match(handOut("gate"), /answers: does the approach answer the ask/);
});

// [[spec/tickets/a-gate-names-its-question]]
test("a pull on a gate asks the question before the clear", () => {
  assert.ok(handOut("gate").includes(`before the clear: ${BEFORE_CLEAR}`));
});

// [[spec/tickets/a-gate-names-its-question]]
test("a pull on a step carrying no gate prints neither question", () => {
  const said = handOut("draft");
  assert.doesNotMatch(said, /answers:/);
  assert.ok(!said.includes(BEFORE_CLEAR));
});

// [[spec/design_input/level-two#guidance]]
test("a hand-out on a tagged leaf prints each note its tags resolve as a section", () => {
  const code =
    "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Reach the outside through a door.\n";
  const { it } = doors(
    { [at("spec/guidance/code/code.md")]: code },
    {},
    { root: ROOT },
  );
  const tagged = GATED.replace(
    "  - name: gate\n",
    "  - name: gate\n    tags: [code]\n",
  );
  const one = { name: "a-child", text: tagged, front: frontOf(tagged) };
  const said = workAnswer(it, one, leafOf(frontOf(tagged), "gate"));
  assert.match(
    said,
    /# Reads spec\/guidance\/code\/code\n\n1\. Reach the outside through a door\./,
  );
  assert.doesNotMatch(
    handOut("gate"),
    /spec\/guidance\/code/,
    "an untagged leaf resolves none",
  );
});

// [[spec/tickets/readers-take-the-go-topics]]
test("a pull prints the notes quack guidance answers where the guidance slice reads new", () => {
  const { it } = doors({}, {}, { root: ROOT });
  const quack = join(ROOT, BIN);
  it.disk.write(quack, "");
  it.disk.write(
    join(ROOT, "spec/guidance/other.md"),
    "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Read other.\n",
  );
  it.slices = { guidance: "new" };
  it.proc = fakeProc({
    [`${quack} guidance`]: {
      stdout: JSON.stringify({ ":gate": ["spec/guidance/other"] }),
    },
  });
  const one = { name: "a-child", text: GATED, front: frontOf(GATED) };
  assert.match(workAnswer(it, one, leafOf(frontOf(GATED), "gate")), /Read other/);
});
