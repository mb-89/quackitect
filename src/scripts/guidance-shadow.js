// The guidance slice in shadow: the old reader's notes stand, and the
// guidance module's off `quack guidance` run beside them. Each leaf the old
// reader and the module answer apart becomes one shadow row, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/the-guidance-topic-lands]]

// The slice, its key under migration, and the mode that runs the new path beside the old one. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const SLICE = "guidance";
export const KEY = "migration.guidance";
export const SHADOW = "shadow";

// Where the slice reads shadow, runs `quack guidance` and writes a row for each asked leaf answered apart. A missing binary or an answer no reader takes writes nothing. [[spec/tickets/the-guidance-topic-lands]]
// biome-ignore lint/correctness/noUnusedFunctionParameters: a stub until tests-green
export async function guidanceShadow(doors, asked) {
  return [];
}
