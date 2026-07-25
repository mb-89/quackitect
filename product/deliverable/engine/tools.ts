// The tool surface (§5) bound to a ledger root. B2 ships the read/write
// pair + search; loop tools land at B4, guard rails at B5.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { loadLedger } from "./store.ts";
import { WarmIndex } from "./warmindex.ts";
import { getNode, type GetMode } from "./get.ts";
import { dryRun, execute, type ApplyOp } from "./apply.ts";
import type { ToolDef } from "./mcp.ts";
import { migrateDryRun, migrateExecute, registerMigration } from "./migrate.ts";
import { v1Import } from "./migrations/v1-import.ts";
import { Loop, hasOpenInstance } from "./loop.ts";
import { openWorktrees } from "./worktree.ts";
import { loadSystematic, requireSystematic } from "./machines/load.ts";
import { CallLog } from "./calllog.ts";
import { Toll, TOLL_UPDATE_SCHEMA } from "./toll.ts";
import { help } from "./help.ts";
import { seWait, type WaitCondition } from "./wait.ts";
import { McpServer } from "./mcp.ts";
import { layout } from "./layout.ts";
import { boot, newSession, assertAdmitted, registerLaneNames, type Session } from "./boot.ts";
import { Gate } from "./gate.ts";
import { fileList, fileRead, fileWrite, filePatch, fileDelete, fileSearch, type SearchMode } from "./deliverable.ts";
import { git, assertNotHistoryRewrite, assertNotPush, assertCommitWindow } from "./git.ts";
import { runCommand, assertTestRunScope } from "./run.ts";
import { psAction } from "./ps.ts";

/** Captures minus drain lines: the honest inbox size. */
function inboxCount(root: string): number {
  if (!existsSync(layout.notesPath(root))) return 0;
  const lines = readFileSync(layout.notesPath(root), "utf8")
    .trim()
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l) => JSON.parse(l) as { ref?: string; drain_of?: string });
  const drained = new Set(lines.filter((l) => l.drain_of !== undefined).map((l) => l.drain_of));
  return lines.filter((l) => l.ref !== undefined && !drained.has(l.ref)).length;
}
import { Rejection } from "./errors.ts";

registerMigration(v1Import);

/** The tool surface bound to a repo root (spec/, product/, .se/). */
export function coreTools(root: string, opts: { toll?: Toll; session?: Session } = {}): ToolDef[] {
  const session = opts.session ?? newSession();
  // adr-iteration-resolved-roots: the ONE place a tool's working root is
  // resolved. Trunk's open instance serves first; else the first open worktree
  // stream, under ITS OWN root. A worktree is a full checkout, so resolution is
  // per-CALL (the whole root), never per-file.
  //
  // REQUIREMENT (guarded by tools-worktree-aware.test.ts): every tool that
  // touches iteration-scoped state - product files, the repo, the ledger - MUST
  // take its root from activeRoot() (or ledgerRoot(), which derives from it),
  // never the bound `root`. Only server-level tools (boot, ps, help) and
  // shared-project-dir tools (notes, gate, wait, log - whose seDir is already
  // shared across a project's worktrees) legitimately use `root`.
  const activeRoot = (): string => {
    if (!hasOpenInstance(root)) {
      for (const w of openWorktrees(root)) {
        if (hasOpenInstance(w.root)) return w.root;
      }
    }
    return root;
  };
  const ledgerRoot = (): string => layout.ledger(activeRoot());
  const loop = (): Loop => {
    const r = activeRoot();
    return new Loop(r, requireSystematic(r));
  };
  const log = (): CallLog => new CallLog(layout.seDir(root));
  const tools: ToolDef[] = [
    {
      name: "se_loop_next",
      title: "se.loop.next",
      description: "The entry point: the current step's work packet. Always callable, never errors.",
      inputSchema: { type: "object", properties: { session: { type: "string", description: "this session's name - parallel states are claimed per session" } } },
      handler: (args) => {
        if (!session.admitted) {
          return {
            kind: "instruction",
            legal: ["se_boot {}"],
            recommended: "se_boot",
            note: "Unbooted session. The boot: se_boot returns the project + the contract + its hash; se_boot with contract_hash attests and admits you. Then next works.",
          };
        }
        return loop().next(args.session === undefined ? {} : { session: String(args.session) });
      },
    },
    {
      name: "se_boot",
      title: "se.boot",
      description: "Lock onto the project; call again with contract_hash to attest — that admits the session.",
      inputSchema: {
        type: "object",
        properties: {
          contract_hash: { type: "string", description: "the hash from the previous se_boot call — attesting it admits the session" },
          project: { type: "string", description: "the project to lock onto — ask the owner, never assume" },
        },
      },
      handler: (args) =>
        boot(
          root,
          session,
          args.contract_hash === undefined ? undefined : String(args.contract_hash),
          { board: true },
          args.project === undefined ? undefined : String(args.project),
        ),
    },
    {
      name: "se_loop_start",
      title: "se.loop.start",
      description: "Opens an iteration (bootstrap policy: systematic). Every iteration opens in its own .worktrees/<id> tree+branch by default (a non-repo root starts plain); depends_on must have shipped.",
      inputSchema: {
        type: "object",
        properties: { iteration: { type: "string", description: "e.g. i1" } },
        required: ["iteration"],
      },
      handler: (args) => loop().start(String(args.iteration)),
    },
    {
      name: "se_loop_submit",
      title: "se.loop.submit",
      description: "Submit evidence for the current step; reference a run via evidence.run_ref, never re-type output.",
      inputSchema: {
        type: "object",
        properties: {
          evidence: { type: "object", description: "field -> value, per the step's evidence_form" },
          state: { type: "string", description: "which ACTIVE state this fills - required only when several are active" },
          session: { type: "string", description: "this session's name for claim routing" },
        },
        required: ["evidence"],
      },
      handler: (args) => {
        const packet = loop().submit((args.evidence ?? {}) as Record<string, string>, {
          ...(args.state !== undefined ? { state: String(args.state) } : {}),
          ...(args.session !== undefined ? { session: String(args.session) } : {}),
        });
        opts.toll?.arm(); // pillar 3: armed after the first submit
        return packet;
      },
    },
    {
      name: "se_loop_abandon",
      title: "se.loop.abandon",
      description: "Terminal, recorded with a reason.",
      inputSchema: {
        type: "object",
        properties: { reason: { type: "string" } },
        required: ["reason"],
      },
      handler: (args) => loop().abandon(String(args.reason)),
    },
    {
      name: "se_get_node",
      title: "se.get.node",
      description: "One node with its hash. mode: outline | section | full (default outline).",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "module-qualified node id, e.g. se.adr-example" },
          mode: { type: "string", enum: ["outline", "section", "full"], default: "outline" },
          section: { type: "string", description: "required when mode=section" },
        },
        required: ["id"],
      },
      handler: (args) =>
        getNode(
          loadLedger(ledgerRoot()),
          String(args.id),
          (args.mode as GetMode) ?? "outline",
          args.section === undefined ? undefined : String(args.section),
        ),
    },
    {
      name: "se_get_search",
      title: "se.get.search",
      description: "BM25 full-text search over ledger content: ranked snippets, honest truncation.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { type: "number", default: 10 },
        },
        required: ["query"],
      },
      handler: (args) => {
        const idx = new WarmIndex();
        try {
          idx.rebuild(loadLedger(ledgerRoot()));
          const limit = Number(args.limit ?? 10);
          const hits = idx.search(String(args.query), limit + 1);
          const truncated = hits.length > limit;
          return {
            hits: hits.slice(0, limit),
            ...(truncated ? { truncated: `more matches exist — narrow the query` } : {}),
          };
        } finally {
          idx.close();
        }
      },
    },
    {
      name: "se_set_apply",
      title: "se.set.apply",
      description: "Atomic ledger ops (create, delete, set_field incl. dot-paths, replace_section, edges, surgical canvas ops, rename with link ripple, plan_insert/plan_renumber): dry_run -> diff hash -> execute, or fire-first with dry_run:false.",
      inputSchema: {
        type: "object",
        properties: {
          ops: { type: "array", items: { type: "object" } },
          dry_run: { type: "boolean", default: true },
          execute_hash: { type: "string", description: "the diff_hash from a prior dry_run" },
        },
        required: ["ops"],
      },
      handler: (args) => {
        const ops = (args.ops ?? []) as ApplyOp[];
        const cachePath = join(layout.seDir(root), "apply-cache.jsonl");
        const wantsExecute = args.execute_hash !== undefined && args.dry_run !== true;
        if (wantsExecute) {
          let useOps = ops;
          if (ops.length === 0) {
            // Execute-by-hash: the dry_run's ops replay from the cache — no resend.
            const cached = existsSync(cachePath)
              ? readFileSync(cachePath, "utf8")
                  .trim()
                  .split("\n")
                  .map((l) => JSON.parse(l) as { hash: string; ops: ApplyOp[] })
                  .find((c) => c.hash === args.execute_hash)
              : undefined;
            if (cached === undefined) {
              throw new Rejection({
                clause: "SE-C-049",
                expected: "a cached dry_run for this hash (the cache is machine-local and session-fresh)",
                got: String(args.execute_hash),
                remedy: { tool: "se_set_apply", args: { ops: [], dry_run: true }, note: "re-run the dry_run, then execute by its fresh hash" },
                source: "engine/tools.ts se_set_apply",
              });
            }
            useOps = cached.ops;
          }
          return execute(ledgerRoot(), useOps, String(args.execute_hash));
        }
        if (args.dry_run === false) {
          // Fire-first: apply directly; the engine still hash-guards internally.
          const d = dryRun(ledgerRoot(), ops);
          return { ...execute(ledgerRoot(), ops, d.diff_hash), fired_direct: true };
        }
        const d = dryRun(ledgerRoot(), ops);
        mkdirSync(layout.seDir(root), { recursive: true });
        appendFileSync(cachePath, JSON.stringify({ hash: d.diff_hash, ops }) + "\n", "utf8");
        return d;
      },
    },
    {
      name: "se_set_migrate",
      title: "se.set.migrate",
      description: "Audited whole-ledger migration by name; rides the dry_run -> execute lane; idempotent.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", enum: ["v1-import"] },
          params: { type: "object", description: "migration inputs, e.g. { v1_root: path }" },
          dry_run: { type: "boolean", default: true },
          execute_hash: { type: "string" },
        },
        required: ["name"],
      },
      handler: (args) => {
        const ctx = { ledgerRoot: ledgerRoot(), params: (args.params ?? {}) as Record<string, string> };
        const wantsExecute = args.execute_hash !== undefined && args.dry_run !== true;
        if (!wantsExecute) return migrateDryRun(String(args.name), ctx);
        return migrateExecute(String(args.name), ctx, String(args.execute_hash));
      },
    },
    {
      name: "se_file_list",
      title: "se.file.list",
      description: "List product entries under a directory (root-relative; dot-paths serve, @name reaches declared read-only roots; workspace/ excluded).",
      inputSchema: {
        type: "object",
        properties: { dir: { type: "string", default: "." } },
      },
      handler: (args) => fileList(activeRoot(), String(args.dir ?? ".")),
    },
    {
      name: "se_file_search",
      title: "se.file.search",
      description: "Find product files: literal (default), ranked (multi-term), or fuzzy (filename); detail via se_file_read.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          intent: { type: "string", description: "what you are trying to find — logged" },
          mode: { type: "string", enum: ["literal", "ranked", "fuzzy"], default: "literal" },
          limit: { type: "number", default: 20 },
        },
        required: ["query", "intent"],
      },
      handler: (args) => fileSearch(activeRoot(), String(args.query), Number(args.limit ?? 20), (args.mode as SearchMode) ?? "literal"),
    },
    {
      name: "se_file_read",
      title: "se.file.read",
      description: "Read one product file; returns content + hash (the CAS base for edits).",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
      handler: (args) => fileRead(activeRoot(), String(args.path)),
    },
    {
      name: "se_file_write",
      title: "se.file.write",
      description: "Whole-file write. base_hash: null creates; otherwise it must match disk (CAS).",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
          base_hash: { type: ["string", "null"] },
        },
        required: ["path", "content", "base_hash"],
      },
      handler: (args) =>
        fileWrite(activeRoot(), String(args.path), String(args.content), args.base_hash === null || args.base_hash === "null" ? null : String(args.base_hash)),
    },
    {
      name: "se_file_patch",
      title: "se.file.patch",
      description: "Exact-match edit: old_string must occur exactly once; optional base_hash double-guard.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          old_string: { type: "string" },
          new_string: { type: "string" },
          base_hash: { type: "string" },
        },
        required: ["path", "old_string", "new_string"],
      },
      handler: (args) =>
        filePatch(
          activeRoot(),
          String(args.path),
          String(args.old_string),
          String(args.new_string),
          args.base_hash === undefined ? undefined : String(args.base_hash),
        ),
    },
    {
      name: "se_file_delete",
      title: "se.file.delete",
      description: "Hash-guarded delete: base_hash must match disk — no blind removal.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          base_hash: { type: "string" },
        },
        required: ["path", "base_hash"],
      },
      handler: (args) => fileDelete(activeRoot(), String(args.path), String(args.base_hash)),
    },
    {
      name: "se_git",
      title: "se.git",
      description: "Git through SE, allowlisted: status, log, diff, show, add, commit, fetch, branch, rev-parse. Push is the owner's act.",
      inputSchema: {
        type: "object",
        properties: { args: { type: "array", items: { type: "string" } } },
        required: ["args"],
      },
      handler: (args) => {
        const gitArgs = (args.args as string[]).map(String);
        const gitRoot = activeRoot();
        assertNotPush(gitArgs);
        assertNotHistoryRewrite(gitArgs);
        if (gitArgs[0] === "commit") assertCommitWindow(gitRoot);
        const ALLOWED = new Set(["status", "log", "diff", "show", "add", "commit", "fetch", "branch", "rev-parse", "restore"]);
        if (!ALLOWED.has(gitArgs[0])) {
          throw new Rejection({
            clause: "SE-C-004",
            expected: `an allowlisted git subcommand (${[...ALLOWED].join(", ")})`,
            got: gitArgs[0] ?? "(none)",
            remedy: { tool: "se_git", args: { args: ["status"] }, note: "destructive git stays engine-internal; ask via se_help if a lane is missing" },
            source: "engine/tools.ts se_git",
          });
        }
        // restore un-stages only: without --staged it would discard worktree edits.
        if (gitArgs[0] === "restore" && !gitArgs.includes("--staged")) {
          throw new Rejection({
            clause: "SE-C-004",
            expected: "restore with --staged (unstage only)",
            got: `git ${gitArgs.join(" ")}`,
            remedy: { tool: "se_git", args: { args: ["restore", "--staged", "<path>"] }, note: "worktree restores discard human edits; only unstaging is lane-legal" },
            source: "engine/tools.ts se_git",
          });
        }
        const r = git(gitRoot, ...gitArgs);
        return { ok: r.ok, code: r.code, stdout: r.stdout.slice(-20_000), stderr: r.stderr.slice(-20_000) };
      },
    },
    {
      name: "se_run",
      title: "se.run",
      description: "Run a shell command through SE: captured raw in the call log, referenced by run ref — never re-type output. Individual tests run free; the full battery only at milestone verification.",
      inputSchema: {
        type: "object",
        properties: { command: { type: "string" } },
        required: ["command"],
      },
      handler: (args) => {
        const runRoot = activeRoot();
        assertTestRunScope(runRoot, String(args.command));
        return runCommand(log(), String(args.command), runRoot);
      },
    },
    {
      name: "se_note",
      title: "se.note",
      description: "Capture a note, frictionless. Private: machine-local until drained at a retro, never committed.",
      inputSchema: {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      },
      handler: (args) => {
        const note = { ref: "note-" + randomBytes(6).toString("hex"), text: String(args.text), at: new Date().toISOString() };
        mkdirSync(dirname(layout.notesPath(root)), { recursive: true });
        appendFileSync(layout.notesPath(root), JSON.stringify(note) + "\n", "utf8");
        return { captured: note.ref, inbox_count: inboxCount(root) };
      },
    },
    {
      name: "se_note_drain",
      title: "se.note.drain",
      description: "Mark a note drained with its disposition — the retro's mechanical half; an unknown ref is refused (SE-C-073). Drained notes leave the inbox count.",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "the note ref to drain" },
          disposition: { type: "string", description: "where it went: pulled into <iteration>, routed to <home>, rejected because <reason>" },
        },
        required: ["ref", "disposition"],
      },
      handler: (args) => {
        const ref = String(args.ref);
        // A dead ref (a truncated fragment, a typo) must not fake a disposition.
        const known = existsSync(layout.notesPath(root))
          ? new Set(
              readFileSync(layout.notesPath(root), "utf8")
                .split("\n")
                .filter((l) => l.trim() !== "")
                .map((l) => (JSON.parse(l) as { ref?: string }).ref)
                .filter((r): r is string => r !== undefined),
            )
          : new Set<string>();
        if (!known.has(ref)) {
          throw new Rejection({
            clause: "SE-C-073",
            expected: "a ref carried by a live note (drains never fake a disposition)",
            got: ref,
            remedy: { tool: "se_note_drain", args: { ref: "<a real note ref from the inbox>", disposition: String(args.disposition ?? "") }, note: "read the inbox; refs are full note-<hex>, never a fragment" },
            source: "engine/tools.ts se_note_drain",
          });
        }
        appendFileSync(
          layout.notesPath(root),
          JSON.stringify({ drain_of: ref, disposition: String(args.disposition), at: new Date().toISOString() }) + "\n",
          "utf8",
        );
        return { drained: ref, inbox_count: inboxCount(root) };
      },
    },
    {
      name: "se_gate_bless",
      title: "se.gate.bless",
      description: "Relay the owner's explicit chat approval of the live offer (channel=chat, adjudicated_by=owner); delegated:true self-blesses under a recorded owner grant, stamped agent + delegated_via.",
      inputSchema: {
        type: "object",
        properties: {
          hash: { type: "string", description: "the live offer's base hash" },
          delegated: { type: "boolean", description: "bless under the recorded delegation decision - stamps agent, never the owner" },
        },
        required: ["hash"],
      },
      handler: (args) => {
        // "delegated:<hash>" carries the flag inside the hash param: a
        // harness validating against a cached schema strips unknown fields,
        // and a silently-dropped flag would stamp the owner on a self-bless.
        const rawHash = String(args.hash);
        const prefixed = rawHash.startsWith("delegated:");
        const hash = prefixed ? rawHash.slice("delegated:".length) : rawHash;
        const by =
          args.delegated === true || prefixed
            ? { channel: "chat-grant", adjudicated_by: "agent", delegated_via: "se.decision-delegated-adjudication" }
            : { channel: "chat", adjudicated_by: "owner" };
        const grant = new Gate(root).bless(requireSystematic(root), hash, by);
        return { grant, next: loop().next() };
      },
    },
    {
      name: "se_help",
      title: "se.help",
      description: "Keyword search over the tool surface; a miss is an honest refusal, logged as demand.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          intent: { type: "string", description: "what you are trying to accomplish — logged" },
        },
        required: ["query", "intent"],
      },
      handler: (args) => help(String(args.query), String(args.intent), tools, loadSystematic(root)),
    },
    {
      name: "se_ps",
      title: "se.ps",
      description: "List, stop or cycle SE-owned processes (the board) — foreign processes are refused.",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["list", "stop", "cycle"], default: "list" },
          target: { type: "string", default: "board" },
        },
      },
      handler: (args) => psAction(root, (args.action as "list" | "stop" | "cycle") ?? "list", String(args.target ?? "board")),
    },
    {
      name: "se_log_query",
      title: "se.log.query",
      description: "Generic log aggregation: filter, group, count over the call log — the retro's lane, never an ad-hoc script.",
      inputSchema: {
        type: "object",
        properties: {
          filter: { type: "object", description: "{ tool?, ok?, since? (ISO), clause? }" },
          group_by: { type: "string", description: 'dot path to group counts by, e.g. "tool" or "detail.clause"' },
          limit: { type: "number", default: 20 },
        },
      },
      handler: (args) => {
        // group_by "calibration" serves the ETA-vs-actual table (the
        // standing retro query, req-eta-measured).
        if (args.group_by === "calibration") return log().calibration();
        return log().query({
          filter: (args.filter ?? {}) as { tool?: string; ok?: boolean; since?: string; clause?: string },
          group_by: args.group_by === undefined ? undefined : String(args.group_by),
          limit: args.limit === undefined ? undefined : Number(args.limit),
        });
      },
    },
    {
      name: "se_gate_dismiss",
      title: "se.gate.dismiss",
      description: "Dismiss the live offer with a reason — the agent-legal way when its evidence is superseded.",
      inputSchema: {
        type: "object",
        properties: { reason: { type: "string", description: "why the offer no longer binds — logged" } },
        required: ["reason"],
      },
      handler: () => {
        new Gate(root).dismiss();
        return { dismissed: true };
      },
    },
    {
      name: "se_wait",
      title: "se.wait",
      description: "Wait for a mechanical condition (file, offer) or timeout_s (max 300); never poll a judgment surface.",
      inputSchema: {
        type: "object",
        properties: {
          condition: {
            type: "object",
            description: '{ kind: "offer" } or { kind: "file", path, until: "exists" | "changes" }',
          },
          timeout_s: { type: "number", default: 60 },
        },
        required: ["condition"],
      },
      handler: (args) => seWait(root, args.condition as WaitCondition, Number(args.timeout_s ?? 60)),
    },
  ];
  // The voluntary update lane: any call may carry one — the toll records it
  // and resets, so the board refreshes per completion, not only per toll.
  for (const t of tools) {
    t.inputSchema.properties = { ...((t.inputSchema.properties as Record<string, unknown>) ?? {}), update: TOLL_UPDATE_SCHEMA };
  }
  registerLaneNames(tools.map((t) => t.name));
  return tools;
}

/** The full server: tools + the toll as dispatch middleware. */
export function buildServer(root: string, opts: { tollWindowMs?: number; now?: () => number } = {}): McpServer {
  const toll = new Toll(layout.seDir(root), {
    ...(opts.tollWindowMs !== undefined ? { windowMs: opts.tollWindowMs } : {}),
    ...(opts.now ? { now: opts.now } : {}),
  });
  const log = new CallLog(layout.seDir(root));
  const session = newSession();
  const server = new McpServer({ name: "se-mcp", version: "2.0.0-bootstrap" }, coreTools(root, { toll, session }));
  server.addGuard((tool) => assertAdmitted(session, tool)); // §7 admission gates the surface
  server.addGuard((tool, args) => toll.check(tool, args, log));
  // The toll's grace warning rides the successful result it graced.
  server.addDecorator((_tool, result) => {
    const w = toll.takeWarning();
    if (w === undefined) return result;
    return typeof result === "object" && result !== null && !Array.isArray(result)
      ? { ...(result as Record<string, unknown>), toll_warning: w }
      : { result, toll_warning: w };
  });
  // §9 log-everything: every call through the single MCP path lands raw in
  // the call log — successes too, not just errors (i1 of self-hosting).
  server.addObserver(({ tool, args, ok, duration_ms, outcome, response }) => {
    // se_run: ONE line, the full record under ITS ref — never a second
    // summary line beside it (evidence pinning finds the ref here).
    if (tool === "se_run" && ok && typeof response === "object" && response !== null && "ref" in response) {
      const r = response as { ref: string; args: Record<string, unknown>; ok: boolean; detail?: Record<string, unknown> };
      log.append({ ref: r.ref, tool: "se.run", args: r.args, ok: r.ok, duration_ms, detail: r.detail ?? {} });
      return;
    }
    const detail: Record<string, unknown> = { outcome };
    if (ok) {
      // Successes carry a capped summary — the board's request+response view
      // and the retro's miss queries read it.
      if (response !== undefined) detail.response_summary = JSON.stringify(response).slice(0, 500);
    } else {
      if (response !== undefined) detail.response = response;
      const r = response as { clause?: string; expected?: string } | undefined;
      if (r?.clause !== undefined) {
        detail.clause = r.clause;
        detail.reason = r.expected;
      }
    }
    log.append({ tool, args, ok, duration_ms, detail });
  });
  return server;
}
