---
form: the-bucket
by: agent
signed_off: 2026-08-16T11:59:14.043Z
authors: agent
files: null
---

# Evidence form / the-bucket

## current_situation

THE BUCKET'S THIRD PIECE IS BUILT AND THE OTHER TWO ALREADY EXISTED. `owedStanding` and a third guard in `stampRecordClosed` are new; the permission and the guard have been in stateform.ts for months, unused.

req-close-refuses-loose-ends WAS MINTED IN i1 AND HAD NEVER BEEN IMPLEMENTED. A must graded fatal, found empty by a probe that went looking for it to compare against the form side.

FIVE CASES GREEN, and the four standing close cases stay green.

## built

THE CHUNK WAS ONE THIRD OF ITS SCOPE, and reading beat assuming.

### What already existed

TWO OF THE THREE PIECES WERE BUILT AND UNUSED.

- THE PERMISSION: `checklistItemStatus` in stateform.ts has accepted `- [owed] <item> — <ref>` for months, returning `{kind: "owed", ref}`.
- THE GUARD: `openRaidRef` splits that into `owed` and `owed_unresolved`, and an unresolved ref already surfaces as a problem at submit.

EVERY FORM RESPONSE IN THIS SESSION CARRIED `owed_count: 0`. The machinery was in front of me all day.

### What was missing, and how it was proved missing

`templateOwed` HAD EXACTLY ONE CONSUMER — session.ts line 4131, populating the form's own report. A search of the whole engine found no other reader. Nothing in worktree.ts, which owns the close, mentions owed at all.

SO A FINDING COULD BE CARRIED PAST EVERY GATE AND OUT OF THE RECORD with nobody looking at it twice. req-close-refuses-loose-ends was minted in i1, is a must graded fatal, and had never been implemented.

### What was built

`owedStanding(root, recordDir)` in engine/worktree.ts, and a third guard in `stampRecordClosed` beside the report guard and the override guard.

IT READS THE RECORD AS IT STANDS ON DISK rather than re-deriving from form models. The close judges what was written, and an owed line is written.

A MISSING ENTRY HOLDS THE CLOSE. The form side already refuses an unresolved ref at submit, so a ref that resolves to nothing at close time means the entry was DELETED after the form signed — the deletion-orphans defect, arriving at the last place that can catch it.

### The status ruling, which building this forced

raid-asm-an-entry-status-says-whether-it-is-open COULD NOT BE PROBED because there was no close-side reader to compare against. Building the reader settled it.

- STILL HOLDS THE CLOSE: `open`, `probed`. A probed assumption is still live — the probe told you something rather than disposing of it.
- RULED, SO IT DOES NOT HOLD: `closed`, `superseded`, `mitigated`, `decided`, `accepted`, `deferred`.

`accepted` AND `deferred` LOOK WRONG IN THAT SET AND ARE NOT. They are exactly where a carried finding drifts, and both are real rulings. Treating either as unresolved would make the close refuse work somebody had already decided, which is what teaches people to stop using the bucket.

### The tests, and which of them were ever red

FIVE CASES GREEN, run `test-msvr3t3z-27`. THREE OF THEM WERE GENUINELY RED and two never were, and saying which is the point.

- RED BEFORE, GREEN NOW: the three `owedStanding` cases. The function did not exist, so they failed at import.
- NEVER RED: the two `checklistOwed` cases. They cover the permission and the guard, which this chunk did not build. They are REGRESSION GUARDS over standing behaviour, and red was impossible for them — the same claim observe-red's checklist allows and accepts.

THE FILE WAS REWRITTEN ONCE, and the reason is worth keeping. The first version drove a booted server and every case failed on SE-C-110 — "nothing asked for a form", "no bound expedition". They never reached the code under test. A red for the wrong reason is not a red for the requirement, and three fixture failures dressed as three demands would have read as proof.

REACHING A CHECKLIST FIELD THROUGH A REAL WALK IS THE DEMONSTRATION'S JOB. tsp-carry-a-finding defines that procedure and it is where reachability gets judged — which is the risk that matters, because the `[owed]` shape existed for months and i34 used it zero times.

### What did not break

The four standing close cases stay green — worktree.test.ts and iteration-close.test.ts, 4 of 4 in run `test-msvr0nio-26`.

## follow_up

TWO THINGS THIS CHUNK LEAVES FOR LATER STATES, both named rather than assumed.

THE ITERATION CLOSE IS NOT GUARDED YET. `owedStanding` takes a record directory and `stampRecordClosed` calls it for `project/spec/expeditions/<id>`. An iteration's close runs through `itCloseShipped`, which does not read it. The function is written to take any record directory precisely so that second call site is one line — but it is one line nobody has written, and saying so beats leaving it to be discovered.

THE DEMONSTRATION IS WHERE REACHABILITY GETS JUDGED. tsp-carry-a-finding waits at M8 for a real finding to turn up mid-walk, unplanted. That is the risk this chunk cannot answer: the `[owed]` shape existed for months and i34 wrote it zero times, so a working mechanism is not the same as a used one.

THE NEXT CHUNK IS `test-verb`, and both its clauses ship together — the scoped run answering its caller, and the full battery refused outside verification. The block alone would remove the accidental deterrent and make the measured problem worse.

## anything_else

