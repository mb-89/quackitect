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
  const ev = join(root, ".worktrees", id, "project", "spec", "iterations", id, "evidence", `${state.id}.md`);
  mkdirSync(dirname(ev), { recursive: true });
  writeFileSync(
    ev,
    `---\nsigned_off: ${signedAt}\nby: agent\nauthors: human\n---\n\n## ${field}\n\nwhat was claimed the first time\n`,
    "utf8",
  );
  assert.ok(session.recordDone(decl).includes(state.id), "green from the record before anything touches it");
  return { session, decl, step: state.id, field, ev, signedAt };
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
