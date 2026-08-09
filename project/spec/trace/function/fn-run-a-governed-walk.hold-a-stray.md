---
id: fn-run-a-governed-walk.hold-a-stray
type: "[[function]]"
cluster: the-holding-pen
statement: take a stray thought out of the walk's way and give it back later with exactly one home
satisfies:
  - req-stray-captured-in-one-call
  - req-capture-moves-nothing
  - req-duplicate-stray-still-captured
  - req-open-notes-stay-visible
  - req-idea-lands-as-note
  - req-one-note-per-settled-point
  - req-drain-one-home-with-payload
  - req-drained-note-leaves-count
  - req-unknown-drain-ref-refused
  - req-parked-note-re-drains
  - req-retro-asks-real-use
  - req-retro-window-drains-whole
  - req-kickoff-refuses-pending-notes
inputs:
  - flow-stray
  - flow-field-feedback
outputs:
  - flow-note-inbox
controls:
  - the drain's legal context per disposition
  - the pending count, which holds the next kickoff
source_refs:
  - uc-capture-a-stray
  - uc-drain-the-inbox
---

## Rationale

CAPTURE AND DRAIN ARE ONE FUNCTION, not two, because the whole point is the
round trip. A capture that never comes back is a diary, and a drain with
nothing to drain is a ceremony.

It stands apart from keeping the record because it does something the record
never does: it CHANGES the walk's obligations. A pending note holds the next
kickoff shut. Nothing in the log does that.

Storing a duplicate anyway belongs here rather than in a checking function.
Judging sameness at capture time would put a decision on the one path that
must never stop to think.
