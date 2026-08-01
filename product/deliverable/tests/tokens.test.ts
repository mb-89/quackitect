// THE TOKEN SET, AND THE DAY IT STOPS BEING THEORETICAL.
//
// The kernel has carried concurrent states since it was harvested:
// machine.ts:89 declares the token set as "every concurrently active state",
// and joins re-arm on a reopen (machine.ts:199-205). The packet's `active` is
// a LIST, not a state.
//
// No shipped machine uses a join today, so nothing renders wrongly. But three
// places in the renderer take `active[0]` and call it the position. The day
// somebody draws a fork, those three will show one state out of several and
// look completely normal doing it.
//
// That is the failure this file exists to make loud. It does NOT demand a
// multi-token design — the owner owns visual design, and no sketch exists for
// what a header should say when the walk stands in three places. It demands
// that the question be ASKED before the wrong answer ships.
import { strict as assert } from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const MACHINES = fileURLToPath(new URL("../machines/", import.meta.url));
const RENDER = fileURLToPath(new URL("../engine/render.ts", import.meta.url));

/** Every authored machine drawing, by name. */
function canvases(): string[] {
  return readdirSync(MACHINES).filter((f) => f.endsWith(".canvas"));
}

describe("the token set", { concurrency: true }, () => {
  // The state of the world this file was written against. If this fails,
  // somebody has drawn a fork, and the next test is the one that matters.
  test("no shipped machine forks today, so the collapse is latent", () => {
    const joins: string[] = [];
    for (const f of canvases()) {
      const text = readFileSync(MACHINES + f, "utf8");
      if (/\bjoin\b/.test(text)) joins.push(f);
    }
    const notes = readdirSync(MACHINES + "states/").filter((f) => f.endsWith(".md"));
    for (const n of notes) {
      if (/state_kind:\s*join/.test(readFileSync(MACHINES + "states/" + n, "utf8"))) joins.push("states/" + n);
    }
    assert.deepEqual(joins, [], "a join appeared — read the next test, it is now load-bearing");
  });

  // THE GUARD. Two facts, checked together, so that fixing neither is caught.
  // The moment a machine forks, a renderer still reading active[0] is a bug
  // that shows a plausible wrong answer, which is the worst kind.
  test("a fork and an active[0] collapse must never ship together", () => {
    const source = readFileSync(RENDER, "utf8");
    const collapses: string[] = [];
    for (const [i, line] of source.split("\n").entries()) {
      if (line.includes("active[0]")) collapses.push(`render.ts:${i + 1}`);
    }

    const forks = canvases().some((f) => /\bjoin\b/.test(readFileSync(MACHINES + f, "utf8")));

    if (!forks) {
      // Nothing renders wrongly. Record the debt precisely so the count cannot
      // drift upward unnoticed while the case is still unreachable.
      assert.equal(collapses.length, 3, `the active[0] debt changed: ${collapses.join(", ")}`);
      return;
    }
    assert.deepEqual(
      collapses,
      [],
      `a machine now forks, so every one of these shows one state out of several: ${collapses.join(", ")}`,
    );
  });

  // THE MULTI-AGENT HOOK, half built. machine.ts:94 declares claims as "which
  // session holds which active state" — exactly the per-agent marking the
  // owner wants. It is DELETED in three places and WRITTEN in none, so the
  // bookkeeping is complete and only the claim-staking is missing.
  //
  // The day a writer appears, the same three active[0] collapses become a
  // second bug: several agents, one shown. This pins the asymmetry so the
  // arrival is noticed rather than discovered later.
  test("the per-agent claims field is cleaned up but never staked", () => {
    const kernel = readFileSync(fileURLToPath(new URL("../engine/machine.ts", import.meta.url)), "utf8");
    const lines = kernel.split("\n");
    const deletes = lines.filter((l) => /delete\s+inst\.claims\[/.test(l)).length;
    const writes = lines.filter((l) => /inst\.claims\[[^\]]+\]\s*=/.test(l) || /inst\.claims\s*=/.test(l)).length;
    assert.ok(deletes > 0, "the cleanup is still there");
    assert.equal(writes, 0, "a writer appeared — decide how several agents are drawn before it ships");
  });

  // The half that already works, pinned so a refactor cannot quietly undo it.
  test("the drawing already fills every active box, not just the first", () => {
    const source = readFileSync(RENDER, "utf8");
    assert.match(source, /new Set\(\s*info\.active/, "the box fill builds a set from the whole list");
  });
});
