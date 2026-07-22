// The tool surface (§5) bound to a ledger root. B2 ships the read/write
// pair + search; loop tools land at B4, guard rails at B5.
import { loadLedger } from "./store.ts";
import { WarmIndex } from "./warmindex.ts";
import { getNode, type GetMode } from "./get.ts";
import { dryRun, execute, type ApplyOp } from "./apply.ts";
import type { ToolDef } from "./mcp.ts";
import { migrateDryRun, migrateExecute, registerMigration } from "./migrate.ts";
import { v1Import } from "./migrations/v1-import.ts";
import { Loop } from "./loop.ts";
import { systematic } from "./machines/systematic.ts";
import { CallLog } from "./calllog.ts";
import { Toll } from "./toll.ts";
import { help } from "./help.ts";
import { seWait, type WaitCondition } from "./wait.ts";
import { McpServer } from "./mcp.ts";
import { layout } from "./layout.ts";
import { boot, newSession, assertAdmitted, type Session } from "./boot.ts";
import { listDeliverable, readDeliverable, writeDeliverable, patchDeliverable } from "./deliverable.ts";
import { git, assertNotHistoryRewrite, assertNotPush } from "./git.ts";
import { Rejection } from "./errors.ts";

registerMigration(v1Import);

/** The tool surface bound to a repo root (spec/, product/, .se/). */
export function coreTools(root: string, opts: { toll?: Toll; session?: Session } = {}): ToolDef[] {
  const ledgerRoot = layout.ledger(root);
  const session = opts.session ?? newSession();
  const loop = (): Loop => new Loop(root, systematic);
  const log = (): CallLog => new CallLog(layout.seDir(root));
  const tools: ToolDef[] = [
    {
      name: "se_loop_next",
      title: "se.loop.next",
      description:
        "The entry point. Always callable, never errors. Returns the work packet for the current step: statement, guidance, evidence form, legal moves. Engine-filled states run mechanically before it returns.",
      inputSchema: { type: "object", properties: {} },
      handler: () => {
        if (!session.admitted) {
          return {
            kind: "instruction",
            legal: ["se_boot {}"],
            recommended: "se_boot",
            note: "Unbooted session. The boot: se_boot returns the project + the contract + its hash; se_boot with contract_hash attests and admits you. Then next works.",
          };
        }
        return loop().next();
      },
    },
    {
      name: "se_boot",
      title: "se.boot",
      description:
        "The boot: log onto the project and receive the contract (general rules + voice). Call again with contract_hash to attest — that admits the session. One round-trip.",
      inputSchema: {
        type: "object",
        properties: {
          contract_hash: { type: "string", description: "the hash from the previous se_boot call — attesting it admits the session" },
        },
      },
      handler: (args) => boot(root, session, args.contract_hash === undefined ? undefined : String(args.contract_hash)),
    },
    {
      name: "se_loop_start",
      title: "se.loop.start",
      description: "Opens an iteration (bootstrap policy: systematic). One open iteration per worktree.",
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
      description:
        "Produces evidence for the current step; SE validates the shape and closes it. Reference a run record via evidence.run_ref instead of re-typing output — referenced runs are pinned into the iteration's evidence.",
      inputSchema: {
        type: "object",
        properties: { evidence: { type: "object", description: "field -> value, per the step's evidence_form" } },
        required: ["evidence"],
      },
      handler: (args) => {
        const packet = loop().submit((args.evidence ?? {}) as Record<string, string>);
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
      description:
        "One node. mode: outline | section | full — defaults to outline (the skeleton: statement, edges, fields, section list). Every result carries the node id and its hash.",
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
          loadLedger(ledgerRoot),
          String(args.id),
          (args.mode as GetMode) ?? "outline",
          args.section === undefined ? undefined : String(args.section),
        ),
    },
    {
      name: "se_get_search",
      title: "se.get.search",
      description:
        "BM25 full-text search over ledger content. Ranked snippets with anchors, never whole files. Truncation is honest: the result names how many more matches exist.",
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
          idx.rebuild(loadLedger(ledgerRoot));
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
      description:
        "Atomic list of operations (create, delete, set_field, replace_section, add_edge, remove_edge). dry_run: true returns the diff and its hash; passing that hash as execute_hash executes if and only if the state still matches. Fifty edits is one call carrying fifty operations.",
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
        const ops = args.ops as ApplyOp[];
        const wantsExecute = args.execute_hash !== undefined && args.dry_run !== true;
        if (!wantsExecute) return dryRun(ledgerRoot, ops);
        return execute(ledgerRoot, ops, String(args.execute_hash));
      },
    },
    {
      name: "se_set_migrate",
      title: "se.set.migrate",
      description:
        "One-shot audited whole-ledger migration by name from the engine's registry. Generates an apply manifest and rides the normal lane: dry_run -> diff hash -> execute. Idempotent: re-run yields an empty diff.",
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
        const ctx = { ledgerRoot, params: (args.params ?? {}) as Record<string, string> };
        const wantsExecute = args.execute_hash !== undefined && args.dry_run !== true;
        if (!wantsExecute) return migrateDryRun(String(args.name), ctx);
        return migrateExecute(String(args.name), ctx, String(args.execute_hash));
      },
    },
    {
      name: "se_deliverable_list",
      title: "se.deliverable.list",
      description: "List deliverable entries under a directory (deliverable-relative paths).",
      inputSchema: {
        type: "object",
        properties: { dir: { type: "string", default: "." } },
      },
      handler: (args) => listDeliverable(root, String(args.dir ?? ".")),
    },
    {
      name: "se_deliverable_read",
      title: "se.deliverable.read",
      description: "Read one deliverable file; returns content + hash (the CAS base for edits).",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
      handler: (args) => readDeliverable(root, String(args.path)),
    },
    {
      name: "se_deliverable_write",
      title: "se.deliverable.write",
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
        writeDeliverable(root, String(args.path), String(args.content), args.base_hash === null ? null : String(args.base_hash)),
    },
    {
      name: "se_deliverable_patch",
      title: "se.deliverable.patch",
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
        patchDeliverable(
          root,
          String(args.path),
          String(args.old_string),
          String(args.new_string),
          args.base_hash === undefined ? undefined : String(args.base_hash),
        ),
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
        assertNotPush(gitArgs);
        assertNotHistoryRewrite(gitArgs);
        const ALLOWED = new Set(["status", "log", "diff", "show", "add", "commit", "fetch", "branch", "rev-parse"]);
        if (!ALLOWED.has(gitArgs[0])) {
          throw new Rejection({
            clause: "SE-C-004",
            expected: `an allowlisted git subcommand (${[...ALLOWED].join(", ")})`,
            got: gitArgs[0] ?? "(none)",
            remedy: { tool: "se.git", args: { args: ["status"] }, note: "destructive git stays engine-internal; ask via se.help if a lane is missing" },
            source: "engine/tools.ts se_git",
          });
        }
        const r = git(root, ...gitArgs);
        return { ok: r.ok, code: r.code, stdout: r.stdout.slice(-20_000), stderr: r.stderr.slice(-20_000) };
      },
    },
    {
      name: "se_help",
      title: "se.help",
      description:
        "Keyword search over tool descriptions. Returns closest-match affordances, or the honest refusal: no such tool — do it yourself. Every call is logged with stated intent; misses are the live missing-tool demand signal.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          intent: { type: "string", description: "what you are trying to accomplish — logged" },
        },
        required: ["query", "intent"],
      },
      handler: (args) => help(String(args.query), String(args.intent), tools, systematic, log()),
    },
    {
      name: "se_wait",
      title: "se.wait",
      description:
        "The declared wait lane: return when a MECHANICAL condition changes (file, offer state) or after timeout_s (max 300 — longer waits are parks). Runs no checks on the read path. Never poll a judgment surface.",
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
  // §9 log-everything: every call through the single MCP path lands raw in
  // the call log — successes too, not just errors (i1 of self-hosting).
  server.addObserver(({ tool, args, ok, duration_ms, outcome }) =>
    log.append({ tool, args, ok, duration_ms, detail: { outcome } }),
  );
  return server;
}
