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
import { existsSync, readdirSync, readFileSync } from "node:fs";
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

/** WHAT KIND OF THING A PATH IS (owner ruling 2026-08-07).
 *
 *  THE FAILURE THIS ENDS. The engine served ONE tree, chosen by whether a
 *  walk happened to be bound at that instant. So the same path meant
 *  different files at different moments, and two failures followed it
 *  everywhere:
 *
 *  - A method change applied in one tree and the machine kept its old
 *    behaviour in the other. The person edits a row, the state machine does
 *    not change, and nothing says why.
 *  - A record's state was read from whichever tree was in hand. The mirror
 *    painted i1's states green out of trunk while i1's own worktree held the
 *    fall that knocked them down.
 *
 *  THE RULE. A path is resolved by WHAT IT IS, never by where the walk
 *  stands. Three kinds, and each has exactly one home:
 *
 *  - SESSION — `.se/` and the declared roots. Always the project root. The
 *    handover, the notes and the call log belong to the person's machine,
 *    not to a branch.
 *  - METHOD — guidance, machines, matrix rows, templates, the engine and the
 *    prompt layer. SHARED by every tree. A write fans out to all of them in
 *    one act, so a change takes effect wherever the reader is standing.
 *  - RECORD — one iteration's or expedition's own evidence and decisions.
 *    Owned by that record, and read from ITS tree whether or not it is
 *    bound. There is only ever one copy that counts, so nothing can drift.
 *
 *  CONTENT is everything else and behaves as it always did: it rides the
 *  tree the walk is working in. */
export type PathKind = "session" | "method" | "record" | "content";

/** The method surfaces, as root-relative prefixes. A change to any of these
 *  changes how the MACHINE behaves, which is why they cannot belong to one
 *  tree. Kept as a list rather than a clever rule: the set is small, it is
 *  read by people, and a wrong guess here is the bug this exists to kill. */
// THE TESTS ARE METHOD TOO. They are the engine's own proof, they belong to no
// record, and leaving them out produced exactly the fault this list exists to
// prevent: a worktree took the new engine and kept its old tests, so the suite
// failed on laws that had already been changed (found live 2026-08-07).
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

/** A METHOD write must reach every tree. This says so in one place, so the
 *  write lane and the tests agree on the question rather than each deciding
 *  it. */
export const fansOut = (rel: string): boolean => pathKind(rel) === "method";

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

/** THE MACHINE ROOT, derived from any root.
 *
 *  A record's worktree lives at <machine>/.worktrees/<id>, so the machine
 *  root is whatever stands before that. Derivable rather than passed, which
 *  is what makes the seam adoptable: a caller that knows ONE root can still
 *  send session state and shared method to the right place.
 *
 *  THIS IS THE 2026-08-14 DEFECT'S ROOT CAUSE. se_lint resolved
 *  `.se/HANDOVER.md` against a worktree while the file lane resolved it
 *  against the machine root. Both were correct against their own ambient
 *  root, and neither answer said which. */
export function machineRootOf(root: string): string {
  const m = /^(.*)[\\/]\.worktrees[\\/][^\\/]+$/.exec(root);
  return m === null ? root : m[1];
}

export function routeToOwner(rel: string): Owner {
  const kind = pathKind(rel);
  // Session state and method are machine-wide. One copy, served by the core —
  // which is what lets a method change reach every tree without the caller
  // stepping out of anything.
  if (kind === "session" || kind === "method") return { kind: "core" };
  const owner = recordOwnerOf(rel);
  if (owner !== undefined) return { kind: "record", container: owner.container, id: owner.id };
  // Everything else rides the tree the walk is working in.
  return { kind: "bound" };
}

/** EVERY METHOD FILE IN A TREE, root-relative.
 *
 *  THE FAN-OUT ALONE WAS NOT ENOUGH. It copies a method file when that file
 *  is WRITTEN, so every edit made before the mirror went live stayed in the
 *  tree it was written in. That gap shipped and then bit within the day: a
 *  worktree ended up holding a NEW session.ts against an OLD paths.ts and
 *  could not compile.
 *
 *  A PARTIAL SYNC IS WORSE THAN NONE. An unsynced tree is merely old and
 *  self-consistent. A half-synced one is broken, and it breaks at whatever
 *  moment somebody happens to run a check inside it.
 *
 *  So the reload backfills the whole set, and this is the set. */
export function methodFilesIn(root: string): string[] {
  const out: string[] = [];
  for (const rel of METHOD_FILES) if (existsSync(join(root, rel))) out.push(rel);
  for (const pre of METHOD_PREFIXES) {
    const abs = join(root, pre);
    if (!existsSync(abs)) continue;
    for (const e of readdirSync(abs, { recursive: true, withFileTypes: true })) {
      if (!e.isFile()) continue;
      const dir = (e as { parentPath?: string; path?: string }).parentPath ?? (e as { path?: string }).path ?? abs;
      out.push(relative(root, join(dir, e.name)).replace(/\\/g, "/"));
    }
  }
  return out;
}
