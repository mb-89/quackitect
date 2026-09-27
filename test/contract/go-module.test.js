// The tree's own Go layout, read off the real disk: one module, at the root.
// [[spec/rationales/go-stands-as-one-module]]
// [[spec/tickets/go-code-shares-one-module]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { goModulesIn } from "../../src/scripts/cli-go.js";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

// [[spec/tickets/go-code-shares-one-module]]
test("the tree holds one go.mod, at the root", () => {
  assert.deepEqual(goModulesIn({ disk: disk(), join, root: ROOT }), ["."]);
});
