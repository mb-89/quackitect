---
kind: matrix-row
name: write-stories
statement: Write the user stories as decks - one actor, one concrete pass, a claim on every slide and the proof beside it.
state_kind: work
filled_by: agent
depends_on:
  - gate-motivation
entry_read:
  - project/deliverable/machines/methods/meth-story-slideshow.md
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
  - name: stories
    template: refs
    of: story
    covers: value-prop
    description: the stories THIS delta touched, one node reference per line — the corpus answers which exist, and only you know which this record moved
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies for the change: every need it introduces gets its story,
  priorities graded. Resident stories the change invalidates are REVISED,
  not silently outgrown - a story that no longer matches the to-be world
  is a defect from here on.
minor_note: |
  Applies for the delta: every new need gets its story, priorities graded,
  slides as the examples' birth. Resident stories stand untouched - a new
  story that REWRITES an old one is a sign the delta is bigger than
  declared.
patch_note: |
  Does not apply. Stories realize needs, and a patch adds none. The
  affected story's evidence side is refreshed at the sweep (M8), not
  here. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the story decks, evidence sides FILLED - at rest the
  stories are the product's living validation record, not a design-time
  leftover. Every value prop realized by at least one story; priorities
  graded; every slide's evidence current.
specification_note: |
  DOCUMENT FORM: story DECKS - one deck per story, slides split into a
  statement half and an evidence half. The book renders them as decks;
  must stories graded in their frontmatter so the validation chapter
  can pull exactly those.
---

## Guidance

Per [[meth-story-slideshow]], which the entry read demands before this state opens. The deck shape and the arc are not common knowledge.

WHY STORIES EXIST. A value prop is a promise, and a promise is easy to agree with and impossible to check. A story shows one named actor getting it, once, end to end. It is the first artifact in the trace that could be wrong in a way anybody would notice.

THE STORY IS THE DECK. Its body is markdown slides, the shape Obsidian uses. One slide per separator, and each slide split into a STATEMENT half and an EVIDENCE half. The left half is one claim; the right half is what shows it happened.

THE EVIDENCE SIDE IS EMPTY UNTIL M8. That is by design. It is what makes a story its own validation container: the artifact that says what should happen ends up carrying the proof it did.

SO THE STORIES ARE NODES, shaped by [[stakeholder]]'s sibling [[story]]. This field carries REFERENCES, never prose. The deck lives in the node; the form points at it and never restates it.

SEVERAL STORIES MAY SERVE ONE VALUE PROP, and most do. `refines` names the prop, and that is the edge the trace graph draws.

COVERAGE IS CHECKED, NEVER WRITTEN DOWN. The field declares `covers: value-prop`, so the engine refuses this state while any story refines no proposition, and while any proposition is refined by no story.

THERE IS NO COVERAGE FIELD, deliberately (owner ruling 2026-08-06). A form field asking whoever fills it to restate a computed result gets a paragraph that agrees with the engine until the day it does not. What is NOT computed - which stories are MUSTS, and why each earns its demonstration - is judgment, and it goes under `anything_else`.

THE SET IS NEVER COMPLETE, and does not have to be. Coverage is not the same as completeness: every proposition having a story does not mean every pass is told. A missing story surfaces later the same way a missing value prop does - something gets built that no story covers. Add it then, rather than stalling here for exhaustiveness.
