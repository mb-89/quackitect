// The projections. A projected file is written from its source and by nothing
// else, so the write door refuses a hand on it and names the source. A write
// to a source marks the projection stale, and the next event projects again
// before it is decided, so a rule changed in a schema reaches the next write.
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

// Every file a projection reads, so a write to one marks it stale.
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

// A write to a source marks the projections stale, and the next event freshens them.
export function marksStale(where, box) {
  if (box.sources?.has(where)) box.restale = where;
}

// After a tool ran, the sources are read again, and the first text that
// differs from the last read names the move. A batch of calls fires every
// hook before any tool runs, so a mark alone spends itself on the old file.
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
