// The index door, against the real binary. It stands where the tree is built,
// answers a glob out of the rows, and reads as absent where it is not.
// [[spec/design_output/index#the-door-answers-the-tools]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { clock } from "../../src/doors/clock.js";
import { disk } from "../../src/doors/disk.js";
import { index } from "../../src/doors/index.js";
import { proc } from "../../src/doors/proc.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const built = files.exists(join(root, BIN)) || files.exists(join(root, `${BIN}.exe`));
const ifBuilt = built ? test : skip;

ifBuilt(
  "the door stands where the binary is built, and a glob comes out of the rows",
  () => {
    const it = index(files, proc(), clock(), root, root);
    assert.equal(it.stands(), true);
    assert.deepEqual(it.warm(), { warmed: true, dead: "" });
    const answer = it.ask("glob", { pattern: "src/doors/*.js", path: "" });
    assert.ok(Array.isArray(answer?.paths), "a glob answers paths");
    assert.ok(answer.paths.includes("src/doors/index.js"), "the door finds itself");
  },
);

test("a box with no binary answers nothing, and says so", () => {
  const it = index(
    files,
    proc(),
    clock(),
    files.tempDir("no-index-"),
    files.tempDir("no-work-"),
  );
  assert.equal(it.stands(), false);
  assert.equal(it.ask("glob", { pattern: "*" }), null);
  assert.equal(it.find("anything"), null);
  assert.match(it.warm().dead, /^no .*se-index stands on this box$/);
  assert.match(it.dead(), /stands on this box$/);
});
