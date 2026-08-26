---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all
type: "[[raid]]"
kind: dependency
restated: 2026-08-20 — the payoff waits on the walker delegating to a subagent on a named model, not on a weak model booting a different walker. The delegation path exists and carries an owner grant; what is missing is anything making the walker use it.
statement: Routing a cheaper driver to a cheaper state is worth nothing while a standing crippling issue says a weaker model cannot produce the boot reading proof at all, so this iteration's payoff waits on a door somebody else owns.
owner: the owner
trigger: the first attempt to actually run a state on a model below the session default, and any close or re-probe of raid-the-read-proof-locks-weaker-models-out-of-the-system
status: open
impact: The mechanism can be built, tested and shipped in full and still deliver no saving, because the models it would route work to cannot reach the first state of any session. The value proposition it serves is unreachable until the boot door opens.
breaks_how_badly: crippling
how_likely: expected
probe: FOUND BY SWEEPING THE STANDING REGISTER AT i38's MOTIVATION GATE, 2026-08-20, after the log-risks form claimed a re-read it had not performed. raid-the-read-proof-locks-weaker-models-out-of-the-system, minted in i28 and still open, is graded crippling and expected, and states in its own words that weaker models cannot produce the boot reading proof at all — that the first step of the first thing every machine does makes the system unavailable to them entirely. raid-asm-refusals-recover-a-weak-model stands beside it, open, and its own probe records that the one measurement taken was against a model that was not weak.
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
  - raid-the-read-proof-locks-weaker-models-out-of-the-system
  - raid-asm-refusals-recover-a-weak-model
  - vp-rigor-without-toil
weighs_with: raid-the-read-proof-locks-weaker-models-out-of-the-system
weighs_against: none
---

## Why this is a dependency and not a risk

NOTHING HERE MIGHT HAPPEN. The door is shut today, the entry saying so is open
today, and it is owned by somebody other than this iteration.

WHAT i38 CONTROLS is whether the machine can say which driver a state needs.
WHAT IT DOES NOT CONTROL is whether the named driver can walk in.

## What it does not undermine

THE MECHANISM IS STILL WORTH BUILDING and the sequencing is defensible. The
ladder, the list and the stamp are useful the moment anything can act on them,
and the boot door is a separate, already-registered piece of work.

AND SOMETHING CAN ACT ON THEM TODAY, corrected 2026-08-20. This entry was read
across the whole comparison as blocking every acting line on a capability nobody
has. It does not. A walking agent that reads "this step needs a stronger hand"
hands that step to a subagent on one — contract rule 11 and
`guidance/method/subagents.md` § Which model. What still waits on the
boot door is a WEAK WALKER STARTING AT ALL, which is a narrower dependency than
this entry was quoted for.

IT ALSO CUTS THE OTHER WAY. Until something names which states are cheap, there
is no argument for spending effort on the boot door, because nobody can say
what opening it would buy. The two entries want each other.

## What this iteration owes because of it

SAY IT IN THE PITCH RATHER THAN IN A FOOTNOTE. A value proposition whose payoff
waits on somebody else's open issue is still worth stating; one that reads as
though the payoff arrives on ship day is a promise the tree cannot keep.

AND DO NOT LET THE FIRST MEASUREMENT BE TAKEN AGAINST A MODEL THAT IS NOT WEAK.
The assumption beside this one already records that mistake being made once.

## How this was missed

THE log-risks FORM SAID THE STANDING REGISTER WAS RE-READ AND IT WAS NOT. It
said, in as many words, that nothing in the standing register was re-derived —
which is true and is not the same thing, and reads as though the sweep happened.

THE STATE'S OWN GUIDANCE ASKS FOR THE RE-READ IN PLAIN WORDS: the standing
register is re-read, not re-derived. A search of the register for this
iteration's own subject words surfaces four entries in seconds, two of them
open and both directly on the payoff.

IT WAS CAUGHT BY AN ADVERSARIAL PASS WITH NO SHARED CONTEXT, at the gate, which
is where a missed sweep is supposed to be caught and is a poor substitute for
having done it.
