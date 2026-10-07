// The tracked files the config and the session file stand in, read off this
// tree. Each tree rule runs in Go, and its cases stand in
// src/modules/check/tree_test.go and src/modules/check/folders_test.go.
// [[spec/design_output/tree#what-a-rule-answers]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  configOf,
  faultsIn,
  flatten,
  keyOf,
  SCHEMA,
  TRACKED,
  varOf,
} from "../../.claude/skills/level0/lib/config.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const EDITOR_SETTINGS = ".vscode/settings.json";

const read = (where) => JSON.parse(files.read(join(root, where)));
const text = (where) => files.read(join(root, where));
const settings = configOf({
  read: async (where) => files.read(join(root, where)),
  readEnv: async () => ({}),
});

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

// [[spec/design_output/config#the-schema-says-the-type]]
test("the schema passes the config this tree ships, and refuses a field of the wrong type", async () => {
  assert.deepEqual(await settings.faults(), []);

  const wrong = flatten(read(TRACKED));
  wrong.set("stop.mostInARow", "three");
  assert.deepEqual(faultsIn(read(SCHEMA), wrong), [
    "stop.mostInARow carries a string, and the schema says number",
  ]);
});

// [[spec/design_output/config#a-variable-names-a-key]]
test("every key this tree ships names one variable, and it names the key back", () => {
  const keys = [...flatten(read(TRACKED)).keys()];
  assert.ok(keys.length, "the tracked file carries a key");

  for (const key of keys) {
    assert.equal(keyOf(varOf(key)), key, `${varOf(key)} names ${key}`);
  }
});
