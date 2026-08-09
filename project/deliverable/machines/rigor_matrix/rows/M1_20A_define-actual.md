---
kind: matrix-row
name: define-actual
statement: "Define the actual: where we stand, good and bad, witnesses named."
state_kind: work
filled_by: agent
depends_on:
  - draft-vision
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_web_search
  - se_web_fetch
evidence:
  - name: as_is
    description: where we stand, good and bad, witnesses named
major: tailored
minor: inherit
patch: none
product: full
specification: full
major_note: |
  The as-is EXTENDS: the pains the change answers are stated fresh, with
  witnesses - a major usually exists because the recorded as-is no longer
  tells the whole story. The untouched baseline inherits by pointer.
minor_note: |
  INHERIT the resident baseline; state only the NEW pains the delta
  answers, one paragraph each, witnesses named. The v2 state-inheritance
  note already carried this rule - it becomes the default at this size.
patch_note: |
  Does not apply. The as-is baseline stands; a patch changes behavior, not
  the recorded pains. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the as-is baseline - every pain with its witness.
  The inherit-pointers of minor and major land here, so this document
  rots first when neglected: a pain that has been answered stays marked
  answered, with the iteration that answered it.
specification_note: |
  DOCUMENT FORM: the motivation chapter's as-is section - one paragraph
  per pain, witness cited inline. Marked prose. The pains are NODES so
  the trace can source needs to them; the chapter transcludes them.
---

## Guidance

The delta is meaningless without this baseline.

Present tense. State where we are, the good and the bad, never only the pains.

Every claim carries its witness:

- field research
- our own history
- reported patterns

The pains sharpen later, in the delta, where we say what we want to fix. No
solutions here.

INHERIT where unchanged. For a design-reuse iteration, point to the resident
as-is and state only the NEW pains, rather than re-deriving the whole
baseline.
