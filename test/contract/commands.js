// The verb table Go holds, read as text off src/modules/verbs/tree.go: each
// verb in help order, with its usage line.
// [[spec/tickets/cli-js-leaves]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const TABLE = join(ROOT, "src", "modules", "verbs", "tree.go");
const ROW = /\{Name: "([a-z]+)", Doc: "((?:[^"\\]|\\.)*)"\}/g;

// Each verb of the table, keyed to its usage line. [[spec/tickets/cli-js-leaves]]
export function commands() {
  const text = String(disk().read(TABLE));
  return new Map([...text.matchAll(ROW)].map((one) => [one[1], one[2]]));
}

// A verb Go registers whole: a one-word key of the registry, which src/quack registers from an init in a file of its own. [[spec/tickets/quack-registers-each-verb]]
const REGISTERED = /\bregister\("([a-z]+)"/g;

// The verbs Go answers whole, which stand as no program. [[spec/tickets/quack-registers-each-verb]]
export function goVerbs() {
  const folder = join(ROOT, "src", "quack");
  const out = new Set();
  for (const one of disk().list(folder)) {
    if (!one.name.endsWith(".go") || one.name.endsWith("_test.go")) continue;
    const text = String(disk().read(join(folder, one.name)));
    for (const hit of text.matchAll(REGISTERED)) out.add(hit[1]);
  }
  return out;
}

// The source of a verb's program, or of a module beside it, read as text. [[spec/tickets/cli-js-leaves]]
export function scriptText(rel) {
  return String(disk().read(join(ROOT, "src", "scripts", ...rel.split("/"))));
}
