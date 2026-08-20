---
form: derive-functions
reopened: "2026-08-20T07:23:34.047Z — a feeder re-signed above it after the v3 merge moved the rigor matrix and the M6 spikes moved the winner"
by: agent
signed_off: 2026-08-20T07:23:35.990Z
authors: agent
files:
---

# Evidence form / derive-functions

## current_situation

i37 stands at derive-functions, the second work state of M3. Six requirements are signed.

One thing changed since gate-inputs and it is the biggest news in the iteration. The fatal rewind assumption was probed and HOLDS: `project/spec/trace` at 5f85977f^ contains zero files naming i33, against 60 today, with a control search for i15 returning 123 matches at the same ref.

Eight functions and seven flows are derived here, in one cluster.

## functions

- [[fn-the-benchmark-run.choose-the-iteration-to-re-walk]]
- [[fn-the-benchmark-run.locate-the-rewind-point]]
- [[fn-the-benchmark-run.stand-a-throwaway-tree-and-bind-the-run]]
- [[fn-the-benchmark-run.refuse-what-the-rewind-point-cannot-reach]]
- [[fn-the-benchmark-run.conceal-the-benchmark-history-for-the-length-of-a-run]]
- [[fn-the-benchmark-run.derive-what-the-walk-cost]]
- [[fn-the-benchmark-run.state-the-conditions-of-the-run]]
- [[fn-the-benchmark-run.fill-the-report-and-say-where-the-run-stopped]]

## flows

- [[flow-benchmark-request]]
- [[flow-chosen-iteration]]
- [[flow-rewind-point]]
- [[flow-bound-run]]
- [[flow-walk-cost]]
- [[flow-run-conditions]]
- [[flow-benchmark-report]]

## neutrality

THE CHECK NO MECHANISM CATCHES: does any function name a solution rather than a job.

WHAT WAS CAUGHT AND REWRITTEN. `locate-the-rewind-point` first read as "read the commit message that carries the iteration id". That is HOW it is found today, not WHAT is wanted. The statement now says find the commit before the chosen iteration started, and the commit-message trick sits in the rationale where a later design may replace it.

WHAT SURVIVES INSPECTION, one by one.
- choose-the-iteration-to-re-walk. A job. Says nothing about a verb, a flag or a folder layout.
- locate-the-rewind-point. A job, after the rewrite.
- stand-a-throwaway-tree-and-bind-the-run. Names a tree, and a tree is a solution word. It survives because the requirement it satisfies is about the real record being untouched, and the discardable tree is the only shape that demand has. This is the closest thing to a leak in the set and it is named rather than defended.
- refuse-what-the-rewind-point-cannot-reach. A job, and deliberately silent about git.
- conceal-the-benchmark-history-for-the-length-of-a-run. A job. Says nothing about lists, verbs or globs.
- derive-what-the-walk-cost. A job. The rationale says the call log already carries it; the statement does not.
- state-the-conditions-of-the-run. A job.
- fill-the-report-and-say-where-the-run-stopped. A job. Says nothing about templates or folders.

TWO SPLITS THAT LOOK LIKE PREMATURE DESIGN AND ARE NOT.
- Deriving the cost and stating the conditions are separate because they come from different places. One reads the log, one reads the environment. One can be right while the other is missing, and a report missing its conditions is not a result.
- The ceiling and the concealment are separate because they hide different things for different reasons. The ceiling hides the future of the walked iteration. The concealment hides the past of the instrument.

ONE JOIN THAT LOOKS LIKE UNDER-SPECIFICATION AND IS DELIBERATE. Two requirements share `refuse-what-the-rewind-point-cannot-reach` — what resolves, and what happens when the check cannot answer. They are one decision with two outcomes, and splitting them would let a build satisfy the happy path and leave the silent half to a later chunk.

CLOSURE. Every flow is produced by a function or crosses in. `flow-benchmark-request` crosses in, because a person asks and nothing here makes that. `flow-benchmark-report` crosses out and is also consumed by `choose-the-iteration-to-re-walk`, which is the cycling loop: the reports are the scheduler's only state.

## follow_up

- identify-assumptions is next, then probe-assumptions.
- THE ASSUMPTION PROBE IS ALREADY DONE AND RECORDED. The rewind premise holds, measured with a control, and the result is written into the register entry. probe-assumptions has that in hand rather than owed.
- The cycling loop — a function consuming the flow it does not produce — is the one closure oddity in the set. It is correct and it is worth a second look at decompose-structure.
- `stand-a-throwaway-tree-and-bind-the-run` carries the only solution word in the set. If M4 finds a shape that satisfies the record-untouched requirement without a separate tree, this statement should move.

## anything_else

THE PROBE THAT HOLDS ALMOST REPORTED THE OPPOSITE, and how it nearly went wrong belongs on the record rather than only in the result.

The first attempt read each of the 60 trace files individually at the rewind ref. Every one of those reads came back as an SE-C-040 toll refusal, and the classifier counted a refusal as "file present". It reported 60 of 60 present, which is a clean falsification of the iteration's central premise, and it was wrong.

THAT IS THE SECOND TIME IN THIS SESSION a refused or empty result was read as data. The first nearly put a false claim into the kickoff about which rigor-matrix rows are struck.

SO THE CONTROL IS PART OF THE RESULT, not a flourish. A search returning zero and a search that never ran look identical from the outside. Running the same search for i15 and getting 123 matches at the same ref is what makes the zero mean something.

THIS IS ALSO THE ITERATION'S OWN SUBJECT ARRIVING EARLY. A silent empty result reading as a true negative is exactly the kind of machine drag a benchmark run is meant to surface, and it has now cost this walk twice by hand.
