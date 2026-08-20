---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: uc-query-the-corpus-by-structure
type: "[[use-case]]"
kind: interaction
statement: ask the corpus a question its own files can settle — a harvested .base view through se_query, or the coverage anti-join through se_coverage — rather than hand-scanning hundreds of files
actor: stk-agent
trigger: the agent needs to answer a question the corpus can settle - what a decision touches, what a node's fields are - without already knowing which file holds the answer, or without hand-scanning hundreds of files with se_file_search
precondition: a .base file under the vault declares a view naming its filter, sort and column order; the corpus holds nodes, edges, states and notes as markdown files under spec
guarantee: the agent holds either the view's matching rows with its own declared fields, or a named refusal listing what fields the view does declare
refines:
  - sty-answer-what-does-this-touch
priority: must
---

## Main scenario

1. The agent names a harvested .base file and, optionally, which of its declared views to run, via se_query.
2. se_query loads the base, resolves the named view (or the base's first view when none is named), and runs the view's own filter and sort against the vault through the pinned Bases subset.
3. se_query returns the matching rows, each carrying exactly the view's own declared column order.
4. The agent follows a returned row's id to its own file when it needs the full node, rather than the query result standing in for the file.

## The coverage question

5. The agent names a node type, or several, via se_coverage, and gets back
   every node of that type NOTHING in the corpus refines.

6. That is the shape of three state laws — every element realized by a design
   spec, every requirement verified by a test spec, every must story carrying a
   demonstration. Before this verb it was reachable only at submit, on a form
   whose template happens to declare `covers`, so an agent deciding what to
   build next could not ask it and asked it in throwaway scripts instead.

7. THE VERB AND THE LAW ARE ONE FUNCTION, so the answer here and the refusal
   there cannot disagree. Two copies of a corpus law drift.

## Extensions

3a. The agent asks se_query to override the columns with a field the view's own order does not declare. The verb refuses by name (SE-C-144) and lists the fields the view does declare, instead of returning an empty or wrong result.

3b. Nothing matches the view's filter. se_query returns an explicit empty result, never a silent miss indistinguishable from a bug.

3c. The agent names a view the base does not declare. se_query refuses by name and lists the views the base does declare.

5a. The agent names a type the corpus does not carry. se_coverage refuses by name and lists the types that exist, because an empty answer for a type nobody uses reads as full coverage.
