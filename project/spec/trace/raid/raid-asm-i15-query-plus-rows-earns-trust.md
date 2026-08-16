---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-asm-i15-query-plus-rows-earns-trust
type: "[[raid]]"
kind: assumption
statement: an engineer who is shown the query text and its returned rows trusts the answer, without needing to independently re-derive it against the corpus by hand.
owner: the driving agent
trigger: an engineer asks to see the underlying corpus itself rather than accepting the query and its rows as sufficient proof
status: open
impact: the trust property req-query-is-deterministic and sty-trust-a-repeatable-answer both rest on turns out not to be what actually earns the engineer's trust, and the repeatability guarantee buys less than this iteration's business case counted on.
breaks_how_badly: abrasive
how_likely: conceivable
probe: unprobed
source_refs:
  - req-query-is-deterministic
  - sty-trust-a-repeatable-answer
---

## Probe

Once the query verb ships and is used a few times to answer an engineer's
"why" question, watch what the engineer actually does next: accepts the
query and rows as shown, or asks to check the corpus directly. A recurring
ask to double-check by hand is the signal this assumption does not hold.
