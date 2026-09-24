// A process door answering from a table. A command nobody taught it is a
// failure the test sees, so a silent wrong answer stays impossible.
// [[spec/design_output/doors#a-fake-behaves]]

import { behaves } from "./behaves.js";

export function fakeProc(answers = {}) {
  const ran = [];
  const table = new Map(
    Object.entries(answers).map(([argv, said]) => [slashed(argv), said]),
  );
  const lives = new Set();

  return behaves(
    {
      ran,
      lives,
      // A process stands while its number stands in the set a test fills. [[spec/design_output/level0#the-wait-returns-on-signals]]
      alive: (pid) => lives.has(Number(pid)),
      teach: (argv, said) => void table.set(key(argv), said),
      // The fake answers a start the way it answers a run, on the next tick. [[spec/design_output/lsp]]
      async start(argv, init = {}) {
        return this.run(argv, init);
      },
      run(argv, init = {}) {
        const answer = answerOf(argv, init);
        return {
          exitCode: answer.exitCode ?? 0,
          stdout: answer.stdout ?? "",
          stderr: answer.stderr ?? "",
        };
      },
      // A respawn answers from the table too: an answer taught as standing outlives the window, and any other ends with its exit. [[spec/design_output/level0#a-restart-watches-its-child]]
      async respawn(argv, init = {}) {
        const answer = answerOf(argv, init);
        return answer.stands
          ? { fell: false, exitCode: null }
          : { fell: true, exitCode: answer.exitCode ?? 0 };
      },
    },
    "proc",
  );

  function answerOf(argv, init) {
    ran.push({ argv: [...argv], init });
    const said = table.get(key(argv)) ?? table.get(slashed(argv[0]));
    if (said === undefined) {
      throw new Error(`this fake was never taught: ${key(argv)}`);
    }
    return typeof said === "function" ? said(argv, init) : said;
  }
}

function key(argv) {
  return slashed(argv.join(" "));
}

// A command keys with forward slashes on both sides, so a table naming a posix path answers a Windows run. [[spec/design_output/doors#a-fake-behaves]]
function slashed(said) {
  return String(said).split("\\").join("/");
}
