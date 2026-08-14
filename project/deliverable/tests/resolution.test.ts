// THE RESOLUTION SEAM (tsp-bound-resolution). Written test-first at i27's
// author-tests, against a seam that is decided and not yet built.
//
// SOME CASES PASS TODAY and two are RED on purpose. The red ones are the
// design's owed work, stated as an executable claim rather than as prose: a
// resolution that names its store, and a call naming trunk that routes
// instead of refusing.
//
// exp-one-seam measured the ground this rests on. A child shell inherits its
// working directory, the platform refuses no escape, and one path string
// reached two different trees on 2026-08-14.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import * as paths from "../engine/paths.ts";
import { resolve as seam } from "../engine/resolve.ts";

const ROOT = mkdtempSync(join(tmpdir(), "se-resolve-"));

// ---------------------------------------------------------------- the jail

test("a root-relative path resolves inside the root", () => {
  const abs = paths.resolveInRoot(ROOT, "project/spec/thing.md", "test");
  assert.equal(abs.startsWith(ROOT), true, "a path inside the root must resolve inside it");
});

test("a relative path climbing out of the root is refused", () => {
  assert.throws(
    () => paths.resolveInRoot(ROOT, "../../elsewhere.md", "test"),
    /inside the project root/,
    "the platform serves an escaping path without complaint, so the seam must refuse it",
  );
});

test("an absolute path outside the root is refused", () => {
  assert.throws(() => paths.resolveInRoot(ROOT, join(tmpdir(), "not-mine.md"), "test"), /inside the project root/);
});

test("a declared root is read-only, so the write lane refuses it", () => {
  assert.throws(() => paths.resolveInRoot(ROOT, "@desktop/sketch.png", "test"), /READ-ONLY/);
});

// ------------------------------------------------- what decides the store

test("the kind of a path decides its store, never where the walk stands", () => {
  assert.equal(paths.pathKind(".se/notes.jsonl"), "session");
  assert.equal(paths.pathKind("project/guidance/contract.md"), "method");
  assert.equal(paths.pathKind("project/deliverable/engine/session.ts"), "method");
  assert.equal(paths.pathKind("project/spec/iterations/i27-x/evidence/a.md"), "record");
  assert.equal(paths.pathKind("project/spec/trace/requirement/req-x.md"), "content");
});

test("a record path names the record that owns it", () => {
  assert.deepEqual(paths.recordOwnerOf("project/spec/iterations/i27-x/evidence/a.md"), {
    container: "iterations",
    id: "i27-x",
  });
});

test("a method path fans out to every tree and a record path does not", () => {
  assert.equal(paths.fansOut("project/deliverable/engine/session.ts"), true);
  assert.equal(paths.fansOut("project/spec/iterations/i27-x/evidence/a.md"), false);
});

test("the engine's own tests count as method, so a tree cannot keep old ones", () => {
  assert.equal(paths.fansOut("project/deliverable/tests/resolution.test.ts"), true);
});

// ------------------------------------------------ the seam says where it went

test("every resolution names the store it resolved to", () => {
  const r = seam(ROOT, "project/spec/thing.md", "test");
  assert.equal(r.store, ROOT, "the answer must name the root that served it");
  assert.equal(r.abs.startsWith(ROOT), true);
});

test("every resolution names the owner, so routing is visible at the call", () => {
  assert.deepEqual(seam(ROOT, "project/guidance/contract.md", "test").owner, { kind: "core" });
  assert.deepEqual(seam(ROOT, "project/spec/iterations/i27-x/evidence/a.md", "test").owner, {
    kind: "record",
    container: "iterations",
    id: "i27-x",
  });
  assert.deepEqual(seam(ROOT, "project/spec/trace/requirement/req-x.md", "test").owner, { kind: "bound" });
});

test("a call naming a different owner is routed rather than refused as an escape", () => {
  // Method belongs to the core. Today SE-C-134 refuses this write from inside
  // a record; routing says who owns it instead of saying no.
  assert.deepEqual(paths.routeToOwner("project/deliverable/engine/paths.ts"), { kind: "core" });
  assert.deepEqual(paths.routeToOwner(".se/HANDOVER.md"), { kind: "core" });
});

test("routing never refuses, because a misresolution and a different owner are not the same thing", () => {
  // The seam REFUSES an escaping path...
  assert.throws(() => seam(ROOT, "../../elsewhere.md", "test"), /inside the project root/);
  // ...and routing ANSWERS for a path owned elsewhere. Confusing the two is
  // what closes the door method changes and commits both use.
  assert.deepEqual(paths.routeToOwner("project/guidance/refusals.md"), { kind: "core" });
});

// ------------------------------- a write is proved by reading back, per kind
//
// tsp-read-back-inspection checks the SHAPE of these: every case writes, then
// reads back from the store the answer named. None concludes from the write
// not throwing.

/** Write through the seam, then read back from the store it named. */
function writeThenReadBack(rel: string, body: string): { readBack: string; store: string } {
  const r = seam(ROOT, rel, "test");
  mkdirSync(dirname(r.abs), { recursive: true });
  writeFileSync(r.abs, body, "utf8");
  return { readBack: readFileSync(join(r.store, rel), "utf8"), store: r.store };
}

test("a method write reads back from the store the answer named", () => {
  const { readBack, store } = writeThenReadBack("project/guidance/probe.md", "method body");
  assert.equal(readBack, "method body");
  assert.equal(store, ROOT);
});

test("a record write reads back from that record's store", () => {
  const rel = "project/spec/iterations/i27-x/evidence/probe.md";
  const { readBack, store } = writeThenReadBack(rel, "record body");
  assert.equal(readBack, "record body");
  assert.equal(store, ROOT);
});

test("a session write reads back from the project root and never from a worktree", () => {
  const { readBack, store } = writeThenReadBack(".se/probe.md", "session body");
  assert.equal(readBack, "session body");
  assert.equal(store, ROOT);
});

test("a repo-root file reads back from the root", () => {
  const { readBack, store } = writeThenReadBack("README-probe.md", "root body");
  assert.equal(readBack, "root body");
  assert.equal(store, ROOT);
});
