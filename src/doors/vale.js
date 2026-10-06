// The prose rules: the one place this tree runs them over a text, through the
// rules-over verb of the tree's own binary. A box with no binary reads no rule,
// and says so.
// [[spec/tickets/go-rules-replace-vale]] [[spec/tickets/vale-leaves-the-tree]]

import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { faultIn, fromJson, unreasoned } from "../../.claude/skills/level0/lib/vale.js";

const STDIN = "stdin.md";
const NONE = "no rules stand here";

export function vale(disk, proc, method, work = method) {
  const binary = `${method}/${BIN}`;
  const bin = disk.exists(binary) ? [binary, "verb", `${method}/src/scripts`] : [];
  // A verb reading tickets in a row waits on the run in place, so it reads here. [[spec/tickets/vale-leaves-the-tree]]
  const lintNow = (text, where) => {
    if (!bin.length) return { ran: false, why: NONE, found: [] };
    let said;
    try {
      said = proc.run([...bin, "rules-over", `--path=${where || STDIN}`], {
        stdin: text,
        cwd: work,
      });
    } catch (err) {
      return { ran: false, why: String(err?.message ?? err), found: [] };
    }
    if (said?.exitCode !== 0 && !said?.stdout) {
      const why = String(said?.stderr || "the rules answered nothing").trim();
      return { ran: false, why, found: [] };
    }
    const fault = faultIn(said.stdout);
    if (fault) return { ran: false, why: fault, found: [] };
    return { ran: true, found: [...fromJson(said.stdout), ...unreasoned(text)] };
  };
  return {
    stands: () => bin.length > 0,
    lint: async (text, where) => lintNow(text, where),
    lintNow,
  };
}
