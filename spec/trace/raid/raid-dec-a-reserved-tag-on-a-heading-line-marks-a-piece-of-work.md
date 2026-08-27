---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-dec-a-reserved-tag-on-a-heading-line-marks-a-piece-of-work
type: "[[raid]]"
kind: decision
statement: A heading line carrying a reserved tag marks a piece of work, at any heading level, and an untagged heading stays prose.
breaks_how_badly: corrosive
how_likely: conceivable
source_refs:
  - req-a-card-says-which-of-its-parts-are-work
  - "owner, 2026-08-26: requirements are solution-free, so figure something out"
  - "Pandoc heading attributes, pandoc.org/demo/example33/8.3-headings.html"
  - "kramdown header IDs, kramdown.gettalong.org/syntax.html"
---

## What was decided

A LINE THAT OPENS A PART AND CARRIES THE RESERVED TAG MARKS A PIECE OF WORK.
The part's body is everything markdown already gives that line.

TWO KINDS OF LINE OPEN A PART, and the mark works on both.

- A HEADING, at any level. Its body runs until the next heading of the same
  level or higher.
- A TOP-LEVEL LIST ITEM, numbered or bulleted. Its body is the item's own block,
  including everything indented under it.

THE LEVEL DOES NOT MATTER AND NEITHER DOES THE SHAPE. A card keeps whatever
structure its author chose and marks the parts that are work.

AN UNMARKED PART IS PROSE. Rationale, rejected options and provenance notes go
on being ordinary sections and mint nothing.

## Why the list item had to be in it

THE FIRST VERSION OF THIS DECISION COVERED HEADINGS ONLY, and a cold review
found that it therefore missed the card that produced it. The retro's twelve
steps are numbered list items under one heading, so a heading-only rule would
still have folded twelve acts into one.

A DECISION THAT EXCLUDES ITS OWN DECIDING CASE IS NOT A DECISION. Widening costs
one more shape in the reader and closes the hole.

MARKDOWN ALREADY SCOPES BOTH. A heading owns what follows it; a list item owns
what is indented under it. Neither needs a rule of ours to say where it ends.

## Why the tag rather than the alternatives

TWO THINGS DECIDE IT: markdown already gives a heading its scope, and Obsidian
already renders a tag as a first-class thing.

THE SCOPE COMES FREE. A heading owns everything beneath it until the next one of
equal or higher rank. That is exactly the extent a piece of work needs, and no
new rule has to define where one ends.

OBSIDIAN SURFACES IT. A tag is clickable and searchable there, so a person can
ask the vault for every piece of work in the corpus without any tool of ours.
The contract's own rule is that a mechanism depending on metadata Obsidian does
not surface is a defect.

## Rejected options

PANDOC AND KRAMDOWN HEADING ATTRIBUTES, the `{.work}` suffix. REJECTED, and it
was the closest call. It is a real documented extension, level-independent, and
exactly the right shape. Obsidian does not implement it, so it renders as
literal braces in the one editor this project writes for. A standard nobody's
reader honours is a standard in name.

A `steps:` LIST IN THE FRONTMATTER naming the headings. REJECTED: it forks the
truth. The list and the headings can disagree, and only one of them gets
updated. That is the repeat-yourself failure this project has already drained
five times.

A FENCED BLOCK, ` ```work `. REJECTED: it takes the content out of the prose
flow, so a piece of work could not carry ordinary markdown guidance beneath it.
The goal asks for guidance in the body and evidence in subheadings, and a fence
forbids both.

INFERRING FROM HEADING DEPTH, which is what the design assumed. REJECTED by
measurement taken at HEAD: the gate review card would mint about four items
nobody owes, and the retro card would fold twelve acts into one.

## The hole a cold review found, and how it closed

FOUND 2026-08-26: the first version covered headings only, and the retro's
twelve steps are numbered list items. A heading-only rule would still have
folded twelve acts into one.

CLOSED THE SAME DAY by widening the mark to any line that opens a part. The
retro card is now answerable without being rewritten.

WHY IT IS RECORDED RATHER THAN QUIETLY FIXED. The decision was written from the
finding and then failed to cover the finding's own case, which is a shape worth
recognising: a rule generalised one step less far than the evidence that
produced it.

## A rejection that was made without checking the corpus

THE FRONTMATTER LIST WAS REJECTED for forking the truth. The corpus already runs
on exactly that shape: a rigor-matrix row carries an `evidence:` list naming its
items, and 63 rows do it today.

THAT DOES NOT MAKE THE REJECTION WRONG, and it does make it under-argued. The
fork risk is real and so is the precedent, and the precedent was not weighed.

## THE ORDER OF WORK — owner ruling, 2026-08-26

BUILD THE SYSTEM FIRST. Then mark a FEW cards and check it works on them. Then
mark all of them.

WHY THAT ORDER AND NOT THE OTHER. Marking 137 cards against an unbuilt compiler
is 137 guesses at a format nobody has run. A format that turns out wrong then
costs a second pass over the same 137.

A FEW CARDS IS THE CHEAP TEST OF THE FORMAT. Pick ones that disagree — a card
whose steps are headings, and the retro whose steps are a list — and the format
either holds on both or does not.

SO THE BULK PASS IS THE LAST STEP, not the first, and it happens when the format
has already been proven on the awkward cases.

## Consequences

EVERY EXISTING CARD MINTS NOTHING UNTIL IT IS MARKED, and that is the safe
direction. An unconverted card reports zero work rather than inventing some.

THE CORPUS GETS ONE DELIBERATE PASS. 137 cards, marked by hand or by a script
with a person reading the result. They were written before this system existed,
so no automatic rule recovers the intent.

A TAG IS VISIBLE IN THE RENDERED CARD. That is a cost: the marker is not
invisible the way a frontmatter key would be. It is also the benefit, because a
reader can see which parts of a card are work.

THE RESERVED WORD IS `#work`, fixed 2026-08-26 when the compiler was built.
Nothing in this decision turned on which word it was, so it was settled at the
build rather than here.

IT IS MATCHED AS A WHOLE TAG. `#workshop` and `#working` are not marks, and a
case in the test file holds that line.

IT IS NOT `#token`, AND THE REASON IS MEASURED. The word `token` already names
the walk's own marker in 41 places across the engine and its tests, against 743
uses naming a piece of work. One word on two things is exactly what the corpus
inspection's own pass line forbids, so the mark does not add a 42nd.
