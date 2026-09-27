// The ticket a write names, read off the tree: an open ticket under the public
// or the private folder, or the fault that stops the write and how to name one.
// [[spec/design_output/level0#a-write-names-its-ticket]]

import { join } from "node:path";
import { PATCH, TICKET_WHERE as WHERE } from "../../.claude/skills/level0/lib/apply.js";
import { HOLDS, TICKETS as PRIVATE } from "../../.claude/skills/level0/lib/folders.js";
import { PLANS } from "../../.claude/skills/level0/lib/runs.js";
import { CLOSED, fieldOf, NOTE_END, TICKETS, ticketNamed } from "./group.js";

const STATE = "state";
const FOLDERS = [TICKETS, PRIVATE];
const HEAD = /^([^\s:]+):/;

export const FIELD_HOW = `Name the open ticket this write serves in the ticket field: ${WHERE}.`;
export const MESSAGE_HOW = `Open the message with <ticket>:, where <ticket> names the open ticket this commit serves: ${WHERE}.`;
export const DESCRIPTION_HOW = `Open the description with <ticket>: what it does, where <ticket> names the open ticket this call serves: ${WHERE}.`;

// [[spec/design_output/level0#a-write-names-its-ticket]]
export function ticketFault(name, { disk, root }, how) {
  const raw = String(name ?? "").trim();
  const said = ticketNamed(raw);
  if (!said) return `This write names no ticket. ${how}`;
  // A write names what stands in hand: a held ticket, an ephemeral one among them, or the plan's working todo. [[spec/tickets/the-todo-joins-the-queue]] [[spec/tickets/the-door-passes-ephemeral-holds]]
  const hand = inHand({ disk, root });
  if (hand.tickets.includes(said) || (hand.todo && raw === hand.todo)) return "";
  if (hand.tickets.length || hand.todo)
    return `${said} stands outside what is in hand. ${handLine(hand)} ${how}`;
  // With nothing in hand, any open ticket passes, so a commit by hand still lands. [[spec/tickets/the-open-road-stays-named]]
  const text = FOLDERS.map((folder) =>
    readAt(disk, join(root, ...folder.split("/"), `${said}${NOTE_END}`)),
  ).find((one) => one !== null);
  if (text === undefined)
    return `No ticket named ${said} stands under ${FOLDERS.join(" or ")}. ${how}`;
  if (fieldOf(text, STATE) === CLOSED) return `${said} stands closed. ${how}`;
  return "";
}

// What stands in hand on the box: every ticket a hold names, one a hand, and the plan's working todo. Every hand writes through the same door, so a helper's hold passes its own ticket. [[spec/tickets/the-door-picks-a-hold]] [[spec/tickets/the-hand-reads-plans-here]]
export function inHand({ disk, root }) {
  const folder = join(root, ...HOLDS.split("/"));
  const tickets = [];
  let rows = [];
  try {
    rows = disk.list(folder).filter((one) => one.name.endsWith(".json"));
  } catch {}
  for (const one of rows) {
    const held = parsedAt(disk, join(folder, one.name));
    const ticket = String(held?.ticket ?? "").trim();
    if (ticket && !tickets.includes(ticket)) tickets.push(ticket);
  }
  const plan = parsedAt(disk, join(root, ...PLANS.split("/")));
  return { tickets, todo: String(plan?.working ?? "").trim() };
}

function handLine(hand) {
  const said = [];
  if (hand.tickets.length) said.push(`In hand: ${hand.tickets.join(", ")}.`);
  if (hand.todo) said.push(`The working todo: ${hand.todo}.`);
  return said.join(" ");
}

function parsedAt(disk, path) {
  try {
    return JSON.parse(String(disk.read(path)));
  } catch {
    return null;
  }
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
