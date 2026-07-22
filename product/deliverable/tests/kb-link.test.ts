// The live import (pillar 5): kb links from the sibling benjamin checkout.
// The dependency is optional by design — a missing sibling deactivates the
// module (boot reports it) instead of breaking the engine.
import { test } from "node:test";
import assert from "node:assert/strict";

test("kb module is importable through the workspace link (when present)", async (t) => {
  let kb: { manifest: { id: string } };
  try {
    kb = (await import("kb")) as { manifest: { id: string } };
  } catch {
    t.skip("kb import not installed — module deactivated, boot reports it");
    return;
  }
  assert.equal(kb.manifest.id, "kb");
});
