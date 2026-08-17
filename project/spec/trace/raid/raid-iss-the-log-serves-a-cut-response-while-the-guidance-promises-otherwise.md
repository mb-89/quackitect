---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: raid-iss-the-log-serves-a-cut-response-while-the-guidance-promises-otherwise
type: "[[raid]]"
kind: issue
statement: A result the host moved to disk is re-fetched by ref exactly as the lane's guidance instructs, and the log serves it back CUT — so the documented recovery path lands a reader on a value nobody checked.
owner: the driving agent
trigger: any state that re-fetches a large result by ref, and the guidance edit that would withdraw the promise
status: open
impact: "The lane's own guidance tells every agent that a host-truncated result is recovered by ref rather than by reading the host's file. A reader who follows that instruction gets a silently shortened value and no sign that anything was removed. It is the shape of evidence with the evidence removed, and it is worse than an honest refusal because it looks like it worked."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - note-e31d7d3a0e08
  - req-call-answers-in-one-second
  - i33-every-interface-a-person-or-an-agent-tou
---

## What happened

MEASURED TWICE ON 2026-08-17, both times while running this iteration's own
onboarding retro.

A `se_survey` answer was moved to disk by the host, which handed back a 2KB
preview. The lane's guidance is explicit about the recovery: a result the host
moved to disk is re-fetched by ref, never by reading the host's file.

That was done. The log returned the record with `…[56238 chars cut — the whole
lives in the call log]…` in place of the body.

THE MESSAGE IS THE PROBLEM AS MUCH AS THE CUT. It says the whole lives in the
call log, while being the call log's own answer. A reader is told the complete
value exists somewhere they have just looked.

## Why it is an issue rather than a risk

IT IS PRESENT TENSE AND IT HAS ALREADY COST SOMETHING. The retro worked around
it by re-running the survey with a smaller window, twice, which is exactly the
sort of hand-worked recovery the lane exists to remove.

## The conflict it comes from

THIS IS THE SECOND GOAL CONFLICT RULED AT THIS ITERATION'S draft-vision:
completeness of the log pulls against the size and speed of a call.

THE SYSTEM ALREADY RESOLVED IT SILENTLY, in favour of size, and did not update
the promise. The ruling reverses that: completeness wins, and the reason is the
promise rather than the bytes.

## What closing it looks like

EITHER the re-fetch serves the whole record, paged if it must be, OR the
guidance stops promising that it does and names what to do instead.

WHAT IS RULED OUT is the third state, which is where it stands now: the promise
and the behaviour both standing and disagreeing.
