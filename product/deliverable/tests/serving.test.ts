// Loop-level parallel serving + complete child machines. Red-first against
// the designed API: the loop serves every unclaimed active state; children
// run engine-filled states and offer their gates.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import type { MachineDecl } from "../engine/machine.ts";
import { Loop } from "../engine/loop.ts";
import { Gate } from "../engine/gate.ts";

const S = (
  id: string,
  kind: "work" | "gate" | "terminal",
  edges: { to: string; role?: "normal" | "approval" }[],
  extra: { command?: string; submachine?: string } = {},
) => ({
  id,
  kind,
  statement: id,
  filled_by: (extra.command !== undefined ? "engine" : "agent") as "engine" | "agent",
  ...(extra.command !== undefined ? { command: extra.command } : {}),
  guidance: "",
  evidence_form: [],
  ...(extra.submachine !== undefined ? { submachine: extra.submachine } : {}),
  edges: edges.map((e) => ({ to: e.to, role: e.role ?? ("normal" as const) })),
});

/** a -> (b, c) -> j(join) -> t : the drawn-parallel shape the loop must SERVE. */
const PAR: MachineDecl = {
  id: "par",
  reentry: "restart",
  initial: "a",
  states: [
    S("a", "work", [{ to: "b" }, { to: "c" }]),
    S("b", "work", [{ to: "j" }]),
    S("c", "work", [{ to: "j" }]),
    S("j", "work", [{ to: "t" }]),
    S("t", "terminal", []),
  ],
};

test("the loop serves BOTH parallel states, claims separate sessions, and joins", () => {
  const root = mkdtempSync(join(tmpdir(), "se-serve-"));
  try {
    const loop = new Loop(root, PAR);
    loop.start("i-par");
    const first = loop.submit({}); // completes a — the machine forks
    assert.equal(first.kind, "work");
    const served = new Set([first.state]);
    const second = loop.next({ session: "s2" });
    assert.equal(second.kind, "work");
    served.add(second.state!);
    assert.deepEqual([...served].sort(), ["b", "c"], "both branches are served, not one current");
    loop.submit({}, { state: "b" });
    const held = loop.next();
    assert.notEqual(held.state, "j", "the join holds until c fires");
    loop.submit({}, { state: "c" });
    const joined = loop.next();
    assert.equal(joined.state, "j", "all inputs fired - the join serves");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("single-active machines keep the exact old packet flow", () => {
  const root = mkdtempSync(join(tmpdir(), "se-lin-"));
  try {
    const LIN: MachineDecl = {
      id: "lin",
      reentry: "restart",
      initial: "x",
      states: [S("x", "work", [{ to: "y" }]), S("y", "work", [{ to: "t" }]), S("t", "terminal", [])],
    };
    const loop = new Loop(root, LIN);
    loop.start("i-lin");
    const p = loop.submit({});
    assert.equal(p.state, "y");
    const done = loop.submit({});
    assert.equal(done.kind, "closed");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a child machine runs engine-filled states and offers its gate", async () => {
  const root = mkdtempSync(join(tmpdir(), "se-child-"));
  try {
    const M: MachineDecl = {
      id: "parent",
      reentry: "restart",
      initial: "seed",
      states: [S("seed", "work", [{ to: "t" }], { submachine: "iteration" }), S("t", "terminal", [])],
    };
    const dir = join(root, "product", "spec", "iterations", "i-child", "machines", "it");
    mkdirSync(dir, { recursive: true });
    const note = (state: string, kind: string, cmd?: string) =>
      writeFileSync(
        join(dir, `machine-seed-${state}.md`),
        `---\nid: it.machine-seed-${state}\nkind: machine_state\nstatement: ${state}.\nmachine: it.machine-seed\nstate: ${state}\nstate_kind: ${kind}\nfilled_by: ${cmd !== undefined ? "engine" : "agent"}\n${cmd !== undefined ? `command: ${JSON.stringify(cmd)}\n` : ""}---\n\n## Guidance\ng\n`,
        "utf8",
      );
    note("run", "work", `node -e "process.exit(0)"`);
    note("check", "gate");
    note("done", "terminal");
    writeFileSync(
      join(dir, "machine-seed.canvas"),
      JSON.stringify({
        metadata: { version: "1.0-1.0", frontmatter: { id: "it.machine-seed", kind: "machine", statement: "C.", entry: "run" } },
        nodes: [
          { id: "n1", type: "file", file: "ledger/it/machine-seed-run.md", x: 0, y: 0, width: 100, height: 50 },
          { id: "n2", type: "file", file: "ledger/it/machine-seed-check.md", x: 0, y: 100, width: 100, height: 50 },
          { id: "n3", type: "file", file: "ledger/it/machine-seed-done.md", x: 0, y: 200, width: 100, height: 50 },
        ],
        edges: [
          { id: "e1", fromNode: "n1", toNode: "n2", fromSide: "bottom", toSide: "top" },
          { id: "e2", fromNode: "n2", toNode: "n3", fromSide: "bottom", toSide: "top", styleAttributes: { role: "approval" } },
        ],
      }),
      "utf8",
    );
    const loop = new Loop(root, M);
    const p1 = loop.start("i-child"); // the child's engine state runs mechanically
    assert.equal(p1.state, "check", "the engine-filled child state auto-closed");
    assert.equal((p1 as { parent_state?: string }).parent_state, "seed");
    const offered = loop.submit({ ok: "y" }); // the child gate OFFERS like any gate
    assert.equal(offered.kind, "gate_offered");
    const gate = new Gate(root);
    assert.ok(gate.current() !== null, "a real offer exists for the child gate");
    gate.dismiss(); // clean up the offer for the tmp root
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
