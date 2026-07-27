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
import { CLAUSES, Rejection } from "./errors.ts";
import { CallLog } from "./calllog.ts";
import { parseUpdate } from "./decisions.ts";
import { Toll } from "./toll.ts";
import { fileDelete, fileGlob, fileList, filePatch, fileRead, fileWrite, type PatchOp } from "./files.ts";
import { appendNote } from "./inbox.ts";
import { capJson } from "./jsonio.ts";
import { McpServer, type ToolDef } from "./mcp.ts";
import { fileMove } from "./move.ts";
import { seDir } from "./paths.ts";
import { run } from "./run.ts";
import { search } from "./search.ts";
import { Session } from "./session.ts";
import { webFetch, webSearch } from "./web.ts";

/** THE TICK — the machinery's one tool, legal in every state. */
export function sessionTools(session: Session): ToolDef[] {
  return [
    {
      name: "se_tick",
      title: "se.tick",
      description:
        "THE TICK — the universal walk operation, legal in EVERY state. Without arguments: where the machine is (state, guidance, what to read, legal tools, next states). With arguments: advance — to: <state> picks the edge (optional when there is only one), advance: true advances when no other argument applies, back: <state> returns to an earlier filled state (downstream is superseded, evidence invalidated), state: <state> PEEKS at any state without moving — use it to choose among several ways forward, wait: true is a SHORT in-turn hold: it blocks until the human moves something (slider, tick, check) and returns the fresh packet (changed: false on timeout) — use it only when you expect the change within seconds; otherwise STOP, telling the user plainly that they must message you (e.g. 'continue') after changing the slider, because the slider alone cannot wake a stopped agent. READ PROOF: entering a state (and leaving one with a read condition) demands read_hashes: {\"<path>\": \"<hash>\", ...} covering the listed docs — the hash rides every se_file_read result and must match the doc AS IT STANDS; it proves YOUR reading, every tick, so after a compaction re-read before advancing. When a result carries a banner, show it to the user VERBATIM.",
      inputSchema: {
        type: "object",
        properties: {
          to: { type: "string", description: "the next state to enter (one of the drawn edges)" },
          advance: { type: "boolean", description: "advance along the single drawn edge" },
          back: { type: "string", description: "jump BACK to an earlier filled state — everything downstream is superseded and its evidence invalidated" },
          state: { type: "string", description: "PEEK at a named state (full info: statement, guidance, conditions, next) — looking never moves" },
          wait: { type: "boolean", description: "short in-turn HOLD: blocks until the human's hand moves the walk or the slider, then returns the fresh packet (changed: false on timeout). For longer waits STOP instead and ask the user to message you" },
          escape: { type: "string", description: "ESCAPE to idle with this reason — the stuck sub-machine walk is left standing (a later continue re-enters it); the escape is a recorded failure. Boot cannot be escaped" },
          read_hashes: { type: "object", description: "proof-of-read for this tick: {\"<root-relative path>\": \"<hash from se_file_read>\", ...} — must cover the docs the transition demands, each hash matching the doc as it stands now" },
        },
      },
      handler: async (args) => {
        // THE CHANNEL RULE: MCP is the agent's hand — the threshold gates it.
        // (HTTP, the mirror, is the human's; the human always may.)
        if (args.wait === true) {
          // THE HOLD — the machine's push channel, inverted: the agent
          // parks this call and the human's next move answers it.
          const ms = Number(process.env.SE_WAIT_MS ?? 20_000);
          const changed = await session.waitForChange(ms);
          return {
            ...session.tickInfo(),
            changed,
            note: changed
              ? "something moved — read this packet and continue"
              : `nothing moved in ${ms}ms — call se_tick {wait: true} again to keep holding`,
          };
        }
        const hashes = (typeof args.read_hashes === "object" && args.read_hashes !== null ? args.read_hashes : {}) as Record<string, string>;
        if (args.escape !== undefined) return session.escape(String(args.escape), "agent", hashes);
        if (args.state !== undefined) return session.stateInfo(String(args.state));
        if (args.back !== undefined) return session.jumpBack(String(args.back), "agent", hashes);
        const wantsAdvance = args.to !== undefined || args.advance === true || Object.keys(hashes).length > 0;
        if (!wantsAdvance) return session.tickInfo();
        return session.tickAdvance(args.to === undefined ? undefined : String(args.to), "agent", hashes);
      },
    },
  ];
}

export function expeditionTools(session: Session): ToolDef[] {
  return [
    {
      name: "se_exp_new",
      title: "se.exp.new",
      description: "Mint a new expedition: a git worktree on its own branch (exp/<id>). Declare kind (spike | fix | explore) and goal. Creating does not bind — continue_expedition does.",
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
      name: "se_exp_list",
      title: "se.exp.list",
      description: "Expeditions: open (worktree exists) and archive (merged/closed branches).",
      inputSchema: { type: "object", properties: {} },
      handler: () => session.expeditionList(),
    },
    {
      name: "se_exp_open",
      title: "se.exp.open",
      description: "Bind the lane to an open expedition — file, search and run tools work in its worktree until you leave the machine or close it.",
      inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      handler: (args) => session.expeditionOpen(String(args.id)),
    },
    {
      name: "se_exp_close",
      title: "se.exp.close",
      description: "Close the bound expedition: leftover changes are committed, the branch merges back (merge: false leaves it unmerged in the archive), the worktree is removed.",
      inputSchema: { type: "object", properties: { merge: { type: "boolean", description: "default true — the bootstrap behavior until iterations receive changes as design input" } } },
      handler: (args) => session.expeditionClose(args.merge !== false),
    },
  ];
}

export function coreTools(rootOf: () => string, projectRoot: string): ToolDef[] {
  return [
    {
      name: "se_file_read",
      title: "se.file.read",
      description:
        "Read a project file (root-relative path). Returns the CAS hash writes will demand. Pass offset (1-based line) / limit to read a large file in PARTS — an oversize whole-file read is refused with the remedy, never silently truncated. Pass ref to read the file AT A COMMITTED REF ('main' reaches v1, 'v2' reaches v2) — pair with se_file_search/se_file_glob at the same ref.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          offset: { type: "number", description: "1-based first line" },
          limit: { type: "number", description: "how many lines" },
          ref: { type: "string", description: "read from this committed git ref instead of the working tree" },
        },
        required: ["path"],
      },
      handler: (args) =>
        fileRead(rootOf(), String(args.path), {
          ...(args.offset !== undefined ? { offset: Number(args.offset) } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
          ...(args.ref !== undefined ? { ref: String(args.ref) } : {}),
        }),
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
      handler: (args) => fileWrite(rootOf(), String(args.path), String(args.content), args.base_hash === null || args.base_hash === "null" ? null : String(args.base_hash)),
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
      handler: (args) => filePatch(rootOf(), args.ops as PatchOp[]),
    },
    {
      name: "se_file_move",
      title: "se.file.move",
      description:
        "Move or rename a file and fix EVERY reference in one pass: root-relative paths, vault-relative canvas refs, and wiki links across all .md and .canvas files. Reports what was rewritten. Refuses to overwrite.",
      inputSchema: {
        type: "object",
        properties: {
          from: { type: "string", description: "root-relative source path" },
          to: { type: "string", description: "root-relative destination path" },
        },
        required: ["from", "to"],
      },
      handler: (args) => fileMove(rootOf(), String(args.from), String(args.to)),
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
      handler: (args) => fileDelete(rootOf(), String(args.path), String(args.base_hash)),
    },
    {
      name: "se_file_list",
      title: "se.file.list",
      description: "List entries under a project directory (root-relative; '.' is the project root).",
      inputSchema: {
        type: "object",
        properties: { dir: { type: "string", default: "." } },
      },
      handler: (args) => fileList(rootOf(), String(args.dir ?? ".")),
    },
    {
      name: "se_file_glob",
      title: "se.file.glob",
      description: "List project files matching a glob (e.g. **/*.test.ts) — the 'where does this live' lane. Pass ref to glob a committed ref's tree instead ('main' reaches v1, 'v2' reaches v2).",
      inputSchema: {
        type: "object",
        properties: { glob: { type: "string" }, ref: { type: "string", description: "glob this committed git ref's tree instead of the working tree" } },
        required: ["glob"],
      },
      handler: (args) => fileGlob(rootOf(), String(args.glob), { ...(args.ref !== undefined ? { ref: String(args.ref) } : {}) }),
    },
    {
      name: "se_file_search",
      title: "se.file.search",
      description:
        "Regex search across the working tree (ripgrep) OR any git ref (pass ref — a branch or tag; this repo is a branch of quack, so 'main' reaches v1 and 'v2' reaches v2). Returns match LOCATIONS with an intent trail; read around a hit with se_file_read offset/limit.",
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
      handler: (args) =>
        search(rootOf(), String(args.query), {
          ...(args.path !== undefined ? { path: String(args.path) } : {}),
          ...(args.ref !== undefined ? { ref: String(args.ref) } : {}),
          ...(args.ignore_case === true ? { ignore_case: true } : {}),
          ...(args.limit !== undefined ? { limit: Number(args.limit) } : {}),
        }),
    },
    {
      name: "se_run",
      title: "se.run",
      description:
        "Run a shell command from the project root (bash on POSIX, PowerShell on Windows). Output is engine-captured and logged IN FULL under the returned call ref — a run is citable evidence. Default timeout 120s (timeout_ms to raise).",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string" },
          timeout_ms: { type: "number" },
          cwd: { type: "string", description: "root-relative working directory" },
        },
        required: ["command"],
      },
      handler: (args) =>
        run(rootOf(), String(args.command), {
          ...(args.timeout_ms !== undefined ? { timeout_ms: Number(args.timeout_ms) } : {}),
          ...(args.cwd !== undefined ? { cwd: String(args.cwd) } : {}),
        }),
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
        "Capture a stray — an idea, a bug, a better way — without leaving the state (contract rule 4). Machine-local (.se/notes.jsonl), never committed; joins the mirror's log feed; drained at a retro, later.",
      inputSchema: {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      },
      handler: (args) => appendNote(seDir(projectRoot), String(args.text)),
    },
    {
      name: "se_log_query",
      title: "se.log.query",
      description: "Query the call log (your own trail): filter by tool/ok/since, group_by a field, or fetch a se_run ref's full output.",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "fetch one record in full by ref" },
          filter: { type: "object", description: "{tool?, ok?, since?}" },
          group_by: { type: "string", description: "e.g. 'tool' or 'outcome'" },
          limit: { type: "number", default: 20 },
        },
      },
      handler: (args) => {
        const log = new CallLog(seDir(projectRoot));
        if (args.ref !== undefined) {
          const rec = log.find(String(args.ref));
          if (rec === undefined) {
            throw new Rejection({
              clause: CLAUSES.REQUIRED_ARGS,
              expected: "an existing call ref",
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
        });
      },
    },
  ];
}

/** Build the server: session machine + tools + guards + the raw call log.
 *  Guard order: arg shape → THE STATE GATE → handler. Pass a Session to
 *  share it with another hand (the embedded mirror drives the SAME walk). */
export function buildServer(root: string, session = new Session(root), tollOpts: { windowMs?: number; now?: () => number } = {}): McpServer {
  // (a fresh Session fails fast on a misdrawn machine)
  const tools = [...sessionTools(session), ...expeditionTools(session), ...coreTools(() => session.workRoot(), root)];
  // THE UPDATE FIELD — every lane tool accepts it: a decision-graph op
  // riding the call. Declared on every schema so harnesses send it as an
  // object (an undeclared property arrives as a JSON string — v2 lesson).
  const UPDATE_PROP = {
    type: "object",
    description:
      "decision-graph update riding this call — narrate as you work. {op: plan|fork|done|obsolete|revert|note, brief?, items?, node?}: plan {items} starts the state's checklist; fork {brief, items?} opens an unplanned branch where you are; done|obsolete|revert {node, brief} resolves a node — everything started gets resolved, silently abandoning is illegal; note {brief, node?} says what you are doing. A volunteered update resets the toll; when the toll lapses, the next call must carry one.",
  };
  for (const t of tools) (t.inputSchema.properties as Record<string, unknown>).update = UPDATE_PROP;
  const server = new McpServer({ name: "se-mcp", version: "3.0.0-bootstrap" }, tools);
  const log = new CallLog(seDir(root));
  const toll = new Toll(tollOpts);

  // THE UPDATE RIDES FIRST — applied before any other verdict (the
  // narration stands even when the call itself is then refused), logged as
  // its own record, paying the toll. Stripped so handlers never see it.
  server.addGuard((tool, args) => {
    if (args.update === undefined) return;
    const raw = args.update;
    delete args.update;
    const op = parseUpdate(raw);
    const visit = session.currentVisit();
    const result = session.decisions.apply(visit, op);
    log.append({ tool: "se_update", args: { via: tool, visit, ...op }, ok: true, outcome: "result", duration_ms: 0, response: result });
    toll.paid();
  });

  // THE TOLL — armed after boot; one grace warning, then the refusal.
  server.addGuard((tool, args) => toll.check(session.isBooted(), tool, args));

  // The grace warning rides the NEXT successful result (never a refusal).
  server.addDecorator((_tool, result) => {
    const w = toll.takeWarning();
    if (w === undefined || typeof result !== "object" || result === null || Array.isArray(result)) return result;
    return { ...(result as Record<string, unknown>), toll_warning: w };
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
