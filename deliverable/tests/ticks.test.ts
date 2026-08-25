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
// SMALL FILES ON PURPOSE. A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot, pullBoot, readEverything, sessionAtIdle } from "./helpers.ts";

// Concurrent: every case builds its own root and touches no global.
describe("walk mechanics", { concurrency: true }, () => {
  test("se_reload: legal wherever the walk stands, and dry-runs its canary", async () => {
    const server = buildServer(freshRoot());
    const early = await call(server, "se_reload", {});
    assert.equal(early.isError, false, JSON.stringify(early.body));
    assert.equal(early.body.reload, "dry", "legal before the desk is ever reached");

    const idleRoot = freshRoot();
    const idle = await sessionAtIdle(idleRoot);
    assert.deepEqual(idle.active(), ["front_desk"]);
    const r = await call(buildServer(idleRoot, idle), "se_reload", {});
    assert.equal(r.isError, false, JSON.stringify(r.body));
    assert.equal(r.body.reload, "dry");

    // A RELOAD NO LONGER DEMANDS THE FRONT DESK. An agent that has just fixed
    // the engine puts the fix into effect where it stands, instead of walking
    // out of its record and back in to do it. Nothing mid-record is lost: the
    // forms are on disk and the pull recomputes the position from the
    // repository, which is what makes a killed session survivable too.
    //
    // THE CANARY IS STILL THE GUARD. A tree whose module graph will not load
    // never kills a running engine, wherever the reload is asked for.
    const deskRoot = freshRoot();
    const desk = new Session(deskRoot);
    const deskServer = buildServer(deskRoot, desk);
    await pullBoot(deskServer);
    assert.equal(desk.active()[0], "front_desk");
    desk.setTarget("expeditions");
    await readEverything(desk);
    assert.notEqual(desk.active()[0], "front_desk", "walked off home, where a reload used to be refused");
    const offHome = await call(deskServer, "se_reload", {});
    assert.equal(offHome.isError, false, JSON.stringify(offHome.body));
    assert.equal(offHome.body.reload, "dry", "off home is no longer a refusal");
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
    assert.deepEqual(session.active(), ["boot/prepare_desk"]);
    // Green or not-yet-run: the file lane stays shut.
    const shut = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
    assert.equal(shut.body.clause, "SE-C-110");
    // The suite fails — the engine records it; the repair tools open up.
    session.submitEvidence("prepare_desk", { script_result: { ok: false, output: "1 failing test" } });
    const fix = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
    assert.equal(fix.isError, false, JSON.stringify(fix.body));
  });

  test("conditions are worked only from inside the state — no pre-running", async () => {
    const { Session } = await import("../engine/session.ts");
    const s = new Session(freshRoot());
    // the condition script never pre-runs, and running it from outside is refused
    await assert.rejects(
      () => s.scriptRun("prepare_desk"),
      (e) => (e as { clause?: string }).clause === "SE-C-112",
    );
    // evidence for a state you are not standing in is refused
    assert.throws(
      () => s.submitEvidence("read_contract", { read_confirmed: true }),
      (e) => (e as { clause?: string }).clause === "SE-C-112",
    );
  });
});
