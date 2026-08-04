---
kind: matrix-row
name: write-stories
statement: Write the user stories as slideshows - concrete examples realizing the value props; evidence sides stay empty until validation.
state_kind: work
filled_by: agent
depends_on:
  - gate-motivation
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
    description: "the slideshows, each realizing a named prop, killers marked"
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies for the change: every need it introduces gets its story,
  killers marked. Resident stories the change invalidates are REVISED,
  not silently outgrown - a story that no longer matches the to-be world
  is a defect from here on.
minor_note: |
  Applies for the delta: every new need gets its story, killers marked,
  slides as the examples' birth. Resident stories stand untouched - a new
  story that REWRITES an old one is a sign the delta is bigger than
  declared.
patch_note: |
  Does not apply. Stories realize needs, and a patch adds none. The
  affected story's evidence side is refreshed at the sweep (M8), not
  here. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the story slideshows, evidence sides FILLED - at
  rest the stories are the product's living validation record, not a
  design-time leftover. Every value prop realized by at least one story;
  killers marked; every slide's evidence current.
specification_note: |
  DOCUMENT FORM: story SLIDESHOWS - v1's deck manifests, one deck per
  story, slides with scenario side and evidence side. The book renders
  them as decks; killer stories marked in their frontmatter so the
  validation chapter can pull exactly those.
---

## Guidance

Per [[meth-story-slideshow]]. Every value prop is realized by at least one story; killer stories marked. The slides' formulated scenarios are the examples' birth ([[meth-examples-checkable]]) - roles for now, nodes later.
