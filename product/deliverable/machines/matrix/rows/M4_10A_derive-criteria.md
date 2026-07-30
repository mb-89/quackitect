---
kind: matrix-row
name: derive-criteria
statement: "Weight the requirements: the vital-few high-weight ones ARE the decision criteria."
state_kind: work
filled_by: agent
depends_on:
  - gate-requirements
evidence:
  - name: criteria
    description: "the vital-few high-weight requirements, each with weight and scoring definition"
---

## Guidance

Criteria are PROMOTED requirements, never their own items. Every requirement carries a weight, defaulting to unimportant; weighting is steps 1-3 of [[meth-eight-step-decision]] (direct or pairwise comparison, pruned to fewer than 11 vital few). A high weight DEMANDS a scoring definition on that requirement ([[meth-scoring-anchors]]) - that filled definition is what makes it a criterion. Stakeholder tensions reference the requirements they pull apart. A criterion without requirement lineage cannot exist by construction; anything worth scoring candidates by must first be written as a requirement.
