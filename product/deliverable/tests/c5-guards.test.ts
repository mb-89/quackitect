// c5's guard set, red until that chunk lands: toll grace, test-run scope.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { Rejection } from "../engine/errors.ts";
import { layout } from "../engine/layout.ts";
import { CallLog } from "../engine/calllog.ts";
import { Toll } from "../engine/toll.ts";
import { assertTestRunScope } from "../engine/run.ts";

const freshRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "se-guards-"));
  mkdirSync(layout.seDir(root), { recursive: true });
  return root;
};

const UPDATE = { current_step: "s", next_milestone: "m", eta: "12:00", todo: ["[ ] t"] };

test("toll grace: a lapsed window warns once, then refuses; any update clears", () => {
  const root = freshRoot();
  try {
    let clock = 1_000_000;
    const toll = new Toll(layout.seDir(root), { windowMs: 100, now: () => clock });
    const log = new CallLog(layout.seDir(root));
    toll.check("se_get_node", { update: UPDATE }, log);
    clock += 500;
    assert.doesNotThrow(() => toll.check("se_get_node", {}, log), "first lapsed call PASSES with a warning");
    assert.match(toll.takeWarning() ?? "", /next call without an update is refused/i);
    assert.throws(() => toll.check("se_get_node", {}, log), Rejection, "the ignored warning refuses");
    toll.check("se_get_node", { update: UPDATE }, log);
    clock += 500;
    assert.doesNotThrow(() => toll.check("se_get_node", {}, log), "payment reset the warning state");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("test-run scope: the declared suite refuses outside milestone verification states", () => {
  const root = freshRoot();
  try {
    assert.throws(
      () => assertTestRunScope(root, "npm --prefix product/deliverable run verify"),
      (e: unknown) => e instanceof Rejection && /verification/.test(e.expected),
    );
    assert.doesNotThrow(() => assertTestRunScope(root, "node workspace/anything-else.mjs"));
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
