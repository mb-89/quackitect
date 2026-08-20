---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-reactive-push-query-on-corpus-change
type: "[[option]]"
statement: register a query once; the engine pushes fresh matching rows to the subscriber whenever the corpus changes, instead of the caller pulling on demand
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: transform
source: SCAMPER Reverse, held against answer-a-structured-query's request direction; the shape Dataview auto-refresh already runs, per its own README
---

## Mechanism

Invert the direction: instead of the caller asking and the engine
answering, the caller subscribes once and the engine notifies on the
corpus's own write path — the same shape Dataview's live index already
runs against vault changes.

Buys a caller that never has to poll. Costs a subscription lifecycle (who
unregisters, and when) that a stateless pull-based verb does not need, and
sits awkwardly against req-work-starts-without-a-reachable-remote's offline
framing if the subscriber is not the same process as the engine.
