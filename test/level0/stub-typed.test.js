// The stub's one hook types against the engine, as the vehicle's hooks do.
// [[spec/tickets/level0-hooks-move-to-typescript]]

import assert from "node:assert/strict";
import { test } from "node:test";
import tsconfig from "../../.claude/skills/level0/tsconfig.json" with { type: "json" };
import manifest from "../../src/stub/.claude/skills/level0/hooks/hooks.json" with { type: "json" };

const STUB_HOOKS = "../../src/stub/.claude/skills/level0/hooks";

// [[spec/tickets/level0-hooks-move-to-typescript]]
test("the stub's manifest names TypeScript modules alone, and its JavaScript module stands nowhere", async () => {
  assert.deepEqual(
    manifest.modules.filter((one) => !one.endsWith(".ts")),
    [],
    "every module the stub names is a .ts file",
  );
  await assert.rejects(
    import(`${STUB_HOOKS}/bridgehead.js`),
    "no bridgehead.js stands under the stub's hooks",
  );
});

// [[spec/tickets/level0-hooks-move-to-typescript]]
test("the plugin's tsconfig reaches the stub's hooks, so tsc reads them against the engine", () => {
  const include = tsconfig.include ?? [];
  assert.ok(
    include.some((one) => one.endsWith("src/stub/.claude/skills/level0/hooks")),
    `the include list names the stub's hooks: ${JSON.stringify(include)}`,
  );
});
