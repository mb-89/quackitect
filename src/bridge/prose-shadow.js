// The prose slice in shadow: wink's answer stands, and the Go vetoes off
// `quack prose` run beside it. Each finding the two keep apart becomes one
// shadow row, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/prose-checks-run-in-go]]

// The slice, its key under migration, and the mode that runs the new path beside the old one. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const SLICE = "prose";
export const KEY = "migration.prose";
export const SHADOW = "shadow";

// Every finding one side keeps and the other drops, a document at a time. [[spec/tickets/prose-checks-run-in-go]]
export function apartOf(docs, wink, go) {
  return [];
}

// The line a mismatch writes, short enough for one row of the log. [[spec/design_output/log#one-verb-reads-the-log]]
export function saidOf(one) {
  return "";
}

// Where the slice reads shadow, runs `quack prose` once over the documents and writes a row for each finding kept apart. A missing binary or an answer no reader takes writes nothing. [[spec/tickets/prose-checks-run-in-go]]
export async function shadowProse(doors, docs, wink, mode) {
  return [];
}
