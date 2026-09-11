// The log door, against the real filesystem. Every other test takes the fake,
// and this one holds the fake to what the disk does.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { nameOf } from "../../.claude/skills/level0/lib/log.js";
import { clock } from "../../src/doors/clock.js";
import { disk } from "../../src/doors/disk.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { log } from "../../src/doors/log.js";

const AT = "2026-09-08T14:22:51.000Z";
const ID = "a6f8c43b";

async function through(door, files, folder) {
  await door.say("warn", "write", "refused a line");
  await door.say("nope", "bash", "x".repeat(120), { file: "a.md", ms: 3 });

  return {
    path: door.path.slice(folder.length),
    text: files.read(door.path),
    lines: door.lines(),
  };
}

function real() {
  const files = disk();
  const folder = `${files.tempDir("level0-log-").split("\\").join("/")}/log`;
  const door = log(files, fakeClock(AT), { folder, id: ID });
  return { door, files, folder };
}

test("the real door writes one file per session, one JSON object per line", async () => {
  const it = real();
  await it.door.say("info", "work", "took work/the-log-gets-written");
  await it.door.say("info", "work", "pushed");

  const rows = it.files
    .read(it.door.path)
    .split("\n")
    .filter(Boolean)
    .map((row) => JSON.parse(row));

  assert.equal(it.door.path, `${it.folder}/${nameOf(AT, ID)}`);
  assert.deepEqual(
    rows.map((one) => one.said),
    ["took work/the-log-gets-written", "pushed"],
  );
  assert.equal(it.files.list(it.folder).length, 1);
  it.files.remove(it.folder);
});

test("the fake answers what the real door answers", async () => {
  const it = real();
  const said = await through(it.door, it.files, it.folder);
  it.files.remove(it.folder);

  const fake = fakeLog(fakeClock(AT), { folder: "/log", id: ID });
  assert.deepEqual(await through(fake, fake.files, "/log"), said);
});

test("the real door names a file the day and the time sort", () => {
  const files = disk();
  const folder = `${files.tempDir("level0-log-").split("\\").join("/")}/log`;
  const door = log(files, clock(), { folder });
  assert.match(door.path, /\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-[0-9a-z]{8}\.jsonl$/);
  files.remove(folder);
});
