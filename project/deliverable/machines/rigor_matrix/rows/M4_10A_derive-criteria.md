---
kind: matrix-row
name: derive-criteria
statement: "The criteria fall out of the register: pairwise judgments in, the weighted vital few out."
state_kind: work
filled_by: agent
depends_on:
  - gate-requirements
entry_read:
  - project/deliverable/machines/methods/meth-derive-criteria.md
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: compounding
    template: compare-card
    relation: equivalence
    items:
      - $compounding_suspects
    writes: weighs_with
    reason: reason
    picks:
      weighs_with: $criterion_pool
    pick_free:
      - weighs_with
    page_size: 10
    description: which flagged pairs measure the same thing
    guidance: |
      Two rows measuring the same thing are one criterion. Say so, or say
      they are different. The reason is optional.

      The method is [[meth-derive-criteria]].
  - name: comparisons
    template: compare-card
    relation: order
    items:
      - $criterion_axes
    writes: weighs_against
    picks:
      weighs_against: $criterion_axes
    pick_free:
      - weighs_against
    page_size: 10
    description: which of two matters more
    guidance: |
      Pick the one that matters more, or say they match. The weights fall
      out of the answers, so never type one.

      The method is [[meth-derive-criteria]].

      The weight is arithmetic over these judgments. Never type a weight.
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full - this is major's own territory. The vital few, weighted,
  each with definition and requirement lineage. Standing criteria are
  reused where they still measure what matters; the change usually adds
  one or two of its own.
minor_note: |
  Does not apply. Criteria weigh architecture candidates, and none are
  enumerated at this size. STRIKE PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply. Decision criteria exist to weigh architectures; a patch
  weighs nothing. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the weighted decision criteria with their lineage.
  They outlive the decision that minted them - the next major reuses and
  re-weighs them instead of inventing a fresh set.
specification_note: |
  DOCUMENT FORM: criteria as a derived table - name, definition,
  requirement id, weight - in the design-output chapter, feeding the
  decision records that cite them.
---

## Guidance

THE CRITERIA LIST IS NEVER TYPED. It falls out of frontmatter on the requirements, and the weights fall out of pairwise judgments. The method is [[meth-derive-criteria]], which the entry read demands before this state opens.

Criteria are PROMOTED requirements, never their own items. A criterion without requirement lineage cannot exist by construction. Anything worth scoring candidates by must first be written as a requirement.

MoSCoW CARRIES THE DEMAND SPLIT ALREADY. A `must` row is a demand and gates every candidate pass or fail at gate-candidates; it is never scored. A `should` row is the criterion pool. A `could` row joins the pool only by carrying a comparison, and writing that comparison IS the promotion.

THE POOL IS REQUIREMENTS. The RAID register feeds it by POINTING — a requirement several OPEN entries lean on is one that matters, and that count seeds the ordering. A closed entry pulls nothing.

A REGISTER ENTRY IS NEVER A ROW HERE. A risk is a claim about what might happen; a requirement is a demand on the system. Asking which matters more has no answer, and the card that asked it is why this line exists.

WEIGHTS ARE FIXED BEFORE ANY CANDIDATE EXISTS, which is why this state depends only on gate-requirements. Weights that arrive after the options can be tuned to make a favourite win.

ONE CUT RUNS ELSEWHERE, AND NOTHING WALKS BACK. Dropping what does not discriminate needs the candidates, so it is `cut-criteria`'s job — its own state, after the candidates and before any score. The cut removes an axis and never touches a weight, so what this state mints stands.
