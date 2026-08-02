---
kind: method
statement: "Risk-based testing: exposure = probability x consequence ranks what gets checked hardest, first - uniform depth wastes effort on the harmless and starves the dangerous."
---

## Situation
Guidance for M6 (ranking unknowns for spikes) and M7 (allocating test depth). Whenever check effort must be divided across more candidates than the budget covers.

## Procedure
- Score each unknown or requirement: probability of being wrong x consequence if wrong.
- Rank by exposure. The top gets the spike, the deep test, the earliest slot.
- Low exposure earns light checks. Saying WHY something gets little testing is part of the method, never an omission.
- Re-rank when evidence moves either factor - a probe result or a field report changes the list.

## Sources
QAPA tailoring literature (risk exposure = P x C; owner-mapped digest, @ai/college/buecher). Bach, Heuristic Risk-Based Testing (1999).
