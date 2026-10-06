// The sidebar's logbook over the fake index, whose log/say appends as the log
// verb does. Another writer lands a line the moment the first say reaches the
// session file, which is the gap a read and a write back leave open.
// [[spec/design_output/log#every-writer-appends]] [[spec/tickets/the-sidebar-writes-through-actions]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { logbookOf } from "../../src/extension/lib/logbook.js";
import { v1Over } from "./v1-index.js";

const OTHER = `${JSON.stringify({ at: "x", level: "info", kind: "cli", said: "the other writer" })}\n`;

function doorOf(seed = {}) {
  const files = fakeDisk(seed);
  let landed = false;
  const lands = (path) => {
    if (landed || path !== SESSION) return;
    landed = true;
    files.append(SESSION, OTHER);
  };
  const disk = {
    ...files,
    append: (path, text) => {
      lands(path);
      files.append(path, text);
    },
  };
  return { files, now: () => 0, index: v1Over(disk) };
}

const saidIn = (door) =>
  door.files
    .read(SESSION)
    .trim()
    .split("\n")
    .map((one) => JSON.parse(one).said);

test("a line another writer appends while the logbook writes stays in the log", async () => {
  const door = doorOf();
  await logbookOf(door, async () => "info").say(
    "info",
    "sidebar",
    "stop.hold is finish",
  );
  assert.deepEqual(saidIn(door), ["the other writer", "stop.hold is finish"]);
});

test("a logbook line lands after every line the session holds", async () => {
  const held = `${JSON.stringify({ at: "x", level: "info", kind: "level0", said: "session start" })}\n`;
  const door = doorOf({ [SESSION]: held });
  const book = logbookOf(door, async () => "info");
  await book.say("info", "sidebar", "one press");
  await book.say("info", "sidebar", "two presses");
  assert.deepEqual(saidIn(door), [
    "session start",
    "the other writer",
    "one press",
    "two presses",
  ]);
});

test("a line below the level now posts nothing", async () => {
  const door = doorOf();
  const row = await logbookOf(door, async () => "warn").say("info", "sidebar", "a quiet press");
  assert.equal(row, undefined);
  assert.equal(door.files.exists(SESSION), false);
});
