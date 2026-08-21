---
minted_in: i51
id: raid-asm-starting-a-judgment-is-far-cheaper-than-answering
type: "[[raid]]"
kind: assumption
statement: Starting a leaving judgment and recording that one is owed costs far less than the second the answering call is allowed, on every machine the product runs on.
owner: the driving agent
trigger: the first answering call that exceeds a second without the judgment itself having been waited for
status: probed
probed: "2026-08-21, and it HOLDS with two orders of magnitude of margin. A handoff call that started a long run and did not wait for it was recorded at 7 ms against a 1000 ms measure."
probe: "Time the answering call on the slowest machine available, with the leaving judgment started and not awaited. Compare against the one-second measure with the machine's own load recorded beside it."
impact: "The measure on the answering call is absolute rather than a share. If starting the judgment is itself slow on a loaded or small machine, the product breaches its own measure while doing exactly what the design says."
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - req-a-leaving-check-does-not-hold-the-call
  - i51
---

## Why it is open

The one-second measure counts the whole answering call, not the part of it this
design controls.

Starting work costs something. On a small or loaded machine, spawning and
recording may not be free, and nobody has measured what it costs here.

## Where it bites

The environment is the source this leans on: how much machine there is, what
else is on it, and how loaded it is when the walk runs.

None of that is controlled. A cloud container is whatever it is on the night.

## Why it is graded abrasive rather than corrosive

A breach here is a slow answer, not a lost one. The caller still receives the
answer and the walk still proceeds, so nobody routes around it.

That is a real difference from the other three assumptions in this sweep, each
of which loses something.

## Probe

Time the answering call on the slowest machine available, with the judgment
started and not awaited, and record the machine's own load beside the number.

Two outcomes, both useful.

- It is comfortably inside the second, and the measure holds with a number
  behind it.
- It is not, and the measure needs either a faster start or an honest
  reformulation. What it must not become is a share, because a share licences
  the silent breaches this iteration exists to end.

## PROBED 2026-08-21 — IT HOLDS WITH TWO ORDERS OF MAGNITUDE OF MARGIN

The existing handoff shape was used as the stand-in, because it does exactly
what the deferred verdict will do: start long work and answer without waiting.

WHAT WAS MEASURED. Call `call-6321f0fbd388` started a run of 175 test files and
returned in 7 ms. The run itself was still going ninety seconds later.

AGAINST A MEASURE OF 1000 MS, that is 0.7 percent of the budget spent on
starting.

A LATER STATUS READ COST 1 MS, which is the other half of the same shape.

WHAT THIS DOES NOT SETTLE. One machine, unloaded, on one platform. The entry's
concern was a small or loaded machine, and this was neither. The margin is wide
enough that the concern is downgraded rather than closed, and the entry stays
readable for whoever meets a slower box.
