---
id: wk-6fdb025ffb
seq: 1000161
type: work
title: the range runs off
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: rev-10
---

## detail

A criterion guarded by sed -n /NEW/,/ANCHOR/p runs to end of file when the section sits after the anchor. The range is loose exactly when the placement is wrong. Case in point: wk-0d9086d9d2 round 3, where the entry planted at the bottom of doc/guidance/specifying.md, after the anchor, passes all four criteria. Check an ordering as a comparison of two line numbers, never as a containment command. Before agreeing a list with a range between two landmarks, plant the subject on the wrong side of the anchor and run the whole list.
