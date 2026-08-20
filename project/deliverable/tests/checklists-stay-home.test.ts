// A CHECKLIST BELONGS TO THE ITERATION THAT IS WALKING IT.
//
// `$claim-specs` resolved every non-test spec in the project, with no owner.
// observe-red asks whether every NEW check failed before the build; handed
// twenty-one specs, twenty of them other iterations', the only way to satisfy
// it is to tick boxes for reds nobody observed.
//
// The same shape already bit `$promotions` and was already fixed —
// tests/promotions-stay-home.test.ts pins that one. This resolver sits one
// function above it in the same file and was left unscoped.
//
// WHAT SETTLES IT is that the state disagreed with itself: red-observed.ts
// filters test specs by minted_in, and the form half filtered nothing.
// see dsp-evidence-forms.md#a-checklist-over-the-whole-corpus-asks-for-a-lie
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const STATEFORM = fileURLToPath(new URL("../engine/stateform.ts", import.meta.url));
const RED_OBSERVED = fileURLToPath(new URL("../engine/bin/red-observed.ts", import.meta.url));

describe("a checklist stays in its own iteration", { concurrency: true }, () => {
  test("the claim-specs filter matches on the owning record, not just on method", () => {
    const src = readFileSync(STATEFORM, "utf8");
    const at = src.indexOf("function claimSpecItems(");
    assert.ok(at > 0, "the filter exists");
    const body = src.slice(at, at + 700);

    assert.match(body, /minted_in/, "it reads the spec's owner");
    assert.match(body, /basename\(/, "and compares it to the record being walked");
    assert.ok(
      body.indexOf("minted_in") > body.indexOf('"test"'),
      "the owner check comes after the method check, so a test-method spec is still dropped first",
    );
  });

  test("the source is given the evidence directory, or it cannot know the owner", () => {
    const src = readFileSync(STATEFORM, "utf8");
    assert.match(
      src,
      /\$claim-specs"\) return claimSpecItems\(traceRoot, evidenceDir\)/,
      "the call site passes the record's own folder through",
    );
  });

  test("both halves of observe-red scope to the same record", () => {
    // The form half asks a person about the non-test specs; the engine half
    // runs the test-method ones. Disagreeing about WHOSE is the defect.
    assert.match(readFileSync(RED_OBSERVED, "utf8"), /minted_in/, "the engine half filters by owner");
    assert.match(
      readFileSync(STATEFORM, "utf8").slice(readFileSync(STATEFORM, "utf8").indexOf("function claimSpecItems(")),
      /minted_in/,
      "and so does the form half",
    );
  });
});
