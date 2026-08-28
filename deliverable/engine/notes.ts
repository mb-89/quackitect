// see dsp-note-pen.md#state-notes
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { isFence } from "./frontmatter.ts";
import { stripBom } from "./jsonio.ts";

export type FrontmatterValue = unknown;

export interface StateNote {
  frontmatter: Record<string, unknown>;
  statement: string;
  body: string;
}

export function parseStateNote(raw: string): StateNote {
  const text = stripBom(raw);
  const lines = text.split(/\r?\n/);
  let frontmatter: Record<string, unknown> = {};
  let bodyStart = 0;
  // THE FENCE SITS AT COLUMN ZERO, and isFence is where that rule lives.
  if (lines[0] !== undefined && isFence(lines[0])) {
    const end = lines.findIndex((l, i) => i > 0 && isFence(l));
    if (end > 0) {
      const block = lines.slice(1, end).join("\n");
      // A person edits these files in the real world, and two engine
      // generations may stamp the same key. The LAST value wins — a pane
      // that dies on a YAML nit is a broken pane, not a strict one.
      const parsed = parseYaml(block, { uniqueKeys: false }) as unknown;
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        frontmatter = parsed as Record<string, unknown>;
      }
      bodyStart = end + 1;
    }
  }
  const body = lines.slice(bodyStart).join("\n");
  const heading = lines.slice(bodyStart).find((l) => l.startsWith("# "));
  return { frontmatter, statement: heading?.replace(/^#\s+/, "").trim() ?? "", body };
}

interface HeldFile {
  stamp: string;
  /** see dsp-note-pen.md#true-while-the-stamp-was-minted-inside-the-files */
  provisional?: boolean;
  /** The base layer. Text, lines and note derive from it lazily. */
  bytes: Buffer;
  text?: string;
  lines?: string[];
  note?: StateNote;
  /** The pass that last verified this against disk. Equal to the current one
   *  means the stat already happened in this operation. */
  epoch: number;
}

const HELD = new Map<string, HeldFile>();
const STATS = { hits: 0, misses: 0 };

/** The door's own meter: entries held, served from held, read from disk, and
 *  how many times a write has moved every derived answer. */
export function doorStats(): { held: number; hits: number; misses: number; derived: number } {
  return { held: HELD.size, ...STATS, derived: DERIVED };
}

/** see dsp-note-pen.md#there-is-no-watcher-here */

/** see dsp-note-pen.md#the-write-door */
export function writeNode(path: string, text: string): void {
  writeFileSync(path, text);
  forgetPath(path);
}

/** A write the lane made — told, not discovered, so the next read is correct
 *  without waiting for anything. */
export function forgetPath(path: string): void {
  HELD.delete(resolve(path));
  WRITES += 1;
  // EVERY DERIVED ANSWER FALLS WITH IT. The corpus and its friends cannot say
  // which files they read, so one write moves them all. Working out which ones
  // actually touched this path is a dependency graph nobody asked for.
  DERIVED += 1;
}

/** ONE OPERATION'S WINDOW ONTO DISK.
 *
 *  Inside a pass the door stats each file ONCE and answers every later access
 *  from what it already holds. Outside a pass it stats per access, which is
 *  what a test or a stray caller gets.
 *
 *  THIS IS NOT THE TRUST WINDOW THE SUITE REFUSED. That one was two seconds of
 *  WALL CLOCK, and a note edited during it stayed unseen — the product law says
 *  "a state note edited on disk binds the NEXT call, no reload" (editsafety),
 *  and a clock does not know where one call ends. A pass does. It opens when a
 *  lane call arrives and closes when its answer goes out, so the next call
 *  re-stats everything by construction and the law holds exactly.
 *
 *  WHAT IT BUYS. Entering one record touched the corpus's 328 notes about sixty
 *  times over: 19,730 stats for 328 answers. The sixty is the shape defect that
 *  input-process-output names, and the pass is that rule made mechanical for
 *  the readers too deep to thread a parameter through.
 *
 *  NESTING IS A DEPTH COUNT, not a second epoch. An inner beginPass inside an
 *  outer one must not bump the generation — that would silently re-stat the
 *  whole corpus halfway through the outer operation, which is the cost this
 *  removes. */
let EPOCH = 0;
let DERIVED = 0;
let DEPTH = 0;
let WRITES = 0;

// TWO COUNTERS, BECAUSE A WRITE INVALIDATES TWO DIFFERENT THINGS.
//
// EPOCH is the door's own: it says "this pass has already stat'd that file".
// Writing one file says nothing about the other 327, so a write leaves it
// alone and simply drops the written entry.
//
// DERIVED is for answers built FROM MANY files — the corpus, the expedition
// list, the matrix hash. Those cannot say which file they depended on, so any
// write moves them all. Measured: bumping ONE counter on write cost 5,031
// stats where 583 was possible, because the route writes generated containers
// while it walks and each write re-invalidated the whole corpus.

export function beginPass(): void {
  if (DEPTH === 0) {
    EPOCH += 1;
    DERIVED += 1;
  }
  DEPTH += 1;
}

export function endPass(): void {
  if (DEPTH > 0) DEPTH -= 1;
}

/** The current pass, or 0 outside one. Anything DERIVED from many notes keys
 *  on this: the pass already verified every file, so a derived answer built in
 *  this pass is as fresh as the files it was built from. */
export function passEpoch(): number {
  return DEPTH > 0 ? DERIVED : 0;
}

/** HOW MANY TIMES ANYTHING HAS BEEN WRITTEN, and nothing else moves it.
 *
 *  IT IS NOT `DERIVED`. That one also moves when a pass OPENS, because every
 *  answer built from many files is stale at the start of a new operation. A
 *  caller asking "has anything changed since?" would get yes on every pull.
 *
 *  WHAT IT IS FOR: telling a verdict that is still true from one that has been
 *  overtaken. A check that judged the tree stays true exactly as long as the
 *  tree stands still.
 *
 *  IT FAILS SAFE. Anything that MIGHT have written bumps it, including a shell
 *  command whose effects the lane cannot see. A spurious bump costs one re-run;
 *  a missed one would let a stale pass stand. */
export function writeEpoch(): number {
  return WRITES;
}

/** SOMETHING WROTE, AND THE LANE CANNOT SEE WHAT. A shell command may touch
 *  anything, so it counts as a write to everything. */
export function noteWrite(): void {
  WRITES += 1;
}

/** see dsp-note-pen.md#the-pass-is-opened-by-hand */

/** Run one operation as a pass. ALWAYS through this, never the raw pair — a
 *  begin whose end is skipped by a throw would freeze the door on stale text
 *  for the rest of the process. */
export function withPass<T>(fn: () => T): T {
  beginPass();
  try {
    return fn();
  } finally {
    endPass();
  }
}

/** see dsp-note-pen.md#the-one-door-onto-a-repo-file */
function held(path: string): HeldFile | undefined {
  const key = resolve(path);
  const hit = HELD.get(key);
  // ALREADY VERIFIED THIS OPERATION. The stat happened on the first access,
  // and a write since then went through writeNode, which forgot it.
  if (hit !== undefined && DEPTH > 0 && hit.epoch === EPOCH) {
    STATS.hits += 1;
    return hit;
  }
  // see dsp-note-pen.md#no-trust-window
  let stamp: string;
  let mtimeMs = 0;
  try {
    const s = statSync(key);
    stamp = `${s.size}:${s.mtimeMs}:${s.ctimeMs}`;
    mtimeMs = s.mtimeMs;
  } catch {
    HELD.delete(key);
    return undefined;
  }
  // see dsp-note-pen.md#a-provisional-entry-never-hits-on-its-stamp
  if (hit !== undefined && hit.stamp === stamp && hit.provisional !== true) {
    hit.epoch = EPOCH;
    STATS.hits += 1;
    return hit;
  }
  let bytes: Buffer;
  try {
    bytes = readFileSync(key);
  } catch {
    return undefined;
  }
  // 25 ms clears Windows' default ~15.6 ms file-time quantum with room.
  const fresh: HeldFile = { stamp, bytes, epoch: EPOCH, provisional: Date.now() - mtimeMs < 25 };
  HELD.set(key, fresh);
  STATS.misses += 1;
  return fresh;
}

function textOf(h: HeldFile): string {
  h.text ??= h.bytes.toString("utf8");
  return h.text;
}

/** The file's whole text, empty where it cannot be read. */
export function readNode(path: string): string {
  const h = held(path);
  return h === undefined ? "" : textOf(h);
}

/** THE FILE'S STAMP — size, modified time, created time — as the door holds it.
 *
 *  FOR THE CALLER THAT ONLY WANTS TO KNOW WHETHER SOMETHING MOVED. Inside a pass
 *  the door has already stat'd the file, so this costs a map lookup; a raw
 *  `statSync` per file pays the syscall again.
 *
 *  MEASURED: the trace corpus stamped itself with 2,790 stats per check, on a
 *  corpus whose every file the pass was already holding.
 *
 *  IT IS THE SAME CHECK, not a weaker one. The string compared is the one the
 *  door itself compares before deciding a held file is still good. */
export function nodeStamp(path: string): string {
  return held(path)?.stamp ?? "gone";
}

/** The file's whole text, or undefined where there is no file. The one read
 *  that tells a MISSING file from an EMPTY one, which `readNode` cannot: both
 *  come back as the empty string there.
 *
 *  A caller that branches on existence wants this rather than `existsSync` plus
 *  its own `readFileSync`. Two syscalls become none inside a pass, and the text
 *  is the same text every other reader in the pass is holding. */
export function readNodeIfPresent(path: string): string | undefined {
  const h = held(path);
  return h === undefined ? undefined : textOf(h);
}

/** The raw bytes — the base layer, for the reader that serves images and
 *  sniffs binary (fileRead). Undefined where the file cannot be read. */
export function readNodeBytes(path: string): Buffer | undefined {
  return held(path)?.bytes;
}

/** Its lines, split once. The array is SHARED — every caller only reads it. */
export function nodeLines(path: string): string[] {
  const h = held(path);
  if (h === undefined) return [];
  h.lines ??= textOf(h).split("\n");
  return h.lines;
}

/** The parsed note, parsed ONCE. Undefined where the file is unreadable. */
export function noteOf(path: string): StateNote | undefined {
  const h = held(path);
  if (h === undefined) return undefined;
  h.note ??= parseStateNote(textOf(h));
  return h.note;
}

export function loadStateNote(path: string): StateNote {
  return noteOf(path) ?? { frontmatter: {}, statement: "", body: "" };
}

export function section(body: string, title: string): string {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${title}`);
  if (start === -1) return "";
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  return rest
    .slice(0, end === -1 ? rest.length : end)
    .join("\n")
    .trim();
}
