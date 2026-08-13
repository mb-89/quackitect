---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-comparison-carries-both-sides
type: "[[requirement]]"
statement: Where a comparative claim is recorded, the record shall carry evidence for both sides or the named reason the comparison was not made.
kind: functional
verify_method: inspection
breaks_if_removed: A one-sided comparison reads as a finding and routes real work.
breaks_how_badly: corrosive
refines:
  - uc-research-and-record-an-answer
source_refs:
  - uc-research-and-record-an-answer ext 6a
  - uc-research-and-record-an-answer ext 6b
  - ".se/req-mine-sebots.md: Product-scope lessons (fixes and abandonments)"
priority: should
weighs_against:
  - req-vendor-page-claim-only >
---

## Detail

## Detail

| situation | the honest record |
| --- | --- |
| evidence exists on both sides | the comparison, each side citing its evidence |
| our side does not exist yet | "comparison impossible", with the missing side named |
| the comparison was not made | "not compared", with the reason |

A blank where a comparison was expected is a defect. It reads as done and carries nothing.
