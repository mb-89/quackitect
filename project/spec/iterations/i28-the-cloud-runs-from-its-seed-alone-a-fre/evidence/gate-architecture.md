---
form: gate-architecture
bless: blessed by agent
amended: "2026-08-15T18:36:36.677Z by agent — the owner reversed the expiring claim and ruled the list has one reader, so the element set, the risk list and two verdicts all move"
by: agent
signed_off: 2026-08-15T18:37:07.619Z
authors: agent
files:
---

# Evidence form / gate-architecture

## current_situation

The design is a structure. Eleven elements, one of them new, two revised, no interface owed.

THE STRUCTURE NUMBERS ARE ZERO WHERE ZERO IS THE TARGET. Interface debt, idle elements, unimplemented functions and undemanded interfaces all read zero.

NINETEEN QUALITY SCENARIOS WERE WALKED. Sixteen addressed, three at risk, none unaddressed.

THE THREE THAT REMAIN SHARE ONE ROOT, and it is not this iteration's to fix.

TWO OWNER RULINGS LANDED WHILE THIS GATE STOOD, and both shrank the design rather than growing it.

## round_0_verify

- evidence vs claims: CHECKED, AND TWO CLAIMS WERE WRONG. The allocation named four owed crossings from a guess. The engine computed ten and agreed with none of my four. Narrowing two over-broad allocations left exactly one, which is real. Separately, nineteen verdict lines named their requirement bare and every one read as unruled, because the deck matches on a wiki link. Both are fixed, and both are recorded in the forms rather than quietly corrected.
- types: CLEAN, AND RUN RATHER THAN ASSUMED. `npx tsc --noEmit` over project/deliverable exited 0 with no output. No code changed at M5, so that run still judges the tree.
- lint: SWEPT THREE FOLDERS. Elements: 12 swept, 11 clean, and the one finding is pre-existing in el-mirror, untouched here. Decisions: 3 new, all clean after one fix. Risks: 3 new, all clean after two fixes.
- tests: 88 PASS, 0 FAIL, 88 TIMED, over ten files covering the walk, the claim guard and the container states. No code has changed since, so that verdict still judges this tree.

## round_1_validate

- exercised against the goal: YES, AND THE STRUCTURE IS WHERE THE GOAL BECAME CONCRETE. The target is a cloud machine running from its seed alone. [[el-entrypoint]] answers a machine that starts, and [[el-record-store]] answers a machine seeing work it never downloaded.
- missing: ONE MECHANISM IS UNDECIDED. [[el-entrypoint]] carries a requirement graded fatal, and how the runtime arrives is not settled. The element is written so either answer fits, which is honest and is not a decision.
- wrong: THREE THINGS, ALL FIXED. The allocation was too generous. The verdict lines had the wrong shape. And the claim was given a timer the owner did not want.
- out of scope: NOTHING CREPT IN, AND ONE THING WAS DELIBERATELY REFUSED. The recompute defect is real and was observed three times. It is a retro item rather than i28 scope.
- prior art: COMPARED, WITH BOTH SIDES NAMED. VANILLA GIT is the comparison for reading the list from branches, and git needs no claim concept so nothing can go stale; ours adds a cross-machine claim git never had. DEVCONTAINER WITH CODESPACES is the comparison for [[el-entrypoint]], and its platform fetches and starts the image so nothing runs on a bare host; ours cannot shed the bare-host path, because `nbr-cloud-host` describes a machine with a shell and nothing else. KUBERNETES LEASE was the comparison for an expiring claim, and it is now the prior art for a road NOT taken: its control plane serializes renewals and it has no offline case, and the owner ruled that a timer on every claim charges the common case to clear the rare one.

## round_2_red_team

- STEELMAN: this decomposition is premature, because the winner it decomposes was one point clear of one rival and zero clear of another, so a structure built on a tie hardens an arbitrary choice into elements that are expensive to undo => THE TIE WAS BETWEEN NON-COMPETITORS, and the decomposition does not close it. [[raid-dec-the-worktree-hangs-off-the-claim]] says that if a later iteration removes trees entirely, the decision becomes vacuous rather than wrong.
- THE WINNER'S HEADLINE STRENGTH HAS BEEN WITHDRAWN. It won M4 largely on answering a machine that dies mid-iteration, and the owner has now ruled that no claim expires, so it does not answer that any more => TRUE, AND IT IS THE MOST SERIOUS THING IN THIS GATE. What survives is the smaller half: a folder exists exactly while a claim does, which still deletes the create step, the remove step, the sweep and the stale-folder class. The scores are stale and the structure is not, because the structure was never scored.
- So the M4 scoring no longer describes the design => CORRECT, AND RECORDED RATHER THAN REPAIRED. Rescoring would mean re-running a comparison whose winner the owner has already amended by hand, which is work that changes nothing about what gets built. The honest statement is that M4's numbers judged a mechanism that is no longer in the design.
- The decomposition happened once, after the winner, so no candidate was ever scored as a structure => TRUE, AND RECORDED AS THE METHOD'S OWN TRADEOFF. It bit twice here. Nothing at M4 knew the winner would need a second element with a clock in it, and nothing knew that element would then be ruled out.
- My allocation was wrong and I did not notice: I argued four owed crossings in prose and the engine computed ten => THE PROSE WAS CONFIDENT AND THE COMPUTATION WAS RIGHT. It is the strongest evidence in this gate that argued allocations need computing against.
- KILL-CRITERION: this is the wrong call if what remains of the winner is too small to be worth an iteration => LOOKED FOR AND NOT FOUND. Three things survive the reversal and each stands on its own: the list comes from git rather than from folders, one verb answers it, and a folder exists exactly while a claim does. The first two are the cloud target directly.
- SECOND KILL-CRITERION: this is wrong if removing the timer breaks something that depended on it => LOOKED FOR AND FOUND ONE. [[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]] goes back to unanswered. It is named in three places rather than quietly dropped, and the owner accepted that cost explicitly.

## raid_additions

- [[raid-risk-the-graph-shows-a-change-only-after-a-re-walk]]
- [[raid-risk-the-batching-condition-is-prose-not-a-mechanism]]

## verdict

pass with overrides — the structure is sound, every computed number is at its target, and five defects found here were fixed rather than logged. Two things are waved through. FIRST, [[el-entrypoint]] carries `req-one-command-starts-an-unattended-machine`, graded fatal, and how the runtime arrives is undecided; I did not invent an ADR for it, because a decision node recording an unmade decision is worse than a named gap. SECOND, M4's scores no longer describe this design: the winner was scored largely on answering a machine that dies, and the owner has removed that mechanism. The dissent is that a reader comparing the Pugh matrix against the structure will find them out of step, and the honest repair is to say so rather than to rescore a comparison the owner has already settled by hand.

## follow_up

- rank-unknowns is next, and it inherits a clear first entry: how the runtime arrives on a bare host
- ONE DECISION IS OWED BEFORE M6 CAN CHECK ANYTHING END TO END, and it is the image question
- TWO RISKS ENTER THE REGISTER, down from five, and neither was talked down
- ONE HOLE IS REOPENED AND NAMED: nothing frees an iteration from a machine that died
- M4'S SCORES ARE STALE and the gate says so rather than hiding it
- EIGHT FITNESS CANDIDATES are flagged for M7
- A STALE CONTROL LINE IS PARKED FOR M8's SWEEP on `fn-run-a-governed-walk.share-the-pool`, and the owner's ruling has made that line true again

## anything_else

### What this gate changed rather than recorded

FIVE DEFECTS WERE FOUND AND ALL FIVE ARE FIXED.

- AN ALLOCATION THAT OWED TEN BOUNDARIES where four were argued.
- NINETEEN VERDICT LINES THAT READ AS UNRULED, because they named requirements bare instead of as links.
- FIVE AT-RISK VERDICTS THAT EXISTED ONLY AS PROSE. They became register nodes.
- A WORD NOBODY INTRODUCED. "Lapse" and "lapsing" were mine, and they are swept out of every node.
- A TIMER THE OWNER DID NOT WANT, removed with the element and the interface that carried it.

### The reversal, and what it cost

THE OWNER RULED ON 2026-08-15 that a claim stays with its machine until a person releases it. No timer, no automatic override.

THE REASON IS PROPORTION. A paused walk is the common case and an abandoned claim is the rare one, so a clock on every claim charges the common case to clear the rare one.

WHAT IT COST: a machine that dies still holds its iteration, and nothing notices. That hole is named in the decision, in the structure and in this gate.

WHAT IT SAVED: no clock sits on the critical path, so no honest slow walk can lose its own work.

### The enforcement ruling, which is the better half

I HAD FILED THE BATCHING AS A RISK TO LIVE WITH. The owner said enforcement is architectural: nobody asks git directly, one verb answers, and that verb batches.

THAT IS A BETTER ANSWER THAN THE ONE I WROTE. A rule nothing enforces holds until somebody is in a hurry. A path that does not exist cannot be taken.

### Why the verdict is not a clean pass

TWO THINGS SIT UNDER IT. A fatal requirement rests on an open mechanism, and M4's scores describe a design that has since changed.

NEITHER IS HIDDEN AND NEITHER IS REPAIRED BY WRITING MORE. An ADR for an unmade decision, or a rescore of a comparison the owner has already settled, would both make this gate read cleaner and tell the reader less.
