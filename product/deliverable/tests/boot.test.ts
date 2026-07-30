// The main machine and the state gate — the session's first law: nothing
// before boot, the boot sub-machine one step at a time, everything logged,
// nothing after exit.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileMachine } from "../engine/machines/compile.ts";
import { mainMachinePath, Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, checkDocs, freshRoot, readHashesFor } from "./helpers.ts";

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

test("se_panel is legal anywhere — and honestly not-configured without a mirror", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_panel", {});
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-106", JSON.stringify(r.body));
});

test("se_panel ping: the agent points and every open window is told", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.mirrorUrl = "http://localhost:0/"; // a listening mirror, as far as the tool checks
  const server = buildServer(root, session);
  const r = await call(server, "se_panel", { ping: "log", note: "look at the feed" });
  assert.equal(r.isError, false, JSON.stringify(r.body));
  assert.equal(r.body.pinged, "log");
  assert.deepEqual(session.ping, { target: "log", note: "look at the feed", seq: 1 });
  // A second ping bumps the seq — the page pulses on every new one.
  await call(server, "se_panel", { ping: "gate-kickoff" });
  assert.equal(session.ping?.seq, 2);
  assert.equal(session.ping?.target, "gate-kickoff");
  // An empty target refuses — pointing at nothing is a mistake, not a pulse.
  const empty = await call(server, "se_panel", { ping: "  " });
  assert.equal(empty.isError, true);
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

test("ticks are ATOMIC: a stale `from` is refused, the matching one moves", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  // The agent plans a move from idle; the human walks into the archive meanwhile.
  checkDocs(session);
  await session.tickAdvance("expedition_archive");
  const stale = await call(server, "se_tick", { from: "idle", to: "end", read_hashes: hashes });
  assert.equal(stale.isError, true);
  assert.equal(stale.body.clause, "SE-C-114");
  assert.match(String(stale.body.expected), /expedition_archive/);
  // From the real position the move flows (bare sub-state ids match too).
  const onward = await call(server, "se_tick", { from: "expedition_archive/start", advance: true, read_hashes: hashes });
  assert.equal(onward.isError, false, JSON.stringify(onward.body));
});

test("se_reload: refused off-idle, dry-runs its canary at idle", async () => {
  const server = buildServer(freshRoot());
  const early = await call(server, "se_reload", {});
  assert.equal(early.isError, true);
  assert.equal(early.body.clause, "SE-C-110", "not legal before idle");
  const booted = await bootedServer(freshRoot());
  const r = await call(booted, "se_reload", {});
  assert.equal(r.isError, false, JSON.stringify(r.body));
  assert.equal(r.body.reload, "dry");
});

test("repair mode: a RED exit script arms the state's repair tools", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await session.tickAdvance(); await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance();
  assert.deepEqual(session.active(), ["boot/prepare_idle"]);
  // Green or not-yet-run: the file lane stays shut.
  const shut = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
  assert.equal(shut.body.clause, "SE-C-110");
  // The suite fails — the engine records it; the repair tools open up.
  session.submitEvidence("prepare_idle", { script_result: { ok: false, output: "1 failing test" } });
  const fix = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
  assert.equal(fix.isError, false, JSON.stringify(fix.body));
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
  await s.tickAdvance();
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

test("conditions are worked only from inside the state — no pre-running", async () => {
  const { Session } = await import("../engine/session.ts");
  const s = new Session(freshRoot());
  // the condition script never pre-runs, and running it from outside is refused
  await assert.rejects(() => s.scriptRun("prepare_idle"), (e) => (e as { clause?: string }).clause === "SE-C-112");
  // evidence for a state you are not standing in is refused
  assert.throws(() => s.submitEvidence("read_contract", { read_confirmed: true }), (e) => (e as { clause?: string }).clause === "SE-C-112");
});

test("jump back: downstream superseded, script evidence invalidated; human checks persist per version", async () => {
  const { Session } = await import("../engine/session.ts");
  const s = new Session(freshRoot());
  // walk to idle
  await s.tickAdvance(); await s.tickAdvance();
  checkDocs(s);
  await s.tickAdvance(); await s.tickAdvance(); await s.tickAdvance();
  assert.deepEqual(s.active(), ["idle"]);
  // jump back into boot from main: re-enters at the sub's start
  s.jumpBack("boot");
  assert.deepEqual(s.active(), ["boot/start"]);
  // the CHECKS persist (one per doc version — the docs did not change),
  // so the human re-walk flows; the preflight script must re-earn its 0.
  await s.tickAdvance();
  assert.deepEqual(s.active(), ["boot/read_contract"]);
  await s.tickAdvance();
  assert.deepEqual(s.active(), ["boot/prepare_idle"]);
  const prepare = s.currentMachine().states.find((x) => x.id === "prepare_idle")!;
  assert.equal(s.scriptStatus(s.currentMachine(), prepare).ran, false, "script evidence was invalidated by the jump");
  // the record survives: superseded entries, never erased
  assert.ok(s.instance.history.some((h) => h.outcome === "superseded"));
  // a never-filled state is not a jump target
  assert.throws(() => s.jumpBack("end"), (e) => (e as { clause?: string }).clause === "SE-C-110");
});

test("jump back leaves nothing green: the nested walk's record is superseded too", async () => {
  const { Session } = await import("../engine/session.ts");
  const s = new Session(freshRoot());
  await s.tickAdvance(); await s.tickAdvance();
  checkDocs(s);
  await s.tickAdvance(); await s.tickAdvance(); await s.tickAdvance();
  s.jumpBack("boot");
  const filled = s.instance.history.filter((h) => h.outcome === "filled").map((h) => h.state);
  assert.ok(!filled.some((f) => f.startsWith("boot/")), `boot walk entries still filled: ${filled}`);
});

test("the agent can peek at any state without moving — the click, as a tool", async () => {
  const server = buildServer(freshRoot());
  const peek = await call(server, "se_tick", { state: "idle" });
  assert.equal(peek.isError, false);
  assert.equal(peek.body.id, "idle");
  assert.ok(String(peek.body.guidance).length > 0);
  const still = await call(server, "se_tick");
  assert.deepEqual(still.body.active, ["start"]);
  const unknown = await call(server, "se_tick", { state: "nope" });
  assert.equal(unknown.isError, true);
});

test("every script block the mirror serves is valid JavaScript — a broken block kills all handlers", async () => {
  const { Session } = await import("../engine/session.ts");
  const { renderMirror } = await import("../engine/render.ts");
  const root = freshRoot();
  const s = new Session(root);
  const pages = [
    renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }),
    renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }, undefined, "boot"),
    renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }, "machine"),
    renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }, "details"),
  ];
  for (const [p, page] of pages.entries()) {
    const blocks = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    assert.ok(blocks.length >= 1, `page ${p} serves scripts`);
    for (const [b, code] of blocks.entries()) {
      assert.doesNotThrow(() => new Function(code), `page ${p} script block ${b} must parse`);
    }
  }
});

test("expeditions: worktree lifecycle — new, bind, work lands in the worktree, close merges", async () => {
  const { Session } = await import("../engine/session.ts");
  const { spawnSync } = await import("node:child_process");
  const { readFileSync, existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const root = freshRoot();
  const g = (...a: string[]) => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8" });
    assert.equal(r.status, 0, `git ${a.join(" ")}: ${r.stderr}`);
  };
  g("init", "-q", "-b", "v3");
  g("add", "-A");
  g("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "seed");
  g("config", "user.name", "t"); g("config", "user.email", "t@t");

  const s = new Session(root);
  const minted = s.expeditionNew("spike", "Try The Thing!") as { created: string };
  assert.match(minted.created, /^e1-spike-try-the-thing/);
  // The RECORD is minted with the expedition, on its branch — the list
  // serves its frontmatter.
  const open1 = (s.expeditionList() as { open: { id: string; goal?: string; status?: string }[] }).open;
  assert.equal(open1.length, 1);
  assert.equal(open1[0].id, minted.created);
  assert.equal(open1[0].goal, "Try The Thing!");
  assert.equal(open1[0].status, "open");

  // bind: the lane's working root switches to the worktree
  s.expeditionOpen(minted.created);
  assert.ok(s.workRoot().includes(".worktrees"), "bound root is the worktree");
  const { fileWrite } = await import("../engine/files.ts");
  fileWrite(s.workRoot(), "scratch.md", "expedition work", null);
  assert.ok(existsSync(join(s.workRoot(), "scratch.md")));
  assert.ok(!existsSync(join(root, "scratch.md")), "main tree untouched while bound");

  // While bound, decision ops land in the RECORD too (parts per visit).
  s.decisions.apply("continue_expedition/work@0", { op: "update", brief: "working in the record" });
  const recDir = join(s.workRoot(), "product", "spec", "expeditions", minted.created);
  assert.ok(readFileSync(join(recDir, "decisions.jsonl"), "utf8").includes("working in the record"));

  // Closing without a REPORT is refused — an expedition ends with one.
  assert.throws(() => s.expeditionClose(true), (e) => (e as { clause?: string }).clause === "SE-C-112");

  // THE LEAVE GATE: entry_evidence_form on leave — unmet until the record's
  // page passes the lint; filling it through the form machinery creates
  // report.md, which also satisfies the close guard.
  const { generateContinueExpedition, shortId } = await import("../engine/expmachine.ts");
  const gen = generateContinueExpedition(root);
  const leave = gen.decl.states.find((st) => st.id === `${shortId(minted.created)}-leave`)!;
  assert.deepEqual(leave.entry?.evidence_form, ["expedition-leave"]);
  assert.equal(s.conditionKeyMet(gen.decl, leave, "evidence_form", "enter"), false, "no page yet");
  // Agent PREFILL stays inert: the human confirms it, then the page passes.
  s.formSave("expedition-leave", {
    "What was the goal": "<!-- try the thing -->",
    "What was done": "did it",
    "What settled it": "the test run",
    "What was not done": "nothing",
  });
  s.formDone("expedition-leave", "agent");
  assert.equal(s.conditionKeyMet(gen.decl, leave, "evidence_form", "enter"), false, "unconfirmed prefill blocks the page");
  s.formConfirm("expedition-leave", "What was the goal", 0);
  s.formDone("expedition-leave", "human");
  assert.equal(s.conditionKeyMet(gen.decl, leave, "evidence_form", "enter"), true, "confirmed + done passes the lint");

  // close: leftovers committed, merged back, worktree gone, lane unbound
  const closed = s.expeditionClose(true) as { merged: boolean };
  assert.equal(closed.merged, true);
  assert.equal(s.workRoot(), root);
  assert.equal(readFileSync(join(root, "scratch.md"), "utf8"), "expedition work");
  // CLOSED RECORDS LIVE IN GIT (owner ruling 2026-07-28): the close
  // retires the record dir from the tree; the branch serves it, stamped
  // closed + applied — the close IS the ruling (owner 2026-07-27).
  assert.equal(existsSync(join(root, "product", "spec", "expeditions", minted.created)), false, "the record dir left the tree");
  const rec = spawnSync("git", ["show", `exp/${minted.created}:product/spec/expeditions/${minted.created}/record.md`], { cwd: root, encoding: "utf8" }).stdout;
  assert.match(rec, /^status: closed$/m);
  assert.match(rec, /^ruling: applied$/m);
  assert.equal((s.expeditionList() as { open: unknown[] }).open.length, 0);
  const arch = (s.expeditionList() as { archive: { id: string; status?: string; ruling?: string }[] }).archive;
  assert.equal(arch[0].id, minted.created);
  assert.equal(arch[0].status, "closed");
  assert.equal(arch[0].ruling, "applied");
});

test("escape goes to idle and only to idle: the walk is left standing, the reason is recorded, boot is exempt", async () => {
  const { Session } = await import("../engine/session.ts");
  const { buildServer } = await import("../engine/tools.ts");
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  // Into boot: escape is refused — boot must complete.
  await call(server, "se_tick", { advance: true, read_hashes: hashes });
  const noBoot = await call(server, "se_tick", { escape: "stuck" });
  assert.equal(noBoot.isError, true);
  assert.equal(noBoot.body.clause, "SE-C-110");
  // Boot to idle, then enter a sub-machine and escape from inside it.
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  session.setAutonomy(1);
  await call(server, "se_tick", { to: "expeditions", read_hashes: hashes });
  assert.deepEqual(session.active(), ["expeditions/start"]);
  const esc = await call(server, "se_tick", { escape: "cannot continue: test blockage", read_hashes: hashes });
  assert.equal(esc.isError, false, JSON.stringify(esc.body));
  assert.deepEqual(session.active(), ["idle"], "escape lands at idle");
  assert.equal(session.instance.escapes.length, 1);
  assert.match(session.instance.escapes[0].exhausted_guard, /test blockage/);
  assert.ok(session.instance.history.some((h) => h.outcome === "escaped"), "the escape is a recorded failure");
  // The machine was LEFT STANDING — re-entering starts it over, gray.
  assert.deepEqual(session.viewRun("expeditions").done, []);
  // An empty reason is refused; at the main machine there is nothing to escape.
  const empty = await call(server, "se_tick", { escape: "  " });
  assert.equal(empty.isError, true);
  assert.equal(empty.body.clause, "SE-C-046");
  const atMain = await call(server, "se_tick", { escape: "nope" });
  assert.equal(atMain.isError, true);
  assert.equal(atMain.body.clause, "SE-C-110");
});

// PAUSE IS NOT ESCAPE (owner ruling 2026-07-29). An expedition is a day's
// bucket and is MEANT to stay open, so stepping out of one is ordinary work.
// Escape's MOVE was already right; its RECORD was wrong. It files an
// exhausted_guard, and the retro mines those for genuine blockages — so
// routine stepping-out would have drowned the signal it depends on.
test("pause leaves the machine standing like escape, but records no failure", async () => {
  const { Session } = await import("../engine/session.ts");
  const { buildServer } = await import("../engine/tools.ts");
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 9; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  session.setAutonomy(1);
  await call(server, "se_tick", { to: "expeditions", read_hashes: hashes });
  assert.deepEqual(session.active(), ["expeditions/start"]);

  const p = await call(server, "se_tick", { pause: "stepping out to reload the engine, picking this up later", read_hashes: hashes });
  assert.equal(p.isError, false, JSON.stringify(p.body));
  assert.deepEqual(session.active(), ["idle"], "pause lands at idle, exactly like escape");
  // The MOVE is identical — the machine is left standing, nothing filled.
  assert.deepEqual(session.viewRun("expeditions").done, []);
  // The RECORD is not. This is the entire point of the op.
  assert.equal(session.instance.escapes.length, 0, "a pause is not an exhausted guard");
  assert.ok(session.instance.history.some((h) => h.outcome === "paused"));
  assert.equal(session.instance.history.some((h) => h.outcome === "escaped"), false);

  // Same discipline as escape: never a silent exit.
  const empty = await call(server, "se_tick", { pause: "   " });
  assert.equal(empty.isError, true);
  assert.equal(empty.body.clause, "SE-C-046");
});
