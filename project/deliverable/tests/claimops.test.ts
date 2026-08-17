// THE TWO OPERATIONS ON A STANDING CLAIM — reopen and amend.
//
// Before these there was neither. A submitted form could not be touched at
// all: the only reopens were the gate's vote and the pin's drift, and a typo
// in a signed claim was permanent. The gap was found the honest way, by
// leaving a dangling reference in signed evidence with no lane to fix it.
//
// What each one must NOT do is the point of every assertion here. A reopen
// must not erase the signature. An amend must not move the signature, and
// must not slip a broken claim past the checks.
//
// Sequential: it walks one session through boot and into an iteration.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { Session } from "../engine/session.ts";
import { checkDocs, freshRoot } from "./helpers.ts";

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

/** One session, positioned inside an iteration, with one claimful step
 *  standing signed on disk. The shared ground both operations act on. */
async function standingClaim(): Promise<{
  session: Session;
  decl: ReturnType<Session["currentMachine"]>;
  step: string;
  field: string;
  ev: string;
  signedAt: string;
  root: string;
  id: string;
}> {
  const root = freshRoot();
  gitInit(root);
  const session = new Session(root);
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  await session.advance();
  session.setAutonomy(1);
  const id = String(session.iterationSeed("prove the claim operations", "a signed claim can be fixed and re-earned").seeded);
  const sid = id.match(/^(i\d+)-/)?.[1] as string;
  await session.advance("iterations");
  await session.advance(sid);

  pinIteration(root, itFind(root, id), "patch");
  const decl = session.currentMachine();
  const state = decl.states.find((s) => s.evidence_form.length > 0 && s.kind !== "gate");
  assert.ok(state !== undefined, "the column must ask for evidence somewhere");
  const field = state.evidence_form[0].name;

  // AN ISO STAMP, because the reopen mark is compared against it as a string.
  // A claim stamped by a much older engine carries prose here, and prose does
  // not order against a date — that is a legacy shape, not the shape formDone
  // writes, and it is left alone rather than guessed at.
  const signedAt = "2026-08-07T10:00:00.000Z";
  // ONE TREE SINCE i34: a record's evidence stands under the root.
  const ev = join(root, "project", "spec", "iterations", id, "evidence", `${state.id}.md`);
  mkdirSync(dirname(ev), { recursive: true });
  writeFileSync(
    ev,
    `---\nsigned_off: ${signedAt}\nby: agent\nauthors: human\n---\n\n## ${field}\n\nwhat was claimed the first time\n`,
    "utf8",
  );
  assert.ok(session.recordDone(decl).includes(state.id), "green from the record before anything touches it");
  return { session, decl, step: state.id, field, ev, signedAt, root, id };
}

/** THE WHOLE COLUMN SIGNED, and that is the point of it.
 *
 *  standingClaim signs exactly ONE state. Every test above it therefore
 *  watches an amend act on a claim with nothing standing below — which is
 *  precisely the blind spot a defect walked through. */
function signEveryClaim(root: string, id: string, decl: ReturnType<Session["currentMachine"]>, at: string, skip?: string): void {
  for (const s of decl.states) {
    if (s.evidence_form.length === 0 || s.id === skip) continue;
    const ev = join(root, "project", "spec", "iterations", id, "evidence", `${s.id}.md`);
    mkdirSync(dirname(ev), { recursive: true });
    // NO FIELD SECTIONS. A section that carries text is CHECKED, and generic
    // prose fails a form that wants a table or a per-item round. An empty
    // section is the required-check's business, not the claim check's, so a
    // signed note with no sections is exactly a claim that stands.
    writeFileSync(ev, `---\nsigned_off: ${at}\nby: agent\nauthors: human\n---\n\nthe claim, in full\n`, "utf8");
  }
}

test("an amend rewrites a field and the signature does not move", async () => {
  const { session, decl, step, field, ev, signedAt } = await standingClaim();

  const out = session.amendClaim(step, { [field]: "the corrected text" }, "a reference was renamed under it", "agent") as {
    signature_kept?: boolean;
    fields?: string[];
  };
  assert.equal(out.signature_kept, true);
  assert.deepEqual(out.fields, [field]);

  const after = readFileSync(ev, "utf8");
  assert.match(after, new RegExp(`^signed_off: ${signedAt}$`, "m"), "the stamp is the SAME stamp — an amend attests to nothing new");
  assert.match(after, /^by: agent$/m, "and the hand that signed is untouched");
  assert.match(after, /the corrected text/, "the field moved");
  assert.doesNotMatch(after, /what was claimed the first time/, "and the old text is gone from the file, not appended beside it");

  // TRANSPARENT OR IT IS AN UNTRACKED EDIT. A reader opening the file has to
  // be able to see that it changed after it was signed, and why.
  assert.match(after, /^amended: .*a reference was renamed under it/m);
  assert.match(after, /^amended: .* by agent /m, "whose hand");

  // AND THE CLAIM STILL STANDS. That is the difference from a reopen: an
  // amend leaves the tree alone, so nothing downstream has to be re-earned.
  assert.ok(session.recordDone(decl).includes(step), "still green after the amend");
});

test("an amend on a form that was never submitted is refused", async () => {
  const { session, step, field, ev } = await standingClaim();
  writeFileSync(ev, `---\nby: agent\n---\n\n## ${field}\n\nnot submitted\n`, "utf8");

  assert.throws(
    () => session.amendClaim(step, { [field]: "x" }, "a reason", "agent"),
    /submitted/,
    "an unsubmitted form is already owed — the pull serves it, and amending it would be a second door to the same act",
  );
});

test("an amend with no reason is refused, because a silent edit is the thing being replaced", async () => {
  const { session, step, field } = await standingClaim();
  assert.throws(() => session.amendClaim(step, { [field]: "x" }, "   ", "agent"), /reason/);
  assert.throws(() => session.amendClaim(step, {}, "a reason", "agent"), /field/);
});

test("a reopen greys the claim and keeps its signature", async () => {
  const { session, decl, step, ev, signedAt } = await standingClaim();

  const out = session.reopenClaim(step, "the ground it rested on moved", "agent") as { still_green?: string[] };
  assert.ok(!(out.still_green ?? []).includes(step), "the reopened state is no longer green");

  const after = readFileSync(ev, "utf8");
  assert.match(
    after,
    new RegExp(`^signed_off: ${signedAt}$`, "m"),
    "THE SIGNATURE SURVIVES — a check may refuse to paint, never erase a person's act",
  );
  assert.match(after, /^authors: human$/m, "an unrelated key is untouched");
  assert.match(after, /what was claimed the first time/, "and the claim's text stays, so a reader sees what was said the first time");
  assert.match(after, /^reopened: .*the ground it rested on moved/m, "the reason is on the record");

  assert.ok(!session.recordDone(decl).includes(step), "and green agrees");
});

test("re-signing clears a reopen with nothing having to erase anything", async () => {
  const { session, decl, step, ev } = await standingClaim();
  session.reopenClaim(step, "re-earn it", "agent");
  assert.ok(!session.recordDone(decl).includes(step), "grey while the reopen is newer");

  // THE MARK IS NEVER REMOVED. Green asks one question — is the reopen newer
  // than the signature? — so a newer signature answers it. Nothing sweeps the
  // file, which is why nothing can be left behind by a sweep that did not run.
  const raw = readFileSync(ev, "utf8");
  writeFileSync(ev, raw.replace(/^signed_off: .*$/m, "signed_off: 2026-09-01T00:00:00.000Z"), "utf8");
  assert.match(readFileSync(ev, "utf8"), /^reopened: /m, "the mark is still there");
  assert.ok(session.recordDone(decl).includes(step), "and the claim stands again on the newer signature alone");
});

test("a reopen with no reason is refused, because it throws away accepted work", async () => {
  const { session, step } = await standingClaim();
  assert.throws(() => session.reopenClaim(step, "  ", "agent"), /reason/);
});

// AN AMENDMENT DOES NOT RE-GREY. A REOPEN RE-GREYS (owner ruling 2026-08-17,
// req-an-amend-leaves-the-tree-standing).
//
// THAT ONE IS IN drift.test.ts, NOT HERE, and the reason is worth writing
// down. It needs a CHAIN: one claim standing on another, so an act on the
// upper can be watched for what it does to the lower. standingClaim below
// signs exactly one state, and several states in a fresh root carry laws that
// sweep the whole corpus, so they can never go green there however they are
// signed. A fixture that stands one claim cannot tell "leaves the tree
// standing" from "has no tree" — which is exactly the blind spot the defect
// walked through. drift.test.ts pins a column where the chain really stands.

// THE EDGE BETWEEN THE TWO ACTS IS HELD BY THE MACHINE, not by judgement.
//
// An amend leaves everything below standing. That is right for a correction
// and wrong for a changed QUESTION, and the kickoff's goals list is a changed
// question: every gate below measures its work against it. Amending it would
// leave all of them green against wording that is gone.
test("a field other forms read cannot be amended, and the refusal names the reopen", async () => {
  const { session, decl, root, id, step } = await standingClaim();
  signEveryClaim(root, id, decl, "2026-08-07T10:00:00.000Z", step);
  const kickoff = decl.states.find((s) => s.id.endsWith("gate-kickoff"));
  assert.ok(kickoff !== undefined, "the column opens on a kickoff gate");

  assert.throws(
    () => session.amendClaim(kickoff.id, { goals: "- a goal nobody below has heard of" }, "a reason", "agent"),
    /reopen/,
    "the goals list feeds every gate below through $goals, so changing it is a reopen and the refusal has to say so",
  );

  // AND THE GUARD IS NARROW, WHICH NOTHING ASSERTED UNTIL NOW. A fresh-eyes
  // tester pointed out that deleting the field clause from the guard would
  // leave this suite green: every check here would still pass with the whole
  // kickoff frozen, or with `goals` frozen on every state in the machine.
  //
  // SO THE PAIRING IS WHAT GETS ASSERTED. The guard is keyed on a STATE and a
  // FIELD together. A field called `goals` on a state nobody reads it from is
  // an ordinary field, and amending it must work.
  const out = session.amendClaim(step, { goals: "- an ordinary field that happens to share a name" }, "a reason", "agent") as {
    signature_kept?: boolean;
  };
  assert.equal(
    out.signature_kept,
    true,
    "a field named goals on a state no form reads it from is an ordinary field — freezing it everywhere would make the guard a blanket rather than an edge",
  );
});
