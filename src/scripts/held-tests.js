// The tests every held ticket's command lines carry, which the commit door
// counts beside the staged ones.
// [[spec/design_output/tree#the-rules-over-two-files]]

import { carriedIn } from "../../.claude/skills/level0/lib/tested.js";
import { holdsIn } from "./ephemeral.js";

export function heldTests(it) {
  const out = new Set();
  for (const { held } of holdsIn(it.disk, it.root)) {
    if (!held?.path) continue;
    const at = it.join(it.root, ...String(held.path).split("/"));
    if (!it.disk.exists(at)) continue;
    for (const one of carriedIn(it.disk.read(at))) out.add(one);
  }
  return [...out];
}
