// The sidebar's logbook over a fake editor door. Another writer lands a line
// the moment the logbook first touches the session file, which is the gap a
// read and a write back leave open.
// [[spec/design_output/log#every-writer-appends]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { logbookOf } from "../../src/extension/lib/logbook.js";

const OTHER = `${JSON.stringify({ at: "x", level: "info", kind: "cli", said: "the other writer" })}\n`;

function doorOf(seed = {}) {
  const files = fakeDisk(seed);
  let landed = false;
  const lands = (path) => {
    if (landed || path !== SESSION) return;
    landed = true;
    files.append(SESSION, OTHER);
  };
  return {
    files,
    now: () => 0,
    read: async (path) => {
      const said = files.exists(path) ? files.read(path) : "";
      lands(path);
      return said;
    },
    write: async (path, text) => files.write(path, text),
    append: async (path, text) => {
      lands(path);
      files.append(path, text);
    },
  };
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
