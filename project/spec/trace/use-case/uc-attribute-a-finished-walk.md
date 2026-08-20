---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: uc-attribute-a-finished-walk
type: "[[use-case]]"
kind: interaction
statement: Ask a finished record which hand walked which state and on what model, and get the answer from the log rather than from anybody's memory.
actor: stk-engineer-driving-agents
trigger: a record is finished and something in it read badly or cost more than expected
precondition: the calls of that walk are in the log, and the log carries the answering model, the state, and the part the caller played
guarantee: either the question is answered by one query over the recorded calls, or the record says which coordinates it is missing — never a partial answer that reads as complete
refines:
  - sty-read-the-record-and-ask-who-did-what
priority: should
---

## Main scenario

1. The engineer opens a finished record and asks which states an expensive model walked.
2. The query groups the recorded calls by the state they were made in.
3. Each group carries the model that ANSWERED those calls, not the model that was asked for.
4. Each group also carries the part its caller played, so the walker's calls and a guide's can be counted apart.
5. The engineer reads which states were driven harder than their rating, and which were driven softer.
6. The answer survives the machine that produced it, because it is on the record rather than in machine-local state.

## Extensions

- 2a. THE STATE COORDINATE IS MISSING, which is the case today. `engine/calllog.ts:11-24` ends at `actor` and `se_version`. Grouping by state returns one bucket — and so does grouping by any word at all, because `calllog.ts:289-292` falls back to `(none)` for a key it cannot reach. `group_by: "banana"` returns the same. The absence is real; that measurement is not what establishes it.
- 3a. THE ANSWERING MODEL IS SELF-REPORTED. `engine/mcp.ts:58` and `:68` hand the engine a client name and nothing more, so the only party who knows is the party being measured. `raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it`.
- 4a. THE PART THE CALLER PLAYED IS NOT OBSERVABLE WHERE THE CALL IS SERVED. `engine/calllog.ts:22` declares `actor` as `human | agent | ui`, and `engine/tools.ts` stamps `agent` on every lane call. A walker and a guide are both agents, so a guide working the lane directly is indistinguishable from the walker.
- 4c. AND A RELAYED CALL LOSES ITS ORIGIN ENTIRELY. Where the walker carries a guide's work back rather than the guide filing it, nothing on the record says the judgment was the guide's. That is worse than the case above: the first mislabels a call, the second attributes it to the wrong hand outright.
- 4b. THE MODEL DOES NOT STAND IN FOR THE PART. `project/guidance/method/subagents.md` § Which model, owner grant 2026-07-11: judgment work INHERITS the session model. A guide can carry the walker's own model name, and then grouping by model returns one bucket for two hands.
- 3b. The harness moved the session to another model mid-walk and said so only on a stream a machine does not read. An honest agent then reports the wrong model, which is worse than a dishonest one because nothing looks wrong.
- 5a. A state's rating has never once been contradicted by what actually walked it. That is the demotion signal nothing currently produces, and it is why `raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so` stands at expected.

## Why every coordinate or none

"THIS MODEL ANSWERED 190 CALLS" AND "190 CALLS HAPPENED SOMEWHERE" are the same
non-answer from two directions. The record grows the fields in one edit or it
grows none of them, and shipping half would look like progress and move nothing.

THERE ARE THREE OF THEM AND NOT TWO, corrected 2026-08-20. The owner named the
arrangement this record had no word for: a WALKER holds the session and makes
every lane call, and a GUIDE is asked for the occasional step the walker will
not take alone. "How much of this walk did the strong hand do" is the question
the whole arrangement is judged by, and neither the model nor the state can
answer it.
