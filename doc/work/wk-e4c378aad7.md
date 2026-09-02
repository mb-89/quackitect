---
id: wk-e4c378aad7
seq: 1000084
type: work
title: two lists one overlap
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: rev-1
---

## detail

An allowed set and a forbidden set are written in different vocabularies, so nobody sees that they overlap. Found on wk-cae83b6e63: the allowed list opens with a stale line number in a recorded observation, and the forbidden list says a criterion. A recorded observation is Criterion.Red at src/engine/token.go:217. The rule refuses the case it was written for and every criterion about the refusal is green. To catch it, read every worked example in the detail down the forbidden list, then check no allowed member is part of a forbidden member. To stop it, write both lists in the vocabulary the check runs in, the field a change lands on, and put them side by side.
