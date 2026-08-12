---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: sty-ask-and-record-the-answer
type: "[[story]]"
statement: An engineer asks a question the system cannot answer from inside itself, and both the search and the answer end up on the record rather than in a chat window.
actor: stk-engineer-driving-agents
refines:
  - vp-the-ledger
priority: should
---

## Deck

A question comes up that nothing in the repo can settle. What do the tools people actually use do about this, and does our approach survive against them.
|||
A real one: the pairwise-ranking prior-art question at derive-criteria. The search and its finds stand in note-a3b10e1d75dd, cited from meth-derive-criteria.

---

Nobody in the room knows, and guessing here would be worse than not asking — a fabricated comparison routes real work.
|||
The owner ruling of 2026-08-06, recorded in the voice guidance's evidence rules, after a gate carried a fabricated tool comparison.

---

The search runs through the lane, so the query itself is logged. What was asked is as much a part of the record as what came back.
|||
The web-search hook: engine/bin/se-hook-websearch.ts routes every query to the feed; se_web_search and se_web_fetch log like every lane call.

---

The results are read and the sources kept. What survives becomes a reference node in the corpus, so the next person starts from the finding rather than searching again.
|||
Standing examples: the ref- nodes the method cards cite — ref-sya-re from meth-cockburn-use-case, ref-ieee-1016 from the design-spec template.

---

The answer is recorded against the question, in one place, as two fields. The chat can be lost mid-turn; this cannot.
|||
se_answer writes aq records to the call log; the 2026-08-11 boot banner counted 21 recorded answers for the prior session alone.

---

A claim from the search that nobody can back is not written down. A vendor saying a feature exists is evidence the feature is claimed, and nothing more.
|||
The rule stands in meth-benchmarking ("WHAT A FEATURE LIST IS EVIDENCE OF") and binds every comparative claim.

---

Weeks later the question comes up again. The answer is where the question is, with what it was based on, and nobody searches twice.
|||
se_log_query serves any recorded answer back by ref or filter; the log is kept forever-until-1GB by owner ruling.
