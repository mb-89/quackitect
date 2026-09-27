// The size cap. One answer of the pull reaches the model whole, so a hand-out
// past the cap less its margin splits at a line, the hold carries the rest,
// and the next pull on the same step prints it.
// [[spec/design_input/level-two#the-size-cap]]

import { asOf, writeHold } from "./guidance-hand.js";

const bytes = (text) => Buffer.byteLength(String(text ?? ""), "utf8");

// The line closing a part, which names the pull printing the rest. [[spec/design_input/level-two#the-size-cap]]
export function runsOn(it, held) {
  const as = asOf(it, held);
  return `\n\nThe hand-out runs on past the cap: run ./RUNME.sh ticket pull${as ? ` --as ${as}` : ""} again for the rest.`;
}

// The bytes a part holds with its closing line, and 0 where no cap stands, so nothing splits. [[spec/design_input/level-two#the-size-cap]]
export function roomOf(it, held) {
  const cap = Number(it?.cap?.bytes) || 0;
  if (!cap) return 0;
  return Math.max(1, cap - (Number(it.cap.margin) || 0) - bytes(runsOn(it, held)));
}

// The text whole where it fits in room, and else the lines that fit and the rest. A first line longer than room cuts at the last character inside it. [[spec/design_input/level-two#the-size-cap]]
export function partOf(text, room) {
  const said = String(text ?? "");
  if (!room || bytes(said) <= room) return { head: said, rest: "" };
  const rows = said.split("\n");
  const head = [];
  let used = 0;
  for (const row of rows) {
    const size = bytes(row) + 1;
    if (used + size > room) break;
    head.push(row);
    used += size;
  }
  if (head.length)
    return { head: head.join("\n"), rest: rows.slice(head.length).join("\n") };
  const cut = charsIn(rows[0], room);
  return { head: rows[0].slice(0, cut), rest: said.slice(cut) };
}

// The characters of a line that fit in room bytes, so a cut splits no character. [[spec/design_input/level-two#the-size-cap]]
function charsIn(row, room) {
  let used = 0;
  let at = 0;
  for (const one of row) {
    const size = bytes(one);
    if (used + size > room) break;
    used += size;
    at += one.length;
  }
  return Math.max(at, 1);
}

// A refusal past the room keeps its head, and a closing line names the verb printing the notes whole. [[spec/design_input/level-two#the-size-cap]]
export function cutRefusal(it, text, more) {
  const { head, rest } = partOf(text, Math.max(0, roomOf(it) - bytes(`\n${more}`)));
  return rest ? `${head}\n${more}` : head;
}

// Prints the part that fits, and writes what stays into the hold. [[spec/design_input/level-two#the-size-cap]]
export function printPart(it, hold, text) {
  const { head, rest } = partOf(text, roomOf(it, hold));
  const { rest: _was, ...kept } = hold;
  writeHold(it, hold.hand, rest ? { ...kept, rest } : kept);
  console.log(rest ? `${head}${runsOn(it, hold)}` : head);
  return 0;
}
