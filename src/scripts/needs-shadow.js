// The needs of a leaf in shadow: the table cli.js keeps stands, and the
// registry's actions off `quack get index/actions` answer beside it. Each need
// the two answer apart becomes one shadow row.
// [[spec/tickets/pull-verbs-become-actions]]

// The slice, its key under migration, and the mode that runs the new path beside the old one. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const SLICE = "verbs";
export const KEY = "migration.verbs";
export const SHADOW = "shadow";

// The table of topic and verb the registry's action names answer. [[spec/tickets/pull-verbs-become-actions]]
export function registryOf(_rows) {
  return {};
}

// Where the slice reads shadow, one row a need the table and the registry answer apart. [[spec/tickets/pull-verbs-become-actions]]
export async function needsShadow(_doors, _needs) {
  return [];
}
