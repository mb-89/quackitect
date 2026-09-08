// The log line, the file it lands in, and the prune that decides what goes.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeClock } from "../../doors/fake/clock.js";
import { fakeLog } from "../../doors/fake/log.js";
import { asRow, dropping, nameOf, rowsOf, timeOf } from "../lib/log.js";

const AT = "2026-09-08T14:22:51.000Z";
const ID = "a6f8c43b";
const FOLDER = "/log";

function door(from = AT) {
  return fakeLog(fakeClock(from), { folder: FOLDER, id: ID });
}

function named(day, id = "0000000a") {
  return `${day}-${id}.jsonl`;
}

test("a line carries the time, the level, the door and one sentence", async () => {
  const it = door();
  const row = await it.say("warn", "write", "refused a line");
  assert.deepEqual(row, {
    at: AT,
    level: "warn",
    door: "write",
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

test("the file name carries the day and the time", () => {
  assert.equal(nameOf(AT, ID), "2026-09-08T14-22-51-a6f8c43b.jsonl");
  assert.equal(timeOf(nameOf(AT, ID)), Date.parse("2026-09-08T14:22:51.000Z"));
  assert.equal(timeOf("notes.md"), 0);
});

test("the door writes one file, and a second line keeps the first", async () => {
  const it = door();
  await it.say("info", "work", "took work/the-log-gets-written");
  await it.say("info", "work", "pushed");

  assert.equal(it.path, `${FOLDER}/2026-09-08T14-22-51-a6f8c43b.jsonl`);
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

test("the prune drops a file older than the day cap", async () => {
  const it = door();
  await it.say("info", "write", "a line, so the folder stands");
  it.files.write(`${FOLDER}/${named("2026-08-01T00-00-00")}`, "{}\n");

  const went = it.prune({ days: 14, files: 200 });
  assert.deepEqual(went, [named("2026-08-01T00-00-00")]);
  assert.equal(it.files.exists(`${FOLDER}/${named("2026-08-01T00-00-00")}`), false);
  assert.equal(it.files.exists(it.path), true);
});

test("the prune drops the oldest past the file cap", async () => {
  const it = door();
  await it.say("info", "write", "a line, so the folder stands");
  for (const hour of ["09", "10", "11"]) {
    it.files.write(`${FOLDER}/${named(`2026-09-08T${hour}-00-00`)}`, "{}\n");
  }

  const went = it.prune({ days: 14, files: 2 });
  assert.deepEqual(went, [
    named("2026-09-08T09-00-00"),
    named("2026-09-08T10-00-00"),
  ]);
  assert.deepEqual(
    it.files
      .list(FOLDER)
      .map((one) => one.name)
      .sort(),
    [named("2026-09-08T11-00-00"), "2026-09-08T14-22-51-a6f8c43b.jsonl"],
  );
});

test("the prune leaves a file inside both caps", async () => {
  const it = door();
  await it.say("info", "write", "a line, so the folder stands");
  assert.deepEqual(it.prune({ days: 14, files: 200 }), []);
  assert.equal(it.files.exists(it.path), true);
});

test("the prune answers nothing where no folder stands", () => {
  assert.deepEqual(door().prune(), []);
});

test("the prune reads a file this tree never named", () => {
  const now = Date.parse("2026-09-08T14:00:00.000Z");
  assert.deepEqual(dropping(["notes.md", named("2026-01-01T00-00-00")], now), [
    named("2026-01-01T00-00-00"),
  ]);
});

test("a row without lnav shows the four fields, and the rest beneath", () => {
  const one = { at: AT, level: "warn", door: "write", said: "refused" };
  assert.equal(asRow(one), "14:22:51.000 warn  write  refused");
  assert.match(asRow({ ...one, rule: "Passive" }), /\n\s+rule=Passive$/);
});
