// The requirement i5b missed: a WORKTREE-resident iteration must show up on
// the board exactly like a trunk one - in the iterations list, in the state
// machine (machine_stack), and its pending gate offer. The board renders
// projectState(trunkRoot), so this asserts against that single source.
// Red-first: fails while the projection reads only the trunk root.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { loadMachine } from "../engine/machines/load.ts";
import { Loop } from "../engine/loop.ts";
import { projectState } from "../engine/project.ts";
import { plantMachines } from "./fixtures.ts";

const git = (c: string, cwd: string): string => execSync(`git ${c}`, { cwd, encoding: "utf8" }).trim();

function trunkFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "i5c-trunk-"));
  git("init -b main", root);
  plantMachines(root);
  execSync(`git add -A && git -c user.email=t@t -c user.name=t commit -m base`, { cwd: root });
  return root;
}
function lean(root: string) {
  const m = loadMachine(root, "lean")!;
  return { ...m, states: m.states.map((s) => (s.id === "verify" ? { ...s, command: 'node -e "process.exit(0)"' } : s)) };
}

test("a WORKTREE iteration shows in projectState: iterations list + machine_stack + pending offer", () => {
  const root = trunkFixture();
  const srv = () => new Loop(root, lean(root));
  try {
    // Default-provision opens the iteration in its own worktree.
    srv().start("wt-it");
    // Walk to the close gate FROM the trunk server, so an offer is live.
    srv().submit({ goal: "g", load_bearing_for: "l", exit_check: "e" });
    srv().submit({ changed: "c" });
    const offered = srv().submit({ exit_check_result: "done" });
    assert.equal(offered.kind, "gate_offered", "the worktree iteration has a live offer");

    // The board renders THIS - it must show the worktree iteration everywhere.
    const s = projectState(root);
    assert.ok(
      s.iterations.some((it) => it.id === "wt-it" && it.status === "open"),
      "the worktree iteration appears in the iterations list",
    );
    assert.equal(s.open_iteration, "wt-it", "it is the open iteration");
    assert.ok(
      s.machine_stack.some((f) => f.states.some((st) => st.status === "current")),
      "its state machine renders with a current state",
    );
    assert.ok(s.offer !== null && s.offer.iteration === "wt-it", "its pending gate offer is shown to bless");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
