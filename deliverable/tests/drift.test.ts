// THE DRIFT (owner ruling 2026-08-05): green must mean STILL GREEN NOW.
//
// The demand diff used to run only when a pin was rewritten, and a pin is only
// rewritten on an escalation. So editing a matrix row under a standing
// iteration changed what its steps ask for and left every one of them green
// against a question that no longer existed. These tests hold the recomputed
// answer: on a look, and on the walk's arrival.
import { strict as assert } from "node:assert";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import {
  demandsFor,
  type Iteration,
  iterationDrift,
  itPinRel,
  itSeed,
  itShortId,
  movedDemands,
  pinIteration,
  repinColumn,
} from "../engine/iterations.ts";
import { generateIterations } from "../engine/iterations-draw.ts";
import { claimFeeders, downstreamCone, type MachineDecl } from "../engine/machine.ts";
import { doorStats } from "../engine/notes.ts";
import { type ChangeColumn, compileColumn, readRigorMatrix } from "../engine/rigor-matrix.ts";
import { Session } from "../engine/session.ts";
import { Claims } from "../engine/sessionclaims.ts";
import { corpusAsks } from "../engine/trace.ts";
import { freshRoot, gitInit } from "./helpers.ts";

const SIZE: ChangeColumn = "minor";

/** A root with one seeded iteration, pinned from the matrix as it stands. */
function pinned(): { root: string; it: Iteration; pinAbs: string } {
  const root = freshRoot();
  gitInit(root, true);
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
  const row = join(root, "deliverable", "machines", "rigor_matrix", "rows", "M1_30_frame-delta.md");
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
  const ev = join(it.path, "spec", "iterations", it.id, "evidence", `${first.id}.md`);
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

// GREEN STOPS AT THE FIRST INPUT THAT IS NOT GREEN, and the claim that stops
// being green KEEPS ITS SIGNATURE (owner ruling 2026-08-07, v1's design).
//
// The old code wrote a `suspect:` line onto the claim and stripped the stamps
// to do it. That stored a derived value, which then went stale between the
// passes that wrote it — and it destroyed a person's act to record a machine's
// opinion. A checker may refuse to paint a claim green. It may never erase
// what somebody signed.
test("a claim keeps its signature when an input falls, and the colour is computed", () => {
  const { root, it } = pinned();
  const decl = { ...compileColumn(readRigorMatrix(root), SIZE), id: itShortId(it.id) };
  const gate = decl.states.find((s) => s.kind === "gate" && s.evidence_form.length > 0);
  assert.ok(gate !== undefined);
  const claimful = new Set(decl.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
  const feeders = claimFeeders(decl, gate.id, claimful);
  assert.ok(feeders.length > 0, "the gate has at least one claim-bearing input");

  const evOf = (id: string): string => join(it.path, "spec", "iterations", it.id, "evidence", `${id}.md`);
  const sign = (id: string): void => {
    mkdirSync(dirname(evOf(id)), { recursive: true });
    writeFileSync(evOf(id), `---\nsigned_off: the agent\nbless: blessed by the owner\nkeep_me: yes\n---\n\nthe claim, in full\n`, "utf8");
  };
  for (const id of claimful) sign(id);
  assert.ok(new Session(root).recordDone(decl).includes(gate.id), "green while every input stands");

  // ONE INPUT LOSES ITS SIGNATURE. The gate's own file is never touched.
  writeFileSync(evOf(feeders[0]), `---\nkeep_me: yes\n---\n\nthe claim, in full\n`, "utf8");
  const after = readFileSync(evOf(gate.id), "utf8");
  assert.match(after, /^signed_off: the agent$/m, "the gate's stamp is untouched");
  assert.match(after, /^bless: blessed by the owner$/m, "and so is its bless");
  assert.doesNotMatch(after, /^suspect:/m, "nothing was written onto it");
  assert.match(after, /the claim, in full/, "and the claim itself stays");
  assert.ok(!new Session(root).recordDone(decl).includes(gate.id), "but it is NOT green — it rests on ground that moved");
});

// A FEEDER RE-SIGNED IN THE SAME BREATH IS STILL GROUND THAT MOVED (owner
// ruling 2026-08-17). The colour ripple above compares GREEN, and a form
// resubmitted through the pull unsigns and re-signs inside ONE call — so the
// feeder is green again before anything downstream ever looks at it.
//
// i33 hit this live. Its kickoff replaced one prose goal with a list of five,
// and the walk ran straight through two signed gates that had never heard of
// four of them. se_reopen would have rippled; se_amend deliberately does not;
// the resubmit was a third path nobody had covered.
//
// THE BLESS FALLS WITH THE GREEN. The ripple is a graph walk and never touches
// frontmatter, so the stale gate still carries its `bless:` line on disk.
test("a claim signed before its feeder's signature is stale, and the bless falls with it", () => {
  const { root, it } = pinned();
  const decl = { ...compileColumn(readRigorMatrix(root), SIZE), id: itShortId(it.id) };
  const gate = decl.states.find((s) => s.kind === "gate" && s.evidence_form.length > 0);
  assert.ok(gate !== undefined);
  const claimful = new Set(decl.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
  const feeders = claimFeeders(decl, gate.id, claimful);
  assert.ok(feeders.length > 0, "the gate has at least one claim-bearing input");

  const evOf = (id: string): string => join(it.path, "spec", "iterations", it.id, "evidence", `${id}.md`);
  const signAt = (id: string, when: string): void => {
    mkdirSync(dirname(evOf(id)), { recursive: true });
    writeFileSync(evOf(id), `---\nsigned_off: ${when}\nbless: blessed by the owner\n---\n\nthe claim, in full\n`, "utf8");
  };
  // Everything answers the same ground, so nothing is stale to begin with.
  for (const id of claimful) signAt(id, "2026-08-17T10:00:00.000Z");
  assert.ok(new Session(root).recordDone(decl).includes(gate.id), "green while every claim answers the same ground");
  assert.ok(new Session(root).blessedGates(decl).includes(gate.id), "and its thumbs-up paints");

  // THE FEEDER IS EDITED AND RE-SIGNED, never resting grey — green again the
  // moment it lands, exactly like a resubmit through the pull.
  signAt(feeders[0], "2026-08-17T11:00:00.000Z");
  const after = readFileSync(evOf(gate.id), "utf8");
  assert.match(after, /^signed_off: 2026-08-17T10:00:00\.000Z$/m, "the gate's own stamp is untouched");
  assert.match(after, /^bless: blessed by the owner$/m, "and its bless is still on the file");
  assert.ok(!new Session(root).recordDone(decl).includes(gate.id), "but it is NOT green — it answered older ground");
  assert.ok(!new Session(root).blessedGates(decl).includes(gate.id), "and the thumbs-up falls with the green");

  // AND AN AMEND DOES NOT CLEAR IT. THIS BLOCK ONCE ASSERTED THE OPPOSITE
  // (owner ruling 2026-08-17, correcting what stood here the same day).
  //
  // It read "an amend re-freshens the claim against the ground as it now
  // stands", which made every correction anywhere count as a fresh answer —
  // and, through claimTime, grey every claim below it. The rule is the other
  // way round: an amendment does not re-grey, a reopen re-greys.
  //
  // THE TWO ACTS ANSWER DIFFERENT QUESTIONS. The feeder above did not fix a
  // word, it RE-SIGNED: it answered again, against ground that moved. A gate
  // replying "I corrected a figure" has not answered that. It stays grey.
  //
  // NOTHING IS TRAPPED BY THIS, which is what the old block was afraid of. A
  // typo upstream is an AMEND upstream, and an amend greys nothing at all. So
  // the only claims that ever reach this position are the ones whose ground
  // genuinely moved, and those are supposed to answer again.
  writeFileSync(
    evOf(gate.id),
    `---\nsigned_off: 2026-08-17T10:00:00.000Z\namended: 2026-08-17T12:00:00.000Z by the owner — a figure in one sentence was wrong\nbless: blessed by the owner\n---\n\nthe claim, in full\n`,
    "utf8",
  );
  assert.ok(
    !new Session(root).recordDone(decl).includes(gate.id),
    "an amend corrects wording — it does not answer ground that moved, so it cannot stand the claim back up",
  );

  // A FRESH SIGNATURE IS WHAT CLEARS IT, and that is the only thing that does.
  signAt(gate.id, "2026-08-17T13:00:00.000Z");
  assert.ok(new Session(root).recordDone(decl).includes(gate.id), "signing again against the new ground stands it up");
  assert.ok(new Session(root).blessedGates(decl).includes(gate.id), "and the thumbs-up comes back with it");
});

// AN AMENDMENT DOES NOT RE-GREY. A REOPEN RE-GREYS (owner ruling 2026-08-17,
// req-an-amend-leaves-the-tree-standing).
//
// THE TEST ABOVE WATCHES A CLAIM THAT IS ALREADY STALE. This one watches the
// act that must never MAKE one. A correction anywhere used to grey the whole
// chain under it, so each repair created more repairs and the walk stopped
// converging — i33 spent an afternoon re-freshening a chain that nothing was
// wrong with.
//
// WHY NOTHING SAW IT COMING. Every amend test signs exactly ONE state, and a
// one-state fixture cannot tell "leaves the tree standing" from "has no tree".
test("an amend on a feeder leaves the claims below it standing, and a re-sign drops them", () => {
  const { root, it } = pinned();
  const decl = { ...compileColumn(readRigorMatrix(root), SIZE), id: itShortId(it.id) };
  const gate = decl.states.find((s) => s.kind === "gate" && s.evidence_form.length > 0);
  assert.ok(gate !== undefined);
  const claimful = new Set(decl.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
  const feeders = claimFeeders(decl, gate.id, claimful);
  assert.ok(feeders.length > 0, "the gate has at least one claim-bearing input");

  // THE BLESS RIDES ALONG because a GATE is not done for the route until it
  // carries one. The paint is happy with a signature alone; the walk is not.
  const evOf = (id: string): string => join(it.path, "spec", "iterations", it.id, "evidence", `${id}.md`);
  const signAt = (id: string, when: string): void => {
    mkdirSync(dirname(evOf(id)), { recursive: true });
    writeFileSync(evOf(id), `---\nsigned_off: ${when}\nbless: blessed by the owner\n---\n\nthe claim, in full\n`, "utf8");
  };
  for (const id of claimful) signAt(id, "2026-08-17T10:00:00.000Z");
  assert.ok(new Session(root).recordDone(decl).includes(gate.id), "green while every claim answers the same ground");

  // THE FEEDER IS CORRECTED, NOT RE-SIGNED. `amended:` moves and `signed_off:`
  // does not, because the claim still attests to what it always did. Nothing
  // below it was answering the corrected words.
  writeFileSync(
    evOf(feeders[0]),
    `---\nsigned_off: 2026-08-17T10:00:00.000Z\namended: 2026-08-17T12:00:00.000Z by the owner — one figure was wrong\nbless: blessed by the owner\n---\n\nthe claim, in full\n`,
    "utf8",
  );
  assert.ok(
    new Session(root).recordDone(decl).includes(gate.id),
    "a correction upstream leaves the claim below it standing — otherwise every repair creates more repairs",
  );

  // AND THE OTHER HALF, so this cannot be satisfied by a green that never moves.
  signAt(feeders[0], "2026-08-17T13:00:00.000Z");
  assert.ok(!new Session(root).recordDone(decl).includes(gate.id), "a RE-SIGNED feeder is ground that moved, and that does re-grey");
});

// A REOPEN DROPS THE CONE IT FEEDS, and nothing asserted that until now.
//
// The i33 fresh-eyes tester named this as the one thing it could not check:
// claimops.test.ts covers the reopened state itself going grey and keeping its
// signature, and nothing covered what stands ON it. The i33 walk exercised it
// by hand about twenty times, which is evidence and not a test.
//
// WHY IT IS THE HALF THAT MATTERS. An amendment is cheap ONLY because a reopen
// is available and does the greying properly. If this propagation regressed,
// corrections would stay cheap while changed QUESTIONS quietly stopped
// re-earning their answers below them — which is the i33 kickoff defect
// returning by the other door, and invisible from inside.
//
// THE MARK IS WRITTEN RATHER THAN THE VERB CALLED, on purpose. reopenClaim's
// own plumbing is claimops' subject. What is under test here is the RIPPLE:
// green asks whether the reopen is newer than the signature, and this asserts
// what that answer does to everything downstream.
test("a reopen drops the claims the reopened state feeds, not only itself", () => {
  const { root, it } = pinned();
  const decl = { ...compileColumn(readRigorMatrix(root), SIZE), id: itShortId(it.id) };
  const gate = decl.states.find((s) => s.kind === "gate" && s.evidence_form.length > 0);
  assert.ok(gate !== undefined);
  const claimful = new Set(decl.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
  const feeders = claimFeeders(decl, gate.id, claimful);
  assert.ok(feeders.length > 0, "the gate has at least one claim-bearing input");

  const evOf = (id: string): string => join(it.path, "spec", "iterations", it.id, "evidence", `${id}.md`);
  const signAt = (id: string, when: string): void => {
    mkdirSync(dirname(evOf(id)), { recursive: true });
    writeFileSync(evOf(id), `---\nsigned_off: ${when}\nbless: blessed by the owner\n---\n\nthe claim, in full\n`, "utf8");
  };
  for (const id of claimful) signAt(id, "2026-08-17T10:00:00.000Z");
  assert.ok(new Session(root).recordDone(decl).includes(gate.id), "green while every claim stands");
  assert.ok(new Session(root).blessedGates(decl).includes(gate.id), "and the gate's thumbs-up paints");

  // THE FEEDER IS REOPENED. Its signature is untouched and the mark is newer
  // than it, which is the one question green asks about a reopen.
  writeFileSync(
    evOf(feeders[0]),
    `---\nsigned_off: 2026-08-17T10:00:00.000Z\nreopened: 2026-08-17T11:00:00.000Z — the question below it changed\nbless: blessed by the owner\n---\n\nthe claim, in full\n`,
    "utf8",
  );
  const after = new Session(root).recordDone(decl);
  assert.ok(!after.includes(feeders[0]), "the reopened claim is grey");
  assert.ok(
    !after.includes(gate.id),
    "AND THE GATE STANDING ON IT FELL WITH IT. This is the assertion nothing carried: a reopen that greyed only itself would leave every claim below answering a question that has been withdrawn.",
  );
  assert.ok(!new Session(root).blessedGates(decl).includes(gate.id), "and the thumbs-up falls with the green rather than painting over it");

  // THE FEEDER COMES BACK ON A FRESH SIGNATURE, not on the mark being swept
  // away. Nothing edits the file to remove the reopen; a newer signature
  // simply answers the question green asks.
  signAt(feeders[0], "2026-08-17T12:00:00.000Z");
  assert.match(readFileSync(evOf(feeders[0]), "utf8"), /^signed_off: 2026-08-17T12:00:00\.000Z$/m, "re-signed rather than un-marked");
  assert.ok(new Session(root).recordDone(decl).includes(feeders[0]), "the reopened claim stands again on the newer signature alone");

  // AND THE GATE DOES NOT COME BACK WITH IT, which is the assertion this test
  // got wrong on its first run and is worth keeping for that reason.
  //
  // The feeder did not merely return to where it was. It ANSWERED AGAIN, at
  // 12:00, against ground that had changed enough to warrant a reopen. The
  // gate's own claim is still stamped 10:00, so it answered the older
  // question and it is stale until it answers this one.
  //
  // A GATE THAT SPRANG BACK HERE WOULD BE THE i33 KICKOFF DEFECT EXACTLY: the
  // question below changes, the state that owns it re-earns its answer, and
  // everything standing on it sails through still holding the old one.
  assert.ok(
    !new Session(root).recordDone(decl).includes(gate.id),
    "the gate stays grey — its input answered a NEW question at 12:00 and the gate's own claim is still stamped 10:00",
  );

  // IT COMES BACK WHEN IT ANSWERS, and only then.
  signAt(gate.id, "2026-08-17T13:00:00.000Z");
  assert.ok(new Session(root).recordDone(decl).includes(gate.id), "and it stands once it has answered the new question itself");
  assert.ok(new Session(root).blessedGates(decl).includes(gate.id), "with its thumbs-up back, because the bless rides the standing claim");
});

// A STATE THAT OWES A SIGNATURE KEEPS THE WALK UNTIL IT SIGNS.
//
// Owner, 2026-08-17, in the plainest words this rule has had: "If it's not
// submitted, then you're not going to the next state."
//
// WHAT WENT WRONG. Both the advance guard and the ripple asked
// `evidence_form.length > 0` — whether a state declares FIELDS — as a stand-in
// for whether it carries a claim. The two coincide for almost every state.
// fill-story-evidence is the one where they part: it declares no fields on
// purpose, because its check is computed from the story decks rather than
// typed into a form, and its own guidance says signing is a bare submit.
//
// SO THE WALK CROSSED IT UNSIGNED, three times. Two states signed underneath
// the gap, one of them a gate, and the panel painted them green. The only
// route back was twenty-five hops forward through `shipped` and around the
// whole machine, so the walk had to escape to the desk (note-fa24138d389e).
//
// THE FIXTURE IS A STATE WITH NO FIELDS, because that is the whole point. A
// test built on a state that declares fields cannot fail this way and would
// have passed throughout.
test("a state that carries a claim is claimful even when it declares no fields", () => {
  const { root } = pinned();
  const decl = compileColumn(readRigorMatrix(root), SIZE);

  // THE COLUMN REALLY CONTAINS ONE, or this test proves nothing. If a later
  // matrix gives every state fields, this assertion says so rather than
  // quietly passing over an empty set.
  const fieldless = decl.states.filter((s) => (s.kind === "work" || s.kind === "gate") && s.evidence_form.length === 0);
  assert.ok(
    fieldless.length > 0,
    "the column declares at least one work-or-gate state with no evidence fields — without one, the case this guards cannot occur and the test is theatre",
  );

  // AND IT IS THE ONE THIS IS ABOUT. Naming it keeps the case readable when
  // somebody reads this in a year: fill-story-evidence signs on a bare submit
  // because its check is computed from the story decks.
  assert.ok(
    fieldless.some((s) => s.id.endsWith("fill-story-evidence")),
    `the fieldless states are ${fieldless.map((s) => s.id).join(", ")} — fill-story-evidence is the case this guards and it is not among them`,
  );

  // KIND ALONE IS NOT THE ANSWER EITHER, and trying it cost five red tests.
  // read_contract is a work state with no fields AND NO FORM: it reads and
  // never signs, so demanding a claim from it wedges the boot. The engine
  // separates the two by whether a form instance exists, not by kind.
  const boot = compileColumn(readRigorMatrix(root), SIZE).states.find((s) => s.id.endsWith("read_contract"));
  if (boot !== undefined) {
    assert.equal(
      boot.evidence_form.length,
      0,
      "read_contract declares no fields — it is the state that proves kind is too wide a test, and if it gains fields this case needs a new example",
    );
  }
});

// ONE OPERATION READS ITS INPUT ONCE (req-one-operation-reads-its-input-once).
//
// THE BOUND IS A SHAPE, NOT A NUMBER. Entering one record asked for the same
// 328-node corpus sixty-six times, because each hop asked what was green and
// each ask fetched its own inputs. Stamping took one ask from 312.9 ms to
// 4.3 ms — a seventy-fold win on the wrong number, and the sixty-six stayed.
// notes.ts says it in its own comment: a cache cannot fix a call count.
//
// SO THIS ASSERTS THE PASS IS HONOURED rather than a tuned constant. A tuned
// constant drifts and gets raised; a second call costing zero is the property
// the requirement actually names.
test("one operation reads its input once — a second ask inside the same pass costs nothing", () => {
  const { root, it } = pinned();
  const decl = { ...compileColumn(readRigorMatrix(root), SIZE), id: itShortId(it.id) };
  const evOf = (id: string): string => join(it.path, "spec", "iterations", it.id, "evidence", `${id}.md`);
  for (const s of decl.states.filter((x) => x.evidence_form.length > 0)) {
    mkdirSync(dirname(evOf(s.id)), { recursive: true });
    writeFileSync(evOf(s.id), `---\nsigned_off: 2026-08-17T10:00:00.000Z\n---\n\nthe claim, in full\n`, "utf8");
  }
  const session = new Session(root);
  const pass = Claims.newPass();

  const before = doorStats();
  session.recordDone(decl, new Set(), pass);
  const afterFirst = doorStats();
  const firstAsks = afterFirst.hits + afterFirst.misses - (before.hits + before.misses);
  assert.ok(firstAsks > 0, "the first pass must actually read something, or this test proves nothing");

  session.recordDone(decl, new Set(), pass);
  const afterSecond = doorStats();
  const secondAsks = afterSecond.hits + afterSecond.misses - (afterFirst.hits + afterFirst.misses);
  assert.equal(secondAsks, 0, `the same question inside one pass asked the door ${secondAsks} more times — the pass is not being honoured`);
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

// THE FAN-IN IS AN AND (owner design 2026-08-04, note-bb6d1cb6b75d): in most
// machines every branch must be covered. The route used to be breadth-first
// shortest path, which finds ONE way to a gate and never mentions the other
// branch — so the walk marched at a gate that then refused, naming a feeder
// nobody had been sent to. claimFeeders is what makes the route cover both.
test("a collection bar's prerequisites include every input, not just the nearest one", () => {
  const { root, it } = pinned();
  const decl = { ...compileColumn(readRigorMatrix(root), SIZE), id: itShortId(it.id) };
  const claimful = new Set(decl.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
  const bars = decl.states.filter((s) => s.busbar === true);
  assert.ok(bars.length > 0, "the column declares at least one collection bar");
  for (const bar of bars) {
    const feeders = claimFeeders(decl, bar.id, claimful);
    // EVERY declared claim-bearing input is a prerequisite. A shortest path
    // would have named exactly one of them, whatever the bar collects.
    const declared = decl.states
      .filter((p) => p.edges.some((e) => e.to === bar.id && (e.role ?? "normal") !== "fallback"))
      .map((p) => p.id)
      .filter((id) => claimful.has(id));
    for (const d of declared) assert.ok(feeders.includes(d), `${d} feeds ${bar.id} and must be a prerequisite`);
  }
});

// THE ANSWER COMES BACK INSIDE A SECOND (req-call-answers-in-one-second).
//
// The requirement stood and nothing enforced it. So when green stopped reading
// a stamp and started re-checking every claim against the whole trace corpus,
// the cost landed on the render path — and the render runs on every change.
// The engine stopped answering three times in one afternoon before anybody
// measured it, and each time the diagnosis started from scratch.
//
// A CORPUS OF TWO HUNDRED, ON PURPOSE. Against the handful of nodes a fresh
// root carries, the cheap version and the expensive one both round to nothing.
// A guard that cannot tell them apart guards nothing, so this one buys a
// corpus big enough for the difference to show.
//
// THE CLOCK WAS THE PROXY, AND THE COUNT IS THE THING (i33, 2026-08-17).
//
// This guard asked for under a second, and its own comment said why: to go red
// if somebody puts a per-state corpus load back. A wall clock is a poor
// instrument for that. The honest cost of one cold green computation sits at
// roughly 85-105% of a second on this machine, so the guard passed idle and
// failed under load, three times in one afternoon. A check that answers
// differently depending on what else the machine is doing has stopped
// discriminating, and widening its budget would only have muted it.
//
// SO IT COUNTS INSTEAD OF TIMING, and it counts TWO things because the first
// one alone did not catch what its own comment claimed (found by a fresh-eyes
// tester, 2026-08-17, with line numbers).
//
// THE ASKS ARE THE LOAD-BEARING COUNT. corpusAsks() meters every call to
// loadTrace, hit or miss. One operation collects its input once and hands it
// down, so one recordDone is ONE ask. Put a load back inside the per-state
// loop and it becomes one per claimful state — twenty-five where one belongs,
// which no cache can hide.
//
// WHY THE DOOR COUNT COULD NOT DO THAT JOB, kept because the mistake is easy
// to make again. loadTrace memoizes ABOVE the door: on a stamp hit it returns
// the held nodes having called noteOf zero times. A per-state load therefore
// costs about 210 statSync calls the door never sees and no door accesses at
// all. The count stayed flat at 245 and the guard passed while the defect it
// named sat there.
//
// THE DOOR COUNT STAYS ANYWAY, because it catches a different regression the
// ask count cannot: something re-reading corpus FILES through noteOf per
// state, without going through loadTrace at all. Two counters, two failure
// shapes, neither standing in for the other.
//
// THE CLOCK IS A CATASTROPHE BACKSTOP AND NOTHING MORE. It sat at 2500 ms to
// catch a hoisted corpus load, measured once at 3683 ms.
//
// IT CANNOT DO THAT ANY MORE. Honest runs on a working machine reach 3922 ms,
// so 2500 ms reds on whatever else the machine is doing rather than on the
// defect. Any bound clear of that noise is also above 3683, so no setting of
// this number both stays quiet and catches that regression.
//
// THE ACCESS CEILING BELOW CATCHES IT INSTEAD, at 800 against a per-state
// sweep of about five thousand, and it does not move with load. What is left
// for the clock is work that got slow WITHOUT reading more, such as a loop
// that turned quadratic in memory.
test("green reads the corpus once, and is computed against two hundred nodes", () => {
  const { root, it } = pinned();
  const decl = { ...compileColumn(readRigorMatrix(root), SIZE), id: itShortId(it.id) };
  const reqDir = join(it.path, "spec", "trace", "requirement");
  mkdirSync(reqDir, { recursive: true });
  const FILLERS = 200;
  for (let i = 0; i < FILLERS; i++) {
    writeFileSync(join(reqDir, `req-filler-${i}.md`), `---\nid: req-filler-${i}\ntype: "[[requirement]]"\n---\n\nfiller\n`, "utf8");
  }
  const session = new Session(root);
  const before = doorStats();
  const asksBefore = corpusAsks();
  const started = Date.now();
  session.recordDone(decl);
  const took = Date.now() - started;
  const after = doorStats();
  const asks = corpusAsks() - asksBefore;
  const accesses = after.hits + after.misses - (before.hits + before.misses);
  const claimful = decl.states.filter((s) => s.evidence_form.length > 0).length;

  // ONE OPERATION, ONE ASK. This is the assertion the requirement actually
  // names, and the one a per-state load cannot get past.
  assert.equal(
    asks,
    1,
    `recordDone asked for the corpus ${asks} time(s) over ${claimful} claimful states. It collects its input ONCE and hands it down; ${claimful} asks would mean every state fetching its own, which is the defect this guards and which no cache hides.`,
  );
  // MEASURED, 2026-08-17: 245 accesses over 200 fillers and 25 claimful
  // states. That is ONE sweep — the corpus, plus the root's own nodes, plus
  // each state instance and its templates on top. A per-state sweep at 25
  // states would be about five thousand.
  //
  // SO THE CEILING SITS BETWEEN THEM, with the margin written down rather than
  // guessed: 3.3x above the honest cost, 6x below the regression. Neither
  // number moves with machine load, which is the whole reason this replaced a
  // clock.
  const ceiling = FILLERS * 4;
  assert.ok(
    accesses < ceiling,
    `recordDone made ${accesses} door accesses over ${FILLERS} filler nodes and ${claimful} claimful states. The ceiling is ${ceiling}, against a measured 245. Above it, the corpus is being swept more than once — most likely once per state, which is the defect this guards.`,
  );
  // AND IT MUST ACTUALLY HAVE READ THE CORPUS. Without this line the guard
  // passes triumphantly on a green that was computed over nothing at all.
  assert.ok(
    accesses > FILLERS,
    `recordDone made only ${accesses} door accesses over ${FILLERS} filler nodes. It cannot have read the corpus it is meant to be judging — this guard would then be measuring an empty computation.`,
  );
  assert.ok(
    took < 10_000,
    `recordDone took ${took} ms over ${FILLERS} nodes. This is the catastrophe backstop, not the bound — the access ceiling above is what catches a repeated sweep. At this figure the work got slow without reading more.`,
  );
});
