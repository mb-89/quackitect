---
form: onboard-retro
by: agent
signed_off: 2026-08-18T08:42:34.103Z
authors: agent
files: null
---

# Evidence form / onboard-retro

## current_situation

i16, the vehicle overlay, is bound and standing at its onboarding retro. It is the first state of M0.

WHY THIS ITERATION AND WHY NOW. The owner needs to build software with this system, and i16 is the only record whose goal is that: a vehicle vendors the engine, overlays its own guidance through one resolution chain, and never writes under the engine.

WHAT MOVED TO MAKE IT REACHABLE. Its `depends_on` edge on i10, the big sweep, was cut on the owner's ruling of 2026-08-18. The recorded reason for that edge was that req-overlay-resolution demands one shared identity scheme and module-qualified ids ARE that scheme. Checked before cutting: method artifacts resolve by hardcoded PATH today (PROMPT_SOURCES at engine/promptlayer.ts lines 22-34, METHOD_PREFIXES at engine/paths.ts lines 172-177), the cards already carry an `id:`, and i10 renames the SPEC corpus the overlay never resolves. The rulings are on the record.

WHAT STANDS OPEN. 24 seeded iterations, 3 of them already open and part-walked (i4, i15, i23). Zero expeditions. The notes inbox is at zero for the first time since it was surveyed. 99 items sit parked in the pool.

WHAT SHIPPED IN THE WINDOW THIS RETRO JUDGES: i33, i34 and i35, all on 2026-08-17.

THE FOLDER QUESTION IS OPEN AND IS THE AGENT'S TO SETTLE BY SPIKE. The owner prefers the wrapper repository root to go away and accepts keeping it if a spike says it cannot. It must not block the overlay, and it may land later in its own iteration.

## field_feedback

THE OWNER'S REPORT, 2026-08-18. Their closing words: "I have no more feedback."

WHAT THEY CORRECTED, and it is the most valuable thing in this retro.

THE fix-findings FINDING WAS WRONG AND THEY SAID SO FROM MEMORY. "Fixed findings has never run is not true. I've seen the machine in that state." They were right on every count, and the check afterwards proved it against the row that governs the state.

- The row says NO EVIDENCE OF ITS OWN, by their own ruling of 2026-08-11. So a missing fix-findings.md is the design, and its absence proves nothing.
- The attempt guard was REMOVED on 2026-08-18, not left broken. The row says so in as many words, with the same reasoning the finding used for keeping it.
- The state is now held by an exit script that fires the confirm run, so a red battery keeps the walk there with the write verbs it already has.

THEY ALSO STATED THE INTENT PLAINLY, which no document says this simply: if verification shows something we can fix, we go to fix-findings because there we have all the rights we need, we fix it, and we go back to verification.

AND THEY NOTED IT HAS CONFUSED MORE THAN ONE AGENT. The i35 cloud agent got confused about the same state. Two agents misreading one state is a signal about the state's legibility rather than about either agent.

THE RETRACTION IS RECORDED at note-a0dd8cf3faf6, drained obsolete, with the shape of the error kept: a finding was built on the ABSENCE of a file, and the absence was by design. Checking a downstream symptom while never reading the governing row produces a confident, evidenced, wrong answer.

WHAT THEY RULED ON THE OTHER THREE FINDINGS.

- THE WINDOW MARK: "then fix it." Fixed in this state, with two cases pinning it.
- se_test AT 560 CALLS: already settled and re-raised in error. "We've discussed this a few times. The idea is that the feedback rides piggybacks onto other stuff, and you can continue." So the polling was never the design. note-238b43773188 is drained obsolete with the ruling recorded, so the next retro finds the ruling rather than the count.
- THE ALWAYS-LEGAL TOOL SET: "I don't understand. But, yeah, it's okay." Accepted and not understood, which is a defect in how it was written rather than in the finding. Kept parked.

WHAT THEY ROUTED. The cloud agent takes i17, the options pool. This session takes i16. The goal is stated plainly and is the measure everything here answers to: get to a state where we can work, and start with the vehicle and the foreign project tomorrow.

ONE THING WORTH RECORDING ABOUT THE FEEDBACK ITSELF. Three of the four findings put to them were wrong, settled or unclear, and only one survived. That is what the field-feedback question is for, and it is the argument for never walking past it.

## notes_drained

- note-2b1ccd564681: done — the subagent ruling is contract rule 11, project/guidance/contract.md line 186
- note-11fdc65a1d43: done — the contract half landed; the outside-the-repo half recurred today and is now note-4387180fe2b9
- note-4bb710fe6520: done — the ripple hole is closed at engine/session.ts lines 1639-1643, owesASignature
- note-fa24138d389e: done — same fix; a walk can no longer cross a formless signable state unsigned
- note-9cbea25d2696: done — same fix; the note explains a cause that no longer exists
- note-03e84c9b7c90: done — the needs-retro trigger for i33 is this retro
- note-f2f503b51dc3: obsolete — its own correction disproved its diagnosis; the complaint lives on in two other notes
- note-f2bc2e1e2fb8: backlog — the pull still has no phase split, onPhase is in one file and phase is absent from pull.ts
- note-009a76da02aa: backlog — half answered, the bar hold is now per-bank and still has no exit
- note-984d1b74e14c: backlog — zero of 139 test files reach the extension click path
- note-908e2e3b0dfc: backlog — the drawing still carries no record title, checked today
- note-8c6983ee66a9: backlog — it asks for a fifth probe outcome, a method change to the probe vocabulary
- note-ce4ac7d7af2d: backlog — the scope mapping is unchanged and the owner's timing condition is met
- note-4bfbbe7e8d93: backlog — carries the mechanism the ruling lacks, re-checked byte for byte
- note-c137415d46d2: backlog — which states has no record ever signed, a cheap question nobody has asked
- note-8a7a3030c5e9: backlog — i15's two engine parts still have no lane door
- note-1447294a356d: backlog — the specific hard stop is closed; a walk still cannot go back to a state
- note-7d39aec8eee0: backlog — expClose reads the machine position nowhere, confirmed at worktree.ts 489-511
- note-fe85c74be747: backlog — a gate signed and blessed while the route refused the same claim
- note-e9d74fcaf636: backlog — half disproved, the note inbox CAN be read back by exact path
- note-230eab44b08b: backlog — its check needs se_git, which this state does not grant
- note-6c9321309b45: backlog — the cross-record gate question is the owner's to rule
- note-20d53a0e40fe: backlog — the patch landed, the hook still infers a sanctioned stop from the pull's word
- note-b621c9986b74: backlog — should pulled_in name which goal each item serves, a form-schema question
- note-5aeda2a86ceb: backlog — the greyed-chain refresh, one of three notes on one question
- note-380d789f6f85: backlog — whether se_amend's chain is wanted at all comes before fixing it
- note-fc18d2775583: backlog — it names the deciding measurement rather than an opinion
- note-29960c805dc0: backlog — the conformance hole is proven, its blast radius is honestly unmeasured
- note-360be74ad2e0: backlog — the breach window reads the signature the submit has just re-stamped
- note-f60cea3ed555: backlog — written here; the retro's own window mark is broken and the fix is one line
- note-4387180fe2b9: backlog — written here; the session prompt still forbids what contract rule 11 permits
- note-9f3883ec38fd: backlog — written here; a ruling with no iteration to land in never gets built
- note-56343e522395: backlog — written here; a fabricated note ref landed in a stored field, mine
- note-238b43773188: backlog — written here; se_test is 560 calls and 48 verdicts
- note-83b3d8a1d65a: backlog — written here; every latency reading from se_pull's own duration is a floor
- note-c14bc8712a54: backlog — written here; the shell replaced a lane verb, and a false belief drives 15 runs
- note-a0dd8cf3faf6: backlog — written here; fix-findings has never run in three iterations
- note-814c6d46f2ac: backlog — written here; the tool an agent reaches for when stuck is refused where it gets stuck
- note-168e7a7fe477: backlog — written here; a form saved another state's fields verbatim, twice in one walk

## call_log_mined

- THE WINDOW HAD TO BE TAKEN BY HAND, and that is the first finding
- se_log_query with since last_retro returned 68 records; the live log holds 2872 back to 2026-08-17T14:28:20.828Z
- so the window hid 2736 records, which is every call of the 832-call session this retro exists to mine
- the cause is lastRetroMark at engine/calllog.ts lines 207-224, which returns judged then falls back to any drain
- this log has no judged drain: its one carried call was REJECTED under SE-C-110, and line 217 skips ok:false
- so the fallback picked a `done` drain at 07:50:25, which retro.md line 40 says explicitly must not set the mark
- parked as note-f60cea3ed555; the fix is the live log file's first timestamp, never a done or obsolete drain
- EVERYTHING BELOW USES THE HAND-TAKEN BOUNDARY: 2872 records, 89 failures, 63 of them typed refusals
- SE-C-110 fired 16 times: 13 submitting a form nothing asked for, 2 aiming at an undrawn state, 1 draining outside the retro
- SE-C-112 fired 9 times, always a gate or state form with an unanswered section
- SE-C-120 fired 9 times, always a narration brief chaining three or four parts
- SE-C-133 fired 7 times, the stall at twelve updates since anything closed
- SE-C-101 fired 5 times, on five different tools, and two were the correct name for a NEIGHBOURING verb
- SE-C-105 and SE-C-046 fired 4 times each, patch mismatches and wrong field names
- SE-C-129 fired 3 times, a shell command doing a lane tool's job
- THE REMEDIES DIVIDE INTO THREE, and only one group is the agent's fault
- SE-C-110 did not clear on retry: three identical claims submits at 14:52:52, 14:57:20 and 14:58:23, three more at 18:54
- so something about WHICH form is wanted is not legible before the submit, and the agent re-sent instead of pulling
- SE-C-120, SE-C-105 and SE-C-046 cleared instantly every time and recurred, so they are habits rather than misread remedies
- the same patch-field mistake sits 3 hours 41 minutes apart, both SE-C-046, both cleared on the retry
- SE-C-129 cleared on the second retry, by dropping exactly the half the refusal named
- NINE FAILURES CARRY NO CLAUSE AND NO REMEDY: 5 raw ripgrep messages from se_file_search, 4 raw errors from se_pull
- that is the lane's own typed-rejection law not holding in two places
- THE DISTRIBUTION, top first: se_test 560, se_file_read 247, se_file_search 216, se_pull 156, se_file_patch 129
- then se_test_verdict 48, se_run 46, se_file_glob 39, se_git 38, se_amend 35, se_aim 34, se_file_write 30
- se_update at 771 is a side-record written by an update riding another call, not a round trip
- the six mirror_* entries at 365 together are the mirror's own events, not the agent's
- so real agent round trips are roughly 1736 of the 2872
- SE_TEST AT 560 IS THE LARGEST ENTRY AND IT IS ALMOST ENTIRELY POLLING
- 518 of 560 completed under 10 ms, and 560 calls produced 48 verdicts, which is 11.7 status polls per battery
- the verb hands back a job handle and asks to be called again; the contract says a run blocks and there is nothing to poll
- one of those two is wrong, and the agent is doing what the tool's own note tells it; parked as note-238b43773188
- FAILURE RATES: se_pull is the worst real door at 24 failures in 156 calls, 15.4 percent, 13 of them SE-C-110
- se_test_verdict reads 35.4 percent but those 17 are red batteries doing their job, not a defect
- zero failures across the window: se_test 560, se_git 38, se_file_write 30, se_note 24, se_reopen 22, se_reload 12
- SLOW CALLS: 112 real breaches of the one-second rule, once mirror_slow and the battery are stripped
- se_pull carries 69 of 156 at or over a second, 44.2 percent, with 30 over ten seconds and 10 over sixty
- se_aim 12 of 34, se_git 12 of 38, se_run 13 of 46; the file verbs never crossed one second at all
- THE TRANSPORT AND THE TOOL DISAGREE TWENTY-FOLD ON ONE CALL, one millisecond apart
- se_pull call-8023bd6002fb recorded 3384 ms at 19:34:21.335Z and errored
- mirror_slow call-54b5c4896317 recorded the POST that carried it at 69,141 ms at 19:34:21.336Z
- so every latency reading taken from se_pull's own duration is a FLOOR, and the alarm understates its own problem
- parked as note-83b3d8a1d65a, together with a group_by discrepancy that makes every retro's counts one short
- AGENT VOIDS, bounded rather than summed, with the method stated so it can be argued with
- wall span 17 hours 53 minutes; the overnight gap bisected with group_by totals is about 10.1 hours and is not thinking
- active wall clock is roughly 7.8 hours; tool time counted in six duration buckets lies between 61 and 158 minutes
- SO 66 TO 87 PERCENT OF THE ACTIVE WORKING DAY WAS NOT THE LANE EXECUTING
- per real agent round trip that is about 16 seconds, of which 2 to 5 is tool time
- what this cannot separate: the model's thinking, the host's round trip, and time a person spent reading
- THE SHELL, BY SHAPE: 46 runs, eight shapes, parked in full as note-c14bc8712a54
- a lane verb EXISTS and the shell replaced it: se_prompt_place, registered at engine/tools.ts line 184, called once
- the agent ran place-prompt-layer.ts by hand twice, passing --root . manually, which the verb exists to get right
- that is the se_run step's usual finding backwards, because it normally names a MISSING verb
- a FALSE BELIEF drives fifteen runs into the shell: a recorded reason says se_file_search caps at 12 results
- its limit defaults to 100 and is settable, so nothing needs building and the tool description needs wording
- ONE VERB IS GENUINELY MISSING AND SMALL: two runs tallied a field's VALUES across a directory
- count_only gives per-FILE counts, never per-VALUE counts, so a group_by on se_file_search kills both
- what stays in the shell correctly: driving engine modules, npm run build, the package smoke test, boundary timing
- THE TOOL AUDIT, obsolete: se_lint and se_format, because the battery runs biome at every verdict
- se_prompt_place is a third case, not replaced by a better verb but displaced by the shell; make it the route or delete it
- rare but right: se_exp_close, se_web_fetch, se_survey, se_help, se_reload, se_answer, the seed verbs, se_shoot
- the window holds no seeding, no renaming and no research, so those zero counts say nothing about them
- worth improving: se_test the polling, se_pull the failures and breaches, se_file_search the raw errors and no grouping
- se_file_patch too, at six failures, each costing a full extra round trip
- and se_update at 19 refusals, of which 9 are chained briefs the engine ALREADY auto-corrects for one op
- TEST TIMINGS from .se/test-last-run.json, run 2026-08-18T07:48:53: 1437 tests, 0 failed
- 985,425 ms summed over 140 files against 60,188 ms wall, so the battery runs about 16-way parallel
- refs.test.ts is the outlier and a lead: 139,017 ms summed, 14.1 percent of the battery, 6044 ms per case
- its own header says it is pure form-model validation against a hand-written two-node corpus, with no server and no git
- the 23 fresh roots it builds per case are the first place to look
- AND THE ARITHMETIC THAT MATTERS: the battery is bounded by its LONGEST FILE, never by its summed cost
- so halving refs.test.ts would not shorten the wait by one second
- drawnsub.test.ts carries a single 17,919 ms case, 1.8 times the worst case anywhere else, and that is the candidate
- drift.test.ts at 51,888 ms is justified and understood: i33 rewrote it to count door reads rather than read a clock

## waste_leads

- THE RETRO'S OWN INSTRUMENT WAS WRONG, and it fails silently rather than refusing
- step 1 exists to mark the mining window and it returned 68 records where 2804 stood
- a retro that trusted it would have reported an almost empty window and read as done
- a silent truncation of a MEASUREMENT step is worse than a refusal, because nothing says the numbers are wrong
- it was caught only because 68 looked implausible against a 832-call session the reader happened to remember
- THE SAME MISTAKE RECURRING HOURS APART, and every instance cleared on the very next call
- the patch-field error twice, 3 hours 41 minutes apart, find/replace instead of old_string/new_string
- the chained brief nine times across seventeen hours, all different sentences, all SE-C-120
- these are habits a mechanical correction would end, not remedies anybody misunderstood
- and the engine ALREADY auto-corrects a chained brief for one op while refusing the identical shape on every other
- widening that correction removes nine round trips and loses nothing
- RE-DERIVING WHAT THE CODE ALREADY ANSWERS, three times over
- fifteen shell runs scanned files with inline JavaScript that se_file_search and se_file_read answer
- one of them recorded a reason that is simply false, that se_file_search caps at 12 results
- two shell runs re-ran a script that has a lane verb, passing --root . by hand
- AND THE SAME SHAPE INSIDE THIS RETRO, which is why it is listed rather than pointed at
- the first attempt to page note bodies used se_survey with full detail
- that re-serves the whole iteration list and the whole backlog on every call, about 15,000 tokens for six notes
- reading .se/notes.jsonl directly with offset and limit answered the same question at a fraction of the cost
- and it disproved a standing note in passing, which the expensive route would never have done
- ONE WASTE THIS RETRO CHOSE NOT TO PAY, recorded so the choice is visible
- the milestone walk and the log mining ran as two subagents in parallel with the note drain
- contract rule 11 makes that free to do, and the alternative was three sequential passes over one window

## promotions

- SEVEN EMIT-BACK LINES CAME FROM i35's package state, and each is landed, dropped with evidence, or re-homed
- DROPPED, ALREADY BUILT: engine/search.ts throwing a raw git error for an unresolvable ref is fixed
- SE-C-139 now types it, carries the ref, quotes what git said, and hands back the two calls that repair a shallow clone
- its section stands in project/guidance/refusals.md and the trunk commit says so in as many words
- DROPPED, ALREADY BUILT: the package script's exclude-by-name root exception is fixed
- engine/bin/package.ts lines 58-72 carry it, with the reason written out for the next reader
- DROPPED, ALREADY BUILT AND MISREAD BY THIS RETRO: the verification_attempts counter line
- i35 reported that nothing writes the counter and that the guard is permanently 0 < 3, and that was true when written
- M7_60_fix-findings.md line 70 now says THE ATTEMPT GUARD IS GONE, and it was never real
- it was removed on 2026-08-18 for i35's own reason: a real counter without an escape path is worse than none
- what replaced it is an exit script, so leaving fires the confirm run and a red battery keeps the walk in the state
- THIS RETRO FIRST REPORTED THE OPPOSITE, on a search that found zero engine occurrences of the counter
- zero was the evidence of the REPAIR, not of the defect, and the owner caught it from memory before the check did
- RE-HOMED: M7_50_verification's pre-filled-owed rule, written into the row and implemented nowhere
- RE-HOMED: the observe-red row asking every non-test spec in the corpus for a red observation
- both are raid-debt-demonstration-reds-are-re-asked-every-iteration, swept today, so they land there rather than twice
- LANDED, AND THIS SESSION IS ITS SECOND WITNESS: cloud-runner.md states the caged-subagent hand-over as settled
- i35 found it false where a subagent inherits the session's MCP registry
- two subagents were spawned during THIS retro and both reached the se lane through the inherited registry
- no cage was placed for either, so the card's claim is now false on two hosts and must stop being stated as settled
- KEPT AS AN OPEN OBSERVATION rather than landed, because it names no specific fix
- the pull's `do` instruction says the stopped step names what it wants, when nothing has been said
- i35 records that five times the cure was an se_aim, and that se_why often held the answer the pull withheld
- AND ONE PROMOTION FROM THIS RETRO'S OWN WORK, into project/guidance/method/retro.md step 6
- the step said the lane CANNOT reach the assistant memory, measured 2026-08-17, and offered a root to ask the owner for
- that is wrong twice: the root already exists, and reading through it answers
- .se/roots.json declares `sessions` as the harness's projects folder, and the memory sits under it
- step 6 now says to check the declared roots FIRST rather than concluding the lane cannot reach
- measured here: the memory folder holds no MEMORY.md and no .md files at all, so there was nothing to drain
- AND ONE ENGINE FIX MADE HERE ON THE OWNER'S INSTRUCTION: lastRetroMark falls back to the live log's start
- never to another drain, because a done or obsolete drain is a check every walk makes
- two cases pin it in tests/mcp.test.ts, one for the fallback and one for a REFUSED carried drain
- THE MILESTONE WALK PRODUCED FOUR MORE CANDIDATES, none of them planned anywhere, all recorded in anything_else
- a milestone-to-chunk coverage check, because every coverage law compares a node to its neighbour and none looks up at scope
- a derivable count, because a form's stated number contradicted its own list four times in one record
- refusing a form key that is not a field of this state, which bled twice in one walk; that is note-168e7a7fe477
- refusing a package whose manifest version already appears in RELEASES.md, after i34 shipped 4.1.0's number
- and asserting every file a shipped design spec names is inside the archive, after i35 shipped a feature with its wire cut

## process_stale

NOT COMPARED AGAINST EXTERNAL PRACTICE THIS ROUND, and that is a gap rather than a verdict.

WHY: every finding in this window is an internal mechanism defect — a broken retro boundary, an unguarded close, a polling loop, a filename-lookup test scope, a drawn door no record has ever opened. None of them is a question about whether the METHOD has fallen behind what other people do. Reaching for an external comparison here would have been a search performed to fill a field.

WHAT WOULD MAKE THE NEXT ONE REAL, named so it is not skipped again: the method's own state-of-the-art card, machines/methods/meth-state-of-the-art.md, and one named external source per dimension rather than a general sweep.

WHAT THE WINDOW DOES SAY ABOUT THE PROCESS, measured rather than compared.

- BETWEEN 66 AND 87 PERCENT of the active working day was not the lane executing. Whatever that time is, it is not tool cost, and nothing in the system can currently name it.
- THE PROCESS CANNOT MEASURE ITSELF PER STATE. retro.md step 9 already admits this: the state a call was made in rides inside a narration record's arguments, and se_log_query's group_by cannot reach it. Grouping by `visit` returns one group holding everything. So "which milestone cost the most" has no mechanical answer today, in a system whose whole claim is that the process is measurable.
- THE MILESTONE WALK HAD TO READ 76 EVIDENCE FORMS BY HAND to answer it, and its cost column is honest about which numbers are whole-window figures rather than that step's own.
- THAT GAP IS ALREADY SOMEBODY'S WORK. i31 is seeded and its subject is exactly this — a walk replays from recorded events, and drag per state names where the guidance fails. It has never been walked.

SO THE HONEST ANSWER IS NOT "the process is current" OR "the process is stale". It is that the instrument which would tell us is designed, seeded and unbuilt, and three retros running have written their step-9 numbers as whole-window figures because of it.

## follow_up

SEVEN NOTES STAND PARKED FROM THIS RETRO. Two more were written and then retracted by the owner's own correction. The inbox stands at zero.

THE THREE WORTH ACTING ON, in the order a reader should care about them.

- note-814c6d46f2ac — se_help and se_file_list are refused at onboard-retro, the state where an agent is least oriented. Third sighting, one of them in this retro. The owner accepted it and said plainly they did not understand it, so it needs rewriting before it is built.
- note-83b3d8a1d65a — every latency reading taken from se_pull's own duration is a floor. The transport recorded 69,141 ms for a call the pull recorded as 3,384 ms.
- note-c14bc8712a54 — the shell replaced a lane verb that already exists, and a false belief about se_file_search drives fifteen runs into the shell.

THE OTHER FOUR, parked with their conditions.

- note-168e7a7fe477 — a form saved another state's fields verbatim, twice in one walk.
- note-9f3883ec38fd — an owner ruling with no iteration to land in gets re-confirmed every retro and never built.
- note-56343e522395 — a fabricated note ref landed in a stored field, and only the author caught it.
- note-4387180fe2b9 — the session prompt still forbids what contract rule 11 permits.

TWO WERE RETRACTED, and the retraction is the more useful record.

- note-a0dd8cf3faf6, that fix-findings has never run: WRONG. The row says the state has no evidence of its own by owner ruling, the attempt guard was removed rather than left broken, and an exit script now holds the state. A finding built on the absence of a file, where the absence was the design.
- note-238b43773188, that se_test's polling is an open contradiction: SETTLED ALREADY. The feedback rides back on later calls and the walk continues, which the owner has ruled more than once.

THREE THINGS WERE FIXED HERE RATHER THAN PARKED, because a retro is the sanctioned place for a method change and the owner asked for one of them directly.

- engine/calllog.ts lastRetroMark now falls back to the live log file's first record, never to another drain. Two cases in tests/mcp.test.ts pin it, including the refused-carried-drain shape that caused the failure.
- project/guidance/method/retro.md step 6 now says to check the declared roots FIRST, and no longer claims the lane cannot reach the assistant memory.
- All ten raid debt rows carry a dated look. raid-debt-ten-checks-wait-on-a-person-or-a-second-machine had no `looked` field at all and had never been swept since i33 minted it.

ONE DEBT CHANGED STATE AND IT MATTERS FOR THE CLOUD RUN. raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make named i35 as the work that would make it repayable, and i35 shipped on 2026-08-17. The next cloud run is a real test rather than a repeat of seven hand-typed steps — provided the entrypoint actually runs, which that row already excludes a hand-driven session from satisfying.

ONE CHECK IS OWED AND COULD NOT BE RUN HERE. note-230eab44b08b asks when three story files were first added, which needs `git log --diff-filter=A`. se_git is not legal in this state.

WHERE THE WORK GOES NEXT, on the owner's routing. The cloud agent takes i17, the options pool. This session walks i16 to its kickoff, proposes a change size, and the owner decides.

## anything_else

THE MILESTONE WALK OVER i33, i34 AND i35 ran as a subagent and read 76 signed evidence forms. Its three full tables are too long for this field. What follows is what a reader needs and cannot get elsewhere.

FIRST, A CORRECTION TO THE WALK'S OWN HEADLINE. It reported that verification-to-fix-findings never happened in any of the three records, on the evidence that no fix-findings.md exists. The owner corrected it from memory and the row proves them right: fix-findings has NO EVIDENCE OF ITS OWN by their ruling of 2026-08-11, so the missing file is the design. The transition is not the finding, and nothing in this retro should be read as saying it is.

WHAT THE WALK GOT RIGHT AND IS WORTH KEEPING is the runner-up, which is closed and shows what a good repair looks like. gate-implementation to fill-story-evidence was never signed by i34 or i35, and i33 signed it for the first time in this project's history at 19:30 on its last night. Six engine sites had used "does this state declare fields?" as a proxy for four different questions. The cost: three unsigned crossings, two states signed underneath the gap with one of them a gate, a panel painted green over a hole, a record merged and reported archived when it was not, and a twenty-five-hop route back through `shipped`. i33 repaired all six sites.

FOUR MECHANIZABLE IMPROVEMENTS CAME OUT OF THE WALK AND NONE IS PLANNED ANYWHERE. Each was checked against version-planning.md and the seeded records before being written down.

- A MILESTONE-TO-CHUNK COVERAGE CHECK. i33 signed a scope naming four milestones, then wrote stories, use cases, requirements and build chunks for ONE of them. Seven coverage checks passed, because every coverage law compares a node to its NEIGHBOUR and not one looks up at the scope. Its own specify-build form says the first four chunks implement none of the four milestones.
- A DERIVABLE COUNT. A form's stated number contradicted its own list four times in one record: write-stories, author-tests, gate-requirements and observe-red. Both numbers are computable from lists the form already carries.
- REFUSE AN UNKNOWN FORM KEY. Now note-168e7a7fe477.
- ASSERT THE SHIPPED SPEC'S FILE LIST AGAINST THE ARCHIVE. i35's dsp-the-arrival names .claude/settings.json; the archive did not carry it, so the packaged product shipped its headline feature with nothing to call it. That is a comparison of two lists the system already holds. i34 has the sibling case: it assembled an archive with the manifest still reading 4.1.0, i27's release, caught only by a hand-read of RELEASES.md.

THREE THINGS THE WALK FOUND THAT ARE NOT CHECKS AND ARE WORTH KNOWING.

- THE ENGINE DIED MID-REMOVAL in i34, because the lane was running from inside the worktree being deleted. 26 of 28 were removed before it stopped. The engine knows its own module path, so refusing to remove the directory it executes from is one comparison.
- THREE TRANSPORT CRASHES IN i34 REACHED NO LOG AT ALL. Its own retro says it plainly: the log is the only witness the system has, and it did not see the worst failure of the session. A failure that leaves no record is the one thing no retro can mine.
- A TEST PLACED A CAGE INTO THE LIVE TREE AND WENT GREEN. i35's first arrival case ran against the real repository, started a second lane beside the one the walk was using, rewrote .se/se-call.mjs to point at it, and reset the dial to 0.4. The case passed throughout.

AND THE LESSON THIS RETRO OWES ITSELF. Two of its four headline findings were wrong, and both were wrong the same way: a downstream symptom was measured carefully while the document that governs the mechanism went unread. The rigor row for a state, and the ruling behind a verb, are one file each. Read them before saying anything about the thing they govern.
