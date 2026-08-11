---
id: sty-review-a-gate
type: "[[story]]"
statement: The walk has stopped at a gate, and the engineer reads what it produced, disagrees with one part, sends it back, and blesses the second attempt.
actor: stk-engineer-driving-agents
refines:
  - vp-systematic-engineering
priority: must
---

## Deck

The panel shows the walk stopped. One node is lit, and it is a gate. Under it a message says which step waits.
|||
The stop is the machine's own (SE-C-113 names the waiting step); observed at gate-implementation on 2026-08-11 - reports/rpt-review-a-gate.md.

---

The engineer clicks the node. The evidence form opens beside the drawing — not a summary of it, the form itself, with every field the agent filled.
|||
req-gate-shows-the-evidence-form, observed per the desk-and-gates procedure in live sessions.

---

They read the rounds. Verify names each check with its verdict. Validate argues it is the right thing. The red team names a kill criterion and says whether it fired.
|||
The compiled rounds as filled: evidence/gate-implementation.md - round_0_verify, round_1_validate, round_2_red_team, each in its per-item grammar.

---

One claim points at a file. They click the path and the file opens in the editor, in a tab of their own, where they can read it properly.
|||
The panel's click-to-open path; every reference field carries real paths by the refs template's own check.

---

It does not say what the form claims. The engineer rejects the gate and writes one line naming what to redo.
|||
The reopen mechanism per meth-gate-review: a reopen names states, the executor re-activates them and their cone.

---

The walk does not advance. The agent goes back, fixes the artifact rather than the sentence about it, and refills the form.
|||
Lived in i1's verification loop: three fresh-eyes rounds found 17 real defects, each fixed in the artifact, the runs confirming - the fix-findings records.

---

The second read holds up. They press the thumb, and the record keeps whose hand it was and when.
|||
The bless on file: gate-implementation blessed 2026-08-11, hash-bound with actor and time.

---

A gate was argued once, in one place, against the artifacts themselves. Everything past it now rests on a frame a person actually signed.
|||
reports/rpt-review-a-gate.md - and the recheck of the same gate after the M8 reshape showed a bless does not outlive its evidence.
