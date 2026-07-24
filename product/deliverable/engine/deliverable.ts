// se.file — the product file lane. The agent never opens the product
// directly; it lists, searches, reads, patches, writes and deletes through
// here. Every write is CAS-guarded (§8: the write carries its own
// precondition), so a human edit can never be clobbered.
//
// Lane root = the repo root. workspace/ is agent territory (direct tools
// are free there) and stays outside the lane; ledger WRITES belong to
// se.set.apply. "File", not "code": code is one realization kind among
// several (owner ruling — CAD, drawings, procedures may follow).
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { Rejection } from "./errors.ts";
import { sha256 } from "./hash.ts";
import { layout } from "./layout.ts";

const SRC = "engine/deliverable.ts";

/** Never listed, never searched, never served. Dot-paths otherwise SERVE
 *  (req-dotfile-lane: product/.obsidian is tracked owner content). */
const SKIP_DIRS = new Set(["node_modules", "workspace", ".git", ".se"]);
const skipEntry = (name: string): boolean => SKIP_DIRS.has(name);

/** Roots declared on the nameplate: { "roots": { "v1": "<abs path>", ... } }. */
function declaredRoots(root: string): Record<string, string> {
  const p = layout.nameplatePath(root);
  if (!existsSync(p)) return {};
  try {
    return (JSON.parse(readFileSync(p, "utf8")) as { roots?: Record<string, string> }).roots ?? {};
  } catch {
    return {};
  }
}

/** True for lane paths addressing a declared root, e.g. "@v1/engine/x.ts". */
const isRootRef = (path: string): boolean => path.startsWith("@");

/** Resolve "@name/rest" against the declared roots (read lanes only). */
function resolveDeclaredRoot(root: string, path: string): string {
  const [name, ...rest] = path.slice(1).split(/[\\/]+/);
  const roots = declaredRoots(root);
  const target = roots[name];
  if (target === undefined) {
    throw new Rejection({
      clause: "SE-C-069",
      expected: `a declared root (${Object.keys(roots).join(", ") || "none declared"})`,
      got: `@${name}`,
      remedy: { tool: "se_file_read", args: { path: "product.json" }, note: 'roots are declared on the nameplate under "roots"' },
      source: SRC,
    });
  }
  const base = resolve(target);
  const abs = resolve(base, rest.join("/"));
  if (abs !== base && !abs.startsWith(base + sep)) {
    throw new Rejection({
      clause: "SE-C-060",
      expected: `a path inside the declared root @${name}`,
      got: path,
      remedy: { tool: "se_file_list", args: { dir: `@${name}` }, note: "no escapes out of a declared root" },
      source: SRC,
    });
  }
  return abs;
}

/** Declared roots are research surfaces, never write targets (SE-C-070). */
function refuseRootWrite(path: string): void {
  if (!isRootRef(path)) return;
  throw new Rejection({
    clause: "SE-C-070",
    expected: "a product path (declared roots are read-only)",
    got: path,
    remedy: { tool: "se_file_read", args: { path }, note: "copy what you need into the product; foreign repos are never edited from here" },
    source: SRC,
  });
}

/** Resolve a root-relative path; refuse escapes and agent territory (SE-C-060). */
function resolveInside(root: string, path: string): string {
  if (isRootRef(path)) return resolveDeclaredRoot(root, path);
  const base = resolve(root);
  const abs = resolve(base, path);
  const inside = abs === base || abs.startsWith(base + sep);
  const rel = inside ? relative(base, abs) : "";
  const topSegment = rel.split(sep)[0] ?? "";
  if (!inside || topSegment === "workspace" || topSegment === ".git") {
    throw new Rejection({
      clause: "SE-C-060",
      expected: "a path inside the product root (workspace/ and dot-dirs are not the lane's)",
      got: path,
      remedy: {
        tool: "se_file_list",
        args: { dir: "." },
        note: "paths are relative to the product root; workspace/ is yours directly; the ledger has its own lane (se_set_apply)",
      },
      source: SRC,
    });
  }
  return abs;
}

/** Writes to the ledger ride se.set.apply, never this lane (SE-C-065). */
function refuseLedgerWrite(root: string, abs: string, path: string): void {
  const ledger = resolve(layout.ledger(root));
  if (abs === ledger || abs.startsWith(ledger + sep)) {
    throw new Rejection({
      clause: "SE-C-065",
      expected: "a non-ledger path (ledger content is node-structured)",
      got: path,
      remedy: { tool: "se_set_apply", args: { ops: [], dry_run: true }, note: "edit ledger nodes through se_set_apply" },
      source: SRC,
    });
  }
}

export function fileList(root: string, dir = "."): { path: string; kind: "file" | "dir" }[] {
  const abs = resolveInside(root, dir);
  if (!existsSync(abs)) {
    throw new Rejection({
      clause: "SE-C-061",
      expected: "an existing directory",
      got: dir,
      remedy: { tool: "se_file_list", args: { dir: "." }, note: "start at the product root" },
      source: SRC,
    });
  }
  const base = resolve(root);
  const display = (name: string): string =>
    isRootRef(dir) ? `${dir.replace(/[\\/]+$/, "")}/${name}` : relative(base, join(abs, name)).replaceAll(sep, "/");
  return readdirSync(abs, { withFileTypes: true })
    .filter((e) => !skipEntry(e.name))
    .map((e) => ({
      path: display(e.name),
      kind: e.isDirectory() ? ("dir" as const) : ("file" as const),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export interface SearchHit {
  path: string;
  /** 1-indexed line and its text for content hits; absent for name hits. */
  line?: number;
  text?: string;
  /** Ranked and fuzzy modes only. */
  score?: number;
}

export type SearchMode = "literal" | "ranked" | "fuzzy";

const MAX_SEARCH_FILE_BYTES = 1024 * 1024;
const MAX_HITS_PER_FILE = 3;

function listFiles(base: string): { rel: string; abs: string }[] {
  const out: { rel: string; abs: string }[] = [];
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (skipEntry(e.name)) continue;
      const abs = join(dir, e.name);
      if (e.isDirectory()) walk(abs);
      else out.push({ rel: relative(base, abs).replaceAll(sep, "/"), abs });
    }
  };
  walk(base);
  return out;
}

/** Text content, or null for binary/oversized files. */
function readText(abs: string): string | null {
  if (statSync(abs).size > MAX_SEARCH_FILE_BYTES) return null;
  const content = readFileSync(abs, "utf8");
  return content.includes(String.fromCharCode(0)) ? null : content;
}

/** Subsequence match; consecutive runs score higher (the fzf idea, tiny). */
function fuzzyScore(query: string, path: string): number {
  let qi = 0;
  let streak = 0;
  let score = 0;
  for (let i = 0; i < path.length && qi < query.length; i++) {
    if (path[i] === query[qi]) {
      qi++;
      streak++;
      score += streak;
    } else {
      streak = 0;
    }
  }
  return qi === query.length ? score : 0;
}

/**
 * Find files three ways: literal (substring, up to 3 line hits per file),
 * ranked (multi-term, occurrence-scored, name hits weigh more), fuzzy
 * (filename subsequence). Paths + anchors only — the detail read is a
 * second call. Intent is logged like se.help: searches ARE the demand
 * signal for missing affordances.
 */
export function fileSearch(root: string, query: string, limit = 20, mode: SearchMode = "literal"): { hits: SearchHit[]; truncated: boolean } {
  const base = resolve(root);
  const files = listFiles(base);
  const needle = query.toLowerCase();
  let hits: SearchHit[] = [];

  if (mode === "fuzzy") {
    const q = needle.replace(/\s+/g, "");
    hits = files
      .map((f) => ({ path: f.rel, score: fuzzyScore(q, f.rel.toLowerCase()) }))
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score);
  } else if (mode === "ranked") {
    const terms = needle.split(/\s+/).filter((t) => t.length > 1);
    for (const f of files) {
      let score = terms.reduce((n, t) => n + (f.rel.toLowerCase().includes(t) ? 5 : 0), 0);
      const content = readText(f.abs);
      let first: SearchHit | undefined;
      if (content !== null && terms.length > 0) {
        const lower = content.toLowerCase();
        for (const t of terms) {
          let i = lower.indexOf(t);
          while (i !== -1) {
            score++;
            i = lower.indexOf(t, i + t.length);
          }
        }
        if (score > 0) {
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (terms.some((t) => lines[i].toLowerCase().includes(t))) {
              first = { path: f.rel, line: i + 1, text: lines[i].trim().slice(0, 200) };
              break;
            }
          }
        }
      }
      if (score > 0) hits.push({ path: f.rel, score, ...(first?.line !== undefined ? { line: first.line, text: first.text } : {}) });
    }
    hits.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  } else {
    for (const f of files) {
      if (hits.length > limit) break;
      if (f.rel.toLowerCase().includes(needle)) {
        hits.push({ path: f.rel });
        continue;
      }
      const content = readText(f.abs);
      if (content === null) continue;
      const lines = content.split("\n");
      let inFile = 0;
      for (let i = 0; i < lines.length && inFile < MAX_HITS_PER_FILE; i++) {
        if (lines[i].toLowerCase().includes(needle)) {
          hits.push({ path: f.rel, line: i + 1, text: lines[i].trim().slice(0, 200) });
          inFile++;
        }
      }
    }
  }
  const truncated = hits.length > limit;
  if (truncated) hits.length = limit;
  return { hits, truncated };
}

export interface LaneFile {
  path: string;
  hash: string;
  content: string;
}

export function fileRead(root: string, path: string): LaneFile {
  const abs = resolveInside(root, path);
  if (!existsSync(abs)) {
    throw new Rejection({
      clause: "SE-C-061",
      expected: "an existing file",
      got: path,
      remedy: { tool: "se_file_search", args: { query: path }, note: "search first; paths are root-relative" },
      source: SRC,
    });
  }
  const content = readFileSync(abs, "utf8");
  return { path, hash: sha256(content), content };
}

/**
 * Whole-file write. base_hash is the CAS precondition: null claims the file
 * is new; otherwise it must match the current disk hash.
 */
export function fileWrite(root: string, path: string, content: string, baseHash: string | null): LaneFile {
  refuseRootWrite(path);
  const abs = resolveInside(root, path);
  refuseLedgerWrite(root, abs, path);
  const exists = existsSync(abs);
  if (baseHash === null && exists) {
    throw new Rejection({
      clause: "SE-C-062",
      expected: "a fresh path for base_hash: null",
      got: `${path} already exists`,
      remedy: { tool: "se_file_read", args: { path }, note: "read it, then write with its hash as base_hash" },
      source: SRC,
    });
  }
  if (baseHash !== null) {
    if (!exists) {
      throw new Rejection({
        clause: "SE-C-061",
        expected: "an existing file for a hash-guarded write",
        got: path,
        remedy: { tool: "se_file_write", args: { path, content: "<content>", base_hash: null }, note: "create it with base_hash: null" },
        source: SRC,
      });
    }
    const onDisk = sha256(readFileSync(abs, "utf8"));
    if (onDisk !== baseHash) {
      throw new Rejection({
        clause: "SE-C-063",
        expected: `disk hash ${baseHash}`,
        got: onDisk,
        remedy: { tool: "se_file_read", args: { path }, note: "the file moved underneath you; re-read and re-apply your change" },
        source: SRC,
      });
    }
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, "utf8");
  return { path, hash: sha256(content), content: "" };
}

/**
 * Exact-match patch: old_string must occur exactly once. The match is the
 * precondition, so no base_hash is needed; pass one to double-guard.
 */
export function filePatch(root: string, path: string, oldString: string, newString: string, baseHash?: string): LaneFile {
  refuseRootWrite(path);
  refuseLedgerWrite(root, resolveInside(root, path), path);
  const current = fileRead(root, path);
  if (baseHash !== undefined && baseHash !== current.hash) {
    throw new Rejection({
      clause: "SE-C-063",
      expected: `disk hash ${baseHash}`,
      got: current.hash,
      remedy: { tool: "se_file_read", args: { path }, note: "re-read, then re-send the patch" },
      source: SRC,
    });
  }
  const count = current.content.split(oldString).length - 1;
  if (count !== 1) {
    throw new Rejection({
      clause: "SE-C-064",
      expected: "old_string occurring exactly once",
      got: `${count} occurrences in ${path}`,
      remedy: {
        tool: "se_file_patch",
        args: { path, old_string: "<longer, unique excerpt>", new_string: newString },
        note: count === 0 ? "not found — re-read the file, the text may have changed" : "add surrounding lines until the match is unique",
      },
      source: SRC,
    });
  }
  // Function replacement: dollar sequences in new content stay literal.
  const next = current.content.replace(oldString, () => newString);
  writeFileSync(resolveInside(root, path), next, "utf8");
  return { path, hash: sha256(next), content: "" };
}

/** Hash-guarded delete: base_hash must match disk — no blind removal. */
export function fileDelete(root: string, path: string, baseHash: string): { path: string; deleted: true } {
  refuseRootWrite(path);
  const abs = resolveInside(root, path);
  refuseLedgerWrite(root, abs, path);
  const current = fileRead(root, path);
  if (current.hash !== baseHash) {
    throw new Rejection({
      clause: "SE-C-063",
      expected: `disk hash ${baseHash}`,
      got: current.hash,
      remedy: { tool: "se_file_read", args: { path }, note: "re-read; delete what you actually saw" },
      source: SRC,
    });
  }
  rmSync(abs);
  return { path, deleted: true };
}
