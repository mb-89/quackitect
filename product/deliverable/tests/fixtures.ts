// Shared fixture: fixture roots get the repo's own drawn machines — the
// loader compiles from a root's ledger, so a root without the canvases has
// no loop and no gate.
import { cpSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const REPO_SE = join(import.meta.dirname, "..", "..", "spec", "ledger", "se");

/**
 * The four standard review rounds every gate carries since i12, injected by
 * the compiler and REFUSED if absent (SE-C-030). A fixture gate is trivial, so
 * these are filled the way a trivial gate should be — scale to size, but never
 * blank: an empty round is not a review, and a fixture that could pass with
 * blanks would prove the rounds optional.
 */
export const ROUNDS = {
  verify_round: "fixture walk: each input state delivered and its evidence matches its claim",
  validate_round: "fixture walk: meets the fixture's only intent, with nothing out of scope",
  redteam_round: "kill-criterion: the walk reaches this gate without its input states having run. Looked: they ran. Trivial gate, no further opposing case",
  verdict: "pass",
};

export function plantMachines(root: string): void {
  const dst = join(root, "product", "spec", "ledger", "se");
  mkdirSync(dst, { recursive: true });
  for (const f of readdirSync(REPO_SE)) {
    if (f.startsWith("machine-")) cpSync(join(REPO_SE, f), join(dst, f));
  }
}
