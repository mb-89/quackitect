// A REMEDY THAT CANNOT BE FOLLOWED IS A DIAGNOSIS.
//
// A state is not left while it holds open work. Where the only thing holding it
// is PERSON-ONLY, an agent cannot settle it — the store refuses that on sight.
// Offering `se_work {act: "settle"}` there hands the walk a call it may not
// make, and the walk then has no way forward at all.
//
// see guidance/refusals.md § SE-C-150
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const src = (): string => readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");

const body = (): string => /private heldRemedy\([\s\S]*?\n {2}\}/.exec(src())?.[0] ?? "";

describe("what holds a position shut names a remedy somebody can follow", { concurrency: true }, () => {
  test("one function shapes the remedy, and every hold uses it", () => {
    assert.notEqual(body(), "", "the remedy stands on the session");
    // FOUR HOLDS NOW. The gate's thumb joined them: a record's open work
    // refuses the bless, and a refusal without a followable remedy is a
    // diagnosis, which is the whole subject of this file.
    const uses = (src().match(/remedy: this\.heldRemedy\(/g) ?? []).length;
    assert.equal(uses, 4, `the transition, the machine, the signature and the gate all ask it — found ${uses}`);
  });

  test("an item an agent may settle gets the settle call", () => {
    assert.match(
      body(),
      /open\.find\(\(i\) => !i\.person_only && !isDrawn\(i\.id\)\)/,
      "the agent's own work is preferred, whatever order the list came in",
    );
    assert.match(body(), /act: "settle"/, "and the remedy is the call that clears it");
  });

  // A DRAWN PIECE HAS NO FILE, so a settle would name a call the store refuses
  // on sight — a diagnosis wearing a remedy's clothes.
  test("a drawn piece names the verb that ends its source, never a settle", () => {
    const b = body();
    const tail = b.slice(b.indexOf("const derived"));
    assert.notEqual(tail, "", "the drawn branch stands");
    assert.doesNotMatch(tail, /act: "settle"/, "nothing offers a settle for a piece with no file");
    assert.match(tail, /drawnEndsWith\(derived\.id\)/, "the verb comes from the one decider");
    assert.match(tail, /derived\.statement/, "and the reader is told which one");
  });

  // WAITING ON A PERSON IS A SANCTIONED STOP. Saying so is what lets the walk
  // end the turn honestly instead of looping on a refusal it cannot clear.
  test("work only a person may settle names the person, not a call the agent is refused", () => {
    const b = body();
    const tail = b.slice(b.indexOf("const theirs"));
    assert.notEqual(tail, "", "the person-only branch stands");
    assert.doesNotMatch(tail, /act: "settle"/, "an agent settling a person-only item is refused on sight");
    assert.match(tail, /person's to settle/, "the refusal says whose it is");
    assert.match(tail, /stop/, "and that waiting on them is the way out");
  });

  test("the statement is quoted back, so the reader knows which one", () => {
    assert.match(body(), /theirs\?\.statement/, "an id does not travel; the words do");
  });
});
