// A `wait` THAT CANNOT ROUTE SAYS WHAT IS IN THE WAY, NOT ONLY THAT IT IS.
//
// The sibling of stuck-do.test.ts, and the same lesson arriving at the other
// answer. Measured on the i15 walk driven by a smaller model: a re-signed
// gate-kickoff dropped draft-vision beneath it, so define-actual became
// unreachable. The wait said "nothing routes toward iterations/i15/define-actual
// from here" and nothing else. The walk spent twenty-five calls trying six
// phrasings of the same offered door, then escaped to the desk.
//
// THE ENGINE HELD THE WHOLE ANSWER THE WHOLE TIME. `se_why` named the fallen
// input, the chain it started at, and the exact se_reopen call that re-earns
// it. A capable model reaches for that verb unprompted; a smaller one does not,
// and nothing in the answer told it to.
//
// SO THE BLOCKERS RIDE THE ANSWER RATHER THAN BEING POINTED AT. A stop is the
// one place a follow-up call cannot be assumed — on an unattended box nobody is
// there to make it.
//
// WHY THIS IS A SOURCE-SHAPE TEST AND NOT A WALK.
//
// Reproducing the answer needs a record standing with a signed chain and then
// an upstream claim invalidated beneath it. A fresh root walks to the desk with
// nothing fallen, so there is nothing to observe — the same limitation
// feedback-loop.test.ts records for the red-objective case, and it is honest
// about it there too.
//
// A FIRST ATTEMPT AT A WALKING FIXTURE PASSED WITHOUT THE FIX, which is worse
// than no test: the aim was refused at SE-C-110 before any wait was reached, so
// every assertion sat behind an early return. This shape cannot go vacuous that
// way, and what it guards is real — the branch losing its blockers again.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SRC = readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");

/** The branch that answers when the route to the standing target cannot be
 *  drawn. Found by the sentence it is the only place to build. */
function unroutableWaitBranch(): string {
  const at = SRC.indexOf("const waitingOpts = this.pullOptions();");
  assert.ok(at > 0, "the unroutable-wait branch has moved or been renamed — this test is pinned to it");
  const end = SRC.indexOf("// 2. THE GATES ON THE FIRST STEP", at);
  return SRC.slice(at, end === -1 ? at + 4000 : end);
}

test("the unroutable wait asks the claim guard what is in the way", () => {
  const branch = unroutableWaitBranch();
  assert.match(branch, /this\.whyGrey\(/, "the branch answers without asking the guard that already knows — se_why held the whole answer");
  assert.match(branch, /blocked_by/, "the blockers are computed and not handed over, which is the defect this branch had");
});

test("the advice on a blocked wait sends the reader to the blocker, not to the doors", () => {
  const branch = unroutableWaitBranch();
  const advice = branch.slice(branch.indexOf("do:"));
  assert.match(advice, /blocked_by/, "the advice does not name where the reason is");
  // Six phrasings of the offered door were tried on the live walk and none of
  // them gets past a fallen input. Offering a door as the way on is the wrong
  // instruction precisely when a blocker stands.
  const blockedAdvice = advice.slice(0, advice.indexOf("waitingOpts.length > 0"));
  assert.doesNotMatch(
    blockedAdvice,
    /form: \{\\?"choice/,
    "the blocked case still hands over the choice call as the way forward, and no choice gets past a fallen input",
  );
});

test("a wait with no blocker and no door still names an act, and that act is stopping", () => {
  const branch = unroutableWaitBranch();
  assert.match(branch, /name what waits plainly and STOP/, "the empty case leaves the reader with a description and no act");
});
