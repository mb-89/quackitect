// c6's lane set: FTS query sanitizing, dot-paths served, declared roots.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { layout } from "../engine/layout.ts";
import { loadLedger } from "../engine/store.ts";
import { WarmIndex } from "../engine/warmindex.ts";
import { fileRead, fileList, fileWrite } from "../engine/deliverable.ts";
import { Rejection } from "../engine/errors.ts";

test("the ledger search survives hyphenated and special-character queries", () => {
  const root = mkdtempSync(join(tmpdir(), "se-c6-"));
  try {
    const dir = join(root, "product", "spec", "ledger", "se");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "x.md"), "---\nid: se.x\nkind: note\nstatement: A fixture.\n---\n\n## Body\nb\n", "utf8");
    const idx = new WarmIndex();
    try {
      idx.rebuild(loadLedger(layout.ledger(root)));
      assert.doesNotThrow(() => idx.search("pending-owner", 5), "hyphens never reach FTS as column syntax");
      assert.doesNotThrow(() => idx.search('a:b "unbalanced (', 5), "arbitrary punctuation is sanitized");
    } finally {
      idx.close();
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("dot-paths under the product serve like any other path; .git stays out", () => {
  const root = mkdtempSync(join(tmpdir(), "se-dot-"));
  try {
    mkdirSync(join(root, "product", ".obsidian"), { recursive: true });
    mkdirSync(join(root, ".git"), { recursive: true });
    writeFileSync(join(root, "product", ".obsidian", "app.json"), "{}\n", "utf8");
    writeFileSync(join(root, ".git", "HEAD"), "ref: x\n", "utf8");
    assert.equal(fileRead(root, "product/.obsidian/app.json").content, "{}\n");
    assert.ok(fileList(root, "product").some((e) => e.path === "product/.obsidian"), "dot-dirs are listed");
    assert.throws(() => fileRead(root, ".git/HEAD"), Rejection, ".git is never the lane's");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("declared roots serve read-only; undeclared roots refuse with the vocabulary", () => {
  const root = mkdtempSync(join(tmpdir(), "se-roots-"));
  const foreign = mkdtempSync(join(tmpdir(), "se-v1-"));
  try {
    writeFileSync(join(foreign, "readme.md"), "v1 precedent\n", "utf8");
    writeFileSync(join(root, "product.json"), JSON.stringify({ product: "t", roots: { v1: foreign } }), "utf8");
    assert.equal(fileRead(root, "@v1/readme.md").content, "v1 precedent\n");
    assert.ok(fileList(root, "@v1").some((e) => e.path === "@v1/readme.md"), "root listings keep the @ prefix");
    assert.throws(
      () => fileRead(root, "@nope/x.md"),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-069" && /v1/.test(e.expected),
    );
    assert.throws(
      () => fileWrite(root, "@v1/readme.md", "clobber", null),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-070",
      "declared roots are read-only",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(foreign, { recursive: true, force: true });
  }
});
