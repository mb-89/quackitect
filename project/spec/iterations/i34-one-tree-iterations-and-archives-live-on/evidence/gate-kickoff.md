---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-16T05:35:56.960Z
authors: agent
files:
---

# Evidence form / gate-kickoff

## current_situation

i34 stands at its kickoff gate, having walked M0's onboarding retro.

WHAT THE RETRO LEFT. The notes inbox went from 32 to 0. Fifteen notes were carried into this iteration and are inputs on its record; seventeen were parked with re-entry conditions. The window held 2,882 calls at a 3.7% failure rate, and se_run fell from 11.4% of all calls at the 2026-08-07 retro to 1.9%.

WHAT THE ITERATION IS. One tree. Iterations and archives live on disk on trunk, worktrees and record branches go, and the seam that picks between trees is deleted rather than fixed.

WHAT IS ALREADY PROVEN, before any code is written. A record folder is self-contained: i27's holds record.md, decisions.jsonl, 79 evidence files and six machines files. Every path into it is already a pure function of the id. The tree enters at one join, engine/iterations.ts:59.

WHAT IS ALREADY DECIDED ELSEWHERE. i27 ruled on 2026-08-13 that this product gets no worktree and its records walk on trunk. engine/session.ts:1098 says it is not switched on because a record's content stands on its branch. The branch is the obstacle to removing the branch.

## retro_drained

- note-9aad40bcbd9b — GATES BECOME STRATEGIC, so a tactical dial block: backlog, ready when the autonomy tiers are next touched.
- note-232cbe3591ec — A WORKTREE OUTSIDE THE PROJECT CANNOT BE OPENED,: carried into i34, the worktrees go.
- note-801f54496c1f — THE PROMPT-LAYER PLACEMENT TAKES ABOUT FIVE SECO: backlog, ready when the placement is next profiled.
- note-e2637894a3ed — AN ITERATION CAN CREATE A NODE AND CAN NEVER REM: backlog, ready when node deletion rights are touched; i34 meets it.
- note-54c7a1cdfc4e — THE NODE-TABLE TRUNCATION FIRED A SECOND TIME, a: backlog, ready when the node-table editor is touched.
- note-9626102e8e5b — A PROBE RESULT BECOMES ITS OWN NOTE, and the edi: backlog, ready when probe and editor mechanics are touched.
- note-db74bf2b7f0b — THE AGENT ASSERTS SYSTEM FACTS IT COULD HAVE CHE: backlog, and it fired again today, which raises it.
- note-c8e5a398b943 — STREAM THE WALK LIKE A GAME STREAMS A LEVEL — pe: backlog, ready when the packet size is designed.
- note-4592c67f8ff4 — THE STOP HOOK OVERRODE A PROMISE MADE TO THE OWN: backlog, ready when the stop hook is touched; it fired twice more today.
- note-c4fd561ca53e — A GATE'S EVIDENCE IS HARD FOR A PERSON TO REVIEW: backlog, ready when the gate one-pager is built.
- note-7884fd345b00 — THE COMPARE CARD'S SERVED HELP MISLED, AND ITS N: backlog, ready when the compare card is touched.
- note-fe9e091bfa4c — An iteration to code-review the engine for compe: backlog, ready when the next iteration is seeded.
- note-238e5c575922 — The reload commits the iteration's work to trunk: carried into i34, the duplication it names goes.
- note-f7777e741479 — The graph must recompute on change, instead of n: backlog, same family as today's stale-engine failure.
- note-e1c389b07962 — Too many manual steps the engine could have done: backlog, three new cases arrived today.
- note-2605b620b8eb — A state's script condition judges the repo root : carried into i34, impossible once root and worktree are one.
- note-9790deb26c96 — A new mechanism must kill the old path, not sit : carried into i34, it is the rule the seam deletion obeys.
- note-5aabf156e5f7 — A fan's join deadlocks when one agent reaches it: backlog, ready when the fan's join is touched.
- note-f2b4b93c28d4 — A LANDING BRINGS THE CODE AND LEAVES THE TRACE B: backlog, ready when the close is touched, which i34 does.
- note-1bef0a5cc29b — THE LANE STILL DOES NOT GIVE ME THE RIGHT TREE, : carried into i34, with one tree there is no wrong tree.
- note-46f7e3166eb2 — A SOURCE-TEXT ASSERTION BREAKS WHEN A SECOND COP: backlog, ready when source-text assertions are touched.
- note-0d016e8178b2 — DROP WORKTREES FOR TWO PLAIN CLONES? The owner w: carried into i34, answered as one tree rather than two clones.
- note-0a16f21b695e — The git lane has no way to ask how big the repos: backlog, ready when the allowlist is touched.
- note-e6c318aeb7a2 — i28 SHIPPED YESTERDAY AND ITS WORKTREE IS STILL : carried into i34, its orphan goes with the rest.
- note-b575e803af9c — THE WORKTREE QUESTION IS MEASURED NOW — the numb: carried into i34, it holds the measurements.
- note-b042c413e0e3 — DELETING ALL WORKTREES TODAY WOULD BREAK THE VIE: carried into i34, it names the 14 files to rescue.
- note-5a434b119c3b — Every stub worktree holds an uncommitted copy of: carried into i34, the rescue must not copy the phantom.
- note-c4c60089b369 — TRUNK-ONLY RECORDS ARE ALREADY THE DECIDED DESIG: carried into i34, i27 decided it and blocked it circularly.
- note-a6d2f0781686 — KEEPING THE ARCHIVE ON DISK DELETES THE RETRIEVA: carried into i34, it carries the branch list.
- note-0a256ac21b27 — THE TREE COUPLING IS ONE join(), and everything : carried into i34, it is the change map.
- note-477b27d4bd20 — A SEED CAN LEAVE AN ITERATION UNENTERABLE, and t: carried into i34, its three defects are i34's.
- note-360a599a263a — CORRECTION to note-477b27d4bd20 — a stale engine: carried into i34, it carries the live proof.
- note-09ac419a1aef — STOP COMPARING se_run AGAINST THE OLD RETRO'S 11: done, fixed in guidance/method/retro.md step 8 this session.

## goal

One tree: iterations and archives live on disk on trunk, worktrees and record branches are gone, and the resolution seam that picks between trees is deleted rather than fixed.

## pulled_in

- THE TRUNK-ONLY STORAGE MODEL. Origin: owner rulings 2026-08-16, and i27's own vision of 2026-08-13 which already decided it.
- THE ARCHIVE STAYS ON DISK. Origin: owner ruling 2026-08-16. It removes the manifest, the stored hash and the git read path that an earlier design in this same session had required.
- DROPPING THE CLOSED RECORDS AND EVERY EXPEDITION. Origin: owner, explicitly, twice: "I don't need the expeditions anymore" and "We can switch the system and lose the history. I'm actually fine with that."
- REMOVING 27 WORKTREES, 33 it/* BRANCHES, EVERY exp/*, AND claims. Origin: owner ruling 2026-08-16.
- DELETING THE TREE-PICKING SEAM. Origin: the owner's stated reason for all of it — "the agent spends too much time finding stuff on trunk or in worktree." Sites named in note-0a256ac21b27.
- THE SELECTION STATE. Origin: owner ruling 2026-08-16, note-998a61a15659, added mid-session with an explicit go. Entering the iterations container must not enter the first iteration.
- THREE DEFECTS FOUND WHILE ENTERING THIS ITERATION: a refusal that kills the transport instead of arriving, a failure that reaches no log, and a dropped pull that enters the first offered alternative. Origin: note-477b27d4bd20 and its correction note-360a599a263a.
- RESCUING 14 FILES that exist only in worktrees. Origin: note-b042c413e0e3. It runs FIRST and nothing destructive precedes it.

## left_out

- THE CLOUD RUNNER'S adopt STEP goes with the claims branch and is NOT replaced. A cloud machine will have no way to claim an iteration and no way to be refused. Where it went: stated as an accepted consequence, and it belongs to whatever iteration next takes up cloud work.
- THE ENGINE CODE-REVIEW for competing mechanisms and quick hacks. Where it went: parked, note-fe9e091bfa4c, ready when the next iteration is seeded. i34 removes one competing mechanism but is not that review.
- THE GIT LANE'S MISSING VERBS — count-objects, rev-list, ls-files, a recursive size, worktree removal, a commit into another tree. Where it went: parked, note-0a16f21b695e, ready when the allowlist is next touched. i34 will need two of them and will use the shell escape with its reason logged.
- RECOVERING ANY DROPPED HISTORY. Explicitly out by owner ruling.
- THE FOURTEEN OTHER PARKED NOTES, each with its own ready-when. None is blocked by i34 and none blocks it.

## change_size

minor — the owner's argument is correct and the matrix confirms it: minor drops the entire design-selection apparatus, which has nothing to select, and keeps every row that guards a deletion. WHAT MINOR DROPS TO none, counted from the rows: the whole M4 candidate lane (enumerate-space, derive-criteria, cut-criteria, evaluate-set, run-candidates, partition-functions, gate-candidates), the whole M5 architecture lane (converge-pugh, reverse-sensitivity, declare-winner, record-adrs, evaluate-architecture, gate-architecture), the whole M6 prototype lane (rank-unknowns, run-spikes, fold-back, gate-prototype), three M2 rows (draw-context, map-stakeholders, gate-inputs), and run-demos. That is 23 rows of choosing between designs, for a change whose design input already exists: two or three attempts at fixing resolution that did not work. WHAT MINOR KEEPS AT full, which is the part that matters here: write-requirements, author-tests, observe-red, specify-build, build-steps, verification, trace-design, fix-findings, sweep-consistency, package, gate-requirements, gate-implementation, gate-release, shipped. Tests first, red observed, build, verify, sweep, ship. THE ONE REAL LOSS IS record-adrs, which drops to none, so the decision to go one-tree gets no ADR node. It is mitigated rather than ignored: the reasoning is already written into this iteration's vision and into five carried notes with their measurements. THE ESCALATION TRIGGER DOES NOT FIRE. decompose-structure's minor_note says escalate when wanting a NEW element or interface; i34 wants neither, it removes. WHY MY EARLIER major WAS WRONG: I priced the change by how much CODE it touches. The column prices how much DESIGN INPUT is owed, and this change owes almost none.

## round_0_verify

- evidence vs claims: Every file and line in the change map was opened this session rather than recalled — engine/iterations.ts:52, :59, :70-79, :212, :243, :247, :764, :1208; engine/worktree.ts:86-109, :234-247, :274, :283, :434-470, :489-541; engine/resolve.ts:25-30, :43-49; engine/paths.ts:191-205, :210, :237-240, :267; engine/session.ts:279-281, :1098-1103; engine/survey.ts:65-68; engine/expmachine.ts:195, :250, :371; engine/claims.ts:1-8. The retired-record round trip was PROVEN by reading i27's record at ref 5c9f850f through the lane. The deletion safety was MEASURED: 1,868 uncommitted paths hash-compared against trunk, 1,854 identical, 14 not, all named.
- types: NOT RUN, and it would prove nothing. No code has been written in this iteration. tsc last stood green at i28's validation gate.
- lint: NOT RUN, same reason. No source file has changed.
- tests: NOT RUN, same reason. The battery last stood at 1322 of 1322 at i28's close. Running it here would answer a question nobody asked, which the lane refuses on purpose (SE-C-130: an unchanged tree keeps its last verdict).

## round_1_validate

- exercised against the goal: The goal is that an agent stops losing time to which-tree questions. It was exercised once today, by accident and against me: I asserted a missing worktree from a check run inside the binding under investigation, told the owner, and had to retract it. The failure this iteration removes, observed live rather than argued.
- missing: The fix's own proof. Nothing yet SHOWS that one tree suffices for the archive renderer and the sub-machines. The reading says it does — the renderer takes {sid, full, goal} and the sub-machines are relative paths inside the record folder — but reading is not running.
- wrong: My first branch-loss measurement used a direct tree diff, which counts everything trunk changed since a branch forked, so an untouched stub read as 553 modified files. Re-run as a fork-point diff and corrected to the owner in the same message.
- out of scope: The cloud claim replacement, the engine code review, and the missing lane verbs. All three are named in left_out with where they went.
- prior art: v1 is the closest and it is our own — fifteen iterations as folders on one branch, with 2 worktree mentions across the whole Go product against 159 across 26 TypeScript files here. GitHub's own guidance ("ideally less than 1 GB", docs.github.com, read 2026-08-16) settles that storage was never the constraint: ours is 26.63 MiB compacted. The constraint was always the working tree, and nobody had measured it until today.

## round_2_red_team

- STEELMAN: this gate should FAIL, because the iteration proposes to delete 27 worktrees, 33 branches and seven closed records on the strength of one afternoon's conversation, and the thing being deleted is the only copy => The steelman is right that the deletion is irreversible and wrong that a fail protects anything. A fail leaves 27 worktrees standing with 14 files of real work uncommitted inside them, which is the state that nearly lost work today. The protection is the ORDER — rescue first, delete last — not the refusal.
- KILL-CRITERION: this is the wrong call if a record's evidence or sub-machines turn out NOT to be self-contained, because then moving the folder loses something => Looked for it. i27's folder holds record.md, decisions.jsonl, 79 evidence files and six machines files, and every path into them is relative. What I have NOT checked is whether anything outside the folder points INTO it by worktree path. That is now raid-asm-a-record-folder-is-self-contained.
- THE SIZE IS BEING PROPOSED BY THE AGENT THAT WANTS THE WORK => True, and it is why the column is not stamped. The method reserves the change size to the person and this form is filled without submit.
- THE ARCHIVE WILL BE EMPTY AND THAT MIGHT NOT BE WHAT THE OWNER PICTURED => Stated to them plainly before the go, with the number: i27 alone is 87 files including 79 signed evidence forms. They confirmed twice. It is recorded here so a later reader sees it was said, not discovered.
- I WROTE THIS ITERATION'S VISION AND AM NOW CITING IT => The vision is cited only for the owner's words, which are quoted from their messages. Every claim about the code cites a file and line read this session, and every measurement cites its own run.

## raid_additions

- none

## verdict

pass — at change size minor, corrected from my own major proposal after the owner challenged it and the matrix settled it. WHAT THE PASS RESTS ON: the goal is quoted from the owner's rulings; the scope is drawn with eight items in and five out, each with its origin or destination; every file and line in the change map was opened this session rather than recalled; and the one irreversible act, the deletion, is sequenced behind a rescue step naming all 14 at-risk files with their line counts. WHY MINOR IS SAFE HERE DESPITE THE DELETION: minor keeps every row that guards it — author-tests, observe-red, verification, trace-design, sweep-consistency and gate-implementation all stay at full. What it drops is 23 rows of choosing between candidate designs, and there is one candidate. THE ONE ASSUMPTION THAT COULD SINK IT is stated rather than waved: nothing has yet checked whether anything outside a record folder addresses it by worktree path, and that probe is owed before the levelling step. THE ONE ACCEPTED LOSS is the ADR, which minor drops to none; the reasoning lives in the vision and in five carried notes instead.

## follow_up

IMMEDIATELY, once the change size is confirmed: submit and bless this gate, which pins the column and grows the machine below it.

THEN, IN THIS ORDER, and the order is the safety.

1. Rescue the 14 files that exist only in worktrees.
2. Level the 26 stub records onto trunk.
3. Make status the open flag — six sites.
4. Collapse the record read to one tree — two sites.
5. Delete the tree-picking seam, claims.ts and itAdopt.
6. Cut the worktree out of seed and close.
7. Build the selection state.
8. Remove 27 worktrees, 33 it/* branches, every exp/*, and claims — leaving main and v2.
9. Rewrite the 66 obsolete test references.

PROBE OWED BEFORE STEP 2: raid-asm-a-record-folder-is-self-contained. Search for anything addressing a record by worktree path from outside its folder. It is cheap and it gates the levelling.

SEVENTEEN NOTES STAY PARKED with their ready-whens. None blocks this iteration.

## anything_else

THIS FORM IS FILLED AND NOT SUBMITTED, ON PURPOSE. The bare fill saves every field and stamps nothing, which is the mechanism the contract describes for exactly this case.

WHAT I NEED FROM THE OWNER IS ONE WORD: the change size. I propose major with no strikes, and the reasoning is in that field rather than summarised here.

WHAT HAPPENED GETTING TO THIS GATE, because the archive should carry it. Entering this iteration failed three times with a dropped socket and no log record, and each failed recovery bound i4 instead. A reload cleared it. Along the way I gave the owner a confident wrong diagnosis — that i34's worktree was missing — built from a filesystem check run inside the very binding under investigation. It is corrected in note-360a599a263a, and it is the best argument this iteration has.
