// The verb table Go holds, read as text off src/modules/verbs/tree.go: each
// verb in help order, with its usage line, and the verbs Go registers.
// [[spec/tickets/cli-js-leaves]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const TABLE = join(ROOT, "src", "modules", "verbs", "tree.go");
const ROW = /\{Name: "([a-z]+)", Doc: "((?:[^"\\]|\\.)*)"\}/g;
const QUACK = join(ROOT, "src", "quack");
const REGISTERS = /\bregister(?:Box)?\("([a-z ]+)",/g;

// Each verb of the table, keyed to its usage line. [[spec/tickets/cli-js-leaves]]
export function commands() {
  const text = String(disk().read(TABLE));
  return new Map([...text.matchAll(ROW)].map((one) => [one[1], one[2]]));
}

// The words of every verb a file under src/quack registers in Go, its tests aside, so a ported verb stands without a program. [[spec/tickets/box-verbs-port-to-go]]
export function registered() {
  const files = disk();
  const source = files
    .list(QUACK)
    .map((one) => one.name)
    .filter((one) => one.endsWith(".go") && !one.endsWith("_test.go"))
    .map((one) => String(files.read(join(QUACK, one))))
    .join("\n");
  return new Set([...source.matchAll(REGISTERS)].map((one) => one[1]));
}

// The source of a verb's program, or of a module beside it, read as text. [[spec/tickets/cli-js-leaves]]
export function scriptText(rel) {
  return String(disk().read(join(ROOT, "src", "scripts", ...rel.split("/"))));
}
