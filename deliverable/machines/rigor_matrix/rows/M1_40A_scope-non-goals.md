---
kind: matrix-row
name: scope-non-goals
statement: Scope and non-goals, informed by the delta.
state_kind: work
filled_by: agent
depends_on:
  - frame-delta
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
  - name: scope
    description: what this effort takes on
  - name: non_goals
    description: what it deliberately leaves, one line each
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies: the change's scope and non-goals in full - an architectural
  move without a sharp exclusion list sprawls. The standing product scope
  is re-read and amended where the change moves it.
minor_note: |
  The delta's own scope line: what of the new needs this iteration takes
  on, what it explicitly leaves. The standing product scope is inherited;
  only the delta is scoped here.
patch_note: |
  Does not apply. A patch lives inside the standing scope by definition.
  STRIKE PROPOSAL - owner adjudicates.

  ESCALATE: work that wants the scope line moved is at least a minor.
product_note: |
  STANDING ARTIFACT: the product's scope and non-goals list. At rest it
  matches what the product actually does - a shipped feature sitting in
  the non-goals list means one of them is lying.
specification_note: |
  DOCUMENT FORM: two lists in the motivation chapter - scope, then
  non-goals one line each. Nothing derives; this is the one artifact
  that stays plain authored markdown.
---

## Guidance

The delta says what must close; scope says how much of it THIS effort takes on, and the non-goals say what it deliberately leaves. Vision-level here; the binding system-level exclusion list comes at draw-context (M2).
