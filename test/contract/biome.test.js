// The biome door, against the real binary. One case drives the binary: the
// door formats a text, reads the rules, the config holds a test's literals,
// and the fake answers the same. Every other case takes the fake.
// [[spec/design_output/level0#the-formatter-applies-itself]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { fromJson } from "../../.claude/skills/level0/lib/code.js";
import { biome } from "../../src/doors/biome.js";
import { disk } from "../../src/doors/disk.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/engine/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = whereIs(files, root, "biome", readTools(files, root));
const ifBiome = files.exists(bin) ? test : skip;

// The magic number rule, over a folder holding the tree's own config, because the rule reads a path and the folder gives it two. [[spec/design_output/config#the-magic-numbers-take-names]]
function magicNumbersIn(run) {
  const folder = files.tempDir("magic-");
  const config = JSON.parse(files.read(join(root, "spec", "config", "biome.json")));
  files.write(
    join(folder, "biome.json"),
    JSON.stringify({ ...config, vcs: { enabled: false } }),
  );
  const code = "export function wait(x) {\n  return x * 4000;\n}\n";
  files.makeDir(join(folder, "src"));
  files.makeDir(join(folder, "test"));
  files.write(join(folder, "src", "probe.js"), code);
  files.write(join(folder, "test", "probe.test.js"), code);
  const ran = run(
    [
      bin,
      "lint",
      `--config-path=${folder}`,
      "--reporter=json",
      "--max-diagnostics=none",
      "src",
      "test",
    ],
    { cwd: folder },
  );
  files.remove(folder);
  return fromJson(ran.stdout, "")
    .filter((one) => one.rule === "style/noMagicNumbers")
    .map((one) => one.file.split("\\").join("/"));
}

// The real run teaches the fake, so the door answers the same through both. [[spec/design_output/doors#one-contract-test-per-door]]
ifBiome(
  "the door stands where the binary is, formats a text, reads the rules, and the fake answers the same",
  async () => {
    const taught = {};
    const recording = {
      run: (argv, init) => {
        const said = outside.run(argv, init);
        taught[argv.join(" ")] = said;
        return said;
      },
    };
    const door = biome(files, recording, root);
    assert.equal(door.stands(), true);

    const formatted = await door.format("const a=1\n", "probe.js");
    assert.equal(formatted.ran, true, formatted.why);
    assert.equal(formatted.text, "const a = 1;\n");

    const read = await door.lint("const a = 1;\n", "probe.js");
    assert.equal(read.ran, true, read.why);
    assert.ok(Array.isArray(read.found), "the rules answer rows");

    // [[spec/design_output/config#the-magic-numbers-take-names]]
    assert.deepEqual(magicNumbersIn(recording.run), ["src/probe.js"]);

    const twin = biome(files, fakeProc(taught), root);
    assert.deepEqual(await twin.format("const a=1\n", "probe.js"), formatted);
    assert.deepEqual(await twin.lint("const a = 1;\n", "probe.js"), read);
  },
);

test("a box with no binary formats nothing, and says so", async () => {
  const it = biome(fakeDisk(), fakeProc(), "/tree");
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
