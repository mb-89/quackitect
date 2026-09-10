// The grid check. Each case hands it a declaration that breaks the rule and
// asserts it names the widget, because a check nobody can fail holds nothing.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { faultsIn, lineOf } from "../../src/extension/lib/grid.js";

const at = (row, column, more = {}) => ({
  type: "string",
  widget: "toggle",
  group: "agent control",
  row,
  column,
  ...more,
});

const schemaOf = (leaves) => ({
  type: "object",
  properties: { stop: { type: "object", properties: leaves } },
});

test("a declaration placing every widget in its own cell passes", () => {
  const said = schemaOf({ one: at(0, 0), two: at(0, 1), three: at(1, 0) });
  assert.deepEqual(faultsIn(said), []);
});

test("two widgets covering one cell are refused, and the second is named", () => {
  const found = faultsIn(schemaOf({ one: at(0, 1), two: at(0, 1) }));
  assert.equal(found.length, 1);
  assert.equal(found[0].key, "stop.two");
  assert.match(found[0].why, /stop\.two covers the cell stop\.one covers/);
});

test("a span reaching over a neighbour is refused", () => {
  const found = faultsIn(schemaOf({ one: at(0, 0, { colSpan: 3 }), two: at(0, 2) }));
  assert.deepEqual(
    found.map((each) => each.key),
    ["stop.two"],
  );
});

test("a widget past the fifth column is refused, and the width is named", () => {
  const found = faultsIn(schemaOf({ one: at(0, 5) }));
  assert.equal(found.length, 1);
  assert.match(found[0].why, /reaches column 6, and the grid is 5 wide/);
});

test("a span running off the edge is refused", () => {
  const found = faultsIn(schemaOf({ one: at(0, 3, { colSpan: 3 }) }));
  assert.equal(found.length, 1);
  assert.match(found[0].why, /reaches column 6/);
});

test("two groups each hold their own grid, so one cell in both is no fault", () => {
  const said = schemaOf({
    one: at(0, 0),
    two: at(0, 0, { group: "another" }),
  });
  assert.deepEqual(faultsIn(said), []);
});

// [[spec/design_output/extension#the-grid-is-checked]]
test("the line of a key is the line its entry opens on", () => {
  const text = [
    "{",
    '  "properties": {',
    '    "stop": {',
    '      "properties": {',
    '        "enabled": { "type": "boolean" },',
    '        "hold": {',
    '          "row": 0',
    "        }",
    "      }",
    "    },",
    '    "log": {',
    '      "properties": {',
    '        "open": {',
    '          "row": 1',
    "        }",
    "      }",
    "    }",
    "  }",
    "}",
  ].join("\n");
  assert.equal(lineOf(text, "stop.hold"), 6);
  assert.equal(lineOf(text, "log.open"), 13);
  assert.equal(lineOf(text, "stop.nothing"), 1);
});
