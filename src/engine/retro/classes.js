// The retro's class fixes: the classes a hand writes, checked, counted and
// held against every finding, note and memory, which each carry a disposition.
// [[spec/guidance/retro/classify]]

import { CUTS } from "./chapters.js";
import { CATEGORIES, columnsOf, itemsOf } from "./findings.js";
import { countsOver, homeOf, INPUT } from "./timeline.js";

export const CLASSES = "classes.json";
export const RATES = "rates.json";
export const SOURCES = ["log", "transcripts", "all"];
// A disposition that joins no class opens on one of these, and a reason or a place follows. [[spec/guidance/retro/classify]]
export const KINDS = ["dropped:", "done:", "ticket:"];
// The input folders whose every file carries a disposition too: the collected notes and the memory. [[spec/guidance/retro/classify]]
const DRAINED = [
  { folder: "tickets", prefix: "note" },
  { folder: "memory", prefix: "memory" },
];
const INDEX = "MEMORY.md";
const PLACES = 2;

// The hand's record, read. [[spec/guidance/retro/classify]]
export function recordOf(text) {
  try {
    const read = JSON.parse(text);
    const list = (key) => (Array.isArray(read?.[key]) ? read[key] : []);
    return {
      classes: list("classes"),
      dispositions:
        read?.dispositions && typeof read.dispositions === "object"
          ? read.dispositions
          : {},
      promotions: list("promotions"),
      limits: list("limits"),
      checklist: list("checklist"),
    };
  } catch {
    return null;
  }
}

// Every collected note and memory, by id, so each one answers where it goes. [[spec/guidance/retro/classify]]
export function drainedOf(it, home) {
  const out = [];
  // Collect nests the memory under the project's folder name, so the walk reaches every level. [[spec/guidance/retro/classify]]
  const walk = (at, prefix) => {
    if (!it.disk.exists(at)) return;
    for (const entry of it.disk.list(at)) {
      if (entry.kind === "dir") walk(it.join(at, entry.name), prefix);
      else if (entry.name.endsWith(".md") && entry.name !== INDEX) {
        out.push({ id: `${prefix}:${entry.name.replace(/\.md$/, "")}` });
      }
    }
  };
  for (const one of DRAINED) walk(it.join(home, INPUT, one.folder), one.prefix);
  return out;
}

// Every fault of a record held against the items: a class short a field, an item with no disposition, a disposition naming nothing. [[spec/guidance/retro/classify]]
export function faultsOf(record, items) {
  const faults = [...classFaults(record.classes)];
  const ids = new Set(record.classes.map((one) => String(one?.id ?? "")));
  const known = new Set(items.map((one) => one.id));
  for (const one of items) {
    if (!(one.id in record.dispositions))
      faults.push(`${one.id} carries no disposition`);
  }
  for (const [id, said] of Object.entries(record.dispositions)) {
    if (!known.has(id))
      faults.push(`a disposition names ${id}, and no item carries that id`);
    const text = String(said ?? "");
    const kind = KINDS.find((one) => text.startsWith(one));
    const reasoned = kind && text.slice(kind.length).trim();
    if (!reasoned && !ids.has(text)) {
      faults.push(
        `${id} names ${text || "nothing"}, which is no class and no ${KINDS.join(" or ")} with its reason`,
      );
    }
  }
  faults.push(...listFaults("promotion", record.promotions, ["what", "from", "to"]));
  faults.push(...listFaults("limit", record.limits, ["what", "why"]));
  faults.push(...listFaults("checklist item", record.checklist, ["item", "why"]));
  return faults;
}

function classFaults(classes) {
  const faults = [];
  for (const one of classes) {
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
  return faults;
}

function listFaults(name, list, fields) {
  const faults = [];
  list.forEach((one, at) => {
    for (const field of fields) {
      if (!String(one?.[field] ?? "").trim())
        faults.push(`${name} ${at + 1} carries no ${field}`);
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
  const items = [...itemsOf(columns), ...drainedOf(it, home)];
  const faults = [...missing, ...faultsOf(record, items)];
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
    `${rates.hours} active hour(s), and every finding, note and memory carries a disposition.`,
  );
  return 0;
}
