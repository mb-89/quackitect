// THE DRIFT (owner ruling 2026-08-05): green must mean STILL GREEN NOW.
//
// The demand diff used to run only when a pin was rewritten, and a pin is only
// rewritten on an escalation. So editing a matrix row under a standing
// iteration changed what its steps ask for and left every one of them green
// against a question that no longer existed. These tests hold the recomputed
// answer: on a look, and on the walk's arrival.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import {
  demandsFor,
  generateIterations,
  type Iteration,
  iterationDrift,
  itPinRel,
  itSeed,
  itShortId,
  movedDemands,
  pinIteration,
  repinColumn,
} from "../engine/iterations.ts";
import { downstreamCone, type MachineDecl } from "../engine/machine.ts";
import { stripFrontmatterKeys } from "../engine/notes.ts";
import { type ChangeColumn, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

const SIZE: ChangeColumn = "minor";

function gitInit(root: string): void {
  for (const a of [
    ["init"],
    ["config", "user.email", "se@test.local"],
    ["config", "user.name", "se test"],
    ["add", "-A"],
    ["commit", "-q", "-m", "seed"],
  ]) {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  }
}

/** A root with one seeded iteration, pinned from the matrix as it stands. */
function pinned(): { root: string; it: Iteration; pinAbs: string } {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "drift", "the matrix moves under a standing pin", ["e13"]);
  pinIteration(root, it, SIZE);
  return { root, it, pinAbs: join(it.path, itPinRel(it.id)) };
}

function rewritePin(pinAbs: string, edit: (pin: Record<string, unknown>) => void): void {
  const pin = JSON.parse(readFileSync(pinAbs, "utf8")) as Record<string, unknown>;
  edit(pin);
  writeFileSync(pinAbs, JSON.stringify(pin, null, 2), "utf8");
}

test("a pin taken from the live matrix reports no drift", () => {
  const { root, it } = pinned();
  assert.deepEqual(iterationDrift(root, it), [], "nothing moved, so nothing has lapsed");
});

test("a step whose evidence spec moved since the pin is drifted", () => {
  const { root, it, pinAbs } = pinned();
  const victim = Object.keys(demandsFor(readRigorMatrix(root), SIZE)).sort()[0];
  assert.ok(victim !== undefined, "the column must apply at least one step for this to mean anything");
  // Rewrite the pin as if it had been taken while that step asked something
  // else. The size is untouched — that is the whole point: an escalation
  // would have caught this, and a plain matrix edit never did.
  rewritePin(pinAbs, (pin) => {
    (pin.demands as Record<string, { evidence: string }>)[victim].evidence = JSON.stringify([{ name: "what_it_used_to_ask" }]);
    pin.rigor_matrix_hash = "0000stalehash";
  });
  assert.deepEqual(iterationDrift(root, it), [victim]);
  assert.equal(
    (JSON.parse(readFileSync(pinAbs, "utf8")) as { rigor_matrix_hash: string }).rigor_matrix_hash,
    "0000stalehash",
    "the drift check WRITES NOTHING — a view must never mutate the record",
  );
});

test("the walk consumes the drift — answering it once stops it firing forever", () => {
  const { root, it, pinAbs } = pinned();
  rewritePin(pinAbs, (pin) => {
    for (const d of Object.values(pin.demands as Record<string, { evidence: string }>)) d.evidence = "what it used to ask";
    pin.rigor_matrix_hash = "0000stalehash";
  });
  assert.ok(iterationDrift(root, it).length > 0, "the move is seen while the pin is stale");
  repinColumn(root, it);
  assert.deepEqual(iterationDrift(root, it), [], "and never again — a re-earned step must not reopen on the next pull");
});

// THE FORM MUST MOVE WITH THE DEMAND, and it must move WITHOUT ANYBODY
// WALKING. A step reopens because what it asks for changed; a frozen copy of
// the machine would hand back the very question we just retired, and a reader
// looking at the state would see a form the matrix stopped asking for.
test("the pin stores the COLUMN, never a frozen machine", () => {
  const { root, it, pinAbs } = pinned();
  assert.equal((JSON.parse(readFileSync(pinAbs, "utf8")) as { machine?: unknown }).machine, undefined);
  rewritePin(pinAbs, (pin) => {
    pin.machine = { id: "stale", states: [] };
    pin.rigor_matrix_hash = "0000stalehash";
  });
  repinColumn(root, it);
  const after = JSON.parse(readFileSync(pinAbs, "utf8")) as { change_size: string; machine?: unknown };
  assert.equal(after.change_size, SIZE, "a matrix edit is not an escalation");
  assert.equal(after.machine, undefined, "a stored machine is dropped — the column is the record");
});

test("a row edited now reaches the walk's machine with no pull at all", () => {
  const { root } = pinned();
  // The public path a render uses: the container's sub-generator, called fresh
  // every time. No session, no pull, nobody standing anywhere.
  const field = (): { of?: string } | undefined => {
    const sub = Object.values(generateIterations(root).subGen ?? {})[0] as () => { decl: MachineDecl };
    return sub()
      .decl.states.find((s) => s.id === "frame-delta")
      ?.evidence_form.find((f) => f.name === "value_props");
  };
  assert.equal(field()?.of, "value-prop", "the column carries the field as the row declares it");
  const row = join(root, "project", "deliverable", "machines", "rigor_matrix", "rows", "M1_30_frame-delta.md");
  writeFileSync(row, readFileSync(row, "utf8").replace("of: value-prop", "of: stakeholder"), "utf8");
  assert.equal(field()?.of, "stakeholder", "and the edit shows without anybody walking anywhere");
});

test("an unmoved matrix costs one hash and never reaches the diff", () => {
  const { root, it, pinAbs } = pinned();
  // Demands that disagree with the matrix, under the matrix's OWN hash. That
  // pair cannot occur — the demands are derived from the matrix — so it holds
  // the short-circuit itself: a matching hash answers before any row is read.
  rewritePin(pinAbs, (pin) => {
    for (const d of Object.values(pin.demands as Record<string, { evidence: string }>)) d.evidence = "disagrees";
  });
  assert.deepEqual(iterationDrift(root, it), []);
});

// ONLY A PASS CAN LAPSE. The reopen cone runs to the end of the machine, and
// most of it was never walked. Painting all of it marks steps that had nothing
// to lose, and the whole tail of the drawing goes blank at once — seen live.
test("a step that was never green is not painted suspect", () => {
  const { root, it, pinAbs } = pinned();
  // The walk compiles the pinned COLUMN and stamps the iteration's SHORT id on
  // it — that is the id the session matches a record by. See
  // generateIterationWalk.
  const decl = { ...compileColumn(readRigorMatrix(root), SIZE), id: itShortId(it.id) };
  const first = decl.states.find((s) => s.evidence_form.length > 0);
  assert.ok(first !== undefined, "the pinned machine must ask for evidence somewhere");
  // One standing claim, and nothing else walked.
  const ev = join(it.path, "project", "spec", "iterations", it.id, "evidence", `${first.id}.md`);
  mkdirSync(dirname(ev), { recursive: true });
  writeFileSync(ev, `---\nsigned_off: the agent\nbless: blessed\n---\n\nthe claim\n`, "utf8");
  // Now move every demand, so the cone is the whole machine.
  rewritePin(pinAbs, (pin) => {
    for (const d of Object.values(pin.demands as Record<string, { evidence: string }>)) d.evidence = "what it used to ask";
    pin.rigor_matrix_hash = "0000stalehash";
  });
  const painted = new Session(root).suspectStates(decl);
  assert.ok(painted.length > 0, "the standing claim did lapse");
  assert.ok(
    painted.every((id) => id === first.id || id === "start"),
    `only what was green may be painted, got ${painted.join(", ")}`,
  );
});

// A REOPENED STEP LOSES ITS STAMPS. They assert the claim STANDS, and after a
// reopen it does not. The paint reads the file, so leaving them there kept a
// reopened gate green — seen live on gate-motivation.
test("a reopen strips signed_off and bless, and keeps the claim", () => {
  const { root, it } = pinned();
  const decl = { ...compileColumn(readRigorMatrix(root), SIZE), id: itShortId(it.id) };
  const gate = decl.states.find((s) => s.kind === "gate" && s.evidence_form.length > 0);
  assert.ok(gate !== undefined);
  const ev = join(it.path, "project", "spec", "iterations", it.id, "evidence", `${gate.id}.md`);
  mkdirSync(dirname(ev), { recursive: true });
  writeFileSync(ev, `---\nsigned_off: the agent\nbless: blessed by the owner\nkeep_me: yes\n---\n\nthe claim, in full\n`, "utf8");
  assert.ok(new Session(root).recordDone(decl).includes(gate.id), "green before the reopen");
  writeFileSync(ev, stripFrontmatterKeys(readFileSync(ev, "utf8"), ["signed_off", "bless"]), "utf8");
  const after = readFileSync(ev, "utf8");
  assert.doesNotMatch(after, /^signed_off:/m, "the stamp goes");
  assert.doesNotMatch(after, /^bless:/m, "and so does the bless");
  assert.match(after, /^keep_me: yes$/m, "an unrelated key is untouched");
  assert.match(after, /the claim, in full/, "and the claim itself stays — it is what the next walker judges");
  assert.ok(!new Session(root).recordDone(decl).includes(gate.id), "and it is not green any more");
});

test("a weakened demand does not reopen — what was filed already covers it", () => {
  assert.deepEqual(movedDemands({ s: { applies: "full", evidence: "E" } }, { s: { applies: "tailored", evidence: "E" } }), []);
});

test("a strengthened demand reopens", () => {
  assert.deepEqual(movedDemands({ s: { applies: "tailored", evidence: "E" } }, { s: { applies: "full", evidence: "E" } }), ["s"]);
});

test("a changed evidence spec reopens at the same applies", () => {
  assert.deepEqual(movedDemands({ s: { applies: "full", evidence: "OLD" } }, { s: { applies: "full", evidence: "NEW" } }), ["s"]);
});

test("a step this column no longer declares has nothing to reopen", () => {
  assert.deepEqual(movedDemands({ s: { applies: "full", evidence: "E" } }, {}), []);
});

test("the drift rips down — everything downstream of a moved step goes with it", () => {
  const decl = {
    id: "m",
    states: [
      { id: "a", edges: [{ to: "b", role: "normal" }] },
      { id: "b", edges: [{ to: "c", role: "normal" }] },
      { id: "c", edges: [] },
      { id: "unrelated", edges: [] },
    ],
  } as unknown as MachineDecl;
  const cone = downstreamCone(decl, ["a"]);
  assert.deepEqual([...cone].sort(), ["a", "b", "c"], "the moved step re-earns its own claim too");
  assert.ok(!cone.has("unrelated"), "a step off the path is untouched");
});
