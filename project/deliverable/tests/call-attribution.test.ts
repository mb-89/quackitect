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
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
    named_driver: "author",
    went_weaker: true,
    weaker_reason: "the strong hand was unreachable",
  });
  assert.equal((rec as unknown as Record<string, unknown>).weaker_reason, "the strong hand was unreachable");
  assert.equal((rec as unknown as Record<string, unknown>).unreasoned, undefined, "a reason was given, so nothing is owed");
});

test("a step walked at or above its named strength is not marked", () => {
  const log = logIn();
  // FOUND BY A FRESH-EYES TESTER: the mark used to fire on any named driver
  // with no reason, and the lane asks for `named_driver` on EVERY call while
  // walking a rated step. So nearly every record was `unreasoned`, and a mark
  // that fires on nearly everything counts nothing.
  const rec = log.append({ ...base, actor: "agent", answered_by: "strong", state: "s", part: "walker", named_driver: "author" });
  assert.equal((rec as unknown as Record<string, unknown>).unreasoned, undefined, "a stronger hand than named needs no argument");
  assert.equal((rec as unknown as Record<string, unknown>).weaker_reason, undefined, "and owes no sentence");
});

test("and an absent reason is marked rather than refused", () => {
  const log = logIn();
  const rec = log.append({
    ...base,
    actor: "agent",
    answered_by: "weak",
    state: "s",
    part: "walker",
    named_driver: "author",
    went_weaker: true,
  });
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

// ── the log answers by any coordinate ─────────────────────────────────────
//
// Grouping by a key nothing carries returns one bucket, and so does grouping
// by a key everybody shares. This iteration read the first as evidence of an
// absence, and it is not evidence of anything.

test("a grouping that reached nothing says so, and one that found one bucket does not", () => {
  const log = logIn();
  log.append({ ...base, actor: "agent", answered_by: "m", state: "s", part: "walker" });
  log.append({ ...base, actor: "agent", answered_by: "m", state: "s", part: "walker" });

  const nothing = log.query({ group_by: "banana" });
  assert.deepEqual(nothing.groups, { "(none)": 2 });
  assert.equal(nothing.group_by_reached_nothing, "banana", "the answer names the key nobody carries");

  const shared = log.query({ group_by: "part" });
  assert.deepEqual(shared.groups, { walker: 2 });
  assert.equal(shared.group_by_reached_nothing, undefined, "one bucket everybody shares is a real answer");
});

test("a key some records carry is not reported as reaching nothing", () => {
  const log = logIn();
  log.append({ ...base, actor: "agent", answered_by: "m", state: "s", part: "walker", named_driver: "C3", weaker_reason: "because" });
  log.append({ ...base, actor: "agent", answered_by: "m", state: "s", part: "walker" });
  const partial = log.query({ group_by: "named_driver" });
  assert.deepEqual(partial.groups, { C3: 1, "(none)": 1 });
  assert.equal(partial.group_by_reached_nothing, undefined, "a partial miss is a finding, not an instrument failure");
});

test("an empty log does not claim the key reached nothing", () => {
  const log = logIn();
  const empty = log.query({ group_by: "part" });
  assert.equal(empty.total, 0);
  assert.equal(empty.group_by_reached_nothing, undefined, "nothing to reach is not the same as reaching nothing");
});

// ── a weaker walk carries its reason ──────────────────────────────────────
//
// The asymmetry is the design's one safety rule: a stronger hand than named
// needs no argument, a weaker one owes a sentence. It is MARKED and never
// refused, because refusing would be a different requirement — and because the
// party being asked is the party being judged.

test("a caller can state the named strength and the reason it went weaker", async () => {
  const schemas = await laneSchemas();
  for (const s of schemas) {
    for (const key of ["named_driver", "weaker_reason"]) {
      assert.ok(key in s.properties, `${s.name} does not accept ${key}, so the asymmetry can never be armed`);
    }
  }
});

test("a reason carried without a named strength is kept, and marks nothing", () => {
  const log = logIn();
  const rec = log.append({
    ...base,
    actor: "agent",
    answered_by: "m",
    state: "s",
    part: "walker",
    weaker_reason: "no driver was ever named",
  });
  assert.equal((rec as unknown as Record<string, unknown>).unreasoned, undefined, "nothing was owed, so nothing is marked");
  assert.equal(
    (rec as unknown as Record<string, unknown>).weaker_reason,
    "no driver was ever named",
    "the field is kept as written — what is refused is letting it stand IN PLACE OF a named strength",
  );
});

// ── the lane, not just the log ────────────────────────────────────────────
//
// FOUND BY A FRESH-EYES TESTER, by mutation. `whichHand` in engine/tools.ts is
// the only place a real call's coordinates are taken from the caller, and
// replacing its whole return with constants left the entire battery green:
// every case above tests `CallLog.append` directly or the tool SCHEMA
// separately, and nothing tested the join between them.
//
// A COORDINATE THAT ONLY WORKS AT THE LOG IS A COORDINATE THAT DOES NOT WORK.

async function pullThenLastRecord(root: string, args: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  const { buildServer } = await import("../engine/tools.ts");
  const server = buildServer(root);
  await server.handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "se_pull", arguments: args } });
  const path = join(seDir(root), "calls.jsonl");
  if (!existsSync(path)) return undefined;
  const lines = readFileSync(path, "utf8").trim().split("\n").filter(Boolean);
  const last = lines.at(-1);
  return last === undefined ? undefined : (JSON.parse(last) as Record<string, unknown>);
}

test("a real lane call carries the coordinates its caller declared", async () => {
  const rec = await pullThenLastRecord(freshRoot(), {
    as: "guide",
    relayed_by: "walker",
    answered_by: "a-strong-model",
    named_driver: "frame",
    went_weaker: true,
    weaker_reason: "the frame hand was busy",
  });
  assert.ok(rec !== undefined, "the call must reach the log for anything else to mean anything");
  assert.equal(rec.part, "guide", "the part comes from the caller, through the dispatcher, onto the record");
  assert.equal(rec.relayed_by, "walker");
  assert.equal(rec.answered_by, "a-strong-model");
  assert.equal(rec.named_driver, "frame");
  assert.equal(rec.went_weaker, true, "and the caller's own word that it went weaker");
  assert.equal(rec.weaker_reason, "the frame hand was busy");
  assert.equal(rec.unreasoned, undefined, "a reason was given");
  assert.ok(typeof rec.state === "string" && rec.state !== "", "and the state is the server's own observation");
});

test("a lane call that declares nothing is recorded as the walker's, on an unreported model", async () => {
  const rec = await pullThenLastRecord(freshRoot(), {});
  assert.ok(rec !== undefined);
  assert.equal(rec.part, "walker", "the hand holding the session IS the walker by definition");
  assert.equal(rec.answered_by, "unreported", "a declared absence, never a missing field");
});

test("a hand outside the vocabulary refuses the CALL and still logs it", async () => {
  const { buildServer } = await import("../engine/tools.ts");
  const root = freshRoot();
  const server = buildServer(root);
  const res = await server.handle({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "se_pull", arguments: { as: "sorcerer" } },
  });
  const r = res?.result as { isError?: boolean; content: { text: string }[] };
  assert.equal(r.isError, true, "the call is refused, typed, like any other bad argument");
  assert.ok(r.content[0].text.includes("sorcerer"), "and the refusal names what it got");
  const lines = readFileSync(join(seDir(root), "calls.jsonl"), "utf8")
    .trim()
    .split("\n")
    .filter(Boolean);
  assert.equal(lines.length, 1, "a refused call is a record — losing it is what this case exists to stop");
  assert.equal((JSON.parse(lines[0]) as { ok: boolean }).ok, false);
});

test("a relayer that names its own part refuses the call", async () => {
  const { buildServer } = await import("../engine/tools.ts");
  const server = buildServer(freshRoot());
  const res = await server.handle({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "se_pull", arguments: { as: "guide", relayed_by: "guide" } },
  });
  const refused = res?.result as { isError?: boolean } | undefined;
  assert.equal(refused?.isError, true, "a record where the author and the relayer agree is a contradiction");
});

test("a weaker walk through the lane with no reason is marked, and one at strength is not", async () => {
  const marked = await pullThenLastRecord(freshRoot(), { named_driver: "frame", went_weaker: true });
  assert.equal(marked?.unreasoned, true, "the sentence was owed and not given");
  assert.equal(marked?.weaker_reason, null);
  const plain = await pullThenLastRecord(freshRoot(), { named_driver: "frame" });
  assert.equal(plain?.unreasoned, undefined, "the lane asks for named_driver on every call — that alone owes nothing");
});
