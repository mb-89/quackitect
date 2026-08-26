---
form: generalize-use-cases
by: agent
signed_off: 2026-08-21T08:59:56.965Z
authors: agent
files: null
---

# Evidence form / generalize-use-cases

## current_situation

Three stories are written and one resident story now points at its sibling.

This state generalises each pass into its Cockburn form. Three use cases, one per story, each with the branches that can happen.

Coverage is computed by the engine in both directions and is not restated here.

## use_cases

- [[uc-leave-a-state-whose-check-is-still-running]]
- [[uc-report-every-piece-of-work-out-of-sight]]
- [[uc-choose-which-tests-answer-a-question]]

## follow_up

The inputs gate comes next, and it reads the boundary, the roles, the stories and these use cases together.

One extension is worth carrying to the design rather than leaving in a node. Extension 7a of the first use case says a verdict whose ground moved while it was running is stale and the program runs again. Nothing decides today how staleness is detected, and the design owes that.

## anything_else

THE EXTENSIONS ARE WHERE THIS STATE EARNED ITS COST, and three of them found holes the stories could not.

EXTENSION 3a AND 3b OF THE REPORT. A piece of work that cannot say what it has left, and a machine with no measurement to compute against, get the same answer: the entry says it cannot estimate. Writing them separately and finding they collapse is what proves the honesty rule is one rule rather than two special cases.

EXTENSION 6a OF THE REPORT IS NEW HERE. A figure that does not move between two asks is a fact about the work. Reporting the same number twice in silence looks identical to a working estimate, and the story never asked what that case does.

EXTENSION 7a OF THE FIRST USE CASE IS THE UNCOMFORTABLE ONE. A recorded verdict whose ground moved while the program ran is stale. Today the question cannot arise, because nothing runs while the walk moves. It arises the moment a verdict outlives its call, and nothing in the packet says how staleness is detected.

NO UI MECHANICS IN ANY OF THE THREE. None names a verb, a flag or a screen. Each survives a rewrite of the surface it is reached through, which is the test the method sets.

THE STEP COUNTS SIT INSIDE THE BOUND. Seven, six and four numbered steps. None reaches nine, so none is two use cases wearing one name.

WHY THREE RATHER THAN TWO. The first two are one design and were tempting to merge. They have different actors' goals: leaving a state, and learning what is running. A merged use case would have had two guarantees, which is the test for splitting.
