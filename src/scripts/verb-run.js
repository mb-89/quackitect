// The runner every verb program stands on: the words past the verb, the guard
// on its main, and the exit once its output drains.
// [[spec/tickets/cli-js-leaves]]

import { join as joined } from "node:path";
import { runsHere } from "../../.claude/skills/level0/lib/paths.js";

// The folder under the root holding one program a verb. [[spec/tickets/cli-js-leaves]]
export const VERBS = ["src", "scripts", "verbs"];

// The argv of a verb's program: node, the program, and the words past the verb. [[spec/tickets/cli-js-leaves]]
export function verbArgv(node, root, words, join = joined) {
  const [verb, ...rest] = words;
  return [node, join(root, ...VERBS, `${verb}.js`), ...rest];
}

// The paths a verb reads: the words past its flags, or the root where none stands. [[spec/tickets/cli-js-leaves]]
export function whereOf(words) {
  const said = words.filter((one) => !one.startsWith("-"));
  return said.length ? said : ["."];
}

// A verb's exit waits for its output to drain, so a reader on a pipe gets every byte. [[spec/tickets/open-tasks-run-in-shadow]]
export function exitsDrained(code, out, exit) {
  out.write("", () => exit(code));
}

// Runs the program's verb over the words past it, where the program runs as main. [[spec/design_output/doors#a-script-guards-its-main]]
export async function verbMain(url, run) {
  if (!runsHere(url, process.argv)) return;
  exitsDrained((await run(process.argv.slice(2))) ?? 0, process.stdout, process.exit);
}
