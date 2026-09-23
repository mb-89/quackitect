// The caches a box holds over files of the tree: the words, the paragraph
// schema, the stop rules and the note schemas. Each drops where a tool run
// moves a file it stands on, and a session start drops them all.
// [[spec/design_output/level0#a-cache-follows-its-file]]

import { join } from "node:path";
import { pathsOf } from "../../.claude/skills/level0/lib/vocabulary.js";

const AFTER_TOOL = "classic.PostToolUse";
const PARAGRAPH = "spec/schemas/paragraph.schema.yaml";
const RULES = "spec/config/stop";
const SCHEMAS = "spec/schemas";

// Each cache and the files it stands on, under the method root. [[spec/design_output/level0#a-cache-follows-its-file]]
const HELD = [
  { keys: ["paragraphSchema", "words"], files: () => [PARAGRAPH] },
  { keys: ["words"], files: (box) => Object.values(pathsOf(box.paragraphSchema)) },
  { keys: ["stopRules"], folder: RULES },
  { keys: ["schemas"], folder: SCHEMAS },
];

// A tool run is the one moment a file moves, so the stamps are read then, and a file that moved drops the caches on it. [[spec/design_output/level0#a-cache-follows-its-file]]
export function dropsMoved(box, event = "") {
  if (!box.cacheStamps) {
    box.cacheStamps = stampsOf(box);
    return [];
  }
  if (event !== AFTER_TOOL) return [];
  const now = stampsOf(box);
  const dropped = [];
  HELD.forEach((one, at) => {
    if (now[at] === box.cacheStamps[at]) return;
    for (const key of one.keys) {
      if (box[key] === undefined) continue;
      box[key] = undefined;
      dropped.push(key);
    }
  });
  box.cacheStamps = now;
  return dropped;
}

// A session start reads every file again. [[spec/design_output/level0#a-cache-follows-its-file]]
export function dropsAll(box) {
  for (const one of HELD) for (const key of one.keys) box[key] = undefined;
  box.cacheStamps = undefined;
}

function stampsOf(box) {
  return HELD.map((one) =>
    (one.folder ? filesIn(box, one.folder) : one.files(box))
      .map((path) => stampOf(box, path))
      .join("|"),
  );
}

function filesIn(box, folder) {
  try {
    return box.disk
      .list(join(box.method, ...folder.split("/")))
      .filter((one) => one.kind === "file")
      .map((one) => `${folder}/${one.name}`)
      .sort();
  } catch {
    return [];
  }
}

function stampOf(box, path) {
  const at = join(box.method, ...String(path).split("/"));
  try {
    return `${path}@${box.disk.modified(at)}:${box.disk.size(at)}`;
  } catch {
    return `${path}@none`;
  }
}
