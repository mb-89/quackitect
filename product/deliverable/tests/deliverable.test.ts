// The file lane: list/search/read/patch/write/delete over the repo root,
// CAS-guarded; workspace and escapes refused; ledger writes have their own
// lane.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// NOTE (i12): fileSearch and its literal/ranked/fuzzy modes were DELETED, not
// replaced in place — git is now the only search provider
// (se.adr-git-is-the-only-searcher) and keeping a second implementation was
// ruled out. The search behaviour these tests used to cover now lives in
// tests/i12-tool-surface.test.ts against the real thing, including cases the
// old searcher could not do at all: searching a ref, and finding a file that
// was never staged.
import { fileList, fileRead, fileWrite, filePatch, fileDelete } from "../engine/deliverable.ts";
import { Rejection } from "../engine/errors.ts";

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "se-file-"));
  mkdirSync(join(root, "product", "deliverable", "engine"), { recursive: true });
  writeFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "export const a = 1;\n");
  mkdirSync(join(root, "product", "spec", "ledger", "se"), { recursive: true });
  writeFileSync(join(root, "product", "spec", "ledger", "se", "node.md"), "a ledger node\n");
  mkdirSync(join(root, "workspace"), { recursive: true });
  writeFileSync(join(root, "workspace", "mine.md"), "agent territory\n");
  writeFileSync(join(root, "README.md"), "the front door\n");
  return root;
}

test("list and read work root-wide; workspace and dot-dirs stay invisible", () => {
  const root = fixture();
  try {
    const top = fileList(root);
    assert.deepEqual(
      top.map((e) => e.path).sort(),
      ["README.md", "product"],
    );
    const f = fileRead(root, "README.md");
    assert.equal(f.content, "the front door\n");
    assert.equal(f.hash.length, 64);
    assert.equal(fileRead(root, "product/spec/ledger/se/node.md").content, "a ledger node\n");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("patch requires a unique match, moves the hash, and keeps replacements literal", () => {
  const root = fixture();
  try {
    const before = fileRead(root, "product/deliverable/engine/a.ts");
    const after = filePatch(root, "product/deliverable/engine/a.ts", "a = 1", "a = 2", before.hash);
    assert.notEqual(after.hash, before.hash);
    assert.match(readFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "utf8"), /a = 2/);

    writeFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "x\nx\n");
    assert.throws(
      () => filePatch(root, "product/deliverable/engine/a.ts", "x", "y"),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-064",
    );

    // Replacement patterns stay literal: the matched text must not splice
    // back in. (The marker is built by concatenation so the pattern never
    // appears literally in any lane payload.)
    const marker = "$" + "&";
    writeFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "const re = 1;\n");
    filePatch(root, "product/deliverable/engine/a.ts", "= 1", "= \"" + marker + "\"");
    assert.equal(
      readFileSync(join(root, "product", "deliverable", "engine", "a.ts"), "utf8"),
      "const re = \"" + marker + "\";\n",
    );
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("write is CAS-guarded: stale hash refused, create refuses existing; delete is hash-guarded", () => {
  const root = fixture();
  try {
    const f = fileRead(root, "README.md");
    writeFileSync(join(root, "README.md"), "changed\n");
    assert.throws(
      () => fileWrite(root, "README.md", "mine\n", f.hash),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-063",
    );
    const fresh = fileRead(root, "README.md");
    fileWrite(root, "README.md", "mine\n", fresh.hash);
    fileWrite(root, "product.json", "{\"product\":\"fixture\"}\n", null);
    assert.throws(
      () => fileWrite(root, "product.json", "x\n", null),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-062",
    );
    assert.throws(
      () => fileDelete(root, "product.json", "0".repeat(64)),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-063",
    );
    fileDelete(root, "product.json", fileRead(root, "product.json").hash);
    assert.equal(existsSync(join(root, "product.json")), false);
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("escapes and workspace are refused (SE-C-060); ledger writes point to se_set_apply (SE-C-065)", () => {
  const root = fixture();
  try {
    for (const bad of ["../outside", "..\\..\\etc", "workspace/mine.md", "product/../../x"]) {
      assert.throws(
        () => fileRead(root, bad),
        (e: unknown) => e instanceof Rejection && e.clause === "SE-C-060",
        `should refuse: ${bad}`,
      );
    }
    for (const op of [
      () => fileWrite(root, "product/spec/ledger/se/node.md", "x\n", null),
      () => filePatch(root, "product/spec/ledger/se/node.md", "a ledger node", "edited"),
      () => fileDelete(root, "product/spec/ledger/se/node.md", "0".repeat(64)),
    ]) {
      assert.throws(op, (e: unknown) => e instanceof Rejection && e.clause === "SE-C-065");
    }
    // Ledger READS stay legal — only WRITES ride se_set_apply.
    assert.equal(fileRead(root, "product/spec/ledger/se/node.md").content, "a ledger node\n");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
