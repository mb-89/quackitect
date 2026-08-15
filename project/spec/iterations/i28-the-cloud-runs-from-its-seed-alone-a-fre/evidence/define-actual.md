---
form: define-actual
by: agent
signed_off: 2026-08-15T15:02:55.736Z
authors: agent
files:
---

# Evidence form / define-actual

## current_situation

M1's join waits on this branch, and the walk reached it by aiming rather than by a door. i28 is bound, the kickoff is blessed at MAJOR, the vision inherited, and the register stands at six entries.

THIS STATE EXTENDS THE AS-IS RATHER THAN REPLACING IT. A major usually exists because the recorded baseline no longer tells the whole story, and that is exactly the case here: the baseline says the engine walks, and it does. What it does not say is that a second machine cannot see any work to walk.

## as_is

WHERE WE STAND, and the good half is substantial. Every claim below carries its witness.

### What works

- THE ENGINE WALKS, GATES, REFUSES AND RECORDS. i12 shipped this morning with the battery green at 1314 of 1314. Witness: our own history, .se/HANDOVER.md.
- SEEDS ARE ALREADY IN GIT. Seeding pushes `it/<id>` to the shared remote as one of the engine's own sanctioned pushes. Witness: guidance/refusals.md under SE-C-003, which records the seed stub and the claim file as machinery acts.
- THE CLAIM LANE EXISTS AND REFUSES COLLISIONS. The entry gate brings the ledger into being on the first claim. Witness: engine/claims.ts, and raid-debt-claim-pool-surfaces which records what shipped and what did not.
- TWO MACHINES HAVE GENUINELY WORKED THIS PRODUCT. Witness: field research, the cloud run of 2026-08-13 and the owner's second machine on 2026-08-14.
- REFUSALS CARRY EXECUTABLE REMEDIES, and recovery in one turn is the normal case. Witness: our own history across this session, where six refusals each named the exact call to make instead.

### What does not work

- A MACHINE THAT CLONES SEES ZERO ITERATIONS. The reader looks only at disk, so a fresh clone finds nothing to walk. Witness: field research, note-90337185ce67 — the owner's second machine on 2026-08-14 saw no iterations at all and had to be taught that iteration state is the merge of git and disk.
- THE READER ASKS THE DISK. `open: existsSync(path)` at engine/iterations.ts line 71, while engine/survey.ts line 51 reads the same question from the record's status. Witness: our own code, both lines read today.
- A FINISHED ITERATION'S FOLDER STAYS FOREVER. Nothing in the engine removes one; a search of the whole engine returns no such code. Witness: our own history — 28 folders stood on disk this morning and exactly one belonged to a finished iteration.
- ENTERING AN ITERATION REQUIRED REPAIR. This record's own entry cost about a dozen calls, five shell commands under an explicit exemption, and a byte-for-byte comparison of 34 paths. Witness: our own history, this session, 2026-08-15.
- A DOOR CAN BE SILENTLY ABSENT. i28 was simply not in the container's offer. Nothing was wrong, nothing was refused, and the thing was not there. Witness: the same session.
- THE WALK OFFERS NO ROUTE TO AN UNWALKED FORK BRANCH. Minutes ago the M1 join reported that a branch was still owed, the pull offered only the join itself, and the remedy said "walk the branch that is still owed" without saying how. Only se_aim found the way back. Witness: our own history, this walk, and it is a reported pattern rather than a one-off — SE-C-123's remedy fails its own test, which is whether somebody could act on it without asking a second question.
- THE BOOT'S READ PROOF LOCKS WEAKER MODELS OUT. Weaker models could not produce it at all and stronger ones struggled. Witness: field research, note-8de9bfec67b6, the second machine on 2026-08-14.
- THE SERVER DIES WHEN BACKGROUNDED, because stdin EOF is treated as shutdown, and backgrounding is the only way to run unattended. Witness: field research, the cloud run, which held stdin open with `sleep infinity` to work around it.
- THERE IS NO ENTRYPOINT BEYOND POWERSHELL. Version 1 shipped a shell script beside it; this version does not. Witness: our own history, recorded in this record's seed.
- EVERY FAILURE IN THE FIRST CLOUD RUN PRESENTED AS "THE SERVER IS NOT THERE", which is the least informative symptom available. Witness: field research, the cloud field report.

### The shape underneath all of it

THE DISK AND GIT BOTH CLAIM TO BE THE TRUTH, and they disagree. Every failure above is a version of that, seen from a different side: a reader trusting the wrong one, a writer leaving the other stale, or a person having to reconcile them by hand.

NO SOLUTIONS HERE. The delta says what we fix.

## follow_up

- the delta state takes these pains and says which are in scope for this iteration, and the six failure points from the seed are already scoped
- the routing pain found in this very walk is NEW and not yet in any register entry, so it wants one at the delta or a note if it turns out to be i11's
- the good half matters to the delta as much as the bad: seeds already reach git, so the fix is a reader rather than a feature
- nothing is parked from this state

## anything_else

