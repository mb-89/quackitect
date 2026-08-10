---
id: raid-ar-call-answers-in-one-second
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-call-answers-in-one-second at risk — the response hinges on el-walk-engine.
owner: the adjudicator
trigger: the daily ledger showing serving calls over the one-second line, or any growth of walk computation on the serving loop
status: open
impact: The serving loop shares its process with heavy walk computation, so a long walk starves every caller at once.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-call-answers-in-one-second
  - el-walk-engine
---

Walked at evaluate-architecture by agent. The scenario's response forms at
el-walk-engine, where one event loop serves the lane and the mirror.

THE EVIDENCE, measured 2026-08-10 from the recorded call log: 12 of 118
pulls broke the one-second line, the worst at 15.2 seconds (a full
28-state record re-entry), and no background handle came back in any of
them. The requirement allows a handle; none exists yet.

A STALE NUMBER WAS REMOVED HERE. The 274-second entry of 2026-08-09
measured the pre-stamp engine and was fixed the same day (the corpus
stamp and the pass; the same entry costs about 1.3 seconds now). A
measurement outlives its system unless it carries a date — this one now
does. The fix vehicle for the remaining breaches is the async round's
ticket desk, parked with its charter in the backlog.
