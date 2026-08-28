// EVERY GATE CARRIES THE FOUR REVIEW ROUNDS, and exactly once.
//
// The rounds are doctrine in meth-review-rounds and meth-gate-review, and the
// COMPILER adds them so that no row author can forget one. That was the whole
// point of moving them into code: v2 recorded that the rounds had been required
// since meth-gate-review was written, that no evidence form ever collected
// them, and that consequently NOT ONE was filled in any gate of any iteration.
//
// v3 inherited the fix and then lost it to a fork in the road. STANDARD_ROUNDS
// lived in machines/compile.ts and was appended by stateFromNote, which serves
// the CANVAS path. The ten gates a real iteration walks are built by
// compileColumn in rigor-matrix.ts, which copied row.evidence_form straight
// through. So the rounds reached zero gates, and nothing anywhere noticed —
// there was no test naming STANDARD_ROUNDS or any round at all.
//
// The mirror image is just as bad and is checked here too: session.ts scaffolds
// one heading per evidence_form field and once carried a SECOND hard-coded
// REVIEW_TAIL, which would have produced seven round sections, three of them
// the same round under a shorter name, every one required non-empty.
//
// So this file pins both directions at once — present, and present ONCE — for
// every change size, because a size column strikes rows and a striking bug
// would show up in one column and not another.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { STANDARD_ROUNDS } from "../engine/machine.ts";
import { CHANGE_COLUMNS, type ChangeColumn, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const ROUND_NAMES = STANDARD_ROUNDS.map((f) => f.name);

function gatesOf(column: ChangeColumn) {
  return compileColumn(readRigorMatrix(REPO), column).states.filter((s) => s.kind === "gate");
}

describe("the standard review rounds", () => {
  test("the four rounds are the ones the doctrine names", () => {
    // raid_additions sits between the last round and the verdict: a review is
    // when a risk or assumption is most visible and least likely to be
    // recorded.
    assert.deepEqual(ROUND_NAMES, [
      "round_0_verify",
      "round_1_validate",
      "goals_served",
      "bound_breaches",
      "round_2_red_team",
      "raid_additions",
      "verdict",
    ]);
    for (const f of STANDARD_ROUNDS) {
      assert.equal(f.required, true, `${f.name} must be required — an optional round is a round that never happens`);
      assert.ok(f.description.trim().length > 40, `${f.name} needs a description that tells the filler what to do`);
    }
  });

  for (const column of CHANGE_COLUMNS) {
    describe(`at ${column}`, () => {
      test("every gate carries all four rounds", () => {
        const gates = gatesOf(column);
        assert.ok(gates.length > 0, `${column} compiled no gates at all`);
        for (const g of gates) {
          const names = g.evidence_form.map((f) => f.name);
          for (const r of ROUND_NAMES) {
            // KICKOFF DEFINES the goals, so no prior step can serve them.
            // Motivation still checks the completed vision, frame, scope and
            // risk steps. roundsFor holds the sole kickoff exemption.
            if (r === "goals_served" && g.id === "gate-kickoff") continue;
            assert.ok(names.includes(r), `${column}/${g.id} is missing ${r} — the compiler must add it, not the row author`);
          }
        }
      });

      test("no gate carries a round twice", () => {
        for (const g of gatesOf(column)) {
          const names = g.evidence_form.map((f) => f.name);
          assert.equal(new Set(names).size, names.length, `${column}/${g.id} repeats a field name: ${names.join(", ")}`);
        }
      });

      test("a gate that declares acceptance items keeps them alongside the rounds", () => {
        // THE GUARD IS AGAINST LOSS, never against emptiness. Adding the
        // rounds once overwrote a gate's own fields instead of joining them,
        // and this is what caught it.
        //
        // AN EMPTY GATE IS LEGAL NOW. A gate whose
        // fields all reduced to mechanical checks SHOULD carry none, because
        // re-asking a check that can only pass is what teaches a reader to
        // skim. gate-requirements is the first to get there.
        //
        // So the property is read from the ROW, which is the authored truth,
        // and compared against what the compiled state carries.
        const rows = readRigorMatrix(REPO).rows;
        let checked = 0;
        for (const g of gatesOf(column)) {
          const authored = rows.find((r) => r.name === g.id)?.evidence_form ?? [];
          if (authored.length === 0) continue;
          checked++;
          const own = g.evidence_form.filter((f) => !ROUND_NAMES.includes(f.name));
          assert.equal(own.length, authored.length, `${column}/${g.id} lost its own acceptance items when the rounds were added`);
        }
        assert.ok(checked > 0, `${column} has no gate with authored items — this guard would be checking nothing`);
      });

      test("no work row is given the rounds", () => {
        // The rounds belong to gates. A work row that acquired them would be
        // asking its filler to review a milestone that has not happened yet.
        const others = compileColumn(readRigorMatrix(REPO), column).states.filter((s) => s.kind !== "gate");
        for (const s of others) {
          for (const f of s.evidence_form) {
            assert.ok(!ROUND_NAMES.includes(f.name), `${column}/${s.id} is not a gate but carries ${f.name}`);
          }
        }
      });
    });
  }

  test("the rounds live in one place, so both compilers see the same four", () => {
    // machine.ts is schema with no imports, which is why it can hold a constant
    // that rigor-matrix.ts and machines/compile.ts both need. A second literal
    // definition anywhere is the bug this whole file exists for.
    const compile = readFileSync(new URL("../engine/machines/compile.ts", import.meta.url), "utf8");
    assert.ok(
      !/const STANDARD_ROUNDS\s*:/.test(compile),
      "machines/compile.ts defines its own STANDARD_ROUNDS again — one copy per compiler is how the rounds reached zero gates",
    );
  });

  test("the gate report scaffold does not add a second set of rounds", () => {
    // session.ts writes one `## name` per evidence_form field. Any hard-coded
    // list of review sections beside that is a duplicate by construction.
    // Match the DECLARATION, not the word — session.ts names REVIEW_TAIL in a
    // comment explaining why it is gone, and that comment is worth keeping.
    const session = readFileSync(new URL("../engine/session.ts", import.meta.url), "utf8");
    assert.ok(
      !/(?:const|let|var)\s+REVIEW_TAIL\b/.test(session),
      "session.ts declares a second hard-coded round list beside evidence_form",
    );
  });
});
