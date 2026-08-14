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
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import * as paths from "../engine/paths.ts";

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

// ------------------------------------------- what the seam still owes (RED)

test("every resolution names the store it resolved to", () => {
  const resolved: unknown = paths.resolveInRoot(ROOT, "project/spec/thing.md", "test");
  const names = typeof resolved === "object" && resolved !== null && "store" in (resolved as object);
  assert.equal(
    names,
    true,
    "RED by design. The seam answers a bare path string. req-a-write-lands-where-it-is-meant wants the store ON the answer, because a wrong resolution is invisible without it.",
  );
});

test("a call naming trunk is routed to its owner rather than refused as an escape", () => {
  const routes = typeof (paths as Record<string, unknown>).routeToOwner === "function";
  assert.equal(
    routes,
    true,
    "RED by design. Routing is not resolution. A path resolving outside its record is a misresolution; a call naming trunk names a different OWNER. req-version-control-resolves-like-every-call wants the second routed.",
  );
});
