---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-two-hands-writing-work-at-once-do-not-collide
fitness_candidate: true
type: "[[requirement]]"
statement: When two hands add or settle work at the same time, the engine shall land both changes without a person resolving either against the other.
kind: quality
verify_method: test
breaks_if_removed: Every piece of work becomes a place two writers can conflict. The system stays usable while one hand walks it and starts costing hand-resolution the moment a second one does, which is exactly when the cost is hardest to pay.
breaks_how_badly: corrosive
refines:
  - uc-work-a-states-work-tokens-to-completion
source_refs:
  - opt-work-is-a-file-in-the-working-tree
  - opt-work-state-is-replayed-from-an-append-only-change-log
  - "prior art 2026-08-26: Fossil replays an immutable change log so two clones merge without conflict, and names clock skew as its price"
  - "prior art 2026-08-26: git-bug stores issues as git objects rather than files, for the same reason"
  - "scoring 2026-08-26: no axis measured the merge surface, and it is the reason two shipped trackers refused the file shape"
priority: should
---

## Scenario

- source: two hands working the same record from separate clones
- stimulus: both add or settle work in the same position, without coordinating
- artifact: whatever holds the work, and the merge that brings the two together
- environment: any host, ordinary version control, no lock held
- response: both changes are present afterwards and neither hand is asked to choose
- response measure: merges needing a person to resolve work content = 0

## Detail

THE DEMAND IS ABOUT COLLISION, not about locking. A design meets it by making
concurrent writes commute, by making them touch different bytes, or by
resolving them without asking a person.

## Why the prior art makes this a real row

TWO SHIPPED TRACKERS REFUSED THE WORKING-TREE FILE and both wrote down why.

- FOSSIL replays an immutable change log in timestamp order, so two clones
  merge with no conflict at all. Its stated price is clock skew.
- GIT-BUG keeps issues as objects rather than files, for the same reason.

NEITHER OBJECTION REACHED THE CHART as a scored axis, because no requirement
stated the demand behind it.

## Why it is a should rather than a must

ONE HAND WALKS THIS SYSTEM TODAY, so nothing collides yet. The row prices a
cost that arrives with the second hand rather than one being paid now.

THAT IS ALSO WHY IT IS EASY TO MISS. A demand nobody is currently failing
looks like a demand nobody has.

## Where it came from

MINTED AFTER THE FACT. The prior-art finder found both refusals and recorded
them as options. The scoring agent then noticed that nothing measured the
dimension both refusals were about.

## What is verified

TWO WRITERS ADD WORK TO THE SAME POSITION from separate clones, and both
changes are present afterwards with no hand resolution.
