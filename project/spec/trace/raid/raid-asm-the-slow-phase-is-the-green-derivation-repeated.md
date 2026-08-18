---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: raid-asm-the-slow-phase-is-the-green-derivation-repeated
type: "[[raid]]"
kind: assumption
statement: The machine phase's cost sits in one derivation repeated — is this state green, once per state per render — so splitting the phase will show drawingSets and stateDetails holding over 90 percent of it and the SVG under 50 ms.
owner: the driving agent
trigger: the first split of the machine phase into its four parts, which this iteration names as its first move
probe: "Split the machine phase into its four parts and read the split against two numbers — drawingSets and stateDetails holding over 90 percent of it, and the SVG under 50 ms. Spread evenly across states means the DAG is the right instrument. Concentrated in one call means a targeted fix is, and the modelling is aimed at nothing. SCHEDULED 2026-08-17 for M6: the probe is four lines of code rather than a reading, and a probe needing a change to the product is M6's work by this method's own rule."
status: probed
probed: 2026-08-17
impact: Spread evenly across states means the DAG is the right instrument and milestones three and four are aimed correctly. Concentrated in one call means a targeted fix is right and the DAG is the wrong instrument, so the modelling work would be aimed at the wrong thing. The iteration's own vision states both readings.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - i12
  - note-afb66f5e0dee
  - req-call-answers-in-one-second
---

## The assumption

THE VISION PUTS A PREDICTION ON THE RECORD so it can be wrong in public, and
this row is that prediction made checkable.

The claim is that the slow surface is ONE derivation repeated: is this state
green, asked once per state per render, when at most one state moved since the
last render. It is located at `render.ts` lines 3699 to 3724, in `drawingSets`
and `stateDetails`.

WHAT THE VISION ALREADY RULED OUT, and this row does not re-open: the compile
measures 3.4 ms, `machineSvg` consumes an existing canvas and reads no disk,
the corpus is 4.3 ms warm with a data phase of 0.2 ms, and the cubic comparison
walk is about 2 ms a question.

## Probe

SPLIT THE `machine` PHASE INTO ITS FOUR PARTS. The vision calls this four lines
of work and says the mechanism is already inside the function.

Then read the split against two numbers:

- `drawingSets` and `stateDetails` together hold over 90 percent.
- The SVG is under 50 ms.

## Why it is an assumption and not a plan

BOTH OUTCOMES ARE ACTIONABLE AND THEY POINT OPPOSITE WAYS.

SPREAD EVENLY ACROSS STATES means the repetition is real, and the DAG is the
answer. `downstreamCone` already exists in `engine/machine.ts` and is already
imported into `session.ts` — the engine knows what a change reaches and uses it
to invalidate. The missing half is the memo on the other side of the same edge.

CONCENTRATED IN ONE CALL means a targeted fix is the answer and the DAG is the
wrong instrument. Building the memo would then be work that measures nothing.

SO THE PROBE DECIDES THE SHAPE OF MILESTONES THREE AND FOUR, and it costs four
lines. That is why it is the first move rather than a later check.

## What it does not cover

THIS ROW IS ABOUT THE SURFACE, and the worst measured breach is not a surface.
The lane's own door answered a single POST in 33,461 ms and again in 12,337 ms.
A pull walking ZERO hops still cost 5989 ms.

Those have their own cause and their own note (note-afb66f5e0dee, the pull
replaying instead of resuming). A green result on this probe says nothing about
them.

## Probed 2026-08-17 — HOLDS, and by more than it predicted

THE INSTRUMENT WAS BUILT at i33's first build chunk and the reading was taken
after the engine reloaded onto it. Two consecutive renders of /widget/machine:

| part | run 1 | run 2 | share of the total |
| --- | --- | --- | --- |
| machine.sets | 89.31 ms | 93.98 ms | 79 to 82 percent |
| machine.states | 23.24 ms | 19.96 ms | 17 to 21 percent |
| machine.svg | 0.56 ms | 0.35 ms | under half a percent |
| machine.rest | 0.005 ms | 0.006 ms | nothing |
| machine, total | 113.11 ms | 114.30 ms | |

## Both pass lines are met

DRAWING SETS PLUS STATE DETAILS HOLD OVER 90 PERCENT. Measured at 99.5 and
99.7 percent. The prediction said over 90 and the answer is that they are
virtually the whole phase.

THE SVG IS UNDER 50 MS. Measured at 0.56 and 0.35 ms, which is two orders of
magnitude under the line rather than merely inside it.

## What it settles, and it is the thing the iteration turns on

THE DAG IS THE RIGHT INSTRUMENT. The vision named two readings and their
consequences: spread across states means the repetition is real and the memo on
the other side of the downstreamCone edge is the answer. Concentrated in one
call would have meant a targeted fix and a wrong instrument.

IT IS SPREAD. drawingSets is the dominant cost and it is exactly the derivation
the vision named — is this state green, asked once per state per render, when
at most one state moved since the last one.

SO MILESTONES THREE AND FOUR ARE AIMED CORRECTLY, and this row stops being the
thing they wait on.

## One number worth carrying forward

STATE DETAILS IS A FIFTH OF THE PHASE AND WAS NOT NAMED AS A SUSPECT. The
vision put drawingSets and stateDetails together in one prediction; the split
shows drawingSets at four times stateDetails. A fix aimed only at the larger
one leaves a fifth of the cost standing, and that is worth knowing before the
work rather than after.

## A second reading, and it says WHERE the repetition is

TAKEN 2026-08-17, on the derivation itself rather than on the render. One
green computation over a 200-node corpus makes 245 reads through the file
door. That is ONE sweep, not fifteen: the corpus, plus the root's own nodes,
plus each state instance and its templates on top.

IT DOES NOT CONTRADICT THE ROW ABOVE, and the two together are sharper than
either alone. Inside one green computation the input is read once. The
repetition this row names is a level up: the render asks the green question
once per state, and each of those asks is a whole clean derivation.

SO A FIX AIMED INSIDE THE DERIVATION BUYS NOTHING. It already reads its input
once, and req-one-operation-reads-its-input-once now guards that with a counter
rather than a clock. The cost is the NUMBER OF ASKS, which is what the memo on
the other side of the downstreamCone edge removes. That is the same conclusion
the split reached, arrived at from the other end.
