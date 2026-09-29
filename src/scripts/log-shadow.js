// The log slice in shadow: the log verb's rows stand, and the log module's
// off `quack log` run beside them. Each row the verb and the module read
// apart becomes one shadow row, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/the-log-topic-lands]]

import { LEVELS, rank } from "../../.claude/skills/level0/lib/log.js";
import { shadowDoorsOf } from "../bridge/findings.js";
import { rowsIn, SESSION } from "./log-read.js";

// The slice, its key under migration, and the mode that runs the new path beside the old one. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const SLICE = "log";
export const KEY = "migration.log";
export const SHADOW = "shadow";

// A row the verb reads, as the verb's filters see it: its level off the ladder. [[spec/design_output/log#what-a-box-writes]]
function oldOf(one) {
  return {
    at: String(one.at ?? ""),
    level: LEVELS[rank(one.level)],
    kind: String(one.kind ?? ""),
    said: String(one.said ?? ""),
  };
}

// A row the module answers, on the same fields. [[spec/tickets/the-log-topic-lands]]
function newOf(one) {
  return {
    at: String(one.at ?? ""),
    level: String(one.level ?? ""),
    kind: String(one.kind ?? ""),
    said: String(one.said ?? ""),
  };
}

// Whether a row counts in the compare: a row, and no shadow row, so no shadow row breeds another. [[spec/tickets/the-log-topic-lands]]
const counted = (one) =>
  one !== null && typeof one === "object" && !Array.isArray(one) && one.kind !== SHADOW;

// Every row the two read apart, in the order the log holds them. The verb drops a broken line the module keeps at error, so a broken row stands apart alone, and every other row meets the verb's next one. A tail one side holds alone is the log growing between the two reads. [[spec/tickets/the-log-topic-lands]]
export function apartOf(rows, answered) {
  const olds = (rows ?? []).filter(counted);
  const out = [];
  let at = 0;
  for (const one of answered.filter(counted)) {
    if (one.broken) {
      out.push({ at: "", old: null, new: newOf(one) });
      continue;
    }
    if (at >= olds.length) break;
    const old = oldOf(olds[at++]);
    const now = newOf(one);
    if (JSON.stringify(old) !== JSON.stringify(now))
      out.push({ at: old.at, old, new: now });
  }
  return out;
}

// The line a mismatch writes, short enough for one row of the log. [[spec/design_output/log#one-verb-reads-the-log]]
export function saidOf(one) {
  return `${SLICE} in shadow: the row at ${one.at || "no stamp"} reads ${JSON.stringify(one.old)} on the old path, and ${JSON.stringify(one.new)} off the module`;
}

// The module's rows, parsed off what `quack log` prints, or null where it printed nothing a reader takes. [[spec/tickets/the-log-topic-lands]]
function answeredOf(text) {
  try {
    const said = JSON.parse(String(text ?? ""));
    return Array.isArray(said) ? said : null;
  } catch {
    return null;
  }
}

// Where the slice reads shadow, runs `quack log` and writes a row for each row read apart, past the shadow rows themselves. A missing binary or an answer no reader takes writes nothing. [[spec/tickets/the-log-topic-lands]]
export async function logShadow(doors, rows) {
  if (!doors) return [];
  if ((await doors.settings.ask(KEY)) !== SHADOW) return [];
  if (!doors.files.exists(doors.binary)) return [];
  let ran;
  try {
    ran = await doors.proc.run([doors.binary, "log"], { cwd: doors.root });
  } catch {
    return [];
  }
  const answered = ran?.exitCode === 0 ? answeredOf(ran.stdout) : null;
  if (!answered) return [];
  const found = apartOf(rows, answered);
  for (const one of found) {
    // The door stamps its own at over a field named at, so the row read apart rides as stamp too. [[spec/design_output/log#what-one-line-looks-like]]
    await doors.log.say("info", SHADOW, saidOf(one), {
      slice: SLICE,
      ...one,
      stamp: one.at,
    });
  }
  return found;
}

// The verb's rows meet the module's behind its answer, over the verb's own doors. quack log answers every row of the session file, so the compare reads that file whole, before any flag narrows it, and a fault there leaves the answer as it stands. [[spec/tickets/log-shadow-reads-unfiltered-rows]]
export async function shadowLog(it) {
  try {
    const doors = shadowDoorsOf(it);
    if (!doors) return [];
    const here = it.join(it.root, SESSION);
    const rows = it.disk.exists(here) ? rowsIn(it, [here]) : [];
    return await logShadow(doors, rows);
  } catch {
    return [];
  }
}
