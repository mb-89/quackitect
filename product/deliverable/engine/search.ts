// The search lane — drop-in replacement for Grep. ripgrep when installed
// (the RUNME offers it; owner ruling 2026-07-25: "we overvalued zero
// dependency"), a pure-JS walk otherwise — same result shape either way.
// Results are LOCATIONS; the remedy for "show me more" is a range read.
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { isExcluded, resolveInRoot } from "./paths.ts";

export interface Match {
  path: string;
  line: number;
  text: string;
}

export interface SearchResult {
  query: string;
  engine: "ripgrep" | "js";
  matches: Match[];
  total: number;
  truncated: boolean;
}

const LINE_CAP = 300;

let rgAvailable: boolean | undefined;
export function hasRipgrep(): boolean {
  if (rgAvailable === undefined) {
    rgAvailable = spawnSync("rg", ["--version"], { stdio: "ignore" }).status === 0;
  }
  return rgAvailable;
}

export function search(
  root: string,
  query: string,
  opts: { path?: string; ignore_case?: boolean; limit?: number } = {},
): SearchResult {
  const limit = opts.limit ?? 100;
  const scope = opts.path === undefined ? root : resolveInRoot(root, opts.path, "engine/search.ts");
  const matches = hasRipgrep() ? rgSearch(root, scope, query, opts.ignore_case === true) : jsSearch(root, scope, query, opts.ignore_case === true);
  return {
    query,
    engine: hasRipgrep() ? "ripgrep" : "js",
    matches: matches.slice(0, limit),
    total: matches.length,
    truncated: matches.length > limit,
  };
}

function rgSearch(root: string, scope: string, query: string, ignoreCase: boolean): Match[] {
  const args = ["--line-number", "--no-heading", "--max-count", "50", "--max-columns", String(LINE_CAP)];
  for (const d of [".se", "node_modules"]) args.push("--glob", `!${d}/**`);
  if (ignoreCase) args.push("--ignore-case");
  args.push("--regexp", query, scope);
  const r = spawnSync("rg", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0 && r.status !== 1) throw new Error(`ripgrep failed: ${r.stderr}`);
  const out: Match[] = [];
  for (const line of (r.stdout ?? "").split("\n")) {
    if (line.trim() === "") continue;
    // <path>:<line>:<text> — path may contain ':' on Windows (C:\...), so
    // find the line-number field from the right of the drive-letter case.
    const m = line.match(/^(.{1,}?):(\d+):(.*)$/s);
    if (m === null) continue;
    const rel = relative(root, m[1]).split(sep).join("/");
    out.push({ path: rel === "" ? m[1] : rel, line: Number(m[2]), text: m[3].slice(0, LINE_CAP) });
  }
  return out;
}

function jsSearch(root: string, scope: string, query: string, ignoreCase: boolean): Match[] {
  const rx = new RegExp(query, ignoreCase ? "i" : "");
  const out: Match[] = [];
  const files: string[] = [];
  const gather = (p: string): void => {
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const e of readdirSync(p)) {
        const abs = join(p, e);
        if (isExcluded(relative(root, abs))) continue;
        gather(abs);
      }
    } else if (st.size < 2 * 1024 * 1024) files.push(p);
  };
  gather(scope);
  for (const f of files) {
    let text: string;
    try {
      text = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    if (text.includes("\u0000")) continue; // binary
    const lines = text.split("\n");
    let perFile = 0;
    for (let i = 0; i < lines.length && perFile < 50; i++) {
      if (rx.test(lines[i])) {
        out.push({ path: relative(root, f).split(sep).join("/"), line: i + 1, text: lines[i].slice(0, LINE_CAP) });
        perFile++;
      }
    }
  }
  return out;
}
