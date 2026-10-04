// The verb table Go holds, read as text off src/modules/verbs/tree.go: each
// verb in help order, with its usage line.
// [[spec/tickets/cli-js-leaves]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const TABLE = join(ROOT, "src", "modules", "verbs", "tree.go");
const ROW = /\{Name: "([a-z]+)", Doc: "((?:[^"\\]|\\.)*)"\}/g;
const QUACK = join(ROOT, "src", "quack");
const REGISTERS = /\bregister\("([a-z]+)"/g;

// Each verb of the table, keyed to its usage line. [[spec/tickets/cli-js-leaves]]
export function commands() {
  const text = String(disk().read(TABLE));
  return new Map([...text.matchAll(ROW)].map((one) => [one[1], one[2]]));
}

// The verbs quack registers in Go, which hand no words to a node program. [[spec/tickets/quack-registers-each-verb]]
export function goVerbs() {
  const sources = disk()
    .list(QUACK)
    .map((one) => one.name)
    .filter((name) => name.endsWith(".go") && !name.endsWith("_test.go"));
  const names = sources.flatMap((name) =>
    [...String(disk().read(join(QUACK, name))).matchAll(REGISTERS)].map((one) => one[1]),
  );
  return new Set(names);
}

// The source of a verb's program, or of a module beside it, read as text. [[spec/tickets/cli-js-leaves]]
export function scriptText(rel) {
  return String(disk().read(join(ROOT, "src", "scripts", ...rel.split("/"))));
}
