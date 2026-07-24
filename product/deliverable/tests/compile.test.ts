// The machine compiler: this repo's drawn machines compile into the shapes
// the engine runs, and malformed drawings refuse with the element named.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadLedger } from "../engine/store.ts";
import { layout } from "../engine/layout.ts";
import { compileMachine, MachineCompileError } from "../engine/machines/compile.ts";
import { CANVAS_VERSION } from "../engine/canvas.ts";

const REPO_ROOT = join(import.meta.dirname, "..", "..", "..");
const repoLedger = () => loadLedger(layout.ledger(REPO_ROOT));

test("the drawn lean machine compiles to the executable shape", () => {
  const m = compileMachine(repoLedger(), "se.machine-lean");
  assert.equal(m.id, "lean");
  assert.equal(m.initial, "declare_goal");
  assert.equal(m.reentry, "restart");
  assert.deepEqual(m.states.map((s) => s.id), ["declare_goal", "do_work", "verify", "close_iteration", "closed"]);
  const verify = m.states.find((s) => s.id === "verify")!;
  assert.equal(verify.filled_by, "engine");
  assert.match(verify.command!, /npm --prefix product\/deliverable run verify/);
  const fallback = verify.edges.find((e) => e.role === "fallback")!;
  assert.equal(fallback.to, "do_work");
  assert.equal(fallback.guard, "verify_attempts < 3");
  const gate = m.states.find((s) => s.id === "close_iteration")!;
  assert.equal(gate.kind, "gate");
  assert.equal(gate.edges[0].role, "approval");
  assert.ok(m.states.find((s) => s.id === "declare_goal")!.evidence_form.length === 3);
});

test("the drawn systematic machine: onboarding plus nine milestones, gates, seeding sockets, the battery loop", () => {
  const m = compileMachine(repoLedger(), "se.machine-systematic");
  assert.equal(m.id, "systematic");
  assert.equal(m.initial, "onboard_retro");
  assert.equal(m.states.length, 48);
  assert.equal(m.states.filter((s) => s.kind === "gate").length, 10);
  assert.equal(m.states.filter((s) => s.kind === "terminal").length, 1);
  // The seeding sockets: candidates, spikes, build chunks, killer demos.
  assert.deepEqual(
    m.states.filter((s) => s.submachine === "iteration").map((s) => s.id).sort(),
    ["build_steps", "enumerate_space", "fill_story_evidence", "plan_build", "rank_unknowns"],
  );
  // The battery law as edges: verification falls back into fix_findings, guarded.
  const ver = m.states.find((s) => s.id === "verification")!;
  assert.equal(ver.filled_by, "engine");
  const fb = ver.edges.find((e) => e.role === "fallback")!;
  assert.equal(fb.to, "fix_findings");
  assert.equal(fb.guard, "verification_attempts < 3");
  // Groups carry the milestone names.
  assert.equal(m.states.find((s) => s.id === "draft_vision")!.group, "M1 Frame");
  assert.equal(m.states.find((s) => s.id === "gate_release")!.group, "M9 Ship");
});

test("the drawn session machine nests systematic and carries the boot group", () => {
  const m = compileMachine(repoLedger(), "se.machine-session");
  assert.equal(m.initial, "lock_on");
  const nested = m.states.find((s) => s.submachine !== undefined)!;
  assert.equal(nested.id, "systematic");
  assert.equal(nested.submachine, "se.machine-systematic");
  assert.equal(m.states.find((s) => s.id === "lock_on")!.group, "boot");
  assert.equal(m.states.find((s) => s.id === "idle")!.group, undefined);
  const idle = m.states.find((s) => s.id === "idle")!;
  assert.ok(idle.edges.some((e) => e.to === "ended" && e.role === "alternative"));
});

test("the drawn offer machine compiles", () => {
  const m = compileMachine(repoLedger(), "se.machine-offer");
  assert.deepEqual(m.states.map((s) => s.id).sort(), ["accepted", "dismissed", "waiting"]);
});

test("the tutorial machine compiles and exercises every feature", () => {
  const m = compileMachine(repoLedger(), "se.machine-tutorial");
  const roles = new Set<string>(m.states.flatMap((s) => s.edges.map((e) => e.role)));
  for (const r of ["normal", "alternative", "fallback", "recovery", "approval", "error"]) assert.ok(roles.has(r), r);
  assert.ok(m.states.some((s) => s.filled_by === "engine" && s.command !== undefined));
  assert.ok(m.states.some((s) => s.kind === "gate"));
  assert.equal(m.states.filter((s) => s.kind === "terminal").length, 2);
  assert.ok(m.states.some((s) => s.submachine === "iteration"));
  assert.ok(m.states.some((s) => s.submachine === "se.machine-systematic"));
  assert.ok(m.states.some((s) => s.edges.some((e) => e.guard !== undefined)));
  assert.ok(m.states.some((s) => s.group !== undefined));
});

/** A minimal drawn machine in a throwaway ledger, mutated per failure case. */
function fixture(mutate: (canvas: Record<string, unknown>) => void): () => void {
  const root = mkdtempSync(join(tmpdir(), "se-compile-"));
  mkdirSync(join(root, "se"), { recursive: true });
  const note = (localId: string, state: string, kind: string) =>
    writeFileSync(
      join(root, "se", `${localId}.md`),
      `---\nid: se.${localId}\nkind: machine_state\nstatement: S.\nmachine: se.machine-t\nstate: ${state}\nstate_kind: ${kind}\nfilled_by: agent\n---\n\n## Guidance\ng\n`,
      "utf8",
    );
  note("machine-t-a", "a", "work");
  note("machine-t-b", "b", "terminal");
  const canvas: Record<string, unknown> = {
    metadata: { version: CANVAS_VERSION, frontmatter: { id: "se.machine-t", kind: "machine", statement: "T.", entry: "a" } },
    nodes: [
      { id: "n-a", type: "file", file: "spec/ledger/se/machine-t-a.md", x: 0, y: 0, width: 100, height: 50 },
      { id: "n-b", type: "file", file: "spec/ledger/se/machine-t-b.md", x: 0, y: 100, width: 100, height: 50 },
    ],
    edges: [{ id: "e1", fromNode: "n-a", toNode: "n-b", fromSide: "bottom", toSide: "top" }],
  };
  mutate(canvas);
  writeFileSync(join(root, "se", "machine-t.canvas"), JSON.stringify(canvas), "utf8");
  return () => {
    try {
      compileMachine(loadLedger(root), "se.machine-t");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  };
}

test("a well-formed fixture compiles; each malformation refuses with the element named", () => {
  fixture(() => {})();
  // Text nodes are comments: the compiler skips them.
  fixture((c) => (c.nodes as object[]).push({ id: "n-c", type: "text", text: "a comment", x: 0, y: 200, width: 10, height: 10 }))();

  const cases: { name: string; mutate: (c: Record<string, unknown>) => void; want: RegExp }[] = [
    {
      name: "unknown role",
      mutate: (c) => (((c.edges as { styleAttributes?: object }[])[0]).styleAttributes = { role: "sometimes" }),
      want: /unknown role/,
    },
    {
      name: "label that is not a guard",
      mutate: (c) => (((c.edges as { label?: string }[])[0]).label = "blessed"),
      want: /must be a guard/,
    },
    {
      name: "dangling note reference",
      mutate: (c) => (((c.nodes as { file?: string }[])[0]).file = "spec/ledger/se/machine-t-nope.md"),
      want: /dangling reference/,
    },
    {
      name: "no path to a terminal",
      mutate: (c) => ((c.edges as object[]).length = 0),
      want: /no path to a terminal/,
    },
  ];
  for (const { name, mutate, want } of cases) {
    assert.throws(fixture(mutate), (e: unknown) => e instanceof MachineCompileError && want.test(e.message), name);
  }
});
