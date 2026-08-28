---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-drawn-value-declares-snapshot-or-live-reading
type: "[[requirement]]"
statement: If a piece of work carries a value the system drew from somewhere else, then the system shall refuse it until that work declares whether the value is a snapshot or a live reading.
kind: functional
verify_method: test
breaks_if_removed: A state that keeps noticing things can never close, so the only way to finish is to stop looking, and the completeness mechanism becomes a reason to work with your eyes shut.
breaks_how_badly: corrosive
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-take-a-step
source_refs:
  - raid-risk-a-drawn-token-that-reads-a-live-source-never-settles
  - "measured: the kickoff gate refused to sign twice and the onboarding retro reopened twice, all on a field drawn from the live notes inbox"
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

BOTH READINGS ARE HONEST AND THEY BEHAVE DIFFERENTLY.

| kind | when the value is taken | what a moved source does |
| --- | --- | --- |
| snapshot | once, when the question is answered | nothing — the work stays settled |
| live reading | on every ask | the work re-opens |

THE PROGRAM RUNS WHEN THE WORK IS ASKED FOR, never when it is minted.
Running at mint time answers a question nobody had yet, and the answer is
stale before it is read. Once it has answered, a snapshot settles and is not
asked again.

THIS ROW STANDS AGAINST req-bound-field-rebuilds-from-nodes, which demands a
bound field be rebuilt from its nodes on every look. That is the live
reading, and it is right for a field that means to be live. What this row
adds is that the field says which it is, so a snapshot stops being rebuilt.

A SETTLED SNAPSHOT NEVER RE-OPENS ON ITS OWN. If a moved source ought to
re-open it, that is a dependency somebody wrote down, not a side effect of
asking.

WHAT WAS MEASURED, ON THE MACHINE THIS ROUND REDESIGNS. Each refusal
followed the capture of a note during the walk, because the field listing
what happened to each pending note is drawn live rather than answered once.
Clearing it cost a round trip every time, and the retro had to be reopened,
worked and re-signed before the gate could stamp.
