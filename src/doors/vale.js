// Vale. The one place this tree runs the voice rules over a text. A box with
// no Vale reads no rule, and says so. Two roots hand it the styles they hold
// together, assembled into the work root.
// [[spec/design_output/level0#the-write-door]]

import { lintText } from "../../.claude/skills/level0/lib/vale.js";
import { assemble } from "../scripts/styles.js";
import { readTools, whereIs } from "../scripts/tools.js";

export function vale(disk, proc, method, work = method) {
  const found = whereIs(disk, method, "vale", readTools(disk, method));
  const bin = disk.exists(found) ? found : "";
  const pair = { method, work, itself: method === work };
  // The assembly answers the config standing now, so an edit to a rule reads on this lint. [[spec/design_output/vehicle#the-styles-assemble-once]]
  const runs = async (text, where) => {
    const root = pair.itself ? method : work;
    const said = assemble(disk, pair);
    const run = async (argv, init) => proc.run(argv, { ...init, cwd: root });
    return lintText(text, where, { bin, run, cwd: root, config: said.config });
  };
  return {
    stands: () => Boolean(bin),
    lint: (text, where) => runs(text, where),
  };
}
