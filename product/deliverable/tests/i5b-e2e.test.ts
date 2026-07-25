// i5b killer demonstration (UC-1, R7/F2): an iteration is DEFAULT-provisioned
// into its own worktree, walked and gated FROM the trunk-rooted server (the
// routing), then SHIPPED back to trunk. The full live lifecycle i5 never ran.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { loadMachine } from "../engine/machines/load.ts";
import { Loop } from "../engine/loop.ts";
import { Gate } from "../engine/gate.ts";
import { shipMerge } from "../engine/worktree.ts";
import { plantMachines } from "./fixtures.ts";

const git = (c: string, cwd: string): string => execSync(`git ${c}`, { cwd, encoding: "utf8" }).trim();

function trunkFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "i5b-e2e-"));
  git("init -b main", root);
  plantMachines(root);
  execSync(`git add -A && git -c user.email=t@t -c user.name=t commit -m base`, { cwd: root });
  return root;
}
function lean(root: string) {
  const m = loadMachine(root, "lean")!;
  return { ...m, states: m.states.map((s) => (s.id === "verify" ? { ...s, command: 'node -e "process.exit(0)"' } : s)) };
}

test("R7/F2 LIVE E2E: default-provisioned iteration walks + gates from the trunk server, then ships", () => {
  const root = trunkFixture();
  const srv = () => new Loop(root, lean(root)); // a fresh trunk-rooted server each call
  try {
    // Open: default provisioning puts the iteration in its own worktree.
    const started = srv().start("demo");
    assert.match(started.note ?? "", /iter\/demo/, "opened as a worktree stream");
    const wt = join(root, ".worktrees", "demo");
    assert.ok(existsSync(wt), "the worktree was provisioned by default");

    // Walk from the TRUNK server (each submit routes to the worktree instance).
    srv().submit({ goal: "g", load_bearing_for: "l", exit_check: "e" }); // declare_goal
    srv().submit({ changed: "c" }); // do_work -> verify (engine no-op) auto-runs
    const offered = srv().submit({ exit_check_result: "done" }); // close_iteration gate -> offer
    assert.equal(offered.kind, "gate_offered", "the close gate offered, live, from the trunk server");

    // Bless (a human channel). Since i5d the FINAL BLESS performs the close
    // itself - the split runs on the same path a board bless takes - so nothing
    // calls shipMerge by hand any more.
    const trunkBefore = git("rev-parse HEAD", root);
    new Gate(wt).bless(lean(wt), offered.offer_hash!, { channel: "test", adjudicated_by: "agent" });
    assert.notEqual(git("rev-parse HEAD", root), trunkBefore, "the close merged the branch to trunk");
    assert.match(git("tag --list iter/demo", root), /iter\/demo/, "the record is named by its tag");
    assert.ok(!existsSync(wt), "the shipped tree retired");
    assert.match(git("branch --list iter/demo", root), /iter\/demo/, "the branch stays for history");
    assert.equal(shipMerge(root, "demo").merged, false, "a second close is a no-op refusal, never a double merge");
  } finally {
    try { rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
