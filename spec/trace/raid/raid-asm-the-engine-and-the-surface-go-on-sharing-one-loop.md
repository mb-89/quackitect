---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-asm-the-engine-and-the-surface-go-on-sharing-one-loop
type: "[[raid]]"
kind: assumption
statement: "The engine that answers a walker and the server that answers a surface go on being served from one loop, so work done for one is time taken from the other."
owner: the driving agent
trigger: any change that moves either half onto its own process or thread, including one made by a sibling round
status: probed
probe: "HOLDS, 2026-08-24, at three times baseline after a confound was removed at the gate. FIRST PASS, WRONG - it counted 89 of 453 overlaps as 19.6 per cent against a 4.4 per cent baseline, and offered two near-identical durations as its sharpest evidence. A reviewer showed those pairs are the surface reporting the very call it was CARRYING, which proves nothing about contention. CORRECTED - excluding pairs whose durations agree within 200 ms leaves 69 genuinely different requests, and widening the baseline by the mean surface report of 7,966 ms gives 5.0 per cent. 15.2 against 5.0 is threefold. THE EVIDENCE IS NOW THE RIGHT SHAPE - a 2,415 ms surface request caught inside a 20,010 ms engine call, and a 46,161 ms one inside a 104,421 ms call. WHAT IS NOT SETTLED - four fifths of surface slow reports coincide with nothing, so the surface is also slow on its own account."
probed: 2026-08-24
impact: "A requirement was written to stop a slow act freezing the surface. If the two stop sharing a loop, that row is satisfied by something nobody built and the round would have spent design effort on a coupling that had already gone."
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - req-a-slow-answer-does-not-freeze-the-surface-beside-it
  - uc-drive-the-machine-at-the-pace-of-thought
---

## Why it is written down

THE FREEZE REQUIREMENT LEANS ENTIRELY ON IT. If the two halves were independent,
a slow act could not take the screen down and that row would demand nothing.

IT IS BELIEVED ON GOOD GROUNDS AND STILL NOT CHECKED. The craft guidance states
it as a known cause, saying a blocking call in the server that serves the page
takes down every surface at once. The measurements are consistent with it: a
110-second request and a 92-second page render in the same window.

CONSISTENT IS NOT THE SAME AS ESTABLISHED. Nobody on this round read the
serving code to confirm the two share a loop today.

## Why it belongs to the HOST source rather than the environment

THE ARRANGEMENT IS NOT OURS ALONE. How the lane is spawned, and whether the
surface is served from the same process, is decided partly by the harness that
starts it. This round observed four lane processes on one machine sharing one
port, which is evidence that the arrangement varies more than anybody assumed.

## What makes it plausible rather than expected

A SIBLING ROUND COULD MOVE IT. One of the two rounds running alongside this one
owns the lifecycle of background work, and separating long work from the serving
path is a natural thing for it to do. That would falsify this without anybody
here touching it.

THAT IS WHY THE TRIGGER NAMES A SIBLING EXPLICITLY. The usual failure is an
assumption falsified by a neighbour and nobody noticing.

## Probe

READ THE SERVING CODE and answer one question: is the surface's request handled
on the same loop that answers a walker's call.

CONFIRM IT BEHAVIOURALLY TOO, because reading can mislead. Hold one engine call
past its bound deliberately, and request a surface alongside it. If the surface
waits, they share. If it answers, they do not.

WHAT CONFIRMS IT. Both the reading and the behaviour say one loop.

WHAT FALSIFIES IT. The surface answers while the engine is held. The freeze row
then has nothing to demand and should be struck rather than left standing as a
row nothing can fail.

WHO CHECKS IT. The driving agent, before designing anything against the
coupling, and again if either sibling round lands a change to how work is
spawned.

## Probed 2026-08-24, and it HOLDS

RUN ON RECORDED DATA rather than with a new instrument, because both halves
already log themselves with timestamps and durations.

THE METHOD. Take every engine call that ran twenty seconds or longer. Take
every slow request the surface reported about itself. Ask how many of the
second overlap the first, and compare that against how much of the window the
long calls cover at all.

THE FIRST PASS WAS WRONG AND A REVIEWER CAUGHT IT. Both its error and its
correction are kept here, because the corrected number only means something
beside the one it replaced.

WHAT THE FIRST PASS SAID. 89 of 453 surface slow-reports overlap a long engine
call, 19.6 per cent against a 4.4 per cent baseline, four and a half times. Its
sharpest evidence was two pairs of near-identical durations, 44,067 against
44,065 and 20,015 against 20,010.

WHY THAT EVIDENCE WAS THE CONFOUND RATHER THAN THE PROOF. The surface is the
TRANSPORT that carries a lane call. So every long engine call mechanically mints
a matching surface slow-report, and a pair agreeing to two milliseconds is one
request counted twice rather than two things competing.

## The corrected numbers

EXCLUDE ANY PAIR WHOSE DURATIONS AGREE WITHIN 200 MS, which is the test for one
event seen twice.

- 89 overlaps, of which 20 are self-pairs. That is 22 per cent of them.
- 69 are genuinely different requests. That is 15.2 per cent of all 453.
- The baseline is widened by the mean surface report, 7,966 ms, because an
  interval overlaps a window more readily than an instant does. That gives 5.0
  per cent rather than 4.4.

FIFTEEN AGAINST FIVE IS THREEFOLD. Smaller than the first pass claimed and in
the same direction.

THE EVIDENCE IS NOW THE RIGHT SHAPE. A 2,415 ms surface request answered inside
a 20,010 ms engine call. A 46,161 ms one inside a 104,421 ms call. Different
durations, so different requests, so genuinely one waiting on the other.

## What this settles and what it does not

SETTLED: the coupling is real at threefold, so the requirement written against
it demands something rather than nothing.

WHAT `probed` MEANS ON THIS NODE, said plainly because a form once claimed the
opposite. It is the date the entry was last EXAMINED, not a certificate that a
check succeeded. The outcome lives in the probe field beside it, and on the two
sibling entries that outcome is unprobed and scheduled.

NOT SETTLED: whether every surface path shares the loop or only the ones
measured here. Four fifths of the surface's slow reports did NOT coincide with
a long engine call, so the surface is also slow on its own account, and that
half belongs to the resident row about a surface answering in a second.

THE TRIGGER STILL STANDS. A sibling round moving long work off the serving path
would falsify this, and the date above is when it was last true rather than a
verdict for ever.