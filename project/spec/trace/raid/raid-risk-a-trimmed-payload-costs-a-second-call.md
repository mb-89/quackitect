---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-risk-a-trimmed-payload-costs-a-second-call
type: "[[raid]]"
kind: risk
statement: A pull trimmed of something the agent needs costs a second call to fetch it, so the trim raises the call count it was built to lower.
owner: the driving agent
trigger: any measurement showing calls per state rising after the trim lands, or any refusal caused by a field the pull no longer carries
status: open
impact: the headline fix of the iteration reverses its own goal, and the reversal hides inside a lower per-call byte count that reads as success.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - "measured 2026-08-16: 81 of 206 pulls over one second, several answers above 60KB"
  - "i11 seed: the form arrives paged or trimmed, carrying field names, grammars and hints, never the template prose the reading already credited"
  - vp-rigor-without-toil
---

## The risk

THE PULL SHIPS TOO MUCH AND THAT IS MEASURED. Every form field carries ten
null argument slots, plus the full static template metadata, on every pull.
Several answers exceeded 60KB and were spilled to disk, which is where the
agent starts working blind.

THE TRIM IS THE FIX, AND IT CUTS BOTH WAYS. What the pull stops sending, the
agent has to fetch when it turns out to be needed. One saved payload against
one extra round trip is a loss, because the round trip costs a call and the
payload costs bytes.

## Why the measurement will not catch it by itself

THE OBVIOUS METRIC IMPROVES EITHER WAY. Bytes per pull drops whether the trim
was correct or not. A trim that removed something load-bearing shows up as a
smaller payload and a higher call count, and only the second number says
anything.

SO THE MEASURE IS CALLS PER STATE, not bytes per call. That is the trigger on
this entry.

## What makes it survivable

THE SEED ALREADY NAMES THE RULE, and it is a good one: send field names,
grammars and hints; do not send the template prose the reading already
credited. Anything larger serves BY REFERENCE with offset and limit, the way
se_file_read already does.

A REFERENCE IS NOT A REMOVAL. The agent that needs the trimmed part can still
reach it, and the call it costs is paid only when it is genuinely wanted.
