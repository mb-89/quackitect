// the gate and the walk: what is legal before boot, and boot walked end to end
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
import { bootedServer, call, checkDocs, freshRoot, readHashesFor } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

// Concurrent: every case builds its own root and touches no global.
describe("boot", { concurrency: true }, () => {
test("the shipped main.canvas compiles: mechanical start/end, boot nested", () => {
  const m = compileMachine(REPO_ROOT, mainMachinePath(REPO_ROOT));
  assert.equal(m.id, "main");
  assert.equal(m.initial, "start", "entry is the mechanical start state, not frontmatter");
  assert.equal(m.states.find((s) => s.id === "start")!.kind, "start");
  assert.equal(m.states.find((s) => s.id === "end")!.kind, "end");
  const boot = m.states.find((s) => s.id === "boot")!;
  assert.ok(boot.submachine?.endsWith("boot.canvas"), "boot is a sub-machine state");
  assert.deepEqual(m.states.find((s) => s.id === "idle")!.legal_tools, ["all"]);
});

test("the boot sub-machine compiles with its own mechanical start/end", () => {
  const m = compileMachine(REPO_ROOT, mainMachinePath(REPO_ROOT).replace("main.canvas", "boot.canvas"));
  assert.equal(m.initial, "start");
  assert.equal(m.states.find((s) => s.id === "end")!.kind, "end");
  const rc = m.states.find((s) => s.id === "read_contract")!;
  assert.deepEqual(rc.exit, { read: ["workspace/AGENTS.md", "product/guidance/contract.md", "product/guidance/voice.md", "product/guidance/walking.md"] });
});

test("at start the lane beyond reading is refused with se_tick as the remedy", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_file_list", { dir: "." });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-110");
  assert.equal((r.body.remedy as { tool: string }).tool, "se_tick");
});

test("reading is legal at the mechanical start/end states — proof tokens can be earned from anywhere", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_file_read", { path: "product/guidance/contract.md" });
  assert.equal(r.isError, false, JSON.stringify(r.body));
  assert.ok(typeof r.body.hash === "string" && (r.body.hash as string).length > 0);
});

test("se_tick without arguments reports the current state — legal everywhere", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_tick");
  assert.equal(r.isError, false);
  assert.deepEqual(r.body.active, ["start"]);
  assert.ok((r.body.legal_tools as string[]).includes("se_tick"));
});

test("the agent's ticks walk boot, gated by HASH proof-of-read, banner on idle", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  await call(server, "se_tick", { advance: true }); // start -> boot/start
  await call(server, "se_tick", { advance: true }); // -> read_contract
  const at = await call(server, "se_tick");
  assert.deepEqual(at.body.active, ["boot/read_contract"]);
  const state = (at.body.states as { exit?: Record<string, { args: string[] }>; pulled?: Record<string, unknown>[] }[])[0];
  assert.ok(state.exit !== undefined && state.exit.read.args.length === 4, "the exit dictionary rides the packet");
  assert.ok(state.pulled !== undefined && state.pulled.length >= 2, "the pull rides the packet");
  // The hash IS the proof — the agent's packet must never print it.
  assert.ok(state.pulled!.every((p) => !("hash" in p)), "packets never hand the agent the hashes");
  assert.ok(state.pulled!.some((p) => (p.sources as string[]).includes("root")), "root guidance pulled always");
  const shut = await call(server, "se_run", { command: "echo nope" });
  assert.equal(shut.body.clause, "SE-C-110");
  // the read gate bites: a tick WITHOUT hashes is refused, remedy = read
  const unread = await call(server, "se_tick", { advance: true });
  assert.equal(unread.isError, true);
  assert.equal(unread.body.clause, "SE-C-112");
  assert.equal((unread.body.remedy as { tool: string }).tool, "se_file_read");
  // ... and a STALE hash proves nothing.
  const stale = await call(server, "se_tick", { advance: true, read_hashes: Object.fromEntries(Object.keys(readHashesFor(root)).map((p) => [p, "0123456789ab"])) });
  assert.equal(stale.isError, true);
  assert.equal(stale.body.clause, "SE-C-112");
  // The honest way: read through the lane — the result carries the hash.
  const rc = await call(server, "se_file_read", { path: "product/guidance/voice.md" });
  assert.equal(rc.isError, false, "se_file_read is legal in read_contract");
  assert.equal(rc.body.hash, readHashesFor(root)["product/guidance/voice.md"], "the lane's hash is the proof token");
  const s2 = await call(server, "se_tick", { advance: true, read_hashes: readHashesFor(root) });
  assert.deepEqual(s2.body.active, ["boot/prepare_idle"]);
  await call(server, "se_tick", { advance: true }); // -> boot/end
  // the pop into idle demands the pull proven AGAIN (hashes, every time)
  const bare = await call(server, "se_tick", { advance: true });
  assert.equal(bare.isError, true);
  assert.equal(bare.body.clause, "SE-C-112");
  const landed = await call(server, "se_tick", { advance: true, read_hashes: readHashesFor(root) });
  assert.equal(landed.body.booted, true);
  assert.ok(String(landed.body.banner).includes("main machine @ idle"));
  // the banner shows once; a later tick-info is plain
  const info = await call(server, "se_tick");
  assert.equal(info.body.booted, undefined);
});

test("idle opens the whole lane; a tick to end closes it; after end only tick-info answers", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  const w = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
  assert.equal(w.isError, false);
  const exit = await call(server, "se_tick", { from: "idle", to: "end" });
  assert.equal(exit.isError, false);
  const after = await call(server, "se_file_read", { path: "x.md" });
  assert.equal(after.isError, true);
  assert.equal(after.body.clause, "SE-C-110");
  const state = await call(server, "se_tick");
  assert.equal(state.body.status, "closed");
});

test("the gate is logged like everything else — a refused pre-boot call lands in the log", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  await call(server, "se_run", { command: "echo nope" }); // refused at start
  for (let i = 0; i < 5; i++) await call(server, "se_tick", { advance: true, read_hashes: readHashesFor(root) }); // walk to idle
  const q = await call(server, "se_log_query", { filter: { ok: false } });
  const recs = q.body.records as { tool: string; outcome: string }[];
  assert.equal(recs.length, 1);
  assert.equal(recs[0].tool, "se_run");
  assert.equal(recs[0].outcome, "rejected");
});

test("manual mode: tick info at start, ticks walk the whole machine to end", async () => {
  const { Session } = await import("../engine/session.ts");
  const s = new Session(freshRoot());
  const info = s.tickInfo() as { active: string[]; states: { kind: string }[] };
  assert.deepEqual(info.active, ["start"]);
  assert.equal(info.states[0].kind, "start");
  await s.tickAdvance(); // main/start -> boot's mechanical start (one position per tick)
  assert.deepEqual(s.active(), ["boot/start"]);
  await s.tickAdvance();
  assert.deepEqual(s.active(), ["boot/read_contract"]);
  // the read gate holds the manual walk too — until the docs are CHECKED
  await assert.rejects(() => s.tickAdvance(), (e) => (e as { clause?: string }).clause === "SE-C-112");
  checkDocs(s); // the mirror's checkboxes — one per doc version
  await s.tickAdvance();
  assert.deepEqual(s.active(), ["boot/prepare_idle"]);
  await s.tickAdvance(); // prepare_idle -> boot's visible end position
  assert.deepEqual(s.active(), ["boot/end"]);
  await s.tickAdvance(); // pop back to main: boot filled, idle
  assert.deepEqual(s.active(), ["idle"]);
  // idle is a hub now: an unnamed advance is refused, the tick must choose
  await assert.rejects(() => s.tickAdvance(), (e) => (e as { clause?: string }).clause === "SE-C-110");
  // a round trip through an (empty) generated container and back
  await s.tickAdvance("expeditions");
  assert.deepEqual(s.active(), ["expeditions/start"]);
  await s.tickAdvance(); // nothing open: start runs to end
  assert.deepEqual(s.active(), ["expeditions/end"]);
  await s.tickAdvance(); // pop: filled, back at idle
  assert.deepEqual(s.active(), ["idle"]);
  await s.tickAdvance("end");
  assert.equal((s.describe() as { status: string }).status, "closed");
});

});
