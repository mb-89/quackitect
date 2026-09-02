---
id: wk-a97d76b1ac
seq: 1000223
type: work
title: the query misses open
status: spec_open
assignee: main
scope: single-step
traced: true
minted_by: main
---

## detail

The work editor query in util/views/work.base decides what the two panes hold, and nothing in it selects imp_open. Open work is drawn under a group that does not say what it is, or not drawn at all. Read the file and say what each group selects and what it misses. Fix it so the states a person needs to see are the states the panes draw. Related: wk-4037e11b73, the same complaint for imp_in_work.
