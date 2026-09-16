// The biome door, against the real binary. It stands where the survey names
// the binary, formats a text and reads the rules over it, and reads as absent
// where it is not.
// [[spec/design_output/level0#the-formatter-applies-itself]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { biome } from "../../src/doors/biome.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/scripts/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const bin = whereIs(files, root, "biome", readTools(files, root));
const ifBiome = files.exists(bin) ? test : skip;

ifBiome(
  "the door stands where the binary is, formats a text and reads the rules",
  async () => {
    const it = biome(files, proc(), root);
    assert.equal(it.stands(), true);

    const formatted = await it.format("const a=1\n", "probe.js");
    assert.equal(formatted.ran, true, formatted.why);
    assert.equal(formatted.text, "const a = 1;\n");

    const read = await it.lint("const a = 1;\n", "probe.js");
    assert.equal(read.ran, true, read.why);
    assert.ok(Array.isArray(read.found), "the rules answer rows");
  },
);

test("a box with no binary formats nothing, and says so", async () => {
  const it = biome(files, proc(), files.tempDir("no-biome-"));
  assert.equal(it.stands(), false);
  const formatted = await it.format("const a=1\n", "probe.js");
  assert.deepEqual(formatted, {
    ran: false,
    why: "no biome stands here",
    text: "const a=1\n",
  });
  const read = await it.lint("const a=1\n", "probe.js");
  assert.deepEqual(read, { ran: false, why: "no biome stands here", found: [] });
});
