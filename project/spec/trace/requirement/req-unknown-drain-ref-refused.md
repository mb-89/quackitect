---
id: req-unknown-drain-ref-refused
type: "[[requirement]]"
statement: If a drain names a ref that no pending note carries, then the engine shall refuse the call and shall name the unknown ref.
kind: functional
verify_method: test
breaks_if_removed: Drains against nothing append as dead lines and the inbox count stops matching the drain log.
refines:
  - uc-drain-the-inbox
source_refs:
  - uc-drain-the-inbox step 3
  - ".se/req-mine-v2.md: notes and the toll (v2-082)"
priority: should
weighs_against:
  - req-idea-lands-as-note >
---
