---
kind: matrix-row
name: record-adrs
statement: Record the deciding ADRs, each addressing the requirements it shapes.
state_kind: work
filled_by: agent
depends_on:
  - declare-winner
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
  - name: adrs
    template: refs
    of: raid
    description: the decision entries in the register - one raid id of kind decision per line, each traced
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full: every deciding ADR traced to the requirement or
  quality that forced it, rejected options as history. The why lives
  once, here.
minor_note: |
  Does not apply (owner ruling 2026-08-13). A minor makes no architecture
  decisions, so there is no decision to record.

  ESCALATE: a choice worth an ADR is the architecture moving. Promote the
  iteration rather than recording one here.
patch_note: |
  Does not apply. A patch decides nothing an ADR must carry; the fix's
  why lives in its commit and the leave form. STRIKE PROPOSAL - owner
  adjudicates.

  ESCALATE: needing an ADR is the proof the change was never a patch.
product_note: |
  STANDING ARTIFACT: the ADR set - the product's decision memory, each
  addressing what forced it, rejected options kept. The book's decisions
  chapter derives from it. The why lives once, here, forever.
specification_note: |
  DOCUMENT FORM: ADR nodes, one file each - statement, addresses edges,
  rejected options as history. The decisions chapter transcludes them;
  the decisions table derives. Harvest v1's ADR template and its field
  schema.
---

## Guidance

The why lives once, here.

A DECISION IS A REGISTER ENTRY (owner ruling 2026-08-10): a raid node with
`kind: decision`, in the same folder as the risks it sits beside. An ADR is
nothing extra — it is a decision whose `breaks_how_badly` grades crippling
or worse. The decisions chapter derives from the register, filtered.

Each decision carries:

- the choice in one line, phrased so it could be argued with
- `breaks_how_badly` — the impact if it proves wrong ([[meth-damage-scale]])
- `how_likely` — how likely it proves wrong ([[meth-likelihood-scale]])
- `status` decided, later at most superseded
- `source_refs` to the requirement, quality or risk that forced it
- a `## Rejected options` section — the losers stay history
- a `## Consequences` section — what the choice binds from now on

The register view shows the decisions beside the risks ([[meth-raid]]). One
surface to read, files apart underneath.
