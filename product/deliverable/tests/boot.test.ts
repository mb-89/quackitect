// The main machine and the state gate — the session's first law: nothing
// before boot, the boot sub-machine one step at a time, everything logged,
// nothing after exit.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileMachine } from "../engine/machines/compile.ts";
import { mainMachinePath } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, freshRoot } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

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
  assert.deepEqual(m.states.find((s) => s.id === "read_contract")!.legal_tools, ["se_boot"]);
});

test("at start every lane tool is refused with se_boot as the remedy", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_file_list", { dir: "." });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-110");
  assert.equal((r.body.remedy as { tool: string }).tool, "se_boot");
});

test("se_state is always legal — even before boot (observability is never gated)", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_state");
  assert.equal(r.isError, false);
  assert.deepEqual(r.body.active, ["start"]);
  assert.ok((r.body.legal_tools as string[]).includes("se_boot"));
});

test("boot walks the sub-machine step by step, gated by the read confirmation", async () => {
  const server = buildServer(freshRoot());
  const s1 = await call(server, "se_boot");
  assert.equal(s1.isError, false);
  assert.equal(s1.body.phase, "boot/read_contract");
  assert.ok(String(s1.body.guidance).includes("AGENTS.md"));
  // mid-boot, the lane is still shut and se_state shows the nested position
  const mid = await call(server, "se_state");
  assert.deepEqual(mid.body.active, ["boot/read_contract"]);
  const shut = await call(server, "se_run", { command: "echo nope" });
  assert.equal(shut.body.clause, "SE-C-110");
  // the leave condition bites: se_boot WITHOUT the confirmation is refused
  const unread = await call(server, "se_boot");
  assert.equal(unread.isError, true);
  assert.equal(unread.body.clause, "SE-C-112");
  assert.equal((unread.body.remedy as { args: { confirm_read: boolean } }).args.confirm_read, true);
  const s2 = await call(server, "se_boot", { confirm_read: true });
  assert.equal(s2.body.phase, "boot/prepare_idle");
  const s3 = await call(server, "se_boot");
  assert.equal(s3.body.booted, true);
  assert.ok(String(s3.body.banner).includes("main machine @ idle"));
  const again = await call(server, "se_boot");
  assert.equal(again.isError, true);
  assert.equal(again.body.clause, "SE-C-110");
});

test("idle opens the whole lane; se_exit closes it; after done only se_state answers", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  const w = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
  assert.equal(w.isError, false);
  const exit = await call(server, "se_exit");
  assert.equal(exit.isError, false);
  assert.ok(String(exit.body.banner).includes("closed"));
  const after = await call(server, "se_file_read", { path: "x.md" });
  assert.equal(after.isError, true);
  assert.equal(after.body.clause, "SE-C-110");
  const state = await call(server, "se_state");
  assert.equal(state.body.status, "closed");
});

test("the gate is logged like everything else — a refused pre-boot call lands in the log", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  await call(server, "se_run", { command: "echo nope" }); // refused at start
  for (let i = 0; i < 3; i++) await call(server, "se_boot", { confirm_read: true }); // walk to idle
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
  s.tickAdvance(); // main/start -> boot's mechanical start (one position per tick)
  assert.deepEqual(s.active(), ["boot/start"]);
  s.tickAdvance();
  assert.deepEqual(s.active(), ["boot/read_contract"]);
  // the leave condition holds the manual walk too — until evidence lands
  assert.throws(() => s.tickAdvance(), (e) => (e as { clause?: string }).clause === "SE-C-112");
  s.submitEvidence("read_contract", { read_confirmed: true, by: "human" });
  s.tickAdvance();
  assert.deepEqual(s.active(), ["boot/prepare_idle"]);
  s.tickAdvance(); // prepare_idle -> boot's visible end position
  assert.deepEqual(s.active(), ["boot/end"]);
  s.tickAdvance(); // pop back to main: boot filled, idle
  assert.deepEqual(s.active(), ["idle"]);
  s.tickAdvance(); // idle -> end
  assert.equal((s.describe() as { status: string }).status, "closed");
});

test("the mirror renders ONLY the current machine, with breadcrumbs", async () => {
  const { Session } = await import("../engine/session.ts");
  const { renderMirror } = await import("../engine/render.ts");
  const root = freshRoot();
  const s = new Session(root);
  // At main/start: the main canvas only.
  let html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes(`>idle</text>`));
  assert.ok(!html.includes(`>read_contract</text>`), "sub-machine states are NOT drawn while in main");
  // Step into boot: the boot canvas only, breadcrumb main › boot.
  s.tickAdvance();
  html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes(`>read_contract</text>`));
  assert.ok(!html.includes(`>idle</text>`), "main states are NOT drawn while in the sub");
  assert.ok(html.includes("class=\"here\">boot"), "breadcrumb marks the machine the walk is in");
  assert.ok(html.includes("data-detail=\"state:read_contract\""), "states are clickable for details");
  assert.ok(html.includes("class=\"expand\""), "widgets carry expand buttons");
});

test("the view is independent of the walk: browse boot while standing at main/start", async () => {
  const { Session } = await import("../engine/session.ts");
  const { renderMirror } = await import("../engine/render.ts");
  const root = freshRoot();
  const s = new Session(root); // walk at main/start
  const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }, undefined, "boot");
  assert.ok(html.includes(`>read_contract</text>`), "viewer entered boot");
  assert.ok(!html.includes("state active"), "no live highlight — the walk is not here");
  assert.ok(html.includes(`href="/?view=main"`), "breadcrumb navigates back out");
  // and on main, the sub state is drawn with a double border + crumb menu lists it
  const main = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.ok(main.includes(`data-sub="boot"`), "sub-machine state is double-click enterable");
  assert.ok(main.includes("state inner"), "double border drawn");
  assert.ok(main.includes("crumb-menu"), "breadcrumb arrow lists selectable sub-machines");
});
