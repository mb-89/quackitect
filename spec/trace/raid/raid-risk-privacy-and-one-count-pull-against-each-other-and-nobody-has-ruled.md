---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-privacy-and-one-count-pull-against-each-other-and-nobody-has-ruled
type: "[[raid]]"
kind: risk
statement: "A note is private and a token is not, so making them one object would give the retro a single count and would also put private text where it can never be taken back."
owner: the owner role
trigger: "the design step that specifies where a note lives, and any proposal to show notes and tokens in one number"
status: open
impact: "Ruling it wrong in the permissive direction is unrecoverable. Anything landing on trunk stays in history, and a note may carry a path, a name or a customer."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## The tension, stated plainly

WHAT ONE OBJECT WOULD BUY. The retro shows one number rather than two. A note
that has been judged becomes visible work instead of vanishing into a different
system. Nobody learns two vocabularies.

WHAT IT COSTS. Private and committed are incompatible. A note is machine-local
today on purpose, and it dies with the container it was written in. Put it in
version control and it travels, and then the word private means nothing.

SO TWO STORES IS NOT AN IMPLEMENTATION CHOICE. It is what privacy costs.

## Why it is graded expected

THE TENSION HOLDS TODAY, in the code as it stands. It is not waiting on an
event; it is waiting on a ruling. Only the timing of the ruling is open.

## What can be saved either way

ONE KIND OF OBJECT WITH TWO HOMES, rather than two kinds of object. One schema,
one surface, one set of verbs, and a privacy flag instead of a separate type.

PUBLISHING IS THEN A TRANSITION, and the guard that already exists lands exactly
on it. The mint already refuses a statement carrying a raw note's own words.

WHAT THAT GUARD DOES NOT CATCH, said here so nobody reads it as a guarantee: a
reworded private sentence. It makes the lazy path illegal; it does not make the
honest path easier.

## What closes it

THE OWNER'S RULING on whether private tokens exist. It is theirs, it is named as
theirs at the kickoff gate, and it stays open until they give it.
