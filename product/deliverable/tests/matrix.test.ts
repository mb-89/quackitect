// The rigor matrix: reader + column compiler (engine/matrix.ts).
// The matrix is read LIVE from machines/matrix (seed-from-source law);
// compiling a change-size column yields a valid iteration machine with
// struck states contracted out of the dependency graph.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readMatrix, compileColumn } from "../engine/matrix.ts";
import { validateMachine } from "../engine/machine.ts";

const ROOT = join(import.meta.dirname, "..", "..", "..");

test("readMatrix: the real matrix is complete", () => {
  const m = readMatrix(ROOT);
  assert.equal(m.rows.length, 48);
  for (const row of m.rows) {
    for (const col of ["patch", "minor", "major", "product", "specification"]) {
      const cell = m.cells.get(row.name)?.get(col);
      assert.ok(cell, `${row.name} is missing its ${col} cell`);
    }
  }
  // Dependencies resolve to declared rows.
  const names = new Set(m.rows.map((r) => r.name));
  for (const row of m.rows) for (const d of row.depends_on) assert.ok(names.has(d), `${row.name} depends on unknown ${d}`);
});

test("readMatrix: a missing cell refuses with the row and column named", () => {
  const dir = mkdtempSync(join(tmpdir(), "se-matrix-"));
  try {
    mkdirSync(join(dir, "product", "deliverable", "machines", "matrix", "rows"), { recursive: true });
    mkdirSync(join(dir, "product", "deliverable", "machines", "matrix", "cells"), { recursive: true });
    writeFileSync(
      join(dir, "product", "deliverable", "machines", "matrix", "rows", "M0_10_lonely.md"),
      '---\nkind: matrix-row\nname: lonely\nstatement: "A row with no cells."\nstate_kind: work\nfilled_by: agent\ndepends_on: []\n---\n\n## Guidance\nNothing.\n',
    );
    assert.throws(() => readMatrix(dir), /lonely.*patch/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("compileColumn major: every row seeds; the machine validates", () => {
  const m = readMatrix(ROOT);
  const decl = compileColumn(m, "major");
  validateMachine(decl);
  // 48 rows + the mechanical start.
  assert.equal(decl.states.length, 49);
  assert.ok(decl.states.some((s) => s.id === "enumerate-space" && s.submachine === "iteration"));
  const shipped = decl.states.find((s) => s.id === "shipped");
  assert.equal(shipped?.kind, "terminal");
});

test("compileColumn patch: struck states vanish and dependencies contract", () => {
  const m = readMatrix(ROOT);
  const decl = compileColumn(m, "patch");
  validateMachine(decl);
  const ids = new Set(decl.states.map((s) => s.id));
  // Struck at patch: no vision, no architecture walk.
  assert.ok(!ids.has("gate-motivation"));
  assert.ok(!ids.has("enumerate-space"));
  assert.ok(!ids.has("onboard-retro"));
  // The floor holds.
  assert.ok(ids.has("gate-kickoff"));
  assert.ok(ids.has("verification"));
  assert.ok(ids.has("sweep-consistency"));
  assert.ok(ids.has("gate-release"));
  // Contraction: write-requirements' struck upstream collapses to the
  // applied frame-delta and log-risks.
  const incoming = (to: string) => decl.states.filter((s) => s.edges.some((e) => e.to === to)).map((s) => s.id).sort();
  assert.deepEqual(incoming("write-requirements"), ["frame-delta", "log-risks"]);
  // author-tests contracts through the whole struck M4-M6 stretch.
  assert.deepEqual(incoming("author-tests"), ["probe-assumptions", "write-requirements"]);
  // 17 applied rows + start.
  assert.equal(decl.states.length, 18);
});

test("compileColumn: the verification loop compiles as fallback and recovery", () => {
  const m = readMatrix(ROOT);
  for (const col of ["patch", "minor", "major"] as const) {
    const decl = compileColumn(m, col);
    const verification = decl.states.find((s) => s.id === "verification");
    assert.ok(verification, `${col}: verification missing`);
    assert.equal(verification?.filled_by, "engine");
    assert.ok(verification?.command, `${col}: verification carries no command`);
    const fb = verification?.edges.find((e) => e.to === "fix-findings");
    assert.equal(fb?.role, "fallback");
    assert.equal(fb?.guard, "verification_attempts < 3");
    const fix = decl.states.find((s) => s.id === "fix-findings");
    const rec = fix?.edges.find((e) => e.to === "verification");
    assert.equal(rec?.role, "recovery");
  }
});

test("compileColumn: a gate's outgoing edges are approvals", () => {
  const m = readMatrix(ROOT);
  const decl = compileColumn(m, "minor");
  const gate = decl.states.find((s) => s.id === "gate-requirements");
  assert.ok(gate);
  assert.equal(gate?.kind, "gate");
  for (const e of gate!.edges) assert.equal(e.role, "approval");
});

test("compileColumn minor: the tailoring strikes exactly the M4-M5 exploration", () => {
  const m = readMatrix(ROOT);
  const decl = compileColumn(m, "minor");
  validateMachine(decl);
  const ids = new Set(decl.states.map((s) => s.id));
  for (const struck of ["pressure-test", "derive-criteria", "partition-functions", "enumerate-space", "evaluate-set", "gate-candidates", "converge-pugh", "reverse-sensitivity"]) {
    assert.ok(!ids.has(struck), `minor should strike ${struck}`);
  }
  // 40 applied rows + start.
  assert.equal(decl.states.length, 41);
});

test("the columns are monotone: what a smaller column walks, every larger column walks", () => {
  const m = readMatrix(ROOT);
  const applied = (col: string) =>
    new Set(m.rows.filter((r) => m.cells.get(r.name)?.get(col)?.applies !== "none").map((r) => r.name));
  const patch = applied("patch");
  const minor = applied("minor");
  const major = applied("major");
  for (const name of patch) assert.ok(minor.has(name), `${name} applies at patch but not at minor`);
  for (const name of minor) assert.ok(major.has(name), `${name} applies at minor but not at major`);
});

test("compileColumn: cell guidance rides the seeded state", () => {
  const m = readMatrix(ROOT);
  const decl = compileColumn(m, "patch");
  const at = decl.states.find((s) => s.id === "author-tests");
  assert.ok(at?.guidance.includes("DELIVERY NEVER SHRINKS"), "the patch cell's tailoring is in the guidance");
  assert.ok(at?.guidance.includes("meth-test-first"), "the row's method links survive");
});
