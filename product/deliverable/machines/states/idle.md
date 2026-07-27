---
state: idle
state_kind: work
priority: 0.01
legal_tools: all
guidance: Idle is the ROUTER. The user's request decides the way out - ad hoc or exploratory work goes through start_expedition then continue_expedition; planned multi-step work goes through the iteration lane (when it exists). Nothing to do - say so and stop, telling the user plainly that a message from them (continue is enough) resumes you; the slider alone cannot wake a stopped agent. Never tick to end on your own — end means the user is done — UNLESS the packet's shutdown level is 4 (end-on-done) or 5 (power-off-on-done) — then, with nothing left to do, tick to end deliberately and say why. THE HANDOVER - before the session ends, if anything a next session must know is not already in the repo or the records, write .se/HANDOVER.md (overwrite the old one); the next session's idle entry demands it read. Nothing to hand over, nothing to write.
---

# Idle

Booted, no active process. The whole lane is legal, and the state routes:
requests become expeditions (ad hoc) or iterations (planned). A backlog to
pull from lands here later.
