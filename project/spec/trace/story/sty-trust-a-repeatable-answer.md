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
MEASURED THIS RUN, and it cuts both ways. Every `se_file_search` i35 made carried a stated `intent` and every call is in `.se/calls.jsonl`, so the engineer can see WHAT was searched. What no record shows is whether the words chosen were the right ones.
---

Today the agent's only tools are se_file_search and se_file_glob — a hand search dressed as automation. The engineer cannot re-run it and expect the same coverage, because a grep's completeness depends on the words chosen.
|||
STILL TRUE. The lane's 34 tools include no structured query over the trace graph. i35's searches were greps with intents attached — better than a bare grep, and still dependent on the searcher's vocabulary.
---

The engineer asks why a decision was made. The agent runs the query verb for kind: decision, filtered on the topic, instead of composing a grep pattern.
|||
NOT YET AVAILABLE. i15 stands `status: open` and the verb does not exist, so the agent still composes patterns.
---

The verb returns every matching row, or an explicit empty result — never a silent miss, because an unmatched field name is refused rather than skipped.
|||
THE EXPLICIT-EMPTY DISCIPLINE IS ALREADY PROVEN IN THE NEIGHBOURING VERB. `se_test` answers `nothing` as a real verdict — an unchanged tree keeps its last result and the answer SAYS so — rather than refusing or silently doing nothing. The same principle applied to queries is what this slide asks for.
---

The agent shows the engineer the query it ran and the rows it got back, not a paraphrase of what a grep happened to catch.
|||
PARTIALLY LIVE ALREADY, through a different door. `se_answer` records a question with its full answer, and `se_log_query` serves any call's full output back by reference — so an agent CAN show what it ran. i35 used the second repeatedly to re-read run output rather than paraphrasing it.
---

The engineer trusts the answer, because the same query run again — by anyone — returns the same rows. The search is repeatable, not a one-off that depended on the agent's luck.
|||
UNMEASURED, and honestly so. Repeatability cannot be demonstrated against a verb that does not exist. The nearest thing this run proved is negative: two of i35's read-probe answers failed because a quoted anchor crossed a line break, which is exactly the vocabulary-dependence this story exists to remove.
