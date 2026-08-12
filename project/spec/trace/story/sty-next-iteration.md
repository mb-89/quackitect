---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: sty-next-iteration
type: "[[story]]"
statement: A product already exists and its engineer wants to start the next iteration, without re-deriving anything the last one settled.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: should
---

## Deck

The product has shipped one iteration. Its vision, its stakeholders and its baseline all stand, blessed, on the record. Today the engineer wants to add a feature.
|||
The standing inputs in i1: the vision packet, the stakeholder set and the architecture baseline, each behind its blessed gate in the record's evidence folder.

---

They are at the front desk. They say what they want: "the register should be a live table you can sort and filter."
|||
The desk takes plain words by requirement: req-desk-takes-plain-words, observed per tsp-desk-and-gates - and this very sentence became i1's goal.

---

The desk sweeps. One iteration stub is already open and thematically close, so it recommends putting the work THERE rather than seeding a second record.
|||
Contract rule 8 and the small-fix rule req-small-fix-joins-open-record: work joins an open record where one fits.

---

The engineer disagrees — this is a day of its own — and says so. The desk takes the word without argument and seeds a fresh iteration, goal and vision prefilled from the sentence.
|||
se_seed_iteration is the door; the prefill discipline (a prefill is a suggestion, never content) stands in guidance/craft/ux.md.

---

The walk opens at the retro, because onboarding always does. The inbox has eleven notes in it, and the kickoff will refuse while they pend.
|||
Every column opens with onboard-retro (rigor matrix M0_10); start_iteration's needs-retro entry gate refuses while a retro note pends.

---

They drain. Most of the eleven turn out to be already built, which takes seconds each to check. Three become backlog with a ready-when. The inbox reaches zero.
|||
The check-before-judging rule and its 2026-07-31 measurement stand in guidance/method/retro.md step 3.

---

At the kickoff the agent proposes `minor`, not `product` — the vision packet and the stakeholders are inherited by pointer, and this iteration deviates from neither. It names the cells that column strikes.
|||
The columns and their strikes are the rigor matrix's cells; the monotone law (smaller columns nest in larger) is battery-pinned.

---

The engineer blesses it. The engine compiles the shorter column into this iteration's own machine. Nothing the first iteration settled is asked again.
|||
compileColumn in engine/rigor-matrix.ts; i1's own kickoff stands blessed in evidence/gate-kickoff.md with its pinned column.
