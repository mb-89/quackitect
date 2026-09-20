// The projection read: the entries the tree names, and every source they take.
// A door answering an event stands in the bridge beside this one.
// [[spec/design_output/projection#the-write-door-refuses-one]]
// [[spec/tickets/an-engine-takes-bridge-work]]

import { join } from "node:path";
import { inherits } from "../../.claude/skills/level0/lib/layer.js";
import {
  alsoReads,
  entriesIn,
  PROJECTIONS,
  readsIn,
} from "../../.claude/skills/level0/lib/projection.js";

export function projectionsHere(disk, method) {
  const at = join(method, PROJECTIONS);
  return disk.exists(at) ? entriesIn(disk.read(at)) : [];
}

// The sources come off both roots, the work root's file first. [[spec/design_output/vehicle#the-work-root-inherits]]
export function sourcesOf(entries, disk, method, work = method) {
  const reads = inherits(disk, method, work);
  const out = new Set();
  for (const entry of entries) {
    const texts = new Map();
    for (const path of readsIn(entry, reads)) {
      out.add(path);
      if (reads.exists(path)) texts.set(path, reads.read(path));
    }
    for (const path of alsoReads(entry, texts)) out.add(path);
  }
  return out;
}
