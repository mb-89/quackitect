---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: sty-clear-the-inbox-with-a-retro
type: "[[story]]"
statement: The notes inbox has grown all week, and one retro walks it to zero without anything being lost or re-litigated.
actor: stk-engineer-driving-agents
refines:
  - vp-the-ledger
priority: should
---

## Deck

The panel's inbox count reads twenty-four. Every one is something an agent noticed mid-walk and refused to chase.
|||
The real count of 2026-08-11: 14 pending notes at the retro's open, every one captured mid-walk by se_note.

---

The engineer asks for a retro. The desk recommends it too, because an inbox near overflow is what stands ripest.
|||
The retro fires on a "needs retro" note or freely at idle: guidance/method/retro.md "When it fires".

---

The retro marks its boundary first, before anything else, so its own draining cannot shrink the window it is about to look at.
|||
Step 1 of guidance/method/retro.md, with the engine backing it: "last_retro" means the newest carried-or-backlog drain (engine/calllog.ts).

---

It asks the field-feedback question before it asks anything else. What came back from real use since the last look?
|||
Step 2 of guidance/method/retro.md; the 2026-08-11 retro asked it and captured the answers as notes before draining.

---

Then it walks every note once. Most are checked against the code rather than judged from the text, and most of those turn out to be already built — the check costs seconds and the note is drained as done, saying where.
|||
The recorded measurement in retro.md step 3: on 2026-07-31 the twelve smallest notes were sampled and most had shipped days earlier.

---

The rest go to exactly one home. Overtaken ones are marked obsolete with the reason, so nobody argues them again. Future scope goes to backlog with a ready-when that names the condition.
|||
The four homes and the required ready-when: retro.md step 3; the dispositions stand in .se/notes.jsonl.

---

The inbox reaches zero. The backlog grew, and every line in it says what has to be true before it comes back.
|||
The 2026-08-11 retro: 14 drained to zero, 5 leads emitted; se_survey serves the backlog rows with their ready_when.

---

Nothing was chased when it was found, and nothing was lost by the time it was judged. The inbox is a working set with a floor, and the retro is what puts the floor back.
|||
The whole loop on one day's record: captures mid-walk, zero at the retro's close, in .se/notes.jsonl and the call log.
