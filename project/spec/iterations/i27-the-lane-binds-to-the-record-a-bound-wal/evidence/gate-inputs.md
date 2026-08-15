---
form: gate-inputs
bless: blessed by agent
by: agent
signed_off: 2026-08-13T19:32:18.307Z
authors: agent
files:
---

# Evidence form / gate-inputs

## current_situation

M2 is walked. draw-context, map-stakeholders, write-stories and generalize-use-cases all signed between 19:15 and 19:19. gate-motivation was blessed by the owner at 19:10:36.

EVERY M2 STATE INHERITED RATHER THAN AUTHORED. No neighbour added, no role added, no story written, no use case generalized. The change moves a line inside the box, not the boundary.

SO THIS GATE'S REAL QUESTION IS NARROW: given that nothing was authored, was the RE-CHECK honest, and does anything in scope lack a use case to hang on.

## picture_judged

THE JOURNEYS ARE THE RIGHT ONES, and two of them ARE this iteration.

uc-change-the-method-mid-walk is problem (b) written as a journey. An engineer finds the machine wrong halfway through and fixes it without abandoning the walk. Its story's second slide currently proves that with a step-out, cited to a real commit. This iteration makes that slide obsolete rather than wrong - the claim survives, the proof changes.

uc-claim-an-iteration is problem (a) at the point it bites. Two machines take two records and the ledger keeps them off each other. Nothing in the journey keeps their WRITES off each other, and that is the half this iteration adds.

IS ANY ONE OF THEM WRONG? No. But one is INCOMPLETE in a way worth naming: uc-claim-an-iteration reads as if claiming is the whole of not-colliding. It is not, and the iteration exists because it is not. The use case does not say so, and after this change it should.

WHAT THE COUNTS CANNOT SEE, and this is the judgment. Thirty-six use cases are listed and two were opened. Four more are likely touched by the state model moving and were not read: browsing the archive, closing a record, landing work on trunk, opening an iteration. Two quality use cases are directly relevant and unread: interaction-capability, because the bless broke the one-second rule today, and reliability, because a silent misroute is a reliability failure rather than a functional one.

THE PICTURE IS THEREFORE RIGHT AND PARTIALLY UNEXAMINED. That is a finding, not a blank.

## unspecified_capability

RUN MECHANICALLY RATHER THAN ARGUED. tests/trace-coverage.test.ts, 11 of 11 pass.

WHAT IT PROVES: every lane verb the engine registers is named in the trace, and every one is named in a USE CASE rather than merely somewhere. The verb count is pinned by an exact guard, so a new verb that nobody traced fails the suite.

SO NO CAPABILITY IN SCOPE IS UNCOVERED TODAY, and this gate does not fail on that count.

THE HONEST QUALIFICATION, because the field's bar and the register's bar differ. req-reachable-capability-is-traced demands a use case AND at least one requirement demanding each capability. Its own test spec demands only a requirement covering that use case. Under the requirement's stricter wording, 34 of 35 verbs are uncovered; under the spec's, all are. The suite implements the spec's reading.

THIS ITERATION RETIRES THAT QUESTION RATHER THAN ANSWERING IT. Its scope mints the lane as an INTERFACE and makes the rule that a new verb is defined there. A command surface is an interface, so it is specified as one, and the requirement is corrected to say so. Until that lands, the two bars disagree and the suite follows the looser one - which is recorded, not hidden.

ADDS NO CAPABILITY YET. This iteration changes what a path MEANS; it does not add a verb. If the ride-along or a job poll becomes a verb during the build, it owes an interface entry and a use case at that moment, not at the end.

## passes_concrete

SCRIPTABLE FOR THE TWO THAT MATTER, and not yet for the rest.

uc-change-the-method-mid-walk has a deck of six slides, each with its proof beside it, every proof a commit or a logged call. That is concrete enough to script: edit method mid-walk, reload, walk back, find the standing claims intact. The scenario exists and the numbers exist.

uc-claim-an-iteration is concrete on the claim half - two machines, one record, one ledger, zero double-claims - and has NO PASS for the write half, because the write half does not exist yet. That is expected at M2 and it is what M3 owes.

THE PASS THIS ITERATION ACTUALLY NEEDS is not written anywhere yet, and naming it here is the useful part: a write of each PATH KIND lands in the tree the caller meant. Four kinds - method, record content, session state, repo-root files - and the proof is a READ-BACK from the intended tree, never the write's own verdict.

WHY THE READ-BACK MATTERS ENOUGH TO STATE AT M2. Today a wrong resolution reports success. A pass line that trusts the write's answer would pass while the bug stands.

FOR THE OTHER THIRTY-FOUR: their passes are as concrete as they were, and this iteration neither improved nor damaged them.

## round_0_verify

- evidence vs claims: PASS. All four M2 evidence files opened and read. Each states plainly what it inherited and what it re-checked, and each names what it did NOT open rather than implying full coverage.
- types: PASS. tsc exit 0 at 19:12, and no source file has changed since - M2 authored evidence and register nodes only.
- lint: PASS. biome over 217 files, exit 0, 7 pre-existing infos.
- tests: PASS. 11 of 11 on the capability coverage suite, run for this gate rather than recalled. Plus 61 of 61 on references and trace at 18:55, which covered the register nodes this milestone minted.

## round_1_validate

- exercised against the goal: NOT YET, by construction at M2. Nothing is built. What IS exercised is the trace under it: the coverage suite passes, so every verb hangs on a use case.
- missing: NOTHING IN SCOPE LACKS A USE CASE. What is missing is the READING - six use cases likely touched by this change were listed for coverage and not opened.
- wrong: ONE THING, and it is small. uc-claim-an-iteration reads as if claiming is the whole of not-colliding. After this change it is not, and the use case should say so. Left for M3 rather than edited here, because a use case is not this state's to rewrite.
- out of scope: NOTHING FOUND. The M2 artifacts add no journey the motivation gate did not already sanction.
- prior art: NOT APPLICABLE AT THIS GATE and said rather than left blank. M2 authored nothing, so there is nothing of ours to position. The in-house comparison owed from the motivation gate stands owed at the architecture milestone.

## round_2_red_team

- STEELMAN: an inherit milestone that authors nothing should not need a gate => Its advocate says four states signed, nothing was written, and the gate is ceremony over a pointer. THE ANSWER IS THAT THE RE-CHECK IS THE WORK, and it found two things: a story whose proof this change obsoletes, and a use case that will read as complete when it is not. Neither would have surfaced from a pointer alone. But the advocate is right that the EVIDENCE looks heavier than the work - 36 references listed, two examined.
- ATTACK: the re-check is partial and the gate is passing it anyway => Six use cases likely touched were listed and unread. THIS STANDS AND IT IS AN OVERRIDE. It passes because the unread six are named rather than hidden, and because M3 sources every requirement to a use case, which forces the reading then. It would not pass if the unread ones were unnamed.
- ATTACK: the coverage checks prove a link EXISTS and never that anybody re-read it => THE REAL FINDING OF THIS GATE. The checks are mechanical about existence - a value prop with no story refuses, and it names the props that are short. They are silent about FRESHNESS: whether the linked node is still true after this change, and whether anybody looked. Listing thirty-six and examining two produces the same green as examining thirty-six. THE CAPABILITY CHECK DOES NOT HAVE THIS HOLE, because it compares two enumerable sets with no listing step in between. THE TEST THAT SEPARATES THEM: could an agent pass this check while examining nothing? For coverage, yes.
- The finding has a shape rather than being a complaint => TWO HALVES. Compute which nodes this change actually touches, over the TRACE graph rather than the state machine. Then demand that every listed reference either was re-read against this delta, or is provably outside that set. That turns I listed thirty-six into I read the six the change touched, and it refuses when a touched node is listed unread. The freshness half cannot be built before the impact half, so i6 waits on i18.
- KILL-CRITERION => This gate is wrong if a capability in scope has no use case. LOOKED FOR IT MECHANICALLY: 11 of 11 pass, so no. The nearest thing to a hit is that this iteration may ADD a verb during the build - the ride-along, a job poll - and the check only fires once that verb is registered. Named in the follow-up so it is not discovered at M8.
- ATTACK: two bars for one requirement, and the suite follows the looser => 34 of 35 verbs are uncovered under the requirement's own wording and all are covered under its test spec's. The gate reports the looser number because the suite implements it. THAT IS HONEST ONLY BECAUSE IT IS SAID. This iteration's scope retires the question by making the lane an interface, which is the right fix and is not yet built.

## raid_additions

- none

## verdict

pass with overrides — no capability in scope is uncovered, proven mechanically, and the checks that carried the rest of this milestone cannot tell a re-read from a listing.

WHY IT PASSES. The one hard question this gate asks is answered by a test rather than by prose: 11 of 11, every lane verb named in the trace and covered by a use case. The journeys are the right ones, and the two that matter ARE this iteration's two problems.

TWO OVERRIDES, WITH THEIR DISSENT.

OVERRIDE ONE: the re-check is partial. Thirty-six use cases listed, two opened, six more likely touched and unread. THE DISSENT: a milestone whose whole job is to re-check inherited artifacts, passing with most unread, is passing on what it listed rather than what it examined. It passes because the unread are NAMED, and because M3 sources every requirement to a use case, which forces the reading. It would fail if they were unnamed.

OVERRIDE TWO, and it is the more important one: THE COVERAGE CHECKS PROVE EXISTENCE AND NOT FRESHNESS. A green here is compatible with examining nothing. THE DISSENT: this gate is therefore endorsing a milestone on the strength of a check that cannot see the difference, and the only thing separating this from paperwork is prose nobody can verify. It passes because the gap is now recorded with the shape of its fix - compute the impact set, then demand every touched reference was re-read - and because that fix is a named piece of work rather than a wish.

OWNER RULING, 2026-08-13: the coverage checks should be mechanical about freshness too. i6 owns making conformance mechanical and it WAITS ON i18, which owns computing the impact set. The freshness half cannot exist before the impact half.

WHAT WOULD HAVE MADE IT A FAIL: a capability in scope with no use case. The check says there is none.

## follow_up

OWED AT write-requirements, five things.

- Rows for the six pieces of behaviour that landed before the kickoff priced them.
- The measured split of past step-outs into accidents and deliberate method edits.
- The pass line for each path kind, proven by a READ-BACK from the intended tree rather than by the write's own verdict.
- The reading of the six use cases named unread here.
- A correction to uc-claim-an-iteration, which reads as if claiming is the whole of not-colliding.

CARRIED OUT OF THIS RECORD, on the owner's ruling. The coverage checks gain a freshness half: every reference in a change's impact set was re-read, or is provably outside it. i6 owns it and waits on i18 for the impact computation. NOT THIS ITERATION - recorded so the next gate that leans on a coverage check knows what it is leaning on.

WATCH FOR A NEW VERB DURING THE BUILD. The ride-along and a job poll may become lane verbs. The capability check fires only once a verb is registered, so it would catch it at M8 rather than at M3. Each new verb owes an interface entry and a use case AT THE MOMENT IT IS ADDED.

STANDING AND UNRESOLVED FROM M1: the general rule ships unexercised by its own author, and the in-house prior-art comparison is owed at the architecture milestone with the read case as its deciding question.

## anything_else

