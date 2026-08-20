---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-obsidian-cli-as-external-evaluator
type: "[[option]]"
statement: shell out to the Obsidian application itself (its CLI) to evaluate the query, instead of an evaluator this engine owns
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: transform
source: "SCAMPER Substitute, held against \"who evaluates the query\"; already considered and rejected in v1's adr-query-in-engine (spec/decisions/adr-query-in-engine.md at ref main): \"Datum: the Obsidian CLI as an external evaluator. It loses on the trust chain and the one-binary law.\""
---

## Mechanism

Swap the evaluator: instead of this engine parsing and matching, hand the
`.base` file to Obsidian's own CLI and read back what it renders.

v1 already ran this substitution and recorded why it lost. Trusting a
second, external, closed-source evaluator breaks the trust chain a
one-process engine otherwise holds end to end, and it breaks the
one-binary law that keeps deployment to a single artifact. Recorded here
for completeness — the chart should show it was considered, not silently
skipped — carrying its already-known cost forward rather than re-arguing it.
