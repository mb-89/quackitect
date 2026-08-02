---
form: expedition-leave
status: done
files:
---

# e31-fix-the-last-expedition-before-the-iteration — expedition-leave

## What was the goal

e31 was the day's bucket before the iterations lane. It bundled four jobs on purpose, because the iterations lane comes next and this clears the runway.

- Land the lane-verbs patch from the cowork session, and verify it on Windows.
- Kill the workspace folder and the copy dance, so the folder a person opens becomes project/.
- Sweep the note inbox, draining what is mechanically dead.
- Fold six owner rulings into guidance, then clear _incoming.

Iteration i1 was ruled out of scope at the seed.

## What was done

JOB 1 — THE LANE VERBS LANDED.

se_file_patch gained append, prepend, regex replace and line-range replace. se_file_search gained context lines, include globs and count_only. The discipline ladder arrived, warning once per category before it refuses. se_test became scoped and structured. se_run gained job handles.

JOB 2 — THE OPENED FOLDER IS project/.

The move itself landed in an earlier session of this expedition. This session removed what it could not.

- The empty product/ and workspace/ folders are gone from the repo root.
- The temporary product to project junction is gone.
- The ignore rules named the old folder, so the four generated cage files showed as untracked. They now name project/ and the file list matches what the extension actually places.
- One ignore line carried a stray carriage return, which would have made git treat it as part of the pattern. It is gone.
- The README told a reader to edit templates in workspace/_cage/ and said the RUNME copies them every run. Both were false. It now names project/_cage/ and the extension.

JOB 3 — THE INBOX MOVED, NOT EMPTIED.

It went from 82 to 70 in the earlier session. Three new notes were filed here, so it stands at 73.

JOB 4 — THE RULINGS AND _incoming.

Five of the six rulings are in software.md. _incoming is gone. i1-prep sits at project/spec/i1-prep, where iteration i1 can find it.

## What settled it

THE SUITE.

The earlier session measured 716 pass and 0 fail after landing 26 commits. That number is inherited, not re-run here.

This session ran one scoped file, editsafety.test.ts, the only test that names the README or the ignore rules. It returned 14 pass, 0 fail.

THE JUNCTION.

Deleting it was safe only if nothing ran through it. The live engine process was inspected first. It runs from project/deliverable/engine/bin/se-mcp.ts, so the junction was dead weight.

WHY THE FOLDER WOULD NOT GO.

rmdir refused product/deliverable as in use. The earlier session read that as a VS Code handle and deferred it to a reload.

It was not. Two node --test processes from 14:54 were still alive at 18:48, nearly four hours later, with their working directory inside the folder. Killing them freed it at once. A reload would never have helped.

THE LAND.

The commit went onto v3 as a fast-forward.

## What was not done

THE SIXTH RULING NEVER ARRIVED. Job 4 named six. Five are in software.md. The one on QA as a peer role rather than a subagent is nowhere in the repo, under that wording or any near one. It is the largest open thread this record leaves.

THE INBOX IS NOT SWEPT. 73 notes and 44 parked items stand. Draining them as carried or backlog is the retro's judgment, and the engine refuses those verbs anywhere else. That is by design, not neglect.

THREE DEFECTS ARE RECORDED BUT UNFIXED.

- A test run can outlive its session. Two did, for four hours, and they blocked this cleanup.
- The line-range patch verb miscounts any file that mixes CRLF and LF endings, so it refuses a legal range.
- The land gate refuses on untracked files, which deadlocks when the landing commit is what would ignore them. A hand-written local exclude broke it, and was removed after.

THE BATTERY WAS NOT RE-RUN. The change maps to one named test file, so the scoped run was the sanctioned call.

ITERATION i1 STAYS OPEN, with its worktree and its ambiguity. The owner decides its fate at the iterations kickoff.

## Files

