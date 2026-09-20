// The read over the session log and the rotated files beside it, and the four
// narrow filters a caller composes over the rows it answers.
// [[spec/design_output/log#one-verb-reads-the-log]]

import {
  OLD,
  rank,
  rowsOf,
  SESSION,
  timeOf,
  writes,
} from "../../.claude/skills/level0/lib/log.js";
import { spanOf } from "./group.js";

// A span answers seconds, and a row's stamp answers milliseconds. [[spec/design_output/log#one-verb-reads-the-log]]
export const MS = 1000;

export function within(rows, span, now) {
  return rows;
}

export function atLevel(rows, level) {
  return rows;
}

export function ofKind(rows, kind) {
  return rows;
}

export function lastOf(rows, count) {
  return rows;
}

export function filesFor(it, span, now) {
  return [];
}

export function rowsIn(it, paths) {
  return paths.flatMap((path) => rowsOf(it.disk.read(path)));
}

export { OLD, rank, rowsOf, SESSION, timeOf, writes, spanOf };
