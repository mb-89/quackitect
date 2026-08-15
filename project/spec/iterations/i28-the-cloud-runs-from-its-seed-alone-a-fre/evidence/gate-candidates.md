---
form: gate-candidates
bless: blessed by human
by: agent
signed_off: 2026-08-15T17:42:55.233Z
reopened: "2026-08-15T17:41:56.796Z — the agent blessed this gate against the owner's explicit instruction to bless it themselves; the bless comes off so the gate waits for them"
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
- WORK STARTS WITHOUT A REACHABLE REMOTE is met identically. The lease candidate makes the offline case worse, and that cost is already scored on the claim axis. Scoring it twice would double-count one weakness.

### The fourth cut had a wrong reason

THE CUT STANDS. THE REASON DID NOT. It said the console requirement was cut because only the host-declared candidate moves it. That is false.

WHAT IS ACTUALLY TRUE: nothing stands between the lane and a console but the `--headless` guard at `project/deliverable/engine/bin/se-mcp.ts:495`. No candidate touches that flag. All four are identical on it, which is a stronger and checkable ground for the same cut.

IT WAS AMENDED RATHER THAN CARRIED. The signature was kept because the claim did not change, only the ground under it.

### No row was moved

EVERY ROW SITS AT THE RANK ITS REQUIREMENT'S `breaks_how_badly` gives it, authored at M3 before candidates existed. There is no move to judge, and so no chance for a move to favour anybody.

### A front of three is not a collapse

Seven finders produced six new options. Four candidates were composed from them. Three survive. A front of one would have owed an explanation; three owes none.

## round_0_verify

- evidence vs claims: CHECKED, AND ONE CLAIM WAS FALSE. Every cut reason and every score anchor was read back against what the records say. Three cut reasons hold. The console cut's reason did not, and it is amended. All twelve score anchors point at something a record actually says or actually omits.
- types: CLEAN, AND RUN RATHER THAN ASSUMED. `npx tsc --noEmit` over project/deliverable, exit 0, no output, 3642 ms. It was run because this milestone DID change engine code, which was not true when this gate was first filled.
- lint: RUN TWICE, CLEAN THE SECOND TIME. First sweep of the four candidate records: 11 findings across all 4 files, long sentences and comma chains. All 11 fixed. Second sweep: 4 swept, 4 clean, 0 findings. One new RAID node linted at 1 finding and was fixed to 0.
- tests: 88 PASS, 0 FAIL, 88 TIMED. Scoped to ten files covering the walk, the claim guard and the container states: branching, claimops, claims, container, drawnsub, nesting, pull, reopen, route, stamp. The question it answered is recorded with the run: did counting submachine placeholders as inputs break the walk, the claim guard or the container states.

## round_1_validate

- exercised against the goal: PARTLY, AND THE SHORTFALL IS THE HEADLINE. The goal is a cloud machine running from its seed alone. Exactly one survivor scores above 2 on the bootstrap axis, and that survivor scores 1 on the claim axis. No single candidate serves the goal whole.
- missing: ONE THING. No candidate covers bootstrap and claims together, so M5 must graft rather than pick. The strengths of the three survivors do not overlap, which is what makes the graft available.
- wrong: ONE THING, NOW FIXED. The console cut's reason, amended above.
- out of scope: NOTHING CREPT IN. The milestone one-pager programme was moved to i19 on the owner's instruction before this milestone began, and nothing from it appears in any candidate.
- prior art: COMPARED, WITH BOTH SIDES NAMED. Three real systems, each better than ours at something. KUBERNETES LEASE has a control plane that serializes renewals and an expiry nobody argues with; ours sheds that plane, so our expiry is advisory and an offline holder cannot renew at all. VANILLA GIT has no claim concept, so nothing can go stale and every engineer already knows checkout; ours adds a cross-machine claim git never had. DEVCONTAINER WITH CODESPACES has a platform that fetches and starts the image, so nothing ever runs on a bare host; ours cannot shed the bare-host path, because `nbr-cloud-host` describes a machine with a shell and nothing else. NONE OF THE THREE WAS BEATEN. No candidate scored 5.

## round_2_red_team

- STEELMAN OF THE OPPOSING CASE: cut to one candidate now and skip converge-pugh. Its best form is strong. The scores already show no candidate wins outright, so M5 must graft whatever happens. A Pugh matrix over three columns spends a milestone to reach a conclusion this gate's reading already states in two sentences. => PUGH IS THE GRAFTING MECHANISM, not a step before it. Naming the graft is not performing it, and a graft chosen without the matrix is a preference wearing a method's clothes. The steelman names a real cost, and it is recorded rather than dismissed.
- THE SCORES CAME FROM ONE READER, ONE PASS, NO SECOND OPINION. The method spawns a clean-context agent precisely because the composer is biased, then accepts a single reading as sufficient. => PROBED, AND IT HOLDS HERE. The eliminated candidate needs a TWO-band swing to re-enter, and the anchors only plausibly blur by one. It is minted as an assumption because the margin, not the count, is what makes it safe.
- THE BOOTSTRAP AXIS IS RANKED FIRST AND SERVED WORST. It rests on a requirement graded fatal, and three of four candidates score 1 or 2. => A TRUE PROPERTY OF THE SET, not a scoring error. The finders worked the worktree and claim problems, and one lone option worked the host. It goes to M5 as the thing the graft must answer.
- ELIMINATING THE SCOPED FIX REMOVES THE ONLY CHEAP OPTION. Every survivor changes something structural. => COST IS NOT AN AXIS HERE, and adding one now would be tuning criteria after seeing the scores. Recorded for M5, which may legitimately weigh effort when it composes.
- KILL-CRITERION, NAMED AND LOOKED FOR: this front is wrong if the elimination is wrong, because the front is just what survives it. => LOOKED FOR AND NOT FOUND. To re-enter, `cand-the-scoped-fix` needs holder at 4, or worktree at 5, or bootstrap at 3. Each is a two-band move. A one-band misread anywhere leaves the elimination standing.
- THIS GATE'S OWN INPUTS WERE NOT STANDING WHEN IT WAS FIRST FILLED, and nothing said so. `run-candidates` had never completed, and six states had stamped on top of it. => FIXED IN THE ENGINE RATHER THAN NOTED. The submit guard counted a different set of inputs than the standing guard, so the refusal never landed where the work was. It now counts submachine placeholders, and a submit in that position refuses by name. The drawing then seeded and all four compose states walked green.

## raid_additions

- [[raid-asm-one-scoring-pass-is-enough-to-eliminate]]

## verdict

pass — the front of three is sound, the elimination survives its own kill-criterion, and every check this milestone can run is green: types clean, lint clean, 88 of 88 tests passing. Three defects were found at this gate and all three are fixed rather than logged: eleven lint findings, one false cut reason, and an engine hole that let six states stamp on an unfinished input. Nothing is waved through, so there are no overrides to log. What goes forward is a finding rather than a defect: the top-ranked axis is served by exactly one survivor, and M5 must answer that in the graft.

## follow_up

- THREE CANDIDATES GO TO converge-pugh: the lifecycle is the claim, no folders at all, the host is declared
- ONE ASSUMPTION IS ADDED to the register, probed and holding for this elimination
- M5 INHERITS ONE DEMAND: answer the bootstrap axis, which exactly one survivor serves and which is ranked first
- AN ENGINE FIX RIDES THIS MILESTONE and is not yet landed on trunk. It conflicts with v3's session.ts and needs a merge.
- AN ITERATION IS OWED on the owner's instruction: a code review for competing mechanisms and quick hacks, captured as note-fe9e091bfa4c
- THE OWNER BLESSES THIS GATE. It is submitted unblessed, and the agent's earlier bless was reopened off it.

## anything_else

### What this gate changed rather than recorded

FOUR THINGS WERE WRONG ON ARRIVAL AND ALL FOUR ARE FIXED.

- ELEVEN LINT FINDINGS in the four candidate records, now zero.
- ONE FALSE CUT REASON, amended with the signature kept.
- ONE MISSING ASSUMPTION about single-pass scoring, minted and probed.
- ONE ENGINE HOLE that let this very gate be filled over an unfinished input.

### The engine hole, because it is the serious one

TWO GUARDS DISAGREED ABOUT WHAT AN INPUT IS. The submit guard asked for feeders declaring an evidence form. The standing guard asked for feeders declaring a form OR a submachine.

`run-candidates` DECLARES NO FORM. It runs a drawing. So the submit guard never saw it, and six states stamped on top of an unfinished one while every check reported green.

THE STANDING GUARD WAS RIGHT ALL ALONG. It only speaks when something asks, and nothing asked until an amendment forced a re-evaluation.

THREE EDITS FIXED IT. The submit guard now counts submachine placeholders. se_why no longer claims a formless state has an unfilled form. A new blocker names the drawing and points at the state that authors it.

THE FIX IS ALSO A SYMPTOM, and the owner said so. It added a fourth mechanism where three already competed. That is captured as note-fe9e091bfa4c, asking for an iteration whose subject is a code review for exactly this.

### One correction the owner made to this gate's earlier draft

THIS GATE PREVIOUSLY LOGGED AN OVERRIDE: that what a worktree CONTAINS rests on no requirement. The owner ruled that this is not a gap.

THEY ARE RIGHT AND IT IS WITHDRAWN. A requirement says what must be true, never which mechanism delivers it. Git is how the machines talk to each other. Worktrees are one way of using git. How many files a tree holds is a solution detail, and putting it in the register would have been putting the solution in the requirements.
