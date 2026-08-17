---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: raid-asm-the-slow-phase-is-the-green-derivation-repeated
type: "[[raid]]"
kind: assumption
statement: The machine phase's cost sits in one derivation repeated — is this state green, once per state per render — so splitting the phase will show drawingSets and stateDetails holding over 90 percent of it and the SVG under 50 ms.
owner: the driving agent
trigger: the first split of the machine phase into its four parts, which this iteration names as its first move
status: open
impact: "Spread evenly across states means the DAG is the right instrument and milestones three and four are aimed correctly. Concentrated in one call means a targeted fix is right and the DAG is the wrong instrument, so the modelling work would be aimed at the wrong thing. The iteration's own vision states both readings."
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
