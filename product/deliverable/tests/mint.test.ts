// B3 pass conditions: re-run yields an empty diff; 126/126 accounted.
// The real-v1 tests run against the sibling checkout and skip when absent.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { v1Import } from "../engine/migrations/v1-import.ts";
import { migrateDryRun, migrateExecute, registerMigration, getMigration } from "../engine/migrate.ts";
import { loadLedger } from "../engine/store.ts";

try {
  registerMigration(v1Import);
} catch {
  // already registered via tools.ts in the same process
}

const V1_ROOT = join(import.meta.dirname, "..", "..", "..", "..", "quackitect");
const haveV1 = existsSync(join(V1_ROOT, "spec", "decisions"));

test("a v1 tree that breaks the P3 accounting fails the mint loudly", () => {
  const fakeV1 = mkdtempSync(join(tmpdir(), "se-fake-v1-"));
  const ledger = mkdtempSync(join(tmpdir(), "se-mint-ledger-"));
  try {
    mkdirSync(join(fakeV1, "spec", "decisions"), { recursive: true });
    writeFileSync(
      join(fakeV1, "spec", "decisions", "adr-not-in-p3.md"),
      "---\nid: adr-not-in-p3\nstatement: An unaccounted decision.\n---\nBody.\n",
    );
    assert.throws(
      () => getMigration("v1-import").generate({ ledgerRoot: ledger, params: { v1_root: fakeV1 } }),
      /P3 accounting broken/,
    );
  } finally {
    rmSync(fakeV1, { recursive: true, force: true });
    rmSync(ledger, { recursive: true, force: true });
  }
});

test("the mint accounts 126/126 and is idempotent (empty diff on re-run)", (t) => {
  if (!haveV1) {
    t.skip("v1 sibling checkout not present");
    return;
  }
  const ledgerRoot = mkdtempSync(join(tmpdir(), "se-mint-"));
  try {
    const ctx = { ledgerRoot, params: { v1_root: V1_ROOT } };
    const dry = migrateDryRun("v1-import", ctx);
    const report = dry.report as {
      decisions: Record<string, number>;
      accounting_ok: boolean;
      p3_baseline: number;
      p3_baseline_accounted: number;
      nodes_planned: number;
    };
    assert.equal(report.accounting_ok, true, "every v1 decision must have a disposition");
    assert.equal(report.p3_baseline, 126, "the P3 baseline is 126 decisions");
    assert.equal(report.p3_baseline_accounted, 126, "126/126 accounted (verdicted + flagged)");
    assert.ok(dry.changes.length > 100, `expected a large mint, got ${dry.changes.length}`);

    const res = migrateExecute("v1-import", ctx, dry.diff_hash);
    assert.equal(res.applied, true);

    // Idempotency: the second run generates an empty diff.
    const again = migrateDryRun("v1-import", ctx);
    assert.equal(again.changes.length, 0, "re-run must be a no-op");

    // The minted ledger loads cleanly and carries provenance.
    const ledger = loadLedger(ledgerRoot);
    assert.ok(ledger.nodes.size >= report.nodes_planned);
    const pivot = ledger.nodes.get("se.pivot");
    assert.ok(pivot, "se.pivot must exist");
    assert.equal(pivot.migrated_from_v1 ?? pivot.provenance.migrated_by, "se.set.migrate v1-import");
    const graveyard = [...ledger.nodes.values()].filter((n) => n.kind === "anti_decision");
    assert.ok(graveyard.length >= 8, `graveyard holds the anti-keeps, got ${graveyard.length}`);
    const questions = [...ledger.nodes.values()].filter((n) => n.kind === "question");
    assert.ok(questions.length >= 11 + 7, `re-derive + delta questions, got ${questions.length}`);
    assert.ok(ledger.nodes.has("se.uc-11"), "UC-11 joins the UC set");
    assert.ok(ledger.nodes.has("se.req-runme-dep-free"), "the RUNME requirement exists");
    assert.ok(ledger.nodes.get("se.req-runme-dep-free")!.breaks_if_removed, "mandatory on requirements");
  } finally {
    rmSync(ledgerRoot, { recursive: true, force: true });
  }
});
