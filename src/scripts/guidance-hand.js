// The guidance a hand holds with its step. The hold remembers each note by
// name and hash, the log takes a row per note, and a refusal, a compaction or
// a moved hash hands them again.
// [[spec/design_output/pull#the-work-answer]]

import {
  HOLD as OWNED_HOLD,
  HOLDS as OWNED_HOLDS,
} from "../../.claude/skills/level0/lib/folders.js";

import {
  actionables,
  bindsHere,
  envOf,
  listOf,
  parse,
  rulesOf,
} from "../../.claude/skills/level0/lib/guidance.js";
import { inherits } from "../../.claude/skills/level0/lib/layer.js";
import { carriedIn } from "../../.claude/skills/level0/lib/tested.js";
import { hashOf, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { agentOf, BOX, handOf } from "./pull-hand-of.js";
import { leafOf, leavesOf } from "./pull-route.js";

export const HOLDS = OWNED_HOLDS;
export const HOLD = OWNED_HOLD;
export const GUIDANCE = "spec/guidance";
export const PROCESSES = "spec/processes";
const YAML = /\.yaml$/;
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
  return everyHold(it)[0] ?? null;
}

// Every hold on this box, one a hand, because several hands work one box. [[spec/design_output/pull#the-hand-and-the-hold]]
export function everyHold(it) {
  const folder = it.join(it.root, ...HOLDS.split("/"));
  const rows = it.disk.exists(folder)
    ? it.disk
        .list(folder)
        .filter((one) => one.kind === "file" && one.name.endsWith(".json"))
        .map((one) => it.join(folder, one.name))
    : [];
  const out = [];
  for (const at of [...rows, it.join(it.root, ...HOLD.split("/"))]) {
    if (!it.disk.exists(at)) continue;
    const held = parsed(it.disk.read(at));
    if (held) out.push({ at, held });
  }
  return out;
}

// The tests every held ticket's command lines carry, which the commit door counts beside the staged ones. [[spec/design_output/tree#the-rules-over-two-files]]
export function heldTests(it) {
  const out = new Set();
  for (const { held } of everyHold(it)) {
    if (!held?.path) continue;
    const at = it.join(it.root, ...String(held.path).split("/"));
    if (!it.disk.exists(at)) continue;
    for (const one of carriedIn(it.disk.read(at))) out.add(one);
  }
  return [...out];
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

// [[spec/design_output/log#which-kind-says-what]]
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

// Each note stands as a section: a heading naming it, its rules numbered as the note numbers them, then its Examples table. [[spec/design_input/level-two#guidance]]
export function notesSaid(it, paths) {
  const rows = [];
  for (const path of paths) {
    const text = guidanceText(it, path);
    if (!actionables(text).length) continue;
    rows.push("", `# Reads ${path}`, "", ...rulesOf(text));
  }
  return rows;
}

// The notes a leaf's tags resolve, then any a ticket minted before the tags still names under reads. [[spec/design_input/level-two#guidance]]
export function readsFor(it, leaf, env = it.env ?? {}) {
  if (!leaf) return [];
  const found = resolved(it, leaf.tags, env);
  return [...found, ...leaf.reads.filter((one) => !found.includes(one))];
}

// A note under a subfolder carries a tag for each folder on its path, then the tags its frontmatter names. A note at the top carries none, since it rides the output style. [[spec/design_input/level-two#guidance]]
export function tagsOf(it, path) {
  const folders = String(path)
    .slice(GUIDANCE.length + 1)
    .split("/")
    .slice(0, -1);
  if (!folders.length) return [];
  const own = listOf(parse(guidanceText(it, path)).front.tags);
  return [...new Set([...folders, ...own])];
}

// Every note under a subfolder whose tags all stand among the step's, where its env binds here. A note binding an env reaches every step where it binds, since its env picks the hand. [[spec/tickets/cloud-note-reaches-every-step]]
export function resolved(it, tags, env = {}) {
  const at = it.join(it.root, ...GUIDANCE.split("/"));
  if (!it.disk.exists(at)) return [];
  const has = new Set([tags ?? []].flat().map(String));
  return underFolders(it, at)
    .filter(
      (path) =>
        envOf(guidanceText(it, path)).length ||
        tagsOf(it, path).every((one) => has.has(one)),
    )
    .filter((path) => bindsHere(guidanceText(it, path), env))
    .sort();
}

// Every note under a subfolder whose tags no leaf of any process carries whole. A note binding an env reaches every leaf where it binds, so it stands reached. [[spec/tickets/cloud-note-reaches-every-step]]
export function unreached(it) {
  const at = it.join(it.root, ...GUIDANCE.split("/"));
  if (!it.disk.exists(at)) return [];
  const leaves = everyLeafTags(it);
  return underFolders(it, at)
    .filter((path) => !envOf(guidanceText(it, path)).length)
    .filter(
      (path) => !leaves.some((has) => tagsOf(it, path).every((one) => has.has(one))),
    )
    .sort();
}

function everyLeafTags(it) {
  const at = it.join(it.root, ...PROCESSES.split("/"));
  if (!it.disk.exists(at)) return [];
  const out = [];
  for (const one of it.disk.list(at)) {
    if (one.kind !== "file" || !YAML.test(one.name)) continue;
    const front = {
      steps: readYaml(String(it.disk.read(it.join(at, one.name)))).steps,
    };
    for (const leaf of leavesOf(front))
      out.push(new Set(leafOf(front, leaf.path).tags));
  }
  return out;
}

// The notes under a subfolder, since a note at the top rides the output style and resolves by no tag. [[spec/design_input/level-two#guidance]]
function underFolders(it, at) {
  const depth = GUIDANCE.split("/").length + 1;
  return namesUnder(it, at, GUIDANCE).filter((path) => path.split("/").length > depth);
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
