---
form: onboard-retro
by: agent
signed_off: 2026-08-16T15:26:30.951Z
authors: agent
files:
---

# Evidence form / onboard-retro

## current_situation

THE DESK RETRO RAN MINUTES AGO and emptied the inbox. This onboard-retro is the thin catching end of it, not a second pass.

What stands open right now, from se_survey.

- 26 iterations seeded, 0 expeditions.
- 0 pending notes. Two were filed and drained during this state.
- 72 parked backlog items.

i11 shipped at 4.3.0. It carried nine owed items past its own close, because the close guard was wired to the expedition close only. That defect was fixed before this iteration opened.

THE OWNER OPENED i6 WITH ONE STANDING INSTRUCTION: spend the iteration mechanising. Everything that can be made a check rather than a rule gets made a check.

## field_feedback

NOTHING NEW. The owner's own words, at the desk retro that preceded this one: "I have no additional field feedback."

THE QUESTION WAS ASKED THERE AND ANSWERED THERE. Asking it again in the same sitting is the double-fire the 2026-08-16 ruling exists to stop.

WHAT DID COME BACK IN THE SAME SITTING, unprompted and worth recording as field use rather than as feedback on the method.

- The owner asked whether the iteration branches and the claims branch can be deleted. The answer found a live blocker in the cloud starter.
- The owner asked twice which iteration suits a cloud agent. The second ask caught a wrong answer, because the first named an iteration that waits on another.

## notes_drained

- note-e300e6bff8e3: carried into i6 — se-start.ts:253 demands an origin/it/<id> branch that i34 made meaningless, and it blocks the branch cleanup the owner wants
- note-c29050e2356a: carried into i6 — listBranches in worktree.ts:232 is exported with zero callers, dragging a whole ref-stamp cache with it

## call_log_mined

- 5 rejections since the desk retro finished its own mining at 14:39:43Z, all of them the agent's, none from a person
- SE-C-102 twice, both on paths the agent assumed rather than checked: project/spec/expeditions and project/.se/decisions.jsonl
- SE-C-102's remedy is unactionable on both: it says list the parent directory, and on both calls that parent does not exist either
- SE-C-101 once, sending glob to se_file_search where the argument is called include
- SE-C-101's remedy came back with an EMPTY args object and the bare note "glob" — the clause knows the argument list and knows this verb's word, and it neither repaired nor said what to send
- SE-C-122 once, closing a parent node over an open child — the refusal and its remedy were both exact
- SE-C-120 once, a brief chaining three parts — the refusal and its remedy were both exact

## waste_leads

- The arg-name repair is inconsistent: ARG_SYNONYMS repaired path to dir for se_file_list in this same session, and refused glob for se_file_search minutes later
- Fourteen decision-graph nodes stood open from three closed visits, and closing them cost fourteen calls that produced no work
- The branch question needed nine calls to answer, because no verb reports whether a record's branch is still read by anything

## promotions

- NONE PENDING, and i11's emit_back list was read to say so rather than assumed
- machines/stopat.md: already in the shared method home, not a local copy
- machines/panels/controls.md: same home, already shared
- M7_30_observe-red and M7_50_verification: rigor-matrix rows in the shared machine spec, not local overrides
- guidance/refusals.md, guidance/method/lane.md, walking.md: all shared guidance, already promoted by being edited there
- AGENTS.md and CLAUDE.md: kept identical BY HAND, which is the one item on that list still carrying risk — equal byte counts were the only check available at package time

## process_stale

THE EMPTINESS CHECK IS NEW AND IT WORKED. The owner ruled on 2026-08-16 that an onboard-retro with an empty inbox is skipped. This is the first walk to exercise it, and the state cost a survey and a drain instead of a full second retro.

WHERE THE PROCESS IS BEHIND ITS OWN THESIS. i6 exists because a rule that can be broken while reading it wants a refusal rather than another sentence. Two of this window's five rejections prove the same point one level up: a refusal whose remedy nobody can act on is a rule wearing a check's clothes.

THE PRIOR ART WAS RESEARCHED AT SEED TIME AND NOT SINCE. Ford, Parsons and Kua on fitness functions, and ArchUnit's shape, were recorded on 2026-08-11. Five days is short, but nothing has re-checked them and this iteration will build on them. That is a probe this walk owes, not a claim it can make here.

## follow_up

NOTHING BLOCKS. The kickoff is next, and it proposes the size.

WHAT THIS STATE HANDS FORWARD.

- Two carried notes, both engine hygiene the branch cleanup depends on.
- One deferred node at sweep-consistency: three files still cite the dead i27 long id.
- Two remedy defects found in the log, both candidates for this iteration's own scope.

THE SCOPE QUESTION THE KICKOFF MUST SETTLE. i6's seed says two of its parts WAIT ON i18 and i15 — the freshness half of the coverage checks, and the cross-coupling check at the requirements gate. Neither has shipped. Those parts are out, and the kickoff has to say so explicitly rather than carry them silently.

## anything_else

THE i27 SHELL, corrected here because a node was closed on a false reading of it.

Both i27 folders still appear in a directory listing. Only one is a record: project/spec/iterations/i27/record.md exists and reads status: shipped. The long-named folder has no record.md at all.

So the shell's content was removed. What lingers is an empty directory, which git does not track and which no listing of records will ever show. The three files that still cite the dead long id are the real leftover, and they are deferred to sweep-consistency.
