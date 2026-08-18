---
minted_in: i2
id: tsp-autonomy-tiers
type: "[[test-spec]]"
statement: No numeric autonomy value and no slider survives on any surface, state note or guidance page once the categorical tiers land — verified by inspection over the shipped tree.
method: inspection
verifies:
  - req-autonomy-is-categorical
files:
  - none — the checklist below is the whole definition; the sweep is a read-only inspection of the shipped tree and needs no test file
---

## Scope

The autonomy vocabulary across every surface and every page: the
session control, the mirror header, the state notes, the matrix rows
and the guidance. The cut-over build itself is M7's; this inspection
is its acceptance. The tier-to-gate mapping is the owner's call at
cut-over and is out of scope here.

## Approach

Inspection, run after the cut-over commit and again at validation. The
sweep is mechanical where grep reaches (the prose and the notes) and
eyes-on where it does not (the rendered controls). Each line carries
its own pass criterion, so a partial cut-over fails by name.

## Checklist

The cut-over ruling (raid-dec-autonomy-tier-ladder) sanctions two
transitional carriers, and the sweep reads them as exempt: the anchor
column in machines/scale.md (the words are the truth, the numbers their
carriers), and the numeric autonomy field riding the wire beside the
tier word. The anti-slider law in guidance/craft/ux.md is the rule
AGAINST sliders and is never a hit.

- the session autonomy control offers exactly the ladder's tiers; pass:
  no numeric input and no slider control remains on any surface
- state notes, matrix rows and guidance speak tier words; pass: a sweep
  for numeric autonomy weights and slider wording over machines/ and
  guidance/ returns nothing binding beyond the sanctioned carriers
- the mirror header and the session store show the tier word; pass: no
  bare 0-to-1 value renders WITHOUT its tier word beside it
- the weighing machinery gates on tiers; pass: the engine's comparison
  reads tier order natively — this line binds when the transitional
  anchors are removed, and until then the word-to-anchor resolution
  (valueFor, asPriority) is the sanctioned carrier
