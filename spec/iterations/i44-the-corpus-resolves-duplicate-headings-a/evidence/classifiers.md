---
form: classifiers
by: agent
signed_off: 2026-08-28T11:11:05.985Z
authors: agent
files:
---

# Evidence form / classifiers

## current_situation

The four classifiers stand in one module, each pure over text, and the checks around them are green.

Two of them were wrong on their first writing and the measurement against the real corpus caught it before either was armed.

## built

`deliverable/engine/corpus-sweeps.ts`, four exported functions.

- duplicateHeadings takes one node's text and answers the headings appearing more than once at the same level. Fenced code is skipped.
- staleCitations takes the root and one node's text and answers the cited paths no file in the tree ends with.
- deadLaneVerbs takes the root and one node's text and answers the lane verbs no engine file names.
- unreferencedTokens takes the root and answers the work tokens no node outside the pool mentions.

The checks are `deliverable/tests/corpus-sweeps.test.ts`, eleven cases, eleven green.

Each class carries a negative case that must stay silent, because a sweep that reports everything passes a positive-only suite and is worth nothing.

## follow_up

Repair the classes the classifiers now measure, then arm each check once its own class is empty.

The first two repairs are the headings and the retired verbs, and both classes are small.

## anything_else

TWO CLASSIFIERS RESTED ON A WRONG AUTHORITY, and only measuring against the corpus showed it.

The citation check resolved against a fixed set of path prefixes and reported 169 live files as gone. Citations are written at the depth a reader needs, so it now matches any file whose path ends with the citation. The count fell to 35.

The verb check read tools.ts as the tool surface and reported 292 live verbs as dead. Only 16 verbs are declared there in the shape it expected, so it now reads every verb name any engine file mentions. The count fell to 7, and those 7 are the seed's own targets.

BOTH FIXES CARRY THE CASE THAT WOULD HAVE CAUGHT THEM. A citation written at a shallower depth than the file, and a verb declared outside tools.ts. The suite grew from nine cases to eleven for that reason.

THIS IS THE FABRICATED-COVERAGE FAILURE THE METHOD NAMES. The nine original cases were green against fixtures built from the same wrong assumption as the code. Nothing in the suite could have found it; only the corpus could.
