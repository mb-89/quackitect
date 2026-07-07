---
id: req-readout-width
type: requirement
statement: The bar and one-pager are a fixed 80 columns wide, emitted inside a fenced code block, with no chat/terminal width detection. Every rendered line is <=80 columns so nothing wraps.
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [delivery, operation]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
i0006 requirement under uc-bless-readout.
