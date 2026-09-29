// The one Go module the battery runs, at the root of the tree, and the package
// folder a changed test names. [[spec/rationales/go-stands-as-one-module]]
// [[spec/tickets/go-code-shares-one-module]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
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
