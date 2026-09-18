// The window a retro reads, cut into chapters that hold activity. Each chapter
// mints a private ticket carrying its counts, so a reader meets the numbers
// before they read a word.
// [[spec/design_input/the-agent-pulls-tickets]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { retro } from "../../src/scripts/retro.js";
import { SCHEMA } from "./pull-schema.js";

const ROOT = "/tree";
const TICKET = "retro-a1b2c3";
const FIRST = "0000000000000000000000000000000000000000";
const at = (path) => join(ROOT, ...path.split("/"));
const chapterAt = (n) => at(`.se/tickets/${TICKET}-chapter-${n}.md`);

// Two spans hold rows, and the one between them holds none. [[spec/design_input/the-agent-pulls-tickets]]
const LOG = [
  '{"at":"2026-09-18T08:00:00.000Z","kind":"bash","said":"git status"}',
  '{"at":"2026-09-18T09:00:00.000Z","kind":"prompt","said":"the owner asks"}',
  '{"at":"2026-09-18T09:10:00.000Z","kind":"work","said":"pull answered 0"}',
  '{"at":"2026-09-18T09:20:00.000Z","kind":"note","said":"a note stands"}',
  '{"at":"2026-09-18T09:30:00.000Z","kind":"write","level":"warn","said":"Sentence refuses a line"}',
  '{"at":"2026-09-18T20:00:00.000Z","kind":"tool","said":"a tool answers"}',
  '{"at":"2026-09-18T21:00:00.000Z","level":"error","kind":"bridge","said":"the start fails"}',
].join("\n");

const CHAPTER = `for: one chapter of a retro's window, read by one hand
ask:
  - name: window
    form: text
    says: the chapter's first and last moment
  - name: counts
    form: list
    says: what the chapter holds before anybody reads a word
steps:
  - name: read
    does: reads the chapter and answers
    by: helper
    to: retro
    evidence:
      - name: done
        form: list
        says: what was done in these hours
`;

const SAYS = {
  "git rev-parse HEAD": { stdout: "a1b2c3d4e5f6\n" },
  "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
  "git rev-list --max-parents=0 HEAD": { stdout: `${FIRST}\n` },
};

function doors(more = {}) {
  const said = fakeGit(SAYS, ROOT);
  return {
    proc: said.proc,
    disk: fakeDisk({
      [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
      [at("spec/processes/chapter.yaml")]: CHAPTER,
      [at(".se/log/one.jsonl")]: `${LOG}\n`,
    }),
    git: said,
    join,
    clock: fakeClock(),
    node: "node",
    words: 5,
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

// [[spec/design_input/the-agent-pulls-tickets]]
test("collect cuts the window into chapters holding activity, and one holding none stands nowhere", () => {
  const it = doors();

  const { code } = heard(() => retro(ROOT, ["collect", TICKET], it));

  assert.equal(code, 0);
  assert.equal(it.disk.exists(chapterAt(1)), true, "the morning holds rows");
  assert.equal(it.disk.exists(chapterAt(2)), true, "the evening holds rows");
  assert.equal(it.disk.exists(chapterAt(3)), false, "the span between holds none");
});

// A chapter stands where the pull finds it, so the readers step hands it out. [[spec/tickets/the-retro-cuts-its-window]]
test("each chapter mints off the chapter route, and names the retro as its group", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  const said = it.disk.read(chapterAt(1));
  assert.match(said, /process: \[\[spec\/processes\/chapter\]\]/);
  assert.match(said, new RegExp(`^group: ${TICKET}$`, "m"));
  assert.match(said, /^state: open$/m);
});

// The counts stand before anybody reads a word. [[spec/design_input/the-agent-pulls-tickets]]
test("a chapter carries its window and its counts in the ask", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  const said = it.disk.read(chapterAt(1));
  assert.match(said, /2026-09-18T06:00/, "the window names its first moment");
  assert.match(said, /prompts: 1/);
  assert.match(said, /shell: 1/);
  assert.match(said, /tickets: 1/);
  assert.match(said, /notes: 1/);
  assert.match(said, /errors: 0/);
  assert.match(said, /refusals: Sentence 1/, "the ask names a refusal by its rule");
  assert.match(said, /thought: 0/, "a box naming no transcript reads none");
});

// The drain decides what a hand parks, and a chapter closes at its own step. [[spec/tickets/the-retro-cuts-its-window]]
test("the note drain passes a chapter, and answers zero once the chapters stand", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));
  const { code, said } = heard(() => retro(ROOT, ["notes"], it));

  assert.equal(code, 0, "the chapters hold the drain open nowhere");
  assert.match(said, /holds no open note/);
});

// [[spec/tickets/the-retro-cuts-its-window]]
test("a window with no retro behind it opens at the tree's first commit", () => {
  const it = doors();

  heard(() => retro(ROOT, ["collect", TICKET], it));

  const rows = it.disk
    .read(at(`.se/retro/${TICKET}/manifest.jsonl`))
    .split("\n")
    .filter(Boolean)
    .map((row) => JSON.parse(row));
  const said = rows.find((one) => String(one.path) === "window.json");

  assert.ok(said, "the window takes a manifest line");
  const held = JSON.parse(it.disk.read(at(`.se/retro/${TICKET}/window.json`)));
  assert.equal(held.from, FIRST, "no retro closes before it");
  assert.equal(held.chapters, 2);
});
