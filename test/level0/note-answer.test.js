// A note answers the prompt that asks for one: the door counts the log's note
// rows at the prompt and again before it refuses, and a new row pays.
// [[spec/design_output/level0#a-note-answers-its-prompt]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { namesNote, notesIn } from "../../.claude/skills/level0/lib/answer.js";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { holdsForAnswer, onPromptSubmit } from "../../src/bridge/answer.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const ROOT = "/tree";
const AT = join(ROOT, ...SESSION.split("/"));

function rowOf(kind, said) {
  return `${JSON.stringify({ at: "now", level: "info", kind, said })}\n`;
}

function box(log = "") {
  const said = [];
  return {
    said,
    disk: fakeDisk(log ? { [AT]: log } : {}),
    work: ROOT,
    log: { say: (...row) => said.push(row), path: SESSION },
  };
}

const prompt = (text) => ({ text, origin: { kind: "composer" } });

test("a prompt naming a note reads as one, and every other prompt reads as none", () => {
  assert.equal(namesNote("you shouldn't have stopped. Make a note of this."), true);
  assert.equal(namesNote("Park it as notes for the retro"), true);
  assert.equal(namesNote("I noted the flake yesterday"), true);
  assert.equal(namesNote("Merge the branches, then run the reviewer"), false);
  assert.equal(
    namesNote("```\nticket note slow-lint\n```"),
    false,
    "a fence carries no word",
  );
});

test("the door counts the note rows a log holds, and reads a missing log as none", () => {
  const held = `${rowOf("prompt", "make a note")}${rowOf("note", "the lint drags")}${rowOf("reply", "done")}`;
  assert.equal(notesIn(box(held)), 1);
  assert.equal(notesIn(box()), 0, "no log, no note");
});

test("a note parked after the prompt pays the demand that asks for one", () => {
  const it = box(rowOf("prompt", "make a note of this"));
  onPromptSubmit(prompt("The stop hook fired twice. Make a note of this."), it);
  assert.deepEqual(holdsForAnswer({ tool: "Read" }, it), null, "the first call passes");
  assert.deepEqual(
    holdsForAnswer({ tool: "Read" }, it),
    { needs: "reply" },
    "the second asks, because no note stands yet",
  );

  it.disk.append(AT, rowOf("note", "the stop hook fires twice"));
  assert.deepEqual(holdsForAnswer({ tool: "Read" }, it), null, "the note pays it");
  assert.equal(it.demand, null, "the demand stands paid");
  const line = it.said.at(-1);
  assert.equal(line[1], "reply", "the log carries a reply");
  assert.match(line[2], /the stop hook fires twice/, "and it carries the note");
});

test("a note leaves a prompt that asks for none standing", () => {
  const it = box();
  onPromptSubmit(prompt("Merge the done branches, dependency-heavy first."), it);
  holdsForAnswer({ tool: "Read" }, it);
  it.disk.append(AT, rowOf("note", "a test races the restart"));
  assert.deepEqual(
    holdsForAnswer({ tool: "Read" }, it),
    { needs: "reply" },
    "the readback stays owed",
  );
  assert.ok(it.demand, "the demand stands");
});

test("a note standing before the prompt pays nothing", () => {
  const it = box(rowOf("note", "an older note"));
  onPromptSubmit(prompt("Make a note of this one too."), it);
  holdsForAnswer({ tool: "Read" }, it);
  assert.deepEqual(
    holdsForAnswer({ tool: "Read" }, it),
    { needs: "reply" },
    "the count at the prompt holds the older note",
  );
});
