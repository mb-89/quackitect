// The file lane — drop-in replacements for Read / Write / Edit / ls / Glob.
// Built to the i12 standard from day one:
//   - offset/limit range reads; an oversize whole-file read is REFUSED with
//     the remedy inline, never silently truncated (v2's 132KB design doc was
//     unreadable through its own lane — that never happens here).
//   - batch patch: many edits, many files, one atomic call — every guard
//     checked before anything is written.
//   - CAS on every write: read returns the hash, write demands it. This is
//     also the read-before-write law, enforced mechanically.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { contentHash } from "./hash.ts";
import { isExcluded, resolveInRoot } from "./paths.ts";

/** Whole-file read budget (chars). Beyond this, offset/limit is required. */
export const READ_BUDGET = 50_000;
/** Line cap for range reads — mirrors the native Read tool's default. */
export const RANGE_DEFAULT_LIMIT = 2000;
/** A single line longer than this is truncated with an honest marker. */
const LINE_CAP = 2000;

const SRC = "engine/files.ts";

function mustExist(root: string, path: string, source: string): string {
  const abs = resolveInRoot(root, path, source);
  if (!existsSync(abs)) {
    const dir = dirname(relative(root, abs));
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "an existing file",
      got: `${path} (not found)`,
      remedy: { tool: "se_file_list", args: { dir: dir === "" ? "." : dir }, note: "list the directory — the name may differ" },
      source,
    });
  }
  return abs;
}

export interface ReadResult {
  path: string;
  hash: string;
  total_lines: number;
  /** Present on range reads: which slice this is. */
  range?: { offset: number; limit: number };
  /** Present when the read came from a committed ref, not the working tree. */
  ref?: string;
  content: string;
  truncated_lines?: number[];
}

/** A committed blob: git show <ref>:<path>. The ref's tree layout may
 *  differ from today's — the remedy globs the ref, not the working tree. */
function gitShow(root: string, ref: string, path: string): string {
  const spec = `${ref}:${path.replace(/\\/g, "/")}`;
  const r = spawnSync("git", ["show", spec], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "an existing <ref>:<path> in this repository",
      got: `${spec} — ${(r.stderr ?? "").trim().split("\n")[0]}`,
      remedy: { tool: "se_file_glob", args: { glob: "**/*", ref }, note: "glob the ref's tree first — the layout differs between versions ('main' reaches v1, 'v2' reaches v2)" },
      source: SRC,
    });
  }
  return r.stdout;
}

export function fileRead(root: string, path: string, opts: { offset?: number; limit?: number; ref?: string } = {}): ReadResult {
  let raw: string;
  if (opts.ref !== undefined) {
    raw = gitShow(root, opts.ref, path);
  } else {
    const abs = mustExist(root, path, SRC);
    if (statSync(abs).isDirectory()) {
      throw new Rejection({
        clause: CLAUSES.PATH_ESCAPE,
        expected: "a file",
        got: `${path} is a directory`,
        remedy: { tool: "se_file_list", args: { dir: path } },
        source: SRC,
      });
    }
    raw = readFileSync(abs, "utf8");
  }
  const hash = contentHash(raw);
  const lines = raw.split("\n");
  const wantsRange = opts.offset !== undefined || opts.limit !== undefined;
  if (!wantsRange && raw.length > READ_BUDGET) {
    throw new Rejection({
      clause: CLAUSES.OVERSIZE_READ,
      expected: `a whole-file read under ${READ_BUDGET} chars — this file is ${raw.length} chars / ${lines.length} lines`,
      got: `whole-file read of ${path}`,
      remedy: {
        tool: "se_file_read",
        args: { path, offset: 1, limit: 400 },
        note: "read in parts; the hash covers the WHOLE file either way, so CAS writes still work",
      },
      source: SRC,
    });
  }
  const offset = Math.max(1, opts.offset ?? 1);
  const limit = wantsRange ? Math.max(1, opts.limit ?? RANGE_DEFAULT_LIMIT) : lines.length;
  const slice = lines.slice(offset - 1, offset - 1 + limit);
  const truncated: number[] = [];
  const numbered = slice.map((l, i) => {
    let line = l;
    if (line.length > LINE_CAP) {
      truncated.push(offset + i);
      line = `${line.slice(0, LINE_CAP)}…[line truncated, ${l.length} chars total]`;
    }
    return `${String(offset + i).padStart(5)}\t${line}`;
  });
  const res: ReadResult = { path, hash, total_lines: lines.length, content: numbered.join("\n") };
  if (opts.ref !== undefined) res.ref = opts.ref;
  if (wantsRange) res.range = { offset, limit };
  if (truncated.length > 0) res.truncated_lines = truncated;
  return res;
}

export interface WriteResult {
  path: string;
  hash: string;
  bytes: number;
  created: boolean;
}

export function fileWrite(root: string, path: string, content: string, baseHash: string | null): WriteResult {
  const abs = resolveInRoot(root, path, SRC);
  const exists = existsSync(abs);
  if (baseHash === null && exists) {
    throw new Rejection({
      clause: CLAUSES.CAS_MISMATCH,
      expected: `base_hash: null means CREATE, but ${path} already exists`,
      got: `existing file (hash ${contentHash(readFileSync(abs, "utf8"))})`,
      remedy: { tool: "se_file_read", args: { path }, note: "read it, then write with its hash — or pick a new name" },
      source: SRC,
    });
  }
  if (baseHash !== null) {
    if (!exists) {
      throw new Rejection({
        clause: CLAUSES.CAS_MISMATCH,
        expected: `an existing file to overwrite (base_hash given)`,
        got: `${path} does not exist`,
        remedy: { tool: "se_file_write", args: { path, content: "<content>", base_hash: null }, note: "base_hash: null creates" },
        source: SRC,
      });
    }
    const disk = contentHash(readFileSync(abs, "utf8"));
    if (disk !== baseHash) {
      throw new Rejection({
        clause: CLAUSES.CAS_MISMATCH,
        expected: `base_hash ${disk} (current disk state)`,
        got: baseHash,
        remedy: { tool: "se_file_read", args: { path }, note: "the file changed since you read it — re-read, re-apply your change" },
        source: SRC,
      });
    }
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, "utf8");
  return { path, hash: contentHash(content), bytes: Buffer.byteLength(content, "utf8"), created: !exists };
}

export interface PatchOp {
  path: string;
  old_string: string;
  new_string: string;
  /** Optional per-op CAS pin; when present it must match disk. */
  base_hash?: string;
  /** Replace every occurrence instead of demanding uniqueness. */
  replace_all?: boolean;
}

export interface PatchResult {
  applied: { path: string; hash: string; replacements: number }[];
}

/** Every guard is checked before anything is written — a failure leaves the tree untouched. */
export function filePatch(root: string, ops: PatchOp[]): PatchResult {
  const staged: { abs: string; path: string; next: string; replacements: number }[] = [];
  const contents = new Map<string, string>(); // carries earlier ops' effects within the batch
  for (const [i, op] of ops.entries()) {
    const abs = mustExist(root, op.path, SRC);
    const current = contents.get(abs) ?? readFileSync(abs, "utf8");
    if (op.base_hash !== undefined && contents.get(abs) === undefined) {
      const disk = contentHash(current);
      if (disk !== op.base_hash) {
        throw new Rejection({
          clause: CLAUSES.CAS_MISMATCH,
          expected: `base_hash ${disk} for ${op.path}`,
          got: `${op.base_hash} (op ${i + 1}/${ops.length}) — nothing was written`,
          remedy: { tool: "se_file_read", args: { path: op.path } },
          source: SRC,
        });
      }
    }
    const count = current.split(op.old_string).length - 1;
    if (count === 0 || (count > 1 && op.replace_all !== true)) {
      throw new Rejection({
        clause: CLAUSES.PATCH_AMBIGUOUS,
        expected: count === 0 ? `old_string to occur in ${op.path}` : `old_string to occur exactly once in ${op.path} (or pass replace_all: true)`,
        got: `${count} occurrences (op ${i + 1}/${ops.length}) — nothing was written`,
        remedy: {
          tool: "se_file_read",
          args: { path: op.path },
          note: count === 0 ? "re-read and copy the exact text, whitespace included" : "widen old_string until unique, or set replace_all",
        },
        source: SRC,
      });
    }
    const next = op.replace_all === true ? current.split(op.old_string).join(op.new_string) : current.replace(op.old_string, op.new_string);
    contents.set(abs, next);
    staged.push({ abs, path: op.path, next, replacements: op.replace_all === true ? count : 1 });
  }
  // All guards passed — write.
  const byFile = new Map<string, { path: string; next: string; replacements: number }>();
  for (const s of staged) {
    const prev = byFile.get(s.abs);
    byFile.set(s.abs, { path: s.path, next: s.next, replacements: (prev?.replacements ?? 0) + s.replacements });
  }
  const applied = [...byFile.values()].map((f) => {
    const abs = resolveInRoot(root, f.path, SRC);
    writeFileSync(abs, f.next, "utf8");
    return { path: f.path, hash: contentHash(f.next), replacements: f.replacements };
  });
  return { applied };
}

export function fileDelete(root: string, path: string, baseHash: string): { deleted: string } {
  const abs = mustExist(root, path, SRC);
  const disk = contentHash(readFileSync(abs, "utf8"));
  if (disk !== baseHash) {
    throw new Rejection({
      clause: CLAUSES.CAS_MISMATCH,
      expected: `base_hash ${disk}`,
      got: baseHash,
      remedy: { tool: "se_file_read", args: { path }, note: "no blind removal — read what you are deleting" },
      source: SRC,
    });
  }
  rmSync(abs);
  return { deleted: path };
}

export interface ListEntry {
  name: string;
  type: "file" | "dir";
  bytes?: number;
}

export function fileList(root: string, dir: string): { dir: string; entries: ListEntry[] } {
  const abs = mustExist(root, dir === "" ? "." : dir, SRC);
  const entries: ListEntry[] = [];
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    const rel = relative(root, join(abs, e.name));
    if (isExcluded(rel)) continue;
    if (e.isDirectory()) entries.push({ name: e.name, type: "dir" });
    else entries.push({ name: e.name, type: "file", bytes: statSync(join(abs, e.name)).size });
  }
  entries.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1));
  return { dir, entries };
}

/** Minimal glob: * (segment), ** (any depth), ? (one char). No dependency. */
export function globToRegExp(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        re += glob[i + 2] === "/" ? "(?:.*/)?" : ".*";
        i += glob[i + 2] === "/" ? 2 : 1;
      } else re += "[^/]*";
    } else if (c === "?") re += "[^/]";
    else if ("\\^$.|+()[]{}".includes(c)) re += `\\${c}`;
    else re += c;
  }
  return new RegExp(`^${re}$`);
}

export function fileGlob(root: string, glob: string, opts: { limit?: number; ref?: string } = {}): { glob: string; ref?: string; files: string[]; truncated: boolean } {
  const limit = opts.limit ?? 500;
  const rx = globToRegExp(glob.replace(/\\/g, "/"));
  if (opts.ref !== undefined) {
    const r = spawnSync("git", ["ls-tree", "-r", "--name-only", opts.ref], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) {
      throw new Rejection({
        clause: CLAUSES.PATH_ESCAPE,
        expected: "a known git ref",
        got: `${opts.ref} — ${(r.stderr ?? "").trim().split("\n")[0]}`,
        remedy: { tool: "se_run", args: { command: "git branch --all --list" }, note: "list the refs that exist, then glob again" },
        source: SRC,
      });
    }
    const files = r.stdout.split("\n").map((l) => l.trim()).filter((l) => l !== "" && rx.test(l)).sort();
    return { glob, ref: opts.ref, files: files.slice(0, limit), truncated: files.length > limit };
  }
  const out: string[] = [];
  const walk = (dir: string): void => {
    if (out.length > limit) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, e.name);
      const rel = relative(root, abs).split(sep).join("/");
      if (isExcluded(relative(root, abs))) continue;
      if (e.isDirectory()) walk(abs);
      else if (rx.test(rel)) out.push(rel);
    }
  };
  walk(root);
  out.sort();
  const truncated = out.length > limit;
  return { glob, files: out.slice(0, limit), truncated };
}
