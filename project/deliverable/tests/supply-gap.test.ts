// i6's supply demand: a state declares what may be called and what must be
// produced, and nothing checked that the two agreed.
//
// LIVED: observe-red's whole job is watching new checks fail, and its legal
// tools were the file verbs and se_run. It could not call the test verb, so the
// agent reached for the shell.
//
// MEASURED 2026-08-16, first run of this check over the live matrix: 29
// state/field pairs across four columns, every one a gate asked to name the
// register entries its own review added, with no verb that can mint one.
//
// req-no-state-demands-what-it-cannot-supply
import { strict as assert } from "node:assert";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { EvidenceField, MachineDecl, StateDecl } from "../engine/machine.ts";
import { assertCanSupply, supplyGaps } from "../engine/machines/supply.ts";

/** THE REPOSITORY ROOT, from this file rather than the working directory. The
 *  battery runs under npm --prefix, so cwd is not where the corpus is. This
 *  file sits at <root>/project/deliverable/tests/. */
function gitRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
}

function state(id: string, legal: string[] | undefined, fields: EvidenceField[]): StateDecl {
  return {
    id,
    kind: "work",
    statement: "",
    guidance: "",
    evidence_form: fields,
    priority: 0.2,
    edges: [],
    legal_tools: legal,
  } as StateDecl;
}

function machine(...states: StateDecl[]): MachineDecl {
  return { id: "fixture", reentry: "resume", initial: states[0].id, states } as MachineDecl;
}

const REFS: EvidenceField = { name: "raid_additions", description: "", required: true, template: "refs" };
const PROSE: EvidenceField = { name: "built", description: "", required: true, template: "free-form" };

test("a state asked for standing nodes with no write verb is a gap", () => {
  const root = gitRoot();
  const gaps = supplyGaps(root, machine(state("gate", ["se_file_read", "se_log_query"], [REFS])));
  assert.equal(gaps.length, 1, `one gap: ${JSON.stringify(gaps)}`);
  assert.equal(gaps[0].field, "raid_additions");
  assert.deepEqual(gaps[0].wants, ["se_file_write", "se_file_patch"], "either verb closes it");
});

test("the same state with a write verb is no gap", () => {
  const root = gitRoot();
  const gaps = supplyGaps(root, machine(state("gate", ["se_file_read", "se_file_write"], [REFS])));
  assert.deepEqual(gaps, [], "it can mint what it is asked to name");
});

test("a free-form field demands nothing a tool has to make", () => {
  const root = gitRoot();
  const gaps = supplyGaps(root, machine(state("work", ["se_file_read"], [PROSE])));
  assert.deepEqual(gaps, [], "prose is answered by filling the form");
});

// `all` IS THE WHOLE LANE, carried as the literal word rather than expanded to
// every verb. Reading it as a tool name would make every open state a gap.
test("a state granting all can never have a gap", () => {
  const root = gitRoot();
  const gaps = supplyGaps(root, machine(state("open", ["all"], [REFS])));
  assert.deepEqual(gaps, [], "the whole lane includes the write verbs");
});

// DERIVED FIELDS ARE THE ENGINE'S. It computes them and refuses a hand-written
// value, so demanding a verb for one would refuse a correct machine —
// verification is exactly that state, and it grants no test verb on purpose.
test("a derived field is not the state's to supply", () => {
  const root = gitRoot();
  const derived: EvidenceField = { name: "battery", description: "", required: true, type: "derived", template: "refs" };
  const gaps = supplyGaps(root, machine(state("verification", ["se_file_read"], [derived])));
  assert.deepEqual(gaps, [], "the engine fills it");
});

test("an optional field is not demanded, so it cannot be a gap", () => {
  const root = gitRoot();
  const optional: EvidenceField = { ...REFS, required: false };
  const gaps = supplyGaps(root, machine(state("gate", ["se_file_read"], [optional])));
  assert.deepEqual(gaps, [], "nothing is owed");
});

test("a run reference wants a verb that can run something", () => {
  const root = gitRoot();
  const runRef: EvidenceField = { name: "evidence_run", description: "", required: true, type: "run_ref" };
  const gaps = supplyGaps(root, machine(state("observe-red", ["se_file_read", "se_file_write"], [runRef])));
  assert.equal(gaps.length, 1, `a write verb does not make a run: ${JSON.stringify(gaps)}`);
  assert.deepEqual(gaps[0].wants, ["se_run", "se_test"]);
});

test("the refusal names the state, the field and the verbs", () => {
  const root = gitRoot();
  const m = machine(state("gate", ["se_file_read"], [REFS]));
  assert.throws(
    () => {
      assertCanSupply(root, m);
    },
    (e: Error) => {
      assert.match(e.message, /gate/, "the state");
      assert.match(e.message, /raid_additions/, "the field");
      assert.match(e.message, /se_file_write/, "a verb that would close it");
      return true;
    },
  );
});

// THE LIVE MACHINES HOLD, and this is the case that would have caught the 29.
// It is deliberately not a fixture: a rule this shape is only worth having if
// it is run against the real corpus.
test("every live machine supplies what it demands", async () => {
  const root = gitRoot();
  const { CHANGE_COLUMNS, compileColumn, compileM0, readRigorMatrix } = await import("../engine/rigor-matrix.ts");
  const matrix = readRigorMatrix(root);
  for (const column of CHANGE_COLUMNS) {
    const gaps = supplyGaps(root, compileColumn(matrix, column));
    assert.deepEqual(gaps, [], `${column} has gaps: ${JSON.stringify(gaps, null, 2)}`);
  }
  assert.deepEqual(supplyGaps(root, compileM0(matrix, "probe")), [], "M0 has gaps");
});
