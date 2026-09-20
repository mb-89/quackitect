// The mark a file carries: the hash of the text the agent last saw in it. A
// read sets the mark, a write meets it, and a write over a disk the mark
// disagrees with comes back refused.
// [[spec/design_output/level0#a-write-meets-its-mark]]

import { hashText } from "./hash.js";

export function marked(held, where, text) {
  held.set(String(where), hashText(String(text ?? "")));
  return held;
}

export function agrees(held, where, onDisk) {
  return held.get(String(where)) === hashText(String(onDisk ?? ""));
}

// [[spec/design_output/level0#a-write-meets-its-mark]]
export function staleFault(held, where, onDisk) {
  if (onDisk === null || onDisk === undefined) return "";
  if (agrees(held, where, onDisk)) return "";
  return refusedStale(where, held.has(String(where)));
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
