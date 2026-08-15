---
form: onboard-retro
by: agent
signed_off: 2026-08-15T14:45:36.648Z
authors: agent
files:
---

# Evidence form / onboard-retro

## current_situation

i28 is entered and bound, standing at M0.

THE WINDOW THIS RETRO JUDGES opens at 2026-08-15T13:33:04Z, the oldest record after the previous retro's drain, and runs about three hours to now.

WHAT STANDS: 27 open iterations, 0 open expeditions, 0 pending notes, 37 parked backlog items.

WHY THE WINDOW IS SO SHORT. The previous retro closed i12 three hours ago and left the inbox at zero. This form therefore judges a three-hour span containing that retro's tail and this session's own work, and it does not re-derive what the previous retro already settled.

## field_feedback

THE OWNER REPORTED UNPROMPTED, twice, while this record was being entered. Their words are recorded rather than summarised, because the report is the evidence.

ON THE ENTRY ITSELF: "Starting an iteration is going in it and starting it, not cleaning stuff up."

ON WHO ELSE HAS TO DO IT: "humans also need to be able to do this, and we can't have this. We can't have a system where you need to tinker around the edges every time just because you start some work. This just needs to work."

ON THE RETRO CADENCE: "I feel like we just did a retro, although you probably don't need to do another one." That is correct and it is acted on here.

WHAT PROVOKED IT. i28's door was not on the container's offer and the engine refused the choice. Two parts of the engine disagree about what open means: iterations.ts line 70 reads it from whether a worktree folder exists, survey.ts line 51 reads it from the record's status. i27 shipped on 2026-08-14 and its folder stayed, so i28 and i23 were both unreachable.

THE FEEDBACK IS NOT ABOUT THE DEFECT. It is about the class. A start procedure that needs a diagnosis is not a start procedure.

## notes_drained

- pending notes: none, the inbox stood at zero for the whole window
- the previous retro's drain: it ran at 13:33 on 2026-08-15 and left nothing pending, so this window opened empty and closed empty
- parked backlog: 37 items untouched, and no ready-when condition among them fired in three hours
- notes written this window: none, because everything found went straight into this record's scope rather than into the inbox

## call_log_mined

- 249 calls in the window, 7 of them refused
- SE-C-120 is the top clause at 4 of 8 refusals counting my own, and every one is about the brief's SHAPE rather than its content
- the length case of SE-C-120 hands back no corrected brief, while its three-parts case proposes the exact split, so the cheap fix is to make the length case propose the cut too
- se_run stood at 7 calls, 5 of them mine, and all five are one shape: allowlisted git against a tree that is not the root
- that one shape names one missing verb, a worktree lane, and it is now scope in this record
- SE-C-004 refused se_git with -C, which is the same missing verb seen from the other side
- 48 of 249 calls broke the one-second rule, including 8 pulls and 28 the mirror flagged against itself
- SE-C-103 refused a whole-file read of version-planning.md at 53,523 chars, and i17 already dissolves that file, so it is named once and not proposed again

## waste_leads

- entering this iteration cost about a dozen calls and none of them advanced the iteration
- most of that was not the repair, it was proving the leftover folder held nothing unique before deleting it
- that proof is worth its cost and would be run again: 34 paths compared byte for byte, and deleting on a hunch is how work disappears
- the waste sits upstream of both, because nothing retires a worktree at close, so the same cost recurs at the next close anything depends on

## promotions

- none found this window, and the check was run rather than skipped
- this record's walk has reached only its first state, so no local state machine, form or item template has drifted from its source yet
- the previous record's promotions were the first place looked, and i12's retro already pushed its findings into guidance, two matrix rows and the raid template
- the one improvement this window produced is an engine defect rather than a template drift, so it is scope in this record and not a promotion

## process_stale

NOT RE-COMPARED THIS WINDOW, and the window is the reason. The previous retro ran three hours ago and carries the state-of-the-art check for this period. Running it again over three hours would re-derive a standing answer.

WHAT THIS WINDOW ADDS to the question comes from the owner rather than from a comparison. A start procedure that needs a diagnosis is behind current practice by the plainest standard available, which is that a person cannot run it. That judgment needs no external benchmark to stand.

## follow_up

THREE ENGINE FIXES, all inside this record's scope:

- One answer to whether an iteration is open, read from its status. Disk presence becomes a cache and never the truth.
- The close retires the worktree.
- The lane gains a worktree verb, so retiring one is not five shell commands under an exemption.

ONE DEMAND ADDED TO SCOPE by owner ruling in this window. Entering an iteration never requires repair. Where the machine cannot repair, it refuses in one sentence naming the remedy, and silent absence from an offer stops being a possible outcome.

ONE DEBT TO MINT during the walk. This record's cloud validation cannot be closed from this machine, so it is recorded with its Repayment section and the owner tests it on a cloud machine.

NOTHING PARKED. No note was written this window that needs a ready-when.

## anything_else

THE BLAST RADIUS IS MEASURED RATHER THAN ASSUMED. Every seeded iteration on this machine has a folder on disk right now, and nothing in the engine removes one.

i23 was already the second iteration blocked by this same leftover, and it is still blocked by its other dependencies.

ONE THING IS UNEXPLAINED AND IS NOT CLAIMED AS A GUARANTEE. i12 shipped this morning without leaving a folder behind, and i27 did leave one. Why they differ is not established, so nobody should read the difference as the close already working.
