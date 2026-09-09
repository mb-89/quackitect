// Candidate files reach real Biome diagnostics and leave no temporary tree.
// [[spec/design_output/copilot#candidate-reports]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { biomeBin } from "../../.claude/skills/level0/lib/code.js";
import { candidateRun } from "../../.claude/skills/level0/lib/candidate-check.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const bin = join(root, biomeBin(process.platform));

test("real Biome emits a structured candidate report", {
  skip: !files.exists(bin),
}, () => {
  let folder;
  const it = {
    root,
    join,
    disk: {
      ...files,
      tempDir(prefix) {
        folder = files.tempDir(prefix);
        return folder;
      },
    },
  };
  const run = candidateRun(it, proc().run);
  const result = run([bin, "lint", "--stdin-file-path=src/example.js"], {
    stdin: "debugger;\n",
  });
  assert.equal(result.exitCode, 1);
  assert.ok(
    JSON.parse(result.stdout).diagnostics.some(
      (one) => one.category === "lint/suspicious/noDebugger",
    ),
  );
  assert.equal(files.exists(folder), false);
});
