---
minted_in: i51
id: opt-the-figure-and-its-basis-are-two-fields
type: "[[option]]"
statement: the duration and the thing it was computed from are two separate fields on the entry, so a caller that wants a number gets one and a caller that wants to judge it gets the working
cluster: cluster-the-estimate
found_by: contradiction
source: "TRIZ separation IN SPACE, via meth-triz — improving 28 Measurement accuracy degrades 24 Loss of information, and both were assumed to apply to one sentence"
---

## Mechanism

TWO FIELDS WHERE THERE WAS ONE SENTENCE. The entry carries a duration in one
field and, beside it, what that duration was computed from.

The two move together or not at all. An entry with an empty basis field may not
carry a number, which is the honesty rule enforced by the shape rather than
restated as prose.

## The contradiction

Making the reported time remaining more specific makes the answer more
misleading.

IMPROVING is 28, Measurement accuracy. Its software equivalent in the vendored
grid is monitoring precision and metric granularity.

DEGRADING is 24, Loss of information. A bare number destroys the information
about its own uncertainty, and the reader cannot recover it.

THE MEASUREMENT MAKES THIS REAL RATHER THAN THEORETICAL.
`raid-asm-battery-timings-measure-work` recorded summed case time of 1,534,695
ms against a wall of 76,985 ms. A figure computed from that instrument is
precise and wrong at the same time.

## The separation

IN SPACE. Both demands were assumed to apply to ONE artifact: a sentence
saying how much longer.

They need not. The number lives in one field. What it was computed from lives
in another, beside it.

A caller that acts on durations reads the first and is not slowed down. A
caller deciding whether to believe it reads the second and can.

## What it buys

The precision is untouched. The number is as specific as the arithmetic
allows.

The honesty is untouched too. Nothing is rounded off or hedged into
uselessness, which is the compromise this separation refuses.

AND THE NO-BASIS CASE FALLS OUT FOR FREE. An entry with an empty basis field
is exactly the entry that must not carry a number, so the shape enforces
`req-a-time-remaining-names-its-basis` rather than restating it.

## Why no principle lookup was needed

The separation dissolved it. Had it failed, row 24 against column 28 in the
vendored grid would name the principles that historically worked.

## What it would cost

One more field on every entry, and a rule that the two move together. A design
that lets the basis field go stale while the number updates has kept the
precision and lost the point.

## The disclosure that travels with this cell

ADDED AT i51's GRAFT, after a re-scoring agent found this cell moved onto
another candidate and left its disclosure behind.

A RECOMPUTED FIGURE MAY GO UP BETWEEN TWO ASKS. Where the work slows, the
remaining time grows and the entry reports the larger number.

THE DESIGN SAYS SO RATHER THAN HIDING IT behind a counter that only falls. A
counter that only falls is lying about a cost that depends on things nobody has
measured yet.

WHY THIS BELONGS ON THE CELL AND NOT ON A CANDIDATE. It lived in one
candidate's prose, so grafting the cell onto another candidate carried the
mechanism and dropped the warning. A property of a cell travels with the cell.

`opt-the-estimate-may-rise-and-says-so` carries the full argument and its
prior art. This paragraph exists so that whoever takes this cell cannot take it
without meeting the consequence.

## What it does not solve

It does not make the instrument better. The basis field says the estimate came
from timings this project already calls unreliable, which is honest and still
unreliable.

Repairing the instrument is explicitly out of scope, and this option is why
that exclusion is survivable.
