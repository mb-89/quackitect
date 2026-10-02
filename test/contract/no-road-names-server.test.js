// No start road names the bridge server: the hooks, the scripts, the stub, the
// extension, the config and the editor's launch start the index alone.
// [[spec/tickets/start-road-starts-the-index]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { proc } from "../../src/doors/proc.js";

const ROOT = join(import.meta.dirname, "..", "..");
const ROADS = [
  ".claude",
  "src/scripts",
  "src/stub",
  "src/extension",
  "spec/config",
  ".vscode",
];

test("no start road names src/bridge/server.js", () => {
  const said = proc().run(
    ["git", "grep", "-l", "src/bridge/server.js", "--", ...ROADS],
    {
      cwd: ROOT,
      timeoutMs: 10_000,
    },
  );
  assert.equal(said.stdout.trim(), "", "every road named here still names the server");
});
