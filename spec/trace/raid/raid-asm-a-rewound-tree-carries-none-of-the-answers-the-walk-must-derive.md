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
probe: "HOLDS, both halves probed 2026-08-19. THE INPUT HALF — the i33 record at 5f85977f^ stands with status seeded, carrying goal, vision and inputs and no pin. THE OUTPUT HALF — a search of spec/trace at that same ref for i33 returns 0 files, against 60 today. CONTROL — the same search for i15 at the same ref returns 123 matches across 10 files, so the zero is a real zero rather than a search that did not run."
probed: 2026-08-19
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


## Probe result, 2026-08-19

BOTH HALVES HOLD, and the output half is the one that mattered.

- INPUT: the i33 record at `5f85977f^` carries goal, vision and inputs, with
  status seeded and no pin.
- OUTPUT: `spec/trace` at `5f85977f^` contains ZERO files naming i33.
  Today it contains 60.
- CONTROL: the same search for `i15` at the same ref returns 123 matches
  across 10 files.

WHY THE CONTROL IS PART OF THE RESULT. The first attempt at this probe read
each of the 60 files individually at the ref, and every read came back as an
SE-C-040 toll refusal that the classifier counted as "file present". It
reported 60 of 60 present, which is the exact opposite of the truth, and it
looked like a clean falsification.

A SILENT EMPTY OR REFUSED RESULT READS AS DATA. That is the second time in one
session, and it is why the control was run rather than assumed.

WHAT WOULD STILL FALSIFY THIS. An iteration seeded long before it is walked,
with another iteration writing into its territory in between. The archive
already interleaves — 20abd831, the rewind point for i33, is i35's seed
commit. The probe is per-iteration and belongs in the run rather than being
answered once for all of them.
