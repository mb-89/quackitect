// A CALL RECORD CARRIES WHO, WHERE AND WHICH HAND —
// tsp-a-call-record-carries-who-where-and-which-hand, against
// req-every-call-records-the-model-that-answered-it,
// req-every-call-records-the-state-it-was-made-in,
// req-every-call-records-the-part-its-caller-played and
// req-a-weaker-driver-than-named-owes-a-recorded-reason.
//
// EVERY COORDINATE OR NONE. The record grows the three fields in one edit or
// it grows none of them. "This model answered 190 calls" and "190 calls
// happened somewhere" are the same non-answer from two directions, and "an
// agent made all of them" is a third.
//
// WHAT MAKES A CASE RED HERE IS REQUIRED-NESS, NOT PRESENCE. `append` keeps
// keys it does not declare, so asserting a field comes back out passes today
// against no design at all — measured on the first run of this file, where
// four of eight cases were green from birth. A check green with no realized
// design is exactly what this state refuses.
//
// SO THE DEMAND IS THAT THE RECORD REQUIRE THEM. A call with no part, no
// state or no answering model must not become a record. The presence and
// grouping cases stay as regression guards once the fields are real.
//
// THE NEGATIVE CONTROL IS NOT DECORATION. Grouping by a missing key returns
// one bucket, and so does grouping by any word at all — calllog.ts:289-292
// falls back to "(none)" for a key it cannot reach. This iteration once read
// that as evidence of an absence and it is not.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import type { CallPart } from "../engine/calllog.ts";
import { CallLog } from "../engine/calllog.ts";
import { seDir } from "../engine/paths.ts";
import { freshRoot } from "./helpers.ts";

function logIn(): CallLog {
  return new CallLog(seDir(freshRoot()));
}

const base = { args: {}, ok: true, outcome: "result" as const, duration_ms: 1, tool: "se_pull" };

test("the three coordinates are fields on the record", () => {
  const log = logIn();
  const rec = log.append({ ...base, actor: "agent", answered_by: "some-model", state: "i38/build-steps", part: "walker" });
  assert.equal((rec as unknown as Record<string, unknown>).answered_by, "some-model", "what SERVED the call, not what was asked for");
  assert.equal((rec as unknown as Record<string, unknown>).state, "i38/build-steps", "a field of its own, never inside an argument");
  assert.equal((rec as unknown as Record<string, unknown>).part, "walker", "which hand made it");
});

test("a call missing any of the three does not become a record", () => {
  const log = logIn();
  const full = { ...base, actor: "agent" as const, answered_by: "m", state: "s", part: "walker" };
  for (const missing of ["answered_by", "state", "part"]) {
    const partial: Record<string, unknown> = { ...full };
    delete partial[missing];
    assert.throws(
      () => log.append(partial as unknown as Parameters<CallLog["append"]>[0]),
      `a record with no ${missing} reads as complete and answers nothing — the measure says absent = 0`,
    );
  }
});

test("grouping separates by each coordinate", () => {
  const log = logIn();
  log.append({ ...base, actor: "agent", answered_by: "weak", state: "a", part: "walker" });
  log.append({ ...base, actor: "agent", answered_by: "weak", state: "b", part: "walker" });
  log.append({ ...base, actor: "agent", answered_by: "strong", state: "b", part: "guide" });
  assert.deepEqual(log.query({ group_by: "state" }).groups, { a: 1, b: 2 });
  assert.deepEqual(log.query({ group_by: "answered_by" }).groups, { weak: 2, strong: 1 });
  assert.deepEqual(log.query({ group_by: "part" }).groups, { walker: 2, guide: 1 });
  assert.ok(
    !("(none)" in (log.query({ group_by: "part" }).groups ?? {})),
    "no record reaches the log without a part, so no bucket is unattributed",
  );
});

test("a grouping key nothing carries returns one bucket, which is why the cases above are needed", () => {
  const log = logIn();
  log.append({ ...base, actor: "agent", answered_by: "weak", state: "a", part: "walker" });
  log.append({ ...base, actor: "agent", answered_by: "strong", state: "b", part: "guide" });
  assert.deepEqual(log.query({ group_by: "banana" }).groups, { "(none)": 2 }, "an absence and a wrong key look identical from here");
});

test("the two claimed coordinates carry the mark", () => {
  const log = logIn();
  const rec = log.append({ ...base, actor: "agent", answered_by: "some-model", state: "s", part: "walker" });
  const claimed = (rec as unknown as { claimed?: string[] }).claimed;
  assert.ok(claimed !== undefined, "a field that reads like an observation and is a claim is worse than an empty one");
  assert.deepEqual([...claimed].sort(), ["answered_by", "part"], "the state is known where the call is served; these two are not");
});

test("a relayed answer is recorded as the delegate's part, not the relayer's", () => {
  const log = logIn();
  const rec = log.append({ ...base, actor: "agent", answered_by: "strong", state: "s", part: "guide", relayed_by: "walker" });
  assert.equal((rec as unknown as Record<string, unknown>).part, "guide", "the part comes from the work's AUTHOR");
  assert.equal((rec as unknown as Record<string, unknown>).relayed_by, "walker", "and who filed it stays visible rather than replacing it");
});

test("the role vocabulary is closed and separates two hands", () => {
  const log = logIn();
  // The cast is the point of the case rather than a way around the type. A
  // closed vocabulary that only holds at compile time holds for our own code
  // and for nothing that reaches the log from a lane call.
  assert.throws(
    () => log.append({ ...base, actor: "agent", answered_by: "m", state: "s", part: "sorcerer" as CallPart }),
    "an open vocabulary makes every count a guess about what the words meant that day",
  );
  const walker = log.append({ ...base, actor: "agent", answered_by: "m", state: "s", part: "walker" });
  const guide = log.append({ ...base, actor: "agent", answered_by: "m", state: "s", part: "guide" });
  assert.notEqual(
    (walker as unknown as Record<string, unknown>).part,
    (guide as unknown as Record<string, unknown>).part,
    "a vocabulary in which both hands are the same value fails the requirement while looking complete",
  );
});

test("a step walked below its named strength carries the stated reason", () => {
  const log = logIn();
  const rec = log.append({
    ...base,
    actor: "agent",
    answered_by: "weak",
    state: "s",
    part: "walker",
    named_driver: "C3",
    weaker_reason: "the strong hand was unreachable",
  });
  assert.equal((rec as unknown as Record<string, unknown>).weaker_reason, "the strong hand was unreachable");
});

test("and an absent reason is marked rather than refused", () => {
  const log = logIn();
  const rec = log.append({ ...base, actor: "agent", answered_by: "weak", state: "s", part: "walker", named_driver: "C3" });
  assert.equal((rec as unknown as Record<string, unknown>).weaker_reason, null, "a refusal here would be a different requirement");
  assert.equal((rec as unknown as Record<string, unknown>).unreasoned, true, "the mark says a reason was owed and not given");
});

// ── the declaration reaches the record ────────────────────────────────────
//
// The three coordinates are on the record and two of them are the CALLER'S to
// state. A coordinate a caller has no way to send is a coordinate that is
// always the default, and a log of defaults answers nothing.

async function laneSchemas(): Promise<{ name: string; properties: Record<string, unknown> }[]> {
  const { buildServer } = await import("../engine/tools.ts");
  const server = buildServer(freshRoot());
  const list = await server.handle({ jsonrpc: "2.0", id: 1, method: "tools/list" });
  const tools = (list as { result: { tools: { name: string; inputSchema: { properties: Record<string, unknown> } }[] } }).result.tools;
  return tools.map((t) => ({ name: t.name, properties: t.inputSchema.properties }));
}

test("every lane tool accepts the hand, the relay and the answering model", async () => {
  const schemas = await laneSchemas();
  assert.ok(schemas.length > 0, "the lane must offer tools for this to mean anything");
  for (const s of schemas) {
    for (const key of ["as", "relayed_by", "answered_by"]) {
      assert.ok(key in s.properties, `${s.name} does not accept ${key}, so a caller cannot state it there`);
    }
  }
});

test("the hand vocabulary offered to a caller is the one the log enforces", async () => {
  const offered = (await laneSchemas())[0].properties.as as { enum?: string[] };
  assert.deepEqual(
    [...(offered.enum ?? [])].sort(),
    ["guide", "owner", "reviewer", "surface", "walker"],
    "an offer wider than the check refuses honest callers; one narrower hides parts nobody can name",
  );
});
