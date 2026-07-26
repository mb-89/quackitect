// The path jail. Every lane path is root-relative; anything resolving outside
// the project root is refused. The jail is checked at the resolver — no tool
// implements its own path handling.
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

/** Directories the lane never serves or lists. */
export const EXCLUDED_DIRS = new Set([".git", "node_modules", ".se", ".venv", "__pycache__"]);

export function resolveInRoot(root: string, p: string, source: string): string {
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
