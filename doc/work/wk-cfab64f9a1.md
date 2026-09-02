---
id: wk-cfab64f9a1
seq: 1000085
type: work
title: opening skips the draft
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: cowork
---

## detail

se work --open puts a backlogged token straight into imp_open, so it never drafts and no criteria are agreed. Activate in token.go sets ImpOpen and does not ask StartsAt in spec.go, whose comment says a backlogged token drafts when somebody opens it. The owner ruled that there is no point in ever opening a backlogged token straight into implementation. Activate sets spec_open, always, and a check asserts Activate names no other state. A separate decision is owed on sub-tokens, which StartsAt sends to imp_open and the engine still sends to review. Related: wk-59907a93ea, wk-bc3c5ba905, wk-12edb3522e.
