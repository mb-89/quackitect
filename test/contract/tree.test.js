// The tracked files the config and the session file stand in, read off this
// tree. Each tree rule runs in Go, and its cases stand in
// src/modules/check/tree_test.go and src/modules/check/folders_test.go.
// [[spec/design_output/tree#what-a-rule-answers]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const EDITOR_SETTINGS = ".vscode/settings.json";
// TrackedConfig and SchemaConfig in src/q/layers.go own the two names. [[spec/design_output/config#the-layers]]
const TRACKED = "spec/config/level0.json";
const SCHEMA = "spec/config/level0.schema.json";

const read = (where) => JSON.parse(files.read(join(root, where)));
const text = (where) => files.read(join(root, where));

// The count chain left the tree: no verb, viewer or badge line spells the count flag, so the badge asks the index. [[spec/tickets/count-grep-misses-the-scripts]]
test("no count chain stands in the verb, the viewer or the badge line", () => {
  for (const path of [
    join(root, "src", "quack", "tui_verb.go"),
    join(root, "src", "tui", "main.go"),
    join(root, SCHEMA),
  ]) {
    assert.doesNotMatch(files.read(path), /--count\b/, path);
  }
});

// The hooks door writes the session file, and the plugin's library spells it once beside it. [[spec/design_input/the-runtime-files-stand-apart]]
test("every forced copy of the session file says what the hand module says", () => {
  const SESSION = /sessionFile = "([^"]+)"/.exec(text("src/modules/hooks/marks.go"))?.[1];
  assert.ok(SESSION, "the hooks door spells the session file");
  assert.match(text(".claude/skills/level0/lib/pull.js"), new RegExp(`"${SESSION}"`));
  assert.doesNotMatch(
    text(".claude/skills/level0/hooks/pull-tool.js"),
    new RegExp(`"${SESSION}"`),
    "the hook leaves the session file to the door",
  );
});

// [[spec/design_output/config#the-editor-draws-the-schema]]
test("the editor draws the schema over the config, with no extension", () => {
  const drawn = read(EDITOR_SETTINGS)["json.schemas"] ?? [];
  const one = drawn.find((said) => said.fileMatch?.includes(`/${TRACKED}`));

  assert.ok(one, `a schema stands over ${TRACKED}`);
  assert.equal(one.url, `./${SCHEMA}`);
  assert.equal(files.exists(join(root, SCHEMA)), true, "the schema stands there");
});

