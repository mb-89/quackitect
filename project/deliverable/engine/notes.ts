// State notes — plain markdown files a drawn state points at. The v2 note
// grammar without the ledger: frontmatter carries the machine-facing fields,
// `## Guidance` and `## Evidence form` are sections, the first `# ` heading
// is the statement.
//
// Frontmatter is REAL YAML (owner ruling: Obsidian-editable). Lists may be
// YAML lists (Obsidian renders them as chips) or comma-separated strings —
// both are accepted everywhere a list is expected. Conditions are FLAT
// keys: exit_read, exit_script, entry_<type> — nested dictionaries render
// as JSON blobs in Obsidian Properties and are refused by the compiler.
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
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
  if (lines[0]?.trim() === "---") {
    const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
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
  /** True while the stamp was minted inside the file's own timestamp tick.
   *  A same-length rewrite in that tick keeps the stamp identical, so a
   *  provisional entry is never served from the stamp — it re-reads until
   *  a read observes the mtime cold. Measured 2026-08-10: 4 of 20 external
   *  rewrites vanished behind an identical stamp on Windows' ~16 ms tick. */
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

/** The door's own meter: entries held, served from held, read from disk. */
export function doorStats(): { held: number; hits: number; misses: number } {
  return { held: HELD.size, ...STATS };
}

/** THERE IS NO WATCHER HERE, AND THAT IS A DECISION (owner question, tried and
 *  measured 2026-08-09).
 *
 *  A watcher would be told what moved instead of asking per access, which is
 *  worth 28,064 stats in one record entry. One was built. The suite refused it
 *  in four places, and the clearest was a product law:
 *
 *    "a state note edited on disk binds the NEXT call, no reload"
 *
 *  WHY NO WATCHER CAN KEEP THAT PROMISE. A watch event is ASYNCHRONOUS. Between
 *  a write landing on disk and the event arriving, the model holds the old
 *  text, and a read in that gap is wrong. This is not fs.watch being flaky; it
 *  is what asynchronous notification IS. Go's watchers have the same gap, and a
 *  more reliable library closes none of it.
 *
 *  SO A WATCHER CAN ONLY EVER BE AN OPTIMISATION WITH A CORRECTNESS FALLBACK —
 *  and the fallback is the stat, on the same path, so the watcher saves nothing
 *  where it matters.
 *
 *  WHERE ONE DOES BELONG: the mirror. Re-rendering when the disc changes is
 *  strictly better than polling every second, and a render is not a claim — a
 *  late repaint costs nobody anything. That is a different door and a real win;
 *  see the note on the poll storm.
 *
 *  THE ACTUAL FIX FOR THE COST IS SHAPE, NOT NOTIFICATION. One stat per access
 *  is cheap. Sixty-six sweeps of the same corpus in one operation is the
 *  defect, and it is fixed by collecting the input once and passing it down
 *  (software.md, input-process-output). */

/** THE WRITE DOOR, beside the read one.
 *
 *  Every write that lands on a file the model may hold goes through here, so
 *  the model is TOLD rather than left to discover it. Outside a pass the stat
 *  would catch it anyway; inside one the epoch short-circuits before the stat,
 *  and an untold write is served stale for the rest of the operation.
 *
 *  IT WAS A HOLE UNTIL 2026-08-09. forgetPath existed and had no callers at
 *  all — the door's own comment claimed "a lane write calls forgetPath" and
 *  nothing did. A rule nobody calls is a comment. */
export function writeNode(path: string, text: string): void {
  writeFileSync(path, text);
  forgetPath(path);
}

/** A write the lane made — told, not discovered, so the next read is correct
 *  without waiting for anything. */
export function forgetPath(path: string): void {
  HELD.delete(resolve(path));
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

/* THE PASS IS OPENED BY HAND, AND THAT IS THE SECOND TIME THIS WAS SETTLED.
 *
 * An AUTOMATIC pass was tried on 2026-08-09: the first door access in a turn
 * of the event loop opens one, a microtask closes it. The reasoning was that a
 * synchronous region is exactly one turn, so no interval of trust exists at
 * all — only the indivisible region in which nothing else can run.
 *
 * SEVEN TESTS REFUSED IT, and one of them is a product law:
 *
 *   "a row edited now reaches the walk's machine with no pull at all"
 *
 * The others were the archive missing a closed expedition, a re-signed claim
 * not standing again, and the item register dropping a held assumption. All
 * the same fault: a caller writes through something other than the lane, then
 * reads back inside the same turn, and gets what it wrote over.
 *
 * SO THE RULE IS: a pass covers an operation that only READS. Route and the
 * mirror's render qualify and are wrapped. Anything that writes while it walks
 * does not, and asking per access is what keeps it correct.
 *
 * The first attempt was a 2,000 ms window (same day, five tests). Shrinking
 * the window from seconds to microseconds did not change the class of the bug
 * — which is the finding worth keeping. */

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

/** THE ONE DOOR ONTO A REPO FILE. Read it once, split it once, parse it once,
 *  and hand the same answer to everyone until the file moves.
 *
 *  IT LIVES HERE BECAUSE THIS IS THE FILE-AND-PARSE LAYER. It was drafted in
 *  trace.ts, which imports parseStateNote from here — a cycle. The door belongs
 *  under everything that reads, not beside one of its readers.
 *
 *  MEASURED, 2026-08-09. Entering one record made 9,755 readFileSync calls
 *  over a 328-node corpus: the same files read thirty times over, 2.6 s of a
 *  4 s call, all of it BLOCKING. A CPU profile could not see it — 301 ticks,
 *  20.6 % JavaScript. The engine was not computing, it was waiting.
 *
 *  WHY ONE DOOR AND NOT FIVE STAMPS. Four separate caches came first — the
 *  corpus, the lines, the item template, the claim verdict — each with its own
 *  key and its own freshness check. Together they cost 39,857 stats and left
 *  the three biggest readers untouched, because those readers called
 *  readFileSync themselves and no cache stood in the way. Caches that do not
 *  compose cannot be reasoned about; a door can.
 *
 *  THE STAT IS THE DESIGN, NOT A PLACEHOLDER (settled 2026-08-09, the
 *  no-watcher block above — this line once promised a watcher and the same
 *  day's measurement ruled one out). Fewer asks come from the pass, never
 *  from a longer leash.
 *
 *  BYTES ARE THE BASE LAYER (2026-08-10). fileRead reads through here too,
 *  so one store serves the engine's text readers and the lane's byte reader.
 *  The byte cache that briefly lived in files.ts folded in here. */
function held(path: string): HeldFile | undefined {
  const key = resolve(path);
  const hit = HELD.get(key);
  // ALREADY VERIFIED THIS OPERATION. The stat happened on the first access,
  // and a write since then went through writeNode, which forgot it.
  if (hit !== undefined && DEPTH > 0 && hit.epoch === EPOCH) {
    STATS.hits += 1;
    return hit;
  }
  // NO TRUST WINDOW. It was tried on 2026-08-09 and the suite refused it in
  // four places, one of them a product law: "a state note edited on disk binds
  // the NEXT call, no reload" (editsafety). fs.watch is asynchronous, so
  // between a write and its event the model is stale, and this system's
  // guarantee has no room for that gap.
  //
  // THE ANSWER IS NOT A LONGER LEASH, IT IS FEWER ASKS. One stat per access is
  // cheap; 21,648 of them is the defect, and that is a SHAPE problem — collect
  // the input once per operation and pass it down (software.md, input-process
  // -output). A cache cannot fix a call count.
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
  // A PROVISIONAL ENTRY NEVER HITS ON ITS STAMP. The clock below DENIES
  // trust, never extends it — which is why it survives the no-clock ruling
  // (2026-08-10): a file whose mtime sits inside the current timestamp tick
  // may have been rewritten same-length behind an identical stamp, so it is
  // re-read until some read finds the mtime cold and the stamp becomes
  // meaningful.
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
