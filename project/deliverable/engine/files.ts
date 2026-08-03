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
import { parseStateNote } from "./notes.ts";
import { isExcluded, isRootRef, resolveDeclaredRoot, resolveForRead, resolveInRoot } from "./paths.ts";

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
    const dir = isRootRef(path)
      ? path
          .split(/[\\/]+/)
          .slice(0, -1)
          .join("/")
      : dirname(relative(root, abs));
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
      remedy: {
        tool: "se_file_glob",
        args: { glob: "**/*", ref },
        note: "glob the ref's tree first — the layout differs between versions ('main' reaches v1, 'v2' reaches v2)",
      },
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

export function fileRead(
  root: string,
  path: string,
  opts: { offset?: number; limit?: number; ref?: string; optional?: boolean; maxChars?: number } = {},
): ReadResult {
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
  // The budget is raisable for a document the ENGINE wrote, because the
  // engine chose what went into it. Nothing the agent asks for moves it.
  const budget = opts.maxChars ?? READ_BUDGET;
  if (!wantsRange && raw.length > budget) {
    throw new Rejection({
      clause: CLAUSES.OVERSIZE_READ,
      expected: `a whole-file read under ${budget} chars — this file is ${raw.length} chars / ${lines.length} lines`,
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

/** A RAW NUL COSTS A FILE ITS SEARCHABILITY, and says nothing. ripgrep calls
 *  any file holding one binary, so every search over it answers a confident
 *  nothing, and se_file_move skips it outright — its references left dangling
 *  while the report stays quiet. It has now been written twice, by two
 *  authors, both times as a hash separator.
 *
 *  In code the escape means exactly what the raw byte meant, so it is
 *  corrected and NAMED. In prose the intent is not knowable, so it refuses.
 *  A sweep passes strict: false — it must never fail over a byte it did not
 *  write. */
const CODE_FILE = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/;

export function guardRawNul(path: string, content: string, strict = true): { content: string; corrected?: string } {
  if (!content.includes("\0")) return { content };
  const n = content.split("\0").length - 1;
  const many = n === 1 ? "a raw NUL byte" : `${n} raw NUL bytes`;
  if (!CODE_FILE.test(path.replace(/\\/g, "/"))) {
    if (!strict) return { content };
    throw new Rejection({
      clause: CLAUSES.RAW_NUL,
      expected: "text carrying no raw NUL byte — nothing was written",
      got: `${path} carries ${many}`,
      remedy: {
        tool: "se_file_write",
        args: { path, content: "<the same text, with the NUL written another way>" },
        note: "a raw NUL makes the whole file unsearchable: ripgrep calls it binary and every search over it answers nothing. In code it is corrected to the escape automatically; in prose only you know what it was for.",
      },
      source: SRC,
    });
  }
  return {
    content: content.split("\0").join("\\0"),
    corrected: `${path}: ${many} written as the escape instead — a raw one makes the whole file unsearchable`,
  };
}

export interface WriteResult {
  path: string;
  hash: string;
  bytes: number;
  created: boolean;
  corrected?: string;
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
  const nul = guardRawNul(path, content);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, nul.content, "utf8");
  return {
    path,
    hash: contentHash(nul.content),
    bytes: Buffer.byteLength(nul.content, "utf8"),
    created: !exists,
    ...(nul.corrected !== undefined ? { corrected: nul.corrected } : {}),
  };
}

export interface PatchOp {
  path: string;
  /** Exact-match op (the original verb): both strings, old must be unique. */
  old_string?: string;
  new_string?: string;
  /** Optional per-op CAS pin; when present it must match disk. */
  base_hash?: string;
  /** Replace every occurrence instead of demanding uniqueness. */
  replace_all?: boolean;
  /** Regex op: pattern + replacement (JS regex, always global; $1 backrefs work). */
  pattern?: string;
  replacement?: string;
  /** Regex flags — a subset on purpose: i, m, s. g is implied. */
  flags?: string;
  /** Regex op only: refuse unless the match count is exactly this. */
  expect_count?: number;
  /** Append/prepend op: new_string joins the end/start of the file. */
  append?: boolean;
  prepend?: boolean;
  /** Line-range op: replace lines from..to (1-based, inclusive) with new_string.
   *  DEMANDS base_hash — a line number only means something against the
   *  version you read. */
  at?: { from_line: number; to_line: number };
}

export interface PatchResult {
  applied: { path: string; hash: string; replacements: number }[];
  /** Mechanical fixes the engine applied FOR the agent, each named. An
   *  auto-correction that is not announced teaches nothing. */
  corrected?: string[];
}

export interface ReplaceResult {
  changed: { path: string; hash: string; replacements: number }[];
  /** EVERY place it landed, with the line before and after. This is the
   *  whole reason a wide replace is safe to offer. */
  places: { path: string; line: number; before: string; after: string }[];
  places_total: number;
  files_scanned: number;
  truncated: boolean;
  corrected?: string[];
}

/** How many places travel back before the report starts counting only. */
const PLACES_LIMIT = 200;

/** SEARCH AND REPLACE ACROSS FILES. The per-file regex op is a scalpel; this
 *  is the sweep.
 *
 *  What makes a sweep safe to offer is not a smarter pattern, it is the
 *  REPORT: every place it landed comes back with the line before and after,
 *  so the caller JUDGES the replace instead of trusting it. A wide edit whose
 *  result is a number is the one nobody can check.
 *
 *  Atomic like the patch: every file is read and every guard is run before
 *  the first byte of any of them lands. A pattern that matches nothing is a
 *  refusal, never a quiet success — the same law the per-file op holds. */
export function fileReplace(
  root: string,
  glob: string,
  pattern: string,
  replacement: string,
  opts: { flags?: string; expect_count?: number } = {},
): ReplaceResult {
  const flags = opts.flags ?? "";
  const bad = [...flags].filter((f) => !"ims".includes(f));
  if (bad.length > 0) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "flags from: i (ignore case), m (multiline anchors), s (dot matches newline) — g is always on",
      got: `flag(s) ${bad.join(", ")}`,
      remedy: { tool: "se_file_replace", args: { glob, pattern, replacement, flags: "im" } },
      source: SRC,
    });
  }
  let rx: RegExp;
  try {
    rx = new RegExp(pattern, `g${flags}`);
  } catch (e) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a pattern that compiles as a JS regex",
      got: String((e as Error).message),
      remedy: { tool: "se_file_replace", args: { glob, pattern: "<fixed pattern>", replacement } },
      source: SRC,
    });
  }
  const found = fileGlob(root, glob, { limit: 10000 });
  const staged: { path: string; abs: string; next: string; replacements: number }[] = [];
  const places: ReplaceResult["places"] = [];
  const corrected: string[] = [];
  let total = 0;
  let scanned = 0;
  for (const rel of found.files) {
    const abs = resolveInRoot(root, rel, SRC);
    let current: string;
    try {
      current = readFileSync(abs, "utf8");
    } catch {
      continue; // a directory entry or an unreadable file is not a match
    }
    scanned++;
    rx.lastIndex = 0;
    const hits = [...current.matchAll(rx)];
    if (hits.length === 0) continue;
    const before = current.split("\n");
    const next = current.replace(rx, replacement);
    const after = next.split("\n");
    // The line a match sits on, from its offset — so a report names the place
    // a reader can open, not just the file.
    for (const h of hits) {
      const line = current.slice(0, h.index ?? 0).split("\n").length;
      total++;
      if (places.length < PLACES_LIMIT) {
        places.push({ path: rel, line, before: (before[line - 1] ?? "").trim(), after: (after[line - 1] ?? "").trim() });
      }
    }
    staged.push({ path: rel, abs, next, replacements: hits.length });
  }
  if (total === 0 || (opts.expect_count !== undefined && total !== opts.expect_count)) {
    throw new Rejection({
      clause: CLAUSES.PATCH_AMBIGUOUS,
      expected:
        opts.expect_count !== undefined
          ? `the pattern to match exactly ${opts.expect_count} time(s) under ${glob}`
          : `the pattern to match somewhere under ${glob}`,
      got: `${total} match(es) across ${scanned} file(s) — nothing was written`,
      remedy: { tool: "se_file_search", args: { query: pattern, intent: "see what the pattern really hits before replacing" } },
      source: SRC,
    });
  }
  for (const s of staged) {
    guardMachineNote(s.path, s.next);
    const nul = guardRawNul(s.path, s.next);
    s.next = nul.content;
    if (nul.corrected !== undefined) corrected.push(nul.corrected);
  }
  const changed = staged.map((s) => {
    writeFileSync(s.abs, s.next, "utf8");
    return { path: s.path, hash: contentHash(s.next), replacements: s.replacements };
  });
  return {
    changed,
    places,
    places_total: total,
    files_scanned: scanned,
    truncated: total > places.length,
    ...(corrected.length > 0 ? { corrected } : {}),
  };
}

// One patch call, several verbs. Which verb an op is, read from its fields —
// exactly one of these shapes, anything mixed or partial refused BY NAME:
//   exact:   old_string + new_string          (the original verb)
//   regex:   pattern + replacement            (sed, kept inside the lane)
//   append:  append: true + new_string        (harvested: 285 Set-/Add-Content
//   prepend: prepend: true + new_string        shell writes did this job)
//   range:   at: {from_line, to_line} + new_string + base_hash
type OpKind = "exact" | "regex" | "append" | "prepend" | "range";

function opKind(op: PatchOp, i: number, n: number): OpKind {
  const marks: OpKind[] = [];
  if (op.old_string !== undefined) marks.push("exact");
  if (op.pattern !== undefined) marks.push("regex");
  if (op.append === true) marks.push("append");
  if (op.prepend === true) marks.push("prepend");
  if (op.at !== undefined) marks.push("range");
  if (marks.length === 1) return marks[0];
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected:
      "ONE verb per op: old_string+new_string | pattern+replacement | append+new_string | prepend+new_string | at+new_string+base_hash",
    got: marks.length === 0 ? `op ${i + 1}/${n} names no verb` : `op ${i + 1}/${n} mixes ${marks.join(" and ")} — nothing was written`,
    remedy: {
      tool: "se_file_patch",
      args: { ops: [{ path: "<path>", old_string: "<exact text>", new_string: "<replacement>" }] },
      note: "split it into one op per verb",
    },
    source: SRC,
  });
}

/** The file's own line-ending convention — what every verb writes in. */
function eolOf(s: string): "\r\n" | "\n" {
  return s.includes("\r\n") ? "\r\n" : "\n";
}
function toEol(s: string, eol: string): string {
  return s.replace(/\r\n/g, "\n").replace(/\n/g, eol);
}

/** Regex flags are a SUBSET on purpose: i, m, s. g is implied (a substitution
 *  that silently stops at the first hit is the sed trap this op exists to
 *  avoid); anything else is refused rather than passed through blind. */
function opRegExp(op: PatchOp, i: number, n: number): RegExp {
  const flags = op.flags ?? "";
  const bad = [...flags].filter((f) => !"ims".includes(f));
  if (bad.length > 0) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "flags from: i (ignore case), m (multiline anchors), s (dot matches newline) — g is always on",
      got: `flag(s) ${bad.join(", ")} (op ${i + 1}/${n})`,
      remedy: { tool: "se_file_patch", args: { ops: [{ path: op.path, pattern: op.pattern, replacement: op.replacement, flags: "im" }] } },
      source: SRC,
    });
  }
  try {
    return new RegExp(op.pattern as string, `g${flags}`);
  } catch (e) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a pattern that compiles as a JS regex",
      got: `${String((e as Error).message)} (op ${i + 1}/${n})`,
      remedy: { tool: "se_file_patch", args: { ops: [{ path: op.path, pattern: "<fixed pattern>", replacement: op.replacement }] } },
      source: SRC,
    });
  }
}

/** Every guard is checked before anything is written — a failure leaves the tree untouched. */
export function filePatch(root: string, ops: PatchOp[]): PatchResult {
  const staged: { abs: string; path: string; next: string; replacements: number }[] = [];
  const contents = new Map<string, string>(); // carries earlier ops' effects within the batch
  const corrected: string[] = [];
  for (const [i, op] of ops.entries()) {
    const kind = opKind(op, i, ops.length);
    const needs: Record<OpKind, [keyof PatchOp, string][]> = {
      exact: [["new_string", "the replacement text"]],
      regex: [["replacement", "the substitution text ($1 backrefs work)"]],
      append: [["new_string", "the text to append"]],
      prepend: [["new_string", "the text to prepend"]],
      range: [
        ["new_string", "the replacement lines"],
        ["base_hash", "the hash from se_file_read — a line number only means something against the version you read"],
      ],
    };
    for (const [field, why] of needs[kind]) {
      if (op[field] === undefined) {
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: `${field} on a ${kind} op — ${why}`,
          got: `op ${i + 1}/${ops.length} without it — nothing was written`,
          remedy: { tool: "se_file_patch", args: { ops: [{ path: op.path, [field]: "<value>" }] } },
          source: SRC,
        });
      }
    }
    const abs = mustExist(root, op.path, SRC);
    const raw = contents.get(abs) ?? readFileSync(abs, "utf8");
    if (op.base_hash !== undefined && contents.get(abs) === undefined) {
      const disk = contentHash(raw);
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
    // AN INVISIBLE BYTE-ORDER MARK IS AN ENCODING FACT, NOT CONTENT. It is
    // preserved at the front of the file, ignored for matching on both
    // sides, and a prepend lands after it rather than burying it mid-file.
    const bom = raw.startsWith("﻿") ? "﻿" : "";
    const current = bom === "" ? raw : raw.slice(1);
    if (bom !== "") corrected.push(`op ${i + 1}: ${op.path} carries a UTF-8 byte-order mark — preserved, and ignored for matching`);
    const eol = eolOf(current);
    let next: string;
    let replacements: number;
    if (kind === "regex") {
      const rx = opRegExp(op, i, ops.length);
      const count = [...current.matchAll(rx)].length;
      if (count === 0 || (op.expect_count !== undefined && count !== op.expect_count)) {
        throw new Rejection({
          clause: CLAUSES.PATCH_AMBIGUOUS,
          expected:
            op.expect_count !== undefined
              ? `pattern to match exactly ${op.expect_count} time(s) in ${op.path}`
              : `pattern to match in ${op.path}`,
          got: `${count} matches (op ${i + 1}/${ops.length}) — nothing was written`,
          remedy: {
            tool: "se_file_search",
            args: { query: op.pattern, path: op.path },
            note: "see what the pattern really hits, then patch again",
          },
          source: SRC,
        });
      }
      next = current.replace(rx, op.replacement as string);
      replacements = count;
    } else if (kind === "append" || kind === "prepend") {
      // The joined text arrives in the FILE's line endings, and the seam gets
      // exactly one newline — both corrected mechanically and both NAMED,
      // because these two fumbles are why appends went through the shell.
      const piece = toEol(op.new_string as string, eol);
      if (kind === "append") {
        const seam = current === "" || current.endsWith("\n") || piece.startsWith("\n") ? "" : eol;
        if (seam !== "") corrected.push(`op ${i + 1}: a newline was added between the file's last line and the appended text`);
        next = current + seam + piece;
      } else {
        const seam = piece === "" || piece.endsWith("\n") || current.startsWith("\n") || current === "" ? "" : eol;
        if (seam !== "") corrected.push(`op ${i + 1}: a newline was added between the prepended text and the file's first line`);
        next = piece + seam + current;
      }
      if (eol === "\r\n" && (op.new_string as string) !== piece)
        corrected.push(`op ${i + 1}: the text was converted to CRLF — this file's convention`);
      replacements = 1;
    } else if (kind === "range") {
      // Lines are counted the way the READER numbers them — split on \n,
      // whatever each line's ending. Splitting on the file's dominant EOL
      // let one stray CRLF in an LF file collapse the count to 2, and the
      // refusal then described a file that does not exist.
      const lines = current.split("\n");
      const { from_line: from, to_line: to } = op.at as { from_line: number; to_line: number };
      if (!(Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to >= from && to <= lines.length)) {
        throw new Rejection({
          clause: CLAUSES.PATCH_AMBIGUOUS,
          expected: `1 <= from_line <= to_line <= ${lines.length} for ${op.path}`,
          got: `from_line ${from}, to_line ${to} (op ${i + 1}/${ops.length}) — nothing was written`,
          remedy: {
            tool: "se_file_read",
            args: { path: op.path, offset: Math.max(1, Number(from) || 1), limit: 40 },
            note: "re-read the range you mean; line numbers ride every read",
          },
          source: SRC,
        });
      }
      const newParts = toEol(op.new_string as string, eol).split("\n");
      // The seam after the range mirrors the replaced last line's own ending.
      if (lines[to - 1].endsWith("\r")) newParts[newParts.length - 1] += "\r";
      if (/\r\n/.test(current) && /(^|[^\r])\n/.test(current)) {
        corrected.push(`op ${i + 1}: ${op.path} mixes CRLF and LF — lines were counted the way the reader numbers them`);
      }
      lines.splice(from - 1, to - from + 1, ...newParts);
      next = lines.join("\n");
      replacements = 1;
    } else {
      let oldStr = (op.old_string as string).replace(/^﻿/, "");
      let newStr = op.new_string as string;
      let count = current.split(oldStr).length - 1;
      // THE ENGINE CORRECTS WHAT IS MECHANICAL AND SAYS SO (owner ruling
      // 2026-08-02). The commonest 0-match cause is INVISIBLE: a CRLF file
      // against an old_string written with LF. The old behaviour diagnosed it
      // and refused anyway — one round-trip spent re-copying text that differs
      // in nothing a model can see. Now: when the strings match under the
      // file's own line endings, the patch is applied in those endings and the
      // correction is NAMED on the result. Whitespace near-misses still refuse
      // — collapsed indentation is a real difference, not an encoding one.
      if (count === 0) {
        const reOld = toEol(oldStr, eol);
        const reCount = current.split(reOld).length - 1;
        if (reOld !== oldStr && reCount > 0) {
          oldStr = reOld;
          newStr = toEol(newStr, eol);
          count = reCount;
          corrected.push(
            `op ${i + 1}: old_string matched after line-ending normalisation — this file is ${eol === "\r\n" ? "CRLF" : "LF"}; the patch was applied in the file's own endings`,
          );
        }
      }
      if (count === 0 || (count > 1 && op.replace_all !== true)) {
        // WHY it did not match, not merely that it did not. This refusal fired
        // twelve times in one period; the whitespace near-miss is still named,
        // because "copy the exact text" is useless advice when the difference
        // cannot be seen.
        let why = "";
        if (count === 0) {
          const lf = (s: string): string => s.replace(/\r\n/g, "\n");
          const flat = (s: string): string => lf(s).replace(/[ \t]+/g, " ");
          if (flat(current).includes(flat(oldStr))) {
            why = " — but it MATCHES with runs of spaces and tabs collapsed: the indentation differs";
          }
        }
        throw new Rejection({
          clause: CLAUSES.PATCH_AMBIGUOUS,
          expected:
            count === 0
              ? `old_string to occur in ${op.path}`
              : `old_string to occur exactly once in ${op.path} (or pass replace_all: true)`,
          got: `${count} occurrences (op ${i + 1}/${ops.length}) — nothing was written${why}`,
          remedy: {
            tool: "se_file_read",
            args: { path: op.path },
            note:
              count === 0 ? "re-read and copy the exact text, whitespace included" : "widen old_string until unique, or set replace_all",
          },
          source: SRC,
        });
      }
      next = op.replace_all === true ? current.split(oldStr).join(newStr) : current.replace(oldStr, newStr);
      replacements = op.replace_all === true ? count : 1;
    }
    contents.set(abs, bom + next);
    staged.push({ abs, path: op.path, next: bom + next, replacements });
  }
  // All guards passed — write.
  const byFile = new Map<string, { path: string; next: string; replacements: number }>();
  for (const s of staged) {
    const prev = byFile.get(s.abs);
    byFile.set(s.abs, { path: s.path, next: s.next, replacements: (prev?.replacements ?? 0) + s.replacements });
  }
  // This one belongs with the other guards: every file in the batch, before
  // the first byte of any of them lands.
  for (const f of byFile.values()) {
    guardMachineNote(f.path, f.next);
    const nul = guardRawNul(f.path, f.next);
    f.next = nul.content;
    if (nul.corrected !== undefined) corrected.push(nul.corrected);
  }
  const applied = [...byFile.values()].map((f) => {
    const abs = resolveInRoot(root, f.path, SRC);
    writeFileSync(abs, f.next, "utf8");
    return { path: f.path, hash: contentHash(f.next), replacements: f.replacements };
  });
  return { applied, ...(corrected.length > 0 ? { corrected } : {}) };
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

export function fileGlob(
  root: string,
  glob: string,
  opts: { limit?: number; ref?: string } = {},
): { glob: string; ref?: string; files: string[]; truncated: boolean } {
  const limit = opts.limit ?? 500;
  // A declared root is globbed as "@name/pattern", and every hit carries the
  // prefix back — what the glob returns, the reader accepts unchanged.
  const rootRef = isRootRef(glob);
  const rootName = rootRef ? glob.slice(1).split(/[\\/]+/)[0] : "";
  const base = rootRef ? resolveDeclaredRoot(root, `@${rootName}`, SRC) : root;
  const prefix = rootRef ? `@${rootName}/` : "";
  const pattern = rootRef
    ? glob
        .slice(1)
        .split(/[\\/]+/)
        .slice(1)
        .join("/") || "**"
    : glob;
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
    const files = r.stdout
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "" && rx.test(l))
      .sort();
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
