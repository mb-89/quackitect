---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: exp-does-a-heading-mark-a-step
type: "[[experiment]]"
statement: Can a method card's steps be recovered from its headings, or does a heading mean too many things?
probes:
  - raid-asm-a-heading-per-token-survives-the-retro-card
timebox: half a day
form: calculation
faked: THE FIRST PASS COUNTED THE WORKING TREE, where eight of the gate review card's fifteen headings had been written by this same session hours earlier. Re-taken at HEAD, which is the honest corpus
fallback: none needed — the first two cards checked both fail, in opposite directions
verdict: falls
measured: 2026-08-26, RE-TAKEN AGAINST COMMITTED TEXT after a cold review found the first pass counted this session's own edits — at HEAD the gate review card carries 7 headings of which about 2 are steps, and the retro card carries 4 headings and 12 steps as a numbered list under one of them
folds_to: req-a-card-says-which-of-its-parts-are-work, and the mechanism is raid-dec-a-reserved-tag-on-a-heading-line-marks-a-piece-of-work
promote: the requirement and the decision both stand — a card must say which of its parts are work, and a reserved tag on a heading line is how
chunk: one pass over 137 cards to mark them, and the compiler reading the mark
source_refs:
  - rank-unknowns, the seeded pick
  - deliverable/machines/methods/meth-gate-review.md
  - guidance/method/retro.md
---

## The bet, and why it looked safe

THE DESIGN ASSUMED a method's marked headings become its pieces of work. The
median card owes two things and its headings are its steps, so the rule looks
right almost everywhere.

THE REGISTER NAMED THE RETRO CARD as the case that would decide it, and it was
named correctly.

## The first pass counted its own edits, and a review caught it

THE FIGURE WAS FIFTEEN HEADINGS ON THE GATE REVIEW CARD. At HEAD it carries
SEVEN. Eight were written into the working tree by this session, hours before
the count was taken.

SO THE FIRST PASS JUDGED THE CORPUS ON TEXT IT HAD JUST ADDED, which is the one
thing a verdict must not rest on. The rule was written into that very card the
same day.

THE VERDICT SURVIVES AND THE FIGURE DOES NOT. Re-taken at HEAD, the argument is
weaker and still holds.

## Two cards, two opposite failures — measured at HEAD

THE GATE REVIEW CARD: 7 level-two headings, of which "Situation", "The standard
fields" and "Procedure" are the procedural ones. The rest are rules.

INFERRING FROM HEADINGS MINTS ABOUT FOUR ITEMS NOBODY OWES, not thirteen.

THE RETRO CARD: 4 level-two headings at HEAD and no level-three headings inside
the steps at all. Its twelve steps are a numbered list under `## The steps`,
which spans lines 26 to 368.

INFERRING FROM HEADINGS FOLDS TWELVE ACTS INTO ONE ITEM.

## The cause is not the cards

A HEADING IN THIS CORPUS MEANS "A SECTION", of any kind. A step, a rule, a
rationale, a rejected option, a note about what the file used to say.

SO THE RULE WAS OVERLOADED ON A SYMBOL NOBODY RESERVED. The compiler would have
to guess, and a guess over prose mints work that does not exist.

THE CARDS WERE WRITTEN BEFORE THIS SYSTEM EXISTED. Nobody was choosing a unit of
work when they wrote a heading, so no rule recovered from the existing shape can
be reliable.

## What was looked at beyond this corpus

MARKDOWN HAS A DOCUMENTED WAY TO ATTRIBUTE A HEADING — the `{#id .class}` suffix
supported by Pandoc, kramdown, PHP Markdown Extra and Maruku. It is
level-independent and exactly the right shape.

IT IS NOT IMPLEMENTED BY THE EDITOR THIS PROJECT WRITES FOR, so it renders as
literal braces. That is recorded as the closest rejected option on the decision.

## What follows

THE REQUIREMENT IS SOLUTION-FREE and says only that a card must say which of its
parts are work, that ordinary headings must survive, and that heading depth must
not matter.

THE MECHANISM IS A SEPARATE DECISION, because the requirement is not the place
for it.
