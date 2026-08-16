---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: sty-carry-a-finding-without-stopping
type: "[[story]]"
statement: When a check turns up a real defect that breaks nothing, I want to record it and keep going, so the walk does not stall on work nobody needs done now.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

A finding that breaks nothing stops the walk anyway. The only two moves are fix it now or forget it, so real defects get fixed out of turn and small ones get lost.
|||
MEASURED IN i34, the record that ran before this one: ten requirements were deleted and four things they were pointing at broke. Every one was caught several states downstream by a coverage law, and each cost a walk back.

THE OWNER'S WORDS ON 2026-08-16: "we just name defects and put the defects in a bucket. But if the defect doesn't break anything, we can continue with the work."

---

Mid-build, with a state's checklist open. A check turns up something real: a comment that describes code it no longer matches. It is true, it is worth fixing, and nothing downstream depends on it.
|||
DEMONSTRATED FOR REAL AT i11'S OWN VERIFICATION. The claims checklist served twelve non-test specs. Nine of them are whole-product claims this record's delta never touched: a first run on a fresh machine, a tour, a host swap, a second machine.

Each is a real thing that is genuinely not verified, and none of them blocks anything i11 built.

---

The engineer records it as an owed item on the checklist rather than a ticked box, pointing it at a register entry that names an owner.
|||
NINE LINES WERE WRITTEN AS `- [owed] <spec> — <entry>`, against two entries: raid-issue-must-demos-owed for the four that need a person or a fresh machine, and raid-iss-whole-product-claims-reverified-by-every-record for the five the delta did not touch.

THE THREE THE DELTA DID PUT AT RISK were observed instead and ticked: tsp-autonomy-tiers, tsp-prose-inspection, tsp-record-inspection.

---

The engine refuses the owed item unless that register entry exists and is open. A disposition nobody agreed to is not a disposition.
|||
IT REFUSED ONE OF MINE. tsp-unattended-start was first aimed at raid-asm-the-launched-agent-can-authenticate-itself, and the submit came back naming it: "owed ref is not an open raid entry".

That assumption is probed and resting, not open. The claim would have read as dispositioned while pointing at nothing, which is the exact failure the guard exists for — and it caught its author rather than a hypothetical.

---

The walk continues. The state signs, the next states run, and nothing re-raises the finding, because it is carried rather than pending.
|||
VERIFICATION SIGNED WITH `owed_count: 9` on the form, and the walk moved to gate-implementation, then through the implementation gate, the consistency sweep and the validation gate.

NOTHING RE-ASKED. The nine did not reappear as unfilled boxes, and no later state stopped on them.

---

At the close, the engine HANDS every owed item to the next record, names each one with its entry, and writes the count on the closed record. The record ships, and the finding travels rather than being lost.
|||
THIS SLIDE SAID "REFUSES" UNTIL 2026-08-16, and the owner changed it after the refusing shape trapped the walk three times in one day. A close that will not pass leaves the walk standing in the last state with no legal move, and disposing a finding usually needs the person's ruling — asked at the worst possible moment, when the only thing left to do is ship.

CARRYING IS STILL A DISPOSITION. "Carried to the next record, on the record" is an agreed outcome, which is what NASA NPR 7123.1 means by a review completing on dispositions rather than on every finding being fixed.

THE COUNT IS WHAT KEEPS IT HONEST. `carried_count` rides the closed record, so a number that grows every record is a signal rather than a list nobody reads.

---

The finding was neither fixed out of turn nor lost. It rode the iteration in the open, and the handover is what made sure somebody looks at it again.
|||
THE FIRST REAL RUN FAILED, and it is worth keeping on the record. i11's own close was supposed to catch nine owed items and did not: the guard had been built on the EXPEDITION close, reading a hardcoded expeditions path, while an iteration closes through a different function that never looked. The record shipped past all nine.

THE HONEST LIMIT, recorded rather than argued away: nine owed items on one form is the number raid-iss-whole-product-claims-reverified-by-every-record warns turns a debt into the normal case.

WHAT KEEPS IT FROM BEING A FORMALITY is that the three specs the delta actually endangered were observed rather than bucketed, and the guard refused a bad reference — catching its own author rather than a hypothetical.
