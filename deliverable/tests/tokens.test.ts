// THE TOKEN SET, AND THE DAY IT STOPPED BEING THEORETICAL.
//
// The kernel has carried concurrent states since it was harvested:
// machine.ts declares the token set as "every concurrently active state", and
// joins re-arm on a reopen. The packet's `active` is a LIST, not a state.
//
// THIS FILE USED TO ASSERT THAT NOTHING FORKED. It was wrong, and it could
// not see that it was wrong: it read the .canvas drawings and the state notes
// only. The rigor matrix compiles a machine from ROWS, and M3's rows have
// fanned since they landed — write-requirements feeds derive-functions and
// identify-assumptions, and gate-requirements is the bar that collects them.
//
// So the three renderer collapses were not latent debt. They were live, and
// what saved them from being visibly wrong is that all three are cosmetic:
// which node blinks, which button appears, which panel opens by default.
//
// The owner ruled on 2026-08-08 that finders fans into five. So the guard
// flips: instead of asserting no fork exists, it asserts that nothing which
// answers "is the walk standing here" reads only the first token.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { completeState, type MachineDecl, type MachineInstance, reopenStates } from "../engine/machine.ts";
import { compileMachine } from "../engine/machines/compile.ts";
import { freshRoot, mirrorSource, mirrorSources } from "./helpers.ts";

const MACHINES = fileURLToPath(new URL("../machines/", import.meta.url));
const ROWS = fileURLToPath(new URL("../machines/rigor_matrix/rows/", import.meta.url));

/** Every drawn state note, by name. */
function stateNotes(): string[] {
  return readdirSync(`${MACHINES}states/`).filter((f) => f.endsWith(".md"));
}

describe("the token set", { concurrency: true }, () => {
  // THE FACT THE OLD VERSION OF THIS FILE COULD NOT SEE. A matrix row is a
  // machine's state too, and two of them naming one input is a fan.
  test("the rigor matrix already fans, and has since M3 landed", () => {
    const feeders = new Map<string, string[]>();
    for (const f of readdirSync(ROWS).filter((n) => n.endsWith(".md"))) {
      const text = readFileSync(ROWS + f, "utf8");
      const name = /^name:\s*(\S+)/m.exec(text)?.[1] ?? f;
      const block = /^depends_on:\n((?:\s+-\s.*\n)+)/m.exec(text)?.[1] ?? "";
      for (const line of block.split("\n")) {
        const dep = /^\s+-\s+(\S+)/.exec(line)?.[1];
        if (dep !== undefined) feeders.set(dep, [...(feeders.get(dep) ?? []), name]);
      }
    }
    const fans = [...feeders.entries()].filter(([, outs]) => outs.length > 1);
    assert.ok(fans.length > 0, "no row feeds two — the premise of this whole file has changed");
    assert.ok(
      feeders.get("write-requirements")?.length === 2,
      `write-requirements is the named example and must still fan: ${JSON.stringify(feeders.get("write-requirements"))}`,
    );
  });

  // A fan needs somewhere to fold. Two mechanisms exist and they are NOT the
  // same one: state_kind join is what makes the kernel wait for every inbound
  // edge (machine.ts activatePowered), and busbar is what lets the walk go
  // back to the branching point for a leg it has not taken (machine.ts
  // branchKind). A drawn fan wants both, and a drawing that has one without
  // the other is half a join.
  test("every drawn join also carries its bar", () => {
    for (const n of stateNotes()) {
      const text = readFileSync(`${MACHINES}states/${n}`, "utf8");
      if (!/^state_kind:\s*join/m.test(text)) continue;
      assert.match(text, /^busbar:\s*true/m, `states/${n} is a join with no busbar — the walk could never take the second leg`);
    }
  });

  // THE GUARD, flipped. Machines fork, so the question is no longer whether
  // one does. It is whether anything decides "is the walk here" from one
  // token. standingAt() reads the whole list; nothing else may ask.
  test("nothing answers standing-here from the first token alone", () => {
    const bad: string[] = [];
    for (const { rel, text } of mirrorSources()) {
      for (const [i, line] of text.split("\n").entries()) {
        if (/\bactive\[0\]/.test(line)) bad.push(`${rel}:${i + 1}`);
        // The shape the fix replaced. It compares one state id against one
        // remembered leaf, which is the collapse wearing different clothes.
        if (/===\s*CURRENT\b/.test(line) || /CURRENT\s*===/.test(line)) bad.push(`${rel}:${i + 1}`);
      }
    }
    assert.deepEqual(bad, [], `these show one state out of several: ${bad.join(", ")}`);
  });

  // The membership test exists, and it is the one every caller uses.
  test("standingAt reads the whole token list", () => {
    const source = mirrorSource();
    assert.match(source, /function standingAt\(id\)\s*\{\s*return WALK_HERE && CURRENTS\.indexOf\(id\) >= 0;/);
  });

  // THE MULTI-AGENT HOOK, half built. machine.ts declares claims as "which
  // session holds which active state" — exactly the per-agent marking the
  // owner wants. It is DELETED in three places and WRITTEN in none, so the
  // bookkeeping is complete and only the claim-staking is missing.
  //
  // The day a writer appears, the header's row of position buttons needs to
  // say WHO stands where, not only where. This pins the arrival so it is
  // noticed rather than discovered later.
  test("the per-agent claims field is cleaned up but never staked", () => {
    const kernel = readFileSync(fileURLToPath(new URL("../engine/machine.ts", import.meta.url)), "utf8");
    const lines = kernel.split("\n");
    const deletes = lines.filter((l) => /delete\s+inst\.claims\[/.test(l)).length;
    const writes = lines.filter((l) => /inst\.claims\[[^\]]+\]\s*=/.test(l) || /inst\.claims\s*=/.test(l)).length;
    assert.ok(deletes > 0, "the cleanup is still there");
    assert.equal(writes, 0, "a writer appeared — decide how several agents are drawn before it ships");
  });

  // The half that already worked, pinned so a refactor cannot quietly undo it.
  test("the drawing already fills every active box, not just the first", () => {
    const source = mirrorSource();
    assert.match(source, /new Set\(\s*info\.active/, "the box fill builds a set from the whole list");
  });

  // THE FAN, WALKED. Five legs hand out five tokens, and the bar releases on
  // the fifth submit rather than the first.
  test("the enumerate-space drawing fans into seven and folds on the last one", () => {
    const root = freshRoot();
    const m = compileMachine(root, join(root, "deliverable", "machines", "enumerate-space.canvas"));
    const legs = [
      "find_prior_art",
      "find_contradiction",
      "find_analogy",
      "find_without",
      "find_by_heuristic",
      "find_by_transforming",
      "find_by_probing",
    ];

    const start = m.states.find((s) => s.id === "start");
    assert.deepEqual(start?.edges.map((e) => e.to).sort(), [...legs].sort(), "start fans into all seven — a chain would list one");

    // THE BAR STANDS OVER THE WORK THAT JOINS THE LEGS, never over the pill
    // that closes the machine.
    const bar = m.states.find((s) => s.id === "build_chart");
    assert.equal(bar?.busbar, true, "the chart waits for every finder, and the walk may return for a leg it has not taken");
    assert.equal(m.states.find((s) => s.id === "end")?.busbar, undefined, "the end joins nothing, so it carries no bar");
    assert.ok(!m.states.some((s) => s.id === "all_found"), "no separate join state");

    // Walk it. Every leg is active at once; the bar stays shut until the last.
    const inst: MachineInstance = {
      machine: m.id,
      iteration: "t",
      current: "start",
      counters: {},
      history: [],
      active: ["start"],
    } as unknown as MachineInstance;
    completeState(m, inst, "start", "filled", "now");
    assert.deepEqual((inst.active ?? []).slice().sort(), [...legs].sort(), "seven tokens, one per leg");

    for (const leg of legs.slice(0, -1)) {
      completeState(m, inst, leg, "filled", "now");
      assert.ok(!(inst.active ?? []).includes("build_chart"), `the bar opened early, on ${leg}`);
    }
    completeState(m, inst, legs[legs.length - 1], "filled", "now");
    assert.deepEqual(inst.active, ["build_chart"], "the last submit releases the bar");
  });

  // A GREEN BRANCH SATISFIES ITS EDGE.
  //
  // Measured in iteration one that day. The motivation gate collects three
  // branches. All three were walked and the bar stayed shut, because one
  // token cannot hold three edges: reaching a sibling routes BACK through the
  // fork, and that re-walk clears the fuel the last leg just laid down.
  // Stepping out of the record and re-entering reset the count to zero.
  //
  // So a bar counts a source that already stands filled as satisfied. The
  // work is done, and there is nothing left for it to deliver.
  const threeWayBar = (): MachineDecl =>
    ({
      id: "t",
      reentry: "resume",
      initial: "fork",
      states: [
        {
          id: "fork",
          edges: [
            { to: "a", role: "normal" },
            { to: "b", role: "normal" },
            { to: "c", role: "normal" },
          ],
        },
        { id: "a", edges: [{ to: "bar", role: "normal" }] },
        { id: "b", edges: [{ to: "bar", role: "normal" }] },
        { id: "c", edges: [{ to: "bar", role: "normal" }] },
        { id: "idle_elsewhere", edges: [] },
        { id: "bar", busbar: true, edges: [] },
      ],
    }) as unknown as MachineDecl;

  const instAt = (current: string, history: { state: string; outcome: string }[]): MachineInstance =>
    ({
      machine: "t",
      iteration: "t",
      current,
      counters: {},
      history: history.map((h) => ({ ...h, at: "then" })),
      active: [current],
      escapes: [],
      status: "open",
    }) as unknown as MachineInstance;

  test("a bar opens when the branches it still waits on already stand filled", () => {
    const m = threeWayBar();
    // One token, on the last branch. The other two were walked on an earlier
    // visit and their fuel was consumed long ago.
    const inst = instAt("c", [
      { state: "a", outcome: "filled" },
      { state: "b", outcome: "filled" },
    ]);
    completeState(m, inst, "c", "filled", "now");
    assert.deepEqual(inst.active, ["bar"], "the bar stayed shut on two green branches");
  });

  // GREEN IS THE LATEST WORD, not any word. A branch filled and then reopened
  // is being re-walked and will fire on its own, so the bar waits for it.
  test("a reopened branch stops being green and the bar waits again", () => {
    const m = threeWayBar();
    const inst = instAt("c", [
      { state: "a", outcome: "filled" },
      { state: "b", outcome: "filled" },
      { state: "b", outcome: "reopened" },
    ]);
    completeState(m, inst, "c", "filled", "now");
    assert.ok(!(inst.active ?? []).includes("bar"), "b is being re-walked, so the bar must not open without it");
  });

  // THE GUARD THAT KEEPS THE RULE FROM RUNNING AWAY. Green branches alone are
  // not a trigger. A token has to arrive on some inbound edge, or every
  // completion anywhere would re-open every bar whose work is finished.
  test("a bar with no fuel never activates, however green its branches", () => {
    const m = threeWayBar();
    const inst = instAt("idle_elsewhere", [
      { state: "a", outcome: "filled" },
      { state: "b", outcome: "filled" },
      { state: "c", outcome: "filled" },
    ]);
    completeState(m, inst, "idle_elsewhere", "filled", "now");
    assert.ok(!(inst.active ?? []).includes("bar"), "the bar re-opened with nothing arriving at it");
  });

  // THE WIRING, which the three tests above cannot see.
  //
  // They feed `green` by HISTORY, and history is exactly what a reload or a
  // re-entry wipes. What made the live walk work is the OTHER source: the
  // wedge guard handing `recordDone` — the evidence-based green set — into
  // completeState as a lazy thunk.
  //
  // Nothing else pins it. Drop that argument in a refactor and every test
  // above still passes, while a real walk goes back to refusing SE-C-123 at
  // the first three-way join. That is the whole defect, silently restored.
  //
  // LAZY ON PURPOSE. recordDone reads evidence files. Called up front it put a
  // full green recomputation on every completion; the same mistake cost 2936ms
  // on se_aim once and is written up at engine/session.ts:1717.
  test("the wedge guard hands the evidence-based green set to completeState", () => {
    const source = readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");
    assert.match(
      source,
      /completeState\(m,\s*inst,\s*stateId,\s*outcome,\s*now,\s*only,\s*\(\)\s*=>\s*new Set\(this\.claims\.recordDone\(m\)\)\)/,
      "the guard must pass recordDone as a thunk — without it a bar only sees this instance's history",
    );
    const kernel = readFileSync(fileURLToPath(new URL("../engine/machine.ts", import.meta.url)), "utf8");
    assert.match(kernel, /standsGreen\(k\.split\("->"\)\[0\]\)/, "the busbar test must ask standsGreen, not the history set alone");
    assert.match(kernel, /byEvidence \?\?= green\?\.\(\)/, "the evidence set is fetched on demand, never up front");
  });

  // The header names every standing state, one button each.
  test("the header draws a position button per standing state", () => {
    const source = mirrorSource();
    assert.match(source, /const curBtn = info\.active\s*\n\s*\.map\(/, "curBtn maps over the whole list");
    assert.match(source, /closest\("\.cur-state"\)/, "several buttons cannot share one id");
  });
});

// THE POSITION A REOPEN LEAVES BEHIND.
//
// Re-pinning i3 from patch to minor moved the demands of eight standing steps,
// and the reopen put a token on all eight. The owner opened the mirror and saw
// the walk standing in M0's kickoff gate and M3's write-requirements at the
// same time — two steps on ONE sequential chain.
//
// Nothing illegal was signed: the input check refused every out-of-order
// arrival. What was wrong was the POSITION, and a position is what the mirror
// draws and what the pull offers. A drawing that says eight when one is true
// is a drawing nobody can adjudicate from.
describe("a reopen's token set", { concurrency: true }, () => {
  const chain = (): MachineDecl =>
    ({
      id: "t",
      states: [
        { id: "kickoff", edges: [{ to: "stories", role: "normal" }] },
        { id: "stories", edges: [{ to: "requirements", role: "normal" }] },
        { id: "requirements", edges: [{ to: "build", role: "normal" }] },
        { id: "build", edges: [] },
        { id: "sidecar", edges: [] },
      ],
    }) as unknown as MachineDecl;

  const blank = (): MachineInstance =>
    ({
      machine: "t",
      iteration: "t",
      current: "build",
      counters: {},
      history: [],
      fired: [],
      active: ["build"],
      escapes: [],
      status: "open",
    }) as unknown as MachineInstance;

  // THE EXACT SHAPE THAT BIT. Both steps were standing, both had a moved
  // demand, and both got a token.
  test("reopening two steps on one chain leaves ONE token, at the upstream end", () => {
    const inst = blank();
    reopenStates(chain(), inst, ["kickoff", "requirements"], "the rigor matrix moved", "now");
    assert.deepEqual(inst.active, ["kickoff"], "requirements is downstream of kickoff — the walk re-reaches it, it is not stood in");
    assert.equal(inst.current, "kickoff", "and current agrees with the token");
  });

  // ORDER OF THE ARGUMENT MUST NOT DECIDE IT. The moved list arrives in
  // whatever order the ledger yields.
  test("the frontier is the same whichever way round the reopen is asked", () => {
    const inst = blank();
    reopenStates(chain(), inst, ["requirements", "kickoff"], "the rigor matrix moved", "now");
    assert.deepEqual(inst.active, ["kickoff"], "downstream-ness decides, never argument order");
  });

  // AND THE FORK STILL FORKS. Cutting tokens down to the frontier must not cut
  // a genuine parallel down to one — two steps with no path between them are
  // both frontier, and both keep their token.
  test("two reopened steps with no path between them keep both tokens", () => {
    const inst = blank();
    reopenStates(chain(), inst, ["requirements", "sidecar"], "the rigor matrix moved", "now");
    assert.deepEqual([...(inst.active ?? [])].sort(), ["requirements", "sidecar"], "neither reaches the other, so neither is dropped");
  });

  // ONE STEP IS THE ORDINARY CASE and must survive the filter untouched.
  test("reopening a single step stands the walk in it", () => {
    const inst = blank();
    reopenStates(chain(), inst, ["stories"], "the rigor matrix moved", "now");
    assert.deepEqual(inst.active, ["stories"]);
  });
});
