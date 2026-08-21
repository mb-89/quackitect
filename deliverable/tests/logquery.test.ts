// Paging and searching the call log — the lane's door onto its own trail.
//
// A window with no way to ask for the next one is not a door. A fifty-record
// answer once ran past the token ceiling and was saved outside the project
// root, where the lane could not read it at all.
//
// THE LOG OBSERVES ITSELF, and every assertion here has to survive that: a
// query is a call, so asking a question APPENDS a record and the next
// question sees a longer log. Nothing below compares record identity across
// two calls, because that comparison is a race with the logger.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { bootedServer, call, freshRoot } from "./helpers.ts";

interface Page {
  total: number;
  offset: number;
  older: number;
  records: { ref: string; tool: string }[];
}

async function page(server: Awaited<ReturnType<typeof bootedServer>>, args: Record<string, unknown>): Promise<Page> {
  const r = await call(server, "se_log_query", args);
  assert.equal(r.isError, false, JSON.stringify(r.body));
  return r.body as unknown as Page;
}

test("se_log_query pages backwards from the newest, and accounts for the whole log", async () => {
  const server = await bootedServer(freshRoot());
  for (const name of ["alpha", "beta", "gamma"]) {
    await call(server, "se_file_write", { path: `${name}.md`, content: name, base_hash: null });
  }

  // THE INVARIANT: a window plus what stands in front of it plus what stands
  // behind it IS the log. It holds at any offset, which is what makes the
  // caller able to walk the whole thing without guessing.
  for (const offset of [0, 1, 3]) {
    const p = await page(server, { limit: 2, offset });
    assert.equal(p.offset, offset);
    assert.ok(p.records.length <= 2, "limit caps the window");
    assert.equal(p.older + p.records.length + p.offset, p.total, `the window accounts for the log at offset ${offset}`);
  }

  const newest = await page(server, { limit: 1 });
  assert.equal(newest.offset, 0, "no offset means the newest window");
  assert.equal(newest.older, newest.total - 1, "everything else stands behind it");

  // Walking past the beginning stops empty rather than wrapping or throwing.
  const past = await page(server, { limit: 5, offset: 100_000 });
  assert.equal(past.records.length, 0);
  assert.equal(past.older, 0, "nothing stands behind the beginning");
});

test("se_log_query narrows by text, so finding a topic is not reading every record", async () => {
  const server = await bootedServer(freshRoot());
  for (const name of ["alpha", "beta", "gamma"]) {
    await call(server, "se_file_write", { path: `${name}.md`, content: name, base_hash: null });
  }

  const hits = await page(server, { filter: { text: "gamma" }, limit: 50 });
  assert.ok(hits.records.length > 0, "the write that named gamma is in there");
  for (const r of hits.records) {
    assert.match(JSON.stringify(r), /gamma/i, "every record returned actually carries the text");
  }

  // Case does not decide a match — a topic is a topic however it was typed.
  // The count only ever GROWS between the two, because the first query is
  // itself a record carrying the word.
  const upper = await page(server, { filter: { text: "GAMMA" }, limit: 50 });
  assert.ok(upper.records.length >= hits.records.length);
  for (const r of upper.records) assert.match(JSON.stringify(r), /gamma/i);

  const none = await page(server, { filter: { text: "no-such-topic-anywhere" }, limit: 50 });
  assert.equal(none.records.length, 0);
  assert.equal(none.total, 0, "a filter that matches nothing reports nothing, not the whole log");
});

// THE HANDOVER, DERIVED RATHER THAN WRITTEN (owner ruling 2026-08-07). The
// written one had its gate at the `end` state, so a session that was simply
// killed never produced one — which the owner confirmed is how they always
// worked. The log already knows what happened, so it gets asked instead.
test("the last sitting is read off the log's tail, told apart by a quiet gap", async () => {
  const { CallLog } = await import("../engine/calllog.ts");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const se = join(freshRoot(), ".se");
  mkdirSync(se, { recursive: true });
  const rec = (ts: string, extra: Record<string, unknown> = {}): string =>
    JSON.stringify({
      ref: `call-${ts}`,
      ts,
      se_version: "t",
      tool: "se_pull",
      args: {},
      ok: true,
      outcome: "result",
      duration_ms: 1,
      ...extra,
    });
  writeFileSync(
    join(se, "calls.jsonl"),
    `${[
      // The sitting to be described.
      rec("2026-08-06T09:00:00.000Z"),
      rec("2026-08-06T09:05:00.000Z", { tool: "se_note", args: { title: "a stray worth keeping" } }),
      rec("2026-08-06T09:06:00.000Z", { ok: false, outcome: "rejected", response: { clause: "SE-C-110" } }),
      rec("2026-08-06T09:07:00.000Z", { response: { where: ["front_desk"] } }),
      // Hours of quiet, then the CURRENT sitting — the reader was there for
      // this one and does not need it summarised back to them.
      rec("2026-08-07T08:00:00.000Z"),
    ].join("\n")}\n`,
    "utf8",
  );
  const last = new CallLog(se).lastSession();
  if (last === undefined) throw new Error("expected a previous sitting to describe");
  assert.equal(last.calls, 4, "the earlier run, not the current one");
  assert.equal(last.from, "2026-08-06T09:00:00.000Z");
  assert.equal(last.to, "2026-08-06T09:07:00.000Z");
  assert.equal(last.ended_at, "front_desk", "where the person walked away from");
  assert.deepEqual(last.notes, ["a stray worth keeping"]);
  assert.deepEqual(last.refusals, { "SE-C-110": 1 }, "a repeated clause has to be visible at a glance");
});

// A FIRST-EVER SESSION HAS NOTHING BEHIND IT, and that is not an error.
test("with only one sitting in the log there is nothing to hand over", async () => {
  const { CallLog } = await import("../engine/calllog.ts");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const se = join(freshRoot(), ".se");
  mkdirSync(se, { recursive: true });
  writeFileSync(
    join(se, "calls.jsonl"),
    `${JSON.stringify({ ref: "call-1", ts: "2026-08-07T08:00:00.000Z", se_version: "t", tool: "se_pull", args: {}, ok: true, outcome: "result", duration_ms: 1 })}\n`,
    "utf8",
  );
  assert.equal(new CallLog(se).lastSession(), undefined);
  assert.equal(new CallLog(join(freshRoot(), ".se")).lastSession(), undefined, "and no log at all is also fine");
});

// THE SLOWNESS MINE (owner ruling 2026-08-09: the one-second rule is the
// line, and slowness is mined from the one log rather than reported by the
// person). min_ms answers "what took longer than X" over every door.
test("min_ms filters the log to what was at least that slow", () => {
  const dir = mkdtempSync(join(tmpdir(), "se-log-"));
  const log = new CallLog(dir);
  log.append({
    tool: "se_pull",
    args: {},
    ok: true,
    outcome: "result",
    duration_ms: 12,
    part: "walker",
    state: "a-state",
    answered_by: "a-model",
  });
  log.append({
    tool: "se_file_read",
    args: {},
    ok: true,
    outcome: "result",
    duration_ms: 1450,
    part: "walker",
    state: "a-state",
    answered_by: "a-model",
  });
  log.append({
    tool: "mirror_slow",
    args: { path: "/x" },
    ok: true,
    outcome: "result",
    duration_ms: 2100,
    part: "walker",
    state: "a-state",
    answered_by: "a-model",
  });
  const slow = log.query({ filter: { min_ms: 1000 } });
  assert.equal(slow.total, 2, "only the breaches");
  assert.deepEqual(
    (slow.records ?? []).map((r: { tool: string }) => r.tool),
    ["se_file_read", "mirror_slow"],
    "both doors, one ask",
  );
});
