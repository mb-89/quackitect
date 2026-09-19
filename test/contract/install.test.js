// The install script, read as it stands. A binary this tree builds goes stale
// where its own source moves ahead, so the script asks find for a newer file
// before it calls the binary ready.
// [[spec/design_output/index#the-compiler-it-needs]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { rebuilt } from "../../.claude/skills/level0/lib/tools.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

test("every binary this tree builds rebuilds when its source moves ahead", () => {
  const said = disk().read(join(root, "src", "scripts", "install.sh"));
  for (const one of ["lsp", "index"]) {
    assert.ok(rebuilt(said).includes(one), `${one} rebuilds off its own age alone`);
  }
});
