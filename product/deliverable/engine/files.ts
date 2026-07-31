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
import { dirname, extname, join, relative, sep } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";
import { contentHash } from "./hash.ts";
import { isExcluded, isRootRef, resolveDeclaredRoot, resolveForRead, resolveInRoot } from "./paths.ts";
import { parseStateNote } from "./notes.ts";

/** Whole-file read budget (chars). Beyond this, offset/limit is required. */
export const READ_BUDGET = 50_000;
/** Line cap for range reads — mirrors the native Read tool's default. */
export const RANGE_DEFAULT_LIMIT = 2000;
/** A single line longer than this is truncated with an honest marker. */
const LINE_CAP = 2000;
/** Image bytes handed to a model. Base64 costs about a third more again in context. */
export const IMAGE_BUDGET = 1_500_000;

// The reader is general. Text comes back as numbered lines; an image comes back
// as the picture itself. Anything else is refused rather than base64'd blindly.
const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

const SRC = "engine/files.ts";

function mustExist(root: string, path: string, source: string, allowDeclared = false): string {
  const abs = allowDeclared ? resolveForRead(root, path, source) : resolveInRoot(root, path, source);
  if (!existsSync(abs)) {
    const dir = isRootRef(path) ? path.split(/[\\/]+/).slice(0, -1).join("/") : dirname(relative(root, abs));
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
  /** Only ever false, and only when an OPTIONAL read found nothing. A read
   *  that succeeded does not carry it. */
  exists?: boolean;
  /** Text reads only — an image has no lines. */
  total_lines?: number;
  /** Present on range reads: which slice this is. */
  range?: { offset: number; limit: number };
  /** Present when the read came from a committed ref, not the working tree. */
  ref?: string;
  content: string;
  truncated_lines?: number[];
  media_type?: string;
  bytes?: number;
  /** Extra MCP content blocks; the transport splits these out (engine/mcp.ts). */
  _attachments?: { type: "image"; data: string; mimeType: string }[];
}

/** A committed blob: git show <ref>:<path>. The ref's tree layout may
 *  differ from today's — the remedy globs the ref, not the working tree. */
function gitShow(root: string, ref: string, path: string): Buffer {
  const spec = `${ref}:${path.replace(/\\/g, "/")}`;
  const r = spawnSync("git", ["show", spec], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "an existing <ref>:<path> in this repository",
      got: `${spec} — ${(r.stderr ?? Buffer.alloc(0)).toString("utf8").trim().split("\n")[0]}`,
      remedy: { tool: "se_file_glob", args: { glob: "**/*", ref }, note: "glob the ref's tree first — the layout differs between versions ('main' reaches v1, 'v2' reaches v2)" },
      source: SRC,
    });
  }
  return r.stdout;
}

function looksBinary(bytes: Buffer): boolean {
  const n = Math.min(bytes.length, 8000);
  for (let i = 0; i < n; i++) if (bytes[i] === 0) return true;
  return false;
}

function imageRead(path: string, bytes: Buffer, mimeType: string, ref?: string): ReadResult {
  const hash = contentHash(bytes);
  if (bytes.length > IMAGE_BUDGET) {
    throw new Rejection({
      clause: CLAUSES.OVERSIZE_READ,
      expected: `an image under ${IMAGE_BUDGET} bytes — this one is ${bytes.length}`,
      got: `image read of ${path}`,
      remedy: {
        tool: "se_run",
        args: { command: `# shrink ${path} below ${IMAGE_BUDGET} bytes, then read it again` },
        note: "the lane has no resizer, so an oversize image is refused rather than silently downscaled",
      },
      source: SRC,
    });
  }
  const res: ReadResult = {
    path,
    hash,
    bytes: bytes.length,
    media_type: mimeType,
    content: `${mimeType}, ${bytes.length} bytes — the image itself rides with this result`,
    _attachments: [{ type: "image", data: bytes.toString("base64"), mimeType }],
  };
  if (ref !== undefined) res.ref = ref;
  return res;
}

export function fileRead(root: string, path: string, opts: { offset?: number; limit?: number; ref?: string; optional?: boolean } = {}): ReadResult {
  // AN OPTIONAL READ FORGIVES ABSENCE AND NOTHING ELSE. Some documents are
  // allowed not to exist — the handover is why this exists, and a boot that
  // refuses over a file nobody promised is a boot that looks broken. The path
  // still goes through resolveForRead, so escaping the root still refuses.
  if (opts.optional === true && opts.ref === undefined && !existsSync(resolveForRead(root, path, SRC))) {
    return {
      path,
      // Empty, because there is no content to prove. It matches no real
      // document, so it cannot satisfy a read-proof by accident.
      hash: "",
      exists: false,
      bytes: 0,
      content: `${path} does not exist. The read asked for it as optional, so this is not a failure.`,
    };
  }
  let bytes: Buffer;
  if (opts.ref !== undefined) {
    bytes = gitShow(root, opts.ref, path);
  } else {
    const abs = mustExist(root, path, SRC, true);
    if (statSync(abs).isDirectory()) {
      throw new Rejection({
        clause: CLAUSES.PATH_ESCAPE,
        expected: "a file",
        got: `${path} is a directory`,
        remedy: { tool: "se_file_list", args: { dir: path } },
        source: SRC,
      });
    }
    bytes = readFileSync(abs);
  }
  const mimeType = IMAGE_TYPES[extname(path).toLowerCase()];
  if (mimeType !== undefined) return imageRead(path, bytes, mimeType, opts.ref);
  if (looksBinary(bytes)) {
    throw new Rejection({
      clause: CLAUSES.UNREADABLE_BYTES,
      expected: "text, or an image the lane can show (png, jpg, gif, webp)",
      got: `${path} — ${bytes.length} bytes of binary, hash ${contentHash(bytes)}`,
      remedy: {
        tool: "se_run",
        args: { command: `# inspect ${path} with a tool that understands its format` },
        note: "base64 of arbitrary bytes tells a model nothing and costs a fortune in context",
      },
      source: SRC,
    });
  }
  const raw = bytes.toString("utf8");
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

/** A MACHINE NOTE THAT WILL NOT PARSE IS NEVER SAVED.
 *
 *  A ": " inside an unquoted frontmatter scalar starts a nested mapping, so
 *  one sentence of prose in a `guidance:` line stops a canvas compiling.
 *  When that canvas is boot's, NOTHING repairs it from inside the lane: boot
 *  allows no tools, start allows only reading, and every state that can write
 *  sits behind boot. A person with an editor is the only way back.
 *
 *  So the guard sits at the WRITE, the last moment anything can still act.
 *  This happened for real and took the mirror black; the compiler caught it
 *  only once the walk was already trapped behind it. */
function guardMachineNote(path: string, content: string): void {
  const p = path.replace(/\\/g, "/");
  if (!p.includes("deliverable/machines/") || !p.endsWith(".md")) return;
  try {
    parseStateNote(content);
  } catch (e) {
    throw new Rejection({
      clause: CLAUSES.CANVAS_BROKEN,
      expected: "frontmatter that parses as YAML — nothing was written",
      got: `${path}: ${String((e as Error).message).split("\n")[0]}`,
      remedy: {
        tool: "se_file_read",
        args: { path },
        note: "a ': ' inside an unquoted scalar starts a nested mapping. Quote the whole value, or move the prose into the body under '## Guidance', where a colon is harmless.",
      },
      source: SRC,
    });
  }
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
  guardMachineNote(path, content);
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
      // WHY it did not match, not merely that it did not. This refusal fired
      // twelve times in one period, and its commonest cause is INVISIBLE: a
      // CRLF file against an old_string written with LF. "Copy the exact
      // text" is useless advice when the difference cannot be seen, so the
      // engine looks for the near-miss and names it.
      let why = "";
      if (count === 0) {
        const lf = (s: string): string => s.replace(/\r\n/g, "\n");
        const flat = (s: string): string => lf(s).replace(/[ \t]+/g, " ");
        if (lf(current).includes(lf(op.old_string))) {
          why = " — but it MATCHES with line endings normalised: this file is CRLF and your old_string is LF";
        } else if (flat(current).includes(flat(op.old_string))) {
          why = " — but it MATCHES with runs of spaces and tabs collapsed: the indentation differs";
        }
      }
      throw new Rejection({
        clause: CLAUSES.PATCH_AMBIGUOUS,
        expected: count === 0 ? `old_string to occur in ${op.path}` : `old_string to occur exactly once in ${op.path} (or pass replace_all: true)`,
        got: `${count} occurrences (op ${i + 1}/${ops.length}) — nothing was written${why}`,
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
  // This one belongs with the other guards: every file in the batch, before
  // the first byte of any of them lands.
  for (const f of byFile.values()) guardMachineNote(f.path, f.next);
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
  const abs = mustExist(root, dir === "" ? "." : dir, SRC, true);
  const entries: ListEntry[] = [];
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    // Inside a declared root a project-relative path is meaningless, so the
    // exclusion weighs the entry's own name.
    if (isExcluded(isRootRef(dir) ? e.name : relative(root, join(abs, e.name)))) continue;
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
  // A declared root is globbed as "@name/pattern", and every hit carries the
  // prefix back — what the glob returns, the reader accepts unchanged.
  const rootRef = isRootRef(glob);
  const rootName = rootRef ? glob.slice(1).split(/[\\/]+/)[0] : "";
  const base = rootRef ? resolveDeclaredRoot(root, `@${rootName}`, SRC) : root;
  const prefix = rootRef ? `@${rootName}/` : "";
  const pattern = rootRef ? glob.slice(1).split(/[\\/]+/).slice(1).join("/") || "**" : glob;
  const rx = globToRegExp(pattern.replace(/\\/g, "/"));
  if (rootRef && opts.ref !== undefined) {
    throw new Rejection({
      clause: CLAUSES.UNDECLARED_ROOT,
      expected: "a declared root OR a committed ref, not both",
      got: `${glob} at ref ${opts.ref}`,
      remedy: { tool: "se_file_glob", args: { glob }, note: "a declared root is a folder on disk; it has no git history here" },
      source: SRC,
    });
  }
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
      const rel = relative(base, abs).split(sep).join("/");
      if (isExcluded(rootRef ? e.name : relative(root, abs))) continue;
      if (e.isDirectory()) walk(abs);
      else if (rx.test(rel)) out.push(prefix + rel);
    }
  };
  walk(base);
  out.sort();
  const truncated = out.length > limit;
  return { glob, files: out.slice(0, limit), truncated };
}
