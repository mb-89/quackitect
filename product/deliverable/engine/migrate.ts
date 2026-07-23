// se.set.migrate — one-shot audited whole-ledger migrations, by name from
// the engine's registry (engine code, test-first, never a loose script).
// A migration GENERATES an apply manifest and rides the normal write lane:
// dry_run → diff hash → grant → execute. Idempotent: re-run yields an empty
// diff and is a no-op. (§5, ruled 2026-07-22 — G4.)
import { Rejection } from "./errors.ts";
import { dryRun, execute, type ApplyOp, type DryRunResult, type ExecuteResult } from "./apply.ts";

export interface MigrationContext {
  ledgerRoot: string;
  /** Extra inputs a migration needs, e.g. the v1 checkout path. */
  params: Record<string, string>;
}

export interface MigrationOutput {
  ops: ApplyOp[];
  /** Human-auditable accounting, recorded with the run. */
  report: Record<string, unknown>;
}

export interface Migration {
  name: string;
  description: string;
  generate(ctx: MigrationContext): MigrationOutput;
}

const registry = new Map<string, Migration>();

export function registerMigration(m: Migration): void {
  if (registry.has(m.name)) throw new Error(`duplicate migration: ${m.name}`);
  registry.set(m.name, m);
}

export function getMigration(name: string): Migration {
  const m = registry.get(name);
  if (!m) {
    throw new Rejection({
      clause: "SE-C-020",
      expected: `a registered migration (${[...registry.keys()].join(", ") || "none registered"})`,
      got: name,
      remedy: { tool: "se_set_migrate", args: { name: "v1-import", dry_run: true }, note: "migrations are engine code, never loose scripts" },
      source: "engine/migrate.ts",
    });
  }
  return m;
}

export function migrateDryRun(name: string, ctx: MigrationContext): DryRunResult & { report: Record<string, unknown> } {
  const { ops, report } = getMigration(name).generate(ctx);
  return { ...dryRun(ctx.ledgerRoot, ops), report };
}

export function migrateExecute(
  name: string,
  ctx: MigrationContext,
  executeHash: string,
): ExecuteResult & { report: Record<string, unknown> } {
  const { ops, report } = getMigration(name).generate(ctx);
  return { ...execute(ctx.ledgerRoot, ops, executeHash), report };
}
