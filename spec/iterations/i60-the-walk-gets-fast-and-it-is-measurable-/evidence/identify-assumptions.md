---
form: identify-assumptions
by: agent
signed_off: 2026-08-24T15:16:52.167Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

THE SWEEP FOUND TWO NEW ASSUMPTIONS, and one of them is load-bearing for the whole round.

THE LOAD-BEARING ONE IS ABOUT THE INSTRUMENT. Every figure this round rests on came from one field on a call record, read as the caller's wait because that is the obvious reading. Nobody laid a second clock against it.

IF IT MEASURES A NARROWER SPAN, every number here is a floor rather than an estimate, and the round would be choosing its targets from the wrong distribution while pointing at a real problem.

THE SECOND IS ABOUT THE HOST. A requirement written this round leans entirely on the engine and the surface sharing one loop. That is believed on good grounds, stated in the craft guidance, consistent with the measurements, and unchecked by anybody here.

STANDING ASSUMPTIONS WERE NOT RE-IDENTIFIED, as this state's guidance asks. The one this round already opened stands and is probed at the next state along with these.

## assumptions

- raid-asm-the-recorded-duration-is-what-the-caller-actually-waited
- raid-asm-the-engine-and-the-surface-go-on-sharing-one-loop

## sweep

- environment: ONE FOUND, and it is the instrument itself. Every count in this round comes from the duration stamped on a call record, and what that field actually spans has never been checked against a second clock. It is written as its own entry because everything else here rests on it.
- toolchain: NONE. The timing uses the runtime's own clock, and no new tool, version or installed thing is relied on by any of the four rows. The runtime pin already stands and is checked at boot.
- host: ONE FOUND. The freeze row leans entirely on the engine and the surface being served from one loop, which is a property of how the lane is spawned rather than of anything in this tree. Four lane processes were observed on one machine sharing one port, so the arrangement varies more than anybody assumed.
- platform: NONE NEW, AND ONE STANDS ALREADY. Every measurement here was taken on one platform family, and a standing entry says the other family's branches have never run. That entry covers it, and duplicating it here would split one concern into two.
- neighbours: NONE. Nothing in the delta takes a guarantee from a datasheet. The one external promise in reach is the harness, and what it gives is already carried by a standing entry from the round that measured harnesses.
- people: NONE. The four rows demand nothing of a person's skill, patience or setup. The nearest thing is a person judging a wait, and that is already carried by a resident row about a slow act saying so.

## follow_up

PROBING COMES NEXT AND IT TAKES ALL STANDING ASSUMPTIONS, not only these two.

THE THREE THIS ROUND HAS OPENED SHARE ONE PROPERTY: each is checkable in a few calls, and each was written with its probe rather than with a promise to write one later.

THE ORDER THAT MATTERS. The instrument assumption is probed FIRST. If the recorded duration is not the caller's wait, the other two are being probed against numbers that need correcting, and the round's whole ordering rests on a distribution that would move.

## anything_else

