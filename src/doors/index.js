// The index. The one place this tree runs the index binary: a question by
// method and params, a find by words, and the warming that keeps it standing.
// The binary stands at the method root, and it runs over the work root. A
// dead index says why, and the door warms it again once a minute at most.
// [[spec/design_output/index#the-door-answers-the-tools]]

import { join } from "node:path";
import { BIN, readsAnswer } from "../../.claude/skills/level0/lib/index.js";

const REWARM = 60000;

export function index(disk, proc, clock, method, work = method) {
  let dead = "";
  let warmedAt = 0;

  const at = () => {
    for (const one of [join(method, BIN), `${join(method, BIN)}.exe`]) {
      if (disk.exists(one)) return one;
    }
    return "";
  };

  const run = (argv, timeoutMs) => {
    const binary = at();
    if (!binary) return { exitCode: 127, stdout: "", stderr: `no ${BIN} stands on this box` };
    try {
      return proc.run([binary, ...argv], { cwd: work, timeoutMs });
    } catch (error) {
      return { exitCode: 1, stdout: "", stderr: String(error?.message ?? error) };
    }
  };

  // A failed run marks the index dead with why.
  const failed = (ran, what) => {
    dead = ran.exitCode === 127 ? ran.stderr : `${BIN} ${what} answers ${ran.exitCode}`;
    return null;
  };

  return {
    stands: () => Boolean(at()),
    dead: () => dead,
    // A question the search tools ask: grep or glob, with the tool's params.
    ask: (method, params) => {
      const ran = run(["call", method, JSON.stringify(params)], 20000);
      return ran.exitCode === 0 ? readsAnswer(ran.stdout) : failed(ran, "call");
    },
    // The lines carrying the words, ranked.
    find: (words) => {
      const ran = run(["find", words], 20000);
      return ran.exitCode === 0 ? readsAnswer(ran.stdout) : failed(ran, "find");
    },
    // [[spec/design_output/index#a-dead-index-speaks]]
    warm: () => {
      const now = clock.now().getTime();
      if (now - warmedAt < REWARM) return { warmed: false, dead };
      warmedAt = now;
      const ran = run(["standing"], 60000);
      dead = ran.exitCode === 0 ? "" : ran.exitCode === 127 ? ran.stderr : `${BIN} standing answers ${ran.exitCode}`;
      return { warmed: true, dead };
    },
  };
}
