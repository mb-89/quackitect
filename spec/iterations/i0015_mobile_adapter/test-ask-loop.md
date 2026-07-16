---
id: test-ask-loop
type: test
statement: The ask loop runs end to end. Each ask is rendered, dispatched, distinctly gated, resolved exactly once, and recorded with its actor.
class: executed
verify: selftest:answer-apply answer-idempotent ask-dispatch ask-format ask-timeout gate-distinct mobile-actor multi-ask
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. A well-formed answer on a pending correlation id records the adjudication and resolves the ask. *(was test-answer-apply)*
2. A late or duplicate answer on a resolved ask changes nothing; the first resolution stands. *(was test-answer-idempotent)*
3. A ready gate ask reaches every paired channel adapter exactly once. *(was test-ask-dispatch)*
4. A rendered ask carries the question, one to three id-labelled options, and a unique correlation id. *(was test-ask-format)*
5. An unanswered ask expires at its timeout and its notification clears or supersedes. *(was test-ask-timeout)*
6. A gate ask and a decision ask render distinguishably on the device. *(was test-gate-distinct)*
7. A mobile gate answer records actor user with the channel named in the record. *(was test-mobile-actor)*
8. Two pending asks resolve independently, each by its own correlation id. *(was test-multi-ask)*
