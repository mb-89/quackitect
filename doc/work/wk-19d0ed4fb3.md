---
id: wk-19d0ed4fb3
seq: 1000187
type: work
title: name the red
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: rev-19
---

## detail

A submission that finds the wider suite red must name the failing tests, not count them. Run the suite before and after and keep both sets of failing test names. Paste the names, or the diff of the two lists, into the note. Run the suite where the work will run before writing anything about it. A red taken elsewhere is worth writing down only when that place is where the code has to work. Seen on wk-b5867b3760 round 2, where twenty unnamed container failures did not reproduce under `go test -C src/engine -count=1 .`.
