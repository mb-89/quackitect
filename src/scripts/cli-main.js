// The main a command root runs: the guard on its main, the words past it, and
// the exit once its output drains.
// [[spec/design_output/doors#a-script-guards-its-main]]

import { runsHere } from "../../.claude/skills/level0/lib/paths.js";

// An exit waits for its output to drain, so a reader on a pipe gets every byte. [[spec/tickets/open-tasks-run-in-shadow]]
export function exitsDrained(code, out, exit) {
  out.write("", () => exit(code));
}

// Runs the program over the words past it, where the program runs as main. [[spec/design_output/doors#a-script-guards-its-main]]
export async function verbMain(url, run) {
  if (!runsHere(url, process.argv)) return;
  exitsDrained((await run(process.argv.slice(2))) ?? 0, process.stdout, process.exit);
}
