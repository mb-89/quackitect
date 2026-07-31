// SEARCH MUST NOT GO BLIND INSIDE A BOUND WORKTREE. ripgrep resolves its
// exclusion globs against the WORKING DIRECTORY, never against the target it
// was pointed at. An expedition worktree lives under .worktrees, which the
// exclusion list names — so the tree excluded itself, and every directory
// search in an open expedition answered a confident, empty "no matches"
// (found live 2026-07-30, while the search that found it had to be run by
// hand to prove the lane was lying).
//
// A single named FILE always survived, because ripgrep never applies these
// filters to a target handed to it explicitly. That asymmetry is what made
// the failure read as a parser bug instead of a scoping one, so both halves
// are pinned here.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { search } from "../engine/search.ts";

// Every case builds its own root and touches no process-global state, so this
// file runs concurrently.

test("a search root living under .worktrees still finds its own files", () => {
  const tmp = mkdtempSync(join(tmpdir(), "se-search-"));
  try {
    // The shape that broke it: the root being searched sits INSIDE a
    // directory the exclusion list names.
    const bound = join(tmp, ".worktrees", "e1-some-expedition");
    mkdirSync(bound, { recursive: true });
    writeFileSync(join(bound, "record.md"), "the needle is here\n", "utf8");

    const r = search(bound, "needle");
    assert.equal(r.total, 1, "search went blind inside the bound worktree");
    assert.equal(r.matches[0].path, "record.md");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("the exclusion list still holds for directories below the search root", () => {
  const tmp = mkdtempSync(join(tmpdir(), "se-search-"));
  try {
    mkdirSync(join(tmp, "node_modules"), { recursive: true });
    mkdirSync(join(tmp, ".worktrees"), { recursive: true });
    writeFileSync(join(tmp, "kept.md"), "the needle is here\n", "utf8");
    writeFileSync(join(tmp, "node_modules", "dep.md"), "the needle is here\n", "utf8");
    writeFileSync(join(tmp, ".worktrees", "wt.md"), "the needle is here\n", "utf8");

    // Anchoring the globs must not disarm them. Deleting the exclusion list
    // would make the case above pass just as well, and this one fail.
    const r = search(tmp, "needle");
    assert.deepEqual(r.matches.map((m) => m.path), ["kept.md"]);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("a single named file is searchable wherever it lives", () => {
  const tmp = mkdtempSync(join(tmpdir(), "se-search-"));
  try {
    const bound = join(tmp, ".worktrees", "e1-some-expedition");
    mkdirSync(bound, { recursive: true });
    writeFileSync(join(bound, "record.md"), "the needle is here\n", "utf8");

    const r = search(bound, "needle", { path: "record.md" });
    assert.equal(r.total, 1);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("limit above fifty is honored in one file", () => {
  const tmp = mkdtempSync(join(tmpdir(), "se-search-"));
  try {
    const lines = Array.from({ length: 80 }, (_v, i) => `needle ${i + 1}`).join("\n") + "\n";
    writeFileSync(join(tmp, "many.md"), lines, "utf8");

    const capped = search(tmp, "needle", { limit: 70 });
    assert.equal(capped.matches.length, 70, "limit above fifty should be honored");

    const unbounded = search(tmp, "needle", { limit: 0 });
    assert.equal(unbounded.total, 80);
    assert.equal(unbounded.matches.length, 80);
    assert.equal(unbounded.truncated, false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
