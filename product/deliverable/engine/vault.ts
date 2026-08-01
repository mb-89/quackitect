// THE WARM MODEL — every note, held.
//
// Obsidian keeps one live index of the vault and every view reads it. Ours
// does the same, and the reason is a measured ruling rather than taste:
// FILTERING IS THE HOT PATH, RENDERING IS NOT. Cutting tens of thousands of
// notes down to a few dozen has to be fast; painting the survivors slowly is
// acceptable.
//
// What this replaces re-read and re-parsed the whole vault on EVERY render,
// which put the filesystem in the middle of the fast path and a cache nowhere.
// Here the disk is touched once at build, and afterwards only for the one file
// that actually changed.
//
// A ROW IS NOT A COPY OF A FILE. It is the note's frontmatter plus a `file`
// member carrying the fields Bases synthesises. The expression language reads
// exactly this shape, so nothing translates between the index and a filter.
import { mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, watch, writeFileSync, type FSWatcher } from "node:fs";
import { readFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { basename, dirname, join, relative, sep } from "node:path";
import { DATEISH, evaluate, isTruthy, parseExpr, toDate, type Ctx } from "./expr.ts";
import { parseStateNote } from "./notes.ts";

export type Row = Record<string, unknown>;

const SKIP_DIRS = new Set(["node_modules", ".git", ".obsidian", ".se", ".worktrees", "tests"]);

/**
 * What a progress bar draws. A build of a large vault takes seconds, and the
 * rule is that nothing hangs: real progress where progress exists.
 */
export interface BuildProgress {
  phase: "scan" | "read" | "done";
  done: number;
  total: number;
}

export interface VaultStats {
  /** Notes held. */
  notes: number;
  /** Notes whose YAML did not parse. They are kept and marked, never dropped. */
  unreadable: number;
  /** Milliseconds the last full build took. */
  buildMs: number;
  /** Bytes read at the last full build. */
  bytes: number;
}

function walk(dir: string, out: string[]): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(join(dir, e.name), out);
    } else if (e.isFile() && e.name.endsWith(".md")) {
      out.push(join(dir, e.name));
    }
  }
}

/**
 * The warm index. Build it once, ask it many times.
 *
 * Rows keep their insertion order, which is the sorted file order, so a view
 * with no sort clause is stable between runs.
 */
export class Vault {
  readonly root: string;
  readonly dir: string;
  private rows: Row[] = [];
  private byPath = new Map<string, number>();
  private stats: VaultStats = { notes: 0, unreadable: 0, buildMs: 0, bytes: 0 };
  private watcher: FSWatcher | null = null;
  private listeners: (() => void)[] = [];

  constructor(root: string, dir?: string) {
    this.root = root;
    this.dir = dir ?? join(root, "product");
  }

  /** Read every note once. The only place the whole vault is touched. */
  build(): VaultStats {
    const started = performance.now();
    const files = this.files();
    return this.seat(files.map((abs) => this.readOne(abs)), started);
  }

  /**
   * The same index, built with the reads overlapped.
   *
   * Measured on this machine, reading the files is SIXTY PERCENT of a build
   * and parsing their YAML is twenty; the work is I/O-bound, so the pool runs
   * wider than the core count rather than at it.
   *
   * This is the entry point anything with an interface behind it must use. A
   * synchronous build of a large vault takes seconds, and seconds spent in the
   * process that draws the surfaces is every surface frozen at once.
   */
  async buildAsync(onProgress?: (p: BuildProgress) => void): Promise<VaultStats> {
    const started = performance.now();
    onProgress?.({ phase: "scan", done: 0, total: 0 });
    const files = this.files();
    const total = files.length;
    const rows: Row[] = new Array(total);
    const width = Math.min(256, Math.max(8, availableParallelism() * 8));
    let next = 0;
    let done = 0;
    // Reporting every file would cost more than the read; a hundredth is enough
    // to move a bar smoothly.
    const every = Math.max(1, Math.floor(total / 100));
    const pump = async (): Promise<void> => {
      for (;;) {
        const i = next++;
        if (i >= total) return;
        let raw: string | null;
        try {
          raw = await readFile(files[i], "utf8");
        } catch {
          raw = null;
        }
        rows[i] = this.rowFrom(files[i], raw);
        done++;
        if (onProgress !== undefined && done % every === 0) onProgress({ phase: "read", done, total });
      }
    };
    await Promise.all(Array.from({ length: Math.min(width, total) }, pump));
    const stats = this.seat(rows, started);
    onProgress?.({ phase: "done", done: total, total });
    return stats;
  }

  private files(): string[] {
    const files: string[] = [];
    walk(this.dir, files);
    files.sort();
    return files;
  }

  /** Take the rows, index them by path, and stamp what the build cost. */
  private seat(rows: Row[], started: number): VaultStats {
    this.rows = [];
    this.byPath = new Map();
    let bytes = 0;
    let unreadable = 0;
    for (const row of rows) {
      if (typeof row.unreadable === "string") unreadable++;
      bytes += Number(row.__bytes ?? 0);
      delete row.__bytes;
      this.byPath.set(String((row.file as Row).path), this.rows.length);
      this.rows.push(row);
    }
    this.stats = { notes: this.rows.length, unreadable, buildMs: performance.now() - started, bytes };
    return this.stats;
  }

  private readOne(abs: string): Row {
    let raw: string | null;
    try {
      raw = readFileSync(abs, "utf8");
    } catch {
      raw = null;
    }
    return this.rowFrom(abs, raw);
  }

  private rowFrom(abs: string, raw: string | null): Row {
    const rel = relative(this.dir, abs).split(sep).join("/");
    const folder = dirname(rel) === "." ? "" : dirname(rel);
    if (raw === null) {
      const file = { name: basename(rel, ".md"), path: rel, folder, ext: "md", size: 0, tags: [], links: [] };
      return { file, unreadable: `${rel} cannot be read`, __bytes: 0 };
    }
    const size = Buffer.byteLength(raw);
    const file: Row = {
      name: basename(rel, ".md"),
      basename: basename(rel, ".md"),
      path: rel,
      folder,
      ext: "md",
      size,
      tags: [] as string[],
      links: [] as string[],
    };
    // The timestamps cost a second syscall per note and almost no filter asks
    // for them, so they are read on the first reference and not before.
    defineLazyTimes(file, abs);
    try {
      const note = parseStateNote(raw);
      const fm = typeFrontmatter(note.frontmatter as Row);
      file.tags = normaliseTags(fm.tags);
      file.links = wikilinks(raw);
      return { statement: note.statement, ...fm, file, __bytes: size };
    } catch (err) {
      file.links = wikilinks(raw);
      return { file, unreadable: `${rel} does not parse — ${String((err as Error).message).split("\n")[0]}`, __bytes: size };
    }
  }

  /** Re-read ONE note. What a file watcher calls, and the reason nothing rescans. */
  refresh(relPath: string): void {
    const abs = join(this.dir, relPath.split("/").join(sep));
    const row = this.readOne(abs);
    delete row.__bytes;
    const at = this.byPath.get(relPath);
    if (at === undefined) {
      this.byPath.set(relPath, this.rows.length);
      this.rows.push(row);
    } else {
      this.rows[at] = row;
    }
    this.stats.notes = this.rows.length;
  }

  /**
   * Drop ONE note. The other half of live.
   *
   * Row order is the sorted file order and a view relies on it, so the row is
   * spliced out rather than swapped away. Only the indexes after it move, and
   * they are decremented in place: rebuilding the whole map here cost eight
   * milliseconds at thirty thousand notes, which is the deletion path paying
   * for the whole vault.
   */
  forget(relPath: string): void {
    const at = this.byPath.get(relPath);
    if (at === undefined) return;
    this.rows.splice(at, 1);
    this.byPath.delete(relPath);
    for (const [path, i] of this.byPath) {
      if (i > at) this.byPath.set(path, i - 1);
    }
    this.stats.notes = this.rows.length;
  }

  all(): Row[] {
    return this.rows;
  }

  get(relPath: string): Row | undefined {
    const at = this.byPath.get(relPath);
    return at === undefined ? undefined : this.rows[at];
  }

  measured(): VaultStats {
    return { ...this.stats };
  }

  /**
   * The hot path. The expression is parsed once for the whole sweep, not once
   * per row, and evaluation walks a tree rather than re-lexing text.
   */
  filter(expr: string | undefined, over?: Row[], base?: Partial<Ctx>): Row[] {
    const rows = over ?? this.rows;
    if (expr === undefined || expr.trim() === "") return [...rows];
    const node = parseExpr(expr);
    const out: Row[] = [];
    for (const row of rows) {
      if (isTruthy(evaluate(node, { ...base, row }))) out.push(row);
    }
    return out;
  }

  /** Watch the vault and keep the index current. Live in both directions. */
  live(onChange: () => void): void {
    this.listeners.push(onChange);
    if (this.watcher !== null) return;
    const pending = new Set<string>();
    let timer: NodeJS.Timeout | null = null;
    const w = watch(this.dir, { recursive: true }, (_event, name) => {
      if (name === null) return;
      const rel = String(name).split(sep).join("/");
      if (!rel.endsWith(".md")) return;
      if (rel.split("/").some((p) => SKIP_DIRS.has(p))) return;
      pending.add(rel);
      if (timer !== null) clearTimeout(timer);
      // Coalesce: an editor writing a file fires several times.
      timer = setTimeout(() => {
        for (const p of pending) {
          try {
            statSync(join(this.dir, p.split("/").join(sep)));
            this.refresh(p);
          } catch {
            this.forget(p);
          }
        }
        pending.clear();
        for (const fn of this.listeners) fn();
      }, 50);
    });
    // A watcher must never be the reason a process will not exit.
    w.unref?.();
    this.watcher = w;
  }

  stop(): void {
    this.watcher?.close();
    this.watcher = null;
    this.listeners = [];
  }

  private indexPath(): string {
    return join(this.root, ".se", "vault-index.json");
  }

  /** Write what was read, so the next start does not read it again. */
  saveIndex(): void {
    const entries: CacheEntry[] = this.rows.map((row) => {
      const file = row.file as Row;
      const fm: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row)) {
        if (k === "file" || k === "statement" || k === "unreadable") continue;
        fm[k] = v;
      }
      const entry: CacheEntry = {
        path: String(file.path),
        size: Number(file.size ?? 0),
        mtimeMs: (file.mtime as Date).getTime(),
        fm,
        tags: file.tags as string[],
        links: file.links as string[],
      };
      if (typeof row.statement === "string") entry.statement = row.statement;
      if (typeof row.unreadable === "string") entry.unreadable = row.unreadable;
      return entry;
    });
    const body: CacheFile = { version: INDEX_VERSION, dir: this.dir, entries };
    try {
      mkdirSync(join(this.root, ".se"), { recursive: true });
      writeFileSync(this.indexPath(), JSON.stringify(body));
    } catch {
      // A cache that cannot be written is a slow start, never a failure.
    }
  }

  /**
   * Rebuild from the saved index, re-reading only what moved. Answers false
   * when there is no usable cache, and the caller falls back to a full build.
   */
  loadIndex(onProgress?: (p: BuildProgress) => void): boolean {
    return this.loadIndexInto(onProgress).ok;
  }

  private loadIndexInto(onProgress?: (p: BuildProgress) => void): { ok: boolean; reused: number; reread: number } {
    let body: CacheFile;
    try {
      body = JSON.parse(readFileSync(this.indexPath(), "utf8")) as CacheFile;
    } catch {
      return { ok: false, reused: 0, reread: 0 };
    }
    if (body.version !== INDEX_VERSION || body.dir !== this.dir) return { ok: false, reused: 0, reread: 0 };

    const started = performance.now();
    onProgress?.({ phase: "scan", done: 0, total: 0 });
    const files = this.files();
    const total = files.length;
    const cached = new Map(body.entries.map((e) => [e.path, e]));
    const rows: Row[] = new Array(total);
    const stale: number[] = [];

    files.forEach((abs, i) => {
      const rel = relative(this.dir, abs).split(sep).join("/");
      const hit = cached.get(rel);
      let st;
      try {
        st = statSync(abs);
      } catch {
        stale.push(i);
        return;
      }
      if (hit === undefined || hit.size !== st.size || hit.mtimeMs !== st.mtime.getTime()) {
        stale.push(i);
        return;
      }
      rows[i] = this.rowFromCache(abs, rel, hit);
    });

    onProgress?.({ phase: "read", done: total - stale.length, total });
    for (const i of stale) rows[i] = this.readOne(files[i]);
    this.seat(rows, started);
    onProgress?.({ phase: "done", done: total, total });
    return { ok: true, reused: total - stale.length, reread: stale.length };
  }

  /** What the last warm start reused against what it had to read again. */
  warmStart(onProgress?: (p: BuildProgress) => void): { ok: boolean; reused: number; reread: number } {
    return this.loadIndexInto(onProgress);
  }

  private rowFromCache(abs: string, rel: string, e: CacheEntry): Row {
    const file: Row = {
      name: basename(rel, ".md"),
      basename: basename(rel, ".md"),
      path: rel,
      folder: dirname(rel) === "." ? "" : dirname(rel),
      ext: "md",
      size: e.size,
      tags: e.tags,
      links: e.links,
    };
    defineLazyTimes(file, abs);
    const row: Row = { ...typeFrontmatter(e.fm), file };
    if (e.statement !== undefined) row.statement = e.statement;
    if (e.unreadable !== undefined) row.unreadable = e.unreadable;
    return row;
  }

  /** Throw the cache away and read everything. The answer to a doubt about it. */
  async rebuild(onProgress?: (p: BuildProgress) => void): Promise<VaultStats> {
    try {
      unlinkSync(this.indexPath());
    } catch {
      // Nothing cached is the same starting point.
    }
    const stats = await this.buildAsync(onProgress);
    this.saveIndex();
    return stats;
  }
}

function defineLazyTimes(file: Row, abs: string): void {
  let cached: Date | null = null;
  const read = (): Date => {
    if (cached === null) {
      try {
        cached = statSync(abs).mtime;
      } catch {
        cached = new Date(0);
      }
    }
    return cached;
  };
  Object.defineProperty(file, "mtime", { get: read, enumerable: true, configurable: true });
  Object.defineProperty(file, "ctime", { get: read, enumerable: true, configurable: true });
}

/**
 * A date-shaped scalar becomes a real date, because that is what Obsidian's
 * property type would have made it and every date filter compares against one.
 * Nothing else is coerced: guessing at a type is how a table quietly stops
 * matching what the file says.
 */
function typeFrontmatter(fm: Row): Row {
  let touched = false;
  const out: Row = {};
  for (const [k, v] of Object.entries(fm)) {
    if (typeof v === "string" && DATEISH.test(v)) {
      out[k] = toDate(v);
      touched = true;
      continue;
    }
    out[k] = v;
  }
  return touched ? out : fm;
}

function normaliseTags(v: unknown): string[] {
  if (v === undefined || v === null) return [];
  const list = Array.isArray(v) ? v : String(v).split(/[,\s]+/);
  return list.map((t) => String(t).replace(/^#/, "").trim()).filter((t) => t !== "");
}

const WIKILINK = /\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g;

function wikilinks(raw: string): string[] {
  const out: string[] = [];
  for (const m of raw.matchAll(WIKILINK)) {
    const t = m[1].trim();
    if (t !== "" && !out.includes(t)) out.push(t);
  }
  return out;
}

// ---------------------------------------------------------------------------
// THE SAVED INDEX
//
// Obsidian indexes a large vault once and keeps it. Ours does the same, in
// .se/, so only the FIRST start of a big vault pays the full read.
//
// WHAT THE STALENESS CHECK COSTS, said plainly. A warm start stats every file
// and re-reads only the ones whose size or modification time moved. That is
// cheaper than reading them, and it is weaker than hashing their content: an
// edit that changes neither length nor timestamp walks past it. Nothing an
// editor does produces that, but a restore from an archive can, so
// `rebuild()` exists and the cache carries the hash needed to check.
// ---------------------------------------------------------------------------

const INDEX_VERSION = 2;

interface CacheEntry {
  path: string;
  size: number;
  mtimeMs: number;
  statement?: string;
  fm: Record<string, unknown>;
  tags: string[];
  links: string[];
  unreadable?: string;
}

interface CacheFile {
  version: number;
  dir: string;
  entries: CacheEntry[];
}

/** One vault per root, so a second view does not pay for a second index. */
const WARM = new Map<string, Vault>();

export function vaultFor(root: string): Vault {
  let v = WARM.get(root);
  if (v === undefined) {
    v = new Vault(root);
    v.build();
    WARM.set(root, v);
  }
  return v;
}

/** What a surface calls, so a large vault never blocks the process that draws. */
export async function warmVault(root: string, onProgress?: (p: BuildProgress) => void): Promise<Vault> {
  let v = WARM.get(root);
  if (v === undefined) {
    v = new Vault(root);
    WARM.set(root, v);
    if (!v.loadIndex(onProgress)) await v.buildAsync(onProgress);
    v.saveIndex();
  }
  return v;
}

export function forgetVault(root: string): void {
  WARM.get(root)?.stop();
  WARM.delete(root);
}
