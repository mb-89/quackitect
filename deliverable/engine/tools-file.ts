// THE FILE VERBS: read, write, patch, replace, move, delete, list, glob and
// search — and the reading service that credits a document as it serves it.
//
// Split out of tools.ts. Every verb here goes through the model file system,
// so the lane's write rules hold whatever asked for the write.
//
// see dsp-lane-door.md#the-verbs-are-grouped-by-what-they-touch

import { CLAUSES, Rejection } from "./errors.ts";
import type { PatchOp } from "./files.ts";
import type { ToolDef } from "./mcp.ts";
import type { ModelFileSystem } from "./model-fs.ts";

/** A cheap multi-read makes it easy to pull documents nobody needed, which
 *  wastes context quietly. Twenty is far above any real reading list — boot's
 *  is eight — and well below a sweep of the tree. */
const MAX_READ_PATHS = 20;

/** MANY PATHS, ONE CALL. Read-proof is a SET, not a sequence: leaving boot
 *  demands eight hashes TOGETHER, and asking one at a time pays a round trip
 *  per document for nothing. The reads themselves do not collapse and should
 *  not — proving you read is the point. The waiting collapses.
 *
 *  EACH ENTRY ANSWERS FOR ITSELF. An oversize or missing path returns its own
 *  typed refusal in place of its content and the rest still come back. Losing
 *  seven good reads because the eighth is large would make the cheap call
 *  useless exactly where it is worth most. */
function readMany(model: ModelFileSystem, entries: unknown[], ref: string | undefined, optional: boolean): Record<string, unknown> {
  if (entries.length > MAX_READ_PATHS) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `at most ${MAX_READ_PATHS} paths in one call`,
      got: `${entries.length} paths`,
      remedy: {
        tool: "se_file_read",
        args: { paths: ["<first>", "<second>"] },
        note: "ask for the set you will actually read; a wide multi-read spends context on documents nobody wanted",
      },
      source: "engine/tools.ts se_file_read",
    });
  }
  const files = entries.map((e) => {
    const spec =
      typeof e === "string"
        ? { path: e }
        : (e as {
            path?: unknown;
            offset?: unknown;
            limit?: unknown;
            char_offset?: unknown;
            char_limit?: unknown;
            optional?: unknown;
          });
    const path = String(spec.path ?? "");
    try {
      return model.read(path, {
        ...(spec.offset !== undefined ? { offset: Number(spec.offset) } : {}),
        ...(spec.limit !== undefined ? { limit: Number(spec.limit) } : {}),
        ...(spec.char_offset !== undefined ? { charOffset: Number(spec.char_offset) } : {}),
        ...(spec.char_limit !== undefined ? { charLimit: Number(spec.char_limit) } : {}),
        ...(ref !== undefined ? { ref } : {}),
        ...(spec.optional === true || optional ? { optional: true } : {}),
      }) as unknown as Record<string, unknown>;
    } catch (err) {
      const r = err as { clause?: string; expected?: string; got?: string; remedy?: unknown; message?: string };
      return { path, refused: { clause: r.clause, expected: r.expected ?? r.message, got: r.got, remedy: r.remedy } };
    }
  });
  const failed = files.filter((f) => f.refused !== undefined).length;
  return { files, ...(failed > 0 ? { failed } : {}) };
}

/** The reading is engine-written, so its ceiling is the engine's to set.
 *  Past it the read pages like any other large file, and each page credits
 *  the documents it fully showed. */
const READING_BUDGET = 120_000;

export interface ReadingHook {
  path: string;
  build(): string[];
  credit(offset: number, lines: number): string[];
}

/** THE READING is written the moment it is asked for, then served like
 *  any other file — same numbered lines, same hash, same offset/limit.
 *  What it showed is credited on the way out, so the documents inside
 *  it never have to be asked for again. Undefined when the ask is not
 *  the reading: the plain read handles it. */
function serveReading(
  model: ModelFileSystem,
  reading: ReadingHook | undefined,
  args: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (reading === undefined || args.ref !== undefined || args.paths !== undefined) return undefined;
  if (String(args.path ?? "").replace(/\\/g, "/") !== reading.path) return undefined;
  reading.build();
  const res = model.read(reading.path, {
    ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
    ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
    maxChars: READING_BUDGET,
  }) as unknown as Record<string, unknown>;
  const range = res.range as { offset: number; limit: number } | undefined;
  const offset = range?.offset ?? 1;
  const lines = range?.limit ?? Number(res.total_lines ?? 0);
  return { ...res, credited: reading.credit(offset, lines) };
}

function readManyGuarded(model: ModelFileSystem, paths: unknown, ref: string | undefined, optional: boolean): Record<string, unknown> {
  if (!Array.isArray(paths)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "paths as an array of paths, or of {path, offset?, limit?}",
      got: typeof paths,
      remedy: { tool: "se_file_read", args: { paths: ["<path>"] }, note: "one path uses `path`; a set uses `paths`" },
      source: "engine/tools.ts se_file_read",
    });
  }
  return readMany(model, paths, ref, optional);
}

export function fileTools(rootOf: (rel?: string) => string, model: ModelFileSystem, reading?: ReadingHook): ToolDef[] {
  return [
    {
      name: "se_file_read",
      title: "se.file.read",
      description:
        "Read a project file (root-relative path) — TEXT OR IMAGE. Returns the CAS hash writes will demand. Text comes back as numbered lines; pass offset/limit for line windows. Pass char_offset/char_limit for exact slices of generated files with one long line. An oversize whole-file read is refused with the remedy, never silently truncated. An IMAGE (png, jpg, gif, webp) comes back as the picture itself, so a sketch can be LOOKED AT rather than described to you. Any other binary is refused. A DECLARED ROOT is reachable as '@name/rest' (the owner declares roots in .se/roots.json; read-only unless the declaration says writable). Pass ref to read AT A COMMITTED REF ('main' reaches v1, 'v2' reaches v2) — pair with se_file_search/se_file_glob at the same ref. Pass optional: true for a file that is ALLOWED to be missing (the handover): absence answers exists: false rather than refusing. THE READING (.se/reading.md) is the one path the ENGINE writes: it holds every document the way ahead still demands, concatenated, and reading it CREDITS them all — one call instead of one per document, and no read_hashes to carry afterwards. The packet names it whenever anything is owed.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          paths: {
            type: "array",
            description:
              "read MANY in ONE call — a list of paths, or per-file windows with line or character ranges. Read-proof is a SET, so a state's whole reading list comes back in one envelope, each entry with its own hash. An unreadable path returns its refusal in place of its content and the others still arrive.",
            items: { type: ["string", "object"] },
          },
          offset: { type: "number", description: "1-based first line" },
          limit: { type: "number", description: "how many lines" },
          char_offset: { type: "number", description: "0-based first character; do not combine with offset/limit" },
          char_limit: { type: "number", description: "exact character count; continue at char_range.to" },
          ref: { type: "string", description: "read from this committed git ref instead of the working tree" },
          optional: {
            type: "boolean",
            description:
              "the file is ALLOWED not to exist — absence comes back as exists: false instead of a refusal. Only absence is forgiven; a path outside the root still refuses. Per-entry in `paths` too.",
          },
        },
      },
      handler: (args) => {
        const ref = args.ref !== undefined ? String(args.ref) : undefined;
        const optional = args.optional === true;
        const served = serveReading(model, reading, args);
        if (served !== undefined) return served;
        if (args.paths !== undefined) return readManyGuarded(model, args.paths, ref, optional);
        if (args.path === undefined) {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "path (one file) or paths (a set)",
            got: "neither",
            remedy: { tool: "se_file_read", args: { path: "<root-relative path>" }, note: "name what to read" },
            source: "engine/tools.ts se_file_read",
          });
        }
        return model.read(String(args.path), {
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.char_offset !== undefined ? { charOffset: Number(args.char_offset) } : {}),
          ...(args.char_limit !== undefined ? { charLimit: Number(args.char_limit) } : {}),
          ...(ref !== undefined ? { ref } : {}),
          ...(optional ? { optional: true } : {}),
        });
      },
    },
    {
      name: "se_file_write",
      title: "se.file.write",
      description:
        "Whole-file write. base_hash: null CREATES; otherwise base_hash must match disk (CAS) — read first, write with the hash you read. A DECLARED ROOT ('@name/rest') is a legal target ONLY where its declaration in .se/roots.json says writable: true — that is how this system drives a project that is not itself. A root that does not say so is refused, with the remedy showing the shape.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
          base_hash: { type: ["string", "null"], description: "null to create; the hash from se_file_read to overwrite" },
        },
        required: ["path", "content", "base_hash"],
      },
      // Some harnesses serialize the scalar null as its string — both mean CREATE.
      handler: (args) =>
        model.write(
          String(args.path),
          String(args.content),
          args.base_hash === null || args.base_hash === "null" ? null : String(args.base_hash),
        ),
    },
    {
      name: "se_file_patch",
      title: "se.file.patch",
      description:
        "EDIT FILES — five verbs, one atomic batch. Each op is ONE of: {path, old_string, new_string} exact match (unique, or replace_all) · {path, pattern, replacement, flags?, expect_count?} regex substitution, always global, count reported · {path, append: true, new_string} append (prepend: true likewise) — never rebuild a file to add to its end · {path, at: {from_line, to_line}, new_string, base_hash} replace a line range from a read you hold. MANY edits, MANY files, ONE call — every guard checked before anything is written. TRIVIAL MISMATCHES ARE CORRECTED, NOT REFUSED: a CRLF/LF difference is applied in the file's own endings and named on the result (`corrected`). A DECLARED ROOT ('@name/rest') is a legal target only where its declaration says writable: true.",
      inputSchema: {
        type: "object",
        properties: {
          ops: {
            type: "array",
            description: "[{path, + one verb's fields}, ...] — atomic across the batch",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                old_string: { type: "string", description: "exact verb: the text to find (unique unless replace_all)" },
                new_string: { type: "string", description: "the replacement / appended / prepended / range text" },
                base_hash: { type: "string", description: "CAS pin from se_file_read — REQUIRED on a range op" },
                replace_all: { type: "boolean" },
                pattern: { type: "string", description: "regex verb: JS regex, always global; $1 backrefs work in replacement" },
                replacement: { type: "string" },
                flags: { type: "string", description: "regex flags from i m s — g is implied" },
                expect_count: { type: "number", description: "regex verb: refuse unless the match count is exactly this" },
                append: { type: "boolean", description: "append new_string to the file's end (newline seam handled and named)" },
                prepend: { type: "boolean", description: "prepend new_string to the file's start" },
                at: { type: "object", description: "{from_line, to_line} 1-based inclusive — replace these lines with new_string" },
              },
              required: ["path"],
            },
          },
        },
        required: ["ops"],
      },
      handler: (args) => {
        // Unknown op fields refuse BY NAME — a mistyped find/replace once
        // read as "0 occurrences" and cost a round of misdiagnosis.
        const KNOWN = new Set([
          "path",
          "old_string",
          "new_string",
          "base_hash",
          "replace_all",
          "pattern",
          "replacement",
          "flags",
          "expect_count",
          "append",
          "prepend",
          "at",
        ]);
        const ALIAS: Record<string, string> = {
          find: "old_string",
          replace: "new_string",
          search: "old_string",
          old: "old_string",
          new: "new_string",
        };
        (Array.isArray(args.ops) ? (args.ops as Record<string, unknown>[]) : []).forEach((op, i) => {
          const unknown = Object.keys(op).filter((k) => !KNOWN.has(k));
          if (unknown.length > 0) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "op fields: path, old_string, new_string, base_hash?, replace_all?",
              got: `unknown field(s) on op ${i + 1}: ${unknown.map((k) => (ALIAS[k] !== undefined ? `${k} (use ${ALIAS[k]})` : k)).join(", ")}`,
              remedy: {
                tool: "se_file_patch",
                args: { ops: [{ path: "<path>", old_string: "<exact text>", new_string: "<replacement>" }] },
                note: "rename the fields and repeat — nothing was written",
              },
              source: "engine/tools.ts se_file_patch",
            });
          }
        });
        const ops = args.ops as PatchOp[];
        // A patch is ATOMIC under one root. Session state and project content
        // resolve to different trees, so a batch spanning both has no single
        // root to be atomic under — say so rather than writing half of it.
        const roots = new Set(ops.map((o) => rootOf(String(o.path))));
        if (roots.size > 1) {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "one atomic patch per tree — .se/ is session state, everything else is project content",
            got: `ops spanning ${roots.size} trees`,
            remedy: {
              tool: "se_file_patch",
              args: { ops: "[…only the .se/ ops, then a second call for the rest…]" },
              note: "split the batch; each call stays atomic within its own tree",
            },
            source: "engine/tools.ts",
          });
        }
        return model.patch(ops);
      },
    },
    {
      name: "se_file_replace",
      title: "se.file.replace",
      description:
        "SEARCH AND REPLACE ACROSS FILES — one regex, every file a glob reaches, one atomic call. se_file_patch's regex verb is the scalpel for a path you already hold; this is the sweep for a rename that runs through the tree.\n\nRUN IT WITH preview: true FIRST, AND READ WHAT COMES BACK. The preview computes everything and writes nothing: the places, and `by_file` — every file it would touch and how many places in each, BIGGEST FIRST. That list is the blast radius. A rule that hits one file four thousand times while its siblings take two looks fine in a sample of lines and obvious in `by_file`.\n\nIT HANDS BACK EVERY PLACE IT LANDED: path, line, and the line BEFORE and AFTER, so you judge the replace instead of trusting it. Read that list. A wide edit whose result is only a number is the one nobody can check, and undoing it costs more than reading it. `truncated: true` means you have NOT seen them all.\n\nCHANGE A RULE, PREVIEW AGAIN. A preview read before the last rule was added is not a preview of what runs.\n\nA pattern matching NOTHING is refused, never a quiet success. expect_count refuses unless the total is exactly that — use it when you already know how many places there are. Nothing is written unless every file passes every guard.",
      inputSchema: {
        type: "object",
        properties: {
          glob: { type: "string", description: "which files to sweep, e.g. **/*.ts or guidance/**/*.md" },
          pattern: { type: "string", description: "JS regex, always global; $1 backrefs work in replacement" },
          replacement: { type: "string" },
          flags: { type: "string", description: "flags from i m s — g is implied" },
          expect_count: { type: "number", description: "refuse unless the total match count across all files is exactly this" },
          preview: {
            type: "boolean",
            description: "compute everything and write NOTHING — returns the places plus by_file, the per-file blast radius, biggest first",
          },
        },
        required: ["glob", "pattern", "replacement"],
      },
      handler: (args) =>
        model.replace(String(args.glob), String(args.pattern), String(args.replacement), {
          ...(args.flags !== undefined ? { flags: String(args.flags) } : {}),
          ...(args.expect_count !== undefined ? { expect_count: Number(args.expect_count) } : {}),
          ...(args.preview === true ? { preview: true } : {}),
        }),
    },
    {
      name: "se_file_move",
      title: "se.file.move",
      description:
        "Move or rename a file and fix EVERY reference in one pass. PROSE (.md, .canvas) takes all three reference forms: root-relative paths, vault-relative canvas refs, and wiki links. SOURCE (.ts, .ps1, .json) takes the root-relative form only, because the other two are markdown conventions. Reports what was rewritten AND what it could not: `unrewritten` lists every surviving mention of the old path, with file and line, as work you still owe. A quiet `rewritten: []` never again means the move was clean. Refuses to overwrite.",
      inputSchema: {
        type: "object",
        properties: {
          from: { type: "string", description: "root-relative source path" },
          to: { type: "string", description: "root-relative destination path" },
        },
        required: ["from", "to"],
      },
      handler: (args) => model.move(String(args.from), String(args.to)),
    },
    {
      name: "se_file_delete",
      title: "se.file.delete",
      description:
        "Hash-guarded delete: base_hash must match disk — no blind removal. THE ANSWER NAMES WHO POINTED AT IT: for a trace node, cited_by lists every file citing its id, in frontmatter edges AND in prose, with line numbers. It never refuses — deleting a node with dependents is legal and often right, and the list is there while the decision is still being made. An unreferenced node answers with an empty list rather than silence.",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string" }, base_hash: { type: "string" } },
        required: ["path", "base_hash"],
      },
      handler: (args) => model.delete(String(args.path), String(args.base_hash)),
    },
    {
      name: "se_file_list",
      title: "se.file.list",
      description:
        "List entries under a project directory (root-relative; '.' is the project root). A DECLARED ROOT is browsable as '@name' or '@name/sub' — the owner declares roots in .se/roots.json.",
      inputSchema: {
        type: "object",
        properties: { dir: { type: "string", default: "." } },
      },
      handler: (args) => model.list(String(args.dir ?? ".")),
    },
    {
      name: "se_file_glob",
      title: "se.file.glob",
      description:
        "List project files matching a glob (e.g. **/*.test.ts) — the 'where does this live' lane. Glob a DECLARED ROOT as '@name/**/*.md'; hits come back as '@name/...', the same address the reader takes. Pass ref to glob a committed ref's tree instead ('main' reaches v1, 'v2' reaches v2).",
      inputSchema: {
        type: "object",
        properties: {
          glob: { type: "string" },
          ref: { type: "string", description: "glob this committed git ref's tree instead of the working tree" },
        },
        required: ["glob"],
      },
      // The GLOB carries the root selector, so it decides which store
      // answers. Called with no argument, the ambient root answered instead,
      // and a declared root read as undeclared while the READER resolved the
      // same name fine.
      handler: (args) => model.glob(String(args.glob), { ...(args.ref !== undefined ? { ref: String(args.ref) } : {}) }),
    },
    {
      name: "se_file_search",
      title: "se.file.search",
      description:
        "Regex search (ripgrep). context: N brings N lines around every hit — usually saves the follow-up read; include: '**/*.ts' filters by filename in the same call; count_only: true answers 'how many, where' for a fraction of the tokens. Search any git ref with ref (a branch or tag; this repo is a branch of quack, so 'main' reaches v1 and 'v2' reaches v2). Scope to a DECLARED ROOT with path: '@name'; hits come back as '@name/...', the same address the reader takes. For more than context can carry, read around a hit with se_file_read offset/limit.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "the regex" },
          intent: { type: "string", description: "what you are trying to find — logged, feeds the retro" },
          path: { type: "string", description: "restrict to a subdirectory (a pathspec when ref is given)" },
          ref: { type: "string", description: "search this committed ref instead of the tree" },
          ignore_case: { type: "boolean" },
          limit: { type: "number", default: 100 },
          context: {
            type: "number",
            description:
              "lines around each hit (capped at 10) — context lines carry context: true, so a neighbour is never mistaken for a match",
          },
          before: { type: "number", description: "asymmetric context: lines BEFORE each hit (wins over context)" },
          after: { type: "number", description: "asymmetric context: lines AFTER each hit (wins over context)" },
          include: { type: "string", description: "filename glob, e.g. **/*.ts — the search filters files itself; no listing pipe needed" },
          count_only: { type: "boolean", description: "per-file match counts instead of match lines" },
        },
        required: ["query", "intent"],
      },
      // The PATH scope carries the root selector here, for the same reason.
      handler: (args) =>
        model.search(String(args.query), {
          ...(args.path !== undefined ? { path: String(args.path) } : {}),
          ...(args.ref !== undefined ? { ref: String(args.ref) } : {}),
          ...(args.ignore_case === true ? { ignore_case: true } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.context !== undefined ? { context: Number(args.context) } : {}),
          ...(args.before !== undefined ? { before: Number(args.before) } : {}),
          ...(args.after !== undefined ? { after: Number(args.after) } : {}),
          ...(args.include !== undefined ? { include: String(args.include) } : {}),
          ...(args.count_only === true ? { count_only: true } : {}),
        }),
    },
  ];
}
