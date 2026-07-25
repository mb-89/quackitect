// Git-layer tests against throwaway fixture repos (design §16: exercise the
// git layer against fixtures, never against the repo you are sitting in).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { git, repoRoot, commonDir, assertOperable, assertNotHistoryRewrite, assertNotPush } from "../engine/git.ts";
import { Rejection } from "../engine/errors.ts";

function fixtureRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "se-fixture-"));
  assert.ok(git(dir, "init", "-b", "main").ok);
  git(dir, "config", "user.email", "fixture@example.invalid");
  git(dir, "config", "user.name", "fixture");
  writeFileSync(join(dir, "a.md"), "hello\n");
  assert.ok(git(dir, "add", "a.md").ok);
  assert.ok(git(dir, "commit", "-m", "init").ok);
  return dir;
}

test("git layer works against a fixture repo", () => {
  const dir = fixtureRepo();
  try {
    assert.ok(repoRoot(dir) !== null);
    assert.ok(commonDir(dir) !== null);
    const log = git(dir, "log", "--oneline");
    assert.ok(log.ok && log.stdout.includes("init"));
  } finally {
    try { rmSync(dir, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("repoRoot is null outside a work tree", () => {
  const dir = mkdtempSync(join(tmpdir(), "se-plain-"));
  try {
    assert.equal(repoRoot(dir), null);
  } finally {
    try { rmSync(dir, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("SE refuses to operate on its own repo (SE-C-001)", () => {
  const engineRepo = join(import.meta.dirname, "..");
  assert.throws(
    () => assertOperable(engineRepo),
    (e: unknown) => e instanceof Rejection && e.clause === "SE-C-001",
  );
});

test("allow_self flag overrides the self-repo refusal", () => {
  const engineRepo = join(import.meta.dirname, "..");
  assertOperable(engineRepo, { allowSelf: true }); // must not throw
});

test("fixture repos are operable without a flag", () => {
  const dir = fixtureRepo();
  try {
    assertOperable(dir); // must not throw
  } finally {
    try { rmSync(dir, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("rebase and force-push are refused (SE-C-002)", () => {
  for (const args of [["rebase", "main"], ["push", "--force"], ["push", "-f", "origin", "main"]]) {
    assert.throws(
      () => assertNotHistoryRewrite(args),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-002",
      `should refuse: git ${args.join(" ")}`,
    );
  }
  assertNotHistoryRewrite(["push", "origin", "v2"]); // not a rewrite — SE-C-003's job
});

test("every push is refused on the agent lane (SE-C-003, se.rule-owner-pushes)", () => {
  for (const args of [["push"], ["push", "origin", "v2"], ["push", "-u", "origin", "main"]]) {
    assert.throws(
      () => assertNotPush(args),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-003",
      `should refuse: git ${args.join(" ")}`,
    );
  }
  assertNotPush(["commit", "-m", "x"]); // committing stays the agent lane
  assertNotPush(["fetch", "origin"]); // reading the remote is fine
});

test("rejections carry the full required shape", () => {
  try {
    assertNotHistoryRewrite(["rebase"]);
    assert.fail("expected a Rejection");
  } catch (e) {
    assert.ok(e instanceof Rejection);
    const r = e.toJSON();
    assert.equal(r.kind, "rejected");
    assert.ok(r.clause && r.expected && r.got && r.source);
    assert.ok(r.remedy.tool && r.remedy.note && typeof r.remedy.args === "object");
  }
});
