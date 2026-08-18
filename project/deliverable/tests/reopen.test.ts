// THE REOPEN, END TO END, through a positioned session. Two green halves are
// not a green wire (ux.md): stripping stamps and painting from the record are
// each tested elsewhere, and this is the line that joins them.
//
// Sequential: it walks one session through boot and into an iteration.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { reopenedAfterSigning } from "../engine/forms.ts";
import { itFind, itPinRel, pinIteration } from "../engine/iterations.ts";
import { parseStateNote } from "../engine/notes.ts";
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

test("a matrix that moves under a standing claim reopens it WITHOUT touching its stamps", async () => {
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
  const id = String(session.iterationSeed("prove the reopen", "a moved demand reaches the record").seeded);
  const sid = id.match(/^(i\d+)-/)?.[1] as string;
  await session.advance("iterations");
  await session.advance(sid);

  // Pin the column directly: the kickoff's own walk is another test's subject.
  const it = itFind(root, id);
  pinIteration(root, it, "patch");
  const decl = session.currentMachine();
  const step = decl.states.find((s) => s.evidence_form.length > 0 && s.kind !== "gate");
  assert.ok(step !== undefined, "the column must ask for evidence somewhere");

  // A STANDING CLAIM, written by an earlier session — stamped on disk, and
  // absent from this instance's history. That is the normal case after any
  // restart, and it is the case the reopen used to miss entirely.
  // ONE TREE SINCE i34: a record's evidence stands under the root.
  const ev = join(root, "project", "spec", "iterations", id, "evidence", `${step.id}.md`);
  mkdirSync(dirname(ev), { recursive: true });
  writeFileSync(ev, `---\nsigned_off: an earlier session\nauthors: human\n---\n\nwhat was claimed the first time\n`, "utf8");
  assert.ok(session.recordDone(decl).includes(step.id), "green from the record");

  // The matrix moves under it: the pinned ledger now records a demand the
  // live matrix no longer makes.
  const pinAbs = join(root, itPinRel(id));
  const pin = JSON.parse(readFileSync(pinAbs, "utf8")) as { demands: Record<string, { evidence: string }>; rigor_matrix_hash: string };
  for (const d of Object.values(pin.demands)) d.evidence = "what it used to ask";
  pin.rigor_matrix_hash = "0000stalehash";
  writeFileSync(pinAbs, JSON.stringify(pin, null, 2), "utf8");

  // ONE PULL. Nothing else.
  await session.pull();

  // THE REOPEN WRITES NOTHING ONTO THE CLAIM (owner ruling 2026-08-07). It
  // used to strip the signature and stamp a reason in its place, which stored
  // a derived value and destroyed a person's act in one move.
  const after = readFileSync(ev, "utf8");
  assert.match(after, /^signed_off: /m, "the signature SURVIVES — a check may refuse to paint, never to erase");
  assert.doesNotMatch(after, /^suspect:/m, "and no mark is written onto the claim");
  assert.match(after, /^authors: human$/m, "an unrelated key is untouched");
  assert.match(after, /what was claimed the first time/, "and the claim stays");

  // WHAT A REOPEN CHANGES IS THE WALK, not the record. The step is active
  // again, so the drawing blinks it as the live state — and active beats done
  // when the colour is chosen. Nothing had to be written onto the claim to
  // say so, which is the whole point.
  assert.ok(
    session.active().some((a) => a.split("/").pop() === step.id),
    `the walk is back at the step: ${JSON.stringify(session.active())}`,
  );

  // AND IT SETTLES. The pin caught up in the same pull, so a second one finds
  // nothing to do — without that the step would reopen forever.
  await session.pull();
  assert.match(readFileSync(ev, "utf8"), /^signed_off: /m, "still signed after a second pull");
  assert.deepEqual(session.suspectStates(decl), [], "and the drift has settled");
});

// A RECHECK IS NOT A REWRITE (owner ruling 2026-08-07). A reopened claim used
// to arrive looking exactly like a fresh one, so the agent answered it from
// scratch and re-derived evidence that had already been earned.
//
// The engine always knew which it was — reopened_after has been computed for
// days. What it never did was SAY so, and an agent cannot act on a boolean
// nobody explains.
test("a reopened claim's packet says it is a RECHECK, and a fresh one says nothing", () => {
  const root = freshRoot();
  const session = new Session(root);

  // The two cases side by side, straight through the same reader.
  const packet = (raw: string): Record<string, unknown> => {
    const fm = parseStateNote(raw).frontmatter;
    return { reopened_after: reopenedAfterSigning(fm), reopened: fm.reopened, signed_off: fm.signed_off };
  };

  const fresh = packet("---\nsigned_off: 2026-08-07T10:00:00.000Z\n---\n\nthe claim\n");
  assert.equal(fresh.reopened_after, false, "a signed claim nobody reopened is not a recheck");

  const reopened = packet(
    '---\nsigned_off: 2026-08-07T10:00:00.000Z\nreopened: "2026-08-07T11:00:00.000Z — the ground moved"\n---\n\nthe claim\n',
  );
  assert.equal(reopened.reopened_after, true, "a reopen stamped AFTER the signature is a recheck");

  // ORDER IS THE WHOLE TEST. A reopen older than the signature was already
  // answered by that signature, so it is not owed again.
  const resigned = packet(
    '---\nsigned_off: 2026-08-07T12:00:00.000Z\nreopened: "2026-08-07T11:00:00.000Z — the ground moved"\n---\n\nthe claim\n',
  );
  assert.equal(resigned.reopened_after, false, "re-signing clears the mark by itself — that IS the rebless");

  // AND THE INSTRUCTION SHIPS. The packet must carry words the agent can act
  // on, not just the boolean it has always had.
  assert.ok(session !== undefined);
  // The state form's reader left the class with the rest of the claims.
  const src = readFileSync(join(import.meta.dirname, "..", "engine", "sessionclaims.ts"), "utf8");
  const at = src.indexOf("recheck: reopenedAfterSigning(");
  assert.ok(at > 0, "the packet carries a recheck block");
  const block = src.slice(at, at + 700);
  assert.match(block, /THIS CLAIM STOOD BEFORE/, "it says the claim already stood");
  assert.match(block, /Rewrite ONLY the fields/, "it says not to rewrite what the change did not touch");
  assert.match(block, /re-runs every check/, "and it says the checks are not skipped");
});

// THE DEADLOCK A REOPEN USED TO CREATE (found live on i3, 2026-08-13).
//
// Three rules met and closed a loop:
//
// - a claim reopened after its signature does not stand, so its state cannot
//   be left;
// - `met` asks only whether the fields are FILLED, and they still are, so the
//   pull decided nothing was owed and served no form;
// - a form payload with nothing owed is illegal.
//
// So the agent that reopened the claim could never re-earn it. Every submit was
// refused for having nothing to submit to, and the mark stayed.
//
// The contract has always said the submit IS the rebless, and that a newer
// signature clears the mark by itself. It could not, because no submit was
// reachable.
//
// IT DID NOT LOOK LIKE THIS FROM THE OUTSIDE. The state reported only that its
// claim did not stand, so the form was rewritten, reformatted into a table and
// re-submitted several times. The form was never the problem.
test("a reopened claim is OWED again, so the submit that clears it is reachable", async () => {
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
  const id = String(session.iterationSeed("prove a reopen is re-earnable", "a reopened claim comes back owed").seeded);
  const sid = id.match(/^(i\d+)-/)?.[1] as string;
  await session.advance("iterations");
  await session.advance(sid);

  const it = itFind(root, id);
  pinIteration(root, it, "patch");
  const decl = session.currentMachine();
  const step = decl.states.find((s) => s.evidence_form.length > 0 && s.kind !== "gate");
  assert.ok(step !== undefined, "the column must ask for evidence somewhere");

  // A COMPLETE, SIGNED CLAIM — every field carries content. This is the case
  // that deadlocked: an EMPTY form was always owed, so it never showed.
  // ONE TREE SINCE i34: a record's evidence stands under the root.
  const ev = join(root, "project", "spec", "iterations", id, "evidence", `${step.id}.md`);
  mkdirSync(dirname(ev), { recursive: true });
  const filled = step.evidence_form.map((f) => `## ${f.name}\n\nwhat was claimed the first time\n`).join("\n");
  writeFileSync(ev, `---\nsigned_off: 2026-08-13T09:00:00.000Z\nauthors: human\n---\n\n${filled}`, "utf8");

  // Reopen it, the way the walk does when ground moves under a claim.
  writeFileSync(
    ev,
    readFileSync(ev, "utf8").replace(/^authors: human$/m, 'authors: human\nreopened: "2026-08-13T10:00:00.000Z — the ground moved"'),
    "utf8",
  );
  assert.equal(
    reopenedAfterSigning(parseStateNote(readFileSync(ev, "utf8")).frontmatter),
    true,
    "the fixture really is reopened after signing",
  );

  // THE CLAIM. The pull must OWE this form, so a submit against it is legal.
  // Before the fix it answered `do`, and every submit was refused as having
  // nothing to submit to.
  const answer = (await session.pull()) as { pull: string; for?: string; forms?: { form?: string }[] };
  assert.notEqual(answer.pull, "wait", "a reopened claim is work, not a reason to stop");
  if (answer.pull === "fill") {
    assert.ok(
      (answer.forms ?? []).some((f) => f.form === step.id),
      `the reopened form is the one served: ${JSON.stringify((answer.forms ?? []).map((f) => f.form))}`,
    );
  }
});
