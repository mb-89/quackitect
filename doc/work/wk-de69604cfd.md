---
id: wk-de69604cfd
seq: "17"
type: work
title: a reviewer that waits
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: main
---

## detail

A reviewer that dies at an empty queue means a submission made a moment later waits for the next spawn. The owner would rather it stayed. Measure how long a submission waits in practice. If the wait is the problem the owner predicts, keep the reviewer alive and let the reclaim-on-arrival rule handle a dead one.
