// walk mechanics: reload gating, repair mode, conditions, jumping back.
//
// The engine's own step (tickAdvance) is driven at SESSION level here —
// the human's hand, exactly as the mirror drives it. The agent's verb is
// the pull, tested in the pull*.test.ts files. The atomic-`from` and the
// peek died with the tick tool (owner ruling 2026-08-02): the pull
// recomputes from wherever the walk stands, so there is no planned move
// to go stale and no door the offer does not carry.
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, checkDocs, freshRoot } from "./helpers.ts";

// Concurrent: every case builds its own root and touches no global.
describe("walk mechanics", { concurrency: true }, () => {
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

});
