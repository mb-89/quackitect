---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-13T20:25:51.548Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

M3 is walked. Eight requirements stand, one function was minted, three assumptions are on the register and one is probed against the real channel.

THE CROSS-COUPLING PASS RAN BY HAND, on the owner's ruling, and it is the substance of this gate. 120 of the 205 resident requirements share vocabulary with this change; all 120 statements were read.

IT FOUND FOUR THINGS AND TWO OF THEM ARE UNMET RESIDENT REQUIREMENTS. One of those is the bug the owner spotted from the panel two hours ago, which turns out to have had a requirement all along.

## round_0_verify

- evidence vs claims: PASS WITH TWO CORRECTIONS ALREADY APPLIED. All eighteen evidence files opened. Two nodes I minted this milestone duplicated resident ones and were deleted, both found by reading neighbours rather than by any check: a reading-credit requirement and a platform assumption. The states that listed them were reopened and re-earned.
- types: PASS. tsc over the deliverable, exit 0. No source changed since 19:12; M3 authored trace nodes only.
- lint: PASS. biome over 217 files, exit 0, 7 pre-existing infos.
- tests: PASS. 61 of 61 on references and trace, 11 of 11 on capability coverage. The requirement-to-function and flow-closure checks ran as the states' own exit conditions rather than in the battery, which is itself a finding below.

## round_1_validate

- exercised against the goal: PARTLY, and more than at any earlier gate. The requirements are exercised by the checks that refused them - the coverage check named fourteen orphans, the weasel-word check caught could, the probe check demanded both keys on the node. Nothing of the BUILD is exercised; M3 does not build.
- missing: NOTHING IN THE REGISTER, and nothing unread. The six use cases the inputs gate named unread were READ HERE rather than carried forward again, and four of them changed a finding below. Reading them cost one call.
- wrong: TWO NODES I MINTED WERE WRONG AND ARE GONE, both duplicates of resident nodes I had not read. Same failure twice in ninety minutes, by the agent that had already written the finding about it.
- out of scope: NOTHING NEW. The fourteen orphan requirements swept at derive-functions were outside this change's cone, and the check refused the submit until they had a function - forced rather than chosen.
- prior art: THE IN-HOUSE PASS RAN, which the motivation gate said it owed. 120 candidates by keyword over the register, all read. The EXTERNAL comparison is still not run and is still owed at the architecture milestone.

## round_2_red_team

- FINDING: the bless-invalidation is specified TWICE and met NOWHERE => req-moved-evidence-invalidates-the-bless says the engine shall mark a depending gate suspect when the evidence under it changes. AND uc-browse-the-archive's extension 5a describes reading that suspect mark and its reason. So it is in a requirement AND in a use case scenario. THE OWNER FOUND IT FAILING FROM THE PANEL TODAY: a gate fell, its feeder was re-signed with different content, and the gate came back green carrying its old verdict. Reading the use case is what turned this from an unmet abstract demand into unmet specified BEHAVIOUR.
- FINDING: the worktree release is specified THREE TIMES and met nowhere => req-archive-releases-worktrees demands it. uc-close-a-record extension 6a says a bound worktree goes when the record archives. uc-land-work-on-trunk step 6 says the work lands and the worktree goes. i8 shipped this morning and its worktree stood until I removed it by hand. Three specifications, zero enforcement.
- FINDING: the self-hosting exception contradicts a MAIN SCENARIO, not just a requirement => uc-open-an-iteration step 2 reads: entering binds a worktree to the record and stamps it started. That is the happy path, not an extension. The exception says this product gets no worktree. THIS IS SHARPER THAN I FIRST RECORDED IT - a requirement can be amended quietly, and a main scenario step is what the system promises it does.
- FINDING: two of the six use cases place my new requirements better than I did => uc-quality-interaction-capability's guarantee reads that every refusal says what to do instead, which is exactly the second clause of both resolution requirements - name the tree you resolved to. uc-quality-reliability's recoverability sub-characteristic is where the read-back proof belongs. Both were sourced correctly by luck rather than by reading.
- SYNERGY => The answer bound helps req-call-answers-in-one-second directly: a smaller answer is a faster answer, and both live under interaction capability. The read-back rule strengthens every resident requirement whose verify method is test, because it changes what counts as proof rather than what is demanded.
- STEELMAN: the hand pass is not repeatable and therefore not evidence => Its advocate says a keyword grep is what I happened to think of, and another agent would pick other terms and find other couplings. TRUE, AND IT IS THE ARGUMENT FOR THE MECHANISM. What survives: this pass found two multiply-specified unmet behaviours in twenty minutes, which is two more than every mechanical check in the battery has found in a month.
- KILL-CRITERION => This register is wrong if something it states is already stated better elsewhere. LOOKED FOR IT: found twice, both deleted, and a third overlap named. Three in eight is high enough that the same pass runs again at the architecture gate rather than being treated as done.

## raid_additions

- none

## verdict

pass with overrides — the register is sound, and the cross-coupling pass found behaviour this system specifies in three places and enforces in none.

WHY IT PASSES. Eight requirements, each sourced to a dated observation or an owner ruling, each with its verify method and its damage named. Coverage closes both ways. The assumptions are probed or explained with their reasons. The in-house prior-art pass the motivation gate owed was run, and the six use cases the inputs gate left unread were read here rather than carried forward a third time.

ONE THING THAT IS NOT AN OVERRIDE, because it is already decided. The capability requirement and its own test spec set different bars, so 34 of 35 lane verbs are uncovered under one reading and all 35 under the other. THAT QUESTION IS SETTLED AND ITS ANSWER IS IN SCOPE: a command surface is an INTERFACE, so the lane is specified as one, a new verb is defined there, and the requirement is corrected to say so. The gate records it as work this iteration carries rather than as a tension it is waving past.

THREE OVERRIDES, EACH WITH ITS DISSENT.

OVERRIDE ONE: the bless-invalidation is unmet, and this gate is passing under it. THE DISSENT belongs on the record - this very gate can be reopened, re-signed with different content, and come back blessed without anybody re-reading it. It is specified in a requirement AND in a use case scenario. It passes because the defect is now named against both, and because i18 owns the recheck mechanism it needs.

OVERRIDE TWO: the worktree release is unmet, specified three times, proven failing this morning. THE DISSENT: a behaviour specified in three places and enforced in none means the other specifications cannot be trusted without checking each. Only this one was checked.

OVERRIDE THREE: the self-hosting exception contradicts uc-open-an-iteration's MAIN SCENARIO. THE DISSENT: a main scenario is what the system promises it does, and passing a register that contradicts one is worse than passing a contradicted requirement. It passes only because the contradiction is named and lands at the architecture milestone, where the exception is decided anyway.

WHAT WOULD HAVE MADE IT A FAIL: a requirement no function serves, or a contradiction nobody had noticed. Neither is true.

## follow_up

OWED AT THE ARCHITECTURE MILESTONE, four things.

- The mechanism choice, with the read case as the deciding question.
- uc-open-an-iteration step 2 amended, or the self-hosting exception dropped. A main scenario and the exception cannot both stand.
- The external prior-art comparison, run rather than cited.
- THE CROSS-COUPLING PASS RUN AGAIN. Three overlaps in eight new nodes is too high a rate to call this done.

CARRIED AS BUILD WORK, not as an open question: the lane is minted as an interface with the agent harness as its source, a new lane verb is defined there, and req-reachable-capability-is-traced is corrected to demand an interface entry rather than a requirement per verb. That retires the two-bars inconsistency instead of answering it, and it is already in this iteration's scope.

TWO MULTIPLY-SPECIFIED UNMET BEHAVIOURS, neither this iteration's to fix, both named against their requirement AND their use case. The bless-invalidation belongs with i18's recheck work. The worktree release belongs here, because this iteration already carries the record's lifecycle.

STILL OWED FROM EARLIER GATES: the measured split of past step-outs. Nothing else - the unread use cases are read.

ONE ASSUMPTION CANNOT BE CLOSED FROM THIS REPOSITORY, and one standing assumption is re-owed at M7 on a POSIX host by this iteration's own subject.

## anything_else

WHAT THE HAND PASS COST AND WHAT IT BOUGHT, since the owner asked for it once and the question is whether to ask again.

COST: about twenty minutes and four calls. One keyword sweep over 205 statements returning 120 candidates, then reading those 120 statements.

BOUGHT: two unmet resident requirements, one live contradiction, one near-duplicate, and two synergies. Four of those six are things no check in this system would have surfaced.

WHAT MADE IT WORK was not cleverness. It was having the 120 statements in front of me at once. Every finding came from two statements sitting near each other on a screen, and none came from remembering that a requirement existed.

THAT IS PRECISELY WHAT THE RETRIEVAL HELPER AUTOMATES, and it is why the format matters more than the ranking: what I needed was not the BEST twelve candidates but ALL the plausible ones, cheap to dismiss. A ranker returning the top five would have missed the bless-invalidation requirement, which shares almost no vocabulary with anything I wrote - I found it because it was in the list at all.

ONE WARNING FOR i15 FROM THAT. Tune for recall, not precision. A candidate list that is too short is worse than one that is too long, because a false positive costs a line and a false negative costs a defect that ships.
