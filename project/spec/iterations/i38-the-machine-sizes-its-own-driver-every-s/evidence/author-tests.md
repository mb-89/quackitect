---
form: author-tests
by: agent
signed_off: 2026-08-20T19:44:59.628Z
reopened: "2026-08-20T19:44:57.891Z — this form says ten requirements land in five specs. It signed with eleven in six: the engine's coverage check named req-a-machine-decision-repeats, which neither of this iteration's passes carries, and a sixth spec was written for it."
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

M6 is blessed. The design is declared, the spikes are folded, and this state is where the build's checks are written before any of it exists.

ELEVEN REQUIREMENTS ARE IN SCOPE and they land in six specs. Nine ask for a test and two ask for an inspection, and the split is the requirements' own `verify_method` rather than a choice made here.

THE ELEVENTH WAS FOUND BY THE ENGINE AND NOT BY ME. `req-a-machine-decision-repeats` is a quality row refining `uc-quality-reliability`, so it is in neither of this iteration's two passes and a sweep of the passes misses it. The coverage check reads the REQUIREMENT SET, which is the right side to read from, and it named the row on the first submit.

### Why the repeatability row needed a spec of its own

`tsp-a-step-is-sized-from-its-own-rows` asserts WHAT the block answers for a given input. Repeatability is a property of the ANSWERING rather than of any answer, and the two fail independently: a block can be right once and unstable, or stable and mute.

THE ROW ALSO CARRIES A SECOND HALF that would have been lost in a group — the engine records what it read. Under the declared architecture that half is discharged by a field the design already carries: the published pair IS the input and the rung IS the decision, and they go out together.

### Why five and not ten

ONE SPEC, ONE VERIFICATION CONCERN. Three rows decide what comes out of the sizing block for a given input, and they fail together: a row with no value, a unit reduced too weakly, and a rung nothing maps. Four rows are the call record's coordinates and the reader of them, and `req-every-call-records-the-state-it-was-made-in` already binds them as a set — every coordinate or none.

TWO ROWS GET SPECS OF THEIR OWN AND FOR OPPOSITE REASONS. The live-read rule is graded fatal, guards three open records, and is the one test the build owes first — it is not buried in a group. The publish-and-start-nothing rule is the line the whole design rests on and its claim is an ABSENCE over all paths, which no group of positive assertions covers.

### The two inspections are declared as the weaker instrument

NEITHER IS AN INSPECTION BY PREFERENCE. Host independence wants three machines the build does not have; a test would prove the answer on the host that ran it and the requirement is about every supported host. An absence over all spawn paths cannot be established by sampling paths.

BOTH SAY SO ON THEIR OWN FACES rather than presenting a reading as equivalent to a run.

### What no spec claims

WHETHER A DECLARED DIFFICULTY IS CORRECT. `exp-two-hands-rating-the-same-six-cells` measured two readers agreeing on five of six cells, which is evidence about the rating ACT and not about any row. No test asserts a judgement is right.

WHETHER A SELF-REPORTED VALUE IS TRUE. Two of the three call coordinates can only come from the caller. The requirements demand the record MARK them as claimed; the specs assert the mark and nothing more.

## checks

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-a-call-record-carries-who-where-and-which-hand]] | test | req-every-call-records-the-model-that-answered-it · req-every-call-records-the-state-it-was-made-in · req-every-call-records-the-part-its-caller-played · req-a-weaker-driver-than-named-owes-a-recorded-reason |
| [[tsp-a-complexity-never-enters-a-demand-ledger]] | test | req-the-complexity-value-is-read-live-and-never-pinned |
| [[tsp-a-step-is-sized-from-its-own-rows]] | test | req-every-matrix-row-declares-its-complexity · req-a-milestone-takes-the-maximum-complexity-over-its-rows · req-an-unmatched-rung-names-itself-and-publishes-no-driver |
| [[tsp-the-lane-publishes-a-strength-and-starts-nothing]] | inspection | req-the-machine-names-a-driver-and-starts-nothing |
| [[tsp-the-published-strength-is-the-same-on-every-host]] | inspection | req-one-model-list-is-read-live-from-the-repository |

## follow_up

THE ORDER IS NOT ALPHABETICAL AND ONE SPEC GOES FIRST. `tsp-a-complexity-never-enters-a-demand-ledger` is graded fatal, wants one assertion, and guards three records that are open right now. `observe-red` should write it before anything else, and its red is the cheapest one in the set.

ONE STEP IN THAT SPEC EXISTS ONLY TO KILL A FALSE GREEN. "A real change still moves the digest" asserts the digest is not frozen. Without it the two negative cases pass on a digest that never moves at all, and this record has already paid three times for a measurement that could not have returned anything else.

THE NEGATIVE CONTROL IN THE ATTRIBUTION SPEC IS THE SAME SHAPE and it comes from a mistake this iteration made. Grouping by a missing key returns one bucket, and so does grouping by any word at all — `group_by: "banana"` returns the same. The absence of the state coordinate is real and that measurement is not what establishes it.

THE RELAY CASE IS THE ONE THE BUILD IS MOST LIKELY TO SKIP. Filing work on behalf of a delegate and asserting the record carries the DELEGATE'S part is harder to write than asserting a field exists, and it is the case the whole coordinate is for. `raid-risk-a-relayed-judgment-is-filed-under-the-hand-that-relayed-it` stands at expected for exactly this reason.

NO SPEC COVERS THE MAINTENANCE OF THE MODEL LIST, and that is deliberate rather than missed. The fixed-list design rests on somebody keeping the list current, the role that would has no node, and there is no requirement to verify. It is carried as an issue and named here so a reader does not read five specs as full coverage of the design.

## anything_else

