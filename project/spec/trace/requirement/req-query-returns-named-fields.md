---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: req-query-returns-named-fields
type: "[[requirement]]"
statement: When an agent requests nodes of a named kind with a named set of fields, the query verb shall return only the rows matching the request, each carrying exactly the named fields.
kind: functional
verify_method: test
breaks_if_removed: An agent gets back whole nodes or unstructured text instead of the fields it asked for, and is back to hand-parsing files the way this very iteration measured as costing four search calls per lookup.
breaks_how_badly: crippling
refines:
  - uc-query-the-corpus-by-structure
source_refs:
  - uc-query-the-corpus-by-structure step 1
  - uc-query-the-corpus-by-structure step 2
  - uc-query-the-corpus-by-structure step 3
priority: must
---
