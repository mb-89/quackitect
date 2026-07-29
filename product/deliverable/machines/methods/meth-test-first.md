---
kind: method
statement: "Test-first with the battery law: author tests, observe RED, build to GREEN - discover once, fix batched, confirm once."
---

## Situation
M7's fixed sequence. Roles (test designer, tester, implementer) bind at seed; the engine gates outputs, never runs a role.

## Procedure
- Author an executable check for every requirement in scope; push toward mechanical wherever the verify_method allows; the irreducible residue stays review-class.
- Observe RED: every new check runs and FAILS before the build - recorded, last before the code lands. A check green with no realized design is suspect.
- Build to GREEN against checks and requirements; tidy while green; a design-level refactor is refine work, not build work.
- Mid-build: run ONLY the targeted checks the change touches. The FULL battery runs at ONE place - the verification state at the gate.
- Battery law: the battery discovers ONCE; collect every finding; fix them all in one pass; ONE confirm run. A fix-one-rerun-one loop burns a battery per finding - the over-checking failure mode.

## Sources
TDD red-green; v1's shared implementation fragment and the battery owner-law.
