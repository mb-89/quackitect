---
id: req-rejection-carries-its-reason
type: "[[requirement]]"
statement: When a person rejects a gate, the engine shall record the rejection with a reason naming what to redo.
kind: functional
verify_method: test
breaks_if_removed: The agent guesses at what failed and fixes the sentence rather than the artifact.
breaks_how_badly: corrosive
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate ext 3a
  - uc-adjudicate-a-gate ext 4a
  - uc-adjudicate-a-gate ext 5a
priority: should
---

## Detail

## Detail

- One line suffices: the round or artifact that failed, named.
- A round that asserts rather than shows is a legal reason on its own.
