// THE OPTIONS POOL — where a stray stops being machine-local.
//
// A CAPTURE IS A DUMP AND AN OPTION IS AN ARTIFACT, and the whole module exists
// to keep those two things apart. `.se/notes.jsonl` is written mid-walk by
// whoever noticed something, may carry anything, and is never committed. An
// option is authored, states what it is and when it comes back, and lands on
// trunk where any clone can read it.
//
// NOTHING CROSSES BY BEING COPIED. The statement is written by the person or
// the agent doing the drain, and `mintOption` refuses one that is the note's own
// text. That refusal is the only mechanical defence the privacy line has.
//
// WHY IT IS NOT PART OF inbox.ts. The pool is read by things that have nothing
// to do with notes — the survey today, the desk tomorrow — and importing the
// note store to read a list of options would tie two lifetimes together that
// the design keeps apart.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { parseStateNote } from "./notes.ts";

export interface StandingOption {
  id: string;
  statement: string;
  ready_when: string;
  source: string;
}

/** Where the pool lives: a corpus node like any other, so the sweep and the
 *  identity check walk it without being told to (probed 2026-08-18). */
export function poolDir(root: string): string {
  return join(root, "project", "spec", "trace", "option");
}

/** A RUN OF THIS MANY WORDS SHARED WITH THE NOTE IS A COPY.
 *
 *  Shorter and an honest rewrite of a one-line note trips it, because the
 *  statement and the note are ABOUT the same thing and share their nouns.
 *  Longer and a pasted fragment walks through.
 *
 *  IT IS A JUDGEMENT AND IT IS WRITTEN HERE RATHER THAN BURIED, so the first
 *  run of real data can move it without archaeology. What it cannot catch is a
 *  REWORDED private sentence — that limit is
 *  raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters. */
const COPY_RUN = 6;

const words = (s: string): string[] =>
  s
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== "");

/** The longest run of words the two texts share, in order. Empty when nothing
 *  longer than a single word lines up.
 *
 *  IT COMES BACK IN THE STATEMENT'S OWN CASE, because the refusal quotes it and
 *  an author has to be able to find it in what they typed. Comparing is
 *  case-insensitive; reporting is not. */
export function longestSharedRun(statement: string, noteText: string): string {
  const original = statement.split(/\s+/).filter((w) => w !== "");
  const a = words(statement);
  const b = words(noteText);
  if (a.length === 0 || b.length === 0) return "";
  // The usual longest-common-substring table, one row at a time: the texts here
  // are a sentence against a note, so the whole table would be waste.
  let prev = new Array<number>(b.length + 1).fill(0);
  let bestLen = 0;
  let bestEnd = 0;
  for (let i = 1; i <= a.length; i++) {
    const row = new Array<number>(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] !== b[j - 1]) continue;
      row[j] = prev[j - 1] + 1;
      if (row[j] > bestLen) {
        bestLen = row[j];
        bestEnd = i;
      }
    }
    prev = row;
  }
  return bestLen === 0 ? "" : original.slice(bestEnd - bestLen, bestEnd).join(" ");
}

/** THE ID IS A SLUG OF THE STATEMENT, made unique against what already stands.
 *  A pool of files wants readable names — a reader listing the directory is
 *  reading the pool, and a hash tells them nothing. */
function optionId(root: string, statement: string): string {
  const slug =
    words(statement)
      .join("-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "an-option";
  let id = `opt-${slug}`;
  for (let n = 2; existsSync(join(poolDir(root), `${id}.md`)); n++) id = `opt-${slug}-${String(n)}`;
  return id;
}

/** AUTHOR AN OPTION AND LAND IT.
 *
 *  Refuses before it writes, always: a refused mint must leave the pool and the
 *  note store exactly as it found them. */
export function mintOption(
  root: string,
  what: { statement: string; readyWhen: string; source: string; noteText: string; mintedIn?: string },
): StandingOption {
  const statement = what.statement.trim();
  if (statement === "") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "statement: what the option IS, written for a reader who never saw the note",
      got: "no statement",
      remedy: {
        tool: "se_note_drain",
        args: { ref: what.source, disposition: "backlog", where: "ready when <condition>", statement: "<what the option is>" },
        note: "an option nobody can state cleanly was never an option — and saying it cannot be stated cleanly yet IS a statement",
      },
      source: "engine/pool.ts mint",
    });
  }
  const shared = longestSharedRun(statement, what.noteText);
  if (words(shared).length >= COPY_RUN) {
    throw new Rejection({
      clause: CLAUSES.NOTE_TEXT_CARRIED,
      expected: "a statement AUTHORED for the pool — the raw note stays local and never travels",
      got: `${String(words(shared).length)} words carried straight from the note: "${shared}"`,
      remedy: {
        tool: "se_note_drain",
        args: { ref: what.source, disposition: "backlog", where: "ready when <condition>", statement: "<say it in your own words>" },
        note: "a note is a dump and may carry anything private; the rewrite is what makes an option safe to commit. Cannot state it cleanly? Say that, and the pool carries it as an open question",
      },
      source: "engine/pool.ts mint",
    });
  }
  const id = optionId(root, statement);
  const node: StandingOption = { id, statement, ready_when: what.readyWhen.trim(), source: what.source };
  const front = [
    "---",
    ...(what.mintedIn !== undefined && what.mintedIn !== "" ? [`minted_in: ${what.mintedIn}`] : []),
    `id: ${id}`,
    'type: "[[option]]"',
    `statement: ${JSON.stringify(statement)}`,
    `ready_when: ${JSON.stringify(node.ready_when)}`,
    `source: ${what.source}`,
    "---",
    "",
    "## Why it stands",
    "",
    statement,
    "",
    "## When it comes back",
    "",
    node.ready_when,
    "",
  ].join("\n");
  mkdirSync(poolDir(root), { recursive: true });
  writeFileSync(join(poolDir(root), `${id}.md`), front, "utf8");
  return node;
}

/** EVERY OPTION THAT STANDS, read from the repository and from nowhere else.
 *
 *  A clone that has trunk has the pool. That is the whole proposition, and it
 *  is why this reads a directory rather than a store keyed to one machine. */
export function standingOptions(root: string): StandingOption[] {
  const dir = poolDir(root);
  if (!existsSync(dir)) return [];
  const out: StandingOption[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".md")) continue;
    const fm = parseStateNote(readFileSync(join(dir, name), "utf8")).frontmatter;
    const id = String(fm.id ?? name.replace(/\.md$/, ""));
    out.push({
      id,
      statement: String(fm.statement ?? ""),
      ready_when: String(fm.ready_when ?? ""),
      source: String(fm.source ?? ""),
    });
  }
  return out;
}
