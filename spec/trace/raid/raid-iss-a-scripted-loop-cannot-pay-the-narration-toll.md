---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-a-scripted-loop-cannot-pay-the-narration-toll
type: "[[raid]]"
kind: issue
statement: The narration toll is owed per call, so a script that makes many lane calls is refused partway through with no honest line to narrate.
owner: the maintainer
trigger: any state whose work is a query loop — the retro's log mining most of all
status: open
impact: "Twenty-five refusals this session, nineteen per cent of the window. Worse than the count: a paged query loop returns PARTIAL results and the caller cannot tell, because a refused page reads as an empty page."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
place: i55-narration-gets-lean-the-decision-graph-s
---
## What was observed

MEASURED 2026-08-19 during this retro's own log mining. SE-C-040 fired 15 times
and SE-C-133 10 times, out of 129 refusals in the window.

THE SHAPE THAT CAUSED IT. Tallying 129 refused calls needs the query lane paged,
because a wide page is bounded. Each page is a call, each call owes narration,
and the loop owes nothing new to say on page four that it did not say on page
one.

IT FAILED QUIETLY FIRST. The first two attempts reported TOTAL 0 and TOTAL 40
against a true 129, because the refused pages parsed as empty pages. The tally
only came out right once every call carried a made-up per-page brief.

## Why the toll is right and this is still a defect

THE TOLL EARNS ITS KEEP. On an unattended box the narration is the only sign of
life, and the guidance is explicit that a stall reads as nothing at all.

WHAT IT CANNOT DISTINGUISH is an agent that has gone quiet from a loop that is
working. A per-page brief satisfies the toll and tells the reader nothing, which
is the outcome the toll exists to prevent.

## What repair consists of

- One narration covering a declared batch, so a loop pays once and says
  something true.
- Or the toll counting a scripted page as part of the call that opened the
  batch, which is what it actually is.
- Either way a refused page must not read as an empty page. That is the half
  that turns a cost into a wrong answer.
