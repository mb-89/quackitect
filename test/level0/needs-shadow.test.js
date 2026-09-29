// The needs of a leaf in shadow: the registry's actions answer a need beside
// the table cli.js keeps, and a need the tables answer apart makes one row.
// [[spec/tickets/pull-verbs-become-actions]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  KEY,
  needsShadow,
  registryOf,
  SHADOW,
  SLICE,
} from "../../src/scripts/needs-shadow.js";
import { holdsVerb } from "../../src/scripts/pull-route.js";

// Fake doors: a slice mode, a binary standing, and a quack answering the action rows it holds. [[spec/tickets/pull-verbs-become-actions]]
function doorsOf({ mode = SHADOW, names = [] } = {}) {
  const ran = [];
  const said = [];
  return {
    ran,
    said,
    root: "/tree",
    binary: "/tree/quack",
    settings: { ask: async (key) => (key === KEY ? mode : "") },
    files: { exists: () => true },
    proc: {
      run(argv) {
        ran.push(argv);
        return {
          exitCode: 0,
          stdout: JSON.stringify(names.map((name) => ({ name, doc: "", fields: [] }))),
        };
      },
    },
    log: {
      say: async (level, kind, text, fields) =>
        said.push({ level, kind, text, fields }),
    },
  };
}

test("the registry's actions answer branch open for a need naming it", () => {
  const table = registryOf([{ name: "branch/open" }, { name: "ticket/pull" }]);
  assert.equal(holdsVerb("branch open", table), true);
  assert.equal(holdsVerb("work open", table), true);
  assert.equal(holdsVerb("ticket", table), true);
  assert.equal(holdsVerb("branch new", table), false);
});

test("a need the two tables answer apart writes one shadow row", async () => {
  const doors = doorsOf({ names: ["branch/sync", "branch/test"] });
  const found = await needsShadow(doors, ["branch sync", "branch open"]);
  assert.deepEqual(doors.ran, [["/tree/quack", "get", "index/actions"]]);
  assert.equal(found.length, 1);
  assert.equal(doors.said.length, 1);
  const row = doors.said[0];
  assert.equal(row.kind, SHADOW);
  assert.equal(row.fields.slice, SLICE);
  assert.equal(row.fields.need, "branch open");
});

test("a slice standing at old runs no quack and writes no row", async () => {
  const doors = doorsOf({ mode: "old", names: [] });
  assert.deepEqual(await needsShadow(doors, ["branch sync"]), []);
  assert.deepEqual(doors.ran, []);
  assert.deepEqual(doors.said, []);
});
