// B2 pass condition: a mid-air collision dies at the write with a
// one-turn-recoverable rejection.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dryRun, execute, type ApplyOp } from "../engine/apply.ts";
import { loadLedger } from "../engine/store.ts";
import { getNode, type NodeOutline, type NodeSection } from "../engine/get.ts";
import { Rejection } from "../engine/errors.ts";

const NODE = `---
id: se.adr-example
kind: decision
statement: An example decision for apply tests.
edges:
  addresses: [se.raid-example]
---

## Rationale

Because the tests need a body with sections.

## Consequences

Sections can be replaced atomically.
`;

const RAID = `---
id: se.raid-example
kind: raid
statement: An example risk.
---

Body.
`;

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "se-apply-"));
  mkdirSync(join(root, "se"), { recursive: true });
  writeFileSync(join(root, "se", "adr-example.md"), NODE);
  writeFileSync(join(root, "se", "raid-example.md"), RAID);
  return root;
}

test("dry_run -> execute applies create, edit and edge ops atomically", () => {
  const root = fixture();
  try {
    const ops: ApplyOp[] = [
      { op: "create", id: "se.uc-11", kind: "use_case", statement: "Vendored vehicle runs standalone.", body: "## Main scenario\n\nSteps.\n" },
      { op: "set_field", id: "se.adr-example", field: "statement", value: "An amended statement." },
      { op: "replace_section", id: "se.adr-example", section: "Rationale", content: "Rewritten rationale." },
      { op: "add_edge", id: "se.adr-example", kind: "supersedes", target: "se.raid-example" },
    ];
    const dry = dryRun(root, ops);
    assert.equal(dry.changes.length, 2);
    const res = execute(root, ops, dry.diff_hash);
    assert.equal(res.applied, true);

    const ledger = loadLedger(root);
    assert.equal(ledger.nodes.get("se.uc-11")!.statement, "Vendored vehicle runs standalone.");
    const adr = ledger.nodes.get("se.adr-example")!;
    assert.equal(adr.statement, "An amended statement.");
    assert.ok(adr.body.includes("Rewritten rationale."));
    assert.deepEqual(adr.edges.supersedes, ["se.raid-example"]);
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("mid-air collision dies at the write with a one-turn-recoverable rejection", () => {
  const root = fixture();
  try {
    const ops: ApplyOp[] = [{ op: "set_field", id: "se.adr-example", field: "statement", value: "Mine." }];
    const dry = dryRun(root, ops);

    // A human edits the same node between dry_run and execute.
    writeFileSync(join(root, "se", "adr-example.md"), NODE.replace("An example decision", "A human-edited decision"));

    let rejection: Rejection | undefined;
    try {
      execute(root, ops, dry.diff_hash);
    } catch (e) {
      rejection = e as Rejection;
    }
    assert.ok(rejection instanceof Rejection, "expected a Rejection");
    assert.equal(rejection.clause, "SE-C-010");
    // One-turn recovery: the remedy IS the corrected call.
    assert.equal(rejection.remedy.tool, "se_set_apply");
    assert.deepEqual((rejection.remedy.args as { ops: ApplyOp[] }).ops, ops);
    // And the human edit was not clobbered.
    assert.ok(readFileSync(join(root, "se", "adr-example.md"), "utf8").includes("human-edited"));

    // The recovery path works: fresh dry_run, fresh hash, execute succeeds.
    const dry2 = dryRun(root, ops);
    assert.notEqual(dry2.diff_hash, dry.diff_hash);
    const res = execute(root, ops, dry2.diff_hash);
    assert.equal(res.applied, true);
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("a stale hash cannot replay after a successful execute", () => {
  const root = fixture();
  try {
    const ops: ApplyOp[] = [{ op: "add_edge", id: "se.adr-example", kind: "refines", target: "se.raid-example" }];
    const dry = dryRun(root, ops);
    execute(root, ops, dry.diff_hash);
    // Same hash again: state moved (the edge now exists), so the diff is
    // empty and the old hash no longer matches.
    assert.throws(
      () => execute(root, ops, dry.diff_hash),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-010",
    );
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("edge fields are writable only via edge ops (SE-C-011)", () => {
  const root = fixture();
  try {
    assert.throws(
      () => dryRun(root, [{ op: "set_field", id: "se.adr-example", field: "addresses", value: ["se.x"] }]),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-011",
    );
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("delete removes the file; unknown ids are rejected", () => {
  const root = fixture();
  try {
    const ops: ApplyOp[] = [
      { op: "remove_edge", id: "se.adr-example", kind: "addresses", target: "se.raid-example" },
      { op: "delete", id: "se.raid-example" },
    ];
    const dry = dryRun(root, ops);
    execute(root, ops, dry.diff_hash);
    assert.ok(!existsSync(join(root, "se", "raid-example.md")));
    assert.throws(
      () => dryRun(root, [{ op: "delete", id: "se.nope" }]),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-012",
    );
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("get.node outline/section/full carry id + hash", () => {
  const root = fixture();
  try {
    const ledger = loadLedger(root);
    const outline = getNode(ledger, "se.adr-example") as NodeOutline;
    assert.equal(outline.kind, "decision");
    assert.deepEqual(outline.sections, ["Rationale", "Consequences"]);
    assert.ok(outline.hash.length === 64);

    const section = getNode(ledger, "se.adr-example", "section", "Consequences") as NodeSection;
    assert.ok(section.content.includes("replaced atomically"));

    const full = getNode(ledger, "se.adr-example", "full") as { content: string };
    assert.ok(full.content.startsWith("---\nid: se.adr-example"));

    // Unknown node: rejection whose remedy is the search call.
    assert.throws(
      () => getNode(ledger, "se.missing"),
      (e: unknown) => e instanceof Rejection && e.remedy.tool === "se_get_search",
    );
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
