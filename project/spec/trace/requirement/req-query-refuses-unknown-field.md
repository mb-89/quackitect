---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: req-query-refuses-unknown-field
type: "[[requirement]]"
statement: When a requested field is not defined on the matched node kind, the query verb shall refuse the request and shall name the fields that kind does define.
kind: functional
verify_method: test
breaks_if_removed: An agent asking for a field that does not exist gets a silent miss instead of a named refusal, reintroducing the exact silent-miss failure this iteration exists to close.
breaks_how_badly: crippling
refines:
  - uc-query-the-corpus-by-structure
source_refs:
  - uc-query-the-corpus-by-structure extension 3a
priority: must
---
