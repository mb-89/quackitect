---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-13T14:53:12.207Z
authors: agent
files:
---

# Evidence form / gate-validation

## current_situation

The delta is built, green at 1151 of 1151, and the implementation gate blessed it at 14:50 with one recorded override.

THIS GATE ASKS A DIFFERENT QUESTION: does the result meet the need. The honest answer has two halves.

THE MECHANICAL HALF IS STRONG. Seven repairs landed, each against a demand that already stood, each with a test behind it. Two standing requirements that were quietly unmet are now enforced by the battery rather than by anyone remembering.

THE DEMONSTRATION HALF IS EMPTY. Not one must story was demonstrated this iteration. All seven ride demonstration specs, and four of those specs are unobserved and carried as debt. That is the override this gate inherits, and it is not dressed up below.

## meets_need

- vp-autonomy-range: SERVED. The tier cut-over is finished in the corpus - no canvas, state note, matrix row or guidance page carries a numeric weight, and a test fails if one appears. A hole that let three spellings of `blocked` resolve to 0 is closed, and 0 is the value that would have let a blocked state run at every setting.
- vp-qualities: SERVED. Two quality requirements that were unmet are now enforced mechanically: every reachable lane verb carries a use case, and every scoped test run records the question it answers.
- vp-rigor-without-toil: SERVED, and this is the iteration's clearest win. Twelve matrix rows are struck at minor, so a small change stops paying for a large one's ceremony. Two checks that a person had to remember to run became tests.
- vp-systematic-engineering: SERVED. The walk's feedback loop is the iteration's subject: the reopen lands on the frontier, a grey state names every condition holding it, and a zero-step route refuses instead of stalling silently.
- vp-the-engine: TOUCHED, not advanced. Every change here repairs the engine rather than extending what it offers. That is the delta's declared shape.
- vp-the-ledger: UNTOUCHED, and that is fine. Nothing in this delta reaches the claim lane. The two claim-pool requirements written today were wired to their function, which is bookkeeping rather than capability.
- vp-vendoring: UNTOUCHED, and that is fine. No overlay, placement or vendoring surface was in scope.

## musts_demonstrated

- sty-hand-over-and-walk-away: NOT DEMONSTRATED. Its spec is tsp-panel-walkthrough, unobserved and carried by raid-debt-human-observed-demonstrations. Needs a screen and a second host.
- sty-ramp-up: NOT DEMONSTRATED. Its spec is tsp-first-run, unobserved and carried by the same row. Needs a bare machine and a first-time reader.
- sty-review-a-gate: NOT DEMONSTRATED. Its spec is tsp-desk-and-gates, unobserved and carried by the same row. Five of its eight steps were never walked, and the delta moved the machinery behind three of them.
- sty-start-a-new-product: NOT DEMONSTRATED. Also rides tsp-first-run. Same row, same reason.
- sty-the-agent-proves-it-read: MECHANICALLY VERIFIED, not demonstrated. The reading credit is this iteration's own build and reading.test.ts covers it, including a document whose content moved being owed again. That is a test, and this field asks for a demonstration.
- sty-walk-it-by-hand: NOT DEMONSTRATED. Its spec is tsp-hand-walk, which needs the dial at 0 and a person clicking through states. No screen was used.
- sty-work-on-two-machines: NOT DEMONSTRATED, and not this iteration's. It arrived from the previous iteration when trunk was synced in. Its spec tsp-two-machines-run needs two real machines.

## market_tier


## round_0_verify

- evidence vs claims: every claim above names a run, a file or a spec. The tester ran the battery independently at 1149 of 1149 and proved the new coverage check fails at HEAD rather than arguing it does.
- types: clean. The typecheck ran on every patch; one missing import was caught at the boundary before any test ran.
- lint: biome exit 0, no new suppression. A complexity breach was fixed by extraction, never by silencing.
- tests: 1151 of 1151. The scoped runs behind each change are listed on gate-implementation's round 0.

## round_1_validate

- exercised against the goal: PARTLY. The mechanical claims are exercised hard - seven repairs, each with a test, battery green. The USER-FACING claims are not exercised at all, because no demonstration ran. A person's experience of this build is unmeasured.
- missing: seven of seven must stories lack a demonstration this iteration. 34 of 35 lane verbs are named in no requirement. One prose-inspection item has never been performed.
- wrong: req-reachable-capability-is-traced asserted the live offer cannot be enumerated mechanically, which was false for the lane verbs. Corrected, and that third is now machine-checked.
- out of scope: the previous iteration's tier cut-over was finished here, because this verification could not go green while it was half-done. Four repairs also arrived after the requirements state had signed. The iteration is about twice its declared delta.
- prior art: NOT SCANNED, and that is a finding rather than a blank. The minor column drops state_of_the_art from this gate, and the delta ships no new user-facing capability to compare. Where that reasoning is weakest is the schema-over-free-text idea the owner raised today: other tools solve typed configuration with schemas and language servers, we are about to build one, and nobody looked at what they do first.

## round_2_red_team

- STEELMAN, the case for failing this gate at its strongest => A validation gate exists to ask whether the thing works for the person who uses it. Seven must stories, zero demonstrations. Every claim this gate can point at is a claim about code, checked by code, judged by the agent that wrote the code. The one independent voice was another agent, not a person. On its own terms, this gate has no evidence of the kind it was built to weigh, and passing it makes the gate ceremonial.
- The answer, and it is partial => The demonstrations are not skipped, they are OWED and recorded, with a trigger and a named collection pass. The delta genuinely shipped no user-facing change: every repair enforces a demand that already stood, so a demonstration would re-observe last week's behaviour. That argument is honest but it does not cover tsp-desk-and-gates, whose machinery this delta did move.
- KILL CRITERION: this is the wrong call if the build made a person's experience worse in a way only a person would see => Looked for in the three places it could hide. The tier words changed what the panel shows: checked, the feed now carries the word beside the number and never a bare value. The field trim changed what a form asks: checked, it can only drop questions a size declares, never add. The grey verb added an answer where there was silence. None of the three can degrade an experience that was working.
- The builder pressed both gates today, after the tester caught two defects the builder missed => Unanswered as a pattern. The mitigation that worked was fresh eyes across four rounds. Nothing structural stops the next builder from pressing a gate over work nobody else read.
- A checked box no longer means an observation, for four rows => Recorded on three artifacts and ruled by the owner. Residual: the claims table is what a later reader trusts fastest, and it now needs its prose read alongside it.
- ASSUMPTION this gate makes: that the consolidation pass collecting person-checks actually happens => If it does not, this iteration is where demonstrations quietly stopped being part of shipping, and no single later gate will notice.

## raid_additions

- [[raid-debt-human-observed-demonstrations]]

## verdict

pass with overrides — the mechanical half meets the need and is checked hard: seven repairs green at 1151 of 1151, two standing requirements now enforced by the battery, and a hole closed that would have let a blocked state run at every setting. The override is that ZERO of seven must stories were demonstrated. Six ride specs that need a person and are carried by raid-debt-human-observed-demonstrations; the seventh is covered by tests rather than a demonstration. THE DISSENT, recorded rather than smoothed over: a validation gate with no demonstration is judging only what code can check about code, and the case for failing it is written in full at the head of round 2. It passes because the delta ships no user-facing change - every repair enforces a demand that already stood - and that argument does not extend to tsp-desk-and-gates, whose machinery this delta did move.

## follow_up

THE COLLECTION PASS IS THE REAL FOLLOW-UP. raid-debt-human-observed-demonstrations carries four specs and, through them, six of the seven must stories. Its trigger is that pass, or any iteration whose delta actually touches one of the four.

IF THAT PASS DOES NOT HAPPEN, this iteration is where demonstrations stopped being part of shipping. That is stated in round 2 as an assumption rather than left to be discovered.

OWED AND NOT BLOCKED: 34 of 35 lane verbs are named in no requirement, and the entry document still teaches 12 of 35 verbs.

FOUR NOTES STAND AT MUST for the retro: the unreachable fallback edges, the mid-walk sync, frontmatter written by the agent, and the worktree jumping the owner has ruled the next iteration's work.

## anything_else

