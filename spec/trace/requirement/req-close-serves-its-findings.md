---
minted_in: i1
id: req-close-serves-its-findings
type: "[[requirement]]"
statement: When a close is requested, the engine shall serve the record's findings report, listing every finding the record produced.
kind: functional
verify_method: test
breaks_if_removed: The person rules on a report that quietly dropped what it found inconvenient.
breaks_how_badly: crippling
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record step 1
  - uc-close-a-record step 2
  - uc-close-a-record step 2
  - uc-close-a-record step 3
priority: must
---

## Detail

What the report owes:

- When a close is requested on a record, the engine shall serve the record's findings report before the close proceeds.
- The engine shall list, in the close-time findings report, every finding the record produced, with zero dropped.
