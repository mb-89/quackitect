// The read over the session log and the rotated files beside it, and the four
// narrow filters a caller composes over the rows it answers. The verb over
// them stands in log-verb.js.
// [[spec/design_output/log#one-verb-reads-the-log]]

import {
  asRow,
  MS,
  OLD,
  rowsOf,
  SESSION,
  timeOf,
  writes,
} from "../../.claude/skills/level0/lib/log.js";
import { spanOf } from "./group.js";

const END = ".jsonl";
// What a reader meets where no writer has said a line yet. [[spec/design_output/log#one-verb-reads-the-log]]
export const NO_LOG =
  "No log stands yet. A writer starts one the next time it says a line.";

// [[spec/design_output/log#one-verb-reads-the-log]]
export function within(rows, span, now) {
  const seconds = spanOf(span);
  if (!seconds) return rows;
  const from = now - seconds * MS;
  return rows.filter((one) => Date.parse(String(one.at)) >= from);
}

// [[spec/design_output/log#what-a-box-writes]]
export function atLevel(rows, level) {
  if (!level) return rows;
  return rows.filter((one) => writes(level, one.level));
}

// [[spec/design_output/log#one-verb-reads-the-log]]
export function ofKind(rows, kind) {
  if (!kind) return rows;
  return rows.filter((one) => String(one.kind) === String(kind));
}

// [[spec/design_output/log#one-verb-reads-the-log]]
export function lastOf(rows, count) {
  const many = Number(count);
  if (!Number.isFinite(many) || many <= 0) return rows;
  return rows.slice(-many);
}

// A rotated file carries its first stamp in its name, so a span opens the ones it reaches. [[spec/design_output/log#a-session-rotates-its-file]]
export function filesFor(it, span, now) {
  const old = it.join(it.root, OLD);
  const seconds = spanOf(span);
  const from = seconds ? now - seconds * MS : 0;
  const rotated = it.disk.exists(old) ? it.names(old, END).sort() : [];
  const out = rotated
    .filter((name) => !from || timeOf(name) >= from)
    .map((name) => it.join(old, name));
  const here = it.join(it.root, SESSION);
  if (it.disk.exists(here)) out.push(here);
  return out;
}

// [[spec/design_output/log#one-verb-reads-the-log]]
export function rowsIn(it, paths) {
  return paths.flatMap((path) => rowsOf(it.disk.read(path)));
}

export { asRow, OLD, SESSION };
