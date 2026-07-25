// FITNESS FUNCTIONS (i12 M7) — properties over the WHOLE machine, not examples.
//
// The distinction matters here more than usual. Every other reopen test in this
// repository is a memorial to a bug we already had. These are written to catch
// the bug we have not had yet, and the bar set when they were promoted was:
// "this test, written yesterday, catches today's two bugs."
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { requireSystematic } from "../engine/machines/load.ts";
import { completeState, reopenStates, activeStates, type MachineDecl, type MachineInstance } from "../engine/machine.ts";
import { searchProduct } from "../engine/search.ts";

const REPO = join(import.meta.dirname, "..", "..", "..");
// The SYSTEMATIC machine — the one iterations actually walk, and therefore the
// one whose reopen behaviour has to hold.
const machine = requireSystematic(REPO);

const ROUNDS = ["verify_round", "validate_round", "redteam_round", "verdict"];

// ---------------------------------------------------------------- P3
test("FITNESS: every gate in the machine collects all four review rounds", () => {
  const gates = machine.states.filter((s) => s.kind === "gate");
  assert.ok(gates.length > 0, "the machine has gates at all");

  const missing: string[] = [];
  for (const g of gates) {
    const names = new Set(g.evidence_form.map((f) => f.name));
    for (const r of ROUNDS) {
      const field = g.evidence_form.find((f) => f.name === r);
      if (!names.has(r)) missing.push(`${g.id}: no ${r}`);
      else if (field?.required !== true) missing.push(`${g.id}: ${r} is not REQUIRED`);
    }
  }
  // A property over every gate, not a check of the two we happen to remember.
  // The rounds were required in writing for this project's whole history and
  // filled in zero gates, because nothing ever asserted this.
  assert.deepEqual(missing, [], `gates that would pass without a review:\n${missing.join("\n")}`);
});

// ---------------------------------------------------------------- P2
/** Walk the real machine to completion, recording fills as the loop does. */
function walkToEnd(m: MachineDecl): MachineInstance {
  const inst: MachineInstance = {
    machine: m.id,
    iteration: "prop",
    current: m.initial,
    active: [m.initial],
    fired: [],
    counters: {},
    history: [],
    escapes: [],
    status: "open",
  };
  for (let step = 0; step < 500 && inst.status === "open"; step++) {
    const act = activeStates(inst);
    if (act.length === 0) break;
    const id = act[0];
    completeState(m, inst, id, "filled", "t");
    inst.history.push({ state: id, outcome: "filled", evidence: `${id}.json`, at: "t" });
  }
  return inst;
}

/** Required inbound edges of a state, as fuel keys. */
function requiredInbound(m: MachineDecl, to: string): { key: string; from: string }[] {
  return m.states.flatMap((src) =>
    src.edges.filter((e) => e.to === to && (e.role === "normal" || e.role === "approval")).map(() => ({ key: `${src.id}->${to}`, from: src.id })),
  );
}

test("FITNESS: reopening ANY state leaves the walk able to reach its gates", () => {
  const done = walkToEnd(machine);
  const filled = [...new Set(done.history.filter((h) => h.outcome === "filled").map((h) => h.state))];
  assert.ok(filled.length > 5, `the walk actually ran — filled ${filled.length}: ${filled.join(",")} | status ${done.status} | active ${JSON.stringify(done.active)}`);

  const violations: string[] = [];
  for (const target of filled) {
    // Fresh copy per candidate — a reopen mutates.
    const inst: MachineInstance = JSON.parse(JSON.stringify(done));
    const { cone } = reopenStates(machine, inst, [target], "property probe", "t");
    const inCone = new Set(cone);
    const fired = new Set(inst.fired ?? []);

    // INVARIANT A — no stranding. A state in the cone may be a join fed from
    // OUTSIDE it. Those sources stay done and will never fire again, so their
    // fuel must have been restored, or the join is unreachable forever.
    for (const t of cone) {
      // The reopened states themselves are ACTIVATED directly, so they need no
      // fuel — and must not have any (invariant B). Only their downstream needs
      // its joins re-armed. Getting this wrong flagged every state in the
      // machine on the first run, which is the ordinary way a property test
      // lies: it is a claim too, and it has to be read as sceptically as the
      // code it judges.
      if (target === t) continue;
      for (const { key, from } of requiredInbound(machine, t)) {
        if (inCone.has(from)) continue; // it will fire on its own when re-walked
        const stillDone = inst.history.some((h) => h.state === from && h.outcome === "filled");
        if (stillDone && !fired.has(key)) violations.push(`reopen(${target}): ${t} is stranded — ${key} was consumed and never restored`);
      }
    }

    // INVARIANT B — no self-reactivation. A state being activated NOW must not
    // also have fuel waiting for it; the fuel would sit until it completes and
    // then re-activate it, forever.
    for (const { key } of requiredInbound(machine, target)) {
      if (fired.has(key)) violations.push(`reopen(${target}): fuel ${key} is waiting for a state that is already active — it will re-activate itself`);
    }
  }
  assert.deepEqual(violations.slice(0, 10), [], `reopen breaks the walk for ${violations.length} state(s):\n${violations.slice(0, 10).join("\n")}`);
});

test("FITNESS: a reopened state completes and MOVES ON", () => {
  const done = walkToEnd(machine);
  const filled = [...new Set(done.history.filter((h) => h.outcome === "filled").map((h) => h.state))];

  const stuck: string[] = [];
  for (const target of filled) {
    const inst: MachineInstance = JSON.parse(JSON.stringify(done));
    reopenStates(machine, inst, [target], "property probe", "t");
    if (!activeStates(inst).includes(target)) continue;
    completeState(machine, inst, target, "filled", "t");
    if (activeStates(inst).includes(target)) stuck.push(target);
  }
  assert.deepEqual(stuck, [], `these states re-activate themselves after being reopened:\n${stuck.join("\n")}`);
});

// ---------------------------------------------------------------- P1
test("a binary file cannot produce a malformed record in a ref search", () => {
  const root = mkdtempSync(join(tmpdir(), "se-binprobe-"));
  const git = (...a: string[]): string => execFileSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
  try {
    git("init", "-q");
    git("config", "user.email", "t@t");
    git("config", "user.name", "t");
    mkdirSync(join(root, "sub"), { recursive: true });
    writeFileSync(join(root, "sub", "text.ts"), "const ZQNEEDLE = 1;\n");
    // The hazard: git grep WITHOUT -I emits "Binary file <path> matches" — a
    // line with NO field separators at all, so a parser expecting three fields
    // gets one. The flag that prevents it looks like a tidy default and has no
    // reason attached, so a future simplification would remove it and ref
    // search would break on any repository containing a binary.
    writeFileSync(join(root, "blob.dat"), Buffer.from([0, 1, 2, 0, 90, 81, 78, 69, 69, 68, 76, 69]));
    git("add", "-A");
    git("commit", "-q", "-m", "base");

    const res = searchProduct(root, "ZQNEEDLE", { ref: "HEAD" });
    assert.ok(res.hits.length > 0, "the text file is found");
    for (const h of res.hits) {
      assert.equal(typeof h.path, "string");
      assert.ok(h.path.length > 0, "every record has a path");
      assert.equal(typeof h.line, "number");
      assert.ok(Number.isFinite(h.line) && h.line > 0, `every record has a real line number, got ${h.line} for ${h.path}`);
      assert.ok(!/^Binary file/.test(h.path), "a binary notice must never arrive as a record");
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
