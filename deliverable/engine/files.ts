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
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, extname, join, relative, sep } from "node:path";
import { concealedFromLane, isBound } from "./benchmark-guard.ts";
import { ANSWER_BOUND_BYTES } from "./bound.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { guardParses } from "./guard.ts";
import { contentHash } from "./hash.ts";
import { lintFix } from "./lintfix.ts";
import { forgetPath, parseStateNote, readNodeBytes, writeNode } from "./notes.ts";
import { isExcluded, isRootRef, resolveDeclaredRoot, resolveForRead, resolveInRoot } from "./paths.ts";
import { guardNoSecondDoor } from "./pool.ts";
import { search } from "./search.ts";
import { guardNoUnregisteredEmitter } from "./widgets.ts";

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

export const SRC = "engine/files.ts";

export function mustExist(root: string, path: string, source: string, allowDeclared = false): string {
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
  /** Present on line-range reads: which slice this is. */
  range?: { offset: number; limit: number };
  /** Present on exact character reads, used for long generated lines. */
  char_range?: { offset: number; limit: number; to: number; of: number };
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

function characterRead(
  path: string,
  raw: string,
  hash: string,
  opts: { charOffset?: number; charLimit?: number; ref?: string },
): ReadResult {
  const charOffset = Math.max(0, opts.charOffset ?? 0);
  const charLimit = Math.max(1, opts.charLimit ?? 3_000);
  const want = Math.min(raw.length, charOffset + charLimit);
  const build = (to: number): ReadResult => ({
    path,
    hash,
    bytes: raw.length,
    content: raw.slice(charOffset, to),
    char_range: { offset: charOffset, limit: charLimit, to, of: raw.length },
    ...(opts.ref !== undefined ? { ref: opts.ref } : {}),
  });

  // THE PAGE FITS ITSELF RATHER THAN BEING GUESSED AT.
  //
  // The old shape sized the caller's page on a worst-case escape cost of 2,
  // which is less than half of what actually fits, so every reading loop paid
  // roughly twice the calls it needed. MEASURED: boot's four
  // documents are 61,439 bytes, which is about 29 page reads at the suggested
  // page and about 14 at one sized honestly.
  //
  // ASKING FOR TOO MUCH IS NOW SAFE. The answer is serialised and shrunk until
  // it is under the bound, and `char_range.to` reports what actually came
  // back, so the caller's cursor stays correct either way. A caller may
  // therefore ask optimistically and never spill a spill.
  let to = want;
  for (;;) {
    const candidate = build(to);
    if (JSON.stringify(candidate).length + ACCOUNT_ALLOWANCE <= ANSWER_BOUND_BYTES) return candidate;
    if (to <= charOffset + MIN_CHARS) return build(Math.min(raw.length, charOffset + MIN_CHARS));
    to = charOffset + Math.floor((to - charOffset) * 0.8);
  }
}

/** Room kept for the work account and the envelope the transport adds after
 *  this result is built. The account carries references now, not transcripts,
 *  so it is small and bounded rather than open-ended. */
const ACCOUNT_ALLOWANCE = 1_400;

/** The smallest page worth returning. Below this the caller is better served
 *  by an oversize refusal than by a page that says almost nothing. */
const MIN_CHARS = 500;

export function fileRead(
  root: string,
  path: string,
  opts: {
    offset?: number;
    limit?: number;
    charOffset?: number;
    charLimit?: number;
    ref?: string;
    optional?: boolean;
    maxChars?: number;
  } = {},
): ReadResult {
  // THE CONCEALMENT REFUSES, IT DOES NOT RETURN EMPTY. A read is a request for
  // one named path, so a caller who asked for it must be told it was refused
  // rather than handed something that looks like an empty file. The listing
  // verbs above omit instead, because omission IS their answer.
  if (concealedFromLane(path, isBound(root))) {
    throw new Rejection({
      clause: CLAUSES.PATH_ESCAPE,
      expected: "a path outside the benchmark reports, while a benchmark run is bound",
      got: path,
      remedy: {
        tool: "se_benchmark",
        args: { stop: true },
        note: "a bound run may not read previous runs' numbers — a run that can read them can work toward them. End the run and the folder is visible again.",
      },
      source: SRC,
    });
  }
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
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      throw new Rejection({
        clause: CLAUSES.PATH_ESCAPE,
        expected: "a file",
        got: `${path} is a directory`,
        remedy: { tool: "se_file_list", args: { dir: path } },
        source: SRC,
      });
    }
    // Through the door: one store serves the engine's text readers and this
    // byte reader. A read the door cannot make (a race with a delete) falls
    // through to the direct read, whose error is the honest one.
    bytes = readNodeBytes(abs) ?? readFileSync(abs);
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
  const wantsLineRange = opts.offset !== undefined || opts.limit !== undefined;
  const wantsCharRange = opts.charOffset !== undefined || opts.charLimit !== undefined;
  if (wantsLineRange && wantsCharRange) {
    throw new Rejection({
      clause: CLAUSES.UNKNOWN_ARGS,
      expected: "either offset/limit for lines or char_offset/char_limit for exact text",
      got: "both range modes",
      remedy: { tool: "se_file_read", args: { path, char_offset: 0, char_limit: 3_000 } },
      source: SRC,
    });
  }
  if (wantsCharRange) return characterRead(path, raw, hash, opts);
  // The budget is raisable for a document the ENGINE wrote, because the
  // engine chose what went into it. Nothing the agent asks for moves it.
  const budget = opts.maxChars ?? READ_BUDGET;
  if (!wantsLineRange && raw.length > budget) {
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
  const limit = wantsLineRange ? Math.max(1, opts.limit ?? RANGE_DEFAULT_LIMIT) : lines.length;
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
  if (wantsLineRange) res.range = { offset, limit };
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
export function guardMachineNote(path: string, content: string): void {
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
  /** The linter's safe fixes ran after the write; hash is the fixed content. */
  lint_fixed?: string;
  /** Linter findings the safe fixes could not reach (engine/lintfix.ts). */
  lint_findings?: string;
  /** What the corpus already carried, reported rather than refused. */
  standing_breaks?: string[];
}

// THE METHOD MIRROR IS DELETED (i34). The session registered a callback here
// so a method write could be copied into every other tree, and `mirrorMethod`
// fired it after every successful write.
//
// ONE TREE MAKES IT EMPTY. A write is the file every reader opens.

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
  // THE POOL HAS ONE DOOR, and this is what makes that true rather than said.
  // i17 verification landed a fabricated work token carrying a third party's
  // name through this very function, in one call, skipping every demand the
  // mint makes — which is the whole privacy boundary gone round.
  guardNoSecondDoor(path, SRC);
  // A SECOND SURFACE CANNOT BE WRITTEN, rather than being discouraged. The
  // rule lives in widgets.ts and the sweep asks it the same question about the
  // whole tree (see el-widget-guard).
  guardNoUnregisteredEmitter(root, path, content, SRC);
  // THE WRITE GUARD STANDS HERE, with the other two, because this is the last
  // point before anything lands (req-a-write-that-breaks-the-corpus-refuses).
  // THE GUARD ANSWERS TWICE. It THROWS on a break this write made, and RETURNS
  // what the corpus already carried. The seam is who caused it
  // (raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus).
  const standing = guardParses(root, path, content);
  const nul = guardRawNul(path, content);
  mkdirSync(dirname(abs), { recursive: true });
  writeNode(abs, nul.content);
  const lint = lintFix(root, [path]);
  const final = lint !== undefined && lint.fixed.length > 0 ? readFileSync(abs, "utf8") : nul.content;
  return {
    path,
    hash: contentHash(final),
    bytes: Buffer.byteLength(final, "utf8"),
    created: !exists,
    ...(nul.corrected !== undefined ? { corrected: nul.corrected } : {}),
    ...(lint !== undefined && lint.fixed.length > 0
      ? { lint_fixed: "the linter's safe fixes ran after the write — the returned hash is the fixed content" }
      : {}),
    ...(lint?.findings !== undefined ? { lint_findings: lint.findings } : {}),
    // IT RIDES THE WRITE'S OWN RESULT so the author sees it without asking.
    // A report nobody reads is the same as no check.
    ...(standing.length > 0 ? { standing_breaks: standing } : {}),
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
  /** Linter findings the safe fixes could not reach (engine/lintfix.ts). */
  lint_findings?: string;
}

export interface ReplaceResult {
  changed: { path: string; hash: string; replacements: number }[];
  /** EVERY place it landed, with the line before and after. This is the
   *  whole reason a wide replace is safe to offer. */
  places: { path: string; line: number; before: string; after: string }[];
  places_total: number;
  files_scanned: number;
  truncated: boolean;
  /** True when nothing was written. see dsp-file-lane.md#a-wide-replace-is-read-before-it-is-run */
  preview?: boolean;
  /** Every file the replace would touch and how many places in each, BIGGEST
   *  FIRST. A rule hitting one file four thousand times while its siblings
   *  take two is visible here and in no sample of lines. */
  by_file?: { path: string; replacements: number }[];
  corrected?: string[];
  /** Linter findings the safe fixes could not reach (engine/lintfix.ts). */
  lint_findings?: string;
}

/** How many places travel back before the report starts counting only. */
const PLACES_LIMIT = 200;

function compileReplacePattern(glob: string, pattern: string, replacement: string, flags: string): RegExp {
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
  try {
    return new RegExp(pattern, `g${flags}`);
  } catch (e) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a pattern that compiles as a JS regex",
      got: String((e as Error).message),
      remedy: { tool: "se_file_replace", args: { glob, pattern: "<fixed pattern>", replacement } },
      source: SRC,
    });
  }
}

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
  opts: { flags?: string; expect_count?: number; preview?: boolean } = {},
): ReplaceResult {
  const rx = compileReplacePattern(glob, pattern, replacement, opts.flags ?? "");
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
  // THE PREVIEW STOPS HERE, having computed everything and written nothing.
  // It runs AFTER the no-match and expect_count refusals, so a preview that
  // comes back at all is a replace that would really have landed.
  if (opts.preview === true) {
    return {
      preview: true,
      changed: [],
      places,
      places_total: total,
      files_scanned: scanned,
      truncated: total > places.length,
      by_file: staged.map((s) => ({ path: s.path, replacements: s.replacements })).sort((a, b) => b.replacements - a.replacements),
    };
  }
  for (const s of staged) {
    guardMachineNote(s.path, s.next);
    const nul = guardRawNul(s.path, s.next);
    s.next = nul.content;
    if (nul.corrected !== undefined) corrected.push(nul.corrected);
  }
  const changed = staged.map((s) => {
    writeNode(s.abs, s.next);
    return { path: s.path, hash: contentHash(s.next), replacements: s.replacements };
  });
  const findings = lintAfterWrite(root, changed, corrected);
  return {
    changed,
    places,
    places_total: total,
    files_scanned: scanned,
    truncated: total > places.length,
    ...(corrected.length > 0 ? { corrected } : {}),
    ...(findings !== undefined ? { lint_findings: findings } : {}),
  };
}

/** Run the fixer over just-written files, refresh their hashes in place and
 *  announce what changed. Returns the findings the fixes could not reach. */
export function lintAfterWrite(root: string, rows: { path: string; hash: string }[], corrected: string[]): string | undefined {
  const lint = lintFix(
    root,
    rows.map((r) => r.path),
  );
  if (lint === undefined) return undefined;
  if (lint.fixed.length > 0) {
    for (const r of rows) {
      if (!lint.fixed.includes(r.path)) continue;
      r.hash = contentHash(readFileSync(resolveInRoot(root, r.path, SRC), "utf8"));
    }
    corrected.push(`the linter's safe fixes ran on ${lint.fixed.join(", ")} — the returned hashes are the fixed content`);
  }
  return lint.findings;
}

/** How many citing nodes ride back. Beyond this the count still tells the
 *  truth, so a wide deletion never reads as a narrow one. */
const CITED_CAP = 40;

/** One frontmatter scalar, or "". Flat keys only; ids never nest. */
function frontmatterId(text: string): string {
  const m = /^id:[ \t]*(.*)$/m.exec(text);
  return m === null ? "" : m[1].trim().replace(/^["']|["']$/g, "");
}

/** WHO POINTS AT THIS NODE — asked BEFORE the delete lands, which is the whole
 *  of req-a-deletion-names-what-points-at-the-node.
 *
 *  THE GRAPH IS NOT ENOUGH ON ITS OWN. raid-asm-the-trace-graph-holds-every-
 *  reference probed FALSE IN PART: the frontmatter edges found i34's orphaned
 *  requirements and missed seventeen citations that live in prose. So this
 *  sweeps the TEXT for the id, which catches the edges as a side effect —
 *  a `refines:` entry and a sentence are both the id, written down.
 *
 *  IT NEVER REFUSES. The row says so in as many words: deleting a node with
 *  dependents is legal and often right, and what happens next is a judgment
 *  that stays one. */
function citedBy(root: string, abs: string, text: string): { list: { id: string; path: string; lines: number[] }[]; total: number } {
  const id = frontmatterId(text);
  if (id === "") return { list: [], total: 0 };
  const quoted = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let hits: { path: string; line: number }[];
  try {
    hits = search(root, quoted, { limit: 500 }).matches.filter((m) => m.context !== true);
  } catch {
    // A SEARCH THAT CANNOT RUN MUST NOT BLOCK A DELETE. The row asks for a
    // list beside the deletion, never for the deletion to depend on one.
    return { list: [], total: 0 };
  }
  const self = relative(root, abs).split(sep).join("/");
  const byFile = new Map<string, number[]>();
  for (const h of hits) {
    const p = h.path.split(sep).join("/");
    if (p === self) continue;
    byFile.set(p, [...(byFile.get(p) ?? []), h.line]);
  }
  const list = [...byFile.entries()].slice(0, CITED_CAP).map(([p, lines]) => {
    let citing = p.replace(/^.*\//, "").replace(/\.[^.]+$/, "");
    try {
      const own = frontmatterId(readFileSync(resolveInRoot(root, p, SRC), "utf8"));
      if (own !== "") citing = own;
    } catch {
      // Unreadable is not a reason to drop the hit; the path still names it.
    }
    return { id: citing, path: p, lines };
  });
  return { list, total: byFile.size };
}

export function fileDelete(
  root: string,
  path: string,
  baseHash: string,
): { deleted: string; cited_by: { id: string; path: string; lines: number[] }[]; cited_by_total?: number } {
  const abs = mustExist(root, path, SRC);
  const text = readFileSync(abs, "utf8");
  const disk = contentHash(text);
  if (disk !== baseHash) {
    throw new Rejection({
      clause: CLAUSES.CAS_MISMATCH,
      expected: `base_hash ${disk}`,
      got: baseHash,
      remedy: { tool: "se_file_read", args: { path }, note: "no blind removal — read what you are deleting" },
      source: SRC,
    });
  }
  // ASKED BEFORE THE REMOVAL, because the file's own id line is the thing being
  // searched for and the sweep needs the content that is about to go.
  const cited = citedBy(root, abs, text);
  rmSync(abs);
  // The door may hold what was deleted; tell it rather than let the stat find out.
  forgetPath(abs);
  // AN EMPTY LIST, NEVER SILENCE. A delete that names nothing and a delete
  // nobody asked about must not look alike (the row's one invariant).
  //
  // THE TOTAL IS THE UNCAPPED ONE. A capped list reporting its own length as
  // the total would say the deletion was narrow at exactly the moment it was
  // widest — the silent truncation the lane refuses everywhere else.
  return { deleted: path, cited_by: cited.list, ...(cited.total > cited.list.length ? { cited_by_total: cited.total } : {}) };
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
    // THE CONCEALMENT. A bound run may not see the reports folder, and this is
    // the one point a listed entry becomes visible.
    if (concealedFromLane(relative(root, join(abs, e.name)), isBound(root))) continue;
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
    const shown = files.filter((f) => !concealedFromLane(f, isBound(root)));
    return { glob, ref: opts.ref, files: shown.slice(0, limit), truncated: shown.length > limit };
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
  const visible = out.filter((f) => !concealedFromLane(f, isBound(root)));
  return { glob, files: visible.slice(0, limit), truncated: truncated || visible.length > limit };
}
