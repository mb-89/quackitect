// The tests a process lists as red: every ticket past tests-red and short of
// tests-green names the files it expects to fail, and the check leaves them
// out until tests-green closes.
// [[spec/design_output/pull#the-gate]]

import { CLOSED, fieldOf, frontOf, recordIn } from "../engine/group.js";
import { chapterOf } from "./pull-chapter.js";
import { walkOf } from "./pull-route.js";

const RED = "tests-red";
const GREEN = "tests-green";
const FIELD = "red";

// [[spec/design_output/pull#the-gate]]
export function expectedRed(tickets) {
  const out = new Set();
  for (const one of tickets) {
    if (fieldOf(one.text, "state") === CLOSED) continue;
    const passed = recordIn(one.text)
      .filter((entry) => !entry.skipped)
      .map((entry) => String(entry.step).split("/").at(-1));
    if (!passed.includes(RED) || passed.includes(GREEN)) continue;
    const leaves = walkOf(frontOf(one.text)).filter(
      (held) => held.leaf && held.name === RED,
    );
    for (const leaf of leaves) {
      for (const row of chapterOf(one.text, leaf.path).fields.get(FIELD) ?? []) {
        const file = String(row)
          .replace(/^[-*]\s+/, "")
          .replaceAll("`", "")
          .trim();
        if (file) out.add(file);
      }
    }
  }
  return [...out].sort();
}
