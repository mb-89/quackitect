// The realization lane: list/read/patch/write, CAS-guarded, scoped to
// product/deliverable, escapes refused.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listDeliverable, readDeliverable, writeDeliverable, patchDeliverable } from "../engine/deliverable.ts";
import { Rejection } from "../engine/errors.ts";

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "se-dlv-"));
  mkdirSync(join(root, "product", "deliverable", "engine"), { recursive: true });
  writeFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "export const a = 1;\n");
  mkdirSync(join(root, "product", "spec", "ledger"), { recursive: true });
  return root;
}

test("list and read return deliverable-relative paths with hashes", () => {
  const root = fixture();
  try {
    const top = listDeliverable(root);
    assert.deepEqual(top, [{ path: "engine", kind: "dir" }]);
    const f = readDeliverable(root, "engine/a.ts");
    assert.equal(f.content, "export const a = 1;\n");
    assert.equal(f.hash.length, 64);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("patch requires a unique match and moves the hash", () => {
  const root = fixture();
  try {
    const before = readDeliverable(root, "engine/a.ts");
    const after = patchDeliverable(root, "engine/a.ts", "a = 1", "a = 2", before.hash);
    assert.notEqual(after.hash, before.hash);
    assert.match(readFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "utf8"), /a = 2/);

    writeFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "x\nx\n");
    assert.throws(
      () => patchDeliverable(root, "engine/a.ts", "x", "y"),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-064",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("write is CAS-guarded: stale hash refused, create refuses existing", () => {
  const root = fixture();
  try {
    const f = readDeliverable(root, "engine/a.ts");
    // A concurrent edit moves the disk.
    writeFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "changed\n");
    assert.throws(
      () => writeDeliverable(root, "engine/a.ts", "mine\n", f.hash),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-063",
    );
    // Fresh read -> write succeeds.
    const fresh = readDeliverable(root, "engine/a.ts");
    writeDeliverable(root, "engine/a.ts", "mine\n", fresh.hash);
    assert.equal(readFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "utf8"), "mine\n");
    // Create with null base_hash; refuses when the file exists.
    writeDeliverable(root, "engine/new.ts", "n\n", null);
    assert.throws(
      () => writeDeliverable(root, "engine/new.ts", "n2\n", null),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-062",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("paths outside the deliverable are refused (SE-C-060) — the ledger has its own lane", () => {
  const root = fixture();
  try {
    for (const bad of ["../spec/ledger/x.md", "..\\..\\etc", "engine/../../spec/x"]) {
      assert.throws(
        () => readDeliverable(root, bad),
        (e: unknown) => e instanceof Rejection && e.clause === "SE-C-060",
        `should refuse: ${bad}`,
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
