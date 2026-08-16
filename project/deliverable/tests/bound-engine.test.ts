// THE RECORD'S HOLD ON ITS MACHINE (tsp-bound-engine-and-method). Written
// test-first at i27's author-tests.
//
// The decision table this walks has two axes: whether the record carries an
// override, and whether trunk has moved under it. The fourth cell — override
// plus moved trunk — is the one that matters, because a composed mixture
// nobody assembled is what req-entry-levels-the-record-tree exists to prevent.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { composeForRecord, isOverridable, overridesIn } from "../engine/delta.ts";
import * as paths from "../engine/paths.ts";
import { beatVerdict, callVerdict, deadlineIsSafe, levelRecordTree, missedBeats, replaceComposition, WATCH } from "../engine/supervisor.ts";
import { anyGuidanceDoc } from "./helpers.ts";

const ROOT = mkdtempSync(join(tmpdir(), "se-delta-"));
const RECORD = "project/spec/iterations/i27-x";
// ASKED, NEVER NAMED. A test that needs SOME guidance page asks helpers for
// one, so moving guidance changes the answer instead of falsifying the test.
const GUIDE = anyGuidanceDoc();

/** Put a file in the record's delta folder, as an agent editing the engine
 *  from inside their own record would. */
function override(rel: string, body: string): void {
  const abs = join(ROOT, RECORD, "delta", rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body, "utf8");
}

// ------------------------------------- the ground the delta stands on today

// `fansOut` IS GONE (i34): one tree, so a method write reaches every tree by
// existing. What still matters is that these paths are KIND method, because
// routing sends method and session state to the core.
test("method files are recognised as method", () => {
  for (const p of [GUIDE, "project/deliverable/machines/items/element.md", "project/deliverable/engine/session.ts"]) {
    assert.equal(paths.pathKind(p), "method", `${p} is method`);
  }
});

test("the prompt layer counts as method though it lives under no method folder", () => {
  assert.equal(paths.pathKind("project/CLAUDE.md"), "method");
  assert.equal(paths.pathKind("project/AGENTS.md"), "method");
});

test("a record's own folder belongs to that record", () => {
  const p = "project/spec/iterations/i27-x/evidence/author-tests.md";
  assert.equal(paths.pathKind(p), "record");
  assert.deepEqual(paths.recordOwnerOf(p), { container: "iterations", id: "i27-x" });
});

test("session state belongs to the machine rather than to any branch", () => {
  assert.equal(paths.pathKind(".se/HANDOVER.md"), "session");
  assert.equal(paths.pathKind(".se/calls.jsonl"), "session");
});

// --------------------------------------- what the delta still owes (RED)

test("a record with no override runs trunk's engine", () => {
  const served = composeForRecord(ROOT, RECORD, "project/deliverable/engine/session.ts");
  assert.equal(served.from, "trunk");
  assert.equal(served.abs, join(ROOT, "project/deliverable/engine/session.ts"));
});

test("a record's own folder may override an engine file, record first and trunk second", () => {
  override("project/deliverable/engine/session.ts", "the record's own engine");
  const served = composeForRecord(ROOT, RECORD, "project/deliverable/engine/session.ts");
  assert.equal(served.from, "record", "the record's copy wins, and nothing is merged");
  assert.equal(served.abs.includes(join(RECORD, "delta")), true);
});

test("the override list is what the record has done to the machine", () => {
  override(GUIDE, "a local rule");
  const list = overridesIn(ROOT, RECORD);
  assert.deepEqual(list, ["project/deliverable/engine/session.ts", GUIDE].sort());
});

test("only method and engine are overridable, because a record's evidence is not a delta", () => {
  assert.equal(isOverridable("project/deliverable/engine/session.ts"), true);
  assert.equal(isOverridable(GUIDE), true);
  assert.equal(isOverridable("project/spec/iterations/i27-y/evidence/a.md"), false);
});

test("a record that overrides nothing levels with nothing to rebase", () => {
  const clean = "project/spec/iterations/i27-clean";
  const r = levelRecordTree(ROOT, clean, { reconcile: () => ({ ok: true }), commit: () => ({ ok: true }) });
  assert.equal(r.levelled, true);
  assert.deepEqual(r.overrides, [], "most records hold no override at all");
});

test("entry levels the record's tree and reconciles its delta before the first call", () => {
  let reconciled = false;
  let committed = false;
  const r = levelRecordTree(ROOT, RECORD, {
    reconcile: () => {
      reconciled = true;
      return { ok: true };
    },
    commit: () => {
      committed = true;
      return { ok: true };
    },
  });
  assert.equal(r.levelled, true);
  assert.equal(reconciled, true, "the delta is reconciled with trunk BY MERGE — SE-C-002 forbids a rebase");
  assert.equal(committed, true, "and what it brought is committed before anything serves");
});

test("a stale override stops the record at entry rather than composing a mixture", () => {
  const r = levelRecordTree(ROOT, RECORD, {
    reconcile: () => ({ ok: false, conflict: "session.ts: both modified" }),
    commit: () => {
      throw new Error("a record that did not level must never commit");
    },
  });
  assert.equal(r.levelled, false, "a partial levelling never serves");
  assert.equal(r.conflict, "session.ts: both modified", "the conflict is NAMED, not summarised");
});

test("a levelling that cannot commit is not a levelling", () => {
  const r = levelRecordTree(ROOT, RECORD, { reconcile: () => ({ ok: true }), commit: () => ({ ok: false }) });
  assert.equal(r.levelled, false, "all-or-nothing means the commit is part of it");
});

test("a replacement that will not load leaves the working composition serving", () => {
  const r = replaceComposition(
    "the engine that works",
    () => "the broken delta",
    (c) => ({ ok: c !== "the broken delta", why: "it does not load" }),
  );
  assert.equal(r.serving, "the engine that works", "nginx rolls back to the old workers, and so do we");
  assert.equal(r.replaced, false);
  assert.equal(r.why, "it does not load");
});

test("a replacement that loads takes over", () => {
  const r = replaceComposition(
    "old",
    () => "new",
    () => ({ ok: true }),
  );
  assert.equal(r.serving, "new");
  assert.equal(r.replaced, true);
});

test("the watch deadline sits above the slowest measured death", () => {
  assert.equal(deadlineIsSafe(WATCH.deadlineMs), true, "a crash took 94.1 ms to reach the caller in exp-inflight-death");
  assert.equal(deadlineIsSafe(50), false, "a deadline under that would call a crash a hang");
});

// ------------------------------------------------- WATCH: the deadline and the beat

test("a call that answers is alive, and one that dies is dead with the reason named", () => {
  assert.equal(callVerdict({ kind: "answered", ms: 12 }).state, "alive");
  const dead = callVerdict({ kind: "died", ms: 94 });
  assert.equal(dead.state, "dead");
  assert.match(String(dead.why), /94 ms/, "a verdict without a reason is a diagnosis nobody can act on");
});

test("a call still pending past its deadline is WEDGED — the hang the beat calls healthy", () => {
  const v = callVerdict({ kind: "pending", ms: WATCH.deadlineMs }, WATCH.deadlineMs);
  assert.equal(v.state, "wedged");
  assert.match(String(v.why), /deadline/);
});

test("a call pending inside its deadline is not yet wedged", () => {
  assert.equal(callVerdict({ kind: "pending", ms: WATCH.deadlineMs - 1 }, WATCH.deadlineMs).state, "alive");
});

test("the deadline never calls a crash a hang", () => {
  // exp-inflight-death: the slowest death reached the caller at 94.1 ms.
  assert.equal(callVerdict({ kind: "died", ms: 95 }, WATCH.deadlineMs).state, "dead");
});

test("a beat arriving on time keeps the satellite alive", () => {
  assert.equal(missedBeats(1_000, 1_000, WATCH.beatMs), 0);
  assert.equal(beatVerdict(missedBeats(1_000, 1_150, WATCH.beatMs)).state, "alive", "inside one interval, nothing is missed");
});

test("three missed beats at 200 ms declare a wedge in 600 ms", () => {
  assert.equal(missedBeats(1_000, 1_600, WATCH.beatMs), WATCH.allowance);
  const v = beatVerdict(missedBeats(1_000, 1_600, WATCH.beatMs));
  assert.equal(v.state, "wedged", "600 ms is the figure dsp-satellite-lifecycle records");
  assert.match(String(v.why), /allowance/);
});

test("the beat sees a wedge while the satellite is IDLE, which no deadline can", () => {
  // No call is in flight, so there is nothing for callVerdict to time at all.
  assert.equal(beatVerdict(missedBeats(0, 800, 200)).state, "wedged");
});
