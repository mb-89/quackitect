---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-the-widget-guards-shape-generalises-to-a-second-rule
type: "[[raid]]"
kind: assumption
statement: The widget guard's shape — one rule, one registry naming who may, one declared hatch carrying a reason per entry, and two callers sharing no second copy — is general rather than particular to widgets, so a second and third rule can be built from it instead of from scratch.
owner: the owner
trigger: the first attempt to express a second rule in that shape, which is this record's own exports rule
status: open
probe: Express the exports rule in the widget guard's shape and count what had to be written that the widget guard did not already provide. A shape that generalises leaves the rule itself as the only new authoring.
probed: not yet. The generalisation does not exist, so nothing can be expressed in it.
impact: If the shape does not generalise, every rule of this kind costs its own refusal clause, its own sweep and its own hatch format, and the one-door principle becomes three unrelated mechanisms that happen to rhyme.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep
---

## The assumption

THE REPOSITORY HAS BUILT THIS SHAPE ONCE, for widgets, and it works. Its four
parts are named in `deliverable/machines/widget-exemptions.md` and in the
SE-C-146 section of `guidance/refusals.md`.

- ONE RULE. Only a module the editor registry names may emit widget markup.
- ONE REGISTRY saying who may.
- ONE DECLARED HATCH, one bullet per file, carrying a reason.
- TWO CALLERS. A write-time refusal and a whole-tree sweep, with no second
  copy of the rule between them.

WHAT IS ASSUMED is that those four parts are the general shape of a one-door
rule, and that the widget-specific parts are only the rule itself.

## Why this record rests on it

THE OWNER'S RULING OF 2026-08-26 names three doors: disk, the declared
exceptions to the disk rule, and the internet. This record was widened to work
that principle in rather than to add one more sweep beside the others.

IF THE SHAPE GENERALISES, this record builds the generalisation once and points
it at the exports rule to prove it. The disk rule and the internet rule then
cost a rule each.

IF IT DOES NOT, this record can still ship its own sweep, and the principle
stays a writing rule rather than a mechanism.

## Why it is an assumption rather than a requirement

NOBODY HAS TRIED. One instance is not evidence of generality, and the widget
guard was built to solve widgets rather than to be a template.

TWO PARTS LOOK PARTICULAR ON INSPECTION, and they are why this is graded
plausible rather than conceivable. Either one is a single nameable story with
no coincidence in it.

- THE REGISTRY IS A TYPESCRIPT MODULE LIST. A disk rule's "who may" is more
  likely a path shape than a named list.
- THE WRITE-TIME CALLER IS A LANE REFUSAL. That reaches an agent's writes and
  reaches nothing the engine does to itself, which is exactly the half the
  disk rule is about.

## Falsification

Expressing the exports rule in the shape requires writing a second refusal
clause, a second sweep and a second hatch format, with no shared part beyond
the naming convention.

## Probe

EXPRESS THIS RECORD'S OWN EXPORTS RULE IN THE SHAPE, and count what had to be
authored.

- A SHAPE THAT GENERALISES leaves the rule itself as the only new authoring:
  what is checked, and what the message says.
- A SHAPE THAT DOES NOT leaves a second clause, a second sweep and a second
  hatch reader.

RECORD THE COUNT rather than the impression. The number of new files is the
answer.
