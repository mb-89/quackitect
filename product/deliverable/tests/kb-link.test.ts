// The live import (pillar 5): kb is linked from the sibling benjamin checkout
// via a file: dependency — the npm equivalent of go.work. This test is the
// workspace-link proof for B0.
import { test } from "node:test";
import assert from "node:assert/strict";
import { manifest } from "kb";

test("kb module is importable through the workspace link", () => {
  assert.equal(manifest.id, "kb");
});
