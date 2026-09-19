// The Go modules the battery runs: a module straight under src, and one a
// folder below it, because the engine folder takes swap.
// [[spec/tickets/an-engine-takes-bridge-work]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { goModulesIn } from "../../src/scripts/cli-go.js";
import { goModulesOf } from "../../src/scripts/work-test.js";

const ROOT = "/tree";
const MOD = "module quackitect/one\n";

function tree(paths) {
  return {
    disk: fakeDisk(Object.fromEntries(paths.map((one) => [`${ROOT}/${one}`, MOD]))),
    join,
    root: ROOT,
  };
}

// [[spec/tickets/an-engine-takes-bridge-work]]
test("the battery lists a module straight under src", () => {
  const it = tree(["src/index/go.mod", "src/lsp/go.mod"]);
  assert.deepEqual(goModulesIn(it), ["src/index", "src/lsp"]);
});

// [[spec/tickets/an-engine-takes-bridge-work]]
test("the battery lists a module a folder below src", () => {
  const it = tree(["src/index/go.mod", "src/engine/swap/go.mod"]);
  assert.deepEqual(
    goModulesIn(it),
    ["src/engine/swap", "src/index"],
    "a module the engine folder holds runs in the battery too",
  );
});

// [[spec/tickets/an-engine-takes-bridge-work]]
test("a folder holding no module reaches the battery nowhere", () => {
  const it = tree(["src/index/go.mod"]);
  it.disk.makeDir(`${ROOT}/src/bridge`);
  assert.deepEqual(goModulesIn(it), ["src/index"]);
});

// [[spec/tickets/an-engine-takes-bridge-work]]
test("a changed test names the folder holding its own module", () => {
  const it = tree(["src/index/go.mod", "src/engine/swap/go.mod"]);
  assert.deepEqual(
    goModulesOf(["src/engine/swap/swap_test.go"], it),
    ["src/engine/swap"],
    "the module stands where go.mod stands",
  );
  assert.deepEqual(goModulesOf(["src/index/index_test.go"], it), ["src/index"]);
});

// [[spec/tickets/an-engine-takes-bridge-work]]
test("a changed test outside every module names none", () => {
  const it = tree(["src/index/go.mod"]);
  assert.deepEqual(goModulesOf(["test/level0/one.test.js"], it), []);
  assert.deepEqual(goModulesOf([], it), []);
});
