---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-stray-captured-in-one-call
type: "[[requirement]]"
statement: The engine shall capture a stray finding in one call carrying the finder's own words, from any state, with zero prerequisite steps.
kind: functional
verify_method: test
breaks_if_removed: Capture costs a detour, so findings are chased mid-walk or dropped.
breaks_how_badly: corrosive
refines:
  - uc-capture-a-stray
source_refs:
  - uc-capture-a-stray step 1
  - uc-capture-a-stray ext 1a
  - ".se/req-mine-sebots.md: capture, decisions, change"
priority: must
---

## Detail

## Detail

- The call is the same for a person at the box and an agent mid-walk, with the same result.
- The note text is stored verbatim: zero rewording at capture.
- Capture is legal from any state, with or without an open record.
