---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-carry-forward-attribution-covers-every-call-between-two-pulls
type: "[[raid]]"
kind: issue
statement: "Every lane call between two se_pull answers belongs to the state the earlier pull named, so carrying that state forward attributes the whole log."
owner: the maintainer of the machine
trigger: the first benchmark run that derives cost per state
status: mitigated
impact: "Cost lands on the wrong state wherever a call happened somewhere else. The ranked per-state view stops being trustworthy in exactly the places that are most expensive, which is where subagents and long tool runs live."
breaks_how_badly: corrosive
how_likely: plausible
probe: "FALSE, measured 2026-08-20 by a fresh-eyes verification. The premise is wrong: the pull RESPONSE carries where, not the record, and 2,233 of 2,298 pull responses in this project own log are capped to invalid JSON. 31 are recoverable. The boundaries were not recoverable by inference at all."
source_refs:
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## Where it comes from

`exp-can-cost-per-state-be-derived-from-the-call-log` came back HALF FALSE. No
call record carries a state. Every `se_pull` carries its `where`, so the
boundaries are recoverable by inference.

THE CARRY-FORWARD RULE IS THAT INFERENCE. Walk the log in order. Each `se_pull`
answer names a state. Attribute every call after it to that state until the next
`se_pull` names a different one.

## Why it might not hold

A CALL BETWEEN TWO PULLS NEED NOT BE IN THE STATE THE PULL NAMED.

- A SUBAGENT'S CALLS interleave with the parent's and are attributed to whatever
  the parent last pulled.
- A `do` INSTRUCTION WALKS SEVERAL HOPS AT ONCE. The pull names where it landed,
  not every state it passed through, so the whole run of work collapses onto the
  landing state.
- AN ANSWER-SPILL READ is exempt from the state gate by design, so it can happen
  anywhere and is attributed to the state that happens to stand.

## Probe

Take one walk's own log. Attribute it by carry-forward, then attribute it by
hand from the same log's `where` fields and the evidence file timestamps.
Compare. The disagreement rate IS the error rate, and it is measurable on
material that already exists.

## What it costs if it bites

NOT THE TOTAL, WHICH STAYS RIGHT. The per-state ranking is the thing that
degrades, and the per-state ranking is what makes a benchmark actionable rather
than a single number.

## It is an ISSUE now, and it keeps its id

THE CARD SAYS SO: a falsified assumption becomes an ISSUE, not a risk — it has
already happened. Change the kind, keep the id, and say so in the body
([[raid]]). The id still reads `raid-asm-`, which is the card working as
written: the id is what other nodes point at, and renaming it to match the kind
would break every reference to buy nothing.

`superseded` was tried first and it belongs to DECISIONS alone. What happened
here is not a decision being replaced; it is a claim that was measured and found
false, and then fixed.

## Probed 2026-08-20 — the premise was wrong, and the rule is replaced

THIS NODE SAID `Every se_pull carries its where`. It does not, and the mistake
is worth keeping because it is precise.

THE PULL *RESPONSE* CARRIES `where`, as a `string[]` nested inside it. The
RECORD does not: `CallRecord` in `engine/calllog.ts` holds ref, ts, tool, args,
ok, outcome, duration_ms, response, actor and se_version, and nothing else.

AND THE RESPONSE IS CAPPED. `tools.ts` truncates every non-`se_run` answer to
500 characters, so the stored response is usually not valid JSON. Measured on
this project's own log by a fresh-eyes verification:

    pulls 2298 · stored as string 2298 · parse failed 2233 · recoverable 31

SO THE FAILURE MODE WAS NOT THE ONE THIS NODE LISTED. It named three ways the
rule might MIS-attribute — subagents, multi-hop `do`, answer-spill reads. The
real answer is that it attributed NOTHING: `costPerState` returned `{}` over
13,619 records.

## What replaced it

THE WALK POSITION IS STAMPED, NOT INFERRED. `CallRecord` gains `where`, and the
one observer in `tools.ts` writes `session.active()` onto every record — the
same rule `actor`, `client` and `harness` already follow: stamped where the call
is served, by the code that knows.

AN INFERENCE OVER A TRUNCATED TRAIL WAS NEVER THE RIGHT SHAPE. The engine knew
the answer at the moment of the call and threw it away, and the derivation then
tried to reconstruct it from what survived.

## What this does NOT fix, and it matters

EVERY RECORD WRITTEN BEFORE THE STAMP HAS NO STAMP. A benchmark run over a log
that predates this change attributes what it can from carry-forward and counts
the rest under `UNATTRIBUTED`. That is honest and it is not the same as a
measurement.

SO THE FIRST BENCHMARK RUNS MEASURE ONLY THEMSELVES, and the historical log is
not a baseline. Nothing here recovers it.

## Why superseded rather than closed

THE QUESTION IT ASKED IS GONE, not answered. There is no carry-forward rule to
be right or wrong about any more. The successor question — whether the stamp is
correct at every dispatch — is a different node's to open.
