---
form: pressure-test
by: agent
signed_off: 2026-08-15T15:07:01.664Z
authors: agent
files:
---

# Evidence form / pressure-test

## current_situation

The vision, the as-is, the delta and the scope are all signed. This is the last state before the M1 gate, and the gate is where the vision stops being arguable.

THE PACKET UNDER TEST: git is the truth, the disk is a workspace, and a machine with a seed id can start work anywhere.

## prfaq

### Press release

QUACKITECT ITERATIONS NOW LIVE IN GIT, AND ANY MACHINE CAN PICK ONE UP.

A machine that has never seen this project clones it, is given one iteration id, and runs one command. A minute later it is walking that iteration. Nobody typed a step and nobody read a handover.

THE ITERATIONS LIST IS THE SAME EVERYWHERE, because it comes from git. A seed pushed from a laptop appears on the cloud machine without anything being copied. Choosing it is what downloads it.

AN ITERATION SOMEBODY ELSE IS WORKING SHOWS GREYED, carrying who holds it, and entering it refuses with that name. Nothing in flight is invisible.

WHEN AN ITERATION FINISHES, ITS FOLDER GOES. The archive is read from git on every machine, so a finished iteration takes no room anywhere and is readable everywhere.

A FOLDER ON DISK NOW MEANS ONE THING: somebody is working that iteration, on that machine, right now.

### The hostile FAQ

Q. YOU REMOVED THE FOLDERS. MY ENGINE WILL NOT START. HOW DO I READ MY WORK?
A. `git show it/<id>:<path>` reads any file with no engine at all. The branch is the record. It costs one command instead of a file browser and that is a real loss, recorded as [[raid-removing-the-folder-makes-the-engine-the-only-door]] with a documented recipe as its mitigation. It is not a data-loss answer, it is a convenience answer, and it is weaker than what we have today.

Q. WHAT IF GIT IS NOT REACHABLE?
A. THE FAQ FOUND THIS AND THE DESIGN DID NOT ANSWER IT. Reading the list is local, because `refs/heads/it/*` lives in the clone, so it is offline-safe PROVIDED the implementation reads local refs rather than querying the remote. Entering writes a claim that must reach the remote and genuinely cannot work offline. Now [[raid-no-iterations-are-visible-without-a-reachable-remote]], with the failing implementation named so it is not written by accident.

Q. ISN'T READING STATUS FROM GIT FOR EVERY ITERATION SLOWER THAN A DIRECTORY CHECK?
A. Probably, and by how much is not known. It is the kill-criterion of the whole change, recorded as [[raid-asm-git-answers-open-without-a-worktree]] with a probe that times both paths over the real 27 iterations. If git is too slow, the folder was a cache earning its keep and the answer becomes an explicit cache with an invalidation rather than removal.

Q. YOU DELETE FOLDERS AT CLOSE. WHAT ABOUT MY UNCOMMITTED WORK?
A. The close commits or refuses, never removes blind. This is not a precaution, it is a measurement: the folder that provoked the whole change held 34 uncommitted paths, and they were only known to be duplicates after a byte-for-byte comparison. [[raid-a-close-that-removes-the-folder-destroys-uncommitted-work]], graded fatal and expected.

Q. WHY NOT JUST FIX THE FETCH REFSPEC AND KEEP THE FOLDERS?
A. THE STRONGEST QUESTION IN THIS LIST. It would make a fresh clone see the seeds, which is the field's original complaint, at a fraction of the cost. What it does not fix is the disk and git disagreeing: a finished iteration's leftover folder would still read as open, which is the defect that made this iteration unenterable. Fetching harder makes the stale answer arrive faster.

Q. WHO CLEARS A CLAIM WHEN THE MACHINE HOLDING IT DIES?
A. NOT ANSWERED HERE, AND IT IS OUT OF SCOPE. forceRelease exists in engine/claims.ts and reaches no surface, which is the standing [[raid-debt-claim-pool-surfaces]]. The greyed iteration this iteration builds is the first surface the ledger ever reaches, so the situation improves and does not close.

Q. DOES THIS MAKE THE BOOT LONGER, WHEN BOOT IS ALREADY THE HARDEST STEP FOR A WEAK MODEL?
A. It should make it shorter, because the failure it removes is the one that needed a person. But the read proof itself is untouched by this work and remains the hardest step, recorded as [[raid-the-read-proof-locks-weaker-models-out-of-the-system]]. Claiming this iteration fixes that would be false.

Q. WHAT IF ONLY ONE MACHINE EVER RUNS THIS?
A. Then the case collapses to tidiness and the effort is not worth it. Two machines have already run it, on 2026-08-13 and 2026-08-14, which is why that is not the situation. This is the honest kill condition for the business case and it is stated rather than hidden.

## findings_folded

- THE OFFLINE CASE WAS UNANSWERED and is now [[raid-no-iterations-are-visible-without-a-reachable-remote]], carrying the distinction the design was missing: reading the list is local and offline-safe, entering writes a claim and is not
- THE MITIGATION BECAME A DESIGN CONSTRAINT rather than a watch, because the failing version is easy to write by accident: the implementation reads LOCAL REFS and never queries the remote to answer what exists
- THE FETCH-REFSPEC-ONLY ALTERNATIVE was the strongest attack and it did NOT fold anything upstream, because it fails on the case that provoked this iteration — a finished iteration's leftover folder still reads as open. It is recorded here so it is not re-proposed as a cheaper path
- NOTHING ELSE FOLDED. The other six questions were each already answered by a standing register entry, which is what a register is for

## follow_up

- gate-motivation is next and it closes M1, and the register now stands at eight entries
- the offline constraint belongs in M3's requirements as a testable row, not only as a register entry
- the kill-criterion probe still has not run, and it is the first thing M5 or M6 should do rather than the last
- nothing is parked from this state

## anything_else

