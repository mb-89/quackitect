---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so
type: "[[raid]]"
kind: risk
statement: A complexity rung is authored once and never contradicted by anything, so a state rated too high spends the difference on every walk forever while raising no signal at all.
owner: the owner
trigger: the moment the first rating lands, and again the first time anyone asks what a rung has cost
status: open
impact: The spend is silent and permanent. A state rated two rungs above its work costs the difference on every future walk of every future record, and no call, no gate and no retro has anything to compare the rating against.
breaks_how_badly: corrosive
how_likely: expected
looked: 2026-08-20
probe: "MEASURED IN THIS RECORD'S OWN EVIDENCE AT M4 PROBE 3, 2026-08-20, and the ratchet is not hypothetical here. Of i38's 27 evidence forms, 17 have two or more commits — a signing, a reopen and a re-signing. Every one of the 17 GREW between its first signed body and its last: 21 lines to 29, 29 to 54, 31 to 43, 180 to 182. Not one shrank. That is the same asymmetry this risk describes, running inside the record that describes it: raising is cheap and safe, lowering needs an argument, so the only direction anything moves is up. SCANNED AT THE i38 KICKOFF GATE, 2026-08-20, against systems that have run this design for years. Kubernetes refuses to let anyone declare a QoS class at all — it is computed from requests and limits, so the class is a consequence of measurable quantities rather than a label an author types. Google's Autopilot measured hand-managed jobs at 46% slack against 23% for machine-corrected ones. A 2026 report across more than 23,000 production clusters found 69% of requested CPU unused, with the stated cause that the declarations are rarely updated after they are first written. Every shipped LLM router found in the same scan computes its estimate at runtime and is corrected by an outcome signal; every agent framework declares statically, as we do, and none of them measures the result."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: none
weighs_against: none
---

## The asymmetry that makes the drift one-directional

UNDER-DECLARATION FAILS LOUDLY AND OVER-DECLARATION FAILS SILENTLY. Ask a
scheduler for too little memory and the job is killed. Ask for too little
walltime and it is killed. Name a runner label that does not exist and the job
hangs and is cancelled on a clock.

ASK FOR TOO MUCH AND NOTHING HAPPENS EXCEPT THAT YOU PAY.

THAT IS WHY EVERY MEASURED STUDY FINDS THE DRIFT RUNNING THE SAME WAY. It is
not that people are careless upward and careful downward; it is that only one
of the two mistakes ever tells them.

OURS HAS EXACTLY THAT SHAPE. A state rated C1 that is really C4 will produce
bad work somebody notices. A state rated C4 that is really C1 produces good
work, expensively, forever.

## The bounded fan-out multiplies it rather than containing it

A SUBMACHINE TAKES THE MAXIMUM OVER ITS ITEMS and one walker strong enough for
the hardest walks all of them. That is the right call for correctness and it is
the wrong shape for this risk: one hard item does not cost one expensive walk,
it costs N of them.

SO THE PER-ITEM VALUES EARN THEIR KEEP TWICE. They feed the maximum, and they
are the only place a reader can see how much of the submachine did not need
the walker it got.

## What would make it not happen

- THE RUNG IS DERIVED RATHER THAN TYPED. If every state must name what will
  judge its output, a machine checker caps the rung and only a reader-judged
  state can reach the top. Then the rung is a consequence of a fact that can be
  tested, and a wrong rung is a bug rather than an opinion.
- OR THE RUNG IS RECONCILED AFTER THE FACT. Record the declared rung beside an
  outcome signal — a retry, a rejection, a reviewer's rework, an override — and
  report the states whose rung has never once been contradicted. Those are the
  candidates to demote, and today nothing would ever name them.

NEITHER IS IN SCOPE AT M0. Both are named so the design states below choose
deliberately rather than by omission.
