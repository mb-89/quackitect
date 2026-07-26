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

test("a check pins the VERSION: editing the doc unchecks it and the gate asks again", () => {
  const root = freshRoot();
  const s = new Session(root);
  s.tickAdvance(); s.tickAdvance();
  checkDocs(s);
  s.tickAdvance(); s.tickAdvance(); s.tickAdvance();
  assert.deepEqual(s.active(), ["idle"]);
  const idle = s.machine.states.find((x) => x.id === "start_expedition")!;
  assert.equal(s.entryReadyHuman(s.machine, idle), true, "all pulled docs checked — entry ready");
  // The owner edits voice.md mid-session: the pinned hash no longer matches.
  appendFileSync(join(root, "product", "guidance", "voice.md"), "\nEdited mid-session.\n");
  assert.equal(s.entryReadyHuman(s.machine, idle), false, "the edited doc unchecked itself");
  assert.throws(() => s.tickAdvance("start_expedition"), (e) => (e as { clause?: string }).clause === "SE-C-112");
  // One fresh check of the NEW version and the walk flows again.
  s.humanCheck("product/guidance/voice.md");
  s.tickAdvance("start_expedition");
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

test("the mirror renders per-doc checkboxes and never locks reading itself", () => {
  const root = freshRoot();
  const s = new Session(root);
  s.tickAdvance(); s.tickAdvance(); // at boot/read_contract
  const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes("docheck"), "checkboxes are served");
  assert.ok(!html.includes('class="primary confirm"'), "the old one-click confirm is gone");
  // The mirror's SE_DATA carries checked per pulled doc — the human ledger.
  assert.match(html, /"checked":\s*false/);
  s.humanCheck("product/guidance/voice.md");
  const after = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.match(after, /"checked":\s*true/);
});
