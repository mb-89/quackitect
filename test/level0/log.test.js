// The log line, the file it lands in, and the level a box writes at.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aimOf,
  appended,
  archiveOf,
  asRow,
  logSpec,
  nameOf,
  rowsOf,
  timeOf,
  writes,
} from "../../.claude/skills/level0/lib/log.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeLog } from "../../src/doors/fake/log.js";

const AT = "2026-09-08T14:22:51.000Z";
const ID = "a6f8c43b";
const FOLDER = "/log";

function door(from = AT, level) {
  return fakeLog(fakeClock(from), { folder: FOLDER, level });
}

test("a line carries the time, the level, the kind and one sentence", async () => {
  const it = door();
  const row = await it.say("warn", "write", "refused a line");
  assert.deepEqual(row, {
    at: AT,
    level: "warn",
    kind: "write",
    said: "refused a line",
  });
});

test("a field outside the four stands beside them", async () => {
  const it = door();
  const row = await it.say("error", "vale", "the rules refuse this", {
    file: "spec/guidance/voice.md",
    rule: "LongSentence",
  });
  assert.equal(row.file, "spec/guidance/voice.md");
  assert.equal(row.rule, "LongSentence");
});

test("a line says eighty characters, and drops what runs past", async () => {
  const it = door();
  const row = await it.say("info", "bash", "x".repeat(120));
  assert.equal(row.said.length, 80);
});

test("a level nobody names reads as info", async () => {
  const it = door();
  const row = await it.say("shout", "judge", "a model read this");
  assert.equal(row.level, "info");
});

test("an old session's name carries the day and the time", () => {
  assert.equal(nameOf(AT, ID), "2026-09-08T14-22-51-a6f8c43b.jsonl");
  assert.equal(timeOf(nameOf(AT, ID)), Date.parse("2026-09-08T14:22:51.000Z"));
  assert.equal(timeOf("notes.md"), 0);
});

// [[spec/design_output/log#a-session-rotates-its-file]]
test("an old session takes the name of its first line's time, or of now", () => {
  const text = `${JSON.stringify({ at: AT, level: "info", kind: "level0", said: "session start" })}\n`;
  assert.equal(archiveOf(text, "2026-09-09T00:00:00.000Z", ID), `.se/log/old/${nameOf(AT, ID)}`);
  assert.equal(
    archiveOf("not json\n", "2026-09-09T00:00:00.000Z", ID),
    `.se/log/old/${nameOf("2026-09-09T00:00:00.000Z", ID)}`,
  );
});

// [[spec/design_output/log#every-writer-appends]]
test("a line appended keeps every line before it, and mends a missing newline", () => {
  const row = { at: AT, level: "info", kind: "work", said: "pushed" };
  assert.equal(appended("", row), `${JSON.stringify(row)}\n`);
  assert.equal(appended('{"a":1}', row), `{"a":1}\n${JSON.stringify(row)}\n`);
  assert.equal(appended('{"a":1}\n', row), `{"a":1}\n${JSON.stringify(row)}\n`);
});

// [[spec/design_output/log#the-log-tool]]
test("the log tool asks for a kind and one sentence", () => {
  const spec = logSpec();
  assert.equal(spec.name, "log");
  assert.deepEqual(spec.inputSchema.required, ["kind", "said"]);
});

test("the door writes the session file, and a second line keeps the first", async () => {
  const it = door();
  await it.say("info", "work", "took work/the-log-gets-written");
  await it.say("info", "work", "pushed");

  assert.equal(it.path, `${FOLDER}/session.jsonl`);
  assert.deepEqual(
    rowsOf(it.files.read(it.path)).map((one) => one.said),
    ["took work/the-log-gets-written", "pushed"],
  );
  assert.equal(it.files.list(FOLDER).length, 1);
});

test("every line the door writes parses as JSON", async () => {
  const it = door();
  await it.say("info", "write", 'a said with "quotes" and a \\ in it');
  await it.say("info", "write", "a second line");
  const text = it.files.read(it.path);
  for (const row of text.split("\n").filter(Boolean)) {
    assert.equal(typeof JSON.parse(row).at, "string");
  }
  assert.equal(text.endsWith("\n"), true);
});

test("a row without lnav shows the four fields, and the rest beneath", () => {
  const one = { at: AT, level: "warn", kind: "write", said: "refused" };
  assert.equal(asRow(one), "14:22:51.000 warn  write  refused");
  assert.match(asRow({ ...one, rule: "Passive" }), /\n\s+rule=Passive$/);
});

test("a box at warn writes a refusal and a fault, and no info line", async () => {
  const it = door(AT, "warn");
  await it.say("info", "tool", "a call nobody refuses");
  await it.say("warn", "write", "refused a line");
  await it.say("error", "vale", "the linter fell over");

  assert.deepEqual(
    it.lines().map((one) => one.level),
    ["warn", "error"],
  );
  assert.deepEqual(
    rowsOf(it.files.read(it.path)).map((one) => one.kind),
    ["write", "vale"],
  );
});

test("a box naming no level, and one naming a level nobody knows, write everything", () => {
  for (const at of [undefined, "", "loud"]) {
    for (const level of ["info", "warn", "error"]) {
      assert.equal(writes(at, level), true, `${at} writes ${level}`);
    }
  }
});

test("a box at error writes a fault alone", () => {
  assert.deepEqual(
    ["info", "warn", "error"].map((level) => writes("error", level)),
    [false, false, true],
  );
});

test("a box writing nothing leaves no file behind", async () => {
  const it = door(AT, "error");
  await it.say("info", "tool", "a call nobody refuses");
  assert.equal(it.files.exists(it.path), false);
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
