// The bridge server and the Copilot runtime leave the tree, so no second cage
// drifts from the first.
// [[spec/tickets/the-bridge-server-leaves]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { proc } from "../../src/doors/proc.js";

const ROOT = join(import.meta.dirname, "..", "..");
const GONE = ["src/bridge/server.js", ".claude/skills/level0/lib/copilot-runtime.js"];

// [[spec/tickets/the-bridge-server-leaves]]
test("git ls-files names neither the bridge server nor the copilot runtime", () => {
  const said = proc().run(["git", "ls-files", ...GONE], {
    cwd: ROOT,
    timeoutMs: 10_000,
  });
  assert.equal(said.stdout.trim(), "", "the tree still holds them");
});
