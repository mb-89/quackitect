// The ticket door. A ticket takes a hand's writing in three places, and the rest
// of it belongs to the verbs. The schema says which field and which chapter, so
// this holds no list of its own.
// [[spec/design_output/schema#the-three-places]]

import { entriesIn, readNote } from "./schema.js";

export const SEVERITY = "error";
export const HAND = "hand";

// [[spec/design_output/schema#the-three-places]]
export function ticketFaults(was, now, schema, where) {
  const old = readNote(was);
  if (!old.front.stands) return [];

  const note = readNote(now);
  return [
    ...verbFaults(old, note, schema, where),
    ...placeFaults(old, note, schema, where),
  ];
}

// [[spec/design_output/schema#the-verbs-own-three-fields]]
function verbFaults(old, note, schema, where) {
  const props = schema?.frontmatter?.properties ?? {};
  const kind = String(schema?.kind ?? "");
  const out = [];

  for (const [key, rule] of Object.entries(props)) {
    if (!rule?.["x-engine"]) continue;
    if (same(old.front.said?.[key], note.front.said?.[key])) continue;
    out.push(
      fault(
        key,
        where,
        note.front.lines?.[key] ?? 1,
        `${key} is the verbs' to write on a ${kind}, and this write changes it.`,
      ),
    );
  }
  return out;
}

// [[spec/design_output/schema#the-three-places]]
function placeFaults(old, note, schema, where) {
  const places = placesIn(note, schema);
  if (!places.size) return [];

  const held = new Map(old.sections.map((one) => [keyOf(one), one.own.join("\n")]));
  const out = [];

  for (const one of note.sections) {
    const key = keyOf(one);
    if (places.has(key)) continue;
    if (held.get(key) === one.own.join("\n")) continue;
    out.push(
      fault(
        one.header,
        where,
        one.line,
        `${one.header} is the engine's to write. A hand writes ${said(places)}.`,
      ),
    );
  }
  return out;
}

// [[spec/design_output/schema#the-three-places]]
export function placesIn(note, schema) {
  const front = note.front.said ?? {};
  const level = schema?.body?.headingLevel ?? 1;
  const out = new Map();

  for (const one of schema?.body?.sections ?? []) {
    const who = one["x-written"];
    if (!who) continue;
    if (who === HAND) {
      for (const [key, name] of fieldsHeld(front, level)) out.set(key, name);
      continue;
    }
    if (who !== "anyone" && String(front.state ?? "") !== who) continue;
    out.set(`${level} ${one.header}`, one.header.toLowerCase());
  }
  return out;
}

// [[spec/design_output/schema#the-three-places]]
function fieldsHeld(front, level) {
  const walk = entriesIn(front.steps, "steps");
  const holder = walk.find((one) => one.path === String(front.step ?? ""));
  if (!holder) return [];

  const deep = level + holder.path.split("/").length;
  const out = [];
  for (const field of [holder.said?.evidence ?? []].flat()) {
    if (!field?.name) continue;
    out.push([`${deep} ${field.name}`, `${field.name}, under ${holder.path}`]);
  }
  return out;
}

// [[spec/design_output/schema#the-three-places]]
export function refusedTicket(where, kind, found) {
  return [
    `The ${kind} door refuses this write to ${where}.`,
    "",
    ...found.map(
      (one) => `  ${where}:${one.line}:${one.column}  ${one.rule}\n    ${one.message}`,
    ),
    "",
    "A hand writes the ask of a draft, the fields of the step it holds, and the discussion.",
    "Everything else on a ticket is the engine's, and the pull writes it at the hand-back.",
  ].join("\n");
}

function said(places) {
  const names = [...places.values()];
  return names.length ? names.join(", ") : "nothing here";
}

function keyOf(one) {
  return `${one.level} ${one.header}`;
}

function same(one, two) {
  return JSON.stringify(one ?? null) === JSON.stringify(two ?? null);
}

function fault(rule, file, line, message) {
  return {
    file,
    rule: `Ticket.${nameOf(rule)}`,
    line,
    column: 1,
    message,
    severity: SEVERITY,
  };
}

function nameOf(said) {
  const parts = String(said)
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  if (parts.length === 1) return parts[0];
  return parts.map((one) => one[0].toUpperCase() + one.slice(1)).join("");
}
