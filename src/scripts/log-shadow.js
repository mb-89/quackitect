// The log slice in shadow: the log verb's rows stand, and the log module's
// off `quack log` run beside them. Each row the verb and the module read
// apart becomes one shadow row, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/the-log-topic-lands]]

// The slice, its key under migration, and the mode that runs the new path beside the old one. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const SLICE = "log";
export const KEY = "migration.log";
export const SHADOW = "shadow";

// Where the slice reads shadow, runs `quack log` and writes a row for each row read apart, past the shadow rows themselves. A missing binary or an answer no reader takes writes nothing. [[spec/tickets/the-log-topic-lands]]
export async function logShadow(_doors, _rows) {
  return [];
}
