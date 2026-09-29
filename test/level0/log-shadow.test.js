// The log slice in shadow: the verb's rows meet the module's, and a row read
// apart makes one shadow row.
// [[spec/tickets/the-log-topic-lands]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { KEY, logShadow, SHADOW, SLICE } from "../../src/scripts/log-shadow.js";

const AT = "2026-01-02T03:04:05.000Z";
const LATER = "2026-01-02T03:04:06.000Z";

// Fake doors: a slice mode, a binary standing or not, and a quack answering the rows it holds. [[spec/tickets/the-log-topic-lands]]
function doorsOf({ mode = SHADOW, binary = true, answered = [] } = {}) {
  const ran = [];
  const said = [];
  return {
    ran,
    said,
    root: "/tree",
    binary: "/tree/quack",
    settings: { ask: async (key) => (key === KEY ? mode : "") },
    files: { exists: () => binary },
    proc: {
      run(argv) {
        ran.push(argv);
        return { exitCode: 0, stdout: JSON.stringify(answered) };
      },
    },
    log: {
      say: async (level, kind, text, fields) =>
        said.push({ level, kind, text, fields }),
    },
  };
}

test("a row read apart writes one shadow row", async () => {
  const doors = doorsOf({
    answered: [
      { at: AT, level: "info", kind: "tool", said: "reads" },
      { at: LATER, level: "info", kind: "vale", said: "a level nobody knows" },
    ],
  });
  const rows = await logShadow(doors, [
    { at: AT, level: "info", kind: "tool", said: "reads" },
    { at: LATER, level: "warn", kind: "vale", said: "a level nobody knows" },
  ]);

  assert.equal(rows.length, 1);
  assert.deepEqual(doors.ran[0], ["/tree/quack", "log"]);
  assert.equal(doors.said.length, 1);
  const row = doors.said[0];
  assert.equal(row.kind, SHADOW);
  assert.equal(row.fields.slice, SLICE);
  assert.equal(row.fields.at, LATER);
  assert.equal(row.fields.old.level, "warn");
  assert.equal(row.fields.new.level, "info");
});

test("a shadow row leaves the compare", async () => {
  const doors = doorsOf({
    answered: [{ at: AT, level: "info", kind: "tool", said: "reads" }],
  });
  const rows = await logShadow(doors, [
    { at: AT, level: "info", kind: "tool", said: "reads" },
    { at: LATER, level: "info", kind: SHADOW, said: "an earlier mismatch" },
  ]);
  assert.deepEqual(rows, []);
  assert.equal(doors.ran.length, 1);
});

test("the slice at old runs no quack", async () => {
  const doors = doorsOf({ mode: "old" });
  assert.deepEqual(await logShadow(doors, []), []);
  assert.equal(doors.ran.length, 0);
});
