// The schema library stands split by topic, and the mint stands in a module of
// its own that imports the checker. So every caller of the mint names
// schema-mint.js, the checker names no mint, and each module stays under the
// file ceiling.
// [[spec/design_output/schema#the-reader-and-the-checker]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { underBuiltIns } from "../../.claude/skills/level0/lib/config.js";
import { TOOLS } from "../../src/bridge/tools.js";
import { disk } from "../../src/doors/disk.js";
import { handOut } from "../../src/scripts/pull-hand.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const LIB = join(root, ".claude", "skills", "level0", "lib");
const MINT = ["mintNote", "mintedNote", "mintSpec", "fieldsIn", "reRouted"];
const IMPORT = /import\s*\{([^}]*)\}\s*from\s*["']([^"']*)["']/g;
const FOLDERS = ["src", join(".claude", "skills", "level0", "lib"), "test"];

function jsUnder(folder, out = []) {
  for (const one of files.list(folder)) {
    const at = join(folder, one.name);
    if (one.kind === "dir") jsUnder(at, out);
    else if (one.name.endsWith(".js")) out.push(at);
  }
  return out;
}

const sources = FOLDERS.flatMap((one) => jsUnder(join(root, one)));

// [[spec/design_output/schema#the-reader-and-the-checker]]
test("every caller of the mint names schema-mint.js, and none names the checker for it", () => {
  const wrong = [];
  for (const file of sources) {
    for (const hit of String(files.read(file)).matchAll(IMPORT)) {
      const names = hit[1].split(",").map((one) => one.trim());
      const mints = names.filter((one) => MINT.includes(one));
      if (!mints.length) continue;
      if (!hit[2].endsWith("schema-mint.js"))
        wrong.push(`${file}: ${mints.join(", ")}`);
    }
  }
  assert.ok(sources.length > 0, "the walk reads the tree");
  assert.deepEqual(wrong, []);
});

test("the checker exports no mint, so the mint imports it with no cycle", () => {
  const text = String(files.read(join(LIB, "schema.js")));
  for (const name of MINT) assert.doesNotMatch(text, new RegExp(`\\b${name}\\b`));
  assert.doesNotMatch(text, /schema-mint\.js/);
});

test("each schema module stands under the file ceiling the config names", () => {
  const config = underBuiltIns(
    JSON.parse(files.read(join(root, "spec", "config", "level0.schema.json"))),
    JSON.parse(files.read(join(root, "spec", "config", "level0.json"))),
  );
  const ceiling = Number(config.code.fileLines);
  const over = files
    .list(LIB)
    .filter((one) => one.name.startsWith("schema") && one.name.endsWith(".js"))
    .map((one) => ({
      one: one.name,
      lines: String(files.read(join(LIB, one.name))).split("\n").length,
    }))
    .filter((said) => said.lines > ceiling);
  assert.deepEqual(over, []);
});

// The command line's mint stands in Go, which TestMintVerb in src/quack/verb_mint_test.go decides. [[spec/design_output/editor#one-command-opens-the-editor]]
test("the tools and the hand reach the mint through its own module", () => {
  assert.equal(typeof TOOLS.mcp__level0__mint_note, "function");
  assert.equal(typeof handOut, "function");
});
