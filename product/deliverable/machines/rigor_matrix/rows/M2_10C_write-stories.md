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
---

## Guidance

Per [[meth-story-slideshow]]. Every value prop is realized by at least one story; killer stories marked. The slides' formulated scenarios are the examples' birth ([[meth-examples-checkable]]) - roles for now, nodes later.
