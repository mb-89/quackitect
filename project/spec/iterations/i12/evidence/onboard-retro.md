---
form: onboard-retro
by: agent
signed_off: 2026-08-15T10:04:05.972Z
authors: agent
files:
---

# Evidence form / onboard-retro

## current_situation

i12 is the fourth of the owner's four enablers, and the last one that needs nothing from them.

The run order set on 2026-08-13 is i27, i28, i11, i12, then i9. i27 shipped on 2026-08-14. i28 needs a fresh cloud machine, which is the owner's input. i11 carries an owner ruling owed inside its own record. i12 carries none.

What i12 is for: the battery's wall clock, the surfaces that break the one-second rule, and a pull that paginates instead of overflowing.

The record's own instruction is MEASURE FIRST, FIX SECOND. That instruction turns out to have a hole under it, and this retro found it.

The inbox stood at zero when the walk began. Two notes were captured during it and both are drained below.

## field_feedback

ASKED AND OPEN. The owner left mid-session to fetch groceries, having authorised the walk to continue without them. The standing question - what came back from the field since the last look - has no answer yet, and it is owed when they return.

WHAT THEY DID SAY THIS SESSION, recorded because it is field input even though it is not the answer to that question.

The minor column has been used before and it worked.

Emergency mode is on and autonomy is raised, so defects hit along the way may be fixed rather than only noted.

A ruling on planning: pull every defect the walk can fix into the iteration at planning time, rather than leaving it as a note.

A ruling on stopping: no clock-based stop. The walk continues until the iteration is done, or until something breaks that it cannot fix.

## notes_drained

- note-69f1c756aeb2 — se_survey lists a SHIPPED iteration as open — i2: carried into i12's scope. Checked first - i27's record reads status shipped and closed 2026-08-14, and the survey still counted it among the 28 open. It lands where i12 already touches se_survey.
- note-86bbee3a08ab — A bare pull at iterations/start walks into the f: carried into i12's scope. Confirmed live this session at a cost of one escape and four calls. Two fixes sit under it - the container should offer a choice rather than auto-entering, and a sibling record should be reachable from inside one.

## call_log_mined

- Window: opened 2026-08-14T21:47:08.226Z at the previous retro's last drain, and holds 123 records.
- se_run: zero calls in the window. The count the retro drives down did not rise.
- mirror_slow: 19 records, which is the largest non-narration group in the window.
- /widget/details broke the one-second rule on all seven of its requests, between 2720 ms and 3468 ms.
- /widget/machine answered in 3966 ms. That is the record's named defect, now measured rather than asserted.
- / answered in 4026 ms.
- Two /mcp posts cost 18058 ms and 21219 ms. Both were se_aim with go, sweeping the route against a 20000 ms budget.
- Battery of 2026-08-14T20:20:55.908Z: 1301 tests, 0 failed, wall 76985 ms.
- claims.test.ts holds one case of 75218 ms. That is 97.7 percent of the whole battery's wall clock inside a single case.
- The record's own figure for that shape was 62 percent. It has got worse, not better.
- A scoped run records no timings at all. tools.ts line 953 attaches only the TAP reporter, where the battery attaches the timings reporter too.
- Refusal clauses hit by this walk: SE-C-110 twice, SE-C-102 twice, SE-C-133 twice, SE-C-120 once, SE-C-121 once.

## waste_leads

- Aiming at a record by its LONG id refused, and the refusal left the walk inside the wrong record. The survey prints the long id, so the id in hand is the one that does not work.
- Escaping out of that wrong record cost five calls and needed the front desk.
- Two narration briefs chained their parts and were split into phantom checklist items, which then had to be closed as obsolete.
- A scoped run was started to separate real cost from contention, and it produced no timing record, so the question it was asked could not be answered from it.

## promotions

- meth-consistency-sweep: LANDED IN THIS RECORD. i27 emitted the wrapped surfaces item and its follow_up named the next record's promotions field as the home. The item now sits on one line and its detail moved into the Procedure section as a sub-list.
- The rigor matrix must-check: still unbuilt, carried forward from i27's emit_back. Every gate runs it by hand in prose.
- The panel spec choice control: still unfixed, carried forward from i27's emit_back. A declared row would draw a control that does not post on change.
- M9_20_package and meth-emit-back: both marked corrected inside i27, and checked as closed rather than carried.

## process_stale

COMPARED AGAINST THE RECORD'S OWN INSTRUCTION, which is the only standard that binds here: measure first, fix second.

The process fails that instruction mechanically. The retro method tells the reader to mine the test timings and to COMPARE ACROSS RUNS rather than within one. A scoped run leaves no run to compare, because it writes no timings.

So the only timing data that exists comes from the battery, where roughly twenty files run at once and every case's duration carries the contention of the others. The ranking that decides what to fix is built on numbers nobody can separate into real cost and queueing.

This is the same fault note-f3cd9c12d210 recorded from the other side, where a performance test failed only under battery load. That note called it a measurement problem for one test. It is a measurement problem for the whole method.

The fix is small and it belongs first in this iteration, ahead of every performance change it is supposed to justify.

## follow_up

- FIRST WORK ITEM, ahead of any fix: attach the timings reporter to the scoped run in tools.ts, so a file can be measured alone. Nothing else in this iteration can be justified until that lands.
- Then measure claims.test.ts alone and compare it against its battery numbers. That comparison decides the order of everything after it.
- Carried into scope: the container routing trap, from note-86bbee3a08ab.
- Carried into scope: the survey counting a shipped record as open, from note-69f1c756aeb2.
- Backlog notes now ready, because this record touches what they wait on: note-5cebd22ef8f1 and note-ff8f4378deab wait on the bless path being profiled, and note-f3cd9c12d210 waits on the battery's scheduling being touched.
- Owed to the owner on their return: the field-feedback answer.

## anything_else

ON THE MEASUREMENT HOLE, because it is the finding this retro turned up and it deserves its evidence in one place.

The battery attaches two reporters in engine/bin/selftest.ts. The ordinary spec reporter writes the human output, and test-timings.mjs writes one record per test to .se/test-timings.jsonl.

A scoped run never reaches that file. engine/tools.ts line 953 builds its own argv with --test-reporter=tap and nothing else.

The consequence was watched rather than reasoned. A scoped run of claims.test.ts finished green at 17 of 17. Afterwards .se/test-last-run.json still held the battery of 2026-08-14T20:20:55.908Z, and the last line of .se/test-timings.jsonl still carried that same run stamp.

So the run happened, the verdict was recorded, and the durations were thrown away.
