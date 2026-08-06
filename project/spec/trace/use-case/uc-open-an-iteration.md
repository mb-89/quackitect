---
id: uc-open-an-iteration
type: "[[use-case]]"
statement: Open an iteration on an existing product and set the rigor its work deserves.
actor: stk-engineer-driving-agents
trigger: a seeded iteration is ready to start
precondition: the notes inbox is drained, and the product's standing baseline exists
guarantee: the iteration has its own state machine, compiled from a change size a person chose
refines:
  - sty-next-iteration
killer: true
---

## Main scenario

1. The person routes the walk into the seeded iteration.
2. Entering binds a worktree to the record and stamps it started.
3. The walk opens at the retro, because onboarding always does.
4. The agent proposes a change size with its reasoning, and names the cells a smaller column would strike.
5. The person chooses. The bless IS the choice.
6. The engine compiles the chosen column into this iteration's own state machine and pins it to the record.

## Extensions

- 3a. The inbox still has pending notes. The kickoff refuses until they are drained, and says so.
- 4a. The product has no standing baseline — this is its first iteration. The proposal is `product`, because the vision, the stakeholders and the baseline all have to be authored.
- 5a. The person rejects the proposal and names a different size. The engine compiles what they chose.
- 6a. The work outgrows the chosen column mid-walk. The escalation is visible and re-adjudicated, never silent.
