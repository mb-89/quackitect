// A process door answering from a table. A command nobody taught it is a
// failure the test sees, so a silent wrong answer stays impossible.
// [[spec/design_output/doors#a-fake-behaves]]

export function fakeProc(answers = {}) {
  const ran = [];
  const table = new Map(Object.entries(answers));

  return {
    ran,
    teach: (argv, said) => void table.set(key(argv), said),
    run(argv, init = {}) {
      ran.push({ argv: [...argv], init });
      const said = table.get(key(argv)) ?? table.get(argv[0]);
      if (said === undefined) {
        throw new Error(`this fake was never taught: ${key(argv)}`);
      }
      const answer = typeof said === "function" ? said(argv, init) : said;
      return {
        exitCode: answer.exitCode ?? 0,
        stdout: answer.stdout ?? "",
        stderr: answer.stderr ?? "",
      };
    },
  };
}

function key(argv) {
  return argv.join(" ");
}
