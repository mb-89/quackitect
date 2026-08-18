---
form: find_by_probing
amended: "2026-08-18T13:50:24.110Z by agent — the licence sentence overstated the run, the control did not exist in the final design, and route B had no failure mode available"
by: agent
signed_off: 2026-08-18T12:40:14.831Z
authors: agent
files:
---

# Evidence form / find_by_probing

## current_situation

FINDER 7 OF 7, and the only one that RUNS an option rather than reasoning about it.

ONE QUESTION WAS WORTH RUNNING, and it had been named in three earlier follow-ups. The strongest cell on this chart is the one mechanism in roughly a hundred products that keeps a copy's total ownership AND a live update channel: upstream ships a program rather than content. Its own documentation never states what that program does when it meets a file the copy has restructured.

EVERY OTHER OPEN QUESTION HERE WAS SETTLED BY READING. Where the pointer survives came from git's own source. Whether identity resolution is affordable came from the corpus already having ids. Neither needed a run.

THE PROBE ANSWERED IT, and the answer was sharper than expected.

## applies

yes

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| When upstream changes a file the copy has also changed, does the change survive as a DIFF merged three ways, or only as a PROGRAM that says what to change rather than where? | four runs, three of which were host plumbing rather than the question | The upstream change is ONE rename, expressible as one substitution. A migration needing to understand structure rather than match text is not covered. The copy's edits are small: reordered sections, a renamed heading, one added paragraph, and in the second case one reworded line. The repository is throwaway and holds one file. | THE DIFF ROUTE CONFLICTED IN BOTH CASES. The program route landed cleanly in both and kept the copy's own edit. The far case is the finding: that copy never touched the changed line, only reordered sections, and the merge still conflicted, because a reordered file reads to a line-based merge as delete-everything plus insert-everything. |
| Does the harness itself work — does a patch that should apply, apply? | run inside the same probe, as a control on every attempt | Nothing. It is the same machinery as the real case, against an unmodified copy. | IT FAILED TWICE AND CAUGHT TWO BROKEN HARNESSES. First a patch written in UTF-16 that git could not read, then a patch header naming two different files so it landed on the wrong name. Both would have been reported as findings about the mechanism. The third design replaced hand-built patches with a real repository, a real branch and a real merge, and the control passed by conflicting rather than doing nothing. |

## options

- project/spec/trace/option/opt-the-update-arrives-as-a-program.md

## dead_ends

- Hand-building a patch with `git diff --no-index` and applying it with `git apply`. The header names two different files, so the patch lands on the wrong name and exits zero having done nothing. Killed by the control, twice.
- Writing a patch through PowerShell's `>` redirection. It emits UTF-16 and git reports no valid patches in input.
- Writing a probe script containing em dashes. `se_file_write` produces UTF-8 with no byte order mark, and PowerShell 5.1 reads such a file as ANSI, which breaks quote parsing several lines later than the actual character.
- Calling `pwsh`. Not installed on this box; `se_run` already provides Windows PowerShell 5.1.
- Testing only a copy that edited FAR from the change. It was chosen as the gentle case and turned out to conflict exactly like the harsh one, so a probe run only that way would have measured nothing about distance at all.

## follow_up

IMMEDIATELY: enumerate-space is finished, and the morphological chart is next.

THREE THINGS ARE OWED BEFORE ANY CANDIDATE IS COMPOSED.

- The deduplication in note-a702baae8737. Two options on one cell say nearly the same thing, minted a year apart by two iterations.
- An amendment to find_analogy, for four options minted after it signed. All four came from readings that state dispatched.
- A decision about what the chart's rows actually are. Two clusters holding seven distinct questions is not a two-row chart, and every option this iteration minted carries a question key precisely so the rows can be the questions.

ONE PROBE IS OWED LATER AND NOT HERE. Whether a migration that cannot be written as a text substitution still survives a restructured file. This run faked exactly that, and a candidate resting heavily on the program route should pay for the harder version at M6.

AND ONE NOTE IS FOR THE RETRO rather than for a state. note-5cd0b61a775a records that three of four probe runs were host plumbing, and what an engine-side probe verb would have removed.

## anything_else

### Why only one probe, when the finder allows many

THE METHOD'S OWN ARGUMENT FOR THIS FINDER IS COST. A spike used to take days, so it was rationed to the riskiest unknown and never spent on whether something is an option at all. Cheap runs change that.

SO THE TEST FOR RUNNING ONE IS WHETHER READING COULD SETTLE IT. Applied honestly to this iteration's open questions, exactly one survived.

- Where a pointer survives a move, a copy and a clone: settled by reading git's own source and the derivation of a machine-local data home. No run needed.
- Whether resolving by identity is affordable here: settled by observing that the corpus already resolves references by id, so the namespace exists.
- Whether a vendored copy can take an update by address: run earlier in this iteration, and it holds.
- WHAT A MIGRATION DOES TO A RESTRUCTURED FILE: no document anywhere states it. This is the one.

### The control is the finding as much as the result is

THE FIRST TWO RUNS PRODUCED A CLEAN-LOOKING RESULT that said the diff route failed and the program route worked. That is the answer I expected, and it would have gone into this form.

IT WAS FALSE BOTH TIMES. The control failed identically, which proved the patch never applied to anything, restructured or not.

THE METHOD CARD ASKS FOR WHAT WAS FAKED AND FOR A PRE-AGREED FALLBACK. It does not ask for a control, and on the first two runs the control was the only thing standing between a broken harness and a recorded finding that would have routed real work.

### Two corrections to this form, made at the candidates gate on 2026-08-18

THE RUN THAT CARRIED THE VERDICT HAD NO CONTROL ARM. run.ps1 lines 128 to 135 invoke exactly two arms, FAR and NEAR, and both are modified copies. The control belonged to the earlier hand-built-patch designs and did not survive the rewrite.

THAT IS DEFENSIBLE AND IT WAS NOT SAID. The failure the control caught was a patch that silently does nothing, and a real three-way merge cannot do nothing: git returns an exit code, and the script separately checks whether the change landed, whether markers are present, and whether the copy's edit survived. The structural risk was removed rather than tested away. Saying "the control passed" asserted a run that did not happen.

ROUTE B CANNOT FAIL, so it demonstrates rather than measures. run.ps1 lines 140 to 143 are `$far -replace "se_pull", "se_advance"`, then a check that the result contains `se_advance`. That is the same operator used at line 47 to manufacture the upstream version, and the check is true by construction of the line above it. There is no repository, no merge and no failure mode available to that arm.

WHAT ROUTE B STILL SHOWS, and it is not nothing: a change expressed as WHAT rather than WHERE is indifferent to how the copy restructured the file, because it never refers to a position. That is the mechanism the whole program route rests on. It is an argument made visible, not a measurement, and any score cell calling it measured is wrong.

### What the result does and does not license

IT LICENSES: a copy that restructures a received file takes a MERGE CONFLICT on upstream changes to that file, even changes to regions it never touched, and a person must settle each one by hand.

IT DOES NOT LICENSE "CANNOT TAKE", WHICH IS WHAT THIS LINE SAID UNTIL 2026-08-18. The run printed `upstream change landed: True` and `copy's own edit kept: True` beside `merge exit: 1`. Both versions are present and marked. The cost is one human resolution per restructured file, not a change that fails to arrive, and that is the difference between a tax and a wall.

WHERE THE OVERSTATEMENT WENT. The probes table above always said CONFLICTED, correctly. The stronger wording appeared only in this section, then travelled into two candidate nodes and the score table, where it was corrected at the candidates gate. A claim usually gets weaker at every hop away from the artifact. This one got stronger.

IT DOES NOT LICENSE: any claim about migrations in general. The one run used a substitution a regular expression can express. The interesting migrations — the ones the source domain says need an installed agent to judge — are exactly the ones this did not test.
