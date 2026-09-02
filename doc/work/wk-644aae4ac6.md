---
id: wk-644aae4ac6
seq: "74"
type: work
title: symptom removed, defect kept
status: aborted
assignee: main
scope: single-step
traced: true
disposition: dropped
reason: "The lesson is in doc/guidance/behaviour.md under A fix in the caller leaves the defect where it is, and reCompare in src/engine/filterbuild.go now takes one literal."
aborted_from: imp_open
minted_by: reviewer5
---

## detail

wk-5bec911840 changed the filter builder so it stops emitting the shape reCompare misreads, and left reCompare as it was. filterbuild.go:123 still reads a value as (.+?) anchored to the end of the line. A hand-written `- status == "open" && assignee == "main"` is read as one condition and written back broken. Make reCompare refuse a value that is not a single literal, and check it with input the builder cannot make. A reader that cannot structure a value falls back to a lossless raw form rather than guessing. wk-d2f6e959ef carried this remedy and was aborted on evidence that covered only the builder. Found on wk-5bec911840, round 2.
