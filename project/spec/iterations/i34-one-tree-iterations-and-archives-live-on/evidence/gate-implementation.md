---
form: gate-implementation
bless: blessed by human
by: agent
signed_off: 2026-08-16T10:13:07.373Z
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

i34's build is done and the battery stands at 1299 of 1299, with biome and preflight green. The engine then refused a re-run with SE-C-130 "an identical tree", so that green covers the tree as it now stands.

WHAT THE ITERATION DID. Record worktrees and record branches are gone. Iterations and expeditions are folders on trunk. The resolution seam that picked between trees is deleted rather than fixed, and with it the claim ledger, the method mirror and the tree-levelling machinery.

THE SELECTION STATE IS THE OTHER HALF. The iterations container had no exit that did not pass through an iteration, so a bare recovery pull entered the first one on the list — and entering BINDS a record and stamps it started. That happened five times on 2026-08-16 before anybody measured it.

TWO ROUNDS OF FRESH-EYES VERIFICATION RAN, and a third is running now. Each found real defects. None of them found the same one twice.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- none

## risks_acceptable

acceptable — one entry moved and moved back, its grade re-derives to the same word, and what i34 gives up is a stated trade rather than an unlogged risk

ONE RISK ENTRY MOVED, AND IT MOVED TWICE. raid-ar-trees-never-mix was re-pointed at req-a-write-lands-where-it-is-meant on the belief that i34 had retired req-trees-never-mix, then put back when the verifier showed the retirement was itself the error.

ITS GRADE IS UNCHANGED AT FATAL, and the inheritance re-derives rather than being carried. The entry's own rule is that the grade inherits from the requirement it protects. That requirement is restored, so nothing moved.

WHAT i34 GIVES UP IS NOT A RISK ENTRY, IT IS A STATED TRADE. Worktrees gave genuine filesystem isolation between records. One tree does not. Two iterations open at once now write into the same files, and nothing stops them. That is the cost of deleting the seam, and it is paid knowingly — the seam was resolving every path through a chooser that had one branch left.

## round_0_verify

- evidence vs claims: Opened what the evidence points at rather than trusting the list. Four verification rounds ran against the specs, and every round found something a test run could not see. The load-bearing check: a requirement demanding an ABSENCE cannot be discharged by a list, because the list is written by whoever missed the thing — so the tree-chooser sweep was run mechanically over the full id list, twice, by someone who did not write the code.
- types: Clean. `preflight green`, exit 0.
- lint: Clean. biome over 245 files, no fixes applied, no new suppression.
- tests: 1299 of 1299, 0 fail, run `test-msvnad5q-23`. An earlier identical-tree re-run was refused by the engine with SE-C-130, which is the discipline working.

## round_1_validate

- exercised against the goal: The goal was one tree with the seam deleted rather than fixed. Driven, not asserted: the container fix is proven by a case that failed first with ["front_desk"] and passes now; the closed-record folder is proven by reading it off trunk with no git retrieval; the status flag is proven by stamping a record shipped while leaving its directory in place.
- missing: One thing, and it is named rather than closed. req-every-record-path-resolves-in-one-tree demands the ABSENCE of a tree-chooser, and no test can show that nothing anywhere chooses. It is verified by inspection, and the inspection was run twice by a verifier that did not write the code.
- wrong: Two things were wrong and both were caught by verification rather than by the build. req-trees-never-mix was retired on a conflation of two meanings of "tree" and is restored. The expeditions container carried the same no-exit defect as the iterations one and was fixed with it.
- out of scope: The expeditions container fix sits outside the letter of req-a-pull-carrying-no-choice-enters-no-iteration, which says ITERATION. It was taken anyway because the harm is identical and the container was already in i34's scope. That is recorded here rather than smuggled.
- prior art: TRUNK-BASED DEVELOPMENT is what i34 moves to, and it is the mainstream practice it borrows from — one branch, no long-lived feature branches. What it does better than ours: it is proven at scale and has tooling built for it. What ours sheds: we keep the record FOLDER as the unit rather than the branch, so a record's work is readable without checking anything out. GIT WORKTREES are what i34 removes, and they do one thing better than we now do — genuine filesystem isolation, so two records cannot overwrite each other. We shed that deliberately for one resolution path. THIS COMPARISON IS REASONED FROM DOCUMENTED PRACTICE, NOT MEASURED. No benchmark was run against either, and calling it more than that would be fabrication.

## round_2_red_team

- STEELMAN: the worktrees were right and deleting them is the mistake => The strongest case: filesystem isolation is a guarantee, and a folder convention is a habit. Two open iterations editing engine/session.ts now collide silently, where before they could not. That case is CORRECT on its own terms and is recorded as the trade above. What defeats it is the count — the seam had one branch left, because a closed record's tree was already gone and an open record's tree was already the working root. It was a chooser choosing between one thing, on every lane call.
- KILL-CRITERION: two iterations run in parallel and corrupt each other's work => This would make i34 the wrong call. It is not hypothetical — 22 iterations stand open. What holds today is that only one is walked at a time, and that is a habit rather than a mechanism. If parallel walking is ever wanted, the isolation has to come back in some form, and it will not be worktrees.
- The selection fix works through EDGE ORDER, which is fragile => Half true, and the half that is true was made mechanical. Order alone was never enough: with one open iteration the guard had to SEE two doors, which is why the exit carries `alternative`. Both containers now assert their edge list and their roles in a case that has failed for real.
- A deletion this wide leaves dangling references nobody finds => It did. Seventeen in the live corpus and three in engine comments, and the first verification pass found only ten of them. The sweep that found the rest was mechanical, over the full id list, and it is repeatable.
- The agent verified its own work => It did not, and this is the one control that caught everything above. The builder never verified. The same verifier ran three rounds and was never respawned, so it judges deltas against what it already read rather than re-reading from zero.

## raid_additions

- none

## verdict

pass with overrides — the work is green and verified four times over, but a must-priority fatal-graded requirement was deliberately broken, and that is an override rather than a clean pass

THE OVERRIDE, STATED AS A LOSS. req-shared-change-reaches-without-unlanded-work-reaching demanded that no open record's unlanded work reach another's walk. It was `must` and `fatal`. One tree violates its second half by construction, and its own measure — "zero unlanded file from one is readable by the other's walk" — is false today.

THE DISSENT, SO IT IS ON THE RECORD RATHER THAN IN A SUMMARY. That row existed precisely to stop this move. Its Detail says the two halves were once separate rows that pull opposite ways, and that written apart "a design can satisfy either and look compliant". i34 satisfied one half, broke the other, and retired the row that was written to catch exactly that — recording the reason as "satisfied by construction, so it measures nothing".

THE RETIREMENT STANDS. The owner ruled one tree, and trading isolation away is the owner's call to make. What was wrong was the reasoning, not the decision. The loss is now written on raid-dec-one-tree-beats-a-record-travelling-between-machines, which is the decision node that made it, because it was nowhere before a verifier asked what the decision had cost.

WHAT LIMITS THE EXPOSURE IS A HABIT, NOT A MECHANISM. One record is walked at a time, so nothing collides in practice. 22 iterations stand open, and the day two walks run at once is the day this bites.

ONE ITEM IS CONTESTED AND THE ADJUDICATOR DECIDES IT. I restored req-a-method-change-reaches-every-tree, holding that a met demand is not a dead one while it can still be broken. The verifier read the same row and held the deletion defensible, because with one tree there is no other tree to step out to. Both readings are written into the node with their evidence. Neither of us built the other's case, and the disagreement is about what "by construction" means — a method question, not a fact about the code.

WHY NOT A CLEAN PASS. A fatal must was broken on purpose. Calling that a pass would dress a tradeoff as a win, which is the one thing the gate exists to stop.

WHY NOT A FAIL. Everything the iteration set out to do is done and driven, not asserted. The seam is gone, the containers offer their doors, the battery is green, and every finding from four verification rounds is acted on or recorded with its dissent.

## follow_up

TWO MACHINE DEFECTS ARE NOTED AND NOT FIXED HERE, both found by walking into them.

- Fresh-eyes findings have no route to fix-findings. The owner has ruled the fallback should also fire on findings (note-cb2093278822).
- A reopened build chunk is unreachable by the router: the only route to it runs forward through shipped, which closes the record to repair it.

BOTH ARE THE SAME MISSING THING — no route BACKWARD to a state that owes work. Every recovery today is an escape and a re-entry.

ONE NOTE WAS FILED AND DRAINED THE SAME HOUR. It diagnosed a third routing defect, and the real cause turned out to be a register three levels up still naming deleted requirements. Draining it mattered: left standing, it would have made every later survey lie.

THE PARALLEL-WORK QUESTION IS OPEN AND IS THE OWNER'S. i34 traded filesystem isolation for one tree. Nothing today needs it back, because one iteration is walked at a time. If parallel walking is wanted, isolation has to return in some form, and the retro is where that belongs.

## anything_else

