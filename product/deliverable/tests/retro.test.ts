// The retro's scope (owner ruling 2026-07-27): draining is legal in the
// retro's drain state and NOWHERE else — "all" never grants a RESTRICTED
// tool. Entering the drain demands the method read.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { contentHash } from "../engine/hash.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, readHashesFor } from "./helpers.ts";

test("draining is retro-scoped: refused under 'all', legal in retro/drain — and the drain works", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  const minted = await call(server, "se_note", { text: "a stray to drain" });
  const ref = String(minted.body.captured);
  // At idle the lane is open ("all") — the RESTRICTED drain still refuses.
  const refused = await call(server, "se_note_drain", { ref, disposition: "done" });
  assert.equal(refused.isError, true);
  assert.equal(refused.body.clause, "SE-C-110");
  // Enter the retro; its drain state demands the METHOD read.
  const method = "product/guidance/method/retro.md";
  const withMethod = { ...hashes, [method]: contentHash(readFileSync(join(root, ...method.split("/")))) };
  const intoRetro = await call(server, "se_tick", { to: "retro", read_hashes: hashes });
  assert.equal(intoRetro.isError, false, JSON.stringify(intoRetro.body));
  const inDrain = await call(server, "se_tick", { to: "drain", read_hashes: withMethod });
  assert.equal(inDrain.isError, false, JSON.stringify(inDrain.body));
  // Here — and only here — the drain works; the note leaves the inbox.
  const drained = await call(server, "se_note_drain", { ref, disposition: "done", where: "test" });
  assert.equal(drained.isError, false, JSON.stringify(drained.body));
  assert.equal(drained.body.inbox, 0);
  // An unknown ref refuses with v2's carried clause.
  const missing = await call(server, "se_note_drain", { ref: "note-nope", disposition: "done" });
  assert.equal(missing.isError, true);
  assert.equal(missing.body.clause, "SE-C-073");
});

test("the needs-retro gate: a pending trigger note blocks start_iteration until the retro drains it", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  // The trigger: the owner asked for a retro (or an iteration finished).
  const minted = await call(server, "se_note", { text: "needs retro — iteration wrapped" });
  const ref = String(minted.body.captured);
  // start_iteration refuses, NAMING the blocking note and the remedy.
  const refused = await call(server, "se_tick", { to: "start_iteration", read_hashes: hashes });
  assert.equal(refused.isError, true);
  assert.equal(refused.body.clause, "SE-C-112");
  assert.match(String(refused.body.got), /needs retro/);
  assert.match(String((refused.body.remedy as { note: string }).note), /RETRO/);
  // The retro drains it …
  const method = "product/guidance/method/retro.md";
  const withMethod = { ...hashes, [method]: contentHash(readFileSync(join(root, ...method.split("/")))) };
  await call(server, "se_tick", { to: "retro", read_hashes: hashes });
  await call(server, "se_tick", { to: "drain", read_hashes: withMethod });
  await call(server, "se_note_drain", { ref, disposition: "done", where: "retro ran" });
  await call(server, "se_tick", { to: "end", read_hashes: withMethod });
  await call(server, "se_tick", { advance: true, read_hashes: hashes });
  // … and the gate opens.
  const open = await call(server, "se_tick", { to: "start_iteration", read_hashes: hashes });
  assert.equal(open.isError, false, JSON.stringify(open.body));
});
