// The tickets the engine mints at a pull. Each stands in the hold alone,
// carries no file, and dies at its hand-back. The clear runs as three of them,
// and the context door marks the session due so the pull hands the first.
// [[spec/design_input/the-clear-hands-ephemeral-tickets]]

import { join } from "node:path";
import {
  DUE,
  HANDOVER,
  HOLDS,
  RETRO,
} from "../../.claude/skills/level0/lib/folders.js";

export const WRITE = "handover";
export const CLEAR = "clear";
export const READ = "read-handover";

// A path into the retro folder, with either slash. [[spec/design_output/stop#the-context-hands-over]]
export const RETRO_PATH = /\.se[\\/]\.retro[^\s`)|\]]*/;

// What each ticket asks, as the pull hands it out. [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
export const ASKS = {
  [WRITE]: [
    "The context passed context.handoverAt, and the ticket in hand stands done.",
    `Write ${HANDOVER}: what stands, what waits, and the ticket the queue hands next.`,
    `Name no file under ${RETRO}: the next retro reads that folder, and a hand does not.`,
    "Hand it back with ./RUNME.sh ticket pull --pass.",
  ],
  [CLEAR]: [
    "The handover stands. End the turn now, with no stop line of your own.",
    "Level zero clears the conversation at the turn's end, and closes this ticket there.",
  ],
  [READ]: [
    "Level zero cleared the conversation, and the handover block says where the work stands.",
    "Read it, then hand this back with ./RUNME.sh ticket pull --pass, and the queue hands the next step.",
  ],
};

// The hold an ephemeral ticket stands in: a name and a step, and no path. [[spec/design_input/the-clear-hands-ephemeral-tickets#an-ephemeral-ticket-stands-held]]
export function heldAs(name, hand, taken = "") {
  return {
    ticket: name,
    path: "",
    step: name,
    ephemeral: true,
    hand,
    taken,
    refused: 0,
    reads: [],
  };
}

export function isEphemeral(held) {
  return Boolean(held?.ephemeral);
}

function dueAt(root) {
  return join(root, ...DUE.split("/"));
}

// [[spec/design_input/the-clear-hands-ephemeral-tickets#the-ticket-ends-first]]
export function isDue(disk, root) {
  try {
    return disk.exists(dueAt(root));
  } catch {
    return false;
  }
}

export function marksDue(disk, root, said) {
  disk.makeDir?.(join(root, ...DUE.split("/").slice(0, -1)));
  disk.write(dueAt(root), `${JSON.stringify(said, null, 2)}\n`);
}

export function dropsDue(disk, root) {
  try {
    if (disk.exists(dueAt(root))) disk.remove(dueAt(root));
  } catch {}
}

export function retroIn(text) {
  const found = String(text ?? "").match(RETRO_PATH);
  return found ? found[0] : "";
}

// What keeps the handover ticket in hand: no file, an empty one, or one naming the retro folder. [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
export function handoverFault(disk, root) {
  const at = join(root, ...HANDOVER.split("/"));
  let text = "";
  try {
    text = disk.exists(at) ? String(disk.read(at)) : "";
  } catch {}
  if (!text.trim()) return `${HANDOVER} stands nowhere, or stands empty. Write it first.`;
  const retro = retroIn(text);
  if (retro)
    return `${HANDOVER} names ${retro}. Name the ticket or the class by its name, and take the path out.`;
  return "";
}

// Every hold on the box, read off the folder, one a hand. [[spec/design_output/pull#the-hand-and-the-hold]]
export function holdsIn(disk, root) {
  const folder = join(root, ...HOLDS.split("/"));
  let rows = [];
  try {
    rows = disk
      .list(folder)
      .filter((one) => one.kind === "file" && one.name.endsWith(".json"));
  } catch {
    return [];
  }
  const out = [];
  for (const one of rows) {
    const at = join(folder, one.name);
    try {
      out.push({ at, held: JSON.parse(String(disk.read(at))) });
    } catch {}
  }
  return out;
}
