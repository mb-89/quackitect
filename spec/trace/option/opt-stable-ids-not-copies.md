---
minted_in: i1
id: opt-stable-ids-not-copies
type: "[[option]]"
statement: link stable ids to the authoritative text instead of duplicating it, and check mechanically for orphans and stale links
cluster: cluster-the-account
found_by: prior-art
source: Requirement traceability matrix, https://qajobfit.com/resources/requirement-traceability-matrix
---

## Mechanism

The matrix holds ids and edges, never prose. Relationships are many to many,
statuses are defined rather than described, and two checks run without a
person: an ORPHAN check for a node nothing points at, and a STALE-LINK check
for an edge whose far end moved.

The source is explicit that the matrix points at immutable or controlled
records, never at a pasted copy with no provenance.

WHAT IT WOULD COST HERE. This is what the refs template already enforces,
and the coverage rule is the orphan check under another name. What is NOT
here is the stale-link check: this system detects a moved input by
recomputing green, which catches a claim resting on changed ground but not
an edge pointing at something that no longer says what it said.
