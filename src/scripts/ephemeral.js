// The tickets the engine mints at a pull. Each stands in the hold alone,
// carries no file, and dies at its hand-back. The clear runs as a run of them,
// and the context door marks the session due so the pull hands the first.
// [[spec/design_input/the-clear-hands-ephemeral-tickets]]

import { join } from "node:path";
import { callOf } from "./tool-call.js";
import { cloudHere } from "../../.claude/skills/level0/lib/cloud.js";
import {
  DUE,
  HANDOVER,
  HOLDS,
  RETRO,
  RUN,
} from "../../.claude/skills/level0/lib/folders.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { stillHeld } from "../engine/named.js";

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
    // The owner's words travel as the owner said them. [[spec/tickets/the-owners-words-travel-verbatim]]
    "Quote the owner's words under The owner's words, as said, each with its session and transcript line.",
    `Name no file under ${RETRO}: the next retro reads that folder, and a hand does not.`,
    `Hand it back with ${callOf("ticket", "pull", ["--pass"])}.`,
  ],
  [CLEAR]: [
    "The handover stands. End the turn now, with no stop line of your own.",
    "Level zero clears the conversation at the turn's end, and closes this ticket there.",
  ],
  [READ]: [
    "Level zero cleared the conversation, and the handover block says where the work stands.",
    `Read it, then hand this back with ${callOf("ticket", "pull", ["--pass"])}, and the queue hands the next step.`,
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
  if (!text.trim())
    return `${HANDOVER} stands nowhere, or stands empty. Write it first.`;
  const retro = retroIn(text);
  if (retro)
    return `${HANDOVER} names ${retro}. Name the ticket or the class by its name, and take the path out.`;
  return "";
}

// The tip a cloud box stood on at its last handover, so the next one sees whether a commit landed between. [[spec/tickets/the-clear-carries-no-local-work]]
export const HANDOVER_TIP = `${RUN}/handover-tip.json`;

// A cloud box's handover refuses work that lives on the box alone, and a context that ends with nothing landed since the last handover, so a clear neither loses work nor loops. A desk's owner pushes by hand, so a desk meets neither rule. [[spec/tickets/the-clear-carries-no-local-work]]
export function localWorkFault(it) {
  if (!cloudHere(it)) return "";
  const said = (args) => it.git.run(args, true);
  const branch = String(said(["rev-parse", "--abbrev-ref", "HEAD"]).out ?? "").trim();
  const dirty = String(said(["status", "--porcelain", "--untracked-files=no"]).out ?? "")
    .split("\n")
    .map((row) => row.slice(3).trim())
    .filter((path) => path && !path.startsWith(".se/"));
  const upstream = said(["rev-list", "--count", `origin/${branch}..HEAD`]);
  const ahead = Number(
    String((upstream.ok ? upstream : said(["rev-list", "--count", `origin/${TRUNK}..HEAD`])).out ?? "0").trim(),
  );
  if (dirty.length || ahead > 0) {
    return [
      `This box holds work origin lacks: ${ahead} commit(s) not pushed${dirty.length ? `, and ${dirty.length} changed file(s) not committed` : ""}.`,
      `Commit and push ${branch} first. A red push to a work branch lands, and a clear keeps nothing that lives on this box alone.`,
    ].join(" ");
  }
  const tip = String(said(["rev-parse", "HEAD"]).out ?? "").trim();
  const at = join(it.root, ...HANDOVER_TIP.split("/"));
  let last = "";
  try {
    last = it.disk.exists(at) ? String(JSON.parse(it.disk.read(at)).tip ?? "") : "";
  } catch {}
  if (tip && last === tip) {
    return [
      `No commit has landed since the last handover (${tip.slice(0, 9)}), so a whole context passed with nothing pushed, and a clear would loop.`,
      "Say in the chat what blocks you, and end the turn. The coordinator reads the session.",
    ].join(" ");
  }
  return "";
}

// The tip the handover passed on, read by the next handover's check. [[spec/tickets/the-clear-carries-no-local-work]]
export function marksHandoverTip(it) {
  if (!cloudHere(it)) return;
  const tip = String(it.git.run(["rev-parse", "HEAD"], true).out ?? "").trim();
  if (tip) it.disk.write(join(it.root, ...HANDOVER_TIP.split("/")), JSON.stringify({ tip }));
}

// Every hold on the box whose ticket stands, read off the folder, one a hand. [[spec/design_output/pull#the-hand-and-the-hold]]
export function holdsIn(disk, root) {
  return holdFiles(disk, root).filter(({ held }) => stillHeld(disk, root, held));
}

// The pull alone removes a hold file, and only one whose ticket reads closed. [[spec/design_output/pull#the-hand-and-the-hold]]
export function dropsClosedHolds(disk, root) {
  for (const { at, held } of holdFiles(disk, root))
    if (!stillHeld(disk, root, held)) disk.remove(at);
}

function holdFiles(disk, root) {
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
