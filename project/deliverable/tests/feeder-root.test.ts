// AN ANSWER THAT IS ACCURATE AND USELESS IS STILL A DEFECT.
//
// MEASURED ON THE i15 WALK. sweep-consistency's submit refused with:
//
//   unsigned feeders: run-demos
//
// run-demos was signed, complete and correct. The break was FOUR STATES
// UPSTREAM at trace-design, whose coverage claim stopped standing the moment
// an engine file was added with no design-spec — and the engine had already
// computed that reason, in those words, on the same pass.
//
// WHAT THE READER DID WITH IT is the whole point. Sent to a state with
// nothing wrong, it investigated that state, found it sound, concluded the
// feeder check was broken, filed a note against a defect that does not exist,
// and escaped. Every one of those steps was reasonable given the answer.
//
// THE CHAIN IS DRIVEN DIRECTLY, not through a seeded fixture. A fresh record
// has one-hop chains only, where the nearest link IS the root — which is
// exactly the case this guard does not need to catch.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { walkBackToFault } from "../engine/sessionclaims.ts";

/** The i15 chain as it actually stood, at the moment of the refusal.
 *  sweep-consistency <- run-demos <- fill-story-evidence <- gate-implementation
 *  <- verification <- trace-design, with only the last one broken. */
const CHAIN: Record<string, string[]> = {
  "sweep-consistency": ["run-demos"],
  "run-demos": ["fill-story-evidence"],
  "fill-story-evidence": ["gate-implementation"],
  "gate-implementation": ["verification"],
  verification: ["trace-design"],
  "trace-design": ["build-steps"],
  "build-steps": [],
};

const BROKEN_AT_TRACE = (id: string) =>
  id === "trace-design"
    ? { ok: false, why: ["1 engine files no design-spec claims — the dead-code view: project/deliverable/engine/repeat.ts"] }
    : { ok: true, why: [] };

test("the walk back skips every sound feeder and names the broken one", () => {
  const r = walkBackToFault("sweep-consistency", (id) => CHAIN[id] ?? [], BROKEN_AT_TRACE);
  assert.ok(r !== undefined, "the walk back found no fault in a chain that has one");
  assert.equal(r.state, "trace-design", `the refusal still names the nearest link rather than the root: ${r.state}`);
});

test("it carries the root's own reason, which is what the reader came for", () => {
  const r = walkBackToFault("sweep-consistency", (id) => CHAIN[id] ?? [], BROKEN_AT_TRACE);
  assert.ok(r !== undefined);
  assert.match(r.why.join(" "), /no design-spec claims/, `the root is named with no reason attached: ${JSON.stringify(r.why)}`);
});

test("the nearest link is still the answer when the nearest link is the fault", () => {
  // The ordinary case, and it must not regress: one hop, broken right there.
  const r = walkBackToFault(
    "sweep-consistency",
    (id) => CHAIN[id] ?? [],
    (id) => ({ ok: id !== "run-demos", why: ["unfilled"] }),
  );
  assert.ok(r !== undefined);
  assert.equal(r.state, "run-demos");
});

test("a chain that is sound the whole way back reports nothing", () => {
  const r = walkBackToFault(
    "sweep-consistency",
    (id) => CHAIN[id] ?? [],
    () => ({ ok: true, why: [] }),
  );
  assert.equal(r, undefined, "a fault was invented in a chain where every state is sound");
});

test("a cycle terminates instead of spinning", () => {
  const ring: Record<string, string[]> = { a: ["b"], b: ["c"], c: ["a"] };
  const r = walkBackToFault(
    "a",
    (id) => ring[id] ?? [],
    () => ({ ok: true, why: [] }),
  );
  assert.equal(r, undefined, "a ring of sound states produced a fault");
});

test("a branch takes the first fault it reaches, and does not stop at the first branch", () => {
  // Two inputs: the first is sound all the way, the second is broken. A walk
  // that gave up after the first branch would answer nothing.
  const fan: Record<string, string[]> = { join: ["left", "right"], left: [], right: ["deep"], deep: [] };
  const r = walkBackToFault(
    "join",
    (id) => fan[id] ?? [],
    (id) => ({ ok: id !== "deep", why: ["the deep one"] }),
  );
  assert.ok(r !== undefined, "the walk gave up on the sound branch instead of trying the other");
  assert.equal(r.state, "deep");
});
