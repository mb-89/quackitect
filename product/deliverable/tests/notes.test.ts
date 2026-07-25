// Notes are PRIVATE: captured machine-local in one call, listed by the
// projection for the board, drained at retros — never written to the repo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { coreTools } from "../engine/tools.ts";
import { layout } from "../engine/layout.ts";
import { projectState } from "../engine/project.ts";

test("se_note captures machine-local; the projection lists newest first; the repo stays clean", () => {
  const root = mkdtempSync(join(tmpdir(), "se-notes-"));
  try {
    const before = readdirSync(root);
    const note = coreTools(root).find((t) => t.name === "se_note")!;

    const first = note.handler({ text: "vendor rg when a big product hurts" }) as { captured: string; inbox_count: number };
    assert.match(first.captured, /^note-/);
    assert.equal(first.inbox_count, 1);

    const second = note.handler({ text: "board dark theme round" }) as { inbox_count: number };
    assert.equal(second.inbox_count, 2);

    // Machine-local, not repo: the notes file lives under the state dir.
    assert.ok(layout.notesPath(root).startsWith(process.env.SE_STATE_DIR!));
    assert.ok(existsSync(layout.notesPath(root)));
    assert.deepEqual(readdirSync(root), before, "nothing lands under the repo root");

    const s = projectState(root);
    assert.equal(s.notes.length, 2);
    assert.equal(s.notes[0].text, "board dark theme round");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
