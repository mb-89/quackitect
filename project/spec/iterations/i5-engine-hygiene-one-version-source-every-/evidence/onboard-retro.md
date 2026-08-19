---
form: onboard-retro
by: agent
signed_off: 2026-08-19T10:47:27.241Z
authors: agent
files:
---

# Evidence form / onboard-retro

## current_situation

This is a fresh cloud clone. The container was created today and carries no local machine state.

What stands open: 22 seeded iterations, 0 expeditions, 0 pending notes, 0 work tokens in the pool.

This walk entered i5 (engine hygiene) on the owner's word. Autonomy stands at strategic and stop-at at blockers only, both set by the owner's instruction this session.

The inbox is empty, so the retro row is skipped per its own rule. This form records the checks that were still worth running.

## field_feedback

Asked this session. What came back, in the owner's own words: run iteration five unattended, raise autonomy, place the gates yourself, and let only blockers stop the walk. Work lands on branch v3.

No field report about the product itself came back yet. The question stands open in chat and this field is amended if an answer arrives.

Nothing else was reported.

## notes_drained

- the whole inbox: nothing to drain — se_survey reports 0 pending notes and 0 work tokens, and .se/notes.jsonl does not exist on this clone

## call_log_mined

- The window is this session only: the live log opens at its first record, 2026-08-19T10:40:44Z, because a fresh container starts .se/calls.jsonl empty and no carried or backlog drain exists in it.
- 27 calls in the window, no refusals from the walk itself: se_pull 11, mirror_slow 5, se_log_query 2, se_help 2, mirror_autonomy 2, mirror_stop_at 2, se_survey 1, se_aim 1, se_update 1.
- Two refusals both fired SE-C-101 on an invented argument name: se_help {topic} and se_run {intent}. Both tools take a different word for the same idea, and neither refusal was a repair case.
- mirror_slow fired 5 times inside a 6-minute boot, which says the mirror's own slow-request threshold trips on this host's cold start.
- se_run count in the window is 1, and it ran a scratchpad script. That is the shape the lane guidance asks for, not a missing verb.
- The call log carries no history across a cloud container, so an onboard-retro on a fresh clone can never mine more than its own session. That is a structural limit, not a finding about this window.

## waste_leads

- Four calls went to working out how to set the two dials, because no lane verb moves them and the mirror's POST routes had to be read out of engine/mirror.ts.
- Two calls were spent on argument names the lane spells differently per verb (se_help query, se_run command).

## promotions

- se-mcp --version: NOT landed. i16's emit_back names it and the flag is still absent from engine/bin/se-mcp.ts. It is already inside i5's scope, so it is picked up by this iteration rather than promoted separately.
- engine/toll.ts SE-C-040 remedy still hands back the placeholder string "an OPEN node id" — i17's emit_back line stands unlanded.
- engine/toll.ts grace warning still rides a plain result key, not `banner` — i17's emit_back line stands unlanded.
- machines/forms/templates/checklist.md still teaches the exact "- [x] <item>" line — i17's emit_back line stands unlanded.
- LANDED: both rigor-matrix rows i17 named, M8_20A_sweep-consistency and M8_90_gate-validation, now grant se_prompt_place.
- No template-level promotion is owed out of this state: nothing local has been changed yet in this walk.

## process_stale

Compared against the two records that shipped most recently, i16 and i17, and against guidance/method/retro.md as it stands today.

The process is not stale. One gap is real and worth naming: the onboard-retro's mining steps assume a call log that survives between sessions, and a cloud container starts empty. On this host the step can only ever report its own session.

The retro method already handles the empty inbox explicitly, and that rule is what this walk followed.

## follow_up

The kickoff is next, and it proposes a change size for i5.

Carried forward into i5's own scope, all of them already named in the record's vision: the version source, the refusal anchors, the duplicate-key sweep, the refs test split, the paint-rule pin.

Parked as an observation for the next retro, ready when a retro next runs on a cloud clone: the call log does not survive a container, so onboard-retro's mining steps read one session only.

## anything_else

The three emit_back lines from i17 that are still unlanded (the toll remedy, the toll banner, the checklist help) are engine hygiene by any reading. They are not in i5's vision, so they are not silently pulled in here. The kickoff is where scope is set, and they are put to that state as candidates.
