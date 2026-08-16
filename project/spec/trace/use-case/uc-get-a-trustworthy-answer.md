---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: uc-get-a-trustworthy-answer
type: "[[use-case]]"
kind: interaction
statement: get an answer to why something was decided that anyone could re-run and check
actor: stk-engineer-driving-agents
trigger: the engineer asks the driving agent why something was decided or built a certain way
precondition: the decision or the thing built traces back to a node in the corpus
guarantee: the engineer holds an answer backed by a named query and its returned rows, repeatable by anyone who runs the same query
refines:
  - sty-trust-a-repeatable-answer
priority: should
---

## Main scenario

1. The engineer asks the agent why something was decided.
2. The agent runs a structured query over the corpus for the matching node type and topic, instead of composing a grep pattern.
3. The verb returns every matching row, or an explicit empty result.
4. The agent shows the engineer the query it ran and the rows it got back, not a paraphrase of what a hand search happened to catch.
5. The engineer, or anyone else, can re-run the same query and get the same rows.

## Extensions

3a. Nothing matches. The agent tells the engineer plainly that the corpus holds no such node, instead of guessing from memory.
