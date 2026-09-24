// The mark a file carries: the hash of the text the agent last saw in it, and
// the line spans a partial read handed back. A read sets the mark, a write
// meets it, and a write over a disk the mark disagrees with comes back refused.
// [[spec/design_output/level0#a-write-meets-its-mark]]

import { hashText } from "./hash.js";

const LINE = "\n";

// A whole read replaces the spans. [[spec/design_output/level0#a-write-meets-its-mark]]
export function marked(held, where, text) {
  held.set(String(where), { hash: hashText(String(text ?? "")), spans: [] });
  return held;
}

// A partial read adds a span beside the whole hash. [[spec/design_output/level0#the-mark-holds-line-spans]]
export function spanned(held, where, text, from, to) {
  const lines = String(text ?? "").split(LINE);
  const first = Math.max(1, Math.floor(Number(from) || 1));
  const last = Math.min(linesIn(text), Math.floor(Number(to) || first));
  if (last < first) return held;
  const was = held.get(String(where)) ?? { hash: "", spans: [] };
  const span = { from: first, to: last, hash: spanHash(lines, first, last) };
  const spans = was.spans.filter((one) => one.from !== first || one.to !== last);
  held.set(String(where), { hash: was.hash, spans: [...spans, span] });
  return held;
}

// The lines a text holds, where a closing line end opens no line. [[spec/design_output/level0#the-mark-holds-line-spans]]
export function linesIn(text) {
  const said = String(text ?? "");
  if (!said) return 0;
  const count = said.split(LINE).length;
  return said.endsWith(LINE) ? count - 1 : count;
}

export function agrees(held, where, onDisk) {
  return held.get(String(where))?.hash === hashText(String(onDisk ?? ""));
}

// A Write passes `after` as null, so it asks for the whole mark. [[spec/design_output/level0#a-write-meets-its-mark]]
export function staleFault(held, where, onDisk, after = null) {
  if (onDisk === null || onDisk === undefined) return "";
  if (agrees(held, where, onDisk)) return "";
  if (after !== null && insideSpan(held.get(String(where)), onDisk, after)) return "";
  return refusedStale(where, held.has(String(where)));
}

// [[spec/design_output/level0#the-mark-holds-line-spans]]
function insideSpan(mark, onDisk, after) {
  const lines = String(onDisk).split(LINE);
  const moved = changedLines(lines, String(after).split(LINE));
  return (mark?.spans ?? []).some(
    (one) =>
      one.from <= moved.from &&
      one.to >= moved.to &&
      spanHash(lines, one.from, one.to) === one.hash,
  );
}

// The lines a write changes come off the common head and tail of the two texts. [[spec/design_output/level0#the-mark-holds-line-spans]]
function changedLines(was, now) {
  const most = Math.min(was.length, now.length);
  let head = 0;
  while (head < most && was[head] === now[head]) head++;
  let tail = 0;
  while (
    tail < most - head &&
    was[was.length - 1 - tail] === now[now.length - 1 - tail]
  )
    tail++;
  const from = head + 1;
  return { from, to: Math.max(from, was.length - tail) };
}

function spanHash(lines, from, to) {
  return hashText(lines.slice(from - 1, to).join(LINE));
}

// The marks as the runtime file holds them, one key a path in path order. [[spec/design_output/level0#the-marks-survive-a-restart]]
export function marksText(held) {
  const out = {};
  for (const where of [...held.keys()].sort()) out[where] = held.get(where);
  return `${JSON.stringify(out)}\n`;
}

// A file that reads as no marks leaves the box with none. [[spec/design_output/level0#the-marks-survive-a-restart]]
export function marksFrom(text) {
  const held = new Map();
  let read = {};
  try {
    read = JSON.parse(String(text ?? "")) ?? {};
  } catch {
    return held;
  }
  for (const [where, one] of Object.entries(read)) {
    if (typeof one?.hash !== "string") continue;
    const spans = [one.spans ?? []].flat().filter((span) => typeof span?.hash === "string");
    held.set(where, { hash: one.hash, spans });
  }
  return held;
}

// [[spec/design_output/level0#a-write-meets-its-mark]]
export function refusedStale(where, read) {
  const why = read
    ? `${where} moved on the disk after you read it.`
    : `${where} stands on the disk, and this hand has read none of it.`;
  return [
    `The write door refuses this write to ${where}.`,
    "",
    `  ${why}`,
    "",
    `Read ${where}, and write what you mean over what stands there now.`,
  ].join("\n");
}
