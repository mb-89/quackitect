---
kind: matrix-row
name: write-requirements
statement: "Write the requirements in full: EARS, four kinds, detail included - verify_method named on every one."
state_kind: work
filled_by: agent
patch: tailored
minor: full
major: full
product: full
specification: full
patch_note: |-
  CLARIFICATION ONLY, the same law as frame-delta at this size: an unclear
  requirement whose wording produced the wrong output is repaired in place.
  EARS shape and verify_method survive the edit; breaks_if_removed stays.
  No new requirement rows.

  ESCALATE: a repair that changes what the requirement DEMANDS - not how
  clearly it says it - is a minor. The diff is the tell: a reworded line
  is a patch, a new or deleted line is not.
minor_note: |-
  APPLIES IN FULL for the delta - this row is what a minor IS. Every new
  or changed requirement: EARS shape, its kind, verify_method named,
  breaks_if_removed filled, source_refs to the new stories. No TBD
  survives, exactly as at product size. The resident register is extended,
  never forked.
major_note: |
  Applies in full: the change's requirements complete - EARS, kinds,
  verify_method, breaks_if_removed, source_refs - AND the standing rows
  the architectural move touches are re-read for continued truth. No TBD.
product_note: |
  STANDING ARTIFACT: the requirement register - EARS, four kinds,
  verify_method and breaks_if_removed on every row, sourced to
  stakeholders and stories. This is the spec's load-bearing table at
  rest: complete, consistent, no TBD, no orphan rows.
specification_note: |
  DOCUMENT FORM: requirements as NODES, one file each - EARS statement,
  kind, verify_method, breaks_if_removed, source_refs in frontmatter. The
  book's requirements table DERIVES via query (v1's .base pattern); the
  design-input chapter transcludes the register. Never a hand-maintained
  table.
depends_on:
  - gate-inputs
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
  - name: register
    description: "the requirement set: EARS, kinds, verify_method and breaks_if_removed on every row"
  - name: set_criteria
    description: complete, consistent, affordable, bounded - argued
---

## Guidance

Derive from the use-case steps and extensions. EARS shapes ([[meth-ears]]); kinds functional / quality / constraint / interface - qualities carry six-part scenarios ([[meth-quality-scenarios]]), constraints link their binding norm. Naming the verify_method (test / analysis / inspection / demonstration) IS the verifiability check - unnameable means rewrite or drop. breaks_if_removed mandatory on every requirement. Every requirement carries a WEIGHT, defaulting to unimportant - the high weights become M4's criteria and only they owe a scoring definition. source_refs to stakeholders, stories, norms. Detail now - no TBD survives this milestone; requirements are design input, never build-time afterthoughts. Position the concrete set against the standard checklists for this deliverable kind ([[meth-state-of-the-art]]). Expect iteration with the functions ([[meth-twin-peaks]]).

## Trial — this row only

The five cells live here as frontmatter instead of in `cells/`. Their files
are still in place and unchanged, so nothing is lost and the old shape still
works. Judge the Bases view, then we convert the other 47 or fall back.

WHAT TO LOOK FOR. The five column values must render and edit as ordinary
table cells. The five `_note` keys are the real question: a block scalar may
show as an editable text field, or it may show as one long unwrapped line.

IF THE NOTES DO NOT RENDER WELL, the fallback is already proven — the voice
matrix keeps the scalar in frontmatter and the prose in the body under a
heading naming the column. The grid stays editable either way.
