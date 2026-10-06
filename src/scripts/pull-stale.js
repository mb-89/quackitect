// The stale read: a passed leaf keeps the hash of each input and of its own
// definition, and a pull marks the leaves whose hashes no longer match.
// [[spec/design_output/pull#an-input-marks-its-steps]]

import { hashText } from "../../.claude/skills/level0/lib/hash.js";
import {
  checkNote,
  hashOf,
  readNote,
  sectionAt,
} from "../../.claude/skills/level0/lib/schema.js";
import { reRouted } from "../../.claude/skills/level0/lib/schema-mint.js";
import {
  fieldOf,
  frontOf,
  OPEN,
  recordIn,
  withEntry,
  withField,
} from "../engine/group.js";
import { processAt } from "./process.js";
import { landedAlone } from "./pull-landed.js";
import { ENGINE, leafOf, leavesOf, stepPathOf, walkOf } from "./pull-route.js";
import { schemasHere, updated } from "./ticket.js";

const ASK = "ask";
const DIFF = "diff";
export const LINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;
const NOTE_END = ".md";
const COMMENT = /^\s*<!--.*-->\s*$/;

// The text of a chapter and every chapter under it, the guidance comments aside. The bless reads it too. [[spec/design_output/pull#an-input-marks-its-steps]]
export function chapterText(text, path) {
  const sections = readNote(String(text ?? "")).sections;
  const found = sectionAt(sections, path === ASK ? "Ask" : path);
  if (found < 0) return "";
  const level = sections[found].level;
  const rows = [];
  for (let i = found; i < sections.length; i++) {
    if (i > found && sections[i].level <= level) break;
    if (i > found) rows.push(`${"#".repeat(sections[i].level)} ${sections[i].header}`);
    rows.push(...sections[i].own.filter((row) => !COMMENT.test(row)));
  }
  return rows.join("\n").trim();
}

// The path an input name stands for: ask, a path, or a sibling's name. [[spec/design_output/pull#an-input-marks-its-steps]]
function pathOf(front, leaf, name) {
  if (name === ASK) return ASK;
  const parent = leaf.path.split("/").slice(0, -1).join("/");
  const walk = walkOf(front).map((one) => one.path);
  return (
    [name, parent ? `${parent}/${name}` : name].find((one) => walk.includes(one)) ?? ""
  );
}

const namesOf = (leaf) =>
  [leaf.said?.input ?? []]
    .flat()
    .map(String)
    .filter((one) => one && one !== DIFF);

function linksIn(said) {
  return [...said.matchAll(LINK)].map((found) => found[1].trim());
}

const TICKET = /^(spec|\.se)\/tickets\//;

// A linked ticket reads as its Ask, which no pass writes, so two tickets linking each other stale neither. [[spec/design_output/pull#ticket-links-read-the-ask]]
function noteHashes(it, asks) {
  const tickets = asks.filter((one) => TICKET.test(one.path));
  return {
    ...diskHashes(it, tickets, (text) => chapterText(text, ASK)),
    ...indexHashes(
      it,
      asks.filter((one) => !TICKET.test(one.path)),
    ),
  };
}

// The hash of each note, off the index, and off the disk where the index stands dead. [[spec/design_output/pull#an-input-marks-its-steps]]
function indexHashes(it, asks) {
  if (!asks.length) return {};
  const said = it.index?.ask?.("hashes", { asks });
  if (said && typeof said === "object") return said;
  return diskHashes(it, asks, (text) => text);
}

// [[spec/design_output/pull#an-input-marks-its-steps]]
function diskHashes(it, asks, read) {
  const out = {};
  for (const one of asks) {
    const at = it.join(it.root, ...one.path.split("/"));
    if (!it.disk.exists(at)) continue;
    const text = read(String(it.disk.read(at)));
    const size = Number(one.size ?? 0);
    out[one.path] = {
      hash: hashText(text),
      size: text.length,
      head: size > 0 && size <= text.length ? hashText(text.slice(0, size)) : "",
    };
  }
  return out;
}

const notePath = (link) => (link.includes(".") ? link : `${link}${NOTE_END}`);

// Each input the leaf reads, and each note an input chapter links: its name, its hash, and the size the hash reads. [[spec/design_output/pull#an-input-marks-its-steps]]
export function inputsOf(it, text, leaf) {
  const front = frontOf(text);
  const out = [];
  const links = new Set();
  for (const name of namesOf(leaf)) {
    const path = pathOf(front, leaf, name);
    if (!path) continue;
    const said = chapterText(text, path);
    out.push({ name: path, hash: hashText(said), size: said.length });
    for (const link of linksIn(said)) links.add(link);
  }
  const known = noteHashes(
    it,
    [...links].map((link) => ({ path: notePath(link), size: 0 })),
  );
  for (const link of links) {
    const one = known[notePath(link)];
    if (one) out.push({ name: `[[${link}]]`, hash: one.hash, size: one.size });
  }
  return out;
}

// [[spec/design_output/pull#an-input-marks-its-steps]]
export function defOf(_it, _text, leaf) {
  return hashOf(leaf?.said ?? {});
}

// The inputs whose text no longer opens with the text the hash read, so an append keeps a leaf whole. [[spec/design_output/pull#an-input-marks-its-steps]]
function movedOf(it, text, inputs) {
  const held = [inputs ?? []].flat().filter((one) => one?.name);
  const notes = held.filter((one) => String(one.name).startsWith("[["));
  const known = noteHashes(
    it,
    notes.map((one) => ({
      path: notePath(String(one.name).slice(2, -2)),
      size: Number(one.size),
    })),
  );
  return held
    .filter((one) => {
      const hash = String(one.hash ?? "");
      const size = Number(one.size ?? 0);
      if (String(one.name).startsWith("[[")) {
        const now = known[notePath(String(one.name).slice(2, -2))];
        return !now || (now.hash !== hash && now.head !== hash);
      }
      const said = chapterText(text, String(one.name));
      return said.length < size || hashText(said.slice(0, size)) !== hash;
    })
    .map((one) => String(one.name));
}

const lastOf = (text, path) =>
  recordIn(text)
    .filter((one) => String(one.step) === path && !one.skipped)
    .at(-1);

// A ticket whose process moved takes the new route, and a moved definition at or before the step takes the step. [[spec/design_output/pull#an-input-marks-its-steps]]
function processRead(it, one) {
  const named = fieldOf(one.text, "process");
  if (!named) return;
  const held = processAt(it.disk, it.method ?? it.root, it.join, named);
  const front = frontOf(one.text);
  if (held.why || String(front.process_hash ?? "") === held.hash) return;
  const fresh = walkOf({ steps: held.route });
  // A route that strands the step or a leaf the record names waits for ticket update, where a hand reads the drift. [[spec/design_output/pull#an-input-marks-its-steps]]
  const stands = new Set(fresh.filter((each) => each.leaf).map((each) => each.path));
  const reached = [
    stepPathOf(front),
    ...recordIn(one.text).map((entry) => String(entry.step)),
  ];
  if (reached.some((path) => !stands.has(path))) return;
  const leaves = leavesOf(front);
  const now = leaves.findIndex((leaf) => leaf.path === stepPathOf(front));
  const moved = leaves.slice(0, Math.max(now, 0) + 1).find((leaf) => {
    const def = lastOf(one.text, leaf.path)?.def;
    if (!def) return false;
    const there = fresh.find((each) => each.path === leaf.path && each.leaf);
    return !there || hashOf(there.said) !== String(def);
  });
  const route = moved ? { steps: held.route } : updated(front, held.route);
  if (route.why) return;
  const schema = schemasHere(it).get("ticket");
  let text = reRouted(one.text, schema, route.steps, held.hash, it.front);
  if (moved) text = withField(text, "step", moved.path, it.front);
  if (schema && checkNote(text, schema, one.path, schemasHere(it)).length) return;
  one.text = text;
  one.front = frontOf(text);
  landedAlone(it, one, [
    moved
      ? `takes ${held.name} again, and goes back to ${moved.path}`
      : `takes ${held.name} again`,
  ]);
}

// Every leaf before the step whose inputs moved takes a stale entry, and the first takes the step. [[spec/design_output/pull#an-input-marks-its-steps]]
function inputRead(it, one) {
  const front = frontOf(one.text);
  const leaves = leavesOf(front);
  const now = leaves.findIndex((leaf) => leaf.path === stepPathOf(front));
  const stale = [];
  for (const leaf of leaves.slice(0, Math.max(now, 0))) {
    const last = lastOf(one.text, leaf.path);
    if (!last?.def || last.stale) continue;
    const moved = movedOf(it, one.text, last.inputs);
    if (moved.length) stale.push({ path: leaf.path, moved });
  }
  if (!stale.length) return;
  let text = one.text;
  for (const leaf of stale)
    text = withEntry(
      text,
      { step: leaf.path, hand: ENGINE, stale: leaf.moved.join(", ") },
      it.front,
    );
  text = withField(text, "step", stale[0].path, it.front);
  one.text = text;
  one.front = frontOf(text);
  landedAlone(it, one, [
    `marks ${stale.map((leaf) => leaf.path).join(", ")} stale, and goes back to ${stale[0].path}`,
  ]);
}

// [[spec/design_output/pull#an-input-marks-its-steps]]
export function staleRead(it, one) {
  if (
    fieldOf(one.text, "state") !== OPEN ||
    !leafOf(one.front ?? frontOf(one.text), stepPathOf(frontOf(one.text)))
  )
    return one;
  processRead(it, one);
  inputRead(it, one);
  return one;
}
