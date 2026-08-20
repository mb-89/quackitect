---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-ensemble-ranking-agreement-required
type: "[[option]]"
statement: run two independent rankers over the same candidates and only surface a candidate where both agree it is plausible
cluster: cluster-the-disposition
question: how does a ranked candidate coupling get its disposition
found_by: transform
source: SIT Multiplication, held against the single ranking pass
---

## Mechanism

Copy the ranking step and change the copy: a second, differently-built
ranker (a different score, a different feature set) runs over the same
candidate pool. Only candidates both rankers surface reach disposition.

Buys a smaller, higher-precision review queue without a hard cap or
blocking's grouping cost. Costs building and maintaining two rankers
instead of one, and can silently drop a real coupling either ranker alone
would have caught but the other missed — trading recall for precision in a
way that is currently unmeasured, the same open question
raid-asm-i15-query-plus-rows-earns-trust already names.
