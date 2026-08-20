---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: req-a-refused-act-says-why-and-what-next
type: "[[requirement]]"
statement: If the product refuses an act on a control, then the product shall show the reason and the act that unlocks it, on the same surface, before the actor acts again.
kind: functional
verify_method: test
breaks_if_removed: A refused control is indistinguishable from a broken one, so the person spends further acts discovering which it was — and one of those acts can itself be destructive.
breaks_how_badly: corrosive
priority: must
refines:
  - uc-act-on-a-control-and-know-what-it-did
source_refs:
  - sty-the-control-that-says-why-it-declined
  - vp-rigor-without-toil
  - raid-risk-an-honest-slow-interface-becomes-noise-nobody-reads
---

## Detail

WHAT COUNTS AS THE REASON. One line naming why this act was not taken. A
refusal that says only that it was refused satisfies nothing here.

WHAT COUNTS AS THE NEXT ACT. Either the act that unlocks this one, or a plain
statement that none exists from here. Both are answers; silence is not.

THE SAME RULE BINDS FOR AN AGENT, and this row does not split into two. An
agent receives the reason and the next act as a FACT on the result rather than
as a rendering, which is what the lane's typed refusals already do — the clause,
what was expected, what it got, and an executable remedy. A surface a person
touches owes the same content in its own form.

| actor | the reason arrives as | the next act arrives as |
| --- | --- | --- |
| a person | a line on the surface holding the control | the control to press, or a statement that none exists |
| an agent | a field on the refusal | an executable remedy |

THE CUMULATIVE CASE IS STILL A REFUSAL. A rung reachable only from the one
below it declines by design. Design is a reason, not an exemption, and it owes
the same line.

WHERE THE REASON CANNOT BE COMPUTED AT THE SURFACE, that much is said and the
place holding the answer is named. Going silent is the failure this row exists
to stop.

## Behaviour

A MODEL EARNS ITS PLACE HERE, because the failure is a missing transition
rather than a missing response.

    (nothing)   -> offered:  the surface draws the control
    offered     -> taken:    the act is legal and lands
    offered     -> declined: the act is refused, WITH a reason and a next act
    declined    -> offered:  the actor reads the reason and the control stands again

THE TRANSITION THIS ROW ADDS IS THE THIRD ONE. Today a decline goes from
`offered` back to `offered` with nothing emitted, which is a self-loop that no
observer can distinguish from the control never having been pressed.

THE PARTICIPANT TEST PASSES: every participant is created by something the
model shows. The control is created by the surface drawing it.
