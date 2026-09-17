// The guidance a hand holds with its step. The hold remembers each note by
// name and hash, the log takes a row per note, and a refusal, a compaction or
// a moved hash hands them again.
// [[spec/design_output/pull#the-work-answer]]

import { actionables, bindsHere } from "../../.claude/skills/level0/lib/guidance.js";
import { hashOf } from "../../.claude/skills/level0/lib/schema.js";
import { handOf } from "./hand.js";

export const HOLDS = ".se/hold";
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
export function guidanceText(it, path) {
  const at = it.join(it.root, ...`${path}.md`.split("/"));
  return it.disk.exists(at) ? it.disk.read(at) : "";
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

// A note the held step reads leaves the standing layer. [[spec/design_output/level0#the-standing-layer]]
export function heldReads(it) {
  const held = holdOf(it, handOf(it));
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
