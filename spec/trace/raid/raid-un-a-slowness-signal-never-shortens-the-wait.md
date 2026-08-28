---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-un-a-slowness-signal-never-shortens-the-wait
type: "[[raid]]"
kind: issue
statement: The architecture does not address req-a-slowness-signal-never-shortens-the-wait — the design spec deliberately leaves what the signal says undecided, and the measure has never been executed.
owner: the adjudicator
trigger: standing until the owner rules on the signal's wording, which is the judgment the design spec holds back for them
status: open
impact: an elapsed-seconds counter climbing past thirty is a plausible mitigation nobody has put in front of a person, and the row it protects is about what a person feels
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-a-slowness-signal-never-shortens-the-wait
  - el-mirror
  - raid-risk-an-accurate-progress-signal-can-drive-abandonment
place: backlog
---

## The design spec refuses the decision this measure depends on

`dsp-legible-controls` LINES 65 TO 70 SAY IT PLAINLY. What is deliberately not
decided there is what the signal SAYS. A faithful completion percentage is the
known way to fail this row, and choosing the wording is a judgment the owner
holds. The spec settles where the signal lives and that it does not take the
surface over.

THAT IS A GOOD REFUSAL, NOT A GAP IN THE SPEC. It is recorded here because the
scenario is unaddressed until the held-back judgment is made, and the spec is
the reason rather than the fault.

## Nobody has run the procedure and nobody owns a date

`tsp-a-slow-signal-keeps-the-wait` LINE 28: this procedure has not been run and
nobody has scheduled it.

[[raid-risk-an-accurate-progress-signal-can-drive-abandonment]] IS OPEN and
holds the resolution with a person: a design review with the owner at the
screen, because it is a judgment about what a person feels and no check can make
it.

## What stands today is a plausible mitigation, untested against anybody

`engine/params.ts` RENDERS `<what> — working, <secs>s`. Elapsed seconds with no
completion estimate is a reasonable answer to the abandonment shape, and no
person has been put in front of it.

A PLAUSIBLE MITIGATION IS NOT A DELIVERED ONE. That distinction is the whole
reason this card is unaddressed rather than at risk.

## The prior art behind the row is second-hand and says so

`req-a-slowness-signal-never-shortens-the-wait` LINES 41 TO 44 carry a 21.8 per
cent abandonment figure and then state: PRIMARY NOT SEEN, this is a secondary
write-up and the study was not read.

THAT NUMBER IS CARRIED INTO NO VERDICT HERE, and the honesty of the citation is
worth keeping rather than quietly dropping.

## There is nothing yet for a comparison to compare

THE SIGNAL THIS ROW CONSTRAINS IS ITSELF ABSENT FOR THE BREACHING CLASS. See
[[raid-ar-work-past-its-bound-says-it-is-working]]: the panel value is sourced
from the job registry and in-process lane calls never enter it.

SO THE TWO ARE ORDERED. The signal has to reach the breaching class before
anybody can measure whether it shortens a wait.

## Why this one cannot become a fitness check

THE MEASURE IS A COUNT OF PEOPLE WHO ABANDONED A WAIT, in two arms with a
control. `tsp-a-slow-signal-keeps-the-wait` line 20: nothing a program can
assert says whether the person stayed.

A PROGRAM CAN ASSERT THE SIGNAL WAS EMITTED, WHEN, AND HOW LARGE IT IS. That is
the other row's measure, not this one's.
