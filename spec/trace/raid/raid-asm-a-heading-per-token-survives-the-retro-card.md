---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-asm-a-heading-per-token-survives-the-retro-card
type: "[[raid]]"
status: closed
kind: assumption
statement: "The design assumes a method's marked headings can become its tokens, and the retro card is the case that decides whether that is true."
owner: the driving agent
trigger: "the rewrite of the retro card, which is the first place the format is tested against real prose"
probe: "scheduled. Splitting the retro card is authoring rather than measuring, and two things it depends on are deliberately unsettled: how a heading declares itself a step, and what the subheadings beneath one are called. Running the split before those are ruled would test a format nobody has defined."
probed: 2026-08-26
impact: "Method steps becoming tokens is the fix for a measured failure, where an overhaul agent skipped some of its own steps and nothing objected. If the format cannot carry the hardest card, that fix loses its proof and the guidance stays advice."
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## PROBED, 2026-08-26 — the bet FAILS on the card that was named to decide it

### What the retro card actually looks like

| figure | value |
| --- | --- |
| level-2 headings in the whole card | 5 |
| level-3 headings | 5, and none inside the steps |
| the card's real steps | 12, as a NUMBERED LIST |
| lines the steps heading spans | 342 |

ONE HEADING COVERS EVERY STEP. `## The steps` runs from line 26 to line 368, and
the twelve steps inside it are `1.` through `12.` — list items, not headings.

SO MINTING ON MARKED HEADINGS WOULD PRODUCE ONE ITEM for the retro, named "the
steps", covering twelve separate acts. That is the opposite of what the design
wants: the whole point is that a position owes its steps one at a time.

### Why this card and not another

THE MEDIAN CARD OWES TWO THINGS and its headings are its steps. The bet holds
everywhere the shape is ordinary.

THE RETRO IS THE LONGEST AND MOST PROCEDURAL CARD IN THE TREE, which is why the
register named it as the deciding case rather than a random one. It was named
correctly.

### Three ways out, and none is chosen here

- REWRITE THE CARD so each step is a heading. Mechanical, and it changes a
  document people read for its numbered order.
- WIDEN THE MINTER to take a top-level numbered list item as a step where a card
  uses that shape. Costs a second rule in the compiler.
- DECLARE THE CARD AN EXCEPTION. Cheapest, and it means the one card that most
  needs per-step work is the one that does not get it.

THE SECOND LOOKS RIGHT AND IS NOT MINE TO CHOOSE. A card's steps are whatever
its author wrote as a sequence, and headings are one way of writing that.

### What this does not say

IT DOES NOT SAY THE DESIGN IS WRONG. It says the rule "marked headings become
the items" is too narrow by one shape, and the shape is common enough to have
been found on the first card anybody checked.

SCRIPT: the counts come from `se_file_search` over the card, not from a probe
tree.

## Probe

SPLIT THE RETRO CARD so every step is a heading a token can be built from.
Then check three things.

- All twelve numbered steps land as tokens.
- Both standing questions land as tokens.
- Each one carries its own evidence in subheadings beneath it, with nothing
  about that token living outside its own section.

RUN IT BEFORE THE FORMAT IS BUILT AGAINST, not after. The card is the hardest
case in the system, so a format that survives it needs no second trial.

## Why the retro card is the test

IT CARRIES TWELVE NUMBERED STEPS plus two standing questions, and more
provenance prose than any other card in the system. Several steps hold rulings,
measurements and worked examples inside them.

ANYTHING THAT SURVIVES IT SURVIVES THE REST. That is why it is the probe rather
than an easier card.

## What is not settled

TWO THINGS ARE DEFERRED ON PURPOSE and the assumption cannot be closed while
they stand.

- How a heading declares itself a task, since a document holds headings that
  are not tokens.
- What the subheadings under a task heading are called, and what each means.

## What falsifies it

A STEP THAT CANNOT BE EXPRESSED AS ONE HEADING WITH ITS EVIDENCE BENEATH IT.
If splitting the card forces a step to be two tokens, or forces two steps into
one, the mapping is not one to one and the guarantee weakens.

A FALSIFIED ASSUMPTION BECOMES AN ISSUE, keeps this id, and says so here.
