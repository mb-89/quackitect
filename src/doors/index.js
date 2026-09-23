// The index. The one place this tree runs the index binary, which stands at
// the method root and runs over the work root. A dead index says why, and the
// door warms it again once a minute at most.
// [[spec/design_output/index#the-door-answers-the-tools]]

import { join } from "node:path";
import { BIN, readsAnswer } from "../../.claude/skills/level0/lib/index.js";

const REWARM = 60000;
const ASKING = 20000;
const WARMING = 60000;
const NO_BINARY = 127;
// What se-index prints where the door stands and answers the question with its own fault: a pattern Go reads as no regexp, a search with no pattern, a method it holds nowhere. [[spec/design_output/index#a-dead-index-speaks]]
const QUERY_FAULT = /error parsing regexp|a search takes a pattern|no method called|the call reads as no JSON/i;

export function index(disk, proc, clock, method, work = method) {
  let dead = "";
  let fault = "";
  let warmedAt = 0;

  const at = () => {
    for (const one of [join(method, BIN), `${join(method, BIN)}.exe`]) {
      if (disk.exists(one)) return one;
    }
    return "";
  };

  const run = (argv, timeoutMs) => {
    const binary = at();
    if (!binary)
      return {
        exitCode: NO_BINARY,
        stdout: "",
        stderr: `no ${BIN} stands on this box`,
      };
    try {
      return proc.run([binary, ...argv], { cwd: work, timeoutMs });
    } catch (error) {
      return { exitCode: 1, stdout: "", stderr: String(error?.message ?? error) };
    }
  };

  const failed = (ran, what) => {
    dead =
      ran.exitCode === NO_BINARY
        ? ran.stderr
        : `${BIN} ${what} answers ${ran.exitCode}`;
    return null;
  };

  return {
    stands: () => Boolean(at()),
    dead: () => dead,
    // The fault of the last question, where the index stood and refused the question alone. [[spec/design_output/index#a-dead-index-speaks]]
    fault: () => fault,
    ask: (method, params) => {
      const ran = run(["call", method, JSON.stringify(params)], ASKING);
      fault = "";
      if (ran.exitCode === 0) return readsAnswer(ran.stdout);
      if (!QUERY_FAULT.test(String(ran.stderr ?? ""))) return failed(ran, "call");
      fault = String(ran.stderr).trim();
      return null;
    },
    find: (words) => {
      const ran = run(["find", words], ASKING);
      return ran.exitCode === 0 ? readsAnswer(ran.stdout) : failed(ran, "find");
    },
    // [[spec/design_output/index#a-dead-index-speaks]]
    warm: () => {
      const now = clock.now().getTime();
      if (now - warmedAt < REWARM) return { warmed: false, dead };
      warmedAt = now;
      const first = run(["standing"], WARMING);
      const ran =
        first.exitCode === 0 || first.exitCode === NO_BINARY
          ? first
          : run(["standing"], WARMING);
      dead =
        ran.exitCode === 0
          ? ""
          : ran.exitCode === NO_BINARY
            ? ran.stderr
            : `${BIN} standing answers ${ran.exitCode}`;
      return { warmed: true, dead };
    },
  };
}
