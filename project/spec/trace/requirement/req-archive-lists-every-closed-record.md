---
id: req-archive-lists-every-closed-record
type: "[[requirement]]"
statement: The archive shall list every closed record with its identifier and statement, and zero live records.
kind: functional
verify_method: test
verified_by:
  - "tests/container.test.ts :: the archive: start reaches every closed expedition, each runs to end, browsing is human-only"
breaks_if_removed: A question about a finished decision has no door; closed records are findable only by digging through files.
breaks_how_badly: corrosive
refines:
  - uc-browse-the-archive
source_refs:
  - uc-browse-the-archive step 1
  - uc-browse-the-archive step 2
priority: should
weighs_against:
  - req-archive-opens-to-a-person-only >
---
