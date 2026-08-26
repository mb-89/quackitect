---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-risk-the-whole-answering-call-is-never-timed
type: "[[raid]]"
kind: risk
statement: Nothing measures the whole answering call, only the bounded wait inside it, so the call can breach the second the requirement names while every check stays green.
owner: the driving agent
trigger: a caller reporting a pull that took longer than a second while a leaving judgment was running
status: open
impact: The requirement measures the answering call and the tests measure a helper it awaits. A regression in the work that follows the wait would not turn anything red.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - req-a-leaving-check-does-not-hold-the-call
  - raid-asm-the-callers-limit-is-longer-than-a-second
---

## Why it stands

`req-a-leaving-check-does-not-hold-the-call` measures "the answering call
returns in under 1 second, on every leaving check, whatever the check's own
duration".

WHAT IS MEASURED TODAY is `scriptSettleWithin`, driven directly, on an idle
machine, against a sleeping judgment. It lands well inside the bound.

WHAT IS NOT MEASURED is everything the attempt still does after that wait: the
exit-condition loop, the read gate, and the entry-condition loop. The bound
leaves headroom for exactly that work, and the size of the headroom is a
judgment rather than a measurement.

## Why it was not simply fixed

TIMING THE WHOLE CALL NEEDS A REAL SESSION over a real machine declaration with
a real long script. That is an integration fixture, not a unit one, and
standing it up inside the fix pass that found this would have been a second
build rather than a fix.

## What would close it

A case that drives a pull through a session whose state declares a long leaving
script, and asserts on the wall time of the pull itself. Its fixture is the
work, and the assertion is one line.

## What is known about the margin

`raid-asm-a-check-left-running-survives-on-every-platform` and
`raid-asm-the-callers-limit-is-longer-than-a-second` carry what was measured on
this harness: a p99 of 1712 ms and a delivered maximum of 2275 ms for a lane
call under ordinary conditions. So the caller's own limit is comfortably longer
than a second, which is why this is a risk rather than an issue.

NOTHING IS MEASURED UNDER CONCURRENT LOAD, on any platform.
