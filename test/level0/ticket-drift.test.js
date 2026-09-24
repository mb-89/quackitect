// The update verb against a route a person edits. The verb finds the process
// version the ticket copied in a fake git history, and names each step past
// the reached leaves that differs from it.
// [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { processHash } from "../../.claude/skills/level0/lib/schema.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { ticket } from "../../src/scripts/ticket.js";
import { driftOf } from "../../src/scripts/ticket-drift.js";
import { TICKET_SCHEMA } from "./fixtures.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const PROCESS = "spec/processes/trivial.yaml";
const PATH = "spec/tickets/slow-lint.md";

const OLD = `for: a small fix
steps:
  - name: do
    does: makes the change
  - name: check
    does: checks it
`;
const NEW = `for: a small fix
steps:
  - name: do
    does: makes the change
  - name: check
    does: checks it twice
`;

function ticketText({ check = "checks it", doing = "makes the change" } = {}) {
  return `---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: ${doing}
  - name: check
    does: ${check}
process: [[spec/processes/trivial]]
process_hash: ${processHash(OLD)}
step: do
---

# Ask

The lint drags.

# do

# check

# Discussion
`;
}

function history(versions) {
  const answers = {
    [`git log --format=%H -- ${PROCESS}`]: {
      exitCode: 0,
      stdout: versions.map(([sha]) => sha).join("\n"),
    },
  };
  for (const [sha, text] of versions) {
    answers[`git show ${sha}:${PROCESS}`] = { exitCode: 0, stdout: text };
  }
  return fakeGit(answers);
}

function heard(what) {
  const lines = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

function updating(text, versions, flags = []) {
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: TICKET_SCHEMA,
    [at(PROCESS)]: NEW,
    [at(PATH)]: text,
  });
  const git = history(versions);
  const ran = heard(() => ticket(ROOT, ["update", "slow-lint", ...flags], { disk, join, git }));
  return { ...ran, now: disk.read(at(PATH)) };
}

const VERSIONS = [
  ["bbb", NEW],
  ["aaa", OLD],
];

test("a route standing as its process wrote it takes the new process", () => {
  const said = updating(ticketText(), VERSIONS);
  assert.equal(said.code, 0);
  assert.match(said.now, /checks it twice/);
  assert.match(said.now, new RegExp(`process_hash: ${processHash(NEW)}`));
});

test("a step a person edited past the pointer is named as drift, and nothing changes", () => {
  const text = ticketText({ check: "checks it by hand" });
  const said = updating(text, VERSIONS);
  assert.equal(said.code, 1);
  assert.match(said.said, /\bcheck\b/);
  assert.match(said.said, /drift/);
  assert.equal(said.now, text);
});

test("an edit to a reached leaf is no drift, since the leaf keeps what it holds", () => {
  const said = updating(ticketText({ doing: "makes the change, and its test" }), VERSIONS);
  assert.equal(said.code, 0);
  assert.match(said.now, /makes the change, and its test/);
  assert.match(said.now, /checks it twice/);
});

test("a hash no version answers is refused, and nothing changes", () => {
  const text = ticketText();
  const said = updating(text, [["bbb", NEW]]);
  assert.equal(said.code, 1);
  assert.match(said.said, /stands nowhere in the history/);
  assert.equal(said.now, text);
});

test("--over copies the new route over the drift", () => {
  const said = updating(ticketText({ check: "checks it by hand" }), VERSIONS, ["--over"]);
  assert.equal(said.code, 0);
  assert.match(said.now, /checks it twice/);
});

test("driftOf names an added, a dropped and a changed step, and skips the reached", () => {
  const front = {
    step: "do",
    steps: [
      { name: "do", does: "edited, and reached" },
      { name: "check", does: "changed" },
      { name: "sign", does: "added" },
    ],
  };
  const base = [
    { name: "do", does: "makes the change" },
    { name: "check", does: "checks it" },
    { name: "land", does: "dropped" },
  ];
  assert.deepEqual(driftOf(front, base), ["check", "sign", "land"]);
});

test("driftOf names a step moved past the reached leaves", () => {
  const base = [
    { name: "do", does: "makes the change" },
    { name: "check", does: "checks it" },
    { name: "land", does: "lands it" },
  ];
  const front = { step: "do", steps: [base[0], base[2], base[1]] };
  assert.deepEqual(driftOf(front, base), ["land"]);
});
