// see dsp-resolution-seam.md#the-path-jail
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

/** Directories the lane never serves or lists. */
export const EXCLUDED_DIRS = new Set([".git", "node_modules", ".se", ".venv", "__pycache__"]);

/** True for a path addressing a declared root, e.g. "@desktop/sketch.png". */
export const isRootRef = (p: string): boolean => p.startsWith("@");

/** see dsp-resolution-seam.md#the-owners-declared-roots-read-live-so-an-edit */
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
      remedy: {
        tool: "se_pull",
        args: {},
        note: "ask the OWNER to fix the file — a declaration that cannot be read must never pass for none declared",
      },
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
      remedy: {
        tool: "se_file_read",
        args: { path: p },
        note: "copy what you need into the product; foreign folders are never written from here",
      },
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

/** see dsp-resolution-seam.md#what-kind-of-thing-a-path-is */
export type PathKind = "session" | "method" | "record" | "content";

/** see dsp-resolution-seam.md#the-method-surfaces-as-root-relative-prefixes */
export const METHOD_PREFIXES = [
  "project/guidance/",
  "project/deliverable/machines/",
  "project/deliverable/engine/",
  "project/deliverable/tests/",
] as const;

/** The prompt layer is METHOD that does not live under a method folder. It is
 *  PROJECTED into each tree by place-prompt-layer, so every tree needs it and
 *  no tree owns it. */
export const METHOD_FILES = ["project/AGENTS.md", "project/CLAUDE.md", "project/.github/instructions/protocol.instructions.md"] as const;

/** Normalise separators once, so every rule below reads one shape. */
const slashed = (p: string): string => p.replace(/\\/g, "/").replace(/^\.\//, "");

/** WHICH RECORD OWNS THIS PATH, if any.
 *
 *  Returns the container and the record id, so the caller can find that
 *  record's tree. Undefined means no record owns it. */
export function recordOwnerOf(rel: string): { container: "iterations" | "expeditions"; id: string } | undefined {
  const m = /^project\/spec\/(iterations|expeditions)\/([^/]+)\//.exec(slashed(rel));
  if (m === null) return undefined;
  return { container: m[1] as "iterations" | "expeditions", id: m[2] };
}

export function pathKind(rel: string): PathKind {
  if (isRootRef(rel)) return "session";
  const p = slashed(rel);
  if (p.split("/")[0] === ".se") return "session";
  if (METHOD_FILES.includes(p as (typeof METHOD_FILES)[number])) return "method";
  if (METHOD_PREFIXES.some((pre) => p.startsWith(pre))) return "method";
  if (recordOwnerOf(p) !== undefined) return "record";
  return "content";
}

// `fansOut` IS GONE (i34). It answered whether a method write had to reach
// every tree. There is one tree, so every write already reaches all of them.
//
// `pathKind` STAYS and still answers "method", because routing still sends
// method and session state to the core. What is gone is the second question
// that turned that answer into a COPY.

/** WHO OWNS THIS PATH. Routing, which is NOT resolution.
 *
 *  THE DISTINCTION IS THE SEAM'S MOST IMPORTANT RULE. A path that RESOLVES
 *  outside its record is a misresolution and is refused. A call naming a
 *  different OWNER is not that — it is a routing decision, and refusing it
 *  would close the door that method changes and commits both use.
 *
 *  Confusing the two is what SE-C-134 does today: it refuses a method write
 *  from inside a record, where the honest answer is that the core owns method
 *  and the call belongs there.
 *
 *  THIS FUNCTION NEVER REFUSES. It answers who owns the path and stops. */
export type Owner = { kind: "core" } | { kind: "record"; container: "iterations" | "expeditions"; id: string } | { kind: "bound" };

export function routeToOwner(rel: string): Owner {
  const kind = pathKind(rel);
  // Session state and method are machine-wide. One copy, served by the core.
  if (kind === "session" || kind === "method") return { kind: "core" };
  const owner = recordOwnerOf(rel);
  if (owner !== undefined) return { kind: "record", container: owner.container, id: owner.id };
  // Everything else rides the record the walk is working in.
  return { kind: "bound" };
}
