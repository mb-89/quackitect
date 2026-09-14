// Vale. The one place this tree runs the voice rules over a text: the binary
// the survey names, the tree's config, and the findings back as rows. A box
// with no Vale reads no rule, and says so.
// [[spec/design_output/level0#the-write-door]]

import { lintText } from "../../.claude/skills/level0/lib/vale.js";
import { readTools, whereIs } from "../scripts/tools.js";

export function vale(disk, proc, root) {
  const bin = whereIs(disk, root, "vale", readTools(disk, root));
  const run = async (argv, init) => proc.run(argv, { ...init, cwd: root });
  return {
    stands: () => Boolean(bin),
    // The findings over one text, as if it stood at where in the tree.
    lint: (text, where) => lintText(text, where, { bin, run, cwd: root }),
  };
}
