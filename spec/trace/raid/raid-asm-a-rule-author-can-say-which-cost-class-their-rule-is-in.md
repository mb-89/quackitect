---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-a-rule-author-can-say-which-cost-class-their-rule-is-in
type: "[[raid]]"
kind: assumption
statement: An author writing a sweep rule knows which of the three cost classes it falls into, so asking them to declare it produces a true answer rather than a guess.
owner: the maintainer
trigger: the first sweep rule written after the door rule, and any sweep whose runtime rises without a rule being added
status: open
impact: A declared cost class that is wrong is worse than none, because it makes the sweep's growth look accounted for while it is not. The three classes span two orders of magnitude, so one wrong declaration hides a hundredfold cost.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - "[[exp-where-does-the-sweep-s-runtime-actually-go]]"
  - "[[raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it]]"
weighs_with: none
weighs_against: none
---

## Where the assumption comes from

The sweep cost spike measured three classes of rule, and they span two orders of magnitude.

- A rule over frontmatter already parsed, doing a lookup: about 1 ms.
- A rule over content already read, running a regex: 15 to 19 ms.
- A rule that walks and reads the tree itself: 91 to 125 ms.

Its follow-up proposed that a rule declare which class it is in, because nothing today makes an author say.

THAT PROPOSAL ASSUMES THE AUTHOR KNOWS. This entry records the assumption rather than letting it ride inside the proposal.

## Why it might not hold

The class is not a property of the rule's INTENT. It is a property of what the rule's code touches, which is a fact about the call graph rather than about the idea.

An author who writes a rule reading a helper that reads the tree has written the 100 ms kind while believing they wrote the 1 ms kind. Nothing in the writing tells them apart.

`markerHits` is the existing case. It is a second full pass over files the corpus sweep has already read, and its cost matches a standalone walk almost exactly.

## Probe

DERIVE THE CLASS RATHER THAN ASKING FOR IT, then compare the derivation against what an author would have said.

- Count the file reads a rule performs, from inside the sweep, per rule.
- Classify it: zero reads is the lookup class, reads only what the pass already holds is the regex class, opens a file of its own is the walk class.
- Ask the author of each existing rule which class they would have declared.

WHAT COUNTS AS FALSE. Any existing rule whose author would have declared the wrong class.

WHAT COUNTS AS HOLDING. Every existing rule's declaration matches its measured class.

IT IS CHEAP BECAUSE THE MEASUREMENT ALREADY EXISTS. The phase timing script from the cost spike counts reads per phase; per rule is the same instrument aimed one level down.

## What it implies if it falls

The declaration becomes a derived value rather than an authored one, which is the standing rule that a stored copy never beats a derived one.
