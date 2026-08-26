---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: req-no-setting-disables-every-rule-at-once
type: "[[requirement]]"
statement: The one-door mechanism shall carry no setting, flag or environment variable that disables every rule at once.
kind: constraint
verify_method: inspection
breaks_if_removed: One switch undoes the reason requirement, the registry and the sweep together, and every exemption ever written stops meaning anything.
breaks_how_badly: fatal
refines:
  - uc-declare-an-exception-to-a-rule
  - uc-learn-why-a-module-departs-from-a-rule
source_refs:
  - raid-iss-the-record-names-its-doors-after-technologies-rather-than-purposes
priority: must
---

## Detail

THREE OF THE SIX COMPARED SYSTEMS SHIP ONE, and each is a single flag that
turns the whole apparatus off.

| system | the switch |
| --- | --- |
| Rust lints | `--cap-lints allow` |
| Bazel visibility | `--check_visibility=false` |
| dependency-cruiser | `severity: "ignore"` on a rule |

THE WIDGET PRECEDENT HAS NO EQUIVALENT, and that is the property being kept
rather than a gap being filled.

WHY IT IS GRADED FATAL RATHER THAN CORROSIVE. Everything this design claims
rests on an exemption being a recorded decision. A blanket switch makes every
recorded decision optional at run time, so the product stops being the thing
it says it is rather than merely working badly.

WHAT IS STILL ALLOWED, so the row is not read wider than it is. A single rule
may be removed by deleting it. A single module may be exempted by writing an
entry with its reason. What is forbidden is one control that suspends all of
them together.

VERIFICATION IS INSPECTION RATHER THAN TEST, because this row demands the
ABSENCE of a thing. A test can show one named switch does not exist; only a
reading of the surface can show none does.
