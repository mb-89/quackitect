// i5b: worktree/branch is the DEFAULT (not opt-in) and RUNS LIVE - the
// trunk-rooted server locates and drives a worktree-resident iteration; an
// iteration may carry a local machine (seeded from the template, trimmed).
// Red-first against the designed behaviour; the first two checks encode the
// exact i5 defects (opt-in narrowing, untested-live routing).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import type { MachineDecl } from "../engine/machine.ts";
import { loadMachine } from "../engine/machines/load.ts";
import { Loop } from "../engine/loop.ts";
import { provisionWorktree } from "../engine/worktree.ts";
import { plantMachines } from "./fixtures.ts";

const git = (c: string, cwd: string): string => execSync(`git ${c}`, { cwd, encoding: "utf8" }).trim();

/** A trunk fixture: a git repo with the machines planted and committed. */
function trunkFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "i5b-trunk-"));
  git("init -b main", root);
  plantMachines(root);
  execSync(`git add -A && git -c user.email=t@t -c user.name=t commit -m base`, { cwd: root });
  return root;
}

/** The lean machine with a no-op verify command (no external suite in a fixture). */
function lean(root: string) {
  const m = loadMachine(root, "lean")!;
  return { ...m, states: m.states.map((s) => (s.id === "verify" ? { ...s, command: 'node -e "process.exit(0)"' } : s)) };
}

test("R1 DEFAULT: se_loop_start with NO plan flag provisions iter/<id> in .worktrees, trunk HEAD unchanged", () => {
  const root = trunkFixture();
  try {
    const head = git("rev-parse HEAD", root);
    new Loop(root, lean(root)).start("it-a"); // no plan.json, no worktree:true anywhere
    assert.ok(existsSync(join(root, ".worktrees", "it-a")), "the worktree exists without any opt-in flag");
    assert.match(git("branch --list iter/it-a", root), /iter\/it-a/, "the iteration branch exists");
    assert.equal(git("rev-parse HEAD", root), head, "trunk HEAD is untouched by opening the iteration");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R3 LIVE ROUTING: a TRUNK-rooted loop locates and serves a WORKTREE-resident iteration", () => {
  const root = trunkFixture();
  try {
    // Place an OPEN instance inside a worktree (as default provisioning will).
    const w = provisionWorktree(root, "it-a");
    new Loop(w.root, lean(w.root)).start("it-a");
    assert.ok(
      existsSync(join(w.root, "product", "spec", "iterations", "it-a", "state.json")),
      "the instance is worktree-resident, not on trunk",
    );
    // The running server is rooted at TRUNK - it must still find and serve it.
    const packet = new Loop(root, lean(root)).next();
    assert.equal(packet.iteration, "it-a", "the trunk-rooted loop served the worktree-resident iteration");
    assert.notEqual(packet.kind, "instruction", "not the no-iteration-open fallback");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R4 LOCAL MACHINE: an iteration's local machine (trimmed) overrides the shared template", () => {
  const root = mkdtempSync(join(tmpdir(), "i5b-local-"));
  try {
    // Base template: s0 -> s1 -> t (a middle state before the end).
    const base: MachineDecl = {
      id: "base",
      reentry: "restart",
      initial: "s0",
      states: [
        { id: "s0", kind: "work", statement: "s0", filled_by: "agent", guidance: "", evidence_form: [], edges: [{ to: "s1", role: "normal" }] },
        { id: "s1", kind: "work", statement: "s1", filled_by: "agent", guidance: "", evidence_form: [], edges: [{ to: "t", role: "normal" }] },
        { id: "t", kind: "terminal", statement: "t", filled_by: "agent", guidance: "", evidence_form: [], edges: [] },
      ],
    };
    // Local machine it.machine-base: s0 -> t2 (trims s1) in the iteration's own dir.
    const dir = join(root, "product", "spec", "iterations", "it-local", "machines", "it");
    mkdirSync(dir, { recursive: true });
    const note = (state: string, kind: string) =>
      writeFileSync(
        join(dir, `machine-base-${state}.md`),
        `---\nid: it.machine-base-${state}\nkind: machine_state\nstatement: ${state}.\nmachine: it.machine-base\nstate: ${state}\nstate_kind: ${kind}\nfilled_by: agent\n---\n\n## Guidance\ng\n`,
        "utf8",
      );
    note("s0", "work");
    note("t2", "terminal");
    writeFileSync(
      join(dir, "machine-base.canvas"),
      JSON.stringify({
        metadata: { version: "1.0-1.0", frontmatter: { id: "it.machine-base", kind: "machine", statement: "trimmed.", entry: "s0" } },
        nodes: [
          { id: "n1", type: "file", file: "ledger/it/machine-base-s0.md", x: 0, y: 0, width: 100, height: 50 },
          { id: "n2", type: "file", file: "ledger/it/machine-base-t2.md", x: 0, y: 100, width: 100, height: 50 },
        ],
        edges: [{ id: "e1", fromNode: "n1", toNode: "n2", fromSide: "bottom", toSide: "top" }],
      }),
      "utf8",
    );
    const loop = new Loop(root, base);
    const started = loop.start("it-local"); // non-git root -> plain start, instance on root
    assert.equal(started.state, "s0", "served the entry s0");
    const after = loop.submit({}); // local edge s0 -> t2 (terminal) => CLOSED
    assert.equal(after.kind, "closed", "the LOCAL trimmed machine ran (the base would serve s1, not close)");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
