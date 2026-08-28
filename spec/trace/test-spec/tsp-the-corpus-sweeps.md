---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: tsp-the-corpus-sweeps
type: "[[test-spec]]"
statement: The five sweeps i44 arms each report their own class and nothing else, on a corpus built for the case rather than on the live one.
method: test
verifies:
  - req-a-reference-key-resolves-or-is-marked
  - req-a-heading-appears-once-in-a-node
  - req-a-code-citation-names-something-that-exists
  - req-the-dead-vocabulary-sweep-reaches-the-trace
  - req-a-work-token-nothing-references-is-reported
files:
  - deliverable/tests/corpus-sweeps.test.ts
---

## Scope

The five requirements this iteration mints, taken as one collection because
they share a method, a shape and a file.

Each case builds its own temporary root and asserts one thing. None of them
reads the live corpus, so a repair landing in the tree cannot turn a case
green or red by accident.

## Steps

Every case in the referenced file is one step, and the case name states its
claim.

- The reference-key coverage step asserts the swept key list carries every key
  the corpus actually points with, including the three the ten-key list missed.
- Three heading steps: a repeat is reported, the same words at a different
  level are not a repeat, and a heading appearing three times is reported once.
- Three citation steps: a missing file is reported, an existing one is not, and
  a line number is not part of what is checked.
- One dead-verb step: a verb named in prose that the tool surface does not
  define is reported, and a live verb beside it is not.
- One token step: a work token no node references is named, and a referenced
  sibling is not.

## Why these boundaries

THE NEGATIVE CASE IS HALF OF EACH PAIR. A sweep that reports everything passes
a positive-only suite and is useless. Every class here carries at least one
case that must stay silent.

THE LINE NUMBER IS THE DELIBERATE GAP. It moves on every edit above it, so
checking it would make the sweep permanently red for no gain, and one step
pins that decision.
