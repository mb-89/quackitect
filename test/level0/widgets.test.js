// The declaration read as widgets. A schema in memory stands for the tracked
// one, so a case here says what a field does and no file has to hold it.
// [[spec/guidance/code/testing]]

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
          enum: ["off", "finish", "stop"],
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
          runs: "./RUNME.sh tui",
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

test("every leaf of the schema stands as one entry with its enum's options, and the comment as none", () => {
  const entries = entriesIn(SCHEMA);
  assert.deepEqual(
    entries.map((one) => one.key),
    ["stop.mostInARow", "stop.hold", "log.open", "engine.binding"],
  );
  const { options, section, leaf } = entries[1];
  assert.deepEqual(
    [options, section, leaf],
    [["off", "finish", "stop"], "stop", "hold"],
  );
});

// [[spec/design_output/extension#one-declaration-draws-it]]
test("a widget naming no group draws no control, and one naming a group draws", () => {
  const drawn = drawnIn(SCHEMA).map((one) => one.key);
  assert.deepEqual(drawn, ["stop.hold", "log.open"]);
  assert.ok(!drawn.includes("engine.binding"), "the engine waits for level one");
});

test("a group holds its widgets in rows, each row in column order", () => {
  const groups = groupsIn(SCHEMA, valuesOf({ stop: { hold: "off" } }, {}));
  assert.equal(groups.length, 1);
  assert.equal(groups[0].name, "agent control");
  assert.equal(groups[0].wide, 5);
  assert.deepEqual(
    groups[0].rows[0].cells.map((one) => one.key),
    ["log.open", "stop.hold"],
  );
});

test("a widget carries the value the files answer, the layer answering it, and its rest", () => {
  const values = valuesOf({ stop: { hold: "off" } }, { stop: { hold: "stop" } });
  const cell = groupsIn(SCHEMA, values)[0].rows[0].cells[1];
  assert.deepEqual([cell.value, cell.layer, cell.rest], ["stop", LOCAL, "off"]);
});

// [[spec/design_output/extension#the-bottom-section]]
test("the tree names one node per file, and a row per key under it", () => {
  const tree = treeIn(SCHEMA, [
    {
      path: TRACKED,
      said: { comment: "words", stop: { mostInARow: 3, hold: "off" } },
    },
    { path: LOCAL, said: { stop: { hold: "stop" } } },
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
  const { unit, help, type } = tree[0].sections[0].rows[0];
  assert.deepEqual([unit, help, type], ["turns", "How many turns.", "number"]);
});

// [[spec/tickets/the-config-schema-gets-generated]]
test("valuesOf lays the built-ins under the tracked file, and the tracked under the local", () => {
  const schema = structuredClone(SCHEMA);
  schema.properties.stop.properties.hold.default = "off";
  schema.properties.stop.properties.mostInARow.default = 3;
  const values = valuesOf(
    { stop: { mostInARow: 5 } },
    { log: { level: "warn" } },
    schema,
  );
  assert.deepEqual(values.get("stop.hold"), { value: "off", layer: "built-in" });
  assert.deepEqual(values.get("stop.mostInARow"), { value: 5, layer: TRACKED });
  assert.deepEqual(values.get("log.level"), { value: "warn", layer: LOCAL });
  const bare = valuesOf({ stop: { mostInARow: 5 } }, {});
  assert.deepEqual(
    [...bare.keys()],
    ["stop.mostInARow"],
    "no schema reads the files alone",
  );
});
