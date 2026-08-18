// The autonomy scale — an Obsidian-editable markdown TRUTH
// (machines/scale.md): the engine reads it fresh, never defines it.
//
// THE RUNGS CARRY NO NUMBERS, AND THE ORDER IS THE SCALE (owner ruling
// 2026-08-18: "it is a terrible idea to have scales for things that are not
// numeric... I never see them, and nobody ever has to wonder about these
// numbers").
//
// The grammar is "- abbr | name — description" under a heading, and a rung's
// place in that list is its rank. The engine still compares numbers, because
// a gate is a `>` and always was; it DERIVES them from position instead of
// reading them off the page. Nothing that reaches a person carries one.
//
// THE DERIVED VALUES ARE THE ONES THAT WERE AUTHORED. Six rungs spread across
// nought to one give 0, .2, .4, .6, .8, 1 — the exact ladder that used to be
// typed in by hand. So this removes the numbers without moving a single
// threshold.
//
// A malformed line fails loudly — a silently misparsed scale would draw
// confident wrong notches.
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
function loadRungs(path: string, heading: string, what: string, valueAt: (i: number, n: number) => number): AutonomyLevel[] {
  const note = parseStateNote(readFileSync(path, "utf8"));
  const rows = section(note.body, heading)
    .split("\n")
    .filter((l) => l.trim() !== "");
  const levels = rows.map((line, i) => {
    const m = line.trim().match(/^- (.+?) \| (.+)$/);
    if (!m) throw new Error(`${what}: malformed level line ${JSON.stringify(line.trim())} (want "- abbr | name — description")`);
    // A NUMBER IN THE ABBREVIATION IS THE OLD GRAMMAR, and it is refused by
    // name rather than parsed as a two-letter code. Silently accepting it
    // would put the ladder back one edit at a time.
    if (/^[0-9.]+$/.test(m[1].trim())) {
      throw new Error(
        `${what}: the rungs carry no numbers any more — the order of the lines IS the scale. Drop the leading "${m[1].trim()} | " from ${JSON.stringify(line.trim())}`,
      );
    }
    return { value: valueAt(i, rows.length), abbr: m[1].trim(), name: m[2].trim() };
  });
  if (levels.length === 0) throw new Error(`${what}: no level lines under ## ${heading}`);
  return levels;
}

/** THE AUTONOMY LADDER SPREADS ACROSS NOUGHT TO ONE. Blocked is the first
 *  line and lands on 0, which is what makes a full block possible; the top
 *  line lands on 1. Rounded to two places so the arithmetic cannot drift a
 *  threshold by a float's last bit. */
const spread = (i: number, n: number): number => (n < 2 ? 0 : Math.round((i / (n - 1)) * 100) / 100);

/** THE STOP-AT NOTCHES COUNT FROM ONE, because the tightest notch is a real
 *  setting rather than an off switch. There is no stop-at equivalent of
 *  blocked. */
const counted = (i: number): number => i + 1;

export function loadLevels(root: string): AutonomyLevel[] {
  return loadRungs(scalePath(root), "Levels", "scale.md", spread);
}

export function loadStopAt(root: string): AutonomyLevel[] {
  return loadRungs(stopAtPath(root), "The notches", "stopat.md", counted);
}

/** THE DEFAULT RUNG, BY NAME. Nothing in the engine writes the dial's
 *  starting value as a number: it is looked up from the scale like every
 *  other rung.
 *
 *  TACTICAL IS THE DEFAULT EVERYWHERE (owner ruling 2026-08-18). Measured:
 *  the heaviest state inside an iteration is a gate, and a gate weighs
 *  tactical. Everything else is lighter. So tactical runs a whole iteration
 *  end to end and nothing beyond one — retros, overhauls and seeding stay
 *  strategic, and stay with the person.
 *
 *  IT WAS OPERATIONAL, AND THAT COULD NOT WALK ANY ITERATION. gate-kickoff is
 *  the first gate of every iteration and it is tactical, so an unattended run
 *  stopped at the first milestone every time. Measured on the i15 and i35
 *  cloud runs. */
export const DEFAULT_TIER = "tactical";

/** The default dial position, resolved against the live scale. Falls back to
 *  the top of the ladder only if the scale cannot be read at all. */
export function defaultAutonomy(root: string): number {
  try {
    return valueFor(loadLevels(root), DEFAULT_TIER) ?? 0;
  } catch {
    return 0;
  }
}
