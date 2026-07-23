---
id: se.meth-cockburn-use-case
kind: method
statement: "Cockburn-shape use cases: user-goal level, one actor one goal, 3-9 main steps, extensions branch from numbered steps - requirements derive from steps and extensions."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
---

## Situation
M2: use cases GENERALIZE the stories (edge: generalizes). Where a story is one concrete pass, the use case is every pass.

## Form
- Header: scope; level (user-goal); trigger; preconditions; success guarantee + minimal guarantee; frequency.
- Main scenario: 3-9 numbered steps. Extensions: branch from step numbers (3a, 3b).
- Verb+goal names. NO user-interface mechanics - the use case survives a UI rewrite.

## Procedure
- One actor, one goal per use case; a second goal is a second use case.
- Every story maps into a scenario path; every extension is a candidate example.
- M3 derives requirements from the steps and extensions - a step no requirement covers is a hole, visible in the matrix.

## Sources
Cockburn, Writing Effective Use Cases; SyA RE deck.
