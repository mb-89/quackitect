// The projection: the files the tree writes off its sources, the owner door
// over a target, and the read after a tool ran that projects when a text moved.
// [[spec/design_output/projection#the-write-door-refuses-one]]

import { dirname, join } from "node:path";

const AFTER_TOOL = "classic.PostToolUse";
import {
  alsoReads,
  entriesIn,
  ownerOf,
  PROJECTIONS,
  readAll,
  readsOf,
  refusedWrite,
} from "../../.claude/skills/level0/lib/projection.js";

export function projectionsHere(disk, method) {
  const at = join(method, PROJECTIONS);
  return disk.exists(at) ? entriesIn(disk.read(at)) : [];
}

export function sourcesOf(entries, disk, method) {
  const out = new Set();
  for (const entry of entries) {
    const texts = new Map();
    for (const path of readsOf(entry)) {
      out.add(path);
      if (disk.exists(join(method, path))) texts.set(path, disk.read(join(method, path)));
    }
    for (const path of alsoReads(entry, texts)) out.add(path);
  }
  return out;
}

// [[spec/design_output/projection#the-write-door-refuses-one]]
export function ownerDoor(e, _writing, where, box) {
  const owner = ownerOf(box.projections ?? [], where);
  if (!owner) return "";
  box.log.say("warn", "project", `refused a write to ${where}`, {
    file: where,
    tool: String(e.tool),
    detail: owner.name ?? owner.target,
  });
  return refusedWrite(owner, where);
}

export function marksStale(where, box) {
  if (box.sources?.has(where)) box.restale = where;
}

function changedSource(box) {
  let moved = "";
  for (const path of box.sources ?? []) {
    const at = join(box.method, path);
    const text = box.disk.exists(at) ? String(box.disk.read(at)) : "";
    if (box.sourceTexts.get(path) !== text) {
      if (box.sourceTexts.has(path)) moved = moved || path;
      box.sourceTexts.set(path, text);
    }
  }
  return moved;
}

export function freshens(box, event = "") {
  if (!box.projections) {
    box.projections = projectionsHere(box.disk, box.method);
    box.sources = sourcesOf(box.projections, box.disk, box.method);
    box.sourceTexts = new Map();
    box.restale = "a fresh box";
  }
  if (!box.restale && event !== AFTER_TOOL) return;
  const moved = box.restale || changedSource(box);
  box.restale = "";
  if (!moved) return;
  const at = (path) => join(box.method, path);
  const { wanted, standing } = readAll(box.projections ?? [], box.disk, at);
  let wrote = 0;
  for (const [path, text] of wanted) {
    if (standing.get(path) === text) continue;
    box.disk.makeDir(dirname(at(path)));
    box.disk.write(at(path), text);
    wrote += 1;
  }
  for (const path of standing.keys()) {
    if (!wanted.has(path)) box.disk.remove(at(path));
  }
  box.log.say("info", "project", `${moved} moved, so ${wrote} file(s) follow`, { file: moved });
}
