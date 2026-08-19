// AN ITEM THAT SURVIVES TWO REFUSALS IS THE WRONG SHAPE, and the answer says so.
//
// MEASURED ON THE i15 WALK: 59 refusals, every one of them SE-C-133, every one
// carrying the same two items — "walk boot reading loop", still open hours
// after boot ended, and "work milestones as served", which cannot close until
// the iteration does.
//
// THE WORK WAS REAL AND THE NARRATION WAS HONEST. The checklist was the wrong
// shape. The guard named what was open, which was true and sent the reader
// looking for work to finish; there was none to find, because neither item
// could close from where the walk stood.
//
// NO CLOCK IS NEEDED TO KNOW IT. Surviving one refusal makes an item suspect.
// Surviving two makes it wrong.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Decisions, parseUpdate } from "../engine/decisions.ts";

function fresh(): Decisions {
  return new Decisions(mkdtempSync(join(tmpdir(), "se-stall-")));
}

/** Push non-resolving updates until the guard bites, and hand back what it
 *  said. The count is read off the guard rather than hard-coded, so the
 *  fixture cannot drift from the threshold. */
function pushUntilRefused(d: Decisions, node: string): { note: string; calls: number } {
  for (let i = 1; i <= 40; i++) {
    try {
      d.apply("s@0", parseUpdate({ op: "update", node, brief: `still working, pass ${i}` }));
    } catch (e) {
      const r = e as { clause?: string; remedy?: { note?: string } };
      if (r.clause !== "SE-C-133") throw e;
      return { note: String(r.remedy?.note ?? ""), calls: i };
    }
  }
  throw new Error("the stall guard never bit in 40 updates");
}

test("the first refusal names what is open, and does not yet call it the wrong shape", () => {
  const d = fresh();
  d.apply("s@0", parseUpdate({ op: "plan", items: ["walk boot reading loop", "work milestones as served"] }));
  const first = pushUntilRefused(d, "d1");
  assert.match(first.note, /open now/, `the refusal does not name what is open: "${first.note}"`);
  assert.doesNotMatch(
    first.note,
    /ALREADY OPEN AT THE LAST REFUSAL/,
    "the very first refusal already calls the items unclosable, on no evidence",
  );
});

test("the second refusal, with the same items still open, says they cannot close here", () => {
  const d = fresh();
  d.apply("s@0", parseUpdate({ op: "plan", items: ["walk boot reading loop", "work milestones as served"] }));
  pushUntilRefused(d, "d1");
  // The reader does what the first refusal asked and resolves ONE item, then
  // keeps working. The other never closes — which is the i15 shape exactly.
  d.apply("s@0", parseUpdate({ op: "obsolete", node: "d1", brief: "boot ended long ago" }));
  const second = pushUntilRefused(d, "d2");
  assert.match(
    second.note,
    /ALREADY OPEN AT THE LAST REFUSAL/,
    `an item that survived a refusal is still reported as merely open: "${second.note}"`,
  );
  assert.match(second.note, /work milestones as served/, "the surviving item is not named");
  assert.doesNotMatch(second.note, /walk boot reading loop/, "an item that was resolved is still called stuck");
});

test("it says what to do about the wrong shape, which is not another resolving op", () => {
  const d = fresh();
  d.apply("s@0", parseUpdate({ op: "plan", items: ["work milestones as served"] }));
  pushUntilRefused(d, "d1");
  const second = pushUntilRefused(d, "d1");
  assert.match(second.note, /fresh plan/, `the answer offers no way out of the wrong shape: "${second.note}"`);
  assert.match(second.note, /close in THIS state/, "the answer does not say what a right-shaped item is");
});

test("a checklist that keeps closing items is never called the wrong shape", () => {
  const d = fresh();
  d.apply("s@0", parseUpdate({ op: "plan", items: ["one", "two", "three"] }));
  // Real work: the counter resets every time something lands, so the guard
  // never bites at all. This is the case that must not regress into noise.
  for (const [i, node] of ["d1", "d2", "d3"].entries()) {
    for (let k = 0; k < 8; k++) d.apply("s@0", parseUpdate({ op: "update", node, brief: `reading file ${k}` }));
    d.apply("s@0", parseUpdate({ op: "done", node, brief: `item ${i + 1} landed` }));
  }
  assert.ok(true, "eight updates per item, resolved each time, and nothing refused");
});
