---
id: req-battery-is-earned
type: "[[requirement]]"
statement: "The engine shall refuse a full-battery run outside the states that earn it and name the scoped lane in the refusal."
kind: functional
verify_method: test
breaks_if_removed: "The battery runs on reassurance anywhere; the land run stops meaning anything."
refines:
  - uc-land-work-on-trunk
  - uc-let-the-system-catch-up
  - uc-answer-a-question-with-tests
source_refs:
  - uc-land-work-on-trunk ext 3b
  - uc-let-the-system-catch-up step 5
  - ".se/req-mine-v1.md: tests and the battery"
  - ".se/req-mine-v2.md: spec discipline"
  - uc-answer-a-question-with-tests ext 6b
priority: should
---

## Detail

## Detail

The states that earn the full battery:

| earning state | source |
| --- | --- |
| the land gate | uc-land-work-on-trunk ext 3b |
| the overhaul close | uc-let-the-system-catch-up step 5 |

A run asked for anywhere else is refused, and the refusal names the scoped test lane.
