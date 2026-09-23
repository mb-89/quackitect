// The projection doors: the owner door over a target, and the read after a
// tool ran that projects when a text moved. The reading stands in the engine.
// [[spec/design_output/projection#the-write-door-refuses-one]]

import { dirname, join } from "node:path";
import { inherits, rooted } from "../../.claude/skills/level0/lib/layer.js";
import { ownerOf, readAll, refusedWrite } from "../../.claude/skills/level0/lib/projection.js";
import { projectionsHere, sourcesOf } from "../engine/projection.js";

const AFTER_TOOL = "classic.PostToolUse";

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

// A source answers its time and its size under both roots, so a tool run reads no source whole. [[spec/design_output/projection#who-projects-and-when]]
function changedSource(box) {
  let moved = "";
  for (const path of box.sources ?? []) {
    const stamp = stampOf(box, path);
    if (box.sourceTexts.get(path) !== stamp) {
      if (box.sourceTexts.has(path)) moved = moved || path;
      box.sourceTexts.set(path, stamp);
    }
  }
  return moved;
}

function stampOf(box, path) {
  return [...new Set([box.method, box.work ?? box.method])]
    .map((root) => {
      const at = join(root, path);
      try {
        return `${box.disk.modified(at)}:${box.disk.size(at)}`;
      } catch {
        return "none";
      }
    })
    .join("|");
}

// Every target lands in the work root, because that is the tree a person opens. [[spec/design_output/vehicle#the-work-root-inherits]]
export function freshens(box, event = "") {
  const work = box.work ?? box.method;
  if (!box.projections) {
    box.projections = projectionsHere(box.disk, box.method);
    box.sources = sourcesOf(box.projections, box.disk, box.method, work);
    box.sourceTexts = new Map();
    box.restale = "a fresh box";
  }
  if (!box.restale && event !== AFTER_TOOL) return;
  const moved = box.restale || changedSource(box);
  box.restale = "";
  if (!moved) return;
  const at = (path) => join(work, path);
  const { wanted, standing } = readAll(
    box.projections ?? [],
    inherits(box.disk, box.method, work),
    rooted(box.disk, work),
  );
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
  box.log.say("info", "project", `${moved} moved, so ${wrote} file(s) follow`, {
    file: moved,
  });
}
