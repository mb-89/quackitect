#!/usr/bin/env node
// Human-lane runner for se.set.migrate: same mechanism as the MCP tool,
// different renderer. Usage:
//   node bin/se-migrate.ts v1-import --v1-root ../quackitect [--execute]
import { resolve } from "node:path";
import { migrateDryRun, migrateExecute, registerMigration } from "../engine/migrate.ts";
import { v1Import } from "../engine/migrations/v1-import.ts";

registerMigration(v1Import);

const [name, ...rest] = process.argv.slice(2);
const flag = (f: string): string | undefined => {
  const i = rest.indexOf(f);
  return i === -1 ? undefined : rest[i + 1];
};
const ctx = {
  ledgerRoot: resolve(flag("--ledger") ?? "product/spec/ledger"),
  params: { v1_root: resolve(flag("--v1-root") ?? "../quackitect") },
};

const dry = migrateDryRun(name, ctx);
console.log(JSON.stringify(dry.report, null, 2));
console.log(`diff: ${dry.changes.length} files, hash ${dry.diff_hash}`);

if (rest.includes("--execute")) {
  const res = migrateExecute(name, ctx, dry.diff_hash);
  console.log(`applied: ${res.files.length} files written`);
} else {
  console.log("dry run only — pass --execute to apply");
}
