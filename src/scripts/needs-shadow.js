// The needs of a leaf in shadow: the table cli.js keeps stands, and the
// registry's actions off `quack get index/actions` answer beside it. Each need
// the tables answer apart becomes one shadow row.
// [[spec/tickets/pull-verbs-become-actions]]

import { shadowDoorsOf } from "../bridge/findings.js";
import { holdsVerb } from "./pull-route.js";

// The slice, its key under migration, and the mode that runs the new path beside the old one. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const SLICE = "verbs";
export const KEY = "migration.verbs";
export const SHADOW = "shadow";

// The name the index answers its actions under. [[spec/tickets/pull-verbs-become-actions]]
const ACTIONS = "index/actions";

// The table of topic and verb the registry's action names answer, with work read as branch, as VERBS reads it. [[spec/tickets/pull-verbs-become-actions]]
export function registryOf(rows) {
  const table = {};
  for (const row of rows ?? []) {
    const [topic, verb] = String(row?.name ?? "").split("/");
    if (!topic || !verb) continue;
    table[topic] ??= [];
    table[topic].push(verb);
  }
  if (table.branch) table.work = table.branch;
  return table;
}

// The line a mismatch writes, short enough for one row of the log. [[spec/design_output/log#one-verb-reads-the-log]]
function saidOf(one) {
  return `${SLICE} in shadow: the need ${one.need} reads ${one.old} off cli.js, and ${one.new} off the registry`;
}

// The rows `quack get` prints, or null where it printed nothing a reader takes. [[spec/tickets/pull-verbs-become-actions]]
function rowsOf(text) {
  try {
    const said = JSON.parse(String(text ?? ""));
    return Array.isArray(said) ? said : null;
  } catch {
    return null;
  }
}

// Where the slice reads shadow, one row a need the table and the registry answer apart. A missing binary or an answer no reader takes writes nothing. [[spec/tickets/pull-verbs-become-actions]]
export async function needsShadow(doors, needs) {
  if (!doors || !needs?.length) return [];
  if ((await doors.settings.ask(KEY)) !== SHADOW) return [];
  if (!doors.files.exists(doors.binary)) return [];
  let ran;
  try {
    ran = await doors.proc.run([doors.binary, "get", ACTIONS], { cwd: doors.root });
  } catch {
    return [];
  }
  const rows = ran?.exitCode === 0 ? rowsOf(ran.stdout) : null;
  if (!rows) return [];
  const table = registryOf(rows);
  const found = [];
  for (const need of needs) {
    const old = holdsVerb(need);
    const now = holdsVerb(need, table);
    if (old !== now) found.push({ need, old, new: now });
  }
  for (const one of found) {
    await doors.log.say("info", SHADOW, saidOf(one), { slice: SLICE, ...one });
  }
  return found;
}

// A leaf's needs meet the registry behind the hand-out, over the caller's own doors, and a fault there leaves the hand-out as it stands. [[spec/tickets/pull-verbs-become-actions]]
export async function shadowNeeds(it, needs) {
  try {
    return await needsShadow(shadowDoorsOf(it), needs);
  } catch {
    return [];
  }
}
