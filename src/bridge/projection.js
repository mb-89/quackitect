// The projections. A projected file is written from its source and by nothing
// else, so the write door refuses a hand on it and names the source. A write
// to a source marks the projection stale, and the next event projects again
// before it is decided, so a rule changed in a schema reaches the next write.
// [[spec/design_output/projection#the-write-door-refuses-one]]

import { dirname, join } from "node:path";
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

export function freshens(box) {
  if (!box.restale) return;
  const moved = box.restale;
  box.restale = "";
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
