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
import { resolveInRoot } from "./paths.ts";

export interface Match {
  path: string;
  line: number;
  text: string;
}

export interface SearchResult {
  query: string;
  engine: "ripgrep" | "git-grep";
  ref?: string;
  matches: Match[];
  total: number;
  truncated: boolean;
}

const LINE_CAP = 300;
const PER_FILE_CAP = 50;

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

export function search(
  root: string,
  query: string,
  opts: { path?: string; ref?: string; ignore_case?: boolean; limit?: number } = {},
): SearchResult {
  const limit = opts.limit ?? 100;
  const matches = opts.ref === undefined ? rgSearch(root, query, opts) : gitGrepSearch(root, query, opts.ref, opts);
  return {
    query,
    engine: opts.ref === undefined ? "ripgrep" : "git-grep",
    ...(opts.ref !== undefined ? { ref: opts.ref } : {}),
    matches: matches.slice(0, limit),
    total: matches.length,
    truncated: matches.length > limit,
  };
}

function rgSearch(root: string, query: string, opts: { path?: string; ignore_case?: boolean }): Match[] {
  const scope = opts.path === undefined ? resolve(root) : resolveInRoot(root, opts.path, "engine/search.ts");
  const args = ["--line-number", "--no-heading", "--max-count", String(PER_FILE_CAP), "--max-columns", String(LINE_CAP)];
  for (const d of [".se", "node_modules", ".worktrees"]) args.push("--glob", `!${d}/**`);
  if (opts.ignore_case === true) args.push("--ignore-case");
  args.push("--regexp", query, scope);
  const r = spawnSync(rgPath(), args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0 && r.status !== 1) throw new Error(`ripgrep failed: ${r.stderr}`);
  const out: Match[] = [];
  for (const line of (r.stdout ?? "").split("\n")) {
    if (line.trim() === "") continue;
    const m = line.match(/^(.{1,}?):(\d+):(.*)$/s);
    if (m === null) continue;
    const rel = relative(root, m[1]).split(sep).join("/");
    out.push({ path: rel === "" ? m[1] : rel, line: Number(m[2]), text: m[3].slice(0, LINE_CAP) });
  }
  return out;
}

/** Search a committed state: git grep at a ref. Path scope is a pathspec. */
function gitGrepSearch(root: string, query: string, ref: string, opts: { path?: string; ignore_case?: boolean }): Match[] {
  const args = ["grep", "-n", "-I", "-E", "--max-count", String(PER_FILE_CAP)];
  if (opts.ignore_case === true) args.push("-i");
  args.push(query, ref);
  if (opts.path !== undefined) args.push("--", opts.path);
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0 && r.status !== 1) throw new Error(`git grep failed: ${(r.stderr ?? "").trim() || `exit ${r.status}`}`);
  const out: Match[] = [];
  for (const line of (r.stdout ?? "").split("\n")) {
    if (line.trim() === "") continue;
    // <ref>:<path>:<line>:<text>
    const m = line.match(/^(.+?):(.+?):(\d+):(.*)$/s);
    if (m === null) continue;
    out.push({ path: m[2], line: Number(m[3]), text: m[4].slice(0, LINE_CAP) });
  }
  return out;
}
