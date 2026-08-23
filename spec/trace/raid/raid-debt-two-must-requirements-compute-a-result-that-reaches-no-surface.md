---
minted_in: i36
id: raid-debt-two-must-requirements-compute-a-result-that-reaches-no-surface
type: "[[raid]]"
kind: debt
statement: The stopping-layer diagnosis and the recurring-failure-shape detector are built and tested, but no production path calls either, so neither requirement's promised report actually reaches anyone.
owner: the driving agent
trigger: the next iteration that opens the lane's reporting surfaces
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: Two must requirements read as met in the corpus and are not met in the running system, so a later reader trusts a diagnosis that is never produced.
source_refs:
  - spec/trace/requirement/req-interrupted-call-names-the-stopping-layer.md
  - spec/trace/requirement/req-repeated-failure-shape-becomes-durable-work.md
  - spec/trace/test-spec/tsp-interrupted-call-names-the-stopping-layer.md
  - spec/trace/test-spec/tsp-repeated-failure-shape-becomes-durable-work.md
last_looked: 2026-08-23
look_verdict: rescheduled
---

## Graded off the scale, corrected 2026-08-20

THIS ENTRY SAID \`how_likely: certain\`. THE SCALE OFFERS expected, plausible,
conceivable. \`deliverable/engine/bin/grades-complete.ts\` refuses the
whole register while any entry sits outside it, and it refused at
\`rank-unknowns\`' exit — which is the first state that runs it.

\`expected\` IS THE HIGHEST THE SCALE HAS and it is what this entry now carries.

WHAT "CERTAIN" WAS TRYING TO SAY, and the scale cannot hold it: this is not
something that MIGHT happen. It is a consequence the design chooses. A likelihood
scale measures whether a thing occurs; it has no value for a thing that is true
by construction.

THE DISTINCTION IS REAL AND BELONGS SOMEWHERE ELSE. A consequence a design
accepts is a decision's cost, recorded on the decision. A risk is something that
might realise. Writing "certain" onto a likelihood field collapses the two, and
four entries in this record did it independently — which is a vocabulary gap
rather than four mistakes.

## What is owed

TWO MODULES COMPUTE AN ANSWER AND HAND IT TO NOBODY. A search for their
exported functions across `deliverable/**` finds the module and its
own test file, and nothing else.

- `engine/stopping-layer.ts` returns a diagnosis. Nothing asks for one.
- `engine/failure-shapes.ts` returns a work statement. Nothing mints it.

THE TESTS ARE IN THE WRONG PLACE TOO, and both test-specs say so in as many
words. Each declares LEVEL: integration and names existing files.

- `tsp-interrupted-call-names-the-stopping-layer` names `tests/stophook.test.ts`
  and `tests/ptyend.test.ts`. What was written is `tests/stopping-layer.test.ts`.
- `tsp-repeated-failure-shape-becomes-durable-work` names `tests/bucket.test.ts`
  and `tests/pool-mint.test.ts`. What was written is `tests/failure-shapes.test.ts`.

TWO SIBLING MODULES ARE NOT IN THIS DEBT. `cage-inventory.ts` and
`payload-limit.ts` also have no production caller, and that is correct: each
is a guard whose test IS the product, reading the shipped cage file and the
shipped guidance corpus and failing the battery when either drifts.

## The contradiction that has to be settled first

`tsp-interrupted-call-names-the-stopping-layer` lists as a step: "A call
cancelled by the host reports the host."

`engine/stopping-layer.ts` says the opposite at its tail: the host is the one
layer nothing observes, so returning it would be inference dressed as
evidence. `host` sits in the type union and no branch produces it.

ONE OF THE TWO MUST MOVE. Either the spec drops that step and the requirement
says four layers where one is structurally unobservable, or the design finds
an observation that evidences a host cancellation. This is a requirement
decision and it is why the gap was not closed inside i36.

## Repayment

- Settle the host contradiction at the requirement, not in the code.
- Give the stopping-layer diagnosis a surface an engineer can reach.
- Make a recurring failure shape actually mint durable work.
- Move both sets of cases into the integration files the test-specs name, and
  delete the component files that stood in for them.

## How it got past the machine

`trace-design` checks that design specs claim their files, and the files
exist. `verification` checks that the tests are green, and they are. Neither
check follows a call graph, so a module that only its own test imports looks
exactly like a wired one. That blind spot is the retro's to consider.

## Swept 2026-08-20, at the standalone retro after i37 shipped

RE-AFFIRMED AS STANDING, trigger unchanged. i37 did not touch what this entry
is about, so nothing here moved.

THE LOOK IS THE POINT. A debt nobody re-reads is a lie in the ledger, and this
line is the evidence that somebody read it on this date.

