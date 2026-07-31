// THE READ PROOF (owner ruling 2026-07-26): hashes are the agent's proof,
// checkboxes the human's — one check per doc VERSION. An edited doc
// unchecks itself; a stale hash proves a stale read.
import { strict as assert } from "node:assert";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { readFileSync } from "node:fs";
import { call, checkDocs, freshRoot, READ_DOCS, readHashesFor } from "./helpers.ts";

// THREE HOMES, NOT ONE (owner ruling 2026-07-29). voice.md is about HOW YOU
// TALK. It had accumulated rules about writing SOFTWARE and building
// INTERFACES, and a reader looking for one had to sift the other two.
//
// The split is only half the ruling. A guidance nobody pulls is a guidance
// nobody reads, so each home sits directly in product/guidance/ where the
// pull serves it always.
test("the guidance splits three ways, and every home is pulled", () => {
  const root = freshRoot();
  const s = new Session(root);
  const idle = s.machine.states.find((x) => x.id === "idle")!;
  const pulled = s.pulled(s.machine, idle).map((p) => p.path);
  for (const home of ["product/guidance/voice.md", "product/guidance/software.md", "product/guidance/ux.md"]) {
    assert.ok(pulled.includes(home), home + " is not pulled — a guidance nobody pulls is a guidance nobody reads");
    assert.ok(READ_DOCS.includes(home as (typeof READ_DOCS)[number]), home + " is pulled but the suite never proves reading it");
  }
  const read = (p: string): string => readFileSync(join(root, ...p.split("/")), "utf8");
  const voice = read("product/guidance/voice.md");
  const software = read("product/guidance/software.md");
  const ux = read("product/guidance/ux.md");
  // Each rule sits in exactly one home. Two copies is how they drift apart.
  assert.match(software, /Do not repeat \(DRY\)/, "DRY is a software rule");
  assert.match(software, /Comments and provenance/, "so is how you comment");
  assert.match(software, /Dated guidance/, "so is judging dated advice");
  assert.match(ux, /Nothing ever hangs/, "the interface rule the owner added leads the UX home");
  assert.match(ux, /NEVER BLOCK THE PROCESS THAT DRAWS THE INTERFACE/, "including the half that actually bites");
  assert.match(ux, /ONE SURFACE NEVER RESETS ANOTHER/, "and the place rules");
  for (const moved of [/Do not repeat \(DRY\)/, /Comments & provenance/, /### Visual design/, /### Figures/]) {
    assert.ok(!moved.test(voice), "voice.md kept " + String(moved) + " — it belongs to a sibling now");
  }
  // What voice.md is FOR stays in it.
  assert.match(voice, /### Sentences/);
  assert.match(voice, /### Answered questions/);
  assert.match(voice, /The sycophancy guard/);
});

test("a check pins the VERSION: editing the doc unchecks it and the gate asks again", async () => {
  const root = freshRoot();
  const s = new Session(root);
  await s.tickAdvance(); await s.tickAdvance();
  checkDocs(s);
  await s.tickAdvance(); await s.tickAdvance(); await s.tickAdvance();
  assert.deepEqual(s.active(), ["idle"]);
  const idle = s.machine.states.find((x) => x.id === "expeditions")!;
  assert.equal(s.entryReadyHuman(s.machine, idle), true, "all pulled docs checked — entry ready");
  // The owner edits voice.md mid-session: the pinned hash no longer matches.
  appendFileSync(join(root, "product", "guidance", "voice.md"), "\nEdited mid-session.\n");
  assert.equal(s.entryReadyHuman(s.machine, idle), false, "the edited doc unchecked itself");
  await assert.rejects(() => s.tickAdvance("expeditions"), (e) => (e as { clause?: string }).clause === "SE-C-112");
  // One fresh check of the NEW version and the walk flows again.
  s.humanCheck("product/guidance/voice.md");
  await s.tickAdvance("expeditions");
  assert.deepEqual(s.active(), ["expeditions/start"]);
});

test("THE HANDOVER: a left-behind .se/HANDOVER.md is demanded leaving boot's reading room — absent, nothing is", async () => {
  const root = freshRoot();
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "HANDOVER.md"), "# Handover\n\nOpen threads for the next session.\n", "utf8");
  const server = buildServer(root);
  const hashes = readHashesFor(root);
  let last: Awaited<ReturnType<typeof call>> | undefined;
  for (let i = 0; i < 8; i++) {
    last = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (last.isError === true || last.body.booted === true) break;
  }
  // The walk stops LEAVING read_contract — the handover is a boot exit read.
  assert.equal(last!.isError, true);
  assert.equal(last!.body.clause, "SE-C-112");
  assert.match(String(last!.body.expected), /read_contract/);
  assert.match(String(last!.body.expected), /HANDOVER/);
  // The reading room offers it: pulled with source "handover" — the mirror's checkbox home.
  const at = await call(server, "se_tick", {});
  const state = (at.body.states as { pulled: { path: string; sources: string[] }[] }[])[0];
  assert.ok(state.pulled.some((p) => p.path === ".se/HANDOVER.md" && p.sources.includes("handover")));
  const { contentHash } = await import("../engine/hash.ts");
  const { readFileSync } = await import("node:fs");
  const withHandover = { ...hashes, ".se/HANDOVER.md": contentHash(readFileSync(join(root, ".se", "HANDOVER.md"))) };
  for (let i = 0; i < 8; i++) {
    last = await call(server, "se_tick", { advance: true, read_hashes: withHandover });
    if (last.isError === true || last.body.booted === true) break;
  }
  // Idle entry no longer demands it — boot already proved the reading.
  assert.equal(last!.isError, false, JSON.stringify(last!.body));
  assert.equal(last!.body.booted, true);
});

test("a stale agent hash proves a stale read: the edited doc must be re-read for a fresh token", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  const hashes = readHashesFor(root); // earned before the edit
  for (let i = 0; i < 5; i++) await call(server, "se_tick", { advance: true, read_hashes: hashes });
  appendFileSync(join(root, "product", "guidance", "contract.md"), "\nEdited mid-session.\n");
  const refused = await call(server, "se_tick", { to: "expeditions", read_hashes: hashes });
  assert.equal(refused.isError, true);
  assert.equal(refused.body.clause, "SE-C-112");
  assert.match(String(refused.body.expected), /contract\.md/);
  // Re-earn the one token that went stale; the rest still stand.
  const fresh = { ...hashes, ...{ "product/guidance/contract.md": readHashesFor(root)["product/guidance/contract.md"] } };
  const ok = await call(server, "se_tick", { to: "expeditions", read_hashes: fresh });
  assert.equal(ok.isError, false);
});

test("the read buffer auto-fills tick proofs from prior lane reads", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  // Walk into boot/read_contract where the read gate starts applying.
  await call(server, "se_tick", { advance: true });
  await call(server, "se_tick", { advance: true });
  // Earn proofs through the lane once; later ticks send no read_hashes.
  for (const path of READ_DOCS) {
    const rr = await call(server, "se_file_read", { path, offset: 1, limit: 1 });
    assert.equal(rr.isError, false, JSON.stringify(rr.body));
  }
  let last: Awaited<ReturnType<typeof call>> | undefined;
  for (let i = 0; i < 8; i++) {
    last = await call(server, "se_tick", { advance: true });
    if (last.isError || last.body.booted === true) break;
  }
  assert.equal(last?.isError, false, JSON.stringify(last?.body));
  assert.equal(last?.body.booted, true, "buffered proofs should carry the boot walk to idle");
});

test("startup clears any preseeded read buffer before boot reading", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const seeded = readHashesFor(root);
  for (const [path, hash] of Object.entries(seeded)) session.rememberRead(path, hash);
  const server = buildServer(root, session);
  // First move enters boot and mechanically clears stale/leftover buffer state.
  await call(server, "se_tick", { advance: true }); // start -> boot/start
  await call(server, "se_tick", { advance: true }); // boot/start -> read_contract
  const refused = await call(server, "se_tick", { advance: true }); // leaving read_contract needs fresh read
  assert.equal(refused.isError, true);
  assert.equal(refused.body.clause, "SE-C-112");
  assert.match(String(refused.body.expected), /read_contract/);
});

test("the mirror renders per-doc checkboxes and never locks reading itself", async () => {
  const root = freshRoot();
  const s = new Session(root);
  await s.tickAdvance(); await s.tickAdvance(); // at boot/read_contract
  const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes("docheck"), "checkboxes are served");
  assert.ok(!html.includes('class="primary confirm"'), "the old one-click confirm is gone");
  // The mirror's SE_DATA carries checked per pulled doc — the human ledger.
  assert.match(html, /"checked":\s*false/);
  s.humanCheck("product/guidance/voice.md");
  const after = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.match(after, /"checked":\s*true/);
});

test("the pill turns green from the machine: a passing agent tick records its proof — checkboxes stay human-only", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  // The agent walks into boot/read_contract; the exit read stands unmet.
  await call(server, "se_tick", { advance: true });
  await call(server, "se_tick", { advance: true });
  const before = await call(server, "se_tick", {});
  const beforeState = (before.body.states as { exit: { read: { met: boolean } } }[])[0];
  assert.equal(beforeState.exit.read.met, false, "no proof presented yet");
  // The tick that presents the hashes passes — and the proof STANDS.
  const hashes = readHashesFor(root);
  await call(server, "se_tick", { advance: true, read_hashes: hashes });
  const after = await call(server, "se_tick", { state: "read_contract" });
  const afterState = after.body as { exit: { read: { met: boolean } } };
  assert.equal(afterState.exit.read.met, true, "the agent's presented proof is the pill's green");
  // The human ledger is untouched: nothing checked, boxes stay empty.
  assert.deepEqual(after.body.human_checked ?? (await call(server, "se_tick", {})).body.human_checked, []);
  // A version pins the proof: editing a doc drops it, the pill asks again.
  appendFileSync(join(root, "product", "guidance", "voice.md"), "\nEdited mid-session.\n");
  const edited = await call(server, "se_tick", { state: "read_contract" });
  assert.equal((edited.body as { exit: { read: { met: boolean } } }).exit.read.met, false, "an edited doc drops the agent's proof too");
});

test("THE HANDOVER: the human walks boot on checkboxes, raises the slider — the agent owes the same reading", async () => {
  const root = freshRoot();
  const { Session } = await import("../engine/session.ts");
  const session = new Session(root);
  session.setAutonomy(0); // manual start
  const server = buildServer(root, session);
  // The human drives: checks the boot docs, walks through read_contract.
  await session.tickAdvance(); await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance();
  assert.deepEqual(session.active(), ["boot/prepare_idle"]);
  // The packet tells the agent what the session has checked.
  const info = session.tickInfo() as { human_checked: string[] };
  assert.ok(info.human_checked.includes("workspace/AGENTS.md"));
  // The slider rises; the agent advances — but its head holds none of it.
  session.setAutonomy(0.6);
  const owed = await call(server, "se_tick", { advance: true });
  assert.equal(owed.isError, true);
  assert.equal(owed.body.clause, "SE-C-112");
  assert.match(String(owed.body.expected), /match the human's checked list/);
  assert.match(String(owed.body.expected), /AGENTS\.md/);
  // Reading it all makes the advance flow — through to idle.
  const hashes = readHashesFor(root);
  await call(server, "se_tick", { advance: true, read_hashes: hashes }); // -> boot/end
  const landed = await call(server, "se_tick", { advance: true, read_hashes: hashes }); // pop -> idle
  assert.equal(landed.body.booted, true);
});
