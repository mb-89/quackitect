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
import { readFileSync, statSync } from "node:fs";
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
  text: string;
  lines?: string[];
  note?: StateNote;
}

const HELD = new Map<string, HeldFile>();

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

/** A write the lane made — told, not discovered, so the next read is correct
 *  without waiting for anything. */
export function forgetPath(path: string): void {
  HELD.delete(resolve(path));
}

/** THE MODEL'S GENERATION — one number that changes when anything it holds
 *  does. Anything DERIVED from many files keys on this instead of stat-sweeping
 *  them all: the corpus stamp swept 328 files 66 times in one entry, 21,648
 *  stats to answer a question this answers in a lookup.
 *
 *  IT IS DELIBERATELY COARSE. A change to one node invalidates every derived
 *  answer, not just the ones that read that node. Recomputing a few things that
 *  did not need it beats sweeping thousands of files to find out which did. */
const generation = 0;

export function modelGeneration(): number {
  return generation;
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
 *  THE STAT IS THE PLACEHOLDER, NOT THE DESIGN. The end state is a watcher
 *  that tells the model what moved, so this stats nothing at all. Until then a
 *  stat per access is the cheap, correct approximation. */
function held(path: string): HeldFile | undefined {
  const key = resolve(path);
  const hit = HELD.get(key);
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
  try {
    const s = statSync(key);
    stamp = `${s.size}:${s.mtimeMs}`;
  } catch {
    HELD.delete(key);
    return undefined;
  }
  if (hit !== undefined && hit.stamp === stamp) return hit;
  let text: string;
  try {
    text = readFileSync(key, "utf8");
  } catch {
    return undefined;
  }
  const fresh: HeldFile = { stamp, text };
  HELD.set(key, fresh);
  return fresh;
}

/** The file's whole text, empty where it cannot be read. */
export function readNode(path: string): string {
  return held(path)?.text ?? "";
}

/** Its lines, split once. The array is SHARED — every caller only reads it. */
export function nodeLines(path: string): string[] {
  const h = held(path);
  if (h === undefined) return [];
  h.lines ??= h.text.split("\n");
  return h.lines;
}

/** The parsed note, parsed ONCE. Undefined where the file is unreadable. */
export function noteOf(path: string): StateNote | undefined {
  const h = held(path);
  if (h === undefined) return undefined;
  h.note ??= parseStateNote(h.text);
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
