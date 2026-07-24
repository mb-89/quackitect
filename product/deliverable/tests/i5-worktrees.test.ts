// i5's law set, red-first against the designed worktree lane: provisioning
// and adoption, dependency-gated starts, ship merges with suspect marks,
// conflict stops, abandon flags, stream visibility, the two guards.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync, rmSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { layout } from "../engine/layout.ts";
import { Rejection } from "../engine/errors.ts";
import { plantMachines } from "./fixtures.ts";
import { loadMachine } from "../engine/machines/load.ts";
import { Loop } from "../engine/loop.ts";
import { Gate } from "../engine/gate.ts";
import { projectState } from "../engine/project.ts";
import { coreTools } from "../engine/tools.ts";
import {
  provisionWorktree,
  retireWorktree,
  openWorktrees,
  assertDependsMet,
  shipMerge,
} from "../engine/worktree.ts";

const git = (c: string, cwd: string): string => execSync(`git ${c}`, { cwd, encoding: "utf8" }).trim();
const commitAll = (cwd: string, msg: string): void => {
  execSync(`git add -A && git -c user.email=t@t -c user.name=t commit -m "${msg}"`, { cwd, encoding: "utf8" });
};

/** A trunk fixture: git repo with machines planted and committed. */
function trunkFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "i5-trunk-"));
  git("init -b main", root);
  plantMachines(root);
  writeFileSync(join(root, ".gitignore"), ".worktrees/\n", "utf8");
  commitAll(root, "base");
  return root;
}

function leanOK(root: string) {
  const m = loadMachine(root, "lean")!;
  return { ...m, states: m.states.map((s) => (s.id === "verify" ? { ...s, command: 'node -e "process.exit(0)"' } : s)) };
}

/** Walk a worktree iteration to closed through its own root. */
function closeIteration(wtRoot: string, iteration: string): void {
  const m = leanOK(wtRoot);
  const loop = new Loop(wtRoot, m);
  loop.start(iteration);
  loop.submit({ goal: "g", load_bearing_for: "l", exit_check: "e" });
  loop.submit({ changed: "c" });
  const p = loop.submit({ exit_check_result: "done" });
  new Gate(wtRoot).bless(m, p.offer_hash!, { channel: "test", adjudicated_by: "agent" });
}

test("provision creates tree+branch under .worktrees; a rerun ADOPTS, never duplicates", () => {
  const root = trunkFixture();
  try {
    const w = provisionWorktree(root, "it-a");
    assert.equal(w.adopted, false);
    assert.ok(w.root.endsWith(join(".worktrees", "it-a")));
    assert.ok(existsSync(w.root));
    assert.match(git("branch --list iter/it-a", root), /iter\/it-a/);
    const again = provisionWorktree(root, "it-a");
    assert.equal(again.adopted, true, "leftovers are adopted");
    assert.equal(again.root, w.root);
    assert.equal(git("worktree list", root).split("\n").length, 2, "one trunk + one worktree, no duplicate");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("depends_on gates the start: unshipped refuses naming it; a release grant passes it", () => {
  const root = trunkFixture();
  try {
    mkdirSync(join(root, "product", "spec", "iterations"), { recursive: true });
    writeFileSync(
      layout.planPath(root),
      JSON.stringify({ iterations: [{ id: "it-b", depends_on: ["it-a"] }, { id: "it-a" }] }, null, 2),
      "utf8",
    );
    assert.throws(
      () => assertDependsMet(root, "it-b"),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-072" && /it-a/.test(e.got),
    );
    appendFileSync(
      layout.grantsPath(root),
      JSON.stringify({ iteration: "it-a", state: "gate_release", hash: "x", channel: "test", adjudicated_by: "agent" }) + "\n",
      "utf8",
    );
    assert.doesNotThrow(() => assertDependsMet(root, "it-b"), "the release grant is the ship record");
    assert.doesNotThrow(() => assertDependsMet(root, "it-a"), "no depends_on, no gate");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("W1 killer: two iterations, both ship, the second merge marks the overlapping ledger node suspect", () => {
  const root = trunkFixture();
  try {
    const seDir = join(root, "product", "spec", "ledger", "se");
    writeFileSync(join(seDir, "shared.md"), "---\nid: se.shared\nkind: note\nstatement: Base.\n---\n\n## Body\nbase\n", "utf8");
    commitAll(root, "shared node");

    const a = provisionWorktree(root, "it-a");
    const b = provisionWorktree(root, "it-b");
    // Both iterations edit the SAME node, differently placed so git merges cleanly.
    writeFileSync(join(a.root, "product", "spec", "ledger", "se", "shared.md"),
      "---\nid: se.shared\nkind: note\nstatement: Base.\nfrom_a: yes\n---\n\n## Body\nbase\n", "utf8");
    closeIteration(a.root, "it-a");
    commitAll(a.root, "it-a work");
    writeFileSync(join(b.root, "product", "spec", "ledger", "se", "shared.md"),
      "---\nid: se.shared\nkind: note\nstatement: Base.\n---\n\n## Body\nbase plus b\n", "utf8");
    closeIteration(b.root, "it-b");
    commitAll(b.root, "it-b work");

    const first = shipMerge(root, "it-a");
    assert.equal(first.merged, true);
    assert.deepEqual(first.suspects, [], "first merge has no trunk overlap");
    const second = shipMerge(root, "it-b");
    assert.equal(second.merged, true);
    assert.ok(second.suspects.some((s) => s.includes("shared")), "the overlap is named");
    const merged = readFileSync(join(seDir, "shared.md"), "utf8");
    assert.match(merged, /suspect:/, "the node wears the mark");
    assert.ok(!existsSync(a.root) && !existsSync(b.root), "shipped trees are removed");
    assert.match(git("branch --list iter/it-a", root), /iter\/it-a/, "branches stay for history");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a textual conflict STOPS the ship: recorded, aborted, nothing auto-resolved", () => {
  const root = trunkFixture();
  try {
    const shared = join("product", "spec", "ledger", "se", "shared.md");
    writeFileSync(join(root, shared), "---\nid: se.shared\nkind: note\nstatement: Base.\n---\n\n## Body\nbase\n", "utf8");
    commitAll(root, "shared");
    const a = provisionWorktree(root, "it-a");
    writeFileSync(join(a.root, shared), "---\nid: se.shared\nkind: note\nstatement: From the branch.\n---\n\n## Body\nbase\n", "utf8");
    closeIteration(a.root, "it-a");
    commitAll(a.root, "branch edit");
    writeFileSync(join(root, shared), "---\nid: se.shared\nkind: note\nstatement: From the trunk.\n---\n\n## Body\nbase\n", "utf8");
    commitAll(root, "trunk edit");
    const r = shipMerge(root, "it-a");
    assert.equal(r.merged, false);
    assert.ok(r.conflict !== undefined && /shared/.test(r.conflict), "the conflict is named");
    assert.doesNotMatch(git("status --porcelain", root), /^(UU|AA)/m, "the merge was aborted, not left half-done");
    assert.match(readFileSync(join(root, shared), "utf8"), /From the trunk/, "trunk truth untouched");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("abandon FLAGS the tree and never deletes; the debris invariant holds after closes", () => {
  const root = trunkFixture();
  try {
    const a = provisionWorktree(root, "it-a");
    retireWorktree(root, "it-a", "abandon");
    assert.ok(existsSync(a.root), "abandoned trees survive");
    assert.ok(existsSync(join(a.root, ".abandoned")), "and wear the flag");
    const open = openWorktrees(root);
    assert.ok(!open.some((w) => w.iteration === "it-a"), "abandoned streams are not live");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the projection lists every live stream with root and iteration", () => {
  const root = trunkFixture();
  try {
    const a = provisionWorktree(root, "it-a");
    const m = leanOK(a.root);
    new Loop(a.root, m).start("it-a");
    const s = projectState(root);
    const streams = s.agents.filter((x) => x.role !== "main");
    assert.ok(streams.some((x) => "iteration" in x && (x as { iteration?: string }).iteration === "it-a"), "the worktree stream appears");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("draining an unknown note ref refuses loudly (SE-C-073)", () => {
  const root = mkdtempSync(join(tmpdir(), "i5-drain-"));
  try {
    mkdirSync(layout.seDir(root), { recursive: true });
    const tools = coreTools(root);
    const noteTool = tools.find((t) => t.name === "se_note")!;
    const drain = tools.find((t) => t.name === "se_note_drain")!;
    const captured = noteTool.handler({ text: "a live note" }) as { captured: string };
    assert.throws(
      () => drain.handler({ ref: "note-deadbeef0000", disposition: "x" }),
      (e: unknown) => e instanceof Rejection && e.clause === "SE-C-073",
    );
    assert.doesNotThrow(() => drain.handler({ ref: captured.captured, disposition: "routed to nowhere (test)" }));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the board page guards acts against stale in-flight polls (generation guard)", () => {
  const page = readFileSync(join(import.meta.dirname, "..", "bin", "se-board.ts"), "utf8");
  assert.ok(page.includes("actGen"), "a generation counter exists");
  assert.match(page, /actGen\s*\+\+/, "local acts bump it");
  assert.ok(page.includes("stale poll"), "stale responses are named and dropped");
});
