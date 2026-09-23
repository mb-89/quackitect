// The log verb, driven through fake doors: the filters over rows in
// memory, and the files a span opens.
// [[spec/design_output/log#one-verb-reads-the-log]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { OLD, SESSION } from "../../.claude/skills/level0/lib/log.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import {
  atLevel,
  carrying,
  filesFor,
  lastOf,
  ofKind,
  rowsIn,
  within,
} from "../../src/scripts/log-read.js";

const ROOT = "/tree";
const NOW = Date.parse("2026-01-01T12:00:00.000Z");

const row = (at, level, kind, said) => ({ at, level, kind, said });
const rows = [
  row("2026-01-01T09:00:00.000Z", "debug", "hook", "the door reads a write"),
  row("2026-01-01T11:30:00.000Z", "info", "work", "take answered 0"),
  row("2026-01-01T11:50:00.000Z", "warn", "hook", "the door refuses a write"),
  row("2026-01-01T11:59:00.000Z", "error", "vale", "two lines come back"),
];

const said = (held) => held.map((one) => one.said);

// [[spec/design_output/log#one-verb-reads-the-log]]
test("a span keeps the rows stamped inside it, and drops the ones before", () => {
  assert.deepEqual(said(within(rows, "1h", NOW)), [
    "take answered 0",
    "the door refuses a write",
    "two lines come back",
  ]);
  assert.deepEqual(said(within(rows, "15m", NOW)), [
    "the door refuses a write",
    "two lines come back",
  ]);
  assert.deepEqual(said(within(rows, "5m", NOW)), ["two lines come back"]);
  assert.deepEqual(said(within(rows, "1d", NOW)).length, 4);
});

// [[spec/design_output/log#what-a-box-writes]]
test("a level keeps that level and every one above it", () => {
  assert.deepEqual(said(atLevel(rows, "warn")), [
    "the door refuses a write",
    "two lines come back",
  ]);
  assert.deepEqual(said(atLevel(rows, "debug")).length, 4);
  assert.deepEqual(said(atLevel(rows, "fatal")), []);
});

// [[spec/design_output/log#one-verb-reads-the-log]]
test("a kind keeps the rows of that kind, and no other", () => {
  assert.deepEqual(said(ofKind(rows, "hook")), [
    "the door reads a write",
    "the door refuses a write",
  ]);
  assert.deepEqual(said(ofKind(rows, "nothing")), []);
});

// [[spec/design_output/log#one-verb-reads-the-log]]
test("a count keeps the last rows, and a count past the rows keeps them all", () => {
  assert.deepEqual(said(lastOf(rows, 2)), [
    "the door refuses a write",
    "two lines come back",
  ]);
  assert.deepEqual(said(lastOf(rows, 9)).length, 4);
  assert.deepEqual(said(lastOf(rows, 0)).length, 4, "no count keeps every row");
});

// A rotated file carries its first stamp in its name, so a span opens the ones it reaches. [[spec/design_output/log#a-session-rotates-its-file]]
test("a span opens the session file and every rotated file it reaches", () => {
  const old = join(ROOT, OLD);
  const it = {
    root: ROOT,
    join,
    disk: fakeDisk({
      [join(ROOT, SESSION)]: "",
      [join(old, "2026-01-01T11-00-00-aaa.jsonl")]: "",
      [join(old, "2025-12-30T08-00-00-bbb.jsonl")]: "",
      [join(old, "2025-12-20T08-00-00-ccc.jsonl")]: "",
    }),
    names: (at, end) =>
      it.disk
        .list(at)
        .filter((one) => one.name.endsWith(end))
        .map((one) => one.name),
  };

  const near = filesFor(it, "2h", NOW);
  assert.deepEqual(
    near,
    [
      join(old, "2025-12-30T08-00-00-bbb.jsonl"),
      join(old, "2026-01-01T11-00-00-aaa.jsonl"),
      join(ROOT, SESSION),
    ],
    "the newest file opening before the span runs on into it, and an older one stays shut",
  );

  const far = filesFor(it, "20d", NOW);
  assert.equal(far.length, 4, "a wider span reaches the older files too");
  assert.equal(far.at(-1), join(ROOT, SESSION), "the session file reads last");
});

// Two writers appending at once tear one line. [[spec/design_output/log#every-writer-appends]]
test("a torn line drops alone, and the rows around it read", () => {
  const at = join(ROOT, SESSION);
  const it = {
    disk: fakeDisk({
      [at]: `${JSON.stringify(rows[0])}\n{"at":"2026-01\n${JSON.stringify(rows[1])}\n`,
    }),
  };

  assert.deepEqual(said(rowsIn(it, [at])), ["the door reads a write", "take answered 0"]);
});

// [[spec/design_output/log#one-verb-reads-the-log]]
test("the rows read out of every file the span opens, in the order they stand", () => {
  const at = join(ROOT, SESSION);
  const it = {
    disk: fakeDisk({
      [at]: `${JSON.stringify(rows[0])}\n${JSON.stringify(rows[1])}\n`,
    }),
  };

  assert.deepEqual(said(rowsIn(it, [at])), [
    "the door reads a write",
    "take answered 0",
  ]);
});

// A search of the log reads the file, because the index walks no log. [[spec/design_output/log#one-verb-reads-the-log]]
test("words keep the rows carrying every one of them, in any case, and no words keep them all", () => {
  assert.deepEqual(said(carrying(rows, "door WRITE")), [
    "the door reads a write",
    "the door refuses a write",
  ]);
  assert.deepEqual(said(carrying(rows, "vale")), ["two lines come back"], "a word in the kind counts");
  assert.deepEqual(said(carrying(rows, "door nothing")), []);
  assert.deepEqual(said(carrying(rows, "")).length, 4);
});
