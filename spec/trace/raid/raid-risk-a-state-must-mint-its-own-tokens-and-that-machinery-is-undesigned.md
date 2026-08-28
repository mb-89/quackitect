---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-a-state-must-mint-its-own-tokens-and-that-machinery-is-undesigned
type: "[[raid]]"
kind: risk
statement: Every state must now mint the tokens it owes when it is entered, and that machinery is new, barely discussed, and sits on the path of every single walk.
owner: the driving agent
trigger: the design step that specifies what happens on entering a state, and the first state whose minting is written
status: open
impact: Minting is on the hot path of every entry into every state. Getting it wrong does not break one feature; it breaks walking. Getting it slow taxes every hop.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## The hinge

ENTERING A STATE BECOMES A COMPUTATION. The engine has to work out what
reading that state requires, check what is already proven, read the method's
marked headings, read the evidence fields, and build tokens for the remainder
and nothing else.

FOUR SOURCES FEED IT and each has its own rules. Reading requirements are
subtracted against proven evidence. Method headings need a marking format that
does not exist yet. Evidence fields map one to one. Scope arriving at a
kickoff is moved rather than minted.

THE OWNER RAISED IT AS THE THING WE DID NOT TALK ABOUT MUCH, and that is the
whole reason it is here.

## Why it is graded plausible

ONE ORDINARY EVENT PRODUCES IT: the design lands without settling what happens
when a state is re-entered, or when its method changes between two entries.
Both are ordinary and neither needs a coincidence.

## What closes it

A DESIGN STEP THAT NAMES THE ENTRY RULE EXPLICITLY. What is read, in what
order, what is subtracted, and what happens on a second entry.

TWO RULES ALREADY EXIST AND MUST BE HONOURED. Read evidence is global and
version-keyed, so entering twice asks for nothing already proven. And a
mechanical token runs its script when it is asked, never when it is minted.
