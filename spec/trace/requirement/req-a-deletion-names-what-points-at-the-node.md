---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: req-a-deletion-names-what-points-at-the-node
type: "[[requirement]]"
statement: When a trace node is deleted, the engine shall name every node that references it, before the delete lands.
kind: functional
verify_method: test
breaks_if_removed: A deletion orphans whatever pointed at it, and the orphan surfaces states later through a fallen claim, where the cost of finding the root is highest.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
source_refs:
  - "measured in i34: four orphanings in one iteration, none warned at the delete"
  - raid-asm-the-bundles-defect-list-still-stands
  - note-671353b9a8e6
  - req-broken-trace-is-a-defect
priority: must
---

## Detail

FOUR TIMES IN ONE ITERATION, AND EVERY ONE FOUND LATE. i34's deletions each
orphaned something, and a coverage law caught it several states downstream
through a chain of fallen inputs.

- Deleting one function orphaned two requirements.
- Deleting ten requirements left a register three states upstream still naming
  three of them. That refused, and knocked every claim standing on it out of
  green.
- Deleting a test-spec orphaned a MUST story, caught two gates later.
- Deleting requirements left seventeen dangling citations in the live corpus
  and three more in engine comments.

## The information already exists

THE ENGINE BUILDS THIS GRAPH FOR THE COVERAGE LAWS. Every one of those four
was found BY that graph — just later, and by a different question. Nothing new
has to be computed. It is asked at the wrong moment.

## What this row does not demand

IT DOES NOT REFUSE THE DELETE. Deleting a node with dependents is legal and
often right; i34 was correct to delete ten requirements and wrong about two of
them for a different reason. What this row demands is that the list is put in
front of whoever is deleting, while the decision is still being made.

NAMING IS THE WHOLE DEMAND. What happens next is a judgment, and it stays one.

## Behaviour

No model wanted. One invariant: a delete of a node with inbound references
answers with those references, and a delete of an unreferenced node answers
with an empty list rather than silence.
