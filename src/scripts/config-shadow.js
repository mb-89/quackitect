// The config slice in shadow: the config verb's own answer stands, and the
// config module's answer off `quack config` runs beside it. Each key they
// answer apart becomes one shadow row, which ./RUNME.sh log --kind shadow names.
// [[spec/tickets/cfg-topic-holds-one-resolver]]

// The slice, its key under migration, and the mode that runs the new path beside the old one. [[spec/design_input/the-migration-runs-in-slices#how-a-slice-moves]]
export const SLICE = "config";
export const KEY = "migration.config";
export const SHADOW = "shadow";

// Every key the two readers answer apart, by value or by layer, in name order. A key one side answers alone differs too. [[spec/tickets/cfg-topic-holds-one-resolver]]
export function mismatchesOf(rows, answered, wanted = null) {
  const old = new Map(rows.map((one) => [one.key, one]));
  const names = new Set([...old.keys(), ...Object.keys(answered ?? {})]);
  const out = [];
  for (const key of [...names].sort()) {
    if (wanted && !wanted.has(key)) continue;
    const was = old.get(key);
    const now = answered?.[key];
    const same =
      was &&
      now &&
      JSON.stringify(was.value) === JSON.stringify(now.value) &&
      was.layer === now.layer;
    if (same) continue;
    out.push({
      key,
      old: was?.value,
      new: now?.value,
      oldLayer: was?.layer ?? "",
      newLayer: now?.layer ?? "",
    });
  }
  return out;
}

// The line a mismatch writes, short enough for one row of the log. [[spec/design_output/log#one-verb-reads-the-log]]
export function saidOf(one) {
  return `${SLICE} in shadow: ${one.key} reads ${JSON.stringify(one.old)} in ${one.oldLayer || "no layer"}, and ${JSON.stringify(one.new)} in ${one.newLayer || "no layer"} off the module`;
}

// The config module's answer, parsed off what `quack config` prints, or null where it printed nothing a reader takes. [[spec/tickets/cfg-topic-holds-one-resolver]]
export function answeredOf(text) {
  try {
    const said = JSON.parse(String(text ?? ""));
    return said && typeof said === "object" && !Array.isArray(said) ? said : null;
  } catch {
    return null;
  }
}

// Where the slice reads shadow, runs `quack config` and writes a row for each key answered apart. A missing binary or an answer no reader takes runs nothing. [[spec/tickets/cfg-topic-holds-one-resolver]]
export async function shadowRun(doors, rows, wanted = null) {
  if ((await doors.settings.ask(KEY)) !== SHADOW) return [];
  if (!doors.files.exists(doors.binary)) return [];
  const ran = doors.proc.run([doors.binary, "config"], { cwd: doors.root });
  const answered = ran.exitCode === 0 ? answeredOf(ran.stdout) : null;
  if (!answered) return [];
  const found = mismatchesOf(rows, answered, wanted);
  for (const one of found) {
    await doors.log.say("info", SHADOW, saidOf(one), { slice: SLICE, ...one });
  }
  return found;
}
