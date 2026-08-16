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

/** THE STOP-AT NOTCHES, the autonomy dial's neighbour. Autonomy says what the
 *  agent may decide alone; this says how far it may walk before handing back.
 *  Same file, same grammar, same editability — machines/stopat.md. */
export function stopAtPath(root: string): string {
  return join(root, "project", "deliverable", "machines", "stopat.md");
}

/** The notch NAME for a stored value, bare. "" when nothing matches, which
 *  the caller reads as the default rather than guessing a rung. */
export function notchName(levels: AutonomyLevel[], value: number): string {
  return (levels.find((l) => l.value === value)?.name ?? "").split(" — ")[0];
}

/** The rung a priority calibrates against: the least level that admits it.
 *  The bare word — scale.md's name column carries a description after an
 *  em-dash, and a header wants "strategic", not the whole sentence.
 *  Blocked (0) is a control position, never a name for work. */
export function levelName(levels: AutonomyLevel[], priority: number): string {
  const rungs = levels.filter((l) => l.value > 0).sort((a, b) => a.value - b.value);
  return (rungs.find((l) => l.value >= priority) ?? rungs[rungs.length - 1]).name.split(" — ")[0];
}

/** A STATE'S WEIGHT, said as a word — the least rung that admits it.
 *
 *  NOT tierOf, WHICH IS THE DIAL'S FUNCTION. tierOf answers "which rung does
 *  this SETTING reach", so it looks DOWNWARD and a value below the lowest rung
 *  reaches nothing — "blocked". Applied to a state that is exactly backwards:
 *  a terminal at 0.01 is the lightest step there is, and it read as the
 *  heaviest. Seen live 2026-08-16 the moment the doors started serving words:
 *  `iterations/end` came back as `weight: "blocked"`.
 *
 *  ABOVE THE TOP RUNG IS GENUINELY BLOCKED, and that is the one case where the
 *  word is right: nothing admits it, so the agent never may. The archives are
 *  drawn that way on purpose. */
export function weightName(levels: AutonomyLevel[], priority: number): string {
  const rungs = levels.filter((l) => l.value > 0).sort((a, b) => a.value - b.value);
  return (rungs.find((l) => l.value >= priority)?.name ?? "blocked").split(" — ")[0];
}

/** The session's rung: the highest level the dial reaches, the bare word. */
export function tierOf(levels: AutonomyLevel[], autonomy: number): string {
  const rungs = levels.filter((l) => l.value > 0).sort((a, b) => a.value - b.value);
  const held = [...rungs].reverse().find((l) => l.value <= autonomy);
  return (held?.name ?? "blocked").split(" — ")[0];
}

/** The anchor a tier WORD admits — the words are the truth and the number
 *  is the transitional carrier while the numeric scale still runs. */
export function valueFor(levels: AutonomyLevel[], word: string): number | undefined {
  const bare = word.trim().toLowerCase();
  return levels.find((l) => l.name.split(" — ")[0].trim().toLowerCase() === bare || l.abbr.toLowerCase() === bare)?.value;
}

/** One rungs file, parsed. Both banks share the grammar on purpose: a reader
 *  who has understood one control has understood the other. */
function loadRungs(path: string, heading: string, what: string): AutonomyLevel[] {
  const note = parseStateNote(readFileSync(path, "utf8"));
  const rows = section(note.body, heading)
    .split("\n")
    .filter((l) => l.trim() !== "");
  const levels = rows.map((line) => {
    const m = line.trim().match(/^- ([0-9.]+) \| (.+?) \| (.+)$/);
    if (!m) throw new Error(`${what}: malformed level line ${JSON.stringify(line.trim())} (want "- value | abbr | name")`);
    return { value: Number(m[1]), abbr: m[2], name: m[3] };
  });
  if (levels.length === 0) throw new Error(`${what}: no level lines under ## ${heading}`);
  return levels;
}

export function loadLevels(root: string): AutonomyLevel[] {
  return loadRungs(scalePath(root), "Levels", "scale.md");
}

export function loadStopAt(root: string): AutonomyLevel[] {
  return loadRungs(stopAtPath(root), "The notches", "stopat.md");
}
