// The log tool over a fake box: a line lands under the kind the agent names,
// at its level, and a call missing its sentence writes nothing.
// [[spec/design_output/log#the-log-tool]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { LOG_CALL, SPECS, TOOLS } from "../../src/bridge/logline.js";

function box() {
  const rows = [];
  return { rows, box: { log: { say: async (...row) => rows.push(row) } } };
}

// [[spec/design_output/log#the-log-tool]]
test("the agent's line lands under its kind, at its level", async () => {
  const it = box();
  const said = await TOOLS[LOG_CALL](
    { kind: "status", said: "the check passes", level: "warn", text: "all of it" },
    it.box,
  );
  assert.match(said.result.result, /under status/);
  assert.deepEqual(it.rows, [
    ["warn", "status", "the check passes", { text: "all of it" }],
  ]);
  assert.equal(SPECS()[0].name, "log");
});

// [[spec/design_output/log#the-log-tool]]
test("a line with no sentence writes nothing, and an unknown level reads as info", async () => {
  const it = box();
  await TOOLS[LOG_CALL]({ kind: "status" }, it.box);
  assert.equal(it.rows.length, 0);
  await TOOLS[LOG_CALL]({ kind: "note", said: "one", level: "loud" }, it.box);
  assert.equal(it.rows[0][0], "info");
});
