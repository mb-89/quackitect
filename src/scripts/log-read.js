// The read over the session log and the rotated files beside it, which the
// window reads. The log verb runs in Go, in src/quack/verb_log.go.
// [[spec/design_output/log#one-verb-reads-the-log]]

import {
  asRow,
  MS,
  OLD,
  rowsIn as rowsHeld,
  SESSION,
  timeOf,
} from "../../.claude/skills/level0/lib/log.js";
import { spanOf } from "../engine/group.js";

const END = ".jsonl";
// What a reader meets where no writer has said a line yet. [[spec/design_output/log#one-verb-reads-the-log]]
export const NO_LOG =
  "No log stands yet. A writer starts one the next time it says a line.";

// A rotated file carries its first stamp in its name, so a span opens the ones it reaches. [[spec/design_output/log#a-session-rotates-its-file]]
export function filesFor(it, span, now) {
  const old = it.join(it.root, OLD);
  const seconds = spanOf(span);
  const from = seconds ? now - seconds * MS : 0;
  const rotated = it.disk.exists(old) ? it.names(old, END).sort() : [];
  const inside = rotated.filter((name) => !from || timeOf(name) >= from);
  // The newest file opening before the span runs on into it, so its later rows count. [[spec/design_output/log#a-session-rotates-its-file]]
  const before = rotated
    .filter((name) => from && timeOf(name) && timeOf(name) < from)
    .sort((one, other) => timeOf(one) - timeOf(other));
  if (before.length) inside.unshift(before[before.length - 1]);
  const out = inside.map((name) => it.join(old, name));
  const here = it.join(it.root, SESSION);
  if (it.disk.exists(here)) out.push(here);
  return out;
}

// [[spec/design_output/log#one-verb-reads-the-log]]
// A torn line drops alone, and the rows around it stand. [[spec/design_output/log#every-writer-appends]]
export function rowsIn(it, paths) {
  return paths.flatMap((path) => rowsHeld(it.disk.read(path)));
}

export { asRow, SESSION };
