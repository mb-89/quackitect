// Item 12 of the record inspection: boot must not stall on a test record that
// predates the metadata it looks for.
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). See guidance/craft/software.md.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const INSPECT = fileURLToPath(new URL("../engine/bin/record-inspect.ts", import.meta.url));

/** A throwaway root whose call log holds exactly these verdict records. */
function rootWithVerdicts(records: Record<string, unknown>[]): string {
  const root = mkdtempSync(join(tmpdir(), "se-record-inspect-"));
  mkdirSync(join(root, ".se"), { recursive: true });
  const lines = records.map((r) => JSON.stringify({ tool: "se_test_verdict", response: r })).join("\n");
  writeFileSync(join(root, ".se", "calls.jsonl"), `${lines}\n`, "utf8");
  return root;
}

function inspect(root: string): { code: number; out: string } {
  const r = spawnSync(process.execPath, [INSPECT, "--root", root], { encoding: "utf8" });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  // A spawn that never ran must not read as a clean run.
  assert.ok(out.trim() !== "", "record-inspect produced no output at all");
  return { code: r.status ?? -1, out };
}

const MODERN = { question: "did the bound hold?", scope: "battery" };
const PRE_FIX = { ok: true };

describe("item 12 tolerates a test record older than the metadata", () => {
  test("a log of only pre-fix records leaves boot green, and says why", () => {
    const { code, out } = inspect(rootWithVerdicts([PRE_FIX, PRE_FIX]));
    assert.equal(code, 0, "a pre-fix record must not block boot");
    assert.match(out, /all predating the 2026-08-17 fix/);
  });

  test("a pre-fix record after a modern one does not unseat it", () => {
    const { code } = inspect(rootWithVerdicts([MODERN, PRE_FIX]));
    assert.equal(code, 0, "the newest JUDGEABLE record is the one that counts");
  });

  test("the check is not silenced — a modern record missing its question is still red", () => {
    const { code, out } = inspect(rootWithVerdicts([PRE_FIX, { scope: "battery" }]));
    assert.equal(code, 1, "a record that could carry a question and does not is a finding");
    assert.match(out, /carries no question/);
  });
});
