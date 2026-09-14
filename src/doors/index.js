// The index. The one place this tree runs the index binary: a question by
// method and params, a find by words, and the standing that warms it. A box
// with no binary answers nothing, and says so.
// [[spec/design_output/index#the-door-answers-the-tools]]

import { join } from "node:path";
import { BIN, readsAnswer } from "../../.claude/skills/level0/lib/index.js";

export function index(disk, proc, root) {
  const at = () => {
    for (const one of [join(root, BIN), `${join(root, BIN)}.exe`]) {
      if (disk.exists(one)) return one;
    }
    return "";
  };

  const run = (argv, timeoutMs) => {
    const binary = at();
    if (!binary) return { exitCode: 127, stdout: "", stderr: `no ${BIN} stands on this box` };
    try {
      return proc.run([binary, ...argv], { cwd: root, timeoutMs });
    } catch (error) {
      return { exitCode: 1, stdout: "", stderr: String(error?.message ?? error) };
    }
  };

  return {
    stands: () => Boolean(at()),
    // A question the search tools ask: grep or glob, with the tool's params.
    ask: (method, params) => {
      const ran = run(["call", method, JSON.stringify(params)], 20000);
      return ran.exitCode === 0 ? readsAnswer(ran.stdout) : null;
    },
    // The lines carrying the words, ranked.
    find: (words) => {
      const ran = run(["find", words], 20000);
      return ran.exitCode === 0 ? readsAnswer(ran.stdout) : null;
    },
    // The standing of the index, which warms it: 0 where it stands.
    standing: () => run(["standing"], 60000),
  };
}
