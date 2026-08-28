---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-a-card-marks-its-own-work
type: "[[test-spec]]"
statement: A compiled card yields one piece of work per marked part and none for anything unmarked, at every heading level and for a marked list item.
method: test
verifies:
  - req-a-card-says-which-of-its-parts-are-work
files:
  - tests/card-marks-its-work.test.ts
---

## Scope

WHAT IT COVERS: turning one card into the set of work it owes. The mark is
read, the unmarked parts are left alone, and the extent of each marked part is
whatever markdown already gives it.

WHAT IS DELIBERATELY OUT: the cost of doing it, which cannot be measured until
minting exists and is carried by its own register entry. And the marking of the
137 existing cards, which is a corpus pass rather than a behaviour.

## Approach

EQUIVALENCE CLASSES ON THE SHAPE OF A PART, because the requirement is about
which shapes carry a mark. Four classes: a marked heading, a marked list item,
an unmarked part, and a card with no marks at all.

BOUNDARY VALUES ON HEADING DEPTH, because the requirement forbids assuming a
level. One hash, two, three, and a card mixing depths.

COMPONENT LEVEL. The compiler reads a string and returns a set; nothing needs a
surface, a walk or a record to answer this.

DEPTH FOLLOWS THE GRADE. The requirement is a must graded crippling, and its
failure mode is silent in both directions — inventing work nobody owes, or
folding several acts into one. Both classes get their own cases rather than one
combined check.

## Steps

Every case in the referenced file is one step. The load-bearing ones:

- A MARKED HEADING YIELDS ONE PIECE OF WORK, and its body is everything down to
  the next heading of the same level or higher.
- A MARKED TOP-LEVEL LIST ITEM YIELDS ONE PIECE OF WORK, and its body is the
  item's own block including what is indented under it. This is the retro
  card's shape and the reason the mark is not heading-only.
- AN UNMARKED HEADING YIELDS NOTHING, whatever it contains. Rationale, rejected
  options and provenance notes are prose.
- A CARD WITH NO MARKS YIELDS AN EMPTY SET, and the compiler says so rather
  than falling back to inference. This is the safety property: an unconverted
  card reports zero rather than inventing.
- DEPTH DOES NOT DECIDE. The same card marked at one hash, at two and at three
  yields the same three pieces of work.
- MIXED DEPTHS IN ONE CARD each yield their own piece, so a card is not forced
  to flatten its structure to be readable by the compiler.
- A MARK INSIDE ORDINARY PROSE IS NOT A MARK. Only a line that OPENS a part
  carries one, so the reserved word appearing mid-sentence mints nothing.

TWO REAL CARDS ARE FIXTURES rather than invented text, and they are the two
that disagree: one whose steps are headings, and the retro whose steps are a
numbered list. The owner's ruling is to prove the format on a few cards before
marking all of them, and these are the few.

NO MANUAL STEP. Every case runs in the suite.
