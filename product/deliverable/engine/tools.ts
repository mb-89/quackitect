// The tool surface — v3 bootstrap cut: drop-in replacements for every native
// tool the cage removes, plus the log query lane. The state machine wires in
// here next (one generic guard reading the active state's legal list); the
// surface below is deliberately COMPLETE for daily work and nothing else.
//
// Laws carried from v2:
//   R8  — required args enforced at dispatch; a wrong arg NAME is refused,
//         never silently coerced (the String(undefined) incident).
//   NEW — unknown args are refused too, naming the accepted set.
//   §5  — honest truncation everywhere; results carry the remedy inline.
import { CLAUSES, Rejection, type RejectionPayload } from "./errors.ts";
import { CallLog } from "./calllog.ts";
import { contentHash } from "./hash.ts";
import { parseUpdate } from "./decisions.ts";
import { Toll } from "./toll.ts";
import { readFileSync } from "node:fs";
import { fileDelete, fileGlob, fileList, filePatch, fileRead, fileWrite, type PatchOp } from "./files.ts";
import { LINT_CONFIG, lintProse } from "./lint.ts";
import { appendNote, backlogNotes, drainNote, pendingNotes, readNotes, type Priority } from "./inbox.ts";
import { parseStateNote } from "./notes.ts";
import { expList, readRecord } from "./worktree.ts";
import { survey } from "./survey.ts";
import { itList, readItRecord } from "./iterations.ts";
import { capJson } from "./jsonio.ts";
import { McpServer, type ToolDef } from "./mcp.ts";
import { gitLand, gitLane, gitSync } from "./gitlane.ts";
import { fileMove } from "./move.ts";
import { renderMirror } from "./render.ts";
import { shoot } from "./shoot.ts";
import { spawn } from "node:child_process";
import { openPanel } from "./panel.ts";
import { resolveInRoot, seDir } from "./paths.ts";
import { jobList, jobStatus, jobStop, run, runBackground, runOrHandoff } from "./run.ts";
import { search } from "./search.ts";
import { Session } from "./session.ts";
import { webFetch, webSearch } from "./web.ts";

/** THE TICK — the machinery's one tool, legal in every state. */
export function sessionTools(session: Session): ToolDef[] {
  return [
    // THE TICK IS RETIRED (owner ruling 2026-08-02). The walk verb is
    // se_pull; the machinery it drove — tickAdvance, sweep, jumpBack —
    // lives on inside the session, reached through the pull and the
    // mirror. The person's hand is the mirror, never a tool.
    {
      name: "se_pull",
      title: "se.pull",
      description:
        "THE PULL — your one verb. Say pull, do what comes back, pull again. The machine owns every decision; you decide nothing about the walk unless it ASKS you to. You never name a target, never carry read hashes, never ask which state you are in, and never ask which tools are legal. BLOCKING IS AN INSTRUCTION, NOT AN ERROR — a pull does not refuse a walk that cannot move yet, it tells you what to do about it. FIVE ANSWERS, and `pull` names which one you got. `read` — documents are owed: call se_reading until it answers done, then pull. `fill` — the next step wants evidence: the machine BUILT the form and handed it to you, so fill it and return it ON THE NEXT PULL as form: {\"<section>\": \"<text>\"}. THERE IS NO SUBMIT VERB; pulling without it hands back the same form. `choose` — the road splits: the machine offers its doors, and you answer ON THE NEXT PULL as form: {\"choice\": \"<to>\"} (a LIST is legal where the work fans out to several agents — the first is walked, the rest come back as not_walked). A choice exists ONLY where one was offered. `do` — the happy path was WALKED for you, every hop to the next branching point in one call: `here` is where you landed, with its guidance. `wait` — the machine is out of work, or the next step weighs more than the session autonomy: say plainly which step waits and STOP, because the slider alone cannot wake you and the person must message you after moving it. A genuinely illegal call still refuses typed — a choice outside the offer, a form nothing asked for.",
      inputSchema: {
        type: "object",
        properties: {
          form: {
            type: "object",
            description: "the filled form the LAST pull handed you. Evidence: {\"<section>\": \"<text>\", ...}. An offered choice: {\"choice\": \"<to>\"} — or a list, where the work fans out. Which one is never your call: evidence while a step demands it, a choice only where one was offered; evidence wins when both could read.",
          },
          escape: {
            type: "string",
            description: "step OUT with this reason — the ONE hatch for every kind of stepping out: the person said stop, the road is blocked, earlier work no longer stands (say so — the person invalidates from the mirror, and the walk re-earns it). Lands at the FRONT DESK, where the person routes; recorded with its reason. Boot cannot be escaped.",
          },
        },
      },
      handler: async (args) =>
        session.pull(
          {
            ...(typeof args.form === "object" && args.form !== null ? { form: args.form as Record<string, unknown> } : {}),
            ...(args.escape !== undefined ? { escape: String(args.escape) } : {}),
          },
          "agent",
        ),
    },
    {
      name: "se_reading",
      title: "se.reading",
      description:
        "THE READING, PULLED — call it, read what comes back, call it AGAIN, until it answers done: true. Each call hands over ONE document: the next guidance the way ahead demands, as text, already credited. You never name a path, you never carry a hash, and you never work out what you owe. WHAT IT GIVES YOU: with a target set, every document the whole way there, plus what the target's neighbours demand at entry. With NO target, where you stand IS the target — what this state pulls, plus what its neighbours demand. What you have already read is never served twice, so the loop always drains. WHY ONE AT A TIME: a host that moves a large tool result to disk hands you a PREVIEW instead of the text, and the engine has already credited it — you would stand proven to have read what you never saw. One document cannot be eaten. Legal in every state.",
      inputSchema: { type: "object", properties: {} },
      handler: () => session.pullReading(),
    },
    {
      name: "se_panel",
      title: "se.panel",
      description: "Open the panel (the mirror — the human's hand on the walk) in the user's default browser, or POINT AT IT: with ping, the named surface lights YELLOW in every open window and STAYS lit until you point somewhere else — the tour's pointing finger, and 'look HERE' for a refusal or a diff. Legal in every state.",
      inputSchema: {
        type: "object",
        properties: {
          ping: { type: "string", description: "light this surface instead of opening the panel, and leave it lit until the next ping: a card id (its title from product/cards.md, slugged — e.g. state-machine, chat, log, details), the widget a card shows (machine, terminal), a drawn state id, or an element id" },
          note: { type: "string", description: "optional one-liner recorded with the ping" },
        },
      },
      handler: (args) => {
        if (session.mirrorUrl === undefined) {
          throw new Rejection({
            clause: CLAUSES.NOT_CONFIGURED,
            expected: "a listening mirror (the panel)",
            got: "no mirror on this session (port 0, or the bind failed)",
            remedy: { tool: "se_pull", args: {}, note: "start the server with a mirror port (default 7333); the URL also prints on the server's stderr" },
            source: "engine/tools.ts panel",
          });
        }
        if (args.ping !== undefined) {
          return session.pingSurface(String(args.ping), args.note === undefined ? undefined : String(args.note));
        }
        openPanel(session.mirrorUrl);
        return { opened: session.mirrorUrl, note: "the panel is opening in the user's browser" };
      },
    },
    {
      name: "se_reload",
      title: "se.reload",
      description:
        "Reload the engine onto the current sources — legal only with the walk at idle. Canary-guarded: a tree that does not load is refused and the running engine survives. The reload reboots the walk (boot re-proves the engine green). Swaps NEVER fire on their own — this call, from either hand, is the only trigger.",
      inputSchema: { type: "object", properties: {} },
      handler: () => session.requestReload(),
    },
  ];
}

export function expeditionTools(session: Session): ToolDef[] {
  return [
    {
      name: "se_seed_expedition",
      title: "se.seed.expedition",
      description: "Seed an expedition: mints its record and worktree (branch exp/<id>). Declare kind (spike | fix | explore) and goal. It stands in the expeditions container at once — entering there binds it.",
      inputSchema: {
        type: "object",
        properties: {
          kind: { type: "string", description: "spike | fix | explore" },
          goal: { type: "string", description: "what this expedition is after" },
        },
        required: ["kind", "goal"],
      },
      handler: (args) => session.expeditionNew(String(args.kind), String(args.goal)),
    },
    {
      name: "se_seed_iteration",
      title: "se.seed.iteration",
      description:
        "Seed an iteration: goal + rough vision, plus input refs (an expedition id, retro note refs). Mints its record and worktree (branch it/<id>); it stands in the iterations container as its KICKOFF — the kickoff's outcome seeds the rest. A pending 'needs retro' note gates only the FIRST start of a never-walked iteration, never the seeding.",
      inputSchema: {
        type: "object",
        properties: {
          goal: { type: "string", description: "what this iteration is after" },
          vision: { type: "string", description: "roughly how — what done looks like" },
          inputs: { type: "array", items: { type: "string" }, description: "context refs: an expedition id, retro note refs" },
        },
        required: ["goal", "vision"],
      },
      handler: (args) => session.iterationSeed(String(args.goal), String(args.vision), Array.isArray(args.inputs) ? args.inputs.map(String) : []),
    },
    {
      name: "se_exp_close",
      title: "se.exp.close",
      description: "Close the bound expedition — the close IS the ruling: apply (merge: true, default) merges the changes to trunk, then archives; dismiss (merge: false) archives the branch unmerged. Leftovers are committed either way; the worktree is removed. THE REPORT MUST BE CONFIRMED BY A PERSON, in the mirror. Closing on a report the agent finished itself is refused unless `override` says who authorised it — and the override is stamped on the record, so the archive shows which reports carry a person's judgement and which do not.",
      inputSchema: { type: "object", properties: { merge: { type: "boolean", description: "true = apply (default); false = dismiss" }, override: { type: "string", description: "who lifted the confirmation requirement, and where they said it — required when the report was not confirmed by a person; recorded on the record" } } },
      handler: (args) => session.expeditionClose(args.merge !== false, args.override === undefined ? undefined : String(args.override)),
    },
  ];
}

// rootOf takes the path because ONE lane serves two trees: `.se/` is session
// state at the project root, everything else follows the walk into its bound
// worktree (Session.laneRoot, owner ruling 2026-07-28). Callers that act on no
// single path — search, glob, run, git — pass nothing and get the work root.
// judgmentDrainAllowed answers ONE question for se_note_drain: may this
// caller park a note or carry it, or only record the mechanical verdicts.
// It is a thunk because the walk moves under a built tool list.
// THE PEEK RETIRED WITH THE TICK: an agent choosing among doors gets them
// from the pull's own offer, statements and weights riding along. The
// mirror still reads any state through stateInfo.

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
function readMany(rootOf: (rel?: string) => string, entries: unknown[], ref: string | undefined, optional: boolean): Record<string, unknown> {
  if (entries.length > MAX_READ_PATHS) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `at most ${MAX_READ_PATHS} paths in one call`,
      got: `${entries.length} paths`,
      remedy: { tool: "se_file_read", args: { paths: ["<first>", "<second>"] }, note: "ask for the set you will actually read; a wide multi-read spends context on documents nobody wanted" },
      source: "engine/tools.ts se_file_read",
    });
  }
  const files = entries.map((e) => {
    const spec = typeof e === "string" ? { path: e } : (e as { path?: unknown; offset?: unknown; limit?: unknown; optional?: unknown });
    const path = String(spec.path ?? "");
    try {
      return fileRead(rootOf(path), path, {
        ...(spec.offset !== undefined ? { offset: Number(spec.offset) } : {}),
        ...(spec.limit !== undefined ? { limit: Number(spec.limit) } : {}),
        ...(ref !== undefined ? { ref } : {}),
        ...(spec.optional === true || optional ? { optional: true } : {}),
      }) as Record<string, unknown>;
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

export function coreTools(rootOf: (rel?: string) => string, projectRoot: string, judgmentDrainAllowed: () => boolean = () => true, reading?: ReadingHook, doors: () => Record<string, unknown>[] = () => []): ToolDef[] {
  return [
    {
      name: "se_file_read",
      title: "se.file.read",
      description:
        "Read a project file (root-relative path) — TEXT OR IMAGE. Returns the CAS hash writes will demand. Text comes back as numbered lines; pass offset (1-based line) / limit to read a large file in PARTS — an oversize whole-file read is refused with the remedy, never silently truncated. An IMAGE (png, jpg, gif, webp) comes back as the picture itself, so a sketch can be LOOKED AT rather than described to you. Any other binary is refused. A DECLARED ROOT is reachable as '@name/rest' (the owner declares roots in .se/roots.json; they are read-only). Pass ref to read AT A COMMITTED REF ('main' reaches v1, 'v2' reaches v2) — pair with se_file_search/se_file_glob at the same ref. Pass optional: true for a file that is ALLOWED to be missing (the handover): absence answers exists: false rather than refusing. THE READING (.se/reading.md) is the one path the ENGINE writes: it holds every document the way ahead still demands, concatenated, and reading it CREDITS them all — one call instead of one per document, and no read_hashes to carry afterwards. The packet names it whenever anything is owed.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          paths: {
            type: "array",
            description: "read MANY in ONE call — a list of paths, or of {path, offset?, limit?} for per-file windows. Read-proof is a SET, so a state's whole reading list comes back in one envelope, each entry with its own hash. An unreadable path returns its refusal in place of its content and the others still arrive.",
            items: { type: ["string", "object"] },
          },
          offset: { type: "number", description: "1-based first line" },
          limit: { type: "number", description: "how many lines" },
          ref: { type: "string", description: "read from this committed git ref instead of the working tree" },
          optional: { type: "boolean", description: "the file is ALLOWED not to exist — absence comes back as exists: false instead of a refusal. Only absence is forgiven; a path outside the root still refuses. Per-entry in `paths` too." },
        },
      },
      handler: (args) => {
        const ref = args.ref !== undefined ? String(args.ref) : undefined;
        const optional = args.optional === true;
        // THE READING is written the moment it is asked for, then served like
        // any other file — same numbered lines, same hash, same offset/limit.
        // What it showed is credited on the way out, so the documents inside
        // it never have to be asked for again.
        if (reading !== undefined && ref === undefined && args.paths === undefined && String(args.path ?? "").replace(/\\/g, "/") === reading.path) {
          reading.build();
          const res = fileRead(rootOf(reading.path), reading.path, {
            ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
            ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
            maxChars: READING_BUDGET,
          }) as unknown as Record<string, unknown>;
          const range = res.range as { offset: number; limit: number } | undefined;
          const offset = range?.offset ?? 1;
          const lines = range?.limit ?? Number(res.total_lines ?? 0);
          return { ...res, credited: reading.credit(offset, lines) };
        }
        if (args.paths !== undefined) {
          if (!Array.isArray(args.paths)) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "paths as an array of paths, or of {path, offset?, limit?}",
              got: typeof args.paths,
              remedy: { tool: "se_file_read", args: { paths: ["<path>"] }, note: "one path uses `path`; a set uses `paths`" },
              source: "engine/tools.ts se_file_read",
            });
          }
          return readMany(rootOf, args.paths, ref, optional);
        }
        if (args.path === undefined) {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "path (one file) or paths (a set)",
            got: "neither",
            remedy: { tool: "se_file_read", args: { path: "<root-relative path>" }, note: "name what to read" },
            source: "engine/tools.ts se_file_read",
          });
        }
        return fileRead(rootOf(String(args.path)), String(args.path), {
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(ref !== undefined ? { ref } : {}),
          ...(optional ? { optional: true } : {}),
        });
      },
    },
    {
      name: "se_file_write",
      title: "se.file.write",
      description: "Whole-file write. base_hash: null CREATES; otherwise base_hash must match disk (CAS) — read first, write with the hash you read.",
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
      handler: (args) => fileWrite(rootOf(String(args.path)), String(args.path), String(args.content), args.base_hash === null || args.base_hash === "null" ? null : String(args.base_hash)),
    },
    {
      name: "se_file_patch",
      title: "se.file.patch",
      description:
        "Exact-match edit: old_string must occur exactly once (or pass replace_all). Pass ops:[{path, old_string, new_string}] to apply MANY edits across MANY files in ONE atomic call — every guard is checked before anything is written. Batch related edits; do not loop single calls.",
      inputSchema: {
        type: "object",
        properties: {
          ops: {
            type: "array",
            description: "[{path, old_string, new_string, base_hash?, replace_all?}, ...] — atomic",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                old_string: { type: "string" },
                new_string: { type: "string" },
                base_hash: { type: "string" },
                replace_all: { type: "boolean" },
              },
              required: ["path", "old_string", "new_string"],
            },
          },
        },
        required: ["ops"],
      },
      handler: (args) => {
        // Unknown op fields refuse BY NAME — a mistyped find/replace once
        // read as "0 occurrences" and cost a round of misdiagnosis.
        const KNOWN = new Set(["path", "old_string", "new_string", "base_hash", "replace_all"]);
        const ALIAS: Record<string, string> = { find: "old_string", replace: "new_string", search: "old_string", old: "old_string", new: "new_string" };
        (Array.isArray(args.ops) ? (args.ops as Record<string, unknown>[]) : []).forEach((op, i) => {
          const unknown = Object.keys(op).filter((k) => !KNOWN.has(k));
          if (unknown.length > 0) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "op fields: path, old_string, new_string, base_hash?, replace_all?",
              got: `unknown field(s) on op ${i + 1}: ${unknown.map((k) => (ALIAS[k] !== undefined ? `${k} (use ${ALIAS[k]})` : k)).join(", ")}`,
              remedy: { tool: "se_file_patch", args: { ops: [{ path: "<path>", old_string: "<exact text>", new_string: "<replacement>" }] }, note: "rename the fields and repeat — nothing was written" },
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
            remedy: { tool: "se_file_patch", args: { ops: "[…only the .se/ ops, then a second call for the rest…]" }, note: "split the batch; each call stays atomic within its own tree" },
            source: "engine/tools.ts",
          });
        }
        return filePatch(rootOf(ops.length > 0 ? String(ops[0].path) : undefined), ops);
      },
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
      handler: (args) => fileMove(rootOf(String(args.from)), String(args.from), String(args.to)),
    },
    {
      name: "se_file_delete",
      title: "se.file.delete",
      description: "Hash-guarded delete: base_hash must match disk — no blind removal.",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string" }, base_hash: { type: "string" } },
        required: ["path", "base_hash"],
      },
      handler: (args) => fileDelete(rootOf(String(args.path)), String(args.path), String(args.base_hash)),
    },
    {
      name: "se_file_list",
      title: "se.file.list",
      description: "List entries under a project directory (root-relative; '.' is the project root). A DECLARED ROOT is browsable as '@name' or '@name/sub' — the owner declares roots in .se/roots.json.",
      inputSchema: {
        type: "object",
        properties: { dir: { type: "string", default: "." } },
      },
      handler: (args) => fileList(rootOf(String(args.dir ?? ".")), String(args.dir ?? ".")),
    },
    {
      name: "se_file_glob",
      title: "se.file.glob",
      description: "List project files matching a glob (e.g. **/*.test.ts) — the 'where does this live' lane. Glob a DECLARED ROOT as '@name/**/*.md'; hits come back as '@name/...', the same address the reader takes. Pass ref to glob a committed ref's tree instead ('main' reaches v1, 'v2' reaches v2).",
      inputSchema: {
        type: "object",
        properties: { glob: { type: "string" }, ref: { type: "string", description: "glob this committed git ref's tree instead of the working tree" } },
        required: ["glob"],
      },
      // The GLOB carries the root selector, so it decides which tree answers.
      // Called with no argument, a bound worktree answered instead — and the
      // worktree has no .se/roots.json, so every declared root read as
      // undeclared while the READER resolved the same name fine.
      handler: (args) => fileGlob(rootOf(String(args.glob)), String(args.glob), { ...(args.ref !== undefined ? { ref: String(args.ref) } : {}) }),
    },
    {
      name: "se_file_search",
      title: "se.file.search",
      description:
        "Regex search across the working tree (ripgrep) OR any git ref (pass ref — a branch or tag; this repo is a branch of quack, so 'main' reaches v1 and 'v2' reaches v2). Scope it to a DECLARED ROOT with path: '@name'; hits come back as '@name/...', the same address the reader takes. Returns match LOCATIONS with an intent trail; read around a hit with se_file_read offset/limit.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "the regex" },
          intent: { type: "string", description: "what you are trying to find — logged, feeds the retro" },
          path: { type: "string", description: "restrict to a subdirectory (a pathspec when ref is given)" },
          ref: { type: "string", description: "search this committed ref instead of the tree" },
          ignore_case: { type: "boolean" },
          limit: { type: "number", default: 100 },
        },
        required: ["query", "intent"],
      },
      // The PATH scope carries the root selector here, for the same reason.
      handler: (args) =>
        search(rootOf(args.path === undefined ? undefined : String(args.path)), String(args.query), {
          ...(args.path !== undefined ? { path: String(args.path) } : {}),
          ...(args.ref !== undefined ? { ref: String(args.ref) } : {}),
          ...(args.ignore_case === true ? { ignore_case: true } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
        }),
    },
    {
      name: "se_shoot",
      title: "se.shoot",
      description:
        "LOOK AT THE MIRROR. Renders the surface to an image and hands back the PICTURE, so a change to a pane can be judged by seeing it rather than by reading its HTML. Shoot the whole page, or one widget with widget: 'machine' | 'details' | 'log' | 'terminal'. view: names a machine to draw instead of the one being walked. Nothing is served over HTTP and no browser window opens.",
      inputSchema: {
        type: "object",
        properties: {
          widget: { type: "string", description: "machine | details | log | terminal — omit for the whole page" },
          view: { type: "string", description: "draw this machine instead of the one the walk stands in" },
          width: { type: "number", description: "viewport width, default 1600" },
          height: { type: "number", description: "viewport height, default 1000" },
        },
      },
      handler: (args) => {
        const w = args.widget === undefined ? undefined : (String(args.widget) as "machine" | "details" | "log" | "terminal" | "table");
        // The same renderer the owner's mirror uses, so the picture is the
        // surface itself rather than a second drawing of it.
        const html = renderMirror({ root: rootOf(), session }, w, args.view === undefined ? undefined : String(args.view));
        // .se IS SESSION STATE, so a shot belongs to the PROJECT root however
        // deep in a worktree the walk stands — exactly as the handover, the
        // notes and the call log do. Passing rootOf() with no address would
        // write the shot where the reader never looks.
        return shoot(rootOf(".se"), html, {
          ...(args.width !== undefined ? { width: Number(args.width) } : {}),
          ...(args.height !== undefined ? { height: Number(args.height) } : {}),
          name: w ?? "page",
        });
      },
    },
    {
      name: "se_run",
      title: "se.run",
      description:
        "Run a shell command from the project root (bash on POSIX, PowerShell on Windows). Output is engine-captured and logged IN FULL under the returned call ref — a run is citable evidence.\n\nNOBODY WAITS. A command still running after 20s is HANDED OFF to the background and you get a job handle at once; ask again with {job} for its output so far, and {job, stop: true} to kill it and everything it spawned. Start long work in the background yourself with {background: true}. {jobs: true} lists this session's jobs.\n\nNEVER call this session's own mirror over HTTP from here — the run blocks the server's event loop, so the mirror cannot answer itself.",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string" },
          background: { type: "boolean", description: "start it detached and return a job handle IMMEDIATELY — for work you know is long" },
          job: { type: "string", description: "ask an existing job how it is doing: its output so far, whether it still runs" },
          stop: { type: "boolean", description: "with job: kill it and every process it spawned" },
          jobs: { type: "boolean", description: "list every job this session started, newest first" },
          handoff_ms: { type: "number", description: "how long to wait inline before handing off to the background (default 20000)" },
          timeout_ms: { type: "number" },
          cwd: { type: "string", description: "root-relative working directory" },
        },
      },
      handler: (args) => {
        if (args.jobs === true) return { jobs: jobList() };
        if (args.job !== undefined) return args.stop === true ? jobStop(String(args.job)) : jobStatus(String(args.job));
        if (args.command === undefined) {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "a command to run, or a job to ask about",
            got: "neither",
            remedy: { tool: "se_run", args: { command: "<the command>" }, note: "pass command, or job to check one already running" },
            source: "engine/tools.ts se_run",
          });
        }
        const cwd = args.cwd !== undefined ? { cwd: String(args.cwd) } : {};
        if (args.background === true) return runBackground(rootOf(), String(args.command), cwd);
        return runOrHandoff(rootOf(), String(args.command), {
          ...cwd,
          ...(args.handoff_ms !== undefined ? { handoff_ms: Number(args.handoff_ms) } : {}),
        });
      },
    },
    {
      name: "se_test",
      title: "se.test",
      description:
        "Run the engine's own checks in ONE call: the preflight and the full selftest suite, each with structured pass/fail and captured output. Runs in the bound worktree when one is open. Replaces the free-form se_run pair.",
      inputSchema: { type: "object", properties: {} },
      handler: async () => {
        const root = rootOf();
        const scripts = ["product/deliverable/engine/bin/preflight.ts", "product/deliverable/engine/bin/selftest.ts"];
        const results: { script: string; ok: boolean; exit: number | null; output: string }[] = [];
        for (const rel of scripts) {
          const abs = resolveInRoot(root, rel, "engine/tools.ts se_test");
          const r = await new Promise<{ status: number | null; out: string }>((resolve) => {
            const child = spawn("node", [abs, "--root", root], { cwd: root });
            let out = "";
            child.stdout.on("data", (d: Buffer) => { out += d; });
            child.stderr.on("data", (d: Buffer) => { out += d; });
            const timer = setTimeout(() => child.kill(), 150_000);
            child.on("error", (e) => { clearTimeout(timer); resolve({ status: null, out: String(e) }); });
            child.on("close", (code) => { clearTimeout(timer); resolve({ status: code, out }); });
          });
          results.push({ script: rel, ok: r.status === 0, exit: r.status, output: r.out.trim().slice(0, 4000) });
        }
        return { ok: results.every((x) => x.ok), results };
      },
    },
    {
      name: "se_git",
      title: "se.git",
      description:
        "Git through the lane, allowlisted: status, log, diff, show, add, commit, fetch, branch, rev-parse, restore (--staged only), checkout (--ours/--theirs on a conflicted path, mid-merge only), merge (--abort to back out a conflict). No push — pushing is the user's act; no rebase — a diverged branch reconciles by merge, which only adds a revertable commit. Runs in the bound worktree when an expedition is open, else the root.",
      inputSchema: {
        type: "object",
        properties: { args: { type: "array", items: { type: "string" }, description: 'git arguments, e.g. ["status", "--porcelain"]' } },
        required: ["args"],
      },
      handler: (args) => gitLane(rootOf(), (args.args as unknown[]) ?? []),
    },
    {
      name: "se_git_land",
      title: "se.git.land",
      description:
        "LAND the bound expedition's commits on trunk and LEAVE IT OPEN — an expedition is a day's bucket and does not close to ship. Fast-forwards where it can, merges where it cannot, and on conflict ABORTS and refuses typed, so nothing is half-done. Reports what went across.",
      inputSchema: { type: "object", properties: {} },
      handler: () => gitLand(projectRoot, rootOf()),
    },
    {
      name: "se_git_sync",
      title: "se.git.sync",
      description:
        "SYNC trunk INTO the bound expedition, so a worktree is never silently stale — its branch was cut when the expedition was SEEDED, which may be days before it was entered. On conflict it ABORTS and refuses typed. Reports what came in.",
      inputSchema: { type: "object", properties: {} },
      handler: () => gitSync(projectRoot, rootOf()),
    },
    {
      name: "se_web_fetch",
      title: "se.web.fetch",
      description: "Fetch a URL as readable text (HTML reduced). Large pages page through offset; truncation is always declared.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string" },
          offset: { type: "number", description: "char offset for paging a large page" },
        },
        required: ["url"],
      },
      handler: (args) => webFetch(String(args.url), args.offset !== undefined ? { offset: Number(args.offset) } : {}),
    },
    {
      name: "se_web_search",
      title: "se.web.search",
      description: "Web search (provider-backed; needs SE_BRAVE_API_KEY on the server — refuses with setup instructions when unconfigured).",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          count: { type: "number", default: 8 },
        },
        required: ["query"],
      },
      handler: (args) => webSearch(String(args.query), args.count !== undefined ? Number(args.count) : 8),
    },
    {
      name: "se_note",
      title: "se.note",
      description:
        "Capture a stray — an idea, a bug, a better way — without leaving the state (contract rule 4). Machine-local (.se/notes.jsonl), never committed; joins the mirror's log feed; drained at a retro, later. CAPTURING IS MEANT TO BE CHEAP: give it a title, judge the priority yourself, and keep walking. Never ask the person what a stray is worth.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "the body — leave it out when the title already says it" },
          title: { type: "string", description: "one line naming the stray; taken from the first line of text when absent" },
          priority: { type: "string", enum: ["must", "should", "could"], description: "MoSCoW. YOU judge it, never the person. Defaults to could." },
        },
      },
      handler: (args) => {
        const title = args.title !== undefined ? String(args.title) : "";
        const text = args.text !== undefined ? String(args.text) : title;
        if (text.trim() === "") {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "text, or a title standing in for it",
            got: "neither",
            remedy: { tool: "se_note", args: { title: "<one line>", priority: "could" }, note: "a title alone is a legal note — the body is what you add when one line is not enough" },
            source: "engine/tools.ts se_note",
          });
        }
        refuseProseWall("se_note", "text", text);
        return appendNote(seDir(projectRoot), text, "agent", title, args.priority as Priority | undefined);
      },
    },
    {
      name: "se_lint",
      title: "se.lint",
      description:
        "The VOICE LINT, on demand: mechanical prose checks (walls of text, long sentences, comma chains, dash chains, missing pyramid structure) over a text, a markdown file, or a whole GLOB of them. Rule parameters are DATA (machines/lint/voice-lint.md) - edit thresholds without recompiling. Catches FORM, never meaning. Self-check your outputs before they ship; sweep a tree with glob before it ships.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "prose to lint, verbatim" },
          path: { type: "string", description: "a root-relative .md file to lint instead" },
          glob: { type: "string", description: "sweep every markdown file matching this glob, e.g. product/guidance/**/*.md" },
        },
      },
      handler: (args) => {
        const root = rootOf();
        // THE SWEEP. Linting one file at a time is why nothing was ever
        // linted: the tool could only be pointed at prose somebody already
        // suspected. Only files WITH findings come back, so a clean tree
        // answers small, and anything dropped is named rather than implied.
        if (args.glob !== undefined) {
          const g = fileGlob(root, String(args.glob));
          const md = g.files.filter((f) => f.endsWith(".md"));
          // A STATE NOTE KEEPS ITS PROSE IN THE FRONTMATTER. `guidance` is
          // read by an agent on every single visit, so it is the prose that
          // matters most - and the lint had never seen a word of it, because
          // lintProse strips frontmatter before it starts.
          const lintFile = (p: string): { path: string; count: number; findings: unknown[] } => {
            const raw = readFileSync(resolveInRoot(root, p, "engine/tools.ts se_lint"), "utf8");
            const findings: unknown[] = lintProse(root, raw).map((f) => ({ ...f, where: "body" }));
            try {
              const fm = parseStateNote(raw).frontmatter;
              for (const key of ["guidance", "statement"]) {
                const v = fm[key];
                if (typeof v !== "string" || v.trim() === "") continue;
                for (const f of lintProse(root, v)) findings.push({ ...f, where: key });
              }
            } catch { /* a note that will not parse is the canvas lint's problem, not the prose lint's */ }
            return { path: p, count: findings.length, findings };
          };
          const files = md.map(lintFile).filter((f) => f.count > 0);
          return {
            glob: String(args.glob),
            swept: md.length,
            ...(md.length < g.files.length ? { skipped_not_markdown: g.files.length - md.length } : {}),
            ...(g.truncated ? { truncated: true, note: "the glob hit its cap - narrow it and sweep the rest" } : {}),
            clean: md.length - files.length,
            files,
            count: files.reduce((n, f) => n + f.count, 0),
            config: LINT_CONFIG,
          };
        }
        if (args.path !== undefined) {
          const p = String(args.path);
          if (!p.endsWith(".md")) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "a prose file (.md) - the voice lint never reads code",
              got: p,
              remedy: { tool: "se_lint", args: { path: "<file>.md" }, note: "or pass text directly" },
              source: "engine/tools.ts se_lint",
            });
          }
          const abs = resolveInRoot(root, p, "engine/tools.ts se_lint");
          const findings = lintProse(root, readFileSync(abs, "utf8"));
          return { path: p, findings, count: findings.length, config: LINT_CONFIG };
        }
        if (typeof args.text === "string") {
          const findings = lintProse(root, args.text);
          return { findings, count: findings.length, config: LINT_CONFIG };
        }
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: "text, path OR glob",
          got: "none of them",
          remedy: { tool: "se_lint", args: { glob: "product/guidance/**/*.md" }, note: "text lints one block, path one file, glob a whole tree" },
          source: "engine/tools.ts se_lint",
        });
      },
    },
    {
      name: "se_answer",
      title: "se.answer",
      description:
        "Record an answered question (kind 'aq' in the log): the person's question and your answer, verbatim. The voice rule: EVERY direct question answered in chat is ALSO recorded here — chat can be lost mid-turn, the log never loses it. The feed line shows the question; clicking it shows both.",
      inputSchema: {
        type: "object",
        properties: {
          question: { type: "string", description: "the question, short form — becomes the feed line" },
          answer: { type: "string", description: "the answer, complete — shown on click" },
        },
        required: ["question", "answer"],
      },
      handler: (args) => {
        refuseProseWall("se_answer", "answer", String(args.answer));
        return { recorded: "aq", question: String(args.question).slice(0, 90) };
      },
    },
    {
      name: "se_note_drain",
      title: "se.note.drain",
      description: "Mark a note drained with its disposition. done | obsolete are MECHANICAL — superseded, already built, ruled on since — and drain wherever this tool is legal, the front desk included. carried | backlog are JUDGMENT and belong to the retro, which is the only place with the whole picture. backlog PARKS the note: where is REQUIRED as its 'ready when …' re-entry condition, and a later migration re-drains it. Drained notes leave the inbox count and the pending feed. An unknown ref is refused.",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "the note's ref (note-…)" },
          disposition: { type: "string", description: "done | obsolete | carried | backlog" },
          where: { type: "string", description: "where it landed or lives on — backlog REQUIRES it: ready when …" },
        },
        required: ["ref", "disposition"],
      },
      handler: (args) => drainNote(seDir(projectRoot), String(args.ref), String(args.disposition), args.where === undefined ? undefined : String(args.where), judgmentDrainAllowed()),
    },
    {
      name: "se_survey",
      title: "se.survey",
      description:
        "WHAT STANDS OPEN — one mechanical call: open expeditions, open iterations, pending notes, and parked backlog items with their ready-when. Everything that can be up is here, so there is only ever ONE inbox to understand. Notes and backlog list as title plus MoSCoW priority, highest first; read any one in full with se_log_query {ref}. The front desk and the retro open with it. The person asks the same question in the mirror, from the machine's header.",
      inputSchema: {
        type: "object",
        properties: {
          detail: { type: "string", enum: ["full", "brief"], description: "full adds every note's whole body. The default lists title and priority only." },
          limit: { type: "number", description: "window the notes list; counts stay complete and the result says what remains" },
          offset: { type: "number", description: "how many notes to skip — 0 is the oldest" },
        },
      },
      handler: (args) => ({
        ...survey(projectRoot, {
          ...(args.detail !== undefined ? { detail: String(args.detail) as "full" | "brief" } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
        }),
        // THE DOORS RIDE THE SURVEY. The desk used to peek every idle door
        // in one tick call; the peek retired with the tick, and the survey
        // is where the desk already looks first — so the vocabulary the
        // advice needs arrives with the same call that lists the work.
        doors: doors(),
      }),
    },
    {
      name: "se_log_query",
      title: "se.log.query",
      description: "Query the call log (your own trail): filter by tool/ok/since/text, group_by a field, or fetch a se_run ref's full output. Pages NEWEST FIRST — offset 0 is the newest window, and the result says how many `older` records stand behind it.",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "fetch one record in full by ref" },
          filter: { type: "object", description: "{tool?, ok?, since?, text?} — since: an ISO timestamp, or 'last_retro' (everything after the previous retro, which is the newest carried/backlog drain — the desk cannot make those). text: a case-insensitive substring over the whole record, for finding a TOPIC without reading every hit" },
          group_by: { type: "string", description: "e.g. 'tool' or 'outcome'" },
          limit: { type: "number", default: 20 },
          offset: { type: "number", description: "how many records back from the newest to start — 0 is the newest window" },
        },
      },
      handler: (args) => {
        const log = new CallLog(seDir(projectRoot));
        if (args.ref !== undefined) {
          const rec = log.find(String(args.ref));
          // A NOTE REF RESOLVES HERE TOO. Notes reference each other
          // constantly, and the referenced one is usually DRAINED, so the
          // survey cannot show it. This is already the by-ref lookup; making
          // it answer for notes costs no new tool and no new vocabulary.
          if (rec === undefined) {
            const note = readNotes(seDir(projectRoot)).find((n) => n.ref === String(args.ref));
            if (note !== undefined) return note;
          }
          if (rec === undefined) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "an existing call ref, or a note ref",
              got: String(args.ref),
              remedy: { tool: "se_log_query", args: { limit: 20 }, note: "list recent calls to find the ref" },
              source: "engine/tools.ts se_log_query",
            });
          }
          return rec;
        }
        return log.query({
          ...(args.filter !== undefined ? { filter: args.filter as { tool?: string; ok?: boolean; since?: string } } : {}),
          ...(args.group_by !== undefined ? { group_by: String(args.group_by) } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
        });
      },
    },
  ];
}

/** Build the server: session machine + tools + guards + the raw call log.
 *  Guard order: arg shape → THE STATE GATE → handler. Pass a Session to
 *  share it with another hand (the embedded mirror drives the SAME walk). */
/** THE PROSE-WALL LINT (owner law 2026-07-28): every HTML surface keeps
 *  line breaks — so long prose MUST carry them. An authored wall is refused
 *  at the tool boundary, mechanically. */
function refuseProseWall(tool: string, field: string, text: string): void {
  if (text.length <= 300 || text.includes("\n")) return;
  throw new Rejection({
    clause: CLAUSES.PROSE_WALL,
    expected: `${field} broken into lines — paragraphs and list lines survive every render`,
    got: `${text.length} chars without a single line break — renders as a wall`,
    remedy: { tool, args: { [field]: "<the same text with real line breaks>" }, note: "shape it like prose: short paragraphs, one list item per line" },
    source: "engine/tools.ts prose-wall",
  });
}

export function buildServer(root: string, session = new Session(root), tollOpts: { windowMs?: number; now?: () => number } = {}): McpServer {
  // (a fresh Session fails fast on a misdrawn machine)
  const tools = [
    ...sessionTools(session),
    ...expeditionTools(session),
    ...coreTools(
      (rel) => session.laneRoot(rel),
      root,
      () => session.inRetro(),
      {
        path: Session.READING_PATH,
        build: () => session.buildReading(),
        credit: (offset, lines) => session.creditReading(offset, lines),
      },
      () => session.doors(),
    ),
  ];
  // THE UPDATE FIELD — every lane tool accepts it: a decision-graph op
  // riding the call. Declared on every schema so harnesses send it as an
  // object (an undeclared property arrives as a JSON string — v2 lesson).
  const UPDATE_PROP = {
    type: "object",
    description:
      "decision-graph update riding this call — narrate as you work. {op: plan|fork|done|obsolete|revert|update, brief?, items?, node?}: plan {items} starts the state's checklist; fork {brief, items?} opens an unplanned branch where you are; done|obsolete|revert {node, brief} resolves a node — everything started gets resolved, silently abandoning is illegal; update {node, brief} says what you are doing ON an item — the node is REQUIRED while any item stands open, because an update that moves nothing on the checklist is narration, not progress (with nothing open, a bare update is right); defer {node, to} parks a point for the state that can do it — it arrives there as an open to-do. Every call answers with update_result, carrying the open node map and any nudge. A volunteered update resets the toll; when the toll lapses, the next call must carry one.",
  };
  for (const t of tools) (t.inputSchema.properties as Record<string, unknown>).update = UPDATE_PROP;
  const server = new McpServer({ name: "se-mcp", version: "3.0.0-bootstrap" }, tools);
  const log = new CallLog(seDir(root));
  const toll = new Toll({ ...tollOpts, cadence: () => ({ minutes: session.narrationMinutes, calls: session.narrationCalls }) });

  // Session read buffer: live se_file_read results feed later tick proofs.
  // Reads at a git ref are intentionally excluded.
  server.addDecorator((tool, result) => {
    if (tool !== "se_file_read") return result;
    if (result === null || typeof result !== "object" || Array.isArray(result)) return result;
    const r = result as Record<string, unknown>;
    const remember = (o: Record<string, unknown>): void => {
      if (typeof o.path === "string" && typeof o.hash === "string") {
        session.rememberRead(o.path, o.hash, typeof o.ref === "string" ? o.ref : undefined);
      }
    };
    // A MULTI-READ IS STILL A READ. Only the single-path shape was
    // remembered, so a set fetched in one call proved nothing and every
    // later tick had to carry its hashes by hand.
    if (Array.isArray(r.files)) {
      for (const f of r.files) if (f !== null && typeof f === "object") remember(f as Record<string, unknown>);
      return result;
    }
    remember(r);
    return result;
  });

  // THE UPDATE RIDES FIRST — applied before any other verdict (the
  // narration stands even when the call itself is then refused), logged as
  // its own record, paying the toll. Stripped so handlers never see it.
  //
  // BUT A BAD UPDATE NEVER DESTROYS ITS CALL (owner ruling 2026-07-28).
  // Narration is commentary, and commentary that vetoes the act it comments
  // on has the causality backwards. A brief with one semicolon too many used
  // to reject the whole call and take the payload with it — a four-thousand
  // word answer, a four-file atomic patch, a finished note — all discarded
  // over the punctuation of a label riding alongside. Measured at the retro:
  // this mechanism caused 18 of 25 sampled refusals.
  //
  // The work lands. The complaint rides back on the result. And the toll goes
  // UNPAID, so the rule keeps its teeth — it just bites the narration now,
  // instead of the work.
  let updateComplaint: RejectionPayload | undefined;
  let updateResult: Record<string, unknown> | undefined;
  server.addGuard((tool, args) => {
    updateComplaint = undefined;
    updateResult = undefined;
    if (args.update === undefined) return;
    const raw = args.update;
    delete args.update;
    try {
      const op = parseUpdate(raw);
      const visit = session.currentVisit();
      const result = session.decisions.apply(visit, op);
      updateResult = result as unknown as Record<string, unknown>;
      log.append({ tool: "se_update", args: { via: tool, visit, ...op }, ok: true, outcome: "result", duration_ms: 0, response: result });
      toll.paid();
    } catch (e) {
      if (!(e instanceof Rejection)) throw e;
      updateComplaint = e.toJSON();
      log.append({ tool: "se_update", args: { via: tool, refused: true }, ok: false, outcome: "rejected", duration_ms: 0, response: updateComplaint });
    }
  });

  // THE TOLL — armed after boot; one grace warning, then the refusal.
  server.addGuard((tool, args) => toll.check(session.isBooted(), tool, args));

  // The grace warning rides the NEXT successful result (never a refusal).
  server.addDecorator((_tool, result) => {
    const w = toll.takeWarning();
    if (w === undefined || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return { ...(result as Record<string, unknown>), toll_warning: w };
  });

  // AND SO DOES THE ACCEPTED ONE (note-792c32b5425e item 5; the hole it
  // left was found live on 2026-07-29). The update's answer went only to
  // the LOG. So the node ids needed to resolve anything were invisible
  // unless you deliberately named a node that does not exist and read the
  // refusal — and the checklist nudge fired TEN times into a void, seen by
  // nobody, including the agent it was nudging.
  //
  // A guard nobody can hear is not a guard. It rides the result now.
  server.addDecorator((_tool, result) => {
    const u = updateResult;
    updateResult = undefined;
    if (u === undefined || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return { ...(result as Record<string, unknown>), update_result: u };
  });

  // The refused update rides home on the call it could not stop.
  server.addDecorator((_tool, result) => {
    const c = updateComplaint;
    updateComplaint = undefined;
    if (c === undefined || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return {
      ...(result as Record<string, unknown>),
      update_refused: { ...c, note: "THE CALL WENT THROUGH — this update did not. Carry a corrected one on your next call; the toll is unpaid until you do." },
    };
  });

  // R8 + unknown-args: the declared shape is the accepted one (whitelist).
  const shapes = new Map(
    tools.map((t) => [
      t.name,
      {
        required: (t.inputSchema.required as string[] | undefined) ?? [],
        known: Object.keys((t.inputSchema.properties as Record<string, unknown>) ?? {}),
      },
    ]),
  );
  server.addGuard((tool, args) => {
    const shape = shapes.get(tool);
    if (shape === undefined) return;
    // ABSENT means the key was not sent. NULL IS A VALUE (base_hash: null creates).
    const missing = shape.required.filter((k) => !(k in args) || args[k] === undefined);
    if (missing.length > 0) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `${tool} requires: ${shape.required.join(", ")}`,
        got: `missing: ${missing.join(", ")}${Object.keys(args).length > 0 ? ` (received: ${Object.keys(args).join(", ")})` : " (no arguments)"}`,
        remedy: { tool, args: Object.fromEntries(missing.map((k) => [k, "<value>"])), note: `this tool accepts: ${shape.known.join(", ")}` },
        source: "engine/tools.ts required-args",
      });
    }
    const unknown = Object.keys(args).filter((k) => !shape.known.includes(k));
    if (unknown.length > 0) {
      throw new Rejection({
        clause: CLAUSES.UNKNOWN_ARGS,
        expected: `only: ${shape.known.join(", ")}`,
        got: `unknown argument${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}`,
        remedy: { tool, args: {}, note: "a wrong arg name is refused rather than silently ignored — rename and retry" },
        source: "engine/tools.ts unknown-args",
      });
    }
  });

  // THE STATE GATE — what is legal now is decided by the machine, not the
  // model. Runs after the shape guard so a malformed call is named as
  // malformed, not as illegal-in-state.
  server.addGuard((tool) => session.gate(tool));

  // §9 — the single call path logs everything. se_run keeps its full output.
  server.addObserver((rec) => {
    log.append({
      tool: rec.tool,
      args: rec.args,
      ok: rec.ok,
      outcome: rec.outcome,
      duration_ms: rec.duration_ms,
      response: rec.tool === "se_run" ? rec.response : capJson(rec.response),
    });
  });

  return server;
}
