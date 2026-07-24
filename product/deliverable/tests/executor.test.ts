// The parallel executor: token set, all-fired joins, adoption, claims.
// Red-first: these import the designed API before it exists.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fork } from "node:child_process";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import type { MachineDecl, MachineInstance } from "../engine/machine.ts";
import { activeStates, advance, completeState } from "../engine/machine.ts";
import { claimState, writeInstanceAtomic, readInstance } from "../engine/instance.ts";
import { Loop } from "../engine/loop.ts";
import { layout } from "../engine/layout.ts";

const F = (id: string, edges: { to: string; role?: string }[] = [], kind: "work" | "gate" | "terminal" = "work") => ({
  id,
  kind,
  statement: id,
  filled_by: "agent" as const,
  guidance: "",
  evidence_form: [],
  edges: edges.map((e) => ({ to: e.to, role: (e.role ?? "normal") as "normal" })),
});

/** A -> (B, C in parallel) -> D (join) -> end */
const DIAMOND: MachineDecl = {
  id: "diamond",
  reentry: "restart",
  initial: "a",
  states: [
    F("a", [{ to: "b" }, { to: "c" }]),
    F("b", [{ to: "d" }]),
    F("c", [{ to: "d" }]),
    F("d", [{ to: "end" }]),
    F("end", [], "terminal"),
  ],
};

const inst = (over: Partial<MachineInstance> = {}): MachineInstance => ({
  machine: "diamond",
  iteration: "i-test",
  current: "a",
  counters: {},
  history: [],
  escapes: [],
  status: "open",
  ...over,
});

test("adoption: an instance without active[] reads as [current]", () => {
  const i = inst();
  assert.deepEqual(activeStates(i), ["a"]);
});

test("completing a state activates every all-fired successor in parallel", () => {
  const i = inst();
  completeState(DIAMOND, i, "a", "filled", "t0");
  assert.deepEqual([...activeStates(i)].sort(), ["b", "c"]);
  assert.equal(i.current, activeStates(i)[0], "current stays the first-token alias");
});

test("a join waits for ALL inbound fired edges", () => {
  const i = inst();
  completeState(DIAMOND, i, "a", "filled", "t0");
  completeState(DIAMOND, i, "b", "filled", "t1");
  assert.ok(!activeStates(i).includes("d"), "d must hold: c has not fired");
  completeState(DIAMOND, i, "c", "filled", "t2");
  assert.deepEqual(activeStates(i), ["d"]);
});

test("activating a terminal closes the instance", () => {
  const i = inst();
  completeState(DIAMOND, i, "a", "filled", "t0");
  completeState(DIAMOND, i, "b", "filled", "t1");
  completeState(DIAMOND, i, "c", "filled", "t2");
  completeState(DIAMOND, i, "d", "filled", "t3");
  assert.equal(i.status, "closed");
});

test("a recovery edge fires on FILLED: the repaired state returns into verification", () => {
  const REC: MachineDecl = {
    id: "rec",
    reentry: "restart",
    initial: "v",
    states: [
      F("v", [{ to: "end" }, { to: "f", role: "fallback" }]),
      F("f", [{ to: "v", role: "recovery" }]),
      F("end", [], "terminal"),
    ],
  };
  const viaAdvance = inst({ machine: "rec", current: "f" });
  const r = advance(REC, viaAdvance, "filled", "t0");
  assert.equal(r.moved, true, "a successful fix must have a legal edge");
  assert.equal(viaAdvance.current, "v");

  const viaTokens = inst({ machine: "rec", current: "f", active: ["f"] });
  completeState(REC, viaTokens, "f", "filled", "t0");
  assert.deepEqual(activeStates(viaTokens), ["v"], "recovery is an OR path under token semantics");
});

test("claim: the second claimant of one state loses and gets the next unclaimed", () => {
  const root = mkdtempSync(join(tmpdir(), "se-claim-"));
  try {
    const i = inst();
    completeState(DIAMOND, i, "a", "filled", "t0"); // b and c active
    mkdirSync(layout.iterationDir(root, i.iteration), { recursive: true });
    writeInstanceAtomic(root, i);
    const first = claimState(root, i.iteration, "s1");
    const second = claimState(root, i.iteration, "s2");
    assert.equal(first.state, "b");
    assert.equal(second.state, "c", "the contested state routes the second session onward");
    const onDisk = readInstance(root, i.iteration);
    assert.equal(onDisk.claims?.b, "s1");
    assert.equal(onDisk.claims?.c, "s2");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a seeding state runs the iteration's own drawn sub-machine to its terminal", () => {
  const root = mkdtempSync(join(tmpdir(), "se-seed-"));
  try {
    const S = (id: string, kind: "work" | "terminal", edges: { to: string; role: "normal" }[], submachine?: string) => ({
      id,
      kind,
      statement: id,
      filled_by: "agent" as const,
      guidance: "",
      evidence_form: [],
      ...(submachine !== undefined ? { submachine } : {}),
      edges,
    });
    const M: MachineDecl = {
      id: "parent",
      reentry: "restart",
      initial: "plan",
      states: [S("plan", "work", [{ to: "after", role: "normal" }], "iteration"), S("after", "work", [{ to: "t", role: "normal" }]), S("t", "terminal", [])],
    };
    // The iteration provides its own drawing for the seeding state.
    const machinesDir = join(root, "product", "spec", "iterations", "i-seed", "machines", "it");
    mkdirSync(machinesDir, { recursive: true });
    const note = (state: string) =>
      writeFileSync(
        join(machinesDir, `machine-plan-${state}.md`),
        `---\nid: it.machine-plan-${state}\nkind: machine_state\nstatement: ${state}.\nmachine: it.machine-plan\nstate: ${state}\nstate_kind: ${state === "done" ? "terminal" : "work"}\nfilled_by: agent\n---\n\n## Guidance\ng\n`,
        "utf8",
      );
    note("c1");
    note("c2");
    note("done");
    writeFileSync(
      join(machinesDir, "machine-plan.canvas"),
      JSON.stringify({
        metadata: { version: "1.0-1.0", frontmatter: { id: "it.machine-plan", kind: "machine", statement: "Chunks.", entry: "c1" } },
        nodes: [
          { id: "n1", type: "file", file: "ledger/it/machine-plan-c1.md", x: 0, y: 0, width: 100, height: 50 },
          { id: "n2", type: "file", file: "ledger/it/machine-plan-c2.md", x: 0, y: 100, width: 100, height: 50 },
          { id: "n3", type: "file", file: "ledger/it/machine-plan-done.md", x: 0, y: 200, width: 100, height: 50 },
        ],
        edges: [
          { id: "e1", fromNode: "n1", toNode: "n2", fromSide: "bottom", toSide: "top" },
          { id: "e2", fromNode: "n2", toNode: "n3", fromSide: "bottom", toSide: "top" },
        ],
      }),
      "utf8",
    );
    const loop = new Loop(root, M);
    const first = loop.start("i-seed"); // the seeding state serves its child's first chunk
    assert.equal(first.state, "c1");
    assert.equal((first as { parent_state?: string }).parent_state, "plan");
    const second = loop.submit({});
    assert.equal(second.state, "c2");
    const after = loop.submit({}); // the child reaches its terminal — the parent auto-completes
    assert.equal(after.state, "after", "the parent resumes past the seeded state");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("concurrent instance writes lose nothing (2 workers x 100 locked increments)", async () => {
  // The SP1 verdict as law: lock + atomic write = zero lost, zero torn.
  const root = mkdtempSync(join(tmpdir(), "se-conc-"));
  const workerFile = join(import.meta.dirname, "conc-worker.ts");
  try {
    const i = inst();
    mkdirSync(layout.iterationDir(root, i.iteration), { recursive: true });
    writeInstanceAtomic(root, i);
    const N = 100;
    const worker = (id: string) =>
      new Promise<void>((res, rej) => {
        const c = fork(workerFile, [], {
          stdio: "ignore",
          env: { ...process.env, SE_CONC_WORKER: id, SE_CONC_ROOT: root, SE_CONC_N: String(N) },
        });
        c.on("exit", (code) => (code === 0 ? res() : rej(new Error(`${id} exit ${code}`))));
      });
    await Promise.all([worker("w1"), worker("w2")]);
    const final = readInstance(root, "i-test");
    assert.equal(final.counters.w1, N, "every w1 update kept");
    assert.equal(final.counters.w2, N, "every w2 update kept");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
