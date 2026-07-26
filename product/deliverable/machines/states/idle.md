---
state: idle
state_kind: work
priority: 0.01
legal_tools: all
guidance: Idle is the ROUTER. The user's request decides the way out - ad hoc or exploratory work goes through start_expedition then continue_expedition; planned multi-step work goes through the iteration lane (when it exists). Nothing to do - say so, then hold with se_tick {wait true} so the user's hand (mirror tick or slider) reaches you; never tick to end on your own, end means the user is done.
---

# Idle

Booted, no active process. The whole lane is legal, and the state routes:
requests become expeditions (ad hoc) or iterations (planned). A backlog to
pull from lands here later.
