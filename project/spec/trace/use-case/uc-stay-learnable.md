---
id: uc-stay-learnable
type: "[[use-case]]"
statement: Get oriented without help
actor: stk-newcomer
trigger: Someone meets the project for the first time.
precondition: none
guarantee: The newcomer can say what the product is, from the entry documents alone, within one session.
refines:
  - sty-learnability
killer: false
---

## Main scenario

1. The newcomer opens the front door document.
2. Every sentence reads plainly, and each method term present carries its definition one link away.
3. The newcomer follows the entry chain to the next document it names.
4. The tour shows the product from its live state.
5. The newcomer states what the product is and where work happens.

## Extensions

- 2a. A bare method term stands in the front door: the reader stalls on vocabulary; the term counts as a defect against the entry documents.
- 3a. The chain names a document that moved or died: the dead pointer counts as a defect; the reader is never left to guess the next step.
- 4a. The tour narrates from a script instead of the live state: what it shows is dated; the tour reads the live state or says it cannot.
