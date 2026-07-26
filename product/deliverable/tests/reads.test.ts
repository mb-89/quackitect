// THE READ PROOF (owner ruling 2026-07-26): hashes are the agent's proof,
// checkboxes the human's — one check per doc VERSION. An edited doc
// unchecks itself; a stale hash proves a stale read.
import { strict as assert } from "node:assert";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot, readHashesFor } from "./helpers.ts";

test("a check pins the VERSION: editing the doc unchecks it and the gate asks again", async () => {
  const root = freshRoot();
  const s = new Session(root);
  await s.tickAdvance(); await s.tickAdvance();
  checkDocs(s);
  await s.tickAdvance(); await s.tickAdvance(); await s.tickAdvance();
  assert.deepEqual(s.active(), ["idle"]);
  const idle = s.machine.states.find((x) => x.id === "start_expedition")!;
  assert.equal(s.entryReadyHuman(s.machine, idle), true, "all pulled docs checked — entry ready");
  // The owner edits voice.md mid-session: the pinned hash no longer matches.
  appendFileSync(join(root, "product", "guidance", "voice.md"), "\nEdited mid-session.\n");
  assert.equal(s.entryReadyHuman(s.machine, idle), false, "the edited doc unchecked itself");
  await assert.rejects(() => s.tickAdvance("start_expedition"), (e) => (e as { clause?: string }).clause === "SE-C-112");
  // One fresh check of the NEW version and the walk flows again.
  s.humanCheck("product/guidance/voice.md");
  await s.tickAdvance("start_expedition");
  assert.deepEqual(s.active(), ["start_expedition/start"]);
});

test("a stale agent hash proves a stale read: the edited doc must be re-read for a fresh token", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  const hashes = readHashesFor(root); // earned before the edit
  for (let i = 0; i < 5; i++) await call(server, "se_tick", { advance: true, read_hashes: hashes });
  appendFileSync(join(root, "product", "guidance", "contract.md"), "\nEdited mid-session.\n");
  const refused = await call(server, "se_tick", { to: "start_expedition", read_hashes: hashes });
  assert.equal(refused.isError, true);
  assert.equal(refused.body.clause, "SE-C-112");
  assert.match(String(refused.body.expected), /contract\.md/);
  // Re-earn the one token that went stale; the rest still stand.
  const fresh = { ...hashes, ...{ "product/guidance/contract.md": readHashesFor(root)["product/guidance/contract.md"] } };
  const ok = await call(server, "se_tick", { to: "start_expedition", read_hashes: fresh });
  assert.equal(ok.isError, false);
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
  session.setThreshold(0); // manual start
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
  session.setThreshold(0.6);
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
