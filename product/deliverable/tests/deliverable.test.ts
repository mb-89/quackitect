// The file lane: list/search/read/patch/write/delete over the repo root,
// CAS-guarded; workspace and escapes refused; ledger writes have their own
// lane.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileList, fileRead, fileWrite, filePatch, fileDelete, fileSearch } from "../engine/deliverable.ts";
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
    rmSync(root, { recursive: true, force: true });
  }
});

test("search finds by name and by content, workspace excluded", () => {
  const root = fixture();
  try {
    const byName = fileSearch(root, "a.ts");
    assert.ok(byName.hits.some((h) => h.path === "product/deliverable/engine/a.ts"));
    const byContent = fileSearch(root, "front door");
    assert.deepEqual(byContent.hits, [{ path: "README.md", line: 1, text: "the front door" }]);
    assert.equal(fileSearch(root, "agent territory").hits.length, 0);
    assert.equal(fileSearch(root, "no such match anywhere").hits.length, 0);

    // Literal returns every matching line per file (capped), not just the first.
    writeFileSync(join(root, "product", "twice.md"), "needle one\nnothing\nneedle two\n");
    const multi = fileSearch(root, "needle");
    assert.equal(multi.hits.filter((h) => h.path === "product/twice.md").length, 2);

    // Ranked: the file carrying both terms outranks the single-term file.
    writeFileSync(join(root, "product", "both.md"), "alpha beta\nalpha\n");
    writeFileSync(join(root, "product", "one.md"), "alpha\n");
    const ranked = fileSearch(root, "alpha beta", 20, "ranked");
    assert.equal(ranked.hits[0].path, "product/both.md");
    assert.ok((ranked.hits[0].score ?? 0) > (ranked.hits.find((h) => h.path === "product/one.md")?.score ?? 0));

    // Fuzzy: filename subsequence.
    const fuzzy = fileSearch(root, "prodtwice", 20, "fuzzy");
    assert.ok(fuzzy.hits.some((h) => h.path === "product/twice.md"));
  } finally {
    rmSync(root, { recursive: true, force: true });
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
    rmSync(root, { recursive: true, force: true });
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
    rmSync(root, { recursive: true, force: true });
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
    // Ledger READS are legal — search must see inside the ledger too.
    assert.ok(fileSearch(root, "ledger node").hits.length > 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
