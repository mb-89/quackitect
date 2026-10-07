// The log line, the file it lands in, and the level a box writes at.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aimOf,
  archiveOf,
  asRow,
  LEVELS,
  logSpec,
  nameOf,
  rowOf,
  tallied,
  timeOf,
  writes,
} from "../../.claude/skills/level0/lib/log.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const AT = "2026-09-08T14:22:51.000Z";
const ID = "a6f8c43b";
const FOLDER = "/log";

test("an old session's name carries the day and the time", () => {
  assert.equal(nameOf(AT, ID), "2026-09-08T14-22-51-a6f8c43b.jsonl");
  assert.equal(timeOf(nameOf(AT, ID)), Date.parse("2026-09-08T14:22:51.000Z"));
  assert.equal(timeOf("notes.md"), 0);
});

// [[spec/design_output/log#a-session-rotates-its-file]]
test("an old session takes the name of its first line's time, or of now", () => {
  const text = `${JSON.stringify({ at: AT, level: "info", kind: "level0", said: "session start" })}\n`;
  assert.equal(
    archiveOf(text, "2026-09-09T00:00:00.000Z", ID),
    `.se/.log/old/${nameOf(AT, ID)}`,
  );
  assert.equal(
    archiveOf("not json\n", "2026-09-09T00:00:00.000Z", ID),
    `.se/.log/old/${nameOf("2026-09-09T00:00:00.000Z", ID)}`,
  );
});

// [[spec/design_output/log#the-log-tool]]
test("the log tool asks for a kind and one sentence", () => {
  const spec = logSpec();
  assert.equal(spec.name, "log");
  assert.deepEqual(spec.inputSchema.required, ["kind", "said"]);
});

test("a row without lnav shows the four fields, and the rest beneath", () => {
  const one = { at: AT, level: "warn", kind: "write", said: "refused" };
  assert.equal(asRow(one), "14:22:51.000 warn  write  refused");
  assert.match(asRow({ ...one, rule: "Passive" }), /\n\s+rule=Passive$/);
});

test("a box naming no level, and one naming a level nobody knows, write from info up", () => {
  for (const at of [undefined, "", "loud"]) {
    for (const level of ["info", "warn", "error", "fatal"]) {
      assert.equal(writes(at, level), true, `${at} writes ${level}`);
    }
    assert.equal(writes(at, "debug"), false, `${at} leaves debug out`);
  }
});

test("a box at error writes a fault alone", () => {
  assert.deepEqual(
    ["debug", "info", "warn", "error", "fatal"].map((level) => writes("error", level)),
    [false, false, false, true, true],
  );
});

// [[spec/design_output/log#what-a-box-writes]]
test("the ladder climbs debug, info, warn, error, fatal, and a box at debug writes everything", () => {
  assert.deepEqual(LEVELS, ["debug", "info", "warn", "error", "fatal"]);
  assert.deepEqual(
    LEVELS.map((level) => writes("debug", level)),
    [true, true, true, true, true],
  );
  assert.equal(rowOf(AT, "debug", "hook", "the door sees a call").level, "debug");
  assert.equal(rowOf(AT, "fatal", "hook", "the cage falls").level, "fatal");
  assert.equal(rowOf(AT, "", "hook", "a line naming no level").level, "info");
});

// [[spec/design_output/log#what-a-tool-line-names]]
test("a tool line names the field the call aims at", () => {
  assert.equal(
    aimOf({ tool: "Write", file_path: "spec/guidance/voice.md" }),
    "spec/guidance/voice.md",
  );
  assert.equal(aimOf({ tool: "Edit", file_path: "RUNME.sh" }), "RUNME.sh");
  assert.equal(aimOf({ tool: "Bash", command: "git status" }), "git status");
  assert.equal(aimOf({ tool: "WebSearch", query: "lnav formats" }), "lnav formats");
  assert.equal(
    aimOf({ tool: "WebFetch", url: "https://lnav.org" }),
    "https://lnav.org",
  );
  assert.equal(aimOf({ tool: "TaskList" }), "TaskList");
});

// [[spec/design_output/log#a-reader-reads-new-rows]]
test("a reader folds the rows past its offset, waits on a torn row, and starts again on a shorter file", () => {
  const files = fakeDisk();
  const path = `${FOLDER}/session.jsonl`;
  const row = (kind, said) => `${JSON.stringify({ at: AT, level: "info", kind, said })}\n`;
  const count = (held) =>
    tallied(files, path, held, (n, one) => (one.kind === "prompt" ? n + 1 : n), () => 0);

  let held = count(undefined);
  assert.equal(held.value, 0, "no file, no row");
  files.write(path, `${row("prompt", "über")}${row("tool", "a call")}`);
  held = count(held);
  assert.equal(held.value, 1);
  files.append(path, `${row("prompt", "two")}{"kind":"prom`);
  held = count(held);
  assert.equal(held.value, 2, "the torn row waits");
  files.append(path, `pt"}\n`);
  held = count(held);
  assert.equal(held.value, 3, "and counts once its newline lands");
  const reads = [];
  const watched = { ...files, readFrom: (_at, from) => reads.push(from) && "" };
  assert.equal(tallied(watched, path, held, () => 99, () => 0).value, 3, "a file the reader has seen whole reads nothing");
  assert.deepEqual(reads, []);
  files.write(path, row("prompt", "a new session"));
  assert.equal(count(held).value, 1, "a rotated file counts from the top");
});
