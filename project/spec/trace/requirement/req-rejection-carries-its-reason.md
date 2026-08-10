---
id: req-rejection-carries-its-reason
type: "[[requirement]]"
statement: When a person rejects a gate, the engine shall record the rejection with a reason naming what to redo.
kind: functional
verify_method: test
verified_by:
  - "tests/claimops.test.ts :: a reopen with no reason is refused, because it throws away accepted work"
  - "tests/claimops.test.ts :: a reopen greys the claim and keeps its signature"
breaks_if_removed: The agent guesses at what failed and fixes the sentence rather than the artifact.
breaks_how_badly: corrosive
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate ext 3a
  - uc-adjudicate-a-gate ext 4a
  - uc-adjudicate-a-gate ext 5a
priority: should
weighs_against:
  - req-reject-names-the-redo >
---

## Detail

## Detail

- One line suffices: the round or artifact that failed, named.
- A round that asserts rather than shows is a legal reason on its own.
