---
id: req-close-refuses-loose-ends
type: "[[requirement]]"
statement: If a record holds unlanded work or an unruled finding, then the engine shall refuse the close and name what stands.
kind: functional
verify_method: test
breaks_if_removed: A record closes over work nobody landed and findings nobody ruled, and the archive lies.
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record precondition
  - uc-close-a-record ext 6a
  - uc-close-a-record step 3
  - uc-close-a-record step 4
  - uc-close-a-record ext 2a
  - uc-close-a-record ext 3a
  - uc-close-a-record ext 4a
  - ".se/req-mine-sebots.md: rejections need memory"
priority: must
---

## Detail

Each loose end that holds the close:

- If the record holds work that has not landed, then the engine shall refuse the close, naming the unlanded work.
- While any finding stands without a recorded ruling, the engine shall refuse the close.
