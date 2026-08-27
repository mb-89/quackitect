---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-a-card-says-which-of-its-parts-are-work
type: "[[requirement]]"
statement: When a method card is compiled, the engine shall derive a piece of work only from a part the card marks as one, and shall leave every unmarked part as prose.
kind: functional
verify_method: test
breaks_if_removed: The compiler guesses which sections are work. It mints items for rationale and rejected options, or folds twelve steps into one, and both failures are silent because the card looks the same either way.
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
source_refs:
  - "owner, 2026-08-26: it just has to work, and normal headings are still possible"
  - raid-asm-a-heading-per-token-survives-the-retro-card
priority: must
---

## What this demands, and what it deliberately does not

IT DEMANDS THAT THE CARD SAY SO. A part that becomes work is marked; a part that
is not stays prose. The compiler reads the mark rather than inferring from
shape.

IT DEMANDS THAT ORDINARY HEADINGS SURVIVE. A card carries rationale, rejected
options and provenance, and none of that is work. Marking must not cost the card
its ordinary structure.

IT DEMANDS INDEPENDENCE FROM HEADING DEPTH. A marked part may sit at any level.
Nothing may assume level two, or any other level.

IT NAMES NO SYNTAX. How a part is marked is a design decision and lives in its
own record, not here.

## Why it is a must

TWO CARDS ALREADY FAIL WITHOUT IT, and they fail in opposite directions.

- The gate review card carries 7 headings and about 2 are steps. Inferring from
  headings mints about four items nobody owes.
- The retro card carries 4 headings and 12 steps, the steps being a numbered list
  under one heading spanning 342 lines. Inferring from headings folds twelve
  acts into one item.

BOTH FIGURES ARE TAKEN AT HEAD. An earlier pass counted the working tree, where
eight of the gate review card's headings had been written the same day by the
hand doing the counting.

TOO MANY IN ONE, TOO FEW IN THE OTHER. A design resting on inference is wrong on
the first two cards anybody checks.

## The pass line

A CARD WITH NO MARKS MINTS NOTHING, and says so. That is the safety property:
an unconverted card reports zero work rather than inventing some.

A MARKED PART MINTS EXACTLY ONE PIECE OF WORK, whatever heading level it sits
at.

ZERO PIECES OF WORK MINTED FROM AN UNMARKED PART, counted across every card in
the tree.

## What this does not settle

WHETHER THE EXISTING CARDS GET MARKED, and when. They were written before this
system existed, so none of them carries a mark today. That is a one-time pass
over the corpus and it is work rather than a demand.
