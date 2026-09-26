// The one Go module the battery runs, at the root of the tree, and the package
// folder a changed test names. [[spec/rationales/go-stands-as-one-module]]
// [[spec/tickets/go-code-shares-one-module]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { goModulesIn } from "../../src/scripts/cli-go.js";
import { goPackagesOf } from "../../src/scripts/work-test.js";

const ROOT = "/tree";
const MOD = "module quackitect\n";

function tree(paths) {
  return {
    disk: fakeDisk(Object.fromEntries(paths.map((one) => [`${ROOT}/${one}`, MOD]))),
    join,
    root: ROOT,
  };
}

// [[spec/tickets/go-code-shares-one-module]]
test("the battery lists the one module at the root", () => {
  const it = tree(["go.mod", "src/index/index.go", "src/engine/swap/swap.go"]);
  assert.deepEqual(goModulesIn(it), ["."]);
});

// [[spec/tickets/go-code-shares-one-module]]
test("a module a folder under src still holds stands beside the root one", () => {
  const it = tree(["go.mod", "src/engine/swap/go.mod"]);
  assert.deepEqual(goModulesIn(it), [".", "src/engine/swap"]);
});

// [[spec/tickets/go-code-shares-one-module]]
test("a folder holding no module reaches the battery nowhere", () => {
  const it = tree(["src/index/index.go"]);
  it.disk.makeDir(`${ROOT}/src/bridge`);
  assert.deepEqual(goModulesIn(it), []);
});

// [[spec/tickets/go-code-shares-one-module]]
test("a changed test names the package folder holding it", () => {
  const it = tree(["go.mod"]);
  assert.deepEqual(goPackagesOf(["src/engine/swap/swap_test.go"], it), [
    "src/engine/swap",
  ]);
  assert.deepEqual(goPackagesOf(["src/tui/log/detail_test.go"], it), ["src/tui/log"]);
  assert.deepEqual(goPackagesOf(["src/index/index_test.go"], it), ["src/index"]);
});

// [[spec/tickets/go-code-shares-one-module]]
test("a changed test outside src names no package", () => {
  const it = tree(["go.mod"]);
  assert.deepEqual(goPackagesOf(["test/level0/one.test.js"], it), []);
  assert.deepEqual(goPackagesOf([], it), []);
});
