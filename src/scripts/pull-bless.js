// The bless: a gate carrying `bless: true` waits after its verdict, and a
// bless binds to the hash of what it blesses, so an edit strips it.
// [[spec/design_output/pull#the-bless]]

import { cloudHere } from "../../.claude/skills/level0/lib/cloud.js";
import { inRun } from "../../.claude/skills/level0/lib/folders.js";
import { hashOf } from "../../.claude/skills/level0/lib/schema.js";
import { frontOf, recordIn, withEntry, withField } from "../engine/group.js";
import { chapterOf } from "./pull-chapter.js";
import { agentOf, handOf, roleOf } from "./pull-hand-of.js";
import { landedAlone } from "./pull-landed.js";
import { leafOf, leavesOf, REFUSED, say, stepPathOf, walkOf } from "./pull-route.js";
import { stepOn } from "./pull-writes.js";

export const BLESS_FILE = inRun("bless.json");
const HASH = 16;
const ENTRY = /^\s*- /;

// What a door says to an agent reaching the bless file. [[spec/design_output/pull#the-bless]]
export function blessRefusal() {
  return `${BLESS_FILE} is the owner's word on who blesses, and the sidebar button alone writes it. An agent reads and writes it nowhere.`;
}

// [[spec/design_output/pull#the-bless]]
export function asksBless(leaf) {
  return Boolean(leaf?.gate) && leaf.said?.bless === true;
}

// The gate's own chapter, then the chapter of each leaf under its input. [[spec/design_output/pull#the-bless]]
export function hashText(text, leaf) {
  const inputs = [leaf.said?.input ?? []].flat().map(String);
  const under = walkOf(frontOf(text))
    .filter((one) => one.leaf)
    .map((one) => one.path)
    .filter((path) =>
      inputs.some((input) => path === input || path.startsWith(`${input}/`)),
    );
  const read = [leaf.path, ...under].map((path) => {
    const chapter = chapterOf(text, path);
    return [path, chapter.own, [...chapter.fields]];
  });
  return hashOf(JSON.stringify(read)).slice(0, HASH);
}

const blessedEntry = (entry) => Boolean(String(entry.blessed ?? "").trim());
const verdictEntry = (entry) =>
  !blessedEntry(entry) &&
  !entry.skipped &&
  !entry.returns &&
  !(entry.hash_before && !entry.hash_after);

// Whether a bless matching what the gate reads now follows its last verdict. [[spec/design_output/pull#the-bless]]
export function blessedAt(text, leaf) {
  const mine = recordIn(text).filter((entry) => String(entry.step) === leaf.path);
  const verdict = mine.findLastIndex(verdictEntry);
  const hash = hashText(text, leaf);
  const blessed = mine.findLastIndex(
    (entry) => blessedEntry(entry) && String(entry.blessed).trim() === hash,
  );
  return verdict >= 0 && blessed > verdict;
}

// The gate holds a verdict as the last word on it, and no bless yet. [[spec/design_output/pull#the-bless]]
export function waitsBless(text, leaf) {
  if (!asksBless(leaf)) return false;
  const last = recordIn(text)
    .filter((entry) => String(entry.step) === leaf.path && !blessedEntry(entry))
    .at(-1);
  return Boolean(last) && verdictEntry(last) && !blessedAt(text, leaf);
}

// Every bless whose hash no longer matches what it blesses drops from the record. [[spec/design_output/pull#the-bless]]
export function blessKept(text) {
  let kept = text;
  const front = frontOf(text);
  for (const entry of recordIn(text).filter(blessedEntry)) {
    const leaf = leafOf(front, String(entry.step));
    const hash = String(entry.blessed).trim();
    if (!leaf || hashText(text, leaf) !== hash) kept = withoutBlessed(kept, hash);
  }
  return kept;
}

// The record entry carrying this bless leaves the front matter whole. [[spec/design_output/pull#the-bless]]
function withoutBlessed(text, hash) {
  const rows = text.split("\n");
  const at = rows.findIndex((row) => row.trim() === `blessed: ${hash}`);
  if (at < 0) return text;
  let start = at;
  while (start > 0 && !ENTRY.test(rows[start])) start--;
  const indent = rows[start].search(/\S/);
  let end = at + 1;
  while (end < rows.length && rows[end].search(/\S/) > indent) end++;
  rows.splice(start, end - start);
  return rows.join("\n");
}

// A step past a bless gate whose bless fails its hash goes back to the gate. [[spec/design_output/pull#the-bless]]
export function blessHolds(it, one) {
  const front = frontOf(one.text);
  const leaves = leavesOf(front);
  const now = leaves.findIndex((leaf) => leaf.path === stepPathOf(front));
  const kept = blessKept(one.text);
  for (const found of leaves.slice(0, Math.max(now, 0))) {
    const gate = leafOf(front, found.path);
    if (!asksBless(gate)) continue;
    const mine = recordIn(kept).filter((entry) => String(entry.step) === gate.path);
    if (!mine.some(verdictEntry) || blessedAt(kept, gate)) continue;
    one.text = withField(kept, "step", gate.path, it.front);
    one.front = frontOf(one.text);
    landedAlone(it, one, [
      `waits at ${gate.path} again, because an edit strips its bless`,
    ]);
    return one;
  }
  return one;
}

// Why the hand-out passes a gate waiting for its bless, or nothing. [[spec/design_output/pull#the-bless]]
export function blessWait(one, leaf) {
  return waitsBless(one.text, leaf)
    ? `waits at ${leaf.path} for a bless: ./RUNME.sh ticket bless ${one.name}`
    : "";
}

// A person blesses anywhere, an agent on a cloud box, and an agent at a desk where the bless file says so. [[spec/design_output/pull#the-bless]]
function mayBless(it) {
  const agent = Boolean(it.agent) || Boolean(agentOf(it.env));
  if (!agent || cloudHere(it)) return "";
  const at = it.join(it.root, ...BLESS_FILE.split("/"));
  let said = {};
  try {
    said = it.disk.exists(at) ? JSON.parse(it.disk.read(at)) : {};
  } catch {
    said = {};
  }
  return said?.agent === true
    ? ""
    : `an agent at a desk blesses where ${BLESS_FILE} holds agent true, and the sidebar button writes it.`;
}

// [[spec/design_output/pull#the-bless]]
export function bless(it, at, name) {
  if (!at) {
    say(REFUSED, [`${name || "nothing"} names no ticket, so nothing blesses.`]);
    return 2;
  }
  const one = { name: String(name), path: at.said, at: at.path };
  one.text = it.disk.read(at.path);
  one.front = frontOf(one.text);
  const leaf = leafOf(one.front, stepPathOf(one.front));
  if (!asksBless(leaf)) {
    say(REFUSED, [
      `${one.name} stands at ${leaf?.path || "no step"}, which asks no bless.`,
    ]);
    return 1;
  }
  if (!waitsBless(one.text, leaf)) {
    say(REFUSED, [`${one.name} at ${leaf.path} holds no verdict to bless yet.`]);
    return 1;
  }
  const refusal = mayBless(it);
  if (refusal) {
    say(REFUSED, [refusal]);
    return 1;
  }
  const changes = [`blesses ${leaf.path}`];
  const text = withEntry(
    one.text,
    { step: leaf.path, hand: roleOf(handOf(it)), blessed: hashText(one.text, leaf) },
    it.front,
  );
  one.text = stepOn(it, one, leaf, text, changes);
  const finding = landedAlone(it, one, changes);
  if (finding) {
    say(REFUSED, [finding]);
    return 1;
  }
  console.log(`${one.name} ${changes.join(", ")}.`);
  return 0;
}
