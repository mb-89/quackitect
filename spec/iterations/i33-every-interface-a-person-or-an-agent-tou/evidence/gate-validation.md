---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-17T19:55:11.036Z
reopened: 2026-08-17T19:54:02.332Z — Its ruling counts three must stories and the law counts five. Two more were found by this gate's own slide law after it signed, and five demonstration specs plus five filled decks landed since the signature. The verdict text no longer describes what it is ruling on.
authors: agent
files: null
---

# Evidence form / gate-validation

## current_situation

THE ACCEPTANCE GATE, ruling for the third time, and each ruling saw more than the last.

WHAT THE FIRST RULING MISSED. It signed while fill-story-evidence was crossed unsigned, so the slide law had never run.

WHAT THE SECOND ONE MISSED. Closing that hole let the law run here too, with the musts included — and it named FIVE must stories, not three. Two of them, from i15, had no demonstration naming them and six or seven empty deck slides each. Nobody had ever been asked for either. The ruling signed before that check ran, so its text counted three.

WHAT WAS DONE ABOUT IT. Five demonstration specs written, one per must story. Five decks filled from what is on disk rather than from memory.

AND ONE CORRECTION TO THIS WALK'S OWN WORK. The evidence written into sty-trust-a-repeatable-answer earlier tonight said i15's query verb "was never built". That was false. engine/query.ts and engine/disposition.ts are both built and tested, and what is missing is a lane verb reaching them. Corrected, and note-8a7a3030c5e9 carries the check.

THE HARD ANSWER GOT HARDER: zero of five must stories demonstrated, not zero of three.

## meets_need

- vp-rigor-without-toil: SERVED, AND THE SERVICE IS HALF BUILT. It gained a criterion — a slow interface tells the person — with two zero-target pass lines, and the DENOMINATOR that made i12's standing criterion computable in principle: thirteen outside boundaries where none existed, nine timed directly. WHAT IT DID NOT GAIN is a reading over that denominator; twelve of the thirteen have no calls attributed to them. AND ONE OF ITS MUST STORIES GOT ITS FIRST EVIDENCE TONIGHT: sty-dispose-a-candidate-coupling refines this prop and its deck had been empty since i15
- vp-the-ledger: TOUCHED, and the touching is evidence rather than delivery. Both of its stories — sty-trust-a-repeatable-answer and sty-answer-what-does-this-touch — carry filled decks for the first time. THE FINDING THEY CARRY: the query evaluator IS built at engine/query.ts:45 with four green cases, and no lane verb reaches it. A prop whose deck says "built and unreachable" is worth more to it than one that says nothing, and it is still not service
- vp-autonomy-range: UNTOUCHED. This delta wrote no autonomy behaviour. It read the dial to decide which gates were the owner's and changed nothing about how the dial works
- vp-qualities: UNTOUCHED AS A PROP, and the closest call. The delta adds two quality requirements, so it FEEDS this prop's subject, but no criterion was added or changed on it. Claiming service because the work was quality-shaped would be the fabricated coverage this field warns about
- vp-systematic-engineering: UNTOUCHED. The method gained a goals list and two gate rounds — machinery this prop is about — but no criterion moved
- vp-the-engine: UNTOUCHED. Engine code changed heavily under goal five, which is engine improvement rather than service to this prop's promise
- vp-vendoring: UNTOUCHED, and nothing in this delta comes near it

## musts_demonstrated

- sty-the-control-that-says-why-it-declined: NOT DEMONSTRATED, and now specified rather than described. tsp-a-decline-is-legible-to-the-person, step one of machines/demos.md. IT IS RUNNABLE TODAY — both cases authored RED against it stand green in the battery, so nothing it needs is missing except an hour of a person's time
- sty-the-slow-call-that-says-it-is-working: NOT DEMONSTRATED, and not agent-runnable even in principle. tsp-a-long-wait-is-never-a-guess. Its step 2 has nothing to observe yet: both cases of tsp-work-past-its-bound-signals stand RED by design because nothing puts a running operation on the panel
- sty-the-call-that-comes-back-inside-a-second: NOT DEMONSTRATED, closest to runnable. tsp-the-driving-calls-come-back-inside-a-second. Twelve of thirteen boundaries have no calls attributed, so its step 4 reads one row and the person's real job in it is judging whether the list has holes
- sty-answer-what-does-this-touch: NOT DEMONSTRATED, AND THIS GATE IS WHAT FOUND IT. A must story that no demonstration named, with six empty slides, standing since i15. Both fixed tonight: tsp-a-structured-query-answers-what-a-decision-touches, and a deck filled from disk. THE FINDING: engine/query.ts:45 is built with four green cases and no verb reaches it
- sty-dispose-a-candidate-coupling: NOT DEMONSTRATED, found the same way and standing the same length of time. tsp-candidate-couplings-are-disposed-one-by-one, deck filled. THE FINDING: rankCandidateCouplings is built and tested, recordCouplingDisposition is called by nothing at all, and no verb reaches either
- sty-a-check-binds-without-engine-code: UNTOUCHED BY THIS DELTA, and already named by tsp-conformance-at-the-write
- sty-carry-a-finding-without-stopping: UNTOUCHED, and it earned a mention — its own deck records i11's walk going straight from the implementation gate to the consistency sweep, which is the evidence that fill-story-evidence was crossed there too
- sty-hand-over-and-walk-away: UNTOUCHED, named by tsp-panel-walkthrough
- sty-ramp-up: UNTOUCHED, named by tsp-first-run, and it needs real newcomers rather than a run
- sty-review-a-gate: UNTOUCHED AS A STORY, though this walk exercised gate review a dozen times. That is USE rather than demonstration
- sty-start-a-new-product: UNTOUCHED, named by tsp-first-run
- sty-the-agent-proves-it-read: UNTOUCHED AS A STORY; the reading proof fired throughout this walk, which is use
- sty-the-write-refuses-the-break: UNTOUCHED AS A STORY; refusals landed repeatedly tonight and each named a real defect, which is the behaviour working rather than its demonstration
- sty-walk-it-by-hand: UNTOUCHED, named by tsp-hand-walk, and it needs a person driving
- sty-work-on-two-machines: UNTOUCHED, named by tsp-two-machines, and it needs a second machine that does not exist here
- sty-ask-the-lane-what-it-can-do: UNTOUCHED, named by tsp-lane-help-run

## market_tier

not a market iteration — an internal minor against a product with one user, so the expensive real-world tier does not apply and is not claimed.

## round_0_verify

- evidence vs claims: HELD, AND IT HELD HARDEST AT THIS GATE. Refusals landed repeatedly and each named a real defect: a function node missing an edge a form claimed, two runners no design spec claimed, an amend that would have changed a question rather than a wording, a checklist wanting bare items, a story deck with six empty halves, and finally this gate's own slide law naming two must stories nobody had ever been asked about
- types: RUN AND GREEN inside the battery, over engine source that changed heavily today
- lint: biome clean over 274 files, no suppression added. One complexity ceiling was hit and refactored out rather than silenced
- tests: 1403 tests, 134 suites, 0 failures at the last run, plus preflight and a corpus sweep. Seventeen of those cases are this iteration's. THE BATTERY RUNS AGAIN ON THIS GATE'S EXIT, which is where the owner asked for it and the only place it fires
- the claims table: FOURTEEN OWED AND NONE CHECKED, the honest count. Each points at a standing register entry rather than a blank

## round_1_validate

- exercised against the goal: PARTLY. The modelling half is built and measured; the fixing half moved twice and was never re-read in aggregate
- missing: five demonstrations rather than three, and the aggregate latency reading. Each of the five now has a written procedure saying what it needs, so none of them is a blank
- wrong: SIX BELIEFS WERE FALSIFIED TODAY, five of them mine. That a host hands in every panel value. That the control bar refreshes unconditionally. That an amendment should re-grey the chain. That a door-access count catches a per-state corpus load. That this record was shipped when it was merely merged. AND THE LAST ONE, caught inside this gate: that i15's query verb was never built. It is built, tested and unreachable, the evidence saying otherwise is corrected, and note-8a7a3030c5e9 carries the check
- out of scope: the demonstrations, deferred because an agent cannot perform them rather than because they are hard. AND THE TWO MISSING VERBS over i15's built engine parts, which are not this record's to add
- prior art: NOT SCANNED AT THIS GATE, and that is a gap rather than a blank. Nobody compared how other systems decide work is ACCEPTED when its acceptance tests cannot be run, which is exactly this gate's problem

## goals_served

- model the outside boundaries: BUILT. Thirteen interface nodes, realized by dsp-the-outside-boundaries-and-their-bounds
- bind the one-second demand to them: BUILT AND MEASURED. Nine timed directly; if-record-store-to-origin-remote's bound was corrected by its own measurement
- instrument every interface: BUILT AS A DEMAND. req-a-breached-bound-is-put-in-front-of-a-reviewer, and the bound_breaches round on every gate in this column
- fix what the numbers name: PARTLY, still the thinnest. Two fixes, no aggregate re-reading
- engine improvements: BUILT, AND THE LARGEST OF THE FIVE BY THE END. The green guard counts corpus asks rather than reading a clock. An amendment no longer re-greys the tree, carried by req-an-amend-leaves-the-tree-standing and a test that signs a whole chain. A field another form reads is unamendable. A state that carries a claim without carrying FIELDS is recognised in four places, so the walk cannot leave it unsigned. AND A REFUSAL NAMES THE FAILING CHECK instead of withholding it — which is what let this gate report five stories by name instead of sending somebody hunting

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED THROUGHOUT, and the count is now well past the standing floor of 181. Six pulls TIMED OUT entirely on the hop into a gate, because that hop's exit script fires the full battery — about a minute of work behind a single call the harness gives up on. THE DISPOSITION: honest rather than defective, since a battery is a minute by design. What is NOT honest is that the call gives no sign it is working, which is this iteration's own second half failing on its own walk and the clearest live instance the record holds. A SECOND CAUSE WAS FOUND TONIGHT: every edit to engine/session.ts forces a full battery because the scope map is a filename lookup with no tests/session.test.ts behind it. That is note-ce4ac7d7af2d and note-4bfbbe7e8d93, and the owner has ruled it gets fixed next. THE FLOOR REMAINS A FLOOR: se_log_query drops matching records without saying so

## round_2_red_team

- STEELMANNED OPPOSING CASE: this gate should FAIL. Its own guidance says the bless IS the acceptance, and zero of FIVE must stories have been demonstrated => a fail sends work back, and the work it would send back cannot be performed by anything that walks this machine. That would be a blocked walk dressed as a judgment. The right shape is a pass whose override is loud, plus a register entry with an owner and a trigger
- THE COUNT GOT WORSE BETWEEN RULINGS, so the trend is against acceptance => true, and it is the correct direction for a count that had never been measured. Three was the number of stories this iteration wrote. Five is the number the law actually demands, and the two extra were invisible until a hole upstream was closed. A number that rises when the instrument is fixed is the instrument working
- TWO OF THE FIVE BELONG TO ANOTHER RECORD, so this gate is blocked on i15's unfinished work => true, and it is not a reason to fail. The demand is on the corpus, not on the delta. What this record owed was to stop walking past it, and it wrote both procedures and filled both decks without deciding whose the missing verbs are
- THIS GATE ALREADY SIGNED TWICE OVER INCOMPLETE GROUND, so why trust it now => because each signature was followed by a mechanical check that found the next thing, rather than by an argument that nothing was left. fill-story-evidence's law found six empty halves. This gate's law then found two more stories. A gate that keeps finding things after its foundation moves is the ripple working
- THE ITERATION REPAIRED ITS OWN ENGINE SEVEN TIMES MID-WALK, so the thing being judged kept changing under the judgment => true, and it is the honest cost of being the first walk to reach this state. Every repair is named in current_situation and in the notes. Whether a mid-walk repair should land without re-planning is the retro's question
- EVERY LATENCY NUMBER IS A FLOOR, so milestone four is judged against figures nobody can bound from above => true and stated in the breach row rather than discovered by a reader
- KILL CRITERION, named and looked for => this acceptance is wrong if the demonstrations, once run, would FAIL. Looked for by reading what each story asserts against what shipped, and NOT found. The honest qualifier is that finding it that way is the argument-instead-of-evidence this gate is accepting on. AND ONE NEAR MISS IS ON RECORD: the same method produced a false claim about i15 tonight, caught only by reading the code. That is precisely the failure mode of this round

## raid_additions

- none

## verdict

pass with overrides — STAMPED BY THE AGENT. THE OVERRIDE: ZERO OF FIVE MUST STORIES ARE DEMONSTRATED. This gate accepts on argument where its own guidance asks for the report of a real run. WHY NOT A FAIL: the returned work cannot be performed by anything that walks this machine — three need a person at this screen, one needs people who are not us, and two wait on verbs another record owns — so a fail would be a blocked walk wearing a judgment's clothes. WHAT MAKES THE PASS DEFENSIBLE: all five now carry a written procedure naming what it needs and what would make it fail, where three carried a paragraph and two carried nothing at all. They sit in machines/demos.md and in raid-debt-ten-checks-wait-on-a-person-or-a-second-machine with an owner and a trigger. AND WHAT MAKES THIS RULING BETTER THAN THE LAST: the previous one counted three because three was all it could see. This one counts five, names both stories it had been walking past since i15, and corrects a false claim this same walk wrote about them an hour earlier.

## follow_up

WHAT SHIPS: thirteen modelled boundaries with argued bounds, eight requirements, three stories, six test-specs, five demonstration procedures, a goals list every gate measures against, two new gate rounds, an amend rule that no longer re-greys the tree, a green guard that counts what it names, two inspection runners, the first real demo drawing this project has had, and a walk that can no longer leave a state unsigned.

NOT SHIPPING, named so nobody discovers it later: any demonstration of any must story, and any aggregate proof that a call is faster than it was this morning.

WHAT THE NEXT ITERATION INHERITS — the owner has already ruled on the first two:

- THE BATTERY SCOPE. Non-code files force a full battery, and engine/session.ts maps to no scoped test because the map is a filename lookup. note-ce4ac7d7af2d and note-4bfbbe7e8d93.
- THE REWIND. A walk that made a mistake has no way back to the state it crossed. note-1447294a356d, with i31's re-run mode as the planned mechanism.
- TWO BUILT ENGINE PARTS WITH NO DOOR, which is new tonight. i15's query evaluator and coupling ranker are on disk, tested, and unreachable from the lane; recordCouplingDisposition is called by nothing at all. note-8a7a3030c5e9. Whose walk finishes them is the owner's call and has not been asked.
- THE ATTRIBUTION GAP on twelve boundaries, and the log query that omits matching records.
- AND THE LESSON, note-c137415d46d2: a state nobody has ever walked is untested code, and the states no record has signed are exactly where the next faults are.

## anything_else

