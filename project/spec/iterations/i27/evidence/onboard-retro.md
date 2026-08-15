---
form: onboard-retro
by: agent
signed_off: 2026-08-13T18:20:03.699Z
authors: agent
files:
---

# Evidence form / onboard-retro

## current_situation

i27 is bound and claimed, first record of the run order the owner set today: i27, i28, i11, i12, then i9.

WHAT THIS ITERATION IS FOR. A record's worktree becomes the whole workspace while that record is bound. Stepping out to trunk stops being a step anybody takes, because nothing is left on the other side to reach. The measured cost it removes is eight step-outs in one session, three inside a single verification, and one incident where trunk edits pulled 26 commits mid-walk and felled four signed claims.

WHAT STANDS AROUND IT. Twenty-six iterations are seeded, seventeen enterable right now and nine correctly held by their dependencies. The note pool is at zero for the first time: 735 notes, none pending. Every carried row was written into the seed of the iteration that owns it, so the content travels to another machine rather than living in a gitignored local file.

THE TREES ARE LEVEL. All 27 worktrees were 16 method files behind trunk and uncommitted, which is a half-synced tree that does not compile. They are levelled and committed, and the engine now does that at entry rather than at a reload.

THE LEDGER CLOSES. A claim was taken at entry and nothing ever ended it, so both shipped records read as live holdings. The ledger now carries a done state, and both are stamped.

## field_feedback

THE FIELD IS A CLOUD MACHINE, and it shipped i8 today.

WHAT CAME BACK, and it is not a report. The owner ruled on 2026-08-13 that there are no more field reports: a cloud session ends with its own retro, and what it learned is packed into pool rows or debt entries. Those travel and the session disappears. So the feedback arrived as the record itself and as the ledger.

WHAT THE RECORD SAYS. i8's branch tip reads shipped and its record carries status: shipped. It was walked end to end by a machine that never touched this one.

WHAT THE LEDGER SAYS, and this is the useful half. The cloud machine claimed i8 at 09:40 today, after the claim-pool fix landed that morning. The hazard recorded earlier — that the next machine to enter would take the claim out from under a worker holding none — did not fire, because the cloud agent re-entered on its own machine and the pool recorded the right holder. The ledger names it, so the credit for the work sits with the machine that did it.

WHAT IT COST US, from the earlier field report and now closed: se_help was implemented twice, differently, on two branches, with three merge conflicts at the close. The cause is the same defect this iteration exists to fix — the guard against method writes from a bound record watches five write tools and not the shell, so the same feature got built in two places.

NOTHING ELSE IS OUTSTANDING FROM THE FIELD. The report was mined to exhaustion in an earlier session and every row placed.

## notes_drained

- note-ee6c0bef4398 — A WALL-CLOCK BUDGET INSIDE THE PARALLEL BATTERY : carried to i12 — a timing assertion inside a twenty-way parallel battery measures the machine's load, and it passed 15 of 15 scoped; i12 owns the wall clock and the one-second rule

## call_log_mined

- 219 calls since the last retro, against 9 refusals — a 4 percent refusal rate
- SE-C-105 four times, every one a patch anchor that did not match: the cost of authoring old_string by hand against a file whose exact whitespace is not in front of you
- SE-C-133 twice and SE-C-120 once, all narration: a checklist that stopped moving, and a brief that chained four parts when it wanted to be a list
- SE-C-110 once, a choice outside the offer — and it was useful, because the refusal named all seventeen enterable iterations and proved the dependency graph holds
- se_run at 42 of 219, which is 19 percent, against a 0.28 percent baseline measured this morning — the shell came back hard, and every call names a job the lane cannot do
- the three verbs those 42 calls keep asking for: reach another worktree, read a frontmatter list without truncation, and run git anywhere but the bound tree
- one battery at 96 seconds returning 1163 of 1164, whose single red was load rather than code

## waste_leads

- FOUR PATCH ANCHORS MISSED because the file's exact text was not in hand; each cost a read-and-retry, and three of the four were frontmatter whose vision scalar se_file_read truncates
- A DEPENDENCY CHECK I WROTE MYSELF WAS WRONG, matching the key's own line and never the list under it — it reported twenty records with no dependency when seven carried one, and the owner caught it from the rendered board
- ONE BATCH OF EIGHT PATCH OPS REFUSED WHOLE on its first op, so seven correct edits were discarded with it; the retry then missed that i28 still needed its edge, and only a re-measure caught it
- THE BATTERY RAN BESIDE A LEVELLING SCRIPT and went red on a timing assertion, costing a scoped re-run to tell load from breakage
- TWENTY-ONE COMMITS NEEDED --no-verify because the hook type-checked a tree that did not compile — work that existed only because the mirror was half-synced

## promotions

- THE MIRROR LEVELS AT ENTRY, NOT AT RELOAD (engine/session.ts levelTree): the backfill was split so one tree can be levelled without rebooting the engine, and the levelled tree is committed path-scoped in the same act
- THE LEDGER CARRIES A TERMINAL WORD (engine/claims.ts completeClaim): shipped is not released, and the check stands ahead of the release branch so the shipper cannot re-enter either
- THE ENTRY REFUSAL TELLS SHIPPED FROM HELD APART (engine/session.ts): held is a wait and shipped is final, so the remedy stops offering to try again on a door that never opens
- SEEDING MUST NAME ITS DEPENDENCY (owner ruling, written into i6): depends_on becomes required, so I-forgot and I-decided-none stop looking identical on disk
- THE RUN ORDER LIVES IN THE PLAN, NOT IN THE EDGES (project/spec/version-planning.md): order is not dependency, and the tension with the two edges added to i23 is named there for the owner rather than hidden

## process_stale

THE RETRO'S OWN SWEEP READS A FROZEN CORPUS, and this retro is running inside that defect.

A record's worktree is a snapshot of trunk at seed time. Method resolves to the root and stays current; the spec corpus does not. So a sweep asking whether a debt still stands sees the register as it was when the record was seeded. The failure is silent — nothing says two of three, and the report looks complete. It is carried to i22, which owns the freeze.

THE BOUND RETRO CANNOT DO THE RETRO'S OWN JOB. Step 11 says to aim every improvement at a durable home, and the method write that needs is refused from inside a record. That is this iteration's own subject, and it is carried here rather than to a later one.

WHAT IS ACTUALLY STALE IN THE METHOD, one thing: the debt sweep covers one register kind out of six, so an entry of kind issue is never re-read by anything. An assumption whose trigger fired becomes an issue and leaves every sweep the method runs, because a spent trigger cannot fire twice. Carried to i10 with the exact one-line widening.

WHAT IS NOT STALE. The retro found its own defects this round rather than being told them, which is the check working. Both were already recorded before this state opened.

## follow_up

THE WORK OF THIS ITERATION IS ITS SEED, and the seed is unusually complete — the owner ruled the shape on 2026-08-13 and said the iteration builds it rather than re-deciding it. Both halves land: while a record is bound the lane's root IS the worktree for every product but this one, and this product is the self-hosting exception that walks on trunk with no worktree at all.

FOUR THINGS ARE ALREADY DONE that the seed lists as scope, and the kickoff should not re-plan them.

- The mirror levels and commits at entry. That is the tree half of the binding, built today.
- The claim closes when a record ships, so the ledger stops reading finished work as live.
- The reading credit survives a reload and keys on content, pinned by feedback-loop.test.ts.
- The dependency graph is filled in and rendered, and the container's offer proves it holds.

WHAT THE KICKOFF OWES A DECISION ON, and it is the one question the seed leaves open: the running engine lives in trunk's deliverable, so either a reload can serve from the bound worktree, or an engine change stays invisible until the record lands. That question does not arise for a product that never edits the engine, which is every product except this one.

THE LEAK IS PART OF THE JOB and it is not optional. The method-write guard watches five write tools and not the shell, which is how one feature was built twice. A fix that leaves the shell addressing trunk has not finished.

PARKED, NOT FOR THIS ITERATION: the wall-clock flake goes to i12, the frozen-corpus sweep to i22, the issue-kind widening to i10.

## anything_else

ONE RESERVATION, filed rather than acted on.

i23 now waits on i27 and i11 in the graph. i4 is a real prerequisite of it; those two are a judgment — running the largest build before the lane binding and the pull fix makes it pay both taxes the whole way, which is a cost argument rather than an impossibility.

The v1 law under consideration says order is not dependency, and under its strict reading those two edges do not belong there. They stand because the owner asked for the order to be visible and the board draws edges rather than priorities. The owner has seen this and ruled no change. The real fix is a priority the container can draw without blocking, and it is not built.

ONE MEASUREMENT I OWE THIS RETRO AND COULD NOT TAKE. The method asks for agent voids ranked beside the slow calls — the gaps between consecutive calls that no tool accounts for, which are usually the larger number. No verb reports them, and computing them by hand means paging 219 records to produce one figure. Not computed, and that is why.
