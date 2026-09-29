// The guidance slice in shadow: the old reader's notes stand, and the
// guidance module's off `quack guidance` run beside them. Each leaf the old
// reader and the module answer apart becomes one shadow row, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/the-guidance-topic-lands]]

import { shadowDoorsOf } from "../bridge/findings.js";
import { processNameOf } from "./quack-topic.js";

// The slice, its key under migration, and the mode that runs the new path beside the old one. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const SLICE = "guidance";
export const KEY = "migration.guidance";
export const SHADOW = "shadow";

// Every asked leaf whose notes the module answers apart, in key order. A leaf the module names nowhere answers no notes. [[spec/tickets/the-guidance-topic-lands]]
export function apartOf(asked, answered) {
  const out = [];
  for (const leaf of Object.keys(asked ?? {}).sort()) {
    const old = [...(asked[leaf] ?? [])].map(String);
    const now = Array.isArray(answered[leaf]) ? answered[leaf].map(String) : [];
    if (JSON.stringify(old) === JSON.stringify(now)) continue;
    out.push({ leaf, old, new: now });
  }
  return out;
}

// The line a mismatch writes, short enough for one row of the log. [[spec/design_output/log#one-verb-reads-the-log]]
export function saidOf(one) {
  return `${SLICE} in shadow: ${one.leaf} reads ${JSON.stringify(one.old)} on the old path, and ${JSON.stringify(one.new)} off the module`;
}

// The module's answer, parsed off what `quack guidance` prints, or null where it printed nothing a reader takes. [[spec/tickets/the-guidance-topic-lands]]
function answeredOf(text) {
  try {
    const said = JSON.parse(String(text ?? ""));
    return said && typeof said === "object" && !Array.isArray(said) ? said : null;
  } catch {
    return null;
  }
}

// Where the slice reads shadow, runs `quack guidance` and writes a row for each asked leaf answered apart. A missing binary or an answer no reader takes writes nothing. [[spec/tickets/the-guidance-topic-lands]]
export async function guidanceShadow(doors, asked) {
  if (!doors || !Object.keys(asked ?? {}).length) return [];
  if ((await doors.settings.ask(KEY)) !== SHADOW) return [];
  if (!doors.files.exists(doors.binary)) return [];
  let ran;
  try {
    ran = await doors.proc.run([doors.binary, "guidance"], { cwd: doors.root });
  } catch {
    return [];
  }
  const answered = ran?.exitCode === 0 ? answeredOf(ran.stdout) : null;
  if (!answered) return [];
  const found = apartOf(asked, answered);
  for (const one of found) {
    await doors.log.say("info", SHADOW, saidOf(one), { slice: SLICE, ...one });
  }
  return found;
}

// One leaf's notes meet the module's behind the caller's answer, over the caller's own doors, and a fault there leaves the answer as it stands. [[spec/tickets/the-guidance-topic-lands]]
export async function shadowLeaf(it, leaf, notes) {
  try {
    return await guidanceShadow(shadowDoorsOf(it), { [leaf]: notes });
  } catch {
    return [];
  }
}

export { processNameOf };
