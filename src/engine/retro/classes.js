// The retro's class fixes: the classes a hand writes, checked, counted and
// held against every finding, which each carry a disposition.
// [[spec/guidance/retro/classify]]

import { CUTS } from "./chapters.js";
import { CATEGORIES, columnsOf, itemsOf } from "./findings.js";
import { countsOver, homeOf } from "./timeline.js";

export const CLASSES = "classes.json";
export const RATES = "rates.json";
export const SOURCES = ["log", "transcripts", "all"];
// A disposition dropping a finding opens on this, and a reason follows. [[spec/guidance/retro/classify]]
export const DROPPED = "dropped:";
const PLACES = 2;

// The hand's record, read: the classes, the dispositions and the promotions. [[spec/guidance/retro/classify]]
export function recordOf(text) {
  try {
    const read = JSON.parse(text);
    return {
      classes: Array.isArray(read?.classes) ? read.classes : [],
      dispositions:
        read?.dispositions && typeof read.dispositions === "object"
          ? read.dispositions
          : {},
      promotions: Array.isArray(read?.promotions) ? read.promotions : [],
    };
  } catch {
    return null;
  }
}

// Every fault of a record held against the findings: a class short a field, a finding with no disposition, a disposition naming nothing. [[spec/guidance/retro/classify]]
export function faultsOf(record, items) {
  const faults = [];
  const ids = new Set(record.classes.map((one) => String(one?.id ?? "")));
  for (const one of record.classes) {
    for (const field of ["id", "category", "class", "defect", "fix"]) {
      if (!String(one?.[field] ?? "").trim())
        faults.push(`a class carries no ${field}: ${one?.id ?? "?"}`);
    }
    if (!CATEGORIES.includes(one?.category))
      faults.push(`${one?.id} names no category of ${CATEGORIES.join(", ")}`);
    if (!SOURCES.includes(one?.measure?.source))
      faults.push(`${one?.id} measures no source of ${SOURCES.join(", ")}`);
    if (!patternOf(one?.measure?.pattern))
      faults.push(`${one?.id} carries no pattern that compiles`);
  }
  const known = new Set(items.map((one) => one.id));
  for (const one of items) {
    if (!(one.id in record.dispositions))
      faults.push(`${one.id} carries no disposition`);
  }
  for (const [id, said] of Object.entries(record.dispositions)) {
    if (!known.has(id))
      faults.push(`a disposition names ${id}, and no finding carries that id`);
    const text = String(said ?? "");
    const dropped = text.startsWith(DROPPED) && text.slice(DROPPED.length).trim();
    if (!dropped && !ids.has(text))
      faults.push(
        `${id} names ${text || "nothing"}, which is no class and no reason to drop`,
      );
  }
  record.promotions.forEach((one, at) => {
    for (const field of ["what", "from", "to"]) {
      if (!String(one?.[field] ?? "").trim())
        faults.push(`promotion ${at + 1} carries no ${field}`);
    }
  });
  return faults;
}

export function patternOf(said) {
  try {
    return said ? new RegExp(String(said)) : null;
  } catch {
    return null;
  }
}

// Each class's rate: its matches per active hour of the input. [[spec/guidance/retro/classify]]
export function ratesOf(it, name, classes) {
  const measures = classes.map((one) => ({
    id: one.id,
    source: one.measure.source,
    pattern: patternOf(one.measure.pattern),
  }));
  const { counts, hours } = countsOver(it, name, measures);
  const rate = (count) => (hours ? Number((count / hours).toFixed(PLACES)) : 0);
  return {
    hours,
    classes: Object.fromEntries(
      classes.map((one) => [
        one.id,
        { count: counts[one.id], rate: rate(counts[one.id]) },
      ]),
    ),
  };
}

// The verb: refuses a record short of anything, and writes each class's rate. [[spec/guidance/retro/classify]]
export function classes(it, name) {
  const home = name ? homeOf(it, name) : "";
  const at = home ? it.join(home, CLASSES) : "";
  if (!at || !it.disk.exists(at) || !it.disk.exists(it.join(home, CUTS))) {
    console.error(
      `retro classes reads ${CLASSES} beside the chapters of a retro, and none stands.`,
    );
    return 2;
  }
  const record = recordOf(it.disk.read(at));
  if (!record) {
    console.error(`${CLASSES} reads as no JSON`);
    return 1;
  }
  const { columns, faults: missing } = columnsOf(it, home);
  const faults = [...missing, ...faultsOf(record, itemsOf(columns))];
  if (faults.length) {
    for (const one of faults) console.error(one);
    return 1;
  }
  const rates = ratesOf(it, name, record.classes);
  it.disk.write(it.join(home, RATES), `${JSON.stringify(rates, null, 2)}\n`);
  for (const one of record.classes) {
    const said = rates.classes[one.id];
    console.log(
      `${one.id}  ${one.category}  ${said.count} match(es), ${said.rate} an hour  ${one.class}`,
    );
  }
  console.log(
    `${rates.hours} active hour(s), and every finding carries a disposition.`,
  );
  return 0;
}
