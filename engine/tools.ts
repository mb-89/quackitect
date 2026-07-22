// The tool surface (§5) bound to a ledger root. B2 ships the read/write
// pair + search; loop tools land at B4, guard rails at B5.
import { loadLedger } from "./store.ts";
import { WarmIndex } from "./warmindex.ts";
import { getNode, type GetMode } from "./get.ts";
import { dryRun, execute, type ApplyOp } from "./apply.ts";
import { Rejection } from "./errors.ts";
import type { ToolDef } from "./mcp.ts";
import { migrateDryRun, migrateExecute, registerMigration } from "./migrate.ts";
import { v1Import } from "./migrations/v1-import.ts";

registerMigration(v1Import);

export function coreTools(ledgerRoot: string): ToolDef[] {
  return [
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
      // The real logged version lands at B5; the tool exists from day one so
      // the surface never ships without the demand-capture lane.
      handler: () => {
        throw new Rejection({
          clause: "SE-C-090",
          expected: "se.help wired to the call log (B5)",
          got: "placeholder",
          remedy: { tool: "se_help", args: {}, note: "not yet armed — lands at B5" },
          source: "engine/tools.ts",
        });
      },
    },
  ];
}
