// The editor's Vale and the battery's Vale read one list. The editor hands Vale
// an absolute path, and the battery a relative one, so a section of the config
// matches both, and the panel shows what the check sees.
// [[spec/design_output/lsp#the-panel-reads-the-battery]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/scripts/tools.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = whereIs(files, root, "vale", readTools(files, root));
const ifVale = files.exists(bin) ? test : skip;
const RATIONALE = "spec/rationales/arguing.md";
const DESIGN = "spec/design_output/level0.md";

const linesOf = (argv) => {
  const ran = outside.run([bin, "--output=line", "--no-exit", ...argv], { cwd: root });
  return String(ran.stdout ?? "")
    .split("\n")
    .filter(Boolean).length;
};

test("every section of the config naming a folder opens on a double star", () => {
  const heads = files
    .read(join(root, ".vale.ini"))
    .split("\n")
    .filter((line) => line.startsWith("["))
    .map((line) => line.slice(1, line.indexOf("]")));
  const bare = heads.filter(
    (one) => one.includes("/") && !one.startsWith("**/") && !one.startsWith("{"),
  );
  assert.deepEqual(bare, [], "a section an absolute path misses");
});

ifVale("a rationale reads the same by its absolute path as by its relative one", () => {
  assert.equal(linesOf([join(root, RATIONALE)]), linesOf([RATIONALE]));
  assert.equal(linesOf([join(root, DESIGN)]), linesOf([DESIGN]));
});

ifVale("the config the workspace hands the Vale extension draws nothing", () => {
  const settings = JSON.parse(files.read(join(root, ".vscode/settings.json")));
  const config = settings["vale.valeCLI.config"];
  assert.ok(linesOf([DESIGN]) > 0, "the file carries a raw finding to hide");
  assert.equal(linesOf([`--config=${join(root, config)}`, join(root, DESIGN)]), 0);
});
