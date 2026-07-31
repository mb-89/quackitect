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
    description: "where we stand, good and bad, witnesses named"
---

## Guidance

The delta is meaningless without this baseline. Present tense: state where we are, the good and the bad - never only the pains. Every claim carries its witness (field research, own history, reported patterns). The pains sharpen later, in the delta, where we say what we want to fix. No solutions here.

INHERIT where unchanged: for a design-reuse iteration, point to the resident as-is/context and state only the NEW pains, rather than re-deriving the whole baseline.
