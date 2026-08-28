---
unreachable_verbs:
  - se_version
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: sty-read-the-record-and-ask-who-did-what
type: "[[story]]"
statement: An engineer opens a finished record and asks which parts were walked by which hand and on what model, and the log answers instead of the engineer having to remember.
actor: stk-engineer-driving-agents
refines:
  - vp-the-ledger
priority: should
---

## Deck

A record finished overnight. Something in it reads badly and something else cost more than it should have. The engineer wants to know which states were under-driven and which were over-driven.
|||
TODAY BOTH QUESTIONS ARE UNANSWERABLE AND THE LOG LOOKS THE SAME EITHER WAY. A walk that went wrong and a walk that went expensively leave the same undifferentiated trail.

---

They ask the log which model answered each call.
|||
THE FIELD DOES NOT EXIST. engine/calllog.ts:11-24 declares CallRecord and its fields end at actor and se_version. There is no model on it and never has been.

---

They ask which state each call was made in.
|||
THAT FIELD DOES NOT EXIST EITHER, and it is the half nobody had noticed. The state rides inside a narration record's arguments where grouping cannot reach it. retro.md's step 9 already carries the consequence from 2026-08-17: per-step cost is not computable today.

---

They ask which part the caller was playing.
|||
THAT FIELD DOES NOT EXIST EITHER, AND IT IS A THIRD COORDINATE RATHER THAN A DETAIL OF THE FIRST. engine/calllog.ts:22 declares actor as human, agent or ui, and engine/tools.ts stamps every lane call agent. Both hands are agents, so a guide working the lane reads as the walker. And where the walker relays the guide's work instead of the guide filing it, the origin is lost outright. The model does not answer it either: subagents.md says judgment work inherits the session model, so a guide can carry the walker's own model name.

---

With all three stamped, the question becomes one query rather than a reconstruction.
|||
ANY COORDINATE ALONE ANSWERS NOTHING. "This model answered 190 calls" and "190 calls happened somewhere" are the same non-answer from two directions. The record grows the fields it is missing in one edit or it grows none of them.

---

The engineer trusts the answer because it says what SERVED the call, not what was asked for.
|||
THIS IS THE SLIDE WITH AN ASSUMPTION UNDER IT. The transport hands the engine a client name and nothing more — engine/mcp.ts:58 and :68. So the value can only be self-reported by the party being measured, and this harness re-runs a flagged request on another model and suppresses the notice under machine-readable output. An honest agent can report the wrong model. raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it.

---

The answer outlives the box that produced it.
|||
WHICH IS WHY IT IS ON THE CALL RECORD AND NOT IN .se/ ALONE. A cloud box is reclaimed and its machine-local files go with it — the same reason this iteration's findings ride in a field report on the branch rather than in notes.
