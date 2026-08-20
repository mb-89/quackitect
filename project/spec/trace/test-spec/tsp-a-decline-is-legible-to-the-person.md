---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-a-decline-is-legible-to-the-person
type: "[[test-spec]]"
statement: A person presses a control that declines, and the surface tells them why and what would let it through.
method: demonstration
demonstrates:
  - sty-the-control-that-says-why-it-declined
verifies: "none — demonstrates carries the edge; the three requirements behind this story are verify method test and are carried by tsp-a-control-is-legible"
files:
  - none — the procedure below is the definition, because the pass is what a person can tell from the screen
---

## Scope

One person, one session, the rung banks on the mirror. Step one of the demo
drawing at `machines/demos.md`.

WHY DEMONSTRATION AND NOT TEST. The test half is already built and green.
`tests/legible-controls.test.ts` asserts that a locked notch names the notch
that unlocks it, and that a bank handed no position is distinguishable from one
sitting at zero. Those assertions read the RENDERING.

What no assertion reads is whether the person who pressed the control
understood what happened. That is this procedure's whole subject.

## Approach

OBSERVED, WITHOUT INSTRUMENTED CAPTURE. One watcher, one driver, about an hour.

THE DRIVER IS NOT TOLD WHICH CONTROLS DECLINE. Handing them the rule first
would test whether they can follow instructions, not whether the surface
teaches its own rule.

## Procedure

1. OPEN THE MIRROR beside a walk that stands mid-iteration.
   - OBSERVE: the stop-at bank draws four notches and one of them is lit.
2. PRESS A NOTCH THAT IS NOT REACHABLE FROM THE CURRENT ONE.
   - PASS: within one line, the surface says why the press did not land AND
     names the act that would let it through.
   - FAIL: nothing appears, or a rule appears with no next act. "Unlock the
     rung below first" without naming which rung is a FAIL.
3. ASK THE DRIVER, BEFORE THEY PRESS AGAIN, what they think just happened.
   - PASS: they can say why it declined and what to do next.
   - FAIL: any answer of the form "I am not sure if it is broken".
4. WATCH WHETHER THEY PRESS THE SAME CONTROL A SECOND TIME.
   - This is the hazard the story names. The panel's own history records the
     emergency rung being DISARMED by a checking second click.
   - PASS: they do not need a second press to find out whether the first
     landed.

## What makes this pass or fail

PASS when every declined press leaves the driver able to state the reason and
the next act, and no press is spent finding out whether the last one landed.

FAIL on any silent decline, and on any driver who reaches for a second press to
check the first.

## Its state, said rather than left blank

NOT RUN. Nobody has scheduled it. It needs a person at this machine for about
an hour, and its debt sits in
raid-debt-ten-checks-wait-on-a-person-or-a-second-machine.

WHAT IT LEANS ON: nothing that does not exist. The build is in and its test
half is green, so this procedure is runnable today. That is what separates it
from the two i15 demonstrations, which wait on a verb nobody has written.
