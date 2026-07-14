---
id: uc-work-register
type: usecase
statement: The user works the hand-off page instead of authoring forms - decisions arrive as proposals with defaults, bless accepts, reopen dissents - so a filling session is vetoing proposals, never writing into blanks.
class: domain
killer: true
---
## Rationale (not load-bearing)
The blank-template problem (seed NOTE-20260711-141259-seed-onboarding-experience): slot-count x
node-count presented flat is hundreds of undifferentiated authoring decisions. The hand-off vision
(seed NOTE-20260711-141259-seed-html-register-vision, né register; adr-handoff-html) inverts it:
the agent proposes everything, the page says where judgment is owed, and the bless records it.
This use case is the iteration's reason.
