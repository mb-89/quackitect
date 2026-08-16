---
kind: matrix-row
name: generalize-use-cases
statement: Generalize the stories into Cockburn-shape use cases.
state_kind: work
filled_by: agent
depends_on:
  - write-stories
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
entry_read:
  - project/deliverable/machines/methods/meth-cockburn-use-case.md
evidence:
  - name: use_cases
    template: refs
    of: use-case
    covers: story
    description: the use cases THIS delta touched, one node reference per line — the corpus answers which exist, and only you know which this record moved
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies for the change's stories: scenario paths, extensions, no UI
  mechanics. Use cases the architectural move invalidates are revised in
  the same pass.
minor_note: |
  Applies for the new stories: each maps into a scenario path - into an
  EXISTING use case's extension where it fits, a new use case where it
  does not. No UI mechanics, as ever.
patch_note: |
  Does not apply. No new stories, no new use cases. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: the use-case set, Cockburn shape, every story
  covered. The requirements derive from these steps at rest - a use case
  no requirement traces to, or the reverse, is the orphan check's
  business.
specification_note: |
  DOCUMENT FORM: Cockburn use-case sections - numbered main path,
  extensions per step, no UI mechanics. Use cases are nodes; the design-
  input chapter transcludes them and the trace tables derive coverage.
---

## Guidance

Per [[meth-cockburn-use-case]], which the entry read demands before this state opens. The Cockburn shape is not common knowledge, and the last product declared it without ever filling it.

WHAT A USE CASE IS, against the story beside it. A story is ONE pass: this person, this Tuesday, these clicks. A use case is EVERY pass: the same goal, told once, with the branches that can happen along the way. The story is the example; the use case is the general form.

SO EVERY USE CASE HAS AT LEAST ONE STORY UNDER IT, and it is the story that proves the general form is real. A use case with no story is a capability nobody has walked.

AND EVERY STORY SITS INSIDE A USE CASE. A story that generalizes to nothing is either a use case nobody wrote down, or a pass the product does not actually support.

SO THIS FIELD CARRIES REFERENCES, NEVER PROSE. One id per line, shaped by [[use-case]]. The scenario lives in the node; the form points at it and never restates it.

COVERAGE IS CHECKED, not claimed. The field declares `covers: story`, so the engine refuses this state while any use case refines no story, and while any story is refined by no use case. Neither is a judgment call.

REVERSE-ENGINEERING FINDS MISSING STORIES, and that is a result rather than a failure. Walking the system turns up goals nobody told a story about. Write the story, then the use case over it. The story comes first because the example is what makes the general form checkable.

NO UI MECHANICS. A use case survives a rewrite of every screen it describes. Name what the actor achieves, never which button they press.

M3 derives the requirements from these steps and extensions. A step no requirement covers is a hole, and it shows up in the coverage matrix rather than in a review.
