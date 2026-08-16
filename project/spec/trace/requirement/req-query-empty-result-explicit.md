---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: req-query-empty-result-explicit
type: "[[requirement]]"
statement: When no node matches a query's filter, the query verb shall return an explicit empty result rather than omitting a response.
kind: functional
verify_method: test
breaks_if_removed: A query with no matches becomes indistinguishable from a broken query, and the no-third-silent-case guarantee this iteration promises breaks for the query verb.
breaks_how_badly: abrasive
refines:
  - uc-query-the-corpus-by-structure
  - uc-get-a-trustworthy-answer
source_refs:
  - uc-query-the-corpus-by-structure extension 3b
  - uc-get-a-trustworthy-answer extension 3a
priority: must
---
