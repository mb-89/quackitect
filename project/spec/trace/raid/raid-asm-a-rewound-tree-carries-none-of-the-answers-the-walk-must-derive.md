---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-a-rewound-tree-carries-none-of-the-answers-the-walk-must-derive
type: "[[raid]]"
kind: assumption
statement: "At the commit before an iteration started, none of the requirements, decisions or experiments that iteration went on to produce exist in the tree, so a re-walk cannot read its own answers."
owner: the maintainer of the machine
trigger: the first benchmark run whose report shows a state finishing far faster than every other state
status: open
impact: "If the assumption is false, the rewind is not a mask and the whole design rests on a filter that was struck. Every number taken before the discovery is contaminated and cannot be re-derived."
breaks_how_badly: fatal
how_likely: conceivable
probe: "unprobed — the read at 5f85977f^ establishes that the SEEDED record stands there, which is the input side. The output side is not yet checked."
source_refs:
  - training-iterations
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## Probe

WHAT IS ALREADY ESTABLISHED, 2026-08-19. Reading the i33 record at 5f85977f^
returns it with status seeded, carrying goal, vision and inputs and carrying
no pin. That is the INPUT half and it holds.

WHAT IS NOT ESTABLISHED IS THE OUTPUT HALF. The claim is that the iteration's
own products are absent at the same commit.

HOW TO CHECK IT, and it is cheap. Take the trace nodes whose files name i33.
For each, ask whether the path exists at 5f85977f^. The assumption holds only
if the answer is no for every node the walk is supposed to derive.

WHY IT IS ONLY CONCEIVABLE RATHER THAN PLAUSIBLE. The story needs two
independent things. A node would have to be written BEFORE the iteration that
owns it started, and it would have to be one the re-walk is meant to produce.
Seeding writes the record and nothing else.

WHAT WOULD MAKE IT PLAUSIBLE. An iteration seeded long before it was walked,
with another iteration writing into its territory in between. The archive
already interleaves — 20abd831, the rewind point for i33, is i35's seed
commit.

WHAT FALSIFIES IT OUTRIGHT. Any trace node the re-walk must derive that
resolves at the rewind commit.
