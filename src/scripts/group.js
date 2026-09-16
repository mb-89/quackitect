// A group, read off its ticket. A group is a ticket carrying the group route, and
// its branch is the claim on it, so the record says who holds it and the note says
// where it stands. Everything here reads or writes that one note.
// [[spec/design_output/work#a-group-is-a-ticket]]

import { readNote } from "../../.claude/skills/level0/lib/schema.js";

export const TICKETS = "spec/tickets";
export const NOTE_END = ".md";
export const WORK_BRANCH = "work/";
export const GROUP = "group";
export const OPEN = "open";
export const CLOSED = "closed";

// [[spec/design_output/work#a-stale-group-is-yours]]
export const STALE = "12h";

const SPAN = /^(\d+)\s*([mhd])$/;
const SPANS = { m: 60, h: 3600, d: 86400 };

export function ticketNamed(path) {
  const bare = path.endsWith(NOTE_END) ? path.slice(0, -NOTE_END.length) : path;
  return bare.slice(bare.lastIndexOf("/") + 1);
}

export function ticketAt(name) {
  return `${TICKETS}/${name}${NOTE_END}`;
}

// [[spec/design_output/work#a-group-is-a-ticket]]
export function frontOf(text) {
  return readNote(String(text ?? "")).front.said ?? {};
}

export function fieldOf(text, key) {
  const said = frontOf(text)[key];
  return said === undefined || said === null ? "" : bare(said);
}

// [[spec/design_output/work#a-group-is-a-ticket]]
export function isGroup(text) {
  // The mint links the process by its path, and a hand by its name. [[spec/design_output/work#a-group-is-a-ticket]]
  return Boolean(text) && fieldOf(text, "process").split("/").pop() === GROUP;
}

// [[spec/design_output/work#the-take-writes-the-record]]
export function recordIn(text) {
  return [frontOf(text).record ?? []]
    .flat()
    .filter((one) => one && typeof one === "object");
}

// [[spec/design_output/work#held-derives-from-the-record]]
export function heldIn(text) {
  const held = recordIn(text).at(-1);
  if (!held?.hash_before || held.hash_after) return null;
  return {
    step: bare(held.step ?? ""),
    hand: bare(held.hand ?? ""),
    hash_before: bare(held.hash_before),
  };
}

// [[spec/design_output/work#a-group-is-a-ticket]]
export function firstLeaf(steps, path = "") {
  const one = [steps ?? []].flat()[0];
  if (!one?.name) return path;
  const deeper = path ? `${path}/${one.name}` : String(one.name);
  return one.steps ? firstLeaf(one.steps, deeper) : deeper;
}

// [[spec/design_output/work#the-take-writes-the-record]]
export function stepOf(text) {
  const front = frontOf(text);
  return bare(front.step ?? "") || firstLeaf(front.steps);
}

// [[spec/design_output/work#a-group-is-a-ticket]]
export function askOf(text) {
  const said = readNote(String(text ?? "")).sections.find(
    (one) => one.header.toLowerCase() === "ask",
  );
  return said ? said.own.join("\n").trim() : "";
}

// [[spec/design_output/work#the-take-writes-the-record]]
export function withEntry(text, entry) {
  const rows = String(text ?? "").split("\n");
  const shut = frontShut(rows);
  if (shut < 0) return rows.join("\n");

  const item = entryRows(entry);
  if (!item.length) return rows.join("\n");

  const opens = keyAt(rows, shut, "record");
  if (opens < 0) {
    rows.splice(shut, 0, "record:", ...item);
    return rows.join("\n");
  }
  rows.splice(blockEnd(rows, opens, shut), 0, ...item);
  return rows.join("\n");
}

// [[spec/design_output/work#a-box-leaves]]
export function withHashAfter(text, after) {
  const rows = String(text ?? "").split("\n");
  const shut = frontShut(rows);
  const opens = shut < 0 ? -1 : keyAt(rows, shut, "record");
  if (opens < 0) return rows.join("\n");

  const ends = blockEnd(rows, opens, shut);
  let last = -1;
  for (let at = opens + 1; at < ends; at++) if (rows[at].startsWith("  - ")) last = at;
  if (last < 0) return rows.join("\n");

  for (let at = last; at < ends; at++) {
    if (/^\s+hash_after:/.test(rows[at])) {
      rows[at] = `    hash_after: ${after}`;
      return rows.join("\n");
    }
  }
  rows.splice(ends, 0, `    hash_after: ${after}`);
  return rows.join("\n");
}

// [[spec/design_output/work#a-box-leaves]]
export function withField(text, key, value) {
  const rows = String(text ?? "").split("\n");
  const shut = frontShut(rows);
  if (shut < 0) return rows.join("\n");

  const at = keyAt(rows, shut, key);
  if (at < 0) rows.splice(shut, 0, `${key}: ${value}`);
  else rows[at] = `${key}: ${value}`;
  return rows.join("\n");
}

// [[spec/design_output/work#the-merge-frees-the-tickets]]
export function withoutField(text, key) {
  const rows = String(text ?? "").split("\n");
  const shut = frontShut(rows);
  const at = shut < 0 ? -1 : keyAt(rows, shut, key);
  if (at < 0) return rows.join("\n");

  rows.splice(at, blockEnd(rows, at, shut) - at);
  return rows.join("\n");
}

// [[spec/design_output/work#a-stale-group-is-yours]]
export function spanOf(said) {
  const found = SPAN.exec(String(said ?? "").trim());
  return found ? Number(found[1]) * SPANS[found[2]] : 0;
}

// [[spec/design_output/work#a-stale-group-is-yours]]
export function aged(seconds) {
  const held = Math.max(0, Math.floor(Number(seconds) || 0));
  if (held >= SPANS.d) return `${Math.floor(held / SPANS.d)}d`;
  if (held >= SPANS.h) return `${Math.floor(held / SPANS.h)}h`;
  return `${Math.floor(held / SPANS.m)}m`;
}

// [[spec/design_output/pull#the-record-holds-the-answers]]
function entryRows(entry) {
  const out = [];
  for (const [key, said] of Object.entries(entry)) {
    if (said === undefined || said === null || String(said) === "" || (Array.isArray(said) && !said.length)) continue;
    const lead = out.length ? "    " : "  - ";
    if (!Array.isArray(said)) {
      out.push(`${lead}${key}: ${said}`);
      continue;
    }
    out.push(`${lead}${key}:`);
    for (const one of said) {
      const pairs = Object.entries(one ?? {}).filter(([, value]) => value !== undefined && value !== null);
      for (const [at, [name, value]] of pairs.entries()) {
        out.push(`${at ? "        " : "      - "}${name}: ${value}`);
      }
    }
  }
  return out;
}

function frontShut(rows) {
  if (rows[0]?.trim() !== "---") return -1;
  return rows.findIndex((one, at) => at > 0 && one.trim() === "---");
}

function keyAt(rows, shut, key) {
  for (let at = 1; at < shut; at++) {
    if (rows[at] === `${key}:` || rows[at].startsWith(`${key}: `)) return at;
  }
  return -1;
}

function blockEnd(rows, opens, shut) {
  let at = opens + 1;
  while (at < shut && (rows[at].startsWith(" ") || !rows[at].trim())) at++;
  return at;
}

function bare(said) {
  return String(said ?? "")
    .trim()
    .replace(/^\[\[|\]\]$/g, "")
    .trim();
}
