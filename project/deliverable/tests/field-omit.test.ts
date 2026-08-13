// "KEEP THE STEP, ASK LESS AT THIS SIZE" HAD NO MECHANICAL FORM.
//
// A rigor cell could do exactly two things: keep a state or strike it, and
// swap its guidance prose. The fields hung off the row, one set shared by all
// four sizes. So a note that said "tailored - keep it brief" was asking the
// agent to decide how much to write, freshly, every time.
//
// The owner ruled on 2026-08-13 that the trim must be mechanical: marked in
// the row, applied by the engine, not judged by whoever is walking.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import type { EvidenceField, StateDecl } from "../engine/machine.ts";
import { type ChangeColumn, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const ROWS = fileURLToPath(new URL("../machines/rigor_matrix/rows/", import.meta.url));

/** The named state's field names, as the column actually serves them. */
function fieldsAt(column: ChangeColumn, state: string): string[] {
  const decl = compileColumn(readRigorMatrix(ROOT), column);
  const s = decl.states.find((x: StateDecl) => x.id === state);
  assert.ok(s !== undefined, `${state} is struck at ${column} — this test wants it standing`);
  return s.evidence_form.map((f: EvidenceField) => f.name);
}

describe("a field omitted at a change size", { concurrency: true }, () => {
  // THE CASE THE OWNER ASKED FOR. frame-delta's note has said for weeks that
  // the gap claim and the why-now are inherited at minor. The form asked for
  // them anyway, and the note asked the agent to be brief instead.
  test("frame-delta stops asking the inherited half at minor, and still asks it at major", () => {
    const minor = fieldsAt("minor", "frame-delta");
    assert.ok(!minor.includes("gap_claim"), `gap_claim is still asked at minor: ${minor.join(", ")}`);
    assert.ok(!minor.includes("why_now"), `why_now is still asked at minor: ${minor.join(", ")}`);
    assert.ok(minor.includes("value_props"), "the delta's own value props are the point of the state, at every size");

    const major = fieldsAt("major", "frame-delta");
    assert.ok(major.includes("gap_claim"), "a major re-argues the gap");
    assert.ok(major.includes("why_now"), "and the why-now with it");
  });

  // THE SECOND USER, and the one that proves the trim is per-field rather
  // than per-state: three of four questions go, one stays.
  test("draft-vision keeps only the goal system at minor", () => {
    assert.deepEqual(fieldsAt("minor", "draft-vision"), ["goal_system"]);
    assert.equal(fieldsAt("product", "draft-vision").length, 4, "a product authors the whole packet");
  });

  // ABSENT MEANS ASKED EVERYWHERE. The safe direction for a key nobody wrote
  // is to ask too much — a typo must never delete a question silently.
  test("a field with no omit is asked at every size", () => {
    for (const c of ["patch", "minor", "major", "product"] as const) {
      const decl = compileColumn(readRigorMatrix(ROOT), c);
      const s = decl.states.find((x: StateDecl) => x.id === "write-requirements");
      if (s === undefined) continue; // struck at this size, which is its own answer
      assert.ok(
        s.evidence_form.some((f: EvidenceField) => f.name === "register"),
        `write-requirements lost its register at ${c} — no row omits it`,
      );
    }
  });

  // THE WHOLE-MATRIX VIEW IS NOT A COLUMN. Somebody reading the matrix wants
  // every question a row can ask; only a compiled size drops any.
  test("the matrix view still shows an omitted field", () => {
    const raw = readFileSync(`${ROWS}M1_30_frame-delta.md`, "utf8");
    assert.match(raw, /name: gap_claim/, "the row still declares it");
    assert.match(raw, /omit:\n\s+- minor/, "and marks where it is not asked");
  });

  // EVERY omit IS A REAL SIZE. An unknown one never matches, so the field is
  // asked everywhere while its author believes it is not.
  test("every omit in the matrix names a real change size", () => {
    const sizes = new Set(["patch", "minor", "major", "product"]);
    for (const f of readdirSync(ROWS).filter((n) => n.endsWith(".md"))) {
      const text = readFileSync(ROWS + f, "utf8");
      // INDENTATION IS THE FENCE. \s spans newlines, so a looser pattern ran
      // past the end of the list and swallowed the next field's `- name:` —
      // then complained that "name:" is not a change size. The items must be
      // indented DEEPER than the key that owns them, and nothing else counts.
      for (const block of text.matchAll(/^([ \t]+)omit:\n((?:\1[ \t]+-[ \t].*\n)+)/gm)) {
        for (const line of block[2].split("\n")) {
          const named = /^[ \t]+-[ \t]+(\S+)/.exec(line)?.[1];
          if (named !== undefined) assert.ok(sizes.has(named), `${f} omits "${named}", which is not a change size`);
        }
      }
    }
  });
});
