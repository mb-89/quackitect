---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-a-weaker-driver-than-named-owes-a-recorded-reason
type: "[[requirement]]"
statement: "Where a milestone is walked by a driver weaker than the one it named, the record shall carry a stated reason, and shall mark the milestone as unreasoned where none was given."
kind: functional
verify_method: test
breaks_if_removed: "The design's only safety rule becomes a convention. A cheap driver can walk a state rated above it and leave a record indistinguishable from one that was driven correctly, which is the exact failure the asymmetry was written to stop."
breaks_how_badly: crippling
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - uc-let-the-machine-name-the-driver ext 6c
  - raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it
  - i38-the-machine-sizes-its-own-driver-every-s
priority: must
weighs_with: none
weighs_against: none
---

## Detail

THE ASYMMETRY IS THE DESIGN'S ONE SAFETY RULE: a stronger driver than named
needs no argument, a weaker one needs a recorded reason. Until this requirement
it had no demand behind it — extension 6c of the pass said so in as many words
and nothing in the register picked it up.

IT MARKS RATHER THAN REFUSES, and that is deliberate at this stage. Refusing a
weaker driver would need the lane to know what actually answered, which today it
cannot: the transport carries no model and the value is self-reported. A MARK IS
HONEST WHERE A REFUSAL WOULD BE THEATRE.

SO "UNREASONED" IS A STATE THE RECORD CAN CARRY, and a reader can count them.
That is the weakest useful form of the rule and it is reachable now.

WHAT WOULD STRENGTHEN IT LATER: the served model arriving from whatever
performed the spawn rather than from the party being measured. Then the gap
between named and actual is computable and the mark can become a refusal.

## How it was missed

THE FORM THAT SHOULD HAVE CAUGHT IT CLAIMED TO HAVE. `write-requirements`'s
completeness criterion said every step and every extension of both passes was
covered, "checked step by step rather than asserted". Three extensions were
never walked, and this was one of them — the one the vision's fifth goal and
third named conflict both rest on.

NOTHING MECHANICAL WOULD HAVE CAUGHT IT EITHER: the engine's coverage check
operates at use-case granularity, not step granularity, so a use case with one
requirement passes while six of its extensions go unread.
