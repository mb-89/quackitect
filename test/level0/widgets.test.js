// The declaration read as widgets. A schema in memory stands for the tracked
// one, so a case here says what a field does and no file has to hold it.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  drawnIn,
  entriesIn,
  groupsIn,
  LOCAL,
  TRACKED,
  treeIn,
  valuesOf,
} from "../../src/extension/lib/widgets.js";

const SCHEMA = {
  type: "object",
  properties: {
    comment: { type: "string" },
    stop: {
      type: "object",
      properties: {
        comment: { type: "string" },
        mostInARow: { type: "number", unit: "turns", help: "How many turns." },
        hold: {
          type: "string",
          enum: ["running", "finishing", "stopped"],
          help: "What the session does.",
          widget: "toggle",
          gesture: 5,
          at: "U+270B",
          group: "agent control",
          row: 0,
          column: 1,
        },
      },
    },
    log: {
      type: "object",
      properties: {
        open: {
          widget: "action",
          runs: "./RUNME.sh log",
          group: "agent control",
          row: 0,
          column: 0,
        },
      },
    },
    engine: {
      type: "object",
      properties: {
        binding: { type: "string", enum: ["queue", "god"], widget: "toggle" },
      },
    },
  },
};

test("every leaf of the schema stands as one entry, and the comment stands as none", () => {
  const keys = entriesIn(SCHEMA).map((one) => one.key);
  assert.deepEqual(keys, [
    "stop.mostInARow",
    "stop.hold",
    "log.open",
    "engine.binding",
  ]);
});

test("an entry carries the options the schema names as an enum", () => {
  const one = entriesIn(SCHEMA).find((each) => each.key === "stop.hold");
  assert.deepEqual(one.options, ["running", "finishing", "stopped"]);
  assert.equal(one.section, "stop");
  assert.equal(one.leaf, "hold");
});

// [[spec/design_output/extension#one-declaration-draws-it]]
test("a widget naming no group draws no control, and one naming a group draws", () => {
  const drawn = drawnIn(SCHEMA).map((one) => one.key);
  assert.deepEqual(drawn, ["stop.hold", "log.open"]);
  assert.ok(!drawn.includes("engine.binding"), "the engine waits for level one");
});

test("a group holds its widgets in rows, each row in column order", () => {
  const groups = groupsIn(SCHEMA, valuesOf({ stop: { hold: "running" } }, {}));
  assert.equal(groups.length, 1);
  assert.equal(groups[0].name, "agent control");
  assert.equal(groups[0].wide, 5);
  assert.deepEqual(
    groups[0].rows[0].cells.map((one) => one.key),
    ["log.open", "stop.hold"],
  );
});

test("a widget carries the value the files answer, and the layer answering it", () => {
  const values = valuesOf({ stop: { hold: "running" } }, { stop: { hold: "stopped" } });
  const cell = groupsIn(SCHEMA, values)[0].rows[0].cells[1];
  assert.equal(cell.value, "stopped");
  assert.equal(cell.layer, LOCAL);
  assert.equal(cell.rest, "running");
});

test("the tracked file answers a key the local file leaves alone", () => {
  const values = valuesOf({ stop: { hold: "running" } }, { log: { level: "warn" } });
  assert.deepEqual(values.get("stop.hold"), { value: "running", layer: TRACKED });
  assert.deepEqual(values.get("log.level"), { value: "warn", layer: LOCAL });
});

// [[spec/design_output/extension#the-bottom-section]]
test("the tree names one node per file, and a row per key under it", () => {
  const tree = treeIn(SCHEMA, [
    {
      path: TRACKED,
      said: { comment: "words", stop: { mostInARow: 3, hold: "running" } },
    },
    { path: LOCAL, said: { stop: { hold: "stopped" } } },
  ]);
  assert.deepEqual(
    tree.map((one) => one.file),
    [TRACKED, LOCAL],
  );
  assert.equal(tree[0].sections[0].name, "stop");
  assert.deepEqual(
    tree[0].sections[0].rows.map((one) => one.key),
    ["stop.mostInARow", "stop.hold"],
  );
});

test("a row takes the unit and the help the schema gives its key", () => {
  const tree = treeIn(SCHEMA, [{ path: TRACKED, said: { stop: { mostInARow: 3 } } }]);
  const row = tree[0].sections[0].rows[0];
  assert.equal(row.unit, "turns");
  assert.equal(row.help, "How many turns.");
  assert.equal(row.type, "number");
});
