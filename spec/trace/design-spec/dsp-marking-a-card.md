---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: dsp-marking-a-card
type: "[[design-spec]]"
statement: a card says which of its parts are work, and the compiler reads the mark instead of inferring from shape
realizes:
  - el-method-compiler
  - if-engine-delta-to-work-store
  - if-method-compiler-to-work-store
files:
  - deliverable/machines/methods
  - deliverable/engine/cardwork.ts
---

## Responsibility

TURNING ONE CARD INTO THE SET OF WORK IT OWES. Which parts are work, where each
part ends, and what happens to a card nobody has marked.

## Behavior and constraints

A LINE THAT OPENS A PART AND CARRIES THE RESERVED MARK IS A PIECE OF WORK. Two
kinds of line open a part and the mark works on both: a HEADING at any level,
and a TOP-LEVEL LIST ITEM.

THE BODY IS WHATEVER MARKDOWN ALREADY GIVES THAT LINE. A heading owns everything
until the next heading of equal or higher rank. A list item owns its own block,
including what is indented under it. No rule of ours defines where a part ends.

THE LEVEL DOES NOT MATTER AND NEITHER DOES THE SHAPE. A card keeps whatever
structure its author chose.

AN UNMARKED PART IS PROSE. Rationale, rejected options and provenance notes go
on being ordinary sections and mint nothing.

A MARK INSIDE ORDINARY PROSE IS NOT A MARK. Only a line that OPENS a part
carries one.

## The safety property, and it is the whole design

A CARD WITH NO MARKS MINTS NOTHING, AND SAYS SO. An unconverted card reports
zero work rather than inventing some.

THAT IS WHY THE MARK IS EXPLICIT RATHER THAN INFERRED. Inference has no safe
failure: it either mints work nobody owes or folds several acts into one, and
the card looks identical either way.

## Why not the alternatives

MARKDOWN'S OWN HEADING ATTRIBUTES — the `{.class}` suffix in Pandoc, kramdown,
PHP Markdown Extra and Maruku — are level-independent and exactly the right
shape. The editor this project writes for does not implement them, so they
render as literal braces. A standard the reader does not honour is a standard in
name.

A FRONTMATTER LIST naming the parts forks the truth: the list and the parts
drift, and only one gets updated.

A FENCED BLOCK takes the content out of the prose flow, so a part could not
carry ordinary markdown guidance beneath it.

## The reserved word is `#work`

AN OBSIDIAN TAG, written as a whole word. `#workshop` and `#working` are not it,
so the reader matches on a tag boundary rather than on a prefix.

IT IS NOT `#token`, AND THAT IS DELIBERATE. The word `token` already names the
walk's own marker in 41 places across the engine and its tests. A mark sharing
that word would put one word on two things, which is the corpus inspection's own
pass line.

## A marked line carries a short NAME, and the body carries the rest

PROVED ON THE RETRO CARD, 2026-08-26. Its twelve steps opened mid-sentence, so
the first line was a wrapped fragment. "MARK THE BOUNDARY, before anything else.
Run se_log_query with" is not the name of a piece of work.

SO MARKING A LIST ITEM MEANS REWRITING ITS OPENING LINE. The name goes on the
marked line, and everything that followed moves into the body. The twelve steps
now read as twelve names.

A HEADING ALREADY HAS THIS PROPERTY, which is why the problem showed up only on
the list shape. A heading is a name by construction.

THE COMPILER DOES NOT ENFORCE IT. A long title compiles fine; it is simply a bad
name. This is a rule for the hand doing the corpus pass, not a check.

## The order of the work

BUILD THE COMPILER FIRST. Then mark a FEW cards and check it holds — the two
that disagree, one whose steps are headings and the retro whose steps are a
numbered list. Then mark the rest.

MARKING 137 CARDS AGAINST AN UNBUILT COMPILER IS 137 GUESSES at a format nobody
has run, and a wrong format costs a second pass over the same 137.
