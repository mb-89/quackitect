// The effect of the last retro: its class patterns counted again over this
// retro's input, beside the rates it measured.
// [[spec/guidance/retro/effect]]

import { RETRO } from "../../../.claude/skills/level0/lib/folders.js";
import { batteryDelta } from "../../scripts/battery.js";
import { CLASSES, RATES, ratesOf, recordOf } from "./classes.js";
import { homeOf } from "./timeline.js";

export const EFFECT = "effect.json";
// The battery's report collect keeps, one a retro, read here against the last retro's. [[spec/guidance/retro/effect]]
export const BATTERY = "battery.json";
const COLLECTED = "collected.json";

// The two reports side by side, or nothing where this retro holds none. [[spec/guidance/retro/effect]]
export function batteryEffect(it, name, last) {
  const read = (retro) => {
    try {
      return JSON.parse(it.disk.read(it.join(homeOf(it, retro), BATTERY)));
    } catch {
      return null;
    }
  };
  const now = read(name);
  if (!now) return null;
  // A retro with no last one reads against nothing, so its battery stands as the baseline. [[spec/guidance/retro/effect]]
  const before = last ? read(last) : null;
  return {
    last: last ?? "",
    ...(before ? {} : { baseline: true }),
    ...batteryDelta(before, now),
    slowest: now.slowest ?? [],
  };
}

// The retro before this one holding class fixes, by the time its collect ran. [[spec/guidance/retro/effect]]
export function lastRetro(it, name) {
  const root = it.join(it.root, ...RETRO.split("/"));
  const when = (one) => {
    try {
      return (
        Date.parse(JSON.parse(it.disk.read(it.join(root, one, COLLECTED))).at) || 0
      );
    } catch {
      return 0;
    }
  };
  const now = when(name);
  return it.disk
    .list(root)
    .filter((one) => one.kind === "dir" && one.name !== name)
    .map((one) => one.name)
    .filter(
      (one) =>
        it.disk.exists(it.join(root, one, CLASSES)) &&
        it.disk.exists(it.join(root, one, RATES)),
    )
    .filter((one) => !now || when(one) < now)
    .sort((a, b) => when(b) - when(a))[0];
}

// A class's verdict: gone, falls, holds or grows. [[spec/guidance/retro/effect]]
export function verdictOf(before, now) {
  if (now.count === 0) return "gone";
  if (now.rate < before.rate) return "falls";
  if (now.rate === before.rate) return "holds";
  return "grows";
}

// The verb: counts the last retro's classes over this input, and writes each verdict. [[spec/guidance/retro/effect]]
export function effect(it, name) {
  if (!name || !it.disk.exists(homeOf(it, name))) {
    console.error(
      "retro effect names a retro whose collect stands: ./RUNME.sh retro effect <retro>",
    );
    return 2;
  }
  const last = lastRetro(it, name);
  const battery = batteryEffect(it, name, last);
  if (!last) {
    it.disk.write(
      it.join(homeOf(it, name), EFFECT),
      `${JSON.stringify({ last: "", classes: [], battery }, null, 2)}\n`,
    );
    console.log("No earlier retro holds class fixes, so nothing stands to measure.");
    if (battery) console.log(`battery  baseline ${battery.total.now} ms, which the next retro reads against`);
    return 0;
  }
  const record = recordOf(it.disk.read(it.join(homeOf(it, last), CLASSES)));
  const before = JSON.parse(it.disk.read(it.join(homeOf(it, last), RATES)));
  const now = ratesOf(it, name, record.classes);
  const rows = record.classes.map((one) => ({
    id: one.id,
    class: one.class,
    fix: one.fix,
    tickets: one.tickets ?? [],
    before: before.classes[one.id],
    now: now.classes[one.id],
    verdict: verdictOf(before.classes[one.id], now.classes[one.id]),
  }));
  it.disk.write(
    it.join(homeOf(it, name), EFFECT),
    `${JSON.stringify({ last, classes: rows, battery }, null, 2)}\n`,
  );
  for (const one of rows) {
    console.log(
      `${one.id}  ${one.before.rate} to ${one.now.rate} an hour  ${one.verdict}  ${one.class}`,
    );
  }
  if (battery) {
    console.log(
      `battery  ${battery.total.before} to ${battery.total.now} ms  ${battery.fresh.length} new, ${battery.grown.length} grown, ${battery.gone.length} gone`,
    );
  }
  return 0;
}
