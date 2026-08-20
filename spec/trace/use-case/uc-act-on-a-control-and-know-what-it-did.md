---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: uc-act-on-a-control-and-know-what-it-did
type: "[[use-case]]"
statement: Act on a control and know what the product did with the act, whether it took it or refused it.
actor: stk-engineer-driving-agents
trigger: the person acts on any control the product offers
precondition: the surface holding the control is open
guarantee: the person can tell from the surface alone whether the act landed, and a refused act carries the reason and what to do instead
refines:
  - sty-the-control-that-says-why-it-declined
priority: must
---

## Why this is its own use case

THE NEAREST NEIGHBOURS WERE CHECKED AND NEITHER FITS.

uc-set-the-autonomy covers one control's SEMANTICS — what the setting means
and how the walk weighs against it. It says nothing about whether an act on it
is legible.

uc-quality-interaction-capability covers the NEWCOMER learning the machine.
Its actor is stk-newcomer and its scenario is a first session. This one is a
person who already knows the product and cannot tell what their click did.

SO THE GOAL IS DIFFERENT AND THE ACTOR IS DIFFERENT, which is the Cockburn
test for a separate use case.

## Main scenario

1. The person acts on a control.
2. The product takes the act, or refuses it.
3. The surface shows which of the two happened, within the bound named for a
   look.
4. Where it was taken, the surface shows the new state rather than the old one.
5. Where it was refused, the surface says why and what would make it possible.
6. The person acts on that answer without needing a second act to discover it.

## Extensions

- 2a. The act is legal but its effect is not yet visible, because the surface
  redraws from stale values. The person reads an unchanged control as a
  refusal, and the next act is taken against a state that no longer holds.
- 2b. The refusal is by design and cumulative — a rung reachable only from the
  one below it. It is still a refusal to the person, and it still owes the
  reason and the next step.
- 3a. The act is destructive when repeated. A checking click must never be the
  thing that undoes the first one; where a control cannot be safely re-pressed,
  it says so before the second press rather than after.
- 5a. The reason cannot be computed at the surface. Then the surface says that
  much, names where the answer is, and does not go silent.
- 6a. The person is an AGENT rather than a person. It needs the same answer as
  a fact rather than as a rendering, and the same rule holds: an act that did
  nothing must never be indistinguishable from one that worked.
