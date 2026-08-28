---
steps:
  - id: classifiers
    statement: four classifiers over corpus text, each pure and each with a positive and a negative case
    depends_on: []
    realization: code
  - id: keys-widened
    statement: the three reference keys nothing swept are added to the list, and the list is exported
    depends_on: []
    realization: code
  - id: headings-repaired
    statement: every corpus node carrying a repeated section heading is repaired, adjacent copies dropped and separated ones named apart
    depends_on:
      - classifiers
    realization: documents
  - id: verbs-repaired
    statement: the nodes that teach a retired git verb are rewritten to the one-tree landing
    depends_on:
      - classifiers
    realization: documents
  - id: arm-the-empty-classes
    statement: the heading and dead-verb checks are wired into the corpus sweep, scoped to nodes that declare a type, with boot still green
    depends_on:
      - headings-repaired
      - verbs-repaired
    realization: code
  - id: citations-repaired
    statement: every code citation naming a file the tree does not hold is repaired or marked unreachable
    depends_on:
      - classifiers
    realization: documents
  - id: references-repaired
    statement: every reference key that resolves to nothing is repaired or carries its marker, counted as repairs against markers
    depends_on:
      - keys-widened
    realization: documents
  - id: tokens-triaged
    statement: every work token no node references is triaged into the three piles the findings name
    depends_on:
      - classifiers
    realization: documents
  - id: arm-the-rest
    statement: the citation, reference and token checks are wired in once their classes are empty or marked
    depends_on:
      - citations-repaired
      - references-repaired
      - tokens-triaged
    realization: code
---

## The order is the crippling risk's mitigation

EVERY CLASS IS EMPTIED BEFORE ITS LINT IS ARMED. Arming first would stop the
boot on a backlog the plan already counted, which is
raid-risk-arming-the-reference-sweep-turns-every-boot-red.

So the two arming chunks sit downstream of their repairs, and nothing is wired
while its class still reports.

## Two lenses shaped it

RISK FIRST decides where the arming sits. SPINE FIRST decides that the
classifiers land before any repair, so each repair has a checker to measure
against rather than a guess.

PARALLEL FLOW DOES NOT APPLY. The four repair chunks are independent of each
other and could fan out, but each is a small edit set and the seams would cost
more than the width buys.
