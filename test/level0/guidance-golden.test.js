// The golden file's old section holds what readsFor hands every leaf of every
// process in this tree, on a box binding no env.
// [[spec/tickets/the-guidance-topic-lands]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { it as doors } from "../../src/scripts/cli-doors.js";
import {
  GOLDEN,
  oldSection,
  SECTION,
  treeOf,
} from "../../src/scripts/guidance-golden.js";

const it = treeOf(doors);

test("the golden's old section holds what readsFor hands every leaf", () => {
  const said = oldSection(it);
  assert.ok(Object.keys(said).length, "readsFor answers a leaf of the tree");
  assert.ok(
    said["standard:design/draft"],
    "the standard route's draft stands among them",
  );
  let golden = {};
  try {
    golden = JSON.parse(String(it.disk.read(GOLDEN)));
  } catch {}
  assert.ok(
    golden[SECTION],
    `the golden file holds no section for ${SECTION}: run node test/level0/guidance-golden.js`,
  );
  assert.deepEqual(
    said,
    golden[SECTION],
    "readsFor answers apart from the golden file: run node test/level0/guidance-golden.js, and read the difference at the merge",
  );
});
