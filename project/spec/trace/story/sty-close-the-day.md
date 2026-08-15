---
minted_in: i1
id: sty-close-the-day
type: "[[story]]"
statement: An engineer closes the record that held the day's work, and every finding it produced gets ruled on rather than quietly dropped.
actor: stk-engineer-driving-agents
refines:
  - vp-the-ledger
priority: should
---

## Deck

End of the day. The expedition that has been collecting since morning holds a handful of landed commits and a report nobody has read.
|||
A real one in this record: exp-trunk-read-cost, spec/iterations/i1-prove-a-bases-equivalent-live-table-can-/exp-trunk-read-cost.md.

---

The engineer asks to close it. Nothing closes yet.
|||
se_exp_close is the door, and it demands the report's findings ruled before anything closes.

---

The report comes up first. Every finding it made wants a ruling: applied, or dismissed with the reason. Neither is a default and neither can be skipped.
|||
The owner ruling of 2026-07-27, recorded in guidance/method/retro.md: reports are ruled AT CLOSE (applied | dismissed), out of the retro's loop.

---

They rule each one. Two were applied during the day and say where. One is dismissed, and the reason is written so nobody re-opens the argument in a month.
|||
exp-trunk-read-cost closed with its finding promoted: `promote:` names it, `chunk: trunk-batch-reader` assigns it — and build-steps built that chunk.

---

The record closes. Its strays are committed so the trunk is clean, which is what lets the next worktree branch from something honest.
|||
The archive releases worktrees by requirement: req-archive-releases-worktrees; engine/worktree.ts carries the release.

---

The archive gains one more finished record, readable exactly as it stood.
|||
The archive is read-only and person-only: req-archive-read-only and req-archive-opens-to-a-person-only.

---

A day's work ended with every finding ruled and nothing left dangling. Closing was a decision, not a tidy-up.
|||
The closed expedition stands in the i1 record with its ruling; the promoted chunk's build is signed at build-steps.
