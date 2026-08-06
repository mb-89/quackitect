---
id: req-every-finding-ruled-at-close
type: "[[requirement]]"
statement: "While any finding stands without a recorded ruling, the engine shall refuse the close."
kind: functional
verify_method: test
breaks_if_removed: "Findings default to dropped at close, and what the record learned is lost the day it ends."
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record step 3
  - uc-close-a-record step 4
  - uc-close-a-record ext 2a
  - uc-close-a-record ext 3a
  - uc-close-a-record ext 4a
  - ".se/req-mine-sebots.md: rejections need memory"
priority: must
---

## Detail

## Detail

| ruling | carries | refused when |
| --- | --- | --- |
| applied | where the finding landed | the landing reference is absent |
| dismissed | the reason it was rejected | the reason is absent |
| deferred | a note carrying the condition that brings it back | the note or the condition is absent |

- No ruling is a default. Each is an explicit act, recorded with its actor.
- The deferred ruling's note closes the finding here. The condition says what brings it back.
- Zero findings: the close proceeds without the ruling step, and the empty report is archived as the claim.
