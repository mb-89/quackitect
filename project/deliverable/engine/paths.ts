// The path jail. Every lane path is root-relative; anything resolving outside
// the project root is refused. The jail is checked at the resolver — no tool
// implements its own path handling.
//
// DECLARED ROOTS (ported from v2's req-search-roots; owner rulings 2026-07-29
// and 2026-07-30). A read may address a declared root as "@name/rest". The
// rule the fence protects is DECLARED, NEVER ARBITRARY: every reachable
// folder stands in .se/roots.json, and every read stays logged. The AGENT
// writes the declaration itself, through the lane — a person is never asked
// to hand-edit a dotfile they cannot be expected to understand. Roots are
// READ surfaces, never write targets, machine-local on purpose (an absolute
// path means nothing on anyone else's machine).
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

/** Directories the lane never serves or lists. */
export const EXCLUDED_DIRS = new Set([".git", "node_modules", ".se", ".venv", "__pycache__"]);

/** True for a path addressing a declared root, e.g. "@desktop/sketch.png". */
export const isRootRef = (p: string): boolean => p.startsWith("@");

/** The owner's declared roots, read LIVE so an edit binds the very next call.
 *
 *  A DECLARATION THAT CANNOT BE READ MUST NEVER READ AS "NONE DECLARED" (found
 *  live 2026-07-29): PowerShell wrote this file with a UTF-8 BOM, JSON.parse
 *  refused it, and a swallowing catch reported the owner's root as undeclared.
 *  The BOM is stripped, and a broken file is now a LOUD refusal. */
export function declaredRoots(root: string, source = "engine/paths.ts"): Record<string, string> {
  const p = join(root, ".se", "roots.json");
  if (!existsSync(p)) return {};
  const raw = readFileSync(p, "utf8").replace(/^\uFEFF/, "");
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (e) {
    throw new Rejection({
      clause: CLAUSES.UNDECLARED_ROOT,
      expected: 'a readable .se/roots.json, e.g. {"desktop": "C:\\\\Users\\\\you\\\\Desktop"}',
      got: `.se/roots.json does not parse: ${(e as Error).message}`,
      remedy: { tool: "se_pull", args: {}, note: "ask the OWNER to fix the file — a declaration that cannot be read must never pass for none declared" },
      source,
    });
  }
  const map = (typeof parsed.roots === "object" && parsed.roots !== null ? parsed.roots : parsed) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) if (typeof v === "string") out[k] = v;
  return out;
}

/** Resolve "@name/rest" against the declared roots. Read lanes only. */
export function resolveDeclaredRoot(root: string, p: string, source: string): string {
  const [name, ...rest] = p.slice(1).split(/[\\/]+/);
  const roots = declaredRoots(root, source);
  const target = roots[name];
  if (target === undefined) {
    throw new Rejection({
      clause: CLAUSES.UNDECLARED_ROOT,
      expected: `a declared root (${Object.keys(roots).join(", ") || "none declared"})`,
      got: `@${name}`,
      remedy: {
        tool: "se_file_write",
        args: { path: ".se/roots.json", content: `{\n  "${name}": "<absolute path>"\n}`, base_hash: null },
        note: "declare it yourself through the lane (read the file first if it exists) — the declaration is logged; never send a person to hand-edit a dotfile",
      },
      source,
    });
  }
  const base = resolve(target);
  const abs = resolve(base, rest.join("/"));
  if (abs !== base && !abs.startsWith(base + sep)) {
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: `a path inside the declared root @${name}`,
      got: p,
      remedy: { tool: "se_file_list", args: { dir: `@${name}` }, note: "no climbing out of a declared root" },
      source,
    });
  }
  return abs;
}

/** Read lanes resolve here: the project root, OR a declared root. */
export function resolveForRead(root: string, p: string, source: string): string {
  return isRootRef(p) ? resolveDeclaredRoot(root, p, source) : resolveInRoot(root, p, source);
}

export function resolveInRoot(root: string, p: string, source: string): string {
  if (isRootRef(p)) {
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "a path inside the project root — a declared root is READ-ONLY",
      got: p,
      remedy: { tool: "se_file_read", args: { path: p }, note: "copy what you need into the product; foreign folders are never written from here" },
      source,
    });
  }
  const abs = isAbsolute(p) ? p : resolve(root, p);
  const rel = relative(resolve(root), abs);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) return abs;
  // A REFUSAL NAMES THE DOOR. The measured driver for reaching outside the
  // root is the v1/v2 sibling checkout, and both ways in already exist — the
  // caller just has no reason to know them at the moment they are refused.
  throw new Rejection({
    clause: CLAUSES.PATH_ESCAPE,
    expected: "a path inside the project root (root-relative, e.g. project/spec/x.md)",
    got: p,
    remedy: {
      tool: "se_file_list",
      args: { dir: "." },
      note: "two doors lead outside, and neither is a path. PAST VERSIONS of this repo are read at a committed ref: se_file_read / se_file_search / se_file_glob all take ref (main reaches v1, v2 reaches v2). ANOTHER FOLDER entirely belongs in .se/roots.json as a declared, read-only root, reachable as @name/rest — ask the owner before declaring one.",
    },
    source,
  });
}

export function isExcluded(rootRelative: string): boolean {
  return rootRelative.split(sep).some((part) => EXCLUDED_DIRS.has(part));
}

export function seDir(root: string): string {
  return join(root, ".se");
}
