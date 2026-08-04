// The autonomy scale — an Obsidian-editable markdown TRUTH
// (machines/scale.md): the engine reads it fresh, never defines it. Same
// field-line grammar the forms use: "- value | abbr | name" under
// "## Levels". A malformed line fails loudly — a silently misparsed scale
// would draw confident wrong notches.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStateNote, section } from "./notes.ts";

export interface AutonomyLevel {
  value: number;
  abbr: string;
  name: string;
}

export function scalePath(root: string): string {
  return join(root, "project", "deliverable", "machines", "scale.md");
}

/** The rung a priority calibrates against: the least level that admits it.
 *  The bare word — scale.md's name column carries a description after an
 *  em-dash, and a header wants "strategic", not the whole sentence.
 *  Blocked (0) is a control position, never a name for work. */
export function levelName(levels: AutonomyLevel[], priority: number): string {
  const rungs = levels.filter((l) => l.value > 0).sort((a, b) => a.value - b.value);
  return (rungs.find((l) => l.value >= priority) ?? rungs[rungs.length - 1]).name.split(" — ")[0];
}

export function loadLevels(root: string): AutonomyLevel[] {
  const note = parseStateNote(readFileSync(scalePath(root), "utf8"));
  const rows = section(note.body, "Levels")
    .split("\n")
    .filter((l) => l.trim() !== "");
  const levels = rows.map((line) => {
    const m = line.trim().match(/^- ([0-9.]+) \| (.+?) \| (.+)$/);
    if (!m) throw new Error(`scale.md: malformed level line ${JSON.stringify(line.trim())} (want "- value | abbr | name")`);
    return { value: Number(m[1]), abbr: m[2], name: m[3] };
  });
  if (levels.length === 0) throw new Error("scale.md: no level lines under ## Levels");
  return levels;
}
