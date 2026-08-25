// see dsp-the-options-pool.md#the-options-pool
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { parseStateNote, readNode, writeNode } from "./notes.ts";

export interface WorkToken {
  id: string;
  statement: string;
  ready_when: string;
  source: string;
}

/** Where the pool lives: a corpus node like any other, so the sweep walks it
 *  without being told to. */
export function poolDir(root: string): string {
  return join(root, "spec", "trace", "work-token");
}

/** The pool's own path prefix, root-relative and in the corpus's own
 *  separator, so a write guard can recognise it whatever the platform. */
export const POOL_PREFIX = "spec/trace/work-token";

/** A RUN OF THIS MANY WORDS SHARED WITH THE NOTE IS A COPY.
 *
 *  Shorter and an honest rewrite of a one-line note trips it, because the
 *  statement and the note are ABOUT the same thing and share their nouns.
 *  Longer and a pasted fragment walks through.
 *
 *  IT IS A JUDGEMENT AND IT IS WRITTEN HERE RATHER THAN BURIED, so the first
 *  run of real data can move it without archaeology. */
const COPY_RUN = 6;

/** see dsp-the-options-pool.md#what-a-secret-looks-like-when-it-is-one */
const HAS_SEPARATOR = /[@/\\]/;
/** A TOKEN THIS LONG WITH NO SEPARATOR IN IT IS AN IDENTIFIER, not a word —
 *  a password, a hash, a key. Below twelve, ordinary long words collide by
 *  chance and the check would refuse honest writing. */
const OPAQUE = /^[a-z0-9._+]{12,}$/;
const isIdentifier = (t: string): boolean => HAS_SEPARATOR.test(t) || OPAQUE.test(t);

/** FLATTEN THE WAY THE DESIGN SAYS IT DOES.
 *
 *  It said "whitespace and case flattened" and the code only split on
 *  whitespace, so substituting hyphens for spaces carried a note through
 *  verbatim. Punctuation between words is now a separator like any other;
 *  punctuation INSIDE a token is kept, because that is what makes an address
 *  or a path recognisable to the check above. */
const words = (s: string): string[] =>
  s
    .toLowerCase()
    .split(/\s+/)
    .flatMap((raw) => {
      const t = raw.replace(/^[^a-z0-9@/\\]+|[^a-z0-9@/\\]+$/g, "");
      if (t === "") return [];
      // AN ADDRESS OR A PATH STAYS WHOLE, because its separators are what make
      // it recognisable. Everything else breaks on punctuation, so a hyphen
      // substituted for a space cannot disguise a run of the note's own words.
      return HAS_SEPARATOR.test(t) ? [t] : t.split(/[^a-z0-9]+/).filter((x) => x !== "");
    });

/** The longest run of words the two texts share, in order. Empty when nothing
 *  longer than a single word lines up.
 *
 *  IT COMES BACK IN THE STATEMENT'S OWN CASE, because the refusal quotes it and
 *  an author has to be able to find it in what they typed. */
export function longestSharedRun(statement: string, noteText: string): string {
  const original = statement.split(/\s+/).filter((w) => w !== "");
  const a = words(statement);
  const b = words(noteText);
  if (a.length === 0 || b.length === 0) return "";
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
  if (bestLen === 0) return "";
  const slice = a.slice(bestEnd - bestLen, bestEnd);
  // Prefer the author's own spelling where the two tokenisations line up.
  return original.length === a.length ? original.slice(bestEnd - bestLen, bestEnd).join(" ") : slice.join(" ");
}

/** THE IDENTIFIER-SHAPED TOKENS BOTH TEXTS CARRY. One is enough to refuse. */
export function sharedIdentifiers(statement: string, noteText: string): string[] {
  const inNote = new Set(words(noteText).filter((t) => isIdentifier(t) && t.length >= 8));
  const out: string[] = [];
  for (const t of words(statement)) if (inNote.has(t) && !out.includes(t)) out.push(t);
  return out;
}

function optionId(root: string, statement: string): string {
  const slug =
    words(statement)
      .join("-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "a-work-token";
  let id = `wt-${slug}`;
  for (let n = 2; existsSync(join(poolDir(root), `${id}.md`)); n++) id = `wt-${slug}-${String(n)}`;
  return id;
}

/** ONE DOOR, AND THIS IS WHAT MAKES IT ONE.
 *
 *  The file lane calls this before any write, so a path under the pool refuses
 *  unless it came through the mint. i17's verification landed a fabricated
 *  token carrying a third party's name through `se_file_write` in one call,
 *  which is the whole privacy boundary skipped by the lane's own general
 *  writer. `tsp-one-door-into-the-pool` asserts the absence this creates. */
export function guardNoSecondDoor(rootRelativePath: string, source: string): void {
  if (!rootRelativePath.replace(/\\\\/g, "/").startsWith(`${POOL_PREFIX}/`)) return;
  throw new Rejection({
    clause: CLAUSES.NOTE_TEXT_CARRIED,
    expected: "a work token written by the mint — the pool has exactly one door",
    got: `a direct write to ${rootRelativePath}`,
    remedy: {
      tool: "se_note_drain",
      args: {
        ref: "<the note's ref>",
        disposition: "backlog",
        where: "ready when <condition>",
        statement: "<what it is, in your own words>",
      },
      note: "the mint is what checks that nothing private travels, so a write that goes round it goes round the only defence the hard line has",
    },
    source,
  });
}

/** AUTHOR A WORK TOKEN AND LAND IT.
 *
 *  Refuses before it writes, always: a refused mint must leave the pool and the
 *  note store exactly as it found them. */
export function mintToken(
  root: string,
  what: { statement: string; readyWhen: string; source: string; noteText: string; mintedIn?: string },
): WorkToken {
  const statement = what.statement.trim();
  const readyWhen = what.readyWhen.trim();
  const args = { ref: what.source, disposition: "backlog", where: "ready when <condition>", statement: "<what it is>" };
  if (statement === "") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "statement: what the work token IS, written for a reader who never saw the note",
      got: "no statement",
      remedy: { tool: "se_note_drain", args, note: "saying it cannot be stated cleanly yet IS a statement — what is refused is silence" },
      source: "engine/pool.ts mint",
    });
  }
  // THE MINT GUARDS ITS OWN DEMANDS. drainNote checks `where` too, and that is
  // not enough: the module the design names as owning how a token is written
  // must hold every rule, or a second caller inherits none of them.
  if (readyWhen === "") {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "ready_when: what has to be true for this to come back",
      got: "no re-entry condition",
      remedy: { tool: "se_note_drain", args, note: "a parked item without a re-entry condition is never re-entered" },
      source: "engine/pool.ts mint",
    });
  }
  const leaked = sharedIdentifiers(statement, what.noteText);
  if (leaked.length > 0) {
    throw new Rejection({
      clause: CLAUSES.NOTE_TEXT_CARRIED,
      expected:
        "a statement carrying nothing the note carried — an address, a path or a secret is one word, and one word is enough to leak",
      got: `carried straight from the note: ${leaked.map((t) => JSON.stringify(t)).join(", ")}`,
      remedy: {
        tool: "se_note_drain",
        args,
        note: "name what the option IS rather than what it points at — the pool is read by people the note was never written for",
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
        args,
        note: "a note is a dump and may carry anything private; the rewrite is what makes a token safe to commit",
      },
      source: "engine/pool.ts mint",
    });
  }
  const id = optionId(root, statement);
  const node: WorkToken = { id, statement, ready_when: readyWhen, source: what.source };
  // EVERY VALUE IS QUOTED, not only the two that looked risky. `source` and
  // `minted_in` were interpolated raw, and a crafted source injected
  // frontmatter that replaced the authored statement outright.
  const front = [
    "---",
    ...(what.mintedIn !== undefined && what.mintedIn !== "" ? [`minted_in: ${JSON.stringify(what.mintedIn)}`] : []),
    `id: ${id}`,
    'type: "[[work-token]]"',
    `statement: ${JSON.stringify(statement)}`,
    `ready_when: ${JSON.stringify(readyWhen)}`,
    `source: ${JSON.stringify(what.source)}`,
    "---",
    "",
    "## Why it stands",
    "",
    statement,
    "",
    "## When it comes back",
    "",
    readyWhen,
    "",
  ].join("\n");
  // THE ENGINE'S OWN READER IS THE ORACLE, before anything lands. SE-C-138 is
  // the rule that a write leaving a node its reader cannot parse is refused
  // rather than reported later, and the mint never asked.
  try {
    parseStateNote(front);
  } catch (e) {
    throw new Rejection({
      clause: CLAUSES.CORPUS_UNREADABLE,
      expected: "a work token the corpus reader can load",
      got: String((e as Error).message),
      remedy: {
        tool: "se_note_drain",
        args,
        note: "something in the statement, the condition or the note ref will not survive being written as frontmatter",
      },
      source: "engine/pool.ts mint",
    });
  }
  // THROUGH THE DOOR. A work token IS a node, and writeNode writes AND TELLS —
  // so a reader later in the same pass gets the token that was just minted
  // rather than the absence the door remembers from before it.
  mkdirSync(poolDir(root), { recursive: true });
  writeNode(join(poolDir(root), `${id}.md`), front);
  return node;
}

/** EVERY WORK TOKEN THAT STANDS, read from the repository and nowhere else.
 *
 *  ONE BAD NODE MUST NOT COST THE WHOLE ANSWER. It did: an unparseable token
 *  threw out of here and took `survey()` with it, so the desk and the mirror
 *  lost every row rather than one. readNotes catches per line and loadTrace
 *  skips a node it cannot read; this now does the same. */
export function standingTokens(root: string): WorkToken[] {
  const dir = poolDir(root);
  if (!existsSync(dir)) return [];
  const out: WorkToken[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".md")) continue;
    const abs = join(dir, name);
    try {
      if (!statSync(abs).isFile()) continue;
      // THROUGH THE DOOR, because a work token IS a corpus node. Reading it
      // direct would share its parse with nobody and walk around the one
      // mechanism that makes a whole-corpus pass affordable.
      const fm = parseStateNote(readNode(abs)).frontmatter;
      out.push({
        id: String(fm.id ?? name.replace(/\.md$/, "")),
        statement: String(fm.statement ?? ""),
        ready_when: String(fm.ready_when ?? ""),
        source: String(fm.source ?? ""),
      });
    } catch {
      // A token nobody can read is not a token, and it is not the rest of the
      // pool's problem. preflight is what reports it.
    }
  }
  return out;
}
