---
id: req-mint-prefill
type: requirement
statement: When a node is minted, the engine shall fill every schema field with a proposed value and a one-line justification, so no field reaches the user blank - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a node is minted, the engine shall fill every schema field with its schema default or a derived proposal.
2. The engine shall stamp each pre-filled value with a one-line justification naming its source.
3. If a field has no schema default and no derivable proposal, then the engine shall fill it with an explicit TBD marker that the register counts.

## Rationale (not load-bearing)
The no-blank-fields drafting law (seed NOTE-20260711-141259-seed-onboarding-experience, fix 3):
never make a human recall what a machine can list. The justification line is what makes a veto
cheap - the user judges the source, not the value from scratch.
