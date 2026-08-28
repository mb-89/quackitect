---
kind: method
statement: An MDM is a block matrix. Its diagonal blocks are DSMs and its off-diagonal blocks are DMMs.
source: ref-structural-complexity-management
---

## Situation

Reach for an MDM in two cases.

- The target relationship is unreliable to elicit directly. Respondents do not
  know they are coupled, or they over-report every link.
- The derivation path across domains is itself the object of interest.

Several [DSMs](meth-dsm) and [DMMs](meth-dmm) set side by side are only a
"combined" case. Nothing new is derived, so it is not yet an MDM. The term is
due to Maurer and Lindemann, 2007.

## Effect #work

Derives one DSM or DMM subset from others, by composing directed paths.

A person-to-document matrix times a document-to-document matrix yields a
person-to-person coordination DSM. Nobody had to elicit that one by hand.

Precedents:

- The K- and V-Matrix. A technical and a customer-view DSM, linked via a DMM
  (Bongulielmi et al. 2001).
- Danilovic and Börjesson's multi-project MDM. It is also an asymmetric-DSM
  example, with the same elements in a deliberately different row and column
  order.
- Yassine et al.'s connectivity maps.

## Procedure

Name every domain and its elements.

Keep ONE dependency meaning per DSM or DMM subset. Mixing relation kinds
inside one subset breaks the structural interpretation.

To derive a target subset, walk three steps.

1. Follow a row in the A-to-B DMM to a filled cell. #work
2. Follow that column into B's own DSM. #work
3. Check the intersection for a further dependency. #work

Direction survives the composition. Six documented Boolean-composition cases
cover directed relations.
