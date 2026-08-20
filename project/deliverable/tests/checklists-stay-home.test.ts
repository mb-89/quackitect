// BOTH HALVES OF A STATE ASK ABOUT THE SAME RECORD.
//
// observe-red asks whether every NEW check failed before the build. It has two
// halves and they disagreed about whose checks they meant.
//
// THE ENGINE HALF was scoped all along: red-observed.ts reads each test spec's
// minted_in and skips every one that is not the record standing there.
//
// THE FORM HALF was not. `$claim-specs` resolved every non-test spec in the
// project, so i37 was handed twenty-one boxes, twenty of them other
// iterations. The only way to tick those is to assert a red nobody observed.
//
// The same shape bit `$promotions` first — tests/promotions-stay-home.test.ts
// pins that one — and trunk generalised the fix into scopedToOwner with an
// `:all` opt-out. What this file pins is the AGREEMENT: one state, one answer
// about whose specs it is asking about.
// see dsp-evidence-forms.md#a-checklist-over-the-whole-corpus-asks-for-a-lie
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const STATEFORM = fileURLToPath(new URL("../engine/stateform.ts", import.meta.url));
const RED_OBSERVED = fileURLToPath(new URL("../engine/bin/red-observed.ts", import.meta.url));

/** The body of a named function, far enough to cover its filters. */
function bodyOf(src: string, decl: string): string {
  const at = src.indexOf(decl);
  assert.ok(at > 0, `${decl} exists`);
  return src.slice(at, at + 900);
}

describe("a checklist stays in its own iteration", { concurrency: true }, () => {
  test("the claim-specs source scopes to the record that owns the walk", () => {
    const body = bodyOf(readFileSync(STATEFORM, "utf8"), "function claimSpecItems(");
    assert.match(body, /scopedToOwner\(/, "it goes through the shared owner filter");
    assert.match(body, /minted_in/, "and the thing it matches on is the spec's owner");
  });

  test("the call site hands the source the owner, or it cannot scope", () => {
    // A resolver that scopes but is never told who is walking scopes to nothing.
    assert.match(
      readFileSync(STATEFORM, "utf8"),
      /claim-specs"\) return claimSpecItems\(traceRoot, owner/,
      "the owner reaches the resolver",
    );
  });

  test("both halves of observe-red scope to the same record", () => {
    // THIS is the case that was actually wrong: one state, two halves, opposite
    // answers. Either half drifting back to the whole corpus fails here.
    assert.match(readFileSync(RED_OBSERVED, "utf8"), /minted_in/, "the engine half filters by owner");
    assert.match(bodyOf(readFileSync(STATEFORM, "utf8"), "function claimSpecItems("), /minted_in/, "and so does the form half");
  });
});
