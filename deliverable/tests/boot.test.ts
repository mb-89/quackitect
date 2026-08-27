// the gate and the walk: what is legal before boot, and boot pulled end to end
//
// SMALL FILES ON PURPOSE. A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileMachine } from "../engine/machines/compile.ts";
import { mainMachinePath, Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { anyGuidanceDoc, bootedServer, call, checkDocs, freshRoot, proofFor, pullBoot, workHere } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

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
    assert.deepEqual(m.states.find((s) => s.id === "front_desk")?.legal_tools, ["all", "se_note_drain"]);
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
    // AND NOW IT READS NOTHING ON THE WAY OUT. The
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

  test("the agent's pulls walk boot: the reading gates, the machine walks, the banner survives the sweep", async () => {
    const root = freshRoot();
    const session = new Session(root);
    const server = buildServer(root, session);
    // The pull says read. Pulling AGAIN without reading hands back the same
    // instruction — the gate bites by SAYING, never by throwing.
    const first = await call(server, "se_pull");
    assert.equal(first.body.pull, "read");
    const again = await call(server, "se_pull");
    assert.equal(again.body.pull, "read", "no way forward except the reading");
    // The lane beyond reading stays shut while boot stands.
    const shut = await call(server, "se_run", { command: "echo nope" });
    assert.equal(shut.body.clause, "SE-C-110");
    // Drain the reading the honest way — one document per pull, tail proven.
    //
    // THE ANSWER IS THREADED, never re-pulled to look at. The call that stops
    // answering `read` is the one that WALKS, and an idle pull after it throws
    // that walk away: the target clears itself on arrival, so the extra pull
    // correctly offers doors and the test reads a success as a failure.
    //
    // A MARKED STEP IS A BRANCHING POINT TOO: a state is not left while it
    // holds open work, so the batch stops at boot's `Startup order` and runs on
    // once the step is done. What the hops PROVE is unchanged — the way is
    // walked in a handful of calls, not one call per hop.
    let r = await call(server, "se_pull");
    const hops: string[] = [];
    const banners: string[] = [];
    for (let j = 0; j < 40; j++) {
      hops.push(...((r.body.walked ?? []) as string[]));
      banners.push(...((r.body.banners ?? []) as string[]));
      const doc = r.body.document as { content?: string } | undefined;
      if (doc?.content !== undefined) {
        r = await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
        continue;
      }
      if (r.body.pull !== "do" || r.body.arrived === true) break;
      if (r.body.refusal === undefined) break;
      if (workHere(session) === 0) break;
      r = await call(server, "se_pull");
    }
    // That answer WALKED: boot ran its scripts, idle was crossed, and the
    // session's default target (the front desk) was reached.
    const walked = r;
    assert.equal(walked.body.pull, "do", JSON.stringify(walked.body));
    assert.equal(walked.body.arrived, true);
    assert.ok(hops.length > 3, `the whole branchless way in a handful of pulls: ${JSON.stringify(hops)}`);
    assert.ok((walked.body.walked as string[]).length > 1, "and the last of them still carried a batch of hops");
    // THE BANNER EARNED MID-SWEEP SURVIVES — the harness rule says show it.
    assert.ok(
      banners.some((b) => b.includes("Main machine is live")),
      `boot's banner rides the answer: ${JSON.stringify(walked.body)}`,
    );
    // The banner shows once; the next pull is plain.
    const later = await call(server, "se_pull");
    assert.equal(later.body.banners, undefined);
  });

  // PULL UNTIL THE WALK SETTLES, answering any reading it owes on the way.
  // A route can owe one, and a test that treats that as a failure is testing
  // the route rather than the thing it names.
  async function settle(server: Parameters<typeof call>[0]): Promise<Record<string, unknown>> {
    for (let i = 0; i < 12; i++) {
      const r = await call(server, "se_pull");
      if (r.body.pull === "read") {
        const doc = r.body.document as { content?: string } | undefined;
        if (doc?.content === undefined) return r.body;
        await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
        continue;
      }
      if (r.body.pull !== "do") return r.body;
    }
    throw new Error("the walk never settled");
  }

  test("the desk opens the whole lane; pulling to end closes it; after the close the pull still answers", async () => {
    const root = freshRoot();
    const server = await bootedServer(root);
    const w = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
    assert.equal(w.isError, false);
    // Boot lands ON the desk now. With no target it waits there, with the live
    // doors as options, and end is answered as a form.
    const offer = await settle(server);
    assert.equal(offer.pull, "wait", JSON.stringify(offer));
    const exit = await call(server, "se_pull", { form: { choice: "end" } });
    assert.equal(exit.isError, false, JSON.stringify(exit.body));
    const rest = await settle(server);
    assert.equal(rest.pull, "wait", JSON.stringify(rest));
    const after = await call(server, "se_file_read", { path: "x.md" });
    assert.equal(after.isError, true);
    assert.equal(after.body.clause, "SE-C-110");
  });

  test("the gate is logged like everything else — a refused pre-boot call lands in the log", async () => {
    const root = freshRoot();
    const session = new Session(root);
    const server = buildServer(root, session);
    await call(server, "se_run", { command: "echo nope" }); // refused at start
    await pullBoot(server, session);
    const q = await call(server, "se_log_query", { filter: { ok: false } });
    const recs = q.body.records as { tool: string; outcome: string }[];
    assert.equal(recs.length, 1);
    assert.equal(recs[0].tool, "se_run");
    assert.equal(recs[0].outcome, "rejected");
  });

  test("manual mode: tick info at start, the human's steps walk the whole machine to end", async () => {
    const { Session } = await import("../engine/session.ts");
    const root = freshRoot();
    const s = new Session(root);
    const info = s.packet() as { active: string[]; states: { kind: string }[] };
    assert.deepEqual(info.active, ["start"]);
    assert.equal(info.states[0].kind, "start");
    await s.advance(); // main/start -> boot's mechanical start (one position per step)
    assert.deepEqual(s.active(), ["boot/start"]);
    await s.advance();
    assert.deepEqual(s.active(), ["boot/read_contract"]);
    // THE READ GATE NO LONGER HOLDS BOOT, because boot no longer owes the
    // contract — the prompt layer carries it, and preflight guards that. The
    // person's checkbox path is unchanged and still legal; with nothing owed it
    // simply has nothing to check.
    checkDocs(s);
    await s.advance();
    assert.deepEqual(s.active(), ["boot/prepare_desk"]);
    await s.advance(); // prepare_desk -> boot's visible end position
    assert.deepEqual(s.active(), ["boot/end"]);
    await s.advance(); // pop back to main: boot filled, idle
    assert.deepEqual(s.active(), ["front_desk"]);
    // idle is a hub now: an unnamed advance is refused, the step must choose
    await assert.rejects(
      () => s.advance(),
      (e) => (e as { clause?: string }).clause === "SE-C-110",
    );
    // a round trip through an (empty) generated container and back
    await s.advance("expeditions");
    assert.deepEqual(s.active(), ["expeditions/start"]);
    await s.advance(); // nothing open: start runs to end
    assert.deepEqual(s.active(), ["expeditions/end"]);
    await s.advance(); // pop: filled, back at idle
    assert.deepEqual(s.active(), ["front_desk"]);
    await s.advance("end");
    assert.equal((s.describe() as { status: string }).status, "closed");
  });

  // The packet-shape guarantees the mirror renders from — the exit
  // dictionary, the pulled list without hashes, the preread hints — moved
  // with the packet itself: packet serves the MIRROR now, so its shape is
  // asserted at session level.
  test("the mirror's packet: exit dictionary, pulled docs WITHOUT hashes, preread hints", async () => {
    const s = new Session(freshRoot());
    await s.advance();
    await s.advance();
    const state = (
      s.packet() as {
        states: {
          exit?: Record<string, { args: string[]; met?: boolean }>;
          pulled?: Record<string, unknown>[];
          lookahead_read?: string[];
          next?: { to: string; entry_read?: string[] }[];
        }[];
      }
    ).states[0];
    // BOOT OWES NOTHING ON THE WAY OUT. The contract, the walk, the lane and
    // the voice went to the prompt layer, and the handover was retired
    // outright — the last session is derived from
    // the call log now and rides the banner. An absent dictionary is the shape
    // of a boot that owes nothing, which is the whole point.
    assert.deepEqual(Object.keys(state.exit ?? {}), [], "nothing is demanded on the way out any more");
    assert.ok(state.pulled !== undefined && state.pulled.length >= 1, "the pulled guidance rides the packet");
    // The hash IS the proof — packets must never print it.
    assert.ok(
      state.pulled?.every((p) => !("hash" in p)),
      "packets never hand out the hashes",
    );
    assert.ok(
      state.pulled?.every((p) => Array.isArray(p.sources) && (p.sources as string[]).length > 0),
      "every pulled doc says which rule pulled it",
    );
    assert.ok(Array.isArray(state.lookahead_read), "packet carries preread hint field");
    assert.ok(
      (state.next ?? []).some((n) => n.to === "prepare_desk" && Array.isArray(n.entry_read)),
      "each next edge carries its own read requirement list",
    );
  });
});

// THE LANE COULD NOT NOTICE ITS OWN AGE.
//
// The process loads the engine once and Node caches it, so the source on disk
// and the code in memory part company at the first edit. SE_VERSION is the
// clearest instance: an IIFE evaluated at import, frozen for the life of the
// process, and stamped by the call log onto every record written after.
//
// MEASURED on a real box: the manifest said 6.0.0 while every record written
// that day said 5.0.0, one of them minutes later. i37's whole deliverable —
// cost per state — is derived from a stamp that has therefore never run.
//
// WHAT THIS PROMISES AND WHAT IT DOES NOT. A differing version proves the lane
// is stale. A matching one proves nothing, because most engine edits never
// touch the manifest. It is a smoke alarm, not an inventory, and the test says
// so rather than letting a later reader assume more.
test("the lane can compare the version it serves against the one on disk", async () => {
  const { SE_VERSION, laneAge, versionOnDisk } = await import("../engine/version.ts");

  const disk = versionOnDisk();
  assert.notEqual(disk, "", "the manifest is readable from the engine");
  assert.match(disk, /^\d+\.\d+\.\d+$|^unknown$/, "a version or an honest unknown, never a throw");

  const age = laneAge();
  assert.equal(age.served, SE_VERSION, "served is the frozen stamp, which is what the log carries");
  assert.equal(age.on_disk, disk, "on_disk is read fresh");

  // In a test the two are the same process, so this run is never stale. What
  // matters is that the comparison is real rather than hardcoded false.
  assert.equal(age.stale, disk !== "unknown" && disk !== SE_VERSION);
  assert.equal(age.stale, false, "a freshly imported engine matches its own manifest");
});
