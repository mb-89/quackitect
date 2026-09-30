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

// The source of a verb's program, or of a module beside it, read as text. [[spec/tickets/cli-js-leaves]]
export function scriptText(rel) {
  return String(disk().read(join(ROOT, "src", "scripts", ...rel.split("/"))));
}
