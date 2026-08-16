---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-extend-existing-search-tool-with-structured-mode
type: "[[option]]"
statement: give se_file_search a second job — a structured mode alongside its existing text-match mode — rather than shipping a wholly new verb
cluster: cluster-the-query
found_by: transform
source: "SIT Task Unification, held against se_file_search, already shipped in this lane"
---

## Mechanism

One tool, two modes, chosen by which arguments the caller passes: a regex
means the existing text search; a kind-plus-field-list means the new
structured path. The caller learns one tool instead of two.

Costs a single tool whose behaviour branches on shape, which the tool's own
description would have to carry honestly — and a caller who mixes the two
argument shapes by accident gets a confusing result rather than a refusal
naming the right tool, unless the branch itself refuses ambiguous input.
