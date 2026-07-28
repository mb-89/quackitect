// The retro's scope (owner ruling 2026-07-27): draining is legal in the
// retro state and NOWHERE else — "all" never grants a RESTRICTED tool.
// The retro is a PLAIN STATE (the one-state rule, owner 2026-07-28);
// entering it demands the method read.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { contentHash } from "../engine/hash.ts";
import { backlogNotes } from "../engine/inbox.ts";
import { seDir } from "../engine/paths.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, readHashesFor } from "./helpers.ts";

test("draining is retro-scoped: refused under 'all', legal in the retro state — and the drain works", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setAutonomy(1); // the retro weighs 1.0 - lift the slider clear
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
  // Enter the retro — one plain state; entering demands the METHOD read.
  const method = "product/guidance/method/retro.md";
  const withMethod = { ...hashes, [method]: contentHash(readFileSync(join(root, ...method.split("/")))) };
  const intoRetro = await call(server, "se_tick", { to: "retro", read_hashes: withMethod });
  assert.equal(intoRetro.isError, false, JSON.stringify(intoRetro.body));
  // Here — and only here — the drain works; the note leaves the inbox.
  const drained = await call(server, "se_note_drain", { ref, disposition: "done", where: "test" });
  assert.equal(drained.isError, false, JSON.stringify(drained.body));
  assert.equal(drained.body.inbox, 0);
  // An unknown ref refuses with v2's carried clause.
  const missing = await call(server, "se_note_drain", { ref: "note-nope", disposition: "done" });
  assert.equal(missing.isError, true);
  assert.equal(missing.body.clause, "SE-C-073");
});

test("the backlog home (v1 port): backlog demands its ready-when, parks the note, and migration re-drains it", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setAutonomy(1); // the retro weighs 1.0 - lift the slider clear
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  const minted = await call(server, "se_note", { text: "future scope" });
  const ref = String(minted.body.captured);
  const method = "product/guidance/method/retro.md";
  const withMethod = { ...hashes, [method]: contentHash(readFileSync(join(root, ...method.split("/")))) };
  await call(server, "se_tick", { to: "retro", read_hashes: withMethod });
  // A made-up disposition refuses; backlog without its ready-when refuses.
  const bad = await call(server, "se_note_drain", { ref, disposition: "later" });
  assert.equal(bad.isError, true);
  const bare = await call(server, "se_note_drain", { ref, disposition: "backlog" });
  assert.equal(bare.isError, true);
  assert.match(String(bare.body.expected), /ready when/);
  // With the condition, the note parks: out of the inbox, on the backlog.
  const parked = await call(server, "se_note_drain", { ref, disposition: "backlog", where: "ready when iterations exist" });
  assert.equal(parked.isError, false, JSON.stringify(parked.body));
  assert.equal(parked.body.inbox, 0);
  assert.equal(backlogNotes(seDir(root)).length, 1);
  // Migration IS a re-drain: the parked note pulls into scope.
  const pulled = await call(server, "se_note_drain", { ref, disposition: "carried", where: "this round" });
  assert.equal(pulled.isError, false, JSON.stringify(pulled.body));
  assert.equal(backlogNotes(seDir(root)).length, 0);
});

test("since last_retro: the log query scopes to the period after the newest drain call", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setAutonomy(1); // the retro weighs 1.0 - lift the slider clear
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  // No drain yet: last_retro means no floor — everything counts.
  const log = new CallLog(seDir(root));
  const before = log.query({ filter: { since: "last_retro" } }).total;
  assert.ok(before > 0, "boot calls are on the log");
  // Run a drain (the retro marker) …
  const minted = await call(server, "se_note", { text: "marker" });
  const method = "product/guidance/method/retro.md";
  const withMethod = { ...hashes, [method]: contentHash(readFileSync(join(root, ...method.split("/")))) };
  await call(server, "se_tick", { to: "retro", read_hashes: withMethod });
  await call(server, "se_note_drain", { ref: String(minted.body.captured), disposition: "done", where: "test" });
  // … then act once more: the scoped query sees only the tail.
  await call(server, "se_tick", {});
  const scoped = log.query({ filter: { since: "last_retro" } });
  assert.ok(scoped.total < log.query({}).total, "the floor cuts the earlier period off");
  assert.ok(scoped.total >= 1, "the tail after the drain is visible");
});

// The needs-retro gate moved (owner design 2026-07-27): it holds the FIRST
// start of a never-walked iteration inside the iterations container —
// tests/iterations.test.ts walks it end to end.
