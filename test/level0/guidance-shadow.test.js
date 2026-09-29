// The guidance slice in shadow: each asked leaf's notes meet the module's,
// and a leaf answered apart makes one row.
// [[spec/tickets/the-guidance-topic-lands]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  guidanceShadow,
  KEY,
  SHADOW,
  SLICE,
} from "../../src/scripts/guidance-shadow.js";

const DRAFT = "standard:design/draft";
const GATE = "standard:gate";

// Fake doors: a slice mode, a binary standing or not, and a quack answering the notes it holds. [[spec/tickets/the-guidance-topic-lands]]
function doorsOf({ mode = SHADOW, binary = true, answered = {} } = {}) {
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

test("a leaf answered apart writes one shadow row", async () => {
  const doors = doorsOf({
    answered: {
      [DRAFT]: ["spec/guidance/code/style"],
      [GATE]: ["spec/guidance/review/design"],
    },
  });
  const rows = await guidanceShadow(doors, {
    [DRAFT]: ["spec/guidance/code/style", "spec/guidance/code/testing"],
    [GATE]: ["spec/guidance/review/design"],
  });

  assert.equal(rows.length, 1);
  assert.deepEqual(doors.ran[0], ["/tree/quack", "guidance"]);
  assert.equal(doors.said.length, 1);
  const row = doors.said[0];
  assert.equal(row.kind, SHADOW);
  assert.equal(row.fields.slice, SLICE);
  assert.equal(row.fields.leaf, DRAFT);
  assert.deepEqual(row.fields.old, [
    "spec/guidance/code/style",
    "spec/guidance/code/testing",
  ]);
  assert.deepEqual(row.fields.new, ["spec/guidance/code/style"]);
  assert.match(row.text, /standard:design\/draft/);
});

test("the slice at old runs no quack", async () => {
  const doors = doorsOf({ mode: "old" });
  assert.deepEqual(await guidanceShadow(doors, { [DRAFT]: [] }), []);
  assert.equal(doors.ran.length, 0);
});

test("a missing binary writes nothing", async () => {
  const doors = doorsOf({ binary: false });
  assert.deepEqual(await guidanceShadow(doors, { [DRAFT]: [] }), []);
  assert.equal(doors.ran.length, 0);
});
