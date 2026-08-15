---
form: gate-candidates
bless: blessed by agent
by: agent
signed_off: 2026-08-15T17:24:54.987Z
authors: agent
files:
---

# Evidence form / gate-candidates

## current_situation

M4 is complete and unblessed. Four candidates composed, seven criterion axes ranked, four cut, three scored, one eliminated.

THE FRONT IS THREE. `cand-the-lifecycle-is-the-claim`, `cand-no-folders-at-all` and `cand-the-host-is-declared` each beat the others somewhere and lose somewhere.

ONE CANDIDATE IS GONE. `cand-the-scoped-fix` scored 1, 3, 2 against a rival's 2, 4, 3 and is beaten everywhere with no trade.

THIS GATE BLESSES THE FRONT, NEVER A WINNER. M5 composes the winner and this state does not name one.

## reasons_hold

### The four cuts, checked one at a time

THREE HOLD BY CONSTRUCTION, and by construction here means a frame decision rather than a candidate decision.

- THE LIST COMES FROM GIT was settled at M1 as the iteration's frame. No candidate varies it, because varying it would put the candidate outside the iteration.
- ENTERING REPAIRS ITSELF is a demand on the entry path that every candidate inherits unchanged. None of the four writes a different repair.
- WORK STARTS WITHOUT A REACHABLE REMOTE is met identically. The lease candidate makes the offline case worse, and that cost is already scored on the claim axis, so scoring it twice would double-count one weakness.

### The fourth cut had a wrong reason

THE CUT STANDS. THE REASON DID NOT. I wrote that the console requirement was cut because only the host-declared candidate moves it. That is false.

WHAT IS ACTUALLY TRUE: nothing between the lane and a console but the `--headless` guard at `project/deliverable/engine/bin/se-mcp.ts:495`. No candidate touches that flag. All four are identical on it, which is a stronger and checkable ground for the same cut.

I AMENDED cut-criteria RATHER THAN CARRYING IT. The signature was kept because the claim did not change, only the ground under it. That is this gate finding a defect in its own input and fixing it, which is what the round is for.

### No row was moved

EVERY ROW SITS AT THE RANK ITS REQUIREMENT'S `breaks_how_badly` gives it, authored at M3 before candidates existed. There is no move to judge, and so no chance for a move to favour anybody.

### A front of three is not a collapse

THE SPACE DID NOT NARROW UPSTREAM. Seven finders produced six new options, four candidates were composed from them, and three survive. A front of one would have owed an explanation. Three owes none.

## round_0_verify

- evidence vs claims: CHECKED, AND ONE CLAIM WAS FALSE. Every cut reason and every score anchor was read back against what the records say. Three cut reasons hold. The console cut's reason did not, and it is amended above. All twelve score anchors point at something a record actually says or actually omits.
- types: NOT APPLICABLE, AND CHECKED RATHER THAN ASSUMED. `git status --porcelain` shows one deliverable file touched this iteration, `project/deliverable/machines/forms/templates/compare-card.md`, which is markdown. No TypeScript changed, so nothing has a type surface to check.
- lint: RUN TWICE, AND CLEAN THE SECOND TIME. First sweep of the four candidate records: 11 findings across all 4 files, long sentences and comma chains. All 11 fixed. Second sweep: 4 swept, 4 clean, 0 findings. The one new RAID node linted at 1 finding and was fixed to 0.
- tests: NOT RUN, DELIBERATELY. No code changed, so no test can answer a question about this milestone. A battery here would be reassurance rather than an answer, which the lane forbids.

## round_1_validate

- exercised against the goal: PARTLY, AND THE SHORTFALL IS THE HEADLINE. The goal is a cloud machine running from its seed alone. Exactly one survivor scores above 2 on the bootstrap axis, and that survivor scores 1 on the claim axis. No single candidate serves the goal whole.
- missing: TWO THINGS. What a worktree CONTAINS rests on no requirement at all, so the measured 1326 files scored nothing. And no candidate covers bootstrap and claims together, which means M5 must graft rather than pick.
- wrong: ONE THING, NOW FIXED. The console cut's reason, amended above.
- out of scope: NOTHING CREPT IN. The milestone one-pager programme was moved to i19 on the owner's instruction before this milestone began, and nothing from it appears in any candidate.
- prior art: COMPARED, WITH BOTH SIDES NAMED. Three real systems, and each is better than ours at something. KUBERNETES LEASE has a control plane that serializes renewals and an expiry nobody argues with; ours sheds that plane, so our expiry is advisory and an offline holder cannot renew at all. VANILLA GIT has no claim concept, so it has nothing that can go stale and every engineer already knows checkout; ours adds a cross-machine claim git never had. DEVCONTAINER WITH CODESPACES has a platform that fetches and starts the image, so nothing ever runs on a bare host; ours cannot shed the bare-host path, because `nbr-cloud-host` describes a machine with a shell and nothing else. NONE OF THE THREE WAS BEATEN. No candidate scored 5, and that is the honest result rather than a modest one.

## round_2_red_team

- STEELMAN OF THE OPPOSING CASE: cut to one candidate now, and skip converge-pugh entirely. Its best form is strong. The scores already show no candidate wins outright, so M5 must graft whatever happens. A Pugh matrix over three columns spends a milestone to reach a conclusion this gate's reading already states in two sentences, and the grafting is done by judgment either way. => THE ANSWER IS THAT PUGH IS THE GRAFTING MECHANISM, not a step before it. Naming the graft is not performing it, and a graft chosen without the matrix is a preference wearing a method's clothes. The steelman does identify a real cost, and it is recorded rather than dismissed.
- THE SCORES CAME FROM ONE READER, ONE PASS, NO SECOND OPINION. The method spawns a clean-context agent precisely because the composer is biased, then accepts a single reading as sufficient. => PROBED, AND IT HOLDS HERE. The eliminated candidate needs a TWO-band swing to re-enter, and the anchors only plausibly blur by one band. It is minted as an assumption because the margin, not the count, is what makes it safe, and a future elimination on a one-band gap gets no such protection.
- THE BOOTSTRAP AXIS IS RANKED FIRST AND SERVED WORST. It rests on a requirement graded fatal, and three of four candidates score 1 or 2. => THAT IS A TRUE PROPERTY OF THE SET, not a scoring error. The finders worked the worktree and claim problems, and one lone option worked the host. It is carried to M5 as the thing the graft must answer, and it is the strongest argument this gate has for not shortcutting Pugh.
- ELIMINATING THE SCOPED FIX REMOVES THE ONLY CHEAP OPTION. Every survivor changes something structural, and nothing on the front is a small change. => COST IS NOT AN AXIS HERE, and adding it now would be tuning criteria after seeing the scores. The observation is recorded for M5, which may legitimately weigh effort when it composes.
- KILL-CRITERION, NAMED AND LOOKED FOR: this front is the wrong call if the elimination is wrong, because the front itself is just what survives it. => LOOKED FOR AND NOT FOUND. To re-enter, `cand-the-scoped-fix` needs holder at 4 or better, or worktree at 5, or bootstrap at 3. Each is a two-band move from what it scored. A one-band misread anywhere leaves the elimination standing.
- SECOND KILL-CRITERION: the front is wrong if a cut axis would have separated the candidates. => THIS IS WHERE THE GATE IS WEAKEST, and it is the reason for the override below. The contains-axis was never a requirement, so it was never a criterion, so it could not be cut or kept. It is not a cut I can defend; it is a demand M3 never wrote.

## raid_additions

- [[raid-asm-one-scoring-pass-is-enough-to-eliminate]]

## verdict

pass with overrides — the front of three is sound and the elimination survives its own kill-criterion, but one finding is waved through rather than fixed: what a worktree CONTAINS rests on no requirement, so a measured difference between candidates scored nothing. I did not fix it, deliberately. Writing a requirement now, after the scores are visible, is tuning the criteria to fit an outcome, and that is a worse fault than the gap. It is logged as M3's gap for M5 to weigh openly.

## follow_up

- THREE CANDIDATES GO TO converge-pugh: the lifecycle is the claim, no folders at all, the host is declared
- ONE ASSUMPTION IS ADDED to the register, probed and holding for this elimination
- M5 INHERITS ONE DEMAND: answer the bootstrap axis, which exactly one survivor serves and which is ranked first
- THE M3 GAP RIDES ALONG as a logged override, not as a fixed thing
- ONE DANGLING REFERENCE REMAINS. The superseded story stub is deleted and its live reference removed, but `write-stories.md` still names it twice as signed history. That belongs to M8's consistency sweep, not here.
- THE OWNER BLESSES THIS GATE. It is submitted unblessed on their instruction.

## anything_else

### What this gate actually changed

IT DID NOT ONLY JUDGE. Three things were wrong on arrival and all three are fixed rather than recorded.

- ELEVEN LINT FINDINGS in the four candidate records, now zero.
- ONE FALSE CUT REASON, amended with the signature kept because the claim did not change.
- ONE MISSING ASSUMPTION about single-pass scoring, minted and probed.

### The one thing left standing, and why

THE CONTAINS-AXIS GAP IS THE ONLY OVERRIDE. Two candidates carry a worktree holding only the record. The probe measured 1326 files in a full one. Nothing at M3 asks for a thin tree, so that measured difference could not become a criterion.

FIXING IT NOW WOULD MEAN WRITING A REQUIREMENT AFTER SEEING THE SCORES. That is the exact move the method's cut rule exists to prevent, and it would favour whichever candidate the new axis flattered.

SO IT GOES FORWARD AS DISSENT. M5 may weigh it openly, and a later iteration may write the requirement properly, before anything is scored against it.
