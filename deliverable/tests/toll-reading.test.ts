// THE READING LOOP PAYS NO TOLL.
//
// OWNER RULING 2026-08-18: "repeated pulls don't need to count down the total
// counter."
//
// WHY IT MATTERED. The pull answers `read`, hands one document over, and the
// only legal next move is to read it and pull back with the proof. No judgment
// happens on that hop. The toll counts CALLS, so a burst of forced hops ran the
// counter down and SE-C-040 fell due inside the loop — where the only thing an
// agent can honestly say is "reading the document you just sent me". That is
// the filler the toll exists to prevent, extracted by the toll itself.
//
// The i35 field report named it, and the test helpers had already grown a
// workaround: creditReading attached a dummy update to every read call.
import assert from "node:assert/strict";
import { test } from "node:test";
import { Toll } from "../engine/toll.ts";

/** A toll with a tight call budget and a clock that never advances, so these
 *  cases are about the CALL counter and nothing else. */
function tollWithBudget(calls: number): Toll {
  return new Toll({ now: () => 1_000_000, cadence: () => ({ minutes: 60, calls }) });
}

const proof = { form: { read: "the last words" } };

test("a pull carrying only a read proof does not spend a call", () => {
  const toll = tollWithBudget(3);
  toll.check(true, "se_pull", {}); // arms
  // Far more reading hops than the budget would allow.
  for (let i = 0; i < 40; i++) toll.check(true, "se_pull", proof);
  assert.equal(toll.takeWarning(), undefined, "a reading run raised the toll warning");
});

test("real calls still spend, and the toll still bites after the grace", () => {
  const toll = tollWithBudget(2);
  toll.check(true, "se_pull", {}); // arms
  toll.check(true, "se_file_read", { path: "a.md" });
  toll.check(true, "se_file_read", { path: "b.md" });
  toll.check(true, "se_file_read", { path: "c.md" });
  assert.match(String(toll.takeWarning()), /update overdue/, "the toll never warned on real work");
  assert.throws(
    () => toll.check(true, "se_file_read", { path: "d.md" }),
    (e) => (e as { clause?: string }).clause === "SE-C-040",
    "an ignored warning did not earn the refusal",
  );
});

test("reading hops interleaved with work do not hide the work", () => {
  const toll = tollWithBudget(2);
  toll.check(true, "se_pull", {}); // arms
  for (let i = 0; i < 20; i++) toll.check(true, "se_pull", proof);
  toll.check(true, "se_file_patch", { ops: [] });
  for (let i = 0; i < 20; i++) toll.check(true, "se_pull", proof);
  toll.check(true, "se_file_patch", { ops: [] });
  toll.check(true, "se_file_patch", { ops: [] });
  assert.match(String(toll.takeWarning()), /update overdue/, "three real calls under a budget of two did not warn");
});

// A PULL THAT CARRIES MORE THAN A PROOF IS DOING REAL WORK. Evidence or a
// choice riding alongside is a decision, and it pays like anything else.
test("a pull carrying evidence beside the proof still spends a call", () => {
  const toll = tollWithBudget(1);
  toll.check(true, "se_pull", {}); // arms
  toll.check(true, "se_pull", { form: { read: "words", verdict: "pass" } });
  toll.check(true, "se_pull", { form: { read: "words", verdict: "pass" } });
  assert.match(String(toll.takeWarning()), /update overdue/, "a pull submitting evidence slipped through as a reading hop");
});

test("a volunteered update still pays, and clears the count", () => {
  const toll = tollWithBudget(2);
  toll.check(true, "se_pull", {}); // arms
  toll.check(true, "se_file_read", { path: "a.md" });
  toll.check(true, "se_file_read", { path: "b.md" });
  toll.paid();
  toll.check(true, "se_file_read", { path: "c.md" });
  assert.equal(toll.takeWarning(), undefined, "paying did not clear the call count");
});

// WAITING ON A JOB YOU ALREADY STARTED IS THE SAME SHAPE AS THE READING LOOP.
//
// MEASURED on the i15 walk: se_test was called 40 times. The 4 that STARTED a
// run were never refused. Of the 36 that polled a running job, 25 were refused
// by the toll — 62% of every se_test call in the session, none of them about
// testing. Each had to be paid with an update saying nothing, or resent until
// it was.
//
// The battery runs asynchronously and hands back a handle, so the only way to
// learn it finished is to ask. The machine forced that hop, no judgment
// happened on it, and a toll falling due there can only be paid with filler —
// which is the reading loop's argument, word for word.
test("polling a running job does not spend a call", () => {
  const toll = new Toll({ cadence: () => ({ minutes: 60, calls: 3 }), now: () => 0 });
  toll.check(true, "se_pull", {});
  for (let i = 0; i < 30; i++) toll.check(true, "se_test", { job: "test-abc-1" });
  // Three real calls is the whole budget; thirty polls in between must not
  // have eaten any of it.
  toll.check(true, "se_pull", {});
  toll.check(true, "se_pull", {});
  assert.doesNotThrow(() => toll.check(true, "se_pull", {}), "the polls spent the call budget");
});

test("STARTING a run still spends a call, because asking a question is work", () => {
  const toll = new Toll({ cadence: () => ({ minutes: 60, calls: 2 }), now: () => 0 });
  // The FIRST call arms the toll and is not counted, so the budget starts after it.
  toll.check(true, "se_pull", {});
  toll.check(true, "se_test", { question: "does the change hold" });
  toll.check(true, "se_test", { question: "and again" });
  toll.check(true, "se_test", { question: "past the budget, which earns the grace warning" });
  assert.throws(
    () => toll.check(true, "se_test", { question: "and ignoring the warning earns the refusal" }),
    /SE-C-040|update/,
    "a run that was STARTED rather than polled slipped the toll",
  );
});
