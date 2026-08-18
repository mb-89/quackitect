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
// machine-local on purpose (an absolute path means nothing on anyone else's
// machine).
//
// A ROOT IS READ-ONLY UNLESS ITS DECLARATION SAYS `writable: true` (i16).
// That writable door is how this engine drives a project that is not itself.
// The one target it may never reach is the tree it was produced from, and
// SE-C-140 compares recorded identities rather than paths to say so.
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { actBoundTree } from "./actbound.ts";
import { CLAUSES, Rejection } from "./errors.ts";

/** Directories the lane never serves or lists. */
export const EXCLUDED_DIRS = new Set([".git", "node_modules", ".se", ".venv", "__pycache__"]);

/** True for a path addressing a declared root, e.g. "@desktop/sketch.png". */
export const isRootRef = (p: string): boolean => p.startsWith("@");

/** A declared root: where it is, and whether a WRITE lane may reach it.
 *
 *  TWO SHAPES ARE LEGAL IN .se/roots.json and the short one is unchanged. A
 *  bare string declares a read-only root exactly as it always did. An object
 *  declares one a write lane may reach, and it has to say so out loud:
 *
 *      {"books": "C:\\books"}                        read-only
 *      {"site": {"path": "C:\\site", "writable": true}}   writable
 *
 *  WRITABLE IS OPT-IN AND NEVER INFERRED. The old shape keeps its old meaning,
 *  so no declaration anybody already wrote becomes writable by upgrading. */
export type DeclaredRoot = { path: string; writable: boolean };

/** The two files that carry a tree's IDENTITY, as root-relative paths.
 *
 *  IDENTITY, NEVER AN ADDRESS. A vehicle records the identity of the engine it
 *  came from, and every tree states its own. Comparing identities survives
 *  either tree being moved, copied or renamed, which comparing paths does not. */
const BRAND_FILE = ["project", "deliverable", "brand", "brand.json"] as const;
const UPSTREAM_FILE = ["project", "deliverable", "vendor", "upstream", "upstream.json"] as const;

/** Read an `id` out of one of those files. Absent is a real answer; unreadable
 *  is NOT.
 *
 *  A FILE THAT CANNOT BE READ MUST NEVER PASS FOR AN ABSENT ONE. That is the
 *  lesson `declaredRoots` learned the hard way on 2026-07-29, and it is worse
 *  here: a swallowed parse error would silently switch the source guard off,
 *  and the guard going quiet looks exactly like the guard passing. */
function identityIn(dir: string, parts: readonly string[], source: string): string | undefined {
  const p = join(dir, ...parts);
  if (!existsSync(p)) return undefined;
  let parsed: { id?: unknown };
  try {
    parsed = JSON.parse(readFileSync(p, "utf8").replace(/^\uFEFF/, "")) as { id?: unknown };
  } catch (e) {
    throw new Rejection({
      clause: CLAUSES.WRITE_TARGET_IS_SOURCE,
      expected: 'an identity file that parses, e.g. {"id": "quackitect"}',
      got: `${p} does not parse: ${(e as Error).message}`,
      remedy: {
        tool: "se_file_read",
        args: { path: p },
        note: "fix the JSON by hand — the guard that keeps a vehicle out of the tree it came from cannot decide without this file, so it refuses rather than waving the write through",
      },
      source,
    });
  }
  return typeof parsed.id === "string" ? parsed.id : undefined;
}

/** THE SOURCE GUARD. A vehicle may never write into the tree it was produced
 *  from — [[req-nothing-a-copy-does-reaches-its-source]], graded fatal.
 *
 *  IT ONLY HAS ANYTHING TO SAY IN A VEHICLE. The engine itself was produced
 *  from nothing, has no upstream file, and this returns at the first line. */
function refuseIfTargetIsSource(root: string, name: string, declared: DeclaredRoot, p: string, source: string): void {
  const cameFrom = identityIn(root, UPSTREAM_FILE, source);
  if (cameFrom === undefined) return;
  const targetIs = identityIn(resolve(declared.path), BRAND_FILE, source);
  if (targetIs !== cameFrom) return;
  throw new Rejection({
    clause: CLAUSES.WRITE_TARGET_IS_SOURCE,
    expected: "a writable target that is not the tree this system came from",
    got: `${p} — @${name} is "${targetIs}", which is the identity this tree records as its own upstream`,
    remedy: {
      tool: "se_file_read",
      args: { path: p },
      note: "read it if you must; nothing this tree does may change the tree it was produced from, and making the root writable does not lift that",
    },
    source,
  });
}

/** The owner's declared roots, read LIVE so an edit binds the very next call.
 *
 *  A DECLARATION THAT CANNOT BE READ MUST NEVER READ AS "NONE DECLARED" (found
 *  live 2026-07-29): PowerShell wrote this file with a UTF-8 BOM, JSON.parse
 *  refused it, and a swallowing catch reported the owner's root as undeclared.
 *  The BOM is stripped, and a broken file is now a LOUD refusal. */
export function declaredRoots(root: string, source = "engine/paths.ts"): Record<string, DeclaredRoot> {
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
  const out: Record<string, DeclaredRoot> = {};
  for (const [k, v] of Object.entries(map)) {
    if (typeof v === "string") out[k] = { path: v, writable: false };
    else if (typeof v === "object" && v !== null) {
      const o = v as { path?: unknown; writable?: unknown };
      if (typeof o.path === "string") out[k] = { path: o.path, writable: o.writable === true };
    }
  }
  return out;
}

/** Resolve "@name/rest" against the declared roots.
 *
 *  THE WRITE LANE CALLS THIS TOO, for a root whose declaration says writable.
 *  resolveInRoot is where a root that does not say so is refused, so this
 *  function answers the same way for both lanes and the policy lives in one
 *  place. */
export function resolveDeclaredRoot(root: string, p: string, source: string): string {
  const [name, ...rest] = p.slice(1).split(/[\\/]+/);
  const roots = declaredRoots(root, source);
  const declared = roots[name];
  if (declared === undefined) {
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
  const base = resolve(declared.path);
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

/** Read lanes resolve here: the project root, OR a declared root.
 *
 *  IT CALLS THE CONTAINMENT RULE DIRECTLY rather than going through
 *  resolveInRoot, because that function now also applies a producing act's
 *  bound. A READ MUST NEVER BE BOUNDED: the act copies FROM the tree it is
 *  reading, so bounding its reads would leave it unable to read the thing it
 *  is reproducing. The rule itself is the same rule either way. */
export function resolveForRead(root: string, p: string, source: string): string {
  return isRootRef(p) ? resolveDeclaredRoot(root, p, source) : containedIn(root, p, source);
}

export function resolveInRoot(root: string, p: string, source: string): string {
  // THE ACT'S BOUND IS CHECKED HERE, not only at the seam.
  //
  // THIS IS THE FUNCTION EVERY WRITE VERB ACTUALLY CALLS. The seam is reached
  // by se_lint's two reads and nothing else today, so a bound placed only
  // there would guard almost no write in the product. The jail is where the
  // rule has to live for the guarantee to be real.
  const bound = actBoundTree();
  if (bound !== undefined) return resolveInActBound(bound, p, source);
  if (isRootRef(p)) {
    // A ROOT DECLARED WRITABLE IS THE ONE WAY OUT, and it goes through the
    // resolver that already contains a declared root rather than a second one
    // written here. The containment rule is therefore the same rule, proved
    // once — which is what stops this door widening as it is used.
    const name = p.slice(1).split(/[\\/]+/)[0];
    const declared = declaredRoots(root, source)[name];
    if (declared?.writable === true) {
      refuseIfTargetIsSource(root, name, declared, p, source);
      return resolveDeclaredRoot(root, p, source);
    }
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "a path inside the project root — a declared root is READ-ONLY unless it says otherwise",
      got: p,
      remedy: {
        tool: "se_file_read",
        args: { path: p },
        note: 'copy what you need into the product. A root meant to be written declares itself so: {"name": {"path": "<absolute path>", "writable": true}} in .se/roots.json — ask the owner first.',
      },
      source,
    });
  }
  return containedIn(root, p, source);
}

/** THE CONTAINMENT RULE ITSELF: inside this root, or refused.
 *
 *  ONE RULE, PROVED ONCE. Both lanes reach it — the write lane through
 *  resolveInRoot, the read lane directly — so widening the jail to admit a
 *  second write target could never fork the rule into two versions that drift. */
function containedIn(root: string, p: string, source: string): string {
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
      note: "two doors lead outside, and neither is a path. PAST VERSIONS of this repo are read at a committed ref: se_file_read / se_file_search / se_file_glob all take ref (main reaches v1, v2 reaches v2). ANOTHER FOLDER entirely belongs in .se/roots.json as a declared root, reachable as @name/rest — read-only unless the declaration says writable. Ask the owner before declaring one.",
    },
    source,
  });
}

/** Resolve inside the tree an ACT is producing.
 *
 *  THE RULE IS THE SAME RULE. Every act writes inside one tree and nowhere
 *  else. What differs is WHICH tree, and that the refusal says which — a write
 *  that left the act's bound is a different fault from one that left the
 *  project, and telling them apart is what makes the mechanism debuggable
 *  (opt-the-bound-travels-with-the-act). */
export function resolveInActBound(bound: string, p: string, source: string): string {
  const base = resolve(bound);
  if (isRootRef(p)) {
    throw new Rejection({
      clause: CLAUSES.OUTSIDE_ACT_BOUND,
      expected: `a path inside the tree this act is producing (${base})`,
      got: `${p} — a declared root is somebody else's folder, and a producing act writes one tree`,
      remedy: {
        tool: "se_file_read",
        args: { path: p },
        note: "read from a declared root if you need what is in it; a producing act writes only the tree it is producing",
      },
      source,
    });
  }
  const abs = isAbsolute(p) ? p : resolve(base, p);
  const rel = relative(base, abs);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) return abs;
  throw new Rejection({
    clause: CLAUSES.OUTSIDE_ACT_BOUND,
    expected: `a path inside the tree this act is producing (${base})`,
    got: `${p} resolves to ${abs}, which is outside it`,
    remedy: {
      tool: "se_file_list",
      args: { dir: "." },
      note: "the bound belongs to the act and is torn down with it. A path outside the tree being produced is not this act's to write, whatever the project root would have allowed.",
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

// `machineRootOf` IS GONE (i34). Its whole job was stripping `.worktrees/<id>`
// off a path to recover the machine root, and there are no worktrees to strip.
//
// ITS OWN COMMENT NAMED THE DEFECT IT CAUSED: se_lint resolved
// `.se/HANDOVER.md` against a worktree while the file lane resolved it against
// the machine root. Both were correct against their own ambient root, and
// neither answer said which. One root is the only shape where that cannot
// happen.

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

// `methodFilesIn` IS GONE (i34). It enumerated every method file in a tree so
// the reload could copy the whole set into every other tree — the backfill
// that caught what the write-time fan-out missed.
//
// BOTH EXISTED FOR THE SAME REASON: several trees held copies of one file. The
// failure its comment recorded — a worktree holding a NEW session.ts against
// an OLD paths.ts, unable to compile — cannot happen with one copy.
