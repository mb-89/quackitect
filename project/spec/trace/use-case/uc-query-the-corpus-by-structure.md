---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: uc-query-the-corpus-by-structure
type: "[[use-case]]"
kind: interaction
statement: query the trace corpus for typed rows matching named fields
actor: stk-agent
trigger: the agent needs to answer a question the corpus can settle — what a decision touches, what a node's fields are — without already knowing which file holds the answer
precondition: the corpus holds nodes, edges, states and notes as markdown files under project/spec
guarantee: the agent holds either the exact matching rows with the fields it asked for, or a named refusal listing what fields do exist
refines:
  - sty-answer-what-does-this-touch
priority: must
---

## Main scenario

1. The agent names the kind of node it wants (decision, story, requirement, or another standing type) and the topic or field values it is filtering on.
2. The agent names exactly the fields it wants back for each matching row.
3. The query verb reads the corpus and returns the matching nodes, each row carrying only the named fields.
4. The agent follows a returned row's id to its own file when it needs the full node, rather than the query result standing in for the file.

## Extensions

3a. The agent names a field the matched node type does not carry. The verb refuses by name and lists the fields that do exist, instead of returning an empty or wrong result.

3b. Nothing matches the filter. The verb returns an explicit empty result, never a silent miss indistinguishable from a bug.
