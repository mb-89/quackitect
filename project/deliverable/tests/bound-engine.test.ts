// THE RECORD'S HOLD ON ITS MACHINE (tsp-bound-engine-and-method). Written
// test-first at i27's author-tests.
//
// The decision table this walks has two axes: whether the record carries an
// override, and whether trunk has moved under it. The fourth cell — override
// plus moved trunk — is the one that matters, because a composed mixture
// nobody assembled is what req-entry-levels-the-record-tree exists to prevent.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import * as paths from "../engine/paths.ts";

// ------------------------------------- the ground the delta stands on today

test("method files are shared by every tree", () => {
  for (const p of [
    "project/guidance/contract.md",
    "project/deliverable/machines/items/element.md",
    "project/deliverable/engine/session.ts",
  ]) {
    assert.equal(paths.fansOut(p), true, `${p} must reach every tree`);
  }
});

test("the prompt layer counts as method though it lives under no method folder", () => {
  assert.equal(paths.pathKind("project/CLAUDE.md"), "method");
  assert.equal(paths.pathKind("project/AGENTS.md"), "method");
});

test("a record's own folder belongs to that record and fans out to nobody", () => {
  const p = "project/spec/iterations/i27-x/evidence/author-tests.md";
  assert.equal(paths.pathKind(p), "record");
  assert.equal(paths.fansOut(p), false);
});

test("session state belongs to the machine rather than to any branch", () => {
  assert.equal(paths.pathKind(".se/HANDOVER.md"), "session");
  assert.equal(paths.pathKind(".se/calls.jsonl"), "session");
});

// --------------------------------------- what the delta still owes (RED)

test("a record's own folder may override an engine file, record first and trunk second", () => {
  const composes = typeof (paths as Record<string, unknown>).composeForRecord === "function";
  assert.equal(
    composes,
    true,
    "RED by design. el-engine-delta resolves record-first then trunk-second, and no such resolution exists. Today an engine path is method and fans out, which is the opposite of an override.",
  );
});

test("entry levels the record's tree and rebases its delta before the first call", () => {
  const levels = typeof (paths as Record<string, unknown>).levelRecordTree === "function";
  assert.equal(
    levels,
    true,
    "RED by design. el-satellite-supervisor's START act levels, rebases and commits before serving, or stops the record with the conflict named. Nothing does it today.",
  );
});

test("a stale override stops the record at entry rather than composing a mixture", () => {
  const stops = typeof (paths as Record<string, unknown>).levelRecordTree === "function";
  assert.equal(
    stops,
    true,
    "RED by design. This is the fourth cell of the table — an override that no longer applies to the trunk file beneath it. if-engine-delta-to-account carries the report; nothing raises it.",
  );
});
