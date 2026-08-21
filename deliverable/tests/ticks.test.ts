// THIS FILE PROVES THE SCRIPTS RUN, so the suite's spawn-skip is cleared
// here — a guard that makes a tool do nothing is invisible to a test that
// only reads its output (software.md).
delete process.env.SE_SCRIPT_SKIP;

// walk mechanics: reload gating, repair mode, conditions.
//
// The engine's own step is driven at SESSION level here — the person's
// hand, exactly as the mirror drives it. The agent's verb is the pull,
// tested in the pull*.test.ts files.
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot, pullBoot, sessionAtIdle } from "./helpers.ts";

// Concurrent: every case builds its own root and touches no global.
describe("walk mechanics", { concurrency: true }, () => {
  test("se_reload: refused off-idle, dry-runs its canary at idle, free under emergency", async () => {
    const server = buildServer(freshRoot());
    const early = await call(server, "se_reload", {});
    assert.equal(early.isError, true);
    assert.equal(early.body.clause, "SE-C-110", "not legal before idle");

    const idleRoot = freshRoot();
    const idle = await sessionAtIdle(idleRoot);
    assert.deepEqual(idle.active(), ["idle"]);
    const r = await call(buildServer(idleRoot, idle), "se_reload", {});
    assert.equal(r.isError, false, JSON.stringify(r.body));
    assert.equal(r.body.reload, "dry");

    // The boot walks THROUGH idle and rests at the front desk, so the
    // resting place is off-idle and the gate still holds there. Emergency
    // is the one key: repair cannot afford to walk home first.
    const deskRoot = freshRoot();
    const desk = new Session(deskRoot);
    const deskServer = buildServer(deskRoot, desk);
    // NO SESSION ARGUMENT, ON PURPOSE. Passing one aims the walk at idle, and
    // the three lines below need it OFF idle, resting at the desk. The call
    // used to pass `desk` and still land at the desk by timing alone; once the
    // boot helper stopped racing a deciding judgment it landed at idle instead
    // and the assertion below caught it.
    await pullBoot(deskServer);
    assert.equal(desk.active()[0], "front_desk");
    const refused = await call(deskServer, "se_reload", {});
    assert.equal(refused.body.clause, "SE-C-110", "the desk is not idle");
    desk.setAutonomy(1);
    desk.setEmergency(true);
    const armed = await call(deskServer, "se_reload", {});
    assert.equal(armed.isError, false, JSON.stringify(armed.body));
    assert.equal(armed.body.reload, "dry");
  });

  test("repair mode: a RED exit script arms the state's repair tools", async () => {
    const root = freshRoot();
    const session = new Session(root);
    const server = buildServer(root, session);
    await session.advance();
    await session.advance();
    checkDocs(session);
    await session.advance();
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
    await assert.rejects(
      () => s.scriptRun("prepare_idle"),
      (e) => (e as { clause?: string }).clause === "SE-C-112",
    );
    // evidence for a state you are not standing in is refused
    assert.throws(
      () => s.submitEvidence("read_contract", { read_confirmed: true }),
      (e) => (e as { clause?: string }).clause === "SE-C-112",
    );
  });
});
