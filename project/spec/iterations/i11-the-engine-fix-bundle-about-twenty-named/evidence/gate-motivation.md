---
form: gate-motivation
bless: blessed by agent
by: agent
signed_off: 2026-08-16T11:13:10.255Z
authors: agent
files:
---

# Evidence form / gate-motivation

## current_situation

M1 is complete. The vision is inherited by pointer, the goal conflict is named and ruled, the register carries four entries with owners and triggers, and scope is cut to one surface.

THE QUESTION THIS GATE ASKS: is THIS extension worth having. Past it the vision is axiomatic and nothing downstream re-argues it.

## vision_scope_stated

COMPLETE, AND MOSTLY BY POINTER, which is what a minor is entitled to.

- THE BIG IDEA, THE TO-BE WORLD AND THE PITCH are inherited unchanged. A minor cannot move them — a product whose identity changed is not a minor — and the form drops all three mechanically.
- THE GOAL SYSTEM is the standing value props, named at draft-vision, with the ONE conflict this delta creates written out and ruled: pace pulls against thoroughness, and the bucket is where the pull is sharpest.
- THE DELTA authors no new value prop. It makes vp-rigor-without-toil true rather than making a new promise.
- SCOPE AND NON-GOALS are cut at vision level, with seven exclusions each naming where the work went. draw-context at M2 carries the binding system-level list.
- THE REGISTER is open with four entries.

NOTHING IN THE PACKET IS A PLACEHOLDER.

## problem_agreed

THE PROBLEM IS MEASURED, NOT ASSERTED. 2,850 calls were logged on 2026-08-16. Building — patch, write, delete — was 200 of them, 7%.

THE OWNER REPORTED IT INDEPENDENTLY, from outside the machine, before seeing any of these numbers: "you are spending way too much time doing things that are not productive. This all takes way too long." Their estimate was that building took twenty percent. It took seven.

WHERE THE REST WENT, and each line is a call that produced nothing.

- 494 se_test calls produced 66 verdicts. About 428 asked only whether a job had finished.
- 448 calls took over a second, including 81 of 206 pulls — 39% of the core verb.
- Correcting three lines of a 207-row register cost resending all 207 rows, twice.
- Seven refusals were wrong argument names on tools that disagree with each other.

WHY IT IS WORTH HAVING RATHER THAN ENDURING: the tax compounds. Every iteration after this one pays it on every call, and it is paid in the scarcest thing the system has. i34 spent a day producing a result that its own retro traced to one omission.

THE GOAL IS ALREADY A STANDING PROMISE. vp-rigor-without-toil is not invented here; it is the promise the field report says is failing.

## prior_art_positioned

### Against what exists, with both sides named

FORMAL REVIEW — NASA NPR 7123.1. A review completes when agreement exists on the DISPOSITION of every Review Item Discrepancy, together with a plan to address them. NOT when every finding is fixed. What it does better than ours: a review can close with open work, honestly, so a finding never has to choose between blocking everything and being forgotten. What ours sheds: nothing yet — we demand resolution where the standard demands disposition, and this iteration adopts their shape.

INCREMENTAL BUILD — Bazel and Shake. Both implement EARLY CUTOFF: when a task's result is unchanged, dependents are not re-executed. Both hash content rather than trusting timestamps. What they do better: decades of tuning and a cache that survives across machines. What ours already matches: our ripple does both, which is why four greyed states recovered in a single pull today with nothing re-done. THIS COMPARISON DISCONFIRMED A SUSPICION rather than supporting one — the greying tree was assumed to be the waste and is not, so it left scope.

AGENT RUNTIMES — speculative tool execution. Current work, reported 2-5x latency gains, explicitly modelled on CPU branch prediction. What it does better: it hides latency our pull cannot hide today. What we shed by declining it now: those gains, deliberately, because speculation hides work rather than removing it and a fat payload speculated faster is still fat.

### Against what failed, and the failure is ours

THE RESOLUTION SEAM WAS FIXED TWO OR THREE TIMES AND RECURRED EVERY TIME. i34's own decision node rejected fixing it again "on evidence rather than taste", and recorded that it recurred while that iteration was being entered. i34 deleted it instead, and that worked.

THE LESSON THIS BUNDLE TAKES FROM THAT: prefer removing the thing that costs to tuning it. Every item here removes a call or a payload rather than making one cleverer. The one exception is the bucket, which adds a path — and it is the one carrying a fatal risk entry.

## success_measurable

EVERY PASS LINE HAS A BASELINE MEASURED ON 2026-08-16, so success is a comparison rather than an opinion.

- TEST CALLS PER VERDICT: baseline 494 calls for 66 verdicts, about 7.5 to 1. PASS: at or near 1 to 1, because a blocking call answers once.
- FULL BATTERIES PER ITERATION: baseline 5, all agent-initiated. PASS: at most 2, both engine-initiated, which is what M7_50 and fix-findings already specify.
- PULLS OVER ONE SECOND: baseline 81 of 206, 39%. PASS: the share falls, and no pull answer exceeds the bound that forces a spill to disk.
- CALLS PER STATE: baseline to be taken before the trim lands. PASS: it falls. THIS IS THE ONE THAT CATCHES A BAD TRIM — bytes per pull drops whether the trim was right or wrong, so bytes cannot be the measure. raid-risk-a-trimmed-payload-costs-a-second-call carries it.
- AMEND PAYLOAD: baseline 207 rows resent to change 3. PASS: a correction sends what changed.
- ARGUMENT-NAME REFUSALS: baseline 7 in one day. PASS: zero, because the names agree.
- ORPHANS CAUGHT AT DELETE TIME: baseline 0 of 4 — all four of i34's orphanings surfaced states later through a coverage law. PASS: named at the delete.
- OWED ITEMS USED AT ALL: baseline 0 in a whole iteration. PASS: a finding that breaks nothing can be carried, and the close still refuses while one stands.

WHAT HAS NO PASS LINE, said rather than left blank: the two mirror buttons. Whether a freeze button stops the walk being pushed past a rule-9 boundary is judged by the owner using it, not by a number.

## risks_logged

FOUR ENTRIES, EACH WITH AN OWNER AND A TRIGGER THAT NAMES A STATE.

- raid-risk-an-owed-item-without-a-guard-ships-a-known-defect — fatal, the adjudicator's, and it is the goal conflict made concrete. Returns at write-requirements as a demand.
- raid-dec-blocking-and-the-battery-refusal-ship-together — decided, with its rejected options on the record. Returns at specify-build. The owner's own submit-gated-tests idea is listed as a loser LEFT STANDING rather than ruled out.
- raid-asm-the-bundles-defect-list-still-stands — an assumption with a probe already half-run. Returns at frame-delta, which has now returned ten of twenty-four.
- raid-risk-a-trimmed-payload-costs-a-second-call — the headline fix reversing its own goal, with the measure that would catch it.

NONE IS DEFERRED TO A LATER ITERATION. All four belong to this one, which is what makes them risks rather than backlog.

## round_0_verify

- evidence vs claims: Every number in this gate was read from the call log this session, not recalled. Two claims made earlier in the session were CORRECTED after checking: that narration cost 25% of calls (it piggybacks and costs none — the log records carry `via` and duration 0), and that the gate demands a fresh battery after an edit (nothing demands it; M7_50 says the engine owns the battery). Both corrections are recorded rather than quietly dropped.
- types: Green at rest, preflight exit 0, unchanged since i34 shipped.
- lint: Green at rest, biome over 245 files.
- tests: Green at rest, 1299 of 1299. No battery was run for this gate and none was owed — the tree has not changed, and running one would be the exact behaviour this iteration exists to stop.

## round_1_validate

- exercised against the goal: The goal is pace and every scoped item carries a measured baseline. The scope was cut by that measurement rather than by taste — the greying tree left scope because the check DISCONFIRMED it, which is the test that the measurement was doing work.
- missing: Fourteen of the twenty-four named defects are unchecked. They are scoped as a CHECK, not a fix, with the rule that anything already done is struck with its evidence.
- wrong: Nothing built yet. The known error in the framing is that ten items were settled by observation rather than by a deliberate read, so a wrong recollection would pass. Each is cited to something that happened in this session's log.
- out of scope: Seven exclusions, each naming where the work went. The load-bearing one is the rule that a defect found by the audit outside this surface is RECORDED rather than fixed — without it the bundle never closes.
- prior art: Answered in full at prior_art_positioned, with both sides named for three comparisons and our own failed attempts as the fourth. The seam is the one that matters: fixed two or three times, recurring every time, deleted instead and that worked.

## round_2_red_team

- STEELMAN: this is process work dressed as product work, and the product gains nothing => The strongest case: a reader looking for a feature finds none, no story gets better, no promise is newly kept. An iteration that only makes the builder faster is the builder serving itself. What defeats it is that the builder IS the product here — vp-rigor-without-toil is a standing promise to whoever uses this system, and the field report says it is failing. But the case is real enough that it belongs in the record rather than in a footnote.
- KILL-CRITERION: calls per state RISES after the trim ships => That would make this the wrong call, and the mechanism is plausible: a pull trimmed of something needed costs a second call. It is a logged risk with the measure that catches it, and bytes per pull is explicitly rejected as the metric because it improves either way.
- The scope was chosen by the agent whose waste it measures => True, and it is the weakest part of this gate. Every number was gathered by the same agent. The owner's field report is the only outside evidence, and it agreed independently and BEFORE seeing the numbers.
- Ten items settled "from observation" is a euphemism for recollection => Fair, and the honest answer is that each is tied to something in this session's log rather than to memory: a refusal at this iteration's own kickoff, a form response, a task notification. The fourteen unchecked are marked unchecked rather than guessed at.
- The bundle grew by ten items in an hour and will grow again => The real threat to closing it. The non-goals carry the guard: an audit finding outside the scoped surface is recorded, not fixed. Whether that guard holds is a question for the implementation gate, not this one.

## raid_additions

- none

## verdict

pass — the problem is measured, the goal is a standing promise rather than a new one, and the one comparison that could have killed the scope was run and did kill part of it

WHAT EARNS IT. The delta is not argued from taste. 2,850 calls with 7% building, reported independently by the owner from outside the machine before any of it was counted. Every pass line has a baseline, so the iteration can be judged rather than believed.

THE CHECK THAT MAKES THE REST CREDIBLE: the greying tree was the obvious culprit and it was removed from scope, because comparing against Bazel and Shake showed our ripple already does early cutoff and content hashing. A scope that survives its own disconfirming check is worth more than one that was never tested.

WHY NOT AN OVERRIDE. Nothing is being waved through. The two things that could have been assumed away are instead routed: the stale list to an assumption with a probe, and the bucket's guard to a demand at write-requirements.

THE DISSENT WORTH CARRYING FORWARD, from round 2: this iteration adds nothing a reader would call a feature. That is what a minor of this kind is, and it should be said plainly at the release rather than dressed up.

## follow_up

M2 IS NEXT and the vision is now axiomatic — nothing downstream re-argues it.

WRITE-REQUIREMENTS CARRIES ONE DEMAND THIS GATE RULED: an owed disposition names an OPEN raid entry with an owner. Without that row the bucket is a way to ship known defects, and contract rule 4 should win instead.

SPECIFY-BUILD CARRIES ONE PAIRING THIS GATE RULED: se_test blocking and the full-battery refusal land in the same build step. The first alone makes the measured problem worse.

DRAW-CONTEXT CARRIES THE BINDING EXCLUSION LIST. The non-goals cut at M1 are vision-level by this state's own rule.

THE AUDIT CONTINUES AT THE BUILD, fourteen items outstanding, struck with evidence where already fixed.

## anything_else

