// Engine promotion (i12): the step that lets an iteration's engine changes
// reach the running lane before the close, because a shared judge cannot be
// per-iteration. Every rule here exists because breaking it has a named cost.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { promoteEngine, defaultSuite } from "../engine/promote.ts";
import { Rejection } from "../engine/errors.ts";

const ENGINE = "product/deliverable/engine/thing.ts";
const SPEC = "product/spec/ledger/se/node.md";

const green = (): { passed: number; failed: number } => ({ passed: 42, failed: 0 });
const red = (): { passed: number; failed: number } => ({ passed: 40, failed: 2 });

function pair(): { trunk: string; wt: string } {
  const trunk = mkdtempSync(join(tmpdir(), "se-trunk-"));
  const git = (...a: string[]): string => execFileSync("git", a, { cwd: trunk, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  mkdirSync(join(trunk, "product", "deliverable", "engine"), { recursive: true });
  mkdirSync(join(trunk, "product", "spec", "ledger", "se"), { recursive: true });
  writeFileSync(join(trunk, ENGINE), "export const v = 1;\n");
  writeFileSync(join(trunk, SPEC), "old\n");
  git("add", "-A");
  git("commit", "-q", "-m", "base");

  // The "worktree": a separate tree carrying the newer engine.
  const wt = mkdtempSync(join(tmpdir(), "se-wt-"));
  mkdirSync(join(wt, "product", "deliverable", "engine"), { recursive: true });
  mkdirSync(join(wt, "product", "spec", "ledger", "se"), { recursive: true });
  writeFileSync(join(wt, ENGINE), "export const v = 2;\n");
  writeFileSync(join(wt, SPEC), "new\n");
  return { trunk, wt };
}

const drop = (...roots: string[]): void => {
  for (const r of roots) {
    try {
      rmSync(r, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
    } catch {
      /* temp cleanup is best-effort on Windows */
    }
  }
};

test("a green promotion lands the engine on trunk and commits it", () => {
  const { trunk, wt } = pair();
  try {
    const r = promoteEngine(trunk, wt, [ENGINE], "the lane needs the new behaviour now", { runSuite: green });
    assert.equal(readFileSync(join(trunk, ENGINE), "utf8"), "export const v = 2;\n");
    assert.equal(r.tests.failed, 0);
    assert.match(r.commit, /^[0-9a-f]{7,}$/);
    const log = execFileSync("git", ["log", "-1", "--pretty=%B"], { cwd: trunk, encoding: "utf8" });
    assert.match(log, /engine promotion/);
    assert.match(log, /42 passed, 0 failed/, "the commit records the evidence it rested on");
    assert.equal(execFileSync("git", ["status", "--porcelain"], { cwd: trunk, encoding: "utf8" }).trim(), "", "nothing left uncommitted");
  } finally {
    drop(trunk, wt);
  }
});

test("RULE 2 - a RED suite in trunk promotes nothing, and trunk keeps the engine it had", () => {
  const { trunk, wt } = pair();
  try {
    assert.throws(
      () => promoteEngine(trunk, wt, [ENGINE], "should not land", { runSuite: red }),
      (e: unknown) => e instanceof Rejection && /RED in trunk/.test(String((e as Rejection).got)),
    );
    assert.equal(readFileSync(join(trunk, ENGINE), "utf8"), "export const v = 1;\n", "trunk restored exactly");
    assert.equal(execFileSync("git", ["status", "--porcelain"], { cwd: trunk, encoding: "utf8" }).trim(), "", "and nothing staged or committed");
  } finally {
    drop(trunk, wt);
  }
});

test("RULE 3 - a promotion cannot carry spec or evidence; that would be shipping without a close", () => {
  const { trunk, wt } = pair();
  try {
    assert.throws(
      () => promoteEngine(trunk, wt, [ENGINE, SPEC], "sneaking the spec through", { runSuite: green }),
      (e: unknown) => e instanceof Rejection && String((e as Rejection).got).includes("node.md"),
      "the offending file is named",
    );
    assert.equal(readFileSync(join(trunk, ENGINE), "utf8"), "export const v = 1;\n", "the legal file did not land either - all or nothing");
  } finally {
    drop(trunk, wt);
  }
});

test("RULE 1 - trunk with uncommitted changes in the promoted files is refused", () => {
  const { trunk, wt } = pair();
  try {
    writeFileSync(join(trunk, ENGINE), "export const v = 99; // someone else is mid-edit\n");
    assert.throws(
      () => promoteEngine(trunk, wt, [ENGINE], "colliding", { runSuite: green }),
      (e: unknown) => e instanceof Rejection && /uncommitted/.test(String((e as Rejection).got)),
    );
    assert.match(readFileSync(join(trunk, ENGINE), "utf8"), /99/, "their work is untouched");
  } finally {
    drop(trunk, wt);
  }
});

test("an empty promotion is refused rather than silently succeeding", () => {
  const { trunk, wt } = pair();
  try {
    assert.throws(() => promoteEngine(trunk, wt, [], "nothing", { runSuite: green }), Rejection);
  } finally {
    drop(trunk, wt);
  }
});

test("a file missing from the worktree fails the whole promotion", () => {
  const { trunk, wt } = pair();
  try {
    assert.throws(
      () => promoteEngine(trunk, wt, [ENGINE, "product/deliverable/engine/absent.ts"], "half a change", { runSuite: green }),
      (e: unknown) => e instanceof Rejection && /not in the worktree/.test(String((e as Rejection).got)),
    );
    assert.equal(readFileSync(join(trunk, ENGINE), "utf8"), "export const v = 1;\n", "no partial promotion");
    assert.equal(existsSync(join(trunk, "product/deliverable/engine/absent.ts")), false);
  } finally {
    drop(trunk, wt);
  }
});

// The runner itself. Every other test here injects `runSuite`, which left the
// function that actually decides — the one a real promotion calls — uncovered.
// It was broken: it handed the runner the DIRECTORY `tests/`, node resolved
// that as a module, and the crash counted as one failing test named "tests".
// So the promotion refused three times in a row while trunk was perfectly
// green, and its refusal message pointed at the code instead of at itself.
test("the real suite runner finds the test files and NAMES what failed", () => {
  const cwd = mkdtempSync(join(tmpdir(), "se-suite-"));
  try {
    mkdirSync(join(cwd, "tests"));
    writeFileSync(join(cwd, "tests", "ok.test.ts"), `import { test } from "node:test";\ntest("this one holds", () => {});\n`);
    const okOnly = defaultSuite(cwd);
    assert.equal(okOnly.failed, 0, "a green tree is green — a directory arg used to make it look red");
    assert.equal(okOnly.passed, 1, "the file was found and RUN, not merely resolved");

    writeFileSync(join(cwd, "tests", "bad.test.ts"), `import { test } from "node:test";\ntest("the load-bearing one", () => { throw new Error("boom"); });\n`);
    const withRed = defaultSuite(cwd);
    assert.equal(withRed.failed, 1);
    assert.deepEqual(withRed.failing, ["the load-bearing one"], "R19: name the fact, so the caller goes to the fix and not on a hunt");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("a tests directory with nothing in it is a FAILURE, never a pass", () => {
  const cwd = mkdtempSync(join(tmpdir(), "se-suite-"));
  try {
    mkdirSync(join(cwd, "tests"));
    const r = defaultSuite(cwd);
    assert.equal(r.failed, 1, "zero tests vouches for nothing — promoting on it would be promoting on silence");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
