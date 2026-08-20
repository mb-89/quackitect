---
minted_in: i1
id: tsp-decision-machinery
type: "[[test-spec]]"
statement: The choosing machinery stays closed until real alternatives stand, records the case against every loser, and treats none-chosen as a legal outcome, verified by test over the decision editors and laws.
method: test
verifies:
  - req-two-options-beyond-the-obvious
  - req-option-carries-cost-and-shed
  - req-choice-records-case-against-losers
  - req-choosing-none-is-legal
  - req-single-option-recorded-as-finding
  - req-problem-recorded-before-options
  - req-ideation-opens-no-record
files:
  - tests/pugh.test.ts
  - tests/pareto.test.ts
  - tests/compare.test.ts
  - tests/morphbox.test.ts
  - tests/catalogs.test.ts
  - tests/ideation.test.ts
---

## Scope

Divergence and convergence: the option pool's floor of two, the cost and
shed every option owes, the recorded reasoning against the unchosen, and
ideation's no-record law.

## Approach

Component level over minted option sets. Boundary design at the pool's
floor (one option, two, the incumbent restated). SIX of the seven claims
are DEFINED ahead of their cases — the ideation machine has no test file
yet; tests/ideation.test.ts is the planned home and lands with the
ideation build. What runs today: the fewer-than-two refusal, the prune
carrying its reason, and the morph chart's line-to-candidate laws.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps today: fewer than two candidates is a named
problem, never a winner; a prune lands on the option, carrying its
reason; a drawn line becomes a candidate note, with its picks. The
planned steps assert: options refused before a recorded problem, the
none-chosen outcome recorded with what has to change, and zero records
or commits from an open ideation.
