---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-a-control-is-legible
type: "[[test-spec]]"
statement: A control says what it did with an act — taken or refused — and a refusal names the act that unlocks it.
method: test
verifies:
  - req-a-refused-act-says-why-and-what-next
  - req-a-surface-shows-the-state-an-act-produced
  - req-a-control-that-undoes-on-a-second-press-says-so-first
files:
  - deliverable/tests/legible-controls.test.ts
---

## Scope

The rung banks, as the panel spec draws them through `renderPanel`. They are
the control family where every recorded failure of this kind has happened:
the emergency rung, the shutdown row, and the stop-at notch reported on
2026-08-17.

WHY THIS LEVEL. The defect is in what the rendering SAYS, and the rendering is
a pure function of the panel spec and the values handed in. That is the lowest
level that can catch it, so it is where the cases sit.

## Approach

TEST-FIRST, and two of the four cases are RED on purpose at authoring time.
They state what the requirements demand before the build exists, which is the
whole point of this state.

TWO ARE GREEN AND THEY ARE NOT PADDING. One guards an elimination: the
stop-at investigation of 2026-08-17 proved the rung rule itself is sound at
`bless`, which is what pushed the search past this file. If that case ever goes
red, the elimination was wrong and the search restarts here. The other records
that a cumulative control already warns before its releasing press.

## Steps

Each case in the named file is one step, and the case name states its claim.

1. `the notch above the current one is reachable, never locked` — GREEN.
   The regression guard for the elimination.
2. `a rung that is on says a press releases it, before the press` — GREEN.
   req-a-control-that-undoes-on-a-second-press-says-so-first, already met for
   this family.
3. `a locked notch names the notch that unlocks it` — RED.
   req-a-refused-act-says-why-and-what-next. Today the title says "unlock the
   rung below first" and never names which, so the person is handed a rule
   rather than a next act.
4. `a bank handed no position is distinguishable from one sitting at zero` —
   RED. req-a-surface-shows-the-state-an-act-produced. Today `v.stop_at ?? 0`
   makes "handed nothing" identical to "deliberately at zero", which is the
   exact shape that disarmed the emergency rung and blanked the shutdown row.

## What this spec does not cover

THE AGENT HALF of req-a-refused-act-says-why-and-what-next. That row binds an
agent as well as a person, and an agent receives the reason as a field on a
typed refusal rather than as a rendering. The lane's refusals already carry a
clause, an expectation, what it got and an executable remedy, and they are
checked where those refusals are built rather than here.

THE POST AND THE STORED VALUE. This spec drives the rendering only. The stop-at
fault of 2026-08-17 was pushed past the rendering by the probe at
raid-asm-every-host-hands-in-every-value-the-panel-can-draw, and what remains
of it is not this spec's subject.
