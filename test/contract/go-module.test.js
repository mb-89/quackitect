// The tree's own Go layout, read off the real disk: one module, at the root.
// [[spec/rationales/go-stands-as-one-module]]
// [[spec/tickets/go-code-shares-one-module]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

// Every go.mod under a folder, a package folder of node_modules aside. [[spec/tickets/go-checks-need-go]]
function modsUnder(files, at) {
  const out = [];
  for (const one of files.list(at)) {
    if (one.kind !== "dir" || one.name === "node_modules") continue;
    const below = join(at, one.name);
    if (files.exists(join(below, "go.mod"))) out.push(below);
    out.push(...modsUnder(files, below));
  }
  return out;
}

// [[spec/tickets/go-checks-need-go]]
test("the tree holds one go.mod, at the root, read off the disk", () => {
  const files = disk();
  assert.ok(files.exists(join(ROOT, "go.mod")), "the root holds go.mod");
  assert.deepEqual(
    modsUnder(files, join(ROOT, "src")),
    [],
    "no folder under src holds one",
  );
});
