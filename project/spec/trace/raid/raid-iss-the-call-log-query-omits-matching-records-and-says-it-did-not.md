---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not
type: "[[raid]]"
kind: issue
statement: se_log_query drops records that match its filter and reports older 0 while doing it, so every count taken from the log is a floor rather than a measurement.
owner: the driving agent
trigger: fired 2026-08-17 at i33's verification; open until a test pins the paging
status: open
impact: Every number this product has quoted about its own latency is a floor of unknown depth, including the one-second rule's own evidence and the bound_breaches round built this iteration.
breaks_how_badly: corrosive
how_likely: certain
source_refs:
  - call-941bb905c033
  - call-c283d9ea33eb
  - "engine/calllog.ts query"
  - "engine/stateform.ts breachItems"
---

FOUND BY A VERIFICATION TESTER WITH FRESH EYES, 2026-08-17, while closing an
unrelated inference. It is not a suspicion; the same filter was run twice and
disagreed with itself.

## The three symptoms

- SAME FILTER, DIFFERENT ANSWERS. `{text: "meth-find-the-fault"}` returns
  `total: 7, older: 0`, and both of the 12:42 records are ABSENT. Adding
  `since: "2026-08-17T12:00:00Z"` returns `total: 10, older: 0`, and both are
  present. A narrower query found more.
- `older: 0` IS THE WORST PART. It asserts that nothing older stands behind
  the window. In the first result that is false, so the caller is told the
  answer is complete when it is not.
- A COMBINED FILTER RETURNS NOTHING. `{text, tool: "se_pull"}` returns
  `total: 0` where ten records match on text and three of them are `se_pull`.
  That is a silent wrong answer rather than a refusal, and it was hit twice on
  2026-08-17 before anybody looked.
- THE DESCRIPTION PROMISES NEWEST FIRST. A `since` query returned oldest
  first.

## Why it is corrosive rather than annoying

A LOG THAT UNDERCOUNTS AND SAYS SO WOULD BE HONEST. This one undercounts and
reports completeness, which is the same shape as a control that declines in
silence — the failure this whole iteration is about.

EVERY LATENCY NUMBER IN THIS ITERATION RESTS ON IT.

- `breachItems` in engine/stateform.ts serves the `bound_breaches` round on
  every gate, and its comment says every lane call crosses the entry point so
  the log answers directly. It answers a floor.
- i33's verification carries "1834 of 8424 calls over a second".
- tsp-a-slow-signal-keeps-the-wait carries "184 of 730 pulls".
- The gates of i33 carry "181 calls over the bound today", which I reported to
  the owner as a measurement. It is a floor.

NONE OF THOSE IS WRONG IN DIRECTION. The real numbers can only be worse, so no
conclusion drawn from them flips. What breaks is the claim to have MEASURED
anything, and a product whose one-second rule rests on an instrument that
silently omits has not earned the word.

## What closes it

A test that pins the paging: a fixture log, a filter, and an assertion that
`total` plus `older` account for every matching record. Until that exists the
numbers stay floors and every quote of them says so.
