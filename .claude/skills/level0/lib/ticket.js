// The ticket door. A ticket takes a hand's writing in three places, and the rest
// of it belongs to the verbs. The schema says which field and which chapter, so
// this holds no list of its own.
// [[spec/design_output/schema#the-three-places]]

import { CHECKED, entriesIn, readNote } from "./schema.js";

export const SEVERITY = "error";
export const HAND = "hand";
export const ANSWERED = "answered:";

// [[spec/design_output/pull#the-private-queue]]
export function openPrivate(text) {
  const front = readNote(String(text ?? "")).front.said ?? {};
  if (String(front.state ?? "") !== "open") return false;
  const process = String(front.process ?? "").replace(/^\[\[|\]\]$/g, "");
  return process !== "note" && !process.endsWith("/note");
}

// The queue holds work for a desk where a free open ticket has a leaf a hand takes, or a group reads now. [[spec/design_output/stop#the-mechanical-checks]]
export function queueHolds(texts) {
  return (texts ?? []).some((text) => {
    const front = readNote(String(text ?? "")).front.said ?? {};
    if (String(front.state ?? "") !== "open") return false;
    const process = String(front.process ?? "").replace(/^\[\[|\]\]$/g, "");
    if (process === "group" || process.endsWith("/group")) return String(front.urgency ?? "") === "now";
    if (String(front.group ?? "").trim()) return false;
    const walk = entriesIn(front.steps, "steps");
    const step = String(front.step ?? "").trim();
    const leaf = step ? walk.find((one) => one.path === step) : walk.find((one) => !one.said?.steps);
    if (!leaf) return false;
    return !["person", "children", "helper"].includes(String(leaf.said?.by ?? ""));
  });
}

// [[spec/design_output/pull#the-group-holds-the-turn]]
export function heldGroup(text) {
  const front = readNote(String(text ?? "")).front.said ?? {};
  const last = [front.record ?? []]
    .flat()
    .filter((one) => one && typeof one === "object")
    .at(-1);
  if (String(front.state ?? "") === "closed") return false;
  return Boolean(last?.hash_before) && !last?.hash_after;
}

// [[spec/design_output/schema#the-three-places]]
export function ticketFaults(was, now, schema, where) {
  const note = readNote(now);
  const old = readNote(was);
  if (!old.front.stands) return engineFaults(note, schema, where);

  return [
    ...verbFaults(old, note, schema, where),
    ...placeFaults(old, note, schema, where),
    ...engineFaults(note, schema, where),
  ];
}

// [[spec/design_output/schema#the-record-draws-itself]]
export function engineRows(note, schema) {
  const front = note.front.said ?? {};
  const level = schema?.body?.headingLevel ?? 1;
  const walk = entriesIn(front.steps, "steps");
  const out = [];

  for (const one of [front.record ?? []].flat()) {
    const leaf = walk.find((held) => held.path === String(one?.step ?? ""));
    if (!leaf) continue;
    const deep = level + leaf.path.split("/").length - 1;
    out.push({ key: `${deep} ${leaf.name}`, said: leafRow(one) });
    for (const said of [one.answered ?? []].flat()) {
      if (!said?.name) continue;
      out.push({ key: `${deep + 1} ${said.name}`, said: answeredRow(said) });
    }
  }
  return out;
}

// [[spec/design_output/schema#the-record-draws-itself]]
function leafRow(one) {
  if (one.skipped) {
    return `The pull skips this leaf, because ${one.why ?? "its condition fails to hold"}.`;
  }
  const parts = [`The hand is \`${one.hand ?? "nobody"}\``];
  if (one.hash_before || one.hash_after) {
    parts.push(`the branch runs \`${one.hash_before ?? ""}\` to \`${one.hash_after ?? ""}\``);
  }
  parts.push(`this leaf returns ${one.returns ?? 0}`);
  return `${parts.join(", and ")}.`;
}

// [[spec/design_output/schema#the-record-draws-itself]]
function answeredRow(said) {
  return `${ANSWERED} exit \`${said.exit ?? ""}\`, and the last line reads \`${said.said ?? ""}\`.`;
}

// [[spec/design_output/schema#the-record-draws-itself]]
function engineFaults(note, schema, where) {
  const rows = new Map(engineRows(note, schema).map((one) => [one.key, one.said]));
  const out = [];

  for (const one of note.sections) {
    for (let i = 0; i < one.own.length; i++) {
      const said = String(one.own[i]).trim();
      if (!said.startsWith(ANSWERED)) continue;
      if (said === rows.get(keyOf(one))) continue;
      out.push(
        fault(
          one.header,
          where,
          one.line + i + 1,
          `An answered line is the engine's, and it draws what record says.`,
        ),
      );
    }
  }
  return out;
}

// [[spec/design_output/schema#the-verbs-own-their-fields]]
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

  // [[spec/design_output/schema#the-three-places]]
  const held = new Map(old.sections.map((one, i) => [nthKey(old.sections, i), one.own.join("\n")]));
  const out = [];

  for (const [i, one] of note.sections.entries()) {
    const key = keyOf(one);
    if (places.has(key)) continue;
    if (held.get(nthKey(note.sections, i)) === one.own.join("\n")) continue;
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
  // [[spec/design_output/pull#the-fields-hold-their-forms]]
  const parts = holder.path.split("/");
  const chain = parts.map((_, i) => walk.find((one) => one.path === parts.slice(0, i + 1).join("/")));
  if (chain.some((one) => [one?.said?.checklist ?? []].flat().some((it) => String(it ?? "").trim()))) {
    out.push([`${deep} ${CHECKED}`, `${CHECKED}, under ${holder.path}`]);
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
    "A hand writes the ask, the fields of the step it holds, and the discussion.",
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

function nthKey(sections, at) {
  const key = keyOf(sections[at]);
  const nth = sections.slice(0, at).filter((one) => keyOf(one) === key).length;
  return `${key} #${nth}`;
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
