// The extensions the tracked settings offer. The cases that read the tracked
// settings drive the real disk, so they stand in test/contract.

import assert from "node:assert/strict";
import { test } from "node:test";
import { EXTENSIONS, namesTheBinaries } from "../../.claude/skills/level0/lib/servers.js";

// The design draws its diagrams in Mermaid, so the editor's preview takes the extension that renders them. [[spec/design_output/editor#what-the-tracked-settings-say]]
test("the extensions on offer carry the Mermaid preview beside Biome", () => {
  assert.deepEqual(EXTENSIONS, ["biomejs.biome", "bierner.markdown-mermaid"]);
});

// The Go rules draw every prose rule in the editor, so the settings name Biome alone. [[spec/tickets/vale-leaves-the-tree]]
test("the settings check names Biome's binary and config, and no prose linter", () => {
  assert.deepEqual(Object.keys(namesTheBinaries({})), ["biome", "biomeConfig"]);
});
