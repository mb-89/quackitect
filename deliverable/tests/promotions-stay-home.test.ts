// A PROMOTION BELONGS TO THE ITERATION THAT RAN THE SPIKE.
//
// Owner ruling 2026-08-13: a promotion is a spike aimed at a later step of the
// SAME record. It has no business outliving it — exactly like the spike, which
// does not travel either.
//
// WHAT WENT WRONG. The filter returned every promoted experiment in the
// project, with no owner and no expiry. i2 promoted a batch reader and named
// the chunk it should enter as. Months later i3's build form still demanded
// it, and i4's and i5's would have too.
//
// i3 could satisfy it in exactly one way: copy a chunk into its build plan for
// work another record had already done. The engine was asking for a lie and
// accepting one.
//
// THE OWNER FOUND IT BY ASKING WHY, not by a check going red. Nothing here
// could have caught it, because nothing knew who owned a promotion.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const EXPERIMENTS = fileURLToPath(new URL("../../spec/trace/experiment/", import.meta.url));
const STATEFORM = fileURLToPath(new URL("../engine/stateform.ts", import.meta.url));

/** Every experiment node, as its frontmatter lines. */
function experiments(): { file: string; text: string }[] {
  return readdirSync(EXPERIMENTS)
    .filter((n) => n.endsWith(".md"))
    .map((file) => ({ file, text: readFileSync(EXPERIMENTS + file, "utf8") }));
}

describe("a promotion stays in its own iteration", { concurrency: true }, () => {
  // THE DATA HALF. A promotion with no owner is one the filter cannot scope,
  // so it silently reverts to travelling.
  test("every experiment records the iteration that made it", () => {
    const all = experiments();
    assert.ok(all.length > 0, "there are experiments to check, or this proves nothing");
    for (const { file, text } of all) {
      assert.match(text, /^minted_in: \S+/m, `${file} does not say which iteration made it, so its promotion cannot be scoped`);
    }
  });

  // THE ENGINE HALF. The filter must ask the owner, not merely whether the
  // experiment was promoted at all.
  //
  // basename(traceRoot) IS GONE (raid-debt-delta-default-views). Under the
  // one-tree-one-path ADR, traceRoot resolves to the project root (or an
  // iteration's own path, which IS the project root in the current single-
  // tree layout) — never to a per-iteration directory whose basename is the
  // iteration id. So the comparison this test used to pin never actually
  // matched anything real; it happened to look right because nothing
  // exercised it against a genuine second record. The fix threads the real
  // owner in from the bound evidence folder instead (see boundOwner and
  // node-scoping.test.ts's "the delta-default view", which proves the match
  // against two records where this one only proved the shape of the code).
  test("the promotions filter matches on the owning record, not just on promote", () => {
    const src = readFileSync(STATEFORM, "utf8");
    const at = src.indexOf("function promotionItems(");
    assert.ok(at > 0, "the filter exists");
    const body = src.slice(at, at + 700);

    assert.match(body, /minted_in/, "it reads the experiment's owner");
    assert.match(body, /===\s*owner/, "and compares it to the bound record's own id");

    // The old rule was `promote` non-empty and not "none", and nothing else.
    // Keeping that alone is what let a promotion outlive its record.
    assert.ok(
      body.indexOf("minted_in") > body.indexOf("promote"),
      "the owner check comes after the promote check, so an unpromoted experiment is still dropped first",
    );
  });

  // THE CASE THAT BIT, pinned by name so a future edit cannot quietly restore
  // it. An earlier record promoted this; i3 must never be asked for it.
  //
  // ITS OWNER IS i1, AND THE FILE SAID SO ALL ALONG. I read a git log, inferred
  // i2, and stamped a second minted_in onto a node that already carried one —
  // giving it two, which is not valid YAML and which the battery caught. The
  // node's own record beats an inference about it every time.
  test("the promoted batch reader carries exactly one owner, and it is not i3", () => {
    const text = readFileSync(`${EXPERIMENTS}exp-trunk-read-cost.md`, "utf8");
    const owners = [...text.matchAll(/^minted_in: (\S+)/gm)].map((m) => m[1]);
    assert.equal(owners.length, 1, `one owner, not ${owners.length}: ${owners.join(", ")}`);
    assert.ok(!owners[0].startsWith("i3-"), "it belongs to an earlier record, which is the whole point");
    assert.match(text, /^promote: /m, "and it really is a promotion, or this case is about nothing");
  });
});
