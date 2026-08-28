// THE QUESTION ABOUT THE PIECE OF WORK IN HAND.
//
// NOTHING IS DEMANDED AT DISPATCH. A token taken and a token settled ARE the
// narration, and both log themselves. A floor has nothing left to enforce.
//
// WHAT STANDS INSTEAD IS A QUESTION. `sameWork` asks at most once a minute
// whether the work in hand is still the work in hand. A question can be
// ignored, so nothing in this file ever refuses.
//
// see dsp-narration.md#the-toll
import assert from "node:assert/strict";
import { test } from "node:test";
import { Toll } from "../engine/toll.ts";

const MINUTE = 60_000;

/** A toll whose clock the case advances by hand. */
function tollAt(start = 1_000_000): { toll: Toll; tick: (ms: number) => void } {
  let t = start;
  return {
    toll: new Toll({ now: () => t }),
    tick: (ms: number) => {
      t += ms;
    },
  };
}

// THE READING LOOP IS NEVER INTERRUPTED. The pull answers `read`, hands one
// document over, and the only legal next move is to read it and pull back with
// the proof. No judgment happens on that hop.
//
// THE GUARD REFUSES NOTHING AT ALL NOW, so this pins the guarantee rather than
// a difference between two kinds of call.
test("a run of reading hops is never refused at dispatch", () => {
  const { toll } = tollAt();
  toll.check(true, "se_pull", {}); // arms
  assert.doesNotThrow(() => {
    for (let i = 0; i < 200; i++) toll.check(true, "se_pull", { form: { read: "the last words" } });
  }, "a reading run was stopped by the dispatch guard");
  assert.equal(toll.takeWarning(), undefined, "a reading run raised a nudge nobody asked for");
});

test("work held for under a minute raises no nudge", () => {
  const { toll, tick } = tollAt();
  toll.sameWork("w-1", "trimming the toll");
  tick(MINUTE - 1);
  toll.sameWork("w-1", "trimming the toll");
  assert.equal(toll.takeWarning(), undefined, "the question was asked before the minute was up");
});

test("work held past a minute raises a nudge quoting its statement", () => {
  const { toll, tick } = tollAt();
  toll.sameWork("w-1", "trimming the toll");
  tick(MINUTE);
  toll.sameWork("w-1", "trimming the toll");
  const nudge = String(toll.takeWarning());
  assert.match(nudge, /trimming the toll/, "the nudge never said which work it is about");
  assert.match(nudge, /se_work/, "the nudge never named the verb that opens a token for a stray");
});

// A CHANGE OF WORK ANSWERS THE QUESTION BY ITSELF. Settling one piece and
// opening the next moves the id in hand, so the clock starts again there.
test("a changed work id restarts the clock", () => {
  const { toll, tick } = tollAt();
  toll.sameWork("w-1", "the first piece");
  tick(MINUTE - 1);
  toll.sameWork("w-2", "the second piece");
  tick(MINUTE - 1);
  toll.sameWork("w-2", "the second piece");
  assert.equal(toll.takeWarning(), undefined, "the new work inherited the old work's clock");
});

test("an empty id clears the hand", () => {
  const { toll, tick } = tollAt();
  toll.sameWork("w-1", "the only piece");
  tick(2 * MINUTE);
  toll.sameWork("", "");
  assert.equal(toll.takeWarning(), undefined, "an empty hand was asked about anyway");
  tick(2 * MINUTE);
  toll.sameWork("w-1", "the only piece");
  assert.equal(toll.takeWarning(), undefined, "the cleared hand kept the clock it was cleared with");
});

// SHOWING A NUDGE AFTER THE WALKER ALREADY MOVED would be asking about work
// that is no longer in hand.
test("a work act drops a nudge waiting to be read", () => {
  const { toll, tick } = tollAt();
  toll.sameWork("w-1", "trimming the toll");
  tick(MINUTE);
  toll.sameWork("w-1", "trimming the toll");
  toll.paid();
  assert.equal(toll.takeWarning(), undefined, "the nudge outlived the act that answered it");
});
