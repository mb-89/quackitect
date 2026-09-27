// The three-way merge of a ticket's front, off the note reader: a key one side
// changes takes that side, and the record takes the entries each side appends.
// A key both sides change apart stays for a hand.
// [[spec/design_output/work#a-conflicted-front-resolves-itself]]

import { readNote } from "../../.claude/skills/level0/lib/schema.js";

const RECORD = "record";
const CLASH = Symbol("clash");
const NOTHING = { order: [], blocks: new Map(), head: [], body: "" };

// The merged note, or the keys a hand decides. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
export function mergedFront(base, ours, theirs) {
  const was = base ? partsOf(base) : NOTHING;
  const mine = partsOf(ours);
  const trunk = partsOf(theirs);
  if (!was || !mine || !trunk) return { clash: ["the front"] };
  const body = picked(was.body, mine.body, trunk.body);
  if (body === CLASH) return { clash: ["the text past the front"] };

  const clash = [];
  const rows = new Map();
  for (const key of orderOf(mine.order, trunk.order)) {
    const [b, o, t] = [was, mine, trunk].map((one) => one.blocks.get(key));
    const took = keyMerged(key, b, o, t);
    if (took === CLASH) clash.push(key);
    else if (took) rows.set(key, took);
  }
  if (clash.length) return { clash };
  const front = [...mine.head, ...[...rows.values()].flat()];
  return { text: [...front, body].join("\n") };
}

// A side changing a key alone takes it, and the record joins what both append. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
function keyMerged(key, b, o, t) {
  if (same(o, t)) return o?.rows;
  if (same(o, b)) return t?.rows;
  if (same(t, b)) return o?.rows;
  if (key === RECORD) return recordMerged(b, o, t);
  return CLASH;
}

// The base's entries, then the branch's, then trunk's, so each side's order holds. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
function recordMerged(b, o, t) {
  const was = b?.entries ?? [];
  if (!o?.entries || !t?.entries) return CLASH;
  const kept = (side) => was.every((one, at) => same(one, side.entries[at]));
  if (!kept(o) || !kept(t)) return CLASH;
  return [
    ...o.header,
    ...o.entries.flatMap((one) => one.rows),
    ...t.entries.slice(was.length).flatMap((one) => one.rows),
  ];
}

function picked(was, mine, trunk) {
  if (mine === trunk || trunk === was) return mine;
  if (mine === was) return trunk;
  return CLASH;
}

function same(a, b) {
  return keyOf(a) === keyOf(b);
}

function keyOf(one) {
  return one ? JSON.stringify(one.value) : undefined;
}

// The branch's order, with each key trunk alone holds after the key it follows there. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
function orderOf(mine, trunk) {
  const out = [...mine];
  trunk.forEach((key, at) => {
    if (out.includes(key)) return;
    const before = trunk
      .slice(0, at)
      .reverse()
      .find((one) => out.includes(one));
    out.splice(before === undefined ? 0 : out.indexOf(before) + 1, 0, key);
  });
  return out;
}

// The note cut at its keys: the fence, each key's rows and value, the record's entries, and the text from the closing fence on. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
function partsOf(text) {
  const front = readNote(text).front;
  if (!front.stands) return null;
  const rows = String(text).split("\n");
  const close = rows.findIndex((line, at) => at > 0 && line.trim() === "---");
  const order = Object.keys(front.said).sort((a, b) => front.lines[a] - front.lines[b]);
  const starts = order.map((key) => front.lines[key] - 1);
  const blocks = new Map();
  order.forEach((key, at) => {
    const from = starts[at];
    const to = starts[at + 1] ?? close;
    const value = front.said[key];
    blocks.set(key, {
      value,
      rows: rows.slice(from, to),
      ...(key === RECORD && Array.isArray(value)
        ? entriesOf(rows, front.lines, from, to, value)
        : {}),
    });
  });
  return {
    order,
    blocks,
    head: rows.slice(0, starts[0] ?? close),
    body: rows.slice(close).join("\n"),
  };
}

function entriesOf(rows, lines, from, to, value) {
  const starts = value.map((_, at) => lines[`${RECORD}[${at}]`] - 1);
  return {
    header: rows.slice(from, starts[0] ?? to),
    entries: value.map((one, at) => ({
      value: one,
      rows: rows.slice(starts[at], starts[at + 1] ?? to),
    })),
  };
}
