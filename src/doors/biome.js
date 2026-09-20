// Biome. The one place this tree formats and lints code. A box with no Biome
// formats nothing and reads no rule, and says so.
// [[spec/design_output/level0#the-formatter-applies-itself]]

import { formatText, lintText } from "../../.claude/skills/level0/lib/code.js";
import { readTools, whereIs } from "../engine/tools.js";

export function biome(disk, proc, root) {
  const found = whereIs(disk, root, "biome", readTools(disk, root));
  const bin = disk.exists(found) ? found : "";
  const run = async (argv, init) => proc.run(argv, { ...init, cwd: root });
  return {
    stands: () => Boolean(bin),
    format: (text, where) => formatText(text, where, { bin, run, cwd: root }),
    lint: (text, where) => lintText(text, where, { bin, run, cwd: root }),
  };
}
