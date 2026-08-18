---
form: goals-bind-the-walk
by: agent
signed_off: 2026-08-17T13:38:47.952Z
authors: agent
files: null
---

# Evidence form / goals-bind-the-walk

## current_situation

This chunk is BUILT and green. It was built during the redo rather than in chunk order, because the owner's demand that the build be checked against the iteration's goal is what created the chunk in the first place.

THE CHUNK EXISTS BECAUSE THE FIRST FOUR DID NOT COVER ANY MILESTONE. That is the drift this iteration walked into, and it is now visible in the build plan itself.

## built

THE GOALS ARE A LIST ON THE KICKOFF, and every gate below measures what it produced against each.

WHAT LANDED, by file:

- machines/rigor_matrix/rows/M0_90_gate-kickoff.md: the `goal` field became `goals` with template `list`, plus a guidance section carrying three rules — engine improvements is a standing goal, more than half a dozen means split the iteration, and the count informs the column.
- engine/machine.ts: `goals_served` joined STANDARD_ROUNDS as a required per-item field over `$goals`, and `roundsFor` holds the one exemption. The kickoff DEFINES the goals, so asking what it produced for each is circular.
- engine/stateform.ts: `$goals` resolves from the kickoff's own evidence file, out of the evidence folder the field already receives. Only list lines count, so framing prose beside the list cannot become a phantom row in every gate. Two source tables replaced a sixteen-branch chain that had hit the complexity ceiling.
- engine/rigor-matrix.ts and engine/machines/compile.ts: both compilers call `roundsFor`. That split is not hypothetical — the rounds themselves once lived in one compiler and reached half the gates.
- machines/methods/meth-review-rounds.md: the round is doctrine now, as round 3.

THE RIPPLE HALF, all in engine/session.ts, because an upstream edit must grey what stands on it:

- the compare is TIME as well as colour. A form resubmitted through the pull unsigns and re-signs inside one call, so the feeder is green again before anything downstream looks. A claim signed before its feeder's current signature answered older ground.
- the bless falls with the green. blessedGates reads the green set rather than the file, so a thumbs-up stops painting over work that fell out from under it. It takes the caller's already-computed paint set, because render.ts computes it one line above and a second full pass over the same corpus is the shape this iteration exists to remove.
- an amend counts as freshly as a signature. Without it the ripple had no cheap exit, and se_reopen — which drops the whole tree and every bless — would be the only way out of a typo upstream.
- se_why names the newer feeder instead of answering that a fallen claim stands.

VERIFIED: 1399 tests, 0 failures, sweep green over 1200 nodes. tests/drift.test.ts carries the new case — a stale claim loses both its green and its thumbs-up, and an amend re-freshens it while the original signature stays untouched.

PROVEN LIVE, WHICH IS THE PART THAT MATTERS. Before the change, editing the kickoff let the walk run thirteen states straight through two gates. After it, the walk stops at the first state below the kickoff and every claim under it is re-earned.

## follow_up

TWO THINGS COME OUT OF THIS CHUNK for the states below.

UNSTICKING A GREYED CHAIN IS HAND WORK TODAY. Editing the kickoff greys every claim below it, which is correct, but getting them green again took ten amends walked down in order. An amend refuses to change nothing, so a claim that genuinely still stands has no edit to make and one must be invented. Captured as note-5aeda2a86ceb; the owner asked for one act that re-freshens a whole chain.

THE ENGINE HAS NO SCOPED TEST MAPPING. Every run this session chose the full battery, and se_test said why: sixty-eight changed files have no test that answers for them, and all of them are engine files. So the scoped run is unreachable for exactly the work that happens most.

## anything_else

