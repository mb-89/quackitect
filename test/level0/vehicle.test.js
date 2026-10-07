// The pure half of a vehicle in lib/vehicle.js: the register, the identity and
// the plugin closure. src/vehicle owns the roads that place a vehicle.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  entryOf,
  identityOf,
  importsOf,
  modulesOf,
  onlyVehicle,
  portOf,
  registers,
  resolves,
  rootKey,
  same,
} from "../../.claude/skills/level0/lib/vehicle.js";

// [[spec/tickets/box-keys-fold-drive-letters]]
test("the root key folds a drive letter and its slashes, and keeps a POSIX path's case", () => {
  assert.equal(rootKey("C:\\work\\tree\\"), "c:/work/tree");
  assert.equal(rootKey("/home/user/Tree/"), "/home/user/Tree");
});

// [[spec/design_output/vehicle#the-register-holds-the-port]]
test("a Windows root in either case is one vehicle, so the register keeps one entry and one port", () => {
  assert.equal(same("C:\\work\\tree", "c:/work/tree/"), true);
  assert.equal(
    same("/home/user/Tree", "/home/user/tree"),
    false,
    "a POSIX path keeps its case",
  );

  const upper = JSON.stringify([
    { id: "one", method_root: "C:\\work\\tree", port: 6510 },
  ]);
  const kept = registers(upper, { id: "two", method_root: "c:\\work\\tree" });
  assert.deepEqual(
    kept.map((one) => one.id),
    ["two"],
    "the lower-case spelling replaces the upper-case one",
  );
  assert.equal(portOf(JSON.parse(upper), "c:\\work\\tree"), 6510);
});

test("a vehicle keeps the identity it holds, and makes one where it holds none", () => {
  const held = identityOf('{"id":"abc123"}', "fresh", "now");
  assert.equal(held.record.id, "abc123");
  assert.equal(held.made, false);

  const fresh = identityOf("", "fresh", "now");
  assert.equal(fresh.record.id, "fresh");
  assert.equal(fresh.made, true);
});

test("the register turns an identity into a place", () => {
  const one = entryOf("abc123", "0.1.0", "/tools", "now");
  const list = registers("[]", one);
  assert.equal(resolves(list, "abc123"), "/tools");
  assert.equal(resolves(list, "nobody"), "");

  const again = registers(
    JSON.stringify(list),
    entryOf("abc123", "0.2.0", "/tools", "later"),
  );
  assert.equal(again.length, 1);
  assert.equal(again[0].version, "0.2.0");
});

test("one vehicle is no question", () => {
  assert.equal(onlyVehicle([entryOf("a", "1", "/tools", "now")]), "/tools");
  assert.equal(
    onlyVehicle([entryOf("a", "1", "/one", "now"), entryOf("b", "1", "/two", "now")]),
    "",
  );
  assert.equal(onlyVehicle([]), "");
});

// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
test("a module's imports read off its source: the relative ones, in any shape, and none from a package", () => {
  const source = [
    'import { a } from "../lib/apply.js";',
    "import {",
    "  b,",
    '} from "./level0.js";',
    "import c from './c.js';",
    'import "./side.js";',
    'export { d } from "../lib/d.js";',
    'import { join } from "node:path";',
    'import test from "node:test";',
    '// import { gone } from "./gone.js";',
    'const said = "from ./text.js";',
  ].join("\n");
  assert.deepEqual(importsOf(source), [
    "../lib/apply.js",
    "./level0.js",
    "./c.js",
    "./side.js",
    "../lib/d.js",
  ]);
  assert.deepEqual(importsOf(""), []);
});

test("the hooks manifest names the modules, each under the hooks folder", () => {
  assert.deepEqual(modulesOf('{"modules":["./pull-tool.js","./other.js"]}'), [
    "hooks/pull-tool.js",
    "hooks/other.js",
  ]);
  assert.deepEqual(modulesOf("not json"), []);
  assert.deepEqual(modulesOf("{}"), []);
});
