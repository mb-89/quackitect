---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: sty-the-control-that-says-why-it-declined
type: "[[story]]"
statement: When I press a control and nothing visibly happens, I want it to tell me why it declined, so I can act on the reason instead of guessing whether the product is broken.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

THE PROBLEM. A control that refuses a press and says nothing is
indistinguishable from a control that is broken, so the person stops trusting
the panel rather than learning its rule.
|||
THE DIAGNOSIS HELD, AND IT GAINED A MECHANISM. req-a-refused-act-says-why-and-what-next states the fault as a MISSING TRANSITION rather than a missing message: today a decline goes from `offered` back to `offered` with nothing emitted, a self-loop no observer can tell apart from the control never having been pressed. It is graded `corrosive`, because the act the person takes next to find out which it was can itself be destructive.

---

THE STARTING STATE. The mirror is open beside the drawing. The stop-at bank
shows four notches and the third, `bless`, is lit. The fourth, `blockers only`,
is drawn but does not respond. Nothing on the screen says whether that is a
rule or a fault.
|||
INVESTIGATED, AND HALF OF IT ELIMINATED. The stop-at investigation of 2026-08-17 proved the rung rule itself is sound at `bless`: the notch above the current one is reachable, never locked. That elimination now carries its own green case in `tests/legible-controls.test.ts`, so if it ever goes red the elimination was wrong and the search restarts there. What the elimination left behind was the rendering, and two faults in it.

---

STEP ONE. The person clicks `blockers only`. Today: nothing happens, no message
appears, and the notch stays where it was. After: the notch either takes the
press, or says in one line why it will not and what to press first.
|||
BUILT. The case `a locked notch names the notch that unlocks it` was authored RED against exactly this demand and now stands in the battery, which last ran 1403 tests across 134 suites with 0 failures. What it replaced: a title reading "unlock the rung below first" that never named WHICH rung, handing the person a rule where the requirement asks for a next act. NOT DEMONSTRATED — whether a person reads the new line and knows what to do is step one of machines/demos.md, and no run has happened.

---

STEP TWO. The person clicks it a second time to check whether the first click
registered. Today that second click is a real hazard — the panel's own history
records the emergency rung being DISARMED by exactly this, because a control
drawn in the wrong state turned a checking click into a release.
|||
BUILT, AND THE CAUSE WAS FOUND RATHER THAN GUESSED AT. `v.stop_at ?? 0` made "handed nothing" identical to "deliberately at zero" — the same shape that disarmed the emergency rung and blanked the shutdown row. The case `a bank handed no position is distinguishable from one sitting at zero` was authored RED against it and is green. A BELIEF WAS FALSIFIED GETTING THERE: that every host hands in every value the panel can draw. It does not, and raid-asm-every-host-hands-in-every-value-the-panel-can-draw carries the probe that settled it.

---

STEP THREE. The person reads the reason and acts on it. Either they press what
it named, or they learn the notch is unreachable from here and stop trying.
Either way they are not guessing.
|||
NOT ANSWERED BY ANY CHECK, and deliberately so. Every case in `tests/legible-controls.test.ts` reads the RENDERING — what the surface says. Whether the person UNDERSTOOD it is step 3 of tsp-a-decline-is-legible-to-the-person, which asks them what they think just happened before they are allowed to press again. That procedure has not been run.

---

THE RESULT. The person knows what the product did with their press, every time.
A control that declines is as legible as one that accepts, and no click is ever
spent finding out whether the last one landed.
|||
HALF EARNED, AND THE HALVES ARE WORTH SEPARATING. THE RUNG BANKS ARE COVERED: all three recorded sightings of this failure are in that family — the emergency rung, the shutdown row, the stop-at notch — and each now has a case. NOT EARNED ELSEWHERE: the requirement binds every control and an agent's typed refusals too, and the agent half is checked where refusals are built rather than by this spec. NOT DEMONSTRATED, and unlike the two i15 demonstrations nothing it needs is missing. It is runnable today and wants an hour of somebody's time.
