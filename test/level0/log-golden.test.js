// The log golden file holds the rows each JavaScript reader reads off the
// fixture session log.
// [[spec/tickets/the-log-topic-lands]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { it as doors } from "../../src/scripts/cli-doors.js";
import { FIXTURE, GOLDEN, READERS, readersOf } from "../../src/scripts/log-golden.js";

test("the golden holds the rows lib/log.js and the extension read", () => {
  const said = readersOf(String(doors.disk.read(FIXTURE)));
  let golden = {};
  try {
    golden = JSON.parse(String(doors.disk.read(GOLDEN)));
  } catch {}
  for (const name of Object.values(READERS)) {
    assert.ok(said[name]?.length, `${name} reads a row off the fixture`);
    assert.ok(
      golden[name],
      `the golden file holds no section for ${name}: run node test/level0/log-golden.js`,
    );
    assert.deepEqual(
      said[name],
      golden[name],
      `${name} reads apart from the golden file: run node test/level0/log-golden.js, and read the difference at the merge`,
    );
  }
});

test("a torn line drops out of lib/log.js, and the extension prints it raw", () => {
  const said = readersOf("not a row\n");
  assert.deepEqual(said[READERS.asRow], []);
  assert.equal(said[READERS.rowOf].length, 1);
  assert.match(String(said[READERS.rowOf][0]), /not a row/);
});
