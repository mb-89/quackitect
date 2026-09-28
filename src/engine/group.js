// A group, read off its ticket. A group is a ticket carrying the group route, and
// its branch is the claim on it, so the record says who holds it and the note says
// where it stands. Everything here reads or writes that one note.
// [[spec/design_output/work#a-group-is-a-ticket]]

import { NOTE_END, PUBLIC_TICKETS } from "../../.claude/skills/level0/lib/folders.js";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";

// The folders the plugin owns, under the names the engine reads. [[spec/design_output/level0#a-write-names-its-ticket]]
export const TICKETS = PUBLIC_TICKETS;
export { NOTE_END };
export const WORK_BRANCH = "work/";
export const GROUP = "group";
export const OPEN = "open";
export const CLOSED = "closed";
export const DRAFT = "draft";
// The one mark a hand reads before it takes the next thing. [[spec/design_output/work#the-mark-and-what-waits]]
export const URGENT = "urgent";

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

// [[spec/design_output/work#the-mark-and-what-waits]]
export function urgent(text) {
  return fieldOf(text, URGENT) === "true";
}

// The todo a front carries: nothing, `first` where it stands as a bare tag, or the name of the row it stands before. [[spec/design_output/pull#the-queue-is-an-outline]]
export function todoOf(front) {
  const said = front?.todo;
  if (said === undefined || said === null || said === false || String(said) === "false")
    return "";
  if (said === true || String(said).trim() === "true") return "first";
  return String(said).trim();
}

// The tickets one waits for, a list or one line, with the branch prefix dropped. [[spec/design_output/work#the-mark-and-what-waits]]
export function dependsOn(front) {
  return [front?.depends_on ?? []]
    .flat()
    .flatMap((one) => String(one).split(","))
    .map((one) =>
      one
        .trim()
        .replace(/^\[|\]$/g, "")
        .replace(/^["']|["']$/g, "")
        .trim(),
    )
    .filter(Boolean);
}

// A draft on the trivial route takes no person: the pull opens it, and an agent works it. [[spec/design_output/pull#a-draft-opens]]
export function agentOpens(text) {
  return (
    Boolean(text) &&
    fieldOf(text, "state") === DRAFT &&
    fieldOf(text, "process").split("/").pop() === TRIVIAL
  );
}

const TRIVIAL = "trivial";

// [[spec/design_output/work#a-group-is-a-ticket]]
export function isGroup(text) {
  // The mint links the process by its path, and a hand by its name. [[spec/design_output/work#a-group-is-a-ticket]]
  return Boolean(text) && fieldOf(text, "process").split("/").pop() === GROUP;
}

// The group tickets over this one, nearest first, walked up `group` through the texts by name. A loop stops the walk. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
export function ancestorsOf(text, texts) {
  const out = [];
  const seen = new Set();
  let name = fieldOf(text, GROUP);
  while (name && !seen.has(name) && isGroup(texts.get(name))) {
    seen.add(name);
    out.push({ name, text: texts.get(name) });
    name = fieldOf(texts.get(name), GROUP);
  }
  return out;
}

// The groups some group names under `group`, which reach no worker. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
export function parentsIn(texts) {
  const out = new Set();
  for (const text of texts)
    if (isGroup(text) && fieldOf(text, GROUP)) out.add(fieldOf(text, GROUP));
  return out;
}

// [[spec/design_output/work#the-take-writes-the-record]]
export function recordIn(text) {
  return [frontOf(text).record ?? []]
    .flat()
    .filter((one) => one && typeof one === "object");
}

// [[spec/design_output/work#held-derives-from-the-record]]
export function heldIn(text) {
  const held = recordIn(text)
    .filter((one) => one.hash_before && !one.hash_after)
    .at(-1);
  if (!held) return null;
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

// The four writers hand the note to the front door, which se-front answers. [[spec/tickets/go-writes-the-frontmatter]]
// [[spec/design_output/work#the-take-writes-the-record]]
export function withEntry(text, entry, front) {
  return front.entry(text, entry);
}

// The row heldIn reads as open takes hash_after: hash_before set, hash_after empty. [[spec/design_output/work#held-derives-from-the-record]]
export function withHashAfter(text, after, front) {
  return front.after(text, after);
}

// A merge keeping two boxes' rows leaves two takes open, and a release closes each, so the group reads free. [[spec/design_output/work#held-derives-from-the-record]]
export function withEveryTakeClosed(text, after, front) {
  let said = text;
  while (heldIn(said)) {
    const next = withHashAfter(said, after, front);
    if (next === said) break;
    said = next;
  }
  return said;
}

// [[spec/design_output/work#a-box-leaves]]
export function withField(text, key, value, front) {
  return front.set(text, key, value);
}

// [[spec/design_output/work#the-merge-frees-the-tickets]]
export function withoutField(text, key, front) {
  return front.drop(text, key);
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

function bare(said) {
  return String(said ?? "")
    .trim()
    .replace(/^\[\[|\]\]$/g, "")
    .trim();
}
