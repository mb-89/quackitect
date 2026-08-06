// The rigor matrix: reader + column compiler (engine/rigor-matrix.ts).
// It is read LIVE from machines/rigor_matrix (seed-from-source law);
// compiling a change-size column yields a valid iteration machine with
// struck states contracted out of the dependency graph.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { validateMachine } from "../engine/machine.ts";
import { ALL_COLUMNS, CHANGE_COLUMNS, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";

const ROOT = join(import.meta.dirname, "..", "..", "..");

// EVERY JOIN DECIDES ABOUT ITS BAR (owner ruling 2026-08-06).
//
// A state with two or more inputs meets them as an AND only when a busbar is
// authored above it. Without one they are an OR, and any single arriving
// input releases the state. Both readings are legal and the bar is what says
// which.
//
// What is NOT legal is a multi-input row where nobody decided. A reader
// cannot tell the two apart, and the day this went unchecked the panel
// reported green over work nobody had done.
test("every multi-input row has decided about its busbar", () => {
  const m = readRigorMatrix(ROOT);
  const undecided = m.rows.filter((r) => r.depends_on.length >= 2 && !r.busbar).map((r) => r.name);
  assert.deepEqual(undecided, [], "a row with several inputs declares busbar: true, or is re-cut to one input");
});

// THE BAR AND THE CHECK READ ONE FACT. The authored declaration rides the
// compiled state, so the drawing and the submit cannot disagree. They
// disagreed once: both keyed off kind === "gate", which made them agree with
// each other and be wrong together.
test("compileColumn: the authored busbar rides the compiled state", () => {
  const decl = compileColumn(readRigorMatrix(ROOT), "major");
  assert.equal(decl.states.find((s) => s.id === "gate-inputs")?.busbar, true, "a gate collects all its inputs, and now says so out loud");
  assert.equal(decl.states.find((s) => s.id === "generalize-use-cases")?.busbar, false, "one input needs no bar");
});

// A SINGLE INPUT STILL BINDS, and that was the case standing wide open. No
// bar could have saved generalize-use-cases and no OR excused it, because
// nothing checked a work state's inputs at all.
test("generalize-use-cases takes exactly one input, and it is write-stories", () => {
  const decl = compileColumn(readRigorMatrix(ROOT), "major");
  const feeders = decl.states.filter((s) => s.edges.some((e) => e.to === "generalize-use-cases" && e.role === "normal")).map((s) => s.id);
  assert.deepEqual(feeders, ["write-stories"]);
});

test("readMatrix: the real matrix is complete", () => {
  const m = readRigorMatrix(ROOT);
  // 51 since identify-assumptions split off probe-assumptions (owner ruling
  // 2026-08-06): probing assumed somebody had written assumptions, and
  // nothing forced anybody to.
  assert.equal(m.rows.length, 51);
  for (const row of m.rows) {
    for (const col of ALL_COLUMNS) {
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
    mkdirSync(join(dir, "project", "deliverable", "machines", "rigor_matrix", "rows"), { recursive: true });
    mkdirSync(join(dir, "project", "deliverable", "machines", "rigor_matrix", "cells"), { recursive: true });
    writeFileSync(
      join(dir, "project", "deliverable", "machines", "rigor_matrix", "rows", "M0_10_lonely.md"),
      '---\nkind: matrix-row\nname: lonely\nstatement: "A row with no cells."\nstate_kind: work\nfilled_by: agent\ndepends_on: []\nevidence:\n  - name: proof\n    description: "anything"\n---\n\n## Guidance\nNothing.\n',
    );
    assert.throws(() => readRigorMatrix(dir), /lonely.*patch/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("compileColumn major: every row seeds; the machine validates", () => {
  const m = readRigorMatrix(ROOT);
  const decl = compileColumn(m, "major");
  validateMachine(decl);
  // 51 rows + the mechanical start.
  assert.equal(decl.states.length, 52);
  // Only a state that RUNS a seeded machine descends; authoring states do not.
  assert.ok(decl.states.some((s) => s.id === "build-steps" && s.submachine === "build-chunks"));
  assert.ok(decl.states.some((s) => s.id === "run-spikes" && s.submachine === "spikes"));
  assert.ok(decl.states.some((s) => s.id === "run-candidates" && s.submachine === "candidates"));
  assert.ok(decl.states.every((s) => s.submachine === undefined || ["build-steps", "run-spikes", "run-candidates"].includes(s.id)));
  const shipped = decl.states.find((s) => s.id === "shipped");
  assert.equal(shipped?.kind, "terminal");
});

test("compileColumn patch: struck states vanish and dependencies contract", () => {
  const m = readRigorMatrix(ROOT);
  const decl = compileColumn(m, "patch");
  validateMachine(decl);
  const ids = new Set(decl.states.map((s) => s.id));
  // Struck at patch: no vision, no architecture walk.
  assert.ok(!ids.has("gate-motivation"));
  assert.ok(!ids.has("enumerate-space"));
  // Every iteration opens with the retro — patch included (owner 2026-08-04).
  assert.ok(ids.has("onboard-retro"));
  // The floor holds. Every size is checked below; this is the patch case,
  // which is the one that strikes the most.
  assert.ok(ids.has("gate-kickoff"));
  assert.ok(ids.has("verification"));
  assert.ok(ids.has("sweep-consistency"));
  assert.ok(ids.has("gate-release"));
  // Contraction: write-requirements' struck upstream collapses to the
  // applied frame-delta and log-risks.
  const incoming = (to: string) =>
    decl.states
      .filter((s) => s.edges.some((e) => e.to === to))
      .map((s) => s.id)
      .sort();
  assert.deepEqual(incoming("write-requirements"), ["frame-delta", "log-risks"]);
  // author-tests contracts through the whole struck M4-M6 stretch.
  assert.deepEqual(incoming("author-tests"), ["probe-assumptions", "write-requirements"]);
  // 19 applied rows + start. identify-assumptions applies at patch too: when a
  // patch exists BECAUSE something stopped holding, that is an assumption
  // turning into an issue, and it is the one case patch-size must record.
  assert.equal(decl.states.length, 20);
});

test("compileColumn: the verification loop compiles as fallback and recovery", () => {
  const m = readRigorMatrix(ROOT);
  for (const col of CHANGE_COLUMNS) {
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
  const m = readRigorMatrix(ROOT);
  const decl = compileColumn(m, "minor");
  const gate = decl.states.find((s) => s.id === "gate-requirements");
  assert.ok(gate);
  assert.equal(gate?.kind, "gate");
  for (const e of gate!.edges) assert.equal(e.role, "approval");
});

test("compileColumn minor: the tailoring strikes exactly the M4-M5 exploration", () => {
  const m = readRigorMatrix(ROOT);
  const decl = compileColumn(m, "minor");
  validateMachine(decl);
  const ids = new Set(decl.states.map((s) => s.id));
  for (const struck of [
    "pressure-test",
    "derive-criteria",
    "partition-functions",
    "enumerate-space",
    "evaluate-set",
    "gate-candidates",
    "converge-pugh",
    "reverse-sensitivity",
  ]) {
    assert.ok(!ids.has(struck), `minor should strike ${struck}`);
  }
  // 42 applied rows + start (run-spikes rides rank-unknowns into minor).
  assert.equal(decl.states.length, 43);
});

test("the columns are monotone: what a smaller column walks, every larger column walks", () => {
  const m = readRigorMatrix(ROOT);
  const applied = (col: string) => new Set(m.rows.filter((r) => m.cells.get(r.name)?.get(col)?.applies !== "none").map((r) => r.name));
  const patch = applied("patch");
  const minor = applied("minor");
  const major = applied("major");
  for (const name of patch) assert.ok(minor.has(name), `${name} applies at patch but not at minor`);
  for (const name of minor) assert.ok(major.has(name), `${name} applies at minor but not at major`);
});

test("evidence is frontmatter data: every non-terminal row carries fields", () => {
  const m = readRigorMatrix(ROOT);
  for (const row of m.rows) {
    if (row.state_kind === "terminal") continue;
    assert.ok(row.evidence_form.length > 0, `${row.name} carries no evidence fields`);
    for (const f of row.evidence_form) {
      assert.ok(!f.description.includes("(killer)"), `${row.name}.${f.name} smuggles a killer mark in prose`);
      // THE KILLER FLAG IS GONE. It reached the author inside an HTML comment
      // the checker stripped before looking, so it never did anything, and
      // `required` already defaults true. The fields survive; the flag does not.
      assert.ok(!("killer" in f), `${row.name}.${f.name} still carries the deleted killer flag`);
    }
  }
  const kickoff = m.rows.find((r) => r.name === "gate-kickoff");
  assert.ok(kickoff?.evidence_form.some((f) => f.name === "retro_drained" && f.required !== false));
  assert.ok(kickoff?.evidence_form.some((f) => f.name === "change_size" && f.required));
});

test("a body evidence section is refused — the frontmatter block is the single truth", () => {
  const dir = mkdtempSync(join(tmpdir(), "se-matrix-"));
  try {
    mkdirSync(join(dir, "project", "deliverable", "machines", "rigor_matrix", "rows"), { recursive: true });
    mkdirSync(join(dir, "project", "deliverable", "machines", "rigor_matrix", "cells"), { recursive: true });
    writeFileSync(
      join(dir, "project", "deliverable", "machines", "rigor_matrix", "rows", "M0_10_echo.md"),
      "---\nkind: matrix-row\nname: echo\nstate_kind: work\nfilled_by: agent\ndepends_on: []\nevidence:\n  - name: proof\n---\n\n## Guidance\nNothing.\n\n## Evidence form\n\n- proof | twice | required\n",
    );
    assert.throws(() => readRigorMatrix(dir), /single truth/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a non-terminal row without evidence refuses — leaving a state demands evidence", () => {
  const dir = mkdtempSync(join(tmpdir(), "se-matrix-"));
  try {
    mkdirSync(join(dir, "project", "deliverable", "machines", "rigor_matrix", "rows"), { recursive: true });
    mkdirSync(join(dir, "project", "deliverable", "machines", "rigor_matrix", "cells"), { recursive: true });
    writeFileSync(
      join(dir, "project", "deliverable", "machines", "rigor_matrix", "rows", "M0_10_bare.md"),
      "---\nkind: matrix-row\nname: bare\nstate_kind: work\nfilled_by: agent\ndepends_on: []\n---\n\n## Guidance\nNothing.\n",
    );
    assert.throws(() => readRigorMatrix(dir), /carries no evidence/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("compileColumn: cell guidance rides the seeded state", () => {
  const m = readRigorMatrix(ROOT);
  const decl = compileColumn(m, "patch");
  const at = decl.states.find((s) => s.id === "author-tests");
  assert.ok(at?.guidance.includes("DELIVERY NEVER SHRINKS"), "the patch cell's tailoring is in the guidance");
  assert.ok(at?.guidance.includes("meth-test-first"), "the row's method links survive");
});
