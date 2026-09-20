// The guidance a hand holds with its step. The hold remembers each note by
// name and hash, the log takes a row per note, and a refusal, a compaction or
// a moved hash hands them again.
// [[spec/design_output/pull#the-work-answer]]

import {
  HOLD as OWNED_HOLD,
  HOLDS as OWNED_HOLDS,
} from "../../.claude/skills/level0/lib/folders.js";

import { actionables, bindsHere } from "../../.claude/skills/level0/lib/guidance.js";
import { inherits } from "../../.claude/skills/level0/lib/layer.js";
import { hashOf } from "../../.claude/skills/level0/lib/schema.js";
import { agentOf, BOX, handOf } from "./pull-hand-of.js";

export const HOLDS = OWNED_HOLDS;
export const HOLD = OWNED_HOLD;
export const GUIDANCE = "spec/guidance";
const MARKDOWN = /\.md$/;
const DRAFT = /^_/;

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function holdAt(it, hand) {
  const slug = String(hand).replace(/[^A-Za-z0-9]+/g, "-");
  return it.join(it.root, ...`${HOLDS}/${slug}.json`.split("/"));
}

export function holdOf(it, hand) {
  const at = holdAt(it, hand);
  return it.disk.exists(at) ? parsed(it.disk.read(at)) : null;
}

// Whether any hand holds a step on this box, out of the folder and the older file alike. [[spec/design_output/pull#the-hand-and-the-hold]]
export function holdsAnywhere(it) {
  const folder = it.join(it.root, ...HOLDS.split("/"));
  const rows = it.disk.exists(folder)
    ? it.disk
        .list(folder)
        .filter((one) => one.kind === "file" && one.name.endsWith(".json"))
        .map((one) => it.join(folder, one.name))
    : [];
  for (const at of [...rows, it.join(it.root, ...HOLD.split("/"))]) {
    if (!it.disk.exists(at)) continue;
    const held = parsed(it.disk.read(at));
    if (held) return { at, held };
  }
  return null;
}

export function parsed(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function writeHold(it, hand, hold) {
  it.disk.makeDir(it.join(it.root, ...HOLDS.split("/")));
  it.disk.write(holdAt(it, hand), `${JSON.stringify(hold, null, 2)}\n`);
}

export function dropHold(it, hand) {
  const at = holdAt(it, hand);
  if (it.disk.exists(at)) it.disk.remove(at);
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
// A note the work root names again replaces the method's. [[spec/design_output/vehicle#the-work-root-inherits]]
export function guidanceText(it, path) {
  const reads = inherits(it.disk, it.method ?? it.root, it.root);
  return reads.exists(`${path}.md`) ? reads.read(`${path}.md`) : "";
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
export function readsOf(it, paths) {
  return [...paths].map((path) => ({
    name: path,
    hash: hashOf(guidanceText(it, path)),
  }));
}

// [[spec/design_output/log#which-door-says-what]]
export function noteRows(it, step, reads) {
  if (!it.log) return;
  for (const one of reads) {
    it.log.say("info", "work", `guidance ${one.name} rides ${step}`, {
      note: one.name,
      hash: one.hash,
      step,
    });
  }
}

// A refusal, a compaction and a moved hash each hand the notes again, and nothing else does. [[spec/design_output/pull#the-hand-and-the-hold]]
export function handsAgain(held, now) {
  if (!now.length) return "";
  if (Number(held?.refused ?? 0) > 0) return "refused";
  const was = held?.reads;
  if (!Array.isArray(was) || !was.length) return "compacted";
  const held_ = new Map(was.map((one) => [one.name, one.hash]));
  const moved = now.find((one) => held_.get(one.name) !== one.hash);
  return moved ? "moved" : "";
}

// A hand names itself with --as, and every verb reading the hold reads it the same way. [[spec/design_output/pull#the-hand-and-the-hold]]
export function asIn(argv) {
  const rest = [...(argv ?? [])].map(String);
  const at = rest.indexOf("--as");
  if (at >= 0) return String(rest[at + 1] ?? "").trim();
  const inline = rest.find((one) => one.startsWith("--as="));
  return inline ? inline.slice("--as=".length).trim() : "";
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function handHere(it, argv = []) {
  const as = asIn(argv);
  return as ? `${handOf(it)} · ${as}` : handOf(it);
}

// The as a hold was taken under, read back off the hand it names. [[spec/design_output/pull#the-hand-and-the-hold]]
export function asOf(it, held) {
  const mine = `${handOf(it)} · `;
  const hand = String(held?.hand ?? "");
  return hand.startsWith(mine) ? hand.slice(mine.length) : "";
}

// The same answer for a road holding no doors of its own: a box standing nowhere answers an empty list, so a session start mints nothing. [[spec/design_output/level0#the-standing-layer]]
export function heldReadsIn(disk, join, root, env = {}, argv = []) {
  const it = { disk, join, root, env, agent: Boolean(agentOf(env)) };
  if (!disk.exists(join(root, ...BOX.split("/")))) return [];
  try {
    return heldReads(it, argv);
  } catch {
    return [];
  }
}

// A note the held step reads leaves the standing layer. [[spec/design_output/level0#the-standing-layer]]
export function heldReads(it, argv = []) {
  const held = holdOf(it, handHere(it, argv));
  return (held?.reads ?? []).map((one) => one.name);
}

// [[spec/design_output/pull#what-a-hand-out-reads]]
export function notesSaid(it, paths) {
  const rows = [];
  for (const path of paths) {
    const items = actionables(guidanceText(it, path));
    if (!items.length) continue;
    rows.push("", `Reads ${path}:`);
    for (const [i, item] of items.entries()) rows.push(`  ${i + 1}. ${item}`);
  }
  return rows;
}

// [[spec/design_output/level0#the-standing-layer]]
export function alwaysOn(it, env = {}) {
  const at = it.join(it.root, ...GUIDANCE.split("/"));
  if (!it.disk.exists(at)) return [];
  return namesUnder(it, at, GUIDANCE).filter((path) =>
    bindsHere(guidanceText(it, path), env),
  );
}

function namesUnder(it, at, path) {
  const out = [];
  for (const one of it.disk.list(at)) {
    if (one.kind === "dir") {
      out.push(...namesUnder(it, it.join(at, one.name), `${path}/${one.name}`));
      continue;
    }
    if (!MARKDOWN.test(one.name) || DRAFT.test(one.name)) continue;
    out.push(`${path}/${one.name.replace(MARKDOWN, "")}`);
  }
  return out;
}
