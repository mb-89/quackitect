// The module registry: local modules are active; import-mode modules
// resolve through their declaration, and a missing import DEACTIVATES the
// module — never an error.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadModules } from "../engine/modules.ts";

function fixture(withImportTarget: boolean): string {
  const dir = mkdtempSync(join(tmpdir(), "se-mod-"));
  const root = join(dir, "proj");
  const modules = join(root, "product", "deliverable", "modules");
  mkdirSync(join(modules, "se"), { recursive: true });
  writeFileSync(join(modules, "se", "module.json"), JSON.stringify({ id: "se", name: "SE" }));
  mkdirSync(join(modules, "kb"), { recursive: true });
  writeFileSync(
    join(modules, "kb", "module.json"),
    JSON.stringify({ id: "kb", dep_kind: "module", mode: "import", import_path: "../neighbor" }),
  );
  if (withImportTarget) {
    mkdirSync(join(dir, "neighbor", "modules", "kb"), { recursive: true });
    writeFileSync(join(dir, "neighbor", "modules", "kb", "module.json"), JSON.stringify({ id: "kb", name: "KB" }));
  }
  return root;
}

test("local modules are active; a resolvable import is active", () => {
  const root = fixture(true);
  try {
    const mods = loadModules(root);
    assert.deepEqual(
      mods.map((m) => [m.id, m.status, m.mode]),
      [
        ["kb", "active", "import"],
        ["se", "active", "local"],
      ],
    );
  } finally {
    try { rmSync(join(root, ".."), { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("a missing import deactivates the module instead of erroring", () => {
  const root = fixture(false);
  try {
    const mods = loadModules(root);
    const kb = mods.find((m) => m.id === "kb")!;
    assert.equal(kb.status, "deactivated");
    assert.match(kb.detail, /not found/);
    // The rest of the session is untouched.
    assert.equal(mods.find((m) => m.id === "se")!.status, "active");
  } finally {
    try { rmSync(join(root, ".."), { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("the real repo reports both modules, kb via the sibling import", () => {
  const realRoot = join(import.meta.dirname, "..", "..", "..");
  const mods = loadModules(realRoot);
  const ids = mods.map((m) => m.id);
  assert.deepEqual(ids, ["kb", "se"]);
});
