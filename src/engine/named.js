// The ticket a write names, read off the tree: an open ticket under the public
// or the private folder, or the fault that stops the write and how to name one.
// [[spec/design_output/level0#a-write-names-its-ticket]]

import { join } from "node:path";
import { PATCH } from "../../.claude/skills/level0/lib/apply.js";
import { TICKETS as PRIVATE } from "../../.claude/skills/level0/lib/folders.js";
import { CLOSED, fieldOf, NOTE_END, TICKETS, ticketNamed } from "./group.js";

const STATE = "state";
const FOLDERS = [TICKETS, PRIVATE];
const WHERE = `its file name under ${TICKETS} or ${PRIVATE}, without ${NOTE_END}`;
const HEAD = /^([^\s:]+):/;

export const FIELD_HOW = `Name the open ticket this write serves in the ticket field: ${WHERE}.`;
export const MESSAGE_HOW = `Open the message with <ticket>:, where <ticket> names the open ticket this commit serves: ${WHERE}.`;
export const DESCRIPTION_HOW = `Open the description with <ticket>: what it does, where <ticket> names the open ticket this call serves: ${WHERE}.`;

// [[spec/design_output/level0#a-write-names-its-ticket]]
export function ticketFault(name, { disk, root }, how) {
  const said = ticketNamed(String(name ?? "").trim());
  if (!said) return `This write names no ticket. ${how}`;
  const text = FOLDERS.map((folder) =>
    readAt(disk, join(root, ...folder.split("/"), `${said}${NOTE_END}`)),
  ).find((one) => one !== null);
  if (text === undefined)
    return `No ticket named ${said} stands under ${FOLDERS.join(" or ")}. ${how}`;
  if (fieldOf(text, STATE) === CLOSED) return `${said} stands closed. ${how}`;
  return "";
}

// The ticket a commit message names at its head. [[spec/design_output/level0#a-write-names-its-ticket]]
export function ticketOf(message) {
  return HEAD.exec(String(message ?? "").trim())?.[1] ?? "";
}

// [[spec/design_output/level0#a-write-names-its-ticket]]
export function toolRefusal(tool) {
  return `${tool} carries no ticket field, so the door takes no write through it. Call mcp__level0__${PATCH}, with an exact op for one spot. ${FIELD_HOW}`;
}

function readAt(disk, path) {
  try {
    return String(disk.read(path));
  } catch {
    return null;
  }
}
