// THE UNIFIED FEED + DECISION GRAPH + TOLL (owner design, v2 i9 notes;
// built 2026-07-26): every hand's act is one log line; updates are ops on a
// per-state decision tree; the toll forces narration only after a lapse and
// one ignored warning. No ETA anywhere — timestamps are the engine's.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { Decisions, parseUpdate, replayFile, replayVisitsText } from "../engine/decisions.ts";
import { readNotes } from "../engine/inbox.ts";
import { seDir } from "../engine/paths.ts";
import { feedRows, renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { anyGuidanceDoc, call, freshRoot, pullBoot } from "./helpers.ts";

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
  assert.throws(
    () => d.apply("s@0", parseUpdate({ op: "done", node: "d3" })),
    (e) => clause(e) === "SE-C-122",
  );
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
  assert.throws(
    () => d.apply("s@0", parseUpdate({ op: "done", node: "d99" })),
    (e) => clause(e) === "SE-C-121",
  );
  assert.throws(
    () => parseUpdate({ op: "sprint" }),
    (e) => clause(e) === "SE-C-120",
  );
  assert.throws(
    () => parseUpdate("not json"),
    (e) => clause(e) === "SE-C-120",
  );
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
  await pullBoot(server, session);
  // A cheap, non-moving lane call carries the toll — the walk stands at
  // idle with no target, so a bare pull would only offer doors; a windowed
  // read is the neutral carrier here.
  const look = () => call(server, "se_file_read", { path: anyGuidanceDoc(), offset: 1, limit: 1 });
  // The first call after boot arms the toll — no warning inside the window.
  let r = await look();
  assert.equal(r.body.toll_warning, undefined);
  // Six silent minutes: the next call PASSES, carrying the grace warning.
  t += 6 * 60 * 1000;
  r = await look();
  assert.equal(r.isError, false);
  assert.match(String(r.body.toll_warning), /update overdue/);
  // Ignoring the warning earns the refusal, with the resend inline.
  r = await look();
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-040");
  assert.equal((r.body.remedy as { args: { update?: unknown } }).args.update !== undefined, true);
  // Paying on the same call proceeds — and the op lands in graph AND log.
  r = await call(server, "se_file_read", {
    path: anyGuidanceDoc(),
    offset: 1,
    limit: 1,
    update: { op: "plan", items: ["wire the pane", "test it"] },
  });
  assert.equal(r.isError, false);
  const g = session.decisions.graph(session.currentVisit());
  assert.equal(g.nodes.length, 2);
  const q = await call(server, "se_log_query", { filter: { tool: "se_update" } });
  assert.equal((q.body as { total?: number }).total, 1);
  // The window is reset; the very next call is clean.
  r = await look();
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
  assert.throws(
    () => parseUpdate({ op: "update", brief: "line one\nline two" }),
    (e) => (e as { clause?: string }).clause === "SE-C-120",
  );
  assert.throws(
    () => parseUpdate({ op: "update", brief: "x".repeat(91) }),
    (e) => (e as { clause?: string }).clause === "SE-C-120",
  );
  // A RESOLUTION'S chain still refuses — which part resolved the node is
  // not the engine's to guess.
  assert.throws(
    () => parseUpdate({ op: "done", node: "d1", brief: "one, two, three" }),
    (e) => (e as { clause?: string }).clause === "SE-C-120",
  );
  const ok = parseUpdate({ op: "update", brief: "short and clean — two parts, fine" });
  assert.equal(ok.op, "update");
  // defer demands node AND to.
  assert.throws(
    () => parseUpdate({ op: "defer", node: "d1" }),
    (e) => (e as { clause?: string }).clause === "SE-C-120",
  );
  const d = parseUpdate({ op: "defer", node: "d1", to: "front_desk" });
  assert.equal(d.to, "front_desk");
});

// THE MOST-HIT REFUSAL BECAME A CORRECTION (owner ruling 2026-08-02). The
// engine computed the split and threw it away — 174 refusals in one window.
// Narration that chains IS the plan it wanted to be, applied and announced.
test("a chained update brief is applied as the plan it wanted to be", () => {
  const r = parseUpdate({ op: "update", brief: "one, two, three" });
  assert.equal(r.op, "plan");
  assert.deepEqual(r.items, ["one", "two", "three"]);
  assert.equal(r.brief, undefined);
  assert.match(String(r.corrected), /landed as a plan/, "the conversion is announced, never silent");
});

test("a chained plan item is split into the items it listed", () => {
  const r = parseUpdate({ op: "plan", items: ["fine", "fine too", "a, b, c"] });
  assert.deepEqual(r.items, ["fine", "fine too", "a", "b", "c"]);
  assert.match(String(r.corrected), /split/, "announced");
});

test("the render lint still quotes what it refuses", () => {
  const got = (fn: () => unknown): string => {
    try {
      fn();
    } catch (e) {
      return String((e as { got?: string }).got ?? (e as Error).message);
    }
    throw new Error("expected a refusal");
  };

  const chain = got(() => parseUpdate({ op: "done", node: "d1", brief: "one, two, three" }));
  assert.match(chain, /one, two, three/, "the offending text is quoted back");
  assert.match(chain, /items:/, "and the remedy is named");
  for (const part of ["one", "two", "three"]) {
    assert.match(chain, new RegExp(`"${part}"`), `${part} comes back as its own item`);
  }

  // WHICH item, when an item trips a lint the split cannot cure.
  assert.match(
    got(() => parseUpdate({ op: "plan", items: ["fine", "fine too", "a\nb"] })),
    /item 3/,
    "the failing item is numbered",
  );

  // The other two lints quote the text too.
  assert.match(
    got(() => parseUpdate({ op: "update", brief: "a\nb" })),
    /\\n/,
    "the line break is shown, escaped",
  );
  assert.match(
    got(() => parseUpdate({ op: "update", brief: "y".repeat(91) })),
    /91 chars/,
  );
});

// THE LEAVE GATE COUNTS THE RECORD; the live graph replays one session's
// trail. e31's close was blocked by a node an earlier session left open,
// and no call could reach it — the record had to be repaired by hand.
test("a resolution reaches a node an earlier session's visit left open", () => {
  const root = freshRoot();
  const dir = seDir(root);
  mkdirSync(dir, { recursive: true });
  const rec = join(dir, "record-decisions.jsonl");
  writeFileSync(
    rec,
    JSON.stringify({ op: "plan", visit: "expeditions/e9@1", nodes: [{ id: "d173", brief: "rename product to project everywhere" }] }) +
      "\n",
    "utf8",
  );
  const d = new Decisions(dir);
  d.setExtraSink(rec);
  d.apply("expeditions/e9@0", { op: "done", node: "d173", brief: "the rename is finished" });
  const after = replayVisitsText(readFileSync(rec, "utf8"));
  const v = after.find((x) => x.visit === "expeditions/e9@1");
  assert.equal(v?.nodes.find((n) => n.id === "d173")?.status, "done", "the record shows the earlier visit's node resolved");
  // A repeat stays a no-op across sessions, exactly as within one.
  d.apply("expeditions/e9@0", { op: "done", node: "d173", brief: "the rename is finished" });
});

test("replay: parked defers and open points survive an engine life", () => {
  const root = freshRoot();
  const dir = seDir(root);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "decisions.jsonl"),
    `${[
      JSON.stringify({
        op: "plan",
        visit: "e1@0",
        nodes: [
          { id: "d1", brief: "a" },
          { id: "d2", brief: "b" },
        ],
      }),
      JSON.stringify({ op: "done", visit: "e1@0", node: "d1" }),
      JSON.stringify({ op: "defer", visit: "e1@0", node: "d2", brief: "b", to: "front_desk" }),
    ].join("\n")}\n`,
    "utf8",
  );
  // The file's replayed truth BEFORE arrival: nothing open, one parked.
  const before = replayFile(join(dir, "decisions.jsonl"));
  assert.equal(before.open.length, 0, "d1 done, d2 deferred — no open point");
  assert.equal(before.parked.length, 1);
  assert.equal(before.parked[0].state, "front_desk");
  assert.equal(before.parked[0].brief, "b");
  // A fresh engine life: the parked point re-arms and arrives at the front
  // desk. Boot lands there directly now (idle was removed), so that is the
  // state the deferred point re-materializes on.
  const s = new Session(root);
  const arrived = s.decisions.graph("front_desk@0").nodes;
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
  s.decisions.apply("e1@0", { op: "defer", node: park.id, to: "front_desk" });
  assert.equal(s.decisions.graph("e1@0").nodes.find((n) => n.id === park.id)?.status, "deferred");
  // Deferred is not open — the evidence check passes over it.
  assert.equal(s.decisions.openFor(["e1"]).length, 1, "only the doable point stays open");
  // First touch of the target state materializes it — once. Boot lands on
  // the front desk directly now (idle was removed), so that is the state
  // that owes the touch.
  const arrived = s.decisions.graph("front_desk@0").nodes;
  assert.equal(arrived.length, 1);
  assert.equal(arrived[0].brief, "needs idle");
  assert.equal(arrived[0].status, "open");
  assert.equal(s.decisions.graph("front_desk@0").nodes.length, 1);
});

test("replayVisitsText: a record's history renders per visit with statuses", () => {
  const text = `${[
    JSON.stringify({
      op: "plan",
      visit: "e9@0",
      parent: null,
      nodes: [
        { id: "d1", brief: "build" },
        { id: "d2", brief: "verify" },
      ],
    }),
    JSON.stringify({ op: "done", visit: "e9@0", node: "d1" }),
    JSON.stringify({ op: "update", visit: "e9-leave@0", node: "d3", brief: "closing" }),
    JSON.stringify({ op: "defer", visit: "e9@0", node: "d2", brief: "verify", to: "front_desk" }),
  ].join("\n")}\n`;
  const visits = replayVisitsText(text);
  assert.deepEqual(
    visits.map((v) => v.visit),
    ["e9@0", "e9-leave@0"],
  );
  const e9 = visits[0].nodes;
  assert.equal(e9.find((n) => n.id === "d1")?.status, "done");
  assert.equal(e9.find((n) => n.id === "d2")?.status, "deferred");
  assert.equal(visits[1].nodes[0].status, "done");
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
  log.append({
    tool: "se_file_read",
    args: { path: "x.md" },
    ok: true,
    outcome: "result",
    duration_ms: 1,
    part: "walker",
    state: "a-state",
    answered_by: "a-model",
  });
  log.append({
    tool: "mirror_check",
    args: { path: anyGuidanceDoc() },
    ok: true,
    outcome: "result",
    duration_ms: 1,
    part: "walker",
    state: "a-state",
    answered_by: "a-model",
  });
  log.append({
    part: "walker",
    state: "a-state",
    answered_by: "a-model",
    tool: "se_update",
    args: { via: "se_pull", visit: "idle@0", op: "plan", nodes: [{ id: "d1", brief: "x" }] },
    ok: true,
    outcome: "result",
    duration_ms: 0,
  });
  log.append({
    part: "walker",
    state: "a-state",
    answered_by: "a-model",
    tool: "se_update",
    args: { via: "se_pull", visit: "idle@0", op: "update", brief: "working" },
    ok: true,
    outcome: "result",
    duration_ms: 0,
  });
  log.append({
    tool: "se_note",
    args: { text: "stray" },
    ok: true,
    outcome: "result",
    duration_ms: 0,
    part: "walker",
    state: "a-state",
    answered_by: "a-model",
  });
  log.append({
    part: "walker",
    state: "a-state",
    answered_by: "a-model",
    tool: "se_run",
    args: { command: "boom" },
    ok: false,
    outcome: "rejected",
    duration_ms: 1,
    response: { clause: "SE-C-046" },
  });
  const { rows, capped } = feedRows(log, "1970-01-01T00:00:00.000Z");
  assert.equal(capped, false);
  assert.equal(rows.length, 6);
  assert.deepEqual(
    rows.map((r) => r.src),
    ["agent", "human", "agent", "agent", "agent", "agent"],
  );
  // Updates are NARRATION, whatever their op — bold in the pane (owner
  // ruling 2026-07-27, superseding the op-note-as-note reading). Only
  // se_note strays are retro notes (italic). Two kinds, never conflated.
  assert.deepEqual(
    rows.map((r) => r.type),
    ["call", "call", "update", "update", "note", "call"],
  );
  assert.match(String(rows[0].brief), /read x\.md/);
  assert.match(String(rows[1].brief), /check/);
  assert.match(String(rows[3].brief), /update: working/);
  assert.equal(rows[3].visit, "idle@0");
  assert.equal(rows[5].clause, "SE-C-046");
  // PENDING STRAYS SURVIVE SESSIONS: an earlier session's note rides on top
  // of the feed; one minted within the session window is not doubled (it
  // already rides as its se_note call).
  writeFileSync(
    join(seDir(root), "notes.jsonl"),
    JSON.stringify({ ref: "note-old", text: "from an earlier session", at: "2000-01-02T03:04:05.000Z" }) +
      "\n" +
      JSON.stringify({ ref: "note-new", text: "this session", at: "2999-01-01T00:00:00.000Z" }) +
      "\n",
  );
  const withPending = feedRows(log, "2020-01-01T00:00:00.000Z", readNotes(seDir(root)));
  assert.equal(withPending.rows[0].ref, "note-old");
  assert.equal(withPending.rows[0].type, "note");
  assert.equal(withPending.rows[0].pending, true);
  assert.equal(withPending.rows.filter((r) => r.ref === "note-new").length, 0);
  // The sidebar: log pane present WITH a log, absent without.
  const withLog = renderMirror({ session, root, lastPacket: undefined, mode: "manual", log });
  assert.ok(withLog.includes('id="w-log"'));
  assert.ok(withLog.includes('id="log-filter"'));
  // THE CONTROLS ARE SWITCHES, NEVER SLIDERS (owner sketch, 2026-08-01).
  // The rungs carry the authored levels, the cadence is two typed integers,
  // and the shutdown control is gone — it was a preference for something
  // that should never have been one.
  assert.ok(withLog.includes('class="rung'));
  // BY ABBREVIATION, NEVER BY VALUE. `data-level` is where a click LANDS, so
  // it changes with the dial's own position — asserting a number here made
  // the case a hostage of the default. The rung's letter is what a reader
  // sees and what scale.md authors.
  assert.ok(withLog.includes(">T<"), "the tactical rung is drawn");
  assert.ok(withLog.includes(">S<"), "the strategic rung is drawn");
  // The ids come from the panel spec's keys, not from this file's memory.
  assert.ok(withLog.includes('id="narration-minutes"') && withLog.includes('id="narration-calls"'), "the cadence is two line edits");
  assert.ok(withLog.includes('data-post="/narration-now"'), "NOW forces an update");
  assert.ok(!withLog.includes('type="range"'), "no slider survives anywhere on the bar");
  assert.ok(!withLog.includes('id="sd"'), "the shutdown control is gone");
  // Parity surfaces: the modal, the human note input.
  assert.ok(withLog.includes('id="modal"'));
  // The note row is its own panel now (note-entry.md), so its field carries
  // the spec's key rather than a hand-written id.
  assert.ok(withLog.includes('id="note-body"'));
  assert.ok(withLog.includes('id="note-priority"'), "the stray's MoSCoW sits beside it");
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
  await pullBoot(server, session);
  const r = await call(server, "se_file_list", { dir: ".", update: { op: "fork", brief: "looking around" } });
  assert.equal(r.isError, false, JSON.stringify(r.body));
  assert.equal(session.decisions.graph(session.currentVisit()).nodes.length, 1);
  // A MALFORMED UPDATE NEVER DESTROYS ITS CALL (owner ruling 2026-07-28).
  // This used to refuse the whole call, throwing the payload away over the
  // punctuation of a label riding beside it. The work lands; the complaint
  // rides home on the result, carrying the shape in its remedy as before.
  const bad = await call(server, "se_file_list", { dir: ".", update: { op: "sprint" } });
  assert.equal(bad.isError, false, "the call it rode on still went through");
  const refusedUpdate = bad.body.update_refused as { clause: string; note?: string };
  assert.equal(refusedUpdate.clause, "SE-C-120", "and the update was refused, visibly");
  assert.ok(String(refusedUpdate.note).includes("THE CALL WENT THROUGH"), "the reader is told which half failed");
  assert.equal(session.decisions.graph(session.currentVisit()).nodes.length, 1, "a refused update changed no graph");
});

// RESOLVING TWICE THE SAME WAY IS THE STATE WE WERE ASKED FOR (owner ruling
// 2026-07-28). The update rides before the call's verdict, and every remedy
// says to repeat the call — so a retry arrives with its resolution already
// applied. That used to refuse with a second, more confusing reason, and it
// was the single commonest refusal of the whole period.
test("a repeated resolution is a no-op; a conflicting one still refuses", () => {
  const s = new Session(freshRoot());
  s.decisions.apply("idle@0", { op: "plan", items: ["the one item"] });
  const item = s.decisions.graph("idle@0").nodes.find((n) => n.status === "open")!;
  s.decisions.apply("idle@0", { op: "done", node: item.id, brief: "shipped" });
  // The retry: same node, same disposition. It simply stands.
  s.decisions.apply("idle@0", { op: "done", node: item.id, brief: "shipped" });
  const after = s.decisions.graph("idle@0").nodes.filter((n) => n.id === item.id);
  assert.equal(after.length, 1, "no second node, no second resolution");
  assert.equal(after[0].status, "done");
  // A DIFFERENT disposition is a real disagreement, and still refuses.
  assert.throws(
    () => s.decisions.apply("idle@0", { op: "obsolete", node: item.id, brief: "actually dropped" }),
    (e: unknown) => (e as { clause?: string }).clause === "SE-C-121",
  );
});
