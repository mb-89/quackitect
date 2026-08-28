// The rigor matrix: reader + column compiler (engine/rigor-matrix.ts).
// It is read LIVE from machines/rigor_matrix (seed-from-source law);
// compiling a change-size column yields a valid iteration machine with
// struck states contracted out of the dependency graph.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { validateMachine } from "../engine/machine.ts";
import { ALL_COLUMNS, CHANGE_COLUMNS, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";

const ROOT = join(import.meta.dirname, "..", "..");

// EVERY JOIN DECIDES ABOUT ITS BAR.
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
  // 52 since cut-criteria split off evaluate-set:
  // cutting an axis inside evaluate-set means cutting with the totals
  // already visible, which is the poisoning the weights-first order exists
  // to prevent, arriving one step later.
  // 54 since trace-design: the design trace's
  // mechanical half stands between build-steps and verification.
  // 53 since declare-winner: the selection is
  // recorded on its own state rather than implied by arithmetic.
  // 52 since the M9 cut: finalize-docs and
  // ship-review wait outside the matrix until the book and vendoring
  // mechanisms exist.
  // 53: M5_27 graft-onto-the-winner, added by i9 between
  // declare-winner and record-adrs.
  // 63 since spawn-the-hands: the roster row stands at position 05 of EVERY
  // milestone, M0 through M9, because the hands a phase needs differ per phase
  // and the rung comes from that milestone. Ten rows, one per milestone, is
  // what "once per milestone" costs the count.
  assert.equal(m.rows.length, 63);
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
    mkdirSync(join(dir, "deliverable", "machines", "rigor_matrix", "rows"), { recursive: true });
    mkdirSync(join(dir, "deliverable", "machines", "rigor_matrix", "cells"), { recursive: true });
    writeFileSync(
      join(dir, "deliverable", "machines", "rigor_matrix", "rows", "M0_10_lonely.md"),
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
  // 63 rows + the mechanical start. finalize-docs and ship-review are not in
  // the matrix until the book and vendoring mechanisms exist.
  assert.equal(decl.states.length, 64);
  // Only a state that RUNS a machine descends; authoring states do not.
  assert.ok(decl.states.some((s) => s.id === "build-steps" && s.submachine === "build-chunks"));
  assert.ok(decl.states.some((s) => s.id === "run-spikes" && s.submachine === "spikes"));
  assert.ok(decl.states.some((s) => s.id === "run-candidates" && s.submachine === "candidates"));
  assert.ok(decl.states.some((s) => s.id === "run-demos" && s.submachine === "demos"));
  // TWO KINDS OF SUBMACHINE, and enumerate-space is the first of the second
  // kind. build-chunks, spikes and candidates are SEEDED — their shape varies
  // per record, so the state above authors the drawing. `finders` is STATIC,
  // like boot: the same five searches every time, so the drawing is method
  // rather than content and lives in machines/enumerate-space.canvas.
  //
  // THE .canvas SUFFIX IS WHAT TELLS THEM APART. A
  // seeded name is looked for in the record; a file name is compiled from
  // machines/. Without the suffix the walk refused with "a run without
  // visible steps" and pointed at a file nobody was ever going to write.
  //
  // AND A DRAWN SUB-MACHINE TAKES ITS CANVAS'S NAME. Two names for one node
  // is what a reader hits when they click a state and land somewhere called
  // something else; the matrix refuses a row where they differ.
  assert.ok(decl.states.some((s) => s.id === "enumerate-space" && s.submachine === "enumerate-space.canvas"));
  assert.ok(
    decl.states.every(
      (s) => s.submachine === undefined || ["build-steps", "run-spikes", "run-candidates", "run-demos", "enumerate-space"].includes(s.id),
    ),
  );
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
  // Every iteration opens with the retro — patch included.
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
  // THE ROSTER ROW ABSORBS THE CONTRACTION. It stands at position 05 of every
  // milestone and is FLOOR, so it always survives — and the struck stretch
  // above it collapses onto IT rather than reaching past it. That is why this
  // set is one entry rather than the two the strike used to leave.
  assert.deepEqual(incoming("write-requirements"), ["spawn-for-requirements"]);
  // author-tests contracts through the whole struck M4-M6 stretch, onto its
  // own milestone's roster row.
  assert.deepEqual(incoming("author-tests"), ["spawn-for-implementation"]);
  // 29 applied rows + start. identify-assumptions applies at patch too: when a
  // patch exists BECAUSE something stopped holding, that is an assumption
  // turning into an issue, and it is the one case patch-size must record.
  // log-gaps left the matrix entirely: gaps ride
  // the gate's raid_additions, and run-demos does not apply at patch.
  // The roster row is FLOOR and never struck, so all ten copies apply here.
  assert.equal(decl.states.length, 30);
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
    const fix = decl.states.find((s) => s.id === "fix-findings");
    const rec = fix?.edges.find((e) => e.to === "verification");
    assert.equal(rec?.role, "recovery");
    // WHAT HOLDS THE REPAIR STATE, and it is the whole point of it existing.
    // fix-findings has no evidence form on purpose, so before 2026-08-18
    // nothing held it: entering it completed it and the walk fell straight
    // back out having repaired nothing. The confirm run is the hold — a red
    // battery leaves the exit unmet and the walk stays here with its write
    // verbs.
    assert.ok(fix?.exit?.script, `${col}: fix-findings has nothing holding it, so it cannot repair anything`);
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

// WHAT A MINOR IS, decided step by step with the owner on 2026-08-13 after
// the first real minor iteration walked it and found the shape too heavy.
//
// THE RULE BEHIND THE LIST: a step whose only honest answer at this size is
// "unchanged" is struck, not kept. Keeping it taught skimming, and skimming is
// what makes every other question cheaper to skip too. Where a step would
// genuinely change something, its own note now says what promotes the
// iteration instead.
test("compileColumn minor: exploration, architecture and prototyping are all struck", () => {
  const m = readRigorMatrix(ROOT);
  const decl = compileColumn(m, "minor");
  validateMachine(decl);
  const ids = new Set(decl.states.map((s) => s.id));
  for (const struck of [
    // M1-M2: the frame and the inputs that cannot move without escalating.
    "pressure-test",
    "define-actual",
    "draw-context",
    "map-stakeholders",
    "gate-inputs",
    // M4: the whole candidate exploration.
    "derive-criteria",
    "partition-functions",
    "enumerate-space",
    "evaluate-set",
    "gate-candidates",
    // M5: everything but decompose-structure, which allocates into what stands.
    "converge-pugh",
    "declare-winner",
    "reverse-sensitivity",
    "record-adrs",
    "evaluate-architecture",
    "gate-architecture",
    // M6: whole. Needing a spike is the tell that this is a major.
    "rank-unknowns",
    "run-spikes",
    "fold-back",
    "gate-prototype",
    // M8: the package state already ends with a person using the artifact.
    "run-demos",
  ]) {
    assert.ok(!ids.has(struck), `minor should strike ${struck}`);
  }
  // WHAT MUST SURVIVE, named so a future strike cannot take them quietly.
  for (const kept of ["write-requirements", "gate-requirements", "decompose-structure", "fill-story-evidence", "gate-validation"]) {
    assert.ok(ids.has(kept), `minor must keep ${kept}`);
  }
  // 38 applied rows, plus start and end. The roster row is FLOOR, so all ten
  // of its milestone copies survive every strike.
  assert.equal(decl.states.length, 40);
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
    // A GATE MAY CARRY NONE. The compiler gives it
    // the four standard rounds, and those are evidence. A gate whose own
    // fields all reduced to mechanical checks SHOULD end up empty — a field
    // that can only ever say yes teaches the reader to skim, and then the
    // fields that could have said no get skimmed with it.
    //
    // A SUB-MACHINE STATE MUST CARRY NONE, for the
    // opposite reason: its evidence lives one level down, in the sub-machine's
    // own states. Four rows carried a field here that nothing could ever
    // serve, because the walk descends past this state and completes it on
    // the way out.
    // A FALLBACK STATE MAY CARRY NONE: its proof
    // is the state it recovers re-passing. fix-findings' findings are the
    // red verifications, generated — a form here would re-ask what the
    // confirm run answers.
    // A LAW-PROVEN STATE MAY CARRY NONE:
    // fill-story-evidence's claim is computed — every slide's evidence half
    // non-empty — and a field here would re-ask what the law answers.
    if (row.state_kind !== "gate" && row.runs === undefined && row.edge_role !== "fallback" && row.name !== "fill-story-evidence") {
      assert.ok(row.evidence_form.length > 0, `${row.name} carries no evidence fields`);
    }
    if (row.runs !== undefined)
      assert.equal(row.evidence_form.length, 0, `${row.name} runs a sub-machine, so its own form is never served`);
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

test("no matrix row's frontmatter carries a literal escape where a newline belonged", () => {
  // TEN ROWS WERE CORRUPTED THIS WAY AND NOTHING NAMED IT. One write folded a
  // frontmatter block onto a single line with literal backslash-n between the
  // keys. In five rows the escaped run swallowed the `evidence:` key itself, so
  // its fields parsed as more legal_tools entries — and the kickoff gate, whose
  // whole job is to set the change size, could no longer ask for one. Its only
  // visible symptom was `[object Object]` inside a refusal message.
  //
  // THE RULE IS ABOUT UNQUOTED SCALARS. YAML gives the escape a meaning inside
  // a double-quoted value and none at all outside one, so an escape on a line
  // carrying no quote is always the corruption and never the author.
  const dir = join(ROOT, "deliverable", "machines", "rigor_matrix", "rows");
  const bad: string[] = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const text = readFileSync(join(dir, file), "utf8");
    if (!text.startsWith("---")) continue;
    const end = text.indexOf("\n---", 3);
    if (end < 0) continue;
    text
      .slice(4, end)
      .split("\n")
      .forEach((line, i) => {
        if (line.includes("\\n") && !line.includes('"')) bad.push(`${file}:${i + 2} ${line.slice(0, 80)}`);
      });
  }
  assert.deepEqual(bad, [], `a literal escape stands in matrix-row frontmatter where a newline belonged:\n${bad.join("\n")}`);
});

test("a body evidence section is refused — the frontmatter block is the single truth", () => {
  const dir = mkdtempSync(join(tmpdir(), "se-matrix-"));
  try {
    mkdirSync(join(dir, "deliverable", "machines", "rigor_matrix", "rows"), { recursive: true });
    mkdirSync(join(dir, "deliverable", "machines", "rigor_matrix", "cells"), { recursive: true });
    writeFileSync(
      join(dir, "deliverable", "machines", "rigor_matrix", "rows", "M0_10_echo.md"),
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
    mkdirSync(join(dir, "deliverable", "machines", "rigor_matrix", "rows"), { recursive: true });
    mkdirSync(join(dir, "deliverable", "machines", "rigor_matrix", "cells"), { recursive: true });
    writeFileSync(
      join(dir, "deliverable", "machines", "rigor_matrix", "rows", "M0_10_bare.md"),
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
