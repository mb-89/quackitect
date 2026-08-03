// the gate and the walk: what is legal before boot, and boot pulled end to end
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileMachine } from "../engine/machines/compile.ts";
import { mainMachinePath, Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, checkDocs, freshRoot, handOver, proofFor, pullBoot } from "./helpers.ts";

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
    // placed is not the projection of project/guidance/, so the promotion is
    // guarded mechanically rather than by trust.
    //
    // The handover cannot be promoted: it CHANGES every session, and the prompt
    // layer is for constants. It is DECLARED here, not known by the engine:
    // read on the way out, and destroyed by the same move.
    assert.deepEqual(rc.exit, { read_consume: [".se/HANDOVER.md"] });
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
    const r = await call(server, "se_file_read", { path: "project/guidance/contract.md" });
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
    const server = buildServer(root);
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
    // THE ANSWER IS THREADED, never re-pulled. The call that stops answering
    // `read` is the one that WALKS, and pulling again to look at it throws that
    // walk away: the target clears itself on arrival, so the extra pull
    // correctly offers doors and the test reads a success as a failure. With
    // the contract promoted there may be nothing owed at all, which makes the
    // very first answer the whole walk.
    let r = await call(server, "se_pull");
    for (let j = 0; j < 40; j++) {
      const doc = r.body.document as { content?: string } | undefined;
      if (doc?.content === undefined) break;
      r = await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
    }
    // That answer WALKED: boot ran its scripts, idle was crossed, and the
    // session's default target (the front desk) was reached in ONE call.
    const walked = r;
    assert.equal(walked.body.pull, "do", JSON.stringify(walked.body));
    assert.equal(walked.body.arrived, true);
    assert.ok((walked.body.walked as string[]).length > 3, "the whole branchless way in one pull");
    // THE BANNER EARNED MID-SWEEP SURVIVES — the harness rule says show it.
    const banners = (walked.body.banners ?? []) as string[];
    assert.ok(
      banners.some((b) => b.includes("Main machine is live")),
      `boot's banner rides the answer: ${JSON.stringify(walked.body)}`,
    );
    // The banner shows once; the next pull is plain.
    const later = await call(server, "se_pull");
    assert.equal(later.body.banners, undefined);
  });

  test("idle opens the whole lane; pulling to end closes it; after the close the pull still answers", async () => {
    const root = freshRoot();
    const server = await bootedServer(root);
    const w = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
    assert.equal(w.isError, false);
    handOver(root); // the way out writes the next session's briefing
    // At idle the machine OFFERS the doors; end is answered as a form.
    const offer = await call(server, "se_pull");
    assert.equal(offer.body.pull, "choose", JSON.stringify(offer.body));
    const exit = await call(server, "se_pull", { form: { choice: "end" } });
    assert.equal(exit.isError, false, JSON.stringify(exit.body));
    const after = await call(server, "se_file_read", { path: "x.md" });
    assert.equal(after.isError, true);
    assert.equal(after.body.clause, "SE-C-110");
    const rest = await call(server, "se_pull");
    assert.equal(rest.body.pull, "wait", "a closed machine has nothing to hand out");
  });

  test("the gate is logged like everything else — a refused pre-boot call lands in the log", async () => {
    const root = freshRoot();
    const server = buildServer(root);
    await call(server, "se_run", { command: "echo nope" }); // refused at start
    await pullBoot(server);
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
    assert.deepEqual(s.active(), ["boot/prepare_idle"]);
    await s.advance(); // prepare_idle -> boot's visible end position
    assert.deepEqual(s.active(), ["boot/end"]);
    await s.advance(); // pop back to main: boot filled, idle
    assert.deepEqual(s.active(), ["idle"]);
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
    assert.deepEqual(s.active(), ["idle"]);
    handOver(root);
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
    // WITH NO HANDOVER LEFT BEHIND, boot owes NOTHING on the way out. The
    // contract, the walk, the lane and the voice were promoted to the prompt
    // layer, and the handover is dropped from the demand when it is not there.
    // An absent dictionary is the shape of a boot that owes nothing — which is
    // the whole point of the promotion.
    assert.deepEqual(Object.keys(state.exit ?? {}), ["read_consume"], "boot's only remaining exit demand is the handover");
    assert.deepEqual(state.exit?.read_consume.args, [], "and with none left behind it asks for nothing");
    assert.ok(state.pulled !== undefined && state.pulled.length >= 2, "the pulled guidance rides the packet");
    // The hash IS the proof — packets must never print it.
    assert.ok(
      state.pulled?.every((p) => !("hash" in p)),
      "packets never hand out the hashes",
    );
    assert.ok(
      state.pulled?.some((p) => (p.sources as string[]).includes("root")),
      "root guidance pulled always",
    );
    assert.ok(Array.isArray(state.lookahead_read), "packet carries preread hint field");
    assert.ok(
      (state.next ?? []).some((n) => n.to === "prepare_idle" && Array.isArray(n.entry_read)),
      "each next edge carries its own read requirement list",
    );
  });
});
