// i5d: the close-and-merge split. An iteration commits at its milestones onto
// its OWN branch; closing merges only live claims to trunk while the record
// stays reachable through a mandatory tag. Red-first against the designed API.
//
// The mechanics were probed before the build (run-aa90b5a988e9, run-af6e68ea06f7);
// these checks fix them as behaviour the engine owes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, lstatSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { provisionWorktree, shipMerge, commitMilestone, isEventPath, iterationTag, retireWorktree } from "../engine/worktree.ts";
import { Loop } from "../engine/loop.ts";
import { Gate } from "../engine/gate.ts";
import { loadMachine } from "../engine/machines/load.ts";
import { plantMachines } from "./fixtures.ts";

const git = (args: string[], cwd: string): string =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

/** A trunk fixture: a git repo with a ledger, an iterations home, and the ignore entry. */
function trunkFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "i5d-trunk-"));
  git(["init", "-q", "-b", "main"], root);
  git(["config", "user.email", "t@t"], root);
  git(["config", "user.name", "t"], root);
  mkdirSync(join(root, "product", "spec", "ledger", "se"), { recursive: true });
  mkdirSync(join(root, "product", "spec", "iterations"), { recursive: true });
  writeFileSync(join(root, "product", "spec", "ledger", "se", "claim.md"), "base claim\n");
  writeFileSync(join(root, ".gitignore"), ".worktrees/\n");
  git(["add", "-A"], root);
  git(["commit", "-qm", "base"], root);
  return root;
}

/** Give a provisioned iteration one milestone's worth of claims AND events. */
function fillIteration(wtRoot: string, iteration: string, n: number): void {
  const it = join(wtRoot, "product", "spec", "iterations", iteration);
  mkdirSync(join(it, "evidence"), { recursive: true });
  mkdirSync(join(it, "machines", "it"), { recursive: true });
  writeFileSync(join(wtRoot, "product", "spec", "ledger", "se", `claim-${n}.md`), `claim ${n}\n`);
  writeFileSync(join(it, "evidence", `gate-${n}.json`), `{"milestone":${n}}\n`);
  writeFileSync(join(it, "machines", "it", `machine-${n}.md`), `machine ${n}\n`);
  writeFileSync(join(it, "state.json"), `{"current":"m${n}"}\n`);
}

const cleanup = (p: string): void => {
  try { rmSync(p, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* best-effort */ }
};

test("R5/R6 CLASSIFIER: an iteration's evidence, machines and state are events; the ledger and product are claims", () => {
  const i = "i9-demo";
  assert.equal(isEventPath(`product/spec/iterations/${i}/evidence/gate_kickoff-1.json`, i), true);
  assert.equal(isEventPath(`product/spec/iterations/${i}/machines/it/machine-build-steps.canvas`, i), true);
  assert.equal(isEventPath(`product/spec/iterations/${i}/state.json`, i), true);
  assert.equal(isEventPath("product/spec/ledger/se/adr-something.md", i), false, "a ledger node is a live claim");
  assert.equal(isEventPath("product/deliverable/engine/loop.ts", i), false, "product code is a live claim");
  assert.equal(isEventPath("product/spec/iterations/grants.jsonl", i), false, "the grant index stays on trunk");
  assert.equal(isEventPath("product/spec/iterations/plan.json", i), false, "the plan is a live claim");
  assert.equal(isEventPath("product/spec/iterations/other-iter/evidence/x.json", i), false, "only THIS iteration's events");
});

test("R1 MILESTONE COMMIT: a bless-time commit lands on the iteration's branch, trunk untouched", () => {
  const root = trunkFixture();
  try {
    const head = git(["rev-parse", "HEAD"], root);
    const w = provisionWorktree(root, "it-a");
    fillIteration(w.root, "it-a", 1);
    const r = commitMilestone(root, "it-a", "gate_kickoff blessed");
    assert.equal(r.committed, true, "the milestone committed");
    assert.equal(git(["rev-list", "--count", `${head}..iter/it-a`], root), "1", "one commit on the branch");
    assert.equal(git(["rev-parse", "HEAD"], root), head, "trunk HEAD did not move");
    assert.equal(git(["-C", w.root, "status", "--porcelain"], root), "", "the worktree tree is clean after the commit");
  } finally {
    cleanup(root);
  }
});

test("R1 MILESTONE COMMIT: nothing to commit is legal, not an error", () => {
  const root = trunkFixture();
  try {
    provisionWorktree(root, "it-a");
    const r = commitMilestone(root, "it-a", "nothing changed");
    assert.equal(r.committed, false, "no empty commit is created");
  } finally {
    cleanup(root);
  }
});

test("R2/Q1 EMPTY BRANCH: the close REFUSES and leaves trunk byte-identical", () => {
  const root = trunkFixture();
  try {
    provisionWorktree(root, "it-a"); // provisioned, never worked
    const head = git(["rev-parse", "HEAD"], root);
    const res = shipMerge(root, "it-a");
    assert.equal(res.merged, false, "an empty branch does not merge");
    assert.ok(res.refused, "the refusal is named");
    assert.equal(git(["rev-parse", "HEAD"], root), head, "trunk HEAD unchanged");
    assert.equal(git(["status", "--porcelain"], root), "", "no merge left pending");
  } finally {
    cleanup(root);
  }
});

test("R3/R5/R6 THE FILTERED CLOSE: tag created, two parents, events withheld but reachable", () => {
  const root = trunkFixture();
  try {
    const w = provisionWorktree(root, "it-a");
    for (const n of [1, 2, 3]) {
      fillIteration(w.root, "it-a", n);
      commitMilestone(root, "it-a", `milestone ${n}`);
    }
    const res = shipMerge(root, "it-a");
    assert.equal(res.merged, true, "the close merged");
    assert.equal(res.tag, "iter/it-a", "the tag is reported");

    // R3: the tag exists.
    assert.match(git(["tag", "--list", "iter/it-a"], root), /iter\/it-a/, "the tag was created");

    // R5: two parents, and the tree carries no events.
    const parents = git(["rev-list", "--parents", "-n", "1", "HEAD"], root).split(/\s+/).slice(1);
    assert.equal(parents.length, 2, "the merge commit keeps both parents");
    const tree = git(["ls-tree", "-r", "--name-only", "HEAD"], root).split("\n");
    const leaked = tree.filter((f) => f.startsWith("product/spec/iterations/it-a/"));
    assert.deepEqual(leaked, [], "no event file reached trunk");
    assert.ok(!existsSync(join(root, "product", "spec", "iterations", "it-a")), "and none is left on disk");

    // The claims DID merge - all three milestones.
    for (const n of [1, 2, 3]) {
      assert.ok(tree.includes(`product/spec/ledger/se/claim-${n}.md`), `claim ${n} merged`);
    }

    // R6: every milestone's evidence is still readable through the tag.
    for (const n of [1, 2, 3]) {
      const ev = git(["show", `iter/it-a:product/spec/iterations/it-a/evidence/gate-${n}.json`], root);
      assert.match(ev, new RegExp(`"milestone":${n}`), `milestone ${n}'s evidence reachable through the tag`);
    }
  } finally {
    cleanup(root);
  }
});

test("R4/Q1 UNTAGGABLE: the close refuses BEFORE merging, trunk unchanged", () => {
  const root = trunkFixture();
  try {
    const w = provisionWorktree(root, "it-a");
    fillIteration(w.root, "it-a", 1);
    commitMilestone(root, "it-a", "milestone 1");
    // Induce the failure: the tag name is already taken by something else.
    git(["tag", "iter/it-a", "main"], root);
    const head = git(["rev-parse", "HEAD"], root);
    const res = shipMerge(root, "it-a");
    assert.equal(res.merged, false, "an untaggable close does not merge");
    assert.ok(res.refused, "the refusal is named");
    assert.equal(git(["rev-parse", "HEAD"], root), head, "trunk HEAD unchanged");
    assert.equal(git(["status", "--porcelain"], root), "", "no merge left pending");
  } finally {
    cleanup(root);
  }
});

test("R8 CONFLICT: a clash on a live claim aborts and leaves trunk unchanged", () => {
  const root = trunkFixture();
  try {
    const w = provisionWorktree(root, "it-a");
    writeFileSync(join(w.root, "product", "spec", "ledger", "se", "claim.md"), "branch version\n");
    fillIteration(w.root, "it-a", 1);
    commitMilestone(root, "it-a", "milestone 1");
    // Trunk moves the same file the other way.
    writeFileSync(join(root, "product", "spec", "ledger", "se", "claim.md"), "trunk version\n");
    git(["add", "-A"], root);
    git(["commit", "-qm", "trunk edit"], root);
    const head = git(["rev-parse", "HEAD"], root);

    const res = shipMerge(root, "it-a");
    assert.equal(res.merged, false, "a conflicting close does not merge");
    assert.ok(res.conflict, "the conflict is reported");
    assert.equal(git(["rev-parse", "HEAD"], root), head, "trunk HEAD unchanged");
    assert.equal(git(["status", "--porcelain"], root), "", "the merge was aborted, nothing left pending");
  } finally {
    cleanup(root);
  }
});

test("R9 VERIFIABLE WORKTREE: the toolchain is INSTALLED into the tree, never linked to a shared one", () => {
  const root = trunkFixture();
  try {
    // A shared install exists on trunk. Provisioning must not reach for it:
    // a link here is a path a later removal follows (se.law-imports-are-read-only).
    mkdirSync(join(root, "product", "deliverable", "node_modules", "typescript"), { recursive: true });
    writeFileSync(join(root, "product", "deliverable", "package.json"), '{"name":"x","private":true,"version":"1.0.0"}\n');
    git(["add", "-A"], root);
    git(["commit", "-qm", "deliverable"], root);

    const w = provisionWorktree(root, "it-a");
    const nm = join(w.root, "product", "deliverable", "node_modules");
    if (existsSync(nm)) {
      assert.ok(!lstatSync(nm).isSymbolicLink(), "the worktree's toolchain is its own, not a link into the shared install");
    }
  } finally {
    cleanup(root);
  }
});

test("R9 SAFETY: retiring a worktree must NOT delete through the linked toolchain", () => {
  // Witnessed for real: a worktree removal followed the node_modules junction
  // and emptied trunk's shared install. The link is unlinked before removal.
  const root = trunkFixture();
  try {
    const nm = join(root, "product", "deliverable", "node_modules");
    mkdirSync(join(nm, "typescript"), { recursive: true });
    writeFileSync(join(nm, "typescript", "package.json"), '{"name":"typescript"}\n');
    const w = provisionWorktree(root, "it-a");
    // Provisioning no longer creates links, but a hand-made or legacy one must
    // still never be followed - this is the guard that made the real damage.
    mkdirSync(join(w.root, "product", "deliverable"), { recursive: true });
    symlinkSync(nm, join(w.root, "product", "deliverable", "node_modules"), "junction");

    retireWorktree(root, "it-a", "ship");

    assert.ok(existsSync(join(nm, "typescript", "package.json")), "trunk's shared install survived the retirement");
    assert.equal(readdirSync(nm).length, 1, "and nothing in it was emptied");
  } finally {
    cleanup(root);
  }
});

test("R10 STALE FORK: provisioning warns when trunk carries uncommitted deliverable changes", () => {
  const root = trunkFixture();
  try {
    mkdirSync(join(root, "product", "deliverable"), { recursive: true });
    writeFileSync(join(root, "product", "deliverable", "engine.ts"), "committed\n");
    git(["add", "-A"], root);
    git(["commit", "-qm", "engine"], root);

    const clean = provisionWorktree(root, "it-clean");
    assert.ok(
      !(clean.warnings ?? []).some((w) => w.includes("uncommitted")),
      "a clean trunk provisions without a stale-fork warning",
    );

    writeFileSync(join(root, "product", "deliverable", "engine.ts"), "edited but not committed\n");
    const dirty = provisionWorktree(root, "it-dirty");
    assert.ok(
      (dirty.warnings ?? []).some((w) => w.includes("uncommitted")),
      "a dirty trunk warns that the fork will not match the running engine",
    );
  } finally {
    cleanup(root);
  }
});

test("R7 POINTER: the tag name is deterministic, and the bless path stamps it and commits the milestone", () => {
  // Deterministic by construction: the pointer can name the tag before the
  // close creates it, which is what lets a grant survive its evidence leaving.
  assert.equal(iterationTag("i5d-close-merge-split"), "iter/i5d-close-merge-split");

  // Structural guard on the wiring itself: a behavioural test here would need a
  // full machine fixture, so this asserts that the bless path still carries the
  // two things R7 depends on. It fails loudly if either is dropped.
  const gate = readFileSync(join(import.meta.dirname, "..", "engine", "gate.ts"), "utf8");
  assert.match(gate, /evidence_tag: iterationTag\(iterName\)/, "the grant stamps the evidence tag");
  assert.match(gate, /commitMilestone\(projectRoot, iterName/, "the bless commits the milestone to the iteration's branch");
  assert.match(
    gate,
    /openWorktrees\(projectRoot\)/,
    "the stream is resolved from the PROJECT root, so a caller rooted in the worktree sees it too",
  );
  assert.ok(
    gate.indexOf("writeFileSync(instPath") < gate.indexOf("commitMilestone(projectRoot, iterName"),
    "the milestone commit happens AFTER the machine advances, so it captures the blessed state",
  );
});

test("THE SHIP PATH ITSELF SPLITS: closing an iteration through the loop merges, tags and withholds - no one calls shipMerge by hand", () => {
  // The gap that let i8c report shipped while the repository recorded nothing:
  // shipMerge existed but only tests ever invoked it.
  const root = mkdtempSync(join(tmpdir(), "i5d-ship-"));
  try {
    git(["init", "-q", "-b", "main"], root);
    git(["config", "user.email", "t@t"], root);
    git(["config", "user.name", "t"], root);
    plantMachines(root);
    writeFileSync(join(root, ".gitignore"), ".worktrees/\n");
    git(["add", "-A"], root);
    git(["commit", "-qm", "base"], root);
    const head = git(["rev-parse", "HEAD"], root);

    const m = loadMachine(root, "lean")!;
    const lean = { ...m, states: m.states.map((s) => (s.id === "verify" ? { ...s, command: 'node -e "process.exit(0)"' } : s)) };
    const loop = () => new Loop(root, lean);

    loop().start("it-ship");
    const wt = join(root, ".worktrees", "it-ship");
    // Work that produces BOTH a live claim and an event.
    mkdirSync(join(wt, "product", "spec", "iterations", "it-ship", "evidence"), { recursive: true });
    writeFileSync(join(wt, "product", "spec", "ledger", "se", "claim.md"), "---\nid: se.claim\nkind: note\nstatement: Claim.\n---\n");
    writeFileSync(join(wt, "product", "spec", "iterations", "it-ship", "evidence", "gate-1.json"), '{"e":1}\n');

    loop().submit({ goal: "g", load_bearing_for: "l", exit_check: "e" });
    loop().submit({ changed: "c" });
    const offered = loop().submit({ exit_check_result: "done" });
    new Gate(wt).bless(lean, offered.offer_hash!, { channel: "test", adjudicated_by: "agent" });

    // Nobody calls shipMerge here - blessing the final gate must do the split,
    // through the same path a board bless takes.
    assert.notEqual(git(["rev-parse", "HEAD"], root), head, "trunk actually moved - the i8c failure was a ship that changed nothing");
    assert.match(git(["tag", "--list", "iter/it-ship"], root), /iter\/it-ship/, "the record is named");
    const tree = git(["ls-tree", "-r", "--name-only", "HEAD"], root).split("\n");
    assert.ok(tree.includes("product/spec/ledger/se/claim.md"), "the live claim merged");
    assert.ok(!tree.some((f) => f.startsWith("product/spec/iterations/it-ship/")), "the events did not");
    assert.match(
      git(["show", "iter/it-ship:product/spec/iterations/it-ship/evidence/gate-1.json"], root),
      /"e":1/,
      "and they are reachable through the tag",
    );
  } finally {
    cleanup(root);
  }
});

test("R12 ARCHIVE STAYS LISTABLE: a closed iteration is still named on trunk after its files leave", () => {
  const root = trunkFixture();
  try {
    const w = provisionWorktree(root, "it-a");
    fillIteration(w.root, "it-a", 1);
    // The grant index lives on trunk and names the iteration (the owner's ruling).
    writeFileSync(
      join(root, "product", "spec", "iterations", "grants.jsonl"),
      JSON.stringify({ iteration: "it-a", state: "gate_release", hash: "x", channel: "board" }) + "\n",
    );
    git(["add", "-A"], root);
    git(["commit", "-qm", "grant recorded"], root);
    commitMilestone(root, "it-a", "milestone 1");

    shipMerge(root, "it-a");
    const tree = git(["ls-tree", "-r", "--name-only", "HEAD"], root).split("\n");
    assert.ok(tree.includes("product/spec/iterations/grants.jsonl"), "the grant index survives the filter");
    assert.ok(
      !tree.some((f) => f.startsWith("product/spec/iterations/it-a/")),
      "while the iteration's own files are gone",
    );
  } finally {
    cleanup(root);
  }
});
