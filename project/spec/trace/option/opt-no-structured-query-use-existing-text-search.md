---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-no-structured-query-use-existing-text-search
type: "[[option]]"
statement: build nothing new; a caller wanting corpus data keeps using se_file_search/se_file_glob's existing text matching
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: without
source: "meth-trimming — the null option, checked against se_file_search and se_file_glob, already shipped in this lane"
---

## Mechanism

The trim question, asked plainly: does answer-a-structured-query need to
exist at all? Two tools already read this corpus — se_file_search (regex
over file text) and se_file_glob (path matching).

IT STAYS. Neither does this cluster's job. Both answer with matching TEXT;
neither returns typed rows against a fixed field list, neither refuses an
unknown field by naming the field list, and neither is deterministic across
frontmatter ordering the way a named-field projection is required to be
(derive-functions' own neutrality note makes the same finding independently).
A caller who wants "every requirement, with just its kind and priority" gets
back matching lines, not rows, from either existing tool.

Recorded per meth-trimming's own instruction: a cluster that survived the
question is better justified than one nobody asked about.
