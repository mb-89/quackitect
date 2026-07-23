// The tool surface (§5) bound to a ledger root. B2 ships the read/write
// pair + search; loop tools land at B4, guard rails at B5.
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname } from "node:path";
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
import { Gate } from "./gate.ts";
import { fileList, fileRead, fileWrite, filePatch, fileDelete, fileSearch, type SearchMode } from "./deliverable.ts";
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
      description: "The entry point: the current step's work packet. Always callable, never errors.",
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
      description: "Log onto the project; call again with contract_hash to attest — that admits the session.",
      inputSchema: {
        type: "object",
        properties: {
          contract_hash: { type: "string", description: "the hash from the previous se_boot call — attesting it admits the session" },
        },
      },
      handler: (args) => boot(root, session, args.contract_hash === undefined ? undefined : String(args.contract_hash), { board: true }),
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
      description: "Submit evidence for the current step; reference a run via evidence.run_ref, never re-type output.",
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
          loadLedger(ledgerRoot),
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
      description: "Atomic ledger ops (create, delete, set_field, replace_section, add_edge, remove_edge): dry_run -> diff hash -> execute.",
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
        const ctx = { ledgerRoot, params: (args.params ?? {}) as Record<string, string> };
        const wantsExecute = args.execute_hash !== undefined && args.dry_run !== true;
        if (!wantsExecute) return migrateDryRun(String(args.name), ctx);
        return migrateExecute(String(args.name), ctx, String(args.execute_hash));
      },
    },
    {
      name: "se_file_list",
      title: "se.file.list",
      description: "List product entries under a directory (root-relative; workspace/ and ledger writes excluded).",
      inputSchema: {
        type: "object",
        properties: { dir: { type: "string", default: "." } },
      },
      handler: (args) => fileList(root, String(args.dir ?? ".")),
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
      handler: (args) => fileSearch(root, String(args.query), Number(args.limit ?? 20), (args.mode as SearchMode) ?? "literal"),
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
      handler: (args) => fileRead(root, String(args.path)),
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
        fileWrite(root, String(args.path), String(args.content), args.base_hash === null ? null : String(args.base_hash)),
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
          root,
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
      handler: (args) => fileDelete(root, String(args.path), String(args.base_hash)),
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
        const r = git(root, ...gitArgs);
        return { ok: r.ok, code: r.code, stdout: r.stdout.slice(-20_000), stderr: r.stderr.slice(-20_000) };
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
        const count = readFileSync(layout.notesPath(root), "utf8").trim().split("\n").length;
        return { captured: note.ref, inbox_count: count };
      },
    },
    {
      name: "se_gate_bless",
      title: "se.gate.bless",
      description: "Relay the owner's explicit chat approval of the live offer; the grant records channel=chat, adjudicated_by=owner.",
      inputSchema: {
        type: "object",
        properties: { hash: { type: "string", description: "the live offer's base hash" } },
        required: ["hash"],
      },
      handler: (args) => {
        const grant = new Gate(root).bless(systematic, String(args.hash), { channel: "chat", adjudicated_by: "owner" });
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
      handler: (args) => help(String(args.query), String(args.intent), tools, systematic, log()),
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
