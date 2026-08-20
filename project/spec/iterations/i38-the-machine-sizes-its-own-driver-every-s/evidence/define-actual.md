---
form: define-actual
by: agent
signed_off: 2026-08-20T09:43:12.993Z
authors: agent
files:
---

# Evidence form / define-actual

## current_situation

The vision is inherited and the register is open with eight entries. This state says where the ground actually is.

Everything below was measured on this box today, not recalled. Where a figure came from somewhere else it says where and when.

A ninth entry was minted while writing it: attribution needs two coordinates and the record carries neither.

## as_is

THE GOOD, and there is real ground here.

THE MACHINE ALREADY READS ITS OWN DIALS FROM FILES A PERSON EDITS. `machines/scale.md` holds six autonomy rungs and `machines/stopat.md` holds four stop notches, both with the same contract written at the top: the engine READS this file, the ORDER of the lines is the scale, and moving a line moves the rung. A fixed model list has a pattern to follow and does not need one invented.

THE TWO-AXIS SPLIT IS ALREADY LIVE ON ONE AXIS. The autonomy dial works, is categorical, and gates on a comparison rather than a number. i38 adds the second axis beside it rather than into it.

THE MATRIX IS ONE FILE PER STATE AND ALREADY CARRIES PER-COLUMN CELLS. Adding a per-state value is the shape the matrix was built for, and 53 row files stand ready to take one.

THE ENGINE ALREADY SPAWNS AN AGENT WHERE SPAWNING BELONGS — outside the walk, at the entrypoint. `engine/bin/se-start.ts:245` spawns the command named by `--agent`, defaulting to `claude`, after probing it with `--version` at `:242`. Whatever names a driver has somewhere to hand it to.

THE BAD, measured rather than asserted.

NOTHING ANYWHERE DECLARES A COMPLEXITY. A search of `project/deliverable` for the word returns hits only in unrelated prose — the TRIZ vendor matrix, three method cards, one row's guidance. No matrix row carries a rating, no engine file reads one, and no list of models exists in the repository at all.

THE CALL RECORD ENDS AT `actor` AND `se_version`. `engine/calllog.ts:19-23` is the whole shape. There is no model field to fill.

THE TRANSPORT CANNOT SUPPLY ONE EITHER. `engine/mcp.ts:58` and `:68` declare `clientInfo` as `{name, version?}` — a client name and nothing more. So the value can only ever arrive as something the caller asserts, which is why an assumption stands on it.

AND THE SECOND HALF OF ATTRIBUTION IS MISSING TOO, which is the worst of the measurements. `se_log_query {group_by: "visit"}` returns `{"(none)": 190}` and `{group_by: "state"}` returns `{"(none)": 191}` — every record in one bucket, live, today. `{group_by: "actor"}` separates cleanly into ui 8, agent 181, human 3, so the mechanism works and the coordinate is simply absent. The retro method already carries this from 2026-08-17 in its own words: per-step cost is not computable, because the state rides inside a narration record's arguments where grouping does not reach.

SO A WALK IS UNATTRIBUTABLE ON BOTH COORDINATES. Not "who" and not "where". Stamping the model closes one of the two.

WITNESSES NAMED.

- `project/deliverable/machines/scale.md` and `machines/stopat.md` — the read-live pattern a model list should copy.
- `project/deliverable/machines/rigor_matrix/rows/` — 53 row files, 89 evidence fields across 43 of them.
- `project/deliverable/engine/calllog.ts:19-23` — the call record's fields.
- `project/deliverable/engine/mcp.ts:58,68` — the handshake, carrying no model.
- `project/deliverable/engine/bin/se-start.ts:242,245,278` — the existing spawn and its one-argument adapter.
- `project/deliverable/engine/iterations.ts:294,329,350-364` — the demand ledger, and why a dependency edit reopens claims.
- `project/guidance/method/subagents.md:31` — the standing per-subagent grant this design must sit beside.
- `project/guidance/method/retro.md` step 9 — the documented impossibility of per-step cost, dated 2026-08-17.
- Live `se_log_query` groupings taken on this box, 2026-08-20, for the (none) buckets above.

THE HONEST SUMMARY. The rails exist and the cargo does not. Every mechanism this iteration needs has a working precedent in the tree — a read-live machine file, a per-row cell, a stamped-where-it-is-served field, an out-of-lane spawn. What is absent is any data at all: no ratings, no list, no model on a call, and no way to say which state a call belonged to.

## follow_up

- `raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in` was minted here and belongs in the design's scope conversation. Stamping the model alone would look like progress and answer nothing, and that is the reading it exists to prevent.

- The read-live machine file is the pattern for the model list and it should be followed rather than re-argued: same header contract, same "the order of the lines is the scale" if the rungs are ever ordered, same hand-editing story.

- The measurement to re-take once ratings exist: the per-item complexity spread inside each submachine. It is the only thing that turns the submachine-maximum risk from arithmetic into a number.

## anything_else

