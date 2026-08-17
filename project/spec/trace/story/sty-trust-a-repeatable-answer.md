---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: sty-trust-a-repeatable-answer
type: "[[story]]"
statement: When an engineer asks why something was decided, I want the agent to answer with a query anyone could re-run and get the same rows back, so I can trust the search was complete rather than lucky.
actor: stk-engineer-driving-agents
refines:
  - vp-the-ledger
priority: should
---

## Deck

An engineer asks the driving agent why something was built a certain way. Nothing tells the engineer whether the agent's search actually covered the whole corpus, or got lucky.
|||


---

Today the agent's only tools are se_file_search and se_file_glob — a hand search dressed as automation. The engineer cannot re-run it and expect the same coverage, because a grep's completeness depends on the words chosen.
|||


---

The engineer asks why a decision was made. The agent runs the query verb for kind: decision, filtered on the topic, instead of composing a grep pattern.
|||


---

The verb returns every matching row, or an explicit empty result — never a silent miss, because an unmatched field name is refused rather than skipped.
|||


---

The agent shows the engineer the query it ran and the rows it got back, not a paraphrase of what a grep happened to catch.
|||


---

The engineer trusts the answer, because the same query run again — by anyone — returns the same rows. The search is repeatable, not a one-off that depended on the agent's luck.
|||

