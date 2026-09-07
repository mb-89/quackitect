---
kind: [[rationale]]
title: an id from another box is marked
explains:
  - src/engine/lint.go
---

## decided

An id whose token never reached this branch is marked "(another box)" beside the id, once in the note that names it. The lint reads the mark and says nothing. An unmarked id that reaches nothing is a finding, exactly as before.

## why

Many boxes mint tokens, and only what lands travels. A claim ref cannot leave a cloud box at all, which is [[a-cloud-box-writes-refs-heads-and-nothing-else]]. So the branch carries true sentences naming work it never held.

The rule read an id against the tokens on disk and the rows in the archive, and called everything else broken. Measured at the tip in September 2026: 306 mentions of 200 distinct ids across 166 notes. No branch and no archive tag on this remote reached any of the 200. So bringing the notes onto the branch was not open to us.

The branch cannot tell those from the case the rule was built for, an id nobody ever minted. Nothing in the tree separates them, and a check that shells out to git answers differently on every clone. So the writer says which one it is, because the writer knows and the branch does not.

The mark reads as English, so the sentence still says where the work came from. Deleting the id would have quieted the rule and thrown that away.

## costs

A writer can mark an id that never existed, and the rule then says nothing about it. The mark is trusted rather than checked, which is the whole of what it buys.

The 306 mentions are not marked by this change. Eight notes carrying the twelve mentions this token names are, and the rest stay findings until a hand marks them or their tokens land.

The mark is written once per note rather than once per mention. So a reader of one sentence may have to look up the note for it.

## revisit when

- every box publishes its notes where this branch can read them, so an id resolves rather than being marked
- the marks outnumber the findings, so the rule costs more to satisfy than it catches
- a marked id is found to have never been minted, so the mark is trusted where it should be checked
