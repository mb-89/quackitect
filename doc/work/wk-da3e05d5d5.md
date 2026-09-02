---
id: wk-da3e05d5d5
seq: 1000114
type: work
title: the note eats sections
status: spec_open
assignee: main
scope: single-step
traced: true
minted_by: main
---

## detail

readBody in src/engine/store.go switches on the heading with no default, so an unknown section is read into nothing and the next SaveToken drops it. doc/work/wk-1412093cd8.md lost a section a person wrote to be read before round 10, and nobody could tell. Decide between refusing the save of a note with an unknown heading, and keeping unknown sections verbatim and writing them back in place. Listing allowed headings is not an answer. The check writes a note with a heading the engine does not own, loads it, saves it and reads it back. It does the same for a person's own section beside the engine's. Decide it together with wk-9a92ca488c, where readBody assigns rather than appends under one owned heading.
