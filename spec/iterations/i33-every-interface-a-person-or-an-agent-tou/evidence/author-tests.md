---
form: author-tests
by: agent
signed_off: 2026-08-17T16:57:27.624Z
reopened: 2026-08-17T16:56:41.396Z — decompose-structure re-signed above it, and the register gained an eighth row whose verify_method is test. Every requirement must be verified by at least one spec, so this state owes a new test-spec rather than a recheck.
amended: 2026-08-17T17:20:06.265Z by agent — The requirements-by-method count read five where the specs' own verifies lists cover seven by test. The spec count was updated on the last pass and the requirement count was not. Found by a fresh-eyes tester counting the lists rather than reading the sentence.
authors: agent
files: null
---

# Evidence form / author-tests

## current_situation

SIX SPECS, one per verification collection, each naming the requirements it verifies rather than restating them.

RE-READ FIVE TIMES SINCE, and a reading changes no verification method. Three were authored on the first pass, two on the redo against the kickoff's goals, and the sixth today when the register gained its eighth row.

tsp-one-operation-reads-its-input-once IS ALREADY GREEN. Its case measures the door's own meter rather than a stopwatch, and asserts a SHAPE: a second ask inside one pass costs zero. A tuned latency bound would have gone green when stamping took one ask from 312.9 ms to 4.3 ms, while the sixty-six asks per record entry stayed exactly where they were.

tsp-a-breached-bound-reaches-a-reviewer DEFINES ITS CLAIM AHEAD OF ITS CASE, the way tsp-claims-and-drift does for the panel naming a fallen condition. Its row says "every instrumented interface" and the interfaces are not nodes yet. That is milestone one, which is why the scope puts the milestones in a forced order — there is no denominator to enumerate against until they exist, and a case written now would assert against a hand-typed list or assert nothing. THE DEPENDENCY IS NAMED IN THE SPEC rather than left for somebody to hit at the build.

tsp-an-amend-leaves-the-tree-standing IS GREEN AND ITS FIXTURE IS THE FINDING. It signs a WHOLE CHAIN rather than one state, because the amend tests that already stood signed exactly one and asserted the amended claim was still green. That assertion never broke when the rule was built backwards. What broke was everything below it, and a one-state fixture cannot tell "leaves the tree standing" from "has no tree".

TEST-FIRST WAS TAKEN LITERALLY. Two test files were written before any build, and four of their six cases are RED on purpose. The build realizes the specs; the specs did not wait for the build.

THE SPLIT BY METHOD IS FORCED, not chosen. SEVEN requirements verify by test and one by demonstration, and a spec's method must equal the verify_method of every requirement it names — so the demonstration row gets its own spec with `files: none`. THE FIGURE READ FIVE UNTIL A FRESH-EYES TESTER COUNTED THE verifies LISTS: six specs cover eight requirements between them, because tsp-a-control-is-legible alone verifies three. This form updated its SPEC count to six on the last pass and left the REQUIREMENT count at the old figure, which is the same drift it exists to catch one layer down.

## checks

- tsp-a-control-is-legible
- tsp-work-past-its-bound-signals
- tsp-a-slow-signal-keeps-the-wait
- tsp-one-operation-reads-its-input-once
- tsp-a-breached-bound-reaches-a-reviewer
- tsp-an-amend-leaves-the-tree-standing

## follow_up

observe-red RECORDS WHICH FAIL, and four of six are expected to.

RED ON PURPOSE, each stating a demand the build has not met:

- a locked notch names the notch that unlocks it — today the title says "unlock the rung below first" and never names which.
- a bank handed no position is distinguishable from one sitting at zero — today `v.stop_at ?? 0` makes them identical.
- a running operation past its bound is named on the panel — nothing carries one there.
- the running signal does not take the panel over — the non-intrusive half, red for the same reason.

GREEN, AND ONE OF THEM MATTERS BEYOND ITS SUBJECT. `the notch above the current one is reachable, never locked` is the regression guard for an elimination: the stop-at probe proved the rung rule sound at bless, which is what pushed that search past params.ts. If it ever goes red the elimination was wrong and the search restarts there.

ONE SPEC WILL NOT RUN IN ANY BATTERY. tsp-a-slow-signal-keeps-the-wait is a demonstration with people watched side by side, nobody has scheduled it, and its own text says so rather than leaving a blank. It is why its requirement is graded should.

WHAT THE BUILD OWES, in the order the specs name it: name the unlocking notch in a locked rung's title, make an absent bank position distinguishable from a deliberate zero, and carry a running operation onto the panel beside what is already there.

## anything_else

