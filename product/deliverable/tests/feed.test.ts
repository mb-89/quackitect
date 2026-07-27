// THE UNIFIED FEED + DECISION GRAPH + TOLL (owner design, v2 i9 notes;
// built 2026-07-26): every hand's act is one log line; updates are ops on a
// per-state decision tree; the toll forces narration only after a lapse and
// one ignored warning. No ETA anywhere — timestamps are the engine's.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { Decisions, parseUpdate, replayFile } from "../engine/decisions.ts";
import { readNotes } from "../engine/inbox.ts";
import { seDir } from "../engine/paths.ts";
import { feedRows, renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, readHashesFor } from "./helpers.ts";

function clause(e: unknown): string | undefined {
  return (e as { clause?: string }).clause;
}

test("the decision graph: plan, fork, resolve — everything started gets resolved", () => {
  const d = new Decisions(mkdtempSync(join(tmpdir(), "se-dec-")));
  d.apply("s@0", parseUpdate({ op: "plan", items: ["build the pane", "test it"] })); // d1 d2
  let g = d.graph("s@0");
  assert.equal(g.nodes.length, 2);
  assert.equal(g.active, "d1");
  // An unplanned discovery forks WHERE YOU ARE (active = d1), with its own checklist.
  d.apply("s@0", parseUpdate({ op: "fork", brief: "deps missing", items: ["npm install"] })); // d3 under d1, d4 under d3
  g = d.graph("s@0");
  assert.equal(g.active, "d3");
  assert.equal(g.nodes.find((n) => n.id === "d3")?.parent, "d1");
  assert.equal(g.nodes.find((n) => n.id === "d4")?.parent, "d3");
  // done over an open child is refused — resolve children first.
  assert.throws(() => d.apply("s@0", parseUpdate({ op: "done", node: "d3" })), (e) => clause(e) === "SE-C-122");
  d.apply("s@0", parseUpdate({ op: "done", node: "d4", brief: "installed" }));
  d.apply("s@0", parseUpdate({ op: "done", node: "d3" }));
  // Closing the fork lands the hand back on the nearest open ancestor.
  assert.equal(d.graph("s@0").active, "d1");
  // Obsoleting a branch sweeps it visibly, never silently.
  d.apply("s@0", parseUpdate({ op: "fork", brief: "wrong turn", items: ["a", "b"] })); // d5, d6 d7
  d.apply("s@0", parseUpdate({ op: "obsolete", node: "d5", brief: "not needed" }));
  g = d.graph("s@0");
  assert.equal(g.nodes.find((n) => n.id === "d6")?.status, "obsolete");
  assert.match(String(g.nodes.find((n) => n.id === "d6")?.resolution), /swept with d5/);
  // A dead ref never fakes progress; garbage never parses.
  assert.throws(() => d.apply("s@0", parseUpdate({ op: "done", node: "d99" })), (e) => clause(e) === "SE-C-121");
  assert.throws(() => parseUpdate({ op: "sprint" }), (e) => clause(e) === "SE-C-120");
  assert.throws(() => parseUpdate("not json"), (e) => clause(e) === "SE-C-120");
  // The string form (a harness without the declared property) parses too.
  const op = parseUpdate(JSON.stringify({ op: "update", brief: "still here" }));
  assert.equal(op.op, "update");
  assert.deepEqual(d.visits(), ["s@0"]);
});

test("the toll: armed after boot, one grace warning, then the refusal — any op pays", async () => {
  let t = 1_000_000_000;
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session, { now: () => t });
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.isError) throw new Error(JSON.stringify(step.body));
    if (step.body.booted === true) break;
  }
  // The first call after boot arms the toll — no warning inside the window.
  let r = await call(server, "se_tick", {});
  assert.equal(r.body.toll_warning, undefined);
  // Six silent minutes: the next call PASSES, carrying the grace warning.
  t += 6 * 60 * 1000;
  r = await call(server, "se_tick", {});
  assert.equal(r.isError, false);
  assert.match(String(r.body.toll_warning), /update overdue/);
  // Ignoring the warning earns the refusal, with the resend inline.
  r = await call(server, "se_tick", {});
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-040");
  assert.equal((r.body.remedy as { args: { update?: unknown } }).args.update !== undefined, true);
  // Paying on the same call proceeds — and the op lands in graph AND log.
  r = await call(server, "se_tick", { update: { op: "plan", items: ["wire the pane", "test it"] } });
  assert.equal(r.isError, false);
  const g = session.decisions.graph(session.currentVisit());
  assert.equal(g.nodes.length, 2);
  const q = await call(server, "se_log_query", { filter: { tool: "se_update" } });
  assert.equal((q.body as { total?: number }).total, 1);
  // The window is reset; the very next call is clean.
  r = await call(server, "se_tick", {});
  assert.equal(r.body.toll_warning, undefined);
});

test("se_note is legal in EVERY state — a stray is captured where it strikes", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  // Mid-boot, no tick yet: the state gate lets the note through.
  const n1 = await call(server, "se_note", { text: "a stray idea" });
  assert.equal(n1.isError, false);
  assert.match(String(n1.body.captured), /^note-/);
  const n2 = await call(server, "se_note", { text: "another" });
  assert.equal(n2.body.inbox, 2);
});

test("the render lint: the update lane refuses what renders weird", () => {
  assert.throws(() => parseUpdate({ op: "update", brief: "line one\nline two" }), (e) => (e as { clause?: string }).clause === "SE-C-120");
  assert.throws(() => parseUpdate({ op: "update", brief: "x".repeat(91) }), (e) => (e as { clause?: string }).clause === "SE-C-120");
  assert.throws(() => parseUpdate({ op: "update", brief: "one, two, three" }), (e) => (e as { clause?: string }).clause === "SE-C-120");
  assert.throws(() => parseUpdate({ op: "plan", items: ["fine", "also fine, still fine, too many"] }), (e) => (e as { clause?: string }).clause === "SE-C-120");
  const ok = parseUpdate({ op: "update", brief: "short and clean — two parts, fine" });
  assert.equal(ok.op, "update");
  // defer demands node AND to.
  assert.throws(() => parseUpdate({ op: "defer", node: "d1" }), (e) => (e as { clause?: string }).clause === "SE-C-120");
  const d = parseUpdate({ op: "defer", node: "d1", to: "idle" });
  assert.equal(d.to, "idle");
});

test("replay: parked defers and open points survive an engine life", () => {
  const root = freshRoot();
  const dir = seDir(root);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "decisions.jsonl"), [
    JSON.stringify({ op: "plan", visit: "e1@0", nodes: [{ id: "d1", brief: "a" }, { id: "d2", brief: "b" }] }),
    JSON.stringify({ op: "done", visit: "e1@0", node: "d1" }),
    JSON.stringify({ op: "defer", visit: "e1@0", node: "d2", brief: "b", to: "idle" }),
  ].join("\n") + "\n", "utf8");
  // The file's replayed truth BEFORE arrival: nothing open, one parked.
  const before = replayFile(join(dir, "decisions.jsonl"));
  assert.equal(before.open.length, 0, "d1 done, d2 deferred — no open point");
  assert.equal(before.parked.length, 1);
  assert.equal(before.parked[0].state, "idle");
  assert.equal(before.parked[0].brief, "b");
  // A fresh engine life: the parked point re-arms and arrives at idle.
  const s = new Session(root);
  const arrived = s.decisions.graph("idle@0").nodes;
  assert.equal(arrived.length, 1);
  assert.equal(arrived[0].brief, "b");
  assert.equal(arrived[0].status, "open");
  // After arrival the file says so too: the to-do is open, nothing parked.
  const after = replayFile(join(dir, "decisions.jsonl"));
  assert.equal(after.parked.length, 0);
  assert.equal(after.open.length, 1);
  assert.equal(after.open[0].brief, "b");
});

test("defer parks a point for a later state — it arrives there as an open to-do", () => {
  const s = new Session(freshRoot());
  s.decisions.apply("e1@0", { op: "plan", items: ["doable here", "needs idle"] });
  const park = s.decisions.graph("e1@0").nodes.find((n) => n.brief === "needs idle")!;
  s.decisions.apply("e1@0", { op: "defer", node: park.id, to: "idle" });
  assert.equal(s.decisions.graph("e1@0").nodes.find((n) => n.id === park.id)!.status, "deferred");
  // Deferred is not open — the evidence check passes over it.
  assert.equal(s.decisions.openFor(["e1"]).length, 1, "only the doable point stays open");
  // First touch of the target state materializes it — once.
  const arrived = s.decisions.graph("idle@0").nodes;
  assert.equal(arrived.length, 1);
  assert.equal(arrived[0].brief, "needs idle");
  assert.equal(arrived[0].status, "open");
  assert.equal(s.decisions.graph("idle@0").nodes.length, 1);
});

test("the defer cap: three hops, then the wall forces a decision", () => {
  const s = new Session(freshRoot());
  s.decisions.apply("a@0", { op: "plan", items: ["wanderer"] });
  let node = s.decisions.graph("a@0").nodes[0];
  s.decisions.apply("a@0", { op: "defer", node: node.id, to: "b" });
  node = s.decisions.graph("b@0").nodes[0];
  s.decisions.apply("b@0", { op: "defer", node: node.id, to: "c" });
  node = s.decisions.graph("c@0").nodes[0];
  s.decisions.apply("c@0", { op: "defer", node: node.id, to: "d" });
  node = s.decisions.graph("d@0").nodes[0];
  assert.equal(node.hops, 3);
  assert.deepEqual(node.trail, ["a", "b", "c", "d"]);
  assert.throws(
    () => s.decisions.apply("d@0", { op: "defer", node: node.id, to: "e" }),
    (e) => clause(e) === "SE-C-122" && /a → b → c → d/.test((e as { expected: string }).expected),
  );
});

test("the unified feed derives src, type and brief — and the mirror carries the log pane", () => {
  const root = freshRoot();
  const session = new Session(root);
  const log = new CallLog(seDir(root));
  log.append({ tool: "se_file_read", args: { path: "product/x.md" }, ok: true, outcome: "result", duration_ms: 1 });
  log.append({ tool: "mirror_check", args: { path: "product/guidance/voice.md" }, ok: true, outcome: "result", duration_ms: 1 });
  log.append({ tool: "se_update", args: { via: "se_tick", visit: "idle@0", op: "plan", nodes: [{ id: "d1", brief: "x" }] }, ok: true, outcome: "result", duration_ms: 0 });
  log.append({ tool: "se_update", args: { via: "se_tick", visit: "idle@0", op: "update", brief: "working" }, ok: true, outcome: "result", duration_ms: 0 });
  log.append({ tool: "se_note", args: { text: "stray" }, ok: true, outcome: "result", duration_ms: 0 });
  log.append({ tool: "se_run", args: { command: "boom" }, ok: false, outcome: "rejected", duration_ms: 1, response: { clause: "SE-C-046" } });
  const { rows, capped } = feedRows(log, "1970-01-01T00:00:00.000Z");
  assert.equal(capped, false);
  assert.equal(rows.length, 6);
  assert.deepEqual(rows.map((r) => r.src), ["agent", "human", "agent", "agent", "agent", "agent"]);
  // Updates are NARRATION, whatever their op — bold in the pane (owner
  // ruling 2026-07-27, superseding the op-note-as-note reading). Only
  // se_note strays are retro notes (italic). Two kinds, never conflated.
  assert.deepEqual(rows.map((r) => r.type), ["call", "call", "update", "update", "note", "call"]);
  assert.match(String(rows[0].brief), /read product\/x\.md/);
  assert.match(String(rows[1].brief), /check/);
  assert.match(String(rows[3].brief), /update: working/);
  assert.equal(rows[3].visit, "idle@0");
  assert.equal(rows[5].clause, "SE-C-046");
  // PENDING STRAYS SURVIVE SESSIONS: an earlier session's note rides on top
  // of the feed; one minted within the session window is not doubled (it
  // already rides as its se_note call).
  writeFileSync(join(seDir(root), "notes.jsonl"),
    JSON.stringify({ ref: "note-old", text: "from an earlier session", at: "2000-01-02T03:04:05.000Z" }) + "\n" +
    JSON.stringify({ ref: "note-new", text: "this session", at: "2999-01-01T00:00:00.000Z" }) + "\n");
  const withPending = feedRows(log, "2020-01-01T00:00:00.000Z", readNotes(seDir(root)));
  assert.equal(withPending.rows[0].ref, "note-old");
  assert.equal(withPending.rows[0].type, "note");
  assert.equal(withPending.rows[0].pending, true);
  assert.equal(withPending.rows.filter((r) => r.ref === "note-new").length, 0);
  // The sidebar: log pane present WITH a log, absent without.
  const withLog = renderMirror({ session, root, lastPacket: undefined, mode: "manual", log });
  assert.ok(withLog.includes('id="w-log"'));
  assert.ok(withLog.includes('id="log-filter"'));
  // The slider carries the authored levels as notches (shortcuts + help);
  // uniform 0.2 bands: the killer anchor sits at 0.8, ideation at 1.
  assert.ok(withLog.includes("thr-notch"));
  assert.ok(withLog.includes('id="thr-ticks"'));
  assert.ok(withLog.includes('data-level="0.8"'));
  // The shutdown control rides beside it.
  assert.ok(withLog.includes('id="sd"'));
  // Parity surfaces: the modal, the human note input.
  assert.ok(withLog.includes('id="modal"'));
  assert.ok(withLog.includes('id="log-note"'));
  const bare = renderMirror({ session, root, lastPacket: undefined, mode: "manual" });
  assert.ok(!bare.includes('id="w-log"'));
  // The client script must PARSE — a syntax error would kill the whole
  // mirror silently. new Function parses without executing.
  for (const m of withLog.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => new Function(m[1].replace(/^window\.SE_DATA =/, "var SE_DATA =")));
  }
});

test("the update rides any tool call, is stripped before the handler, and never trips the arg guards", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  // Boot the walk so a work tool is legal, then ride an update on it.
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  const r = await call(server, "se_file_list", { dir: ".", update: { op: "fork", brief: "looking around" } });
  assert.equal(r.isError, false, JSON.stringify(r.body));
  assert.equal(session.decisions.graph(session.currentVisit()).nodes.length, 1);
  // A malformed update refuses the CALL with the shape in the remedy.
  const bad = await call(server, "se_file_list", { dir: ".", update: { op: "sprint" } });
  assert.equal(bad.isError, true);
  assert.equal(bad.body.clause, "SE-C-120");
});
