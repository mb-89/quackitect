// THE PULL — the machine gathers the guidance relevant to a state and
// serves it as a DERIVED field (`pulled`), never authored on the note.
// Frontmatter only, four rules, each rule IS the source label:
//   root         a doc directly in project/guidance/ applies always
//                (applies: always does the same for deeper docs)
//   applies_to   the doc names its targets: state ids, machine/*, kind: x
//   tag: <t>     the doc's tags intersect the state's tags
//   read         the state's own read arguments (entry/exit conditions)
// A doc pulled by several rules appears once, with every source listed.
// A PROMOTED source (PROMPT_SOURCES) is never pulled: the prompt layer
// carries it on every turn, and it must not also ride the wire.
// Pulling is VISIBILITY — it never gates; only conditions gate.
import { existsSync, type FSWatcher, readdirSync, readFileSync, watch } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { contentHash } from "./hash.ts";
import type { MachineDecl, StateDecl } from "./machine.ts";
import { parseStateNote } from "./notes.ts";
import { PROMPT_SOURCES } from "./promptlayer.ts";

export interface GuidanceDoc {
  /** Root-relative path, forward slashes. */
  path: string;
  hash: string;
  applies?: string;
  applies_to: string[];
  tags: string[];
}

export interface PulledDoc {
  path: string;
  hash: string;
  sources: string[];
}

export function guidanceDir(root: string): string {
  return join(root, "project", "guidance");
}

function list(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter((x) => x !== "");
  return typeof v === "string" && v !== ""
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")
    : [];
}

/** THE OPERATING SYSTEM SAYS WHEN GUIDANCE CHANGED. We do not ask.
 *
 *  MEASURED, because the first two attempts blamed the wrong thing. 13 files,
 *  72 KB: walking the tree 0.12ms, reading it 2.72ms, HASHING it 0.12ms,
 *  parsing frontmatter 0.47ms. Hashing is 3% of the cost and was never the
 *  problem. Reading is 75% — and not for throughput either. 72 KB in 2.7ms
 *  is 26 MB/s, nonsense for warm files. It is ~210 MICROSECONDS PER FILE of
 *  fixed overhead: open, read, close, each crossing the Windows filter stack
 *  and the virus scanner. The byte count is irrelevant; the FILE COUNT is.
 *
 *  A render asks for the pull well over a hundred times to draw twelve
 *  states, so that was ~400ms of syscalls per render, paid by the VS Code
 *  panel on every poll.
 *
 *  So we stop asking. A recursive watcher on the guidance tree drops the
 *  memo when anything under it changes; between edits a scan is one map
 *  lookup. This is MORE live than polling, not less: polling notices on the
 *  next call, whenever that comes, and the watcher fires on the edit.
 *
 *  If the watcher cannot be installed — an exotic filesystem, a platform
 *  without recursive watch — the memo is simply never stored, and every call
 *  reads as it did before. Correct and slow beats fast and wrong.
 *
 *  THE WINDOW, measured rather than assumed: a watcher fires asynchronously,
 *  so an edit and a scan in the SAME synchronous turn still sees the old
 *  answer. One macrotask later it is fresh. That window cannot reach the
 *  read-proof gate, which never consults this: readProven goes through
 *  diskHash, which reads the file every time. What it can reach is the
 *  mirror's checkbox hash — and a write and a render are always separate
 *  turns, because one is a tool call and the other an HTTP request. */
const SCAN_CACHE = new Map<string, { docs: GuidanceDoc[] }>();
const WATCHED = new Map<string, FSWatcher | null>();

// ONE WATCHER PER DIRECTORY, NEVER `recursive: true` (found 2026-08-13,
// note-15acce44d2f3). unref() is supposed to let a watcher hold the cache
// warm without holding the process open, and it does — on a single,
// non-recursive watch. Measured on this platform: `watch(dir, {recursive:
// true}, cb).unref()` still keeps node alive indefinitely (a `node --test`
// run that finished every case sat for hours until killed by hand).
// Non-recursive watches on the same tree, each unref'd, exit clean in
// under 150ms. The tradeoff this accepts: a subdirectory created AFTER
// boot goes unwatched until the next restart — correct and slow beats
// fast and wrong, and a brand-new guidance folder is rare next to an
// edited file in an existing one.
function watchGuidance(root: string, dir: string): boolean {
  if (WATCHED.has(root)) return WATCHED.get(root) !== null;
  try {
    const onChange = (): void => {
      SCAN_CACHE.delete(root);
    };
    const onError = (): void => {
      SCAN_CACHE.delete(root);
      WATCHED.set(root, null);
    };
    let first: FSWatcher | undefined;
    const watchOne = (d: string): void => {
      const w = watch(d, { recursive: false }, onChange);
      w.unref();
      w.on("error", onError);
      first ??= w;
      for (const e of readdirSync(d, { withFileTypes: true })) {
        if (e.isDirectory()) watchOne(join(d, e.name));
      }
    };
    watchOne(dir);
    WATCHED.set(root, first ?? null);
    return true;
  } catch {
    WATCHED.set(root, null);
    return false;
  }
}

/** Scan the guidance tree — frontmatter only, prose never parsed. */
export function scanGuidance(root: string): GuidanceDoc[] {
  const dir = guidanceDir(root);
  if (!existsSync(dir)) return [];
  const watched = watchGuidance(root, dir);
  if (watched) {
    const hit = SCAN_CACHE.get(root);
    if (hit !== undefined) return hit.docs;
  }
  const out: GuidanceDoc[] = [];
  const walk = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const abs = join(d, e.name);
      if (e.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!e.name.endsWith(".md")) continue;
      const raw = readFileSync(abs, "utf8");
      const fm = parseStateNote(raw).frontmatter;
      out.push({
        path: relative(root, abs).split(sep).join("/"),
        hash: contentHash(raw),
        ...(typeof fm.applies === "string" ? { applies: fm.applies } : {}),
        applies_to: list(fm.applies_to),
        tags: list(fm.tags),
      });
    }
  };
  walk(dir);
  out.sort((a, b) => a.path.localeCompare(b.path));
  if (watched) SCAN_CACHE.set(root, { docs: out });
  return out;
}

function matchesSelector(sel: string, machineId: string, s: StateDecl): boolean {
  if (sel === s.id || sel === `${machineId}/${s.id}`) return true;
  if (sel === `${machineId}/*`) return true;
  if (sel.startsWith("kind:") && sel.slice(5).trim() === s.kind) return true;
  return false;
}

export function pulledFor(root: string, docs: GuidanceDoc[], m: MachineDecl, s: StateDecl): PulledDoc[] {
  const byPath = new Map<string, PulledDoc>();
  const add = (path: string, hash: string, source: string): void => {
    const cur = byPath.get(path);
    if (cur === undefined) byPath.set(path, { path, hash, sources: [source] });
    else if (!cur.sources.includes(source)) cur.sources.push(source);
  };
  const rootDir = guidanceDir(root);
  for (const d of docs) {
    if (PROMPT_SOURCES.includes(d.path)) continue;
    const isRoot = dirname(join(root, d.path)) === rootDir;
    if (isRoot) add(d.path, d.hash, "root");
    else if (d.applies === "always") add(d.path, d.hash, "applies: always");
    if (d.applies_to.some((sel) => matchesSelector(sel, m.id, s))) add(d.path, d.hash, "applies_to");
    for (const t of d.tags) {
      if ((s.tags ?? []).includes(t)) add(d.path, d.hash, `tag: ${t}`);
    }
  }
  // The state's own read arguments — guidance or not, they belong in the list.
  for (const dict of [s.entry, s.exit]) {
    for (const p of dict?.read ?? []) {
      const doc = docs.find((d) => d.path === p);
      add(p, doc?.hash ?? "", "read");
    }
  }
  return [...byPath.values()];
}
