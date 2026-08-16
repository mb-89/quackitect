// i11's bucket: a finding that blocks nothing is carried as an owed item
// naming an open register entry, and the close refuses while one stands.
//
// THESE WERE FIRST WRITTEN AGAINST A BOOTED SERVER AND FAILED ON THE FIXTURE.
// Every case hit SE-C-110 — "nothing asked for a form", "no bound expedition" —
// so none of them ever reached the code under test. A red for the wrong reason
// is not a red for the requirement.
//
// SO THEY DRIVE THE MECHANISMS DIRECTLY. Reaching a checklist field through a
// real walk means seeding a record, entering a container and walking to a state
// that owns one; that path is the DEMONSTRATION's job (tsp-carry-a-finding),
// and it is where reachability gets judged. What belongs here is whether the
// mechanism is correct, and these call it.
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { checklistOwed } from "../engine/stateform.ts";
import { loadTrace } from "../engine/trace.ts";
import { owedStanding } from "../engine/worktree.ts";
import { freshRoot } from "./helpers.ts";

function entry(root: string, id: string, status: string): void {
  const dir = join(root, "project", "spec", "trace", "raid");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${id}.md`),
    `---\nid: ${id}\ntype: "[[raid]]"\nkind: risk\nstatement: a throwaway entry for the bucket's cases\nowner: the driving agent\ntrigger: never\nstatus: ${status}\n---\n`,
    "utf8",
  );
}

function evidence(root: string, recordDir: string, file: string, body: string): void {
  const dir = join(root, recordDir, "evidence");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, file), body, "utf8");
}

// req-a-harmless-finding-is-carried-not-stopped-on
//
// THE PERMISSION. Today a finding has two fates and both are bad: it blocks the
// state until somebody fixes it, or it becomes a note nobody reads again. i34
// ran a whole iteration in the first mode and wrote `[owed]` zero times.
test("an owed item naming an open register entry is carried, not treated as unchecked", () => {
  const root = freshRoot();
  entry(root, "raid-risk-a-throwaway-that-is-open", "open");
  const corpus = loadTrace(root);

  const owed = checklistOwed(
    ["Dependencies stay layered"],
    "- [owed] Dependencies stay layered — raid-risk-a-throwaway-that-is-open",
    corpus,
  );

  assert.equal(owed.length, 1, `a well-formed owed item was not carried: ${JSON.stringify(owed)}`);
  assert.equal(owed[0].ref, "raid-risk-a-throwaway-that-is-open");
});

// req-a-harmless-finding-names-an-open-entry
//
// THE GUARD. A disposition somebody asserted is not one somebody agreed —
// NASA NPR 7123.1 turns on that word. Without this, `- [owed]` is strictly
// WEAKER than the unchecked box it replaces: `- [ ]` reads as unfinished,
// `- [owed]` reads as dispositioned.
test("an owed item naming nothing is not counted as a carried finding", () => {
  const root = freshRoot();
  const corpus = loadTrace(root);

  const owed = checklistOwed(["Dependencies stay layered"], "- [owed] Dependencies stay layered — raid-does-not-exist-at-all", corpus);

  assert.deepEqual(owed, [], "an owed item pointing at nothing was counted as a genuine carried finding");
});

// req-close-refuses-loose-ends
//
// THE ROW WAS MINTED IN i1 AND HAD NO IMPLEMENTATION until i11. It is a `must`
// graded fatal. A probe went looking for the mechanism to compare against the
// form-side guard and found nothing there; the owner ruled the same day that
// the close site gets built here.
test("an owed item whose entry is still open holds the close", () => {
  const root = freshRoot();
  entry(root, "raid-risk-a-throwaway-that-is-open", "open");
  evidence(
    root,
    "project/spec/expeditions/e99",
    "some-state.md",
    "## quality_ok\n\n- [owed] Dependencies stay layered — raid-risk-a-throwaway-that-is-open\n",
  );

  const standing = owedStanding(root, "project/spec/expeditions/e99");

  assert.equal(standing.length, 1, `the close saw no owed item standing: ${JSON.stringify(standing)}`);
  assert.equal(standing[0].where, "some-state.md", "the close does not say which form carries it");
});

// The disposition ruling, made when this reader was built.
//
// `accepted` AND `deferred` LOOK WRONG IN THE DISPOSED SET AND ARE NOT. They
// are exactly where a carried finding drifts, and both are real rulings.
// Treating either as unresolved would make the close refuse work somebody had
// already decided — which is what teaches people to stop using the bucket.
test("an owed item whose entry was accepted no longer holds the close", () => {
  const root = freshRoot();
  entry(root, "raid-risk-a-throwaway-somebody-accepted", "accepted");
  evidence(
    root,
    "project/spec/expeditions/e99",
    "some-state.md",
    "## quality_ok\n\n- [owed] Dependencies stay layered — raid-risk-a-throwaway-somebody-accepted\n",
  );

  assert.deepEqual(
    owedStanding(root, "project/spec/expeditions/e99"),
    [],
    "a ruled entry still held the close, so a disposition counts for nothing",
  );
});

// The deletion-orphans defect, caught at the last place that can catch it.
//
// The form side refuses an unresolved ref at submit, so a ref that resolves to
// nothing HERE means the entry was deleted after the form signed. That is the
// defect i11 saw five times in one day, arriving at the close.
test("an owed item whose entry was deleted after signing holds the close", () => {
  const root = freshRoot();
  evidence(
    root,
    "project/spec/expeditions/e99",
    "some-state.md",
    "## quality_ok\n\n- [owed] Dependencies stay layered — raid-risk-somebody-deleted-this\n",
  );

  const standing = owedStanding(root, "project/spec/expeditions/e99");

  assert.equal(standing.length, 1, "a deleted entry let the close pass, so an orphaned owed item ships silently");
});
