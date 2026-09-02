---
id: wk-ec0ef7653f
seq: 1000170
type: work
title: a token carries commits
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: main
---

## detail

A work token gains a field for the commit range its work landed in, written at submission, so a review opens with git diff. Nobody types a hash: the engine records the head when the work was taken up and the head when it was submitted. It changes the token shape, the store, the submission path and what a reviewer is served. It answers wk-4e8eeb76aa finding 2.
