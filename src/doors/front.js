// The front writer. The one place this tree reaches se-front, which writes
// every front of a note in one form. A box with no binary refuses the write.
// [[spec/tickets/go-writes-the-frontmatter]]

import { join } from "node:path";
import { BIN } from "../../.claude/skills/level0/lib/tools.js";

const NAME = "se-front";

export function front(disk, proc, method) {
  const at = () => {
    for (const one of [join(method, BIN, NAME), `${join(method, BIN, NAME)}.exe`]) {
      if (disk.exists(one)) return one;
    }
    return "";
  };

  const run = (argv, stdin = "") => {
    const binary = at();
    if (!binary) {
      throw new Error(
        `no ${NAME} stands on this box, so the write lands nowhere. Run ./RUNME.sh, which builds it.`,
      );
    }
    const ran = proc.run([binary, ...argv], { stdin });
    if (ran.exitCode !== 0) {
      throw new Error(`${NAME} ${argv[0]} answers ${ran.exitCode}: ${ran.stderr}`);
    }
    return ran.stdout;
  };

  return {
    set: (text, key, value) => run(["set", key, String(value)], String(text ?? "")),
    drop: (text, key) => run(["drop", key], String(text ?? "")),
    entry: (text, item) => run(["entry", JSON.stringify(item)], String(text ?? "")),
    after: (text, hash) => run(["after", String(hash)], String(text ?? "")),
    mint: (fields) => run(["mint", JSON.stringify(fields)]),
  };
}
