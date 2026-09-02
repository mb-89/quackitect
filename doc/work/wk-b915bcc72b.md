---
id: wk-b915bcc72b
seq: 1000143
type: work
title: two agents one draft
status: spec_open
assignee: main
scope: single-step
traced: true
minted_by: main
---

## detail

The drafting loop in next() in src/engine/pull.go matches on assignee and on SpecOpen or SpecInWork and never looks at the holder. A held draft is handed to the next actor that asks, so two agents write one note and the second one submits it. This happened to rev-9 on wk-0d9086d9d2. The implementation loop twelve lines below requires all[i].Holder == actor. Decide whether a held draft is not offered, as the implementation loop does, or offered with the hold named. The check: two actors and one spec_in_work held by the first. The second is not handed it, and the holder is still handed it back.
