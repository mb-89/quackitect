// tick mechanics: atomicity, peeking, jumping back, repair, reload
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, checkDocs, freshRoot, readHashesFor } from "./helpers.ts";

// Concurrent: every case builds its own root and touches no global.
describe("ticks", { concurrency: true }, () => {
test("ticks are ATOMIC: a stale `from` is refused, the matching one moves", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  // The agent plans a move from idle; the human walks into the archive meanwhile.
  checkDocs(session);
  await session.tickAdvance("expedition_archive");
  const stale = await call(server, "se_tick", { from: "idle", to: "end", read_hashes: hashes });
  assert.equal(stale.isError, true);
  assert.equal(stale.body.clause, "SE-C-114");
  assert.match(String(stale.body.expected), /expedition_archive/);
  // From the real position the move flows (bare sub-state ids match too).
  const onward = await call(server, "se_tick", { from: "expedition_archive/start", advance: true, read_hashes: hashes });
  assert.equal(onward.isError, false, JSON.stringify(onward.body));
});

test("se_reload: refused off-idle, dry-runs its canary at idle", async () => {
  const server = buildServer(freshRoot());
  const early = await call(server, "se_reload", {});
  assert.equal(early.isError, true);
  assert.equal(early.body.clause, "SE-C-110", "not legal before idle");
  const booted = await bootedServer(freshRoot());
  const r = await call(booted, "se_reload", {});
  assert.equal(r.isError, false, JSON.stringify(r.body));
  assert.equal(r.body.reload, "dry");
});

test("repair mode: a RED exit script arms the state's repair tools", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await session.tickAdvance(); await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance();
  assert.deepEqual(session.active(), ["boot/prepare_idle"]);
  // Green or not-yet-run: the file lane stays shut.
  const shut = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
  assert.equal(shut.body.clause, "SE-C-110");
  // The suite fails — the engine records it; the repair tools open up.
  session.submitEvidence("prepare_idle", { script_result: { ok: false, output: "1 failing test" } });
  const fix = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
  assert.equal(fix.isError, false, JSON.stringify(fix.body));
});

test("conditions are worked only from inside the state — no pre-running", async () => {
  const { Session } = await import("../engine/session.ts");
  const s = new Session(freshRoot());
  // the condition script never pre-runs, and running it from outside is refused
  await assert.rejects(() => s.scriptRun("prepare_idle"), (e) => (e as { clause?: string }).clause === "SE-C-112");
  // evidence for a state you are not standing in is refused
  assert.throws(() => s.submitEvidence("read_contract", { read_confirmed: true }), (e) => (e as { clause?: string }).clause === "SE-C-112");
});

test("jump back: downstream superseded, script evidence invalidated; human checks persist per version", async () => {
  const { Session } = await import("../engine/session.ts");
  const s = new Session(freshRoot());
  // walk to idle
  await s.tickAdvance(); await s.tickAdvance();
  checkDocs(s);
  await s.tickAdvance(); await s.tickAdvance(); await s.tickAdvance();
  assert.deepEqual(s.active(), ["idle"]);
  // jump back into boot from main: re-enters at the sub's start
  s.jumpBack("boot");
  assert.deepEqual(s.active(), ["boot/start"]);
  // the CHECKS persist (one per doc version — the docs did not change),
  // so the human re-walk flows; the preflight script must re-earn its 0.
  await s.tickAdvance();
  assert.deepEqual(s.active(), ["boot/read_contract"]);
  await s.tickAdvance();
  assert.deepEqual(s.active(), ["boot/prepare_idle"]);
  const prepare = s.currentMachine().states.find((x) => x.id === "prepare_idle")!;
  assert.equal(s.scriptStatus(s.currentMachine(), prepare).ran, false, "script evidence was invalidated by the jump");
  // the record survives: superseded entries, never erased
  assert.ok(s.instance.history.some((h) => h.outcome === "superseded"));
  // a never-filled state is not a jump target
  assert.throws(() => s.jumpBack("end"), (e) => (e as { clause?: string }).clause === "SE-C-110");
});

test("jump back leaves nothing green: the nested walk's record is superseded too", async () => {
  const { Session } = await import("../engine/session.ts");
  const s = new Session(freshRoot());
  await s.tickAdvance(); await s.tickAdvance();
  checkDocs(s);
  await s.tickAdvance(); await s.tickAdvance(); await s.tickAdvance();
  s.jumpBack("boot");
  const filled = s.instance.history.filter((h) => h.outcome === "filled").map((h) => h.state);
  assert.ok(!filled.some((f) => f.startsWith("boot/")), `boot walk entries still filled: ${filled}`);
});

test("the agent can peek at any state without moving — the click, as a tool", async () => {
  const server = buildServer(freshRoot());
  const peek = await call(server, "se_tick", { state: "idle" });
  assert.equal(peek.isError, false);
  assert.equal(peek.body.id, "idle");
  assert.ok(String(peek.body.guidance).length > 0);
  const still = await call(server, "se_tick");
  assert.deepEqual(still.body.active, ["start"]);
  const unknown = await call(server, "se_tick", { state: "nope" });
  assert.equal(unknown.isError, true);
});

test("peeking takes a SET: every door in one call, in the order asked", async () => {
  const server = buildServer(freshRoot());
  const many = await call(server, "se_tick", { state: ["idle", "front_desk", "start"] });
  assert.equal(many.isError, false, JSON.stringify(many.body));
  const states = many.body.states as { id: string; guidance?: string }[];
  assert.deepEqual(states.map((s) => s.id), ["idle", "front_desk", "start"]);
  assert.equal(many.body.failed, undefined, "nothing failed, so nothing is reported failed");

  // A set peek is not a thinner peek: an entry is the SAME answer one id gives.
  const single = await call(server, "se_tick", { state: "front_desk" });
  assert.deepEqual(states[1], single.body);

  // Looking never moves, however many doors are looked at.
  const still = await call(server, "se_tick");
  assert.deepEqual(still.body.active, ["start"]);
});

test("one unknown door refuses for itself, and the real ones still arrive", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_tick", { state: ["idle", "nope"] });
  assert.equal(r.isError, false, "a set peek does not fail whole because one entry did");
  const states = r.body.states as { guidance?: string; refused?: { remedy?: unknown } }[];
  assert.equal(r.body.failed, 1);
  assert.ok(states[0].guidance, "the real door still came back");
  assert.ok(states[1].refused?.remedy, "the unknown one carries its own refusal, with a remedy");

  // Peeking every id there could be is a sweep, not a choice.
  const greedy = await call(server, "se_tick", { state: Array.from({ length: 21 }, (_, i) => `s${i}`) });
  assert.equal(greedy.isError, true);
  assert.match(String(greedy.body.expected), /at most 20/);
});

});
