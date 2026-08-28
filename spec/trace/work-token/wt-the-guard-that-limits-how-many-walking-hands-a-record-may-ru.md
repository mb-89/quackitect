---
id: wt-the-guard-that-limits-how-many-walking-hands-a-record-may-ru
type: "[[work-token]]"
statement: "The guard that limits how many walking hands a record may run reads its limit from a checkpoint the record has not reached yet during its opening phase. Unreadable counts as zero, so the very first hand a record starts is already one over the line, and the walk cannot leave that position. Neither printed way out works: the hand is still busy, and the position forbids writing. A hand stood itself down to get through, which silences its own reporting for what remains of that phase. Two candidate repairs: let the opening phase default to allowing one hand, or exempt a hand started where no such checkpoint exists on disk yet."
place: i64-the-diamond-and-the-orchestrator-handove
ready_when: ready when the spawn state's exit script or the milestone ordering is next opened
source: note-829e1fafe23a
---

## Why it stands

The guard that limits how many walking hands a record may run reads its limit from a checkpoint the record has not reached yet during its opening phase. Unreadable counts as zero, so the very first hand a record starts is already one over the line, and the walk cannot leave that position. Neither printed way out works: the hand is still busy, and the position forbids writing. A hand stood itself down to get through, which silences its own reporting for what remains of that phase. Two candidate repairs: let the opening phase default to allowing one hand, or exempt a hand started where no such checkpoint exists on disk yet.

## When it comes back

ready when the spawn state's exit script or the milestone ordering is next opened
