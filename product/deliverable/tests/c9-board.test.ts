// c9: layout rows for parallel branches, request+response on call lines,
// and the board page carrying the tree/filter/sidebar machinery.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { layout } from "../engine/layout.ts";
import { stateRows, projectState } from "../engine/project.ts";
import type { MachineDecl } from "../engine/machine.ts";

const S = (id: string, edges: { to: string; role: "normal" | "alternative" | "approval" | "recovery" }[], kind: "work" | "terminal" = "work") =>
  ({ id, kind, statement: id, filled_by: "agent" as const, guidance: "", evidence_form: [], edges });

test("stateRows: a diamond puts the branches on one row and the join below both", () => {
  const m = {
    id: "m", reentry: "restart", initial: "a",
    states: [
      S("a", [{ to: "b", role: "normal" }, { to: "c", role: "normal" }]),
      S("b", [{ to: "d", role: "normal" }]),
      S("c", [{ to: "d", role: "normal" }]),
      S("d", [], "terminal"),
    ],
  } as unknown as MachineDecl;
  const rows = stateRows(m);
  assert.equal(rows.a, 0);
  assert.equal(rows.b, rows.c, "parallel branches share a row");
  assert.equal(rows.d, 2, "the join sits below both branches");
});

test("stateRows: a recovery cycle never breaks the layout", () => {
  const m = {
    id: "m", reentry: "restart", initial: "a",
    states: [
      S("a", [{ to: "b", role: "normal" }]),
      S("b", [{ to: "a", role: "recovery" }, { to: "c", role: "normal" }]),
      S("c", [], "terminal"),
    ],
  } as unknown as MachineDecl;
  const rows = stateRows(m);
  assert.deepEqual([rows.a, rows.b, rows.c], [0, 1, 2]);
});

test("call lines carry request and response for the log details", () => {
  const root = mkdtempSync(join(tmpdir(), "se-c9-"));
  try {
    const seDir = layout.seDir(root);
    mkdirSync(seDir, { recursive: true });
    const rec = {
      ref: "r1", ts: new Date().toISOString(), tool: "se_get_node",
      args: { id: "se.x" }, ok: true, duration_ms: 3, se_version: "t",
      detail: { outcome: "result", response_summary: '{"id":"se.x"}' },
    };
    writeFileSync(join(seDir, "calls.jsonl"), JSON.stringify(rec) + "\n", "utf8");
    const s = projectState(root);
    assert.deepEqual(s.calls[0].request, { id: "se.x" });
    assert.equal(s.calls[0].response, '{"id":"se.x"}');
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("the board page ships the tree renderer, its filter, the modal sidebar and parallel rows", () => {
  const page = readFileSync(join(import.meta.dirname, "..", "bin", "se-board.ts"), "utf8");
  for (const marker of ["jsonTree", "jtFilter", "key:foo", "modalside", "modalgut", "smrow", "logRow", "setHTML"]) {
    assert.ok(page.includes(marker), `page carries ${marker}`);
  }
  assert.ok(!page.includes('"time", "source", "dest"'), "the log dropped source/destination");
});
