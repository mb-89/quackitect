---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it
type: "[[raid]]"
kind: risk
statement: "The one safety rule in the driver design — a stronger model needs no argument, a weaker one needs a recorded reason — is a convention with no mechanism behind it, asked of exactly the actor it exists to catch."
owner: the owner
trigger: "the first walk that runs a state below its recommended rung, and the first time a form is submitted with no reason where one was owed"
status: open
impact: "The rule fails in the one case it was written for. A cheap model that talks itself into staying cheap produces a walk that looks compliant, and the field that should carry the dissent is simply empty."
breaks_how_badly: crippling
how_likely: plausible
probe: "READ THE DESIGN AND THE ENGINE AT THE i38 KICKOFF GATE, 2026-08-20. The asymmetry is stated as a ruling and nothing in the engine holds it: there is no field declared for the reason, no refusal clause covering its absence, and no comparison between a recommended rung and what actually walked. IT ALSO DEPENDS ON A SECOND THING THAT IS NOT ESTABLISHED — knowing which model answered, which today is self-reported and which this register already carries as an open assumption. So the rule rests on a value the system cannot check, judged by the party being judged."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
  - raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it
weighs_with: raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it
weighs_against: none
---

## The shape of it

THE RULING IS SOUND AND THE ASYMMETRY IS THE RIGHT ONE. Over-driving a state
wastes money; under-driving it produces a plausible wrong answer that passes
every automated check, which is the whole reason C3 and C4 exist as separate
rungs.

WHAT IS MISSING IS THE THING THAT MAKES A RULE A RULE. Every other judgment in
this system that matters has a mechanism: a gate refuses without its evidence,
a claim reopens when its input moves, a note cannot be minted carrying its own
source's words. This one has a sentence.

## Why a convention is not enough here specifically

THE RULE IS ADDRESSED TO A PARTY WHOSE INTEREST RUNS THE OTHER WAY. It asks
whatever is walking to notice that it is weaker than the work and to say so.
An agent that is in fact too weak for the state is, by construction, the one
least likely to notice.

THIS IS NOT A CLAIM ABOUT DISHONESTY. It is the same reason a checker exists
anywhere: a wrong answer that looks right does not announce itself, least of
all to the thing that produced it.

## What would make it not happen

- A DECLARED FIELD FOR THE REASON, so its absence is a shape the engine can
  see rather than a silence.
- A COMPARISON AT THE POINT OF WALKING: the recommended rung is known and what
  answered is stamped, so the gap is computable the moment the second half is
  trustworthy.
- A REFUSAL, if the gap is real and the reason is missing. That is the ordinary
  shape of every other rule here, and it is what would move this from a
  convention to a mechanism.
