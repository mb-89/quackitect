---
minted_in: i51
id: opt-the-judgment-is-owed-at-the-leaving-not-at-the-asking
type: "[[option]]"
statement: the leaving judgment is owed at the moment the walk actually leaves, not at the moment somebody asks to leave, so the asking is answered at once and the judgment takes as long as it takes
cluster: cluster-the-handback
found_by: contradiction
source: "TRIZ separation IN TIME, via meth-triz — improving 27 Reliability degrades 9 Speed, and the two demands were assumed to apply at one moment"
---

## Mechanism

TWO MOMENTS WHERE THERE WAS ONE. The asking is answered as soon as the
judgment has been STARTED. The judgment is owed only by the time the walk
actually leaves.

Between those moments the step stands in a third condition, neither passed nor
failed, and that condition is published to every reader of the step.

## The contradiction

Reaching the leaving judgment thoroughly makes the walk attempt slow.

IMPROVING is 27, Reliability. Its software equivalent in the vendored grid is
reliability and uptime, and here it is whether a step that says it passed
really did.

DEGRADING is 9, Speed. Its software equivalent is response time, and the
measured response was sixty-eight seconds.

## The separation

IN TIME. Both demands were assumed to apply at ONE moment: the moment the
walker asks to leave.

They never did. The judgment has to be reached before the walk LEAVES. Nothing
requires it to be reached before the asking is ANSWERED.

Those are two different moments, and the whole conflict lives in treating them
as one.

## What it buys

The thoroughness is untouched. The judgment may take ten minutes, which is
what the engine's own kill timer already allows.

The answer is untouched too. Nobody gets a green they did not earn, because
the walk still does not leave until the judgment lands.

WHAT DISAPPEARS IS THE WAITING, and it disappears without either side paying.

## Why no principle lookup was needed

The separation dissolved it. Had it failed, row 9 against column 27 in the
vendored grid would name the principles that historically worked.

## What it would cost

Two moments where there was one means a state can stand between them, and that
is the third value `flow-step-standing` needs.

The cost is real and it is this iteration's central risk. It is not a cost the
separation invented; it is what the separation makes visible.

## The same shape has been used here before

`opt-answer-carries-a-reference` is a separation in space on this engine, and
the method card's own worked example is a separation in time on the claim
check.

Three separations on one engine is either a habit or a signal that the engine
keeps assuming two demands share a moment.
