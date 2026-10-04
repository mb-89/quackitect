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
const REGISTERS = /\bregister\("([a-z]+)",/g;

// Each verb of the table, keyed to its usage line. [[spec/tickets/cli-js-leaves]]
export function commands() {
  const text = String(disk().read(TABLE));
  return new Map([...text.matchAll(ROW)].map((one) => [one[1], one[2]]));
}

// The source of a verb's program, or of a module beside it, read as text. [[spec/tickets/cli-js-leaves]]
export function scriptText(rel) {
  return String(disk().read(join(ROOT, "src", "scripts", ...rel.split("/"))));
}

// The verbs Go answers whole, each registered under its one word from a file under src/quack. [[spec/tickets/quack-registers-each-verb]]
export function goVerbs() {
  const files = disk();
  const out = new Set();
  for (const one of files.list(QUACK)) {
    if (!one.name.endsWith(".go") || one.name.endsWith("_test.go")) continue;
    const text = String(files.read(join(QUACK, one.name)));
    for (const found of text.matchAll(REGISTERS)) out.add(found[1]);
  }
  return out;
}
