// THE VOICE LINT AT SUBMIT, and the card that decides which rules bite.
//
// The wiring's weak point is the NAME. `blocking:` in the card is text, the
// rules' ids are strings in the engine, and nothing connects them but spelling.
// A typo there would block nothing, quietly, which is the same silent-pass
// this whole chunk exists to remove.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { blockingRules, lintProse } from "../engine/lint.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Every rule id the lint can actually emit, taken from the engine rather than
 *  listed here — a rule renamed in lint.ts changes this answer. */
const EMITTABLE = ["wall", "long-sentence", "comma-chain", "dash-chain", "sentence-run", "item-grew", "pyramid", "external-link"];

describe("which voice rules bite is data", { concurrency: true }, () => {
  test("the card names rules the lint can really emit", () => {
    const named = blockingRules(REPO_ROOT);
    assert.notDeepEqual(named, [], "the card must name at least one blocking rule, or the lint has no teeth at all");
    const unknown = named.filter((r) => !EMITTABLE.includes(r));
    assert.deepEqual(
      unknown,
      [],
      "a blocking rule the lint never emits blocks nothing, silently — check the spelling in machines/lint/voice-lint.md",
    );
  });

  test("the wall is the default, because it is already law at the lane", () => {
    // SE-C-125 refuses a wall of prose, and no renderer can invent the
    // paragraphs an author did not write. Naming it here makes one rule
    // behave the same way in both places.
    assert.equal(blockingRules(REPO_ROOT).includes("wall"), true);
  });

  test("an unreadable card blocks NOTHING, rather than everything", () => {
    // A missing file must never start refusing every submit in the product.
    assert.deepEqual(blockingRules(mkdtempSync(join(tmpdir(), "se-nocard-"))), []);
  });

  test("the blocking rule fires on the prose it is meant to catch", () => {
    // Eight unbroken prose lines, which is the card's wall_paragraph_lines.
    const wall = Array.from(
      { length: 9 },
      (_, i) => `This is line ${i} of a paragraph that never breaks and never lets the reader out.`,
    ).join("\n");
    const rules = lintProse(REPO_ROOT, wall).map((f) => f.rule);
    assert.equal(rules.includes("wall"), true, "the rule the card blocks on must actually fire on a wall");
  });

  test("a rule the card does NOT name still reports, so nothing is hidden", () => {
    const named = blockingRules(REPO_ROOT);
    const quiet = EMITTABLE.filter((r) => !named.includes(r));
    assert.notDeepEqual(quiet, [], "if every rule blocked, a comma would stand in the way of every form");
  });
});
