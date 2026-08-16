---
form: gate-requirements
amended: "2026-08-16T06:47:19.691Z by agent — The owner overturned this gate's ruling on the six machine-locking requirements the same day it was signed, and then widened it to the whole ripple. The verdict…"
bless: blessed by agent
by: agent
signed_off: 2026-08-16T06:23:17.248Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

i34 stands at gate-requirements, the end of design input. M0 through M3 are complete.

WHAT THE REGISTER HOLDS: four new requirements, one per pass line, joined to a standing set of 217. Four functions wired to serve them. Five register entries, two of them assumptions now probed.

WHAT THIS GATE MUST ACTUALLY RULE, and it is bigger than the four rows: a SUPERSESSION LIST that three earlier states each found and none was allowed to settle. A state that writes requirements does not retire them, and a state that derives functions does not delete them. This is where the whole shape is visible at once.

## round_0_verify

- evidence vs claims: Every file and line was opened this session rather than recalled. The change map cites engine/iterations.ts:52, :59, :70-79, :212, :243, :247, :764, :1208; engine/worktree.ts:86-109, :234-247, :274, :283, :434-470, :489-541; engine/resolve.ts:25-30, :43-49; engine/paths.ts:191-205, :210, :237-240, :267; engine/session.ts:279-281, :1098-1103; engine/survey.ts:65-68; engine/expmachine.ts:195, :250, :371; engine/claims.ts:1-8. THE ONE CLAIM I MADE WITHOUT CHECKING WAS WRONG and the owner caught it: I told them no character limit existed, quoting a code comment. The limit was engine/forms.ts oneLine, a bare 200 with an ellipsis. That is the sharpest evidence-vs-claims finding of this milestone and it is mine.
- types: NOT RUN as a whole-tree check. Three engine files changed this milestone (forms.ts, session.ts, stateform.ts) and each change was covered by a scoped run instead.
- lint: NOT RUN. No guidance or method file changed except guidance/method/retro.md step 8, which the voice lint would sweep and which carries no new prose shape.
- tests: THREE SCOPED RUNS, all green and all answering a named question. 20 of 20 on skipping unchanged node-table cells. 20 of 20 on refusing a truncated cell at the write. 23 of 23 on removing the 200-character cut, over forms, container, node-scoping and reopen. The battery is not earned: the diff is three functions.

## round_1_validate

- exercised against the goal: The goal is that an agent stops losing time to which-tree questions. Exercised twice today, both times against me. A filesystem check run while bound to i4 answered about i4's tree and I reported a missing worktree that had never moved. And a form could not be submitted because a writer had truncated twenty-two values the state was not asked to touch.
- missing: The build. Nothing that i34 exists to change has been changed yet: worktrees stand, branches stand, the seam stands. What HAS changed is three engine functions that were blocking the walk itself.
- wrong: Three things, all corrected in the open. My branch-loss measurement used a direct tree diff instead of a fork-point one. My change size was major, priced by code touched rather than design input owed. And my claim that no character limit existed was false, believed on the strength of a code comment that recorded a search nobody re-ran.
- out of scope: The cloud claim replacement, the engine code review, the six missing git lane verbs, and the node-table check half. Each is named in scope-non-goals or a parked note with its ready-when.
- prior art: Made against git worktrees, our own v1 at ref main, and GitHub's published size guidance, each with what it does better and what ours sheds. NOT made against trunk-based development as an industry practice, because no primary source was fetched. Nothing in this gate rests on it.

## round_2_red_team

- STEELMAN: this gate should FAIL, because the milestone spent itself fixing the engine's own form machinery and produced four requirements, which is thin for the end of design input => The steelman is right about where the time went and wrong that it disqualifies the register. The four rows cover every pass line the motivation gate set, and the supersession list below is the real design output. The engine work was not a detour: probe-assumptions could not be submitted at all, so M3 had no other route to its own end.
- KILL-CRITERION: this is the wrong call if retiring five standing requirements turns out to remove a guard something still needs => Checked each one against what replaces it. req-trees-never-mix is the only one whose removal leaves nothing behind, and that is because one tree cannot mix. The other four are satisfied by construction rather than unguarded.
- I AM RULING ON REQUIREMENTS I DID NOT WRITE, in an iteration whose goal benefits from their removal => True, and it is the sharpest conflict in this form. So each is retired against a stated reason a later reader can disagree with, never as a bundle, and none is deleted — superseded is a status, and the node keeps its history.
- THREE STATES FOUND THIS LIST AND NONE COULD ACT => That is the method working rather than failing. Each state named what it found and carried it, which is why the gate sees one shape instead of three fragments. It is also why nothing was smuggled: a requirements state that retired requirements would have done it invisibly.
- A GREEN SCOPED RUN IS BEING USED WHERE A BATTERY BELONGS => Three functions changed, and SE-C-130 refuses a run over an unchanged tree on purpose. The battery is earned when the diff outgrows scoped runs, and it has not. The verdict says so rather than implying coverage nobody bought.

## raid_additions

- none

## verdict

pass — the register is complete against every pass line, and the supersession list is ruled rather than carried further. WHAT IS RETIRED: five requirements this gate first named — req-parallel-iterations-own-worktrees, req-archive-releases-worktrees, req-a-method-change-reaches-every-tree, req-shared-change-reaches-without-unlanded-work-reaching, and req-trees-never-mix, the one whose removal leaves nothing behind because one tree cannot mix. AMENDED 2026-08-16 AFTER AN OWNER RULING THAT OVERTURNED THIS GATE'S OWN JUDGMENT. This form first kept the six machine-locking requirements as a dormant specification. The owner refused that: "we don't wanna use the claim mechanism anymore. What's the point of keeping them?" and then "you can remove that everywhere it ripples. Even if it ripples up, that's fine." So the whole chain went: twenty nodes, including uc-claim-an-iteration, sty-work-on-two-machines, three test-specs, one element, one function, one interface, one design spec and four register entries. THREE LIVE REQUIREMENTS WERE RE-POINTED rather than taken down with the use case — req-a-records-dependency-is-declared and req-unshipped-dependency-refused are the container's DAG wiring, and req-a-shipped-record-is-never-reclaimed is about a record's status. Deleting the use case would have orphaned all three, and only reading each referrer by hand caught it. THE FALSIFIED ASSUMPTION CHANGES KIND: raid-asm-a-record-folder-is-addressed-only-from-inside-itself is false and has already happened, so per meth-raid it becomes an issue. WHAT THE PASS DOES NOT CLAIM: nothing is built, and no battery has run.

## follow_up

- CHANGE THE KIND on raid-asm-a-record-folder-is-addressed-only-from-inside-itself from assumption to issue, keeping the id and saying so in the body, per meth-raid's falsified-assumption rule.
- MARK THE FIVE RETIRED REQUIREMENTS superseded rather than deleting them, each carrying the reason from this verdict.
- THE BUILD ORDER IS UNCHANGED and the rescue still runs first. The one addition M3 produced: minted_in needs its new source before the worktrees go, or every trace node written afterwards loses its provenance.
- THE NODE-TABLE CHECK HALF is the one engine debt this milestone opened and did not close. nodeTableProblems at engine/stateform.ts:1286-1310 refuses a partial table; it should read an omitted row from the node. Until then every node-table state resends values it was not asked to touch.
- TEN RESTORED VALUES SHOULD BE SPOT-CHECKED by somebody who was not me, since I both damaged and repaired them.

## anything_else

THE MILESTONE'S REAL OUTPUT IS NOT THE FOUR REQUIREMENTS. It is a defect that had survived three hunts and two backlog notes: engine/forms.ts cut every frontmatter value at 200 characters and appended an ellipsis. It damaged thirteen standing probe results, blocked this iteration's own M3, and was defended by a code comment asserting a search result that was false in both halves.

THE OWNER FOUND IT BY REFUSING MY ANSWER. I said the limit did not exist and cited the comment. They said it would be in our code and asked where else it could be. It was in our code.

WHAT I WOULD HAVE A LATER READER TAKE FROM THAT: a comment recording the result of a search is not evidence, and I treated it as evidence twice. The comment now says so in its own words rather than being deleted.
