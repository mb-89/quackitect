// see dsp-the-door-rule.md
//
// ONE PLACE HOLDS EACH CONVERSATION'S RULE. The write-time refusals ask it
// before a write lands, and the sweep asks it about the whole tree. Neither
// carries a copy.
//
// IT REFUSES NOTHING. This module answers questions; the two refusals live in
// doorguard.ts. See dsp-the-door-rule.md#responsibility.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

/** The engine's own folder, used only when a caller names no root. */
const ENGINE_DIR = import.meta.dirname;

/** Root-relative prefixes, so a finding names a file a person can open. */
const ENGINE_PREFIX = "deliverable/engine";
const BIN_PREFIX = `${ENGINE_PREFIX}/bin`;

/** The list a person edits. One file, one section per door. */
const DEPARTURES_FILE = "deliverable/machines/doors.md";

/** Where the departures for a door begin, inside that door's section.
 *
 *  EXPORTED BECAUSE THE REMEDY QUOTES IT. A guard that hardcoded its own copy
 *  would hand back an unappliable patch the day this string changed. */
export const MARKER = "<!-- departures below this line -->";

/** One conversation's rule. */
export type Door = {
  /** Named for the CONVERSATION, never for what carries it. */
  readonly id: string;
  /** What the conversation is, and what this rule cannot see. */
  readonly governs: string;
  /** Does this text hold the conversation? One string, no file read. */
  reaches: (text: string) => boolean;
  /** Is this file governed by the rule? */
  covers: (path: string) => boolean;
};

const IMPORTS_FS = /from\s+["']node:fs(\/promises)?["']|require\(\s*["']node:fs/;

/** Every governed file is engine source. Declaration files carry no calls. */
function isEngineSource(path: string): boolean {
  return path.startsWith(`${ENGINE_PREFIX}/`) && path.endsWith(".ts") && !path.endsWith(".d.ts");
}

export const DOORS: readonly Door[] = [
  {
    id: "keeping-a-record-on-disk",
    governs:
      "reading and writing the project's own files, inside deliverable/engine and nowhere else. It CANNOT see a module that reaches disk through a spawned process, because a command carries no path to judge. It CANNOT see the tests, the editor extension, the cage or the repository root at all, because covers governs engine source only — the disk conversation outside that folder is ungoverned rather than absent.",
    reaches: (text) => IMPORTS_FS.test(text),
    covers: isEngineSource,
  },
];

/** The door registered under this name. Throws where none is. */
export function door(id: string): Door {
  const found = DOORS.find((d) => d.id === id);
  if (found === undefined) throw new Error(`no door is registered under ${id}`);
  return found;
}

/** The list file for a door, root-relative. */
export function departureFile(_id: string): string {
  return DEPARTURES_FILE;
}

function repoRoot(root?: string): string {
  return root ?? dirname(dirname(ENGINE_DIR));
}

/** Every file of one extension under a folder, as root-relative paths.
 *
 *  A MISSING FOLDER MEANS NONE, never a crash. A caller may name a root that
 *  holds only part of the tree. */
function walk(base: string, prefix: string, ext: string, out: string[] = []): string[] {
  let names: string[];
  try {
    names = readdirSync(base);
  } catch {
    return out;
  }
  for (const name of names) {
    const full = join(base, name);
    const rel = `${prefix}/${name}`;
    let directory: boolean;
    try {
      directory = statSync(full).isDirectory();
    } catch {
      // A BROKEN SYMLINK IS NOT A MODULE. Left to throw, it takes the sweep
      // down over a file that holds no conversation at all.
      continue;
    }
    if (directory) walk(full, rel, ext, out);
    else if (name.endsWith(ext) && !name.endsWith(".d.ts")) out.push(rel);
  }
  return out;
}

function sources(base: string, prefix: string): string[] {
  return walk(base, prefix, ".ts");
}

/**
 * How many files this rule actually LOOKED AT.
 *
 * A ZERO IS NOT A GREEN. A root naming a tree with no engine folder yields no
 * governed files, so every list comes back empty and every door reads clean.
 * The root is caller-supplied, which made a typo in it the one control that
 * silenced every rule at once — exactly what
 * req-no-setting-disables-every-rule-at-once forbids.
 *
 * SO A CALLER CAN TELL "nothing wrong" FROM "nothing looked at", which are the
 * two readings of an empty finding list.
 */
export function governedCount(id: string, root?: string): number {
  const base = repoRoot(root);
  const rule = door(id);
  return sources(join(base, ENGINE_PREFIX), ENGINE_PREFIX).filter((rel) => rule.covers(rel)).length;
}

/** Every governed module that holds the conversation. */
export function reachers(id: string, root?: string): string[] {
  const base = repoRoot(root);
  const rule = door(id);
  return sources(join(base, ENGINE_PREFIX), ENGINE_PREFIX)
    .filter((rel) => rule.covers(rel))
    .filter((rel) => rule.reaches(readFileSync(join(base, rel), "utf8")))
    .sort();
}

/**
 * Does the file at this path hold the conversation as it stands on disk?
 *
 * THE GUARD ASKS THIS RATHER THAN OPENING THE FILE ITSELF. A module that had
 * to read disk in order to enforce the disk door would be an undeclared reach
 * inside the thing that refuses undeclared reaches.
 *
 * A MISSING FILE HOLDS NOTHING. The question is about what is there, and a
 * path with nothing at it is a file being created.
 */
export function reachesOnDisk(id: string, rootRelativePath: string, root?: string): boolean {
  let text: string;
  try {
    text = readFileSync(join(repoRoot(root), rootRelativePath), "utf8");
  } catch {
    return false;
  }
  return door(id).reaches(text);
}

/** One line of a departure list, whether or not it states a reason. */
export type Departure = { readonly line: number; readonly path: string; readonly reason: string };

/**
 * THE ONE SHAPE A DEPARTURE LINE TAKES, read by the rule and by the guard.
 *
 * THE REASON IS OPTIONAL HERE ON PURPOSE. The guard has to SEE a reasonless
 * line in order to refuse it. A parser that dropped one would leave the guard
 * nothing to judge, and force it to hold a second copy of this shape — which
 * is the failure req-one-rule-is-expressed-once-and-read-by-two-callers names.
 */
const DEPARTURE = /^-\s+([\w./-]+\.ts)\s*(?:[-–—]\s*(.*))?$/;

/**
 * The lines of one door's section that sit BELOW its marker, numbered in the
 * whole file.
 *
 * A HEADING MATCHES EXACTLY. Prefix matching would give a door named
 * `keeping-a-record` the departures of `keeping-a-record-on-disk`, and the
 * list states the opposite as a property of itself.
 *
 * NO MARKER MEANS NO DEPARTURES. A section that never opened its list has an
 * empty one rather than an accidental one.
 */
function sectionLines(text: string, id: string): { line: number; text: string }[] {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === `## ${id}`);
  if (start < 0) return [];
  const out: { line: number; text: string }[] = [];
  let open = false;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) break;
    if (lines[i].includes(MARKER)) {
      open = true;
      continue;
    }
    if (open) out.push({ line: i + 1, text: lines[i] });
  }
  return out;
}

/**
 * Bullets below a door's marker that do not parse as a departure at all.
 *
 * THE SILENT CLASS. A line reading `- deliverable/engine/thing` or naming a
 * `.mts` file matches nothing: it is not honoured, and nothing said so. The
 * author believes an exemption was declared while the sweep goes on reporting
 * the module forever.
 *
 * THE SHAPE IS STILL HELD IN ONE PLACE. This asks the same DEPARTURE pattern
 * the reader asks, and answers with what it could NOT read.
 */
export function malformedDepartures(text: string, id: string): { line: number; text: string }[] {
  return sectionLines(text, id).filter((l) => l.text.trimStart().startsWith("- ") && !DEPARTURE.test(l.text));
}

/** Every departure line in a door's section, in file order, reasoned or not. */
export function departureLines(text: string, id: string): Departure[] {
  const out: Departure[] = [];
  for (const line of sectionLines(text, id)) {
    const m = DEPARTURE.exec(line.text);
    if (m !== null) out.push({ line: line.line, path: m[1], reason: (m[2] ?? "").trim() });
  }
  return out;
}

/**
 * The declared departures for a door, path to reason.
 *
 * A MISSING FILE MEANS NO DEPARTURES, never a crash. The rule has to answer
 * even where nobody has written the list yet.
 *
 * ANY DASH SEPARATES THE PATH FROM THE REASON. Demanding an em dash means a
 * person typing a hyphen gets nothing and no error to explain it.
 *
 * A REASONLESS LINE IS NOT A DEPARTURE. The module stays a stray and the sweep
 * goes on reporting it; the write guard refuses that line separately.
 */
export function departures(id: string, root?: string): Map<string, string> {
  let text: string;
  try {
    text = readFileSync(join(repoRoot(root), departureFile(id)), "utf8");
  } catch {
    return new Map();
  }
  const reasoned = departureLines(text, id).filter((d) => d.reason !== "");
  return new Map(reasoned.map((d) => [d.path, d.reason]));
}

/**
 * What a door's list carries on disk TODAY that states no reason: the paths of
 * its bare lines, and the raw text of its unreadable ones.
 *
 * THE GUARD NEEDS IT TO AIM ITS REMEDY. A line already on disk is repaired by
 * replacing that line. One that arrived with the write the guard just refused
 * is not on disk at all, so a patch against it matches nothing — the remedy
 * failing in exactly the case it exists for.
 *
 * BOTH ANSWERS COME OFF ONE READ, and both are parsed here rather than in the
 * guard, which holds no copy of this shape.
 */
export function unreasonedOnDisk(
  id: string,
  root?: string,
): { readonly bare: ReadonlySet<string>; readonly malformed: ReadonlySet<string> } {
  let text: string;
  try {
    text = readFileSync(join(repoRoot(root), departureFile(id)), "utf8");
  } catch {
    return { bare: new Set(), malformed: new Set() };
  }
  return {
    bare: new Set(
      departureLines(text, id)
        .filter((d) => d.reason === "")
        .map((d) => d.path),
    ),
    malformed: new Set(malformedDepartures(text, id).map((l) => l.text)),
  };
}

/**
 * THE FINDING: a module that holds the conversation and no departure declares.
 *
 * ABSENCE FROM THE LIST MEANS GOVERNED. A reader who does not find a module
 * here concludes it was not allowed, rather than that nobody looked.
 */
export function strays(id: string, root?: string): string[] {
  const declared = departures(id, root);
  return reachers(id, root).filter((rel) => !declared.has(rel));
}

/**
 * Every file a person can run, counted from the tree.
 *
 * See dsp-the-door-rule.md#responsibility — a hand-written list of six sat in
 * the suite while the engine grew past it.
 */
export function entryPoints(root?: string): string[] {
  return sources(join(repoRoot(root), BIN_PREFIX), BIN_PREFIX).sort();
}

/** Everywhere an entry point can be INVOKED from.
 *
 *  ONLY INVOCATION SITES ARE READ. A page of guidance naming a script does not
 *  make it runnable, so prose is deliberately out of this list: counting a
 *  mention would make "reached" mean "written about".
 *
 *  THE MACHINE FILES ARE MARKDOWN. A state names its exit script there, so a
 *  scan of source alone would call every script-run entry point unreached.
 *
 *  THE HOST CONFIGS RUN THE HOOKS. Nothing in this tree invokes a hook; the
 *  editor does, from its own settings file.
 *
 *  THE TESTS, THE WORKFLOWS AND THE ROOT SCRIPT INVOKE TOO. Left out, a live
 *  entry point run only by the battery or by CI reads as unreached. */
function invocationSites(base: string): string[] {
  const machines = join(base, "deliverable", "machines");
  const cage = join(base, "deliverable", "cage");
  const claude = join(base, ".claude");
  const tests = join(base, "deliverable", "tests");
  const actions = join(base, ".github");
  return [
    join(base, "deliverable", "package.json"),
    join(base, "RUNME.ps1"),
    ...sources(join(base, ENGINE_PREFIX), ENGINE_PREFIX).map((rel) => join(base, rel)),
    ...walk(machines, machines, ".md"),
    ...walk(cage, cage, ".json"),
    ...walk(claude, claude, ".json"),
    ...walk(tests, tests, ".ts"),
    ...walk(actions, actions, ".yml"),
  ];
}

function readOrEmpty(full: string): string {
  try {
    return readFileSync(full, "utf8");
  } catch {
    return "";
  }
}

/**
 * Every entry point nothing ELSE invokes.
 *
 * REACHED MEANS INVOKED, and an invocation names the folder: `bin/<name>`.
 * That prefix is what separates running a script from writing about one.
 *
 * A FILE NEVER REACHES ITSELF. Every entry point is engine source, so its own
 * usage comment sat in the corpus and marked it reached. Nearly half of them
 * documented their own command line and passed on that alone, which is the one
 * thing a dead script keeps. See dsp-the-door-sweep.md.
 *
 * THE NEEDLE KEEPS THE PATH BELOW `bin/`, never the bare name. A script in a
 * subfolder is invoked as `bin/sub/tool.ts` and would never match `bin/tool.ts`.
 */
export function unreachedEntryPoints(root?: string): string[] {
  const base = repoRoot(root);
  const sites = invocationSites(base).map((full) => ({ full, text: readOrEmpty(full) }));
  return entryPoints(root).filter((rel) => {
    const needle = `bin/${rel.slice(`${BIN_PREFIX}/`.length)}`;
    const own = join(base, rel);
    return !sites.some((s) => s.full !== own && s.text.includes(needle));
  });
}
