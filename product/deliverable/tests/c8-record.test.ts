// c8: the ETA calibration query, the single-line se_run record, the
// multi-iteration last_verify ordering (pays V4).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { layout } from "../engine/layout.ts";
import { CallLog, parseEtaMinutes } from "../engine/calllog.ts";
import { runCommand } from "../engine/run.ts";
import { projectState } from "../engine/project.ts";

const freshRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "se-c8-"));
  mkdirSync(layout.seDir(root), { recursive: true });
  return root;
};

test("calibration pairs each update's ETA with the next submit; dirty formats are skipped", () => {
  const root = freshRoot();
  try {
    const seDir = layout.seDir(root);
    const base = new Date("2026-07-24T10:00:00");
    const at = (min: number): string => new Date(base.getTime() + min * 60000).toISOString();
    const clock = (min: number): string => {
      const d = new Date(base.getTime() + min * 60000);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    const lines = [
      { ref: "r1", ts: at(0), tool: "se.toll.update", args: { current_step: "s1", eta: clock(10) }, ok: true, duration_ms: 0, se_version: "t" },
      { ref: "r2", ts: at(20), tool: "se_loop_submit", args: {}, ok: true, duration_ms: 5, se_version: "t" },
      { ref: "r3", ts: at(21), tool: "se.toll.update", args: { current_step: "s2", eta: "somewhat before midnight" }, ok: true, duration_ms: 0, se_version: "t" },
      { ref: "r4", ts: at(30), tool: "se_loop_submit", args: {}, ok: true, duration_ms: 5, se_version: "t" },
    ];
    writeFileSync(join(seDir, "calls.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n") + "\n", "utf8");
    const cal = new CallLog(seDir).calibration();
    assert.equal(cal.count, 1, "the unparseable ETA is skipped, not guessed");
    assert.equal(cal.samples[0].claimed_min, 10);
    assert.equal(cal.samples[0].actual_min, 20);
    assert.equal(cal.samples[0].ratio, 2);
    assert.equal(cal.median_ratio, 2);
    assert.equal(parseEtaMinutes("in ~15 min", at(0)), 15, "relative ETAs parse");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runCommand mints the record but writes no line - the dispatch observer owns it", () => {
  const root = freshRoot();
  try {
    const seDir = layout.seDir(root);
    const log = new CallLog(seDir);
    const rec = runCommand(log, 'node -e "process.exit(0)"', root);
    assert.ok(rec.ref.startsWith("run-"));
    assert.equal(rec.ok, true);
    assert.ok(!existsSync(join(seDir, "calls.jsonl")), "no direct append from runCommand");
    const kept = log.append({ ref: rec.ref, tool: "se.run", args: rec.args, ok: rec.ok, duration_ms: rec.duration_ms, detail: rec.detail });
    assert.equal(kept.ref, rec.ref, "append honors a provided ref - evidence pinning stays findable");
    assert.equal(log.find(rec.ref)?.tool, "se.run");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("last_verify is picked by timestamp across iterations, never folder order", () => {
  const root = freshRoot();
  try {
    const plant = (iter: string, at: string, exit: number): void => {
      const dir = layout.iterationDir(root, iter);
      mkdirSync(join(dir, "evidence"), { recursive: true });
      writeFileSync(
        layout.instancePath(root, iter),
        JSON.stringify({ machine: "m", iteration: iter, current: "closed", counters: {}, history: [], escapes: [], status: "closed" }) + "\n",
        "utf8",
      );
      writeFileSync(
        join(dir, "evidence", "verification-1.json"),
        JSON.stringify({ iteration: iter, state: "verification", at, payload: { exit } }) + "\n",
        "utf8",
      );
    };
    // Alphabetical order (a-newest < z-oldest) opposes timestamp order.
    plant("a-newest", "2026-07-24T12:00:00.000Z", 0);
    plant("z-oldest", "2026-07-20T12:00:00.000Z", 1);
    const s = projectState(root);
    assert.equal(s.last_verify?.iteration, "a-newest");
    assert.equal(s.last_verify?.ok, true);
    const raw = readFileSync(layout.instancePath(root, "a-newest"), "utf8");
    assert.match(raw, /closed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
