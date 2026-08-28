---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-the-widget-exemption-shape-generalises-to-a-whole-capability
type: "[[raid]]"
kind: assumption
statement: The one rule, one door, one declared hatch shape that already governs widget markup generalises to a whole capability such as disk or the network, rather than only to a narrow emitting rule.
owner: the owner
trigger: the first attempt to write the exception list for disk, and the first time an exception's reason has to be judged rather than merely recorded
status: open
impact: The record plans to generalise an existing pattern instead of importing one. If the shape does not carry, the generalisation is discovered late, after the rule and the sweep are built, and the fallback is a different mechanism for each capability.
breaks_how_badly: corrosive
how_likely: plausible
probe: "NOT PROBED. The existing instance is real and reachable at deliverable/machines/widget-exemptions.md, and it holds one rule, one door, one declared hatch list and two callers with no second copy. What is untested is scale. THE CHEAP PROBE: draft the disk exception list against the bin scripts alone, which the measurement already flags as hatch candidates because several run before any door exists, and see whether one bullet per file with a reason stays readable at that size."
probed: none
source_refs:
  - i54-everything-exported-has-a-door-a-sweep-o
  - wt-two-working-pieces-of-code-sit-behind-no-door-at-all-one-rep
weighs_with: none
weighs_against: none
---

## Probe

NOT PROBED YET, and the probe is written now because the assumption was
identified now.

THE EXISTING INSTANCE IS REAL AND REACHABLE at
deliverable/machines/widget-exemptions.md. What is untested is scale, not
existence.

THE PROBE, and it is a draft rather than a build. Write the disk exception list
against the bin scripts alone. The measurement already flags 28 of them as
hatch candidates, because several run before any door exists.

TWO QUESTIONS THE DRAFT ANSWERS.

- Does one bullet per file, carrying the path and the reason, stay readable at
  that size?
- Are the reasons distinguishable from each other, or do they collapse into one
  sentence repeated 28 times?

WHAT THE RESULT MEANS. A readable list with distinct reasons confirms the shape
carries. A list nobody would finish, or 28 copies of one reason, says the rule
needs narrowing rather than the list needs lengthening.

WHO RUNS IT: the walker of the milestone that first writes an exception list.

## What the existing instance proves

IT IS BUILT AND IT WORKS. deliverable/machines/widget-exemptions.md carries the
whole shape for one rule about widget markup.

- One rule: only a module the editor registry names may emit widget markup.
- One door: the editor registry itself.
- One declared hatch: a bullet per file, holding the path and the reason.
- Two callers and no second copy: a write-time refusal, and a whole-tree sweep
  for a break that arrived without a write.

## What it does not prove

SIZE IS THE UNTESTED DIMENSION. The widget rule governs a small set of modules.
Disk touches 93 of 180 files.

A HATCH LIST THAT LONG MAY STOP BEING READ, and the existing card says in its
own words that a hatch nobody can find is the same as no hatch. A list nobody
finishes reading fails the same test by a different route.

REASON QUALITY IS THE OTHER UNTESTED DIMENSION. The card makes the reason
load-bearing by ignoring a bullet that has none. Nothing yet judges whether a
reason is any good, and at 93 files the difference between a real reason and a
placeholder is what decides if the rule means anything.

## What falsifying it looks like

THE LIST GROWS UNTIL IT IS THE RULE. If most of the bin scripts and most of the
engine core end up on the hatch list, the door governs a minority and the
exception is the norm.

AT THAT POINT THE HONEST MOVE IS A NARROWER RULE, not a longer list. Say which
subset of disk access the door owns, and leave the rest outside the rule
entirely rather than inside it as a declared exception.
