---
state: idle
state_kind: work
priority: 0.01
legal_tools: all
guidance: Idle is the ROUTER. The user's request decides the way out. Ad hoc work - seed with se_seed_expedition, then enter expeditions. Planned work - seed with se_seed_iteration, then enter iterations. The archives browse read-only. Nothing to do - say so and stop, telling the user plainly that a message from them (continue is enough) resumes you; the slider alone cannot wake a stopped agent. Tick to end when the user says the session is done — and at shutdown level 4 (end-on-done) or 5 (power-off-on-done), with nothing left to do, tick to end deliberately and say why. THE HANDOVER - before the session ends, if anything a next session must know is not already in the repo or the records, write .se/HANDOVER.md (overwrite the old one); the next session reads it in boot's read_contract. Nothing to hand over, nothing to write.
---

# Idle

Booted, no active process. The whole lane is legal, and the state routes:
requests become expeditions (ad hoc) or iterations (planned). A backlog to
pull from lands here later.
 Small fixes the owner orders in chat run
directly from here — no expedition while the project stays pre-ledger
(owner ruling 2026-07-27).
