// The search lane — drop-in replacement for Grep.
//
// ripgrep and git are HARD dependencies (owner ruling 2026-07-26): there is
// no fallback engine. ripgrep ships via @vscode/ripgrep (npm install in the
// RUNME); PATH rg is accepted too. Missing both is a red preflight, not a
// degraded search — v2's lesson: a weaker lane silently teaches the agent
// to distrust the lane.
//
// ref search (v2 parity): pass ref to search a committed state instead of
// the tree — git grep against any branch or tag (v3 is a branch of quack,
// so `main` reaches v1, `v2` reaches v2).
// Results are LOCATIONS; the remedy for "show me more" is a range read.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { relative, resolve, sep } from "node:path";
import { isRootRef, resolveDeclaredRoot, resolveForRead } from "./paths.ts";

export interface Match {
  path: string;
  line: number;
  text: string;
  /** Present on lines that RIDE ALONG a hit (the context option), so a
   *  neighbour is never mistaken for a match. */
  context?: true;
}

export interface SearchResult {
  query: string;
  engine: "ripgrep" | "git-grep";
  ref?: string;
  matches: Match[];
  total: number;
  truncated: boolean;
  /** count_only: per-file match counts instead of matches — the answer to
   *  "how many / where roughly", at a fraction of the tokens. */
  counts?: { path: string; count: number }[];
  /** Files ripgrep refused to read as text. Present only when non-empty:
   *  an unreadable file must never be indistinguishable from no matches. */
  unreadable?: string[];
}

const LINE_CAP = 300;
const PER_FILE_CAP = 50;
const UNBOUNDED_FILE_CAP = 1_000_000;
// Context is capped, because context lines multiply: 100 hits at -C 10 is
// 2100 lines of result. Beyond the cap the remedy is a range read.
const CONTEXT_CAP = 10;

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined || Number.isFinite(limit) === false) return 100;
  if (limit <= 0) return Number.MAX_SAFE_INTEGER;
  return Math.floor(limit);
}

function perFileCap(limit: number | undefined): number {
  if (limit === undefined || Number.isFinite(limit) === false) return PER_FILE_CAP;
  if (limit <= 0) return UNBOUNDED_FILE_CAP;
  return Math.max(PER_FILE_CAP, Math.floor(limit));
}

let rgPathCached: string | undefined;

/** SE_RG_PATH env override, else @vscode/ripgrep's binary, else PATH rg.
 *  Throws when none exists — the RUNME is the remedy. The env override is
 *  how a COPIED engine (test roots) or a spawned condition script finds
 *  the binary the real repo's npm install provided. */
export function rgPath(): string {
  if (rgPathCached !== undefined) return rgPathCached;
  const envPath = process.env.SE_RG_PATH;
  if (envPath !== undefined && envPath !== "" && spawnSync(envPath, ["--version"], { stdio: "ignore" }).status === 0) {
    rgPathCached = envPath;
    return rgPathCached;
  }
  try {
    const req = createRequire(import.meta.url);
    const mod = req("@vscode/ripgrep") as { rgPath: string };
    if (spawnSync(mod.rgPath, ["--version"], { stdio: "ignore" }).status === 0) {
      rgPathCached = mod.rgPath;
      return rgPathCached;
    }
  } catch {
    // fall through to PATH
  }
  if (spawnSync("rg", ["--version"], { stdio: "ignore" }).status === 0) {
    rgPathCached = "rg";
    return rgPathCached;
  }
  throw new Error("ripgrep is a hard dependency and was not found — run RUNME.ps1 (npm install provides @vscode/ripgrep)");
}

export interface SearchOpts {
  path?: string;
  ref?: string;
  ignore_case?: boolean;
  limit?: number;
  /** Lines around each hit (rg -C). Capped at CONTEXT_CAP; deeper wants a range read. */
  context?: number;
  /** Asymmetric context (rg -B / -A) — the Select-String -Context 1,6 shape. Wins over context. */
  before?: number;
  after?: number;
  /** Filename glob filter, e.g. **\/*.ts — the Get-ChildItem-then-pipe shape, in one call. */
  include?: string;
  /** Per-file counts instead of matches — "how many / where roughly" for a fraction of the tokens. */
  count_only?: boolean;
}

export function search(root: string, query: string, opts: SearchOpts = {}): SearchResult {
  const limit = normalizeLimit(opts.limit);
  if (opts.count_only === true) {
    const counts = opts.ref === undefined ? rgCount(root, query, opts) : gitGrepCount(root, query, opts.ref, opts);
    return {
      query,
      engine: opts.ref === undefined ? "ripgrep" : "git-grep",
      ...(opts.ref !== undefined ? { ref: opts.ref } : {}),
      matches: [],
      total: counts.reduce((n, c) => n + c.count, 0),
      truncated: counts.length > limit,
      counts: counts.slice(0, limit),
    };
  }
  const unreadable: string[] = [];
  const matches = opts.ref === undefined ? rgSearch(root, query, opts, unreadable) : gitGrepSearch(root, query, opts.ref, opts);
  return {
    query,
    engine: opts.ref === undefined ? "ripgrep" : "git-grep",
    ...(opts.ref !== undefined ? { ref: opts.ref } : {}),
    matches: matches.slice(0, limit),
    total: matches.length,
    truncated: matches.length > limit,
    // A FILE THAT CANNOT BE SEARCHED SAYS SO (found live 2026-07-29).
    // engine/worktree.ts carried one raw NUL byte as a cache-key separator.
    // ripgrep called the whole file binary and reported it on a line this
    // parser did not understand, so the line was dropped and the search
    // returned an empty, confident "no matches".
    //
    // The file was invisible to every search in the lane, and nothing ever
    // said so. An empty result and an unreadable file must never look alike.
    ...(unreadable.length > 0 ? { unreadable } : {}),
  };
}

/** Scope resolution shared by every rg mode: where to search, and how a hit
 *  inside a declared root reports — as "@name/rel", never as a pile of ../..
 *  What the search returns, the reader accepts unchanged. */
function rgScope(root: string, opts: { path?: string }): { scope: string; base: string; show: (abs: string) => string } {
  const scope = opts.path === undefined ? resolve(root) : resolveForRead(root, opts.path, "engine/search.ts");
  const rootRef = opts.path !== undefined && isRootRef(opts.path);
  const rootName = rootRef ? opts.path!.slice(1).split(/[\\/]+/)[0] : "";
  const base = rootRef ? resolveDeclaredRoot(root, `@${rootName}`, "engine/search.ts") : resolve(root);
  const prefix = rootRef ? `@${rootName}/` : "";
  const show = (abs: string): string => {
    const rel = relative(base, abs).split(sep).join("/");
    return rel === "" ? abs : prefix + rel;
  };
  return { scope, base, show };
}

function rgCommonArgs(opts: SearchOpts): string[] {
  const args: string[] = [];
  for (const d of [".se", "node_modules", ".worktrees"]) args.push("--glob", `!${d}/**`);
  if (opts.include !== undefined) args.push("--glob", opts.include);
  if (opts.ignore_case === true) args.push("--ignore-case");
  return args;
}

/** count_only: rg --count. One line per file, no match text at all. */
function rgCount(root: string, query: string, opts: SearchOpts): { path: string; count: number }[] {
  const { scope, base, show } = rgScope(root, opts);
  const args = ["--count", "--no-heading", "--with-filename", ...rgCommonArgs(opts), "--regexp", query, scope];
  const r = spawnSync(rgPath(), args, { cwd: base, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0 && r.status !== 1) throw new Error(`ripgrep failed: ${r.stderr}`);
  const out: { path: string; count: number }[] = [];
  for (const line of (r.stdout ?? "").split("\n")) {
    const m = line.match(/^(.+?):(\d+)$/);
    if (m !== null) out.push({ path: show(m[1]), count: Number(m[2]) });
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

/** context / before / after, capped, as rg flags. before/after win over context. */
function contextFlags(opts: SearchOpts): string[] {
  const cap = (n: number | undefined): number => (n !== undefined && n > 0 ? Math.min(Math.floor(n), CONTEXT_CAP) : 0);
  const b = cap(opts.before);
  const a = cap(opts.after);
  if (b > 0 || a > 0) return [...(b > 0 ? ["--before-context", String(b)] : []), ...(a > 0 ? ["--after-context", String(a)] : [])];
  const c = cap(opts.context);
  return c > 0 ? ["--context", String(c)] : [];
}

function rgSearch(root: string, query: string, opts: SearchOpts, unreadable: string[] = []): Match[] {
  const { scope, base, show } = rgScope(root, opts);
  const ctx = contextFlags(opts);
  // CONTEXT RIDES AS JSON. rg's plain output separates a context line from a
  // match line by ':' versus '-' — inside a path full of dashes that parse is
  // a guess. --json names every event, so a neighbour can never be mistaken
  // for a hit.
  if (ctx.length > 0) {
    const args = ["--json", ...ctx, "--max-count", String(perFileCap(opts.limit)), ...rgCommonArgs(opts), "--regexp", query, scope];
    const r = spawnSync(rgPath(), args, { cwd: base, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    if (r.status !== 0 && r.status !== 1) throw new Error(`ripgrep failed: ${r.stderr}`);
    const out: Match[] = [];
    for (const line of (r.stdout ?? "").split("\n")) {
      if (line.trim() === "") continue;
      let ev: {
        type?: string;
        data?: { path?: { text?: string }; line_number?: number; lines?: { text?: string }; binary_offset?: number | null };
      };
      try {
        ev = JSON.parse(line);
      } catch {
        continue;
      }
      const p = ev.data?.path?.text;
      if (ev.type === "end" && typeof ev.data?.binary_offset === "number" && p !== undefined) {
        unreadable.push(show(p));
        continue;
      }
      if ((ev.type !== "match" && ev.type !== "context") || p === undefined || ev.data?.line_number === undefined) continue;
      const text = (ev.data.lines?.text ?? "").replace(/\r?\n$/, "").slice(0, LINE_CAP);
      out.push({ path: show(p), line: ev.data.line_number, text, ...(ev.type === "context" ? { context: true as const } : {}) });
    }
    return out;
  }
  // --with-filename: rg drops the filename for a single-file scope, which
  // starved the path:line:text parser — every match silently vanished.
  // --binary: without it ripgrep skips a binary file in a DIRECTORY search
  // and says nothing whatsoever — no line, no warning, no exit code. With it,
  // the file is named on a "binary file matches" line, which the loop below
  // turns into `unreadable`. --text was the alternative and was rejected: it
  // would search real binaries as text and spray them through the results.
  const args = [
    "--line-number",
    "--no-heading",
    "--with-filename",
    "--binary",
    "--max-count",
    String(perFileCap(opts.limit)),
    "--max-columns",
    String(LINE_CAP),
    ...rgCommonArgs(opts),
    "--regexp",
    query,
    scope,
  ];
  // THE EXCLUSION GLOBS ARE RELATIVE TO THE WORKING DIRECTORY, never to the
  // search target. Without a cwd of its own, ripgrep resolved them against
  // the SERVER's cwd — and a bound expedition worktree lives under
  // .worktrees, so `!.worktrees/**` excluded every file of the very tree the
  // search was pointed at. Every directory search in an open expedition
  // returned a confident, empty "no matches" (found live 2026-07-30).
  // A single named FILE survived it, because ripgrep never applies these
  // filters to a target it was handed explicitly — which is what made the
  // failure look like a parser bug rather than a scoping one.
  const r = spawnSync(rgPath(), args, { cwd: base, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0 && r.status !== 1) throw new Error(`ripgrep failed: ${r.stderr}`);
  const out: Match[] = [];
  for (const line of (r.stdout ?? "").split("\n")) {
    if (line.trim() === "") continue;
    // ripgrep announces a skipped file as "<path>: binary file matches (...)",
    // which has no line number and so never parsed. Catch it before the drop.
    const bin = line.match(/^(.+?): binary file matches/);
    if (bin !== null) {
      unreadable.push(show(bin[1]));
      continue;
    }
    const m = line.match(/^(.{1,}?):(\d+):(.*)$/s);
    if (m === null) continue;
    out.push({ path: show(m[1]), line: Number(m[2]), text: m[3].slice(0, LINE_CAP) });
  }
  return out;
}

/** The include glob as a git pathspec, ANDed with the path scope when both
 *  are given (two bare pathspecs would union, which is the wrong answer to
 *  "these files under this directory"). */
function gitPathspec(opts: { path?: string; include?: string }): string[] {
  if (opts.include === undefined) return opts.path === undefined ? [] : ["--", opts.path];
  const inc = opts.include.replace(/^\.?\//, "");
  return ["--", opts.path === undefined ? `:(glob)${inc}` : `:(glob)${opts.path.replace(/\/+$/, "")}/${inc}`];
}

/** count_only at a ref: git grep -c. */
function gitGrepCount(root: string, query: string, ref: string, opts: SearchOpts): { path: string; count: number }[] {
  const args = ["grep", "-c", "-I", "-E"];
  if (opts.ignore_case === true) args.push("-i");
  args.push(query, ref, ...gitPathspec(opts));
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0 && r.status !== 1) throw new Error(`git grep failed: ${(r.stderr ?? "").trim() || `exit ${r.status}`}`);
  const out: { path: string; count: number }[] = [];
  for (const line of (r.stdout ?? "").split("\n")) {
    const m = line.match(/^(.+?):(.+?):(\d+)$/);
    if (m !== null) out.push({ path: m[2], count: Number(m[3]) });
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

/** Search a committed state: git grep at a ref. Path scope is a pathspec. */
function gitGrepSearch(root: string, query: string, ref: string, opts: SearchOpts): Match[] {
  const ctx = contextFlags(opts).map((f) =>
    f.replace("--before-context", "-B").replace("--after-context", "-A").replace("--context", "-C"),
  );
  const args = ["grep", "-n", "-I", "-E", "--max-count", String(perFileCap(opts.limit)), ...ctx];
  if (opts.ignore_case === true) args.push("-i");
  args.push(query, ref, ...gitPathspec(opts));
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0 && r.status !== 1) throw new Error(`git grep failed: ${(r.stderr ?? "").trim() || `exit ${r.status}`}`);
  const out: Match[] = [];
  for (const line of (r.stdout ?? "").split("\n")) {
    if (line.trim() === "" || line === "--") continue;
    // <ref>:<path>:<line>:<text> — a context line separates with '-' instead.
    // git grep has no --json; inside a dashed path this parse is best-effort,
    // which is why the tree-side search (the common case) went to rg --json.
    const m = line.match(/^(.+?):(.+?):(\d+):(.*)$/s);
    if (m !== null) {
      out.push({ path: m[2], line: Number(m[3]), text: m[4].slice(0, LINE_CAP) });
      continue;
    }
    const c = line.match(/^(.+?):(.+?)-(\d+)-(.*)$/s);
    if (c !== null) out.push({ path: c[2], line: Number(c[3]), text: c[4].slice(0, LINE_CAP), context: true });
  }
  return out;
}
