---
id: wk-4ac68bafee
seq: 1000189
type: work
title: put-back knows two states
status: spec_open
assignee: main
scope: single-step
traced: true
minted_by: rev-20
---

## detail

putBack in src/engine/gate.go maps SpecInWork to SpecOpen and everything else to ImpOpen, so WorkOn puts a held review back as implementation work. wk-61d6fa0484 went from spec_in_review to imp_open this way and was restored to spec_submitted by hand. PutDown in src/engine/pull.go already reads whereItCameFrom, which maps all four held states. Delete putBack and have WorkOn read whereItCameFrom. The check holds a token in each of the four states InWorkFor treats as held and requires WorkOn put-back and PutDown to answer the same.
