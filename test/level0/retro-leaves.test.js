// The material a retro's own reading needs, laid out one file a leaf. Collect
// writes them beside the copies, and the manifest names each line.
// [[spec/design_input/the-agent-pulls-tickets]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { retro } from "../../src/scripts/retro.js";

const ROOT = "/tree";
const TICKET = "retro-a1b2c3";
const FIRST = "0000000000000000000000000000000000000000";
const at = (path) => join(ROOT, ...path.split("/"));
const leafAt = (name) => at(`.se/retro/${TICKET}/leaves/${name}.jsonl`);

const LOG = [
  '{"at":"2026-09-18T08:00:00.000Z","kind":"bash","said":"git status"}',
  '{"at":"2026-09-18T08:05:00.000Z","kind":"bash","said":"git status"}',
  '{"at":"2026-09-18T09:00:00.000Z","kind":"write","level":"warn","said":"Sentence refuses a line"}',
  '{"at":"2026-09-18T09:30:00.000Z","kind":"write","level":"warn","said":"Sentence refuses a line"}',
  '{"at":"2026-09-18T10:00:00.000Z","level":"error","kind":"bridge","said":"the start fails"}',
].join("\n");

const CLOSED = `---
kind: [[ticket]]
state: closed
reason: done
---

# Ask
`;

const FILES = {
  [at(".se/log/one.jsonl")]: `${LOG}\n`,
  [at(".se/scripts/one.mjs")]: "// a script a hand writes\n",
};

const SAYS = {
  "git rev-parse HEAD": { stdout: "a1b2c3d4e5f6\n" },
  "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
  [`git rev-list --max-parents=0 HEAD`]: { stdout: `${FIRST}\n` },
  [`git log --format=%H ${FIRST}..HEAD -- spec/tickets`]: { stdout: "cafe01\n" },
  "git show cafe01 --name-only --format=": { stdout: "spec/tickets/a-child.md\n" },
  "git show cafe01:spec/tickets/a-child.md": { stdout: CLOSED },
};

function doors(files = FILES, answers = SAYS, more = {}) {
  const said = fakeGit(answers, ROOT);
  return {
    proc: said.proc,
    disk: fakeDisk(files),
    git: said,
    join,
    clock: fakeClock(),
    node: "node",
    ...more,
  };
}

function heard(run) {
  const rows = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => rows.push(said.join(" "));
  console.error = (...said) => rows.push(said.join(" "));
  try {
    return { code: run(), said: rows.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

const rowsOf = (it, name) =>
  it.disk
    .read(leafAt(name))
    .split("\n")
    .filter(Boolean)
    .map((row) => JSON.parse(row));

// [[spec/design_input/the-agent-pulls-tickets]]
test("collect writes one file a leaf, and an empty window leaves an empty file", () => {
  const it = doors();

  const { code } = heard(() => retro(ROOT, ["collect", TICKET], it));

  assert.equal(code, 0);
  for (const name of [
    "shell",
    "refusals",
    "tickets",
    "scripts",
    "runs",
    "unread",
    "retros",
  ]) {
    assert.equal(it.disk.exists(leafAt(name)), true, `${name} takes a file`);
  }
});

// [[spec/design_input/the-agent-pulls-tickets]]
test("the shell leaf groups a command by its job, with a count and one example", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  const said = rowsOf(it, "shell").find((one) => String(one.job) === "git");
  assert.ok(said, "the job takes a row");
  assert.equal(said.count, 2);
  assert.match(String(said.example), /git status/);
});

// [[spec/design_input/the-agent-pulls-tickets]]
test("the refusals leaf counts a rule, so a reader sees which fires most", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  const said = rowsOf(it, "refusals").find((one) => String(one.rule) === "Sentence");
  assert.ok(said, "the rule takes a row");
  assert.equal(said.count, 2);
});

// The takes off git reach the retro folder, so no leaf reads git itself. [[spec/tickets/the-retro-lays-its-leaves]]
test("the tickets leaf holds each ticket closing in the window, as that commit leaves it", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  const rows = rowsOf(it, "tickets");
  const said = rows.find((one) => String(one.ticket) === "a-child");
  assert.ok(said, "the closed ticket takes a row");
  assert.match(String(said.text), /state: closed/);
});

// [[spec/design_input/the-agent-pulls-tickets]]
test("the manifest names every leaf file, so the unread leaf finds them all", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  const rows = it.disk
    .read(at(`.se/retro/${TICKET}/manifest.jsonl`))
    .split("\n")
    .filter(Boolean)
    .map((row) => JSON.parse(row));

  const said = rows.filter((one) => String(one.from) === "leaves");
  assert.ok(said.length >= 7, "a leaf file takes a manifest line");
  assert.ok(
    said.every((one) => String(one.path).startsWith("leaves/")),
    "each one stands under the leaves folder",
  );
});
