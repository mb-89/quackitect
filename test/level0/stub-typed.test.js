// The stub's one hook types against the engine, as the vehicle's hooks do.
// [[spec/tickets/level0-hooks-move-to-typescript]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STUB_HOOKS = join(ROOT, "src", "stub", ".claude", "skills", "level0", "hooks");
const TSCONFIG = join(ROOT, ".claude", "skills", "level0", "tsconfig.json");
const files = disk();

// [[spec/tickets/level0-hooks-move-to-typescript]]
test("the stub's manifest names TypeScript modules alone, and no JavaScript stands beside them", () => {
  const { modules } = JSON.parse(files.read(join(STUB_HOOKS, "hooks.json")));
  assert.deepEqual(
    modules.filter((one) => !one.endsWith(".ts")),
    [],
    "every module the stub names is a .ts file",
  );
  assert.deepEqual(
    files
      .list(STUB_HOOKS)
      .map((one) => one.name)
      .filter((one) => one.endsWith(".js")),
    [],
    "no .js file stands under the stub's hooks",
  );
});

// [[spec/tickets/level0-hooks-move-to-typescript]]
test("the plugin's tsconfig reaches the stub's hooks, so tsc reads them against the engine", () => {
  const { include = [] } = JSON.parse(files.read(TSCONFIG));
  assert.ok(
    include.some((one) => one.replace(/\\/g, "/").endsWith("src/stub/.claude/skills/level0/hooks")),
    `the include list names the stub's hooks: ${JSON.stringify(include)}`,
  );
});
