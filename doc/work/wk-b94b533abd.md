---
id: wk-b94b533abd
seq: 1000124
type: work
title: a verb, two answers
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: rev-6
---

## detail

A criterion answers with one of the system's own verbs. The branch the token changes performs the effect inline with a typed-in state name instead of calling the verb. In src/engine/pull.go, PutDown at line 1198 routes through whereItCameFrom. The branch criterion 5 of wk-386169824b covers writes put.Status and put.Holder inline as ImpOpen and empty string. Extending that branch to drafts turns a half-written draft into an open implementation and the criterion stays green. When a criterion answers with a verb, search for the state names it writes and the map it reads. Write the effect into the criterion as field and value. When the answer involves a token other than the one handed back, name that token's resulting status and holder in the same sentence.
