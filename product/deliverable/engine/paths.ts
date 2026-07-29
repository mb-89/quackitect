// The path jail. Every lane path is root-relative; anything resolving outside
// the project root is refused. The jail is checked at the resolver — no tool
// implements its own path handling.
//
// DECLARED ROOTS (ported from v2's req-search-roots; owner ruling 2026-07-29).
// A read may address a declared root as "@name/rest". The rule the fence
// actually protects is DECLARED, NEVER ARBITRARY: the agent cannot widen its
// own reach, and every read stays logged. Roots are READ surfaces, never write
// targets, and they live in .se/roots.json — machine-local on purpose, because
// an absolute path means nothing on anyone else's machine.
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

/** Directories the lane never serves or lists. */
export const EXCLUDED_DIRS = new Set([".git", "node_modules", ".se", ".venv", "__pycache__"]);

/** True for a path addressing a declared root, e.g. "@desktop/sketch.png". */
export const isRootRef = (p: string): boolean => p.startsWith("@");

/** The owner's declared roots, read LIVE so an edit binds the very next call. */
export function declaredRoots(root: string): Record<string, string> {
  try {
    const p = join(root, ".se", "roots.json");
    if (!existsSync(p)) return {};
    const parsed = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
    const map = (typeof parsed.roots === "object" && parsed.roots !== null ? parsed.roots : parsed) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(map)) if (typeof v === "string") out[k] = v;
    return out;
  } catch {
    return {};
  }
}

/** Resolve "@name/rest" against the declared roots. Read lanes only. */
export function resolveDeclaredRoot(root: string, p: string, source: string): string {
  const [name, ...rest] = p.slice(1).split(/[\\/]+/);
  const roots = declaredRoots(root);
  const target = roots[name];
  if (target === undefined) {
    throw new Rejection({
      clause: CLAUSES.UNDECLARED_ROOT,
      expected: `a declared root (${Object.keys(roots).join(", ") || "none declared"})`,
      got: `@${name}`,
      remedy: {
        tool: "se_tick",
        args: {},
        note: "ask the OWNER to declare it in .se/roots.json — an agent never widens its own reach",
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
  throw new Rejection({
    clause: CLAUSES.PATH_ESCAPE,
    expected: "a path inside the project root (root-relative, e.g. product/spec/x.md)",
    got: p,
    remedy: { tool: "se_file_list", args: { dir: "." }, note: "list the root to see what exists" },
    source,
  });
}

export function isExcluded(rootRelative: string): boolean {
  return rootRelative.split(sep).some((part) => EXCLUDED_DIRS.has(part));
}

export function seDir(root: string): string {
  return join(root, ".se");
}
