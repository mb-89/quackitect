---
minted_in: i1
id: sty-improve-the-machine-mid-walk
type: "[[story]]"
statement: An engineer who finds the machine wrong halfway through a walk fixes it and keeps going, instead of finishing on a method they no longer believe.
actor: stk-engineer-driving-agents
refines:
  - vp-the-engine
priority: should
---

## Deck

Mid-walk, the step in hand asks for something that should not be asked. The guidance is wrong, not the work. Finishing anyway means producing an artifact nobody will trust.
|||
The real case of 2026-08-11: M8's rows still asked for hand-written fields the owner had ruled mechanical, with the walk standing bound at the gate.

---

The engineer edits the guidance where it actually lives — the row the state compiled from, not a copy of it.
|||
Demonstrated twice, and the cost fell between. On 2026-08-11 it took the escape-edit-return loop: stepped out, recut the rows and laws on trunk (commit 2dd52fec), stepped back. On 2026-08-14 the same kind of edit landed from inside the bound record in one call, because shared method now resolves to the machine root and SE-C-134 was retired ([[req-an-engine-change-applies-in-its-own-record]]).

---

They ask for a reload. The engine restarts on the new sources in under a second.
|||
se_reload on 2026-08-11: "the engine restarts in under a second on the NEW sources" - the call and its answer are in the log.

---

The walk reboots at the start and re-earns what it owes: the reading comes back, one document at a time, and the position is recomputed rather than remembered.
|||
The same day's walk-back: eleven documents re-served with tail probes, the position recomputed by pull - never asserted.

---

The state opens again, with the corrected guidance in it. What was already filled stands; nothing was thrown away for a change that did not touch it.
|||
Every standing claim from write-stories to verification re-verified and held on the walk back; the recut guidance served live at each state.

---

The method improved during the walk it was governing, and the record shows both the change and the walk that provoked it.
|||
Trunk 2dd52fec and the record's mirror commit bb456cf0, merged back by sync baf5ec1d - change and walk, both on the ledger.
