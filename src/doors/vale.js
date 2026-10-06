// The prose rules: the one place this tree runs them over a text, through the
// rules-over verb of the tree's own binary. A box with no binary reads no rule,
// and says so.
// [[spec/tickets/go-rules-replace-vale]]

import { lintText } from "../../.claude/skills/level0/lib/vale.js";
import { BIN } from "../../.claude/skills/level0/lib/index.js";

export function vale(disk, proc, method, work = method) {
  const binary = `${method}/${BIN}`;
  const bin = disk.exists(binary) ? [binary, "verb", `${method}/src/scripts`] : [];
  const run = async (argv, init) => proc.run(argv, { ...init, cwd: work });
  return {
    stands: () => bin.length > 0,
    lint: (text, where) => lintText(text, where, { bin, run, cwd: work }),
  };
}
