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
STILL TRUE, and the reason is sharper than a first look suggested. Checked 2026-08-17 during i33: the query evaluator IS built. `engine/query.ts` exports `answerStructuredQuery`, and `tests/query.test.ts` carries four cases over it. What does not exist is a lane verb that reaches it — a search of the whole deliverable for `se_query` returns nothing. The engine holds the answer and has no door to hand it through.

MEASURED THIS RUN, and it cuts both ways. Every `se_file_search` i35 made carried a stated `intent` and every call is in `.se/calls.jsonl`, so the engineer can see WHAT was searched. What no record shows is whether the words chosen were the right ones.
---

Today the agent's only tools are se_file_search and se_file_glob — a hand search dressed as automation. The engineer cannot re-run it and expect the same coverage, because a grep's completeness depends on the words chosen.
|||
UNCHANGED IN PRACTICE, and i33 lived it. One search for empty story slides returned `total: 753, truncated` and showed sixty. The agent then read decks by hand, guessing which might be unfilled, and was wrong twice. The engine knew the answer the whole time and the walk had no way to ask it.

STILL TRUE. The lane's 34 tools include no structured query over the trace graph. i35's searches were greps with intents attached — better than a bare grep, and still dependent on the searcher's vocabulary.
---

The engineer asks why a decision was made. The agent runs the query verb for kind: decision, filtered on the topic, instead of composing a grep pattern.
|||
BUILT, AND NOT REACHABLE. `answerStructuredQuery` takes exactly this shape — a kind and a named field list — at `engine/query.ts:45`. i15's own build-query-evaluator evidence, signed 2026-08-16, records it implemented with four of four cases green. Nothing in the lane's tool list exposes it, so the actor this story names cannot run it.

NOT YET AVAILABLE. i15 stands `status: open` and the verb does not exist, so the agent still composes patterns.
---

The verb returns every matching row, or an explicit empty result — never a silent miss, because an unmatched field name is refused rather than skipped.
|||
CORRECT IN THE FUNCTION, WRONG IN THE TOOL AN AGENT CAN ACTUALLY REACH. `engine/query.ts:51` refuses an unknown field by name and lists the legal ones, which is this slide almost word for word. The shipped `se_log_query` does the opposite: it drops records matching its own filter and reports `older: 0` while doing it — raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not. Every latency figure in i33 is stated as a floor because of that.

THE EXPLICIT-EMPTY DISCIPLINE IS ALREADY PROVEN IN THE NEIGHBOURING VERB. `se_test` answers `nothing` as a real verdict — an unchanged tree keeps its last result and the answer SAYS so — rather than refusing or silently doing nothing. The same principle applied to queries is what this slide asks for.
---

The agent shows the engineer the query it ran and the rows it got back, not a paraphrase of what a grep happened to catch.
|||
HALF SHIPPED. Every lane call is recorded raw to `.se/calls.jsonl` with its arguments, so a search CAN be replayed from the record. That is the audit half. The completeness half waits on the verb, and the verb is a missing door rather than missing code.

PARTIALLY LIVE ALREADY, through a different door. `se_answer` records a question with its full answer, and `se_log_query` serves any call's full output back by reference — so an agent CAN show what it ran. i35 used the second repeatedly to re-read run output rather than paraphrasing it.
---

The engineer trusts the answer, because the same query run again — by anyone — returns the same rows. The search is repeatable, not a one-off that depended on the agent's luck.
|||
NOT DELIVERED, and the shape of the miss is the finding. None of this is unbuilt work. i15 built the evaluator, built the coupling ranker beside it, walked as far as verification, and its record still reads `status: open` — the last hop, a verb an agent can call, was never taken. THE SECOND FINDING: this deck sat with six empty halves through every iteration that walked past fill-story-evidence without signing it, which is how a story about trusting a search went unexamined in a system built on searching.

UNMEASURED, and honestly so. Repeatability cannot be demonstrated against a verb that does not exist. The nearest thing this run proved is negative: two of i35's read-probe answers failed because a quoted anchor crossed a line break, which is exactly the vocabulary-dependence this story exists to remove.
