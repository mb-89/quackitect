// The declaration on disk. The tracked schema names the buttons the sidebar
// draws, so a case here reads the real file and holds the two that make a
// vehicle and a stub to the verbs the shell runs.
// [[spec/design_output/extension#two-buttons-make-both]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { entriesIn } from "../../src/extension/lib/widgets.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const SCHEMA = "spec/config/level0.schema.json";

const declaration = () => JSON.parse(disk().read(join(root, SCHEMA)));
const entry = (key) => entriesIn(declaration()).find((one) => one.key === key);

test("the declaration names a vehicle button and a stub button, each asking for a folder", () => {
  for (const [key, verb] of [
    ["engine.vehicle", "vehicle"],
    ["engine.stub", "stub"],
  ]) {
    const one = entry(key);
    assert.ok(one, `${key} stands in the declaration`);
    assert.equal(one.widget, "action");
    assert.equal(one.asks, "folder");
    assert.equal(one.runs, `./RUNME.sh ${verb} into <folder>`);
    assert.ok(one.icon, `${key} wears a mark the owner picks`);
    assert.ok(one.help, `${key} says what it does on hover`);
  }
});

test("the two buttons stand in one section and one group", () => {
  const vehicle = entry("engine.vehicle");
  const stub = entry("engine.stub");
  assert.equal(vehicle?.section, stub?.section);
  assert.equal(vehicle?.group, stub?.group);
});
