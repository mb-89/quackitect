---
id: wk-6bac0c2b7a
seq: 1000234
type: work
title: the first process
status: backlogged
assignee: main
scope: multi-step
traced: true
minted_by: cowork
---

## detail

A process mints work tokens, and the token's shape comes from the process that minted it. The first process is the plain one: mint from the template, do the work, walk the checklist in doc/guidance/behaviour.md alone, close. No reviewer is spawned. The checklist is the evidence template, one evidence section named checklist with one line per item. The engine refuses a close while an item is unanswered. Measure rounds per token, defects found after close, and time per token, so a reviewer can be judged against this baseline later. The engine's review flow is to be reworked for this, and a parameter that switches reviewers off was rejected by the owner on 2026-09-02. Related: wk-126fd296db, wk-097b2cac17.

## done when

- se work mints from the process, and the note says which process minted it
- a close with an unanswered checklist item is refused, naming the item
- the period numbers carry rounds per token, defects after close, and time per token
