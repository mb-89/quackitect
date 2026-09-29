// The prose slice in shadow: wink's kept findings and the Go vetoes' meet a
// document at a time, and each finding they keep apart makes one row.
// [[spec/tickets/prose-checks-run-in-go]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { KEY, SHADOW, SLICE, shadowProse } from "../../src/bridge/prose-shadow.js";

const SET = { rule: "VoiceParagraph.PastTense", line: 1, column: 10, said: "set" };
const WROTE = { rule: "VoiceParagraph.PastTense", line: 2, column: 10, said: "wrote" };
const DOCS = [
  {
    file: "notes.md",
    text: "the door set the write\nthe door wrote the file\n",
    found: [SET, WROTE],
  },
];

// Fake doors: a slice mode, a binary standing or not, and a quack answering the kept findings it holds. [[spec/tickets/prose-checks-run-in-go]]
function doorsOf({ mode = SHADOW, binary = true, kept = [WROTE, SET] } = {}) {
  const ran = [];
  const said = [];
  return {
    ran,
    said,
    root: "/tree",
    binary: "/tree/quack",
    settings: { ask: async (key) => (key === KEY ? mode : "") },
    files: { exists: () => binary },
    proc: {
      run(argv, options) {
        ran.push({ argv, stdin: options?.stdin });
        return { exitCode: 0, stdout: JSON.stringify({ docs: [{ kept }] }) };
      },
    },
    log: {
      say: async (level, kind, text, fields) =>
        said.push({ level, kind, text, fields }),
    },
  };
}

test("a finding the two keep apart writes one shadow row", async () => {
  const doors = doorsOf();
  const rows = await shadowProse(doors, DOCS, [[WROTE]], "past");

  assert.equal(rows.length, 1);
  assert.deepEqual(doors.ran[0].argv, ["/tree/quack", "prose"]);
  const asked = JSON.parse(doors.ran[0].stdin);
  assert.equal(asked.mode, "past");
  assert.deepEqual(asked.docs[0].found, [SET, WROTE]);
  assert.equal(doors.said.length, 1);
  const row = doors.said[0];
  assert.equal(row.kind, SHADOW);
  assert.equal(row.fields.slice, SLICE);
  assert.equal(row.fields.file, "notes.md");
  assert.equal(row.fields.line, 1);
  assert.equal(row.fields.word, "set");
  assert.equal(row.fields.old, "dropped");
  assert.equal(row.fields.new, "kept");
  assert.match(row.text, /notes\.md:1/);
});

test("findings both sides keep alike write no row", async () => {
  const doors = doorsOf({ kept: [WROTE] });
  assert.deepEqual(await shadowProse(doors, DOCS, [[WROTE]], "past"), []);
  assert.equal(doors.ran.length, 1);
  assert.equal(doors.said.length, 0);
});

test("the slice at old runs no quack", async () => {
  const doors = doorsOf({ mode: "old" });
  assert.deepEqual(await shadowProse(doors, DOCS, [[WROTE]], "past"), []);
  assert.equal(doors.ran.length, 0);
});

test("a missing binary writes nothing", async () => {
  const doors = doorsOf({ binary: false });
  assert.deepEqual(await shadowProse(doors, DOCS, [[WROTE]], "past"), []);
  assert.equal(doors.ran.length, 0);
});
