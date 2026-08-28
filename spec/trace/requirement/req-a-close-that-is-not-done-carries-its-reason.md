---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-close-that-is-not-done-carries-its-reason
type: "[[requirement]]"
statement: When a piece of work is closed at a terminal status other than done, the system shall refuse the close until a stated reason stands on that work.
kind: functional
verify_method: test
breaks_if_removed: Skipping and doing become indistinguishable on the record, so the guarantee that nothing is walked past in silence holds for the surface and not for the archive.
breaks_how_badly: corrosive
refines:
  - uc-work-a-states-work-tokens-to-completion
source_refs:
  - uc-work-a-states-work-tokens-to-completion extensions 7a and 7b
  - raid-dec-completeness-beats-flow-at-a-position-boundary
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

ONLY A SUCCESSFUL CLOSE IS TRIVIAL TO WRITE. Every other one is a decision
somebody made, and the reason is the whole record of it.

| terminal status | what the reason has to say |
| --- | --- |
| done | nothing beyond the evidence the work already carries |
| rejected | why the thing asked for is not wanted |
| skipped | why it was passed over, and by whom |
| cancelled | what made it stop mattering |
| duplicate | which piece of work it duplicates, by reference |

A DUPLICATE CLOSE POINTS AT ITS TWIN. A reason saying only "duplicate" sends
the next reader hunting, which is most of the way back to no reason at all.
