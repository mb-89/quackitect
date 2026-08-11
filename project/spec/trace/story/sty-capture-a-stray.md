---
id: sty-capture-a-stray
type: "[[story]]"
statement: An engineer spots something wrong that is not today's job, records it in one breath, and keeps going without losing either the finding or the thread.
actor: stk-engineer-driving-agents
refines:
  - vp-the-ledger
priority: should
---

## Deck

Mid-review, the engineer notices the neighbouring module carries the same bug they just fixed. Chasing it now means losing the thread. Ignoring it means losing the finding.
|||
A real one from 2026-08-11: mid-walk, meth-raid's kinds table was found still missing the debt kind — not that day's job.

---

They type it into the note box on the panel, in their own words, and press nothing else. No form, no category, no ticket type.
|||
The note box with its MoSCoW beside it: machines/panels/note-entry.md; the lane twin is se_note {text}.

---

The inbox count goes up by one. That is the whole feedback, and it is enough — the finding is now somewhere that gets walked.
|||
The capture above answered "captured: note-41900125040d, inbox: 7" — one call, one count.

---

They go back to what they were doing. Nothing about the walk moved, and no state was left.
|||
The call log shows the walk standing at the same state through the capture; se_note is legal anywhere and moves nothing.

---

Later the same day an agent notices a second thing and does exactly the same. Both notes sit in the same inbox, and neither says who wrote it, because the disposition does not depend on that.
|||
Same day, same inbox: note-9e905dddef9d (the sweep-scope gap) landed beside it; dispositions in .se/notes.jsonl are judged against the code, not the author.

---

At the next retro the note is checked against the code before it is judged, and drained into one home with a line saying where it went.
|||
The retro's rule and its measurement: guidance/method/retro.md step 3 — on 2026-07-31 most sampled notes turned out already built.

---

The finding survived a whole day of unrelated work, and the day it interrupted was none.
|||
The 2026-08-11 retro drained 14 pending notes to zero, each with its disposition on file in .se/notes.jsonl.
