// THE UNIFIED FEED. Every hand's act is one log line, and the log is the only
// place that story is told.
//
// THE DECISION GRAPH IS GONE, and the tests for it went with it. A token opened,
// taken or settled IS the narration now, and each of those is a call — so the
// feed derives the work rows from the call log rather than from a second tree
// kept beside it.
//
// No ETA anywhere — timestamps are the engine's.
import { strict as assert } from "node:assert";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { readNotes } from "../engine/inbox.ts";
import { seDir } from "../engine/paths.ts";
import { feedRows, renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { anyGuidanceDoc, call, freshRoot } from "./helpers.ts";

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
  // THE CONTROLS ARE SWITCHES, NEVER SLIDERS.
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
