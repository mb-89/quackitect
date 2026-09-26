// The ticket door. A ticket takes a hand's writing where its schema says, and
// the rest of it belongs to the verbs, so this holds no list of its own.
// [[spec/design_output/schema#the-three-places]]

import { CHECKED, entriesIn, readNote } from "./schema.js";

export const SEVERITY = "error";
export const HAND = "hand";
export const ANSWERED = "answered:";
export const GROUP = "group";
// The chapter a hand fills at the mint, and the rule refusing a child's name in it. [[spec/design_output/work#a-group-is-a-ticket]]
const ASK = "Ask";
const RESTATED = "restated";

// The branch a group lands on carries the group's name under this. [[spec/design_output/work#a-group-is-a-ticket]]
const BRANCH = "work/";

// Whether a hand works a leaf, answered once so the pull and the write door agree by construction. [[spec/tickets/the-one-answer-takes-shape]]
// The conditions naming a step the owner alone answers. [[spec/tickets/the-owners-words-travel-verbatim]]
const OWNERS = ["view", "handed"];

export function writesHere(leaf, hand = {}) {
  const by = String(leaf?.by ?? "anyone");
  const at = String(leaf?.path ?? "");
  const no = (why, more = {}) => ({ writes: false, why, ...more });

  // A cloud box answers every question it meets, so a person's step stands open to it. [[spec/guidance/cloud]]
  // The owner's view and the owner's read are the owner's alone, on the cloud too. [[spec/tickets/the-owner-view-decides-done]]
  const cloud = hand.cloud && !OWNERS.includes(String(leaf?.when ?? ""));
  if (by === "person" && hand.agent && !hand.ownerSays && !cloud)
    return no(`waits for a person at ${at}`, { person: true });
  if (by === "agent" && !hand.agent) return no(`waits for an agent at ${at}`);
  // The hand the engine spawns takes it, and the caller says whether this hand is that one. [[spec/design_output/pull#a-hand-of-its-own]]
  if (by === "helper" && !hand.helper)
    return no(`waits for a hand the engine spawns at ${at}`);
  if (by === "children") return no(`waits for its own children at ${at}`);
  if (by === "retro" && !hand.atRetro)
    return no(`waits for a hand at a retro step, at ${at}`);
  return { writes: true, why: "" };
}

// [[spec/design_output/pull#the-private-queue]]
export function openPrivate(text) {
  const front = readNote(String(text ?? "")).front.said ?? {};
  return String(front.state ?? "") === "open" && !onNoteRoute(text);
}

// A note keeps a thing for the retro, so it stands off the queue and carries no turn. [[spec/design_output/pull#the-private-queue]]
export function onNoteRoute(text) {
  const front = readNote(String(text ?? "")).front.said ?? {};
  const process = String(front.process ?? "").replace(/^\[\[|\]\]$/g, "");
  return process === "note" || process.endsWith("/note");
}

// The queue holds work for a desk where a free open ticket has a leaf a hand takes, or a group carries the mark. [[spec/design_output/stop#the-mechanical-checks]]
export function queueHolds(texts) {
  return (texts ?? []).some((text) => {
    const front = readNote(String(text ?? "")).front.said ?? {};
    if (String(front.state ?? "") !== "open") return false;
    const process = String(front.process ?? "").replace(/^\[\[|\]\]$/g, "");
    if (process === "group" || process.endsWith("/group"))
      return String(front.urgent ?? "") === "true";
    if (String(front.group ?? "").trim()) return false;
    const by = leafBy(text);
    if (by === null) return false;
    return !["person", "children", "helper"].includes(by);
  });
}

// Who takes the leaf a ticket's pointer names, or its first leaf where no pointer stands. Null where no leaf stands. [[spec/tickets/the-stop-reads-the-state]]
export function leafBy(text) {
  const front = readNote(String(text ?? "")).front.said ?? {};
  const walk = entriesIn(front.steps, "steps");
  const step = String(front.step ?? "").trim();
  const leaf = step
    ? walk.find((one) => one.path === step)
    : walk.find((one) => !one.said?.steps);
  return leaf ? String(leaf.said?.by ?? "") : null;
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
export function ticketFaults(was, now, schema, where, kids = []) {
  const note = readNote(now);
  const old = readNote(was);
  if (!old.front.stands)
    return [
      ...engineFaults(note, schema, where),
      ...groupFaults(note, where),
      ...askFaults(note, where, kids),
    ];

  return [
    ...verbFaults(old, note, schema, where),
    ...placeFaults(old, note, schema, where),
    ...engineFaults(note, schema, where),
    ...groupFaults(note, where),
    ...askFaults(note, where, kids),
  ];
}

// A group's children stand under it already, so an ask naming one says it twice, and the copy in prose is the one that rots. [[spec/design_output/work#a-group-is-a-ticket]]
function askFaults(note, where, kids) {
  const ask = note.sections.find((one) => one.level === 1 && one.header.trim() === ASK);
  if (!ask || !kids.length) return [];
  const out = [];
  ask.own.forEach((line, at) => {
    const named = kids.find((kid) => kid && line.includes(kid));
    if (!named) return;
    out.push(
      fault(
        RESTATED,
        where,
        ask.line + at + 1,
        `the ask names ${named}, which stands under the group already. Cut the name, and let the children say it.`,
      ),
    );
  });
  return out;
}

// A group is a ticket, and its own name is the spelling the pull reads. A child naming the branch instead stands outside every group, and its group closes over it. [[spec/design_output/work#a-group-is-a-ticket]]
function groupFaults(note, where) {
  const said = String(note.front.said?.[GROUP] ?? "").trim();
  if (!said.startsWith(BRANCH)) return [];
  return [
    fault(
      GROUP,
      where,
      note.front.lines?.[GROUP] ?? 1,
      `${GROUP} names the group's own ticket, so write ${said.slice(BRANCH.length)} in place of ${said}.`,
    ),
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
    parts.push(
      `the branch runs \`${one.hash_before ?? ""}\` to \`${one.hash_after ?? ""}\``,
    );
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

// A field the engine owns comes back to the value the disk holds, and the rest of the write lands. The answer names each field put back. [[spec/design_output/schema#the-verbs-own-their-fields]]
export function restoredFields(was, now, schema) {
  const old = readNote(was);
  const note = readNote(now);
  if (!old.front.stands || !note.front.stands) return { text: now, keys: [] };
  const keys = Object.entries(schema?.frontmatter?.properties ?? {})
    .filter(([, rule]) => rule?.["x-engine"])
    .filter(([key]) => !same(old.front.said?.[key], note.front.said?.[key]))
    .map(([key]) => key);
  if (!keys.length) return { text: now, keys };
  const held = frontBlocks(String(was).split("\n"));
  let rows = String(now).split("\n");
  for (const key of keys) rows = withBlock(rows, key, held.blocks.get(key) ?? []);
  return { text: rows.join("\n"), keys };
}

const TOP_KEY = /^([A-Za-z_][\w-]*):/;
const FENCE = "---";

// Each top-level key of the frontmatter with its rows, the indented ones under it included. [[spec/design_output/schema#the-verbs-own-their-fields]]
function frontBlocks(rows) {
  const blocks = new Map();
  const at = new Map();
  if (rows[0]?.trimEnd() !== FENCE) return { blocks, at, close: -1 };
  const close = rows.findIndex((row, i) => i > 0 && row.trimEnd() === FENCE);
  let key = "";
  for (let i = 1; i < close; i++) {
    const found = TOP_KEY.exec(rows[i]);
    if (found) {
      key = found[1];
      blocks.set(key, []);
      at.set(key, i);
    }
    if (key) blocks.get(key).push(rows[i]);
  }
  return { blocks, at, close };
}

// The rows with one key's block swapped for the disk's, taken out where the disk holds none, and put back before the fence where the write took it out. [[spec/design_output/schema#the-verbs-own-their-fields]]
function withBlock(rows, key, block) {
  const now = frontBlocks(rows);
  if (now.close < 0) return rows;
  const out = [...rows];
  if (now.at.has(key))
    out.splice(now.at.get(key), now.blocks.get(key).length, ...block);
  else out.splice(now.close, 0, ...block);
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
  const held = new Map(
    old.sections.map((one, i) => [nthKey(old.sections, i), one.own.join("\n")]),
  );
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
  // A ticket with no step stands at its first leaf, the way the pull reads it. [[spec/design_output/schema#the-three-places]]
  const step = String(front.step ?? "").trim();
  const holder = step
    ? walk.find((one) => one.path === step)
    : walk.find((one) => one.leaf);
  if (!holder) return [];

  const deep = level + holder.path.split("/").length;
  const out = [];
  for (const field of [holder.said?.evidence ?? []].flat()) {
    if (!field?.name) continue;
    out.push([`${deep} ${field.name}`, `${field.name}, under ${holder.path}`]);
  }
  // [[spec/design_output/pull#the-fields-hold-their-forms]]
  const parts = holder.path.split("/");
  const chain = parts.map((_, i) =>
    walk.find((one) => one.path === parts.slice(0, i + 1).join("/")),
  );
  if (
    chain.some((one) =>
      [one?.said?.checklist ?? []].flat().some((it) => String(it ?? "").trim()),
    )
  ) {
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
