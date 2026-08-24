---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-asm-the-recorded-duration-is-what-the-caller-actually-waited
type: "[[raid]]"
kind: assumption
statement: "The duration stamped on a call record is the time the caller waited for that call, rather than a shorter span measured inside the engine after the request had already been queued."
owner: the driving agent
trigger: the first per-hop timing that disagrees with the recorded duration for the same call
status: probed
probe: "HOLDS, 2026-08-24, checked against an outside clock by the owner. They timed one lane call from a terminal outside the session at 712.687 ms total, INCLUDING a whole node process start. The stamped median for that same verb is 595 ms and its tenth percentile is 501. So roughly 120 ms is process startup and the stamp accounts for essentially all of the rest. THERE IS NO LARGE HIDDEN QUEUE - the field measures what the caller waited. ONE ODDITY WORTH KEEPING - the timed call does not appear in the trail at all, and 55 records in that window are every one of them an agent or the surface. Either it reached a different lane process or it was never recorded, and that is its own question rather than this one. SUPERSEDES the earlier reading of this entry, which was."
probed_note: "UNPROBED at the real channel, 2026-08-24, with the reason recorded. The definitive check times one lane call from outside with an independent clock and compares it against the stamp. It CANNOT run from inside - calling the lane from a shell the lane is running blocks the loop the call needs, and the shared-loop assumption was confirmed the same day, so that is measured rather than cautionary. It needs a second shell outside the session while the session is idle. WHAT IS SUPPORTED WITHOUT SETTLING IT - two timers in different code paths agreed within five milliseconds on one wait, which rules out a large gap between the request boundary and dispatch and rules out nothing before it."
probed: 2026-08-24
impact: "Every figure this round rests on comes from that field. If it measures a narrower span than the caller's wait, the round is optimising against a shadow of the problem and the numbers that justified it are all smaller than the truth."
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-a-hop-of-the-walk-carries-its-own-time-budget
  - raid-asm-the-slow-tail-and-the-undrawn-route-share-one-cause
---

## Why it is load-bearing

EVERY NUMBER IN THIS ROUND CAME FROM ONE FIELD. The 418 pulls, the 140 past
five seconds, the six past a minute, the eighteenfold difference in the tail —
all of them are counts and comparisons over the duration stamped on a call.

NOBODY HAS CHECKED WHAT THAT FIELD MEASURES. It was read as the caller's wait
because that is the obvious reading, and the obvious reading was never tested
against a second clock.

## What would make it false

THE STAMP STARTS TOO LATE. If it begins when the engine picks the request up
rather than when the request arrives, then anything spent queueing is invisible,
and a busy engine looks fast while its callers wait.

THAT IS NOT A FAR-FETCHED SHAPE HERE. The surface reports its own slow requests
separately and counted 642 of them in the same window, including one at 110
seconds. Two instruments, two spans, and nobody has laid one against the other.

## What would make it worse than merely wrong

THE ERROR WOULD RUN ONE WAY. A stamp that starts late can only under-report, so
every figure in this round would be a floor rather than an estimate. The round
would still be pointed at a real problem, and it would be sizing it wrongly and
choosing its targets from the wrong distribution.

## Probe

TIME ONE CALL FROM BOTH ENDS. Take the wall-clock span the caller sees around a
single request, and read the duration the log stamped on that same call.

RUN IT TWICE: once on a quiet engine, once with a long judgment live, because
queueing is exactly what a busy engine adds.

WHAT CONFIRMS IT. The two agree within the noise on both runs.

WHAT FALSIFIES IT. They agree when quiet and diverge under load. That is the
queueing gap, and its size is then the correction every figure in this round
needs.

WHO CHECKS IT. The driving agent, at this round's measurement step, before any
target is set from a recorded number.

WHY IT IS CHEAP. It needs no instrumentation. One call, timed from outside,
compared with what the log already writes.

## Probed 2026-08-24: UNPROBED at the real channel, and partly supported

THE DEFINITIVE CHECK COULD NOT BE RUN FROM HERE, and the reason is itself a
finding rather than an excuse.

WHAT THE DEFINITIVE CHECK WOULD BE. Time one lane call from outside the engine,
with an independent clock, and compare that span against what the log stamps on
that same call.

WHY IT CANNOT BE RUN FROM INSIDE. Calling the lane from a shell that the lane
itself is running blocks the loop the call needs to be answered on. The lane
card says so in as many words, and the sibling assumption about a shared loop
was confirmed on the same day, so this is a measured constraint rather than a
caution.

SO THE CHECK NEEDS A SECOND SHELL, outside the session, timing a call while the
session is idle. That is minutes of work and it is not work this state can do.

## What DOES support it, without settling it

TWO LAYERS MEASURED ONE WAIT AND AGREED. In the shared-loop probe, the surface
reported a 44,067 ms request against the engine's 44,065 ms call, and a
20,015 ms request against a 20,010 ms call.

THOSE ARE DIFFERENT CODE PATHS TIMING THE SAME EVENT, one at the request
boundary and one at dispatch, and they differ by two and five milliseconds.

WHY THAT IS NOT ENOUGH. Both timers live inside the same process. A wait added
before either of them starts is invisible to both, and that is exactly the
failure this entry was written about.

WHAT IT DOES RULE OUT. A large gap between the request boundary and dispatch.
Whatever queueing exists is not happening between those two points.

## Standing

UNPROBED, with the reason recorded and the check named. The entry stays open.
Naming a gap does not close it.
## What the `probed` stamp on this entry means

IT IS THE DATE THIS ENTRY WAS LAST EXAMINED, and it is not a certificate that a
check succeeded. The outcome is in the probe field, and that field says
unprobed.

THIS IS SAID HERE BECAUSE A FORM CLAIMED THE OPPOSITE. The probe state's own
evidence says the stamp was deliberately withheld from this entry. It was not
withheld; it is on the file. The form is the half that is wrong.

WHY THE STAMP BELONGS ANYWAY. Without it, nothing distinguishes an entry nobody
has looked at from one somebody looked at and could not check. The second is
worth knowing and the first is worth chasing.
## Probed against an outside clock, and it HOLDS

THE OWNER RAN IT. One lane call timed from a terminal outside this session:
712.687 milliseconds, and that figure includes starting a whole node process.

THE STAMP FOR THAT SAME VERB runs at a 501 ms tenth percentile and a 595 ms
median across 36 calls.

SO ABOUT 120 MILLISECONDS IS PROCESS STARTUP and the stamp accounts for
essentially all of the remaining wait. There is no large queue hiding in front
of it.

WHAT THAT SETTLES. Every figure this round produced is an estimate rather than
a floor. The correction the entry warned about is not needed.

## And the probe found something the round was not looking for

THE TIMED CALL IS NOT IN THE TRAIL. Fifty-five records stand in that window and
every one is an agent or the surface. No human actor appears.

THAT IS NOT THIS ENTRY'S QUESTION and it is worth somebody's. Either the call
reached one of the other lane processes observed on this machine, or a call made
through that client is not recorded at all. The second would mean the trail is
not the complete account it is treated as.

IT DOES NOT WEAKEN THE RESULT ABOVE. The comparison is between an outside
wall-clock and the stamped distribution for that verb, and neither depends on
that particular call having been logged.
