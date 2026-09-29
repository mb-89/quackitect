// The comparison twins of the read-only topics leave the tree, and nothing
// imports one. The five keys take new alone.
// [[spec/tickets/the-js-twins-leave]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const GONE = [
  "src/scripts/config-shadow",
  "src/scripts/log-shadow",
  "src/scripts/guidance-shadow",
  "src/bridge/prose-shadow",
];
const KEYS = ["config", "log", "guidance", "check", "prose"];
const FOLDERS = ["src", join(".claude", "skills", "level0"), "test"];
const IMPORT = /from\s+["']([^"']*)["']|import\(["']([^"']*)["']\)/g;

function jsUnder(folder, out = []) {
  for (const one of files.list(folder)) {
    const at = join(folder, one.name);
    if (one.kind === "dir") jsUnder(at, out);
    else if (one.name.endsWith(".js")) out.push(at);
  }
  return out;
}

test("no removed twin file stands", () => {
  for (const one of GONE) {
    assert.equal(files.exists(join(root, `${one}.js`)), false, one);
  }
});

test("no file under src, test or the plugin imports a removed twin", () => {
  const names = GONE.map((one) => one.split("/").pop());
  const wrong = [];
  for (const file of FOLDERS.flatMap((one) => jsUnder(join(root, one)))) {
    for (const hit of String(files.read(file)).matchAll(IMPORT)) {
      const said = String(hit[1] ?? hit[2]);
      if (names.some((one) => said.endsWith(`/${one}.js`)))
        wrong.push(`${file}: ${said}`);
    }
  }
  assert.deepEqual(wrong, []);
});

test("the five keys take new alone in the schema enum", () => {
  const schema = JSON.parse(files.read(join(root, "spec/config/level0.schema.json")));
  const held = schema.properties.migration.properties;
  for (const key of KEYS) assert.deepEqual(held[key].enum, ["new"], key);
});
