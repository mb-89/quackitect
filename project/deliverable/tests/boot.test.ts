// the gate and the walk: what is legal before boot, and boot pulled end to end
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileMachine } from "../engine/machines/compile.ts";
import { mainMachinePath } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { anyGuidanceDoc, call, freshRoot } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

// Concurrent: every case builds its own root and touches no global.
describe("boot", { concurrency: true }, () => {
  test("the shipped main.canvas compiles: mechanical start/end, boot nested", () => {
    const m = compileMachine(REPO_ROOT, mainMachinePath(REPO_ROOT));
    assert.equal(m.id, "main");
    assert.equal(m.initial, "start", "entry is the mechanical start state, not frontmatter");
    assert.equal(m.states.find((s) => s.id === "start")?.kind, "start");
    assert.equal(m.states.find((s) => s.id === "end")?.kind, "end");
    const boot = m.states.find((s) => s.id === "boot")!;
    assert.ok(boot.submachine?.endsWith("boot.canvas"), "boot is a sub-machine state");
    assert.deepEqual(m.states.find((s) => s.id === "idle")?.legal_tools, ["all"]);
  });

  test("the boot sub-machine compiles with its own mechanical start/end", () => {
    const m = compileMachine(REPO_ROOT, mainMachinePath(REPO_ROOT).replace("main.canvas", "boot.canvas"));
    assert.equal(m.initial, "start");
    assert.equal(m.states.find((s) => s.id === "end")?.kind, "end");
    const rc = m.states.find((s) => s.id === "read_contract")!;
    // BOOT READS ONE THING NOW. The contract, the walk, the lane and the voice
    // were PROMOTED to the prompt layer, where they are present every turn and
    // no compaction can erase them. Preflight refuses to boot when what was
    // placed is not the projection of the guidance root, so the promotion is
    // guarded mechanically rather than by trust.
    //
    // AND NOW IT READS NOTHING ON THE WAY OUT (owner ruling 2026-08-07). The
    // handover used to be consumed here. It is gone: boot DERIVES the last
    // session from the call log and puts it on the banner, so there is no
    // document to read, no proof to earn and no file anyone must remember to
    // write. An absent exit is the shape of a boot that owes nothing.
    assert.equal(rc.exit, undefined);
  });

  test("at start the lane beyond reading is refused with se_pull as the remedy", async () => {
    const server = buildServer(freshRoot());
    const r = await call(server, "se_file_list", { dir: "." });
    assert.equal(r.isError, true);
    assert.equal(r.body.clause, "SE-C-110");
    assert.equal((r.body.remedy as { tool: string }).tool, "se_pull");
  });

  test("reading is legal at the mechanical start/end states — proofs can be earned from anywhere", async () => {
    const server = buildServer(freshRoot());
    const r = await call(server, "se_file_read", { path: anyGuidanceDoc() });
    assert.equal(r.isError, false, JSON.stringify(r.body));
    assert.ok(typeof r.body.hash === "string" && (r.body.hash as string).length > 0);
  });

  test("se_pull answers an instruction — legal everywhere, and a fresh session owes reading", async () => {
    const server = buildServer(freshRoot());
    const r = await call(server, "se_pull");
    assert.equal(r.isError, false);
    assert.equal(r.body.pull, "read", "boot's guidance is owed before anything walks");
    assert.deepEqual(r.body.where, ["start"]);
    assert.ok((r.body.remaining as number) > 0, "the answer says how many documents still stand behind this one");
  });
});
