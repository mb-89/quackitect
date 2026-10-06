// Prints the JavaScript side of every check twin as JSON, over this tree's
// tracked files. The Go golden test in src/quack runs it with node from the root.
// [[spec/tickets/check-names-meet-their-goldens]]

import { join } from "node:path";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { it as doors, root, settings } from "../../src/scripts/cli-doors.js";
import { twinsOf } from "../../src/scripts/check-twins.js";

const TESTDATA = join(root, "src", "modules", "check", "testdata");

if (process.argv[1]?.endsWith("check-twins.js")) {
  const all = doors.git
    .run(["ls-files"], true)
    .out.split(/\r?\n/)
    .map((one) => one.trim())
    .filter(Boolean);
  const words = Number(await settings.ask("names.words")) || 0;
  const tree = treeOf({
    root,
    disk: doors.disk,
    git: doors.git,
    words,
    node: "",
    box: {},
  });
  const said = twinsOf(tree, {
    all,
    words,
    ceilings: {
      file: Number(await settings.ask("code.fileLines")),
      function: Number(await settings.ask("code.functionLines")),
    },
    biome: String(doors.disk.read(join(TESTDATA, "biome.out"))),
  });
  process.stdout.write(`${JSON.stringify(said)}\n`);
}
