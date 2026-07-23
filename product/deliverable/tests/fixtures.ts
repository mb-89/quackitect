// Shared fixture: fixture roots get the repo's own drawn machines — the
// loader compiles from a root's ledger, so a root without the canvases has
// no loop and no gate.
import { cpSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const REPO_SE = join(import.meta.dirname, "..", "..", "spec", "ledger", "se");

export function plantMachines(root: string): void {
  const dst = join(root, "product", "spec", "ledger", "se");
  mkdirSync(dst, { recursive: true });
  for (const f of readdirSync(REPO_SE)) {
    if (f.startsWith("machine-")) cpSync(join(REPO_SE, f), join(dst, f));
  }
}
