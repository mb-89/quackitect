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

export interface PatchOp {
  path: string;
  old_string: string;
  new_string: string;
  base_hash?: string;
}

/**
 * MANY EDITS, ONE ACT (i12/R11, R12). se_file_patch applies exactly one edit
 * per call, which made it simultaneously the most-used product tool (645 calls)
 * and the most-failing (28) — and produced a hand-rolled sweep script when six
 * call sites needed the same change.
 *
 * ATOMICITY IS BY CONSTRUCTION, not by rollback: every op is resolved and
 * verified against disk FIRST, and nothing is written until all of them hold.
 * A failing guard therefore leaves the tree untouched, with no partial state to
 * unwind and no window where half the edits are visible.
 */
export function filePatchBatch(root: string, ops: PatchOp[]): { applied: number; files: string[] } {
  if (ops.length === 0) {
    throw new Rejection({
      clause: "SE-C-064",
      expected: "at least one edit",
      got: "an empty batch",
      remedy: { tool: "se_file_patch", args: { path: "<path>", old_string: "<old>", new_string: "<new>" }, note: "send the edits you mean to apply" },
      source: SRC,
    });
  }

  // PASS 1 — resolve and verify everything. Writes nothing.
  const planned: { abs: string; path: string; next: string }[] = [];
  const pending = new Map<string, string>(); // path -> content as it will be after earlier ops
  for (const [i, op] of ops.entries()) {
    refuseRootWrite(op.path);
    const abs = resolveInside(root, op.path);
    refuseLedgerWrite(root, abs, op.path);
    const current = pending.get(op.path) ?? fileRead(root, op.path).content;
    if (op.base_hash !== undefined && sha256(current) !== op.base_hash) {
      throw new Rejection({
        clause: "SE-C-063",
        expected: `disk hash ${op.base_hash} for ${op.path}`,
        got: sha256(current),
        remedy: { tool: "se_file_read", args: { path: op.path }, note: `edit ${i + 1} of ${ops.length} is stale — re-read and re-send the whole batch; NOTHING was applied` },
        source: SRC,
      });
    }
    const count = current.split(op.old_string).length - 1;
    if (count !== 1) {
      throw new Rejection({
        clause: "SE-C-064",
        expected: `old_string occurring exactly once (edit ${i + 1} of ${ops.length})`,
        got: `${count} occurrences in ${op.path}`,
        remedy: {
          tool: "se_file_patch",
          args: { path: op.path, old_string: "<longer, unique excerpt>", new_string: op.new_string },
          note: `edit ${i + 1} failed, so NOTHING in this batch was applied — the tree is untouched. ${count === 0 ? "Not found: re-read the file." : "Add surrounding lines until the match is unique."}`,
        },
        source: SRC,
      });
    }
    const next = current.replace(op.old_string, () => op.new_string);
    pending.set(op.path, next);
    planned.push({ abs, path: op.path, next });
  }

  // PASS 2 — write. Every guard already held; one write per FILE, not per op,
  // so several edits to one file land as its single final content.
  const finals = new Map<string, { abs: string; next: string }>();
  for (const p of planned) finals.set(p.path, { abs: p.abs, next: p.next });
  for (const [, f] of finals) writeFileSync(f.abs, f.next, "utf8");
  return { applied: ops.length, files: [...finals.keys()] };
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
